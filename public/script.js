const socket = io('https://videocall-leo-app.onrender.com');

const roomId = "sala1";

let localStream;
let peer = null;

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

// 🔥 TURN REAL (Metered)
const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },

    {
      urls: "turn:global.relay.metered.ca:80",
      username: "61d4a6bce034ac7f28ff98ec",
      credential: "0IRoLqeviGPhgahb"
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "61d4a6bce034ac7f28ff98ec",
      credential: "0IRoLqeviGPhgahb"
    }
  ]
};

// 📷 cámara
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;

    socket.emit("join-room", roomId);
});

// 👤 otro usuario conectado
socket.on("user-connected", () => {
    createOffer();
});

// 📡 señal WebRTC (FIX DEFINITIVO)
socket.on("signal", async (data) => {

    createPeerIfNeeded();

    // OFFER
    if (data.offer) {
        if (peer.signalingState !== "stable") return;

        await peer.setRemoteDescription(data.offer);

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("signal", {
            roomId,
            data: { answer }
        });
    }

    // ANSWER
    if (data.answer) {
        if (peer.signalingState !== "have-local-offer") return;

        await peer.setRemoteDescription(data.answer);
    }

    // ICE
    if (data.candidate) {
        try {
            await peer.addIceCandidate(data.candidate);
        } catch (e) {
            console.log("ICE error", e);
        }
    }
});

// 🧠 crear peer solo una vez
function createPeerIfNeeded() {
    if (peer) return;

    peer = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
    });

    peer.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("signal", {
                roomId,
                data: { candidate: event.candidate }
            });
        }
    };
}

// 📤 offer
async function createOffer() {
    createPeerIfNeeded();

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("signal", {
        roomId,
        data: { offer }
    });
}