// Harmony SDK
import { Harmony, HarmonyExtension } from "@harmony-js/core"
import { Contract } from "@harmony-js/contract"

// Contracts
import Contracts from '@fishfight-one/contracts/FishFightContracts/testnet/contracts.json'
import Web3 from "web3"

class FishFight {
    provider: Harmony | HarmonyExtension | Web3
    type: "web3" | "harmony" | "default"
    factory: Contract
    fight: Contract

    constructor(provider: Harmony | HarmonyExtension | Web3, type: "web3" | "harmony" | "default"){
        this.provider = provider
        this.type = type
        this.factory = this.setFactoryContract(this.provider, type)
        this.fight = this.setFightContract(this.provider, type)
    }

    setFactoryContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        return 'def'
    }

    setFightContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishFight.abi, Contracts.contracts.FishFight.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishFight.abi, Contracts.contracts.FishFight.address)
        }

        return 'def'
    }

}

export default FishFight 