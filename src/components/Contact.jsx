import React,{useState,useEffect} from "react";
import { Logout } from "@/services/AuthServices";
import { Link, useNavigate } from "react-router-dom";
const Contact =({contacts,currentUser,changeChat,onlineUsers=[],socket,unreadCounts={},profile})=>{
    const [currentUserName,setCurrentUserName] = useState(undefined);
    const [currentUserImage,setCurrentUserImage] = useState(undefined);
    const [currentSelected,setcurrentSelected] = useState(undefined);
    console.log("unread counts",unreadCounts)
    console.log("profile",profile);
    console.log("contact",contacts);
    const navigate = useNavigate();
    useEffect(()=>{
        if(currentUser && currentUser.userName && currentUser.avatarImage){
            setCurrentUserName(currentUser.userName);
            setCurrentUserImage(currentUser.avatarImage );
        }
    },[currentUser]);
    const changeCurrentChat =(index,contact)=>{
        setcurrentSelected(index);
        changeChat(contact);
    }
    const handleLogout =async()=>{
        await Logout();
        if(socket.current){
            socket.current.emit("logout",currentUser._id);
        }
        localStorage.clear();
        navigate("/login");
    }
    console.log("current username",currentUser.userName);
    const currentname = currentUser.userName;
    return(
        <>
            <div className="flex flex-col h-full bg-slate-800 text-white border-r border-slate-700">
                <div className="flex items-center justify-center p-5 bg-slate-900 border-b border-slate-700">
                <h1 className="text-2xl font-bold tracking-widest text-teal-400 uppercase">
                    GupShup
                </h1>
                </div>
                <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {contacts.map((contact,index)=>{
                        const isSelected = index === currentSelected;
                        const isOnline =onlineUsers.includes(contact._id);
                        console.log("isOnline",isOnline);
                        return(
                            <div
                                    key={contact._id}
                                    className={`
                                flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300
                                ${isSelected ? "bg-teal-600 shadow-lg" : "bg-slate-700 hover:bg-slate-600"}
                            `}
                                    onClick={() => changeCurrentChat(index, contact)}
                                >
                                    <div className="relative h-12 w-12 flex-shrink-0">
                                        <img 
                                            src={contact.avatarImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt="avatar" 
                                            className="rounded-full h-full w-full object-cover border-2 border-teal-400"
                                        />
                                        {unreadCounts[contact._id]>0 &&(
                                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-slate-800">{unreadCounts[contact._id]}</div>
                                        )}
                                        {isOnline && (
                                            <span className="absolute left-10  h-3 w-3 rounded-full bg-green-500 border-2 border-slate-800"></span>
                                        )}
                                    </div>
                                    <div className=" md:block overflow-hidden">
                                <h3 className="text-base font-medium truncate capitalize text-slate-100">
                                    {contact.userName}
                                </h3>
                            </div>
                            </div>
                        )
                    })}
                </div>
                
            {currentname && (
                <div className="absolute bottom-8 w-full p-4 bg-slate-900 border-t border-slate-700">
                    <div className="flex items-center justify-between bg-slate-800 rounded-xl p-3 shadow-md">
                        
                        <Link to="/profile" className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 flex-shrink-0">
                                <img
                                    src={profile.image}
                                    alt="User"
                                    className="rounded-full h-full w-full object-cover border border-teal-400"
                                />
                            </div>
                            <div className="hidden md:block truncate">
                                <h2 className="text-sm font-bold text-white capitalize truncate max-w-[100px]">
                                    {profile.name}
                                </h2>
                                <p className="text-xs text-teal-400">Online</p>
                            </div>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="p-2 bg-slate-700 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-300 group"
                            title="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 group-hover:text-white">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" x2="9" y1="12" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            </div>
        </>
    )
}
export default Contact;