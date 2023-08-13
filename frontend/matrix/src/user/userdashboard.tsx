import {useParams, Link, Routes, Route, useLocation} from 'react-router-dom';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useAuth } from '../utilis/Auth';
import Profile from './profile'; 
import BlockChain from './blockchain';
import BlockMine from './blockmine';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Button, FormLabel, Input, Select, Text } from '@chakra-ui/react';

interface UserType {
    _id: string;
    username: string;
}

interface Data{
    from: string;
    to: string;
    amount: string;
}

function UserDashBoard(){
    return(
        <>
        <NavBar/>
        <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='blockmine' element={<BlockMine/>}/>
            <Route path='blockchain' element={<BlockChain/>}/>
            <Route path='Profile' element={<Profile/>}/>
        </Routes>
        </>
    )
}

function NavBar(){
    let location = useLocation();
    let new_id = location.state?.new_id || NaN;
    const auth = useAuth();
    const [logout, setLogout] = useState(false);
    //console.log("User Dashboard", new_id)
    console.log("Auth in UserDashboard", auth.auth)
    const handleLogout = () => {
        if(logout){
            auth.logout();
        }
    }
    return(
        <div>
            <form onSubmit={handleLogout}> 
                <div className='w-1/2 flex flex-row justify-around'> 
                    <Button className='m-2'> <Link to='' state={{new_id: new_id}}>Home</Link> </Button>
                    <Button className='m-2'> <Link to='blockmine' state={{new_id: new_id}}>Block Mine</Link> </Button> 
                    <Button className='m-2'> <Link to='blockchain' state={{new_id: new_id}}>Block Chain</Link> </Button>
                    <Button className='m-2'> <Link to='Profile' state={{new_id: new_id}}>Profile</Link> </Button>
                    <Button className='m-2' type="submit" onClick={() => setLogout(true)}> Logout </Button>
                </div>
            </form>
        </div>
    )
}

function Transfer(username: {username: string | undefined}){
    const [sendUser, setsendUser] = useState({id: "", amount: "", username: ""})
    
    const ALL_USERS = gql`
    query Users($matrixID: ID!){
        users(matrixID: $matrixID){
            _id
            matrixID
            email
            username
            password
        }
    }`;
    //work on this block creation to make a new block and understand how datatypes will be sent
    const BLOCK_CREATION = gql`
    mutation CreateBlock($userID: ID!, $matrixID: ID!, $data: DataType!){
        createBlock(userID: $userID, matrixID: $matrixID, data: $data){
            _id
            _num
            data{
                from
                to
                amount
            }
        }
    }`;

    const {loading: allUserLoading, error: allUserError, data: allUserData, refetch: allUserRefetch} = useQuery(ALL_USERS, {
        variables: { matrixID: localStorage.getItem("matrix_id") },
    });

    const [createBlock, {data: blockData, error: blockError, reset: blockReset}] = useMutation(BLOCK_CREATION);

    const handleOptionChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedUserId = event.target.value;
        const selectedUser = allUserData?.users.find((user: UserType) => user._id === selectedUserId) || null;
        setsendUser((sendUser)  => ({...sendUser, id: selectedUserId, username: selectedUser?.username || ""}))
    };

    const handlesendUser = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setsendUser({...sendUser,[e.target.name]: value})
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        //console.log(sendUser)
        try{
            const response = await createBlock({variables: {
                userID: localStorage.getItem("userId") || ``,
                matrixID: localStorage.getItem("matrix_id") || ``,
                data: {from: username.username, to: sendUser.username, amount: parseFloat(sendUser.amount)}
            }
            }); 
            console.log(response)
            if(response){
                blockReset()
            }
        }catch(error){
            console.error(error);
        }
        
    }

    console.log("Send User", sendUser)
    return(
        <form className='w-1/2 ' onSubmit={handleSubmit}>
                <FormLabel className='m-2'>Send Money To: </FormLabel>
                <Select className='m-2 w-1/2' variant='filled' onChange={handleOptionChange}>
                    <option className='w-1/2' value="">Select an option</option>
                    {   
                        allUserData?.users.map((user: UserType) => (
                            user._id !== localStorage.getItem("userId") ? 
                            <option className='w-1/2' key={user._id} value={user._id}>{user.username}</option>
                            :
                            null
                        ))
                    }
                </Select>
                <Text className='m-2' as='i' fontWeight='bold' color='blue.500'>Selected option: {sendUser?.username}</Text>
                <div className='m-2 w-1/2'>
                    <FormLabel htmlFor='amount'>Amount To Transfer: </FormLabel>
                    <Input className='my-2' type="number" name="amount" value={sendUser.amount} onChange={handlesendUser}/>
                </div>
                <Button className='w-1/4 my-4 ml-2' type='submit'>Send</Button>
            </form>
    )

}

