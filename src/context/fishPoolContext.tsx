import { Fish } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from './fishFightContext';
import web3 from 'web3'
import axios from 'axios';
import FishFight from '../FishFightSDK';
import { hexToNumber } from '@harmony-js/utils';
import { useUnity } from './unityContext';

const MAX_FISH = 42;
const serverURL = `http://198.199.79.15:5000`;

interface FishPoolProviderContext {
	userFish: Fish[]
  oceanFish: Fish[]
	fightingFish: Fish[]
  userFightingFish: Fish[]
	breedingFish: Fish[]
	userBreedingFish: Fish[]
	areUserFishLoaded: boolean
	areOceanFishLoaded: boolean
	areFightingFishLoaded: boolean
	areUserFightingFishLoaded: boolean
  refreshFish: (tokenId: number) => void
	addUserFish: (fish: Fish) => void
	depositUserFightingFish: (fish: Fish) => void
  withdrawUserFightingFish: (fish: Fish) => void
  depositUserBreedingFish: (fish: Fish) => void
  withdrawUserBreedingFish: (fish: Fish) => void
}

type BlockchainItem = {
  tokenId: number,
  data: Fish | null
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const FishPoolContext = createContext<FishPoolProviderContext | undefined>(undefined);

// Defining context provider
export const FishPoolProvider = ({ children }: UnityProviderProps) => {

  const [areUserFishLoaded, setAreUserFishLoaded] = useState<boolean>(false);
  const [areOceanFishLoaded, setAreOceanFishLoaded] = useState<boolean>(false);
  const [areFightingFishLoaded, setAreFightingFishLoaded] = useState<boolean>(false);
  const [areUserFightingFishLoaded, setAreUserFightingFishLoaded] = useState<boolean>(false);
  const [oceanFish, setOceanFish] = useState<Fish[]>([]); // general fish data for ocean
	const [userFish, setUserFish] = useState<Fish[]>([]);
	const [fightingFish, setFightingFish] = useState<Fish[]>([]);
	const [userFightingFish, setUserFightingFish] = useState<Fish[]>([]);
  const [breedingFish, setBreedingFish] = useState<Fish[]>([]);
	const [userBreedingFish, setUserBreedingFish] = useState<Fish[]>([]);

  const { account } = useWeb3React();
  const { FishFight } = useFishFight();
	const unityContext = useUnity();

  useEffect(() => {
    // Set websocket block listener
    var burned = FishFight.listenFishFactory.events.FishBurned()
    burned.on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        fishBurned(web3.utils.toNumber(data.returnValues.tokenId));
      }
    })

    var depositedFighter = FishFight.listenFightingWaters.events.Deposit()
    depositedFighter.on("data", function(data: any){
      console.log(data)
      console.log(data.returnValues.user)
      if(data.returnValues.tokenId) {
        addFightingFishById(data.returnValues.tokenId)
      }
    })

    var withdrawFighter = FishFight.listenFightingWaters.events.Withdraw()
    withdrawFighter.on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        removeFightingFishById(data.returnValues.tokenId)
      }
    })
  }, [])

  useEffect(() => {
    const loadTokenData = async () => {
      console.log("ACCOUNT NOT CONNECTED")
      console.log("Getting public fish")
      fetchOceanFish();
      fetchFightingFish();
      fetchBreedingFish();
    }
		loadTokenData();
  }, []);

  // Load connected user fish data from the blockchain
  useEffect(() => {
    const loadTokenData = async (account: string | null | undefined) => {
      if(account) {
        console.log("ACCOUNT CONNECTED")
        console.log("Getting user fish")
        fetchUserFish(account);
        fetchUserFightingFish(account);
        fetchUserBreedingFish(account);
      } 
    }
		if(unityContext.isFishPoolReady) loadTokenData(account);
  }, [account]);
  
