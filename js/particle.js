// 全局变量存储粒子实例，以便后续控制
let globalParticleInstance = null;
let particleTimeout = null;

// 与 intro 一致：基准 1528×732，粒子位置与尺寸按视口缩放
const PARTICLE_BASE_W = 1528;
const PARTICLE_BASE_H = 732;
const PARTICLE_RENDER_X_BASE = 28;
const PARTICLE_IMG_W_BASE = 400;
const HEADER_HEIGHT = 75;

/** 缩放上下限，避免极端视口下粒子过小或过大 */
const PARTICLE_SCALE_MIN = 0.22;
const PARTICLE_SCALE_MAX = 1.5;

/**
 * 粒子缩放系数：与 intro 的 updateIntroLayout 保持一致，用 min 等比缩放，
 * 使粒子与 1528×732 画布同比例，再限制在 [MIN, MAX] 内避免过小/过大。
 */
function getParticleScale() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const raw = Math.min(w / PARTICLE_BASE_W, h / PARTICLE_BASE_H);
    return Math.max(PARTICLE_SCALE_MIN, Math.min(PARTICLE_SCALE_MAX, raw));
}

/* 基准下粒子图中心 X（左缘 + 半宽），用于中心补偿 */
const PARTICLE_CENTER_X_BASE = PARTICLE_RENDER_X_BASE + PARTICLE_IMG_W_BASE / 2;
/** 相对内容区垂直中心的下移偏移：基准视口略多，大屏保持较小避免补偿过多 */
const PARTICLE_CENTER_Y_OFFSET_BASE = 50;   /* 基准 732 高度附近 */
const PARTICLE_CENTER_Y_OFFSET_LARGE = 38;  /* 1080p 等大屏 */

function getParticleRenderXY() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = getParticleScale();
    const centerX = PARTICLE_CENTER_X_BASE * (w / PARTICLE_BASE_W);
    const scaledImgW = PARTICLE_IMG_W_BASE * scale;
    const renderX = centerX - scaledImgW / 2;
    const contentCenterY = HEADER_HEIGHT + (h - HEADER_HEIGHT) / 2;
    const isNearBaseHeight = h <= PARTICLE_BASE_H + 80;
    const offsetY = isNearBaseHeight ? PARTICLE_CENTER_Y_OFFSET_BASE : PARTICLE_CENTER_Y_OFFSET_LARGE;
    const centerY = contentCenterY + offsetY;
    const scaledImgH = PARTICLE_IMG_W_BASE * 1.5 * scale;
    const renderY = centerY - scaledImgH / 2;
    return { renderX, renderY, scale };
}

window.startParticleEffect = function() {
    const canvas = document.getElementById('COba1tCanvas');
    if (!canvas) {
        console.error('Canvas element #COba1tCanvas not found!');
        return;
    }

    if (particleTimeout) {
        clearTimeout(particleTimeout);
        particleTimeout = null;
    }

    if (globalParticleInstance) {
        globalParticleInstance = null;
    }

    canvas.style.opacity = '0';
    canvas.style.display = 'block';
    canvas.style.transition = 'opacity 2s ease-in-out';
    setTimeout(() => { canvas.style.opacity = '1'; }, 100);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const { renderX, renderY, scale } = getParticleRenderXY();
    const imgW = Math.round(PARTICLE_IMG_W_BASE * scale);

    globalParticleInstance = new DameDaneParticle(canvas, {
        src: 'assets/C0ba1t.jpg',
        renderX,
        renderY,
        w: imgW,
        size: 1.2,
        spacing: 1.5,
        gap: 3,
        validColor: { min: 200, max: 765, invert: false },
        effectParticleMode: 'repulsion',
        Thickness: 40,
        Drag: 0.95,
        Ease: 0.1
    });

    const resizeHandler = () => {
        if (!globalParticleInstance) return;
        const { renderX: rx, renderY: ry } = getParticleRenderXY();
        globalParticleInstance.renderX = rx;
        globalParticleInstance.renderY = ry;
        globalParticleInstance.options.renderX = rx;
        globalParticleInstance.options.renderY = ry;
        if (typeof globalParticleInstance.$fit === 'function') {
            globalParticleInstance.$fit();
        }
    };
    window.addEventListener('resize', resizeHandler);
    document.addEventListener('fullscreenchange', resizeHandler);
    document.addEventListener('webkitfullscreenchange', resizeHandler);
};

// 新增：停止/隐藏粒子效果
window.stopParticleEffect = function(duration = 0.5, triggerDispersal = true) {
    const canvas = document.getElementById('COba1tCanvas');
    if (canvas) {
        // 1. 先触发粒子散开效果：从聚拢回到入场时的起始位置（与入场动画反向、区域一致）
        if (triggerDispersal && globalParticleInstance) {
            globalParticleInstance.ParticlePolymerize(false);
        }

        // 2. 稍微延迟一点点再开始淡出，让散开的动作先展示出来
        // 如果同时进行，有时候淡出太快或者渲染合并，导致看不清散开
        setTimeout(() => {
            canvas.style.transition = `opacity ${duration}s ease-out`;
            canvas.style.opacity = '0';
        }, 50); // 50ms 的微小延迟足够让散开动作开始渲染
        
        // 清除可能存在的旧计时器
        if (particleTimeout) {
            clearTimeout(particleTimeout);
        }

        // 等待淡出后隐藏，避免占用资源或阻挡点击
        // 总等待时间 = 延迟(50ms) + 动画时间(duration)
        particleTimeout = setTimeout(() => {
            canvas.style.display = 'none';
            canvas.style.zIndex = ''; // 恢复默认层级
            particleTimeout = null;

        }, duration * 1000 + 50);
    }
};
