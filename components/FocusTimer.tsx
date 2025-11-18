import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, History } from 'lucide-react';

interface FocusTimerProps {
  onSessionComplete: (minutes: number) => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const stopTimer = () => {
    if (seconds > 60) { // Only log if > 1 minute
      const minutes = Math.floor(seconds / 60);
      onSessionComplete(minutes);
      alert(`Good job! You focused for ${minutes} minutes.`);
    }
    setIsActive(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Deep Focus</h2>
      
      <div className="relative mb-12">
        {/* Decorative circles */}
        <div className={`absolute inset-0 bg-lavender-300 rounded-full blur-2xl opacity-20 transition-all duration-1000 ${isActive ? 'scale-150' : 'scale-100'}`}></div>
        
        <div className="w-64 h-64 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-lavender-50 relative z-10">
            <span className="text-6xl font-light text-gray-700 tabular-nums tracking-tight">
                {formatTime(seconds)}
            </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {!isActive && seconds === 0 ? (
            <button 
                onClick={toggleTimer}
                className="bg-lavender-600 hover:bg-lavender-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-lavender-200 transition-all hover:scale-105"
            >
                <Play size={32} className="ml-1"/>
            </button>
        ) : (
            <>
                <button 
                    onClick={toggleTimer}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all ${isActive ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}
                >
                    {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1"/>}
                </button>
                
                <button 
                    onClick={stopTimer}
                    className="bg-red-100 hover:bg-red-200 text-red-500 w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all"
                >
                    <Square size={24} fill="currentColor" />
                </button>
            </>
        )}
      </div>
      
      <p className="mt-8 text-gray-400 text-sm font-medium">
        {isActive ? "Stay focused. You got this!" : "Ready to start a session?"}
      </p>
    </div>
  );
};

export default FocusTimer;