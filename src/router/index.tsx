import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "../pages/login";
import { RegisterPage } from "../pages/register";
import { SettingsPage } from "../pages/settings";
import { Navigate } from "react-router-dom";
import { AuthGuard } from "./AuthGuard";
import { Layout } from "./Layout";
import { HotelReviewPage } from "@/pages/review";

// 临时首页组件（后续可以替换为实际的首页）
const HomePage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">易宿酒店管理后台</h1>
        <p className="mt-4 text-gray-600">欢迎使用商家管理系统</p>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    children: [
      { path: "/home", element: <HomePage /> },
      {
        path: "/account/settings",
        element: <SettingsPage />,
      },
      {
        path: "/hotel/review",
        element: <HotelReviewPage />,
      },
    ],
  },
  // 后续可以在这里添加更多需要保护的路由
  // {
  //   path: "/dashboard",
  //   element: (
  //     <AuthGuard>
  //       <DashboardPage />
  //     </AuthGuard>
  //   ),
  // },
]);

const Routes = () => {
  return <RouterProvider router={router} />;
};
export default Routes;
