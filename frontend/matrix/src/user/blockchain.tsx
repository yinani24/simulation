import {from, gql, useMutation, useQuery} from "@apollo/client";
import './blockchain.css'

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
        <div>
            <h1>Block Chain</h1>
            <div className="my-block">
                {data?.BlockChain.map((block: { _num: number, prev: string, current: string, data: Data }) => (
                    <div key={block._num}>
                        <p>Num: {block._num}</p>
                        <p>From: {block.data.from}</p>
                        <p>To: {block.data.to}</p>
                        <p>Amount: {block.data.amount}</p>
                        <p>Prev: {block.prev}</p>
                        <p>Current: {block.current}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BlockChain;