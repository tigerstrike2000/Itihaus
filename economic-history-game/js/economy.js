// ========================
// Economy and Market System
// ========================

class Economy {
    constructor(empire) {
        this.empire = empire;
        this.basePrice = {
            Food: 1.0,
            Wood: 1.5,
            Stone: 2.0,
            Metal: 3.0,
            Luxury: 5.0
        };

        this.prices = { ...this.basePrice };
        this.priceVolatility = {
            Food: 0.05,
            Wood: 0.08,
            Stone: 0.06,
            Metal: 0.1,
            Luxury: 0.15
        };

        this.supply = { ...empire.resources };
        this.demand = {
            Food: 100,
            Wood: 50,
            Stone: 40,
            Metal: 30,
            Luxury: 20
        };

        this.marketTime = 0;
        this.priceHistory = {};
        Object.keys(this.prices).forEach(resource => {
            this.priceHistory[resource] = [];
        });
    }

    update(deltaTime) {
        this.marketTime += deltaTime;

        // Update supply based on current resources
        this.supply = { ...this.empire.resources };

        // Update prices based on supply and demand
        Object.keys(this.prices).forEach(resource => {
            this.updatePrice(resource);
        });

        // Fluctuate demand slightly (simulates market changes)
        this.fluctuateDemand(deltaTime);

        // Track price history
        this.recordPriceHistory();
    }

    updatePrice(resource) {
        const currentSupply = this.supply[resource] || 1;
        const currentDemand = this.demand[resource] || 1;

        // Price = Base Price * (Demand / Supply) with volatility
        const supplyFactor = Math.max(0.5, Math.min(3, currentDemand / (currentSupply / 100)));
        
        // Add random volatility
        const volatility = (Math.random() - 0.5) * this.priceVolatility[resource];
        
        this.prices[resource] = Math.max(0.1, this.basePrice[resource] * supplyFactor + volatility);
    }

    fluctuateDemand(deltaTime) {
        Object.keys(this.demand).forEach(resource => {
            // Demand gradually returns to base
            const baseArray = Object.values(this.demand);
            const change = (Math.random() - 0.5) * 2 * deltaTime;
            this.demand[resource] = Math.max(10, Math.min(200, this.demand[resource] + change));
        });
    }

    recordPriceHistory() {
        Object.keys(this.priceHistory).forEach(resource => {
            this.priceHistory[resource].push(this.prices[resource]);
            // Keep only last 100 records
            if (this.priceHistory[resource].length > 100) {
                this.priceHistory[resource].shift();
            }
        });
    }

    // Calculate trade profit
    calculateTrade(resourceSold, amountSold, resourceBought) {
        const priceReceived = this.prices[resourceSold] * amountSold;
        const costInGold = this.prices[resourceBought] * amountSold;
        
        return {
            priceReceived: priceReceived,
            costInGold: costInGold,
            profit: priceReceived - costInGold
        };
    }

    // Get average price over time
    getAveragePrice(resource, periods = 10) {
        const history = this.priceHistory[resource] || [];
        if (history.length === 0) return this.prices[resource];
        
        const recent = history.slice(-periods);
        return recent.reduce((a, b) => a + b, 0) / recent.length;
    }
}