import React,{useState,useEffect} from "react";
import { Navigate,useLocation } from "react-router-dom";
const AuthGuard =({children})=>{
    const [isAuthenticated,setAuthenticated] = useState(null);
    const location = useLocation();
    useEffect(()=>{
        const user= localStorage.getItem("chat-user");
        if(user){
            setAuthenticated(true);
        }else{
            setAuthenticated(false);
        }
    },[]);
    if(isAuthenticated === null){
        return <div className="h-screen w-full flex items-center justify-center">checking Auth...</div>
    }
    if (!isAuthenticated) {
        return (
            <Navigate 
                to='/login' 
                
                /* 1. STATE PROP (The "Bookmark"):
                     Why? We pass the current location (e.g., '/profile') to the Login page.
                     Example: User tries to open '/profile' -> redirected to '/login'.
                     After login, we check this state to send them back to '/profile' instead of Home.
                */
                state={{ from: location }} 
                
                /* 2. REPLACE PROP (The "History Fixer"):
                     Why? It replaces the current history entry instead of adding a new one.
                     Example: Without this, if user clicks 'Back' on Login page, 
                     they go back to Chat -> Guard blocks them -> Back to Login (Infinite Loop).
                     'replace' fixes this back-button bug.
                */
                replace 
            />
        );
    }
    return children;

}
export default AuthGuard;