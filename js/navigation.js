document.addEventListener('DOMContentLoaded', () => {
    // 1. 清理所有旧的 Transition 元素
    const oldOverlay = document.getElementById('transition-overlay');
    const oldLine = document.getElementById('transition-line');
    if (oldOverlay) oldOverlay.remove();
    if (oldLine) oldLine.remove();

    const sections = ['home', 'introduction', 'members', 'honor'];
    let currentIndex = 0;
    
    const navItems = document.querySelectorAll('.nav-link');
    const spaSections = document.querySelectorAll('.spa-section');
    const NAV_ACTIVE_TRANSITION_MS = 500; 
    let navHighlightTimeoutId = null;
    // 获取全局标尺刻度
    const rulerMarks = document.querySelectorAll('.vertical-ruler .ruler-mark');
    
    // 初始化：根据 URL Hash 显示对应页面
    function initFromHash() {
        let hash = window.location.hash;
        
        // 如果 Hash 为空，自动重定向到 #home
        if (!hash) {
            window.location.replace('#home');
            hash = '#home'; // 手动设置以便立即使用
        }

        const sectionId = hash.replace('#', '');
        let index = sections.indexOf(sectionId);
        
        // 如果 Hash 无效（如 #invalid），默认回 Home
        if (index === -1) index = 0;
        
        initSection(index);
    }

    // 初始化：立即显示第一页，无动画
    function initSection(index) {
        currentIndex = index;
        const targetId = sections[index];

        // 更新导航
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            }
        });

        // 更新标尺
        // 这里不需要调用 updateRuler(index)，因为它会在动画开始时（requestAnimationFrame）被调用
        // 或者在 initSection 里被调用
        // 如果这里调用，可能会在旧页面还没消失时就改变标尺状态
        // updateRuler(index); // REMOVED from here to avoid premature toggle


        // 重置所有 Section
        spaSections.forEach(sec => {
            sec.classList.remove('active', 'entering', 'exiting', 'entering-prev', 'exiting-prev');
            sec.style.display = 'none';
            sec.style.opacity = '0';
        });

        // 立即更新标尺状态 (初始化时)
        updateRuler(index);

        // 显示当前 Section
        const activeSection = document.getElementById(`section-${targetId}`);
        if (activeSection) {
            if (targetId === 'honor') {
                activeSection.classList.add('honor-staircase-entering');
            }
            activeSection.classList.add('active');
            activeSection.style.display = 'block';
            activeSection.style.opacity = '1';
            
            if (targetId === 'introduction') {
                document.body.classList.add('page-intro');
                if (window.updateIntroLayout) {
                    requestAnimationFrame(() => window.updateIntroLayout());
                }
                if (window.startIntroductionAnimation) {
                    window.startIntroductionAnimation();
                }
            } else {
                document.body.classList.remove('page-intro');
                if (targetId === 'honor') {
                    const canvas = document.getElementById('COba1tCanvas');
                    if (canvas) canvas.style.zIndex = '5';
                    if (window.initHonor) {
                        window.initHonor();
                    }
                } else if (targetId === 'members') {
                    const canvas = document.getElementById('COba1tCanvas');
                    if (canvas) canvas.style.zIndex = '5';
                    if (window.onMembersShow) {
                        window.onMembersShow();
                    }
                } else if (targetId === 'home' && window.initHomePlaceholder) {
                    window.initHomePlaceholder();
                }
            }
        }
    }

    // 更新标尺状态函数
    function updateRuler(index) {
        const rulerContainer = document.querySelector('.vertical-ruler');
        if (rulerContainer) {
            // 只在 Introduction 页面显示标尺 (index 1)
            // 修正：用户似乎希望 Members (2) 和 Honor (3) 也能看到标尺，但是之前被背景遮挡了
            const currentSectionId = sections[index];
            
            // Home 页 (0) 隐藏，Introduction(1)/Members(2)/Honor(3) 显示
            if (currentSectionId !== 'home') {
                rulerContainer.style.opacity = '1';
                rulerContainer.style.pointerEvents = 'auto';
            } else {
                rulerContainer.style.opacity = '0';
                rulerContainer.style.pointerEvents = 'none';
            }
        }

        rulerMarks.forEach((mark, i) => {
            if (i === index) {
                mark.classList.add('active');
            } else {
                mark.classList.remove('active');
            }
        });
    }

    // 绑定点击事件
    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (currentIndex === index) return;
            
            // 如果是 Introduction 页面，必须等待动画完成才能离开
            if (sections[currentIndex] === 'introduction') {
                // 如果动画未完成，直接忽略本次点击
                if (!window.isIntroAnimFinished) {
                    return;
                }
                
                // 动画已完成，执行冻结逻辑（此时 isIntroAnimFinished 必为 true，所以是 Graceful Exit）
                if (window.freezeIntroductionAnimation) {
                    window.freezeIntroductionAnimation();
                }
            }
            
            // 通过修改 hash 触发跳转
            window.location.hash = sections[index];
        });
    });

    // 点击顶部 C0ba1t 文字 logo 时跳转回 home
    const headerLogoText = document.querySelector('.header-logo .logo-text');
    if (headerLogoText) {
        headerLogoText.addEventListener('click', () => {
            if (currentIndex === 0) return;
            if (sections[currentIndex] === 'introduction') {
                if (!window.isIntroAnimFinished) return;
                if (window.freezeIntroductionAnimation) window.freezeIntroductionAnimation();
            }
            window.location.hash = 'home';
        });
    }

    let isScrolling = false;
    let lastScrollTime = 0;
    const scrollDelay = 800; // 对应 CSS transition 时间 (600ms) + 缓冲

    // 使用捕获阶段，确保在 honor-main 的 wheel 之前执行，这样在顶部/底部时能先判断切页（不限鼠标区域）
    window.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (isScrolling || (now - lastScrollTime < scrollDelay)) return;
        const deltaThreshold = sections[currentIndex] === 'honor' ? 22 : 30; // honor 页稍敏感一点
        if (Math.abs(e.deltaY) < deltaThreshold) return;

        // Honor 页：仅在顶部继续上滑时切上一页、在底部继续下滑时切下一页，不按区域区分
        if (sections[currentIndex] === 'honor') {
            const honorMain = document.querySelector('#section-honor .honor-main');
            if (honorMain) {
                const honorThreshold = 8; // 只有真正接近顶部（≤8px）才允许上滑切页，避免未到顶就误触
                const atTop = honorMain.scrollTop <= honorThreshold;
                if (e.deltaY < 0 && !atTop) return; // 上滑且未到顶：不切页，交给 honor 页内滚动
                if (e.deltaY > 0) return;           // 下滑一律不切页，全部交给 honor 页内滚动
            }
        }

        let nextIndex = currentIndex;
        if (e.deltaY > 0) {
            if (currentIndex < sections.length - 1) {
                nextIndex = currentIndex + 1;
            }
        } else {
            if (currentIndex > 0) {
                nextIndex = currentIndex - 1;
            }
        }

        if (nextIndex !== currentIndex) {
            // Members 切入动画未播完时禁止切页（必须看完）
            if (sections[currentIndex] === 'members' && window.isMembersEntranceLock) {
                return;
            }
            // Honor 切入动画未播完时禁止切页（必须看完）
            if (sections[currentIndex] === 'honor' && window.isHonorEntranceLock) {
                return;
            }
            // 如果是 Introduction 页面，必须等待动画完成才能离开
            if (sections[currentIndex] === 'introduction') {
                // 如果动画未完成，直接忽略本次滚动
                if (!window.isIntroAnimFinished) {
                    return;
                }
                
                // 动画已完成，执行冻结逻辑（此时 isIntroAnimFinished 必为 true，所以是 Graceful Exit）
                if (window.freezeIntroductionAnimation) {
                    window.freezeIntroductionAnimation();
                }
            }

            e.preventDefault(); // 阻止默认滚动，避免 honor 等页的容器跟着滚
            lastScrollTime = now;
            window.location.hash = sections[nextIndex];
        }
    }, { passive: false, capture: true });

    // 监听 Hash 变化
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        const index = sections.indexOf(hash);
        if (index !== -1 && index !== currentIndex) {
            goToPage(index);
        }
    });

    // 核心切换逻辑 (Simple Fade Transition)
    function goToPage(index) {
        if (isScrolling) return;
        isScrolling = true;
        if (navHighlightTimeoutId) {
            clearTimeout(navHighlightTimeoutId);
            navHighlightTimeoutId = null;
        }

        const currentId = sections[currentIndex];
        const nextId = sections[index];
        const currentSection = document.getElementById(`section-${currentId}`);
        const nextSection = document.getElementById(`section-${nextId}`);

        if (!nextSection) {
            isScrolling = false;
            return;
        }

        if (currentId !== 'introduction') {
             if (window.stopIntroductionAnimation) {
                window.stopIntroductionAnimation();
            }
        } else {
            // 如果是从 introduction 离开，先让文字/终端淡出（freeze），section 切出稍后由下方时序触发
            if (window.freezeIntroductionAnimation) {
                window.freezeIntroductionAnimation();
            }
            
            if (window.stopParticleEffect) {
                window.stopParticleEffect(1.0, true);
                // 不再把 canvas 提到 50，否则会挡住 Honor/Members 内容；main(z-index:20) 高于 canvas(15) 即可
                const canvas = document.getElementById('COba1tCanvas');
                if (canvas) {
                    canvas.style.zIndex = '';
                }
            }
        }

        // Cleanup Honor page if leaving
        if (currentId === 'honor') {
            if (window.destroyHonor) {
                window.destroyHonor();
            }
        }
        
        // Members Page Exit Animation
        if (currentId === 'members') {
            if (window.onMembersHide) {
                // Determine direction: 'down' (to Honor) or 'up' (to Intro)
                // isScrollingDown is calculated below, let's calculate it here or reuse
                const direction = (index > currentIndex) ? 'down' : 'up';
                window.onMembersHide(direction);
            }
        }

        // 关键：如果离开的是 introduction 页面，稍后再调用粒子停止函数
        // 移到 setTimeout 回调中

        // 确定滚动方向：向下(Index增加) 为 true，向上(Index减少) 为 false
        const isScrollingDown = index > currentIndex;
        
        // 关键：如果离开的是 introduction 页面，稍后再调用粒子停止函数
        // 移到 setTimeout 回调中

        // 更新标尺
        // updateRuler(index); // REMOVED from here to prevent flickering
        // Instead, we call it right before animation starts or inside it


        // 1. 设置初始状态
        // 根据方向选择动画类
        // 向下滚动：旧页面 exiting (UP+FadeOut), 新页面 entering (UP from Bottom)
        // 向上滚动：旧页面 exiting-prev (DOWN+FadeOut), 新页面 entering-prev (DOWN from Top)
        const exitClass = isScrollingDown ? 'exiting' : 'exiting-prev';
        const enterClass = isScrollingDown ? 'entering' : 'entering-prev';

        const switchStartTime = performance.now();

        const isLeavingIntro = currentId === 'introduction' && nextId !== 'introduction';
        let cleanupDone = false;
        let fallbackId;

        function runCleanupOnce() {
            if (cleanupDone) return;
            cleanupDone = true;
            document.body.classList.remove('honor-exit-nav-ruler');
            if (currentSection) {
                currentSection.removeEventListener('transitionend', onTransitionEnd);
            }
            clearTimeout(fallbackId);

            if (isLeavingIntro) {
                if (window.stopIntroductionAnimation) window.stopIntroductionAnimation();
                if (currentSection) {
                    currentSection.querySelectorAll('.terminal-prompt, .ui-status, .ui-frame').forEach(el => {
                        el.classList.remove('intro-ui-exit', 'intro-ui-exit-from');
                    });
                }
            }

            // 先显示并启动新页进入动画，再在下一帧隐藏旧页，避免中间出现空白或闪一下
            if (nextId === 'honor') {
                nextSection.classList.add('honor-staircase-entering');
            }
            nextSection.style.display = 'block';
            if (nextId === 'members' || nextId === 'honor') {
                nextSection.style.zIndex = '30';
            }
            nextSection.classList.remove('exiting', 'exiting-prev', 'entering', 'entering-prev');
            nextSection.classList.add(enterClass);
            void nextSection.offsetWidth;

            requestAnimationFrame(() => {
                nextSection.classList.remove(enterClass);
                nextSection.classList.add('active');
                nextSection.style.opacity = '1';
                nextSection.style.transform = 'translateY(0)';
                nextSection.style.zIndex = '';
                if (nextId === 'members' || nextId === 'honor') {
                    const canvas = document.getElementById('COba1tCanvas');
                    if (canvas) canvas.style.zIndex = '5';
                }
                updateRuler(index);
                currentIndex = index;
                // 菜单选中态由 setNavAndRulerToTarget 的延迟逻辑统一处理，此处不再重复设置
                document.body.classList.remove('page-intro');
                if (nextId === 'introduction') {
                    document.body.classList.add('page-intro');
                    if (window.updateIntroLayout) {
                        requestAnimationFrame(() => window.updateIntroLayout());
                    }
                }
                if (nextId === 'members' && window.onMembersShow) window.onMembersShow();
                else if (nextId === 'honor' && window.initHonor) window.initHonor();
                else if (nextId === 'home' && window.initHomePlaceholder) window.initHomePlaceholder();
                else if (nextId === 'introduction' && window.startIntroductionAnimation) window.startIntroductionAnimation();
                isScrolling = false;

                requestAnimationFrame(() => {
                    if (currentSection) {
                        currentSection.style.display = 'none';
                        currentSection.style.zIndex = '';
                        currentSection.style.transition = '';
                        currentSection.classList.remove('exiting', 'exiting-prev', 'honor-staircase-exiting');
                        if (currentSection.id === 'section-honor') {
                            delete currentSection.dataset.honorExiting;
                            var tl = currentSection.querySelector('.timeline');
                            if (tl) {
                                tl.querySelectorAll('.award, .year, .axis-point-wrap').forEach(function (el) {
                                    el.style.animation = '';
                                    el.style.animationDelay = '';
                                });
                                var ax = tl.querySelector('.timeline-axis');
                                if (ax) { ax.style.animation = ''; ax.style.animationDelay = ''; }
                                currentSection.style.removeProperty('--honor-axis-retract-duration');
                            }
                        }
                    }
                });
            });
        }

        function onTransitionEnd(e) {
            if (e.target !== currentSection) return;
            if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
                runCleanupOnce();
            }
        }

        /* 菜单：先去掉当前页选中（过渡消失），过渡结束后再给下一页加选中（渐变出现） */
        function setNavAndRulerToTarget(navDelayMs) {
            const delay = navDelayMs != null ? navDelayMs : NAV_ACTIVE_TRANSITION_MS;
            updateRuler(index);
            navItems.forEach(function (item) {
                item.classList.remove('active');
            });
            navHighlightTimeoutId = setTimeout(function () {
                navItems.forEach(function (item) {
                    if (item.getAttribute('data-target') === sections[index]) {
                        item.classList.add('active');
                    }
                });
                navHighlightTimeoutId = null;
            }, delay);
        }

        function startExitAnimation() {
            if (!currentSection) return;
            setNavAndRulerToTarget();
            currentSection.classList.add(exitClass);
            void currentSection.offsetWidth;
            currentSection.classList.remove('active');

            if (currentSection.id === 'section-introduction') {
                // 四周 UI 统一退出：先给所有加 intro-ui-exit-from 固定起始态，再同时加 intro-ui-exit
                const prompt = currentSection.querySelector('.terminal-prompt');
                const status = currentSection.querySelector('.ui-status');
                const bottomRight = currentSection.querySelector('.ui-frame.bottom-right');
                const topLeft = currentSection.querySelector('.ui-frame.top-left');
                [prompt, status, bottomRight, topLeft].filter(Boolean).forEach(el => el.classList.add('intro-ui-exit-from'));
                void currentSection.offsetWidth;
                [prompt, topLeft, status, bottomRight].filter(Boolean).forEach(el => el.classList.add('intro-ui-exit'));
            }

            currentSection.addEventListener('transitionend', onTransitionEnd);
            /* intro 统一退场：略早于淡出完成时启动下一页，形成交叉淡入，衔接更顺 */
            fallbackId = setTimeout(runCleanupOnce, currentSection.id === 'section-introduction' ? 420 : 1500);
        }

        function startSectionExit() {
            if (currentId === 'honor') {
                document.body.classList.add('honor-exit-nav-ruler');
                setNavAndRulerToTarget(NAV_ACTIVE_TRANSITION_MS + 300);
            } else {
                setNavAndRulerToTarget();
            }
            if (currentId === 'honor' && window.prepareHonorExit) {
                window.prepareHonorExit();
            }
            currentSection.classList.add(exitClass);
            void currentSection.offsetWidth;
            currentSection.classList.remove('active');
            currentSection.addEventListener('transitionend', onTransitionEnd);
            const fallbackMs = currentId === 'members' ? 720 : currentId === 'honor' ? 1050 : currentId === 'home' ? 720 : 1500;
            fallbackId = setTimeout(runCleanupOnce, fallbackMs);
        }

        if (currentSection && currentId === 'introduction') {
            setTimeout(startExitAnimation, 350);
        } else if (currentSection) {
            if (currentId === 'home' && window.prepareHomeExit) {
                window.prepareHomeExit(startSectionExit);
            } else {
                startSectionExit();
            }
        }
    }

    // 初始化
    initFromHash();
});
