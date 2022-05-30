import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'
import whitelist from './whitelist.json'

class Whitelist {
    
    getMerkleTree() {
        let leafNodes = whitelist.map(addr => keccak256(addr))
        let merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })
        return merkleTree
    }

    getRootHash() {
        let merkleTree = this.getMerkleTree()
        let rootHash = '0x' + merkleTree.getRoot().toString('hex')
        return rootHash
    }

    getMerkleProof(address) {
        return this.getMerkleTree().getHexProof(keccak256(address));
    }

    isInWhitelist(address)
    {
        if(whitelist.indexOf(address) !== -1) {
            return true;
        }
        return false
    }
}

export default Whitelist