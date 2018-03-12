var app = require('http').createServer(webResponse),
    RequireCheck = require('./requireCheck.js').RequireCheck,
    MapTool = require('./maptool.js').MapTool,
    AWS = require("aws-sdk"),
    io = require('socket.io').listen(app)
    
var rc = null,
    ge = null;


AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});


function init() {

    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    rc = new RequireCheck();
    mt = new MapTool();

    rc.onReady(onReady);

    // ----------------------------------------------------------
    // Start Database Connection
    // ----------------------------------------------------------

    rc.ready();
    rc.require('dbMaps');

    // ---- Load Maps ----
    docClient.scan({TableName: 'blaine_maps'}, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Loading maps... " + data.Items.length + ' found');
            console.log(data.Items);
            mt.loadMaps(data.Items);
            rc.ready('dbMaps');
        }
    });

}
init();



// ----------------------------------------------------------
// Start Web Server
// ----------------------------------------------------------
var port = process.env.PORT || 3000;
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


