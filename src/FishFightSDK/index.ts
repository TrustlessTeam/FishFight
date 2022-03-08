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
// import { WebsocketProvider } from 'web3-providers-ws';

const wsOptions = {
    timeout: 30000, // ms

    // // Useful for credentialed urls, e.g: ws://username:password@localhost:8546
    // headers: {
    //     authorization: 'Basic username:password'
    // },

    clientConfig: {
        // Useful if requests are large
        maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: 60000 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};

class FishFight {
    provider: Web3
    listener: Web3
    providerWallet: HarmonyExtension | Web3 | null
    fishCalls: Contract;
    multicall: Multicall;
    type: "web3" | "harmony" | null
    readFishFactory: Contract
    readFishingWaters: Contract
    readFightingWaters: Contract
    readBreedingWaters: Contract
    readTrainingWaters: Contract
    readFishStats: Contract
    readCycles: Contract
    readFishFood: Contract
    readDeadFishFactory: Contract
    listenFishFactory: Contract
    listenFishingWaters: Contract
    listenFightingWaters: Contract
    listenBreedingWaters: Contract
    listenTrainingWaters: Contract
    listenFishStats: Contract
    listenCycles: Contract
    listenFishFood: Contract
    listenDeadFishFactory: Contract
    
    fishFactory: Contract | HarmonyContract | null
    fishingWaters: Contract | HarmonyContract | null
    fightingWaters: Contract | HarmonyContract | null
    breedingWaters: Contract | HarmonyContract | null
    trainingWaters: Contract | HarmonyContract | null
    fishStats: Contract | HarmonyContract | null
    cycles: Contract | HarmonyContract | null
    fishFood: Contract| HarmonyContract | null
    deadFishFactory: Contract| HarmonyContract | null
    

    constructor(){
        this.provider = new Web3(getProvider().url);
        this.listener = new Web3(new Web3.providers.WebsocketProvider(getWebSocketProvider().url, wsOptions)); 
        this.multicall = new Multicall({ nodeUrl: getProvider().url, multicallCustomContractAddress: Contracts.contracts.Multicall.address, tryAggregate: true });

        this.type = null
        this.fishCalls = this.setFishCallsContract(this.provider, "web3")
        this.readFishFactory = this.setFishFactoryContract(this.provider, "web3")
        this.readFishingWaters = this.setFishingWatersContract(this.provider, "web3")
        this.readFightingWaters = this.setFightingWatersContract(this.provider, "web3")
        this.readBreedingWaters = this.setBreedingWatersContract(this.provider, "web3")
        this.readTrainingWaters = this.setTrainingWatersContract(this.provider, "web3")
        this.readFishStats = this.setFishStatsContract(this.provider, "web3")
        this.readCycles = this.setCyclesContract(this.provider, "web3")
        this.readFishFood = this.setFishFoodContract(this.provider, "web3")
        this.readDeadFishFactory = this.setDeadFishFactoryContract(this.provider, "web3")

        this.listenFishFactory = this.setFishFactoryContract(this.listener, "web3")
        this.listenFishingWaters = this.setFishingWatersContract(this.listener, "web3")
        this.listenFightingWaters = this.setFightingWatersContract(this.listener, "web3")
        this.listenBreedingWaters = this.setBreedingWatersContract(this.listener, "web3")
        this.listenTrainingWaters = this.setTrainingWatersContract(this.listener, "web3")
        this.listenFishStats = this.setFishStatsContract(this.listener, "web3")
        this.listenCycles = this.setCyclesContract(this.listener, "web3")
        this.listenFishFood = this.setFishFoodContract(this.listener, "web3")
        this.listenDeadFishFactory = this.setDeadFishFactoryContract(this.listener, "web3")

        this.providerWallet = null;
        this.fishFactory = null;
        this.fishingWaters = null;
        this.fightingWaters = null;
        this.breedingWaters = null;
        this.trainingWaters = null;
        this.fishStats = null;
        this.cycles = null;
        this.fishFood = null;
        this.deadFishFactory = null;
    }

    setProviderWallet = (providerWallet: HarmonyExtension | Web3, type: "web3" | "harmony") => {
        this.providerWallet = providerWallet;
        if(type === "web3") {
            this.providerWallet = this.providerWallet as Web3
            this.providerWallet.eth.handleRevert = true;
        }
        this.type = type;
        this.fishFactory = this.setFishFactoryContract(this.providerWallet, type)
        this.fishingWaters = this.setFishingWatersContract(this.providerWallet, type)
        this.fightingWaters = this.setFightingWatersContract(this.providerWallet, type)
        this.breedingWaters = this.setBreedingWatersContract(this.providerWallet, type)
        this.trainingWaters = this.setTrainingWatersContract(this.providerWallet, type)
        this.cycles = this.setCyclesContract(this.providerWallet, type)
        this.fishFood = this.setFishFoodContract(this.providerWallet, type)
        this.deadFishFactory = this.setDeadFishFactoryContract(this.providerWallet, type)
    }

    setFishCallsContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony") {
            return provider.contracts.createContract(Contracts.contracts.FishCalls.abi, Contracts.contracts.FishCalls.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishCalls.abi as any, Contracts.contracts.FishCalls.address)
        }

        return null;
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

    setTrainingWatersContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.TrainingWaters.abi, Contracts.contracts.TrainingWaters.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.TrainingWaters.abi, Contracts.contracts.TrainingWaters.address)
        }

        return null;
    }

    setFishStatsContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.FishStats.abi, Contracts.contracts.FishStats.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.FishStats.abi, Contracts.contracts.FishStats.address)
        }

        return null;
    }

    setCyclesContract = (provider: any, type: "web3" | "harmony" | "default") => {
        if (type === "harmony" || type === "default" ) {
            return provider.contracts.createContract(Contracts.contracts.Cycles.abi, Contracts.contracts.Cycles.address)
        }

        if (type === "web3") {
            return new provider.eth.Contract(Contracts.contracts.Cycles.abi, Contracts.contracts.Cycles.address)
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