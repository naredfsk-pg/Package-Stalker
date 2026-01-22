/**
 * TrackingCard Component
 * Displays tracking information with progress bar and status
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, RefreshCw, MapPin, Clock } from 'lucide-react';
import type { Tracking } from '../domain/types';
import { STATUS_DISPLAY, STATUS_PROGRESS } from '../domain/types';
import { Timeline } from './Timeline';

interface TrackingCardProps {
  tracking: Tracking;
  onDelete?: (id: string) => void;
  onRefresh?: (id: string) => void;
}

export function TrackingCard({ tracking, onDelete, onRefresh }: TrackingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = STATUS_DISPLAY[tracking.status];
  const progress = STATUS_PROGRESS[tracking.status];

  const latestEvent = tracking.events[tracking.events.length - 1];

  return (
    <div className="glass-card p-5 transition-all duration-300 hover:border-[var(--color-glass-hover)] animate-[slide-up_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Carrier Logo + Info */}
        <div className="flex items-center gap-4">
          {/* Carrier Logo */}
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--color-glass)] text-2xl">
            {tracking.carrier.logo || '📦'}
          </div>

          {/* Info */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              {tracking.nickname}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-secondary)]">
              <span>{tracking.carrier.name}</span>
              <span>•</span>
              <span className="font-mono">{tracking.trackingNumber}</span>
              {tracking.transitDays !== undefined && tracking.transitDays > 0 && (
                <>
                  <span>•</span>
                  <span className="text-[var(--color-accent)]">
                    {tracking.transitDays} วัน
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-glass)] ${statusInfo.color}`}>
          <span>{statusInfo.emoji}</span>
          <span className="text-sm font-medium">{statusInfo.label}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="h-2 rounded-full bg-[var(--color-bg-dark)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
          <span>รับพัสดุ</span>
          <span>กำลังขนส่ง</span>
          <span>กำลังนำจ่าย</span>
          <span>จัดส่งแล้ว</span>
        </div>
      </div>

      {/* Latest Update */}
      {latestEvent && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-glass)] flex items-center gap-3">
          <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
          <span className="flex-1 text-sm text-[var(--color-text-secondary)]">
            {latestEvent.description}
            {latestEvent.location && ` - ${latestEvent.location}`}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(latestEvent.timestamp)}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={() => onRefresh(tracking.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีเฟรช</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(tracking.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-error)] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>ลบ</span>
            </button>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors"
        >
          <span>{isExpanded ? 'ซ่อน Timeline' : 'ดู Timeline'}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Timeline (Expandable) */}
      {isExpanded && tracking.events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-glass-border)]">
          <Timeline events={tracking.events} />
        </div>
      )}
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}
