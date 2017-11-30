var Client = function(octApi) {
    this.octApi = octApi;
    
    this.socket = io();
    this.uploader = new SocketIOFileClient(this.socket);
    
    this.initSocket(this.octApi);
    
    this.initUploader();
};


Client.prototype.initSocket = function(octApi) {
    this.socket.on('receiveTranslation', function(translation) {
        octApi.receivedTranslation(translation);
    });
    this.socket.on("receiveText", function(recognizedText){
        octApi.receivedRecognizedText(recognizedText);
    });
};


Client.prototype.initUploader = function() {
    this.uploader.on('start', function(fileInfo) {
        console.log('Start uploading', fileInfo);
    });
    this.uploader.on('stream', function(fileInfo) {
        console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
    });
    this.uploader.on('complete', function(fileInfo) {
        console.log('Upload Complete', fileInfo);
    });
    this.uploader.on('error', function(err) {
        console.log('Error!', err);
    });
    this.uploader.on('abort', function(fileInfo) {
        console.log('Aborted: ', fileInfo);
    });
};

Client.prototype.upload = function(fileElement, isFast) {
    var msg = {
        "isFast": isFast
    };
    
    this.uploader.upload(fileElement, {
        data: msg
    });
};

Client.prototype.requestRecognitionByUrl = function(url, isFast) {
    var msg = {
        "url": url,
        "isFast": isFast
    };
    this.socket.emit("recognizeByUrl", msg);
};

Client.prototype.requestTranslation = function(text, toLang, removeEndlines) {
    var msg = {
        "text": text,
        "toLang": toLang,
        "removeEndl": removeEndlines
    };
    this.socket.emit('translateText', msg);
}

