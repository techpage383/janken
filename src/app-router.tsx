import { createBrowserRouter } from "react-router-dom";

import { RootLayout } from "@/layouts/RootLayout";
import { NotFoundPage } from "@/layouts/NotFoundPage";
import { RouteErrorBoundary } from "@/layouts/RouteErrorBoundary";
import { HistoryPage } from "@/pages/HistoryPage";
import { HomePage } from "@/pages/HomePage";
import { MyAccountPage } from "@/pages/MyAccountPage";
import { RoomDetailPage } from "@/pages/RoomDetailPage";
import { RoomsPage } from "@/pages/RoomsPage";

export const router = createBrowserRouter([
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
