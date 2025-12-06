import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import { GetAllUser, getProfile } from "../services/AuthServices.js";
import { useNavigate } from "react-router-dom";
import Contact from "../components/Contact.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import { ToastContainer } from "react-toastify";
import Welcome from "./Welcome";
import MovieRoom from "@/components/MovieRoom.jsx";
import { getUnreadCounts,markMessageRead } from "@/services/MessageServices";
import { ScrollArea } from "@/components/ui/scroll-area";
function Chat() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [currentUser,setCurrentUser] = useState(undefined);
  const [isHost, setIsHost] = useState(false);
  const [incomingParty, setIncomingParty] = useState(null);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [isMovieMode, setIsMovieMode] = useState(false);
  const [unreadCounts,setUnreadCounts] = useState({});
  const [onlineUser,setOnlineUser]= useState([]);
  const [currentChat,setCurrentChat] = useState(undefined);
  const [isContactListVisible, setIsContactListVisible] = useState(true);
  const [contact,setContact] = useState([]);
  const [Profile,setProfile] = useState(undefined);
  const startMovieMode = () => {
        setIsHost(true);
        setIsMovieMode(true);
  };
  useEffect(()=>{
    const fetchUser =async()=>{
      if(!localStorage.getItem("chat-user")){
        navigate('/login');
        return;
      }
        const userData = await JSON.parse(localStorage.getItem("chat-user"));
        setCurrentUser(userData);
    }
    fetchUser();
  },[navigate]);
  useEffect(()=>{
    const getProfileUser = async()=>{
      const result = await getProfile();
      setProfile(result);
    }
    getProfileUser();
  },[]);
  useEffect(() => {
    if(socket) {
        socket.on("incoming-watch-party", (data) => {
            // Show popup
            setIncomingParty(data); 
            // Optional: Play a ringtone sound here! 🔔
        });
    }
  }, [socket]);
  const acceptParty = () => {
        setIsHost(false);
        setIsMovieMode(true);
        setIncomingParty(null);
    };
  useEffect(()=>{
    const fetchCount = async()=>{
      if(currentUser){
        const data = await getUnreadCounts();
        if(data.success){
          setUnreadCounts(data.counts);
        }
      }
    }
    fetchCount();
  },[currentUser])
  useEffect(() => {
    // Only run if we have a user AND a socket
    if (currentUser && socket) {
        socket.emit("add-user", currentUser._id);
    }
}, [currentUser, socket]);
useEffect(()=>{
  if(socket){
    socket.on("online-users",(users)=>{
      setOnlineUser(users);
    })
  }
})
  useEffect(()=>{
    const getAllUSer = async()=>{
      if(currentUser && currentUser._id){
        setLoadingContacts(true);
        const result = await GetAllUser();
        if(result.success && result.user){
          const filteredContacts = result.user.filter(
                    (user) => user._id !== currentUser._id
                );
          setContact(filteredContacts);
        }else{
          console.error("failed to fetch users",result.message);
        }
        setLoadingContacts(false);
      }
    }
      getAllUSer();
  },[currentUser]);
  console.log(loadingContacts);
  useEffect(()=>{
    if(socket){
      socket.on('msg-reciever',(data)=>{
        if(currentChat?._id !== data.from){
          setUnreadCounts((prev)=>({
            ...prev,[data.from]:(prev[data.from] || 0)+1
          }));
        }else{
          markMessageRead(data.from);
        }
      })
    }
  },[socket,currentChat]);
  const handleChatChange = async(chat) => {
        setCurrentChat(chat);
        setIsContactListVisible(false);
        if(unreadCounts[chat._id]>0){
          setUnreadCounts((prev)=>({...prev,[chat._id]:0}));
          await markMessageRead(chat._id);
          if(socket){
            socket.emit("mark-read",{
              senderId:chat._id,
              readerId:currentUser._id
            });
          }
        }
    };
  return (
    <div className="h-screen w-screen flex  flex-col justify-center items-center bg-slate-900 sm:p-4">
            <div className="w-full h-full  sm:w-[95vw] md:w-[80vw] lg:w-full bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
                {incomingParty && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 border-2 border-purple-500 p-6 rounded-xl shadow-2xl z-50 animate-bounce">
            <h3 className="text-white text-lg font-bold">
                🍿 {incomingParty.userName} started a Movie!
            </h3>
            <div className="flex gap-4 mt-4 justify-center">
                <button 
                    onClick={acceptParty}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
                >
                    Join Now
                </button>
                <button 
                    onClick={() => setIncomingParty(null)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700"
                >
                    Ignore
                </button>
            </div>
        </div>
    )}
                <div className="grid h-full w-full grid-cols-1 md:grid-cols-4">
                    <div 
                        className={`
                            h-full overflow-y-auto transition-transform duration-300
                            ${!isContactListVisible ? 'hidden sm:block' : 'block'} 
                            sm:w-full sm:col-span-1 
                            md:col-span-1
                        `}
                    >
                        {currentUser && contact.length > 0 ? (
                            <ScrollArea className="h-screen">
                              <Contact
                                contacts={contact} 
                                currentUser={currentUser}
                                changeChat={handleChatChange}
                                onlineUsers ={onlineUser}
                                socket={socket}
                                unreadCounts={unreadCounts}
                                profile={Profile}
                            />
                            </ScrollArea>
                        ) : (
                             // Loading or No Contacts Message
                             <div className="p-4 text-center text-gray-500">Loading contacts...</div>
                        )}
                    </div>

                    {/* 2. CHAT WINDOW / WELCOME SCREEN */}
                    <div
                    className={`
                      h-full transition-transform duration-300 
                      ${isContactListVisible ? 'hidden sm:block' : 'block'} 
                      sm:w-full sm:col-span-1 
                      md:col-span-3
                    `}
                  >
                    {currentChat === undefined ? (
                      <Welcome currentUser={currentUser} />
                    ) : (
                      isMovieMode ? (
                        <MovieRoom 
                          currentUser={currentUser}
                        currentChat={currentChat}
                        exitMovieMode={() => setIsMovieMode(false)}
                        isHost={isHost}
                        />
                      ) : (
                        <ScrollArea className="h-screen">
                          <ChatContainer
                            currentChat={currentChat}
                            currentUser={currentUser}
                            onlineUsers={onlineUser} // make sure this prop name & variable are correct
                            onBack={() => setIsContactListVisible(true)}
                            onStartMovie={() => setIsMovieMode(true)}
                          />
                        </ScrollArea>
                      )
                    )}
                  </div>

                </div>
            </div>
            <ToastContainer position="bottom-right" theme="dark" />
        </div>
  );
}
export default Chat;