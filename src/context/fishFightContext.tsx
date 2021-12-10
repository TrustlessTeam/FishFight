import FishFight from "../FishFightSDK";
import { createContext, useContext, useEffect, useState, useCallback} from "react"
import { useWeb3React } from "@web3-react/core";
import { getWalletProvider } from '../helpers/providerHelper'
import { toBech32 } from '@harmony-js/crypto';
import { isBech32Address, fromWei, hexToNumber, Units } from '@harmony-js/utils';
import { Harmony } from "@harmony-js/core";
import { Web3Provider } from "@ethersproject/providers";
import Web3 from 'web3';
import { Season } from '../utils/season';

// Typescript
interface FishFightProviderContext {
    FishFight: FishFight
    userConnected: boolean
    balance: string | undefined
    balanceFood: string | undefined
    balanceFish: string | undefined
    balanceDeadFish: string | undefined
    currentBlock: number
    currentSeason: Season | undefined
    currentPhaseEndTime: Date | undefined
    refetchBalance: () => void
	  resetBalance: () => void
    refetchSeason: () => void
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
  const contextSeasons = useSeasons();

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
        refetchSeason();
        console.log(FishFightInstance)
      })
    }
    if(!account) {
      console.log("account not connected");
      setUserConnected(false);
      refetchSeason();
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

  const refetchSeason = () => {
    contextSeasons.fetchSeason(FishFightInstance);
  }

  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    userConnected: userConnected,
    currentBlock: currentBlock,
    refetchBalance,
    ...contextBalance,
    ...contextSeasons,
    refetchSeason
  }
  return (
      <FishFightContext.Provider value={value}>{children}</FishFightContext.Provider>
  )
}

// Account balance utilities that will be included in FishFightContext
const useBalance = () => {
	const [balance, setBalance] = useState<string>();
	const [balanceFood, setBalanceFood] = useState<string>();
	const [balanceFish, setBalanceFish] = useState<string>();
	const [balanceDeadFish, setBalanceDeadFish] = useState<string>();

	const fetchBalance = useCallback(
		async (account: string, FishFight: FishFight) => {
      // when account is connected get balances - uses default and read only providers
      const balance = await FishFight.provider.eth.getBalance(account)
      const parsedBalance = fromWei(balance, Units.one)
      setBalance(parsedBalance)

      const food = await FishFight.readFishFood.methods.balanceOf(account).call();
      const parsedFood = FishFight.provider.utils.fromWei(food);
      setBalanceFood(parsedFood);

      const fish = await FishFight.readFishFactory.methods.balanceOf(account).call();
      const parsedFish = fish
      setBalanceFish(parsedFish);

      const deadfish = await FishFight.readDeadFishFactory.methods.balanceOf(account).call();
      const parsedDeadFish = deadfish
      setBalanceDeadFish(parsedDeadFish);
		},
		[setBalance, setBalanceFish, setBalanceFood, setBalanceDeadFish],
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
    balanceFish,
    balanceDeadFish,
		fetchBalance,
		resetBalance,
	};
};

// Account balance utilities that will be included in FishFightContext
const useSeasons = () => {
	const [currentSeason, setCurrentSeason] = useState<Season | undefined>(undefined);
	const [currentPhaseEndTime, setCurrentPhaseEndTime] = useState<Date | undefined>(undefined);

	const fetchSeason = useCallback(
		async (FishFight: FishFight) => {
      // when account is connected get balances - uses default and read only providers
      const season = await FishFight.readSeasons.methods.getCurrentSeason().call();
      const phaseEndTime = await FishFight.readSeasons.methods._phaseEndTime().call();
      const endTimeDate = new Date(Web3.utils.toNumber(phaseEndTime) * 1000)
      console.log(season)
      setCurrentSeason(new Season(season));
      setCurrentPhaseEndTime(endTimeDate);
		},
		[setCurrentSeason, setCurrentPhaseEndTime],
	);

	return {
		currentSeason,
    currentPhaseEndTime,
		fetchSeason,
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