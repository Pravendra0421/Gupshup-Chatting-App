import React,{useState,useEffect} from "react";
const Contact =({contacts,currentUser,changeChat})=>{
    const [currentUserName,setCurrentUserName] = useState(undefined);
    const [currentUserImage,setCurrentUserImage] = useState(undefined);
    const [currentSelected,setcurrentSelected] = useState(undefined);
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
    return(
        <>
            <div className="flex flex-col h-full bg-slate-800 text-white md:p-4">
                <div className="flex items-center justify-center p-4 border-b border-teal-700 bg-teal-600 md:bg-transparent">
                        <h1 className="text-2xl font-bold tracking-wider text-white">
                            GupShup
                        </h1>
                </div>
                <div>
                    {contacts.map((contact,index)=>{
                        const isSelected = index === currentSelected;
                        return(
                            <div
                                    key={contact._id}
                                    className={`
                                        flex items-center gap-3 p-3 mt-5 rounded-lg cursor-pointer transition-all duration-200
                                        ${isSelected ? "bg-teal-700 shadow-md scale-[1.01]" : "hover:bg-slate-700"}
                                    `}
                                    onClick={() => changeCurrentChat(index, contact)}
                                >
                                    <div className="h-10 w-10 shrink-0">
                                        <img 
                                            src={contact.avatarImage ? `data:image/svg+xml;base64,${contact.avatarImage}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt="avatar" 
                                            className="rounded-full h-full w-full object-cover border-2 border-teal-400"
                                        />
                                    </div>
                                    <div > 
                                        <h3 className="text-base font-semibold truncate">{contact.userName}</h3>
                                    </div>
                            </div>
                        )
                    })}
                </div>
                
            {currentUserName &&(
                <div className="flex items-center p-3 border-t border-slate-700 bg-slate-900 justify-between">
                    <div className="flex items-center gap-3"> 
                        <div className=" h-10 w-10">
                            <img 
                                    src={`data:image/svg+xml;base64,${currentUserImage}`} 
                                    alt="User Avatar"
                                    className="rounded-full h-full w-full object-cover border-2 border-teal-500"
                            />
                        </div>
                        <div className="hidden sm:block">
                                <h2 className="text-lg font-bold text-teal-400">{currentUserName}</h2>
                        </div>
                    </div>  
                    <button 
                            // onClick={handleLogout} // Future logout function
                            className="p-2 text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                            title="Logout"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        </button> 
                </div>
        )}
            </div>
        </>
    )
}
export default Contact;