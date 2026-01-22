/**
 * Navigation Component
 * Main app header with navigation tabs
 */

import { Package, BarChart3, Home } from 'lucide-react';

export type NavPage = 'home' | 'list' | 'dashboard';

interface NavigationProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  trackingCount?: number;
}

export function Navigation({ currentPage, onNavigate, trackingCount = 0 }: NavigationProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--color-glass-border)]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <span className="text-2xl">📦</span>
            <span className="text-xl font-bold gradient-text">Package Stalker</span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            <NavLink
              icon={<Home className="w-4 h-4" />}
              label="หน้าแรก"
              isActive={currentPage === 'home'}
              onClick={() => onNavigate('home')}
            />
            <NavLink
              icon={<Package className="w-4 h-4" />}
              label="พัสดุ"
              badge={trackingCount > 0 ? trackingCount : undefined}
              isActive={currentPage === 'list'}
              onClick={() => onNavigate('list')}
            />
            <NavLink
              icon={<BarChart3 className="w-4 h-4" />}
              label="สถิติ"
              isActive={currentPage === 'dashboard'}
              onClick={() => onNavigate('dashboard')}
            />
          </nav>
        </div>
      </div>
    </header>
  );
}

// ============================================
// Sub-components
// ============================================

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  isActive: boolean;
  onClick: () => void;
}

function NavLink({ icon, label, badge, isActive, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-200
        ${isActive 
          ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' 
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-glass)]'
        }
      `}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {badge !== undefined && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-[var(--color-primary)] text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
