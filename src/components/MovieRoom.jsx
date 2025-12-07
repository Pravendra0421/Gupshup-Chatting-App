import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { useSocket } from "../context/SocketContext";
import styled, { keyframes } from "styled-components";
import { IoMdMic, IoMdMicOff, IoMdExpand } from "react-icons/io";

// --- ANIMATION FOR FLOATING CHAT ---
const floatDown = keyframes`
  0% { transform: translateY(0); opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(400px); opacity: 0; }
`;

const FloatingMsg = styled.div`
  position: absolute;
  top: 50px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  animation: ${floatDown} 5s linear forwards;
  pointer-events: none;
  z-index: 100; 
`;

const MovieRoom = ({ currentUser, currentChat, exitMovieMode, isHost }) => {
    const socket = useSocket();
    
    // States
    const [stream, setStream] = useState(null); 
    const [receivingCall, setReceivingCall] = useState(false);
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [floatingMessages, setFloatingMessages] = useState([]);
    // Refs
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const containerRef = useRef();

    // --- 1. SOCKET LISTENERS & HANDSHAKE LOGIC ---
    useEffect(() => {
        if (!socket) return;

        // Define handlers separately to keep useEffect clean
        const handleViewerJoined = (viewerId) => {
            console.log("👀 Viewer joined! Starting Stream...",viewerId);
            initializeHostPeer(); 
        };

        const handleCallUser = (data) => {
            console.log("📞 Received Signal from Host");
            setReceivingCall(true);
            setCallerSignal(data.signal);
        };

        const handleCallAccepted = (signal) => {
            console.log("✅ Call Accepted by Viewer");
            setCallAccepted(true);
            connectionRef.current?.signal(signal);
        };

        const handleChatMsg = (data) => {
            const text = typeof data === 'object' ? data.message : data;
            addFloatingMessage(text);
        };

        // REGISTER LISTENERS
        socket.on("viewer-joined", handleViewerJoined);
        socket.on("call-user", handleCallUser);
        socket.on("call-accepted", handleCallAccepted);
        socket.on("msg-recieve", handleChatMsg);

        // TRIGGER INITIAL ACTION
        if (isHost) {
            // Host just waits...
        } else {
            // Viewer Logic: Wait a tiny bit to ensure listeners are active, then shout
            console.log("👋 Joining Party...");
            const timer = setTimeout(() => {
                if(socket.connected) {
                     socket.emit("party-joined", { 
                        to: currentChat._id, 
                        from: currentUser._id 
                    });
                }
            }, 1000); 
            return () => clearTimeout(timer);
        }

        // CLEANUP
        return () => {
            socket.off("viewer-joined", handleViewerJoined);
            socket.off("call-user", handleCallUser);
            socket.off("call-accepted", handleCallAccepted);
            socket.off("msg-recieve", handleChatMsg);
            
            if(connectionRef.current) connectionRef.current.destroy();
        };
    }, [socket, currentChat, isHost]); 

    // --- 2. HOST: INITIALIZE PEER (Send Offer) ---
    const initializeHostPeer = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true });
            const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

            const mixedStream = new MediaStream();
            screenStream.getTracks().forEach(track => mixedStream.addTrack(track));
            voiceStream.getTracks().forEach(track => mixedStream.addTrack(track));

            setStream(mixedStream);
            if(myVideo.current) myVideo.current.srcObject = mixedStream;

            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: mixedStream
            });

            peer.on("signal", (data) => {
                socket.emit("call-user", {
                    userToCall: currentChat._id,
                    signalData: data,
                    from: currentUser._id
                });
            });

            peer.on("stream", (remoteStream) => {
                if(userVideo.current) userVideo.current.srcObject = remoteStream;
            });
            peer.on("close", () => {
                console.log("Peer connection closed");
                socket.off("call-accepted"); // Listeners hatayein
            });

            peer.on("error", (err) => {
                console.error("Peer connection error:", err);
            });
            connectionRef.current = peer;

        } catch (err) {
            console.error("Stream Error:", err);
            exitMovieMode(); 
        }
    };

    // --- 3. VIEWER: ANSWER CALL (Send Answer) ---
    const answerCall = async () => {
        setCallAccepted(true);
        
        const viewerStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setStream(viewerStream); 

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: viewerStream
        });

        peer.on("signal", (data) => {
            socket.emit("answer-call", { signal: data, to: currentChat._id });
        });

        peer.on("stream", (hostStream) => {
            if(userVideo.current) userVideo.current.srcObject = hostStream;
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    // --- 4. UTILS ---
    const addFloatingMessage = (msg) => {
        const id = Date.now();
        setFloatingMessages((prev) => [...prev, { id, text: msg }]);
        setTimeout(() => setFloatingMessages((prev) => prev.filter(m => m.id !== id)), 5000);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const sendNotification = () => {
        console.log("📤 Sending Invite...");
        socket.emit("notify-watch-party", {
            to: currentChat._id,
            from: currentUser._id,
            userName: currentUser.userName
        });
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
            
            {/* --- VIDEO AREA --- */}
            <div className="w-full h-full relative flex items-center justify-center">
                
                {/* HOST VIEW */}
                {isHost && stream && (
                    <video ref={myVideo} muted autoPlay playsInline className="w-full h-full object-contain" />
                )}

                {/* VIEWER VIEW */}
                {!isHost && callAccepted && (
                    <video ref={userVideo} autoPlay playsInline className="w-full h-full object-contain" />
                )}

                {/* WAITING UI (Host) */}
                {isHost && !stream && (
                    <div className="text-center">
                        <h1 className="text-3xl text-white font-bold mb-4">Movie Night 🍿</h1>
                        <button onClick={sendNotification} className="bg-teal-600 px-6 py-3 rounded-full text-white font-bold hover:bg-teal-500 transition shadow-lg">
                            Invite Friend to Watch
                        </button>
                        <p className="text-gray-400 mt-4 animate-pulse">Waiting for them to join...</p>
                    </div>
                )}

                {/* INCOMING CALL UI (Viewer - The "Accept" Screen) */}
                {!isHost && receivingCall && !callAccepted && (
                    <div className="absolute z-50 bg-slate-800 p-6 rounded-xl shadow-2xl text-center border border-teal-500 animate-pulse">
                        <h2 className="text-xl text-white mb-4">Ready to Watch?</h2>
                        <button onClick={answerCall} className="bg-green-600 px-6 py-2 rounded-full text-white font-bold">
                            Join Stream
                        </button>
                    </div>
                )}

                {/* CONNECTING UI (Viewer - Before Signal) */}
                {!isHost && !receivingCall && !callAccepted && (
                    <div className="text-white text-xl animate-bounce">
                        Connecting to Party...
                    </div>
                )}

                {/* FLOATING MESSAGES */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {floatingMessages.map((msg) => (
                        <FloatingMsg key={msg.id} style={{ left: `${Math.random() * 60 + 20}%` }}>
                            {msg.text}
                        </FloatingMsg>
                    ))}
                </div>
            </div>

            {/* --- CONTROLS --- */}
            {(callAccepted || (isHost && stream)) && (
                <div className="absolute bottom-6 flex gap-4 bg-slate-900/80 p-3 rounded-2xl backdrop-blur-md z-50">
                    <button onClick={toggleFullScreen} className="text-white hover:text-teal-400 p-2">
                        <IoMdExpand size={24} />
                    </button>
                    <button 
                        onClick={() => {
                            if(stream) {
                                stream.getAudioTracks().forEach(track => track.enabled = !micOn);
                                setMicOn(!micOn);
                            }
                        }} 
                        className={`p-2 rounded-full ${micOn ? 'text-white' : 'text-red-500 bg-red-900/30'}`}
                    >
                        {micOn ? <IoMdMic size={24} /> : <IoMdMicOff size={24} />}
                    </button>
                    <button 
                        onClick={() => {
                            if(stream) stream.getTracks().forEach(track => track.stop());
                            exitMovieMode();
                        }} 
                        className="bg-red-600 text-white px-4 py-1 rounded-lg font-bold hover:bg-red-700"
                    >
                        Leave
                    </button>
                </div>
            )}
        </div>
    );
};

export default MovieRoom;