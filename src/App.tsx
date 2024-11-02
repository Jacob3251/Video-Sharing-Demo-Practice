import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Post from "./pages/Post";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Post></Post>,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
