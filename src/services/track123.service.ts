/**
 * Track123 API Service
 * Handles all communication with Track123 Gateway API v2.1
 * Based on verified cURL examples from User
 */

import type { Carrier, DeliveryStatus, Tracking, TrackingEvent } from '../domain/types';
import { createTracking } from '../domain/types';

// ============================================
// Configuration
// ============================================

// Base URL points to the Gateway v2.1 API
const API_PATH = '/gateway/open-api/tk/v2.1';
const TRACK123_BASE_URL = import.meta.env.DEV 
  ? `/api/track123${API_PATH}`
  : `https://api.track123.com${API_PATH}`;

// ============================================
// Response Types (Gateway v2.1)
// ============================================

interface BaseResponse<T> {
  code: string; // "00000" is success
  msg?: string;
  data?: T;
}

interface CarrierData {
  courierCode: string;
  courierNameCN: string;
  courierNameEN: string;
  courierHomePage?: string;
}

interface TrackingDetail {
  eventTime: string;
  eventDetail: string;
  location?: string; // Implicitly part of eventDetail sometimes, or separate if available
  transitSubStatus?: string;
}

interface LocalLogisticsInfo {
  courierCode: string;
  courierNameEN: string;
  trackingDetails?: TrackingDetail[];
}

interface TrackingContent {
  trackNo: string;
  transitStatus: string; // "IN_TRANSIT", "DELIVERED", etc.
  transitDays?: number; // Days since order placed
  localLogisticsInfo?: LocalLogisticsInfo;
}

interface QueryResponseData {
  accepted?: {
    content?: TrackingContent[];
  };
}

// ============================================
// Status Mapping
// ============================================

const mapTrack123Status = (status: string | undefined): DeliveryStatus => {
  if (!status) return 'pending';
  
  const statusMap: Record<string, DeliveryStatus> = {
    'PENDING': 'pending',
    'NO_FOUND': 'pending', 
    'INFO_RECEIVED': 'info_received',
    'IN_TRANSIT': 'in_transit',
    'OUT_FOR_DELIVERY': 'out_for_delivery',
    'DELIVERED': 'delivered',
    'EXCEPTION': 'exception',
    'FAILED_ATTEMPT': 'failed_attempt',
    'EXPIRED': 'expired',
  };
  return statusMap[status.toUpperCase()] || 'unknown';
};

// ============================================
// Service Implementation
// ============================================

export class Track123Service {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Track123 API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Register a new tracking (Import)
   * Endpoint: /track/import
   */
  async registerTracking(trackingNumber: string): Promise<void> {
    console.log(`[Track123] 📝 Registering tracking: ${trackingNumber}`);
    // Note: User cURL for import used /v2/ but query used /v2.1/. 
    // We will try v2.1 for consistency first.
    // Ensure we send array of objects
    const response = await this.request<BaseResponse<any>>('/track/import', {
      method: 'POST',
      body: JSON.stringify([
          { trackNo: trackingNumber }
      ]),
    });

    if (response.code !== '00000') {
      console.error(`[Track123] ❌ Registration failed: ${response.msg}`);
      throw new Error(response.msg || 'Failed to register tracking');
    }
    console.log(`[Track123] ✅ Registration successful`);
  }

  /**
   * Get tracking info
   * Endpoint: /track/query
   */
  async getTrackings(trackingNumbers: string[]): Promise<Tracking[]> {
    console.log(`[Track123] 🔍 Querying ${trackingNumbers.length} tracking(s):`, trackingNumbers);
    const response = await this.request<BaseResponse<QueryResponseData>>('/track/query', {
      method: 'POST',
      body: JSON.stringify({
        trackNoInfos: trackingNumbers.map(no => ({ trackNo: no })),
      }),
    });

    if (response.code !== '00000' || !response.data?.accepted?.content) {
      console.warn(`[Track123] ⚠️ Query returned no results`);
      return [];
    }

    const trackings = response.data.accepted.content.map(this.mapToTracking);
    console.log(`[Track123] ✅ Found ${trackings.length} tracking(s)`);
    return trackings;
  }

