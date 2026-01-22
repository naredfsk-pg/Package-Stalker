/**
 * TrackingBar Component
 * Universal Search Bar for entering tracking numbers
 * "Start Stalking" button with animations
 */

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Package } from 'lucide-react';

interface TrackingBarProps {
  onTrack: (trackingNumber: string) => Promise<void>;
  isLoading?: boolean;
}

export function TrackingBar({ onTrack, isLoading = false }: TrackingBarProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim() || isLoading) return;
    await onTrack(trackingNumber.trim());
    setTrackingNumber('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative flex items-center gap-3 p-2 pr-3
          glass-card transition-all duration-300
          ${isFocused ? 'ring-2 ring-[var(--color-primary)] shadow-[var(--shadow-glow)]' : ''}
        `}
      >
        {/* Search Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--color-glass)]">
          <Search className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="วางเลขพัสดุที่นี่... (Tracking Number)"
          className="
            flex-1 bg-transparent border-none outline-none
            text-lg text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
          "
          disabled={isLoading}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!trackingNumber.trim() || isLoading}
          className="
            flex items-center gap-2 px-6 py-3
            bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)]
            text-white font-semibold rounded-xl
            transition-all duration-300
            hover:shadow-[0_8px_25px_rgba(139,92,246,0.5)] hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
            disabled:hover:shadow-none
          "
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>กำลังติดตาม...</span>
            </>
          ) : (
            <>
              <Package className="w-5 h-5" />
              <span>Start Stalking</span>
            </>
          )}
        </button>
      </div>

      {/* Helper Text */}
      <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
        รองรับ Flash, Kerry, ไปรษณีย์ไทย, Shopee, Lazada และอื่นๆ
      </p>
    </form>
  );
}
