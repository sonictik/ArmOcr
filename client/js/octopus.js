
var urlG = "";
var finText = "";
var lastSaved = "";

var procURL = function()
{

    var url = document.getElementById("imgUrl").value;
    urlG = url;
    document.getElementById("armImg").src = url;

    requestRecognitionByUrl(url);
    
    clearInfo();
};


var form = document.getElementById('uploadForm');
var changeSrcLocal = function()
{
    var input = document.getElementById('imageFile');
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById("armImg").src = e.target.result;
        };

        reader.readAsDataURL(input.files[0]);
    }
}

form.onsubmit = function(ev) {
    ev.preventDefault();
    
    var fileEl = document.getElementById('imageFile');
    var uploadIds = uploader.upload(fileEl);
    
    changeSrcLocal();
    // setTimeout(function() { 
        // uploader.abort(uploadIds[0]); 
        // console.log(uploader.getUploadInfo()); 
    // }, 1000); 
};


var clearInfo = function()
{
    document.getElementById("recognizedText").value = "";
    save_text();
};

var receivedTranslation = function(translation)
{
    finText = translation;
    document.getElementById("finalText").innerHTML = finText;
}

var receivedRecognizedText = function(recognizedText)
{
    document.getElementById("recognizedText").value = recognizedText;
    save_text();
    document.getElementById("imgInfo").classList.remove('hidden');
}

var save_text = function()
{
    finText = document.getElementById("recognizedText").value;
    lastSaved = finText;
    document.getElementById("finalText").innerHTML = finText;
};