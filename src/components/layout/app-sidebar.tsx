import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user.js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getNavMenuConfig, navMenu } from "@/framework/nav-menu";

import * as React from "react";
import { TeamSwitcher } from "./channel-switcher";
import {
  AudioWaveform,
  BoxIcon,
  Command,
  GalleryVerticalEnd,
  Settings,
} from "lucide-react";
// import { ChannelSwitcher } from './channel-switcher.js';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  navMenu({
    sections: [
      {
        id: "item1",
        title: "Item 1",
        url: "/item1",
        icon: BoxIcon,
        placement: "top",
      },
      {
        id: "item2",
        title: "Item 2",
        url: "/item2",
        icon: BoxIcon,
        placement: "top",
      },

      {
        id: "settings",
        title: "Settings",
        url: "/settings",
        icon: Settings,
        placement: "bottom",
      },
    ],
  });

  const { sections } = getNavMenuConfig();
  console.log("sections", sections);
  const data = {
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
  };
  return (
    <div className="flex justify-center">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          {/* <ChannelSwitcher /> */}
          <div className="">
            <TeamSwitcher teams={data.teams} />
          </div>
          <SidebarRail className=""></SidebarRail>
        </SidebarHeader>
        <SidebarContent className="flex flex-col h-full overflow-y-auto">
          <NavMain items={sections} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
