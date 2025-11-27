import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import { GetAllUser } from "../services/AuthServices.js";
import { useNavigate } from "react-router-dom";
import Contact from "../components/Contact.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import { ToastContainer } from "react-toastify";
function Chat() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [currentUser,setCurrentUser] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [currentChat,setCurrentChat] = useState(undefined);
  const [isContactListVisible, setIsContactListVisible] = useState(true);
  const [contact,setContact] = useState([]);
  useEffect(()=>{
    const fetchUser =async()=>{
      if(!localStorage.getItem("chat-user")){
        navigate('/login');
        return;
      }
        const userData = await JSON.parse(localStorage.getItem("chat-user"));
        setCurrentUser(userData);
        if(socket){
          socket.connect();
          socket.emit("add-user",userData._id);
        }
      
    }
    fetchUser();
  },[socket,navigate])
  useEffect(()=>{
    const getAllUSer = async()=>{
      if(currentUser && currentUser._id){
        setLoadingContacts(true);
        const result = await GetAllUser();
        if(result.success && result.user){
          setContact(result.user)
        }else{
          console.error("failed to fetch users",result.message);
        }
        setLoadingContacts(false);
      }
    }
      getAllUSer();
  },[currentUser]);
  console.log(loadingContacts);
  const handleChatChange = (chat) => {
        setCurrentChat(chat);
        setIsContactListVisible(false);
    };
  console.log("currentuser",currentUser);
  console.log("allContact",contact);
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-900 sm:p-4">
            <div className="w-full h-full sm:h-[90vh] sm:max-h-[800px] sm:w-[95vw] md:w-[80vw] lg:w-full bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
                
                {/* Main Grid: Contacts (25%) | Chat Window (75%) */}
                <div className="grid h-full w-full grid-cols-1 md:grid-cols-4">

                    {/* 1. CONTACTS LIST (Sidebar) */}
                    <div 
                        className={`
                            h-full overflow-y-auto transition-transform duration-300
                            ${!isContactListVisible ? 'hidden sm:block' : 'block'} 
                            sm:w-full sm:col-span-1 
                            md:col-span-1
                        `}
                    >
                        {currentUser && contact.length > 0 ? (
                            <Contact
                                contacts={contact} 
                                currentUser={currentUser}
                                changeChat={handleChatChange}
                            />
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
                          <div>please login</div>
                        ) : (
                            <ChatContainer 
                                currentChat={currentChat} 
                                currentUser={currentUser} 
                                // Prop for mobile back button
                                onBack={() => setIsContactListVisible(true)} 
                            />
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer position="bottom-right" theme="dark" />
        </div>
  );
}
export default Chat;