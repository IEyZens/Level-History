import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminPage from "../pages/AdminPage";
import EventDetailPage from "../pages/EventDetailPage";
import EventsPage from "../pages/EventsPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import PersonalitiesPage from "../pages/PersonalitiesPage";
import ProfilePage from "../pages/ProfilePage";
import RegisterPage from "../pages/RegisterPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return children;
  } else {
    return <Navigate to="login" replace />;
  }
}

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="login" replace />;
  } else if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  } else {
    return children;
  }
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  } else {
    return children;
  }
}

function AppRouter() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/personalities" element={<PersonalitiesPage />} />

      {/* Routes publiques seulement (redirige si connecté) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      {/* Routes admin uniquement */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
