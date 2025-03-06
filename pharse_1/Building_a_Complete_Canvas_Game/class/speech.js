export class Speech {
    constructor() {
        this.image = new Image();
        this.image.src = 'img/speech.png';
    }

    draw(ctx, x, y) {
        ctx.drawImage(this.image, x, y, 40, 40);
    }

    applyEffect(player, game) {
        const originalPipeSpeed = game.levelManager.getCurrentConfig().pipeSpeed;
        game.levelManager.getCurrentConfig().pipeSpeed *= 5;

        // Lưu trạng thái va chạm hiện tại
        game.isSpeechActive = true;
        game.speechEffectStartTime = Date.now();

        setTimeout(() => {
            game.levelManager.getCurrentConfig().pipeSpeed = originalPipeSpeed;
            game.isSpeechActive = false;
        }, 3000);
    }
} 