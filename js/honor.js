(function() {
    let resizeObserver = null;
    let mutationObserver = null;
    const HONOR_ENTER_STAGGER_S = 0.12;
    const HONOR_EXIT_STAGGER_S = 0.045;
    const HONOR_EXIT_DURATION_S = 0.22;
    const HONOR_AXIS_MAX_RETRACT_S = 0.92;
    const HONOR_SCROLL_EDGE_THRESHOLD = 8;
    const HONOR_SCROLL_EASE = 0.1;
    const HONOR_SCROLL_STOP_THRESHOLD = 0.5;
    const HONOR_SCROLL_MAX_STEP = 100;

    function createPoints() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;
        const section = timeline.closest('#section-honor');
        if (section && (section.classList.contains('honor-staircase-exiting') || section.dataset.honorExiting)) return;
        
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
                wrap.style.animationDelay = (idx * HONOR_ENTER_STAGGER_S) + 's';
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
        const axisX = axisRect.left + axisRect.width / 2;

        const awards = timeline.querySelectorAll('.award');
        awards.forEach((award, idx) => {
            if (!points[idx]) return;
            
            const ar = award.getBoundingClientRect();
            const centerY = ar.top + ar.height / 2;
            
            const left = axisX - timelineRect.left;
            const top = centerY - timelineRect.top;
            
            points[idx].style.left = left + 'px';
            points[idx].style.top = top + 'px';
        });

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
        resizeObserver.observe(timeline);
    }
    let scrollRafId = null;
    let targetScroll = 0;
    let currentScroll = 0;
    let isAnimating = false;

    function initScrollDamping() {
        const container = document.querySelector('.honor-main');
        if (!container) return;

        currentScroll = container.scrollTop;
        targetScroll = currentScroll;
        isAnimating = false;
        container.removeEventListener('wheel', handleWheel);
        container.addEventListener('wheel', handleWheel, { passive: false });
    }

    function handleWheel(e) {
        if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

        const container = e.currentTarget;
        if (container.scrollHeight <= container.clientHeight) return;

        const atTop = container.scrollTop <= HONOR_SCROLL_EDGE_THRESHOLD;
        if (e.deltaY < 0 && atTop) return;

        e.preventDefault();

        const delta = Math.max(-HONOR_SCROLL_MAX_STEP, Math.min(HONOR_SCROLL_MAX_STEP, e.deltaY));
        targetScroll = Math.max(0, Math.min(container.scrollHeight - container.clientHeight, targetScroll + delta));

        if (!isAnimating) {
            isAnimating = true;
            scrollLoop(container);
        }
    }

    function scrollLoop(container) {
        const diff = targetScroll - currentScroll;

        if (Math.abs(diff) < HONOR_SCROLL_STOP_THRESHOLD) {
            currentScroll = targetScroll;
            container.scrollTop = Math.round(currentScroll);
            isAnimating = false;
            if (scrollRafId) cancelAnimationFrame(scrollRafId);
            return;
        }

        currentScroll += diff * HONOR_SCROLL_EASE;
        container.scrollTop = Math.round(currentScroll);

        scrollRafId = requestAnimationFrame(() => scrollLoop(container));
    }

    window.initHonor = function() {
        const section = document.getElementById('section-honor');
        const timeline = document.querySelector('.timeline');
        if (!timeline) {
            console.warn('Honor timeline not found');
            return;
        }

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

        if (section) {
            window.isHonorEntranceLock = true;
            section.classList.add('honor-staircase-entering');
            const awards = timeline.querySelectorAll('.award');
            awards.forEach(function (award, idx) {
                award.style.animationDelay = (idx * HONOR_ENTER_STAGGER_S) + 's';
            });
            timeline.querySelectorAll('.year-section').forEach((yearSection) => {
                const yearEl = yearSection.querySelector('.year');
                const firstAward = yearSection.querySelector('.award');
                if (yearEl && firstAward) {
                    const idx = Array.prototype.indexOf.call(awards, firstAward);
                    if (idx >= 0) yearEl.style.animationDelay = (idx * HONOR_ENTER_STAGGER_S) + 's';
                }
            });
        }

        createPoints();
        requestAnimationFrame(() => {
            positionPoints();
            initResizeObserver();
            if (section) {
                const pointCount = timeline.querySelectorAll('.axis-point-wrap').length;
                const totalAnim = 0.6 + Math.max(0, (pointCount - 1) * HONOR_ENTER_STAGGER_S) + 0.4;
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

        initScrollDamping();

        if (mutationObserver) mutationObserver.disconnect();
        mutationObserver = new MutationObserver(() => {
            const sec = document.getElementById('section-honor');
            if (sec && sec.classList.contains('honor-staircase-entering')) return;
            createPoints();
            requestAnimationFrame(positionPoints);
        });
        mutationObserver.observe(timeline, { childList: true, subtree: true });

        window.removeEventListener('resize', positionPoints);
        window.addEventListener('resize', positionPoints);
    };

    window.prepareHonorExit = function() {
        const section = document.getElementById('section-honor');
        const timeline = section && section.querySelector('.timeline');
        if (!section || !timeline) return;

        window.isHonorEntranceLock = false;
        section.dataset.honorExiting = '1';

        timeline.querySelectorAll('.award, .year, .axis-point-wrap').forEach(function (el) {
            el.style.animation = '';
            el.style.animationDelay = '';
        });
        void section.offsetWidth;

        const points = Array.from(timeline.querySelectorAll('.axis-point-wrap'));
        const awards = Array.from(timeline.querySelectorAll('.award'));
        const n = Math.max(1, points.length, awards.length);
        const totalExitTime = n <= 1 ? HONOR_EXIT_DURATION_S : (n - 1) * HONOR_EXIT_STAGGER_S + HONOR_EXIT_DURATION_S;
        const axisRetract = Math.min(totalExitTime, HONOR_AXIS_MAX_RETRACT_S);
        section.style.setProperty('--honor-axis-retract-duration', axisRetract + 's');

        const awardsList = Array.from(timeline.querySelectorAll('.award'));
        const pointWraps = Array.from(timeline.querySelectorAll('.axis-point-wrap'));
        const numItems = Math.max(1, awardsList.length, pointWraps.length);
        const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
        const dur = `${HONOR_EXIT_DURATION_S}s`;

        function exitDelay(idx) { return (numItems - 1 - idx) * HONOR_EXIT_STAGGER_S; }

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
        }
        
        window.removeEventListener('resize', positionPoints);
    };

    document.addEventListener('DOMContentLoaded', () => {
        const honorSection = document.getElementById('section-honor');
        if (honorSection && honorSection.classList.contains('active')) {
            window.initHonor();
        }
    });

})();
