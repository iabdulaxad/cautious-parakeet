import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { roleHome } from "../utils/roles";
import { Loading } from "../ui";

// ProtectedRoute gates a subtree behind authentication and (optionally) a set
// of allowed roles. While the session is still being restored it shows a
// loader instead of bouncing the user to /login.
export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, role, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <Loading label="Checking your session…" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return children;
}
