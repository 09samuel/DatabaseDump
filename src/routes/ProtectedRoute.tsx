import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUserStore } from "../store/userStore";

const ProtectedRoute = () => {
    const { user, loading, initialized, fetchUser } = useUserStore();

    const location =  useLocation();

    useEffect(() => {
        if (!initialized) {
            fetchUser();
        }
    }, [fetchUser, initialized]);

    if (!initialized || loading) {
        return <div>Loading...</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" replace state={{from: location}} />;
};

export default ProtectedRoute;