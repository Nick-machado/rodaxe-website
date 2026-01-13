import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  Folder,
  Tag,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Settings,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import logoLight from "@/assets/logo-rodaxe-light.png";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [siteManagementOpen, setSiteManagementOpen] = useState(true);
  const [trabalhosOpen, setTrabalhosOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  const siteManagementItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/portfolio", label: "Portfolio", icon: Image },
    { href: "/admin/videos", label: "Vídeos", icon: Video },
    { href: "/admin/niches", label: "Nichos", icon: Folder },
    { href: "/admin/tags", label: "Tags", icon: Tag },
  ];

  const trabalhosItems = [
    { href: "/admin/clientes", label: "Clientes", icon: Users },
    { href: "/admin/trabalhos", label: "Trabalhos", icon: Briefcase },
    { href: "/admin/relatorio", label: "Relatório", icon: FileText },
    { href: "/admin/calendario", label: "Calendário", icon: Calendar },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const getPageTitle = () => {
    const allItems = [...siteManagementItems, ...trabalhosItems];
    return allItems.find((item) => item.href === location.pathname)?.label || "Admin";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/admin/dashboard" className="flex items-center h-16 md:h-20 overflow-hidden">
            <img 
              src={logoLight} 
              alt="Rodaxe" 
              className="h-44 md:h-52 w-auto object-cover object-center -my-14" 
            />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-sidebar-border">
          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-sm">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {/* Gerenciamento do Site */}
          <Collapsible open={siteManagementOpen} onOpenChange={setSiteManagementOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings size={18} />
                <span className="font-body text-sm font-medium">Gerenciamento do Site</span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  siteManagementOpen ? "rotate-180" : ""
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {siteManagementItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-sm transition-colors",
                    location.pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon size={16} />
                  <span className="font-body text-sm">{item.label}</span>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Trabalhos */}
          <Collapsible open={trabalhosOpen} onOpenChange={setTrabalhosOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
              <div className="flex items-center justify-center gap-3 flex-1">
                <Briefcase size={18} />
                <span className="font-body text-sm font-medium">Trabalhos</span>
              </div>
              <ChevronDown
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  trabalhosOpen ? "rotate-180" : ""
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {trabalhosItems.length === 0 ? (
                <p className="px-4 py-2 text-xs text-muted-foreground italic">
                  Nenhum item ainda
                </p>
              ) : (
                trabalhosItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-sm transition-colors",
                      location.pathname === item.href
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon size={16} />
                    <span className="font-body text-sm">{item.label}</span>
                  </Link>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut size={18} />
            <span className="font-body text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground mr-4"
          >
            <Menu size={24} />
          </button>
          <h1 className="font-display text-xl text-foreground">
            {getPageTitle()}
          </h1>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
