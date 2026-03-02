(function() {
    const HOME_TEXT = 'This page is under construction';
    const TYPEWRITER_MS = 65;
    const EXIT_CHAR_MS = 22;

    let typewriterTimerId = null;

    function getInner() {
        return document.querySelector('#section-home .home-placeholder-inner');
    }

    /**
     * 切入 home 页时：打字输入效果
     */
    window.initHomePlaceholder = function() {
        const inner = getInner();
        if (!inner) return;
        var cursor = document.querySelector('#section-home .home-placeholder-cursor');
        if (cursor) {
            cursor.style.opacity = '';
            cursor.style.animation = '';
        }
        inner.textContent = '';
        inner.innerHTML = '';
        if (typewriterTimerId) clearInterval(typewriterTimerId);
        let i = 0;
        typewriterTimerId = setInterval(function() {
            if (i >= HOME_TEXT.length) {
                clearInterval(typewriterTimerId);
                typewriterTimerId = null;
                return;
            }
            inner.textContent += HOME_TEXT[i];
            i++;
        }, TYPEWRITER_MS);
    };

    /**
     * 切出 home 页时：逐字退出，动画结束后调用 done
     */
    window.prepareHomeExit = function(done) {
        const inner = getInner();
        if (!inner) {
            if (done) done();
            return;
        }
        const text = inner.textContent || '';
        if (!text) {
            if (done) done();
            return;
        }
        if (typewriterTimerId) {
            clearInterval(typewriterTimerId);
            typewriterTimerId = null;
        }
        var cursor = document.querySelector('#section-home .home-placeholder-cursor');
        if (cursor) {
            cursor.style.opacity = '0';
            cursor.style.animation = 'none';
        }
        inner.textContent = '';
        var chars = text.split('');
        chars.forEach(function(c) {
            var span = document.createElement('span');
            span.textContent = c;
            span.className = 'home-placeholder-char';
            inner.appendChild(span);
        });
        var spans = inner.querySelectorAll('.home-placeholder-char');
        var idx = spans.length - 1;
        function hideNext() {
            if (idx < 0) {
                if (done) done();
                return;
            }
            spans[idx].classList.add('home-placeholder-char-exit');
            idx--;
            setTimeout(hideNext, EXIT_CHAR_MS);
        }
        setTimeout(hideNext, EXIT_CHAR_MS);
    };
})();
