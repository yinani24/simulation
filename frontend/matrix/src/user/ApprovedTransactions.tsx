import {from, gql, useMutation, useQuery} from "@apollo/client";
import './blockchain.css'
import { Text } from "@chakra-ui/react";

interface Data{
    from: string;
    to: string;
    amount: number;
}

interface BlockType {
    _id: string;
    _num: number;
    prev: string;
    current: string;
    data: Data;
    nounce: number;
    verify: boolean;
}

function CurrentTransaction(){
    const GET_BLOCKS = gql`
    query Blocks($userID: ID!, $matrixID: ID!, $collection: String){
        Blocks(matrixID: $matrixID, userID: $userID, collection: $collection){
            _id
            _num
            data{
                from 
                to 
                amount
            }
            prev
            current
            nounce
            verify
        }
    }`;

    const CURRENT_USER = gql`
    query User($ID: ID! $MatrixID: ID!){
        user(_id: $ID matrixID: $MatrixID){
            username
        }
    }`;

    const { loading: currUserLoading, error: currUserError, data: currUserData, refetch: currUserRefetch } = useQuery(CURRENT_USER, {
        variables: { ID: localStorage.getItem("userId"), MatrixID: localStorage.getItem("matrix_id") },
    });

    const {data, loading, error, refetch} = useQuery(GET_BLOCKS,{
        variables:{userID: localStorage.getItem("userId"), matrixID: localStorage.getItem("matrix_id"), collection: currUserData?.user.username}
    })

    return(
        <div className="m-4 bg-gradient-to-r from-yellow to-gray-light">
            <Text fontSize='40px' as='i' fontWeight='bold' color='blue.800'>Approved Transactions</Text>
            <div>
                {data?.Blocks.map((block: BlockType) => (
                    <div key={block._id} className="my-block w-1/2">
                        <p>Num: {block._num}</p>
                        <p>From: {block.data.from}</p>
                        <p>To: {block.data.to}</p>
                        <p>Amount: {block.data.amount}</p>
                    </div>
                ))}
            </div>      
        </div>
    )

}

export default CurrentTransaction;