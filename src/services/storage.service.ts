/**
 * Storage Service
 * Handles persistence of tracking data to Local Storage
 * Can be extended to Supabase for cloud sync
 */

import type { CourierDistribution, MonthlyStats, Tracking } from '../domain/types';

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'package-stalker-trackings';

// ============================================
// Storage Interface (Repository Pattern)
// ============================================

export interface IStorageService {
  saveTracking(tracking: Tracking): Promise<void>;
  getTrackings(): Promise<Tracking[]>;
  getTrackingById(id: string): Promise<Tracking | null>;
  deleteTracking(id: string): Promise<void>;
  updateTracking(tracking: Tracking): Promise<void>;
}

// ============================================
// Local Storage Implementation
// ============================================

export class LocalStorageService implements IStorageService {
  async saveTracking(tracking: Tracking): Promise<void> {
    const trackings = await this.getTrackings();
    
    // Check for duplicate tracking number
    const existingIndex = trackings.findIndex(
      (t) => t.trackingNumber === tracking.trackingNumber
    );
    
    if (existingIndex >= 0) {
      // Update existing
      trackings[existingIndex] = tracking;
    } else {
      // Add new
      trackings.push(tracking);
    }
    
    this.persist(trackings);
  }

  async getTrackings(): Promise<Tracking[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      // Rehydrate dates
      return parsed.map(this.rehydrateTracking);
    } catch (error) {
      console.error('Failed to load trackings from storage:', error);
      return [];
    }
  }

  async getTrackingById(id: string): Promise<Tracking | null> {
    const trackings = await this.getTrackings();
    return trackings.find((t) => t.id === id) || null;
  }

  async deleteTracking(id: string): Promise<void> {
    const trackings = await this.getTrackings();
    const filtered = trackings.filter((t) => t.id !== id);
    this.persist(filtered);
  }

  async updateTracking(tracking: Tracking): Promise<void> {
    const trackings = await this.getTrackings();
    const index = trackings.findIndex((t) => t.id === tracking.id);
    
    if (index < 0) {
      throw new Error(`Tracking not found: ${tracking.id}`);
    }
    
    trackings[index] = tracking;
    this.persist(trackings);
  }

  // ============================================
  // Private Helpers
  // ============================================

  private persist(trackings: Tracking[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackings));
  }

  private rehydrateTracking(data: Record<string, unknown>): Tracking {
    const events = (data.events as Array<Record<string, unknown>>).map((e) => ({
      timestamp: new Date(e.timestamp as string),
      location: e.location as string,
      description: e.description as string,
      status: e.status as Tracking['status'],
    }));

    return {
      id: data.id as string,
      trackingNumber: data.trackingNumber as string,
      nickname: data.nickname as string,
      carrier: data.carrier as Tracking['carrier'],
      status: data.status as Tracking['status'],
      events,
      estimatedDelivery: data.estimatedDelivery 
        ? new Date(data.estimatedDelivery as string) 
        : undefined,
      createdAt: new Date(data.createdAt as string),
      updatedAt: new Date(data.updatedAt as string),
    };
  }
}

// ============================================
// Analytics Service
// ============================================

export class AnalyticsService {
  private readonly storage: IStorageService;

  constructor(storage: IStorageService) {
    this.storage = storage;
  }

  async getMonthlyStats(month?: string): Promise<MonthlyStats> {
    const trackings = await this.storage.getTrackings();
    const targetMonth = month || this.getCurrentMonth();
    
    const monthlyTrackings = trackings.filter((t) => 
      this.formatMonth(t.createdAt) === targetMonth
    );

    return {
      month: targetMonth,
      totalPackages: monthlyTrackings.length,
      delivered: monthlyTrackings.filter((t) => t.status === 'delivered').length,
      inTransit: monthlyTrackings.filter((t) => 
        ['in_transit', 'out_for_delivery'].includes(t.status)
      ).length,
    };
  }

  async getCourierDistribution(): Promise<CourierDistribution[]> {
    const trackings = await this.storage.getTrackings();
    
    if (trackings.length === 0) return [];

    // Count by carrier and track transit days
    const counts = new Map<string, { 
      name: string; 
      count: number;
      totalTransitDays: number;
      deliveredCount: number;
    }>();
    
    for (const tracking of trackings) {
      const existing = counts.get(tracking.carrier.code);
      const transitDays = tracking.transitDays || 0;
      const isDelivered = tracking.status === 'delivered';
      
      if (existing) {
        existing.count++;
        if (isDelivered && transitDays > 0) {
          existing.totalTransitDays += transitDays;
          existing.deliveredCount++;
        }
      } else {
        counts.set(tracking.carrier.code, {
          name: tracking.carrier.name,
          count: 1,
          totalTransitDays: (isDelivered && transitDays > 0) ? transitDays : 0,
          deliveredCount: (isDelivered && transitDays > 0) ? 1 : 0,
        });
      }
    }

    // Calculate percentages and averages
    const total = trackings.length;
    return Array.from(counts.entries()).map(([code, data]) => ({
      carrierCode: code,
      carrierName: data.name,
      count: data.count,
      percentage: Math.round((data.count / total) * 100),
      avgTransitDays: data.deliveredCount > 0 
        ? Math.round(data.totalTransitDays / data.deliveredCount)
        : undefined,
    }));
  }

  async getTotalPackagesThisMonth(): Promise<number> {
    const stats = await this.getMonthlyStats();
    return stats.totalPackages;
  }

  // ============================================
  // Private Helpers
  // ============================================

  private getCurrentMonth(): string {
    return this.formatMonth(new Date());
  }

  private formatMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}

// ============================================
// Service Factory
// ============================================

let storageInstance: LocalStorageService | null = null;
let analyticsInstance: AnalyticsService | null = null;

export function getStorageService(): IStorageService {
  if (!storageInstance) {
    storageInstance = new LocalStorageService();
  }
  return storageInstance;
}

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsService(getStorageService());
  }
  return analyticsInstance;
}
