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
import { Constants } from '../utils/constants';
import { Fish } from '../utils/fish';


// Typescript
interface FishStats {
  power: number;
  // Add other stats as needed
}

interface OpponentStats {
  minPower: number;
  maxPower: number;
  // other stats...
}

// First, let's define what comes from useBalance
interface BalanceContext {
  balance: string | undefined;
  balanceFish: string | undefined;
  balanceDeadFish: string | undefined;
  balanceFightFish: string | undefined;
  balanceBreedFish: string | undefined;
  balanceFood: string | undefined;
  balanceFoodWei: BN | undefined;
  balanceFishEgg: BN | undefined;
  balanceFishScale: BN | undefined;
  balanceBloater: BN | undefined;
  // Make sure account matches useWeb3React type
  account: string | null | undefined;
}

interface FishFightProviderContext {
  FishFight: FishFight;
  userConnected: boolean;
  globalMute: boolean;
  currentBlock: number;

  // Spread the balance context type
  balance: string | undefined;
  balanceFish: string | undefined;
  balanceDeadFish: string | undefined;
  balanceFightFish: string | undefined;
  balanceBreedFish: string | undefined;
  balanceFood: string | undefined;
  balanceFoodWei: BN | undefined;
  balanceFishEgg: BN | undefined;
  balanceFishScale: BN | undefined;
  balanceBloater: BN | undefined;
  account: string | null | undefined;  // Match useWeb3React type

  totalSupply: number;
  fishCurrentIndex: number;
  fightingWatersWeakSupply: number;
  fightingWatersNonLethalSupply: number;
  fightingWatersSupply: number;
  breedingWatersSupply: number;
  totalSupplyDead: number;
  totalDeadBurned: number;
  currentCycle: number;
  currentPhase: Phase | undefined;
  maxSupply: number;
  totalCaught: number;
  totalFights: number;
  totalBreeds: number;
  refetchBalance: () => void;
  resetBalance: () => void;
  refetchStats: () => void;
  toggleGlobalMute: () => void;
  setLogOut: (value: boolean) => void;

  // New properties for UI
  isInCooldown: boolean;
  cooldownTimeRemaining: number;
  currentPower: number;
  availableModifiers: Array<{
    type: number;
    usesLeft: number;
    cost: number;
  }>;
  
  // Methods
  startRegularFight: (powerLevel: number) => Promise<void>;
  startNonLethalFight: (powerLevel: number) => Promise<void>;
  startWeakFight: (powerLevel: number) => Promise<void>;
  applyModifier: (modifierType: number) => Promise<void>;

  // Fight state
  lastFightResult?: {
    won: boolean;
    fishFoodEarned: string;
    powerUsed: number;
  };

  selectedFish?: Fish;
  opponentStats?: OpponentStats;
  selectFish: (fishId: number) => Promise<void>;
}

type FishFightProviderProps = { children: React.ReactNode }

// Initiating context as undefined
const FishFightContext = createContext<FishFightProviderContext | undefined>(undefined);

