import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import ProtectedRoutes from "./components/ProtectedRoutes";
import MyProfile from "./components/MyProfile";
import RegisterWorker from "./components/RegisterWorker";
import WorkerDetails from "./components/WorkerDetails";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/my-profile",
        element: <MyProfile />,
      },
      {
        path: "/register-worker",
        element: <RegisterWorker />,
      },
      {
        path: "/worker/:id",
        element: <WorkerDetails />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
