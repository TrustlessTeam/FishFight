import { Fish } from '../utils/fish';
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
// const serverURL = `http://localhost:5000`;

interface FishPoolProviderContext {
	userFish: Fish[]
  oceanFish: Fish[]
	fightingFish: Fish[]
	breedingFish: Fish[]
	userFishIndex: number
	oceanFishIndex: number
	breedingFishIndex: number
	fightingFishIndex: number
  refreshFish: (tokenId: number, isFighting: boolean, isBreeding: boolean) => Promise<Fish | null>
  createUserFish: (tokenId: number) => Promise<Fish | null>;
  fetchOceanFish: (startIndex?: number, random?: boolean) => void
  fetchUserFish: (account: string, startIndex?: number) => void
  fetchFightingFish: () => void
  fetchBreedingFish: () => void
  refreshLoadedFish: () => void;
}

type UnityProviderProps = { children: React.ReactNode };

// Initiating context as undefined
const FishPoolContext = createContext<FishPoolProviderContext | undefined>(undefined);

// Defining context provider
export const FishPoolProvider = ({ children }: UnityProviderProps) => {

  const [userFishIndex, setUserFishIndex] = useState<number>(0);
  const [oceanFishIndex, setOceanFishIndex] = useState<number>(0);
  const [breedingFishIndex, setBreedingFishIndex] = useState<number>(0);
  const [fightingFishIndex, setFightingFishIndex] = useState<number>(0);
  const [oceanFish, setOceanFish] = useState<Fish[]>([]);
	const [userFish, setUserFish] = useState<Fish[]>([]);
	const [fightingFish, setFightingFish] = useState<Fish[]>([]);
  const [breedingFish, setBreedingFish] = useState<Fish[]>([]);


  const { account, deactivate } = useWeb3React();
  const { FishFight, refetchStats, refetchBalance } = useFishFight();
	const unityContext = useUnity();

  useEffect(() => {
    // Set websocket block listener
    FishFight.listenFishFactory.events.FishBurned()
    .on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        fishBurned(web3.utils.toNumber(data.returnValues.tokenId));
      }
    })

    FishFight.listenFishFactory.events.FishMinted()
    .on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        console.log("Fish Caught - refetching data")
        refetchStats();
      }
    })

    FishFight.listenFightingWaters.events.Deposit()
    .on("data", function(data: any){
      console.log(data)
      console.log(data.returnValues.user)
      console.log("FIGHITNG DEPOSIT LISTENER")
      if(data.returnValues.tokenId) {
        refetchStats();
        addFightingFishById(data.returnValues.tokenId)
      }
    })

    FishFight.listenFightingWaters.events.Withdraw()
    .on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        refetchStats();
        removeFightingFishById(data.returnValues.tokenId)
      }
    })

    FishFight.listenBreedingWaters.events.Deposit()
    .on("data", function(data: any){
      console.log(data)
      console.log("BREEDING DEPOSIT LISTENER")
      if(data.returnValues.tokenId) {
        refetchStats();
        addBreedingFishById(data.returnValues.tokenId)
      }
    })

    FishFight.listenBreedingWaters.events.Withdraw()
    .on("data", function(data: any){
      console.log(data)
      if(data.returnValues.tokenId) {
        refetchStats();
        removeBreedingFishById(data.returnValues.tokenId)
      }
    })

    FishFight.listenCycles.events.NewPhase()
    .on("data", function(data: any){
      console.log(data)
      if(data.returnValues.newPhase) {
        refetchStats();
      }
    })

    // FishFight.listenCycles.events.CycleCompleted()
    // .on("data", function(data: any){
    //   console.log(data)
    //   if(data.returnValues.seasonIndex) {
    //     refetchStats();
    //     refreshLoadedFish()
    //   }
    // })
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
    setUserFish([]);
    const loadTokenData = async (account: string | null | undefined) => {
      if(account) {
        // Clear user fish in case of account switch
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
        addUserFishById(parsedTokenId)
        setUserFishIndex(parsedTokenId);
      });
      
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
          addUserFishById(web3.utils.toNumber(tokenId))
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
          addFightingFishById(web3.utils.toNumber(tokenId))
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
          addUserFishById(web3.utils.toNumber(tokenId))
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
    const fishData = await buildFish(FishFight, web3.utils.toNumber(tokenId))
    if(fishData != null) {
      setUserFish(prevTokens => [...prevTokens, fishData])
      return fishData;
    }
    return null;
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
      if(fightingFish.some(fish => fish.tokenId === tokenId)) {
        setFightingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
      } else if(breedingFish.some(fish => fish.tokenId === tokenId)) {
        setBreedingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
      }
    }
  };

  const addFightingFishById = async (tokenId: number) => {
    console.log("Add FightingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
      setFightingFish(prevTokens => [...prevTokens, fishData])
    }
  };

  const addBreedingFishById = async (tokenId: number) => {
    console.log("Add BreedingFish By Id")
    const fishData = await buildFish(FishFight, tokenId)
    if(fishData != null) {
      fishData.isUser = userFish.some(fish => fish.tokenId === fishData.tokenId);
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

  const refreshFish = async (tokenId: number, isFighting?: boolean, isBreeding?: boolean) =>  {
    // const fishData = await getFish(FishFight, tokenId, isFighting, isBreeding)
    const fishData = await buildFish(FishFight, tokenId);

    if(fishData == null) return null;

    if(userFish.some(fish => fish.tokenId === tokenId)) {
      fishData.isUser = true;
      setUserFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(fightingFish.some(fish => fish.tokenId === tokenId)) {
      setFightingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(breedingFish.some(fish => fish.tokenId === tokenId)) {
      setBreedingFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }

    if(oceanFish.some(fish => fish.tokenId === tokenId)) {
      setOceanFish(prevFish => [...prevFish.filter(f => f.tokenId !== tokenId), fishData]);
    }
    
    return fishData;
  }


	const refreshLoadedFish = () => {
    let allFish = userFish.concat(fightingFish).concat(breedingFish).concat(oceanFish);
    allFish = [...new Set(allFish)];
		allFish.forEach((fish) => {
      refreshFish(fish.tokenId, fish.isUser)
    });
	};

	const value: FishPoolProviderContext = {
		userFish: userFish,
    oceanFish: oceanFish,
    fightingFish: fightingFish,
    breedingFish: breedingFish,
    userFishIndex: userFishIndex,
    oceanFishIndex: oceanFishIndex,
    breedingFishIndex: breedingFishIndex,
    fightingFishIndex: fightingFishIndex,
    refreshFish: refreshFish,
    createUserFish: createUserFish,
    fetchOceanFish: fetchOceanFish,
    fetchUserFish: fetchUserFish,
    fetchFightingFish: fetchFightingFish,
    fetchBreedingFish: fetchBreedingFish,
    refreshLoadedFish: refreshLoadedFish,
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


const buildFish = async (fishFightInstance: FishFight, tokenId: number, isParent?: boolean) => {
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
      reference: 'fishStats',
      contractAddress: fishFightInstance.readFishStats.options.address,
      abi: Contracts.contracts.FishStats.abi,
      calls: [{ reference: 'fishStats', methodName: 'getFishModifiers', methodParameters: [tokenId] },
      { reference: 'fishFights', methodName: 'getFishFights', methodParameters: [tokenId] }]
    },
    {
      reference: 'fightingWaters',
      contractAddress: fishFightInstance.readFightingWaters.options.address,
      abi: Contracts.contracts.FightingWaters.abi,
      calls: [{ reference: 'fishStakedFightData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    },
    {
      reference: 'breedingWaters',
      contractAddress: fishFightInstance.readBreedingWaters.options.address,
      abi: Contracts.contracts.BreedingWaters.abi,
      calls: [{ reference: 'fishStakedBreedData', methodName: 'getPoolInfo', methodParameters: [tokenId] }]
    }
  ];

  

  const results: ContractCallResults = await fishFightInstance.multicall.call(contractCallContext);
  console.log(results)
  const fishFactoryGetFishInfo = results.results.fishFactory.callsReturnContext[0].success ? results.results.fishFactory.callsReturnContext[0].returnValues : null;
  const fishFactoryTokenUri = results.results.fishFactory.callsReturnContext[1].success ? results.results.fishFactory.callsReturnContext[1].returnValues[0] : null;
  let imgSrc = null;
  if(fishFactoryTokenUri) {
    imgSrc = `${serverURL}/tokens/${tokenId}.png`
  }
  const fishStatsGetFishModifiers = results.results.fishStats.callsReturnContext[0].success ? results.results.fishStats.callsReturnContext[0].returnValues : null;
  const fishStatsGetFights = results.results.fishStats.callsReturnContext[1].success ? results.results.fishStats.callsReturnContext[1].returnValues : null;
  const fightingWatersGetPoolInfo = results.results.fightingWaters.callsReturnContext[0].success ? results.results.fightingWaters.callsReturnContext[0].returnValues : null;
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
    generation: fishFactoryGetFishInfo[6],
    lifetimeWins: fishFactoryGetFishInfo[7],
    strength: fishFactoryGetFishInfo[8],
    intelligence: fishFactoryGetFishInfo[9],
    agility: fishFactoryGetFishInfo[10],
    fishType: fishFactoryGetFishInfo[11],
    rarity: fishFactoryGetFishInfo[12],
    genes: fishFactoryGetFishInfo[13],
    breedKey: fishFactoryGetFishInfo[14],
    offspring: fishFactoryGetFishInfo[15],
  }
  console.log(fishInfo)
  if(fishStatsGetFishModifiers == null) return null;

  const fish = new Fish(fishInfo, fishStatsGetFishModifiers, imgSrc, fishFactoryTokenUri)

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
  // if(fishStatsGetFights != null) {
    
  //   const deathFightData = await Promise.all(fishStatsGetFights.map(async fight => {
  //     console.log(fight)
  //     const fightId = web3.utils.toNumber(fight[1].hex);
  //     console.log(fightId)
  //     const result = await fishFightInstance.readFightComputation.methods.getFightInfo(fightId).call();
  //     const fightHistory = {
  //       address: fight[0],
  //       fightId: fightId,
  //       result: result
  //     }
  //     return fightHistory
  //   }))
  //   fish.fightingHistory = deathFightData;
  // }

  if(fish.parentA > 0 && !isParent) {
    fish.parentAFish = await buildFish(fishFightInstance, fish.parentA, true);
    fish.parentBFish = await buildFish(fishFightInstance, fish.parentB, true);
  }
  console.log(fish)

  return fish;
}


// const getParentFish = async (fishFightInstance: FishFight, tokenId: number) => {
//   const fishInfo = await fishFightInstance.readFishFactory.methods.getFishInfo(tokenId).call();
//   let fish = new Fish(
//     fishInfo,
//     null,
//     null,
//     null,
//     null,
//   );
//   return fish;
// }