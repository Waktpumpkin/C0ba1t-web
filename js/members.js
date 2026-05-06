
(function() {
    let currentGradeIndex = 0;
    let grades = [];
    let cards = [];

    const refs = {
        cards: null,
        currentGradeEl: null,
        prevBtn: null,
        nextBtn: null,
        bgYearEl: null,
        gridScrollArea: null,
        mainTitle: null,
        grid: null,
        membersContainer: null
    };

    const ADMIN_GRADE = '0000';
    const ADMIN_LABEL = 'ADMIN';
    const MEMBERS_TITLE = 'MEMBERS';
    const LEADERS_TITLE_HTML = 'TEAM<br>LEADERS';
    const CARD_ANIMATION_OFFSET = 50;
    const CARD_ANIMATION_DURATION_MS = 500;
    const CARD_STAGGER_MS = 100;
    const PANEL_ENTER_DURATION_MS = 700;
    const GRID_GAP_ADMIN = '15px 65px';
    const GRID_GAP_2022 = '33px 65px';
    const GRID_GAP_SPARSE = '50px';
    const GRID_GAP_DEFAULT = '15px';

    const roleIcons = {
        'MISC': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M6,9H8V11H10V13H8V15H6V13H4V11H6V9M18.5,9A1.5,1.5 0 0,1 20,10.5A1.5,1.5 0 0,1 18.5,12A1.5,1.5 0 0,1 17,10.5A1.5,1.5 0 0,1 18.5,9M15.5,12A1.5,1.5 0 0,1 17,13.5A1.5,1.5 0 0,1 15.5,15A1.5,1.5 0 0,1 14,13.5A1.5,1.5 0 0,1 15.5,12M17,5A7,7 0 0,1 24,12A7,7 0 0,1 17,19C15.04,19 13.27,18.2 12,16.9C10.73,18.2 8.96,19 7,19A7,7 0 0,1 0,12A7,7 0 0,1 7,5H17M7,7A5,5 0 0,0 2,12A5,5 0 0,0 7,17C8.64,17 10.09,16.21 11,15H13C13.91,16.21 15.36,17 17,17A5,5 0 0,0 22,12A5,5 0 0,0 17,7H7Z" style="fill: currentcolor;"></path></svg>`,
        'PWN': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M11.25,6A3.25,3.25 0 0,1 14.5,2.75A3.25,3.25 0 0,1 17.75,6C17.75,6.42 18.08,6.75 18.5,6.75C18.92,6.75 19.25,6.42 19.25,6V5.25H20.75V6A2.25,2.25 0 0,1 18.5,8.25A2.25,2.25 0 0,1 16.25,6A1.75,1.75 0 0,0 14.5,4.25A1.75,1.75 0 0,0 12.75,6H14V7.29C16.89,8.15 19,10.83 19,14A7,7 0 0,1 12,21A7,7 0 0,1 5,14C5,10.83 7.11,8.15 10,7.29V6H11.25M22,6H24V7H22V6M19,4V2H20V4H19M20.91,4.38L22.33,2.96L23.04,3.67L21.62,5.09L20.91,4.38Z" style="fill: currentcolor;"></path></svg>`,
        'WEB': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" style="fill: currentcolor;"></path></svg>`,
        'RE': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M9.42,7.41L4.83,12L9.42,16.59L8,18L2,12L8,6L9.42,7.41M15.42,7.41L10.83,12L15.42,16.59L14,18L8,12L14,6L15.42,7.41M21.42,7.41L16.83,12L21.42,16.59L20,18L14,12L20,6L21.42,7.41Z" style="fill: currentcolor;"></path></svg>`,
        'CRYPTO': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M2,2H6V4H4V20H6V22H2V2M20,4H18V2H22V22H18V20H20V4M9,5H10V10H11V11H8V10H9V6L8,6.5V5.5L9,5M15,13H16V18H17V19H14V18H15V14L14,14.5V13.5L15,13M9,13C10.1,13 11,14.34 11,16C11,17.66 10.1,19 9,19C7.9,19 7,17.66 7,16C7,14.34 7.9,13 9,13M9,14C8.45,14 8,14.9 8,16C8,17.1 8.45,18 9,18C9.55,18 10,17.1 10,16C10,14.9 9.55,14 9,14M15,5C16.1,5 17,6.34 17,8C17,9.66 16.1,11 15,11C13.9,11 13,9.66 13,8C13,6.34 13.9,5 15,5M15,6C14.45,6 14,6.9 14,8C14,9.1 14.45,10 15,10C15.55,10 16,9.1 16,8C16,6.9 15.55,6 15,6Z" style="fill: currentcolor;"></path></svg>`
    };

    function isAdminGrade(grade) {
        return String(grade) === ADMIN_GRADE;
    }

    function getDisplayText(grade) {
        return isAdminGrade(grade) ? ADMIN_LABEL : String(grade);
    }

    function getMainTitleMarkup(grade) {
        return isAdminGrade(grade) ? LEADERS_TITLE_HTML : MEMBERS_TITLE;
    }

    function getAnimationClasses(direction) {
        return {
            outClass: direction === 'next' ? 'grade-anim-out-right' : 'grade-anim-out-left',
            inClass: direction === 'next' ? 'grade-anim-in-from-left' : 'grade-anim-in-from-right'
        };
    }

    function shiftGrade(step) {
        if (!grades.length) return;
        currentGradeIndex = (currentGradeIndex + step + grades.length) % grades.length;
    }

    function applyGradeLayout(grade) {
        if (refs.grid) {
            refs.grid.classList.toggle('grade-layout-2022', grade === '2022');
        }
        if (refs.membersContainer) {
            refs.membersContainer.classList.toggle('grade-layout-2022-view', grade === '2022');
        }
    }

    function setGridGap(grade, visibleCount) {
        if (!refs.grid) return;

        if (isAdminGrade(grade)) refs.grid.style.gap = GRID_GAP_ADMIN;
        else if (grade === '2022') refs.grid.style.gap = GRID_GAP_2022;
        else if (visibleCount < 4) refs.grid.style.gap = GRID_GAP_SPARSE;
        else refs.grid.style.gap = GRID_GAP_DEFAULT;
    }

    function bindCardClickGuard(card, allowLinks) {
        if (card.dataset.clickGuardBound === 'true') return;

        card.addEventListener('click', (event) => {
            if (allowLinks && event.target.closest('.link-btn')) return;
            event.preventDefault();
        });

        card.dataset.clickGuardBound = 'true';
    }

    function buildLinkButtons(card) {
        const originalHref = card.getAttribute('href');
        const githubLink = card.dataset.github;
        const hasBlog = originalHref && originalHref !== '#';
        const hasGithub = Boolean(githubLink);

        if (!hasBlog && !hasGithub) return '';

        let buttonsHtml = '';

        if (hasBlog) {
            buttonsHtml += `
                <a href="${originalHref}" target="_blank" class="link-btn">
                    <svg viewBox="0 0 24 24"><path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>
                    BLOG
                </a>`;
        }

        if (hasGithub) {
            buttonsHtml += `
                <a href="${githubLink}" target="_blank" class="link-btn">
                    <svg viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 7.56 9.75.5.08.68-.22.68-.48v-1.71c-2.78.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85v2.75c0 .26.18.57.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>
                    GitHub
                </a>`;
        }

        return buttonsHtml;
    }

    function applyRoleIcons(card) {
        const roleTags = card.querySelectorAll('.member-role-tag');
        const iconContainers = card.querySelectorAll('.role-icon-placeholder');

        roleTags.forEach((roleTag, index) => {
            const iconContainer = iconContainers[index];
            if (!roleTag || !iconContainer) return;

            const role = roleTag.textContent.trim().toUpperCase();
            iconContainer.setAttribute('data-role', role);
            if (roleIcons[role]) {
                iconContainer.innerHTML = roleIcons[role];
            }
        });
    }

    function ensureCardOverlay(card) {
        const buttonsHtml = buildLinkButtons(card);
        bindCardClickGuard(card, Boolean(buttonsHtml));

        if (!buttonsHtml || card.querySelector('.card-links-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'card-links-overlay';
        overlay.innerHTML = buttonsHtml;

        const avatarContainer = card.querySelector('.member-avatar-circle');
        (avatarContainer || card).appendChild(overlay);
    }

    function setTitleContent(grade) {
        const displayText = getDisplayText(grade);

        if (refs.currentGradeEl) refs.currentGradeEl.textContent = displayText;
        if (refs.bgYearEl) refs.bgYearEl.textContent = displayText;
        if (!refs.mainTitle) return;

        if (isAdminGrade(grade)) refs.mainTitle.innerHTML = getMainTitleMarkup(grade);
        else refs.mainTitle.textContent = getMainTitleMarkup(grade);
    }

    function isCardInSelectedGrade(cardGrade, grade) {
        return String(cardGrade) === String(grade);
    }

    function isVisibleCardInFlow(card) {
        const computedStyle = window.getComputedStyle(card);
        return computedStyle.display !== 'none' && computedStyle.position !== 'absolute' && computedStyle.position !== 'fixed';
    }

    function resetCardLayout(card) {
        card.style.position = '';
        card.style.left = '';
        card.style.top = '';
        card.style.width = '';
        card.style.height = '';
        card.style.transform = '';
        card.style.opacity = '';
        card.style.transition = '';
    }

    function refreshRefs() {
        refs.cards = document.querySelectorAll('.card');
        cards = refs.cards;
        refs.currentGradeEl = document.getElementById('current-grade');
        refs.prevBtn = document.getElementById('prev-grade-btn');
        refs.nextBtn = document.getElementById('next-grade-btn');
        refs.bgYearEl = document.getElementById('bg-year-watermark');
        refs.gridScrollArea = document.querySelector('.grid-scroll-area');
        refs.mainTitle = document.querySelector('.right-main-title');
        refs.grid = document.querySelector('.grid');
        refs.membersContainer = document.querySelector('.members-container');
    }

    function initData() {
        if (!refs.cards || refs.cards.length === 0) {
            console.warn('initData: No cards found in refs');
            return;
        }

        const rawGrades = [...new Set(Array.from(refs.cards).map(card => card.dataset.grade))];
        const adminGrade = rawGrades.includes(ADMIN_GRADE) ? [ADMIN_GRADE] : [];
        const yearGrades = rawGrades
            .filter(g => g !== ADMIN_GRADE && g !== undefined)
            .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
        
        grades = [...adminGrade, ...yearGrades];
        if (currentGradeIndex >= grades.length) currentGradeIndex = 0;
    }

    function initCardAugmentations() {
        refs.cards.forEach(card => {
            try {
                applyRoleIcons(card);
                ensureCardOverlay(card);
            } catch (err) {
                console.error('Error initializing card:', err, card);
            }
        });
    }

    function updateDisplay(direction = 'next', isInitialLoad = false) {
        if (!grades || grades.length === 0) {
            console.warn('updateDisplay: grades not ready', grades);
            return;
        }
        
        try {
            const selectedGrade = grades[currentGradeIndex];
            const { currentGradeEl, bgYearEl, gridScrollArea, mainTitle, grid } = refs;

            if (gridScrollArea) {
                gridScrollArea.style.overflowY = isAdminGrade(selectedGrade) ? 'hidden' : 'auto';
            }

            const { outClass, inClass } = getAnimationClasses(direction);

            if (!isInitialLoad) {
                let shouldAnimateTitle = false;
                if (mainTitle) {
                    const isCurrentlyLeaderPage = mainTitle.textContent.includes('TEAM');
                    const willBeLeaderPage = isAdminGrade(selectedGrade);
                    shouldAnimateTitle = (isCurrentlyLeaderPage !== willBeLeaderPage);
                }

                if (currentGradeEl) currentGradeEl.classList.add(outClass);
                if (mainTitle && shouldAnimateTitle) mainTitle.classList.add(outClass);
                if (bgYearEl) bgYearEl.classList.add(outClass);

                setTimeout(() => {
                    if (currentGradeEl) {
                        currentGradeEl.textContent = getDisplayText(selectedGrade);
                        currentGradeEl.style.transform = '';
                        currentGradeEl.style.letterSpacing = '';
                        currentGradeEl.classList.remove(outClass);
                        currentGradeEl.style.transition = 'none';
                        currentGradeEl.classList.add(inClass);
                        void currentGradeEl.offsetWidth;
                    }

                    if (bgYearEl) {
                        bgYearEl.textContent = getDisplayText(selectedGrade);
                        bgYearEl.classList.remove(outClass);
                        bgYearEl.style.transition = 'none';
                        bgYearEl.classList.add(inClass);
                        void bgYearEl.offsetWidth;
                    }

                    if (mainTitle && shouldAnimateTitle) {
                        if (isAdminGrade(selectedGrade)) mainTitle.innerHTML = LEADERS_TITLE_HTML;
                        else mainTitle.textContent = MEMBERS_TITLE;
                        mainTitle.classList.remove(outClass);
                        mainTitle.style.transition = 'none';
                        mainTitle.classList.add(inClass);
                        void mainTitle.offsetWidth;
                    }

                    setTimeout(() => {
                        const enterTransition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
                        if (currentGradeEl) {
                            currentGradeEl.style.transition = enterTransition;
                            currentGradeEl.classList.remove(inClass);
                        }
                        if (bgYearEl) {
                            bgYearEl.style.transition = enterTransition;
                            bgYearEl.classList.remove(inClass);
                        }
                        if (mainTitle && shouldAnimateTitle) {
                            mainTitle.style.transition = enterTransition;
                            mainTitle.classList.remove(inClass);
                        }
                    }, 50);
                }, 500);
            } else {
                setTitleContent(selectedGrade);
            }

            if (grid && window.getComputedStyle(grid).position === 'static') {
                grid.style.position = 'relative';
            }

            const exitVal = direction === 'next' ? CARD_ANIMATION_OFFSET : -CARD_ANIMATION_OFFSET;
            if (grid) {
                grid.style.height = '';
                grid.style.minHeight = '';
            }

            if (!isInitialLoad) {
                const exits = [];
                cards.forEach(card => {
                    if (isCardInSelectedGrade(card.dataset.grade, selectedGrade) || !isVisibleCardInFlow(card)) return;

                    const rect = card.getBoundingClientRect();
                    exits.push({
                        el: card,
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    });
                });

                const isLeavingAdmin = exits.length > 0 && exits.every((item) => isAdminGrade(item.el.dataset.grade));
                if (grid && isLeavingAdmin) {
                    grid.style.minHeight = grid.offsetHeight + 'px';
                    setTimeout(() => {
                        grid.style.minHeight = '';
                    }, CARD_ANIMATION_DURATION_MS);
                }

                exits.forEach(item => {
                    const card = item.el;
                    card.style.position = 'fixed';
                    card.style.transition = 'none';
                    card.style.marginTop = '0';
                    card.style.marginBottom = '0';
                    card.style.top = item.top + 'px';
                    card.style.left = item.left + 'px';
                    card.style.width = item.width + 'px';
                    card.style.height = item.height + 'px';
                    card.style.zIndex = '0';
                    card.style.pointerEvents = 'none';
                    card.classList.remove('card-centered-top');

                    void card.offsetWidth;

                    card.style.transition = `transform ${CARD_ANIMATION_DURATION_MS}ms cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity ${CARD_ANIMATION_DURATION_MS}ms ease`;
                    requestAnimationFrame(() => {
                        card.style.opacity = '0';
                        card.style.transform = `translateX(${exitVal}px)`;
                    });

                    setTimeout(() => {
                        if (!isCardInSelectedGrade(card.dataset.grade, grades[currentGradeIndex])) {
                            card.style.display = 'none';
                            resetCardLayout(card);
                        }
                    }, CARD_ANIMATION_DURATION_MS);
                });
            } else {
                applyGradeLayout(selectedGrade);
                cards.forEach(card => {
                    if (!isCardInSelectedGrade(card.dataset.grade, selectedGrade)) {
                        card.style.display = 'none';
                        card.classList.remove('card-centered-top');
                    }
                });
            }

            applyGradeLayout(selectedGrade);
            document.querySelectorAll('.flex-break-line').forEach(el => el.remove());

            let visibleCount = 0;
            const enterStartVal = direction === 'next' ? -CARD_ANIMATION_OFFSET : CARD_ANIMATION_OFFSET;

            cards.forEach(card => {
                const isSelected = isCardInSelectedGrade(card.dataset.grade, selectedGrade);

                if (isSelected) {
                    resetCardLayout(card);
                    card.style.zIndex = '1';
                    card.style.pointerEvents = 'auto';
                    card.style.transition = 'none';
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = `translateX(${enterStartVal}px)`;

                    if (isAdminGrade(selectedGrade)) {
                        card.style.marginTop = visibleCount < 2 ? '-32px' : '3px';
                        card.classList.remove('card-centered-top');

                        if (visibleCount === 1) {
                            const breakLine = document.createElement('div');
                            breakLine.className = 'flex-break-line';
                            breakLine.style.width = '100%';
                            breakLine.style.height = '0';
                            card.insertAdjacentElement('afterend', breakLine);
                        }
                    } else {
                        card.style.marginTop = '';
                        if (selectedGrade !== '2022' && visibleCount < 4) card.classList.add('card-centered-top');
                        else card.classList.remove('card-centered-top');
                    }

                    void card.offsetWidth;

                    const baseDelay = isInitialLoad ? 0 : CARD_ANIMATION_DURATION_MS;
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                        card.style.opacity = '1';
                        card.style.transform = '';

                        setTimeout(() => {
                            card.style.transition = '';
                        }, CARD_ANIMATION_DURATION_MS);
                    }, baseDelay + (visibleCount * CARD_STAGGER_MS));

                    visibleCount++;
                } else if (card.style.position !== 'absolute' && card.style.position !== 'fixed') {
                    card.style.display = 'none';
                }
            });

            setGridGap(selectedGrade, visibleCount);
        } catch (e) {
            console.error('Error in updateDisplay:', e);
        }
    }

    function fixMemberLayouts() {
        document.querySelectorAll('a.member-ch3nqu').forEach(card => {
            const roleTags = Array.from(card.querySelectorAll('.member-role-tag'));
            const pwn = roleTags.find(el => el.textContent.trim().toUpperCase() === 'PWN');
            const misc = roleTags.find(el => el.textContent.trim().toUpperCase() === 'MISC');
            if (pwn && misc) {
                pwn.style.display = 'inline-block';
                misc.style.display = 'inline-block';
                requestAnimationFrame(() => {
                    const pwnRect = pwn.getBoundingClientRect();
                    const pwnStyle = window.getComputedStyle(pwn);
                    misc.style.paddingLeft = pwnStyle.paddingLeft;
                    misc.style.paddingRight = pwnStyle.paddingRight;
                    misc.style.borderLeftWidth = pwnStyle.borderLeftWidth;
                    misc.style.borderRightWidth = pwnStyle.borderRightWidth;
                    misc.style.boxSizing = pwnStyle.boxSizing;
                    const w = Math.ceil(pwnRect.width);
                    if (w > 0) misc.style.width = w + 'px';
                });
            }
        });
    }

    function bindGradeButton(button, step, direction) {
        if (!button || button.dataset.bound === 'true') return;

        button.addEventListener('click', () => {
            shiftGrade(step);
            updateDisplay(direction);
        });
        button.dataset.bound = 'true';
    }

    function bindKeyboardNavigation() {
        if (window.membersKeysBound) return;

        document.addEventListener('keydown', (event) => {
            const membersSection = document.getElementById('section-members');
            const isVisible = membersSection &&
                membersSection.style.display !== 'none' &&
                !membersSection.classList.contains('hidden');

            if (!isVisible) return;

            if (event.key === 'ArrowLeft') {
                shiftGrade(-1);
                updateDisplay('prev');
            } else if (event.key === 'ArrowRight') {
                shiftGrade(1);
                updateDisplay('next');
            }
        });

        window.membersKeysBound = true;
    }

    function initMembers() {
        try {
            refreshRefs();
            if (!refs.cards || refs.cards.length === 0) {
                console.warn('initMembers: No cards found');
                return;
            }

            initData();
            initCardAugmentations();

            bindGradeButton(refs.prevBtn, -1, 'prev');
            bindGradeButton(refs.nextBtn, 1, 'next');
            bindKeyboardNavigation();

            fixMemberLayouts();
            updateDisplay('next', true);
        } catch (e) {
            console.error('Error in initMembers:', e);
        }
    }

    window.initMembers = initMembers;

    window.onMembersShow = function() {
        refreshRefs();

        if (refs.cards) {
            refs.cards.forEach(card => {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = '';
                card.style.transition = 'none';

                card.classList.remove('card-exit-up', 'card-exit-down', 'card-exit-left', 'card-enter-in');
            });
        }

        const rightPanelInner = document.querySelector('.members-right-panel-inner');
        if (rightPanelInner) {
            rightPanelInner.classList.remove('slide-in-down', 'panel-exit-right', 'panel-exit-left', 'panel-enter-from-right');
            rightPanelInner.style.opacity = '';
            rightPanelInner.style.transform = 'translateX(100%)';
            void rightPanelInner.offsetWidth;
            rightPanelInner.classList.add('panel-enter-from-right');
        }

        initMembers();
        updateDisplay('next', true);
        fixMemberLayouts();

        const visibleCards = refs.cards ? Array.from(refs.cards).filter(c => c.style.display !== 'none') : [];

        visibleCards.forEach(function (card) {
            card.style.opacity = '0';
            card.style.transform = `translateX(-${CARD_ANIMATION_OFFSET}px)`;
            card.style.transition = 'none';
        });
        if (refs.grid) void refs.grid.offsetWidth;

        const byTopThenLeft = visibleCards.slice().sort(function (a, b) {
            var ar = a.getBoundingClientRect();
            var br = b.getBoundingClientRect();
            var rowA = Math.round(ar.top / 30);
            var rowB = Math.round(br.top / 30);
            if (rowA !== rowB) return rowA - rowB;
            return ar.left - br.left;
        });
        byTopThenLeft.forEach(function (card, i) {
            var delayMs = i * CARD_STAGGER_MS;
            card.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            card.style.transitionDelay = delayMs + 'ms';
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    card.style.opacity = '1';
                    card.style.transform = '';
                });
            });
        });
        var lockDuration = Math.max(PANEL_ENTER_DURATION_MS, (byTopThenLeft.length - 1) * CARD_STAGGER_MS + CARD_ANIMATION_DURATION_MS) + 50;

        window.isMembersEntranceLock = true;
        setTimeout(function () {
            window.isMembersEntranceLock = false;
            if (refs.cards) {
                refs.cards.forEach(function (c) {
                    c.style.transition = '';
                    c.style.transitionDelay = '';
                });
            }
        }, lockDuration);
    };

    window.onMembersHide = function(direction = 'down') {
        refreshRefs();

        if (refs.cards) {
            const visibleCards = Array.from(refs.cards).filter(card => 
                card.style.display !== 'none' && card.style.opacity !== '0'
            );
            
            visibleCards.forEach((card, index) => {
                card.classList.add('card-exit-left');
                card.style.animationDelay = `${index * 0.05}s`;
            });
        }

        const rightPanelInner = document.querySelector('.members-right-panel-inner');
        if (rightPanelInner) {
            rightPanelInner.classList.remove('panel-exit-right', 'panel-exit-left', 'panel-enter-from-right');
            rightPanelInner.style.opacity = '';
            rightPanelInner.style.transform = '';
            void rightPanelInner.offsetWidth;
            rightPanelInner.classList.add('panel-exit-right');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMembers);
    } else {
        initMembers();
    }

})();
