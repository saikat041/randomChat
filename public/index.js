
var socket;
var userName;
var partnerUserName;

function startChat(){

socket = io();

userName = document.getElementById('userName').value

socket.emit('userName',userName)

socket.on('partnerDetails', (data)=>{
    partnerUserName = data.userName;
    document.getElementById('partnerUserName').innerText = partnerUserName;
})

socket.on('message', (data)=>{
    addNewLineOnMessageBox(partnerUserName + ' : '+ data);
    //document.getElementById('messages').innerText = document.getElementById('messages').innerText + '\n' + partnerUserName + ' : '+ data
})

socket.on('partnerLeft', (data) => {
    partnerUserName = '';
    document.getElementById('partnerUserName').innerText = partnerUserName;
    addNewLineOnMessageBox('Your partner left')
})


}


function addNewLineOnMessageBox(line) {
    document.getElementById('messages').innerText = document.getElementById('messages').innerText + '\n' + line;
}
// Onclicking send button
function sendMessage(){

messageBox = document.getElementById('message')
socket.emit('message', messageBox.value);
addNewLineOnMessageBox('You : '+ messageBox.value)
//document.getElementById('messages').innerText = document.getElementById('messages').innerText + '\n' + 'You : '+ messageBox.value
messageBox.value = ''
}
