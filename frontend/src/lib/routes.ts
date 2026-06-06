export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  partnerDashboard: "/dashboard/partner",
  adminDashboard: "/dashboard/admin",
  city: (citySlug: string) => `/things-to-do/${citySlug}`,
  activity: (activitySlug: string) => `/activities/${activitySlug}`,
  checkout: (activitySlug: string) => `/checkout/${activitySlug}`
} as const;
