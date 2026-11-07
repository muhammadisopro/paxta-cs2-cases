import React from 'react';
import { Home, Package, Briefcase, ShieldCheck } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'cases' | 'inventory' | 'rules';
  onSelectTab: (tab: 'home' | 'cases' | 'inventory' | 'rules') => void;
  inventoryCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, inventoryCount }) => {
  const navItems: { id: 'home' | 'cases' | 'inventory' | 'rules'; label: string; icon: any }[] = [
    { id: 'home', label: 'Asosiy', icon: Home },
    { id: 'cases', label: 'Qutilar', icon: Package },
    { id: 'inventory', label: 'Sovg‘alarim', icon: Briefcase },
    { id: 'rules', label: 'Kafolat', icon: ShieldCheck }
  ];

  return (
    <div className="lg:hidden fixed bottom-4 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-none">
      <nav className="ios-dock pointer-events-auto rounded-3xl px-3 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-white bg-white/[0.10]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
                {item.id === 'inventory' && inventoryCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1.5 rounded-full min-w-[16px] text-center shadow">
                    {inventoryCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
