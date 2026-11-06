import { createHashHistory, createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // The phone package has no server. Hash routes stay on index.html, so a
  // refresh or a direct open of Library still loads. The preview keeps normal URLs.
  const history =
    import.meta.env.VITE_WRAPPER === "true" && typeof window !== "undefined"
      ? createHashHistory()
      : undefined;
  return createRouter({
    routeTree,
    ...(history ? { history } : {}),
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
  });
}
