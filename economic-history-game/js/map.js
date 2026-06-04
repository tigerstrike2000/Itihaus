// ========================
// Map and Grid System
// ========================

class MapSystem {
    constructor(game) {
        this.game = game;
        this.gridSize = 20; // Larger map like OpenFront
        this.cellSize = 0;
        this.worldLocations = {};
        this.initializeWorldLocations();
        this.camera = { x: 0, y: 0, zoom: 1 };
    }

    initializeWorldLocations() {
        this.worldLocations = {
            'Egypt': {
                name: 'Nile Delta',
                position: { x: 5, y: 10 },
                terrain: 'river',
                color: '#FFD700'
            },
            'Rome': {
                name: 'Mediterranean Coast',
                position: { x: 15, y: 8 },
                terrain: 'coastal',
                color: '#FF6B6B'
            },
            'Persia': {
                name: 'Silk Road',
                position: { x: 10, y: 5 },
                terrain: 'plains',
                color: '#4ECDC4'
            },
            'Greece': {
                name: 'Aegean',
                position: { x: 14, y: 12 },
                terrain: 'island',
                color: '#95E1D3'
            },
            'Mesopotamia': {
                name: 'Twin Rivers',
                position: { x: 3, y: 7 },
                terrain: 'river',
                color: '#F7DC6F'
            }
        };
    }

    getStartingLocation(civilizationName) {
        return this.worldLocations[civilizationName] || this.worldLocations['Egypt'];
    }

    initializeMap(canvasWidth, canvasHeight) {
        this.cellSize = canvasWidth / this.gridSize;
        this.createEmptyGrid();
    }

    createEmptyGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x] = {
                    x: x,
                    y: y,
                    terrain: this.getTerrainType(x, y),
                    owner: null,
                    empireColor: null,
                    building: null,
                    units: 0,
                    isControlled: false
                };
            }
        }
    }

    getTerrainType(x, y) {
        const noise = (Math.sin(x * 0.3) + Math.cos(y * 0.3)) / 2;
        if (noise > 0.3) return 'forest';
        if (noise > 0) return 'plains';
        if (noise > -0.2) return 'hills';
        return 'mountain';
    }

    getTerrainColor(terrain) {
        const colors = {
            'plains': '#7a9d5a',
            'forest': '#2d5a2d',
            'hills': '#6b8e4a',
            'mountain': '#5a5a6b',
            'river': '#4da6ff',
            'coastal': '#66ccff',
            'island': '#ffcc99'
        };
        return colors[terrain] || '#666';
    }

    claimTerritory(x, y, empire) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.grid[y][x].owner = empire.name;
            this.grid[y][x].empireColor = empire.color;
            this.grid[y][x].isControlled = true;
            return true;
        }
        return false;
    }

    expandTerritory(startX, startY, empireColor, empireName, range = 3) {
        // Expand territory in radius around starting position
        let expanded = 0;
        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                const x = startX + dx;
                const y = startY + dy;
                if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist <= range && !this.grid[y][x].isControlled) {
                        this.grid[y][x].owner = empireName;
                        this.grid[y][x].empireColor = empireColor;
                        this.grid[y][x].isControlled = true;
                        expanded++;
                    }
                }
            }
        }
        return expanded;
    }

    getCellAtPosition(x, y) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            return this.grid[y][x];
        }
        return null;
    }

    addUnits(x, y, count) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.grid[y][x].units += count;
            return true;
        }
        return false;
    }

    removeUnits(x, y, count) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.grid[y][x].units = Math.max(0, this.grid[y][x].units - count);
            return true;
        }
        return false;
    }
}

// ========================
// Unit and Combat System
// ========================

class Unit {
    constructor(type = 'infantry') {
        this.type = type;
        this.health = this.getMaxHealth();
        this.attack = this.getAttackPower();
        this.defense = this.getDefense();
        this.cost = this.getCost();
        this.productionTime = this.getProductionTime();
    }

    getMaxHealth() {
        const stats = { infantry: 100, cavalry: 80, archer: 60, tank: 150 };
        return stats[this.type] || 100;
    }

    getAttackPower() {
        const stats = { infantry: 15, cavalry: 20, archer: 12, tank: 25 };
        return stats[this.type] || 10;
    }

    getDefense() {
        const stats = { infantry: 10, cavalry: 8, archer: 5, tank: 20 };
        return stats[this.type] || 5;
    }

    getCost() {
        const costs = {
            infantry: { Metal: 50, Wood: 30 },
            cavalry: { Metal: 100, Wood: 50 },
            archer: { Metal: 40, Wood: 60 },
            tank: { Metal: 200, Stone: 100 }
        };
        return costs[this.type] || { Metal: 50, Wood: 30 };
    }

    getProductionTime() {
        const times = { infantry: 5, cavalry: 8, archer: 6, tank: 15 };
        return times[this.type] || 5;
    }
}

class CombatSystem {
    static calculateBattle(attackingUnits, defendingUnits) {
        let attackPower = attackingUnits * 15; // Base unit damage
        let defensePower = defendingUnits * 10; // Base unit defense

        // Random variation
        attackPower *= (0.8 + Math.random() * 0.4);
        defensePower *= (0.8 + Math.random() * 0.4);

        const attackerLosses = Math.ceil((defensePower / (attackPower + defensePower)) * attackingUnits);
        const defenderLosses = Math.ceil((attackPower / (attackPower + defensePower)) * defendingUnits);

        const attackerWins = attackerLosses < attackingUnits * 0.5;

        return {
            attackerLosses,
            defenderLosses,
            attackerWins,
            attackPower: attackPower.toFixed(0),
            defensePower: defensePower.toFixed(0)
        };
    }
}
