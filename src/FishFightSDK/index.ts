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
import ERC20Abi from '../contracts/erc20.json';
import Web3 from "web3"
import { Constants } from "../utils/constants";
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
    // Read only
    readFishFactory: Contract
    readFishStats: Contract
    readDeadFishFactory: Contract
    readCycles: Contract
    readFishingWaters: Contract
    readFightingWaters: Contract
    readBreedingWaters: Contract
    readTrainingWaters: Contract
    readModifierWaters: Contract
    readFightComputation: Contract
    readFishFood: Contract
    readFishEgg: Contract
    readFishScale: Contract
    readBloater: Contract
    // Listeners
    listenFishFactory: Contract
    listenFishStats: Contract
    listenDeadFishFactory: Contract
    listenCycles: Contract
    listenFishingWaters: Contract
    listenFightingWaters: Contract
    listenBreedingWaters: Contract
    listenTrainingWaters: Contract
    listenFishFood: Contract
    // Connected Wallet
    fishFactory: Contract | null
    fishStats: Contract | null
    deadFishFactory: Contract| null
    cycles: Contract | null
    fishingWaters: Contract | null
    fightingWaters: Contract | null
    breedingWaters: Contract | null
    trainingWaters: Contract | null
    modifierWaters: Contract | null
    fishFood: Contract| null
    fishEgg: Contract| null
    fishScale: Contract| null
    bloater: Contract| null
    redgill: Contract| null
    
    

    constructor(){
        this.provider = new Web3(getProvider().url);
        this.listener = new Web3(new Web3.providers.WebsocketProvider(getWebSocketProvider().url, wsOptions)); 
        this.providerWallet = null; // Gets set when user connects Wallet
        this.type = null
        
        // Data Aggregation Contracts - Read Only
        this.multicall = new Multicall({ nodeUrl: getProvider().url, multicallCustomContractAddress: Contracts.contracts.Multicall.address, tryAggregate: true });
        this.fishCalls = this.setContract(this.provider, Contracts.contracts.FishCalls.abi, Contracts.contracts.FishCalls.address)

        //READ ONLY PROVIDERS
        // ERC721 Contracts and Data
        this.readFishFactory = this.setContract(this.provider, Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        this.readFishStats = this.setContract(this.provider, Contracts.contracts.FishStats.abi, Contracts.contracts.FishStats.address)
        this.readDeadFishFactory = this.setContract(this.provider, Contracts.contracts.DeadFishFactory.abi, Contracts.contracts.DeadFishFactory.address)

        // Gameplay Contracts
        this.readCycles = this.setContract(this.provider, Contracts.contracts.Cycles.abi, Contracts.contracts.Cycles.address)
        this.readFishingWaters = this.setContract(this.provider, Contracts.contracts.FishingWaters.abi, Contracts.contracts.FishingWaters.address)
        this.readFightingWaters = this.setContract(this.provider, Contracts.contracts.FightingWaters.abi, Contracts.contracts.FightingWaters.address)
        this.readBreedingWaters = this.setContract(this.provider, Contracts.contracts.BreedingWaters.abi, Contracts.contracts.BreedingWaters.address)
        this.readTrainingWaters = this.setContract(this.provider, Contracts.contracts.TrainingWaters.abi, Contracts.contracts.TrainingWaters.address)
        this.readFightComputation = this.setContract(this.provider,  Contracts.contracts.FightComputation.abi, Contracts.contracts.FightComputation.address)
        this.readModifierWaters = this.setContract(this.provider, Contracts.contracts.ModifierWaters.abi, Contracts.contracts.ModifierWaters.address)
        
        // ERC20 Contracts
        this.readFishFood = this.setContract(this.provider, Contracts.contracts.FishFood.abi, Contracts.contracts.FishFood.address)
        this.readFishEgg = this.setContract(this.provider, Contracts.contracts.FishEgg.abi, Contracts.contracts.FishEgg.address)
        this.readFishScale = this.setContract(this.provider, Contracts.contracts.FishScale.abi, Contracts.contracts.FishScale.address)
        this.readBloater = this.setContract(this.provider, ERC20Abi, Constants._bloaterAddress)
        

        // LISTNER PROVIDERS
        // ERC721
        this.listenFishFactory = this.setContract(this.listener, Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        this.listenFishStats = this.setContract(this.listener, Contracts.contracts.FishStats.abi, Contracts.contracts.FishStats.address)
        this.listenDeadFishFactory = this.setContract(this.listener, Contracts.contracts.DeadFishFactory.abi, Contracts.contracts.DeadFishFactory.address)

        // Gameplay
        this.listenCycles = this.setContract(this.listener, Contracts.contracts.Cycles.abi, Contracts.contracts.Cycles.address)
        this.listenFishingWaters = this.setContract(this.listener, Contracts.contracts.FishingWaters.abi, Contracts.contracts.FishingWaters.address)
        this.listenFightingWaters = this.setContract(this.listener, Contracts.contracts.FightingWaters.abi, Contracts.contracts.FightingWaters.address)
        this.listenBreedingWaters = this.setContract(this.listener, Contracts.contracts.BreedingWaters.abi, Contracts.contracts.BreedingWaters.address)
        this.listenTrainingWaters = this.setContract(this.listener, Contracts.contracts.TrainingWaters.abi, Contracts.contracts.TrainingWaters.address)
        
        // ERC20
        this.listenFishFood = this.setContract(this.listener, Contracts.contracts.FishFood.abi, Contracts.contracts.FishFood.address)
        

        // User Wallet Provider - For transactions - Initialize when user connects wallet
        // ERC721
        this.fishFactory = null;
        this.fishStats = null;
        this.deadFishFactory = null;

        // Gameplay
        this.cycles = null;
        this.fishingWaters = null;
        this.fightingWaters = null;
        this.breedingWaters = null;
        this.trainingWaters = null;
        this.modifierWaters = null;

        //ERC20
        this.fishFood = null;
        this.fishEgg = null;
        this.fishScale = null;
        this.bloater = null;
        this.redgill = null;
    }

    setProviderWallet = (providerWallet: HarmonyExtension | Web3, type: "web3" | "harmony") => {
        this.providerWallet = providerWallet;
        if(type === "web3") {
            this.providerWallet = this.providerWallet as Web3
            this.providerWallet.eth.handleRevert = true;
        }
        this.type = type;

        this.fishFactory = this.setContract(this.providerWallet, Contracts.contracts.FishFactory.abi, Contracts.contracts.FishFactory.address)
        this.deadFishFactory = this.setContract(this.providerWallet, Contracts.contracts.DeadFishFactory.abi, Contracts.contracts.DeadFishFactory.address)

        this.cycles = this.setContract(this.providerWallet, Contracts.contracts.Cycles.abi, Contracts.contracts.Cycles.address)
        this.fishingWaters = this.setContract(this.providerWallet, Contracts.contracts.FishingWaters.abi, Contracts.contracts.FishingWaters.address)
        this.fightingWaters = this.setContract(this.providerWallet, Contracts.contracts.FightingWaters.abi, Contracts.contracts.FightingWaters.address)
        this.breedingWaters = this.setContract(this.providerWallet, Contracts.contracts.BreedingWaters.abi, Contracts.contracts.BreedingWaters.address)
        this.trainingWaters = this.setContract(this.providerWallet, Contracts.contracts.TrainingWaters.abi, Contracts.contracts.TrainingWaters.address)
        this.modifierWaters = this.setContract(this.providerWallet, Contracts.contracts.ModifierWaters.abi, Contracts.contracts.ModifierWaters.address)
        
        this.fishFood = this.setContract(this.providerWallet, Contracts.contracts.FishFood.abi, Contracts.contracts.FishFood.address)
        this.fishEgg = this.setContract(this.providerWallet, Contracts.contracts.FishEgg.abi, Contracts.contracts.FishEgg.address)
        this.fishScale = this.setContract(this.providerWallet, Contracts.contracts.FishScale.abi, Contracts.contracts.FishScale.address)
        this.bloater = this.setContract(this.providerWallet, ERC20Abi, Constants._bloaterAddress)

        console.log(this.readBloater)
    }

    setContract = (provider: any, abi: any, address: string) => {
        return new provider.eth.Contract(abi, address)
    }

}

export default FishFight 