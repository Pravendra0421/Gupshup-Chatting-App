import axios from 'axios';
const baseURL = import.meta.env.VITE_BASE_URL;
const AxiosInit = axios.create({
    baseURL:`${baseURL}/api/v1/`,
    withCredentials:true,
    headers:{
        'Content-Type':'application/json'
    }
});
AxiosInit.interceptors.response.use(
    (response)=>{
        return response;
    },
    (error)=>{
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            // 🚨 SECURITY ALERT: Cookie has expired!
            console.log("Session Expired. Logging out...");
            
            // 1. Clear the fake "logged in" state
            localStorage.clear(); // Removes "chat-user"
            
            // 2. Force Redirect to Login
            // We use window.location because Navigate hook doesn't work inside non-component files
            window.location.href = "/login";
        }
        
        return Promise.reject(error);
    }
);
export default AxiosInit;