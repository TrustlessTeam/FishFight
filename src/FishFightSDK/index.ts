// Harmony SDK
import { Harmony, HarmonyExtension } from "@harmony-js/core"
// import { Contract } from "@harmony-js/contract"

// Contracts
// import Contracts from '@fishfight-one/contracts/FishFightContracts/testnet/contracts.json'
import Contracts from '../contracts/contracts.json'
// import Web3 from "web3"
import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts"

class FishFight {
    provider: Harmony | HarmonyExtension | Web3Provider
    type: "Web3Provider" | "harmony" | "default"
    factory: Contract
    fight: Contract

    constructor(provider: Harmony | HarmonyExtension | Web3Provider, type: "Web3Provider" | "harmony" | "default"){
        this.provider = provider
        this.type = type
        this.factory = this.setFactoryContract(this.provider, type)
        this.fight = this.setFightContract(this.provider, type)
    }

    setFactoryContract = (provider: any, type: "Web3Provider" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        if (type === "Web3Provider") {
            return new provider.eth.Contract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        return 'def'
    }

    setFightContract = (provider: any, type: "Web3Provider" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishFight.abi, Contracts.contracts.FishFight.address)
        }

        if (type === "Web3Provider") {
            return new provider.eth.Contract(Contracts.contracts.FishFight.abi, Contracts.contracts.FishFight.address)
        }

        return 'def'
    }

}

export default FishFight 