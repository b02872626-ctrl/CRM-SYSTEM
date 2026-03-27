export type NavigationItem = {
  label: string;
  href: string;
  title: string;
  description: string;
  allowedRoles?: string[];
  icon?: React.ElementType;
};
