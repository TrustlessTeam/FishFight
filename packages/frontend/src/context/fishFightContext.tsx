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


// Typescript
interface FishFightProviderContext {
    FishFight: FishFight
    balance: string | undefined
    // publicFish: Fish[] | null // once we have a default provider we can query the blockchain not logged in
    refetchBalance: () => void
	  resetBalance: () => void
    userFish: Fish[] | null
    refetchUserFish: () => void
    resetUserFish: () => void
    publicFish: Fish[] | null
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

  // useEffect(() => {
  //   // When not logged in
  //   console.log("no logged in")
  //   console.log("calling public fish")
  //   contextPublicFish.fetchPublicFish(null, FishFightInstance, null)
    
  // }, [])
  
  useEffect(() => {
    // When user logs in, get wallet provider (harmonyExtension or web3provider)
    if (account && connector && library) {
      getWalletProvider(connector, library).then(async (wallet) =>
      {
        setFishFightInstance(new FishFight(wallet.provider, wallet.type))
        contextBalance.fetchBalance(account, wallet.type, wallet.provider, library)
        await contextUserFish.fetchUserFish(account, FishFightInstance)
        await contextPublicFish.fetchPublicFish(account, FishFightInstance, contextUserFish.userFish)
      })
    }
  }, [connector, library])

  const refetchBalance = () => {
    if(!connector || !library) return;
    account ? getWalletProvider(connector, library).then((wallet) => {
      contextBalance.fetchBalance(account, wallet.type, wallet.provider, library)
    }) : null
  }

  const refetchUserFish = async () => {
    if(!connector || !library) return;
    account ? getWalletProvider(connector, library).then(async () => {
      await contextUserFish.fetchUserFish(account, FishFightInstance)
    }) : null
  }

