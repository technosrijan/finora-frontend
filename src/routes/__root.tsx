import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Finora — Enterprise Financial Intelligence" },
      { name: "description", content: "Upload up to 3 annual report PDFs for instant AI-powered financial analysis. Compare KPI dashboards, risk analysis, financial ratios, and investment signals side-by-side." },
      { name: "author", content: "Finora" },
      { property: "og:title", content: "Finora — Enterprise Financial Intelligence" },
      { property: "og:description", content: "Upload up to 3 annual report PDFs for instant AI-powered financial analysis. Compare KPI dashboards, risk analysis, financial ratios, and investment signals side-by-side." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Finora" },
      { name: "twitter:title", content: "Finora — Enterprise Financial Intelligence" },
      { name: "twitter:description", content: "Upload up to 3 annual report PDFs for instant AI-powered financial analysis. Compare KPI dashboards, risk analysis, financial ratios, and investment signals side-by-side." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/8e49628a-c3cd-4140-97dd-63cd3136d63b" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/8e49628a-c3cd-4140-97dd-63cd3136d63b" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
