// alert("hello");

var chatForm = document.getElementById("chatForm");
var chatMsg = document.getElementById("chatMsg");
var chatMessagesDiv = document.getElementById("chatMessagesDiv");
var participantsList = document.getElementById("participantsList");
var frontUserName = document.getElementById("userName");
var frontRoomName = document.getElementById("roomName");
const messageContainer=document.querySelector('.msgBox');
// var audio = new Audio('sound2.mp3');


const append=(message,position)=>{
    const messageElement=document.createElement('div');
    messageElement.innerText=message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    
    // if(position=='left')
    // audio.play();
}

// console.log(Qs.parse(location.search));
var userObject=Qs.parse(location.search,{ignoreQueryPrefix: true});
var userName = userObject.userName;
var roomName = userObject.roomName;
console.log("Username : ",userName);

const socket = io();

socket.emit("joinRoom", {userName:userName, roomName:roomName});

socket.on("welcomeUser", (data)=>{
    frontUserName.innerHTML += data.userName;
    frontRoomName.innerHTML += data.roomName;
})

socket.on("previousMsg", (msgArr)=>{
    for(var i=0; i<msgArr.length; i++)
    {
        var obj = msgArr[i];
        if(obj.modifyUser)
        {
            if(obj.userName==userName)
            {
                append(`You ${obj.message}`,'center');
            }
            else
            {
                append(`${obj.userName} ${obj.message}`,'center');
            }
        }
        else
        {
            if(obj.userName==userName)
            {
                append(`${obj.message}`,'right');
            }
            else
            {
                append(`${obj.userName}:  ${obj.message}`, 'left');
            }
        }
        messageContainer.scrollTo(0,messageContainer.scrollHeight);
    }
})

socket.on("chatMsg", (obj)=>{
    console.log("in front end chatMsg",obj);
    var postion;
    if(obj.userName==userName)
    {
        // position='right';
        append(`${obj.message}`,'right');
    }
    else
    {
        // position='left';
        append(`${obj.userName}:  ${obj.message}`, 'left');
    }
    messageContainer.scrollTo(0,messageContainer.scrollHeight);
    // append(`${obj.userName}:  ${obj.message}`, position);

    // formatMsg(obj);
})

socket.on("modifyUserJoinnMsg", (obj)=>{
    console.log("in front end chatMsg",obj);
    append(`${obj.userName} ${obj.message}`,'center');
    messageContainer.scrollTo(0,messageContainer.scrollHeight);

    // var paraElement = document.createElement("p");
    // var str=obj.userName+" "+obj.message;
    // var pTextNode = document.createTextNode(str);
    // paraElement.appendChild(pTextNode);
    // chatMessagesDiv.appendChild(paraElement);
})

socket.on("modifyUsersList", (usersArr)=>{
    participantsList.innerHTML="";
    for(var i=0; i<usersArr.length; i++)
    {
        var liElement = document.createElement("li");
        var user = usersArr[i].userName;
        var liTextNode = document.createTextNode(user);
        liElement.appendChild(liTextNode);
        participantsList.appendChild(liElement);
    }
})

function formatMsg(obj)
{
    var paraElement = document.createElement("p");
    var str=obj.userName+" : "+obj.message;
    var pTextNode = document.createTextNode(str);
    paraElement.appendChild(pTextNode);
    chatMessagesDiv.appendChild(paraElement);
}

function sendMsgEventHandler()
{
    socket.emit("message", {message:chatMsg.value, userName:userName, roomName:roomName});
    chatMsg.value="";
}

// socket.on("saveMsg", (obj)=>{
//     append(`${obj.userName}:  ${obj.message}`, left);
// })