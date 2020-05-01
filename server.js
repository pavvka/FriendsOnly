const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessages = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server)

//Set static folder

app.use(express.static(path.join(__dirname, 'public')))

const botName = "ChatCord Bot"

//Run then client connects
io.on('connection', (socket)=>{
  socket.on('joinRoom', ({username, room})=>{

    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    //Welcome new user
    socket.emit('message', formatMessages(botName, 'Welcome to chatCord!'))

    //Broadcst when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessages(botName, `${username} has joined the chat!`));

    //Send users and rooms info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })

    //Send users and rooms info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    }) 
    
  })

  //Listen for chatMessage

  socket.on('chatMessage', (message) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessages(user.username, message));
  })

  //This runs then client disconnects

  socket.on('disconnect', ()=>{
    const user = userLeave(socket.id);
    if(user){
      io.to(user.room).emit('message', formatMessages(botName, `${user.username} has left th chat`));
    }
  })
 
})




const PORT = 5000 || process.env.port;

server.listen(PORT, ()=>console.log('Server started on port ', PORT))