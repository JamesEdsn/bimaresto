import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";
import MenusPage from "./pages/MenusPage";
import Categories from "./pages/Categories";
import Promos from "./pages/Promos";
import Staff from "./pages/Staff";
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import POSDashboard from "./pages/pos/POSDashboard";

const dashboardChildren = [
  { index: true, Component: Dashboard },
  { path: "analytics", Component: Analytics },
  { path: "orders", Component: Orders },
  { path: "tables", Component: Tables },
  { path: "menus", Component: MenusPage },
  { path: "categories", Component: Categories },
  { path: "promos", Component: Promos },
  { path: "staff", Component: Staff },
  { path: "payments", Component: Payments },
  { path: "*", Component: NotFound },
];

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/admin",
    Component: Layout,
    children: dashboardChildren,
  },
  {
    path: "/dashboard",
    Component: Layout,
    children: dashboardChildren,
  },
  {
    path: "/pos",
    Component: POSDashboard,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);