  /**
   * Instant Track: Try basic query first, if not found, register then query.
   * This is safer as "Instant Tracking" endpoint might be different or paid feature,
   * while Register+Query is standard core flow.
   */
  async instantTrack(trackingNumber: string, nickname?: string): Promise<Tracking> {
    console.log(`[Track123] 🚀 Starting instant track for: ${trackingNumber}`);
    // 1. Try to Query first (maybe it already exists)
    let trackings = await this.getTrackings([trackingNumber]);
    
    if (trackings.length === 0) {
        console.log(`[Track123] 📦 Not found in system, registering...`);
        // 2. If not found, Register it
        try {
             await this.registerTracking(trackingNumber);
             // Short delay for backend propagation
             console.log(`[Track123] ⏳ Waiting 500ms for backend sync...`);
             await new Promise(r => setTimeout(r, 500)); 
             trackings = await this.getTrackings([trackingNumber]);
        } catch (e) {
            console.error('[Track123] ❌ Registration failed:', e);
        }
    }
    
    if (trackings.length > 0) {
        const t = trackings[0];
        const result = nickname ? { ...t, nickname } : t;
        console.log(`[Track123] 🎉 Instant track complete: ${result.carrier.name} - ${result.status}`);
        return result;
    }

    console.error(`[Track123] ❌ Tracking info not found after all attempts`);
    throw new Error('Tracking info not found');
  }

  /**
   * Get Carriers List
   * Endpoint: /courier/list
   */
  async getCarriers(): Promise<Carrier[]> {
    console.log(`[Track123] 📋 Fetching carriers list...`);
    const response = await this.request<BaseResponse<CarrierData[]>>('/courier/list', {
        method: 'GET'
    });
    
    if (response.code !== '00000' || !response.data) {
        console.warn(`[Track123] ⚠️ Failed to fetch carriers`);
        return [];
    }
    
    console.log(`[Track123] ✅ Loaded ${response.data.length} carriers`);
    return response.data.map(c => ({
        code: c.courierCode,
        name: c.courierNameEN || c.courierNameCN || c.courierCode,
        trackingUrl: c.courierHomePage
    }));
  }


  // ============================================
  // Private Helpers
  // ============================================

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${TRACK123_BASE_URL}${endpoint}`;
    
    console.log(`[Track123] 🌐 ${options.method || 'GET'} ${url}`);
    if (options.body) {
      console.log(`[Track123] 📤 Request body:`, JSON.parse(options.body as string));
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Track123-Api-Secret': this.apiKey, // Verified Header
        ...options.headers,
      },
    });

    if (!response.ok) {
        console.error(`[Track123] ❌ HTTP ${response.status}: ${response.statusText}`);
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Track123] 📥 Response:`, data);
    return data;
  }

  private mapToTracking(data: TrackingContent): Tracking {
    const logistic = data.localLogisticsInfo;
    
    const carrier: Carrier = {
        code: logistic?.courierCode || 'unknown',
        name: logistic?.courierNameEN || logistic?.courierCode || 'Unknown',
    };

    const status = mapTrack123Status(data.transitStatus);
    
    const events: TrackingEvent[] = (logistic?.trackingDetails || []).map(evt => ({
        timestamp: new Date(evt.eventTime), // format: 2026-01-22 07:45:24
        location: evt.location || '',
        description: evt.eventDetail,
        status: mapTrack123Status(evt.transitSubStatus) // map substatus if possible, or fallback
    }));

    return createTracking({
        trackingNumber: data.trackNo,
        nickname: data.trackNo,
        carrier,
        status,
        events,
        transitDays: data.transitDays // Extract from API response
    });
  }
}

// ============================================
// Mock Service
// ============================================

export class MockTrack123Service {
    async instantTrack(trackingNumber: string): Promise<Tracking> {
        return createTracking({
            trackingNumber,
            carrier: { code: 'mock', name: 'Mock Express' },
            status: 'in_transit',
            events: []
        });
    }
    async getCarriers() { return []; }
}

export function createTrackingService(apiKey?: string) {
  if (apiKey) {
    return new Track123Service(apiKey);
  }
  return new MockTrack123Service();
}
