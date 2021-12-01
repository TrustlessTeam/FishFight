import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from './fishFightContext';
import web3 from 'web3'
import axios from 'axios';
import FishFight from '../FishFightSDK';
import { hexToNumber } from '@harmony-js/utils';
import { useUnity } from './unityContext';
import { Hex } from 'web3/utils';

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
	const [fightingWatersFish, setfightingWatersFish] = useState<Fish[]>([]);

  const { account } = useWeb3React();
  const { FishFight } = useFishFight();
	const unityContext = useUnity();

  // Load public fish ids
  useEffect(() => {
    const loadTokenData = async () => {
      console.log("ACCOUNT NOT CONNECTED")
      console.log("Building publicFish tokenIds")
      seedPublicPoolTokenIds();
    }
		loadTokenData();
  }, []);

  // Load connected user fish data from the blockchain
  useEffect(() => {
    const loadTokenData = async (account: string | null | undefined, arePublicFishLoaded: boolean) => {
      if(account && arePublicFishLoaded) {
        console.log("ACCOUNT CONNECTED")
        console.log("Building userFish tokenIds")
        seedUserPoolTokenIds(account);
      } 
    }
		if(unityContext.isFishPoolReady) loadTokenData(account, arePublicFishLoaded);
  }, [account, unityContext.isFishPoolReady, arePublicFishLoaded]);

  // Get Public Fish data from the blockchain
  useEffect(() => {
    if(publicPoolTokenIds.length > 0) {
      fetchPublicFish()
    }
  }, [unityContext.isFishPoolReady, publicPoolTokenIds]);

  // Get Public Fish data from the blockchain
  // useEffect(() => {
  //   if(userPoolTokenIds.length > 0) {
  //     fetchUserFish()
  //   }
  // }, [userPoolTokenIds]);
  
// TODO add function to clear pool when user logs out?


  
  const seedPublicPoolTokenIds = async () => {
    console.log("here")
    let tokenIds: number[] = [];

    try {
      const fishSupply = await FishFight.fishFactory.methods.totalSupply().call();
      console.log(fishSupply)
      const totalFishSupply = web3.utils.toBN(fishSupply).toNumber();
      console.log(totalFishSupply)
    
      if(totalFishSupply > MAX_FISH) {
        console.log("getting random fish")
        tokenIds = getRandomFish(totalFishSupply)
      } else {
        // getting default fish
        tokenIds = [...Array(totalFishSupply+1).keys()].slice(1);
      }
    } catch (error) {
      console.log(error)
    }
    console.log(tokenIds);
    setPublicPoolTokenIds(tokenIds);
    return tokenIds;
  }

  const seedUserPoolTokenIds = async (account: string) => {
    const userFish: number[] = [];
    try {
      const fishUserOwns = await FishFight.fishFactory.methods.balanceOf(account).call();
      console.log(`User owns: ${fishUserOwns}`)
      const numUserFish = web3.utils.toBN(fishUserOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        const tokenId = await FishFight.fishFactory.methods.tokenOfOwnerByIndex(account, i).call();
        const parsedTokenId = web3.utils.toBN(tokenId).toNumber();
        setUserPoolTokenIds(prevUserFishTokens => [...prevUserFishTokens, parsedTokenId])
        fetchUserFish(parsedTokenId)
      }
      setAreUserFishLoaded(true);
    } catch (error) {
      console.log("Error loading Fish tokens owned by account: ")
      console.log(error)
    }
    setUserPoolTokenIds(userFish);
    return userFish;
  }

  const addUserPoolTokenId = (tokenId: number) => {
    setUserPoolTokenIds(prevTokens => [...prevTokens, tokenId])
    fetchUserFish(tokenId);
  };

  // Get a selection from all minted fish, excluding the connected accounts fish
	const fetchPublicFish = async () => {
    // Get public fish
    console.log("FETCH PUBLIC FISH")
    try {
      await Promise.all(publicPoolTokenIds.map(async tokenId => {
        // fish doesn't exist in the fish pool yet so add it
        const fish = await getFish(FishFight, tokenId);
        if(fish != null) {
          setPublicFish(prevPublicFish => [...prevPublicFish, fish])
          unityContext.addFishOcean(fish);
        }
			}));
      setArePublicFishLoaded(true);
    } catch (error) {
      console.log("Failed to load total supply and public fish: ")
      console.log(error)
    }
      
  }

  // Get Fish owned by the connected account
	const fetchUserFish = async (tokenId: number) => {
    console.log("FETCH USER FISH")
    try {
      // if user fish in public fish remove from public and add to user fish
      var existingFish = publicFish.filter(fish => fish.tokenId === tokenId)
      if(existingFish.length > 0) {
        setPublicFish(prevPublicFish => (
          prevPublicFish.filter((fish, i) => fish.tokenId !== tokenId)
        ));
        setUserFish(prevFish => ([...prevFish, existingFish[0]]))
        unityContext.addFishOcean(existingFish[0]);
        return;
      }
      
      // get user fish data
      const fish = await getFish(FishFight, tokenId)
      if(fish != null) {
        setUserFish(prevFish => ([...prevFish, fish]))
        unityContext.addFishOcean(fish);
      }
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
		// eslint-disable-next-line no-throw-literal
		throw 'useFishFight must be used within a FishFightProvider';
	}
	return context;
};


// Utility Functions


// Gets fish data from smart contract and builds Fish object
const getFish = async (fishFightInstance: FishFight, tokenId: number) : Promise<Fish | null> => {
  try {
    console.log(`Loading Fish ${tokenId} from blockchain`)
    const fishInfo = await fishFightInstance.fishFactory.methods.getFishInfo(tokenId).call();
    console.log(fishInfo)
    // load image url from metadata
    let tokenURI = "";
    try {
      tokenURI = await fishFightInstance.fishFactory.methods.tokenURI(tokenId).call();
    } catch (error) {
      console.log("Get TokenURI call failed:")
      console.log(error)
    }
    let imgSrc = null;
    if(tokenURI) {
      imgSrc = `${serverURL}/tokens/${tokenId}.png`
    }
    let fish = new Fish(
      fishInfo.tokenId,
      fishInfo.birthTime,
      fishInfo.genes,
      fishInfo.fishType,
      fishInfo.rarity,
      fishInfo.strength,
      fishInfo.intelligence,
      fishInfo.agility,
      fishInfo.cooldownMultiplier,
      fishInfo.lifetimeWins,
      fishInfo.lifetimeAlphaBreeds,
      fishInfo.lifetimeBettaBreeds,
      fishInfo.parentA,
      fishInfo.parentB,
      fishInfo.breedKey,
      fishInfo.deathTime,
      imgSrc,
      tokenURI
    );
    console.log(fish)
    return fish;

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

function getRandomInt(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const getRandomFish = (maxSupply: number) => {
  const randomTokenIds: number[] = [];
  while(randomTokenIds.length < MAX_FISH) {
    let randomToken = Math.round(getRandomInt(0, maxSupply));
    console.log(randomToken)
    if(!randomTokenIds.includes(randomToken)) randomTokenIds.push(randomToken);
  }
  return randomTokenIds;
}