// Add type for fight result
interface FightResult {
  events: {
    FightResult: {
      returnValues: {
        won: boolean;
        // Add other event return values
      }
    }
  }
}

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

  const [isInCooldown, setIsInCooldown] = useState(false);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState(0);
  const [lastFightResult, setLastFightResult] = useState<FishFightProviderContext['lastFightResult']>();

  const startCooldownTimer = (duration: number) => {
    setIsInCooldown(true);
    setCooldownTimeRemaining(duration);

    const timer = setInterval(() => {
      setCooldownTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsInCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const [selectedFish, setSelectedFish] = useState<Fish>();
  const [opponentStats, setOpponentStats] = useState<OpponentStats>();

  const selectFish = async (fishId: number) => {
    try {
      if (!FishFightInstance.fishFactory || !FishFightInstance.fightingWaters) {
        throw new Error('Required contracts not initialized');
      }

      // Get full fish data from contract
      const fish = await FishFightInstance.fishFactory.methods.getFish(fishId).call();
      setSelectedFish(fish);

      // Get the opponent pool stats based on fish's level/power
      const poolStats = await FishFightInstance.fightingWaters.methods
        .getPoolStats(fish.level)
        .call();

      setOpponentStats({
        minPower: Number(poolStats.minPower),
        maxPower: Number(poolStats.maxPower)
      });
    } catch (error) {
      console.error('Failed to get fish stats:', error);
    }
  };

  const startRegularFight = async (powerLevel: number) => {
    try {
      if (!selectedFish) {
        throw new Error('No fish selected');
      }

      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!FishFightInstance.fishFood || !FishFightInstance.fightingWaters) {
        throw new Error('Required contracts not initialized');
      }

      // First approve the power fee if needed
      const powerFee = powerLevel * Constants._fightPowerFee;
      await FishFightInstance.fishFood.methods.approve(
        FishFightInstance.fightingWaters.options.address,
        powerFee
      ).send({ from: account });

      // Then start the fight - use tokenId instead of id
      const result = await FishFightInstance.fightingWaters.methods
        .fight(selectedFish.tokenId, powerLevel)  // Changed from id to tokenId
        .send({ from: account });
      
      // Handle result...
      startCooldownTimer(Constants._lockTime);
      
      setLastFightResult({
        won: result.events.FightResult.returnValues.won,
        fishFoodEarned: result.won ? Constants._fishFoodPerWin : '0',
        powerUsed: powerLevel
      });

      refetchBalance();
    } catch (error) {
      console.error('Fight failed:', error);
      throw error;
    }
  };

  const startNonLethalFight = async (powerLevel: number) => {
    try {
      if (!FishFightInstance.fightingWatersNonLethal) {
        throw new Error('Non-lethal Fighting Waters contract not initialized');
      }

      const result = await FishFightInstance.fightingWatersNonLethal.methods.fight(powerLevel).call();
      
      startCooldownTimer(Constants._cooldownTimeNonLethal);
      
      setLastFightResult({
        won: result.won,
        fishFoodEarned: result.won ? Constants._fishFoodPerWinNonLethal : '0',
        powerUsed: powerLevel
      });

      refetchBalance();
    } catch (error) {
      console.error('Non-lethal fight failed:', error);
      throw error;
    }
  };

  const startWeakFight = async (powerLevel: number) => {
    try {
      if (!FishFightInstance.fightingWatersWeak) {
        throw new Error('Weak Fighting Waters contract not initialized');
      }

      const result = await FishFightInstance.fightingWatersWeak.methods.fight(powerLevel).call();
      
      startCooldownTimer(Constants._lockTimeWeak);
      
      setLastFightResult({
        won: result.won,
        fishFoodEarned: result.won ? Constants._fishFoodPerWinWeak : '0',
        powerUsed: powerLevel
      });

      refetchBalance();
    } catch (error) {
      console.error('Weak fight failed:', error);
      throw error;
    }
  };

  const applyModifier = async (modifierType: number) => {
    // Implementation of applyModifier method
  };

  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    userConnected,
    globalMute,
    currentBlock,
    ...contextBalance,  // This spread now has the correct account type
    ...contextStats,
    refetchBalance,
    refetchStats,
    toggleGlobalMute,
    setLogOut,
    isInCooldown,
    cooldownTimeRemaining,
    currentPower: 0,
    availableModifiers: [],
    startRegularFight,
    startNonLethalFight,
    startWeakFight,
    applyModifier,
    lastFightResult,
    selectedFish,
    opponentStats,
    selectFish,
    account,  // This will now match the type from useWeb3React
    totalSupply: 0,
    fishCurrentIndex: 0,
    fightingWatersWeakSupply: 0,
    fightingWatersNonLethalSupply: 0,
    fightingWatersSupply: 0,
    breedingWatersSupply: 0,
    totalSupplyDead: 0,
    totalDeadBurned: 0,
    currentCycle: 0,
    currentPhase: undefined,
    maxSupply: 0,
    totalCaught: 0,
    totalFights: 0,
    totalBreeds: 0,
  }

  // Update the useEffect that was listening to Unity
  useEffect(() => {
    const handleFishSelection = async (fishId: number) => {
      if (!FishFightInstance.fishFactory) {
        console.error('Fish Factory contract not initialized');
        return;
      }

      try {
        const fish = await FishFightInstance.fishFactory.methods.getFish(fishId).call();
        setSelectedFish(fish);
        
        setOpponentStats({
          minPower: 5, // placeholder
          maxPower: 15 // placeholder
        });
      } catch (error) {
        console.error('Failed to get fish stats:', error);
      }
    };
  }, [FishFightInstance]);

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
        {
          reference: 'bloater',
          contractAddress: FishFight.readBloater.options.address,
          abi: ERC20,
          calls: [{ reference: 'bloaterBalance', methodName: 'balanceOf', methodParameters: [account] }]
        },
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
       let bloaterBalance = results.results.bloater.callsReturnContext[0].success ? results.results.bloater.callsReturnContext[0].returnValues[0].hex : null;
      

      fishBalance = Web3.utils.hexToNumberString(fishBalance)
      deadFishBalance = Web3.utils.hexToNumberString(deadFishBalance)
      fighterBalance = Web3.utils.hexToNumberString(fighterBalance)
      fighterBalanceWeak = Web3.utils.hexToNumberString(fighterBalanceWeak)
      fighterBalanceNonLethal = Web3.utils.hexToNumberString(fighterBalanceNonLethal)
      breederBalance = Web3.utils.hexToNumberString(breederBalance)

      foodBalance = new BN(Web3.utils.hexToNumberString(foodBalance))
      eggBalance = new BN(Web3.utils.hexToNumberString(eggBalance))
      scaleBalance = new BN(Web3.utils.hexToNumberString(scaleBalance))
       bloaterBalance = new BN(Web3.utils.hexToNumberString(bloaterBalance))


      // when account is connected get balances - uses default and read only providers
      const balance = await FishFight.provider.eth.getBalance(account)
      const parsedBalance = fromWei(balance, Units.one)
      setBalance(parsedBalance)

      const parsedFood = FishFight.provider.utils.fromWei(foodBalance);
      setBalanceFood(parsedFood);
      setBalanceFoodWei(foodBalance);

      setBalanceFish(fishBalance);
      setBalanceDeadFish(deadFishBalance);
      setBalanceFightFish((Number(fighterBalance) + Number(fighterBalanceWeak) + Number(fighterBalanceNonLethal)).toString());
      setBalanceBreedFish(breederBalance);
      setBalanceFishEgg(eggBalance);
      setBalanceFishScale(scaleBalance);
      setBalanceBloater(bloaterBalance);

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

      setTotalSupply(Number(totalFish));
      setFishCurrentIndex(Number(currentFishIndex));
      setFightingWatersSupply(Number(totalFighters));
      setFightingWatersWeakSupply(Number(totalFightersWeak));
      setFightingWatersNonLethalSupply(Number(totalFightersNonLethal));
      setBreedingWatersSupply(Number(totalBreeders));

      setTotalSupplyDead(Number(totalDead))
      setTotalDeadBurned(Number(burnedDead))

      setCurrentCycle(Number(currentCycle));
      setCurrentPhase(new Phase(currentPhase));
      setMaxSupply(Number(maxSupply));
      setTotalCaught(Number(totalCatches))
      setTotalFights(Number(totalFights))
      setTotalBreeds(Number(totalBreeds))
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