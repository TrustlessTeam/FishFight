import FishFight from "../FishFightSDK";
import { createContext, useContext, useEffect, useState, useCallback} from "react"
import { useWeb3React } from "@web3-react/core";
import { getWalletProvider } from '../helpers/providerHelper'
import { toBech32 } from '@harmony-js/crypto';
import { isBech32Address, fromWei, hexToNumber, Units } from '@harmony-js/utils';
import { Harmony } from "@harmony-js/core";
import { Web3Provider } from "@ethersproject/providers";
import Web3 from 'web3';

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
  const [FishFightInstance, setFishFightInstance] = useState<FishFight>(new FishFight())
  const [userConnected, setUserConnected] = useState<boolean>(false);
  // State of web3React
  const { account, connector, library} = useWeb3React();

  const contextBalance = useBalance();

  
  useEffect(() => {
    // When user logs in, get wallet provider (harmonyExtension or web3provider)
    if (account && connector && library) {
      getWalletProvider(connector, library).then(async (wallet) =>
      {
        FishFightInstance.setProviderWallet(wallet.provider, wallet.type);
        // setFishFightInstance(new FishFight())
        setUserConnected(true);
        console.log(FishFightInstance)
      })
    }
    if(!account) {
      console.log("account not connected");
      setUserConnected(false);
    }
  }, [connector, library])

  const refetchBalance = () => {
    if(!connector || !library) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

// useFishFight
export const useFishFight = () => {
  const context = useContext(FishFightContext)

  if(!context) {
    throw 'useFishFight must be used within a FishFightProvider';
  }
  return context
}