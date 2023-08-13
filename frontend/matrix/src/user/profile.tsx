import { ChangeEvent, FormEvent, useState } from "react"
import {gql, useMutation, useQuery} from '@apollo/client'
import { Button, FormLabel, Input, Text } from "@chakra-ui/react";

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
        <div className="m-2 flex flex-col">
            {/* <label>Previous Transacations: </label>
            <div>
                <p>Paid ${paid}</p>
            </div> */}
            <Text fontSize='40px' as='b' color='blue.800'>Current Profile</Text>
            <Text as='i' fontSize='20px' color='purple.600'>Name: {currUserData?.user.username}</Text>
            <Text as='i' fontSize='20px' color='purple.600'>Email: {currUserData?.user.email}</Text>
            <Text as='i' fontSize='20px' color='purple.600'>Current Balance: {currUserData?.user.current_balance}</Text>
            <Text as='i' fontSize='20px' color='purple.600'>Change the Fields you want to update</Text>
            <form className='w-1/4' onSubmit={handleSubmit}>
                <FormLabel htmlFor='Name'>Name: </FormLabel>
                <Input type="text" name="name" value={update.name} onChange={handleUpdate}/>
                <FormLabel htmlFor='email'>Email: </FormLabel>
                <Input type="email" name="email" value={update.email} onChange={handleUpdate}/>
                <FormLabel htmlFor='password'>Password: </FormLabel>
                <Input type="password" name="password" value={update.password} onChange={handleUpdate}/>  
                <Button className="my-2" onClick={() => {setSuccess(true)}}>Update</Button>
            </form>
            {suceess? <p>Update Successful</p> : null}
        </div>
    )
}

export default Profile;