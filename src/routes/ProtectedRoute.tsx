import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useUserStore } from "../store/userStore";

const ProtectedRoute = () => {
    const { user , loading, fetchUser } = useUserStore();

    useEffect(() => {
        if (!user) {
            fetchUser();
        }
    }, [fetchUser, user]);

    if (loading) return null;

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;