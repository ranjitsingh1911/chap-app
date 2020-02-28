const users = []

const addUser = ({id,username,room}) => {

	// Clean the data
	username = username.trim().toLowerCase()
	room = room.trim().toLowerCase()

	// Validate the data
	if(!username || !room){
		return {
			error : 'Username and Room are Required.'
		}
	}

	//Check for existing user
	const existingUser = users.find((user) => {
		return user.username === username && user.room === room
	})

	// Validate User
	if(existingUser){
		return {
			error:'User Already exist.'
		}
	}

	// Store the User
	const user = {id,username,room}

	users.push(user)

	return {
		user
	}

}

const removeUser = (id) => {

	// Search By Index. This is faster then filter. It returns index of array. if not found its value is -1
	const index = users.findIndex((user) => {
		user.id === id
	})

	// if user is not found 
	if(index===-1){
		return {
			error: 'User Not Found'
		}
	}
	// remove one element from user and return the first array
	// Here we are removing only one value so we are returing array at index 0 which is removed record
	return {
		user: users.splice(index,1)[0]
	}
}

const getUser = (id) => {

	const user = users.find((userObject) => userObject.id===id)
	 if(user){
        return {
        	user
        }
    }else{
        return {
        	error: 'User Not Found.'
        }
    }
}

const getUsersInRoom = (room) => {

	// Clean the data
	room = room.trim().toLowerCase()

	// Get Object with users that are in room
	const roomUsers = users.filter( (userObject) => userObject.room===room) 
	
	// Check if there are no users in room.
	return roomUsers
}

const getAllUsers  = () => {
	return {
		users
	}

}

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
	getAllUsers
}


