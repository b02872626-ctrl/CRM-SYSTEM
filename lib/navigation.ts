import type { NavigationItem } from "@/types/navigation";

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    title: "Dashboard",
    description: "Track the internal CRM at a glance once summary widgets are added."
  },
  {
    label: "Campaigns",
    href: "/campaigns",
    title: "Campaigns",
    description: "Organize outbound efforts and target segments before working company lists."
  },
  {
    label: "Active Deals",
    href: "/deals",
    title: "Active Deals",
    description: "Follow current opportunities through the sales process."
  },
  {
    label: "Candidate Pipeline",
    href: "/candidates",
    title: "Candidate Pipeline",
    description: "Review sourcing and recruitment stages for candidate flow."
  }
];

export function getNavigationItem(pathname: string) {
  return (
    navigationItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    navigationItems[0]
  );
}
