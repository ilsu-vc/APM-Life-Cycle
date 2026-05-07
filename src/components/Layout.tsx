import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Truck, 
  DollarSign, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  ChevronRight,
  User as UserIcon,
  Warehouse,
  ShieldAlert,
  UserCog,
  Briefcase,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialOverlay } from './TutorialOverlay';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['admin', 'secretary'] },
  { name: 'Inventory', href: '/inventory', icon: Package, roles: ['admin', 'secretary', 'agent'] },
  { name: 'Order Entry', href: '/orders', icon: ShoppingCart, roles: ['admin', 'secretary', 'agent'] },
  { name: 'Transfers', href: '/transfers', icon: Truck, roles: ['admin', 'secretary'] },
  { name: 'Warehouses', href: '/warehouses', icon: Warehouse, roles: ['admin'] },
  { name: 'Financials', href: '/finance', icon: DollarSign, roles: ['admin'] },
  { name: 'QR Scanner', href: '/scanner', icon: QrCode, roles: ['admin', 'secretary', 'agent'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'secretary', 'agent'] },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, logout, updateRole } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(profile?.role || 'agent')
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-navy-950 border-right border-navy-800">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-500 rounded flex items-center justify-center">
            <Package className="text-navy-950 w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">ACTIVE<span className="text-gold-400">PRO</span></span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-navy-400 mt-1 font-black">Logistics Core</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-gold-500/15 text-gold-400 shadow-sm' 
                  : 'text-navy-300 hover:bg-navy-800 hover:text-gold-400'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1 h-4 bg-gold-500 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <Separator className="mb-4 bg-navy-800" />
        <Link 
          to="/settings"
          onClick={() => setIsMobileMenuOpen(false)}
          className="flex items-center gap-3 px-3 py-3 mb-4 rounded-2xl hover:bg-navy-800 transition-all group relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-navy-800 rounded-xl flex-shrink-0 overflow-hidden border border-navy-700 group-hover:border-gold-500 transition-colors">
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="w-5 h-5 text-navy-400 m-2.5" />
            )}
          </div>
          <div className="flex flex-col min-w-0 pr-6">
            <span className="text-xs font-black text-white truncate tracking-tight">
              {profile?.displayName || 'User'}
            </span>
            <span className="text-[9px] text-navy-400 uppercase font-black tracking-widest mt-0.5">
              {profile?.role} Node
            </span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <UserCog className="w-3.5 h-3.5 text-gold-400" />
          </div>
        </Link>

        <div className="px-3 mb-4 space-y-1">
          <p className="text-[9px] font-black uppercase tracking-tighter text-navy-500 mb-2 mt-4 px-1">Developer Controls</p>
          <div className="grid grid-cols-3 gap-1">
            <Button 
              size="sm" 
              variant={profile?.role === 'admin' ? 'default' : 'outline'} 
              className={`h-7 text-[9px] font-bold p-0 ${profile?.role === 'admin' ? 'bg-gold-500 text-navy-950 hover:bg-gold-400' : 'border-navy-700 text-navy-300 hover:bg-navy-800 hover:text-gold-400'}`}
              onClick={() => updateRole('admin')}
            >
              ADM
            </Button>
            <Button 
              size="sm" 
              variant={profile?.role === 'secretary' ? 'default' : 'outline'} 
              className={`h-7 text-[9px] font-bold p-0 ${profile?.role === 'secretary' ? 'bg-gold-500 text-navy-950 hover:bg-gold-400' : 'border-navy-700 text-navy-300 hover:bg-navy-800 hover:text-gold-400'}`}
              onClick={() => updateRole('secretary')}
            >
              SEC
            </Button>
            <Button 
              size="sm" 
              variant={profile?.role === 'agent' ? 'default' : 'outline'} 
              className={`h-7 text-[9px] font-bold p-0 ${profile?.role === 'agent' ? 'bg-gold-500 text-navy-950 hover:bg-gold-400' : 'border-navy-700 text-navy-300 hover:bg-navy-800 hover:text-gold-400'}`}
              onClick={() => updateRole('agent')}
            >
              AGT
            </Button>
          </div>
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-navy-400 hover:text-gold-400 hover:bg-navy-800 font-bold uppercase tracking-widest text-[10px]"
          onClick={() => setIsTutorialOpen(true)}
        >
          <HelpCircle className="w-4 h-4" />
          System Guide
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-navy-400 hover:text-red-400 hover:bg-red-500/10"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-50 flex">
      <TutorialOverlay open={isTutorialOpen} onOpenChange={setIsTutorialOpen} />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-56 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-56">
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-md border-b border-navy-200 lg:px-8">
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg h-8 w-8 hover:bg-muted hover:text-foreground transition-all">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[240px] max-w-[75vw]">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-navy-900">
              {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-1 text-[10px] text-navy-500 uppercase font-bold tracking-widest">
              <span>ACTIVEPRO</span>
              <ChevronRight className="w-3 h-3" />
              <span>{profile?.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Add universal search or notifications here if needed */}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
