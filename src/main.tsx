import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Link,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/Toaster";
import { HistoryPage } from "@/pages/HistoryPage";
import { HomePage } from "@/pages/HomePage";
import { MyAccountPage } from "@/pages/MyAccountPage";
import { RoomDetailPage } from "@/pages/RoomDetailPage";
import { RoomsPage } from "@/pages/RoomsPage";
import "./styles.css";

const queryClient = new QueryClient();

function RootLayout() {
  return (
    <>
      <AppShell />
      <Toaster />
    </>
  );
}

function NotFoundPage() {
  useLayoutEffect(() => {
    document.title = "404 — BLOCK-JANKEN";
  }, []);
  return (
    <div className="max-w-xl mx-auto p-12 text-center">
      <h1 className="text-5xl font-black mb-4">404</h1>
      <p className="text-white/50 mb-6">ページが見つかりません</p>
      <Link to="/" className="text-primary font-bold">
        トップへ
      </Link>
    </div>
  );
}

function RouteErrorBoundary() {
  const error = useRouteError();
  useLayoutEffect(() => {
    document.title = "Error — BLOCK-JANKEN";
  }, []);
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "エラーが発生しました";
  return (
    <div className="max-w-xl mx-auto p-12 text-center">
      <h1 className="text-2xl font-black mb-4">読み込みエラー</h1>
      <p className="text-white/50 mb-6">{message}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground font-bold"
      >
        再読み込み
      </button>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "history", element: <HistoryPage /> },
      { path: "mypage", element: <MyAccountPage /> },
      { path: "rooms", element: <RoomsPage /> },
      { path: "rooms/:roomId", element: <RoomDetailPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
