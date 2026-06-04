// ========================
// Resources Management
// ========================

class ResourceManager {
    constructor(empire) {
        this.empire = empire;
        this.buildings = [];
        this.productions = [];
    }

    // Add a production building
    addProduction(buildingType, resourceType, productionRate) {
        const building = {
            type: buildingType,
            resource: resourceType,
            productionRate: productionRate,
            workers: 0,
            maxWorkers: 10,
            efficiency: 1.0
        };
        this.buildings.push(building);
        return building;
    }

    // Assign workers to production
    assignWorkers(buildingIndex, workerCount) {
        if (buildingIndex < this.buildings.length) {
            const building = this.buildings[buildingIndex];
            building.workers = Math.min(workerCount, building.maxWorkers);
        }
    }

    // Calculate total production based on workers
    calculateProduction(deltaTime) {
        this.buildings.forEach(building => {
            const workerEfficiency = building.workers / building.maxWorkers;
            const actualProduction = building.productionRate * workerEfficiency * building.efficiency * deltaTime;
            this.empire.resources[building.resource] += actualProduction;
        });
    }

    // Consume resources
    consumeResource(resource, amount) {
        if (this.empire.resources[resource] >= amount) {
            this.empire.resources[resource] -= amount;
            return true;
        }
        return false;
    }

    // Consume multiple resources
    consumeMultiple(costs) {
        // Check if we have all resources
        for (const [resource, amount] of Object.entries(costs)) {
            if (!this.empire.resources[resource] || this.empire.resources[resource] < amount) {
                return false;
            }
        }

        // Consume all
        for (const [resource, amount] of Object.entries(costs)) {
            this.empire.resources[resource] -= amount;
        }
        return true;
    }

    // Trade resources
    tradeResource(resourceFrom, amountFrom, resourceTo, economy) {
        if (this.consumeResource(resourceFrom, amountFrom)) {
            const goldValue = amountFrom * economy.prices[resourceFrom];
            const amountTo = goldValue / economy.prices[resourceTo];
            this.empire.resources[resourceTo] += amountTo;
            return true;
        }
        return false;
    }

    // Build a structure
    buildStructure(buildingType, costs) {
        if (this.consumeMultiple(costs)) {
            // Add building bonus
            this.addProduction(buildingType, 'bonus', 1);
            return true;
        }
        return false;
    }

    // Get total workers available
    getTotalWorkers() {
        return this.buildings.reduce((total, b) => total + b.maxWorkers, 0);
    }

    // Get workers assigned
    getAssignedWorkers() {
        return this.buildings.reduce((total, b) => total + b.workers, 0);
    }
}

// ========================
// Empire Class
// ========================

class Empire {
    constructor(name, civilization) {
        this.name = name;
        this.civilization = civilization;
        this.population = 1000;
        this.treasury = 5000;
        this.happiness = 75;

        // Resources
        this.resources = {
            Food: 2000,
            Wood: 1000,
            Stone: 800,
            Metal: 500,
            Luxury: 100
        };

        // Production rates (per second)
        this.productionRates = {
            Food: 10,
            Wood: 5,
            Stone: 3,
            Metal: 2,
            Luxury: 0.5
        };

        // Apply civilization bonuses
        this.applyCivilizationBonuses();
    }

    applyCivilizationBonuses() {
        if (this.civilization.foodBonus) {
            this.productionRates.Food *= this.civilization.foodBonus;
        }
        if (this.civilization.tradeBonus) {
            // Trade bonus affects all trade prices
        }
        if (this.civilization.happinessBonus) {
            this.happiness *= this.civilization.happinessBonus;
        }
    }

    update(deltaTime) {
        // Consume food (population needs)
        const foodConsumption = this.population * 0.01 * deltaTime;
        this.resources.Food = Math.max(0, this.resources.Food - foodConsumption);

        // Population growth based on happiness and food
        let growthRate = (this.happiness / 100) * 0.5;
        
        // If food is low, population declines
        if (this.resources.Food < this.population * 0.2) {
            growthRate = -0.5; // Starvation
            this.happiness = Math.max(0, this.happiness - deltaTime * 10);
        } else if (this.resources.Food < this.population * 0.5) {
            growthRate *= 0.5; // Food shortage reduces growth
            this.happiness = Math.max(0, this.happiness - deltaTime * 3);
        } else {
            // Good food supply increases happiness
            this.happiness = Math.min(100, this.happiness + deltaTime * 1);
        }

        this.population = Math.max(100, this.population + this.population * growthRate * 0.001 * deltaTime);

        // Luxury goods improve happiness
        const luxuryEffect = (this.resources.Luxury / this.population) * 10;
        this.happiness = Math.min(100, this.happiness + luxuryEffect * deltaTime * 0.1);

        // Natural happiness decay
        this.happiness = Math.max(0, this.happiness - deltaTime * 0.1);

        // Generate passive income
        this.treasury += (this.population / 1000) * deltaTime;
    }

    // Check if empire is thriving
    isHealthy() {
        return this.happiness > 60 && this.resources.Food > this.population * 0.5;
    }

    // Get empire status
    getStatus() {
        if (this.happiness < 20) return 'Critical';
        if (this.happiness < 50) return 'Struggling';
        if (this.happiness < 75) return 'Stable';
        return 'Thriving';
    }
}