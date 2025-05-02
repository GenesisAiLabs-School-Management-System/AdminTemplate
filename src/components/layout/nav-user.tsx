'use client';

import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from '@tanstack/react-router';
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { Route } from '@/routes/_authenticated.js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.js';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.js';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar.js';
import { useUserSettings } from '@/hooks/useUserSetting.js';
import { useMemo } from 'react';
import { Dialog, DialogTrigger } from '../ui/dialog.js';
// import { LanguageDialog } from './language-dialog.js';
import { Theme } from '@/context/ThemeContext.js';
// import { Trans } from '@lingui/react/macro';

export function NavUser() {
    const { isMobile } = useSidebar();
    const router = useRouter();
    const navigate = Route.useNavigate();
    const { user, ...auth } = useAuth();
    const { settings, setTheme, setDevMode } = useUserSettings();

    const handleLogout = async () => {
        await auth.logout();
        await router.invalidate();
        navigate({ to: '/login' });
    };

    const avatarFallback = useMemo(() => {
        const firstName = user?.firstName || '';
        const lastName = user?.lastName || '';
        // if(avatarFallback===''|| avatarFallback===undefined){
        //     const initials = user?.email?.charAt(0).toUpperCase() || '';
        //     return initials;
        // }
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        console.log('Avatar initials:', user?.firstName, user?.lastName, initials);
        return initials;
    }, [user]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isDevMode = (import.meta as any).env?.MODE === 'development';

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="hover:bg-primary/10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                           <AvatarImage src={user?.firstName} alt={user?.firstName} />
                                             <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
                                     </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <span className="truncate text-xs">{user?.email}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? 'bottom' : 'right'}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.id} alt={user?.firstName} />
                                        <AvatarFallback className="rounded-lg">
                                            {avatarFallback}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {user?.firstName} {user?.lastName}
                                        </span>
                                        <span className="truncate text-xs">{user?.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link to="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DialogTrigger asChild>
                                    <DropdownMenuItem>Language</DropdownMenuItem>
                                </DialogTrigger>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuRadioGroup
                                                value={settings.theme}
                                                onValueChange={value => setTheme(value as Theme)}
                                            >
                                                <DropdownMenuRadioItem value="light">
                                                    <Sun />
                                                    Light
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="dark">
                                                    <Moon />
                                                    Dark
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="system">
                                                    <Monitor />
                                                    System
                                                </DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            </DropdownMenuGroup>
                            {isDevMode && (
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Dev Mode</DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuRadioGroup
                                                value={settings.devMode.toString()}
                                                onValueChange={value => setDevMode(value === 'true')}
                                            >
                                                <DropdownMenuRadioItem value="true">
                                                   'Enabled'
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem value="false">
                                                    'Disabled'
                                                </DropdownMenuRadioItem>
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* <LanguageDialog /> */}
                </Dialog>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}