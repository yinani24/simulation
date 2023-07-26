import React from 'react';
// import logo from './logo.svg';
import './App.css';
import Simulation from './components/simulation';
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Matrix from './components/matrixlayout';
import { useState } from 'react';

function App() {
   
  interface MatrixData {
    id: number;
    name: string;
    route: string;
  }

  const [matrixData, setMatrixData] = useState<MatrixData[]>([]);
  const handleMatrixAdd = () => {
      const newMatrix: MatrixData = {
          "id" : matrixData.length + 1,
          "name" : "matrix" + (matrixData.length + 1),
          "route" : "/matrix" + (matrixData.length + 1)
      }
      setMatrixData([...matrixData, newMatrix]);
  }

  const handleMatrixRemove = () => {
      setMatrixData(matrixData.slice(0, matrixData.length - 1));
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Simulation 
          matrixData={matrixData}
          handleMatrixAdd={handleMatrixAdd}
          handleMatrixRemove={handleMatrixRemove}/>}/>
        <Route path=':matrix/*' element={<Matrix/>}>
        </Route> 
      </Routes>
    </Router>
  );
}

export default App;
