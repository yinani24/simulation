import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utilis/Auth';
import { gql, useMutation } from '@apollo/client';

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
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

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
            console.log(response)
            console.log(response?.data.createAdmin._id)
            //console.log(adminData?.createAdmin._id)
            setAdminIdInLocalStorage(response?.data.createAdmin._id);
            setUserIdInLocalStorage(null);
            return response
        } catch (error) {
            console.error(error);
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
            console.log(response)
            // console.log(userData?.createUser._id)
            setUserIdInLocalStorage(response?.data.createUser._id);
            setAdminIdInLocalStorage(null);
            return response
            // return response
        } catch (error) {
            console.error(error);
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
            // console.log(adminError)
        } //User Registration
        else{
            const response = await handleUserRegistration();
            if(response){
                auth.login(username);
                console.log("Auth in Registration", auth.auth)
                navigate(`${username}${number}`, { state: { new_id: new_id }, replace: true })
            }
            // console.log(userError)
        }

    };

    const navigatetologin = () => {
        navigate(`/matrix${number}`, { replace: true })
    }

    return (
        <div>
        <h2>Register</h2>
        <form onSubmit={HandleLogin}>
            <div>
            <label htmlFor="username">Username:</label>
            <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
            />
            </div>
            <div>
            <label htmlFor="email">Email:</label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
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
            <button type="submit">Register</button>
        </form>
        <br/>
        {
            new_id === 1 ? 
            (adminError && username && email && password &&
            <LoginFailedMessageWindow
              message={adminError.message}
              onDismiss={() => adminReset()} 
            />) 
            :
            (userError && username && email && password &&
            <LoginFailedMessageWindow
                message={userError.message}
                onDismiss={() => userReset()}
            />)
        }
        <button onClick={navigatetologin}>
            Back
        </button>
        </div>
    );
}

export default Registration;