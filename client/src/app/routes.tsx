import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";

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

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><Home /></Suspense> },
      { path: "category/:id", element: <Suspense fallback={<PageLoader />}><Category /></Suspense> },
      { path: "product/:id", element: <Suspense fallback={<PageLoader />}><ProductDetail /></Suspense> },
      { path: "luxury/product/:id", element: <Suspense fallback={<PageLoader />}><ProductDetail isLuxuryRoute={true} /></Suspense> },
      { path: "cart", element: <Suspense fallback={<PageLoader />}><Cart /></Suspense> },
      { path: "checkout", element: <Suspense fallback={<PageLoader />}><Checkout /></Suspense> },
      { path: "login", element: <Suspense fallback={<PageLoader />}><Login /></Suspense> },
      { path: "register", element: <Suspense fallback={<PageLoader />}><Register /></Suspense> },
      { path: "account", element: <Suspense fallback={<PageLoader />}><Account /></Suspense> },
      { path: "category/sale", element: <Suspense fallback={<PageLoader />}><Sale /></Suspense> },
      { path: "wishlist", element: <Suspense fallback={<PageLoader />}><Wishlist /></Suspense> },
      { path: "luxury", element: <Suspense fallback={<PageLoader />}><Luxury /></Suspense> },
    ],
  },
]);
