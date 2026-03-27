import { LayoutDashboard, Target, BadgeDollarSign, Users } from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    title: "Dashboard",
    description: "Track the internal CRM at a glance once summary widgets are added.",
    icon: LayoutDashboard
  },
  {
    label: "Campaigns",
    href: "/campaigns",
    title: "Campaigns",
    description: "Organize outbound efforts and target segments before working company lists.",
    icon: Target
  },
  {
    label: "Active Deals",
    href: "/deals",
    title: "Active Deals",
    description: "Follow current opportunities through the sales process.",
    icon: BadgeDollarSign
  },
  {
    label: "Users",
    href: "/users",
    title: "User Management",
    description: "Manage team roles and access levels.",
    allowedRoles: ["admin"],
    icon: Users
  }
];

export function getNavigationItem(pathname: string) {
  return (
    navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    navigationItems[0]
  );
}
