import { useParams, Link, Route, Routes, useNavigate } from 'react-router-dom';
import React from 'react';
import Authenticate from './Authenticate';
import { AuthProvider } from '../utilis/Auth';

function Matrix() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<RoutesMade />} />
                <Route path=':admin/*' element={<Authenticate />} />
            </Routes>
        </AuthProvider>
    )
}

function RoutesMade() {
    let { matrix } = useParams();
    const matchResult = typeof matrix === "string" ? matrix.match(/\d+/) : null;
    const number = matchResult ? parseInt(matchResult[0]) : NaN;
    console.log(number)
    const navigate = useNavigate();
    const navigatetomatrix = () => {
        navigate(`/`, { replace: true })
    }
    return (
        <div>
            <h1>{`Log In or Register as an Admin or User in Matrix ${number}`}</h1>
            
            <button>
                <Link to={`admin${number}`} state={{ new_id: 1 }}>Admin Register</Link>
            </button>
            <br/>
            <br/>
            <button>
                <Link to={`user${number}`} state={{ new_id: 0 }}>User Register</Link>
            </button>
            <br/>
            <br/>
            <button onClick={navigatetomatrix}>Back</button>
        </div>
    )
}

export default Matrix;