// Harmony SDK
import { Harmony, HarmonyExtension } from "@harmony-js/core"
import { Contract } from "@harmony-js/contract"

// Contracts
// import Contracts from '@fishfight-one/contracts/FishFightContracts/testnet/contracts.json'
import Contracts from '../contracts/contracts.json';
import Web3 from "web3"

class FishFight {
    provider: Harmony | HarmonyExtension | Web3
    type: "web3" | "harmony" | "default"
    fishFactory: Contract
    fishingWaters: Contract
    fightingWaters: Contract
    breedingWaters: Contract

    constructor(provider: Harmony | HarmonyExtension | Web3, type: "web3" | "harmony" | "default"){
        this.provider = provider
        this.type = type
        this.fishFactory = this.setFishFactoryContract(this.provider, type)
        this.fishingWaters = this.setFishingWatersContract(this.provider, type)
        this.fightingWaters = this.setFightingWatersContract(this.provider, type)
        this.breedingWaters = this.setBreedingWatersContract(this.provider, type)
    }

    setFishFactoryContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        return 'def'
    }

    setFishingWatersContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishingWaters.abi, Contracts.contracts.FishingWaters.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishingWaters.abi, Contracts.contracts.FishingWaters.address)
        }

        return 'def'
    }

    setFightingWatersContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FightingWaters.abi, Contracts.contracts.FightingWaters.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FightingWaters.abi, Contracts.contracts.FightingWaters.address)
        }

        return 'def'
    }

    setBreedingWatersContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.BreedingWaters.abi, Contracts.contracts.BreedingWaters.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.BreedingWaters.abi, Contracts.contracts.BreedingWaters.address)
        }

        return 'def'
    }
}

export default FishFight 