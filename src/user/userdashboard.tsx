import {useParams, Link, Routes, Route, useLocation} from 'react-router-dom';
import React, { ChangeEvent, FormEvent, useState } from 'react';
 

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
    console.log("Admin Dashboard", new_id)
    return(
        <div>
            <button> <Link to='' state={{new_id: new_id}}>Home</Link> </button>
            <button> <Link to='blockmine' state={{new_id: new_id}}>Block Mine</Link> </button> 
            <button> <Link to='blockchain' state={{new_id: new_id}}>Block Chain</Link> </button>
            <button> <Link to='Profile' state={{new_id: new_id}}>Profile</Link> </button>
        </div>
    )
}

function DropdownList() {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div>
      <select value={selectedOption} onChange={handleOptionChange}>
        <option value="">Select an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
      <p>Selected option: {selectedOption}</p>
    </div>
  );
}

function Buy(){
    const [Carddetails, setCard] = useState(
        {cardNumber: 0, name: "", expiry: "", cvv: 0}
    )
    
    const handleCardChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setCard((Carddetails)  => ({...Carddetails, [name]: value}))
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(Carddetails)
    }

    return(
        <div>
        <p>Credit Card Details</p>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor='Name'>Card Number: </label>
                <input type="text" value={Carddetails.name} onChange={handleCardChange}/>        
            </div>
            <div>
                <label htmlFor='cardNumber'>Card Number: </label>
                <input type="number" value={Carddetails.cardNumber} onChange={handleCardChange}/>        
            </div>
            <div>
                <label htmlFor='expiry'>Expiry: </label>
                <input type="text" value={Carddetails.expiry} onChange={handleCardChange}/>        
            </div>
            <div>
                <label htmlFor='cvv'>CVV: </label>
                <input type="number" value={Carddetails.cvv} onChange={handleCardChange}/>        
            </div>
        </form>
        </div>
    )
}

function Home(){
    const [amount, setAmount] = useState(0)
    const [buy, setBuy] = useState(false)
    return(
        <div>
            <h1>Dashboard</h1>
            <h1>Welcome User</h1>
            <p>Current Balance: XYZ </p>
            <p>Current Trading Value: 1 dollar = 1 XYZ</p>
            <p>Send Money to: </p>
            <DropdownList/>
            <p>Amount: </p>
            <input type="number" value={amount} onChange={(e)=>setAmount(parseInt(e.target.value))}/>
            <button>Send</button>
            <button onClick={() => {setBuy(true)}}>Do you want to buy some coins?</button>
            {buy? <Buy/> : null}
        </div>
        
    )
}

function BlockMine(){
    return(
        <div>
            <h1>Block Mine</h1>      
        </div>
    )
}

function BlockChain(){
    return(
        <div>
            <form>
                <label htmlFor='Name'>Name: </label>
                    
            </form> 
        </div>
    )
}

function Profile(){
    const paid = 0
    const [update, setUpdate] = useState({
        name: "",
        email: "",
        password: "",
    })

    const [suceess, setSuccess] = useState(false)

    const handleUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setUpdate((update)  => ({...update, [name]: value}))
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(update)
    }

    return(
        <div>
            <label>Previous Transacations: </label>
            <div>
                <p>Paid ${paid}</p>
            </div>
            <h3>Update</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor='Name'>Name: </label>
                <input type="text" value={update.name} onChange={handleUpdate}/>
                <label htmlFor='email'>Email: </label>
                <input type="email" value={update.email} onChange={handleUpdate}/>
                <label htmlFor='password'>Password: </label>
                <input type="password" value={update.password} onChange={handleUpdate}/>
                <button onClick={() => {setSuccess(true)}}>Update</button>
            </form>
            {suceess? <p>Update Successful</p> : null}
        </div>
    )
}

export default UserDashBoard;