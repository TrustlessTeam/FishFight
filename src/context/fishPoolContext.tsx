import { Fish, TrainingStatus } from '../utils/fish';
import { createContext, useContext, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useFishFight } from './fishFightContext';
import web3 from 'web3'
import axios from 'axios';
import FishFight from '../FishFightSDK';
import { useUnity } from './unityContext';
import Contracts from '../contracts/contracts.json';
import BN from 'bn.js';


import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';

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
  refreshFish: (tokenId: number, isFighting: boolean, isBreeding: boolean) => Promise<Fish | null>
  createUserFish: (tokenId: number) => Promise<Fish | null>;
	// depositUserFightingFish: (fish: Fish) => Promise<void>
  // withdrawUserFightingFish: (fish: Fish) => Promise<void>
  // depositUserBreedingFish: (fish: Fish) => Promise<void>
  // withdrawUserBreedingFish: (fish: Fish) => Promise<void>
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
  const { FishFight, refetchStats, refetchBalance } = useFishFight();
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

    var fishCaught = FishFight.listenFishFactory.events.FishMinted()
    fishCaught.on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        console.log("Fish Caught - refetching data")
        refetchStats();
        refetchBalance();
      }
    })

    var depositedFighter = FishFight.listenFightingWaters.events.Deposit()
    depositedFighter.on("data", function(data: any){
      console.log(data)
      console.log(data.returnValues.user)
      console.log("FIGHITNG DEPOSIT LISTENER")
      if(data.returnValues.tokenId) {
        refetchStats();
        addFightingFishById(data.returnValues.tokenId)
      }
    })

    var withdrawFighter = FishFight.listenFightingWaters.events.Withdraw()
    withdrawFighter.on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        refetchStats();
        removeFightingFishById(data.returnValues.tokenId)
      }
    })

    var depositedBreeder = FishFight.listenBreedingWaters.events.Deposit()
    depositedBreeder.on("data", function(data: any){
      console.log(data)
      console.log("BREEDING DEPOSIT LISTENER")
      if(data.returnValues.tokenId) {
        refetchStats();
        addBreedingFishById(data.returnValues.tokenId)
      }
    })

    var withdrawBreeder = FishFight.listenBreedingWaters.events.Withdraw()
    withdrawBreeder.on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        refetchStats();
        removeBreedingFishById(data.returnValues.tokenId)
      }
    })

    var nextPhase = FishFight.listenSeasons.events.NewPhase()
    nextPhase.on("data", function(data: any){
      console.log(data)
      if(data.returnValues.newPhase) {
        refetchStats();
      }
    })

    var seasonCompleted = FishFight.listenSeasons.events.SeasonCompleted()
    seasonCompleted.on("data", function(data: any){
      console.log(data)
      if(data.returnValues.seasonIndex) {
        refetchStats();
        refetchSeasonStats()
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
  

  const fetchOceanFish = async (startIndex?: number, random?: boolean) => {
    console.log("Loading Ocean Fish")
    try {
      let randomFish: string[];
      if(random) {
        randomFish = await FishFight.fishCalls.methods.getFish(startIndex ? startIndex : 1, false).call()

      } else {
        randomFish = await FishFight.fishCalls.methods.getFish(1, true).call()
      }
      console.log(randomFish)
      let oceanIds = [...new Set(randomFish)].filter((val) => {
        return val !== '0';
      });
      // const totalFishSupply = web3.utils.toBN(fishSupply).toNumber();

      // const allTokenIds = [...Array(totalFishSupply+1).keys()].slice(1);
      oceanIds.forEach(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!oceanFish.some(fish => fish.tokenId == parsedTokenId)) {
          const fishData = await buildFish(FishFight, web3.utils.toNumber(parsedTokenId))
          if(fishData != null) {
            setOceanFish(prevData => [...prevData, fishData])
          }
        }
      });

    } catch (error) {
      console.log(error)
    }
  }

  const fetchUserFish = async (account: string, startIndex?: number) => {
    console.log("Loading User Fish")
    try { 
      let userFishIds: string[] = await FishFight.fishCalls.methods.getFishForAddress(startIndex ? startIndex : 0, account).call()
      console.log(userFishIds)
      userFishIds = [...new Set(userFishIds)].filter((val) => {
        return val !== '0';
      });
      userFishIds.forEach(async tokenId => {
        const parsedTokenId = web3.utils.toNumber(tokenId);
        if(!userFish.some(fish => fish.tokenId == parsedTokenId)) {
          addUserFightingFishById(parsedTokenId)
        }
      });
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
        FishFight.readFightingWaters.methods.tokenOfOwnerByIndex(account, i).call()
        .then((tokenId: any) => {
          if(!userFish.some(fish => fish.tokenId == tokenId)) {
            addUserFightingFishById(web3.utils.toNumber(tokenId))
          }
        });
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
        FishFight.readFishFactory.methods.tokenOfOwnerByIndex(fightingWatersAddress, i).call()
        .then((tokenId: any) => {
          // if(!userFish.some(fish => fish.tokenId == tokenId)) {
            addFightingFishById(web3.utils.toNumber(tokenId))
          // }
        });
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
        FishFight.readBreedingWaters.methods.tokenOfOwnerByIndex(account, i).call()
        .then((tokenId: any) => {
          if(!userFish.some(fish => fish.tokenId == tokenId)) {
            addUserBreedingFishById(web3.utils.toNumber(tokenId))
          }
        });
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
        FishFight.readFishFactory.methods.tokenOfOwnerByIndex(breedingWatersAddress, i).call()
        .then((tokenId: any) => {
          // if(!userFish.some(fish => fish.tokenId == tokenId)) {
            addBreedingFishById(web3.utils.toNumber(tokenId))
          // }
        });
      }
    } catch (error) {
      console.log("Error Breeding Fish: ")
      console.log(error)
    }
  }

  const createUserFish = async (tokenId: number) => {
    const fishData = await getFish(FishFight, web3.utils.toNumber(tokenId), false, false)
    if(fishData != null) {
      setUserFish(prevTokens => [...prevTokens, fishData])
      return fishData;
    }
    return null;
  };

  const addUserFish = (fish: Fish) => {
    setUserFish(prevTokens => [...prevTokens, fish])
  };

  // const depositUserFightingFish = async (fish: Fish) => {
  //   const fishData = await getFish(FishFight, fish.tokenId, true, false)
  //   setUserFightingFish(prevTokens => [...prevTokens, fishData != null ? fishData : fish])
  //   // Remove the fish from the UserFish array
  //   setUserFish(prevFish => (
  //     prevFish.filter(f => f.tokenId !== fish.tokenId)
  //   ));
  // };

  // When user withdraws a fish remove from UserFightingFish and FightingFish
  // Add back to UserFish
  // const withdrawUserFightingFish = async (fish: Fish) => {
  //   const fishData = await getFish(FishFight, fish.tokenId, false, false)
  //   setUserFightingFish(prevFish => (
  //     prevFish.filter(f => f.tokenId !== fish.tokenId)
  //   ));
  //   removeFightingFishById(fish.tokenId);
  //   addUserFish(fishData != null ? fishData : fish);
  // }

  // const depositUserBreedingFish = async (fish: Fish) => {
  //   const fishData = await getFish(FishFight, fish.tokenId, false, true)
  //   setUserBreedingFish(prevTokens => [...prevTokens, fishData != null ? fishData : fish])
  //   // Remove the fish from the UserFish array
  //   setUserFish(prevFish => (
  //     prevFish.filter(f => f.tokenId !== fish.tokenId)
  //   ));
  // };

  // When user withdraws a fish remove from UserBreedingFish and BreedingFish
  // Add back to UserFish
  // const withdrawUserBreedingFish = async (fish: Fish) => {
  //   const fishData = await getFish(FishFight, fish.tokenId, false, false)
  //   setUserBreedingFish(prevFish => (
  //     prevFish.filter(f => f.tokenId !== fish.tokenId)
  //   ));
  //   removeBreedingFishById(fish.tokenId);
  //   addUserFish(fishData != null ? fishData : fish);
  // }

  // Remove Burned Fish from all Fish arrays
  const fishBurned = (tokenId: number) => {
    setUserFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));

    setOceanFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const addUserFishById = async (tokenId: number) => {
    console.log("Add Fish By Id")
    // const fishData = await getFish(FishFight, tokenId, false, false)
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = true;
      setUserFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addUserFightingFishById = async (tokenId: number) => {
    console.log("Add FightingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    console.log(fishData)
    if(fishData != null) {
      setUserFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addUserBreedingFishById = async (tokenId: number) => {
    console.log("Add User BreedingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      setUserFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addFightingFishById = async (tokenId: number) => {
    console.log("Add FightingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      setFightingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addBreedingFishById = async (tokenId: number) => {
    console.log("Add BreedingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      setBreedingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const removeFightingFishById = (tokenId: number) => {
    setFightingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const removeBreedingFishById = (tokenId: number) => {
    setBreedingFish(prevFish => (
      prevFish.filter(f => f.tokenId !== tokenId)
    ));
  }

  const refreshFish = async (tokenId: number, isFighting: boolean, isBreeding: boolean) =>  {
    // const fishData = await getFish(FishFight, tokenId, isFighting, isBreeding)
    const fishData = await buildFish(FishFight, tokenId)

    if(fishData == null) return null;
    
    if(userFish.some(fish => fish.tokenId == tokenId)) {
      setUserFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(fightingFish.some(fish => fish.tokenId == tokenId)) {
      setFightingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(breedingFish.some(fish => fish.tokenId == tokenId)) {
      setBreedingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(oceanFish.some(fish => fish.tokenId == tokenId)) {
      setOceanFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }
    return fishData;
  }


  const refreshOceanFish = async (tokenId: number) => {
    const fishData = await getFish(FishFight, tokenId, false, false)
    if(fishData != null && oceanFish.some(fish => fish.tokenId == tokenId)) {
      setOceanFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }
  }

  const refreshUserFish = async (tokenId: number) => {
    const fishData = await getFish(FishFight, tokenId, false, false)
    if(fishData != null && userFish.some(fish => fish.tokenId == tokenId)) {
      setUserFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }
  }

  const refreshFightingFish = async (tokenId: number) => {
    const fishData = await getFish(FishFight, tokenId, true, false)
    if(fishData != null && fightingFish.some(fish => fish.tokenId == tokenId)) {
      setFightingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }
  }

  const refreshBreedingFish = async (tokenId: number) => {
    const fishData = await getFish(FishFight, tokenId, false, true)
    if(fishData != null && breedingFish.some(fish => fish.tokenId == tokenId)) {
      setBreedingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }
  }

	const refetchSeasonStats = () => {
		if(userFish.length > 0) {
      userFish.forEach(fish => {
        refreshUserFish(fish.tokenId)
      });
    }

    if(fightingFish.length > 0) {
      fightingFish.forEach(fish => {
        refreshFightingFish(fish.tokenId)
      });
    }

    if(breedingFish.length > 0) {
      breedingFish.forEach(fish => {
        refreshBreedingFish(fish.tokenId)
      });
    }
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
    createUserFish: createUserFish,
		// depositUserFightingFish: depositUserFightingFish,
    // withdrawUserFightingFish: withdrawUserFightingFish,
    // depositUserBreedingFish: depositUserBreedingFish,
    // withdrawUserBreedingFish: withdrawUserBreedingFish,
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
const getFish = async (fishFightInstance: FishFight, tokenId: number, isFighting: boolean, isBreeding: boolean, isParent?: boolean) : Promise<Fish | null> => {
  try {
    console.log(`Loading Fish ${tokenId} from blockchain`)
    const fishInfo = await fishFightInstance.readFishFactory.methods.getFishInfo(tokenId).call();
    const fishSeasonStats = await fishFightInstance.readSeasons.methods.getFishSeasonStats(tokenId).call();
    const trainingStats = await fishFightInstance.readTrainingWaters.methods.getStatus(tokenId).call();
    let tokenURI = null;
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
      fishInfo,
      fishSeasonStats,
      trainingStats,
      imgSrc,
      tokenURI,
    );

      // need to return null if contract throws error, or add check in contract
    if(fish.lifetimeWins > 0) {
      const fightHistory = await fishFightInstance.readFightingWaters.methods.getFightsForFish(tokenId).call();
      console.log(fightHistory)
      fish.fightingHistory = fightHistory;
    }
    if(isFighting) {
      const stakedFighting = await fishFightInstance.readFightingWaters.methods.getPoolInfo(tokenId).call();
      console.log(stakedFighting)
      fish.stakedFighting = stakedFighting;
    }
    if(isBreeding) {
      const stakedBreeding = await fishFightInstance.readBreedingWaters.methods.getPoolInfo(tokenId).call();
      console.log(stakedBreeding)
      fish.stakedBreeding = stakedBreeding;
    }
    if(!isParent && fish.parentA !== 0 && fish.parentB !== 0) {
      fish.parentAFish = await getFish(fishFightInstance, fish.parentA, false, false, true);
      fish.parentBFish = await getFish(fishFightInstance, fish.parentB, false, false, true);
    }
    
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


const buildFish = async (fishFightInstance: FishFight, tokenId: number) => {
  const contractCallContext: ContractCallContext[] = [
    {
      reference: 'fishFactory',
      contractAddress: Contracts.contracts.FishFactory.address,
      abi: Contracts.contracts.FishFactory.abi,
      calls: [{ reference: 'fishData', methodName: 'getFishInfo', methodParameters: [tokenId] },
      { reference: 'fishTokenUri', methodName: 'tokenURI', methodParameters: [tokenId] }  
      ]
    },
    {
      reference: 'seasons',
      contractAddress: fishFightInstance.readSeasons.options.address,
      abi: Contracts.contracts.Seasons.abi,
      calls: [{ reference: 'fishSeasonData', methodName: 'getFishSeasonStats', methodParameters: [tokenId] }]
    },
    {
      reference: 'trainingWaters',
      contractAddress: fishFightInstance.readTrainingWaters.options.address,
      abi: Contracts.contracts.TrainingWaters.abi,
      calls: [{ reference: 'fishTrainingData', methodName: 'getStatus', methodParameters: [tokenId] }]
    },
    {
      reference: 'fightingWaters',
      contractAddress: fishFightInstance.readFightingWaters.options.address,
      abi: Contracts.contracts.FightingWaters.abi,
      calls: [{ reference: 'fishFightData', methodName: 'getFightsForFish', methodParameters: [tokenId] },
      { reference: 'fishStakedFightData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    },
    {
      reference: 'breedingWaters',
      contractAddress: fishFightInstance.readBreedingWaters.options.address,
      abi: Contracts.contracts.BreedingWaters.abi,
      calls: [{ reference: 'fishStakedBreedData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    }
  ];

  console.log("multicall")

  const results: ContractCallResults = await fishFightInstance.multicall.call(contractCallContext);

  const fishFactoryGetFishInfo = results.results.fishFactory.callsReturnContext[0].success ? results.results.fishFactory.callsReturnContext[0].returnValues : null;
  const fishFactoryTokenUri = results.results.fishFactory.callsReturnContext[1].success ? results.results.fishFactory.callsReturnContext[1].returnValues[0] : null;

  const seasonsGetFishSeasonStats = results.results.seasons.callsReturnContext[0].success ? results.results.seasons.callsReturnContext[0].returnValues : null;
  const trainingWatersGetStatus = results.results.trainingWaters.callsReturnContext[0].success ? results.results.trainingWaters.callsReturnContext[0].returnValues : null;
  const fightingWatersGetPoolInfo = results.results.fightingWaters.callsReturnContext[1].success ? results.results.fightingWaters.callsReturnContext[1].returnValues : null;
  const fightingWatersGetFights = results.results.fightingWaters.callsReturnContext[0].success ? results.results.fightingWaters.callsReturnContext[0].returnValues : null;
  const breedingWatersGetPoolInfo = results.results.breedingWaters.callsReturnContext[0].success ? results.results.breedingWaters.callsReturnContext[0].returnValues : null;
  console.log(results);

  if(fishFactoryGetFishInfo == null) return null;
  let fishInfo = {
    tokenId: fishFactoryGetFishInfo[0].hex,
    birthTime: fishFactoryGetFishInfo[1].hex,
    parentA: fishFactoryGetFishInfo[2].hex,
    parentB: fishFactoryGetFishInfo[3].hex,
    deathTime: fishFactoryGetFishInfo[4].hex,
    revived: fishFactoryGetFishInfo[5],
    lifetimeWins: fishFactoryGetFishInfo[6],
    lifetimeAlphaBreeds: fishFactoryGetFishInfo[7],
    lifetimeBettaBreeds: fishFactoryGetFishInfo[8],
    strength: fishFactoryGetFishInfo[9],
    intelligence: fishFactoryGetFishInfo[10],
    agility: fishFactoryGetFishInfo[11],
    fishType: fishFactoryGetFishInfo[12],
    rarity: fishFactoryGetFishInfo[13],
    power: fishFactoryGetFishInfo[14],
    genes: fishFactoryGetFishInfo[15],
    breedKey: fishFactoryGetFishInfo[16],
    offspring: fishFactoryGetFishInfo[17],
  }
  console.log(fishInfo)
  if(seasonsGetFishSeasonStats == null) return null;
  let fishSeasonStats = {
    fightWins: seasonsGetFishSeasonStats[0],
    alphaBreeds: seasonsGetFishSeasonStats[1],
    bettaBreeds: seasonsGetFishSeasonStats[2],
    strModifier: seasonsGetFishSeasonStats[3],
    intModifier: seasonsGetFishSeasonStats[4],
    agiModifier: seasonsGetFishSeasonStats[5],
  }
  if(trainingWatersGetStatus == null) return null;
  let trainingObject = {
    lastFed: trainingWatersGetStatus[0].hex,
    lastClaimed: trainingWatersGetStatus[1].hex,
  }

  const fish = new Fish(fishInfo, fishSeasonStats, trainingObject, null, null)

  if(fightingWatersGetPoolInfo != null) {
    fish.stakedFighting = {
      earnedFishFood: web3.utils.fromWei(fightingWatersGetPoolInfo[0].hex),
      lockedExpire: web3.utils.toNumber(fightingWatersGetPoolInfo[2].hex),
    }
  }
  if(breedingWatersGetPoolInfo != null) {
    fish.stakedBreeding = {
      earnedFishFood: web3.utils.fromWei(breedingWatersGetPoolInfo[0].hex),
    }
  }
  if(fightingWatersGetFights != null) {
    fish.fightingHistory = fightingWatersGetFights[0];
  }

  if(fish.parentA > 0) {
    fish.parentAFish = await getParentFish(fishFightInstance, fish.parentA);
    fish.parentBFish = await getParentFish(fishFightInstance, fish.parentB);
  }
  console.log(fish)

  return fish;
}


const getParentFish = async (fishFightInstance: FishFight, tokenId: number) => {
  const fishInfo = await fishFightInstance.readFishFactory.methods.getFishInfo(tokenId).call();
  let fish = new Fish(
    fishInfo,
    null,
    null,
    null,
    null,
  );
  return fish;
}