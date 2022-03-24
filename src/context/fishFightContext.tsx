import FishFight from "../FishFightSDK";
import { createContext, useContext, useEffect, useState, useCallback} from "react"
import { useWeb3React } from "@web3-react/core";
import { getWalletProvider } from '../helpers/providerHelper'
import { toBech32 } from '@harmony-js/crypto';
import { isBech32Address, fromWei, hexToNumber, Units } from '@harmony-js/utils';
import { Harmony } from "@harmony-js/core";
import { EtherscanProvider, Web3Provider } from "@ethersproject/providers";
import Web3 from 'web3';
import BN from 'bn.js'
import { Phase } from '../utils/cycles';
import { ContractCallContext, ContractCallResults } from "ethereum-multicall";
import Contracts from '../contracts/contracts.json';


// Typescript
interface FishFightProviderContext {
    FishFight: FishFight
    userConnected: boolean

    balance: string | undefined
    balanceFish: string | undefined
    balanceDeadFish: string | undefined
    balanceFightFish: string | undefined
    balanceBreedFish: string | undefined
    balanceFood: string | undefined
    balanceFoodWei: BN | undefined
    balanceFishEgg: BN | undefined
    balanceFishScale: BN | undefined
    balanceBloater: BN | undefined
    balanceRedgill: BN | undefined

    currentBlock: number
    currentPhase: Phase | undefined
    currentCycle: number;
    maxSupply: number
    totalCaught: number
    totalFights: number
    totalBreeds: number
    totalSupply: number
    fightingWatersSupply: number
    breedingWatersSupply: number
    refetchBalance: () => void
	  resetBalance: () => void
    refetchStats: () => void
    // seasonNumber: number
    // seasonPhase: string
}

type FishFightProviderProps = { children: React.ReactNode }

// Initiating context as undefined
const FishFightContext = createContext<FishFightProviderContext | undefined>(undefined);

// Defining context provider
export const FishFightProvider = ({ children }: FishFightProviderProps ) => {
  // FishFight instance initiates with default url provider upon visiting page
  const [FishFightInstance, setFishFightInstance] = useState<FishFight>(new FishFight())
  const [userConnected, setUserConnected] = useState<boolean>(false);
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  // State of web3React
  const { account, connector, library} = useWeb3React();

  const contextBalance = useBalance();
  const contextSeasons = useStats();

  console.log("fishfight")
  

  // useEffect(() => {
  //   // Set websocket block listener
  //   var subscription = FishFightInstance.listener.eth.subscribe('newBlockHeaders');
  //   subscription.on("data", function(blockHeader){
  //     setCurrentBlock(blockHeader.number)
  //   })
      
  //   return () => {
  //     subscription.unsubscribe(function(error, success){
  //       if (success) {
  //           console.log('Successfully unsubscribed!');
  //       }
  //     });
  //   }
  // }, [])

  
  useEffect(() => {
    // When user logs in, get wallet provider (harmonyExtension or web3provider)
    if (account && connector && library) {
      getWalletProvider(connector, library).then(async (wallet) =>
      {
        FishFightInstance.setProviderWallet(wallet.provider, wallet.type);
        // setFishFightInstance(new FishFight())
        setUserConnected(true);
        refetchBalance();
        refetchStats();
        console.log(FishFightInstance)
      })
    }
    if(!account) {
      console.log("account not connected");
      setUserConnected(false);
      refetchStats();
    }
  }, [connector, library, account])

  const refetchBalance = () => {
    if(!connector || !library){
      contextBalance.resetBalance()
      return;
    }  
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    account ? getWalletProvider(connector, library).then((wallet) => {
      contextBalance.fetchBalance(account, FishFightInstance)
    }) : contextBalance.resetBalance()
  }

  const refetchStats = () => {
    contextSeasons.fetchStats(FishFightInstance);
  }

  

  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    userConnected: userConnected,
    currentBlock: currentBlock,
    refetchBalance,
    ...contextBalance,
    ...contextSeasons,
    refetchStats
  }
  return (
      <FishFightContext.Provider value={value}>{children}</FishFightContext.Provider>
  )
}

