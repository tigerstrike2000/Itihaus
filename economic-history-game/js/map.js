// ========================
// Map and Grid System
// ========================

class MapSystem {
    constructor(game) {
        this.game = game;
        this.gridSize = 12; // 12x12 grid
        this.cellSize = 0; // Set in init
        this.worldLocations = {};
        this.initializeWorldLocations();
        this.camera = { x: 0, y: 0 };
    }

    initializeWorldLocations() {
        // Different starting positions for each civilization (economy-focused)
        this.worldLocations = {
            'Egypt': {
                name: 'Nile Delta',
                position: { x: 3, y: 5 },
                terrain: 'river',
                bonusResources: { Food: 500 },
                description: 'Fertile lands of the Nile'
            },
            'Rome': {
                name: 'Mediterranean Coast',
                position: { x: 8, y: 4 },
                terrain: 'coastal',
                bonusResources: { Metal: 300, Luxury: 200 },
                description: 'Strategic trading hub'
            },
            'Persia': {
                name: 'Silk Road Junction',
                position: { x: 6, y: 3 },
                terrain: 'plains',
                bonusResources: { Wood: 400, Metal: 200 },
                description: 'Center of trade routes'
            },
            'Greece': {
                name: 'Aegean Islands',
                position: { x: 9, y: 6 },
                terrain: 'island',
                bonusResources: { Luxury: 400, Stone: 250 },
                description: 'Cradle of philosophy and trade'
            },
            'Mesopotamia': {
                name: 'Twin Rivers Valley',
                position: { x: 2, y: 2 },
                terrain: 'river',
                bonusResources: { Food: 400, Stone: 300 },
                description: 'Birthplace of civilization'
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
                    building: null,
                    owner: null
                };
            }
        }
    }

    getTerrainType(x, y) {
        // Simple terrain generation
        const noise = (Math.sin(x * 0.5) + Math.cos(y * 0.5)) / 2;
        if (noise > 0.3) return 'fertile';
        if (noise > 0) return 'plains';
        if (noise > -0.3) return 'forest';
        return 'rocky';
    }

    getTerrainColor(terrain) {
        const colors = {
            'fertile': '#3d7d3d',
            'plains': '#8b9d6f',
            'forest': '#2d5a2d',
            'rocky': '#7a7a7a',
            'river': '#4da6ff',
            'coastal': '#66ccff',
            'island': '#ffcc99'
        };
        return colors[terrain] || '#666';
    }

    placeBuilding(x, y, building, civilizationName) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.grid[y][x].building = building;
            this.grid[y][x].owner = civilizationName;
            return true;
        }
        return false;
    }

    removeBuilding(x, y) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.grid[y][x].building = null;
            return true;
        }
        return false;
    }

    getCellAtPosition(x, y) {
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            return this.grid[y][x];
        }
        return null;
    }

    getBuildingColor(building) {
        const colors = {
            'Farm': '#90EE90',
            'Lumber Mill': '#8B4513',
            'Quarry': '#A9A9A9',
            'Mine': '#696969',
            'Market': '#FFD700',
            'Granary': '#DAA520',
            'Library': '#4169E1',
            'Temple': '#FF69B4'
        };
        return colors[building.type] || '#ccc';
    }
}

// ========================
// Building Construction System
// ========================

class Building {
    constructor(type, x, y, costs) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.costs = costs; // Resources needed to build
        this.constructionTime = this.getConstructionTime(type);
        this.constructionProgress = 0; // 0 to 1
        this.isComplete = false;
        this.productionRate = 0;
        this.workers = 0;
        this.maxWorkers = 10;
    }

    getConstructionTime(buildingType) {
        const times = {
            'Farm': 10, // seconds
            'Granary': 20,
            'Market': 15,
            'Library': 30,
            'Lumber Mill': 12,
            'Quarry': 15,
            'Mine': 25,
            'Temple': 40
        };
        return times[buildingType] || 15;
    }

    updateConstruction(deltaTime) {
        if (!this.isComplete) {
            this.constructionProgress += deltaTime / this.constructionTime;
            if (this.constructionProgress >= 1) {
                this.constructionProgress = 1;
                this.isComplete = true;
                return true; // Completed
            }
        }
        return false;
    }

    getProgressPercentage() {
        return Math.floor(this.constructionProgress * 100);
    }

    canProduce() {
        return this.isComplete && this.workers > 0;
    }
}
