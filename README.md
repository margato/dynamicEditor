# dynamicEditor

An dynamic editor built on top of TinyMCE to make floating editors easy.

<hr>

# Installation

In order to use this plugin, you have to import TinyMCE v5+ inside the ```<head>``` tag and then import dynamicEditor.js and its stylesheet.


```html
<head>
    <!-- ... -->
    <script src="https://cdn.tiny.cloud/1/YOUR_KEY/tinymce/5/tinymce.min.js"></script>
    <script src="../dynamicEditor.js"></script>
    <link href="../dynamicEditor.css" rel="stylesheet">
    <!-- ... -->
</head>
```

# Usage

```html
<!-- formName attribute defines the form's name in FormData -->
<h5 formName="text" id="text">Lorem ipsum dolor sit amet consectetur adipisicing elit.</h5>
<button id="save">Save changes</button>

<script>
const text = document.querySelector("#text");
const saveButton = document.querySelector("#save");

//Instantiate the floating editor
new DynamicEditor(text);
     
//Save changes on click
saveButton.addEventListener('click', () => {
	
  	//DynamicEditor POST Request method
 	postEditorsData('http://localhost/api/controllerRoute')
		.then(res => {
        	alert("Success! See more details in the console");
            console.log({
            	message: "Default message.",
                response: res
            });
        })
        .catch(err => {
        	alert("Oops!\n" + err);
            console.error(err);
        });
});
</script>
```


# Preview
See a live preview [here](https://margato.github.io/dynamicEditor).

# Contribue
This is not the README final version.

