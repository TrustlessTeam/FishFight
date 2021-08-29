// Harmony SDK
import { Harmony } from "@harmony-js/core"
import { Contract } from "@harmony-js/contract"

// Types
import { Provider } from "../utils/provider"

// Contracts
import Contracts from '../contracts/contracts.json'

class FishFight {
    hmy: Harmony
    factory: Contract

    constructor(provider: Provider){
        this.hmy = new Harmony(provider.url, {chainId: provider.chainId, chainType: provider.chainType});

        this.factory = this.hmy.contracts.createContract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address);
    }

}

export default FishFight 