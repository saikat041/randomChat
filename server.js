express = require('express') 
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {
   res.sendFile(__dirname + 'public/index.html');
});

// {socket_id : socket} of unpaired users
unpaired_sockets_map = {}

// {socket_id : socket} of paired users
paired_sockets_map = {}

// {socket_id : username}
username_map = {}

// {socket_id : partner_socket_id} 
partner_map = {}

// function for shuffling an array
function shuffle(arr){

   for(let i = arr.length-1; i>0; i--){
      j = Math.floor((Math.random()*(i + 1)));
      [arr[i], arr[j]] = [arr[j], arr[i]]
   }

}

// Whenever someone connects this gets executed
io.on('connection', function(socket) {

   unpaired_sockets_map[socket.conn.id] = socket

   socket.emit('user_socket_id', socket.conn.id)

   socket.on('userName',(userName)=>{
      console.log(userName, 'connected')
      username_map[socket.conn.id] = userName;
   })

   // Message sending takes place here
   socket.on('message', (data)=>{

      console.log(username_map[socket.conn.id], 'is messaging', username_map[partner_map[socket.conn.id]])
      partnerSocket = paired_sockets_map[partner_map[socket.conn.id]]
      partnerSocket.emit('message',data);

   })

   // If one user disconnects both have to reconnect again
   socket.on('disconnect', ()=>{

      console.log(username_map[socket.conn.id], 'is leaving')

      id = socket.conn.id
      partner_id = partner_map[id]


      // If the iser is not paired yet.
      if(partner_id === undefined) {
         delete username_map[id]
         delete paired_sockets_map[id]
         return;
      }

      // Deleting user and partner details.
      paired_sockets_map[partner_id].emit('partnerLeft', {message : 'Your partner left'})
      paired_sockets_map[partner_id].disconnect(true)

      delete username_map[id]
      delete paired_sockets_map[id]
      delete partner_map[id]

      delete username_map[partner_id]
      delete paired_sockets_map[partner_id]
      delete partner_map[partner_id]

   })

});



// Random Partner Selection
setInterval(()=>{


   socket_ids = Object.keys(unpaired_sockets_map)

   shuffle(socket_ids)

   // each user is assigned a partner. partner of i th socket is i+1 th socket
   // It does not create problem as we are shuffling the array
   // We are also sending each user their partner details

   console.log('Current unpaired user\'s id',socket_ids)

   for(let i = 0; i < socket_ids.length; i=i+2){

      if (i+1 < socket_ids.length) {

      console.log('Pairing', username_map[socket_ids[i+1]], 'and', username_map[socket_ids[i]])

      //  filling partner_map
      partner_map[socket_ids[i]] = socket_ids[i+1];
      partner_map[socket_ids[i+1]] = socket_ids[i];

      
      // Sending each user his partnerUserName
      unpaired_sockets_map[socket_ids[i]].emit('partnerDetails', { userName:username_map[socket_ids[i+1]] });
      unpaired_sockets_map[socket_ids[i+1]].emit('partnerDetails', { userName:username_map[socket_ids[i]] });


      //Putting the paired users in separate lists as we are updating socket_map of unpaired users
      paired_sockets_map[socket_ids[i]] = unpaired_sockets_map[socket_ids[i]]
      paired_sockets_map[socket_ids[i+1]] = unpaired_sockets_map[socket_ids[i+1]]


      //Deleting sockets from unpaired_sockets_map
      delete unpaired_sockets_map[socket_ids[i]]
      delete unpaired_sockets_map[socket_ids[i+1]]

      }

   }

}, 5000)




http.listen(3000, function() {
   console.log('listening on *:3000');
});