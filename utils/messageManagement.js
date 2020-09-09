var MongoClient = require("mongodb").MongoClient;


function postMessage(obj, socket, io)
{
    MongoClient.connect("mongodb://localhost:27017/", (err, dbHost)=>{

        if(err)
        {
            console.log("Error connecting to the server");
        }
        else
        {
            var db = dbHost.db("slDb");
            db.collection("messages", (err, coll)=>{
                if(err)
                {
                    console.log("Error connecting to the collection");
                }
                else
                {
                    coll.insertOne(obj);
                    console.log("in messageManagement : ", obj);

                    // socket.emit("welcomeUser", {userName:obj.userName, roomName:obj.roomName});
                    // io.to(obj.roomName).emit("chatMsg", obj);
                }
            })
        }
    
    });
}

function getAllMessages(roomName, returnMsg)
{
    MongoClient.connect("mongodb://localhost:27017/", (err, dbHost)=>{
        if(err)
        {
            console.log("Error connecting to the server");
        }
        else
        {
            var db = dbHost.db("slDb");
            db.collection("messages", (err, coll)=>{
                if(err)
                {
                    console.log("Error connecting to the collection", err);
                    returnMsg([{error:err}]);
                }
                else
                {
                    coll.find({roomName:roomName},{userName:1, _id:0}).toArray((err, msgArr)=>{
                        if(err)
                        {
                            console.log("Error in tht find users", err);
                            returnMsg([{error:err}]);
                        }
                        else
                        {
                            console.log("Messages in database", msgArr);
                            returnMsg(msgArr);
                        }
                    });
                }
            })
        }
    })
}

module.exports={postMessage, getAllMessages}