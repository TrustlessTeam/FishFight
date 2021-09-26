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
    balance: string | undefined
    refetchBalance: () => void
	  resetBalance: () => void
    userFish: Fish[]
    publicFish: Fish[]
    fetchPublicFish: (publicTokenIds: number[]) => void
		fetchUserFish: (tokenIds: number[]) => void
		resetPublicFish: () => void
    seedPublicPoolTokenIds: (userTokenIds: number[]) => void
    seedUserPoolTokenIds: (account: string) => void
    addUserPoolTokenId: (tokenId: number) => void
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
  // const contextUserFish = useUserFish();
  const contextFishPool = useFishPool(FishFightInstance);

  useEffect(() => {
    // App start -- user not logged in
    console.log("not logged in")
    console.log("calling public fish")
    const startPublicFishPool = async () => {
      const publicTokenIds = await contextFishPool.seedPublicPoolTokenIds([]);
      contextFishPool.fetchPublicFish(publicTokenIds);
    }
    startPublicFishPool();
  }, [])
  
  useEffect(() => {
    // When user logs in, get wallet provider (harmonyExtension or web3provider)
    if (account && connector && library) {
      getWalletProvider(connector, library).then(async (wallet) =>
      {
        setFishFightInstance(new FishFight(wallet.provider, wallet.type))
        contextBalance.fetchBalance(account, wallet.type, wallet.provider, library)
        contextFishPool.resetPublicFish();
        const userTokens = await contextFishPool.seedUserPoolTokenIds(account)
        contextFishPool.fetchUserFish(userTokens);
        const publicTokens = await contextFishPool.seedPublicPoolTokenIds(userTokens);
        contextFishPool.fetchPublicFish(publicTokens);
      })
    }
  }, [connector, library])

  const refetchBalance = () => {
    if(!connector || !library) return;
    account ? getWalletProvider(connector, library).then((wallet) => {
      contextBalance.fetchBalance(account, wallet.type, wallet.provider, library)
    }) : null
  }

  // const addUserFish = async (tokenId: number) => {
  //   if(!connector || !library) return;
  //   account ? getWalletProvider(connector, library).then(async () => {
  //     await contextFishPool.addUserPoolTokenId(tokenId);
  //     await contextFishPool.fetchUserFish()
  //   }) : null
  // }

  // const refetchPublicFish = () => {
  //   console.log("in refetch public fish")
  //   console.log(connector)
  //   console.log(library)
  //   if(!connector || !library) {
  //     console.log("no connector or library")
  //     contextPublicFish.fetchPublicFish(null, FishFightInstance, []);
  //     return;
  //   };
  //   account ? getWalletProvider(connector, library).then(() => {
  //     contextPublicFish.fetchPublicFish(account, FishFightInstance, contextUserFish.userFish)
  //   }) : getWalletProvider(connector, library).then(() => {
  //     contextPublicFish.fetchPublicFish(null, FishFightInstance, [])
  //   })
  // }

  const value: FishFightProviderContext = {
    FishFight: FishFightInstance,
    refetchBalance,
    ...contextBalance,
    ...contextFishPool
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
// const useUserFish = () => {
// 	const [userFish, setUserFish] = useState<Fish[]>([]);
//   const [userFishTokenIds, setUserFishTokenIds] = useState<Array<number>>([]);

//   // Get Fish owned by the connected account
// 	const fetchUserFish = async (account: string, fishFightInstance: FishFight) => {
//     const tempFish: Fish[] = [];
//     console.log("FETCH USER FISH")
//     try {
//       const userFishTokenIds = await getAccountFishTokenIds(fishFightInstance, account);
//       userFishTokenIds.forEach(async tokenId => {
//         if(userFish?.some(x => x.tokenId == tokenId && x.imgSrc != null)) return;
//         console.log("Getting token id: ")
//         console.log(tokenId)
//         const fish = await getFish(fishFightInstance, tokenId)
//         if(fish != null) tempFish.push(fish)
//       });
//     } catch (error) {
//       console.log("Error fetching userFish: ");
//       console.log(error);
//     }
//     setUserFish(tempFish);
//   };

// 	const resetUserFish = () => {
// 		setUserFish([]);
// 	};

// 	return {
// 		userFish,
// 		fetchUserFish,
// 		resetUserFish,
// 	};
// };

// Public Fish functions
const useFishPool = (fishFightInstance: FishFight) => {
  const [publicPoolTokenIds, setPublicPoolTokenIds] = useState<number[]>([]);
  const [userPoolTokenIds, setUserPoolTokenIds] = useState<number[]>([]);
	const [publicFish, setPublicFish] = useState<Fish[]>([]);
	const [userFish, setUserFish] = useState<Fish[]>([]);

  // const startPublicFishPool = async (userTokenIds: number[]) => {
  //   const tokenIds = await seedPublicPoolTokenIds(userTokenIds);
  //   fetchPublicFish(tokenIds);
  // }

  // const startUserFishPool = async (account: string) => {
  //   const tokenIds = await seedUserPoolTokenIds(account);
  //   fetchUserFish(tokenIds);
  // }

  useEffect(() => {
    // App start -- user not logged in
    console.log("RELOADING USER FISH")
    fetchUserFish(userPoolTokenIds)
  }, [userPoolTokenIds])
  
  const seedPublicPoolTokenIds = async (userTokenIds: number[]) => {
    const fishSupply: BN = await fishFightInstance.factory.methods.totalSupply().call();
    const totalFishSupply = new BN(fishSupply).toNumber();
    if(totalFishSupply > MAX_FISH) {
      // getRandomTokenIds()
    }
    const tokenIds = []
    for(let i = 0; i < totalFishSupply; i++) {
      if(userTokenIds.includes(i)) continue;
      tokenIds.push(i)
    }
    console.log(tokenIds);
    setPublicPoolTokenIds(tokenIds);
    return tokenIds;
  }

  const seedUserPoolTokenIds = async (account: string) => {
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
    setUserPoolTokenIds(userFish);
    return userFish;
  }

  const addUserPoolTokenId = (tokenId: number) => {
    setUserPoolTokenIds(prevTokens => [...prevTokens, tokenId])
  };

  // Get a selection from all minted fish, excluding the connected accounts fish
	const fetchPublicFish = async (publicTokenIds: number[]) => {
    // Get public fish
    // TODO: limit fish loaded (some kind of random selection of fish)
    console.log("FETCH PUBLIC FISH")
    console.log(publicTokenIds)
    // const tempPublicFish = publicFish;
    try {
      for(let i = 0; i < publicTokenIds.length; i++) {       
        // don't re add a fish that we already have
        // if(publicFish.some(x => x.tokenId == i)) {
        //   console.log("fish already exists")
        //   continue;
        // }

        // fish doesn't exist in the fish pool yet so add it
        const fish = await getFish(fishFightInstance, i);
        if(fish != null) {
          // tempPublicFish.push(fish);
          setPublicFish(prevFish => [...prevFish, fish])
        }
      }
      // console.log(tempPublicFish)
      // setPublicFish(tempPublicFish);
    } catch (error) {
      console.log("Failed to load total supply and public fish: ")
      console.log(error)
    }
      
  }

  // Get Fish owned by the connected account
	const fetchUserFish = async (tokenIds: number[]) => {
    console.log("FETCH USER FISH")
    try {
      tokenIds.forEach(async tokenId => {
        if(userFish.some(x => x.tokenId == tokenId)) {
          console.log("User token already exists, skipping")
          return;
        }
        console.log("Getting token id: ")
        console.log(tokenId)
        const fish = await getFish(fishFightInstance, tokenId)
        if(fish != null) {
          setUserFish(prevFish => ([...prevFish, fish]))
        }
      });
    } catch (error) {
      console.log("Error fetching userFish: ");
      console.log(error);
    }
  };

	const resetPublicFish = () => {
    setPublicPoolTokenIds([]);
		setPublicFish([]);
	};

	return {
		publicFish,
    userFish,
		fetchUserFish,
    fetchPublicFish,
		resetPublicFish,
    seedPublicPoolTokenIds,
    seedUserPoolTokenIds,
    addUserPoolTokenId
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

// const getRandomTokenIds = (startIndex: number, endIndex: number, excludedIndexes: number[]) => {

// }

// function getRandomInt(min: number, max: number) {
//   return Math.random() * (max - min) + min;
// }

// function shuffle(o: number[]) {
//   for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
//   return o;
// };

// var random = shuffle(numbers);