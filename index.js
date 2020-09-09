var express = require ("express");
var path = require("path");
var bodyParser = require("body-parser");
var http = require("http");
var socketio = require("socket.io");
var queryString = require("querystring");

var userObj = require("./utils/usersInfo");
var msgObj = require("./utils/messageManagement");

const PORT = 3000;

var app = express();
const server=http.createServer(app);
var io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", (request, response)=>{
    var fileUrl = path.join(__dirname, "public", "login.html");
    response.sendFile(fileUrl);
})

app.post("/home", (request, response)=>{
    var userName=request.body.userName;
    var roomName=request.body.roomName;
    // console.log(userName, password, roomName);
    var temp=queryString.stringify({userName:userName, roomName:roomName});
    response.redirect("/chat?"+temp);
})

app.get("/chat", (request, response)=>{
    var fileUrl = path.join(__dirname, "public", "chat.html");
    // console.log("Inside /chat");
    response.sendFile(fileUrl);
})

//when a new user joins the chat
io.on("connection",(socket)=>{

    socket.on("joinRoom", function (data){
        console.log(data);
        socket.join(data.roomName);
        var obj={userName:data.userName, message:"has joined the room",roomName:data.roomName, modifyUser:true}
        userObj.newUserJoin(socket.id, data.userName, data.roomName, socket, obj, io);
        // socket.emit("welcomeUser");
    })

    socket.on("disconnect", ()=>{
        console.log("User has left the room");
        userObj.removeUser(socket.id, socket, io);
    })
    socket.on("message", (obj)=>{
        console.log("Message Recieved", obj);
        // socket.emit("saveMsg", obj);
        msgObj.postMessage(obj, socket, io);
        io.to(obj.roomName).emit("chatMsg", obj);
        
    })
})

server.listen(PORT, (err)=>{
    if(!err)
    {
        console.log(`Server running at PORT ${PORT}`);
    }
})