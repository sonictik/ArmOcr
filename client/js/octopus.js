var Octopus = function() {
    this.client = new Client(this.makeClientApi());
    
    this.data = new Data();
    this.view = new View();
    
    this.initFileUpload();
};

Octopus.prototype.makeClientApi = function() {
    var me = this;
    
    var receivedTranslation = function(translation){
        me.data.setFinalText(translation);
        me.view.setFinalText(translation);
    };
    
    var receivedRecognizedText = function(recognizedText){
        me.view.setRecognizedText(recognizedText);
        me.saveText();
        me.view.reveal();
    };
    
    var clientApi = {
        "receivedTranslation": receivedTranslation,
        "receivedRecognizedText": receivedRecognizedText
    };
    return clientApi;
};


Octopus.prototype.processURL = function() {
    var url = this.view.getImgURL();
    this.view.setImage(url);
    
    var isFast = this.view.getIsFast();
    
    this.client.requestRecognitionByUrl(url, isFast);
    
    this.clearInfo();
};


Octopus.prototype.initFileUpload = function() {
    var form = document.getElementById('uploadForm');
    var client = this.client;
    var view = this.view;
    
    form.onsubmit = function(ev) {
        ev.preventDefault();
        
        var fileEl = document.getElementById('imageFile');
        var isFast = view.getIsFast();
        
        client.upload(fileEl, isFast);
        
        view.changeSrcLocal();
    };
};


Octopus.prototype.clearInfo = function() {
    this.view.setRecognizedText("");
    this.saveText();
};


Octopus.prototype.saveText = function()
{
    var text = this.view.getRecognizedText();
    this.data.setFinalText(text);
    this.data.setLastSaved(text);
    this.view.setFinalText(text);
};

Octopus.prototype.translateText = function(removeEndlines)
{
    var text = this.data.getLastSaved();
    var toLang = this.view.getToLang();
    this.client.requestTranslation(text, toLang, removeEndlines);
};

var oct = new Octopus();