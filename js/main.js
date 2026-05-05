// 动画计时器存储，用于清理
let introTimers = [];
window.isIntroAnimFinished = false; // 全局状态标记：Intro 动画是否完成

function clearIntroTimers() {
    introTimers.forEach(id => clearTimeout(id));
    introTimers = [];
}

// 打字机效果
function typeWriter(text, elementId, speed = 100, callback) {
    const element = document.querySelector(elementId);
    if (!element) return;
    
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            // 记录计时器ID
            const timerId = setTimeout(type, speed + Math.random() * 50);
            introTimers.push(timerId);
        } else {
            element.setAttribute('data-typed', 'true');
            if (callback) callback();
        }
    }
    
    type();
}

// 冻结 Introduction 动画（仅暂停，不清除内容）
// 用于页面切出时：先让文字/终端淡出，再由 navigation 稍后触发整块 section 切出
window.freezeIntroductionAnimation = function() {
    clearIntroTimers();
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        cursor.style.animation = 'none';
        cursor.style.opacity = '0';
    }
    // 文字与终端先淡出（约 0.3s），与后方 section 切出做先后顺序
    const contentFade = '0.3s';
    const introText = document.querySelector('.intro-text');
    if (introText) {
        introText.style.transition = `opacity ${contentFade} ease-out`;
        void introText.offsetWidth;
        introText.style.opacity = '0';
    }
    const cmd = document.querySelector('.prompt-cmd');
    if (cmd) {
        cmd.style.transition = `opacity ${contentFade} ease-out`;
        void cmd.offsetWidth;
        cmd.style.opacity = '0';
    }
}

// 停止 Introduction 动画（清理所有计时器并重置状态）
window.stopIntroductionAnimation = function() {
    clearIntroTimers();
    window.isIntroAnimFinished = false; // 重置状态
    
    // 立即隐藏文字和清空终端，防止切回时出现“先显示再重置”的闪烁
    const cmd = document.querySelector('.prompt-cmd');
    const introText = document.querySelector('.intro-text');
    
    if (cmd) {
        cmd.textContent = '';
        cmd.removeAttribute('data-typed');
        cmd.style.opacity = '1'; // 恢复透明度以便下次显示
    }
    
    if (introText) {
        // 移除 transition 以便立即隐藏
        introText.style.transition = 'none';
        introText.style.opacity = '0';
    }
}

// Introduction 页面动画逻辑
window.startIntroductionAnimation = function() {
    // 1. 先清理之前的动画，防止冲突
    clearIntroTimers();
    window.isIntroAnimFinished = false; // 重置状态

    // 2. 重置 UI 状态 (确保从头开始)
    const cmd = document.querySelector('.prompt-cmd');
    const cursor = document.querySelector('.cursor');
    const introText = document.querySelector('.intro-text');
    
    if (cmd) {
        cmd.textContent = '';
        cmd.removeAttribute('data-typed');
        cmd.style.opacity = '1';
    }
    if (cursor) {
        cursor.style.display = 'inline'; // 显示光标
        cursor.style.opacity = '1';
    }
    if (introText) {
        introText.style.opacity = '0'; // 隐藏介绍文字
    }

    // 3. 开始新的动画序列
    const t1 = setTimeout(() => {
        // 开始打字
        // 将速度从 100ms 改为 40ms，显著加快打字速度
        typeWriter('cat Introduction', '.prompt-cmd', 40, () => {
            // 打字完成后
            
            // 移除光标
            if (cursor) {
                cursor.style.display = 'none';
            }
            
            // 模拟回车后的延迟
            const t2 = setTimeout(() => {
                // 加载粒子特效
                if (window.startParticleEffect) {
                    window.startParticleEffect();
                }
                
                // 淡入介绍文字
                if (introText) {
                    // 添加过渡效果，确保与粒子淡入时间(2s)一致
                    introText.style.transition = 'opacity 2s ease-in-out';
                    // 强制重绘以确保 transition 生效
                    void introText.offsetWidth;
                    introText.style.opacity = '1';
                    
                    // 标记动画完成（2s 后）
                    const t3 = setTimeout(() => {
                        window.isIntroAnimFinished = true;
                    }, 2000);
                    introTimers.push(t3);
                }
                
            }, 300); // 300ms 延迟
            introTimers.push(t2);
        });
    }, 500); // 0.5秒后开始打字
    introTimers.push(t1);
}

