import React from 'react';
import {useState} from 'react';

const Authen = React.createContext({
    auth: false,
    sessionKey: "",
    login: (user: string) => {},
    logout: () => {}
});

function AuthProvider({children} : {children: React.ReactNode}){
    const [auth, setAuth] = useState(false);
    const [sessionKey, setSessionKey] = useState(''); // TODO: Add session key to context
    const login = (user: string) => {
        localStorage.setItem('sessionKey', user);
        setAuth(true);
    }
    const logout = () => {
        localStorage.removeItem('sessionKey');
        setAuth(false);
    }
    return(
        <Authen.Provider value={{auth, sessionKey, login, logout}}>
            {children}
        </Authen.Provider>
    )
}

function useAuth (){
    return React.useContext(Authen);
}

export {AuthProvider, useAuth};