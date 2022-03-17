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

// Typescript
interface FishFightProviderContext {
    FishFight: FishFight
    userConnected: boolean
    balance: string | undefined
    balanceFood: string | undefined
    balanceFoodWei: BN | undefined
    balanceFish: string | undefined
    balanceDeadFish: string | undefined
    balanceFightFish: string | undefined
    balanceBreedFish: string | undefined
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

	const fetchBalance = useCallback(
		async (account: string, FishFight: FishFight) => {
      // when account is connected get balances - uses default and read only providers
      const balance = await FishFight.provider.eth.getBalance(account)
      const parsedBalance = fromWei(balance, Units.one)
      setBalance(parsedBalance)

      const food = await FishFight.readFishFood.methods.balanceOf(account).call();
      const parsedFood = FishFight.provider.utils.fromWei(food);
      setBalanceFood(parsedFood);
      setBalanceFoodWei(new BN(food));

      const fish = await FishFight.readFishFactory.methods.balanceOf(account).call();
      const parsedFish = fish
      setBalanceFish(parsedFish);

      const deadfish = await FishFight.readDeadFishFactory.methods.balanceOf(account).call();
      setBalanceDeadFish(deadfish);

      const fightfish = await FishFight.readFightingWaters.methods.balanceOf(account).call();
      setBalanceFightFish(fightfish);

      const breedfish = await FishFight.readBreedingWaters.methods.balanceOf(account).call();
      setBalanceBreedFish(breedfish);
		},
		[setBalance, setBalanceFish, setBalanceFood, setBalanceDeadFish, setBalanceFightFish, setBalanceBreedFish],
	);

	const resetBalance = () => {
		setBalance(undefined);
		setBalanceFood(undefined);
		setBalanceFish(undefined);
		setBalanceDeadFish(undefined);
	};

	return {
		balance,
    balanceFood,
    balanceFoodWei,
    balanceFish,
    balanceDeadFish,
    balanceFightFish,
    balanceBreedFish,
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