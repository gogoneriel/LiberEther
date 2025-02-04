const priceData = {
    get currentPrice() {
        return parseFloat(sessionStorage.getItem('currentPrice')) || 0.46;
    },
    set currentPrice(value) {
        sessionStorage.setItem('currentPrice', value);
        window.dispatchEvent(new Event('priceUpdate'));
    },
    updatePrice(newPrice) {
        this.currentPrice = newPrice;
    }
};

window.addEventListener('priceUpdate', () => {
    if (typeof updatePriceAndATH === 'function') {
        updatePriceAndATH();
    }
});