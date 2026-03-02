
(function() {
    // =========================================================================
    // 1. GLOBAL STATE & UTILS
    // =========================================================================
    
    // State
    let isInitialized = false;
    let currentGradeIndex = 0;
    let grades = [];
    let cards = [];
    
    // DOM Elements Cache
    const refs = {
        cards: null,
        currentGradeEl: null,
        prevBtn: null,
        nextBtn: null,
        bgYearEl: null,
        gridScrollArea: null,
        mainTitle: null,
        grid: null
    };

    // Role Icons SVG Definitions
    const roleIcons = {
        'MISC': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M6,9H8V11H10V13H8V15H6V13H4V11H6V9M18.5,9A1.5,1.5 0 0,1 20,10.5A1.5,1.5 0 0,1 18.5,12A1.5,1.5 0 0,1 17,10.5A1.5,1.5 0 0,1 18.5,9M15.5,12A1.5,1.5 0 0,1 17,13.5A1.5,1.5 0 0,1 15.5,15A1.5,1.5 0 0,1 14,13.5A1.5,1.5 0 0,1 15.5,12M17,5A7,7 0 0,1 24,12A7,7 0 0,1 17,19C15.04,19 13.27,18.2 12,16.9C10.73,18.2 8.96,19 7,19A7,7 0 0,1 0,12A7,7 0 0,1 7,5H17M7,7A5,5 0 0,0 2,12A5,5 0 0,0 7,17C8.64,17 10.09,16.21 11,15H13C13.91,16.21 15.36,17 17,17A5,5 0 0,0 22,12A5,5 0 0,0 17,7H7Z" style="fill: currentcolor;"></path></svg>`,
        'PWN': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M11.25,6A3.25,3.25 0 0,1 14.5,2.75A3.25,3.25 0 0,1 17.75,6C17.75,6.42 18.08,6.75 18.5,6.75C18.92,6.75 19.25,6.42 19.25,6V5.25H20.75V6A2.25,2.25 0 0,1 18.5,8.25A2.25,2.25 0 0,1 16.25,6A1.75,1.75 0 0,0 14.5,4.25A1.75,1.75 0 0,0 12.75,6H14V7.29C16.89,8.15 19,10.83 19,14A7,7 0 0,1 12,21A7,7 0 0,1 5,14C5,10.83 7.11,8.15 10,7.29V6H11.25M22,6H24V7H22V6M19,4V2H20V4H19M20.91,4.38L22.33,2.96L23.04,3.67L21.62,5.09L20.91,4.38Z" style="fill: currentcolor;"></path></svg>`,
        'WEB': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" style="fill: currentcolor;"></path></svg>`,
        'RE': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M9.42,7.41L4.83,12L9.42,16.59L8,18L2,12L8,6L9.42,7.41M15.42,7.41L10.83,12L15.42,16.59L14,18L8,12L14,6L15.42,7.41M21.42,7.41L16.83,12L21.42,16.59L20,18L14,12L20,6L21.42,7.41Z" style="fill: currentcolor;"></path></svg>`,
        'CRYPTO': `<svg viewBox="0 0 24 24" role="presentation" style="width: 1.5rem; height: 1.5rem;"><path d="M2,2H6V4H4V20H6V22H2V2M20,4H18V2H22V22H18V20H20V4M9,5H10V10H11V11H8V10H9V6L8,6.5V5.5L9,5M15,13H16V18H17V19H14V18H15V14L14,14.5V13.5L15,13M9,13C10.1,13 11,14.34 11,16C11,17.66 10.1,19 9,19C7.9,19 7,17.66 7,16C7,14.34 7.9,13 9,13M9,14C8.45,14 8,14.9 8,16C8,17.1 8.45,18 9,18C9.55,18 10,17.1 10,16C10,14.9 9.55,14 9,14M15,5C16.1,5 17,6.34 17,8C17,9.66 16.1,11 15,11C13.9,11 13,9.66 13,8C13,6.34 13.9,5 15,5M15,6C14.45,6 14,6.9 14,8C14,9.1 14.45,10 15,10C15.55,10 16,9.1 16,8C16,6.9 15.55,6 15,6Z" style="fill: currentcolor;"></path></svg>`
    };

    // =========================================================================
    // 2. CORE FUNCTIONS
    // =========================================================================

    function refreshRefs() {
        refs.cards = document.querySelectorAll('.card');
        cards = refs.cards; // Global ref update
        refs.currentGradeEl = document.getElementById('current-grade');
        refs.prevBtn = document.getElementById('prev-grade-btn');
        refs.nextBtn = document.getElementById('next-grade-btn');
        refs.bgYearEl = document.getElementById('bg-year-watermark');
        refs.gridScrollArea = document.querySelector('.grid-scroll-area');
        refs.mainTitle = document.querySelector('.right-main-title');
        refs.grid = document.querySelector('.grid');
    }

    function initData() {
        if (!refs.cards || refs.cards.length === 0) {
            console.warn('initData: No cards found in refs');
            return;
        }
        
        // Debug: Log first card's dataset to check if data-grade is readable
        console.log('initData: Checking first card dataset:', refs.cards[0].dataset);

        const rawGrades = [...new Set(Array.from(refs.cards).map(card => card.dataset.grade))];
        console.log('initData: Raw grades found:', rawGrades);

        const adminGrade = rawGrades.includes('0000') ? ['0000'] : [];
        const yearGrades = rawGrades
            .filter(g => g !== '0000' && g !== undefined) // Filter undefined just in case
            .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
        
        grades = [...adminGrade, ...yearGrades];
        console.log('initData: Final grades list:', grades);

        // Reset index if out of bounds, else keep it (e.g. for persistence)
        if (currentGradeIndex >= grades.length) currentGradeIndex = 0;
    }

    function initCardAugmentations() {
        // From card.js: Add Icons and Overlays
        refs.cards.forEach(card => {
            try {
                // 1. Role Icons
                const roleTags = card.querySelectorAll('.member-role-tag');
                const iconContainers = card.querySelectorAll('.role-icon-placeholder');
                
                roleTags.forEach((roleTag, index) => {
                    const iconContainer = iconContainers[index];
                    if (roleTag && iconContainer) {
                        const role = roleTag.textContent.trim().toUpperCase();
                        const iconSvg = roleIcons[role];
                        
                        iconContainer.setAttribute('data-role', role);
                        if (iconSvg) {
                            iconContainer.innerHTML = iconSvg;
                        }
                    }
                });

                // 2. Link Overlays (Avoid duplication)
                if (card.querySelector('.card-links-overlay')) return;

                const originalHref = card.getAttribute('href');
                const hasBlog = originalHref && originalHref !== '#' && originalHref !== '';
                const githubLink = card.dataset.github; 
                const hasGithub = githubLink && githubLink !== '';

                if (hasBlog || hasGithub) {
                    const overlay = document.createElement('div');
                    overlay.className = 'card-links-overlay';
                    
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
                    
                    overlay.innerHTML = buttonsHtml;
                const avatarContainer = card.querySelector('.member-avatar-circle');
                if (avatarContainer) {
                    avatarContainer.appendChild(overlay);
                    console.log('Overlay added to avatar container for card:', card.dataset.grade);
                } else {
                    card.appendChild(overlay);
                    console.log('Overlay added to card body for card:', card.dataset.grade);
                }
                
                card.addEventListener('click', (e) => {
                     if (!e.target.closest('.link-btn')) {
                         e.preventDefault();
                     }
                });
            } else {
                 card.addEventListener('click', (e) => {
                     e.preventDefault();
                 });
            }
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

            // 1. Scroll Handling
            if (gridScrollArea) {
                gridScrollArea.style.overflowY = (selectedGrade === '0000') ? 'hidden' : 'auto';
            }

            // 2. Animations Config
            let outClass = (direction === 'next') ? 'grade-anim-out-right' : 'grade-anim-out-left';
            let inClass = (direction === 'next') ? 'grade-anim-in-from-left' : 'grade-anim-in-from-right';

            // 3. Title & Header Update with Animation
            if (!isInitialLoad) {
                let shouldAnimateTitle = false;
                if (mainTitle) {
                    const isCurrentlyLeaderPage = mainTitle.textContent.includes('TEAM');
                    const willBeLeaderPage = (selectedGrade === '0000');
                    shouldAnimateTitle = (isCurrentlyLeaderPage !== willBeLeaderPage);
                }

                if (currentGradeEl) currentGradeEl.classList.add(outClass);
                if (mainTitle && shouldAnimateTitle) mainTitle.classList.add(outClass);
                if (bgYearEl) bgYearEl.classList.add(outClass);

                setTimeout(() => {
                    const displayText = (selectedGrade === '0000') ? 'ADMIN' : selectedGrade;
                    if (currentGradeEl) {
                        currentGradeEl.textContent = displayText;
                        currentGradeEl.style.transform = '';
                        currentGradeEl.style.letterSpacing = '';
                        currentGradeEl.classList.remove(outClass);
                        currentGradeEl.style.transition = 'none';
                        currentGradeEl.classList.add(inClass);
                        void currentGradeEl.offsetWidth; // Force reflow
                    }

                    if (bgYearEl) {
                        bgYearEl.textContent = displayText;
                        bgYearEl.classList.remove(outClass);
                        bgYearEl.style.transition = 'none';
                        bgYearEl.classList.add(inClass);
                        void bgYearEl.offsetWidth;
                    }

                    if (mainTitle && shouldAnimateTitle) {
                        if (selectedGrade === '0000') mainTitle.innerHTML = 'TEAM<br>LEADERS';
                        else mainTitle.textContent = 'MEMBERS';
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
                // Instant update for initial load
                const displayText = (selectedGrade === '0000') ? 'ADMIN' : selectedGrade;
                if (currentGradeEl) currentGradeEl.textContent = displayText;
                if (bgYearEl) bgYearEl.textContent = displayText;
                if (mainTitle) {
                    if (selectedGrade === '0000') mainTitle.innerHTML = 'TEAM<br>LEADERS';
                    else mainTitle.textContent = 'MEMBERS';
                }
            }

            // 4. Card Grid Animation (Exit & Enter)
    // Note: For SPA, we want to ensure grid has relative positioning for absolute animations
    if (grid && window.getComputedStyle(grid).position === 'static') {
        grid.style.position = 'relative';
    }

    // A. Exit Phase
    if (!isInitialLoad) {
        let startVal = (direction === 'next') ? '-50px' : '50px';
        let exitVal = (direction === 'next') ? '50px' : '-50px';
        
        if (grid) { grid.style.height = ''; grid.style.minHeight = ''; }

        const exits = [];
        cards.forEach(card => {
            // Fix: Ensure we compare strings to strings or numbers to numbers
            const cardGrade = String(card.dataset.grade);
            const currentSelectedGrade = String(selectedGrade);
            
            const isSelected = (currentSelectedGrade === '0000' && cardGrade === '0000') || (currentSelectedGrade !== '0000' && cardGrade === currentSelectedGrade);
            const computedStyle = window.getComputedStyle(card);
            const isVisibleInFlow = (computedStyle.display !== 'none' && computedStyle.position !== 'absolute');
            
            if (!isSelected && isVisibleInFlow) {
                const rect = card.getBoundingClientRect();
                const gridRect = grid ? grid.getBoundingClientRect() : {left:0, top:0};
                exits.push({ 
                    el: card, 
                    left: rect.left - gridRect.left, 
                    top: rect.top - gridRect.top, 
                    width: rect.width, 
                    height: rect.height 
                });
            }
        });

        // Admin 切到年份时：锁定 grid 高度，避免两张 Admin 卡 absolute 后 grid 塌陷导致卡片视觉上移
        const isLeavingAdmin = exits.length > 0 && exits.every(function (x) { return String(x.el.dataset.grade) === '0000'; });
        const exitDuration = 500;
        if (grid && isLeavingAdmin) {
            grid.style.minHeight = grid.offsetHeight + 'px';
            setTimeout(function () {
                grid.style.minHeight = '';
            }, exitDuration);
        }

        exits.forEach(item => {
            const card = item.el;
            card.style.position = 'absolute';
            card.style.transition = 'none';
            card.style.marginTop = '0'; // 避免 Admin 卡 -32px/3px 的 margin 导致 absolute 后“上外边距”与边框盒错位而上移
            card.style.marginBottom = '0';
            
            // Adjust for border if needed
            let borderTop = 0;
            let borderLeft = 0;
            if (grid) {
                const gridComputed = window.getComputedStyle(grid);
                borderTop = parseFloat(gridComputed.borderTopWidth) || 0;
                borderLeft = parseFloat(gridComputed.borderLeftWidth) || 0;
            }

            card.style.top = (item.top - borderTop) + 'px';
            card.style.left = (item.left - borderLeft) + 'px';
            card.style.width = item.width + 'px';
            card.style.height = item.height + 'px';
            card.style.zIndex = '0';
            card.style.pointerEvents = 'none';
            card.classList.remove('card-centered-top');
            
            void card.offsetWidth;
            
            card.style.transition = `transform ${exitDuration}ms cubic-bezier(0.55, 0.055, 0.675, 0.19), opacity ${exitDuration}ms ease`;
            requestAnimationFrame(() => { 
                card.style.opacity = '0'; 
                card.style.transform = `translateX(${exitVal})`; 
            });

            setTimeout(() => {
                // Double check before hiding
                const currentCardGrade = String(card.dataset.grade);
                const currentSelGrade = String(grades[currentGradeIndex]);
                
                if (currentCardGrade !== currentSelGrade) {
                    card.style.display = 'none';
                    card.style.position = '';
                    card.style.width = '';
                    card.style.height = '';
                    card.style.top = '';
                    card.style.left = '';
                    card.style.transform = '';
                    card.style.opacity = '';
                    card.style.transition = '';
                }
            }, exitDuration);
        });
    } else {
        // Simple hide for initial load
        cards.forEach(card => {
            const cardGrade = String(card.dataset.grade);
            const currentSelectedGrade = String(selectedGrade);
            
            if (cardGrade !== currentSelectedGrade) {
                card.style.display = 'none';
                card.classList.remove('card-centered-top');
            }
        });
    }

    // B. Enter Phase
    document.querySelectorAll('.flex-break-line').forEach(el => el.remove());
    let visibleCount = 0;
    let enterStartVal = (direction === 'next') ? '-50px' : '50px';

    cards.forEach(card => {
        const cardGrade = String(card.dataset.grade);
        const currentSelectedGrade = String(selectedGrade);
        const isSelected = (cardGrade === currentSelectedGrade);
        
        if (isSelected) {
            // Reset styles
            card.style.position = '';
            card.style.left = '';
            card.style.top = '';
            card.style.width = '';
            card.style.height = '';
            card.style.zIndex = '1';
            card.style.pointerEvents = 'auto'; // Explicitly set to auto
            card.style.transition = 'none';
            card.style.display = 'block';
            card.style.opacity = '0';
            card.style.transform = `translateX(${enterStartVal})`;
            
            // Specific styling logic for Admin vs Members
            if (currentSelectedGrade === '0000') {
                if (visibleCount < 2) card.style.marginTop = '-32px'; 
                else card.style.marginTop = '3px';
                
                card.classList.remove('card-centered-top');
                
                // Insert break line for layout
                if (visibleCount === 1) {
                    const breakLine = document.createElement('div');
                    breakLine.className = 'flex-break-line';
                    breakLine.style.width = '100%';
                    breakLine.style.height = '0';
                    card.insertAdjacentElement('afterend', breakLine);
                }
            } else {
                card.style.marginTop = '';
                if (visibleCount < 4) card.classList.add('card-centered-top'); 
                else card.classList.remove('card-centered-top');
            }

            void card.offsetWidth;
            
            const baseDelay = isInitialLoad ? 0 : 500;
            setTimeout(() => { 
                card.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'; 
                card.style.opacity = '1'; 
                card.style.transform = ''; 
                
                // Restore CSS transition for hover effects after animation completes
                setTimeout(() => {
                    card.style.transition = ''; 
                }, 500);
            }, baseDelay + (visibleCount * 100));
            
            visibleCount++;
        } else if (card.style.position !== 'absolute') {
            // Double check to hide others not animating out
            card.style.display = 'none';
        }
    });

            // Grid Gap Adjustment
            if (grid) {
                if (selectedGrade === '0000') grid.style.gap = '15px 65px';
                else if (visibleCount < 4) grid.style.gap = '50px';
                else grid.style.gap = '15px';
            }
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

    // =========================================================================
    // 3. INITIALIZATION
    // =========================================================================

    function initMembers() {
        try {
            refreshRefs();
            if (!refs.cards || refs.cards.length === 0) {
                console.warn('initMembers: No cards found');
                return;
            }

            initData();
            initCardAugmentations();
            
            // Event Listeners (ensure single binding)
            if (refs.prevBtn && !refs.prevBtn.dataset.bound) {
                refs.prevBtn.addEventListener('click', () => {
                    console.log('Prev clicked');
                    currentGradeIndex = (currentGradeIndex === 0) ? grades.length - 1 : currentGradeIndex - 1;
                    updateDisplay('prev');
                });
                refs.prevBtn.dataset.bound = "true";
            } else if (!refs.prevBtn) {
                console.warn('initMembers: Prev button not found');
            }

            if (refs.nextBtn && !refs.nextBtn.dataset.bound) {
                refs.nextBtn.addEventListener('click', () => {
                    console.log('Next clicked');
                    currentGradeIndex = (currentGradeIndex === grades.length - 1) ? 0 : currentGradeIndex + 1;
                    updateDisplay('next');
                });
                refs.nextBtn.dataset.bound = "true";
            } else if (!refs.nextBtn) {
                console.warn('initMembers: Next button not found');
            }

            // Global Keydown (filtered by section visibility)
            if (!window.membersKeysBound) {
                document.addEventListener('keydown', (e) => {
                    const membersSection = document.getElementById('section-members');
                    const isVisible = membersSection && 
                                      membersSection.style.display !== 'none' && 
                                      !membersSection.classList.contains('hidden');
                    
                    if (isVisible) {
                        if (e.key === 'ArrowLeft') {
                            currentGradeIndex = (currentGradeIndex === 0) ? grades.length - 1 : currentGradeIndex - 1;
                            updateDisplay('prev');
                        } else if (e.key === 'ArrowRight') {
                            currentGradeIndex = (currentGradeIndex === grades.length - 1) ? 0 : currentGradeIndex + 1;
                            updateDisplay('next');
                        }
                    }
                });
                window.membersKeysBound = true;
            }

            fixMemberLayouts();

            // Initial Display
            updateDisplay('next', true);
            isInitialized = true;
            console.log('Members initialized successfully');
        } catch (e) {
            console.error('Error in initMembers:', e);
        }
    }

    // Expose Global Init Function
    window.initMembers = initMembers;
    
    // Expose Refresh Function for SPA Transitions
    window.onMembersShow = function() {
        // Ensure DOM is ready and refs are fresh
        refreshRefs();
        
        // 1. Hide all cards immediately to prevent "ghosting" from previous state
        if (refs.cards) {
            refs.cards.forEach(card => {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = '';
                card.style.transition = 'none';
                
                // Remove exit/enter animations if any
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
        
        // Optional: Animate Header as "Surrounding UI" -> REMOVED per user request
        // const header = document.querySelector('.main-header');
        // if (header) {
        //      header.classList.remove('slide-in-down');
        //      void header.offsetWidth;
        //      header.classList.add('slide-in-down');
        // }

        // 2. Re-initialize logic
        initMembers();
        
        // 3. Force layout update without animation (isInitialLoad = true)
        updateDisplay('next', true);
        fixMemberLayouts();

        // 4. 卡片切入动画：与页内年份切页的 card 切换一致（transition 0.5s ease-out + cubic-bezier）
        const visibleCards = refs.cards ? Array.from(refs.cards).filter(c => c.style.display !== 'none') : [];
        const ENTRANCE_STAGGER_MS = 100; // 与 updateDisplay 里年份切页的 stagger 一致
        const CARD_ENTER_DURATION_MS = 500;
        const PANEL_ENTER_DURATION = 0.7;

        visibleCards.forEach(function (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-50px)'; // 与年份 next 方向一致
            card.style.transition = 'none';
        });
        if (refs.grid) void refs.grid.offsetWidth;
        // 按视觉顺序：从上到下、从左往右排序（与切出顺序对称，先出现的先进入）
        const byTopThenLeft = visibleCards.slice().sort(function (a, b) {
            var ar = a.getBoundingClientRect();
            var br = b.getBoundingClientRect();
            var rowA = Math.round(ar.top / 30);
            var rowB = Math.round(br.top / 30);
            if (rowA !== rowB) return rowA - rowB;
            return ar.left - br.left;
        });
        byTopThenLeft.forEach(function (card, i) {
            var delayMs = i * ENTRANCE_STAGGER_MS;
            card.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
            card.style.transitionDelay = delayMs + 'ms';
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    card.style.opacity = '1';
                    card.style.transform = '';
                });
            });
        });
        var lockDuration = Math.max(PANEL_ENTER_DURATION * 1000, (byTopThenLeft.length - 1) * ENTRANCE_STAGGER_MS + CARD_ENTER_DURATION_MS) + 50;

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

    // Expose Hide Function for SPA Transitions (Exit Animation)
    window.onMembersHide = function(direction = 'down') {
        refreshRefs();
        
        // 1. Animate Cards (Staggered Exit)
        if (refs.cards) {
            const visibleCards = Array.from(refs.cards).filter(card => 
                card.style.display !== 'none' && card.style.opacity !== '0'
            );
            
            visibleCards.forEach((card, index) => {
                // 不论上下滚动，切出时 card 统一向左位移
                card.classList.add('card-exit-left');
                card.style.animationDelay = `${index * 0.05}s`;
            });
        }

        // 2. 右半部分整块退出：不论上下滚动，统一向右位移
        const rightPanelInner = document.querySelector('.members-right-panel-inner');
        if (rightPanelInner) {
            rightPanelInner.classList.remove('panel-exit-right', 'panel-exit-left', 'panel-enter-from-right');
            rightPanelInner.style.opacity = '';
            rightPanelInner.style.transform = '';
            void rightPanelInner.offsetWidth;
            rightPanelInner.classList.add('panel-exit-right');
        }
    };

    // Auto-init if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMembers);
    } else {
        initMembers();
    }

})();
