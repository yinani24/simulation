import React from "react";
import { Link} from "react-router-dom";

interface MatrixData {
    id: number;
    name: string;
    route: string;
}

function Simulation({ matrixData, handleMatrixAdd, handleMatrixRemove }: {
    matrixData: MatrixData[];
    handleMatrixAdd: () => void;
    handleMatrixRemove: () => void;
}) { 
    return(
        <>
        <ul>
            {matrixData.map((matrix) => (
                <li key={matrix.id}>
                    <button key={matrix.id}>
                        <Link to={matrix.route}>
                            {matrix.name}
                        </Link>
                    </button>
                </li>
            ))}
        </ul>
        <button onClick={handleMatrixAdd}>Add Button</button>
        <button onClick={handleMatrixRemove}>Remove Button</button>
        </>
    )
}

export default Simulation;