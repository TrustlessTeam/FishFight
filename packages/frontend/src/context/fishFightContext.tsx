// FishFightSDK
import FishFight from "../FishFightSDK";
import { Fish } from "../utils/fish";
// Big Number
import BN from 'bn.js';

// React
import { createContext, useContext, useEffect, useState, useCallback} from "react"

// Web3React
import { useWeb3React } from "@web3-react/core";

// Helpers
import { getHarmonyProvider, getWalletProvider } from '../helpers/providerHelper'

// HarmonySDK
import { toBech32 } from '@harmony-js/crypto';
import { isBech32Address, fromWei, hexToNumber, Units } from '@harmony-js/utils';
import { Harmony } from "@harmony-js/core";
import { Web3Provider } from "@ethersproject/providers";
import axios from 'axios';
import { useLocation } from "react-router-dom";

const MAX_FISH = 42;

// Typescript
interface FishFightProviderContext {
    FishFight: FishFight
    userConnected: boolean
    balance: string | undefined
    refetchBalance: () => void
	  resetBalance: () => void
}

type FishFightProviderProps = { children: React.ReactNode }

// Initiating context as undefined
const FishFightContext = createContext<FishFightProviderContext | undefined>(undefined);

// Defining context provider
export const FishFightProvider = ({ children }: FishFightProviderProps ) => {
  // FishFight instance initiates with default url provider upon visiting page
  const [FishFightInstance, setFishFightInstance] = useState<FishFight>(new FishFight(getHarmonyProvider().provider, getHarmonyProvider().type))
  const [userConnected, setUserConnected] = useState<boolean>(false);
  // State of web3React
  const { account, connector, library} = useWeb3React();

  const contextBalance = useBalance();

  
  useEffect(() => {
    // When user logs in, get wallet provider (harmonyExtension or web3provider)
    if (account && connector && library) {
      getWalletProvider(connector, library).then(async (wallet) =>
      {
        setFishFightInstance(new FishFight(wallet.provider, wallet.type))
        setUserConnected(true);

      })
    }
  }, [connector, library])

  // useEffect(() => {
  //   // When user has connected account set UserConnected
  //   setUserConnected(true);
  // }, [FishFightInstance])


  const refetchBalance = () => {
    if(!connector || !library) return;
    account ? getWalletProvider(connector, library).then((wallet) => {
      contextBalance.fetchBalance(account, wallet.type, wallet.provider, library)
    }) : null
  }

  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    userConnected: userConnected,
    refetchBalance,
    ...contextBalance
  }
  return (
      <FishFightContext.Provider value={value}>{children}</FishFightContext.Provider>
  )
}


// Account balance utilities that will be included in FishFightContext
const useBalance = () => {
	const [balance, setBalance] = useState<string>();

	const fetchBalance = useCallback(
		async (account: string, type: string, provider: Harmony | Web3Provider | any, library: any) => {
      // function should morph into accomodating user's provider.
      // If user is using harmony wallet, use HarmonyExtension, else use web3Provider
      if (type === "harmony" || type === "default") {
        const address = isBech32Address(account) ? account : toBech32(account);
        const balance = await provider.blockchain.getBalance({ address });
        const parsedBalance = fromWei(hexToNumber(balance.result), Units.one);
        setBalance(parsedBalance);
      }

      if (type === "web3") {
        const balance = await provider.eth.getBalance(account)
        const parsedBalance = fromWei(balance, Units.one)
        setBalance(parsedBalance)
      }
 
		},
		[setBalance],
	);

	const resetBalance = () => {
		setBalance(undefined);
	};

	return {
		balance,
		fetchBalance,
		resetBalance,
	};
};

// Users Fish utilities that will be included in FishFightContext
// const useSelectedFish = () => {
// 	const [selectedFish, setSelectedFish] = useState<Fish | null>();

// 	const fetchSelectedFish = useCallback(
// 		async (tokenId: number, fishFightInstance: FishFight) => {
//       try {
//         // Check if fish is already selected and metadata is loaded
//         if(selectedFish?.tokenId == tokenId && selectedFish.imgSrc != null) return;
//         const fish = await getFish(fishFightInstance, tokenId)
//         console.log(fish)
//         setSelectedFish(fish);
//       } catch (error) {
//         console.log("Error getting selected fish: ");
//         console.log(error);
//         resetSelectedFish()
//       }
      
// 		},
// 		[setSelectedFish],
// 	);

// 	const resetSelectedFish = () => {
// 		setSelectedFish(undefined);
// 	};

// 	return {
// 		selectedFish,
// 		fetchSelectedFish,
// 		resetSelectedFish,
// 	};
// };


// useFishFight
export const useFishFight = () => {
    const context = useContext(FishFightContext)

    if(!context) {
        throw 'useFishFight must be used within a FishFightProvider';
    }
    return context
}