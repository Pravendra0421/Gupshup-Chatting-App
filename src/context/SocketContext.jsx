import React, {createContext,useContext,useEffect,useState,useMemo} from "react";
import io from 'socket.io-client';

const baseURL = import.meta.env.VITE_BASE_URL;
const SocketContext = createContext(null);
export const SocketProvider =({children}) =>{
    const [socket,setSocket] = useState(null);
    useEffect(()=>{
        const user = JSON.parse(localStorage.getItem("chat-user"));
        if(user){
            const newSocket = io(`${baseURL}`,{
                withCredentials:true,
                autoConnect:true
            });
            setSocket(newSocket);
            return ()=>newSocket.disconnect();
        }
    },[]);
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
};
export const useSocket = () => {
  return useContext(SocketContext);
};