// Account balance utilities that will be included in FishFightContext
const useBalance = () => {
	const [balance, setBalance] = useState<string>();
	const [balanceFood, setBalanceFood] = useState<string>();
	const [balanceFoodWei, setBalanceFoodWei] = useState<BN>();
	const [balanceFish, setBalanceFish] = useState<string>();
	const [balanceDeadFish, setBalanceDeadFish] = useState<string>();
	const [balanceFightFish, setBalanceFightFish] = useState<string>();
	const [balanceBreedFish, setBalanceBreedFish] = useState<string>();
  const [balanceFishEgg, setBalanceFishEgg] = useState<BN>();
  const [balanceFishScale, setBalanceFishScale] = useState<BN>();
  const [balanceBloater, setBalanceBloater] = useState<BN>();
  const [balanceRedgill, setBalanceRedgill] = useState<BN>();

	const fetchBalance = useCallback(
		async (account: string, FishFight: FishFight) => {

      const contractCallContext: ContractCallContext[] = [
        {
          reference: 'fishFactory',
          contractAddress: FishFight.readFishFactory.options.address,
          abi: Contracts.contracts.FishFactory.abi,
          calls: [{ reference: 'fishBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'deadFishFactory',
          contractAddress: FishFight.readDeadFishFactory.options.address,
          abi: Contracts.contracts.DeadFishFactory.abi,
          calls: [{ reference: 'deadFishBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'fishFood',
          contractAddress: FishFight.readFishFood.options.address,
          abi: Contracts.contracts.FishFood.abi,
          calls: [{ reference: 'foodBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'fightingWaters',
          contractAddress: FishFight.readFightingWaters.options.address,
          abi: Contracts.contracts.FightingWaters.abi,
          calls: [{ reference: 'fighterBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'breedingWaters',
          contractAddress: FishFight.readBreedingWaters.options.address,
          abi: Contracts.contracts.BreedingWaters.abi,
          calls: [{ reference: 'breederBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'fishEgg',
          contractAddress: FishFight.readFishEgg.options.address,
          abi: Contracts.contracts.FishEgg.abi,
          calls: [{ reference: 'eggBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'fishScale',
          contractAddress: FishFight.readFishScale.options.address,
          abi: Contracts.contracts.FishScale.abi,
          calls: [{ reference: 'scaleBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'bloater',
          contractAddress: FishFight.readBloater.options.address,
          abi: Contracts.contracts.TestERC20.abi,
          calls: [{ reference: 'bloaterBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'redgill',
          contractAddress: FishFight.readRedgill.options.address,
          abi: Contracts.contracts.TestERC20.abi,
          calls: [{ reference: 'redgillBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
      ];
    
      
    
      const results: ContractCallResults = await FishFight.multicall.call(contractCallContext);
      console.log(results)
      let fishBalance = results.results.fishFactory.callsReturnContext[0].success ? results.results.fishFactory.callsReturnContext[0].returnValues[0].hex : null;
      let deadFishBalance = results.results.deadFishFactory.callsReturnContext[0].success ? results.results.deadFishFactory.callsReturnContext[0].returnValues[0].hex : null;
      let fighterBalance = results.results.fightingWaters.callsReturnContext[0].success ? results.results.fightingWaters.callsReturnContext[0].returnValues[0].hex : null;
      let breederBalance = results.results.breedingWaters.callsReturnContext[0].success ? results.results.breedingWaters.callsReturnContext[0].returnValues[0].hex : null;
      let foodBalance = results.results.fishFood.callsReturnContext[0].success ? results.results.fishFood.callsReturnContext[0].returnValues[0].hex : null;
      let eggBalance = results.results.fishEgg.callsReturnContext[0].success ? results.results.fishEgg.callsReturnContext[0].returnValues[0].hex : null;
      let scaleBalance = results.results.fishScale.callsReturnContext[0].success ? results.results.fishScale.callsReturnContext[0].returnValues[0].hex : null;
      let bloaterBalance = results.results.bloater.callsReturnContext[0].success ? results.results.bloater.callsReturnContext[0].returnValues[0].hex : null;
      let redgillBalance = results.results.redgill.callsReturnContext[0].success ? results.results.redgill.callsReturnContext[0].returnValues[0].hex : null;

      fishBalance = Web3.utils.hexToNumberString(fishBalance)
      deadFishBalance = Web3.utils.hexToNumberString(deadFishBalance)
      fighterBalance = Web3.utils.hexToNumberString(fighterBalance)
      breederBalance = Web3.utils.hexToNumberString(breederBalance)

      foodBalance = new BN(Web3.utils.hexToNumberString(foodBalance))
      eggBalance = new BN(Web3.utils.hexToNumberString(eggBalance))
      scaleBalance = new BN(Web3.utils.hexToNumberString(scaleBalance))
      bloaterBalance = new BN(Web3.utils.hexToNumberString(bloaterBalance))
      redgillBalance = new BN(Web3.utils.hexToNumberString(redgillBalance))

      // when account is connected get balances - uses default and read only providers
      const balance = await FishFight.provider.eth.getBalance(account)
      const parsedBalance = fromWei(balance, Units.one)
      setBalance(parsedBalance)

      const parsedFood = FishFight.provider.utils.fromWei(foodBalance);
      setBalanceFood(parsedFood);
      setBalanceFoodWei(foodBalance);

      setBalanceFish(fishBalance);
      setBalanceDeadFish(deadFishBalance);
      setBalanceFightFish(fighterBalance);
      setBalanceBreedFish(breederBalance);
      setBalanceFishEgg(eggBalance);
      setBalanceFishScale(scaleBalance);
      setBalanceBloater(bloaterBalance);
      setBalanceRedgill(redgillBalance);

		},
		[setBalance, setBalanceFish, setBalanceFood, setBalanceDeadFish, setBalanceFightFish, setBalanceBreedFish, setBalanceFishEgg, setBalanceFishScale, setBalanceRedgill],
	);

	const resetBalance = () => {
    setBalance(undefined)
    setBalanceFish(undefined);
    setBalanceDeadFish(undefined);
    setBalanceFightFish(undefined);
    setBalanceBreedFish(undefined);

    setBalanceFood(undefined);
    setBalanceFoodWei(undefined);
    setBalanceFishEgg(undefined);
    setBalanceFishScale(undefined);
    setBalanceBloater(undefined);
    setBalanceRedgill(undefined);
	};

	return {
		balance: balance,
    balanceFish: balanceFish,
    balanceDeadFish: balanceDeadFish,
    balanceFightFish: balanceFightFish,
    balanceBreedFish: balanceBreedFish,

    balanceFood: balanceFood,
    balanceFoodWei: balanceFoodWei,
    balanceFishEgg: balanceFishEgg,
    balanceFishScale: balanceFishScale,
    balanceBloater: balanceBloater,
    balanceRedgill: balanceRedgill,
		fetchBalance,
		resetBalance,
	};
};

// Account balance utilities that will be included in FishFightContext
const useStats = () => {
	const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>(new Phase(0))
	const [maxSupply, setMaxSupply] = useState<number>(0);
  const [totalCaught, setTotalCaught] = useState<number>(0);
  const [totalFights, setTotalFights] = useState<number>(0);
  const [totalBreeds, setMaxBred] = useState<number>(0);
	const [totalSupply, setTotalSupply] = useState<number>(0);
	const [fightingWatersSupply, setFightingWatersSupply] = useState<number>(0);
	const [breedingWatersSupply, setBreedingWatersSupply] = useState<number>(0);

	const [currentPhaseEndTime, setCurrentPhaseEndTime] = useState<number | undefined>(undefined);


	const fetchStats = useCallback(
		async (FishFight: FishFight) => {
      // when account is connected get balances - uses default and read only providers
      const cycle = await FishFight.readCycles.methods.getCycle().call();
      const totalSupply = await FishFight.readFishFactory.methods.totalSupply().call();
      const maxSupply = await FishFight.readCycles.methods._maxSupply().call();
      const totalCatches = await FishFight.readCycles.methods._totalCatches().call();
      const totalFights = await FishFight.readCycles.methods._totalFights().call();
      const totalBreeds = await FishFight.readCycles.methods._totalBreeds().call();
      const fightingSupply = await FishFight.readFishFactory.methods.balanceOf(FishFight.readFightingWaters.options.address).call();
      const breedingSupply = await FishFight.readFishFactory.methods.balanceOf(FishFight.readBreedingWaters.options.address).call();
      const phase = await FishFight.readCycles.methods.getPhase().call();
      console.log(phase)
      setCurrentCycle(Web3.utils.toNumber(cycle));
      setCurrentPhase(new Phase(phase));
      setTotalSupply(Web3.utils.toNumber(totalSupply));
      setMaxSupply(Web3.utils.toNumber(maxSupply));
      setFightingWatersSupply(Web3.utils.toNumber(fightingSupply));
      setBreedingWatersSupply(Web3.utils.toNumber(breedingSupply));
      setTotalCaught(Web3.utils.toNumber(totalCatches))
      setTotalFights(Web3.utils.toNumber(totalFights))
      setMaxBred(Web3.utils.toNumber(totalBreeds))
		},
		[setCurrentCycle, setCurrentPhase],
	);

	return {
		currentCycle,
    currentPhase,
    maxSupply,
    totalSupply,
    fightingWatersSupply,
    breedingWatersSupply,
    totalCaught,
    totalFights,
    totalBreeds,
		fetchStats,
	};
};

// useFishFight
export const useFishFight = () => {
  const context = useContext(FishFightContext)

  if(!context) {
    throw 'useFishFight must be used within a FishFightProvider';
  }
  return context
}