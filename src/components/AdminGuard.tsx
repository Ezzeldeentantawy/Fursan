import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./isLoggedIn";

const AdminGuard = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Verifying Permissions...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
        return <Navigate to="/unauthorized" replace />;
    }
    
    return <Outlet />;
};

export default AdminGuard;