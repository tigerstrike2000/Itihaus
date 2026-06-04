# Economic History Game

An interactive, real-time strategy game where players manage ancient empires based on real historical civilizations.

## Features

- **Real-time Gameplay**: Manage your empire in real-time
- **Multiple Civilizations**: Start as different ancient empires (Egypt, Rome, Persia, Greece, Mesopotamia)
- **Resource Management**: Manage Food, Wood, Stone, Metal, and Luxury Goods
- **Trading System**: Trade with other civilizations at fluctuating market prices
- **Dynamic Economy**: Supply and demand affects prices
- **Production System**: Assign workers to different buildings for resource production
- **Population Management**: Population grows based on happiness and food availability
- **Educational**: Learn about ancient economics and empire management

## Getting Started

1. Open `index.html` in your browser
2. Select your starting civilization
3. Begin managing your empire!

## Game Mechanics

### Civilizations
Each civilization has unique bonuses:
- **Egypt**: Agricultural efficiency +20% (more food production)
- **Rome**: Trading +25% (better trade prices)
- **Persia**: Diplomatic relations +15% (higher starting happiness)
- **Greece**: Research +30% (bonus for future tech system)
- **Mesopotamia**: Commerce +20% (trade benefits)

### Resources
- **Food**: Sustains population, required for survival
- **Wood**: Building material, used for construction
- **Stone**: Construction resource, used in major projects
- **Metal**: Advanced tools and weapons
- **Luxury Goods**: Improves happiness and trade value

### Production System
You start with 5 types of production buildings:
- **Farm**: Produces food (15 units/sec at full capacity)
- **Lumber Mill**: Produces wood (8 units/sec)
- **Quarry**: Produces stone (5 units/sec)
- **Mine**: Produces metal (3 units/sec)
- **Market**: Produces luxury goods (1 unit/sec)

Assign workers to each building to increase production. More workers = more resources.

### Economy
- Supply and demand affects prices
- Prices fluctuate over time creating trading opportunities
- Buy low, sell high to profit
- Trading post allows buying/selling resources for gold

### Population & Happiness
- Population consumes food continuously
- If food is low, population declines (starvation)
- Happiness affects population growth
- Luxury goods increase happiness
- Low happiness leads to population decline

## File Structure

```
economic-history-game/
├── index.html                 # Main game page
├── README.md                  # This file
├── DEVELOPMENT.md             # Developer guide
├── css/
│   └── style.css              # Complete game styling
└── js/
    ├── game.js                # Main game logic and loop
    ├── economy.js             # Market and economic system
    ├── resources.js           # Resource & empire management
    └── ui.js                  # UI utilities and helpers
```

## Controls

- **Pause Button**: Pause/resume the game
- **Speed Slider**: Adjust game speed (0.5x to 3x)
- **Trading Post**: Buy and sell resources
- **Build Structure**: Construct new buildings
- **Expand Territory**: Expand your empire (coming soon)

## Tips for Success

1. **Balance Resources**: Keep enough food for your population
2. **Diversify Production**: Don't put all workers in one building
3. **Watch Market Prices**: Buy resources when prices are low
4. **Manage Population**: Keep happiness high for population growth
5. **Strategic Trading**: Buy cheap resources and sell at higher prices
6. **Choose Your Civilization**: Pick bonuses that match your strategy

## Educational Value

Students learn about:
- **Economics**: Supply, demand, pricing, and markets
- **Strategic thinking**: Resource allocation and planning
- **Population dynamics**: How resources affect populations
- **Historical context**: Ancient civilizations and empires
- **Trading**: Buying low and selling high
- **Empire management**: Balancing multiple systems

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Requires ES6 JavaScript

## Performance

- Optimized for 1920x1080 and above
- Mobile responsive (best on desktop)
- No external dependencies
- ~150KB total

## Future Features

- ✅ **Completed**: Game engine, economy, production, UI
- 🔄 **In Development**: Save/load system, advanced building mechanics
- ⏳ **Planned**: Multiplayer, campaigns, additional civilizations, tech tree

## Development

The game is built with vanilla JavaScript, HTML, and CSS for maximum accessibility and compatibility.

See `DEVELOPMENT.md` for technical details and contribution guidelines.

---

**Version**: 1.0  
**Status**: Alpha  
**Last Updated**: June 2026