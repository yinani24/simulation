import { gql, useMutation, useQuery } from "@apollo/client";
import './blockchain.css'
import { Button, Text } from "@chakra-ui/react";

interface Data {
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

function BlockMine(){
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

    const MINE_BLOCK = gql`
    mutation MineBlock($userID: ID!, $matrixID: ID!, $block: BlockType!, $blockID: ID!){
        mineBlock(userID: $userID, matrixID: $matrixID, block: $block, blockID: $blockID)
    }`;

    const {data, loading, error, refetch} = useQuery(GET_BLOCKS,{
        variables:{userID: localStorage.getItem("userId"), matrixID: localStorage.getItem("matrix_id"), collection: "MineBlocks"}
    })

    const [mineBlock, {data: mineData, error: mineError}] = useMutation(MINE_BLOCK)

    const handleMine = async (block: BlockType, id: string) => {
        try{
            const newBlockwithoutid = {_num: block._num, prev: block.prev, current: block.current, data: block.data, nounce: block.nounce, verify: block.verify}
            console.log(newBlockwithoutid)
            const response = await mineBlock({variables: {
                userID: localStorage.getItem("userId"),
                matrixID: localStorage.getItem("matrix_id"),
                block: newBlockwithoutid,
                blockID: id
            }})
            console.log(response)
            if (response){
                const ref = await refetch()
            }
            return response
        }
        catch(error){
            console.error(error)
        }
    }

    return(
        <div className="m-4 bg-gradient-to-r from-yellow to-gray-light">
            <Text fontSize='40px' as='i' fontWeight='bold' color='blue.800'>Block Mine</Text>
            <div>
                {data?.Blocks.map((block: BlockType) => (
                    <div key={block._id} className="my-block">
                        <p>Num: {block._num}</p>
                        <p>From: {block.data.from}</p>
                        <p>To: {block.data.to}</p>
                        <p>Amount: {block.data.amount}</p>
                        <Button onClick={() => handleMine(block, block._id)}> Mine </Button>
                    </div>
                ))}
            </div>      
        </div>
    )
}

export default BlockMine;