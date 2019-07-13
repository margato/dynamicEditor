let editors = [];
let createdEditors = [];

function DynamicEditor(element, config) {
    if (!tinymce) {
        throw "DynamicEditor is dependent on TinyMCE.";
    }

    this.edited = document.querySelector("#dynamicEditor-save");
    if (!this.edited) {
        this.edited = document.createElement("div");
        this.edited.id = "dynamicEditor-save";
        document.body.appendChild(this.edited);
    }

    this.isDesktop = () => {
        return !(navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)
        );
    }

    this.config = config || {
        defaultText: "Click here to edit",
        language: "en_US",
        tinyMCE_toolbar: "undo redo | bold italic formatselect | alignleft aligncenter alignright alignjustify | bullist numlist| removeformat"
    };

    this.element = element;
    this.element.classList.add("dynamicEditor-editable");
    this.editor = null;
    this.id = this.element.id + "-dynamicEditor";

    if (this.element.textContent == "") this.element.textContent = this.config.defaultText;

    this.createEditor = () => {
        const mainDiv = document.createElement("div");
        mainDiv.classList.add("dynamicEditor");
        mainDiv.id = "main-" + this.id;
        const textArea = document.createElement("textarea");
        if (this.element.innerHTML != this.config.defaultText)
            textArea.value = this.element.innerHTML;
        textArea.id = this.id;
        textArea.name = this.element.getAttribute("formName");
        mainDiv.appendChild(textArea);
        mainDiv.style.display = "none";
        return mainDiv;
    }

    this.isEditorShown = () => {
        return this.editor;
    }

    this.isEditableElement = element => {
        return element === this.element ||
            element.classList.contains("dynamicEditor-editable") ||
            element.nodeName === "SPAN";
    }

    this.closeEditor = (id = this.id) => {
        tinymce.remove("#" + id);
        this.editor.remove();
        this.editor = null;
    }

    this.closeAll = () => {
        this.editor = null;
        editors.forEach(ed => {
            const textArea = ed.querySelector("textarea");
            tinymce.remove("#" + textArea.id);
            ed.remove();
            editors = editors.filter((value, index, arr) => {
                return value != ed
            })
        });
        const elements = document.querySelectorAll(".dynamicEditor-active");
        elements.forEach(el => {
            el.classList.remove("dynamicEditor-active");
        });
    }

    this.hasActiveEditors = () => {
        return editors.length > 0;
    };

    this.initEdition = () => {
        this.editor = this.createEditor();
        this.element.parentNode.insertBefore(this.editor, this.element.nextSibling);
        editors.push(this.editor);
        this.element.classList.add("dynamicEditor-active");
        const alreadyCreated = createdEditors.filter(editors => {
            return editors.querySelector("textarea").id.replace("-dynamicEditor", "") == this.element.id
        }).length > 0;
        if (!alreadyCreated)
            createdEditors.push(this.editor);
    }

    this.toggleEditor = () => {
        return new Promise((resolve, reject) => {
            if (this.hasActiveEditors()) {
                this.closeAll();
                if (editors[0] == this.editor) {
                    if (this.element.textContent == "") this.element.textContent = this.config.defaultText;
                    reject("Editor removed from scene");
                } else {
                    this.initEdition();
                    resolve("Editor added to scene");
                }
            } else {
                this.initEdition();
                resolve("Editor added to scene");
            }
        });
    }

    this.checkChanges = () => {
        const changesWarning = document.querySelector("#dynamicEditor-save");
        if (changesWarning.style.display === "block") return;
        changesWarning.style.display = "block";
    }

    this.element.addEventListener('click', () => {
        this.toggleEditor()
            .then(() => {
                tinymce.init({
                    selector: "#" + this.id,
                    force_p_newlines: false,
                    forced_root_block: 'div',
                    menubar: false,
                    toolbar: this.config.tinyMCE_toolbar,
                    language: this.config.language,
                    init_instance_callback: editor => {
                        editor.on('Change', event => {
                            this.element.innerHTML = event.level.content;
                            this.checkChanges();
                        });
                        editor.on('keyup', event => {
                            this.element.innerHTML = event.target.innerHTML;
                            this.checkChanges();
                        });

                    },
                    mobile: {
                        theme: 'mobile',
                        plugins: ['autosave', 'lists', 'autolink'],
                        toolbar: this.config.tinyMCE_toolbar,
                    }
                });
                this.editor.style.display = "block";
            })
            .catch(() => {
                return;
            });
    });
}

function postEditorsData(route) {
    const forms = [];
    const edited = document.querySelector("#dynamicEditor-save");
    return new Promise((resolve, reject) => {
        if (edited.style.display !== "block") {
            return reject("dinamycEditor: Nothing to be saved.");
        }
        let form = new FormData();
        forms.forEach(textArea => {
            const content = document.querySelector("#" + textArea.id.replace("-dynamicEditor", "")).innerHTML;
            form.append(textArea.name, content);
        });
        fetch(route, {
                method: 'POST',
                body: form
            })
            .then(response => {
                return response.json();
            })
            .then(json => resolve(json))
            .catch(err => reject(err));
    });
}