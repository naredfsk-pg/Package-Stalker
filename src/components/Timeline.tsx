/**
 * Timeline Component
 * Displays tracking events in a vertical timeline
 */

import { MapPin, CheckCircle2, Truck, Package, AlertCircle } from 'lucide-react';
import type { DeliveryStatus, TrackingEvent } from '../domain/types';

interface TimelineProps {
  events: readonly TrackingEvent[];
}

export function Timeline({ events }: TimelineProps) {
  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="relative">
      {sortedEvents.map((event, index) => (
        <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Timeline Line */}
          {index !== sortedEvents.length - 1 && (
            <div className="absolute left-[15px] top-[30px] w-0.5 h-full bg-[var(--color-glass-border)]" />
          )}

          {/* Icon */}
          <div
            className={`
              relative z-10 flex items-center justify-center w-8 h-8 rounded-full
              ${getEventStyle(event.status).bg}
            `}
          >
            {getEventIcon(event.status)}
          </div>

          {/* Content */}
          <div className="flex-1 pt-0.5">
            <p className="text-[var(--color-text-primary)] font-medium">
              {event.description}
            </p>
            <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-muted)]">
              {event.location && (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatDateTime(event.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function getEventIcon(status: DeliveryStatus) {
  const iconClass = 'w-4 h-4';
  
  switch (status) {
    case 'delivered':
      return <CheckCircle2 className={`${iconClass} text-emerald-400`} />;
    case 'out_for_delivery':
      return <Truck className={`${iconClass} text-amber-400`} />;
    case 'in_transit':
      return <Package className={`${iconClass} text-cyan-400`} />;
    case 'exception':
    case 'failed_attempt':
      return <AlertCircle className={`${iconClass} text-red-400`} />;
    default:
      return <Package className={`${iconClass} text-slate-400`} />;
  }
}

function getEventStyle(status: DeliveryStatus): { bg: string } {
  switch (status) {
    case 'delivered':
      return { bg: 'bg-emerald-500/20' };
    case 'out_for_delivery':
      return { bg: 'bg-amber-500/20' };
    case 'in_transit':
      return { bg: 'bg-cyan-500/20' };
    case 'exception':
    case 'failed_attempt':
      return { bg: 'bg-red-500/20' };
    default:
      return { bg: 'bg-slate-500/20' };
  }
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
