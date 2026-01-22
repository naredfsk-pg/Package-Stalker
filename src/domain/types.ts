/**
 * Package Stalker - Domain Types
 * Core domain models for tracking packages
 */

// ============================================
// Delivery Status (Maps to Track123 statuses)
// ============================================

export type DeliveryStatus =
  | 'pending'           // Not yet picked up
  | 'info_received'     // Information received
  | 'in_transit'        // Package in transit
  | 'out_for_delivery'  // Out for delivery
  | 'delivered'         // Successfully delivered
  | 'exception'         // Delivery exception
  | 'failed_attempt'    // Failed delivery attempt
  | 'expired'           // Tracking expired
  | 'unknown';          // Unknown status

// ============================================
// Carrier Information
// ============================================

export interface Carrier {
  readonly code: string;
  readonly name: string;
  readonly logo?: string;
  readonly trackingUrl?: string;
}

// ============================================
// Tracking Event (Timeline Item)
// ============================================

export interface TrackingEvent {
  readonly timestamp: Date;
  readonly location: string;
  readonly description: string;
  readonly status: DeliveryStatus;
}

// ============================================
// Tracking (Main Entity)
// ============================================

export interface Tracking {
  readonly id: string;
  readonly trackingNumber: string;
  readonly nickname: string;
  readonly carrier: Carrier;
  readonly status: DeliveryStatus;
  readonly events: ReadonlyArray<TrackingEvent>;
  readonly estimatedDelivery?: Date;
  readonly transitDays?: number; // Days since order placed
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ============================================
// Factory Functions (Immutable Creation)
// ============================================

export function createTracking(params: {
  trackingNumber: string;
  nickname?: string;
  carrier: Carrier;
  status?: DeliveryStatus;
  events?: TrackingEvent[];
  transitDays?: number;
}): Tracking {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    trackingNumber: params.trackingNumber,
    nickname: params.nickname || params.trackingNumber,
    carrier: params.carrier,
    status: params.status || 'pending',
    events: params.events || [],
    transitDays: params.transitDays,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTracking(
  tracking: Tracking,
  updates: Partial<Pick<Tracking, 'nickname' | 'status' | 'events' | 'estimatedDelivery' | 'transitDays'>>
): Tracking {
  return {
    ...tracking,
    ...updates,
    updatedAt: new Date(),
  };
}

// ============================================
// Analytics Types
// ============================================

export interface MonthlyStats {
  readonly month: string; // YYYY-MM format
  readonly totalPackages: number;
  readonly delivered: number;
  readonly inTransit: number;
}

export interface CourierDistribution {
  readonly carrierCode: string;
  readonly carrierName: string;
  readonly count: number;
  readonly percentage: number;
  readonly avgTransitDays?: number; // Average delivery time
}

// ============================================
// Status Helpers
// ============================================

export const STATUS_DISPLAY: Record<DeliveryStatus, { label: string; emoji: string; color: string }> = {
  pending: { label: 'รอรับพัสดุ', emoji: '⏳', color: 'text-slate-400' },
  info_received: { label: 'ได้รับข้อมูล', emoji: '📝', color: 'text-blue-400' },
  in_transit: { label: 'กำลังขนส่ง', emoji: '🚚', color: 'text-cyan-400' },
  out_for_delivery: { label: 'กำลังนำจ่าย', emoji: '📦', color: 'text-amber-400' },
  delivered: { label: 'จัดส่งแล้ว', emoji: '✅', color: 'text-emerald-400' },
  exception: { label: 'มีปัญหา', emoji: '⚠️', color: 'text-red-400' },
  failed_attempt: { label: 'จัดส่งไม่สำเร็จ', emoji: '❌', color: 'text-orange-400' },
  expired: { label: 'หมดอายุ', emoji: '⏱️', color: 'text-slate-500' },
  unknown: { label: 'ไม่ทราบสถานะ', emoji: '❓', color: 'text-slate-500' },
};

export const STATUS_PROGRESS: Record<DeliveryStatus, number> = {
  pending: 0,
  info_received: 15,
  in_transit: 50,
  out_for_delivery: 80,
  delivered: 100,
  exception: 50,
  failed_attempt: 80,
  expired: 0,
  unknown: 0,
};
