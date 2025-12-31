# 🎊 2026 新年倒计时 | Happy New Year 2026 Countdown

> 精确到毫秒的跨年倒计时页面，科技感与温柔风的完美融合

![2026 New Year Countdown](https://img.shields.io/badge/Year-2026-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 特性

- ⏱️ **毫秒级精度** - 使用 `requestAnimationFrame` 实现60fps流畅更新
- 🎨 **科技感+温柔风** - 渐变色、粒子效果、发光文字
- 📱 **完全响应式** - 完美适配桌面、平板、手机
- ⚡ **轻量高效** - 纯原生实现，无任何依赖
- 🚀 **部署简单** - 支持Cloudflare Pages一键部署
- 🎉 **新年特效** - 跨年时刻自动触发庆祝动画

## 🎯 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 现代动画、渐变、backdrop-filter
- **JavaScript (ES6+)** - requestAnimationFrame、模块化代码

## 📦 部署方式

### 方式一：Cloudflare Pages（推荐）

1. **Fork或克隆此仓库**
   ```bash
   git clone https://github.com/your-username/happy-new-year-2026.git
   cd happy-new-year-2026
   ```

2. **推送代码到GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/happy-new-year-2026.git
   git push -u origin main
   ```

3. **在Cloudflare Pages部署**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
   - 选择你的GitHub仓库
   - 构建设置：
     - **Build command**: 留空（无需构建）
     - **Build output directory**: `/`（根目录）
   - 点击 **Save and Deploy**

4. **访问你的网站**
   - 部署成功后，Cloudflare会提供一个 `*.pages.dev` 域名
   - 可以在设置中绑定自定义域名

### 方式二：GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选择 **main**，文件夹选择 **/ (root)**
4. 点击 **Save**
5. 访问 `https://your-username.github.io/happy-new-year-2026/`

### 方式三：静态服务器

```bash
# 使用Python快速预览
python -m http.server 8000

# 或使用Node.js的npx
npx serve .

# 访问 http://localhost:8000
```

## 🎨 自定义配置

### 修改目标年份

编辑 [countdown.js](countdown.js#L3) 文件：

```javascript
// 修改为目标日期
const TARGET_DATE = new Date('2027-01-01T00:00:00').getTime();
const START_DATE = new Date('2026-01-01T00:00:00').getTime();
```

### 修改颜色主题

编辑 [style.css](style.css#L9) 文件中的CSS变量：

```css
:root {
    --bg-gradient-start: #1a1a2e;    /* 背景渐变起始色 */
    --accent-glow: #e94560;          /* 主强调色 */
    --accent-cyan: #00d9ff;          /* 科技感青色 */
    /* ... 更多变量 */
}
```

### 修改祝福语

编辑 [index.html](index.html#L59) 或在 [countdown.js](countdown.js#L88) 中修改：

```javascript
elements.message.innerHTML = `
    <p class="message-text">你的祝福语</p>
    <p class="message-text-sub">副标题</p>
`;
```

## 📂 项目结构

```
HappyNewYear2026/
├── index.html          # 主HTML文件
├── style.css           # 样式文件（科技感+温柔风）
├── countdown.js        # 倒计时逻辑（毫秒级精度）
├── README.md           # 说明文档
├── .gitignore          # Git忽略文件
└── demo.txt            # 示例文件
```

## 🚀 性能优化

- ✅ 使用 `requestAnimationFrame` 确保60fps流畅度
- ✅ CSS动画使用 `transform` 和 `opacity`，触发GPU加速
- ✅ 粒子效果复用DOM元素，避免内存泄漏
- ✅ 页面隐藏时自动降频，节省资源

## 🌐 浏览器兼容性

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |

## 📱 响应式断点

- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: ≤ 480px

## 💡 技术亮点

### 毫秒级精度实现

使用 `requestAnimationFrame` 替代 `setInterval`，确保：
- 与屏幕刷新率同步（通常60fps）
- 页面在后台时自动暂停，节省资源
- 更流畅的动画效果

### 科技感设计元素

- **渐变背景**: 深蓝紫色调营造科技氛围
- **发光效果**: `text-shadow` 和 `box-shadow` 实现霓虹效果
- **粒子动画**: 浮动的青色粒子增加层次感
- **玻璃拟态**: `backdrop-filter: blur()` 实现毛玻璃效果

### 温柔风设计元素

- **柔和色彩**: 粉红色调平衡科技感
- **优雅动画**: 缓动函数让过渡更自然
- **温暖文案**: "愿2025年的温柔，延续到2026年"

## 🎄 使用场景

- 🎉 新年倒计时活动
- 🎊 跨年晚会背景屏幕
- 💻 网站节日装饰页面
- 📱 个人主页节日特效
- 🏢 公司大屏展示

## 📝 License

[MIT License](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 💖 致谢

- 感谢所有为开源社区做出贡献的开发者
- 愿科技向善，人间值得

---

<div align="center">

**Made with ❤️ for a better tomorrow**

**愿2026年，所愿皆成真**

</div>
