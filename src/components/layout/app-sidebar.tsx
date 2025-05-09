import { useState } from "react";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  HelpCircle,
  Home,
  FileText,
  Menu,
  Settings,
  User,
  Users,
  CreditCard,
  Bell,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  ChevronDown,
  ClipboardList,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "@tanstack/react-router";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
    subItems: [
      {
        title: "Enrolled Students",
        href: "/students",
      },
      {
        title: "Alumni",
        href: "/students/alumni",
      },
      {
        title: "Transferred",
        href: "/students/transferred",
      },
      {
        title: "Expelled",
        href: "/students/expelled",
      },
    ],
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: User,
  },
  {
    title: "Classes",
    href: "/classes",
    icon: BookOpen,
  },
  {
    title: "Exams",
    href: "/exams",
    icon: FileText,
  },
  {
    title: "Academic Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Fees",
    href: "/fees",
    icon: CreditCard,
  },
  {
    title: "Notice Board",
    href: "/notices",
    icon: Bell,
  },
  {
    title: "Registrar",
    href: "/registrar",
    icon: ClipboardList,
  },
  {
    title: "Staff Management",
    href: "/staff-management",
    icon: UserCog,
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help Center",
    href: "/help",
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const pathname = useLocation().pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleSubmenu = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const filteredNavItems = searchQuery
    ? mainNavItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mainNavItems;

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0 bg-secondary">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">EduManage</span>
                </div>
              </div>
            </div>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 rounded-[24px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <nav className="flex-1 overflow-auto py-4">
              <div className="flex flex-col gap-1 px-2">
                {filteredNavItems.map((link) =>
                  link.subItems ? (
                    <div key={link.title} className="flex flex-col">
                      <button
                        onClick={() => toggleSubmenu(link.title)}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors",
                          pathname === link.href ||
                            pathname.startsWith(link.href + "?")
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <link.icon className="h-4 w-4" />
                          {link.title}
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedItems.includes(link.title)
                              ? "rotate-180"
                              : ""
                          )}
                        />
                      </button>
                      {expandedItems.includes(link.title) && (
                        <div className="ml-6 mt-1 flex flex-col gap-1">
                          {link.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              to={subItem.href}
                              className={cn(
                                "flex items-center gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors",
                                pathname === subItem.href
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                              )}
                            >
                              <div className="h-1 w-1 rounded-full bg-current" />
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.title}
                    </Link>
                  )
                )}
              </div>
            </nav>
            <div className="border-t p-4">
              <div className="flex flex-col gap-1">
                {bottomNavItems.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.title}
                  </Link>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          AB
                        </AvatarFallback>
                      </Avatar>
                      <span>Abebe Bekele</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden border-r bg-secondary md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out",
          collapsed ? "md:w-[70px]" : "md:w-[240px]"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b p-4 flex items-center justify-between">
            <div
              className={cn(
                "flex items-center gap-2",
                collapsed && "justify-center w-full"
              )}
            >
              <GraduationCap className="h-6 w-6 text-primary" />
              {!collapsed && (
                <span className="text-xl font-bold">EduManage</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!collapsed && (
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 rounded-[24px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
          <nav className="flex-1 overflow-auto py-4">
            <div className="flex flex-col gap-1 px-2">
              {filteredNavItems.map((link) =>
                link.subItems ? (
                  <div key={link.title} className="flex flex-col">
                    <button
                      onClick={() => toggleSubmenu(link.title)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors",
                        pathname === link.href ||
                          pathname.startsWith(link.href + "?")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                        collapsed && "justify-center"
                      )}
                      title={collapsed ? link.title : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <link.icon className="h-4 w-4" />
                        {!collapsed && link.title}
                      </div>
                      {!collapsed && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedItems.includes(link.title)
                              ? "rotate-180"
                              : ""
                          )}
                        />
                      )}
                    </button>
                    {expandedItems.includes(link.title) && !collapsed && (
                      <div className="ml-6 mt-1 flex flex-col gap-1">
                        {link.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            className={cn(
                              "flex items-center gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors",
                              pathname === subItem.href
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                          >
                            <div className="h-1 w-1 rounded-full bg-current" />
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      collapsed && "justify-center"
                    )}
                    title={collapsed ? link.title : undefined}
                  >
                    <link.icon className="h-4 w-4" />
                    {!collapsed && link.title}
                  </Link>
                )
              )}
            </div>
          </nav>
          <div className="border-t p-4">
            <div className="flex flex-col gap-1">
              {bottomNavItems.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? link.title : undefined}
                >
                  <link.icon className="h-4 w-4" />
                  {!collapsed && link.title}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[24px] px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground",
                      collapsed && "justify-center"
                    )}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        AB
                      </AvatarFallback>
                    </Avatar>
                    {!collapsed && <span>Abebe Bekele</span>}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
