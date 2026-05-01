import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./isLoggedIn";

const EmployerGuard = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Verifying Permissions...</div>;
    }

    // If no user, redirect to login but save the current location 
    // so we can send them back after they log in.
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authorization: Check if the user has the 'employer' role
    // Match this with your Laravel 'role:employer' middleware logic
    if (user.role !== 'employer') {
        return <Navigate to="/unauthorized" replace />;
    }

    // If everything is fine, render the child routes
    return <Outlet />;
}

export default EmployerGuard