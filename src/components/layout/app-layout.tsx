import { AppSidebar } from "@/components/layout/app-sidebar.js";
import { GeneratedBreadcrumbs } from "@/components/layout/generated-breadcrumbs";
import { Badge } from "@/components/ui/badge.js";
import { Separator } from "@/components/ui/separator.js";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar.js";
import { useUserSettings } from "@/hooks/useUserSetting.js";
//  import { Trans } from '@lingui/react/macro';
import { Outlet } from "@tanstack/react-router";
import { Alerts } from "../common/notification.js";

export function AppLayout() {
  const { settings } = useUserSettings();

  return (
    <div className="flex h-screen flex-col">
      <AppSidebar />
      <div className="pl-64">
        <Outlet />
      </div>
    </div>
  );
}
