import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.babsinogen.quire",
  appName: "Quire",
  webDir: "dist/client",
  server: {
    androidScheme: "https",
  },
};

export default config;
