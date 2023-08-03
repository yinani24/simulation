import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './Auth';

function ProtectedRoutes() {
    const auth = useAuth();
    const location = useLocation();
    const new_id = location.state?.new_id || NaN;
    const item = localStorage.getItem("sessionKey");
    return item ? <Outlet /> : <Navigate to={''} state={{ new_id: new_id }} />;
}

export default ProtectedRoutes;