// TODO add function to clear pool when user logs out?

  const getAccount = () => {
    return account;
  }

  const fetchOceanFish = async () => {
    console.log("Loading Ocean Fish")

    try {
      const randomFish: string[] = await FishFight.readFishFactory.methods.getRandomFish().call();
      console.log(randomFish)
      let oceanIds = [...new Set(randomFish)];
      // const totalFishSupply = web3.utils.toBN(fishSupply).toNumber();

      // const allTokenIds = [...Array(totalFishSupply+1).keys()].slice(1);
      oceanIds.forEach(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!oceanFish.some(fish => fish.tokenId == parsedTokenId)) {
          const fishData = await getFish(FishFight, parsedTokenId)
          if(fishData != null) {
            setOceanFish(prevData => [...prevData, fishData])
            // setAllLoadedFish(prevData => [...prevData, fishData])
          }
        }
      });
    
    } catch (error) {
      console.log(error)
    }
  }

  const fetchUserFish = async (account: string) => {
    console.log("Loading Ocean Fish")
    try {
      const fishUserOwns = await FishFight.readFishFactory.methods.balanceOf(account).call();
      console.log(`User owns: ${fishUserOwns}`)
      const numUserFish = web3.utils.toBN(fishUserOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        const tokenId = await FishFight.readFishFactory.methods.tokenOfOwnerByIndex(account, i).call();
        if(!userFish.some(fish => fish.tokenId == tokenId)) {
          const fishData = await getFish(FishFight, web3.utils.toNumber(tokenId))
          if(fishData != null) {
            setUserFish(prevData => [...prevData, fishData])
            // setAllLoadedFish(prevData => [...prevData, fishData])
          }
        }
      }
      setAreUserFishLoaded(true);
    } catch (error) {
      console.log("Error loading Fish tokens owned by account: ")
      console.log(error)
    }
  }

  const fetchUserFightingFish = async (account: string) => {
    console.log("Loading User Fighting Fish")
    try {
      const stakedFishUserOwns = await FishFight.readFightingWaters.methods.balanceOf(account).call();
      console.log(`User staked owns: ${stakedFishUserOwns}`)
      const numUserFish = web3.utils.toBN(stakedFishUserOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        const tokenId = await FishFight.readFightingWaters.methods.tokenOfOwnerByIndex(account, i).call();
        if(!userFightingFish.some(fish => fish.tokenId == tokenId)) {
          const fishData = await getFish(FishFight, web3.utils.toNumber(tokenId))
          if(fishData != null) {
            setUserFightingFish(prevData => [...prevData, fishData])
          }
        }
      }
    } catch (error) {
      console.log("Error loading staked Fighting Fish tokens for account: ")
      console.log(error)
    }
  }

  const fetchFightingFish = async () => {
    console.log("Loading Fighting Fish")
    const fightingWatersAddress = FishFight.readFightingWaters.options.address
    try {
      const fishFightingWatersOwns = await FishFight.readFishFactory.methods.balanceOf(fightingWatersAddress).call();
      console.log(`Fish in Fighting Waters: ${fishFightingWatersOwns}`)
      const numUserFish = web3.utils.toBN(fishFightingWatersOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        const tokenId = await FishFight.readFishFactory.methods.tokenOfOwnerByIndex(fightingWatersAddress, i).call();
        if(!fightingFish.some(fish => fish.tokenId == tokenId)) {
          const fishData = await getFish(FishFight, web3.utils.toNumber(tokenId))
          if(fishData != null) {
            setFightingFish(prevData => [...prevData, fishData])
          }
        }
      }
    } catch (error) {
      console.log("Error Fighting Fish: ")
      console.log(error)
    }
  }

  const fetchUserBreedingFish = async (account: string) => {
    console.log("Loading User Breeding Fish")
    try {
      const stakedFishUserOwns = await FishFight.readBreedingWaters.methods.balanceOf(account).call();
      console.log(`User staked owns: ${stakedFishUserOwns}`)
      const numUserFish = web3.utils.toBN(stakedFishUserOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        const tokenId = await FishFight.readBreedingWaters.methods.tokenOfOwnerByIndex(account, i).call();
        if(!userBreedingFish.some(fish => fish.tokenId == tokenId)) {
          const fishData = await getFish(FishFight, web3.utils.toNumber(tokenId))
          if(fishData != null) {
            setUserBreedingFish(prevData => [...prevData, fishData])
          }
        }
      }
    } catch (error) {
      console.log("Error loading staked Breeding Fish tokens for account: ")
      console.log(error)
    }
  }

  const fetchBreedingFish = async () => {
    console.log("Loading Breeding Fish")
    const breedingWatersAddress = FishFight.readBreedingWaters.options.address
    try {
      const fishBreedingWatersOwns = await FishFight.readFishFactory.methods.balanceOf(breedingWatersAddress).call();
      console.log(`Fish in Breeding Waters: ${fishBreedingWatersOwns}`)
      const numUserFish = web3.utils.toBN(fishBreedingWatersOwns).toNumber();
      for(let i = 0; i < numUserFish; i++) {
        const tokenId = await FishFight.readFishFactory.methods.tokenOfOwnerByIndex(breedingWatersAddress, i).call();
        if(!breedingFish.some(fish => fish.tokenId == tokenId)) {
          const fishData = await getFish(FishFight, web3.utils.toNumber(tokenId))
          if(fishData != null) {
            setBreedingFish(prevData => [...prevData, fishData])
          }
        }
      }
    } catch (error) {
      console.log("Error Breeding Fish: ")
      console.log(error)
    }
  }

  const addUserFish = (fish: Fish) => {
    setUserFish(prevTokens => [...prevTokens, fish])
  };

  const depositUserFightingFish = (fish: Fish) => {
    setUserFightingFish(prevTokens => [...prevTokens, fish])
    // Remove the fish from the UserFish array
    setUserFish(prevFish => (
      prevFish.filter(f => f.tokenId !== fish.tokenId)
    ));
  };

  // When user withdraws a fish remove from UserFightingFish and FightingFish
  // Add back to UserFish
  const withdrawUserFightingFish = (fish: Fish) => {
    setUserFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== fish.tokenId)
    ));
    removeFightingFishById(fish.tokenId);
    addUserFish(fish);
  }

  const depositUserBreedingFish = (fish: Fish) => {
    setUserFightingFish(prevTokens => [...prevTokens, fish])
    // Remove the fish from the UserFish array
    setUserFish(prevFish => (
      prevFish.filter(f => f.tokenId !== fish.tokenId)
    ));
  };

  // When user withdraws a fish remove from UserBreedingFish and BreedingFish
  // Add back to UserFish
  const withdrawUserBreedingFish = (fish: Fish) => {
    setUserFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== fish.tokenId)
    ));
    removeFightingFishById(fish.tokenId);
    addUserFish(fish);
  }

  // Remove Burned Fish from all Fish arrays
  const fishBurned = (tokenId: number) => {
    setUserFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setUserFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setOceanFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const addFightingFishById = async (tokenId: number) => {
    console.log("Add FightingFish By Id")
    const fishData = await getFish(FishFight, tokenId)
    if(fishData != null) {
      setFightingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addBreedingFishById = async (tokenId: number) => {
    console.log("Add BreedingFish By Id")
    const fishData = await getFish(FishFight, tokenId)
    if(fishData != null) {
      setBreedingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addFightingFish = async (fish: Fish) => {
    setFightingFish(prevTokens => [...prevTokens, fish])
  };

  const removeFightingFishById = (tokenId: number) => {
    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const removeBreedingFishById = (tokenId: number) => {
    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const refreshFish = async (tokenId: number) => {
    const fishData = await getFish(FishFight, tokenId)
    if(fishData != null) {
      setUserFish(prevFish => {
        const tempFish = prevFish.filter(f => f.tokenId !== tokenId)
        tempFish.push(fishData)
        return tempFish;
      }
      );

      setUserFightingFish(prevFish => {
        const tempFish = prevFish.filter(f => f.tokenId !== tokenId)
        tempFish.push(fishData)
        return tempFish;
      }
      );

      setFightingFish(prevFish => {
        const tempFish = prevFish.filter(f => f.tokenId !== tokenId)
        tempFish.push(fishData)
        return tempFish;
      }
      );

      setUserBreedingFish(prevFish => {
        const tempFish = prevFish.filter(f => f.tokenId !== tokenId)
        tempFish.push(fishData)
        return tempFish;
      }
      );

      setBreedingFish(prevFish => {
        const tempFish = prevFish.filter(f => f.tokenId !== tokenId)
        tempFish.push(fishData)
        return tempFish;
      }
      );

      setOceanFish(prevFish => {
        const tempFish = prevFish.filter(f => f.tokenId !== tokenId)
        tempFish.push(fishData)
        return tempFish;
      }
      );
    }
  }

	const resetPublicFish = () => {

		// setPublicFish([]);
	};

	const value: FishPoolProviderContext = {
		userFish: userFish,
    oceanFish: oceanFish,
    fightingFish: fightingFish,
    userFightingFish: userFightingFish,
    breedingFish: breedingFish,
    userBreedingFish: userBreedingFish,
		areUserFishLoaded: areUserFishLoaded,
		areOceanFishLoaded: areOceanFishLoaded,
		areFightingFishLoaded: areFightingFishLoaded,
		areUserFightingFishLoaded: areUserFightingFishLoaded,
    refreshFish: refreshFish,
		addUserFish: addUserFish,
		depositUserFightingFish: depositUserFightingFish,
    withdrawUserFightingFish: withdrawUserFightingFish,
    depositUserBreedingFish: depositUserBreedingFish,
    withdrawUserBreedingFish: withdrawUserBreedingFish,
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
    const fishInfo = await fishFightInstance.readFishFactory.methods.getFishInfo(tokenId).call();
    // console.log(fishInfo)
    // load image url from metadata
    let tokenURI = "";
    try {
      tokenURI = await fishFightInstance.readFishFactory.methods.tokenURI(tokenId).call();
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
    // console.log(fish)
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
