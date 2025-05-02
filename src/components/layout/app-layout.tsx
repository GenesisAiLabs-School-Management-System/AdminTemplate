import { AppSidebar } from '@/components/layout/app-sidebar.js';
import { GeneratedBreadcrumbs } from '@/components/layout/generated-breadcrumbs';
import { Badge } from '@/components/ui/badge.js';
import { Separator } from '@/components/ui/separator.js';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.js';
import { useUserSettings } from '@/hooks/useUserSetting.js';
//  import { Trans } from '@lingui/react/macro';
import { Outlet } from '@tanstack/react-router';
import { Alerts } from '../common/notification.js';

export function AppLayout() {
    const { settings } = useUserSettings();
    

    return (
       
        <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex border-b border-border h-16 shrink-0 items-center  transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14">
            <div className="flex items-center justify-between gap-2 px-4 w-full">
                <div className="flex items-center gap-2  ">
                 <SidebarTrigger className="pb-1" />
                  <Separator orientation="vertical" className="mr-2 h-6" />
                  <GeneratedBreadcrumbs />
                </div>
                <div className="flex items-center justify-end gap-2">
                 {settings.devMode && <Badge variant="default">Dev Mode</Badge>}
                  <Alerts />
               </div>
            </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-5 pt-0">
            <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  
    );
}