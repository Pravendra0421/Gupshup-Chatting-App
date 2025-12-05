import React, { useState, useEffect, useRef } from "react";
import { GetMessageServices,sendMessageServices,markMessageRead } from "../services/MessageServices";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "../context/SocketContext";
import { IoCheckmarkDone,IoCheckmark } from "react-icons/io5";
const ChatContainer =({currentChat,onBack,currentUser,onlineUsers=[]})=>{
    // const [message,setMessage] = useState([]);
    // State to hold the text the user is typing
    const [isTyping,setIsTyping]=useState(false);
    const [messages, setMessages] = useState([]); 
    const [msg, setMsg] = useState("");
    const scrollRef = useRef();
    const socket = useSocket();
    const [arrivalMessage,setArrivalMessage] =useState(null);
    const typingTimeoutRef = useRef(null);
    useEffect(()=>{
        if(socket){
            socket.on("typing",(senderId)=>{
                if(currentChat && currentChat._id === senderId){
                    setIsTyping(true);
                }
            });
            socket.on("stop-typing",(senderId)=>{
                if(currentChat && currentChat._id === senderId){
                    setIsTyping(false);
                }
            });
        }
        return ()=>{
            if(socket){
                socket.off("typing");
                socket.off("stop-typing")
            }
        }
    },[socket,currentChat])
    const handleTyping =(e)=>{
        setMsg(e.target.value);
        if(socket){
            socket.emit("typing",{
                to:currentChat._id,
                from:currentUser._id
            });
            if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current =setTimeout(()=>{
                socket.emit("stop-typing",{
                    to:currentChat._id,
                    from:currentUser._id
                })
            },2000);
        }
    }
    useEffect(()=>{
        const fetchData = async()=>{
            if(currentChat){
                const response = await GetMessageServices({
                from:currentUser._id,
                to:currentChat._id
            });
            setMessages(response);
            }
        }
        fetchData();
    },[currentChat]);
    useEffect(() => {
        if (socket) {
            socket.on("message-read", (readerId) => {
                if (currentChat && currentChat._id === readerId) {
                    setMessages((prev) => 
                        prev.map((msg) => 
                            msg.fromSelf ? { ...msg, read: true } : msg
                        )
                    );
                }
            });
        }
        // Cleanup listener
        return () => {
            if (socket) socket.off("message-read");
        };
    }, [socket, currentChat]);
    const inOnline = onlineUsers.includes(currentChat._id);
    console.log(currentUser);
    console.log("messages",messages);
    console.log("msg",msg);
    const handleSendMsg=async(event)=>{
        event.preventDefault();
        if(msg.length>0){
            await sendMessageServices({
                from:currentUser._id,
                to:currentChat._id,
                message:msg
            });
            socket.emit("send-msg",{
                to:currentChat._id,
                from:currentUser._id,
                msg,
            })
            const newMsg = { 
                fromSelf: true, 
                message: msg, 
                read: false
            };
            
            setMessages((prev) => [...prev, newMsg]);
            setMsg("");
        }
    };
    useEffect(() => {
        if (socket) {
            const handleMessage = async (data) => {
                const incomingText = typeof data === 'object' ? data.message : data;
                const senderId = data.from; // We need to know who sent it

                // 1. Add to my list
                setArrivalMessage({ 
                    fromSelf: false, 
                    message: incomingText,
                    read: false 
                });
                if (currentChat && currentChat._id === senderId) {
                    await markMessageRead(senderId);
                    socket.emit("mark-read", {
                        senderId: senderId,
                        readerId: currentUser._id
                    });
                }
            };

            socket.on("msg-recieve", handleMessage);

            return () => {
                socket.off("msg-recieve", handleMessage);
            };
        }
    }, [socket, currentChat])
    useEffect(()=>{
        arrivalMessage && setMessages((prev)=>[...prev,arrivalMessage]);
    },[arrivalMessage]);
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    if (!currentChat) {
        return <div className="text-white p-10">Loading chat...</div>;
    }
    return(
        <div className="flex flex-col  bg-slate-900 h-screen text-white">
            <div className="absolute w-full flex items-center p-4 border-b border-slate-700 bg-slate-800">
                <button 
                    onClick={onBack} 
                    className="md:hidden text-teal-400 p-2 mr-2 hover:text-teal-300 rounded-full"
                    title="Back to Contacts"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                </button>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0">
                        <img 
                            src={`data:image/svg+xml;base64,${currentChat.avatarImage}`} 
                            alt="avatar" 
                            className="rounded-full h-full w-full object-cover"
                        />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{currentChat.userName}</h3>
                </div>
                {/* More options (Future: Video call, Logout) */}
            </div>
            {/* 3. Message Area (Scrollable History) */}
            <div className="grow p-4 overflow-y-auto  space-y-2 custom-scrollbar mb-20 mt-18">
                {messages.map((message) => {
                    return (
                        <div ref={scrollRef} key={uuidv4()}>
                            <div className={`flex ${message.fromSelf ? "justify-end" : "justify-start"}`}>
                                <div className={`
                                    max-w-[40%] wrap-break-words p-3 rounded-xl text-sm md:text-base
                                    ${message.fromSelf 
                                        ? "bg-teal-600 text-white rounded-br-none" // My Message Style
                                        : "bg-slate-700 text-white rounded-bl-none" // Their Message Style
                                    }
                                `}>
                                    <p>{message.message}</p>
                                    {message.fromSelf && (
                                        <span className={`text-xs flex items-end mb-1 ${message.read ? "text-blue-300" : "text-gray-300"}`}>
                                            <IoCheckmarkDone size={16} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {inOnline &&(
                <div className="absolute bottom-[80px] left-6 flex items-center gap-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <img 
                src={`data:image/svg+xml;base64,${currentChat.avatarImage}`} 
                alt="typing..." 
                className="h-8 w-8 rounded-full border-2 border-slate-700 shadow-lg"
            />
        </div>
            )}
    {isTyping && (
        <div className="absolute bottom-[80px] left-6 flex items-center gap-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <img 
                src={`data:image/svg+xml;base64,${currentChat.avatarImage}`} 
                alt="typing..." 
                className="h-8 w-8 rounded-full border-2 border-slate-700 shadow-lg"
            />
            <div className="bg-slate-700 px-4 py-2 rounded-2xl rounded-bl-none shadow-lg flex items-center gap-1">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    )}
            {/* 4. Input Footer */}
            <form onSubmit={handleSendMsg} className=" absolute w-full bottom-0 flex p-4 bg-slate-800 border-t border-slate-700">
                <input 
                    type="text"
                    placeholder="Type your message..."
                    value={msg}
                    onChange={handleTyping}
                    className="grow p-3 rounded-full bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-teal-400"
                />
                <button 
                    type="submit" 
                    className="ml-3 p-3 rounded-full bg-teal-600 hover:bg-teal-700 transition-colors disabled:opacity-50"
                    disabled={!msg.trim()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
            </form>
        </div>
    )
}
export default ChatContainer;