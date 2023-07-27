// import React from 'react';
// // import logo from './logo.svg';
// import './App.css';
// import Simulation from './components/simulation';
// import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import Matrix from './components/matrixlayout';
// import { useState } from 'react';
// import { useQuery, useMutation, gql} from '@apollo/client';

// function App() {
//   const GET_MATRICES = gql`
//     query GetMatrices {
//       matrices {
//         id
//         name
//       }
//     }
//   `;

//   const CREATE_MATRIX = gql`
//     mutation CreateMatrix($name: String!) {
//       createMatrix(name: $name) {
//         id
//         name
//       }
//     }
//   `;

//   const DELETE_MATRIX = gql`
//     mutation DeleteMatrix($id: String!) {
//       deleteMatrix(id: $id) {
//         id
//         name
//       }
//     }
//   `;

//   const { loading, error, data } = useQuery(GET_MATRICES);
//   const [createMatrix] = useMutation(CREATE_MATRIX);
//   const [deleteMatrix] = useMutation(DELETE_MATRIX);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error.message}</p>;
//   }

//   interface MatrixData {
//     id: number;
//     name: string;
//     route: string;
//   }

//   const [matrixData, setMatrixData] = useState<MatrixData[]>([]);
//   const handleMatrixAdd = async () => {
//       try{
//         const response = await createMatrix({ variables: { name: "matrix" + (matrixData.length + 1) } });
//       }
//       catch(error){
//         console.error(error);
//       }
//       const newMatrix: MatrixData = {
//           "id" : matrixData.length + 1,
//           "name" : "matrix" + (matrixData.length + 1),
//           "route" : "/matrix" + (matrixData.length + 1)
//       }
//       setMatrixData([...matrixData, newMatrix]);
//   }

//   const handleMatrixRemove = async (id: string) => {
//     try{
//       const response = await deleteMatrix({ variables: {id} });
//     }
//     catch(error){
//       console.error(error);
//     }
//       setMatrixData(matrixData.slice(0, matrixData.length - 1));
//   }

//   return (
//     <Router>
//       <Routes>
//         <Route path='/' element={<Simulation 
//           matrixData={matrixData}
//           handleMatrixAdd={handleMatrixAdd}
//           handleMatrixRemove={handleMatrixRemove}/>}/>
//         <Route path=':matrix/*' element={<Matrix/>}>
//         </Route> 
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
// import logo from './logo.svg';
import './App.css';
import Simulation from './components/simulation';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Matrix from './components/matrixlayout';
import { useState } from 'react';
import { useQuery, useMutation, gql} from '@apollo/client';

function App() {

  interface MatrixData {
    id: string;
    name: string;
  }

  interface MatrixQueryData {
    matrices: MatrixData[];
  }

  const GET_MATRICES = gql`
    query GetMatrices {
      matrices {
        id
        name
      }
    }
  `;

  const CREATE_MATRIX = gql`
    mutation CreateMatrix($name: String!) {
      createMatrix(name: $name) {
        id
        name
      }
    }
  `;

  const DELETE_MATRIX = gql`
    mutation DeleteMatrix($id: String!) {
      deleteMatrix(id: $id) {
        id
        name
      }
    }
  `;

  const { loading, error, data } = useQuery<MatrixQueryData>(GET_MATRICES);
  const [createMatrix] = useMutation(CREATE_MATRIX);
  const [deleteMatrix] = useMutation(DELETE_MATRIX);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // const [matrixData, setMatrixData] = useState<MatrixData[]>([]);
  const handleMatrixAdd = async () => {
      try{
        const name: number = (data?.matrices?.length ?? 0) + 1;
        const response = await createMatrix({ variables: { name: `matrix${name + 1}` } });
      }
      catch(error){
        console.error(error);
      }
  }

  const handleMatrixRemove = async (id: string) => {
    try{
      const response = await deleteMatrix({ variables: {id} });
    }
    catch(error){
      console.error(error);
    }
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Simulation 
          matrixData={data?.matrices ?? []}
          handleMatrixAdd={handleMatrixAdd}
          handleMatrixRemove={handleMatrixRemove}/>}/>
        <Route path=':matrix/*' element={<Matrix/>}>
        </Route> 
      </Routes>
    </Router>
  );
}

export default App;





