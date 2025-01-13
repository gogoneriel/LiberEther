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

class Web3Security {
    constructor() {
        this.connectedAddress = null;
        this.chainId = null;
        this.provider = null;
    }

    // Format units safely
    formatUnits(value, decimals) {
        try {
            // Try ethers v5 way first
            if (ethers.utils && ethers.utils.formatUnits) {
                return ethers.utils.formatUnits(value, decimals);
            }
            // Fallback to manual calculation if ethers utils is not available
            const divisor = BigNumber.from(10).pow(decimals);
            return value.mul(1000).div(divisor).toNumber() / 1000;
        } catch (error) {
            console.error('Error formatting units:', error);
            return '0.00';
        }
    }

    // Check if we're on the correct network
    async checkNetwork() {
        if (!window.ethereum) throw new Error("Please install MetaMask!");
        
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
    }

    // Connect wallet and setup Web3
    async connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error("Please install MetaMask first!");
            }

            await this.checkNetwork();

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                throw new Error("No authorized accounts found!");
            }

            this.connectedAddress = accounts[0];
            
            // Setup Web3 provider using ethers v5
            this.provider = new ethers.providers.Web3Provider(window.ethereum);

            window.ethereum.on('accountsChanged', this.handleAccountChange.bind(this));
            window.ethereum.on('chainChanged', this.handleChainChange.bind(this));

            await this.updateBalances();

            return this.connectedAddress;
        } catch (error) {
            console.error("Connection failed:", error);
            throw error;
        }
    }

    // Update token balances
    async updateBalances() {
        if (!this.connectedAddress || !this.provider) return;

        try {
            const signer = this.provider.getSigner();
            const akmContract = new ethers.Contract(AKM_ADDRESS, ERC20_ABI, signer);
            const rethContract = new ethers.Contract(RETH_ADDRESS, ERC20_ABI, signer);

            // Get decimals for each token
            const akmDecimals = await akmContract.decimals();
            const rethDecimals = await rethContract.decimals();

            // Get balances
            const akmBalance = await akmContract.balanceOf(this.connectedAddress);
            const rethBalance = await rethContract.balanceOf(this.connectedAddress);

            // Format balances using custom formatUnits method
            const formattedAkm = this.formatUnits(akmBalance, akmDecimals);
            const formattedReth = this.formatUnits(rethBalance, rethDecimals);

            // Update UI
            document.querySelector('.balance-box:nth-child(1) .balance-value').textContent = 
                Number(formattedAkm).toFixed(2);
            document.querySelector('.balance-box:nth-child(2) .balance-value').textContent = 
                Number(formattedReth).toFixed(2);

        } catch (error) {
            console.error("Error updating balances:", error);
            throw error;
        }
    }

    // Handle account changes
    handleAccountChange(accounts) {
        if (accounts.length === 0) {
            this.connectedAddress = null;
            window.location.reload();
        } else if (accounts[0] !== this.connectedAddress) {
            this.connectedAddress = accounts[0];
            this.updateBalances();
        }
    }

    // Handle chain changes
    handleChainChange() {
        window.location.reload();
    }
}