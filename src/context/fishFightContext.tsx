import FishFight from "../FishFightSDK";
import { createContext, useContext, useEffect, useState, useCallback} from "react"
import { useWeb3React } from "@web3-react/core";
import { getWalletProvider } from '../helpers/providerHelper'
import { toBech32 } from '@harmony-js/crypto';
import { isBech32Address, fromWei, hexToNumber, Units } from '@harmony-js/utils';
import { EtherscanProvider, Web3Provider } from "@ethersproject/providers";
import Web3 from 'web3';
import BN from 'bn.js'
import { Phase } from '../utils/cycles';
import { ContractCallContext, ContractCallResults } from "ethereum-multicall";
import Contracts from '../contracts/contracts.json';
import ERC20 from '../contracts/erc20.json';
import { connectorsByName, ConnectorNames } from '../utils/connectors';
import { InjectedConnector } from "@web3-react/injected-connector";


// Typescript
interface FishFightProviderContext {
  FishFight: FishFight
  userConnected: boolean
  globalMute: boolean
  currentBlock: number

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

  totalSupply: number
  fishCurrentIndex: number
  fightingWatersWeakSupply: number
  fightingWatersNonLethalSupply: number
  fightingWatersSupply: number
  breedingWatersSupply: number
  totalSupplyDead: number
  totalDeadBurned: number
  currentCycle: number
  currentPhase: Phase | undefined
  maxSupply: number
  totalCaught: number
  totalFights: number
  totalBreeds: number
  refetchBalance: () => void
  resetBalance: () => void
  refetchStats: () => void
  toggleGlobalMute: () => void
  setLogOut: (value: boolean) => void
}

type FishFightProviderProps = { children: React.ReactNode }

// Initiating context as undefined
const FishFightContext = createContext<FishFightProviderContext | undefined>(undefined);

