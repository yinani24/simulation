import { useParams, Link, Routes, Route, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../utilis/Auth';


function AdminDashBoard() {
    // console.log("Admin Pathname", desiredPath)
    // console.log("Admin Dashboard", new_id)
    return (
        <>
            <NavBar />
            <Routes>
                <Route path='/' element={<Home />} />
            </Routes>
        </>
    )
}



function NavBar() {
    // let {user} = useParams()
    let location = useLocation();
    let new_id = location.state?.new_id || NaN;
    const auth = useAuth();
    const [logout, setLogout] = useState(false);
    console.log("Admin Dashboard", new_id)
    console.log("Auth in AdminDashboard", auth.auth)
    const handleLogout = () => {
        if(logout){
            auth.logout();
        }
    }
    // let pathname = location.pathname;
    // const endIndex: number = pathname.indexOf("/", 1);
    // const desiredPath: string = pathname.substring(0, endIndex);
    return (
        <div>
            <form onSubmit={handleLogout}>
                <button> <Link to='' state={{ new_id: new_id }}>Home</Link> </button>
                <button onClick={() => setLogout(true)}> Logout </button>
            </form>
            
        </div>
    )
}

function Home() {
    const [circulation, setCirculation] = useState('');
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Submitted")
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setCirculation(value);
    };
    

    return (
        <div>
            <h1>Dashboard</h1>
            <h1>Welcome Admin</h1>
            <form onSubmit={handleSubmit}>
            <label htmlFor='circulation'>Circulation</label>
            <input type='number' id='circulation' value={circulation} onChange={handleInputChange} />
            <button>Submit</button>
            </form>
           
        </div>

    )
}

export default AdminDashBoard;