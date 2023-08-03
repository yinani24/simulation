import React from "react";
import {Link} from "react-router-dom";

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
        <>
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
        <button onClick={handleMatrixAdd}>Add Button</button>
        <button onClick={() => handleMatrixRemove(matrixData[matrixData.length - 1]?._id)}>Remove Button</button>
        </>
    )
}

export default Simulation;