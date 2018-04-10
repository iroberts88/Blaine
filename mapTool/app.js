var app = require('http').createServer(webResponse),
    RequireCheck = require('./requireCheck.js').RequireCheck,
    MapTool = require('./maptool.js').MapTool,
    io = require('socket.io').listen(app),
    fs = require('fs');
    
var rc = null,
    ge = null;



function init() {


    rc = new RequireCheck();
    mt = new MapTool();

    rc.onReady(onReady);

    // ----------------------------------------------------------
    // Start Database Connection
    // ----------------------------------------------------------

    rc.ready();
    rc.require('dbMaps');

    // ---- Load Maps ----
    fs.readdir( './maps', function( err, files ) {
        if( err ) {
            console.error( "Could not list the directory.", err );
            process.exit( 1 );
        } 
        mt.loadMaps(files);
        rc.ready('dbMaps');
    });

}
init();



// ----------------------------------------------------------
// Start Web Server
// ----------------------------------------------------------
var port = process.env.PORT || 3009;
app.listen(port);

function webResponse(req, res) {
    var filename = req.url;

    // Check for default
    if (filename == '/') {
        filename = '/index.html';
    }

    //console.log('HTTP Request: ' + filename);

    fs.readFile(__dirname + '/public' + filename, function(err, data) {
        if (err) {
            console.log('Couldn\'t find file: ' + req.url);
            res.writeHead(500);
            res.end('Couldn\'t find file: ' + req.url)
        }

        res.writeHead(200);
        res.end(data);
    });
}

function onReady() {
    console.log('All require items loaded. Starting Game Engine');
    mt.init();
}


// TO DO: Need to keep track of sockets with ids
// ----------------------------------------------------------
// Start Socket Listener
// ----------------------------------------------------------
io.sockets.on('connection', mt.newConnection);

console.log('Listening');


