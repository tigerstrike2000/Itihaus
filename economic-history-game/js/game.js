// ========================
// Game State and Main Logic
// ========================

class Game {
    constructor() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 1;
        this.currentYear = 1;
        this.deltaTime = 0;
        this.lastFrameTime = 0;

        this.empire = null;
        this.economy = null;
        this.resourceManager = null;
        this.mapSystem = null;
        this.selectedCell = null;
        this.unitQueue = [];
        this.battles = [];
        this.notifications = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.mapSystem = new MapSystem(this);
        this.showCivilizationMenu();
    }

    setupEventListeners() {
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.gameSpeed = parseFloat(e.target.value);
            document.getElementById('speed-display').textContent = `${this.gameSpeed}x`;
        });

        document.getElementById('trade-btn').addEventListener('click', () => this.openTradingModal());
        document.getElementById('expand-btn')?.addEventListener('click', () => this.openExpansionPanel());
        document.getElementById('units-btn')?.addEventListener('click', () => this.openUnitsModal());
        document.getElementById('attack-btn')?.addEventListener('click', () => this.openAttackPanel());

        const gameView = document.getElementById('game-view');
        if (gameView) {
            gameView.addEventListener('click', (e) => this.onMapClick(e));
            gameView.addEventListener('contextmenu', (e) => this.onMapRightClick(e));
        }
    }

    showCivilizationMenu() {
        const civilizations = [
            { name: 'Egypt', description: 'The Nile\'s gift', bonus: '+20% Food', color: '#FFD700' },
            { name: 'Rome', description: 'Master of roads', bonus: '+25% Military', color: '#FF6B6B' },
            { name: 'Persia', description: 'Empire of unity', bonus: '+15% Happiness', color: '#4ECDC4' },
            { name: 'Greece', description: 'Cradle of knowledge', bonus: '+30% Trade', color: '#95E1D3' },
            { name: 'Mesopotamia', description: 'Between rivers', bonus: '+20% Commerce', color: '#F7DC6F' }
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
        
        this.empire = new Empire(civilization.name, { ...civilization, foodBonus: 1.2 });
        this.empire.color = civilization.color;
        this.economy = new Economy(this.empire);
        this.resourceManager = new ResourceManager(this.empire);
        
        // Setup initial buildings
        this.resourceManager.addProduction('Farm', 'Food', 15);
        this.resourceManager.addProduction('Lumber Mill', 'Wood', 8);
        this.resourceManager.addProduction('Quarry', 'Stone', 5);
        this.resourceManager.addProduction('Mine', 'Metal', 3);
        this.resourceManager.addProduction('Market', 'Luxury', 1);

        for (let i = 0; i < this.resourceManager.buildings.length; i++) {
            this.resourceManager.assignWorkers(i, 5);
        }

        this.gameRunning = true;
        this.gamePaused = false;

        const boardElement = document.getElementById('game-board');
        this.mapSystem.initializeMap(boardElement.offsetWidth, boardElement.offsetHeight);

        // Claim starting territory
        const startLocation = this.mapSystem.getStartingLocation(civilization.name);
        const startX = startLocation.position.x;
        const startY = startLocation.position.y;

        this.mapSystem.expandTerritory(startX, startY, civilization.color, civilization.name, 2);
        this.mapSystem.grid[startY][startX].units = 50; // Starting units

        this.addNotification(`${civilization.name} Empire established at ${startLocation.name}!`, 'info');
        this.updateUI();
        this.render();
        this.gameLoop(performance.now());
    }

    gameLoop = (currentTime) => {
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = currentTime;
        }

        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        if (!this.gamePaused && this.gameRunning) {
            this.update(this.deltaTime);
        }

        this.updateUI();
        this.render();
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        const scaledDeltaTime = deltaTime * this.gameSpeed;

        // Unit production
        this.updateUnitProduction(scaledDeltaTime);

        // Resource production
        this.resourceManager.calculateProduction(scaledDeltaTime);

        // Empire updates
        this.empire.update(scaledDeltaTime);
        this.economy.update(scaledDeltaTime);

        // Unit generation from economy
        this.generateUnitsFromEconomy(scaledDeltaTime);

        this.currentYear += scaledDeltaTime / 5;
    }

    generateUnitsFromEconomy(deltaTime) {
        // Generate units based on metal production and treasury
        const metalProduction = this.empire.productionRates.Metal || 0;
        const unitGenerationRate = (this.empire.treasury / 10000) * metalProduction * deltaTime;
        
        if (unitGenerationRate > 0.1) {
            const unitsToAdd = Math.floor(unitGenerationRate);
            const startLocation = this.mapSystem.getStartingLocation(this.empire.name);
            this.mapSystem.addUnits(startLocation.position.x, startLocation.position.y, unitsToAdd);
        }
    }

    updateUnitProduction(deltaTime) {
        // Production logic for queued units
        this.unitQueue.forEach((unit, index) => {
            unit.progress += deltaTime;
            if (unit.progress >= unit.productionTime) {
                this.unitQueue.splice(index, 1);
                const startLocation = this.mapSystem.getStartingLocation(this.empire.name);
                this.mapSystem.addUnits(startLocation.position.x, startLocation.position.y, 1);
            }
        });
    }

    render() {
        const gameView = document.getElementById('game-view');
        if (!gameView || !this.mapSystem) return;

        if (this.mapSystem.cellSize === 0) return;

        let canvas = document.getElementById('game-canvas');
        if (!canvas) {
            gameView.innerHTML = '';
            canvas = document.createElement('canvas');
            canvas.id = 'game-canvas';
            canvas.width = gameView.offsetWidth;
            canvas.height = gameView.offsetHeight;
            gameView.appendChild(canvas);
        }

        this.drawMap(canvas);
    }

    drawMap(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0a0e27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid cells
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

        // Draw territory ownership (semi-transparent)
        if (cell.isControlled && cell.empireColor) {
            ctx.fillStyle = cell.empireColor;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(x, y, size, size);
            ctx.globalAlpha = 1;
        }

        // Draw terrain
        ctx.fillStyle = this.mapSystem.getTerrainColor(cell.terrain);
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x, y, size, size);
        ctx.globalAlpha = 1;

        // Draw grid lines
        ctx.strokeStyle = '#1a3a52';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);

        // Draw units
        if (cell.units > 0) {
            const unitSize = Math.min(size * 0.6, 20);
            ctx.fillStyle = cell.empireColor || '#16a085';
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, unitSize / 2, 0, Math.PI * 2);
            ctx.fill();

            // Unit count
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cell.units, x + size / 2, y + size / 2);
        }

        // Highlight selected cell
        if (this.selectedCell && this.selectedCell.x === gridX && this.selectedCell.y === gridY) {
            ctx.strokeStyle = '#00FF00';
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

    onMapRightClick(e) {
        e.preventDefault();
        // Right-click attack feature
        if (this.selectedCell) {
            this.attackCell(this.selectedCell.x, this.selectedCell.y);
        }
    }

    showCellInfo(x, y) {
        const cell = this.mapSystem.getCellAtPosition(x, y);
        if (!cell) return;

        let info = `<strong>Territory (${x}, ${y})</strong><br>`;
        info += `Terrain: ${cell.terrain}<br>`;
        if (cell.owner) {
            info += `Owner: ${cell.owner}<br>`;
            info += `Units: ${cell.units}`;
        } else {
            info += `Unclaimed - Click Build to expand`;
        }

        const productionList = document.getElementById('production-list');
        if (productionList) {
            productionList.innerHTML = `<div style="padding: 10px; background: #0f3460; border-radius: 3px; font-size: 12px;">${info}</div>`;
        }
    }

    attackCell(x, y) {
        const cell = this.mapSystem.getCellAtPosition(x, y);
        if (!cell) return;

        const startLocation = this.mapSystem.getStartingLocation(this.empire.name);
        const myUnits = this.mapSystem.grid[startLocation.position.y][startLocation.position.x].units;

        if (myUnits < 5) {
            this.addNotification('Not enough units to attack!', 'error');
            return;
        }

        if (cell.owner === this.empire.name) {
            this.addNotification('Cannot attack own territory!', 'error');
            return;
        }

        const attackUnits = Math.floor(myUnits * 0.3);
        const defendUnits = cell.units || 1;

        const result = CombatSystem.calculateBattle(attackUnits, defendUnits);
        
        this.mapSystem.removeUnits(startLocation.position.x, startLocation.position.y, result.attackerLosses);
        cell.units = Math.max(0, defendUnits - result.defenderLosses);

        if (result.attackerWins && cell.units === 0) {
            this.mapSystem.claimTerritory(x, y, this.empire);
            this.addNotification(`Territory conquered! +1 domain`, 'success');
        }

        const message = `Battle at (${x}, ${y}): You lost ${result.attackerLosses} units. Enemy lost ${result.defenderLosses} units.`;
        this.addNotification(message, result.attackerWins ? 'success' : 'warning');
    }

    expandTerritory() {
        const startLocation = this.mapSystem.getStartingLocation(this.empire.name);
        const expanded = this.mapSystem.expandTerritory(
            startLocation.position.x,
            startLocation.position.y,
            this.empire.color,
            this.empire.name,
            1
        );
        this.addNotification(`Territory expanded by ${expanded} cells!`, 'info');
    }

    addNotification(message, type = 'info') {
        this.notifications.push({ message, type, time: 0 });
        if (this.notifications.length > 5) {
            this.notifications.shift();
        }
    }

    updateUI() {
        document.getElementById('empire-name').textContent = this.empire?.name || 'Empire';
        document.getElementById('population').textContent = Math.floor(this.empire?.population || 0);
        document.getElementById('treasury').textContent = Math.floor(this.empire?.treasury || 0);
        document.getElementById('happiness').textContent = Math.floor(this.empire?.happiness || 50);
        document.getElementById('food-storage').textContent = Math.floor(this.empire?.resources.Food || 0);

        if (this.selectedCell) {
            const cell = this.mapSystem.getCellAtPosition(this.selectedCell.x, this.selectedCell.y);
            if (cell) {
                document.getElementById('selected-units').textContent = cell.units || 0;
            }
        }

        this.updateResourcesUI();
        this.updatePricesUI();
        this.updateProductionUI();
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
        if (!productionList) return;

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

    openTradingModal() {
        const modal = document.getElementById('trading-modal');
        const sellSelect = document.getElementById('sell-resource');
        const buySelect = document.getElementById('buy-resource');

        sellSelect.innerHTML = '<option value="">Select Resource</option>';
        buySelect.innerHTML = '<option value="">Select Resource</option>';

        Object.keys(this.empire.resources).forEach(resource => {
            const opt1 = document.createElement('option');
            opt1.value = resource;
            opt1.textContent = resource;
            sellSelect.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = resource;
            opt2.textContent = resource;
            buySelect.appendChild(opt2);
        });

        modal.classList.remove('hidden');
    }

    openUnitsModal() {
        const modal = document.getElementById('units-modal') || this.createUnitsModal();
        modal.classList.remove('hidden');
    }

    openAttackPanel() {
        if (this.selectedCell) {
            this.attackCell(this.selectedCell.x, this.selectedCell.y);
        } else {
            this.addNotification('Select a cell to attack!', 'error');
        }
    }

    openExpansionPanel() {
        this.expandTerritory();
    }

    createUnitsModal() {
        const modal = document.createElement('div');
        modal.id = 'units-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Military Units</h2>
                    <button class="close-btn" onclick="this.parentElement.parentElement.classList.add('hidden')">&times;</button>
                </div>
                <p>Produce military units to expand territory and defend your empire.</p>
                <div class="units-grid" id="units-grid"></div>
            </div>
        `;
        document.getElementById('app').appendChild(modal);
        return modal;
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pause-btn').textContent = this.gamePaused ? 'Resume' : 'Pause';
    }
}

function closeTradingModal() {
    document.getElementById('trading-modal').classList.add('hidden');
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

    const goldValue = amount * window.game.economy.prices[resource];
    window.game.empire.resources[resource] -= amount;
    window.game.empire.treasury += goldValue;

    document.getElementById('trade-result').textContent = `Sold ${amount} ${resource} for ${goldValue.toFixed(0)} gold`;
}

window.addEventListener('load', () => {
    window.game = new Game();
});
