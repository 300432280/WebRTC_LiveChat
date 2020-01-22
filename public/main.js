var Peer = require('simple-peer')
var socket = io()
const video = document.querySelector('video')
var client = {}

// get stream
navigator.mediaDevices.getUserMedia({video:true, audio:true})
.then(stream => {
    
})
.catch(err => document.write(err))