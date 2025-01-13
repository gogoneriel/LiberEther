// Token addresses on Arbitrum One
const AKM_ADDRESS = '0x287c48a78395f6fa4ac7f71a5e92dc65256f570f';
const RETH_ADDRESS = '0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8';
const ARBITRUM_CHAIN_ID = '0xa4b1'; // Arbitrum One Chain ID

// Minimal ABI for getting token balances
const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
];

// Price fetching functions remain the same...
async function fetchRETHPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8&vs_currencies=usd');
        const data = await response.json();
        return data['0xec70dcb4a1efa46b8f2d97c310c9c4790ba5ffa8'].usd;
    } catch (error) {
        console.error('Error fetching RETH price:', error);
        return 0;
    }
}

async function fetchAKMPrice() {
    try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/pairs/arbitrum/0xd9ecf7fb6c8356f1c42ef44b15b61c88625401be');
        const data = await response.json();
        return data.pairs?.[0]?.priceUsd ? Number(data.pairs[0].priceUsd) : 0;
    } catch (error) {
        console.error('Error fetching AKM price:', error);
        return 0;
    }
}

class Web3Security {
    constructor() {
        this.connectedAddress = null;
        this.chainId = null;
        this.provider = null;
        this.balanceBoxes = null;
        this.initializeBalanceBoxes();
    }

    // Initialize balance box references
    initializeBalanceBoxes() {
        try {
            const container = document.querySelector('.flex.flex-wrap.items-center.gap-2.md\\:gap-4');
            if (container) {
                this.balanceBoxes = Array.from(container.querySelectorAll('.balance-box-nav .balance-value'));
            }
        } catch (error) {
            console.warn('Failed to initialize balance boxes:', error);
        }
    }

    // Safe DOM update helper with multiple fallback selectors
    safeUpdateElement(index, value) {
        try {
            // Try to use cached balance boxes first
            if (this.balanceBoxes && this.balanceBoxes[index]) {
                this.balanceBoxes[index].textContent = value;
                return true;
            }

            // If cached elements are not available, try to find them again
            this.initializeBalanceBoxes();
            if (this.balanceBoxes && this.balanceBoxes[index]) {
                this.balanceBoxes[index].textContent = value;
                return true;
            }

            // Last resort: try direct querySelector
            const directElement = document.querySelector(`.balance-box-nav:nth-child(${index + 1}) .balance-value`);
            if (directElement) {
                directElement.textContent = value;
                return true;
            }

            return false;
        } catch (error) {
            console.warn(`Failed to update balance box ${index}:`, error);
            return false;
        }
    }

    // Format units safely
    formatUnits(value, decimals) {
        try {
            if (ethers.utils && ethers.utils.formatUnits) {
                return ethers.utils.formatUnits(value, decimals);
            }
            const divisor = BigNumber.from(10).pow(decimals);
            return value.mul(1000).div(divisor).toNumber() / 1000;
        } catch (error) {
            console.error('Error formatting units:', error);
            return '0.00';
        }
    }

    // Update token balances with enhanced error handling
    async updateBalances() {
        if (!this.connectedAddress || !this.provider) {
            // Reset values if not connected
            this.safeUpdateElement(0, '0.00');
            this.safeUpdateElement(1, '0.00');
            this.safeUpdateElement(2, '$0.00');
            return;
        }
    
        try {
            const signer = this.provider.getSigner();
            const akmContract = new ethers.Contract(AKM_ADDRESS, ERC20_ABI, signer);
            const rethContract = new ethers.Contract(RETH_ADDRESS, ERC20_ABI, signer);
    
            // Get decimals and balances
            const [
                akmDecimals,
                rethDecimals,
                akmBalance,
                rethBalance
            ] = await Promise.all([
                akmContract.decimals(),
                rethContract.decimals(),
                akmContract.balanceOf(this.connectedAddress),
                rethContract.balanceOf(this.connectedAddress)
            ]);
    
            // Format balances
            const formattedAkm = this.formatUnits(akmBalance, akmDecimals);
            const formattedReth = this.formatUnits(rethBalance, rethDecimals);
    
            // Get token prices
            const [akmPrice, rethPrice] = await Promise.all([
                fetchAKMPrice(),
                fetchRETHPrice()
            ]);
    
            // Calculate USD values
            const akmUsdValue = formattedAkm * akmPrice;
            const rethUsdValue = formattedReth * rethPrice;
            const totalUsdValue = akmUsdValue + rethUsdValue;
    
            // Update UI with enhanced error handling
            const updates = [
                this.safeUpdateElement(0, Number(formattedAkm).toFixed(2)),
                this.safeUpdateElement(1, Number(formattedReth).toFixed(2)),
                this.safeUpdateElement(2, `$${totalUsdValue.toFixed(2)}`)
            ];

            // Check if any updates failed
            if (updates.includes(false)) {
                console.warn('Some balance updates failed. Retrying initialization...');
                this.initializeBalanceBoxes();
            }
    
        } catch (error) {
            console.error("Error updating balances:", error);
            throw new Error("Failed to update balances: " + error.message);
        }
    }

    // Check network with better error handling
    async checkNetwork() {
        if (!window.ethereum) {
            throw new Error("Please install MetaMask!");
        }
        
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== ARBITRUM_CHAIN_ID) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: ARBITRUM_CHAIN_ID }],
                    });
                } catch (error) {
                    if (error.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: ARBITRUM_CHAIN_ID,
                                chainName: 'Arbitrum One',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://arb1.arbitrum.io/rpc'],
                                blockExplorerUrls: ['https://arbiscan.io/']
                            }],
                        });
                    } else {
                        throw error;
                    }
                }
            }
        } catch (error) {
            console.error("Network check failed:", error);
            throw error;
        }
    }

    // Connect wallet with improved error handling and element initialization
    async connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error("Please install MetaMask first!");
            }

            // Initialize balance boxes before connecting
            this.initializeBalanceBoxes();
            
            await this.checkNetwork();

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                throw new Error("No authorized accounts found!");
            }

            this.connectedAddress = accounts[0];
            this.provider = new ethers.providers.Web3Provider(window.ethereum);

            // Setup event listeners
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', this.handleAccountChange);
                window.ethereum.removeListener('chainChanged', this.handleChainChange);
            }
            
            window.ethereum.on('accountsChanged', this.handleAccountChange.bind(this));
            window.ethereum.on('chainChanged', this.handleChainChange.bind(this));

            await this.updateBalances();

            return this.connectedAddress;
        } catch (error) {
            console.error("Connection failed:", error);
            throw error;
        }
    }

    // Handle account changes
    handleAccountChange = (accounts) => {
        if (accounts.length === 0) {
            this.connectedAddress = null;
            this.updateBalances();
        } else if (accounts[0] !== this.connectedAddress) {
            this.connectedAddress = accounts[0];
            this.updateBalances();
        }
    }

    // Handle chain changes
    handleChainChange = () => {
        this.updateBalances();
    }
}