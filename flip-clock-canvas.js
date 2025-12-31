/**
 * Canvas翻页时钟实现
 * 参考 flipflow.neverup.cn 的 Canvas 实现方式
 */

class CanvasFlipClock {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas element #${canvasId} not found`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.options = {
            width: 800,
            height: 800,
            fontSize: 660,
            fontFamily: 'Arial Black, Arial, sans-serif',
            cornerRadius: 64,
            bgColorTop: '#161616',
            bgColorBottom: '#0c0c0c',
            textColor: '#bcbcbc',
            ampmColor: '#bbbbbb',
            showBackground: true,
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
        // 设置Canvas尺寸（考虑DPI）
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.options.width * dpr;
        this.canvas.height = this.options.height * dpr;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';

        this.ctx.scale(dpr, dpr);

        // 初始化坐标系：将原点移到左侧中心
        this.ctx.translate(0, this.options.height / 2);
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `normal bold ${this.options.fontSize}px ${this.options.fontFamily}`;

        this.renderStatic(this.currentValue);
    }

    /**
     * 绘制圆角矩形裁剪区域（上半部分或下半部分）
     */
    drawHalfClip(isTop) {
        const ctx = this.ctx;
        const w = this.options.width;
        const h = this.options.height / 2;
        const r = this.options.cornerRadius;

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
     * 创建渐变背景
     */
    createBackgroundGradient() {
        const gradient = this.ctx.createLinearGradient(
            0, -this.options.height / 2,
            0, this.options.height / 2
        );
        gradient.addColorStop(0, this.options.bgColorTop);
        gradient.addColorStop(1, this.options.bgColorBottom);
        return gradient;
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
     * 绘制背景
     */
    drawBackground() {
        if (!this.options.showBackground) {
            this.clearCanvas();
            return;
        }

        this.ctx.fillStyle = this.createBackgroundGradient();
        this.ctx.fillRect(
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
        const dividerHeight = 2;
        this.ctx.fillStyle = '#000000';
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
        this.ctx.save();
        this.drawHalfClip(true);
        this.drawBackground();
        this.drawText(value);
        this.drawDivider();
        this.ctx.restore();

        this.ctx.save();
        this.drawHalfClip(false);
        this.drawBackground();
        this.drawText(value);
        this.drawDivider();
        this.ctx.restore();

        this.currentValue = value;
    }

    /**
     * 缓动函数：ease-in-out
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
            // 动画结束
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
            this.drawBackground();
            this.drawText(this.nextValue);
            this.drawDivider();
            this.ctx.restore();

            // 前层（显示旧数字，正在翻转）
            this.ctx.save();
            this.ctx.scale(1, scaleY);
            this.drawHalfClip(true);
            this.drawBackground();
            this.drawText(this.currentValue);
            this.drawDivider();
            this.ctx.restore();
        }
        // 第二阶段：下半部分翻转
        else {
            // 后层（显示旧数字）
            this.ctx.save();
            this.drawHalfClip(false);
            this.drawBackground();
            this.drawText(this.currentValue);
            this.drawDivider();
            this.ctx.restore();

            // 前层（显示新数字，正在翻转）
            this.ctx.save();
            this.ctx.scale(1, scaleY);
            this.drawHalfClip(false);
            this.drawBackground();
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
        // 补零
        const paddedValue = newValue.toString().padStart(2, '0');
        this.flipTo(paddedValue);
    }

    /**
     * 立即设置值（无动画）
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

/**
 * 倒计时控制器
 */
class CountdownController {
    constructor(options = {}) {
        this.options = {
            targetDate: new Date('2026-01-01T00:00:00'),
            onTick: null,
            onComplete: null,
            ...options
        };

        this.hours = null;
        this.minutes = null;
        this.seconds = null;
        this.milliseconds = null;
        this.isRunning = false;
        this.animationFrame = null;
    }

    /**
     * 初始化时钟组件
     */
    initClocks() {
        this.hours = new CanvasFlipClock('canvas-hours', {
            fontSize: 660,
            showBackground: true
        });
        this.minutes = new CanvasFlipClock('canvas-minutes', {
            fontSize: 660,
            showBackground: true
        });
        this.seconds = new CanvasFlipClock('canvas-seconds', {
            fontSize: 660,
            showBackground: true
        });
        this.milliseconds = new CanvasFlipClock('canvas-milliseconds', {
            fontSize: 660,
            showBackground: true
        });
    }

    /**
     * 计算剩余时间
     */
    calculateRemaining() {
        const now = new Date().getTime();
        const target = this.options.targetDate.getTime();
        const diff = target - now;

        if (diff <= 0) {
            return {
                total: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            };
        }

        return {
            total: diff,
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
            milliseconds: diff % 1000
        };
    }

    /**
     * 更新显示
     */
    updateDisplay(time) {
        if (this.hours) {
            this.hours.update(time.hours);
        }
        if (this.minutes) {
            this.minutes.update(time.minutes);
        }
        if (this.seconds) {
            this.seconds.update(time.seconds);
        }
        if (this.milliseconds) {
            // 毫秒不需要翻页动画，直接设置
            this.milliseconds.setValue(
                Math.floor(time.milliseconds / 10).toString().padStart(2, '0')
            );
        }

        if (this.options.onTick) {
            this.options.onTick(time);
        }
    }

    /**
     * 启动倒计时
     */
    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.initClocks();

        const tick = () => {
            if (!this.isRunning) {
                return;
            }

            const time = this.calculateRemaining();

            if (time.total <= 0) {
                this.stop();
                this.updateDisplay(time);

                if (this.options.onComplete) {
                    this.options.onComplete();
                }
                return;
            }

            this.updateDisplay(time);
            this.animationFrame = requestAnimationFrame(tick);
        };

        tick();
    }

    /**
     * 停止倒计时
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * 重置倒计时
     */
    reset() {
        this.stop();
        if (this.hours) this.hours.setValue('00');
        if (this.minutes) this.minutes.setValue('00');
        if (this.seconds) this.seconds.setValue('00');
        if (this.milliseconds) this.milliseconds.setValue('00');
    }
}

// 导出到全局
window.CanvasFlipClock = CanvasFlipClock;
window.CountdownController = CountdownController;
