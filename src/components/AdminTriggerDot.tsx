import React, { useRef, useCallback } from 'react';

interface AdminTriggerDotProps {
  isAdminActive: boolean;
  onOpenAdmin: () => void;
}

export const AdminTriggerDot: React.FC<AdminTriggerDotProps> = ({
  isAdminActive,
  onOpenAdmin,
}) => {
  const clickTimestampsRef = useRef<number[]>([]);

  const handleClick = useCallback(() => {
    const now = Date.now();
    // Keep only clicks within the last 3000ms (3 seconds)
    const recentClicks = [...clickTimestampsRef.current, now].filter(
      (time) => now - time <= 3000
    );
    clickTimestampsRef.current = recentClicks;

    // If active admin, single click opens it; otherwise, requires 5 rapid clicks in 3 seconds
    if (isAdminActive || recentClicks.length >= 5) {
      clickTimestampsRef.current = [];
      onOpenAdmin();
    }
  }, [isAdminActive, onOpenAdmin]);

  return (
    <div
      id="admin-secret-trigger"
      className="fixed bottom-3 left-3 z-50 flex items-center select-none"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="Admin Access"
        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
          isAdminActive
            ? 'bg-rose-500 hover:bg-rose-400 ring-2 ring-rose-400 ring-offset-1 ring-offset-[#171A1C] shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-110'
            : 'bg-rose-600/60 hover:bg-rose-500/80 hover:scale-125 opacity-40 hover:opacity-90'
        }`}
        style={{
          padding: 0,
          border: 'none',
        }}
      />
    </div>
  );
};
