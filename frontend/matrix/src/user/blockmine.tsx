import { gql, useMutation, useQuery } from "@apollo/client";
import './blockchain.css'

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
    mutation MineBlock($userID: ID!, $matrixID: ID!, $block : BlockType!, $blockID: string){
        mineBlock(userID: $userID, matrixID: $matrixID, block: $block, blockID: $blockID)
    }`;

    const {data, loading, error} = useQuery(GET_BLOCKS,{
        variables:{userID: localStorage.getItem("userId"), matrixID: localStorage.getItem("matrix_id"), collection: "MineBlocks"}
    })

    const [mineBlock, {data: mineData, error: mineError}] = useMutation(MINE_BLOCK)

    const handleMine = async (block: BlockType, id: string) => {
        try{
            const newBlockwithoutid = {_num: block._num, prev: block.prev, current: block.current, data: block.data, nounce: block.nounce, verify: block.verify}
            const response = await mineBlock({variables: {
                userID: localStorage.getItem("userId"),
                matrixID: localStorage.getItem("matrix_id"),
                block: newBlockwithoutid,
                blockID: id
            }})
            console.log(response)
            return response
        }
        catch(error){
            console.error(error)
        }
    }

    return(
        <div>
            <h1>Block Mine</h1>
            <div>
                {data?.Blocks.map((block: BlockType) => (
                    <div key={block._id} className="my-block">
                        <p>ID: {block._id}</p>
                        <p>Num: {block._num}</p>
                        <p>From: {block.data.from}</p>
                        <p>To: {block.data.to}</p>
                        <p>Amount: {block.data.amount}</p>
                        <p>Prev: {block.prev}</p>
                        <p>Current: {block.current}</p>
                        <button onClick={() => handleMine}> Mine </button>
                    </div>
                ))}
            </div>      
        </div>
    )
}

export default BlockMine;