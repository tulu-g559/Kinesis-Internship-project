import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import MarketDetails from "./pages/MarketDetails";
import CreateMarket from "./pages/CreateMarket";
import Landing from "./pages/Landing";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/markets"
          element={
            <ProtectedRoute>
              <Markets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/markets/create"
          element={
            <ProtectedRoute>
              <CreateMarket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/markets/:id"
          element={
            <ProtectedRoute>
              <MarketDetails />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;