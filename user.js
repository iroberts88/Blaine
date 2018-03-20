//----------------------------------------------------------------
//user.js
//container for user info
//----------------------------------------------------------------

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

function User() {
    
    return {
        userData: null,
        owner: null,
       
        init: function(d){
            this.userData = {
                username: 'guest',
                password: 'guest',
                chatLog: [],
                admin: false,
                createDate: new Date().toJSON(),
                lastLogin: new Date().toJSON(),
                loggedin: true
            };

            if (typeof d.username != 'undefined'){
                this.userData.username = d.username;
                this.userData.password = d.password;
                this.userData.chatLog = d.chatLog;
                this.userData.admin = d.admin;
                this.userData.createDate = d.createDate;
                try{
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'blaine_userdata',
                        Key: {
                            username: this.userData.username
                        }
                    }
                    var that = this;
                    docClient.get(params, function(err, data) {
                        if (err) {
                            console.error("Unable to find user data. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            //get user data?
                        }
                    });
                }catch(e){
                }
            }

            try{
                if (d.guest){
                    //guest stuff?
                }
            }catch(e){
                console.log(e);
            }

        },
        
        setLastLogin: function(date){
            //TODO this should change the actual mongodb lastLogin
            var ge = this.owner.gameEngine;
            if (this.userData.username != 'guest'){
                ge.users[ge._userIndex[this.userData.username]].lastLogin = date;
            }
        },
        lock: function(){
            var ge = this.owner.gameEngine;
            this.userData.loggedin = true;
            if (this.userData.username != 'guest'){
                ge.users[ge._userIndex[this.userData.username]].loggedin = true;
                try{
                    var d = this.userData;
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
                        UpdateExpression: "set loggedin = :bool",
                        ExpressionAttributeValues: {
                            ":bool": true
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update loggedin->true succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }catch(e){
                    console.log("DB ERROR - Unable lock user");
                    console.log(e);
                }
            }
        },
        unlock: function(){
            var ge = this.owner.gameEngine;
            this.userData.loggedin = false;
            if (this.userData.username != 'guest'){
                ge.users[ge._userIndex[this.userData.username]].loggedin = false;
                try{
                    var d = this.userData;
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
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
                }catch(e){
                    console.log("DB ERROR - Unable to unlock user");
                    console.log(e);
                }
            }
        },
        updateDB: function(){
            var ge = this.owner.gameEngine;
            if (this.userData.username != 'guest'){
                //Player is not a guest - update DB
                /*try{

                    var d = this.userData;
                    var c = [];
                    for (var i = 0; i < this.characters.length;i++){
                       c.push(this.characters[i].getDBObj());
                    }
                    var inv = [];
                    for (var i = 0; i < this.inventory.items.length;i++){
                       inv.push([this.inventory.items[i].itemID,this.inventory.items[i].amount]);
                    }
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
                        UpdateExpression: "set lastLogin = :l",
                        ExpressionAttributeValues: {
                            ":l": new Date().toJSON()
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update usrLastLogin succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                    params = {
                        TableName: 'tactics_userdata',
                        Key:{username: d.username},
                        UpdateExpression: "set characters = :c, inventory = :i",
                        ExpressionAttributeValues: {
                            ":c": c,
                            ":i": inv
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update usrData succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }catch(e){
                    console.log("DB ERROR - Unable to update user data");
                    console.log(e);
                }*/
            }
        },
        setOwner: function(o) {
            this.owner = o;
            var ge = this.owner.gameEngine;

        }

    }
}

exports.User = User;
