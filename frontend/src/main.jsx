import { createRoot } from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Styles
import "./index.css";
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";

// Pages
import UploadPage from "./UploadPage.jsx";
import App from "./App.jsx";
import ImageStatus from "./ImageStatus.jsx";
import Monitor from "./monitor.jsx";
import ProcessImage from "./ProcessImagePage.jsx";

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
  {
    path: "/image-status",
    element: <ImageStatus />,
  },
  {
    path: "/monitor",
    element: <Monitor />,
  },
  {
    path: "/process-image",
    element: <ProcessImage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <MantineProvider theme={theme}>
    <RouterProvider router={router} />
  </MantineProvider>
);
