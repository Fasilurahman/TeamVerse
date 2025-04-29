import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { RootState } from "../../redux/store";

interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

const AdminRoute: React.FC = () => {
    const token = useSelector((state: RootState) => state.auth.token);

    if(!token){
        return <Navigate to='/login' replace />
    }

    let payload: TokenPayload;
    try {
        payload = jwtDecode<TokenPayload>(token);
    } catch (error) {
        return <Navigate to='/login' replace />
    }

    if( payload.role != 'admin'){
        return <Navigate to='/login' replace />
    }
    return <Outlet />;
}

export default AdminRoute;