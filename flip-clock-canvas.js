/**
 * Canvas翻页时钟 - 简洁版
 * 分秒翻页，毫秒快速变化
 */

class FlipClock {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas #${canvasId} not found`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.options = {
            width: 800,
            height: 800,
            fontSize: 700,
            fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif',
            textColor: '#ffffff',
            animationDuration: 600,
            isFast: false, // 毫秒快速变化模式
            ...options
        };

        this.currentValue = '00';
        this.nextValue = '00';
        this.isFlipping = false;
        this.flipStartTime = 0;

        this.initCanvas();
    }

    initCanvas() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.options.width * dpr;
        this.canvas.height = this.options.height * dpr;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        this.ctx.scale(dpr, dpr);

        // 坐标系：原点移到左侧中心
        this.ctx.translate(0, this.options.height / 2);
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `bold ${this.options.fontSize}px ${this.options.fontFamily}`;

        this.renderStatic(this.currentValue);
    }

    /**
     * 绘制圆角矩形裁剪区域（上半部分或下半部分）
     */
    drawHalfClip(isTop) {
        const ctx = this.ctx;
        const w = this.options.width;
        const h = this.options.height / 2;
        const r = 80; // 圆角半径

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w, 0);

        if (isTop) {
            // 上半部分
            ctx.lineTo(w, h - r);
            ctx.quadraticCurveTo(w, 0, w - r, 0);
            ctx.lineTo(r, 0);
            ctx.quadraticCurveTo(0, 0, 0, h - r);
        } else {
            // 下半部分
            ctx.lineTo(w, r);
            ctx.quadraticCurveTo(w, h, w - r, h);
            ctx.lineTo(r, h);
            ctx.quadraticCurveTo(0, h, 0, r);
        }

        ctx.clip();
    }

    /**
     * 清除画布
     */
    clearCanvas() {
        this.ctx.clearRect(
            -100,
            -this.options.height / 2,
            this.options.width + 200,
            this.options.height
        );
    }

    /**
     * 绘制文字
     */
    drawText(text) {
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.fillText(text, this.options.width / 2, 0);
    }

    /**
     * 绘制分割线（中间的灰色线条）
     */
    drawDivider() {
        const dividerHeight = 3;
        this.ctx.fillStyle = '#444444';
        this.ctx.fillRect(
            0,
            -dividerHeight / 2,
            this.options.width,
            dividerHeight
        );
    }

    /**
     * 渲染静态数字（无动画）
     */
    renderStatic(value) {
        // 上半部分
        this.ctx.save();
        this.drawHalfClip(true);
        this.clearCanvas();
        this.drawText(value);
        this.drawDivider();
        this.ctx.restore();

        // 下半部分
        this.ctx.save();
        this.drawHalfClip(false);
        this.clearCanvas();
        this.drawText(value);
        this.drawDivider();
        this.ctx.restore();

        this.currentValue = value;
    }

    /**
     * 缓动函数
     */
    easeInOut(time, start, change, duration) {
        time /= duration / 2;
        if (time < 1) {
            return change / 2 * time * time + start;
        }
        time--;
        return -change / 2 * (time * (time - 2) - 1) + start;
    }

    /**
     * 执行翻页动画
     */
    flipTo(newValue, callback) {
        if (this.isFlipping || newValue === this.currentValue) {
            return;
        }

        this.isFlipping = true;
        this.nextValue = newValue;
        this.flipStartTime = performance.now();
        this.flipCallback = callback;

        requestAnimationFrame(this.animateFlip.bind(this));
    }

    /**
     * 翻页动画帧
     */
    animateFlip(currentTime) {
        const elapsed = currentTime - this.flipStartTime;
        const duration = this.options.animationDuration;

        if (elapsed >= duration) {
            this.isFlipping = false;
            this.renderStatic(this.nextValue);

            if (this.flipCallback) {
                this.flipCallback();
            }
            return;
        }

        // 计算翻转角度（-90度 到 90度）
        const angle = this.easeInOut(elapsed, -90, 180, duration);
        const radians = angle * Math.PI / 180;
        const scaleY = Math.sin(radians);

        // 第一阶段：上半部分翻转
        if (elapsed < duration / 2) {
            // 后层（显示新数字）
            this.ctx.save();
            this.drawHalfClip(true);
            this.clearCanvas();
            this.drawText(this.nextValue);
            this.drawDivider();
            this.ctx.restore();

            // 前层（显示旧数字，正在翻转）
            this.ctx.save();
            this.ctx.scale(1, scaleY);
            this.drawHalfClip(true);
            this.clearCanvas();
            this.drawText(this.currentValue);
            this.drawDivider();
            this.ctx.restore();
        }
        // 第二阶段：下半部分翻转
        else {
            // 后层（显示旧数字）
            this.ctx.save();
            this.drawHalfClip(false);
            this.clearCanvas();
            this.drawText(this.currentValue);
            this.drawDivider();
            this.ctx.restore();

            // 前层（显示新数字，正在翻转）
            this.ctx.save();
            this.ctx.scale(1, scaleY);
            this.drawHalfClip(false);
            this.clearCanvas();
            this.drawText(this.nextValue);
            this.drawDivider();
            this.ctx.restore();
        }

        requestAnimationFrame(this.animateFlip.bind(this));
    }

    /**
     * 更新值（带动画）
     */
    update(newValue) {
        const paddedValue = newValue.toString().padStart(2, '0');
        this.flipTo(paddedValue);
    }

    /**
     * 立即设置值（无动画，用于毫秒快速变化）
     */
    setValue(newValue) {
        const paddedValue = newValue.toString().padStart(2, '0');
        this.renderStatic(paddedValue);
    }

    /**
     * 调整大小
     */
    resize() {
        this.initCanvas();
        this.renderStatic(this.currentValue);
    }
}

// 导出到全局
window.FlipClock = FlipClock;
