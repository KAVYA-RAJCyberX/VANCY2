import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  // force HMR reload
  return <RouterProvider router={router} />;
}
