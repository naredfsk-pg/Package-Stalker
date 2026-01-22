/**
 * Package Stalker - Main Application
 * Minimal & Sexy Package Tracking for Life OS
 */

import { useState, useEffect, useCallback } from 'react';
import { Navigation, type NavPage } from './components/Navigation';
import { TrackingBar } from './components/TrackingBar';
import { TrackingCard } from './components/TrackingCard';
import { InsightDashboard } from './components/InsightDashboard';
import type { Tracking } from './domain/types';
import { createTrackingService } from './services/track123.service';
import { getStorageService } from './services/storage.service';
import { PackageSearch, Inbox, Sparkles } from 'lucide-react';

// Initialize services with API key from environment
const apiKey = import.meta.env.VITE_TRACK123_API_KEY as string | undefined;
const trackingService = createTrackingService(apiKey);
const storageService = getStorageService();

function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load trackings on mount
  useEffect(() => {
    loadTrackings();
  }, []);

  const loadTrackings = async () => {
    const saved = await storageService.getTrackings();
    setTrackings(saved);
  };

  const handleTrack = useCallback(async (trackingNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await trackingService.instantTrack(trackingNumber);
      await storageService.saveTracking(result);
      await loadTrackings();
      setCurrentPage('list'); // Navigate to list after tracking
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await storageService.deleteTracking(id);
    await loadTrackings();
  }, []);

  const handleRefresh = useCallback(async (id: string) => {
    const tracking = trackings.find((t) => t.id === id);
    if (!tracking) return;

    setIsLoading(true);
    try {
      const updated = await trackingService.instantTrack(tracking.trackingNumber);
      await storageService.updateTracking({ ...updated, id, nickname: tracking.nickname });
      await loadTrackings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  }, [trackings]);

  const activeTrackings = trackings.filter((t) => t.status !== 'delivered');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        trackingCount={activeTrackings.length}
      />

      <main className="flex-1">
        {/* Home Page */}
        {currentPage === 'home' && (
          <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6">
            {/* Hero Section */}
            <div className="text-center mb-12 animate-[fade-in_0.6s_ease-out]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-6xl">📦</span>
                <Sparkles className="w-8 h-8 text-[var(--color-accent)] animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                Package Stalker
              </h1>
              <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto">
                ติดตามพัสดุทุกเจ้าในที่เดียว
                <br />
                <span className="text-[var(--color-text-muted)]">Minimal • Sexy • Life OS</span>
              </p>
            </div>

            {/* Tracking Bar */}
            <div className="w-full max-w-2xl animate-[slide-up_0.6s_ease-out]">
              <TrackingBar onTrack={handleTrack} isLoading={isLoading} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 max-w-md animate-[fade-in_0.3s_ease-out]">
                {error}
              </div>
            )}

            {/* Quick Access */}
            {trackings.length > 0 && (
              <div className="mt-12 text-center animate-[fade-in_0.8s_ease-out]">
                <button
                  onClick={() => setCurrentPage('list')}
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                >
                  ดูพัสดุทั้งหมด ({trackings.length}) →
                </button>
              </div>
            )}
          </div>
        )}

        {/* List Page */}
        {currentPage === 'list' && (
          <div className="max-w-3xl mx-auto p-6">
            {/* Quick Add */}
            <div className="mb-8">
              <TrackingBar onTrack={handleTrack} isLoading={isLoading} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            {/* Tracking List */}
            {trackings.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                  <PackageSearch className="w-5 h-5 text-[var(--color-primary)]" />
                  พัสดุทั้งหมด ({trackings.length})
                </h2>
                {trackings.map((tracking) => (
                  <TrackingCard
                    key={tracking.id}
                    tracking={tracking}
                    onDelete={handleDelete}
                    onRefresh={handleRefresh}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onAddClick={() => {}} />
            )}
          </div>
        )}

        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
          <div className="max-w-4xl mx-auto p-6">
            <InsightDashboard />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-[var(--color-text-muted)]">
        Made with 💜 for Life OS
      </footer>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

function EmptyState({ onAddClick: _onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--color-glass)] flex items-center justify-center mb-6">
        <Inbox className="w-10 h-10 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">
        ยังไม่มีพัสดุ
      </h3>
      <p className="text-[var(--color-text-secondary)] max-w-sm">
        เริ่มติดตามพัสดุโดยใส่เลขพัสดุในช่องด้านบน
      </p>
    </div>
  );
}

export default App;
