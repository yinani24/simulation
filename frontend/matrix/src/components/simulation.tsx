import React from "react";
import {Link} from "react-router-dom";
import {Button} from 'antd'
interface MatrixData {
    _id: string;
    name: string;
}

function Simulation({ matrixData, handleMatrixAdd, handleMatrixRemove }: {
    matrixData: MatrixData[];
    handleMatrixAdd: () => void;
    handleMatrixRemove: (id: string) => void;
}) {
    // console.log(matrixData);
    const matrix_id_storage = (id: string) =>{
        localStorage.setItem("matrix_id", id);
    }  
    return(
        <div className="w-full h-full">
            <div className="w-full h-full flex flex-row justify-center content-center">
                <Button  onClick={() => handleMatrixRemove(matrixData[matrixData.length - 1]?._id)}>Remove Button</Button>
                <ul>
                    {matrixData.map((matrix) => (
                        <li key={matrix._id}>
                            <button key={matrix._id} onClick={() => matrix_id_storage(matrix._id)}>
                                <Link to={`/${matrix.name}`}>
                                    {matrix.name}
                                </Link>
                            </button>
                        </li>
                    ))}
                </ul>
                <Button onClick={handleMatrixAdd}>Add Button</Button>
            </div>
        </div>
    )
}

export default Simulation;