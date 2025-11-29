import React, { useState, useEffect, useRef } from "react";
import { GetMessageServices,sendMessageServices } from "../services/MessageServices";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "../context/SocketContext";
const ChatContainer =({currentChat,onBack,currentUser})=>{
    // const [message,setMessage] = useState([]);
    // State to hold the text the user is typing
    const [messages, setMessages] = useState([]); 
    const [msg, setMsg] = useState("");
    const scrollRef = useRef();
    const socket = useSocket();
    const [arrivalMessage,setArrivalMesaage] =useState(null);
    console.log("current user",currentUser._id);
    console.log("current chat",currentChat._id);
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
            const msgs = [...messages];
            msgs.push({ fromSelf: true, message: msg });
            setMessages(msgs);
            setMsg("");
        }
    };
    useEffect(()=>{
        if(socket){
            socket.on("msg-recieve",(data)=>{
                console.log("🔥 INCOMING DATA TYPE:", typeof data);
                console.log("🔥 INCOMING DATA:", data);
                const incomingText = typeof data === 'object' ? data.message:data;
                setArrivalMesaage({fromSelf:false,message:incomingText})
            });
        }
    },[socket]);
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
        <div className="flex flex-col h-full bg-slate-900 text-white">
            <div className="flex items-center p-4 border-b border-slate-700 bg-slate-800">
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
            <div className="grow p-4 overflow-y-auto space-y-2 custom-scrollbar">
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
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* 4. Input Footer */}
            <form onSubmit={handleSendMsg} className="flex p-4 bg-slate-800 border-t border-slate-700">
                <input 
                    type="text"
                    placeholder="Type your message..."
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="grow p-3 rounded-full bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-teal-400"
                />
                <button 
                    type="submit" 
                    className="ml-3 p-3 rounded-full bg-teal-600 hover:bg-teal-700 transition-colors disabled:opacity-50"
                    disabled={!msg.trim()}
                >
                    {/* Send Icon (Replace with actual icon library later) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
            </form>
        </div>
    )
}
export default ChatContainer;