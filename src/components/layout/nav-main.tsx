//import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsable';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar.js';
import { NavMenuSection, NavMenuItem } from '@/framework/nav-menu';
import { Link, useLocation } from '@tanstack/react-router';


import * as React from 'react';

// Helper function to ensure keys are strings
const toStringKey = (value: React.ReactNode): string => 
    typeof value === 'string' ? value : String(value);

export function NavMain({ items }: { items: Array<NavMenuSection | NavMenuItem> }) {
    const location = useLocation();
    // State to track which bottom section is currently open
   // const [openBottomSectionId, setOpenBottomSectionId] = React.useState<string | null>(null);

    // Split sections into top and bottom groups based on placement property
    const topSections = items.filter(item => item.placement === 'top');
    const bottomSections = items.filter(item => item.placement === 'bottom');

    // // Handle bottom section open/close
    // const handleBottomSectionToggle = (sectionId: string, isOpen: boolean) => {
    //     if (isOpen) {
    //         setOpenBottomSectionId(sectionId);
    //     } else if (openBottomSectionId === sectionId) {
    //         setOpenBottomSectionId(null);
    //     }
    // };

    // Auto-open the bottom section that contains the current route
    React.useEffect(() => {
        const currentPath = location.pathname;

        // Check if the current path is in any bottom section
        for (const section of bottomSections) {
            const matchingItem =
                'items' in section
                    ? section.items?.find(
                          item => currentPath === item.url || currentPath.startsWith(`${item.url}/`),
                      )
                    : null;

            if (matchingItem) {
            //    setOpenBottomSectionId(section.id);
                return;
            }
        }
    }, [location.pathname]);

    // Render a top navigation section
    const renderTopSection = (item: NavMenuSection | NavMenuItem) => {
        if ('url' in item) {
            return (
                <SidebarMenuItem key={toStringKey(item.title)}>
                    <SidebarMenuButton tooltip={String(item.title)} asChild className="hover:bg-primary/10">
                        <Link to={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        }

        return (
            
                <SidebarMenuItem>
                        <SidebarMenuSub>
                            {item.items?.map(subItem => (
                                <SidebarMenuSubItem key={toStringKey(subItem.title)}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={
                                            location.pathname === subItem.url ||
                                            location.pathname.startsWith(`${subItem.url}/`)
                                        }
                                    >
                                        <Link to={subItem.url}>
                                             {subItem.icon && <subItem.icon />}
                                            <span>{subItem.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                </SidebarMenuItem>
            
        );
    };

    // Render a bottom navigation section with controlled open state
    const renderBottomSection = (item: NavMenuSection | NavMenuItem) => {
        if ('url' in item) {
            return (
                <SidebarMenuItem key={toStringKey(item.title)}>
                    <SidebarMenuButton tooltip={String(item.title)} asChild className="hover:bg-primary/10">
                        <Link to={item.url}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        }
        return (

                <SidebarMenuItem>
                    
                        {/* <SidebarMenuButton tooltip={String(item.title)}>
                            {item.icon && <item.icon />}
                        </SidebarMenuButton> */}
                        <SidebarMenuSub>
                            {item.items?.map(subItem => (
                                <SidebarMenuSubItem key={toStringKey(subItem.title)}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={
                                            location.pathname === subItem.url ||
                                            location.pathname.startsWith(`${subItem.url}/`)
                                        }
                                    >
                                        <Link to={subItem.url}>
                                            <span>{subItem.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                </SidebarMenuItem>
        );
    };

    return (
        <>
            {/* Top sections - use bg-muted */}
            <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>{topSections.map(renderTopSection)}</SidebarMenu>
            </SidebarGroup>

            {/* Bottom sections - use bg-muted */}
            <SidebarGroup className="mt-auto">
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarMenu>{bottomSections.map(renderBottomSection)}</SidebarMenu>
            </SidebarGroup>
        </>
    );
}