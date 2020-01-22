var Peer = require('simple-peer')
var socket = io()
const video = document.querySelector('video')
var client = {}

// get stream
navigator.mediaDevices.getUserMedia({video:true, audio:true})
    .then(stream => {
        socket.emit("NewClient")
        video.srcObject = stream
        video.play()

        //to initilize peer
        function InitPeer(type) {
            var peer = new Peer({ initiator: (type == 'init') ? true:false, stream : stream, trickle : false})
            peer.on('stream', function(stream){
                CreateVideo(stream)
            })
            peer.on('close', function(){
                document.getElementById("peerVideo").remove();
                peer.destroy()
            })
            return peer
        }

        //create peer of type init
        function MakePeer(){
            client.gotAnswer = false
            var peer = InitPeer('init')
            peer.on(('signal'), function(data){
                if (!client.gotAnswer){
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer
        }

        // for the peer of type not init
        function FrontAnswer(offer){
            var peer = InitPeer('notInit')
            peer.on('signal',(data)=>{
                socket.emit('Answer', data)
            })
            peer.signal(offer)
        }

        function SignalAnswer(answer){
            client.gotAnswer = true
            var peer = client.peer
            peer.signal(answer)
        }

        function CreateVideo(stream){
            var vide = document.createElement('video')
            video.id = 'peerVideo'
            video.srcObejct = stream
            video.class = 'embed-responsive-item'
            document.querySelector('#peerDiv').appendChild(video)
        }

        function SessionActive(){
            document.write('busy, come back later')
        }

        socket.on('backoffer', FrontAnswer)
        socket.on('backanswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('createPeer', MakePeer)
    })
    .catch(err => document.write(err))