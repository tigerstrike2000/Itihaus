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
        this.mapSystem = null;
        this.buildingQueue = [];
        this.selectedCell = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.mapSystem = new MapSystem(this);
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

        // Map click handling
        const gameView = document.getElementById('game-view');
        if (gameView) {
            gameView.addEventListener('click', (e) => this.onMapClick(e));
        }
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
            
            const location = this.mapSystem.getStartingLocation(civ.name);
            item.innerHTML = `
                <h3>${civ.name}</h3>
                <p>${civ.description}</p>
                <small>${civ.bonus}</small>
                <div class="civ-location">Starting: ${location.name}</div>
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
        
        // Apply starting location bonuses
        const startLocation = this.mapSystem.getStartingLocation(civilization.name);
        Object.entries(startLocation.bonusResources).forEach(([resource, amount]) => {
            this.empire.resources[resource] += amount;
        });

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

        // Initialize map display
        this.mapSystem.initializeMap(
            document.getElementById('game-board').offsetWidth,
            document.getElementById('game-board').offsetHeight
        );

        // Place starting buildings on the map
        const startPos = startLocation.position;
        for (let i = 0; i < this.resourceManager.buildings.length; i++) {
            const building = this.resourceManager.buildings[i];
            const newBuilding = new Building(building.type, startPos.x + i, startPos.y, {});
            newBuilding.isComplete = true;
            newBuilding.constructionProgress = 1;
            this.mapSystem.placeBuilding(startPos.x + i, startPos.y, newBuilding, civilization.name);
        }

        this.updateUI();
        this.render();
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
        this.render();
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Apply game speed multiplier
        const scaledDeltaTime = deltaTime * this.gameSpeed;

        // Update building construction
        this.updateBuildingConstruction(scaledDeltaTime);

        // Update resource production
        this.resourceManager.calculateProduction(scaledDeltaTime);

        // Update empire
        this.empire.update(scaledDeltaTime);

        // Update economy (prices, supply/demand)
        this.economy.update(scaledDeltaTime);

        // Progress time (1 real second = 1 game year at 1x speed)
        this.currentYear += scaledDeltaTime / 5;
    }

    updateBuildingConstruction(deltaTime) {
        // Update all buildings on map
        for (let y = 0; y < this.mapSystem.gridSize; y++) {
            for (let x = 0; x < this.mapSystem.gridSize; x++) {
                const cell = this.mapSystem.grid[y][x];
                if (cell.building) {
                    const completed = cell.building.updateConstruction(deltaTime);
                    if (completed) {
                        // Building completed - add to production
                        this.resourceManager.addProduction(
                            cell.building.type,
                            this.getBuildingResourceType(cell.building.type),
                            this.getBuildingProductionRate(cell.building.type)
                        );
                    }
                }
            }
        }
    }

    getBuildingResourceType(buildingType) {
        const types = {
            'Farm': 'Food',
            'Lumber Mill': 'Wood',
            'Quarry': 'Stone',
            'Mine': 'Metal',
            'Market': 'Luxury'
        };
        return types[buildingType] || 'Food';
    }

    getBuildingProductionRate(buildingType) {
        const rates = {
            'Farm': 8,
            'Lumber Mill': 5,
            'Quarry': 3,
            'Mine': 2,
            'Market': 0.5
        };
        return rates[buildingType] || 1;
    }

    render() {
        const gameView = document.getElementById('game-view');
        if (!gameView || !this.mapSystem) return;

        // Only render if map system is ready
        if (this.mapSystem.cellSize === 0) return;

        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            this.createCanvas(gameView);
            return;
        }

        this.drawMap(canvas);
    }

    createCanvas(container) {
        container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.id = 'game-canvas';
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        container.appendChild(canvas);
    }

    drawMap(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0a0e27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        for (let y = 0; y < this.mapSystem.gridSize; y++) {
            for (let x = 0; x < this.mapSystem.gridSize; x++) {
                this.drawCell(ctx, x, y);
            }
        }
    }

    drawCell(ctx, gridX, gridY) {
        const cell = this.mapSystem.grid[gridY][gridX];
        const x = gridX * this.mapSystem.cellSize;
        const y = gridY * this.mapSystem.cellSize;
        const size = this.mapSystem.cellSize;

        // Draw terrain
        ctx.fillStyle = this.mapSystem.getTerrainColor(cell.terrain);
        ctx.fillRect(x, y, size, size);

        // Draw grid lines
        ctx.strokeStyle = '#1a3a52';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);

        // Draw building if present
        if (cell.building) {
            ctx.fillStyle = this.mapSystem.getBuildingColor(cell.building);
            const buildingSize = size * 0.7;
            const offsetX = (size - buildingSize) / 2;
            const offsetY = (size - buildingSize) / 2;
            ctx.fillRect(x + offsetX, y + offsetY, buildingSize, buildingSize);

            // Draw construction progress
            if (!cell.building.isComplete) {
                ctx.strokeStyle = '#ff9900';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + offsetX, y + offsetY, buildingSize, buildingSize);

                // Progress bar
                ctx.fillStyle = '#ff9900';
                const progressWidth = buildingSize * cell.building.constructionProgress;
                ctx.fillRect(x + offsetX, y + offsetY + buildingSize + 2, progressWidth, 3);
            }
        }

        // Highlight selected cell
        if (this.selectedCell && this.selectedCell.x === gridX && this.selectedCell.y === gridY) {
            ctx.strokeStyle = '#16a085';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, size, size);
        }
    }

    onMapClick(e) {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const gridX = Math.floor(clickX / this.mapSystem.cellSize);
        const gridY = Math.floor(clickY / this.mapSystem.cellSize);

        this.selectedCell = { x: gridX, y: gridY };
        this.showCellInfo(gridX, gridY);
    }

    showCellInfo(x, y) {
        const cell = this.mapSystem.getCellAtPosition(x, y);
        if (!cell) return;

        let info = `<strong>Cell (${x}, ${y})</strong><br>`;
        info += `Terrain: ${cell.terrain}<br>`;
        
        if (cell.building) {
            info += `Building: ${cell.building.type}<br>`;
            info += `Construction: ${cell.building.getProgressPercentage()}%<br>`;
            info += `Workers: ${cell.building.workers}/${cell.building.maxWorkers}`;
        } else {
            info += `Empty cell - click Build to construct`;
        }

        // Show in a simple tooltip or update sidebar
        const productionList = document.getElementById('production-list');
        if (productionList) {
            productionList.innerHTML = `<div style="padding: 10px; background: #0f3460; border-radius: 3px;">${info}</div>` + productionList.innerHTML;
        }
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
            { name: 'Farm', cost: { Wood: 50, Stone: 30 }, bonus: 'Food +8/s', time: 10 },
            { name: 'Granary', cost: { Wood: 100, Stone: 80 }, bonus: 'Food Storage +500', time: 20 },
            { name: 'Market', cost: { Stone: 100, Wood: 50 }, bonus: 'Luxury +1/s', time: 15 },
            { name: 'Library', cost: { Stone: 150, Luxury: 20 }, bonus: 'Research +5', time: 30 },
            { name: 'Lumber Mill', cost: { Stone: 60, Wood: 40 }, bonus: 'Wood +5/s', time: 12 },
            { name: 'Quarry', cost: { Wood: 70, Stone: 50 }, bonus: 'Stone +3/s', time: 15 },
            { name: 'Mine', cost: { Wood: 80, Stone: 100 }, bonus: 'Metal +2/s', time: 25 },
            { name: 'Temple', cost: { Stone: 200, Luxury: 50 }, bonus: 'Happiness +10', time: 40 }
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
                <div class="building-time">Construction: ${building.time}s</div>
                <button class="action-btn" onclick="window.game.constructBuilding('${building.name}', ${JSON.stringify(building.cost).replace(/"/g, '\\"')}, ${building.time})">Build</button>
            `;
            buildingList.appendChild(item);
        });

        modal.classList.remove('hidden');
    }

    constructBuilding(buildingType, costs, constructionTime) {
        if (!this.selectedCell) {
            alert('Select a cell on the map first');
            return;
        }

        const cell = this.mapSystem.getCellAtPosition(this.selectedCell.x, this.selectedCell.y);
        if (cell.building) {
            alert('Cell already has a building');
            return;
        }

        // Check resources
        for (const [resource, amount] of Object.entries(costs)) {
            if (!this.empire.resources[resource] || this.empire.resources[resource] < amount) {
                alert(`Insufficient ${resource}`);
                return;
            }
        }

        // Consume resources
        for (const [resource, amount] of Object.entries(costs)) {
            this.empire.resources[resource] -= amount;
        }

        // Create building
        const building = new Building(buildingType, this.selectedCell.x, this.selectedCell.y, costs);
        building.constructionTime = constructionTime;
        this.mapSystem.placeBuilding(this.selectedCell.x, this.selectedCell.y, building, this.empire.name);

        document.getElementById('building-modal').classList.add('hidden');
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
