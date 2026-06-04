# Economic History Game - Development Guide

## Overview

The Economic History Game is an educational, real-time strategy game where high school students manage ancient empires through economics, trading, and resource management.

## Features Implemented

✅ **Civilization Selection** - 5 unique ancient civilizations with bonuses
✅ **Real-time Gameplay** - Smooth game loop with variable speed (0.5x - 3x)
✅ **Resource Management** - Food, Wood, Stone, Metal, Luxury Goods
✅ **Production System** - Buildings with worker assignment
✅ **Market Economics** - Dynamic pricing based on supply/demand
✅ **Empire Stats** - Population, Treasury, Happiness tracking
✅ **UI Dashboard** - Real-time resource and market displays
✅ **Trading System** - Buy/Sell resources at market prices

## File Structure

```
economic-history-game/
├── index.html                 # Main HTML file
├── README.md                  # Game documentation
├── DEVELOPMENT.md             # This file
├── css/
│   └── style.css              # Complete styling (600+ lines)
└── js/
    ├── game.js                # Main game loop and logic
    ├── economy.js             # Market and pricing system
    ├── resources.js           # Empire and resource management
    └── ui.js                  # UI utilities
```

## How to Run

1. Open `index.html` in a modern web browser
2. Select a civilization from the menu
3. Manage your empire in real-time

## Game Mechanics

### Civilizations
- **Egypt** - Agricultural efficiency +20%
- **Rome** - Trading bonus +25%
- **Persia** - Happiness bonus +15%
- **Greece** - Research bonus +30% (placeholder)
- **Mesopotamia** - Commerce bonus +20%

### Resources
- **Food** - Sustains population, decays if insufficient
- **Wood** - Building material, production-based
- **Stone** - Construction resource, mining-based
- **Metal** - Advanced tools, mining-based
- **Luxury** - Trade value, happiness improvement

### Economy System
- **Dynamic Pricing** - Based on supply/demand ratio
- **Price Volatility** - Each resource has natural price fluctuation
- **Market Simulation** - Demand fluctuates over time
- **Trade Routes** - Trading post for buying/selling

### Population & Happiness
- **Food Consumption** - Population needs food to survive
- **Growth Rate** - Based on happiness and food availability
- **Starvation Risk** - Low food leads to population decline
- **Happiness Drivers** - Food security, luxury goods, stability

### Production
- **Worker Assignment** - Allocate workers to 5 building types
- **Efficiency** - More workers = more production
- **Building Types**:
  - Farm: Food production
  - Lumber Mill: Wood production
  - Quarry: Stone production
  - Mine: Metal production
  - Market: Luxury goods production

## Technical Details

### Game Loop
- Uses `requestAnimationFrame` for 60 FPS target
- Delta time calculation for frame-rate independent updates
- Game speed multiplier (0.5x to 3x)

### State Management
- Global `window.game` instance
- Empire object holds all state
- Economy object manages market
- ResourceManager handles production

### Rendering
- No canvas (uses DOM)
- Real-time UI updates every frame
- Responsive grid layout
- CSS animations for transitions

## Code Organization

### game.js (450+ lines)
- Main Game class and game loop
- Civilization selection
- Event handling
- Modal management for trading/building
- UI update logic

### economy.js (140+ lines)
- Economy class with market system
- Price calculations
- Supply/demand simulation
- Price history tracking

### resources.js (180+ lines)
- ResourceManager class for production
- Empire class with population dynamics
- Production calculation
- Building management

### ui.js (80+ lines)
- UIManager utilities
- Notification system
- Number formatting
- Display helpers

### style.css (600+ lines)
- Complete UI styling
- Dark theme
- Responsive design
- Modal styling
- Grid layouts

## Debugging Tips

1. **Check Console** - Browser DevTools console for errors
2. **Game Speed** - Adjust slider to see faster progression
3. **Resource Monitoring** - Watch resource panel for production rates
4. **Market Prices** - Monitor price changes to understand economy
5. **Population** - Track happiness and food for survival mechanics

## Future Enhancement Ideas

### Short Term
- [ ] Save/Load game state to localStorage
- [ ] Building construction (costs and time)
- [ ] Advanced trading (multi-resource trades)
- [ ] Tutorial/Help system
- [ ] Sound effects and ambient music

### Medium Term
- [ ] War/Conquest mechanics
- [ ] Diplomacy with other AI empires
- [ ] Technology tree/Research system
- [ ] Multiple game modes (scenario-based)
- [ ] Leaderboard/Statistics

### Long Term
- [ ] Multiplayer support
- [ ] Campaign with story elements
- [ ] Custom civilization creation
- [ ] Economic data visualization
- [ ] Mobile app version

## Integration Notes

To integrate into the main Itihaus website:
1. Extract game files into website folder
2. Reference `/economic-history-game/index.html` in iframe or main page
3. Update CSS variables if needed for brand consistency
4. Add navigation back to main site

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Requires ES6 JavaScript support

## Performance Notes

- Optimized for 1920x1080 and above
- Mobile responsive but best on desktop
- No external dependencies (vanilla JS)
- ~150KB total file size

## Educational Value

Students learn:
- Economic principles (supply/demand)
- Resource management
- Strategic decision-making
- Population dynamics
- Trade and commerce
- Empire building
- Historical context of ancient civilizations

---

**Version**: 1.0  
**Last Updated**: 2026-06-04  
**Status**: Alpha