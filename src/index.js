const express = require('express')
const path = require('path')

// THIS npm package is used to stop bad workds from submit
const Filter = require('bad-words')

// We require this to for setting up Websocket 
const http = require('http')

// This we require for Building web sockets
const socketio = require('socket.io')

//This is custom function created for message template
const {generateMessage,generateLocationMessage} = require('./utils/messages')

//This is custom function created for actions related to users.
const {addUser,removeUser,	getUser,getUsersInRoom, getAllUsers} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)


// Setting Up Required Variables.
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')


// Set Static Directory To Serve 
app.use(express.static(publicDirectoryPath))


let count = 0
io.on('connection', (socket) => {
	console.log('New Websocket Connection! ')

	// Socket.emit will send to the curent user which is connected
	//socket.emit('CountUpdated',count)

	socket.on('CountIncremented', () => {
		count++
		//io.emit will send to all users connected
		io.emit('CountUpdated',count)
	})

	socket.on('join',({username,room},callback) =>{		

		// Add User to Users Array
		// Socket.id is default provided by sockets for each connection.
		// addUser call can return error or User object
		const {user, error} = addUser( { id:socket.id, username, room } )
		// Callback function is called with error so user dont joined

		
		if(error){
			return callback(error)
		}

		socket.join(user.room)

		socket.emit('message',generateMessage('Admin','Welcome!'))

		//Socket.broadcast.emit send message to all other users expect himself
		//socket.broadcast.emit('message',generateMessage('A new user has joined.'))

		// Socket.broadcast.to.emit send message to all in perticualar room without current user
		socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined.`))

		io.to(user.room).emit('roomData',{
			room : user.room,
			users : getUsersInRoom(user.room)
		})

		callback()
	})
 
	socket.on('SendMessage', (message,callback) => {

		//console.log(socket.id)
		const {user} = getUser(socket.id)
		console.log(user)
		const filter = new Filter()

		if(filter.isProfane(message)){
			return callback('Profanity is Not Allowed')
		}
		console.log(user.room)
		io.to(user.room).emit('message',generateMessage(user.username,message))

		callback('Delivered!')
	})

	socket.on('sendLocation',(coordinates,callback)=>{

		const {user} = getUser(socket.id)

		io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`))

		callback()
	})

	// This is default socket method when user disconnect
	socket.on('disconnect' , ()=>{

		const {user} = removeUser(socket.id)

		console.log(user)
		// if users exist then only send message to others
		if(user){
			io.to(user.room).emit('message',generateMessage('Admin',`$(user.username has Left.`))

			io.to(user.room).emit('roomData',{
				room : user.room,
				users : getUsersInRoom(user.room)
			})

		}
		
	})

})

// Here we are listing from server to work with web sockets.
// Server is extension of express
server.listen(port,()=>{
    console.log('Server Started at Port ' + port)
})