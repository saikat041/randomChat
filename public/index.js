// Global variables
var socket;
var userName;
var partnerUserName;


// This function is called when startChet button is clicked.
function startChat(){

    socket = io();

    userName = document.getElementById('userName').value;

    socket.emit('userName',userName);

    // disable nick name input box and start chat button so that user can't send multiple chat request.
    // We are enabling it after a partner is found so that he can connect to new user.
    document.getElementById("userName").disabled = true;
    document.getElementById("startChatButton").disabled = true;


    // On receiving partner details from server.
    socket.on('partnerDetails', (data)=>{

        // Enabling username input and start chat button so that he can connect to new user.
        document.getElementById("userName").disabled = false;
        document.getElementById("startChatButton").disabled = false;

        // message input and send button are disabled when user is not paired with anyone
        // We are enabling them after user gets paired with a partner.
        document.getElementById("messageBox").disabled = false;

        // Updating partner name in UI.
        document.getElementById('partnerUserName').innerText = "You are connected to : " + data.userName;
    });

    // On receiving new message we add a message bubble to chat box.
    socket.on('message', (data)=>{
        addNewLineOnMessageBox(data, 'received');
    });

    // When partner leaves an alert is shown.
    socket.on('partnerLeft', (data) => {

        partnerUserName = '';
        document.getElementById('partnerUserName').innerText = partnerUserName;
        alert("Partner Left");
    });

}

function keyPressed(evenet) {

    // When enter key is pressed.
    if(evenet.keyCode == 13){
        sendMessage();
    }
}


// Onclicking send button
function sendMessage(){
    messageBox = document.getElementById('messageBox');
    socket.emit('message', messageBox.value);
    addNewLineOnMessageBox(messageBox.value, 'sent');
    messageBox.value = '';

}


// Function for adding message bubble in chat box.
function addNewLineOnMessageBox(line,type) {

    var messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';

    // If it's a sent message float it to right else float it to left.
    if(type === 'sent'){
        messageBubble.className = messageBubble.className + ' ' + 'float-right';
    }else{
        messageBubble.className = messageBubble.className + ' ' + 'float-left';
    }
    messageBubble.innerHTML = line;
    var ele = document.getElementById('chats');
    ele.appendChild(messageBubble);

    // Scrolling div to bottom so that added message is visible
    ele.scrollTop = ele.scrollHeight - ele.clientHeight;
}
