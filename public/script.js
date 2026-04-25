const socket = io();
const room = "sala1";

let localStream;
let peer;

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;

    socket.emit("join-room", room);
});

socket.on("user-connected", async () => {
    await createOffer();
});

socket.on("signal", async (data) => {
    if (data.offer) {
        await createAnswer(data.offer);
    }

    if (data.answer) {
        await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
    }

    if (data.candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
});

function createPeer() {
    peer = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
    });

    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
    });

    peer.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("signal", {
                room,
                data: { candidate: event.candidate }
            });
        }
    };
}

async function createOffer() {
    createPeer();

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("signal", {
        room,
        data: { offer }
    });
}

async function createAnswer(offer) {
    createPeer();

    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("signal", {
        room,
        data: { answer }
    });
}