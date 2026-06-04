// ========================
// UI Management
// ========================

class UIManager {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Game control buttons
        const pauseBtn = document.getElementById('pause-btn');
        const menuBtn = document.getElementById('menu-btn');
        const speedSlider = document.getElementById('speed-slider');

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.onPauseClick());
        }
        
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.onMenuClick());
        }
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => this.onSpeedChange(e));
        }

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    }

    onPauseClick() {
        console.log('Pause button clicked');
    }

    onMenuClick() {
        console.log('Menu button clicked');
    }

    onSpeedChange(event) {
        const speed = parseFloat(event.target.value);
        console.log(`Game speed changed to ${speed}x`);
    }

    // Show notification to player
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'error' ? '#c0392b' : '#16a085'};
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 2000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Format large numbers
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num);
    }
}

// Initialize UI Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});