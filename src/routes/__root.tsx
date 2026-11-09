import { useEffect } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Babseinstein";
const wrapper = import.meta.env.VITE_WRAPPER === "true";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "A study desk built from retrieval practice, spacing, interleaving, and the other methods with real evidence.",
      },
      { name: "theme-color", content: "#F4EFE6" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: wrapper ? "./favicon.svg" : "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
      {
        rel: "manifest",
        href: wrapper ? "./manifest.webmanifest" : "/__grok/manifest.webmanifest",
      },
      {
        rel: "apple-touch-icon",
        href: wrapper ? "./icon-192.png" : "/__grok/icon-180.png",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  useEffect(() => {
    if (!wrapper || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }, []);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
