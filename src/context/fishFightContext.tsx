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
import { Season } from '../utils/season';

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
    currentSeason: Season | undefined
    currentPhaseEndTime: number | undefined
    maxSupply: number
    maxCaught: number
    maxKilled: number
    maxBred: number
    totalSupply: number
    fightingWatersSupply: number
    breedingWatersSupply: number
    fightingFishApproval: boolean
    fightingFoodApproval: boolean
    breedingFishApproval: boolean
    breedingFoodApproval: boolean
    refetchBalance: () => void
	  resetBalance: () => void
    refetchStats: () => void
    checkApprovals: () => void
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
  const [fightingFishApproval, setFightingFishApproval] = useState<boolean>(false);
  const [fightingFoodApproval, setFightingFoodApproval] = useState<boolean>(false);

  const [breedingFishApproval, setBreedingFishApproval] = useState<boolean>(false);
  const [breedingFoodApproval, setBreedingFoodApproval] = useState<boolean>(false);

  // const [trainingFishApproval, setTrainingFishApproval] = useState<boolean>(false);
  // const [trainingFoodApproval, setTrainingFoodApproval] = useState<boolean>(false);


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
        checkApprovals();
        console.log(FishFightInstance)
      })
    }
    if(!account) {
      console.log("account not connected");
      setUserConnected(false);
      refetchStats();
    }
  }, [connector, library])

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

  const checkApprovals = async () => {
    // Fighting Waters approvals
    const approvedFishFighting = await FishFightInstance.readFishFactory.methods.isApprovedForAll(account, FishFightInstance.readFightingWaters.options.address).call();
    if(approvedFishFighting) setFightingFishApproval(true);
    let approvedFoodFighting = new BN(await FishFightInstance.readFishFood.methods.allowance(account, FishFightInstance.readFightingWaters.options.address).call());
    // approvedFoodFighting = new BN(approvedFoodFighting);
    if(approvedFoodFighting.gt(new BN('99999999'))) setFightingFoodApproval(true);

    // Breeding Waters approvals
    const approvedFishBreeding = await FishFightInstance.readFishFactory.methods.isApprovedForAll(account, FishFightInstance.readBreedingWaters.options.address).call();
    if(approvedFishBreeding) setBreedingFishApproval(true);
    let approvedFoodBreeding = new BN(await FishFightInstance.readFishFood.methods.allowance(account, FishFightInstance.readBreedingWaters.options.address).call());
    // approvedFoodBreeding = new BN(approvedFoodBreeding);
    if(approvedFoodBreeding.gt(new BN('99999999'))) setBreedingFoodApproval(true);

    // Training Waters approvals
    // const approvedFishTraining = await FishFightInstance.readFishFactory.methods.isApprovedForAll(account, FishFightInstance.readTrainingWaters.options.address).call();
    // if(approvedFishTraining) setTrainingFishApproval(true);
    // const approvedFoodTraining = await FishFightInstance.readFishFood.methods.allowance(account, FishFightInstance.readTrainingWaters.options.address).call();
    // if(Web3.utils.fromWei(approvedFoodTraining) >= '99999999') setTrainingFoodApproval(true);
  }

  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    userConnected: userConnected,
    currentBlock: currentBlock,
    fightingFishApproval: fightingFishApproval,
    fightingFoodApproval: fightingFoodApproval,
    breedingFishApproval: breedingFishApproval,
    breedingFoodApproval: breedingFoodApproval,
    refetchBalance,
    ...contextBalance,
    ...contextSeasons,
    refetchStats,
    checkApprovals,
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
	const [currentSeason, setCurrentSeason] = useState<Season | undefined>(undefined);
	const [maxSupply, setMaxSupply] = useState<number>(0);
  const [maxCaught, setMaxCaught] = useState<number>(0);
  const [maxKilled, setMaxKilled] = useState<number>(0);
  const [maxBred, setMaxBred] = useState<number>(0);
	const [totalSupply, setTotalSupply] = useState<number>(0);
	const [fightingWatersSupply, setFightingWatersSupply] = useState<number>(0);
	const [breedingWatersSupply, setBreedingWatersSupply] = useState<number>(0);

	const [currentPhaseEndTime, setCurrentPhaseEndTime] = useState<number | undefined>(undefined);


	const fetchStats = useCallback(
		async (FishFight: FishFight) => {
      // when account is connected get balances - uses default and read only providers
      const season = await FishFight.readSeasons.methods.getCurrentSeason().call();
      const totalSupply = await FishFight.readFishFactory.methods.totalSupply().call();
      const maxSupply = await FishFight.readSeasons.methods._maxSupply().call();
      const maxCatch = await FishFight.readSeasons.methods._maxFishCaught().call();
      const maxDeath = await FishFight.readSeasons.methods._maxFishCaught().call();
      const maxBirths = await FishFight.readSeasons.methods._maxFishCaught().call();
      const phaseEndTime = await FishFight.readSeasons.methods._phaseEndTime().call();
      const endTimeDate = Web3.utils.toNumber(phaseEndTime) * 1000
      const fightingSupply = await FishFight.readFishFactory.methods.balanceOf(FishFight.readFightingWaters.options.address).call();
      const breedingSupply = await FishFight.readFishFactory.methods.balanceOf(FishFight.readBreedingWaters.options.address).call();
      console.log(endTimeDate)
      setCurrentSeason(new Season(season));
      setCurrentPhaseEndTime(endTimeDate);
      setTotalSupply(Web3.utils.toNumber(totalSupply));
      setMaxSupply(Web3.utils.toNumber(maxSupply));
      setFightingWatersSupply(Web3.utils.toNumber(fightingSupply));
      setBreedingWatersSupply(Web3.utils.toNumber(breedingSupply));
      setMaxCaught(Web3.utils.toNumber(maxCatch))
      setMaxKilled(Web3.utils.toNumber(maxDeath))
      setMaxBred(Web3.utils.toNumber(maxBirths))
		},
		[setCurrentSeason, setCurrentPhaseEndTime],
	);

	return {
		currentSeason,
    currentPhaseEndTime,
    maxSupply,
    totalSupply,
    fightingWatersSupply,
    breedingWatersSupply,
    maxCaught,
    maxKilled,
    maxBred,
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