import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Search, LayoutDashboard, FileText, Bookmark, BarChart3, 
  User, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', icon: Home, path: 'Home' },
  { name: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard' },
  { name: 'Browse Jobs', icon: Search, path: 'Jobs' },
  { name: 'Saved Jobs', icon: Bookmark, path: 'SavedJobs' },
  { name: 'Analytics', icon: BarChart3, path: 'Analytics' },
  { name: 'Profile', icon: User, path: 'Profile' }
];

export default function Navigation({ currentPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavLink = ({ item, mobile = false }) => {
    const isActive = currentPage === item.path;
    
    return (
      <Link
        to={createPageUrl(item.path)}
        onClick={() => mobile && setMobileOpen(false)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          isActive 
            ? "bg-emerald-50 text-emerald-700 font-medium"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          mobile && "w-full"
        )}
      >
        <item.icon className="w-4 h-4" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={createPageUrl('Home')}>
            <Logo size="default" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.slice(1, 5).map(item => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to={createPageUrl('Profile')}>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Link to={createPageUrl('Upload')}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                <FileText className="w-4 h-4 mr-2" />
                Upload Resume
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col h-full py-4">
                <div className="mb-6">
                  <Logo size="default" />
                </div>
                
                <div className="flex-1 space-y-1">
                  {navItems.map(item => (
                    <NavLink key={item.path} item={item} mobile />
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Link 
                    to={createPageUrl('Upload')}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}