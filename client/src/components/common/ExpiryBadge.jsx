import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export default function ExpiryBadge({ usableUntil, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const remainingMs = new Date(usableUntil).getTime() - Date.now();
      setTimeLeft(Math.floor(remainingMs / (1000 * 60)));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 30000); // Update every 30s
    return () => clearInterval(timer);
  }, [usableUntil]);

  const formatDisplay = (mins) => {
    if (mins <= 0) return 'Expired';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m}m left`;
    return `${m}m left`;
  };

  if (timeLeft <= 0) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-slate-500" />
        Expired
      </span>
    );
  }

  if (timeLeft < 30) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 animate-pulse border border-red-200 ${className}`}>
        <Flame className="w-3.5 h-3.5 mr-1 text-red-600" />
        CRITICAL: {formatDisplay(timeLeft)}
      </span>
    );
  }

  if (timeLeft <= 120) {
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
        WARNING: {formatDisplay(timeLeft)}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
      SAFE: {formatDisplay(timeLeft)}
    </span>
  );
}
