import React from "react";
// You can use a local file or this URL
// To use local: import Robot from "../assets/robot.gif"; 
const Robot = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbm95eGd4bm50bXJ5bXJ5bXJ5bXJ5bXJ5bXJ5bXJ5bXJ5bXJ5bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/LpW8pGJ70E2J0kQJ6Z/giphy.gif";

export default function Welcome({ currentUser }) {
  return (
    <div className="flex justify-center items-center flex-col h-screen text-white  bg-slate-900 text-center p-4">
      {/* 1. Animated Image */}
      <img 
        src={Robot} 
        alt="Welcome Robot" 
        className="h-60 transition-transform hover:scale-110 duration-300" 
      />
      
      {/* 2. Personalized Greeting */}
      <h1 className="text-3xl md:text-4xl font-bold mt-4">
        Welcome, <span className="text-teal-400 capitalize">{currentUser?.userName}!</span>
      </h1>
      
      {/* 3. Instruction Text */}
      <h3 className="text-gray-400 mt-2 text-lg md:text-xl">
        Please select a chat to start <span className="font-semibold text-white">GupShup</span>.
      </h3>
    </div>
  );
}