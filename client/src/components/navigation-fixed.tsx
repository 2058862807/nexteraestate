import { Button } from "@/components/ui/button";
import { FileSignature, Vault, Users, Settings, Home, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.mobile-nav-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const navigateToPage = (path: string) => {
    console.log(`Navigating to: ${path}`);
    window.location.href = path;
    setIsOpen(false);
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: FileSignature, label: "My Will", path: "/will-builder" },
    { icon: Vault, label: "Digital Vault", path: "/digital-vault" },
    { icon: Users, label: "Family", path: "/family" },
  ];

  return (
    <>
      {/* Mobile Navigation - FIXED */}
      <div className="mobile-nav-container md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-full">
          <button
            onClick={() => navigateToPage("/")}
            className="text-lg font-bold text-primary truncate flex-shrink-0"
            style={{ maxWidth: 'calc(100vw - 100px)' }}
          >
            NoDoubtEstate
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 flex-shrink-0"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Mobile Menu Dropdown - FIXED */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 shadow-lg overflow-hidden">
            <div className="px-4 py-4 space-y-2 max-h-screen overflow-y-auto">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start text-left h-12 px-3"
                  onClick={() => navigateToPage(item.path)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              ))}
              <div className="pt-2 border-t border-neutral-200">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 px-3"
                  onClick={() => navigateToPage("/subscribe")}
                >
                  <Settings className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Upgrade Plan</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar - FIXED */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-neutral-200 flex-col z-40 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex-shrink-0">
          <button
            onClick={() => navigateToPage("/")}
            className="text-2xl font-bold text-primary cursor-pointer block w-full text-left truncate"
          >
            NoDoubtEstate
          </button>
          <p className="text-sm text-neutral-600 mt-1 truncate">Digital Estate Planning</p>
          {user && (
            <p className="text-xs text-neutral-500 mt-2 truncate">
              Welcome, {(user as any)?.firstName || "User"}
            </p>
          )}
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start text-left h-11 px-3"
                onClick={() => navigateToPage(item.path)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-neutral-200 flex-shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start h-11 px-3"
            onClick={() => navigateToPage("/subscribe")}
          >
            <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Upgrade Plan</span>
          </Button>
        </div>
      </div>

      {/* Content spacers - FIXED */}
      <div className="hidden md:block w-64 flex-shrink-0"></div>
      <div className="md:hidden h-16 flex-shrink-0"></div>
    </>
  );
}