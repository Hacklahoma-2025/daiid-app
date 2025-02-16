import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@mantine/core/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UploadPage from "./UploadPage.jsx";

const theme = createTheme({
  /** Put your mantine theme override here */
  fontFamily: "Inter, sans-serif",
  headings: {
    fontFamily: "Inter, sans-serif",
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/upload",
    element: <UploadPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme}>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </MantineProvider>
);
