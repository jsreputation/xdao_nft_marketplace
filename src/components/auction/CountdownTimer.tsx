'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, isEnded: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (timeRemaining.isEnded) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-center">
        <p className="text-red-300 font-semibold">Auction Ended</p>
      </div>
    );
  }

  return (
    <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg p-4">
      <p className="text-sm text-gray-300 mb-2 text-center font-medium">Time Remaining</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-2xl font-bold text-primary-400">{timeRemaining.days}</p>
          <p className="text-xs text-gray-400">Days</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary-400">{timeRemaining.hours}</p>
          <p className="text-xs text-gray-400">Hours</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary-400">{timeRemaining.minutes}</p>
          <p className="text-xs text-gray-400">Minutes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary-400">{timeRemaining.seconds}</p>
          <p className="text-xs text-gray-400">Seconds</p>
        </div>
      </div>
    </div>
  );
}

