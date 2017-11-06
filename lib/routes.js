function addRoutes(app, rootDirectory) {
    // TODO: remove vulnerability (res.send handles ../ ForbiddenError)
    // send if exists
    
    //socket.io-file
    app.get('/socket.io-file-client.js', (req, res, next) => {
        return res.sendFile(rootDirectory + '/node_modules/socket.io-file-client/socket.io-file-client.js');
    });
    
    // get index 
    app.get('/', function(req, res) {
        res.sendFile(rootDirectory + '/client/index.html');
    });
    
    // get image example 
    app.get('/example-image.jpg', function(req, res) {
        res.sendFile(rootDirectory + '/client/example-image.jpg');
    });
    
    // get css
    app.get('/css/*', function(req, res) {
        res.sendFile(rootDirectory + '/client/css/' + req.params[0]);
    });

    // get js
    app.get('/js/*', function(req, res) {
        res.sendFile(rootDirectory + '/client/js/' + req.params[0]);
    });

    // get fonts
    app.get('/fonts/*', function(req, res) {
        res.sendFile(rootDirectory + '/client/fonts/' + req.params[0]);
    });
    
};

module.exports = addRoutes;