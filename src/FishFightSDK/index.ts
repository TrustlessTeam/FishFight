// Harmony SDK
import { Harmony, HarmonyExtension } from "@harmony-js/core"
import { Contract as HarmonyContract } from "@harmony-js/contract"
import { Contract } from "web3-eth-contract";
import { getProvider, getWebSocketProvider } from "../utils/provider";

import {
    Multicall,
    ContractCallResults,
    ContractCallContext,
  } from 'ethereum-multicall';

// Contracts
// import Contracts from '@fishfight-one/contracts/FishFightContracts/testnet/contracts.json'
import Contracts from '../contracts/contracts.json';
import Web3 from "web3"

class FishFight {
    provider: Web3
    listener: Web3
    providerWallet: HarmonyExtension | Web3 | null
    multicall: Multicall | null;
    type: "web3" | "harmony" | null
    readFishFactory: Contract
    readFishingWaters: Contract
    readFightingWaters: Contract
    readBreedingWaters: Contract
    readSeasons: Contract
    readFishFood: Contract
    readDeadFishFactory: Contract
    listenFishFactory: Contract
    listenFishingWaters: Contract
    listenFightingWaters: Contract
    listenBreedingWaters: Contract
    listenSeasons: Contract
    listenFishFood: Contract
    listenDeadFishFactory: Contract
    fishFactory: Contract | HarmonyContract | null
    fishingWaters: Contract | HarmonyContract | null
    fightingWaters: Contract | HarmonyContract | null
    breedingWaters: Contract | HarmonyContract | null
    seasons: Contract | HarmonyContract | null
    fishFood: Contract| HarmonyContract | null
    deadFishFactory: Contract| HarmonyContract | null

    constructor(){
        this.provider = new Web3(getProvider().url);
        this.listener = new Web3(getWebSocketProvider().url)
        this.multicall = null;
        this.type = null
        
        this.readFishFactory = this.setFishFactoryContract(this.provider, "web3")
        this.readFishingWaters = this.setFishingWatersContract(this.provider, "web3")
        this.readFightingWaters = this.setFightingWatersContract(this.provider, "web3")
        this.readBreedingWaters = this.setBreedingWatersContract(this.provider, "web3")
        this.readSeasons = this.setSeasonsContract(this.provider, "web3")
        this.readFishFood = this.setFishFoodContract(this.provider, "web3")
        this.readDeadFishFactory = this.setDeadFishFactoryContract(this.provider, "web3")

        this.listenFishFactory = this.setFishFactoryContract(this.listener, "web3")
        this.listenFishingWaters = this.setFishingWatersContract(this.listener, "web3")
        this.listenFightingWaters = this.setFightingWatersContract(this.listener, "web3")
        this.listenBreedingWaters = this.setBreedingWatersContract(this.listener, "web3")
        this.listenSeasons = this.setSeasonsContract(this.listener, "web3")
        this.listenFishFood = this.setFishFoodContract(this.listener, "web3")
        this.listenDeadFishFactory = this.setDeadFishFactoryContract(this.listener, "web3")

        this.providerWallet = null;
        this.fishFactory = null;
        this.fishingWaters = null;
        this.fightingWaters = null;
        this.breedingWaters = null;
        this.seasons = null;
        this.fishFood = null;
        this.deadFishFactory = null;
    }

    setProviderWallet = (providerWallet: HarmonyExtension | Web3, type: "web3" | "harmony") => {
        this.providerWallet = providerWallet;
        this.multicall = new Multicall({ web3Instance: providerWallet, multicallCustomContractAddress: Contracts.contracts.Multicall.address });
        this.type = type;
        this.fishFactory = this.setFishFactoryContract(this.providerWallet, type)
        this.fishingWaters = this.setFishingWatersContract(this.providerWallet, type)
        this.fightingWaters = this.setFightingWatersContract(this.providerWallet, type)
        this.breedingWaters = this.setBreedingWatersContract(this.providerWallet, type)
        this.seasons = this.setSeasonsContract(this.providerWallet, type)
        this.fishFood = this.setFishFoodContract(this.providerWallet, type)
        this.deadFishFactory = this.setDeadFishFactoryContract(this.providerWallet, type)
    }

    setFishFactoryContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony") {
            return provider.contracts.createContract(Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishFactory.abi as any, Contracts.contracts.FishFactory.address)
        }

        return null;
    }

    setDeadFishFactoryContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony") {
            return provider.contracts.createContract(Contracts.contracts.DeadFishFactory.abi, Contracts.contracts.DeadFishFactory.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.DeadFishFactory.abi as any, Contracts.contracts.DeadFishFactory.address)
        }

        return null;
    }

    setFishingWatersContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishingWaters.abi, Contracts.contracts.FishingWaters.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishingWaters.abi, Contracts.contracts.FishingWaters.address)
        }

        return null;
    }

    setFightingWatersContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FightingWaters.abi, Contracts.contracts.FightingWaters.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FightingWaters.abi, Contracts.contracts.FightingWaters.address)
        }

        return null;
    }

    setBreedingWatersContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.BreedingWaters.abi, Contracts.contracts.BreedingWaters.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.BreedingWaters.abi, Contracts.contracts.BreedingWaters.address)
        }

        return null;
    }

    setSeasonsContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.Seasons.abi, Contracts.contracts.Seasons.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.Seasons.abi, Contracts.contracts.Seasons.address)
        }

        return null;
    }

    setFishFoodContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishFood.abi, Contracts.contracts.FishFood.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishFood.abi, Contracts.contracts.FishFood.address)
        }

        return null;
    }
}

export default FishFight 