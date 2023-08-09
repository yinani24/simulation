import React from 'react';
import './App.css';
import Simulation from './components/simulation';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Matrix from './components/matrixlayout';
import {useQuery, useMutation, gql} from '@apollo/client';
import { Button } from '@chakra-ui/react';

function App() {

  interface MatrixData {
    _id: string;
    name: string;
  }

  interface MatrixQueryData {
    Matrices: MatrixData[];
  }

  const GET_MATRICES = gql`
    query Matrices{
      Matrices {
        _id
        name
      }
    }
  `;

  const CREATE_MATRIX = gql`
    mutation CreateMatrix($name: String!) {
      createMatrix(name: $name) {
        _id
        name
      }
    }
  `;

  const DELETE_MATRIX = gql`
    mutation DeleteMatrix($id: ID!) {
      deleteMatrix(id: $id) {
        _id
        name
      }
    }
  `;

  const {loading, error, data, refetch} = useQuery<MatrixQueryData>(GET_MATRICES);
  const [createMatrix] = useMutation(CREATE_MATRIX);
  const [deleteMatrix] = useMutation(DELETE_MATRIX);
  //console.log(data)

  if (loading) {
    return <div className='flex w-full h-full flex-col justify-center items-center'> <Button size='lg' isLoading colorScheme='blue' variant='transparent'> Loading </Button> </div>;
  }

  if (error && data?.Matrices) {
    return <p>Error: {error.message}</p>;
  }

  const handleMatrixAdd = async () => {
      try{
        const name: number = (data?.Matrices?.length ?? 0) + 1;
        //console.log(data?.Matrices?.length)
        const new_matrix: string = `matrix${name}`;
        const response = await createMatrix({ variables: { name: new_matrix } });
        const new_data = () => refetch()
        new_data()
        // console.log(response);
        // console.log(data)
      }
      catch(error){
        console.error(error);
      }
  }

  const handleMatrixRemove = async (id: string) => {
    try{
      console.log(id)
      const response = await deleteMatrix({ variables: {id: id} });
      console.log(response)
      const new_data = await refetch()
      // console.log(new_data)
    }
    catch(error){
      console.error(error);
    }
  }

  return(
    <Router>
      <Routes>
        <Route path='/' element={<Simulation 
          matrixData={data?.Matrices ?? []}
          handleMatrixAdd={handleMatrixAdd}
          handleMatrixRemove={handleMatrixRemove}/>}/>
        <Route path=':matrix/*' element={<Matrix/>}>
        </Route> 
      </Routes>
    </Router>
  );
}

export default App;