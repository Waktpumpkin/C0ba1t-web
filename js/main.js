/*
const codeSnippets = [
    "void main() {\n  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n}",
    "C0BA1T_CORE_INIT: SUCCESS",
    "BUFFER_OVERFLOW_DETECTED: IGNORED",
    "await C0BA1T.loadModule('central_processing')",
    "for (let i = 0; i < 100; i++) {\n  execute(tasks[i]);\n}",
    "0x43 0x30 0x62 0x61 0x31 0x74", // C0BA1T in hex
    "CONNECTING TO NEURAL NETWORK...",
    "ACCESS_LEVEL: ADMIN",
    "// TODO: Optimize data throughput",
    "if (latency > 0.05) {\n  rebalanceLoad();\n}",
    "std::cout << \"C0BA1T terminal active\" << std::endl;",
    "SELECT * FROM users WHERE status = 'ACTIVE';"
];

const container = document.getElementById('code-container');

function createSnippet() {
    const snippet = document.createElement('div');
    snippet.className = 'code-snippet';
    snippet.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    
    // 随机位置，避开中间区域 (30% - 70% 的宽高范围)
    let x, y;
    let safe = false;
    let attempts = 0;
    
    while (!safe && attempts < 10) {
        x = Math.random() * 80 + 10; // 10% - 90%
        y = Math.random() * 80 + 10; // 10% - 90%
        
        // 检查是否在中间区域 (x: 30-70, y: 35-65)
        // 这个区域大致覆盖了 Logo 的位置
        if ((x > 30 && x < 70) && (y > 35 && y < 65)) {
            // 在中间区域，重试
            attempts++;
        } else {
            safe = true;
        }
    }
    
    // 如果重试多次仍失败，强制放到边缘
    if (!safe) {
        if (Math.random() > 0.5) {
            x = Math.random() * 20 + 5; // 左侧
        } else {
            x = Math.random() * 20 + 75; // 右侧
        }
        y = Math.random() * 80 + 10; // y轴依然随机
    }
    
    snippet.style.left = `${x}%`;
    snippet.style.top = `${y}%`;
    
    // 随机动画时长
    const duration = 5 + Math.random() * 10;
    snippet.style.animation = `fade-in-out ${duration}s ease-in-out forwards`;
    
    container.appendChild(snippet);
    
    // 动画结束后移除
    setTimeout(() => {
        snippet.remove();
    }, duration * 1000);
}

// 添加淡入淡出动画到 CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in-out {
        0% { opacity: 0; transform: translateY(10px); }
        20% { opacity: 0.5; transform: translateY(0); }
        80% { opacity: 0.5; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// 初始生成几个
for (let i = 0; i < 5; i++) {
    setTimeout(createSnippet, Math.random() * 5000);
}

// 持续生成
setInterval(createSnippet, 3000);
*/

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
            setTimeout(type, speed + Math.random() * 50); // 增加一点随机感
        } else {
            if (callback) callback();
        }
    }
    
    type();
}

    // 页面加载完成后开始动画
document.addEventListener('DOMContentLoaded', () => {
    // 延迟一点时间开始，给用户一点准备
    setTimeout(() => {
        // 开始打字
        typeWriter('cat Introduction', '.prompt-cmd', 100, () => {
            // 打字完成后
            
            // 1. 移除闪烁光标
            const cursor = document.querySelector('.cursor');
            if (cursor) {
                cursor.style.display = 'none';
            }
            
            // 2. 模拟回车后的延迟
            setTimeout(() => {
                // 3. 加载粒子特效
                if (window.startParticleEffect) {
                    window.startParticleEffect();
                }
                
                // 4. 淡入介绍文字
                const introText = document.querySelector('.intro-text');
                if (introText) {
                    introText.style.opacity = '1';
                }
                
            }, 500); // 500ms 延迟
        });
    }, 1000); // 1秒后开始打字
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
