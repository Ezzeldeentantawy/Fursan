import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./isLoggedIn";

const SiteAdminGuard = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Verifying Permissions...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Check if user has site_admin or super_admin role
    if (user.role !== 'site_admin' && user.role !== 'super_admin') {
        return <Navigate to="/unauthorized" replace />;
    }
    
    return <Outlet />;
};

export default SiteAdminGuard;
