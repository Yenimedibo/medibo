export type AppRouteMode = 'public' | 'clerk' | 'auth-unavailable';
export function appRouteMode(location: string, clerkConfigured: boolean): AppRouteMode;
