import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.babsinogen.quire",
  appName: "Babseinstein",
  webDir: "dist/client",
  server: {
    androidScheme: "https",
  },
};

export default config;
