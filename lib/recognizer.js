var request = require('request');
var fs = require('fs');
var exec = require('child_process').exec;
var fileManagement = require('./fileManagement');

function downloadNSave(uri, filename){
    return new Promise(function(resolve, reject){
        request.head(uri, function(err, res, body){
            if(err) {
                reject(err);
                return;
            }
            if(typeof res == 'undefined' || typeof res.headers['content-type'] == 'undefined') {
                reject(new Error("unidentified content"));
                return;
            }
            
            //TODO: remove unknown size and send error. 
            if(res.headers['content-type'].substr(0,6) != "image/" || res.headers['content-length'] > 2100000) {
                reject(new Error("not an image or >2MB"));
                return;
            }
            
            //TODO: save only known extensions
            var ext = res.headers['content-type'].substr(6);
            if(ext && ext.length > 1) filename += "." + ext;
            
            request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
                resolve(filename);
            });
        });
    });
}

function downloadUrl(url){
    var filename = fileManagement.getFileName();
    var fpath = "./pics/" + filename;
    return downloadNSave(url, fpath)
        .then(function(fpath){
            return Promise.resolve(fpath.substr(7));
        });
};

//TODO: handle /../ in a good way
function runTess(filename, isFast){
    return new Promise(function(resolve, reject){
        var lang = "ArmSlow";
        if(isFast) lang = "ArmFast";
        var cmd = "tesseract ./pics/" + filename + " ./texts/" + filename + " --tessdata-dir \"" 
            + __dirname  + "/../trained\" -l " + lang; // + " --psm 1";
        //console.log("Running: " + cmd);
        
        exec(cmd, function(error, stdout, stderr) {
            if(error) reject(error);
            else resolve("./texts/" + filename + ".txt");
        });
    });
}

function readFileU8(textpath){
    return new Promise(function(resolve, reject){
        fs.readFile(textpath, 'utf8', function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function textRefine(text){
    text = text.replace(new RegExp(" ն ", "g"), " և ");
    text = text.replace(new RegExp(",ն ", "g"), ",և ");
    return text;
}

function recognizeText(filename, isFast){
    return runTess(filename, isFast)
        .then(readFileU8)
        .then(function(text){
            return Promise.resolve(textRefine(text));
        });
}

function processUrl(url, isFast){
    return downloadUrl(url)
        .then(function(filename){
            return recognizeText(filename, isFast);
        });
}


module.exports.byFilename = recognizeText;
module.exports.byUrl = processUrl;
