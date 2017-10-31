var fs = require('fs'),
        request = require('request'),
        exec = require('child_process').exec,
        app = require('express')(),
        formidable = require('formidable'),
        http = require('http').Server(app),
        SocketIOFile = require('socket.io-file'), //insatll also client
        path = require('path'),
        translate = require('google-translate-api'),
        io;


console.log(__dirname);

//---------------------------------------http support---------------------------------------//

var supporthttp = function() {
    // TODO: remove vulnerability (directory traversal, local file inclusion, ./../)
    
    //socket.io-file
    app.get('/socket.io-file-client.js', (req, res, next) => {
        return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
    });
    
    //support upload
    
    app.post('/upload', function (req, res) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            console.log(files);
            var oldpath = files.filetoupload.path;
            var newpath = './uploads/' + files.filetoupload.name;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.write('File uploaded and moved!');
                res.end();
            });
        });
    });
    
    // get index 
    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/client/index.html');
    });
    
    // get index 
    app.get('/example-image.jpg', function(req, res) {
        res.sendFile(__dirname + '/client/example-image.jpg');
    });
    
    // get css
    app.get('/css/*', function(req, res) {
        res.sendFile(__dirname + '/client/css/' + req.params[0]);
    });

    // get js
    app.get('/js/*', function(req, res) {
        res.sendFile(__dirname + '/client/js/' + req.params[0]);
    });

    // get fonts
    app.get('/fonts/*', function(req, res) {
        res.sendFile(__dirname + '/client/fonts/' + req.params[0]);
    });
    
};





var getFileName = function()
{
    return "" + Math.ceil(Math.random() * 100000);
};
//---------------------------------------text recognition---------------------------------------//
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        //console.log('content-type:', res.headers['content-type']);
        //console.log('content-length:', res.headers['content-length']);
        
        if(typeof res == 'undefined' || typeof res.headers['content-type'] == 'undefined') return;
        
        //TODO: remove unknown size and send error. upload file
        if(res.headers['content-type'].substr(0,6) != "image/" || res.headers['content-length'] > 2100000) return;
    
        var ext = res.headers['content-type'].substr(6);
        if(ext && ext.length > 1) filename += "." + ext;
        
        request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
            callback(filename);
        });
    });
};

//downloadUrl(url,function(filename, filepath){});
var downloadUrl = function(url, callback){
    var filename = getFileName();
    var fpath = "./pics/" + filename;
    
    download(url, fpath, function(fpath){
        callback(fpath.substr(7), fpath);
    });
};

//runTess(filename, function(textpath){});
var runTess = function(filename, callback){
    var cmd = "tesseract ./pics/" + filename + " ./texts/" + filename + " --tessdata-dir \"" + __dirname  + "/trained\" -l ArmSlow";
    console.log("Running: " + cmd);
    
    exec(cmd, function(error, stdout, stderr) {
        callback("./texts/" + filename + ".txt");
    });
};

//recognizeArmenianText("armeniantext.jpg", function(text){});
var recognizeArmenianText = function(filename, callback){
    runTess(filename, function(textpath){
        fs.readFile(textpath, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            //console.log(data);
            callback(data);
        });
    });
};

//processUrl(url, function(text){});
var processUrl = function(url, callback){
    downloadUrl(url,function(filename,filepath){
        recognizeArmenianText(filename,function(text){
            callback(text);
        });
    });
};



//---------------------------------------Client---------------------------------------//
var users_n = 0;
var serv_init = function() {
    io = require('socket.io')(http);
    io.on('connection', function(socket) {
        users_n++;
        console.log('a user connected, total: ' + users_n);
        //io.emit('users_n', users_n);

        var uploader = new SocketIOFile(socket, {
            // uploadDir: {			// multiple directories 
            // 	music: 'data/music', 
            // 	document: 'data/document' 
            // }, 
            uploadDir: 'pics',							// simple directory 
            accepts: ['image/gif', 'image/png', 'image/jpeg'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg' 
            maxFileSize: 2194304, 						// 4 MB. default is undefined(no limit) 
            chunkSize: 500240,							// default is 10240(1KB) 
            transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay) 
            overwrite: true, 							// overwrite file if exists, default is true. 
            rename: function(filename) {
                var file = path.parse(filename);
                var fname = getFileName();
                var ext = file.ext;
                return fname + ext;
            }
        });
        
        uploader.on('complete', (fileInfo) => {
            console.log('Upload Complete.');
            console.log(fileInfo);
            recognizeArmenianText(fileInfo.name, function(text){
                socket.emit('receiveText', text);
            });
        });
        
        uploader.on('error', (err) => {
            console.log('Error!', err);
        });
        
        uploader.on('abort', (fileInfo) => {
            console.log('Aborted: ', fileInfo);
        });

        socket.on('translateText', function(msg){
            if(msg.removeEndl)
            {
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
            processUrl(url,function(text){
                socket.emit('receiveText', text);
            });
        });

        socket.on('disconnect', function() {
            console.log('user disconnected');
            users_n--;
            io.emit('users_n', users_n);
        });
    });
};

//---------------------------------------Main---------------------------------------//
var start_server = function() {
    //    process_arguments();
    http.listen(process.env.PORT, function() {
        console.log('listening on port: ' + process.env.PORT);
    });
    supporthttp();
    serv_init();
};


start_server();



