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
            const response = await fetch(`price-fetch.php?t=${Date.now()}`);
            const data = await response.json();
            this.currentPrice = data.price;
        } catch (error) {
            console.error('Error fetching price:', error);
        }
    }
};

// Fetch price every minute
setInterval(() => priceData.fetchPrice(), 60000);
priceData.fetchPrice();

window.addEventListener('priceUpdate', () => {
    if (typeof updatePriceAndATH === 'function') {
        updatePriceAndATH();
    }
});