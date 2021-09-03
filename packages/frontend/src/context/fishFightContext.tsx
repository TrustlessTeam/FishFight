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


// Typescript
interface FishFightProviderContext {
    FishFight: FishFight
    balance: string | undefined
    // publicFish: Fish[] | null // once we have a default provider we can query the blockchain not logged in
    refetchBalance: () => void
	  resetBalance: () => void
    userFish: Fish[] | undefined
    refetchUserFish: () => void
    resetUserFish: () => void
    publicFish: Fish[] | undefined
    refetchPublicFish: () => void
		resetPublicFish: () => void
}

type FishFightProviderProps = { children: React.ReactNode }

// Initiating context as undefined
const FishFightContext = createContext<FishFightProviderContext | undefined>(undefined);

// Defining context provider
export const FishFightProvider = ({ children }: FishFightProviderProps ) => {
  // FishFight instance initiates with default url provider upon visiting page
  const [FishFightInstance, setFishFightInstance] = useState<FishFight>(new FishFight(getHarmonyProvider().provider, getHarmonyProvider().type))
  // State of web3React
  const { account, connector, library} = useWeb3React();

  const contextBalance = useBalance();
  const contextUserFish = useUserFish();
  const contextPublicFish = usePublicFish();

  useEffect(() => {
    // When not logged in
    console.log("no logged in")
    console.log("calling public fish")
    contextPublicFish.fetchPublicFish(null, FishFightInstance)
    
  }, [])
  
  useEffect(() => {
    // When user logs in, get wallet provider (harmonyExtension or web3provider)
    if (account && connector && library) {
      getWalletProvider(connector, library).then((wallet) => 
      {
        setFishFightInstance(new FishFight(wallet.provider, wallet.type))
        contextBalance.fetchBalance(account, wallet.type, wallet.provider, library)
        contextUserFish.fetchUserFish(account, FishFightInstance)
        contextPublicFish.fetchPublicFish(account, FishFightInstance)
      })
    }
  }, [connector, library])

  const refetchBalance = () => {
    account ? getWalletProvider(connector, library).then((wallet) => {
      contextBalance.fetchBalance(account, wallet.type, wallet.provider, library)
    }) : null
  }

  const refetchUserFish = () => {
    account ? getWalletProvider(connector, library).then(() => {
      contextUserFish.fetchUserFish(account, FishFightInstance)
    }) : null
  }

  const refetchPublicFish = () => {
    account ? getWalletProvider(connector, library).then(() => {
      contextPublicFish.fetchPublicFish(account, FishFightInstance)
    }) : getWalletProvider(connector, library).then(() => {
      contextPublicFish.fetchPublicFish(null, FishFightInstance)
    })
  }

  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    refetchBalance,
    ...contextBalance,
    refetchUserFish,
    ...contextUserFish,
    refetchPublicFish,
    ...contextPublicFish
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
const useUserFish = () => {
	const [userFish, setUserFish] = useState<Fish[]>();

	const fetchUserFish = useCallback(
		async (account: string, fishFightInstance: FishFight) => {
      const fishUserOwns: BN = await fishFightInstance.factory.methods.balanceOf(account).call();
      const numFish = new BN(fishUserOwns).toNumber();
      const tempFish: Fish[] = [];

      // For every fish the user owns get token, then fish info, generate fish and push instance to tempFish 
      // once its done, setMyFish to tempfish
      for(let i = 0; i < numFish; i++) {
        const tokenId: BN = await fishFightInstance.factory.methods.tokenOfOwnerByIndex(account, i).call();
        const parsedTokenId = new BN(tokenId).toNumber();
        console.log(parsedTokenId)
        const fishInfo = await fishFightInstance.factory.methods.getFishInfo(parsedTokenId).call();
        console.log(fishInfo)
        const fish = new Fish(
          parsedTokenId,
          new BN(fishInfo.fishTypeIndex).toNumber(),
          fishInfo.name,
          new BN(fishInfo.birth).toNumber(),
          new BN(fishInfo.strength).toNumber(),
          new BN(fishInfo.intelligence).toNumber(),
          new BN(fishInfo.agility).toNumber(),
          new BN(fishInfo.wins).toNumber(),
          fishInfo.traitsA,
          fishInfo.traitsB,
          fishInfo.traitsC
        );
        tempFish.push(fish);
      }
      setUserFish(tempFish);

		},
		[setUserFish],
	);

	const resetUserFish = () => {
		setUserFish(undefined);
	};

	return {
		userFish,
		fetchUserFish,
		resetUserFish,
	};
};

// Users Fish utilities that will be included in FishFightContext
const usePublicFish = () => {
	const [publicFish, setPublicFish] = useState<Fish[]>();

	const fetchPublicFish = useCallback(
		async (account: string | null, fishFightInstance: FishFight) => {
      const userFish: number[] = [];
      if(account != null) {
        const fishUserOwns: BN = await fishFightInstance.factory.methods.balanceOf(account).call();
        const numUserFish = new BN(fishUserOwns).toNumber();
        for(let i = 0; i < numUserFish; i++) {
          const tokenId: BN = await fishFightInstance.factory.methods.tokenOfOwnerByIndex(account, i).call();
          const parsedTokenId = new BN(tokenId).toNumber();
          userFish.push(parsedTokenId);
        }
      }

      const fishSupply: BN = await fishFightInstance.factory.methods.totalSupply().call();
      const totalFishSupply = new BN(fishSupply).toNumber();
      const tempFish: Fish[] = [];

      // For every fish the user owns get token, then fish info, generate fish and push instance to tempFish 
      // once its done, setMyFish to tempfish
      for(let i = 0; i < totalFishSupply; i++) {
        if(!userFish.includes(i)) { // don't include the current accounts fish
          const fishInfo = await fishFightInstance.factory.methods.getFishInfo(i).call();
          const fish = new Fish(
            i,
            new BN(fishInfo.fishTypeIndex).toNumber(),
            fishInfo.name,
            new BN(fishInfo.birth).toNumber(),
            new BN(fishInfo.strength).toNumber(),
            new BN(fishInfo.intelligence).toNumber(),
            new BN(fishInfo.agility).toNumber(),
            new BN(fishInfo.wins).toNumber(),
            fishInfo.traitsA,
            fishInfo.traitsB,
            fishInfo.traitsC
          );
          tempFish.push(fish);
        }
      }
      setPublicFish(tempFish);

		},
		[setPublicFish],
	);

	const resetPublicFish = () => {
		setPublicFish(undefined);
	};

	return {
		publicFish,
		fetchPublicFish,
		resetPublicFish,
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