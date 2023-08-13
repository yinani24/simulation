import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utilis/Auth';
import { gql, useMutation } from '@apollo/client';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Button, Text, Input
  } from '@chakra-ui/react'

interface Authen {
  number: number;
  new_id?: number;
}

function setAdminIdInLocalStorage(adminId: string | null) {
  if (adminId) {
    localStorage.setItem('adminId', adminId);
  } else {
    localStorage.removeItem('adminId');
  }
}

function setUserIdInLocalStorage(userId: string | null) {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
}



function Registration({ number, new_id }: Authen) {

    const UserRegistration = gql`
    mutation CreateUser($matrixID: ID!, $username: String!, $password: String!, $email: String!) {
        createUser(matrixID: $matrixID, username: $username, password: $password, email: $email) {
            _id
        }
    } 
    `;
    const AdminRegistration = gql`
    mutation CreateAdmin($matrixID: ID!, $username: String!, $password: String!, $email: String!) {
        createAdmin(matrixID: $matrixID, username: $username, password: $password, email: $email) {
            _id
        }
    } 
    `;
    const formRef = useRef<HTMLFormElement>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [login, setLogin] = useState(true);

    const handleReset = () => {
        setUsername('');
        setPassword('');
        setEmail('');
        setLogin(true);

    };

    const LoginFailedMessageWindow = (message: string) => {
        return (
            <div className='m-2'>
                <Text as='i' fontFamily='cursive' color='red'>Already have ${message}</Text>
                <Button colorScheme='red' onClick={handleReset}>Dismiss</Button>
            </div>
        )
    }

    const [createAdmin, {data: adminData, error:adminError, reset: adminReset}] = useMutation(AdminRegistration);

    const [createUser, {data: userData, error: userError, reset: userReset}] = useMutation(UserRegistration);

    const auth = useAuth();
    const navigate = useNavigate();

    const handleAdminRegistration = async () => {
        try {
            const response = await createAdmin({variables: {
                    matrixID: localStorage.getItem("matrix_id") || ``,
                    username: username,
                    password: password,
                    email: email
                }
            });
            setAdminIdInLocalStorage(response?.data.createAdmin._id);
            setUserIdInLocalStorage(null);
            return response
        } catch (error) {
            console.error(error)
            setLogin(false);
        }
    }

    const handleUserRegistration = async () => {
        try {
            const response = await createUser({variables: {
                    matrixID: localStorage.getItem("matrix_id") || ``,
                    username: username,
                    password: password,
                    email: email
                }
            });
            setUserIdInLocalStorage(response?.data.createUser._id);
            setAdminIdInLocalStorage(null);
            return response
            // return response
        } catch (error) {
            console.error(error);
            setLogin(false);
        }
    }

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const HandleLogin = async (event: FormEvent) => {
        event.preventDefault(); // Prevent form submission
        //Admin Registration
        if (new_id === 1){
            const response = await handleAdminRegistration();
            console.log(response)
            if(response){
                auth.login(username);
                console.log("Auth in Registration", auth.auth)
                navigate(`${username}${number}`, { state: { new_id: new_id }, replace: true })
            }
        } //User Registration
        else{
            const response = await handleUserRegistration();
            if(response){
                auth.login(username);
                console.log("Auth in Registration", auth.auth)
                navigate(`${username}${number}`, { state: { new_id: new_id }, replace: true })
            }
        }

    };

    const navigatetologin = () => {
        navigate(`/matrix${number}`, { replace: true })
    }

    return (
        <div className='flex flex-col'>
        <Text className='m-2' as='i' fontFamily='cursive' fontSize='2xl'>Register</Text>
        <form  className='m-2' onSubmit={HandleLogin} ref={formRef}>
            <FormControl isRequired>
                <FormLabel htmlFor="username">Username:</FormLabel>
                <Input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel htmlFor="email">Email:</FormLabel>
                <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                />
            </FormControl>
            <FormControl isRequired>
                <FormLabel htmlFor="password">Password:</FormLabel>
                <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
            </FormControl>
            <div className='mt-2'>
                <Button type="submit">Register</Button>
            </div>
        </form>
        <div>
            <Button className='m-2' onClick={navigatetologin}>
                Back
            </Button>
        </div>
        <br/>
        {
            new_id === 1 ? 
            (!login &&
            LoginFailedMessageWindow("Admin")) 
            :
            (!login &&
            LoginFailedMessageWindow("User"))
        }
        </div>
    );
}

export default Registration;