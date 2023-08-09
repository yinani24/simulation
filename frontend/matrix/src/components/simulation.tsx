import React from "react";
import {Link} from "react-router-dom";
import {Button } from "@chakra-ui/react";

interface MatrixData {
    _id: string;
    name: string;
}

function Simulation({ matrixData, handleMatrixAdd, handleMatrixRemove }: {
    matrixData: MatrixData[];
    handleMatrixAdd: () => void;
    handleMatrixRemove: (id: string) => void;
}) {
    console.log(matrixData);
    const matrix_id_storage = (id: string) =>{
        localStorage.setItem("matrix_id", id);
    }  
    return(
        
        <div className=" flex flex-column justify-center h-full ">
            
            <div className="flex flex-column w-1/2 h-full justify-around items-center">
                
                <Button colorScheme="facebook"  onClick={() => handleMatrixRemove(matrixData[matrixData.length - 1]?._id)}>Remove Button</Button>
                <ul className="flex flex-row w-1/4 flex-wrap h-full justify-center items-center">
                        {matrixData.map((matrix) => (
                                <li>
                                <Button colorScheme="whatsapp" _hover={{ bg: '#ebedf0' }} className="text-[#9333ea]" key={matrix._id} onClick={() => matrix_id_storage(matrix._id)}>
                                    <Link to={`/${matrix.name}`}>
                                        {matrix.name}
                                    </Link>
                                </Button>
                                </li>
                        ))}
                </ul>       
                <Button colorScheme="facebook" onClick={handleMatrixAdd}>Add Button</Button>
            </div>
        </div>
    )
}

export default Simulation;