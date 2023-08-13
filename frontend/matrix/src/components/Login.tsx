import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utilis/Auth';
import { gql, useQuery } from '@apollo/client';
import { Button, Text } from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  Input,
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



function Login({ number, new_id }: Authen) {
  const UserLogin = gql`
  query VerifyUser($matrixID: ID!, $username: String!, $password: String!) {
    verifyUser(matrixID: $matrixID, username: $username, password: $password) {
        verify
        user{
          _id
        }
      } 
    }
  `;
  const AdminLogin = gql`
  query VerifyAdmin($matrixID: ID!, $username: String!, $password: String!) {
    verifyAdmin(matrixID: $matrixID, username: $username, password: $password) {
        verify
        admin{
          _id
        }
      }
    }
  `;


  const formRef = useRef<HTMLFormElement>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, setLogin] = useState(true);
  const auth = useAuth();
  const navigate = useNavigate();
  
  const handleReset = () => {
    setUsername('');
    setPassword('');
    setLogin(true);
  };

  const { loading: userLoading, error: userError, data: userData, refetch: userRefetch } = useQuery(UserLogin, {
    variables: {
      matrixID: localStorage.getItem("matrix_id") || ``,
      username: username,
      password: password
    }
  });

  const { loading: adminLoading, error: adminError, data: adminData, refetch: adminRefetch } = useQuery(AdminLogin, {
    variables: {
      matrixID: localStorage.getItem("matrix_id") || ``,
      username: username,
      password: password
    }
  });

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const HandleLogin = async (event: FormEvent) => {
    event.preventDefault(); // Prevent form submission
    
    //Admin Login
    if (new_id === 1) {
      try{
        const response = await adminRefetch();
        console.log("Admin Login", adminData)
        if(response && adminData?.verifyAdmin.verify){
          setAdminIdInLocalStorage(adminData?.verifyAdmin.admin._id);
          setUserIdInLocalStorage(null);
          auth.login(username);
          console.log("Auth in Login", auth.auth)
          handleReset()
          navigate(`${username}${number}`, { state: { new_id: new_id }, replace: true })
        }
      }
      catch(error){
        console.log(error)
        setLogin(false)
      }    
    } //User Login
    else {
      try{
        const response = await userRefetch();
        console.log("User Login", userData) 
        if(response && userData?.verifyUser.verify){
          setUserIdInLocalStorage(userData?.verifyUser.user._id);
          setAdminIdInLocalStorage(null);
          auth.login(username);
          console.log("Auth in Login", auth.auth)
          handleReset()
          navigate(`${username}${number}`, { state: { new_id: new_id }, replace: true })
        }
      }
      catch(error){
        console.log(error)
        setLogin(false)
      }
    }
  };

  const navigatetologin = () => {
    navigate(`/matrix${number}`, { replace: true })
  }

  return (
    <div className='flex flex-col'>
      <Text className='m-2' as='i' fontFamily='cursive' fontSize='2xl'>Login</Text>
      <form className='m-2' onSubmit={HandleLogin} ref={formRef}>
        <FormControl isRequired>
          <FormLabel htmlFor="username">Username:</FormLabel>
          <Input type="text" id="username" value={username} onChange={handleUsernameChange}
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
        <Button type="submit">Login</Button>
        </div>
      </form>
      {
          !login ?
            <div className='m-2'>
            <Text as='i' fontFamily='cursive' color='red'>Could not login! Please Try Again</Text>
            <Button colorScheme='red' onClick={handleReset}>Dismiss</Button>
            </div>
          :
          null
      }
      <div className='w-1/4'>
        <Button className='ml-2' onClick={navigatetologin}>
          Back
        </Button>
      </div>
      </div>
  );
}

export default Login;