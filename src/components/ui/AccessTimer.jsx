import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const AccessTimer = ({ expiryTime, onExpired, showIcon = true, showText = true }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiryTime) return;

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryTime).getTime();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        if (onExpired) {
          onExpired();
        }
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining({
        hours,
        minutes,
        seconds,
        totalMs: remaining,
        formatted: hours > 0 
          ? `${hours}h ${minutes}m ${seconds}s`
          : minutes > 0
          ? `${minutes}m ${seconds}s`
          : `${seconds}s`
      });
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiryTime, onExpired]);

  if (!expiryTime) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
        {showIcon && <AlertTriangle className="w-4 h-4" />}
        {showText && <span className="font-medium">Acceso expirado</span>}
      </div>
    );
  }

  if (!timeRemaining) {
    return null;
  }

  // Determine urgency level
  const isUrgent = timeRemaining.totalMs < 60 * 60 * 1000; // Less than 1 hour
  const isWarning = timeRemaining.totalMs < 3 * 60 * 60 * 1000; // Less than 3 hours

  const colorClasses = isUrgent 
    ? 'bg-red-100 border-red-300 text-red-800'
    : isWarning
    ? 'bg-amber-100 border-amber-300 text-amber-800'
    : 'bg-blue-100 border-blue-300 text-blue-800';

  return (
    <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${colorClasses}`}>
      {showIcon && <Clock className="w-4 h-4" />}
      {showText && (
        <span className="font-medium">
          {isUrgent ? 'Acceso expira en: ' : 'Tiempo restante: '}
          <span className="font-mono">{timeRemaining.formatted}</span>
        </span>
      )}
    </div>
  );
};

// Simple countdown display for inline use
export const InlineAccessTimer = ({ expiryTime, compact = false }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    if (!expiryTime) return;

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryTime).getTime();
      const remaining = expiry - now;

      if (remaining <= 0) {
        setTimeRemaining({ expired: true });
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({
        hours,
        minutes,
        totalMs: remaining,
        formatted: compact 
          ? (hours > 0 ? `${hours}h${minutes}m` : `${minutes}m`)
          : (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
      });
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiryTime, compact]);

  if (!expiryTime || !timeRemaining) {
    return null;
  }

  if (timeRemaining.expired) {
    return (
      <span className="text-xs text-red-600 font-medium">
        {compact ? 'Expirado' : 'Acceso expirado'}
      </span>
    );
  }

  const isUrgent = timeRemaining.totalMs < 60 * 60 * 1000; // Less than 1 hour
  const textColor = isUrgent ? 'text-red-600' : 'text-amber-600';

  return (
    <span className={`text-xs font-medium ${textColor}`}>
      {compact ? timeRemaining.formatted : `Expira en ${timeRemaining.formatted}`}
    </span>
  );
};

export default AccessTimer;