import { gql } from "@apollo/client";

function BlockMine(){
    // const GET_BLOCKS = gql`
    // query Blocks($userID: ID!, $matrixID: ID!, collection: String){
    //     Blocks(matrixID: $matrixID, userID: $userID, collection: $collection){
    //         _id
    //         _num
    //         data{
    //             from 
    //             to 
    //             amount
    //         }
    //         prev
    //         current_balance
    //         verify
    //     }
    // }
    // `

    return(
        <div>
            <h1>Block Mine</h1>      
        </div>
    )
}

export default BlockMine;