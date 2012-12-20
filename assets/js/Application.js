(function(window, undefined){

	var socketServerUrl = "ws://localhost:1337/";

	var start = document.getElementById('start');
	var mainVideo = document.getElementById('main-video');
	var mainVideoWidth = +mainVideo.getAttribute('width');
	var mainVideoHeight = +mainVideo.getAttribute('height');
	var mainCanvas = document.getElementById('main-canvas');
	var newRoom = document.getElementById("newRoom");
	var context = mainCanvas.getContext("2d");

	var videos = [];
	var rooms = [1,2,3,4,5];
	var PeerConnection = window.PeerConnection 
												|| window.webkitPeerConnection00 
												|| window.webkitRTCPeerConnection 
												|| window.mozRTCPeerConnection 
												|| window.msRTCPeerConnection;
	
	window.requestAnimationFrame = window.requestAnimationFrame 
												|| window.mozRequestAnimationFrame 
												|| window.webkitRequestAnimationFrame 
												|| window.msRequestAnimationFrame;

	var _cloneVideo = function(domElement, socketId) {
		var video = domElement;
		var clone = video.cloneNode(false);
		clone.id = "remote" + socketId;
		document.getElementById('videos').appendChild(clone);
		videos.push(clone);
		return clone;
	};

	var _removeVideo = function(socketId) {
		var video = document.getElementById('remote' + socketId);
		if (video) {
				videos.splice(videos.indexOf(video), 1);
				video.parentNode.removeChild(video);
		}
	};

	var _initFullScreen = function() { 
		var button = document.getElementById("fullscreen");
		button && button.addEventListener('click', function(event) {
			event.preventDefault();
			document.querySelector('#main-canvas').webkitRequestFullScreen();
		});
	};

	var _initNewRoom = function() {
		newRoom && newRoom.addEventListener('click', function(event) {
			_generateHash();	
			window.location.reload();
		})
	};

	var _generateHash = function(){
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var stringLength = 8;
		var randomstring = '';
		for (var i=0; i<stringLength; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}		
		window.location.hash = randomstring;
	};

	var _videoToCanvas = function() {
		mainVideo.addEventListener("play", _timerCallback, false);
	};

	var _timerCallback = function() {
		if (mainVideo.paused || mainVideo.ended) {
			return;
		}
		_drawVideo();
		setTimeout(_timerCallback, 0);
	};

	var _drawVideo = function() {
		context.drawImage(mainVideo, 0, 0, mainVideoWidth, mainVideoHeight);
	};

	var _init = function() {
		if(PeerConnection){
			rtc.createStream({"video": true, "audio": true}, function(stream) {
				mainVideo.src = URL.createObjectURL(stream);
				videos.push(mainVideo);
				rtc.attachStream(stream, 'main-video');
				_videoToCanvas();

				start.style.display = 'none';

			});
		}else {
			alert('PeerConnection was not found!');
		}

		var room = window.location.hash.slice(1);

		rtc.connect(socketServerUrl, room);

		rtc.on('add remote stream', function(stream, socketId) {
			console.log("ADDING REMOTE STREAM...");
			var clone = _cloneVideo(mainVideo, socketId);
			document.getElementById(clone.id).setAttribute("class", "");
			rtc.attachStream(stream, clone.id);
		});
		rtc.on('disconnect stream', function(data) {
				console.log('remove ' + data);
				_removeVideo(data);
		});
		_initFullScreen();
		_initNewRoom();
		_generateHash();
	};

	return (function(){
		start.addEventListener('click', function(event){
			event.preventDefault();
			_init();
		}, false);
	})();

})(this);