/**
 * Canvas翻页时钟 - 简洁版
 * 分秒翻页，毫秒快速变化
 * 翻页动画完全可见
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
     * 绘制矩形裁剪区域（整个卡片）
     */
    drawCardClip() {
        const ctx = this.ctx;
        const w = this.options.width;
        const h = this.options.height;
        const r = 50; // 圆角半径

        ctx.beginPath();
        ctx.moveTo(r, -h/2);
        ctx.lineTo(w - r, -h/2);
        ctx.quadraticCurveTo(w, -h/2, w, -h/2 + r);
        ctx.lineTo(w, h/2 - r);
        ctx.quadraticCurveTo(w, h/2, w - r, h/2);
        ctx.lineTo(r, h/2);
        ctx.quadraticCurveTo(0, h/2, 0, h/2 - r);
        ctx.lineTo(0, -h/2 + r);
        ctx.quadraticCurveTo(0, -h/2, r, -h/2);
        ctx.closePath();
        ctx.clip();
    }

    /**
     * 绘制上半部分裁剪区域
     */
    drawTopClip() {
        const ctx = this.ctx;
        const w = this.options.width;
        const h = this.options.height;
        const r = 50;

        ctx.beginPath();
        ctx.moveTo(r, -h/2);
        ctx.lineTo(w - r, -h/2);
        ctx.quadraticCurveTo(w, -h/2, w, -h/2 + r);
        ctx.lineTo(w, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, -h/2 + r);
        ctx.quadraticCurveTo(0, -h/2, r, -h/2);
        ctx.closePath();
        ctx.clip();
    }

    /**
     * 绘制下半部分裁剪区域
     */
    drawBottomClip() {
        const ctx = this.ctx;
        const w = this.options.width;
        const h = this.options.height;
        const r = 50;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w, 0);
        ctx.lineTo(w, h/2 - r);
        ctx.quadraticCurveTo(w, h/2, w - r, h/2);
        ctx.lineTo(r, h/2);
        ctx.quadraticCurveTo(0, h/2, 0, h/2 - r);
        ctx.closePath();
        ctx.clip();
    }

    /**
     * 清除画布
     */
    clearCanvas() {
        this.ctx.clearRect(
            -100,
            -this.options.height / 2 - 50,
            this.options.width + 200,
            this.options.height + 100
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
     * 绘制卡片背景（带边框）
     */
    drawCardBackground() {
        const w = this.options.width;
        const h = this.options.height;
        const r = 50;

        // 绘制边框
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(r, -h/2);
        this.ctx.lineTo(w - r, -h/2);
        this.ctx.quadraticCurveTo(w, -h/2, w, -h/2 + r);
        this.ctx.lineTo(w, h/2 - r);
        this.ctx.quadraticCurveTo(w, h/2, w - r, h/2);
        this.ctx.lineTo(r, h/2);
        this.ctx.quadraticCurveTo(0, h/2, 0, h/2 - r);
        this.ctx.lineTo(0, -h/2 + r);
        this.ctx.quadraticCurveTo(0, -h/2, r, -h/2);
        this.ctx.stroke();
    }

    /**
     * 渲染静态数字（无动画）
     */
    renderStatic(value) {
        this.clearCanvas();

        // 绘制边框
        this.ctx.save();
        this.drawCardClip();
        this.drawCardBackground();
        this.ctx.restore();

        // 绘制上半部分文字
        this.ctx.save();
        this.drawTopClip();
        this.drawText(value);
        this.drawDivider();
        this.ctx.restore();

        // 绘制下半部分文字
        this.ctx.save();
        this.drawBottomClip();
        this.drawText(value);
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
     * 绘制阴影效果（模拟3D拖影）
     */
    drawShadow(scaleY, isTop) {
        const alpha = Math.abs(scaleY) * 0.3;
        const offset = isTop ? -10 : 10;

        this.ctx.save();
        this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.ctx.fillRect(offset, -this.options.height / 2, this.options.width, this.options.height);
        this.ctx.restore();
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

        this.clearCanvas();

        // 计算翻转角度（-90度 到 90度）
        const angle = this.easeInOut(elapsed, -90, 180, duration);
        const radians = angle * Math.PI / 180;
        const scaleY = Math.sin(radians);

        // 第一阶段：上半部分翻转
        if (elapsed < duration / 2) {
            // 后层（显示新数字）- 暗一点
            this.ctx.save();
            this.drawTopClip();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(-100, -this.options.height/2, this.options.width + 200, this.options.height/2);
            this.drawText(this.nextValue);
            this.drawDivider();
            this.ctx.restore();

            // 绘制阴影
            this.drawShadow(scaleY, true);

            // 前层（显示旧数字，正在翻转）- 完全可见
            this.ctx.save();
            this.ctx.translate(0, 0); // 围绕中线翻转
            this.ctx.scale(1, scaleY);
            this.drawTopClip();
            this.drawText(this.currentValue);
            this.drawDivider();
            this.ctx.restore();

            // 下半部分（保持旧数字）
            this.ctx.save();
            this.drawBottomClip();
            this.drawText(this.currentValue);
            this.ctx.restore();
        }
        // 第二阶段：下半部分翻转
        else {
            // 上半部分（显示新数字）
            this.ctx.save();
            this.drawTopClip();
            this.drawText(this.nextValue);
            this.drawDivider();
            this.ctx.restore();

            // 绘制阴影
            this.drawShadow(scaleY, false);

            // 后层（显示旧数字）- 暗一点
            this.ctx.save();
            this.drawBottomClip();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(-100, 0, this.options.width + 200, this.options.height/2);
            this.drawText(this.currentValue);
            this.ctx.restore();

            // 前层（显示新数字，正在翻转）- 完全可见
            this.ctx.save();
            this.ctx.translate(0, 0); // 围绕中线翻转
            this.ctx.scale(1, scaleY);
            this.drawBottomClip();
            this.drawText(this.nextValue);
            this.ctx.restore();
        }

        // 绘制边框（始终在最上层）
        this.ctx.save();
        this.drawCardClip();
        this.drawCardBackground();
        this.ctx.restore();

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
