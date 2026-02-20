
// 初始化粒子效果
// 确保 DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('COba1tCanvas');
    if (!canvas) {
        console.error('Canvas element #COba1tCanvas not found!');
        return;
    }

    // 调整 canvas 尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 计算垂直居中位置 (对齐标尺)
    // 标尺中心 Y = 75px + (window.innerHeight - 75px) / 2
    // 粒子高度估算: w(400) * spacing(1.5) ≈ 600px (假设正方形)
    // renderY = center - height/2
    const headerHeight = 75;
    const rulerCenterY = headerHeight + (window.innerHeight - headerHeight) / 2;
    const estimatedParticleHeight = 400 * 1.5; // w * spacing
    let renderY = rulerCenterY - estimatedParticleHeight / 2;

    // 初始化粒子对象
    // 这里的配置对应 "把粒子效果放到左侧200px距顶300px的位置" -> 后续调整为左移和居中
    const particleDemo = new DameDaneParticle(canvas, {
        src: 'assets/C0ba1t.jpg', // 图片路径
        renderX: 60,             // 左侧 60px (之前调整过)
        renderY: renderY+50,        // 动态计算的垂直居中位置
        w: 400,                   // 渲染宽度
        size: 1.2,                // 粒子大小
        spacing: 1.5,             // 粒子间距
        gap: 3,                   // 采样间隔
        validColor: {
            min: 200,
            max: 765,
            invert: false
        },
        effectParticleMode: 'repulsion', // 排斥模式
        Thickness: 50,            // 厚度/连接感
        Drag: 0.95,
        Ease: 0.1
    });

    // 窗口大小改变时重置 (canvasClass 内部已有处理，但这里可以额外做一些调整 if needed)
    // 注意：canvasClass.js 内部监听了 resize 事件并重置了 canvas 尺寸和粒子
    // 我们需要更新 renderY 以保持居中
    window.addEventListener('resize', () => {
        const newRulerCenterY = headerHeight + (window.innerHeight - headerHeight) / 2;
        // 更新 options 中的 renderY，这样 DameDaneParticle 内部的 resize 逻辑（如果使用 options）就会用到新值
        // 但根据 canvasClass 代码，它是在 resize 时调用 _InitParticle，而 _InitParticle 使用 this.options.renderY
        // 所以我们修改 particleDemo.options.renderY 应该是有效的
        if (particleDemo && particleDemo.options) {
            particleDemo.options.renderY = newRulerCenterY - estimatedParticleHeight / 2;
        }
    });
});
