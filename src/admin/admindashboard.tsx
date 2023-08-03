import { useParams, Link, Routes, Route, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../utilis/Auth';
import { gql, useMutation, useQuery } from '@apollo/client';


function AdminDashBoard() {
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
    let location = useLocation();
    let new_id = location.state?.new_id || NaN;
    const auth = useAuth();
    const [logout, setLogout] = useState(false);
    // console.log("Admin Dashboard", new_id)
    // console.log("Auth in AdminDashboard", auth.auth)
    const handleLogout = () => {
        if(logout){
            auth.logout();
        }
    }

    return (
        <div>
            <form onSubmit={handleLogout}>
                <button> <Link to='' state={{ new_id: new_id }}>Home</Link> </button>
                <button onClick={() => setLogout(true)}> Logout </button>
            </form>
            
        </div>
    )
}

interface MonetaryControl {
    circulation: string;
    rate: string;
}

function Home() {
    const [money, setCirculation] = useState<MonetaryControl>({
        circulation: '',
        rate: ''
    });

    const Update_Circulation = gql`
    mutation UpdateCirculation($matrixID: ID!, $circulation: Float!) {
        updateCirculation(matrixID: $matrixID, circulation: $circulation)
    }`;

    const Update_Rate = gql`
    mutation UpdateRate($matrixID: ID!, $setRate: Float!) {
        updateRate(matrixID: $matrixID, setRate: $setRate)
    }`;

    const Admin = gql`
    query Admin($id: ID!, $matrixID: ID!){
        admin(_id: $id, matrixID: $matrixID){
            circulation
            setRate
            totalCurrency
        }
    }`;

    const [updateCirculation, { data: circulationData, error: circulationError, reset: circulationReset }] = useMutation(Update_Circulation);
    const [updateRate, { data: rateData, error: rateError, reset: rateReset }] = useMutation(Update_Rate);
    const { loading, error, data, refetch } = useQuery(Admin, {variables: {
            id: localStorage.getItem("adminId") || ``,
            matrixID: localStorage.getItem("matrix_id") || ``
        }
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Submitted")
        console.log(money)
        try{
            const circulationupdate = await updateCirculation({variables: {
                matrixID: localStorage.getItem("matrix_id") || ``,
                circulation: parseFloat(money.circulation)
            }})
            console.log(circulationupdate)
            const rateupdate = await updateRate({variables: {
                matrixID: localStorage.getItem("matrix_id") || ``,
                setRate: parseFloat(money.rate)
            }})
            console.log(rateupdate)
            const refetchData = await refetch()
            console.log(refetchData)
        }
        catch(error){
            console.error(error)
        }
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setCirculation({...money, [name]: value})
    };
    
    return (
        <div>
            <h1>Dashboard</h1>
            <h1>Welcome Admin</h1>
            <p>Circulation Value: {data?.admin.circulation}</p>
            <p>Rate Value: {data?.admin.setRate}</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor='circulation'>Circulation</label>
                <input type='number' id='circulation' name='circulation' value={money.circulation} onChange={handleInputChange} />
                <br/>
                <label htmlFor='circulation'>Rate for Exchange: 1 dollar = </label>
                <input type='number' id='rate' name='rate' value={money.rate} onChange={handleInputChange} />
                <br/>
                <button>Submit</button>
            </form>
        </div>

    )
}

export default AdminDashBoard;