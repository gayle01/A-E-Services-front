export const SCREEN_PATHS = {
  welcome: '/welcome',
  auth: '/auth',
  'client-invite': '/client-invite',
  home: '/home',
  requests: '/requests',
  jobs: '/jobs',
  contracts: '/contracts',
  workers: '/workers',
  services: '/services',
  profile: '/profile',
  account: '/account',
  notifications: '/notifications',
  invite: '/invite',
  'worker-setup': '/worker-setup',
  'worker-log': '/worker-log',
  'review-work': '/review-work'
};

const PATH_TO_SCREEN = Object.fromEntries(
  Object.entries(SCREEN_PATHS).map(([screen, path]) => [path, screen])
);

export function screenFromPath(pathname) {
  return PATH_TO_SCREEN[pathname] || null;
}

export function pathForScreen(screen) {
  return SCREEN_PATHS[screen] || '/home';
}

