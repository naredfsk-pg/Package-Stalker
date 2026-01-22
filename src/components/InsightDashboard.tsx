/**
 * InsightDashboard Component
 * Analytics overview with charts and stats
 */

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Package, TrendingUp, Award, BarChart3 } from 'lucide-react';
import type { CourierDistribution, MonthlyStats } from '../domain/types';
import { getAnalyticsService } from '../services/storage.service';

const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#EC4899'];

export function InsightDashboard() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [courierDist, setCourierDist] = useState<CourierDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const analytics = getAnalyticsService();
    const [stats, dist] = await Promise.all([
      analytics.getMonthlyStats(),
      analytics.getCourierDistribution(),
    ]);
    setMonthlyStats(stats);
    setCourierDist(dist);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  const chartData = courierDist.map((d) => ({
    name: d.carrierName,
    value: d.count,
  }));

  const topCourier = courierDist.length > 0 
    ? courierDist.reduce((a, b) => a.count > b.count ? a : b) 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-[var(--color-primary)]" />
        <h2 className="text-xl font-semibold gradient-text">Insight Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Packages */}
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="เดือนนี้สั่งไปแล้ว"
          value={monthlyStats?.totalPackages || 0}
          suffix="ชิ้น"
          color="primary"
        />

        {/* Delivered */}
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="ถึงมือแล้ว"
          value={monthlyStats?.delivered || 0}
          suffix="ชิ้น"
          color="success"
        />

        {/* In Transit */}
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="กำลังเดินทาง"
          value={monthlyStats?.inTransit || 0}
          suffix="ชิ้น"
          color="secondary"
        />
      </div>

      {/* Courier Champion Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--color-accent)]" />
            Courier Champion
          </h3>
          
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-glass-border)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
              ยังไม่มีข้อมูล
            </div>
          )}
        </div>

        {/* Legend / Top Courier */}
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
            สถิติขนส่ง
          </h3>

          {topCourier && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20">
              <p className="text-sm text-[var(--color-text-secondary)]">ใช้บริการมากที่สุด</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                {topCourier.carrierName}
              </p>
              <p className="text-[var(--color-primary)] font-medium">
                {topCourier.percentage}% ({topCourier.count} ชิ้น)
              </p>
            </div>
          )}

          <div className="flex-1 space-y-3">
            {courierDist.map((dist, index) => (
              <div key={dist.carrierCode} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <span className="text-[var(--color-text-secondary)]">
                    {dist.carrierName}
                  </span>
                  {dist.avgTransitDays !== undefined && (
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                      (เฉลี่ย {dist.avgTransitDays} วัน)
                    </span>
                  )}
                </div>
                <span className="text-[var(--color-text-primary)] font-medium">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: 'primary' | 'secondary' | 'success';
}

function StatCard({ icon, label, value, suffix, color }: StatCardProps) {
  const colorStyles = {
    primary: 'from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 text-[var(--color-primary)]',
    secondary: 'from-[var(--color-secondary)]/20 to-[var(--color-secondary)]/5 text-[var(--color-secondary)]',
    success: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
  };

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${colorStyles[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-[var(--color-text-primary)]">
          {value}
        </span>
        {suffix && (
          <span className="text-lg text-[var(--color-text-muted)]">{suffix}</span>
        )}
      </div>
    </div>
  );
}
