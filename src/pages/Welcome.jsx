import React from "react";
// You can use a local file or this URL
// To use local: import Robot from "../assets/robot.gif"; 
const Robot = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXp5YjJxMm9idXFud2MxNmx5eGNodnZyaTlrdnFiYXc5amh4NXRucSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26FPJGjhefSJuaRhu/giphy.gif";

export default function Welcome({ currentUser }) {
    
  return (
    <div className="flex justify-center items-center flex-col h-screen text-white  bg-slate-900 text-center p-4">
      {/* 1. Animated Image */}
      <img 
        src={Robot} 
        alt="Welcome Robot" 
        className="h-200 w-screen  transition-transform  duration-300" 
      />
      
      {/* 2. Personalized Greeting */}
      <h1 className="absolute text-3xl text-black md:text-4xl font-bold mt-4">
        Welcome, <span className="text-black capitalize">{currentUser?.userName}</span>
      </h1>
      
      {/* 3. Instruction Text */}
      <h3 className="absolute top-80 text-black  mt-2 text-lg md:text-xl">
        Please select a chat to start <span className="font-semibold text-red">GupShup</span>.
      </h3>
    </div>
  );
}