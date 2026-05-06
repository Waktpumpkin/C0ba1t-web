(function() {
    const STATE = {
        IDLE: 'idle',
        REVEALING: 'revealing',
        PLAYING: 'playing',
        IMPACT: 'impact',
        SETTLING: 'settling',
        STEADY: 'steady',
        EXITING: 'exiting'
    };

    const TIMINGS = {
        reveal: 220,
        preImpact: 900,
        impact: 220,
        settling: 1400,
        replayDelay: 180,
        exit: 320
    };

    let scene = null;
    let timers = [];
    let hasPlayedOnce = false;
    let initialized = false;

    function clearHomeTimers() {
        timers.forEach((id) => clearTimeout(id));
        timers = [];
    }

    function getScene() {
        if (!scene) scene = document.getElementById('home-scene');
        return scene;
    }

    function setState(nextState) {
        const el = getScene();
        if (!el) return;
        el.setAttribute('data-home-state', nextState);
    }

    function schedule(fn, delay) {
        const id = setTimeout(fn, delay);
        timers.push(id);
        return id;
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function resetHomeScene(mode) {
        const el = getScene();
        if (!el) return;

        clearHomeTimers();

        if (window.stopHomeFx) {
            window.stopHomeFx();
        }
        if (window.resizeHomeFx) {
            window.resizeHomeFx();
        }

        if (mode === 'steady' || prefersReducedMotion()) {
            setState(STATE.STEADY);
            if (window.startHomeSteadyFx) {
                window.startHomeSteadyFx();
            }
            return;
        }

        setState(STATE.IDLE);
    }

    function playScene(fromReplay) {
        const el = getScene();
        if (!el) return;

        resetHomeScene();
        if (window.createHomeFx) {
            window.createHomeFx();
        }

        setState(STATE.REVEALING);

        schedule(function() {
            setState(STATE.PLAYING);
        }, fromReplay ? TIMINGS.replayDelay : TIMINGS.reveal);

        schedule(function() {
            setState(STATE.IMPACT);
            if (window.playHomeImpactFx) {
                window.playHomeImpactFx();
            }
        }, (fromReplay ? TIMINGS.replayDelay : TIMINGS.reveal) + TIMINGS.preImpact);

        schedule(function() {
            setState(STATE.SETTLING);
        }, (fromReplay ? TIMINGS.replayDelay : TIMINGS.reveal) + TIMINGS.preImpact + TIMINGS.impact);

        schedule(function() {
            setState(STATE.STEADY);
            if (window.startHomeSteadyFx) {
                window.startHomeSteadyFx();
            }
            hasPlayedOnce = true;
        }, (fromReplay ? TIMINGS.replayDelay : TIMINGS.reveal) + TIMINGS.preImpact + TIMINGS.impact + TIMINGS.settling);
    }

    function ensureInitialized() {
        const el = getScene();
        if (!el || initialized) return;
        initialized = true;
        if (window.createHomeFx) {
            window.createHomeFx();
        }
        window.addEventListener('resize', function() {
            if (window.resizeHomeFx) {
                window.resizeHomeFx();
            }
        });
    }

    window.initHomePlaceholder = function() {
        ensureInitialized();
        if (prefersReducedMotion()) {
            resetHomeScene('steady');
            hasPlayedOnce = true;
            return;
        }
        playScene(hasPlayedOnce);
    };

    window.prepareHomeExit = function(done) {
        const el = getScene();
        clearHomeTimers();

        if (!el) {
            if (done) done();
            return;
        }

        setState(STATE.EXITING);

        schedule(function() {
            if (window.stopHomeFx) {
                window.stopHomeFx();
            }
            if (done) done();
        }, TIMINGS.exit);
    };

    window.resetHomeScene = resetHomeScene;
})();