// Members 页卡片头像后台预加载（进入 home 后即开始，切到 members 时已缓存）
function preloadMemberAvatars() {
    var circles = document.querySelectorAll('.member-avatar-circle');
    if (!circles.length) return;
    var urls = [];
    circles.forEach(function (el) {
        var bg = el.style && el.style.backgroundImage;
        if (!bg) return;
        var m = bg.match(/url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/);
        if (m && m[1]) urls.push(m[1]);
    });
    urls = urls.filter(function (u, i, a) { return a.indexOf(u) === i; });
    function doPreload() {
        urls.forEach(function (url) {
            var img = new Image();
            img.src = url;
        });
    }
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(doPreload, { timeout: 3000 });
    } else {
        setTimeout(doPreload, 500);
    }
}

/* 基准视口 1528×732，按实际视口等比缩放 */
const INTRO_BASE_W = 1528;
const INTRO_BASE_H = 732;

window.updateIntroLayout = function() {
    if (!document.body.classList.contains('page-intro')) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.min(w / INTRO_BASE_W, h / INTRO_BASE_H);
    const wrapper = document.querySelector('.intro-scale-wrapper');
    if (wrapper) {
        wrapper.style.transform = `scale(${scale})`;
    }
    /* 实时显示视口尺寸（调试用） */
    const debugEl = document.getElementById('intro-viewport-size');
    if (debugEl) {
        debugEl.textContent = `${w}×${h} (scale: ${scale.toFixed(3)})`;
    }
};

let _introViewportRaf = null;
function scheduleIntroViewportRefresh() {
    if (_introViewportRaf) return;
    _introViewportRaf = requestAnimationFrame(() => {
        _introViewportRaf = null;
        window.updateIntroLayout();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    preloadMemberAvatars();
    window.addEventListener('resize', scheduleIntroViewportRefresh);
    document.addEventListener('fullscreenchange', scheduleIntroViewportRefresh);
    document.addEventListener('webkitfullscreenchange', scheduleIntroViewportRefresh);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleIntroViewportRefresh);
        window.visualViewport.addEventListener('scroll', scheduleIntroViewportRefresh);
    }
    /* ResizeObserver：监听实际尺寸变化，F11 等场景比 resize 更可靠 */
    const app = document.getElementById('app-container');
    if (app && typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(scheduleIntroViewportRefresh).observe(app);
    }
    /* 兜底：F11 有时不触发任何事件，轮询检测视口变化 */
    let _lastW = 0, _lastH = 0;
    setInterval(() => {
        if (!document.body.classList.contains('page-intro')) return;
        const w = window.innerWidth, h = window.innerHeight;
        if (w !== _lastW || h !== _lastH) {
            _lastW = w; _lastH = h;
            scheduleIntroViewportRefresh();
        }
    }, 300);
});

// 更新时间
function updateTime() {
    const now = new Date();
    const dateTimeStr = now.getFullYear() + '.' + 
                       String(now.getMonth() + 1).padStart(2, '0') + '.' + 
                       String(now.getDate()).padStart(2, '0') + ' ' + 
                       String(now.getHours()).padStart(2, '0') + ':' + 
                       String(now.getMinutes()).padStart(2, '0') + ':' + 
                       String(now.getSeconds()).padStart(2, '0');
    
    const dateTimeElement = document.querySelector('.date-time');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeStr;
    }
}

setInterval(updateTime, 1000);
updateTime();

// 鼠标位置追踪，控制右下角线条长度
document.addEventListener('mousemove', (e) => {
    const width = window.innerWidth;
    const mouseX = e.clientX;
    
    // 鼠标越靠右，线条越长
    // 基础长度 150px (增大最短长度)，最大额外长度 80px (减小最长长度)
    const lineLength = 180 + (mouseX / width) * 40;
    
    // 更新 CSS 变量，应用到 bottom-right 元素上
    const bottomRight = document.querySelector('.bottom-right');
    if (bottomRight) {
        bottomRight.style.setProperty('--line-width', `${lineLength}px`);
    }
});
