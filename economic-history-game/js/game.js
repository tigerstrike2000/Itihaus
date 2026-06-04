// ========================
// Game State and Main Logic
// ========================

class Game {
    constructor() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 1; // Multiplier for game speed
        this.currentYear = 1;
        this.deltaTime = 0;
        this.lastFrameTime = 0;

        this.empire = null;
        this.economy = null;
        this.resourceManager = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showCivilizationMenu();
    }

    setupEventListeners() {
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMenu());
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.gameSpeed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = `${this.gameSpeed}x`;
        });

        // Trading
        document.getElementById('trade-btn').addEventListener('click', () => this.openTradingModal());
        
        // Building
        document.getElementById('build-btn').addEventListener('click', () => this.openBuildingModal());
    }

    showCivilizationMenu() {
        const civilizations = [
            { 
                name: 'Egypt', 
                description: 'The Nile\'s gift', 
                bonus: 'Agricultural efficiency +20%',
                foodBonus: 1.2
            },
            { 
                name: 'Rome', 
                description: 'Master of roads', 
                bonus: 'Trading +25%',
                tradeBonus: 1.25
            },
            { 
                name: 'Persia', 
                description: 'Empire of unity', 
                bonus: 'Diplomatic relations +15%',
                happinessBonus: 1.15
            },
            { 
                name: 'Greece', 
                description: 'Cradle of knowledge', 
                bonus: 'Research +30%',
                researchBonus: 1.3
            },
            { 
                name: 'Mesopotamia', 
                description: 'Between rivers', 
                bonus: 'Commerce +20%',
                commerceBonus: 1.2
            }
        ];

        const civList = document.getElementById('civilization-list');
        civList.innerHTML = '';

        civilizations.forEach(civ => {
            const item = document.createElement('div');
            item.className = 'civilization-item';
            item.innerHTML = `
                <h3>${civ.name}</h3>
                <p>${civ.description}</p>
                <small>${civ.bonus}</small>
            `;
            item.addEventListener('click', () => this.startGame(civ));
            civList.appendChild(item);
        });

        document.getElementById('start-menu').style.display = 'flex';
    }

    startGame(civilization) {
        document.getElementById('start-menu').style.display = 'none';
        
        this.empire = new Empire(civilization.name, civilization);
        this.economy = new Economy(this.empire);
        this.resourceManager = new ResourceManager(this.empire);
        
        // Initialize production buildings
        this.resourceManager.addProduction('Farm', 'Food', 15);
        this.resourceManager.addProduction('Lumber Mill', 'Wood', 8);
        this.resourceManager.addProduction('Quarry', 'Stone', 5);
        this.resourceManager.addProduction('Mine', 'Metal', 3);
        this.resourceManager.addProduction('Market', 'Luxury', 1);

        // Start with workers
        for (let i = 0; i < this.resourceManager.buildings.length; i++) {
            this.resourceManager.assignWorkers(i, 5);
        }

        this.gameRunning = true;
        this.gamePaused = false;

        this.updateUI();
        this.gameLoop(performance.now());
    }

    gameLoop = (currentTime) => {
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = currentTime;
        }

        this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;

        if (!this.gamePaused && this.gameRunning) {
            this.update(this.deltaTime);
        }

        this.updateUI();
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Apply game speed multiplier
        const scaledDeltaTime = deltaTime * this.gameSpeed;

        // Update resource production
        this.resourceManager.calculateProduction(scaledDeltaTime);

        // Update empire
        this.empire.update(scaledDeltaTime);

        // Update economy (prices, supply/demand)
        this.economy.update(scaledDeltaTime);

        // Progress time (1 real second = 1 game year at 1x speed)
        this.currentYear += scaledDeltaTime / 5;
    }

    updateUI() {
        // Update header info
        document.getElementById('empire-name').textContent = this.empire?.name || 'Empire';
        document.getElementById('population').textContent = Math.floor(this.empire?.population || 0);
        document.getElementById('treasury').textContent = Math.floor(this.empire?.treasury || 0);
        document.getElementById('happiness').textContent = Math.floor(this.empire?.happiness || 50);
        document.getElementById('food-storage').textContent = Math.floor(this.empire?.resources.Food || 0);

        // Update footer stats
        document.getElementById('footer-population').textContent = Math.floor(this.empire?.population || 0);
        document.getElementById('footer-treasury').textContent = Math.floor(this.empire?.treasury || 0);

        // Update resources
        this.updateResourcesUI();

        // Update market prices
        this.updatePricesUI();

        // Update production
        this.updateProductionUI();

        // Update year
        document.getElementById('year').textContent = Math.floor(this.currentYear);
    }

    updateResourcesUI() {
        const resourcesList = document.getElementById('resources-list');
        resourcesList.innerHTML = '';

        if (!this.empire) return;

        Object.entries(this.empire.resources).forEach(([name, amount]) => {
            const item = document.createElement('div');
            item.className = 'resource-item';
            const rate = this.empire.productionRates[name] || 0;
            item.innerHTML = `
                <span class="resource-name">${name}:</span>
                <div>
                    <span class="resource-amount">${Math.floor(amount)}</span>
                    <span class="resource-change">(+${rate.toFixed(1)}/s)</span>
                </div>
            `;
            resourcesList.appendChild(item);
        });
    }

    updatePricesUI() {
        const pricesList = document.getElementById('prices-list');
        pricesList.innerHTML = '';

        if (!this.economy) return;

        Object.entries(this.economy.prices).forEach(([name, price]) => {
            const item = document.createElement('div');
            item.className = 'price-item';
            item.innerHTML = `
                <span class="price-name">${name}:</span>
                <span class="price-value">${price.toFixed(2)} gold</span>
            `;
            pricesList.appendChild(item);
        });
    }

    updateProductionUI() {
        const productionList = document.getElementById('production-list');
        productionList.innerHTML = '';

        if (!this.resourceManager) return;

        this.resourceManager.buildings.forEach((building, index) => {
            const item = document.createElement('div');
            item.className = 'production-item';
            const production = building.productionRate * (building.workers / building.maxWorkers);
            item.innerHTML = `
                <span class="production-name">${building.type}</span>
                <span class="production-rate">${building.workers}/${building.maxWorkers} workers</span>
                <span class="production-rate">${production.toFixed(1)} ${building.resource}/s</span>
            `;
            productionList.appendChild(item);
        });
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pause-btn').textContent = this.gamePaused ? 'Resume' : 'Pause';
    }

    showMenu() {
        console.log('Menu clicked - feature coming soon');
    }

    openTradingModal() {
        if (!this.empire) return;
        
        const modal = document.getElementById('trading-modal');
        const sellSelect = document.getElementById('sell-resource');
        const buySelect = document.getElementById('buy-resource');

        sellSelect.innerHTML = '<option value="">Select Resource to Sell</option>';
        buySelect.innerHTML = '<option value="">Select Resource to Buy</option>';

        Object.keys(this.empire.resources).forEach(resource => {
            const option1 = document.createElement('option');
            option1.value = resource;
            option1.textContent = resource;
            sellSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = resource;
            option2.textContent = resource;
            buySelect.appendChild(option2);
        });

        modal.classList.remove('hidden');
    }

    openBuildingModal() {
        const modal = document.getElementById('building-modal');
        const buildingList = document.getElementById('building-list');

        const buildings = [
            { name: 'Farm', cost: { Wood: 50, Stone: 30 }, bonus: 'Food +10/s' },
            { name: 'Granary', cost: { Wood: 100, Stone: 80 }, bonus: 'Food Storage +500' },
            { name: 'Market', cost: { Stone: 100, Wood: 50 }, bonus: 'Trade Routes +3' },
            { name: 'Library', cost: { Stone: 150, Luxury: 20 }, bonus: 'Research +5' },
        ];

        buildingList.innerHTML = '';
        buildings.forEach(building => {
            const costs = Object.entries(building.cost)
                .map(([resource, amount]) => `${resource}: ${amount}`)
                .join(', ');
            
            const item = document.createElement('div');
            item.className = 'building-item';
            item.innerHTML = `
                <h4>${building.name}</h4>
                <p>${building.bonus}</p>
                <div class="building-cost">Cost: ${costs}</div>
                <button class="action-btn">Build</button>
            `;
            buildingList.appendChild(item);
        });

        modal.classList.remove('hidden');
    }
}

// Global functions for modals
function closeTradingModal() {
    document.getElementById('trading-modal').classList.add('hidden');
}

function closeBuildingModal() {
    document.getElementById('building-modal').classList.add('hidden');
}

function executeTrade() {
    if (!window.game || !window.game.empire) return;

    const resource = document.getElementById('sell-resource').value;
    const amount = parseFloat(document.getElementById('sell-amount').value);

    if (!resource || !amount || amount <= 0) {
        alert('Please select a resource and amount');
        return;
    }

    if (window.game.empire.resources[resource] < amount) {
        alert('Insufficient resources');
        return;
    }

    // Simple trade: sell for gold
    const goldValue = amount * window.game.economy.prices[resource];
    window.game.empire.resources[resource] -= amount;
    window.game.empire.treasury += goldValue;

    document.getElementById('trade-result').textContent = `Sold ${amount} ${resource} for ${goldValue.toFixed(0)} gold`;
}

// Start the game
window.addEventListener('load', () => {
    window.game = new Game();
});