import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { useSocket } from "../context/SocketContext";
import styled, { keyframes } from "styled-components";
import { IoMdMic, IoMdMicOff, IoMdExpand, IoMdClose } from "react-icons/io";

// --- ANIMATION FOR FLOATING CHAT ---
const floatDown = keyframes`
  0% { transform: translateY(0); opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(400px); opacity: 0; }
`;

const FloatingMsg = styled.div`
  position: absolute;
  left: 20px; /* Or dynamic random left */
  top: 50px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  animation: ${floatDown} 5s linear forwards;
  pointer-events: none;
`;

const MovieRoom = ({ currentUser, currentChat, exitMovieMode }) => {
    const socket = useSocket();
    
    // States
    const [stream, setStream] = useState(null); // My Combined Stream
    const [receivingCall, setReceivingCall] = useState(false);
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [micOn, setMicOn] = useState(true);
    
    // Floating Chat Messages State
    const [floatingMessages, setFloatingMessages] = useState([]);

    // Refs
    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const containerRef = useRef();

    // --- 1. LISTEN FOR INCOMING CALLS ---
    useEffect(() => {
        if(socket){
            socket.on("call-user", (data) => {
                // Only accept if it's from the person I'm chatting with
                if(data.from === currentChat._id) {
                    setReceivingCall(true);
                    setCallerSignal(data.signal);
                }
            });

            // Listen for chat messages to float them
            socket.on("msg-recieve", (data) => {
                const text = typeof data === 'object' ? data.message : data;
                addFloatingMessage(text);
            });
        }
        // Cleanup handled by parent unmount usually
    }, [socket, currentChat]);

    const addFloatingMessage = (msg) => {
        const id = Date.now();
        setFloatingMessages((prev) => [...prev, { id, text: msg }]);
        // Cleanup message from array after 5 sec to save memory
        setTimeout(() => {
            setFloatingMessages((prev) => prev.filter(m => m.id !== id));
        }, 5000);
    };

    // --- 2. START HOSTING (Screen + Mic) ---
    const startHosting = async () => {
        try {
            // A. Get Screen (Video + System Audio)
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                video: { cursor: "always" }, 
                audio: true // User MUST tick "Share Tab Audio"
            });

            // B. Get Mic (Voice)
            const voiceStream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, video: false 
            });

            // C. Mix Streams
            const mixedStream = new MediaStream();
            mixedStream.addTrack(screenStream.getVideoTracks()[0]); // Video
            
            if(screenStream.getAudioTracks().length > 0)
                mixedStream.addTrack(screenStream.getAudioTracks()[0]); // Movie Audio
            
            if(voiceStream.getAudioTracks().length > 0)
                mixedStream.addTrack(voiceStream.getAudioTracks()[0]); // Mic Audio

            setStream(mixedStream);
            if(myVideo.current) myVideo.current.srcObject = mixedStream;
            socket.emit("notify-watch-party",{
                to:currentChat._id,
                from:currentChat._id,
                userName:currentChat.userName
            });
            // D. Initiate Peer Connection
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
                // If viewer speaks, we hear them here
                if(userVideo.current) userVideo.current.srcObject = remoteStream;
            });

            socket.on("call-accepted", (signal) => {
                setCallAccepted(true);
                peer.signal(signal);
            });

            connectionRef.current = peer;

        } catch (err) {
            console.error("Screen Share Failed:", err);
        }
    };

    // --- 3. JOIN WATCH PARTY (Viewer Logic) ---
    const joinWatchParty = async () => {
        setCallAccepted(true);
        
        // Viewer only sends Audio (Voice Chat)
        const viewerStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, video: false 
        });
        setStream(viewerStream); // Save reference to toggle mic later

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: viewerStream
        });

        peer.on("signal", (data) => {
            socket.emit("answer-call", { signal: data, to: currentChat._id });
        });

        peer.on("stream", (hostStream) => {
            // Show Host's Movie + Audio
            if(userVideo.current) userVideo.current.srcObject = hostStream;
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    // --- UTILS ---
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
            
            {/* --- VIDEO AREA --- */}
            <div className="w-full h-full relative flex items-center justify-center">
                
                {/* Case 1: I am Host (Show my own screen muted locally) */}
                {stream && !receivingCall && (
                    <video ref={myVideo} muted autoPlay playsInline className="w-full h-full object-contain" />
                )}

                {/* Case 2: I am Viewer (Show Host's stream) */}
                {callAccepted && !stream?.getVideoTracks().length && (
                    <video ref={userVideo} autoPlay playsInline className="w-full h-full object-contain" />
                )}

                {/* Case 3: Empty State */}
                {!stream && !callAccepted && !receivingCall && (
                    <div className="text-center">
                        <h1 className="text-3xl text-white font-bold mb-4">Movie Night 🍿</h1>
                        <p className="text-gray-400 mb-6">Share your screen and watch together.</p>
                        <button onClick={startHosting} className="bg-teal-600 px-6 py-3 rounded-full text-white font-bold hover:bg-teal-500 transition shadow-lg">
                            Start Sharing Screen
                        </button>
                    </div>
                )}

                {/* Case 4: Incoming Call UI */}
                {receivingCall && !callAccepted && (
                    <div className="absolute z-50 bg-slate-800 p-6 rounded-xl shadow-2xl text-center border border-teal-500 animate-pulse">
                        <h2 className="text-xl text-white mb-4">{currentChat.userName} started a Movie!</h2>
                        <button onClick={joinWatchParty} className="bg-green-600 px-6 py-2 rounded-full text-white font-bold">
                            Join Now
                        </button>
                    </div>
                )}

                {/* --- FLOATING CHAT OVERLAY --- */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {floatingMessages.map((msg) => (
                        <FloatingMsg key={msg.id} style={{ left: `${Math.random() * 80}%` }}>
                            {msg.text}
                        </FloatingMsg>
                    ))}
                </div>
            </div>

            {/* --- CONTROLS BAR (Shows on hover or bottom) --- */}
            {(stream || callAccepted) && (
                <div className="absolute bottom-6 flex gap-4 bg-slate-900/80 p-3 rounded-2xl backdrop-blur-md z-50">
                    <button onClick={toggleFullScreen} className="text-white hover:text-teal-400 p-2">
                        <IoMdExpand size={24} />
                    </button>
                    <button 
                        onClick={() => {
                            // Toggle Mic Logic
                            stream.getAudioTracks().forEach(track => track.enabled = !micOn);
                            setMicOn(!micOn);
                        }} 
                        className={`p-2 rounded-full ${micOn ? 'text-white' : 'text-red-500 bg-red-900/30'}`}
                    >
                        {micOn ? <IoMdMic size={24} /> : <IoMdMicOff size={24} />}
                    </button>
                    <button 
                        onClick={exitMovieMode} 
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