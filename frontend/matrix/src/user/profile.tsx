import { ChangeEvent, FormEvent, useState } from "react"
import {gql, useMutation, useQuery} from '@apollo/client'

function Profile(){
    const paid = 0
    const [update, setUpdate] = useState({
        name: "",
        email: "",
        password: "",
    })

    const UPDATE_USER = gql`
    mutation UpdateUser($ID: ID!, $matrixID: ID!, $username: String, $email: String, $password: String) {
        updateUser(id: $ID, matrixID: $matrixID, username: $username, email: $email, password: $password) {
            _id
            username
        }
    }`;

    const CURRENT_USER = gql`
    query User($ID: ID! $MatrixID: ID!){
        user(_id: $ID matrixID: $MatrixID){
            email
            username
            current_balance
        }
    }`;

    const [suceess, setSuccess] = useState(false)
    const [updateUser, {data: userData, error: userError, reset: userReset}] = useMutation(UPDATE_USER);
    const { loading: currUserLoading, error: currUserError, data: currUserData, refetch: currUserRefetch } = useQuery(CURRENT_USER, {
        variables: { ID: localStorage.getItem("userId"), MatrixID: localStorage.getItem("matrix_id") },
    });
    
    const handleUpdate = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setUpdate((update)  => ({...update, [name]: value}))
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(update)
        try {
            const response = await updateUser({variables: {
                    ID: localStorage.getItem("userId") || ``,
                    matrixID: localStorage.getItem("matrix_id") || ``,
                    username: update.name,
                    password: update.password,
                    email: update.email
                }
            });
            console.log(response)
            setSuccess(true)
            return response
        }
        catch (error) {
            console.error(error);
        }
    }

    return(
        <div>
            {/* <label>Previous Transacations: </label>
            <div>
                <p>Paid ${paid}</p>
            </div> */}
            <h3>Current Profile</h3>
            <p>Name: {currUserData?.user.username}</p>
            <p>Email: {currUserData?.user.email}</p>
            <p>Current Balance: {currUserData?.user.current_balance}</p>
            <p></p>
            <h3>Change the Fields you want to update</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor='Name'>Name: </label>
                <input type="text" name="name" value={update.name} onChange={handleUpdate}/>
                <br/>
                <label htmlFor='email'>Email: </label>
                <input type="email" name="email" value={update.email} onChange={handleUpdate}/>
                <br/>
                <label htmlFor='password'>Password: </label>
                <input type="password" name="password" value={update.password} onChange={handleUpdate}/>
                <br/>   
                <button onClick={() => {setSuccess(true)}}>Update</button>
            </form>
            {suceess? <p>Update Successful</p> : null}
        </div>
    )
}

export default Profile;