import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { NotFound } from "./pages/NotFound";

// Lazy load all page components
const Home = lazy(() => import("./pages/Home").then((module) => ({ default: module.Home })));
const Category = lazy(() => import("./pages/Category").then((module) => ({ default: module.Category })));
const ProductDetail = lazy(() => import("./pages/ProductDetail").then((module) => ({ default: module.ProductDetail })));
const Cart = lazy(() => import("./pages/Cart").then((module) => ({ default: module.Cart })));
const Checkout = lazy(() => import("./pages/Checkout").then((module) => ({ default: module.Checkout })));
const Login = lazy(() => import("./pages/Login").then((module) => ({ default: module.Login })));
const Register = lazy(() => import("./pages/Register").then((module) => ({ default: module.Register })));
const Account = lazy(() => import("./pages/Account").then((module) => ({ default: module.Account })));
const Sale = lazy(() => import("./pages/Sale").then((module) => ({ default: module.Sale })));
const Wishlist = lazy(() => import("./pages/Wishlist").then((module) => ({ default: module.Wishlist })));
const Luxury = lazy(() => import("./pages/Luxury").then((module) => ({ default: module.Luxury })));
const Lookbook = lazy(() => import("./pages/Lookbook").then((m) => ({ default: m.Lookbook })));
const Journal = lazy(() => import("./pages/Journal").then((m) => ({ default: m.Journal })));

// Static Pages
const About = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.About })));
const Contact = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.Contact })));
const Shipping = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.Shipping })));
const Terms = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.Privacy })));
const FAQ = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.FAQ })));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin").then((m) => ({ default: m.AdminLogin })));
const Dashboard = lazy(() => import("./pages/admin/Dashboard").then((m) => ({ default: m.Dashboard })));
const AdminOrders = lazy(() => import("./pages/admin/Orders").then((m) => ({ default: m.Orders })));
const Inventory = lazy(() => import("./pages/admin/Inventory").then((m) => ({ default: m.Inventory })));
const AdminProducts = lazy(() => import("./pages/admin/Products").then((m) => ({ default: m.Products })));
const Customers = lazy(() => import("./pages/admin/Customers").then((m) => ({ default: m.Customers })));
const Discounts = lazy(() => import("./pages/admin/Discounts").then((m) => ({ default: m.Discounts })));
const Analytics = lazy(() => import("./pages/admin/Analytics").then((m) => ({ default: m.Analytics })));
const Staff = lazy(() => import("./pages/admin/Staff").then((m) => ({ default: m.Staff })));
const Settings = lazy(() => import("./pages/admin/Settings").then((m) => ({ default: m.Settings })));
const AdminReturns = lazy(() => import("./pages/admin/Returns").then((m) => ({ default: m.Returns })));
const AdminSupport = lazy(() => import("./pages/admin/Support").then((m) => ({ default: m.Support })));
const AdminReviews = lazy(() => import("./pages/admin/Reviews").then((m) => ({ default: m.Reviews })));
import { AdminLayout } from "./components/AdminLayout";

// Loading fallback component (Premium Minimal Loader)
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="h-px w-32 bg-border relative overflow-hidden">
      <div className="absolute top-0 left-0 h-full w-full bg-foreground transform -translate-x-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/admin",
    children: [
      { path: "login", element: <Suspense fallback={<PageLoader />}><AdminLogin /></Suspense> },
      {
        path: "",
        element: <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>,
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
          { path: "orders", element: <Suspense fallback={<PageLoader />}><AdminOrders /></Suspense> },
          { path: "inventory", element: <Suspense fallback={<PageLoader />}><Inventory /></Suspense> },
          { path: "products", element: <Suspense fallback={<PageLoader />}><AdminProducts /></Suspense> },
          { path: "customers", element: <Suspense fallback={<PageLoader />}><Customers /></Suspense> },
          { path: "discounts", element: <Suspense fallback={<PageLoader />}><Discounts /></Suspense> },
          { path: "returns", element: <Suspense fallback={<PageLoader />}><AdminReturns /></Suspense> },
          { path: "support", element: <Suspense fallback={<PageLoader />}><AdminSupport /></Suspense> },
          { path: "reviews", element: <Suspense fallback={<PageLoader />}><AdminReviews /></Suspense> },
          { path: "analytics", element: <Suspense fallback={<PageLoader />}><Analytics /></Suspense> },
          { path: "staff", element: <Suspense fallback={<PageLoader />}><Staff /></Suspense> },
          { path: "settings", element: <Suspense fallback={<PageLoader />}><Settings /></Suspense> },
        ]
      }
    ]
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><Home /></Suspense> },
      { path: "category/:id", element: <Suspense fallback={<PageLoader />}><Category /></Suspense> },
      { path: "collections", element: <Suspense fallback={<PageLoader />}><Category /></Suspense> },
      { path: "product/:slug", element: <Suspense fallback={<PageLoader />}><ProductDetail /></Suspense> },
      { path: "cart", element: <Suspense fallback={<PageLoader />}><Cart /></Suspense> },
      { path: "checkout", element: <Suspense fallback={<PageLoader />}><Checkout /></Suspense> },
      { path: "login", element: <Suspense fallback={<PageLoader />}><Login /></Suspense> },
      { path: "register", element: <Suspense fallback={<PageLoader />}><Register /></Suspense> },
      { path: "account", element: <Suspense fallback={<PageLoader />}><Account /></Suspense> },
      { path: "sale", element: <Suspense fallback={<PageLoader />}><Sale /></Suspense> },
      { path: "wishlist", element: <Suspense fallback={<PageLoader />}><Wishlist /></Suspense> },
      { path: "luxury", element: <Suspense fallback={<PageLoader />}><Luxury /></Suspense> },
      { path: "lookbook", element: <Suspense fallback={<PageLoader />}><Lookbook /></Suspense> },
      { path: "journal", element: <Suspense fallback={<PageLoader />}><Journal /></Suspense> },
      
      // Static Pages
      { path: "about", element: <Suspense fallback={<PageLoader />}><About /></Suspense> },
      { path: "contact", element: <Suspense fallback={<PageLoader />}><Contact /></Suspense> },
      { path: "shipping", element: <Suspense fallback={<PageLoader />}><Shipping /></Suspense> },
      { path: "terms", element: <Suspense fallback={<PageLoader />}><Terms /></Suspense> },
      { path: "privacy", element: <Suspense fallback={<PageLoader />}><Privacy /></Suspense> },
      { path: "faq", element: <Suspense fallback={<PageLoader />}><FAQ /></Suspense> },

      // Catch-all 404
      { path: "*", element: <NotFound /> },
    ],
  },
]);
