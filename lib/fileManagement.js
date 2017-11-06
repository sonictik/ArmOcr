var fs = require('fs');
//TODO: change this function

function getFileName() {
    return "" + Math.ceil(Math.random() * 100000);
}

function makeFolder(folderName){
    return new Promise(function(resolve, reject){
        fs.mkdir(folderName, 0777, function(err) {
            if (err) {
                if (err.code == 'EEXIST') resolve(); // ignore the error if the folder already exists
                else reject(err); // something else went wrong
            } else resolve(); // successfully created folder
        });        
    });
}

module.exports.getFileName = getFileName;
module.exports.makeFolder = makeFolder;