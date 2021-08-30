// Harmony SDK
import { Harmony, HarmonyExtension } from "@harmony-js/core"
import { Contract } from "@harmony-js/contract"

// Types
import { Provider } from "../utils/provider"

// Contracts
import Contracts from '../contracts/contracts.json'
import Web3 from "web3"

class FishFight {
    provider: Harmony | HarmonyExtension | Web3
    type: "web3" | "harmony" | "default"
    factory: string

    constructor(provider: Harmony | HarmonyExtension | Web3, type: "web3" | "harmony" | "default"){
        this.provider = provider
        this.type = type
        this.factory = this.setContract(this.provider, type)
    }

    setContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        return 'def'
    }

}

export default FishFight 