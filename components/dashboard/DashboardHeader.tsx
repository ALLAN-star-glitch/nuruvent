'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  PlusCircle,
  LogOut,
  ChevronDown,
  Search,
  X,
  Building2,
  Home,
  CheckCircle,
  RefreshCw,
  ArrowLeftRight,
  Sun
} from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { SearchBar } from '@/components/layout/SearchBar';
import { UserMenu } from '@/components/layout/UserMenu';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetClose 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { useLogoutMutation } from '@/lib/store/api/authApi';
import { clearAuth, UserRole } from '@/lib/store/slices/authSlice';
import { LogoutDialog } from '../ui/LogoutDialog';
import { useState, useRef, useEffect } from 'react';

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
  };
}

interface Team {
  id: string;
  name: string;
  type: 'personal' | 'institution';
  role: string;
  avatar?: string;
}

const mockTeams: Team[] = [
  { id: 'personal-1', name: "John's Personal Team", type: 'personal', role: 'Account Admin' },
  { id: 'nuruvent', name: 'Nuruvent', type: 'institution', role: 'Event Manager' },
  { id: 'techcorp', name: 'TechCorp', type: 'institution', role: 'Team Member' },
];

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showTeamSwitcher, setShowTeamSwitcher] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team>(mockTeams[0]);
  const teamSwitcherRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading }] = useLogoutMutation();

  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearAuth());
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(clearAuth());
      router.push('/');
    }
  };

  const handleCreateEvent = () => {
    router.push('/dashboard/events/new');
  };

  const handleTeamSwitch = (team: Team) => {
    setCurrentTeam(team);
    setShowTeamSwitcher(false);
  };

  const getTeamIcon = (type: Team['type']) => {
    return type === 'personal' ? Home : Building2;
  };

  const getTeamColor = (type: Team['type']) => {
    return type === 'personal' ? 'text-blue-600 dark:text-blue-400' : 'text-indigo-600 dark:text-indigo-400';
  };

  const getTeamBgColor = (type: Team['type']) => {
    return type === 'personal' ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-indigo-50 dark:bg-indigo-950/30';
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamSwitcherRef.current && !teamSwitcherRef.current.contains(event.target as Node)) {
        setShowTeamSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTeamSwitcher = () => {
    setShowTeamSwitcher(!showTeamSwitcher);
  };

  const handleThemeToggle = () => {
    console.log('Theme toggle - coming soon');
  };

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-[#202124] dark:border-[#3C4043]/80 dark:backdrop-blur-sm dark:bg-[#202124]/95">
      <div className="container mx-auto px-2.5 sm:px-4">
        <div className="flex flex-col">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 md:gap-3">
            {/* Left: Mobile/Tablet Drawer Menu + Logo */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xl:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-[#3C4043] cursor-pointer"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] md:w-[340px] flex flex-col h-full bg-white dark:bg-[#202124] border-r dark:border-[#3C4043]">
                  <SheetHeader className="p-4 border-b border-gray-100 flex-row items-center justify-between space-y-0 text-left shrink-0 dark:border-[#3C4043]">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="inline-flex items-center">
                      <Logo />
                    </div>
                  </SheetHeader>

                  <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    <div>
                      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 dark:text-gray-500">
                        Menu
                      </p>
                      <nav className="space-y-0.5">
                        {NAV_ITEMS.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <SheetClose asChild key={item.href}>
                              <Link
                                href={item.href}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                                  isActive
                                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                    : 'text-gray-600 hover:bg-gray-100/40 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-[#3C4043]/40 dark:hover:text-white'
                                )}
                              >
                                <Icon className={cn(
                                  'h-5 w-5 shrink-0',
                                  isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
                                )} />
                                <span>{item.label}</span>
                              </Link>
                            </SheetClose>
                          );
                        })}
                      </nav>
                    </div>
                  </div>

                  {/* Drawer Footer - Logout and User */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 space-y-3 dark:border-[#3C4043] dark:bg-[#2D2E32]">
                    <button
                      type="button"
                      onClick={() => setShowLogoutDialog(true)}
                      disabled={isLoading}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-red-500 hover:bg-red-50/50 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-red-950/20 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-red-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-sm font-medium">Logging out...</span>
                        </div>
                      ) : (
                        <>
                          <LogOut className="h-5 w-5 shrink-0 text-red-400 group-hover:text-red-500 transition-colors" />
                          <span className="text-sm font-medium group-hover:text-red-600 transition-colors">Logout</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-[#3C4043]">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold flex items-center justify-center text-sm shrink-0 dark:from-primary/30 dark:to-primary/10">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate capitalize dark:text-gray-400">{user.role}</p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/dashboard" className="inline-flex items-center shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
                <Logo />
              </Link>
            </div>

            {/* Search Bar - Visible on desktop and large screens */}
            <div className="hidden xl:flex items-center flex-1 max-w-2xl mx-4 justify-center">
              <div className="w-full max-w-xl relative">
                <SearchBar />
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              {/* Search Toggle Button - visible on tablet & mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-[#3C4043] cursor-pointer"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
              >
                {isMobileSearchOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>

              {/* TEAM SWITCHER - Responsive across mobile, tablet, and desktop */}
              <div className="relative" ref={teamSwitcherRef}>
                <button
                  type="button"
                  onClick={toggleTeamSwitcher}
                  className="flex items-center justify-center gap-1 md:gap-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full md:rounded-lg h-8 w-8 md:h-9 md:w-auto px-0 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#3C4043] border border-transparent hover:border-gray-200 dark:hover:border-[#3C4043] cursor-pointer"
                  aria-label="Switch team"
                >
                  <ArrowLeftRight className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
                  
                  {/* Text hidden on mobile (<768px), visible on tablets/laptops (md+) */}
                  <span className="hidden md:inline-block text-gray-700 dark:text-gray-300 font-medium">
                    Switch Team
                  </span>
                  
                  {/* Current team name shown on larger tablets/desktops (lg+) */}
                  <span className="hidden lg:inline-block max-w-[90px] xl:max-w-[120px] truncate text-gray-500 dark:text-gray-400">
                    ({currentTeam.name})
                  </span>

                  <ChevronDown className={cn(
                    "hidden md:block h-3.5 w-3.5 text-gray-400 transition-transform duration-200 shrink-0",
                    showTeamSwitcher ? "rotate-180" : ""
                  )} />
                </button>

                {showTeamSwitcher && (
                  <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#2D2E32] rounded-2xl shadow-2xl border border-gray-200/80 dark:border-[#3C4043] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 sm:px-4 py-1.5 sm:py-2">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Switch Team</p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-gray-100 to-transparent dark:from-[#3C4043] mx-3 sm:mx-4" />
                    <div className="mt-1">
                      {mockTeams.map((team) => {
                        const Icon = getTeamIcon(team.type);
                        const isActive = currentTeam.id === team.id;
                        return (
                          <button
                            key={team.id}
                            type="button"
                            onClick={() => handleTeamSwitch(team)}
                            className={cn(
                              "flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 w-full text-left transition-colors cursor-pointer",
                              isActive 
                                ? "bg-blue-50 dark:bg-blue-950/30" 
                                : "hover:bg-gray-50 dark:hover:bg-[#3C4043]/50"
                            )}
                          >
                            <div className={cn(
                              "h-8 w-8 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                              getTeamBgColor(team.type),
                              isActive ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#2D2E32]" : ""
                            )}>
                              <Icon className={cn("h-4 w-4 sm:h-4.5 sm:w-4.5", getTeamColor(team.type))} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium truncate",
                                isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                              )}>
                                {team.name}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 truncate">
                                {team.type === 'personal' ? 'Personal Team' : 'Institution Team'} • {team.role}
                              </p>
                            </div>
                            {isActive && (
                              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="h-px bg-gradient-to-r from-gray-100 to-transparent dark:from-[#3C4043] mx-3 sm:mx-4" />
                    <div className="px-3 sm:px-4 pt-1.5">
                      <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3" />
                        Switch to view different team events & permissions
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Create Event Button - Compact text on tablets (sm to lg), Full text on desktops (lg+) */}
              <button
                type="button"
                onClick={handleCreateEvent}
                className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm hover:shadow-md transition-all px-2.5 sm:px-3 md:px-4 py-1.5 md:py-2 h-8 md:h-9 text-xs md:text-sm font-medium rounded-md cursor-pointer shrink-0"
              >
                <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                <span className="inline lg:hidden">Create Event</span>
                <span className="hidden lg:inline">Create Event or Course</span>
              </button>

              {/* Theme Toggle - Icon only */}
              <button
                type="button"
                onClick={handleThemeToggle}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors flex items-center justify-center dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-[#3C4043] cursor-pointer"
                aria-label="Toggle theme (coming soon)"
              >
                <Sun className="h-4 w-4 md:h-4.5 md:w-4.5" />
              </button>

              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          </div>

          {/* Mobile/Tablet Search Dropdown */}
          <div className={cn(
            "xl:hidden transition-all duration-300 ease-in-out relative z-20",
            isMobileSearchOpen ? "max-h-16 pb-2 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          )}>
            <SearchBar />
          </div>
        </div>
      </div>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
        isLoading={isLoading}
      />
    </header>
  );
}