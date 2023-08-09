import { useParams, Link, Route, Routes, useNavigate } from 'react-router-dom';
import React from 'react';
import Authenticate from './Authenticate';
import { AuthProvider } from '../utilis/Auth';
import { Button, Text } from '@chakra-ui/react';

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
        <div className='w-50 h-50'>
            <Button className='m-5' colorScheme='orange' onClick={navigatetomatrix}>Back</Button>
            <br/>
            <div className='flex flex-col w-full justify-center items-center space-y-16'>
                <Text as="i" fontSize='30px' color='purple.600'>{`Log In or Register as an Admin or User in Matrix ${number}`}</Text>
                <br/>
                <div className='w-1/4 flex flex-row justify-around'>
                    <Button colorScheme='teal'>
                        <Link to={`admin${number}`} state={{ new_id: 1 }}>Admin Register</Link>
                    </Button>
                    <Button colorScheme='teal'>
                        <Link to={`user${number}`} state={{ new_id: 0 }}>User Register</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Matrix;