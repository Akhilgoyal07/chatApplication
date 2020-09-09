var MongoClient = require("mongodb").MongoClient;
var msgObj = require("./messageManagement");


function newUserJoin(id, userName, roomName, socket, obj, io)
{
    var tempUser={id,userName, roomName};
    
    MongoClient.connect("mongodb://localhost:27017/", {useUnifiedTopology:true} ,(err, dbHost)=>{

        if(err)
        {
            console.log("Error connecting to the server");
        }
        else
        {
            var db = dbHost.db("slDb");
            db.collection("users", (err, coll)=>{
                if(err)
                {
                    console.log("Error connecting to the collection");
                }
                else
                {
                    coll.insertOne(tempUser,(err, data)=>{
                        if(!err)
                        {
                            console.log("inserted a document");
                            msgObj.postMessage(obj);
                            socket.emit("welcomeUser", {userName, roomName});
                            socket.to(roomName).broadcast.emit("modifyUserJoinnMsg", obj);
                            
                            getAllUsers(roomName, (p1)=>{
                                if(p1[0].error)
                                {
                                    console.log(p1[0].error);
                                }
                                else
                                {
                                    io.to(roomName).emit("modifyUsersList", p1);
                                }                           
                            });

                            msgObj.getAllMessages(roomName, (msgArr)=>{
                                if(msgArr[0].error)
                                {
                                    console.log(msgArr[0].error);
                                }
                                else
                                {
                                    socket.emit("previousMsg", msgArr);
                                }    
                            })
                        }
                        else
                        {
                            console.log("error inserting the document");
                        }
                    });
                }
            })
        }
    
    });
}

function getAllUsers(roomName, returnResult)
{
    MongoClient.connect("mongodb://localhost:27017/", (err, dbHost)=>{
        if(err)
        {
            console.log("Error connecting to the server");
        }
        else
        {
            var db = dbHost.db("slDb");
            db.collection("users", (err, coll)=>{
                if(err)
                {
                    console.log("Error connecting to the collection", err);
                    returnResult([{error:err}]);
                }
                else
                {
                    coll.find({roomName:roomName},{userName:1, _id:0}).toArray((err, dataArr)=>{
                        if(err)
                        {
                            console.log("Error in tht find users", err);
                            returnResult([{error:err}]);
                        }
                        else
                        {
                            console.log("Users in a particular room in userInfo", dataArr);
                            returnResult(dataArr);
                        }
                    });
                }
            })
        }
    })

}


function removeUser(id, socket, io)
{

    MongoClient.connect("mongodb://localhost:27017/", (err, dbHost)=>{

        if(err)
        {
            console.log("Error connecting to the server");
        }
        else
        {
            var db = dbHost.db("slDb");
            db.collection("users", (err, coll)=>{
                if(err)
                {
                    console.log("Error connecting to the collection");
                }
                else
                {
                    
                    coll.findOneAndDelete({id : id}, (err, res)=>{
                        if(err)
                        {
                            console.log("Error during deletion", err);
                        }
                        else
                        {
                            console.log("Deleted document in removeUser: ", res.value);
                            var tempUser = res.value;
                            var obj={userName:tempUser.userName, message:"has left the room", roomName:tempUser.roomName, modifyUser:true};
                            msgObj.postMessage(obj);
                            socket.to(tempUser.roomName).broadcast.emit("modifyUserJoinnMsg",obj);
                            getAllUsers(tempUser.roomName, (p1)=>{
                                if(p1.length==0)
                                {
                                    console.log("No users in the room");
                                }
                                else
                                {
                                    if(p1[0].error)
                                    {
                                        console.log(p1[0].error);
                                    }
                                    else
                                    {
                                        io.to(obj.roomName).emit("modifyUsersList", p1);
                                    }
                                }
                            });
                        }
                    });
                }
            })
        }
    
    });
}

module.exports = {newUserJoin, getAllUsers, removeUser};