// Defining context provider
export const FishFightProvider = ({ children }: FishFightProviderProps ) => {
  // FishFight instance initiates with default url provider upon visiting page
  const [FishFightInstance, setFishFightInstance] = useState<FishFight>(new FishFight())
  const [userConnected, setUserConnected] = useState<boolean>(false);
  const [loggedOut, setLoggedOut] = useState<boolean>(false);
  const [globalMute, setGlobalMute] = useState<boolean>(false);
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  // State of web3React
  const { account, connector, library, active, activate, error} = useWeb3React();

  const contextBalance = useBalance();
  const contextStats = useStats();
  

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
    let mmConnector = connectorsByName[ConnectorNames.MetaMaskWallet] as InjectedConnector;
      
    mmConnector.isAuthorized()
      .then(async (isAuthorized) => {
        setUserConnected(true)
        if (isAuthorized && !active && !error && !loggedOut) {
          await activate(mmConnector)
        }
      })
      .catch(() => {
        setUserConnected(true)
      })
  }, [activate, active, error])

  // console.log(account)
  // console.log(active)
  // console.log(connector)
  // console.log(library)

  
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
      })
    }
    if(!account) {
      // console.log("account not connected");
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
    contextStats.fetchStats(FishFightInstance);
  }

  const toggleGlobalMute = () => {
    setGlobalMute(prev => !prev);
  }

  const setLogOut = () => {
    setLoggedOut(true);
  } 
    
  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    userConnected: userConnected,
    globalMute: globalMute,
    currentBlock: currentBlock,
    ...contextBalance,
    ...contextStats,
    refetchBalance,
    refetchStats,
    toggleGlobalMute,
    setLogOut
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
          reference: 'fightingWatersWeak',
          contractAddress: FishFight.readFightingWatersWeak.options.address,
          abi: Contracts.contracts.FightingWatersWeak.abi,
          calls: [{ reference: 'fighterBalanceWeak', methodName: 'balanceOf', methodParameters: [account] }]
        },
        {
          reference: 'fightingWatersNonLethal',
          contractAddress: FishFight.readFightingWatersNonLethal.options.address,
          abi: Contracts.contracts.FightingWatersNonLethal.abi,
          calls: [{ reference: 'fighterBalanceNonLethal', methodName: 'balanceOf', methodParameters: [account] }]
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
        // {
        //   reference: 'bloater',
        //   contractAddress: FishFight.readBloater.options.address,
        //   abi: ERC20,
        //   calls: [{ reference: 'bloaterBalance', methodName: 'balanceOf', methodParameters: [account] }]
        // },
      ];
    
      const results: ContractCallResults = await FishFight.multicall.call(contractCallContext);

      let fishBalance = results.results.fishFactory.callsReturnContext[0].success ? results.results.fishFactory.callsReturnContext[0].returnValues[0].hex : null;
      let deadFishBalance = results.results.deadFishFactory.callsReturnContext[0].success ? results.results.deadFishFactory.callsReturnContext[0].returnValues[0].hex : null;
      let fighterBalance = results.results.fightingWaters.callsReturnContext[0].success ? results.results.fightingWaters.callsReturnContext[0].returnValues[0].hex : null;
      let fighterBalanceWeak = results.results.fightingWatersWeak.callsReturnContext[0].success ? results.results.fightingWatersWeak.callsReturnContext[0].returnValues[0].hex : null;
      let fighterBalanceNonLethal = results.results.fightingWatersNonLethal.callsReturnContext[0].success ? results.results.fightingWatersNonLethal.callsReturnContext[0].returnValues[0].hex : null;
      let breederBalance = results.results.breedingWaters.callsReturnContext[0].success ? results.results.breedingWaters.callsReturnContext[0].returnValues[0].hex : null;
      let foodBalance = results.results.fishFood.callsReturnContext[0].success ? results.results.fishFood.callsReturnContext[0].returnValues[0].hex : null;
      let eggBalance = results.results.fishEgg.callsReturnContext[0].success ? results.results.fishEgg.callsReturnContext[0].returnValues[0].hex : null;
      let scaleBalance = results.results.fishScale.callsReturnContext[0].success ? results.results.fishScale.callsReturnContext[0].returnValues[0].hex : null;
      // let bloaterBalance = results.results.bloater.callsReturnContext[0].success ? results.results.bloater.callsReturnContext[0].returnValues[0].hex : null;
      

      fishBalance = Web3.utils.hexToNumberString(fishBalance)
      deadFishBalance = Web3.utils.hexToNumberString(deadFishBalance)
      fighterBalance = Web3.utils.hexToNumberString(fighterBalance)
      fighterBalanceWeak = Web3.utils.hexToNumberString(fighterBalanceWeak)
      fighterBalanceNonLethal = Web3.utils.hexToNumberString(fighterBalanceNonLethal)
      breederBalance = Web3.utils.hexToNumberString(breederBalance)

      foodBalance = new BN(Web3.utils.hexToNumberString(foodBalance))
      eggBalance = new BN(Web3.utils.hexToNumberString(eggBalance))
      scaleBalance = new BN(Web3.utils.hexToNumberString(scaleBalance))
      // bloaterBalance = new BN(Web3.utils.hexToNumberString(bloaterBalance))


      // when account is connected get balances - uses default and read only providers
      const balance = await FishFight.provider.eth.getBalance(account)
      const parsedBalance = fromWei(balance, Units.one)
      setBalance(parsedBalance)

      const parsedFood = FishFight.provider.utils.fromWei(foodBalance);
      setBalanceFood(parsedFood);
      setBalanceFoodWei(foodBalance);

      setBalanceFish(fishBalance);
      setBalanceDeadFish(deadFishBalance);
      setBalanceFightFish((Web3.utils.toNumber(fighterBalance) + Web3.utils.toNumber(fighterBalanceWeak) + Web3.utils.toNumber(fighterBalanceNonLethal)).toString());
      setBalanceBreedFish(breederBalance);
      setBalanceFishEgg(eggBalance);
      setBalanceFishScale(scaleBalance);
      // setBalanceBloater(bloaterBalance);

		},
		[setBalance, setBalanceFish, setBalanceFood, setBalanceDeadFish, setBalanceFightFish, setBalanceBreedFish, setBalanceFishEgg, setBalanceFishScale],
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
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [fishCurrentIndex, setFishCurrentIndex] = useState<number>(0);
  const [fightingWatersSupply, setFightingWatersSupply] = useState<number>(0);
  const [fightingWatersWeakSupply, setFightingWatersWeakSupply] = useState<number>(0);
  const [fightingWatersNonLethalSupply, setFightingWatersNonLethalSupply] = useState<number>(0);
	const [breedingWatersSupply, setBreedingWatersSupply] = useState<number>(0);

  const [totalSupplyDead, setTotalSupplyDead] = useState<number>(0);
  const [totalDeadBurned, setTotalDeadBurned] = useState<number>(0);

	const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [currentPhase, setCurrentPhase] = useState<Phase | undefined>(undefined)
	const [maxSupply, setMaxSupply] = useState<number>(0);
  const [totalCaught, setTotalCaught] = useState<number>(0);
  const [totalFights, setTotalFights] = useState<number>(0);
  const [totalBreeds, setTotalBreeds] = useState<number>(0);

	const fetchStats = useCallback(
		async (FishFight: FishFight) => {

      const contractCallContext: ContractCallContext[] = [
        {
          reference: 'fishFactory',
          contractAddress: FishFight.readFishFactory.options.address,
          abi: Contracts.contracts.FishFactory.abi,
          calls: [{ reference: 'totalFish', methodName: 'totalSupply', methodParameters: [] },
            { reference: 'currentFishIndex', methodName: 'currentIndex', methodParameters: [] },
            { reference: 'totalFighters', methodName: 'balanceOf', methodParameters: [FishFight.readFightingWaters.options.address] },
            { reference: 'totalFightersWeak', methodName: 'balanceOf', methodParameters: [FishFight.readFightingWatersWeak.options.address] },
            { reference: 'totalBreeders', methodName: 'balanceOf', methodParameters: [FishFight.readBreedingWaters.options.address] },
            { reference: 'totalFightersNonLethal', methodName: 'balanceOf', methodParameters: [FishFight.readFightingWatersNonLethal.options.address] },
          ]
        },
        {
          reference: 'deadFishFactory',
          contractAddress: FishFight.readDeadFishFactory.options.address,
          abi: Contracts.contracts.DeadFishFactory.abi,
          calls: [{ reference: 'totalDead', methodName: 'totalSupply', methodParameters: [] },
            { reference: 'burnedDead', methodName: '_burnedDeadFish', methodParameters: [] }
          ]
        },
        {
          reference: 'cycles',
          contractAddress: FishFight.readCycles.options.address,
          abi: Contracts.contracts.Cycles.abi,
          calls: [{ reference: 'currentCycle', methodName: 'getCycle', methodParameters: [] },
            { reference: 'currentPhase', methodName: 'getPhase', methodParameters: [] },
            { reference: 'maxSupply', methodName: '_maxSupply', methodParameters: [] },
            { reference: 'totalCatches', methodName: '_totalCatches', methodParameters: [] },
            { reference: 'totalFights', methodName: '_totalFights', methodParameters: [] },
            { reference: 'totalBreeds', methodName: '_totalBreeds', methodParameters: [] },
          ]
        }
      ];
      const results: ContractCallResults = await FishFight.multicall.call(contractCallContext);

      let totalFish = results.results.fishFactory.callsReturnContext[0].success ? results.results.fishFactory.callsReturnContext[0].returnValues[0].hex : null;
      let currentFishIndex = results.results.fishFactory.callsReturnContext[1].success ? results.results.fishFactory.callsReturnContext[1].returnValues[0].hex : null;
      let totalFighters = results.results.fishFactory.callsReturnContext[2].success ? results.results.fishFactory.callsReturnContext[2].returnValues[0].hex : null;
      let totalFightersWeak = results.results.fishFactory.callsReturnContext[3].success ? results.results.fishFactory.callsReturnContext[3].returnValues[0].hex : null;
      let totalBreeders = results.results.fishFactory.callsReturnContext[4].success ? results.results.fishFactory.callsReturnContext[4].returnValues[0].hex : null;
      let totalFightersNonLethal = results.results.fishFactory.callsReturnContext[5].success ? results.results.fishFactory.callsReturnContext[5].returnValues[0].hex : null;

      let totalDead = results.results.deadFishFactory.callsReturnContext[0].success ? results.results.deadFishFactory.callsReturnContext[0].returnValues[0].hex : null;
      let burnedDead = results.results.deadFishFactory.callsReturnContext[1].success ? results.results.deadFishFactory.callsReturnContext[1].returnValues[0].hex : null;
      
      let currentCycle = results.results.cycles.callsReturnContext[0].success ? results.results.cycles.callsReturnContext[0].returnValues[0].hex : null;
      let currentPhase = results.results.cycles.callsReturnContext[1].success ? results.results.cycles.callsReturnContext[1].returnValues : null;
      let maxSupply = results.results.cycles.callsReturnContext[2].success ? results.results.cycles.callsReturnContext[2].returnValues[0].hex : null;
      let totalCatches = results.results.cycles.callsReturnContext[3].success ? results.results.cycles.callsReturnContext[3].returnValues[0].hex : null;
      let totalFights = results.results.cycles.callsReturnContext[4].success ? results.results.cycles.callsReturnContext[4].returnValues[0].hex : null;
      let totalBreeds = results.results.cycles.callsReturnContext[5].success ? results.results.cycles.callsReturnContext[5].returnValues[0].hex : null;

      setTotalSupply(Web3.utils.hexToNumber(totalFish));
      setFishCurrentIndex(Web3.utils.hexToNumber(currentFishIndex));
      setFightingWatersSupply(Web3.utils.hexToNumber(totalFighters));
      setFightingWatersWeakSupply(Web3.utils.hexToNumber(totalFightersWeak));
      setFightingWatersNonLethalSupply(Web3.utils.hexToNumber(totalFightersNonLethal));
      setBreedingWatersSupply(Web3.utils.hexToNumber(totalBreeders));

      setTotalSupplyDead(Web3.utils.hexToNumber(totalDead))
      setTotalDeadBurned(Web3.utils.hexToNumber(burnedDead))

      setCurrentCycle(Web3.utils.hexToNumber(currentCycle));
      setCurrentPhase(new Phase(currentPhase));
      setMaxSupply(Web3.utils.hexToNumber(maxSupply));
      setTotalCaught(Web3.utils.hexToNumber(totalCatches))
      setTotalFights(Web3.utils.hexToNumber(totalFights))
      setTotalBreeds(Web3.utils.hexToNumber(totalBreeds))
		},
		[
      setTotalSupply,
      setFishCurrentIndex,
      setFightingWatersSupply,
      setFightingWatersWeakSupply,
      setFightingWatersNonLethalSupply,
      setBreedingWatersSupply,
      setTotalSupplyDead,
      setTotalDeadBurned,
      setCurrentCycle,
      setCurrentPhase,
      setMaxSupply,
      setTotalCaught,
      setTotalFights,
      setTotalBreeds,
    ],
	);

	return {
    totalSupply,
    fishCurrentIndex,
    fightingWatersSupply,
    fightingWatersWeakSupply,
    fightingWatersNonLethalSupply,
    breedingWatersSupply,
    totalSupplyDead,
    totalDeadBurned,
    currentCycle,
    currentPhase,
    maxSupply,
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