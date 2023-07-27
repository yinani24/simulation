import React from "react";
import { Link} from "react-router-dom";

interface MatrixData {
    id: string;
    name: string;
}

function Simulation({ matrixData, handleMatrixAdd, handleMatrixRemove }: {
    matrixData: MatrixData[];
    handleMatrixAdd: () => void;
    handleMatrixRemove: (id: string) => void;
}) { 
    return(
        <>
        <ul>
            {matrixData.map((matrix) => (
                <li key={matrix.id}>
                    <button key={matrix.id}>
                        <Link to={`/matrix${matrix.id}`}>
                            {matrix.name}
                        </Link>
                    </button>
                </li>
            ))}
        </ul>
        <button onClick={handleMatrixAdd}>Add Button</button>
        <button onClick={() => handleMatrixRemove(matrixData[matrixData.length - 1].id)}>Remove Button</button>
        </>
    )
}

export default Simulation;