import { useParams, Link, Routes, Route, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../utilis/Auth';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, FormLabel, Input, Text } from '@chakra-ui/react';


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
    console.log(logout)
    const handleLogout = () => {
        if(logout){
            console.log(auth.auth)
            auth.logout();
        }
    }

    return (
        <form className='w-1/2' onSubmit={handleLogout}>
            <div className='w-1/3 flex flex-row justify-around'>
                <Button className='ml-3 mt-2'> <Link to='' state={{ new_id: new_id }}>Home</Link> </Button>
                <Button className='ml-3 mt-2' type="submit" onClick={() => setLogout(true)}> Logout </Button>
            </div>
        </form>
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
            username
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
        <div className='flex flex-col ml-4 mt-2 w-1/2'>
            <Text className='uppercase font-sans italic' fontSize='40px' as='b' color='blue.800'>Admin Dashboard</Text>
            <Text className='mt-1' as='u' fontWeight='bold' fontSize='30px' color='green.600'>Welcome {data?.admin.username}</Text>
            <Text className='mt-1' as='i' fontSize='20px' color='purple.400'> Circulation Value: {data?.admin.circulation}</Text>
            <Text className='mt-1' as='i' fontSize='20px' color='purple.400'> Rate Value: {data?.admin.setRate}</Text>
            <form className='w-1/2' onSubmit={handleSubmit}>
                <FormLabel htmlFor='circulation' color='red'>Circulation</FormLabel>
                <Input className='w-1/4' type='number' id='circulation' name='circulation' value={money.circulation} onChange={handleInputChange} />
                <FormLabel htmlFor='circulation' color='red'>Rate for Exchange: 1 dollar = </FormLabel>
                <Input type='number' id='rate' name='rate' value={money.rate} onChange={handleInputChange} />
                <Button type="submit" className='mt-4'>Submit</Button>
            </form>
        </div>

    )
}

export default AdminDashBoard;