import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import MarketDetails from "./pages/MarketDetails";
import CreateMarket from "./pages/CreateMarket";
import BettingMarket from "./pages/BettingMarket";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import useAuthStore from "./store/authStore";

function App() {

  const isAdmin = useAuthStore((state) => state.role) === "admin";

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <Dashboard />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/markets"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <Markets />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/markets/create"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <CreateMarket />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/markets/:id"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <MarketDetails />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/markets/:id/bet"
          element={
            <ProtectedRoute>
              {isAdmin ? <Navigate to="/admin" /> : <BettingMarket />}
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;