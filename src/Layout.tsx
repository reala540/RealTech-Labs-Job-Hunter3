import { Outlet } from 'react-router-dom';
import Navigation from '@/components/common/Navigation';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="pt-16 px-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
