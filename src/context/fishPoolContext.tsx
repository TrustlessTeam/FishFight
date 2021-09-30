import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from './fishFightContext';
import BN from 'bn.js';
import axios from 'axios';
import FishFight from '../FishFightSDK';
import { hexToNumber } from '@harmony-js/utils';
import { useUnity } from './unityContext';

const MAX_FISH = 42;
const serverURL = `http://198.199.79.15:5000`;

interface FishPoolProviderContext {
	userFish: Fish[]
	publicFish: Fish[]
	areUserFishLoaded: boolean
	arePublicFishLoaded: boolean
	addUserPoolTokenId: (tokenId: number) => void
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const FishPoolContext = createContext<FishPoolProviderContext | undefined>(undefined);

// Defining context provider
export const FishPoolProvider = ({ children }: UnityProviderProps) => {
	const [publicPoolTokenIds, setPublicPoolTokenIds] = useState<number[]>([]);
  const [userPoolTokenIds, setUserPoolTokenIds] = useState<number[]>([]);
  const [areUserFishLoaded, setAreUserFishLoaded] = useState<boolean>(false);
  const [arePublicFishLoaded, setArePublicFishLoaded] = useState<boolean>(false);
	const [publicFish, setPublicFish] = useState<Fish[]>([]);
	const [userFish, setUserFish] = useState<Fish[]>([]);

  const { account } = useWeb3React();

  const { FishFight, userConnected } = useFishFight();

	const unityContext = useUnity();

  // Load Token Data from Blockchain
  useEffect(() => {
    const loadTokenData = async (account: any) => {
      if(account) {
        console.log("ACCOUNT CONNECTED")
        console.log("Building userFish tokenIds")
        const userTokens = await seedUserPoolTokenIds(account)
        seedPublicPoolTokenIds(userTokens);
      } 
      else {
        console.log("ACCOUNT NOT CONNECTED")
        console.log("Building publicFish tokenIds")
        seedPublicPoolTokenIds([]);
      }
    }
		unityContext.clearFishPool('ShowOcean');
    setArePublicFishLoaded(false)
		if(unityContext.isFishPoolReady) loadTokenData(account);
  }, [userConnected, unityContext.isFishPoolReady]);

  // Get Public Fish data from the blockchain
  useEffect(() => {
    if(publicPoolTokenIds.length > 0) {
      fetchPublicFish()
    }
  }, [publicPoolTokenIds]);

  // Get Public Fish data from the blockchain
  useEffect(() => {
    if(userPoolTokenIds.length > 0) {
      fetchUserFish()
    }
  }, [userPoolTokenIds]);
  
// TODO add function to clear pool when user logs out?


  
  const seedPublicPoolTokenIds = async (userTokenIds: number[]) => {
    const fishSupply: BN = await FishFight.factory.methods.totalSupply().call();
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
      const fishUserOwns: BN = await FishFight.factory.methods.balanceOf(account).call();
      const numUserFish = new BN(fishUserOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        const tokenId: BN = await FishFight.factory.methods.tokenOfOwnerByIndex(account, i).call();
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
	const fetchPublicFish = async () => {
    // Get public fish
    // TODO: limit fish loaded (some kind of random selection of fish)
    console.log("FETCH PUBLIC FISH")
		
    const existingPublicFish = publicFish;
    try {
			setPublicFish([]);
      await Promise.all(publicPoolTokenIds.map(async tokenId => {
				// don't re add a fish that we already have
        if(existingPublicFish.length > 0) {
          const existingFish = existingPublicFish.filter(fish => fish.tokenId == tokenId)[0];
          if(existingFish) {
            // console.log("fish already exists")
            setPublicFish(prevPublicFish => [...prevPublicFish, existingFish])
            unityContext.addFishOcean(existingFish);
            return;
          }
        }

        // fish doesn't exist in the fish pool yet so add it
        const fish = await getFish(FishFight, tokenId);
        if(fish != null) {
					// console.log("getting fish")
          setPublicFish(prevPublicFish => [...prevPublicFish, fish])
					unityContext.addFishOcean(fish);
        }
			}));
      setArePublicFishLoaded(true);
      // setPublicFish(tempPublicFish);
    } catch (error) {
      console.log("Failed to load total supply and public fish: ")
      console.log(error)
    }
      
  }

  // Get Fish owned by the connected account
	const fetchUserFish = async () => {
    console.log("FETCH USER FISH")
    try {
      await Promise.all(userPoolTokenIds.map(async tokenId => {
        if(userFish.some(x => x.tokenId == tokenId)) {
          return;
        }

        const fish = await getFish(FishFight, tokenId)
        if(fish != null) {
          setUserFish(prevFish => ([...prevFish, fish]))
					unityContext.addFishOcean(fish);
        }
      }));
      if(account) setAreUserFishLoaded(true);
    } catch (error) {
      console.log("Error fetching userFish: ");
      console.log(error);
    }
  };

	const resetPublicFish = () => {
    setPublicPoolTokenIds([]);
		setPublicFish([]);
	};

	const value: FishPoolProviderContext = {
		userFish: userFish,
		publicFish: publicFish,
		areUserFishLoaded: areUserFishLoaded,
		arePublicFishLoaded: arePublicFishLoaded,
		addUserPoolTokenId: addUserPoolTokenId
	};
	
	return <FishPoolContext.Provider value={value}>{children}</FishPoolContext.Provider>;
};

// useFishFight
export const useFishPool = () => {
	const context = useContext(FishPoolContext);

	if (!context) {
		throw 'useFishFight must be used within a FishFightProvider';
	}
	return context;
};


// Utility Functions


// Gets fish data from smart contract and builds Fish object
const getFish = async (fishFightInstance: FishFight, tokenId: number) : Promise<Fish | null> => {
  try {
    console.log(`Loading Fish ${tokenId} from blockchain`)
    const fishInfo = await fishFightInstance.factory.methods.getFishInfo(tokenId).call();
    // load image url from metadata
    let tokenURI = "";
    try {
      tokenURI = await fishFightInstance.factory.methods.tokenURI(tokenId).call();
    } catch (error) {
      console.log("Get TokenURI call failed:")
      console.log(error)
    }
    let imgSrc = null;
    if(tokenURI) {
      imgSrc = `${serverURL}/tokens/${tokenId}.png`
    }
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
      imgSrc,
      tokenURI
    );

  } catch (error) {
    console.log("Get FishInfo call failed:")
    console.log(error)
    return null;
  }
  
}

// Gets Fish tokenURI from smart contract and loads the associated metadata from IPFS
// TODO: currently just returns imgSrc, will add mp4 src
const getFishMetaData = async (tokenURI: string) : Promise<string> => {
  let metadata = null;
  if(tokenURI != "") {
    try {
      const metadataResponse = await axios.get(tokenURI);
      metadata = metadataResponse.data.image;
    } catch (error) {
      console.log("Error in Axios call: ");
      console.log(error)
    }
  }
  return metadata;
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
