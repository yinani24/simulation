import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utilis/Auth';
import { gql, useQuery } from '@apollo/client';

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

function LoginFailedMessageWindow({ message, onDismiss }: { message: string, onDismiss: () => void }) {
  return (
      <div>
          <p>{message}</p>
          <button onClick={onDismiss}>Dismiss</button>
      </div>
  )
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
  const auth = useAuth();
  const navigate = useNavigate();
  
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
          navigate(`${username}${number}`, { state: { new_id: new_id }, replace: true })
        }
      }
      catch(error){
        console.log(error)
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
          navigate(`${username}${number}`, { state: { new_id: new_id }, replace: true })
        }
      }
      catch(error){
        console.log(error)
      }
    }
  };

  const navigatetologin = () => {
    navigate(`/matrix${number}`, { replace: true })
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={HandleLogin} ref={formRef}>
        <div>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" value={username} onChange={handleUsernameChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <br/>
      {
          new_id === 1 ? 
          (adminError && username && password && 
          <LoginFailedMessageWindow message={adminError.message} onDismiss={() => formRef.current?.reset()}/>)
          : 
          (userError && username && password && 
          <LoginFailedMessageWindow message={userError.message} onDismiss={() => formRef.current?.reset()}/>)
      }
      <br/>
      <button onClick={navigatetologin}>
        Back
      </button>
      </div>
  );
}

export default Login;