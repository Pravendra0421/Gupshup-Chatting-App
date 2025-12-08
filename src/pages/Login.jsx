import React from "react";
import { LoginApi } from "../services/AuthServices";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Important for toast styling
import { useNavigate, Link ,useLocation} from "react-router-dom";

// Assume you might have a logo later. For now, using text.
// import Logo from "../assets/gupshup-logo.svg"; 

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        userName: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    // Keep your validation logic same
    const handleValidation = () => {
        const { userName, password } = formData;
        if (userName === "") {
            toast.error("Username is required");
            return false;
        }
        if (password === "") {
            toast.error("Password is required");
            return false;
        }
        if (password.length < 6) {
            toast.error("Password length must be greater than 6 digits");
            return false;
        }
        return true;
    };

    const changeHandle = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (handleValidation()) { 
            try {
                setLoading(true);
                const response = await LoginApi(formData);
                if(response.success) {
                     toast.success("Welcome back to GupShup!");
                     localStorage.setItem("chat-user", JSON.stringify(response.user));
                    //  ✨ MAGIC LINE (Redirect Logic) ✨
                    // Check karo: Kya 'state' mein koi purana path hai?
                    // Agar HAAN: To wahan bhejo.
                    // Agar NAHI: To "/" (Home) bhejo.
                     const redirectPath =location.state?.from?.pathname || "/";
                     navigate(redirectPath,{replace:true})
                     setFormData({ userName: "", password: "" });
                }

            } catch (error) {
                console.log(error);
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error("Network error. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 px-4 sm:px-0">
            
            <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col gap-6">
                
                <div className="flex flex-col items-center gap-2 mb-4">
                    {/* <img src={Logo} alt="GupShup" className="h-12 w-12 mb-2" /> */}
                    <h1 className="text-4xl font-extrabold text-teal-600 tracking-tight">GupShup</h1>
                    <p className="text-gray-500 text-sm font-medium">Sign in to start chatting</p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={submitHandler}>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="userName">
                            Username
                        </label>
                        <input
                            className="w-full p-3.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all duration-200"
                            type="text"
                            placeholder="Enter your username"
                            name="userName"
                            value={formData.userName}
                            onChange={changeHandle}
                            id="userName"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full p-3.5 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all duration-200"
                            type="password"
                            placeholder="••••••••"
                            name="password"
                            value={formData.password}
                            onChange={changeHandle}
                            id="password"
                        />
                    </div>
                    
                    <div className="flex justify-end -mt-2">
                        <span className="text-sm font-medium text-teal-600 hover:text-teal-700 cursor-pointer transition-colors">
                            Forgot Password?
                        </span>
                    </div>
                    <button 
                        className={`w-full p-3.5 mt-2 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-md
                        ${loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:scale-[0.98]'}`}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Signing In...</span>
                            </div>
                        ) : (
                            "Start Chatting"
                        )}
                    </button>
                </form>
                <div className="text-center text-sm text-gray-600 font-medium mt-2">
                    Don't have an account? 
                    <Link to="/register" className="text-teal-600 font-bold ml-1 hover:underline">
                        Sign Up
                    </Link>
                </div>
            </div>
            
            <ToastContainer position="bottom-center" theme="colored" autoClose={3000} />
        </div>
    );
};

export default LoginPage;