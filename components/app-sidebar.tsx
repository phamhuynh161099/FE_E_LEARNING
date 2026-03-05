"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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

  // OVERALL
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      isDisplay: false,
      items: [
        {
          title: "Product",
          url: "/admin/overall/product",
          isDisplay: false,
          guard: ["product:read"],
        },
        {
          title: "Main Config",
          url: "/admin/overall/main-config",
          isDisplay: false,
          guard: ["main-config:read"],
        },
      ],
    },
    {
      title: "Setting",
      url: "#",
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: "Company",
          url: "/admin/overall/company",
          isDisplay: false,
          guard: ["company:read"],
        },
      ],
    },
  ],

  // ME
  navME: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      isDisplay: false,
      items: [
        {
          title: "ME Summary",
          url: "/admin/me/me-summary",
          guard: ["me-summary:read"],
          isDisplay: false,
        },
      ],
    },
    {
      title: "Inspector",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Repacking",
          url: "/admin/me/me-repacking",
          isDisplay: false,
          guard: ["me-repacking:read"],
        },
      ],
    },
  ],

  // PDM
  navPDM: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      isDisplay: false,
      items: [
        {
          title: "Product Weight",
          url: "/admin/pdm/pdm-product-weight",
          isDisplay: false,
          guard: ["pdm-product-weight:read"],
        },
      ],
    },
    {
      title: "Tracking",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Material",
          url: "/admin/pdm/pdm-material",
          isDisplay: false,
          guard: ["pdm-material:read"],
        },
      ],
    },
  ],

  // Setting
  navSetting: [
    {
      title: "Auth",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      isDisplay: false,
      items: [
        {
          title: "Role Management",
          url: "/admin/setting/role",
          isDisplay: false,
          guard: ["role:read"],
        },
        {
          title: "User Management",
          url: "/admin/setting/user",
          isDisplay: false,
          guard: ["user:read"],
        },
      ],
    },
  ],

  // Course
  navCourse: [
    {
      title: "Video",
      url: "#",
      icon: SquareTerminal,
      isActive: false,
      isDisplay: false,
      items: [
        {
          title: "Management",
          url: "/admin/course/video-management",
          isDisplay: false,
          guard: ["video-management:read"],
        },
        {
          title: "Streaming",
          url: "/admin/course/video-streaming",
          isDisplay: false,
          guard: ["video-streaming:read"],
        },
      ],
    },
  ],

  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain items={data.navMain} nameCategory="Overall" />
        <NavMain items={data.navME} nameCategory="ME" />
        <NavMain items={data.navPDM} nameCategory="PDM" />
        <NavMain items={data.navCourse} nameCategory="Course" />
        <NavMain items={data.navSetting} nameCategory="Setting (Root Admin)" />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
