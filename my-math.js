/**
 * 数学工具库 - 提取自 Firework_Simulator
 * Copyright © 2022 NianBroken
 */

const MyMath = {
    /**
     * 生成范围内的随机数
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * 随机选择数组元素
     */
    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * 限制数值在范围内
     */
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    },

    /**
     * 计算两点距离
     */
    pointDist(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * 计算两点角度
     */
    pointAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },

    /**
     * 文字点阵生成（简化版，仅支持英文）
     * 用于文字烟花效果
     */
    literalLattice(text, density, fontFamily, fontSize) {
        // 创建离屏 canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${fontSize} ${fontFamily}`;

        // 测量文字
        const metrics = ctx.measureText(text);
        const width = Math.ceil(metrics.width);
        const height = Math.ceil(fontSize * 1.5);

        canvas.width = width;
        canvas.height = height;

        // 绘制文字
        ctx.font = `${fontSize} ${fontFamily}`;
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(text, 0, 0);

        // 获取像素数据
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const points = [];

        // 采样像素
        for (let y = 0; y < height; y += density) {
            for (let x = 0; x < width; x += density) {
                const i = (y * width + x) * 4;
                if (data[i + 3] > 128) { // Alpha > 128
                    points.push({ x, y });
                }
            }
        }

        return {
            points: points,
            width: width,
            height: height
        };
    }
};

// 导出到全局
window.MyMath = MyMath;
