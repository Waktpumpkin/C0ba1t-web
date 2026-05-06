document.addEventListener('DOMContentLoaded', () => {
    const oldOverlay = document.getElementById('transition-overlay');
    const oldLine = document.getElementById('transition-line');
    if (oldOverlay) oldOverlay.remove();
    if (oldLine) oldLine.remove();

    const sections = ['home', 'introduction', 'members', 'honor'];
    const HOME_ID = 'home';
    const INTRO_ID = 'introduction';
    const MEMBERS_ID = 'members';
    const HONOR_ID = 'honor';
    const NAV_ACTIVE_TRANSITION_MS = 500;
    const SCROLL_DELAY_MS = 800;
    const HONOR_WHEEL_THRESHOLD = 22;
    const DEFAULT_WHEEL_THRESHOLD = 30;
    const HONOR_TOP_THRESHOLD = 8;
    const MEMBERS_HONOR_CANVAS_Z = '5';

    let currentIndex = 0;
    const navItems = document.querySelectorAll('.nav-link');
    const spaSections = document.querySelectorAll('.spa-section');
    let navHighlightTimeoutId = null;
    const rulerMarks = document.querySelectorAll('.vertical-ruler .ruler-mark');

    function setCanvasZIndex(value) {
        const canvas = document.getElementById('COba1tCanvas');
        if (canvas) canvas.style.zIndex = value;
    }

    function updateNavActive(targetId) {
        navItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-target') === targetId);
        });
    }

    function canLeaveIntroduction() {
        if (sections[currentIndex] !== INTRO_ID) return true;
        return Boolean(window.isIntroAnimFinished);
    }

    function freezeIntroduction() {
        if (window.freezeIntroductionAnimation) {
            window.freezeIntroductionAnimation();
        }
    }

    function stopIntroduction() {
        if (window.stopIntroductionAnimation) {
            window.stopIntroductionAnimation();
        }
    }

    function runSectionEntry(targetId) {
        if (targetId === INTRO_ID) {
            document.body.classList.add('page-intro');
            if (window.updateIntroLayout) {
                requestAnimationFrame(() => window.updateIntroLayout());
            }
            if (window.startIntroductionAnimation) {
                window.startIntroductionAnimation();
            }
            return;
        }

        document.body.classList.remove('page-intro');

        if (targetId === HONOR_ID) {
            setCanvasZIndex(MEMBERS_HONOR_CANVAS_Z);
            if (window.initHonor) window.initHonor();
        } else if (targetId === MEMBERS_ID) {
            setCanvasZIndex(MEMBERS_HONOR_CANVAS_Z);
            if (window.onMembersShow) window.onMembersShow();
        } else if (targetId === HOME_ID && window.initHomePlaceholder) {
            window.initHomePlaceholder();
        }
    }

    function initFromHash() {
        let hash = window.location.hash;

        if (!hash) {
            window.location.replace('#home');
            hash = '#home';
        }

        const sectionId = hash.replace('#', '');
        let index = sections.indexOf(sectionId);
        if (index === -1) index = 0;

        initSection(index);
    }

    function initSection(index) {
        currentIndex = index;
        const targetId = sections[index];

        updateNavActive(targetId);
        spaSections.forEach(sec => {
            sec.classList.remove('active', 'entering', 'exiting', 'entering-prev', 'exiting-prev');
            sec.style.display = 'none';
            sec.style.opacity = '0';
        });

        updateRuler(index);

        const activeSection = document.getElementById(`section-${targetId}`);
        if (activeSection) {
            if (targetId === HONOR_ID) {
                activeSection.classList.add('honor-staircase-entering');
            }
            activeSection.classList.add('active');
            activeSection.style.display = 'block';
            activeSection.style.opacity = '1';
            runSectionEntry(targetId);
        }
    }

    function updateRuler(index) {
        const rulerContainer = document.querySelector('.vertical-ruler');
        if (rulerContainer) {
            const currentSectionId = sections[index];

            if (currentSectionId !== HOME_ID) {
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

    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (currentIndex === index) return;

            if (!canLeaveIntroduction()) {
                return;
            }

            freezeIntroduction();
            window.location.hash = sections[index];
        });
    });

    const headerLogoText = document.querySelector('.header-logo .logo-text');
    if (headerLogoText) {
        headerLogoText.addEventListener('click', () => {
            if (currentIndex === 0) return;

            if (!canLeaveIntroduction()) return;

            freezeIntroduction();
            window.location.hash = 'home';
        });
    }

    let isScrolling = false;
    let lastScrollTime = 0;

    window.addEventListener('wheel', (e) => {
        const now = Date.now();
        if (isScrolling || (now - lastScrollTime < SCROLL_DELAY_MS)) return;
        const deltaThreshold = sections[currentIndex] === HONOR_ID ? HONOR_WHEEL_THRESHOLD : DEFAULT_WHEEL_THRESHOLD;
        if (Math.abs(e.deltaY) < deltaThreshold) return;

        if (sections[currentIndex] === HONOR_ID) {
            const honorMain = document.querySelector('#section-honor .honor-main');
            if (honorMain) {
                const atTop = honorMain.scrollTop <= HONOR_TOP_THRESHOLD;
                if (e.deltaY < 0 && !atTop) return;
                if (e.deltaY > 0) return;
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
            if (sections[currentIndex] === MEMBERS_ID && window.isMembersEntranceLock) {
                return;
            }
            if (sections[currentIndex] === HONOR_ID && window.isHonorEntranceLock) {
                return;
            }
            if (!canLeaveIntroduction()) {
                return;
            }

            freezeIntroduction();
            e.preventDefault();
            lastScrollTime = now;
            window.location.hash = sections[nextIndex];
        }
    }, { passive: false, capture: true });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        const index = sections.indexOf(hash);
        if (index !== -1 && index !== currentIndex) {
            goToPage(index);
        }
    });

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

        if (currentId !== INTRO_ID) {
            stopIntroduction();
        } else {
            freezeIntroduction();
            if (window.stopParticleEffect) {
                window.stopParticleEffect(1.0, true);
                setCanvasZIndex('');
            }
        }

        if (currentId === HONOR_ID) {
            if (window.destroyHonor) {
                window.destroyHonor();
            }
        }

        if (currentId === MEMBERS_ID) {
            if (window.onMembersHide) {
                const direction = (index > currentIndex) ? 'down' : 'up';
                window.onMembersHide(direction);
            }
        }

        const isScrollingDown = index > currentIndex;
        const exitClass = isScrollingDown ? 'exiting' : 'exiting-prev';
        const enterClass = isScrollingDown ? 'entering' : 'entering-prev';

        const isLeavingIntro = currentId === INTRO_ID && nextId !== INTRO_ID;
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
                stopIntroduction();
                if (currentSection) {
                    currentSection.querySelectorAll('.terminal-prompt, .ui-status, .ui-frame').forEach(el => {
                        el.classList.remove('intro-ui-exit', 'intro-ui-exit-from');
                    });
                }
            }

            if (nextId === HONOR_ID) {
                nextSection.classList.add('honor-staircase-entering');
            }
            nextSection.style.display = 'block';
            if (nextId === MEMBERS_ID || nextId === HONOR_ID) {
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
                if (nextId === MEMBERS_ID || nextId === HONOR_ID) setCanvasZIndex(MEMBERS_HONOR_CANVAS_Z);
                updateRuler(index);
                currentIndex = index;
                document.body.classList.remove('page-intro');
                runSectionEntry(nextId);
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

        function setNavAndRulerToTarget(navDelayMs) {
            const delay = navDelayMs != null ? navDelayMs : NAV_ACTIVE_TRANSITION_MS;
            updateRuler(index);
            updateNavActive('');
            navHighlightTimeoutId = setTimeout(function () {
                updateNavActive(sections[index]);
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
                const prompt = currentSection.querySelector('.terminal-prompt');
                const status = currentSection.querySelector('.ui-status');
                const bottomRight = currentSection.querySelector('.ui-frame.bottom-right');
                const topLeft = currentSection.querySelector('.ui-frame.top-left');
                [prompt, status, bottomRight, topLeft].filter(Boolean).forEach(el => el.classList.add('intro-ui-exit-from'));
                void currentSection.offsetWidth;
                [prompt, topLeft, status, bottomRight].filter(Boolean).forEach(el => el.classList.add('intro-ui-exit'));
            }

            currentSection.addEventListener('transitionend', onTransitionEnd);
            fallbackId = setTimeout(runCleanupOnce, currentSection.id === 'section-introduction' ? 420 : 1500);
        }

        function startSectionExit() {
            if (currentId === HONOR_ID) {
                document.body.classList.add('honor-exit-nav-ruler');
                setNavAndRulerToTarget(NAV_ACTIVE_TRANSITION_MS + 300);
            } else {
                setNavAndRulerToTarget();
            }
            if (currentId === HONOR_ID && window.prepareHonorExit) {
                window.prepareHonorExit();
            }
            currentSection.classList.add(exitClass);
            void currentSection.offsetWidth;
            currentSection.classList.remove('active');
            currentSection.addEventListener('transitionend', onTransitionEnd);
            const fallbackMs = currentId === MEMBERS_ID ? 720 : currentId === HONOR_ID ? 1050 : currentId === HOME_ID ? 720 : 1500;
            fallbackId = setTimeout(runCleanupOnce, fallbackMs);
        }

        if (currentSection && currentId === INTRO_ID) {
            setTimeout(startExitAnimation, 350);
        } else if (currentSection) {
            if (currentId === HOME_ID && window.prepareHomeExit) {
                window.prepareHomeExit(startSectionExit);
            } else {
                startSectionExit();
            }
        }
    }

    // 初始化
    initFromHash();
});
