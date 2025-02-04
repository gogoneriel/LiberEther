const priceData = {
    get currentPrice() {
        return parseFloat(sessionStorage.getItem('currentPrice')) || 0.46;
    },
    set currentPrice(value) {
        sessionStorage.setItem('currentPrice', value);
        window.dispatchEvent(new Event('priceUpdate'));
    },
    async fetchPrice() {
        try {
            // Add timestamp to prevent caching
            const response = await fetch(`price-fetch.php?t=${Date.now()}`);
            const data = await response.json();
            this.currentPrice = data.price;
            
            // Update all price displays on the page
            const tokenPriceEl = document.getElementById('tokenPrice');
            if (tokenPriceEl) {
                tokenPriceEl.textContent = `$${data.price.toFixed(2)}`;
            }
            
            // Update market cap
            const marketCapEl = document.getElementById('marketCap');
            if (marketCapEl) {
                const CIRCULATING_SUPPLY = 565020; // Your circulating supply
                const marketCap = data.price * CIRCULATING_SUPPLY;
                marketCapEl.textContent = `$${marketCap.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
            }

            // Update ATH if needed
            if (typeof updatePriceAndATH === 'function') {
                updatePriceAndATH();
            }
        } catch (error) {
            console.error('Error fetching price:', error);
        }
    }
};

// Fetch price immediately when page loads
priceData.fetchPrice();

// Fetch price every 30 seconds
setInterval(() => priceData.fetchPrice(), 30000);