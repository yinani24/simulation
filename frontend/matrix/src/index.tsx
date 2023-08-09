import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { InMemoryCache, ApolloClient, ApolloProvider } from '@apollo/client';
import {ChakraProvider} from "@chakra-ui/react";

const client = new ApolloClient({
  uri: 'http://localhost:8080/query',
  cache: new InMemoryCache()
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ChakraProvider>
    <ApolloProvider client={client}>
      <div className='h-screen w-screen bg-gradient-to-r from-yellow to-gray-light'>
      <App/>
      </div>
    </ApolloProvider>
  </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
