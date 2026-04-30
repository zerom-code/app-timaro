import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shawarma.eats',
  appName: 'Shawarma TiMaRo',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com'],
      clientId: '325924082125-4b6aln0skmnf60eog6ap2ouee5q45n6p.apps.googleusercontent.com',
      google: {
        skipNativeAuth: true,
        clientId: '325924082125-4b6aln0skmnf60eog6ap2ouee5q45n6p.apps.googleusercontent.com',
      },
    },
  },
};

export default config;
