// Simple and reliable wallet connector for Harmony network
import { InjectedConnector } from '@web3-react/injected-connector';

// Network configuration
const envProvider: string = process.env.REACT_APP_FRONTEND_NETWORK || 'mainnet';

export const HARMONY_MAINNET_CHAIN_ID = 1666600000;
export const HARMONY_TESTNET_CHAIN_ID = 1666700000;

export const HARMONY_MAINNET_CHAIN_ID_HEX = '0x63564C40';
export const HARMONY_TESTNET_CHAIN_ID_HEX = '0x6357D2E0';

const HARMONY_NETWORKS = {
  mainnet: {
    chainId: HARMONY_MAINNET_CHAIN_ID,
    chainIdHex: HARMONY_MAINNET_CHAIN_ID_HEX,
    name: 'Harmony Mainnet',
    rpcUrl: 'https://api.harmony.one',
    blockExplorer: 'https://explorer.harmony.one',
  },
  testnet: {
    chainId: HARMONY_TESTNET_CHAIN_ID,
    chainIdHex: HARMONY_TESTNET_CHAIN_ID_HEX,
    name: 'Harmony Testnet',
    rpcUrl: 'https://api.s0.b.hmny.io',
    blockExplorer: 'https://explorer.pops.one',
  },
};

export const getHarmonyNetwork = () => {
  return HARMONY_NETWORKS[envProvider as keyof typeof HARMONY_NETWORKS] || HARMONY_NETWORKS.mainnet;
};

// Check if MetaMask or other injected wallet is available
export const isInjectedWalletAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum;
};

// Get current chain ID from wallet
export const getCurrentChainId = async (): Promise<number | null> => {
  if (!window.ethereum) return null;
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  } catch (error) {
    console.error('Failed to get current chain ID:', error);
    return null;
  }
};

// Simple network switch - just prompt MetaMask to switch
export const switchToHarmonyNetwork = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('No injected wallet found');
  }

  const harmonyNetwork = getHarmonyNetwork();
  const currentChainId = await getCurrentChainId();

  // Already on the correct network
  if (currentChainId === harmonyNetwork.chainId) {
    return;
  }

  try {
    // Try to switch to Harmony network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: harmonyNetwork.chainIdHex }],
    });
  } catch (switchError: any) {
    // Error code 4902 means the chain hasn't been added to the wallet
    if (switchError.code === 4902) {
      // Add the network
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: harmonyNetwork.chainIdHex,
            chainName: harmonyNetwork.name,
            nativeCurrency: {
              name: 'Harmony ONE',
              symbol: 'ONE',
              decimals: 18,
            },
            rpcUrls: [harmonyNetwork.rpcUrl],
            blockExplorerUrls: [harmonyNetwork.blockExplorer],
          },
        ],
      });
    } else if (switchError.code === 4001) {
      throw new Error('User rejected switching to Harmony network');
    } else {
      throw switchError;
    }
  }
};

// Modern MetaMask supports multichain - don't restrict chain IDs
// The connector will work with whatever network MetaMask is on
export const injected = new InjectedConnector({
  supportedChainIds: undefined, // Allow any chain - MetaMask handles multichain now
});
