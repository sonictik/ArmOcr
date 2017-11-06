var app = require('express')(),
        http = require('http').Server(app),
        SocketIOFile = require('socket.io-file'), //insatll also client
        path = require('path'),
        translate = require('google-translate-api'),
        addRoutes = require('./lib/routes'),
        recognizer = require('./lib/recognizer'),
        fileManagement = require('./lib/fileManagement'),
        makeDir = fileManagement.makeFolder,
        io;

//---------------------------------------Client---------------------------------------//
var users_n = 0;
function serv_init() {
    io = require('socket.io')(http);
    io.on('connection', function(socket) {
        users_n++;
        console.log('a user connected, total: ' + users_n);
        //io.emit('users_n', users_n);

        var uploader = new SocketIOFile(socket, {
            uploadDir: 'pics',							// simple directory 
            accepts: ['image/gif', 'image/png', 'image/jpeg'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg' 
            maxFileSize: 2194304, 						// 4 MB. default is undefined(no limit) 
            chunkSize: 500240,							// default is 10240(1KB) 
            transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay) 
            overwrite: true, 							// overwrite file if exists, default is true. 
            rename: function(filename) {
                var file = path.parse(filename);
                var fname = fileManagement.getFileName();
                var ext = file.ext;
                return fname + ext;
            }
        });
        
        uploader.on('complete', (fileInfo) => {
            console.log('Upload Complete.');
            console.log(fileInfo);
            recognizer.byFilename(fileInfo.name)
                .then(function(text){
                    socket.emit('receiveText', text);
                }, function(err){
                    socket.emit('error', err);
                });
        });
        
        uploader.on('error', (err) => {
            console.log('Error!', err);
        });
        
        uploader.on('abort', (fileInfo) => {
            console.log('Aborted: ', fileInfo);
        });

        socket.on('translateText', function(msg){
            if(msg.removeEndl) {
                msg.text = msg.text.replace(/\n/g, " ");
            }
            
            translate(msg.text, {to: msg.toLang}).then(res => {
                //console.log(res.text);
                socket.emit('receiveTranslation', res.text);
            }).catch(err => {
                console.log(err);
            });
        });

        socket.on('recognizeByUrl', function(url) {
            recognizer.byUrl(url)
                .then(function(text){
                    socket.emit('receiveText', text);
                }, function(err){
                    socket.emit('error', err);
                });
        });

        socket.on('disconnect', function() {
            users_n--;
            console.log('a user disconnected, total: ' + users_n);
        });
    });
};

//---------------------------------------Main---------------------------------------//
var start_server = function() {
    //    process_arguments();
    http.listen(process.env.PORT, function() {
        console.log('listening on port: ' + process.env.PORT);
    });
    addRoutes(app, __dirname);
    
    Promise.all([makeDir(__dirname + "/texts"), makeDir(__dirname + "/pics")])
        .then(function(){
            serv_init();
        }, function(err){
            console.log("Error in creating folders: " + err);
        });
};

start_server();