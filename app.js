var app = require('http').createServer(webResponse),
    AWS = require("aws-sdk"),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    GameEngine = require('./gameengine.js').GameEngine,
    RequireCheck = require('./requirecheck.js').RequireCheck;


const crypto = require('crypto');
    
var rc = null,
    ge = null;

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});


function init() {

    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    rc = new RequireCheck();
    ge = new GameEngine();

    rc.onReady(onReady);

    // ----------------------------------------------------------
    // Start Database Connection
    // ----------------------------------------------------------

    rc.ready();
    rc.require('dbMaps','dbUsers','dbPokemon','dbAttacks','dbItems');

    // ---- Load Maps ----
    fs.readdir( './mapTool/maps', function( err, files ) {
        if( err ) {
            console.error( "Could not list the directory.", err );
            process.exit( 1 );
        } 
        ge.mapCount = files.length;
        ge.loadMaps(files);
        rc.ready('dbMaps');
    });

    fs.readFile('./db/blaine_items.json', "utf8",function read(err, data) {
        if (err) {
            throw err;
        }
        var obj = JSON.parse(data);

        ge.loadItems(obj.items);
        rc.ready('dbItems');
    });
    // ---- Load Pokemon ----
    fs.readFile('./db/blaine_pkmn.json', "utf8",function read(err, data) {
        if (err) {
            throw err;
        }
        var obj = JSON.parse(data);

        ge.loadPokemon(obj.items);
        rc.ready('dbPokemon');
    });

    // ---- Load Attacks ----
    fs.readFile('./db/blaine_attacks.json', "utf8",function read(err, data) {
        if (err) {
            throw err;
        }
        var obj = JSON.parse(data);

        ge.loadAttacks(obj.items);
        rc.ready('dbPokemon');
    });

    // ---- Load Userbase ----
    docClient.scan({TableName: 'users'}, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Checking user logged-in status...");
            for (var i = 0; i < data.Items.length;i++){
                if (data.Items[i].loggedin){
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: data.Items[i].username},
                        UpdateExpression: "set loggedin = :bool",
                        ExpressionAttributeValues: {
                            ":bool": false
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update loggedin->false succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }
            }
            rc.ready('dbUsers');
        }
    });

}
init();



// ----------------------------------------------------------
// Start Web Server
// ----------------------------------------------------------
var port = process.env.PORT || 3005;
app.listen(port);

function webResponse(req, res) {
    var filename = req.url;

    // Check for default
    if (filename == '/') {
        filename = '/index.html';
    }

    //console.log('HTTP Request: ' + filename);

    fs.readFile(__dirname + '/public_data' + filename, function(err, data) {
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
    console.log('All require items loaded. Starting Game Engine!');
    ge.init();
}


// TO DO: Need to keep track of sockets with ids
// ----------------------------------------------------------
// Start Socket Listener
// ----------------------------------------------------------
io.sockets.on('connection', ge.newConnection);

console.log('Listening');


