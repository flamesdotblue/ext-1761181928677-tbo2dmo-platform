import { Home, PlusCircle, ScanLine, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export default function BottomNav() {
  const base = 'flex flex-col items-center justify-center gap-1 text-xs';
  const iconBase = 'w-6 h-6';
  const active = 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]';
  const inactive = 'text-slate-300/70';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-500/40 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto max-w-md grid grid-cols-4 py-2">
        <NavLink to="/" end className={({ isActive }) => clsx(base, isActive ? active : inactive)}>
          <Home className={iconBase} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => clsx(base, isActive ? active : inactive)}>
          <PlusCircle className={iconBase} />
          <span>Add</span>
        </NavLink>
        <NavLink to="/scan" className={({ isActive }) => clsx(base, isActive ? active : inactive)}>
          <ScanLine className={iconBase} />
          <span>Scan</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => clsx(base, isActive ? active : inactive)}>
          <User className={iconBase} />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}
