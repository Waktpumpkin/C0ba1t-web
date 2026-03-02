(function() {
    let resizeObserver = null;
    let mutationObserver = null;
    let isInitialized = false;

    // --- Core Logic from timeline-points.js ---

    function createPoints() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;
        const section = timeline.closest('#section-honor');
        if (section && (section.classList.contains('honor-staircase-exiting') || section.dataset.honorExiting)) return;
        
        // Clear old points
        const oldPoints = timeline.querySelectorAll('.axis-point-wrap');
        oldPoints.forEach(p => p.remove());

        const awards = timeline.querySelectorAll('.award');
        const points = [];

        const isStaircaseEntrance = section && section.classList.contains('honor-staircase-entering');

        awards.forEach((award, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'axis-point-wrap';
            const inner = document.createElement('div');
            inner.className = 'axis-point-inner';
            
            let levelClass = 'other';
            const lvl = award.querySelector('.award-level');
            if (lvl) {
                if (lvl.classList.contains('first')) levelClass = 'first';
                else if (lvl.classList.contains('second')) levelClass = 'second';
                else if (lvl.classList.contains('third')) levelClass = 'third';
            }
            inner.classList.add(levelClass);
            wrap.appendChild(inner);
            if (isStaircaseEntrance) {
                wrap.style.animationDelay = (idx * 0.12) + 's';
            }
            timeline.appendChild(wrap);
            points.push(wrap);
        });

        return points;
    }

    function positionPoints() {
        const timeline = document.querySelector('.timeline');
        const axis = document.querySelector('.timeline-axis');
        if (!timeline || !axis) return;
        const section = timeline.closest('#section-honor');
        if (section && (section.classList.contains('honor-staircase-exiting') || section.dataset.honorExiting)) return;

        const points = Array.from(timeline.querySelectorAll('.axis-point-wrap'));
        const timelineRect = timeline.getBoundingClientRect();
        const axisRect = axis.getBoundingClientRect();
        
        // Calculate axis center relative to viewport
        const axisX = axisRect.left + axisRect.width / 2;

        const awards = timeline.querySelectorAll('.award');
        awards.forEach((award, idx) => {
            if (!points[idx]) return;
            
            const ar = award.getBoundingClientRect();
            const centerY = ar.top + ar.height / 2;
            
            // Convert to relative coords
            const left = axisX - timelineRect.left;
            const top = centerY - timelineRect.top;
            
            points[idx].style.left = left + 'px';
            points[idx].style.top = top + 'px';
        });

        // Align axis bottom
        if (awards.length > 0) {
            const last = awards[awards.length - 1];
            const lar = last.getBoundingClientRect();
            const lastCenterY = lar.top + lar.height / 2;
            const axisBottomPx = timelineRect.height - (lastCenterY - timelineRect.top);
            axis.style.bottom = Math.max(0, Math.round(axisBottomPx)) + 'px';
        }
    }

    function initResizeObserver() {
        if (resizeObserver) resizeObserver.disconnect();
        
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        resizeObserver = new ResizeObserver(() => {
            const sec = timeline.closest('#section-honor');
            if (sec && sec.classList.contains('honor-staircase-entering')) return;
            requestAnimationFrame(positionPoints);
        });

        const awards = timeline.querySelectorAll('.award');
        awards.forEach(a => resizeObserver.observe(a));
        
        // Also observe timeline itself
        resizeObserver.observe(timeline);
    }

    // --- Scroll Damping Logic from scroll-damping.js ---
    
    // Global state for scroll damping
    let scrollRafId = null;
    let targetScroll = 0;
    let currentScroll = 0;
    let isAnimating = false;

    function initScrollDamping() {
        const container = document.querySelector('.honor-main');
        if (!container) return;

        // Reset state（二次进入时必须重置，否则 isAnimating 可能仍为 true 导致 scrollLoop 不启动）
        currentScroll = container.scrollTop;
        targetScroll = currentScroll;
        isAnimating = false;
        
        // Remove old listeners to prevent duplication
        container.removeEventListener('wheel', handleWheel);
        
        // Add new listener
        container.addEventListener('wheel', handleWheel, { passive: false });
    }

    function handleWheel(e) {
        if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

        const container = e.currentTarget;
        if (container.scrollHeight <= container.clientHeight) return;

        // 只对顶部做限制：真正到顶（≤8px）后上滑不消费事件，交给 navigation 切页；下滑一律页内滚动
        const edgeThreshold = 8;
        const atTop = container.scrollTop <= edgeThreshold;
        if (e.deltaY < 0 && atTop) return;

        e.preventDefault();

        const maxStep = 100;
        const delta = Math.max(-maxStep, Math.min(maxStep, e.deltaY));
        targetScroll = Math.max(0, Math.min(container.scrollHeight - container.clientHeight, targetScroll + delta));

        if (!isAnimating) {
            isAnimating = true;
            scrollLoop(container);
        }
    }

    function scrollLoop(container) {
        // Smooth ease factor
        const ease = 0.1;
        const diff = targetScroll - currentScroll;
        
        if (Math.abs(diff) < 0.5) {
            currentScroll = targetScroll;
            container.scrollTop = Math.round(currentScroll);
            isAnimating = false;
            if (scrollRafId) cancelAnimationFrame(scrollRafId);
            return;
        }
        
        currentScroll += diff * ease;
        container.scrollTop = Math.round(currentScroll);
        
        scrollRafId = requestAnimationFrame(() => scrollLoop(container));
    }

    // --- Main Init/Cleanup ---

    window.initHonor = function() {
        console.log('Initializing Honor Page...');
        const section = document.getElementById('section-honor');
        const timeline = document.querySelector('.timeline');
        if (!timeline) {
            console.warn('Honor timeline not found');
            return;
        }

        // 清除上次切出时设置的内联 animation，否则会覆盖本次切入的 CSS 动画，导致播完仍不可见
        timeline.querySelectorAll('.award').forEach(function (el) {
            el.style.animation = '';
            el.style.animationDelay = '';
        });
        timeline.querySelectorAll('.year').forEach(function (el) {
            el.style.animation = '';
            el.style.animationDelay = '';
        });
        timeline.querySelectorAll('.axis-point-wrap').forEach(function (el) {
            el.style.animation = '';
            el.style.animationDelay = '';
        });

        // 切入动画：竖线 + 时间点 + 左侧年份 + 右侧 award 一节一节伸出；加锁，未播完不可切页
        if (section) {
            window.isHonorEntranceLock = true;
            section.classList.add('honor-staircase-entering');
            const awards = timeline.querySelectorAll('.award');
            awards.forEach(function (award, idx) {
                award.style.animationDelay = (idx * 0.12) + 's';
            });
            timeline.querySelectorAll('.year-section').forEach((yearSection) => {
                const yearEl = yearSection.querySelector('.year');
                const firstAward = yearSection.querySelector('.award');
                if (yearEl && firstAward) {
                    const idx = Array.prototype.indexOf.call(awards, firstAward);
                    if (idx >= 0) yearEl.style.animationDelay = (idx * 0.12) + 's';
                }
            });
        }

        // 1. Setup Points（会读取 honor-staircase-entering 并设置每个点的 animationDelay）
        createPoints();
        
        // 2. Position Points (Wait for layout)
        requestAnimationFrame(() => {
            positionPoints();
            initResizeObserver();
            if (section) {
                const pointCount = timeline.querySelectorAll('.axis-point-wrap').length;
                const totalAnim = 0.6 + Math.max(0, (pointCount - 1) * 0.12) + 0.4;
                const removeAt = Math.round((totalAnim + 0.2) * 1000);
                setTimeout(function () {
                    section.classList.remove('honor-staircase-entering');
                    timeline.querySelectorAll('.award, .year').forEach(function (el) {
                        el.style.animationDelay = '';
                    });
                    timeline.querySelectorAll('.axis-point-wrap').forEach(function (el) {
                        el.style.animationDelay = '';
                    });
                    window.isHonorEntranceLock = false;
                }, removeAt);
            }
        });

        // 3. Setup Scroll Damping
        initScrollDamping();

        // 4. Setup Mutation Observer for dynamic content（切入动画期间不响应，避免 createPoints 重建点导致 reflow 使 award 动画闪动/依次消失）
        if (mutationObserver) mutationObserver.disconnect();
        mutationObserver = new MutationObserver(() => {
            const sec = document.getElementById('section-honor');
            if (sec && sec.classList.contains('honor-staircase-entering')) return;
            createPoints();
            requestAnimationFrame(positionPoints);
        });
        mutationObserver.observe(timeline, { childList: true, subtree: true });

        // 5. Global Resize Listener
        window.removeEventListener('resize', positionPoints); // Clean first
        window.addEventListener('resize', positionPoints);
        
        isInitialized = true;
    };

    /**
     * Honor 切出：竖线从下往上收起，时间点与 award 随竖线从下往上依次消失（按视觉位置排序）。
     */
    window.prepareHonorExit = function() {
        const section = document.getElementById('section-honor');
        const timeline = section && section.querySelector('.timeline');
        if (!section || !timeline) return;

        window.isHonorEntranceLock = false;
        /* 先打标，防止 createPoints/positionPoints 在设 delay 期间被 observer 触发导致节点被重建、闪一下 */
        section.dataset.honorExiting = '1';

        /* 第二次及以后切出前：清除 award/year/point 内联 animation；不碰竖线避免切出时竖线闪亮 */
        timeline.querySelectorAll('.award, .year, .axis-point-wrap').forEach(function (el) {
            el.style.animation = '';
            el.style.animationDelay = '';
        });
        void section.offsetWidth;

        const points = Array.from(timeline.querySelectorAll('.axis-point-wrap'));
        const awards = Array.from(timeline.querySelectorAll('.award'));
        const n = Math.max(1, points.length, awards.length);
        const exitStagger = 0.045;
        const singleDuration = 0.22;
        const totalExitTime = n <= 1 ? singleDuration : (n - 1) * exitStagger + singleDuration;
        const axisRetract = Math.min(totalExitTime, 0.92);
        section.style.setProperty('--honor-axis-retract-duration', axisRetract + 's');

        const awardsList = Array.from(timeline.querySelectorAll('.award'));
        const pointWraps = Array.from(timeline.querySelectorAll('.axis-point-wrap'));
        const numItems = Math.max(1, awardsList.length, pointWraps.length);
        const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
        const dur = '0.22s';

        function exitDelay(idx) { return (numItems - 1 - idx) * exitStagger; }

        /* 使用 both：delay 期间应用 0% 关键帧(可见)，未到消失时间的 award/point/year 保持可见 */
        awardsList.forEach(function (el, idx) {
            var d = exitDelay(idx) + 's';
            el.style.animation = 'honor-award-out ' + dur + ' ' + ease + ' ' + d + ' both';
        });
        pointWraps.forEach(function (el, idx) {
            var d = exitDelay(idx) + 's';
            el.style.animation = 'honor-point-out ' + dur + ' ' + ease + ' ' + d + ' both';
        });
        timeline.querySelectorAll('.year-section').forEach(function (sec) {
            var firstAward = sec.querySelector('.award');
            var yearEl = sec.querySelector('.year');
            if (!yearEl || !firstAward) return;
            var idx = awardsList.indexOf(firstAward);
            if (idx >= 0) {
                var d = exitDelay(idx) + 's';
                yearEl.style.animation = 'honor-year-out ' + dur + ' ' + ease + ' ' + d + ' both';
            }
        });

        section.classList.add('honor-staircase-exiting');
    };

    window.destroyHonor = function() {
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObserver = null;
        }
        if (scrollRafId) {
            cancelAnimationFrame(scrollRafId);
            scrollRafId = null;
        }
        isAnimating = false;
        
        const container = document.querySelector('.honor-main');
        if (container) {
            container.removeEventListener('wheel', handleWheel);
            // container.removeEventListener('scroll', handleScroll); // No longer used
        }
        
        window.removeEventListener('resize', positionPoints);
        isInitialized = false;
    };
    
    // Auto-init if visible on load (SPA check)
    document.addEventListener('DOMContentLoaded', () => {
        const honorSection = document.getElementById('section-honor');
        if (honorSection && honorSection.classList.contains('active')) {
            window.initHonor();
        }
    });

})();
