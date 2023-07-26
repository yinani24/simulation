import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './Auth';

function ProtectedRoutes() {
    const auth = useAuth();
    const location = useLocation();
    const new_id = location.state?.new_id || NaN;

    // const string: string = location.pathname
    // const parts: string [] = string.split("/");
    // const path: string[] = parts.slice(0, 3);
    // const result: string = path.join("/");
    //console.log(result);
    // console.log("Pathanme in Private Routes", location.pathname)
    // console.log(auth.auth)
    const item = localStorage.getItem("sessionKey");
    return item ? <Outlet /> : <Navigate to={''} state={{ new_id: new_id }} />;
}

export default ProtectedRoutes;