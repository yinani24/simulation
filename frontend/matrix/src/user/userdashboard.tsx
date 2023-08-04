import {useParams, Link, Routes, Route, useLocation} from 'react-router-dom';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useAuth } from '../utilis/Auth';
import Profile from './profile'; 
import BlockChain from './blockchain';
import BlockMine from './blockmine';
import { useQuery, gql, useMutation } from '@apollo/client';

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
    // let {user} = useParams()
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
    console.log("User Dashboard", new_id)
    console.log("Auth in UserDashboard", auth.auth)
    const handleLogout = () => {
        if(logout){
            auth.logout();
        }
    }
    return(
        <div>
        <form onSubmit={handleLogout}>  
            <button> <Link to='' state={{new_id: new_id}}>Home</Link> </button>
            <button> <Link to='blockmine' state={{new_id: new_id}}>Block Mine</Link> </button> 
            <button> <Link to='blockchain' state={{new_id: new_id}}>Block Chain</Link> </button>
            <button> <Link to='Profile' state={{new_id: new_id}}>Profile</Link> </button>
            <button onClick={() => setLogout(true)}> Logout </button>
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
        <form onSubmit={handleSubmit}>
                <label>Send Money To: </label>
                <select onChange={handleOptionChange}>
                    <option value="">Select an option</option>
                    {   
                        allUserData?.users.map((user: UserType) => (
                            user._id !== localStorage.getItem("userId") ? 
                            <option key={user._id} value={user._id}>{user.username}</option>
                            :
                            null
                        ))
                    }
                </select>
                <p>Selected option: {sendUser?.username}</p>
                <label htmlFor='amount'>Amount To Transfer: </label>
                <input type="number" name="amount" value={sendUser.amount} onChange={handlesendUser}/>
                <br/>
                <button type='submit'>Send</button>
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
        <div>
        <p>Credit Card Details</p>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='amount'>Amount To Buy: </label>
                <input type="number" name="amount" value={Carddetails.amount} onChange={handleCardChange}/>
            </div>
            <div>
                <label htmlFor='name'>Name on Card: </label>
                <input type="text" name="name" value={Carddetails.name} onChange={handleCardChange}/>        
            </div>
            <div>
                <label htmlFor='cardNumber'>Card Number: </label>
                <input type="text" name="cardNumber" value={Carddetails.cardNumber} onChange={handleCardChange}/>        
            </div>
            <div>
                <label htmlFor='expiry'>Expiry: </label>
                <input type="text" name="expiry" value={Carddetails.expiry} onChange={handleCardChange}/>        
            </div>
            <div>
                <label htmlFor='cvv'>CVV: </label>
                <input type="text" name="cvv" value={Carddetails.cvv} onChange={handleCardChange}/>        
            </div>
            <button type='submit'>Buy</button>
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
        <div>
            <h1>Dashboard</h1>
            <h2>Welcome {currUserData?.user.username}</h2>
            <p>Current Balance: {currUserData?.user.current_balance} </p>
            <p>Current Trading Value: 1 dollar = {currRateData?.getRate} Coins</p>
            <h2> Trading with other users in the matrix </h2>
            <Transfer username={currUserData?.user.username}/>
            <br/>
            <button onClick={() => {if (!buy){setBuy(true)} else {setBuy(false)}}}>Do you want to buy some coins?</button>
            {buy? <Buy refetch={currUserRefetch}/> : null}
        </div>
        
    )
}

export default UserDashBoard;