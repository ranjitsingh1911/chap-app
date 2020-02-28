const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('#message')
const $messageFormButton = document.querySelector('#SendMsg')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Template
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options

const autoScroll = () => {
	// New Message Element
	const $newMessage = $messages.lastElementChild

	// Height of new Message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	// Visible height
	const visibleHeight = $messages.offsetHeight

	//Height of messgae container
	const containerHeight = $messages.scrollHeight

	// How far i have scroled
	const scrollOffset = $messages.scrollTop + visibleHeight

	if(containerHeight - newMessageHeight <= scrollOffset){
		$messages.scrollTop = $messages.scrollHeight
	}
}


//This is jquery used to parse querysting to proper values.
//ignoteQueryPrifix remove ? from query string
// location.search is javascript librayry that store query string.
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.emit('join',{username,room},(error) => {
	if(error){
		alert(error)
		location.href = './'
	}
})

socket.on('CountUpdated', (count) => {
	console.log('Count Has Been Updated to ' + count)
	
})

socket.on('message', (message) => {
	console.log(message)
	const html = Mustache.render($messageTemplate,{
		username:message.username,
		message:message.text,
		createdAt:moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend',html)
	autoScroll()
})

socket.on('locationMessage', (message) => {
	console.log(url)
	const html = Mustache.render($locationTemplate,{
		username:message.username,
		url: message.url,
		createdAt:moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend',html)
	autoScroll()
})


socket.on('roomData', ({room,users}) => {
	
	const html = Mustache.render($sidebarTemplate,{
		room,
		users
	})
	
	document.querySelector('#sidebar').innerHTML = html
})


/*
This was Added For Counter Application
document.querySelector('#incrementBtn').addEventListener('click', () => {
	console.log('Increment Button Clicked')
	socket.emit('CountIncremented')
})
*/


$messageForm.addEventListener('submit' , (e) => {
	e.preventDefault()
	$messageFormButton.setAttribute('disabled','disabled')
	const message = e.target.elements.message.value
	socket.emit('SendMessage',message,(error)=>{
		$messageFormButton.removeAttribute('disabled')
		$messageFormInput.value=''
		$messageFormInput.focus()
		if(error){
			return console.log(error)
		}
		console.log('Message Deliverd')
	})

})


document.querySelector('#send-location').addEventListener('click', () => {
	console.log('Send Location Button Clicked')
	
	if(!navigator.geolocation){
		return alert('Geo Location Not Supported By your Browser.')
	}

	$sendLocationButton.setAttribute('disabled','disabled')

	navigator.geolocation.getCurrentPosition((position) => {
		console.log(position.coords.latitude + '-' + position.coords.longitude)
		socket.emit('sendLocation',{
			latitude:position.coords.latitude,
			longitude:position.coords.longitude
		},()=>{
			$sendLocationButton.removeAttribute('disabled')
			console.log('Location Shared.')
		})
	})
})