function Buy(refetch: {refetch: any}){
    const [Carddetails, setCard] = useState(
        {amount: "", cardNumber: "", name: "", expiry: "", cvv: ""}
    )
    
    const handleCardChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setCard((Carddetails)  => ({...Carddetails, [name]: value}))
    }

    const BUY_COINS = gql`
    mutation updateTotalCurrency($matrixID: ID!, $totalCurrency: Float!){
        updateTotalCurrency(matrixID: $matrixID, totalCurrency: $totalCurrency)
    }`;

    const UPDATE_USER = gql`
    mutation UpdateUser($ID: ID!, $matrixID: ID!, $current_balance: Float) {
        updateUser(id: $ID, matrixID: $matrixID, current_balance: $current_balance) {
            _id
            username
        }
    }`;

    const [buyCoins, {loading: buyLoading, error: buyError, data: buyData}] = useMutation(BUY_COINS);
    const [updateUser, {data: userData, error: userError, reset: userReset}] = useMutation(UPDATE_USER);
    
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(Carddetails)
        try {
            const response = await buyCoins({variables: {
                    matrixID: localStorage.getItem("matrix_id") || ``,
                    totalCurrency: parseFloat(Carddetails.amount),
                }
            });
            console.log(response)
            
            if(response){
                const update = await updateUser({variables: {
                    ID: localStorage.getItem("userId") || ``,
                    matrixID: localStorage.getItem("matrix_id") || ``,
                    current_balance: parseFloat(Carddetails.amount),
                    }
                });
                console.log("User update after buying coins", update)
                if(update){
                    refetch.refetch()
                }
            }
            return response
        }catch (error) {
            console.error(error);
        }
    }

    return(
        <div >
        <Text className='m-2' as='i' color='blue.500' fontWeight='bold'>Credit Card Details</Text>
        <form className='w-1/4' onSubmit={handleSubmit}>
            <div className='m-2'>
                <FormLabel htmlFor='amount'>Amount To Buy: </FormLabel>
                <Input type="number" name="amount" value={Carddetails.amount} onChange={handleCardChange}/>
            </div>
            <div className='m-2'>
                <FormLabel htmlFor='name'>Name on Card: </FormLabel>
                <Input type="text" name="name" value={Carddetails.name} onChange={handleCardChange}/>        
            </div>
            <div className='m-2'>
                <FormLabel htmlFor='cardNumber'>Card Number: </FormLabel>
                <Input type="text" name="cardNumber" value={Carddetails.cardNumber} onChange={handleCardChange}/>        
            </div>
            <div className='m-2'>
                <FormLabel htmlFor='expiry'>Expiry: </FormLabel>
                <Input type="text" name="expiry" value={Carddetails.expiry} onChange={handleCardChange}/>        
            </div>
            <div className='m-2'>
                <FormLabel htmlFor='cvv'>CVV: </FormLabel>
                <Input type="text" name="cvv" value={Carddetails.cvv} onChange={handleCardChange}/>        
            </div>
            <Button className='m-2' type='submit'>Buy</Button>
        </form>
        </div>
    )
}

function Home(){
    const [buy, setBuy] = useState(false)
    
    const CURRENT_USER = gql`
    query User($ID: ID! $MatrixID: ID!){
        user(_id: $ID matrixID: $MatrixID){
            _id
            matrixID
            email
            username
            password
            current_balance
        }
    }`;
    
    const CURRENT_TRADING_VALUE = gql`
    query GetRate($matrixID: ID!){
        getRate(matrixID: $matrixID)
    }
    `;

    const { loading: currRateLoading, error: currRateError, data: currRateData, refetch: currRateRefetch } = useQuery(CURRENT_TRADING_VALUE, {
        variables: { matrixID: localStorage.getItem("matrix_id") },
    });
    const { loading: currUserLoading, error: currUserError, data: currUserData, refetch: currUserRefetch } = useQuery(CURRENT_USER, {
        variables: { ID: localStorage.getItem("userId"), MatrixID: localStorage.getItem("matrix_id") },
    });
 
    return(
        <div className='flex flex-col bg-gradient-to-r from-yellow to-gray-light'>
            <Text className='m-2 uppercase font-sans italic' fontSize='40px' as='b' color='blue.800'>User Dashboard</Text>
            <Text className='m-2' as='u' fontWeight='bold' fontSize='30px' color='green.600'>Welcome {currUserData?.user.username}</Text>
            <Text className='m-2' as='i' fontSize='20px' color='purple.400'>Current Balance: {currUserData?.user.current_balance} </Text>
            <Text className='m-2' as='i' fontSize='20px' color='purple.400'>Current Trading Value: 1 dollar = {currRateData?.getRate} Coins</Text>
            <Text className='m-2' fontWeight='bold' color='teal.400'> Trading with other users in the matrix </Text>
            <Transfer username={currUserData?.user.username}/>
            <Button colorScheme='teal' className='m-2 w-1/4' onClick={() => {if (!buy){setBuy(true)} else {setBuy(false)}}}>Do you want to buy some coins?</Button>
            {buy? <Buy refetch={currUserRefetch}/> : null}
        </div>
        
    )
}

export default UserDashBoard;