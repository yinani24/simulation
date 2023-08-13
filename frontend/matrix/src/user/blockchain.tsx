import {from, gql, useMutation, useQuery} from "@apollo/client";
import './blockchain.css'
import { Text } from "@chakra-ui/react";

interface Data{
    from: string;
    to: string;
    amount: number;
}

function BlockChain(){
    const Block_Query = gql`
    query BlockChain($matrixID: ID!){
        BlockChain(matrixID: $matrixID){
            _num
            prev
            current
            data{
                from
                to
                amount
            }
        }
    }`;

    const {loading, error, data} = useQuery(Block_Query, { variables: { matrixID: localStorage.getItem("matrix_id") || ``}});
    console.log("BlockChain", data)

    return(
        <div className='m-2 bg-gradient-to-r from-yellow to-gray-light'>
            <Text fontSize='40px' as='b' color='blue.800'>Block Chain</Text>
            <div>
                {data?.BlockChain.map((block: { _num: number, prev: string, current: string, data: Data }) => (
                    <div className="my-block w-1/2" key={block._num}>
                        <Text>Num: {block._num}</Text>
                        <Text>From: {block.data.from}</Text>
                        <Text>To: {block.data.to}</Text>
                        <Text>Amount: {block.data.amount}</Text>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BlockChain;