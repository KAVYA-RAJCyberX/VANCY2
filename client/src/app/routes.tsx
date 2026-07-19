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

// Static Pages
const About = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.About })));
const Contact = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.Contact })));
const Shipping = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.Shipping })));
const Terms = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.Privacy })));
const FAQ = lazy(() => import("./pages/StaticPages").then((m) => ({ default: m.FAQ })));


// Loading fallback component
const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center bg-[#F5F1E8]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C9A961] border-t-transparent" />
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
