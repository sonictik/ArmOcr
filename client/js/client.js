var socket = io();
var uploader = new SocketIOFileClient(socket);

//----------------------------by file----------------------------//
uploader.on('start', function(fileInfo) {
    console.log('Start uploading', fileInfo);
});

uploader.on('stream', function(fileInfo) {
    console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
});

uploader.on('complete', function(fileInfo) {
    console.log('Upload Complete', fileInfo);
});

uploader.on('error', function(err) {
    console.log('Error!', err);
});

uploader.on('abort', function(fileInfo) {
    console.log('Aborted: ', fileInfo);
});


//----------------------------by url----------------------------//
var requestRecognitionByUrl = function(url)
{
    socket.emit("recognizeByUrl", url);
};



var requestTranslation = function(text, toLang, removeEndlines)
{
    var msg = {
        "text": text,
        "toLang": toLang,
        "removeEndl": removeEndlines
    };
    socket.emit('translateText', msg);
}

socket.on('receiveTranslation', function(translation) {
    receivedTranslation(translation);
});

socket.on("receiveText", function(recognizedText){
    receivedRecognizedText(recognizedText);
});