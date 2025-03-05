export class LevelManager {
    constructor(canvas, levelConfig, bg, swooshSound) {
        this.canvas = canvas;
        this.levelConfig = levelConfig;
        this.bg = bg;
        this.swooshSound = swooshSound;
        this.currentLevel = 1;
        this.isLevelTransition = false;
        this.levelTransitionStartTime = 0;
        this.showLevelUp = false;
        this.levelUpStartTime = 0;
        this.levelUpDuration = 1000;

        // Define background images for each level
        this.backgroundImages = [
            'img/background1.jpg',
            'img/background2.jpg',
            'img/background3.jpg',
            'img/background4.jpg',
            'img/background5.jpg'
        ];

        // Update background image when level changes
        if (this.currentLevel < this.backgroundImages.length) {
            this.bg.src = this.backgroundImages[this.currentLevel];
        }
    }

    getCurrentConfig() {
        return this.levelConfig[this.currentLevel];
    }

    checkLevelUp(score, timestamp) {
        if (this.currentLevel < 5) {
            const config = this.getCurrentConfig();
            if (score >= config.requiredScore && !this.showLevelUp && !this.isLevelTransition) {
                this.showLevelUp = true;
                this.levelUpStartTime = timestamp;
                this.levelTransitionStartTime = timestamp;
                this.isLevelTransition = true;
                this.swooshSound.play();
                return true;
            }
        }
        return false;
    }

    drawLevelUpMessage(ctx, timestamp) {
        if (!this.showLevelUp) return;
        const elapsedTime = timestamp - this.levelUpStartTime;

        if (elapsedTime > this.levelUpDuration) {
            this.showLevelUp = false;
            return;
        }

        const progress = elapsedTime / this.levelUpDuration;
        let alpha = 1;
        if (progress < 0.2) {
            alpha = progress / 0.2;
        } else if (progress > 0.8) {
            alpha = (1 - progress) / 0.2;
        }

        const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px Arial';
        ctx.strokeText(`Level ${this.currentLevel +1 }!`, 0, -20);
        ctx.fillText(`Level ${this.currentLevel + 1}!`, 0, -20);
        ctx.font = '24px Arial';
        ctx.strokeText('Get ready for increased difficulty!', 0, 20);
        ctx.fillText('Get ready for increased difficulty!', 0, 20);
        ctx.restore()
    }

    updateBackground() {
        if (this.currentLevel < this.backgroundImages.length) {
            this.bg.src = this.backgroundImages[this.currentLevel];
        }
    }
}