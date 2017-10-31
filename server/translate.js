var translate = require('google-translate-api');
var fs = require('fs');

fs.readFile("./texts/2431.gif.txt", 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    //console.log(data);
    translate(data, {to: 'hy'}).then(res => {
        console.log(res.text);
        //=> I speak English 
        console.log(res);
        //=> nl 
    }).catch(err => {
        console.error(err);
    });
});