  const refetchPublicFish = () => {
    console.log("in refetch public fish")
    console.log(connector)
    console.log(library)
    if(!connector || !library) {
      console.log("no connector or library")
      contextPublicFish.fetchPublicFish(null, FishFightInstance, null);
      return;
    };
    account ? getWalletProvider(connector, library).then(() => {
      contextPublicFish.fetchPublicFish(account, FishFightInstance, contextUserFish.userFish)
    }) : getWalletProvider(connector, library).then(() => {
      contextPublicFish.fetchPublicFish(null, FishFightInstance, null)
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
const useSelectedFish = () => {
	const [selectedFish, setSelectedFish] = useState<Fish | null>();

	const fetchSelectedFish = useCallback(
		async (tokenId: number, fishFightInstance: FishFight) => {
      try {
        // Check if fish is already selected and metadata is loaded
        if(selectedFish?.tokenId == tokenId && selectedFish.imgSrc != null) return;
        const fish = await getFish(fishFightInstance, tokenId)
        console.log(fish)
        setSelectedFish(fish);
      } catch (error) {
        console.log("Error getting selected fish: ");
        console.log(error);
        resetSelectedFish()
      }
      
		},
		[setSelectedFish],
	);

	const resetSelectedFish = () => {
		setSelectedFish(undefined);
	};

	return {
		selectedFish,
		fetchSelectedFish,
		resetSelectedFish,
	};
};

// User Fish functions
const useUserFish = () => {
	const [userFish, setUserFish] = useState<Fish[] | null>(null);
  const [userFishTokenIds, setUserFishTokenIds] = useState<Array<number>>([]);

  // Get Fish owned by the connected account
	const fetchUserFish = async (account: string, fishFightInstance: FishFight) => {
    const tempFish: Fish[] = [];
    console.log("FETCH USER FISH")
    try {
      const userFishTokenIds = await getAccountFishTokenIds(fishFightInstance, account);
      userFishTokenIds.forEach(async tokenId => {
        if(userFish?.some(x => x.tokenId == tokenId && x.imgSrc != null)) return;
        console.log("Getting token id: ")
        console.log(tokenId)
        const fish = await getFish(fishFightInstance, tokenId)
        if(fish != null) tempFish.push(fish)
      });
    } catch (error) {
      console.log("Error fetching userFish: ");
      console.log(error);
    }
    setUserFish(tempFish);
  };

	const resetUserFish = () => {
		setUserFish(null);
	};

	return {
		userFish,
		fetchUserFish,
		resetUserFish,
	};
};

// Public Fish functions
const usePublicFish = () => {
	const [publicFish, setPublicFish] = useState<Fish[] | null>(null);

  // Get a selection from all minted fish, excluding the connected accounts fish
	const fetchPublicFish = async (account: string | null, fishFightInstance: FishFight, userFish: Array<Fish> | null) => {
    // Get public fish
    // TODO: limit fish loaded (some kind of random selection of fish)
    console.log("FETCH PUBLIC FISH")
    try {
      const fishSupply: BN = await fishFightInstance.factory.methods.totalSupply().call();
      const totalFishSupply = new BN(fishSupply).toNumber();
      const tempFish: Fish[] = [];
      // For every fish the user owns get token, then fish info, generate fish and push instance to tempFish 
      // once its done, setMyFish to tempfish
      console.log(userFish)
      console.log(publicFish)
      for(let i = 0; i < totalFishSupply; i++) {
        // only getFish that aren't in the userFish array
        if(userFish?.some(j => j.tokenId == i)) return;
        // don't re get fish that we already have
        if(publicFish?.some(x => x.tokenId == i && x.imgSrc != null)) return;
        
        const fish = await getFish(fishFightInstance, i);
        if(fish != null) tempFish.push(fish);
      }
      setPublicFish(tempFish);
    } catch (error) {
      console.log("Failed to load total supply and public fish: ")
      console.log(error)
    }
      
  }

	const resetPublicFish = () => {
		setPublicFish(null);
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


// Utility Functions
const getAccountFishTokenIds = async (fishFightInstance: FishFight, account: string) : Promise<Array<number>> => {
  const userFish: number[] = [];
  try {
    const fishUserOwns: BN = await fishFightInstance.factory.methods.balanceOf(account).call();
    const numUserFish = new BN(fishUserOwns).toNumber();
    for(let i = 0; i < numUserFish; i++) {
      const tokenId: BN = await fishFightInstance.factory.methods.tokenOfOwnerByIndex(account, i).call();
      const parsedTokenId = new BN(tokenId).toNumber();
      userFish.push(parsedTokenId);
    }
  } catch (error) {
    console.log("Error loading Fish tokens owned by account: ")
    console.log(error)
  }
  return userFish;
}

// Gets fish data from smart contract and builds Fish object
const getFish = async (fishFightInstance: FishFight, tokenId: number) : Promise<Fish | null> => {
  try {
    const fishInfo = await fishFightInstance.factory.methods.getFishInfo(tokenId).call();
    const imgSrc = await getFishMetaData(fishFightInstance, tokenId);
    console.log("Get fish from blockchain")
    return new Fish(
      tokenId,
      new BN(fishInfo.fishTypeIndex).toNumber(),
      fishInfo.name,
      new BN(fishInfo.birth).toNumber(),
      hexToNumber(fishInfo.strength),
      hexToNumber(fishInfo.intelligence),
      hexToNumber(fishInfo.agility),
      new BN(fishInfo.wins).toNumber(),
      new BN(fishInfo.challenger).toNumber(),
      new BN(fishInfo.challenged).toNumber(),
      fishInfo.traitsA,
      fishInfo.traitsB,
      fishInfo.traitsC,
      imgSrc
    );

  } catch (error) {
    console.log("Get FishInfo call failed:")
    console.log(error)
    return null;
  }
  
}

// Gets Fish tokenURI from smart contract and loads the associated metadata from IPFS
// TODO: currently just returns imgSrc, will add mp4 src
const getFishMetaData = async (fishFightInstance: FishFight, tokenId: number) : Promise<string> => {
  // load image url from metadata
  let tokenURI = "";
  try {
    tokenURI = await fishFightInstance.factory.methods.tokenURI(tokenId).call();
  } catch (error) {
    console.log("Get TokenURI call failed:")
    console.log(error)
  }
  
  let imgSrc = null;
  if(tokenURI != "") {
    try {
      const metadataResponse = await axios.get(tokenURI);
      console.log(metadataResponse)
      imgSrc = metadataResponse.data.image;
      console.log(imgSrc)
    } catch (error) {
      console.log("Error in Axios call: ");
      console.log(error)
    }
  }
  return imgSrc;
}