/* ==========================================================================
   ConcertBet — Main JavaScript
   Animations, interactions, and particle effects
   ========================================================================== */

(function () {
    'use strict';

    /* ---------- Particles Background ---------- */
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let width, height;

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            const count = Math.min(Math.floor((width * height) / 25000), 60);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.5 + 0.1,
                    hue: Math.random() > 0.5 ? 262 : 330 // violet or pink
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(function (p) {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = 'hsla(' + p.hue + ', 70%, 60%, ' + p.opacity + ')';
                ctx.fill();
            });

            // Draw connections between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'hsla(262, 70%, 60%, ' + (0.06 * (1 - dist / 150)) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationId = requestAnimationFrame(drawParticles);
        }

        // Only animate if user doesn't prefer reduced motion
        var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!motionQuery.matches) {
            resizeCanvas();
            createParticles();
            drawParticles();

            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    resizeCanvas();
                    createParticles();
                }, 200);
            });
        }

        // Pause animation when tab is not visible
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else if (!motionQuery.matches) {
                drawParticles();
            }
        });
    }

    /* ---------- Navigation ---------- */
    var nav = document.getElementById('mainNav');
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');

    // Scroll behavior
    var lastScroll = 0;
    window.addEventListener('scroll', function () {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollY > 50) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }

        lastScroll = scrollY;
    }, { passive: true });

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var isOpen = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu on link click
        var navLinks = navMenu.querySelectorAll('.nav__link, .nav__cta');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                navToggle.focus();
            }
        });
    }

    /* ---------- Scroll Reveal ---------- */
    var revealElements = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        // Fallback: just show everything
        revealElements.forEach(function (el) {
            el.classList.add('revealed');
        });
    }

    /* ---------- Counter Animation ---------- */
    var statNumbers = document.querySelectorAll('.hero__stat-number[data-count]');

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-count'), 10);
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(eased * target);
            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && statNumbers.length > 0) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function (el) {
            counterObserver.observe(el);
        });
    }

    /* ---------- Scoring Bars Animation ---------- */
    var scoringBars = document.querySelectorAll('.scoring__bar-fill[data-width]');

    if ('IntersectionObserver' in window && scoringBars.length > 0) {
        var barObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var targetWidth = entry.target.getAttribute('data-width');
                    entry.target.style.setProperty('--target-width', targetWidth);
                    entry.target.classList.add('animated');
                    barObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        scoringBars.forEach(function (el) {
            barObserver.observe(el);
        });
    }

    /* ---------- Staggered Reveal for Grids ---------- */
    var gridSections = document.querySelectorAll('.modes__grid, .cities__grid, .showcase__grid, .discovery__grid');

    gridSections.forEach(function (grid) {
        var cards = grid.querySelectorAll('.reveal');
        cards.forEach(function (card, index) {
            card.style.transitionDelay = (index * 0.1) + 's';
        });
    });

    /* ---------- FAQ Accordion Behavior ---------- */
    var faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(function (item) {
        var summary = item.querySelector('summary');
        if (summary) {
            summary.addEventListener('click', function (e) {
                // Close other items (accordion behavior)
                faqItems.forEach(function (other) {
                    if (other !== item && other.hasAttribute('open')) {
                        other.removeAttribute('open');
                    }
                });
            });
        }
    });

    /* ---------- Smooth Scroll for Anchor Links ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /* ---------- Lazy Image Error Handling ---------- */
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
        img.addEventListener('error', function () {
            this.style.opacity = '0.3';
            this.alt = 'Image unavailable';
        });
    });

    /* ---------- Trip Builder Wizard ---------- */
    var tbCard = document.querySelector('.trip-builder__card');
    if (tbCard) {
        var tbSteps = tbCard.querySelectorAll('.trip-builder__step');
        var tbProgressFill = document.getElementById('tbProgressFill');
        var tbProgressSteps = tbCard.querySelectorAll('.trip-builder__progress-step');
        var tbPrev = document.getElementById('tbPrev');
        var tbNext = document.getElementById('tbNext');
        var tbRestart = document.getElementById('tbRestart');
        var tbCityInput = document.getElementById('tbCity');
        var tbResultsContainer = document.getElementById('tbResults');
        var tbResultsDesc = document.getElementById('tbResultsDesc');

        var tbCurrentStep = 1;
        var tbTotalSteps = 4;
        var tbSelections = { city: '', distance: '', budget: '', vibe: '' };

        function tbShowStep(stepNum) {
            tbSteps.forEach(function (s) { s.classList.remove('trip-builder__step--active'); });
            var target = tbCard.querySelector('.trip-builder__step[data-step="' + stepNum + '"]');
            if (target) target.classList.add('trip-builder__step--active');

            // Update progress
            var pct = stepNum === 'results' ? 100 : (stepNum / tbTotalSteps) * 100;
            tbProgressFill.style.width = pct + '%';

            tbProgressSteps.forEach(function (ps) {
                var psStep = parseInt(ps.getAttribute('data-step'), 10);
                ps.classList.remove('trip-builder__progress-step--active', 'trip-builder__progress-step--completed');
                if (stepNum === 'results' || psStep < stepNum) {
                    ps.classList.add('trip-builder__progress-step--completed');
                } else if (psStep === stepNum) {
                    ps.classList.add('trip-builder__progress-step--active');
                }
            });

            // Button states
            if (stepNum === 'results') {
                tbPrev.style.display = 'none';
                tbNext.style.display = 'none';
            } else {
                tbPrev.style.display = '';
                tbNext.style.display = '';
                tbPrev.disabled = stepNum === 1;
                tbNext.querySelector('span').textContent = stepNum === tbTotalSteps ? 'Generate Trips' : 'Next';
            }
        }

        // Quick pick city buttons
        var quickBtns = tbCard.querySelectorAll('.trip-builder__quick-btn');
        quickBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                tbCityInput.value = btn.getAttribute('data-city');
                tbSelections.city = btn.getAttribute('data-city');
            });
        });

        // Option selection
        tbCard.addEventListener('click', function (e) {
            var option = e.target.closest('.trip-builder__option');
            if (!option) return;

            var step = option.closest('.trip-builder__step');
            if (!step) return;

            var stepNum = step.getAttribute('data-step');
            var siblings = step.querySelectorAll('.trip-builder__option');
            siblings.forEach(function (s) { s.classList.remove('trip-builder__option--selected'); });
            option.classList.add('trip-builder__option--selected');

            var value = option.getAttribute('data-value');
            if (stepNum === '2') tbSelections.distance = value;
            if (stepNum === '3') tbSelections.budget = value;
            if (stepNum === '4') tbSelections.vibe = value;
        });

        // Navigation
        tbNext.addEventListener('click', function () {
            if (tbCurrentStep === 1) {
                tbSelections.city = tbCityInput.value.trim() || 'London';
            }

            if (tbCurrentStep < tbTotalSteps) {
                tbCurrentStep++;
                tbShowStep(tbCurrentStep);
            } else {
                // Generate results
                tbGenerateResults();
                tbShowStep('results');
            }
        });

        tbPrev.addEventListener('click', function () {
            if (tbCurrentStep > 1) {
                tbCurrentStep--;
                tbShowStep(tbCurrentStep);
            }
        });

        if (tbRestart) {
            tbRestart.addEventListener('click', function () {
                tbCurrentStep = 1;
                tbSelections = { city: '', distance: '', budget: '', vibe: '' };
                tbCityInput.value = '';
                tbCard.querySelectorAll('.trip-builder__option--selected').forEach(function (o) {
                    o.classList.remove('trip-builder__option--selected');
                });
                tbShowStep(1);
            });
        }

        // Progress step click navigation
        tbProgressSteps.forEach(function (ps) {
            ps.addEventListener('click', function () {
                var targetStep = parseInt(ps.getAttribute('data-step'), 10);
                if (targetStep <= tbCurrentStep) {
                    tbCurrentStep = targetStep;
                    tbShowStep(tbCurrentStep);
                }
            });
        });

        // Trip data for result generation
        var tripDatabase = [
            { title: 'Techno Weekend in Berlin', venue: 'Berghain', city: 'Berlin', route: 'Sisyphos pregame → Berghain → Tresor afterparty', cost: 420, distance: '650 km', score: 96, return: 'Sunday 6PM', genre: 'dance' },
            { title: 'Arena Night in London', venue: 'The O2', city: 'London', route: 'Shoreditch dinner → O2 Arena → Fabric late night', cost: 490, distance: '340 km', score: 91, return: 'Saturday night train', genre: 'singalong' },
            { title: 'Indie Night in Toronto', venue: 'Velvet Underground', city: 'Toronto', route: 'King West pregame → Velvet Underground → CODA', cost: 310, distance: '540 km', score: 88, return: 'Sunday AM flight', genre: 'solo' },
            { title: 'Latin Heat in Mexico City', venue: 'Foro Sol', city: 'Mexico City', route: 'Roma Norte dinner → Foro Sol → Condesa afterparty', cost: 380, distance: '780 km', score: 93, return: 'Sunday 4PM', genre: 'dance' },
            { title: 'Jazz & Soul in Paris', venue: 'Olympia', city: 'Paris', route: 'Le Marais cocktails → Olympia → Pigalle clubs', cost: 350, distance: '450 km', score: 89, return: 'Sunday noon train', genre: 'date' },
            { title: 'Rock Legends in Manchester', venue: 'Manchester Arena', city: 'Manchester', route: 'Northern Quarter pubs → Arena → Warehouse Project', cost: 280, distance: '290 km', score: 87, return: 'Same night train', genre: 'friends' },
            { title: 'K-Pop Extravaganza in Tokyo', venue: 'Budokan', city: 'Tokyo', route: 'Shibuya izakaya → Budokan → Roppongi', cost: 680, distance: '9500 km', score: 95, return: 'Monday AM', genre: 'singalong' },
            { title: 'Hip-Hop Night in New York', venue: 'Brooklyn Steel', city: 'New York', route: 'Williamsburg dinner → Brooklyn Steel → LES bars', cost: 440, distance: '560 km', score: 92, return: 'Sunday PM', genre: 'friends' },
            { title: 'House Music Marathon Amsterdam', venue: 'Paradiso', city: 'Amsterdam', route: 'Jordaan pregame → Paradiso → De School', cost: 360, distance: '520 km', score: 90, return: 'Sunday evening', genre: 'dance' },
            { title: 'Acoustic Evening in Dublin', venue: 'Whelan\'s', city: 'Dublin', route: 'Temple Bar crawl → Whelan\'s → late night Doyle\'s', cost: 250, distance: '460 km', score: 85, return: 'Sunday morning', genre: 'solo' }
        ];

        function tbGenerateResults() {
            var filtered = tripDatabase.slice();

            // Filter by budget
            if (tbSelections.budget === '$200') {
                filtered = filtered.filter(function (t) { return t.cost <= 200; });
            } else if (tbSelections.budget === '$500') {
                filtered = filtered.filter(function (t) { return t.cost <= 500; });
            }

            // Filter by distance
            if (tbSelections.distance === '300km') {
                filtered = filtered.filter(function (t) { return parseInt(t.distance) <= 300; });
            } else if (tbSelections.distance === '800km') {
                filtered = filtered.filter(function (t) { return parseInt(t.distance) <= 800; });
            }

            // Sort by score
            filtered.sort(function (a, b) { return b.score - a.score; });

            // Take top 3-4 results (at least show some even if filters are tight)
            if (filtered.length === 0) filtered = tripDatabase.slice(0, 3);
            filtered = filtered.slice(0, 4);

            tbResultsDesc.textContent = 'Trips from ' + (tbSelections.city || 'London') + ' · ' + (tbSelections.distance || 'Any distance') + ' · ' + (tbSelections.budget || 'Any budget') + ' · ' + (tbSelections.vibe || 'Any vibe');

            tbResultsContainer.innerHTML = '';
            filtered.forEach(function (trip) {
                var savedTrips = JSON.parse(localStorage.getItem('concertbet_saved') || '[]');
                var isSaved = savedTrips.some(function (s) { return s.title === trip.title; });

                var div = document.createElement('div');
                div.className = 'trip-builder__result';
                div.innerHTML =
                    '<div class="trip-builder__result-header">' +
                        '<span class="trip-builder__result-title">' + trip.title + '</span>' +
                        '<span class="trip-builder__result-score">' + trip.score + '</span>' +
                    '</div>' +
                    '<div class="trip-builder__result-route">' + trip.route + '</div>' +
                    '<div class="trip-builder__result-meta">' +
                        '<span>$' + trip.cost + ' all-in</span>' +
                        '<span>&middot;</span>' +
                        '<span>' + trip.distance + '</span>' +
                        '<span>&middot;</span>' +
                        '<span>Return: ' + trip.return + '</span>' +
                    '</div>' +
                    '<div class="trip-builder__result-actions">' +
                        '<button class="trip-builder__result-save' + (isSaved ? ' trip-builder__result-save--saved' : '') + '" data-trip=\'' + JSON.stringify(trip).replace(/'/g, '&#39;') + '\'>' +
                            '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (isSaved ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>' +
                            (isSaved ? 'Saved' : 'Save Trip') +
                        '</button>' +
                    '</div>';
                tbResultsContainer.appendChild(div);
            });
        }

        // Save trip from builder results
        tbResultsContainer.addEventListener('click', function (e) {
            var saveBtn = e.target.closest('.trip-builder__result-save');
            if (!saveBtn) return;

            var tripData = JSON.parse(saveBtn.getAttribute('data-trip'));
            toggleSavedTrip(tripData, saveBtn, 'trip-builder__result-save--saved');
        });
    }

    /* ---------- Saved Trips System ---------- */
    function getSavedTrips() {
        try { return JSON.parse(localStorage.getItem('concertbet_saved') || '[]'); }
        catch (e) { return []; }
    }

    function saveTripsList(trips) {
        localStorage.setItem('concertbet_saved', JSON.stringify(trips));
        updateSavedCount();
        renderSavedDrawer();
    }

    function toggleSavedTrip(tripData, btnEl, savedClass) {
        var trips = getSavedTrips();
        var existingIndex = trips.findIndex(function (t) { return t.title === tripData.title; });

        if (existingIndex > -1) {
            trips.splice(existingIndex, 1);
            if (btnEl) {
                btnEl.classList.remove(savedClass);
                var label = btnEl.querySelector('span');
                if (label) label.textContent = 'Save Trip';
                var svg = btnEl.querySelector('svg');
                if (svg) svg.setAttribute('fill', 'none');
            }
        } else {
            tripData.savedAt = Date.now();
            trips.push(tripData);
            if (btnEl) {
                btnEl.classList.add(savedClass);
                var label = btnEl.querySelector('span');
                if (label) label.textContent = 'Saved';
                var svg = btnEl.querySelector('svg');
                if (svg) svg.setAttribute('fill', 'currentColor');
            }
        }

        saveTripsList(trips);
    }

    function updateSavedCount() {
        var countEl = document.getElementById('savedCount');
        if (!countEl) return;
        var count = getSavedTrips().length;
        countEl.textContent = count;
        countEl.style.display = count > 0 ? 'flex' : 'none';
    }

    // Showcase save buttons
    var showcaseSaveBtns = document.querySelectorAll('.showcase__save-btn');
    var showcaseTripData = {
        'berlin-techno': { title: 'Techno Weekend in Berlin', venue: 'Berghain', city: 'Berlin', route: 'Sisyphos → Berghain → Tresor', cost: 420, distance: '650 km', score: 96, return: 'Sunday 6PM' },
        'london-arena': { title: 'Arena Night in London', venue: 'The O2', city: 'London', route: 'Shoreditch → O2 → Fabric', cost: 490, distance: '340 km', score: 91, return: 'Saturday train' },
        'toronto-indie': { title: 'Indie Night in Toronto', venue: 'Velvet Underground', city: 'Toronto', route: 'King West → Velvet Underground → CODA', cost: 310, distance: '540 km', score: 88, return: 'Sunday AM flight' }
    };

    showcaseSaveBtns.forEach(function (btn) {
        var tripId = btn.getAttribute('data-trip-id');
        var trips = getSavedTrips();
        var isSaved = trips.some(function (t) { return t.title === showcaseTripData[tripId].title; });
        if (isSaved) {
            btn.classList.add('showcase__save-btn--saved');
            var label = btn.querySelector('span');
            if (label) label.textContent = 'Saved';
            var svg = btn.querySelector('svg');
            if (svg) svg.setAttribute('fill', 'currentColor');
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var td = showcaseTripData[tripId];
            if (td) toggleSavedTrip(td, btn, 'showcase__save-btn--saved');
        });
    });

    // Saved trips drawer
    var savedToggle = document.getElementById('savedToggle');
    var savedDrawer = document.getElementById('savedDrawer');
    var savedOverlay = document.getElementById('savedOverlay');
    var savedClose = document.getElementById('savedClose');
    var savedList = document.getElementById('savedList');
    var savedEmpty = document.getElementById('savedEmpty');

    function openSavedDrawer() {
        if (savedDrawer) savedDrawer.classList.add('saved-trips__drawer--open');
        if (savedOverlay) savedOverlay.classList.add('saved-trips__overlay--visible');
        document.body.style.overflow = 'hidden';
        renderSavedDrawer();
    }

    function closeSavedDrawer() {
        if (savedDrawer) savedDrawer.classList.remove('saved-trips__drawer--open');
        if (savedOverlay) savedOverlay.classList.remove('saved-trips__overlay--visible');
        document.body.style.overflow = '';
    }

    if (savedToggle) savedToggle.addEventListener('click', openSavedDrawer);
    if (savedClose) savedClose.addEventListener('click', closeSavedDrawer);
    if (savedOverlay) savedOverlay.addEventListener('click', closeSavedDrawer);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && savedDrawer && savedDrawer.classList.contains('saved-trips__drawer--open')) {
            closeSavedDrawer();
        }
    });

    function renderSavedDrawer() {
        if (!savedList) return;
        var trips = getSavedTrips();

        // Remove old items (keep the empty state)
        var oldItems = savedList.querySelectorAll('.saved-trips__item');
        oldItems.forEach(function (item) { item.remove(); });

        if (savedEmpty) {
            savedEmpty.style.display = trips.length === 0 ? 'block' : 'none';
        }

        trips.forEach(function (trip) {
            var div = document.createElement('div');
            div.className = 'saved-trips__item';
            div.innerHTML =
                '<div class="saved-trips__item-header">' +
                    '<span class="saved-trips__item-title">' + trip.title + '</span>' +
                    '<span class="saved-trips__item-score">' + trip.score + '</span>' +
                '</div>' +
                '<div class="saved-trips__item-details">' + (trip.route || '') + '</div>' +
                '<div class="saved-trips__item-meta">' +
                    '<span>$' + trip.cost + ' all-in</span>' +
                    '<span>&middot;</span>' +
                    '<span>' + (trip.distance || '') + '</span>' +
                '</div>' +
                '<button class="saved-trips__remove" data-title="' + trip.title.replace(/"/g, '&quot;') + '">Remove</button>';
            savedList.appendChild(div);
        });
    }

    // Remove saved trip
    if (savedList) {
        savedList.addEventListener('click', function (e) {
            var removeBtn = e.target.closest('.saved-trips__remove');
            if (!removeBtn) return;

            var title = removeBtn.getAttribute('data-title');
            var trips = getSavedTrips().filter(function (t) { return t.title !== title; });
            saveTripsList(trips);

            // Update any matching showcase buttons
            showcaseSaveBtns.forEach(function (btn) {
                var tripId = btn.getAttribute('data-trip-id');
                if (showcaseTripData[tripId] && showcaseTripData[tripId].title === title) {
                    btn.classList.remove('showcase__save-btn--saved');
                    var label = btn.querySelector('span');
                    if (label) label.textContent = 'Save Trip';
                    var svg = btn.querySelector('svg');
                    if (svg) svg.setAttribute('fill', 'none');
                }
            });
        });
    }

    // Initialize saved count on page load
    updateSavedCount();

    /* ---------- Artist Follow Storage ---------- */
    function getFollowedArtists() {
        try { return JSON.parse(localStorage.getItem('concertbet_follows') || '[]'); }
        catch (e) { return []; }
    }

    /* ---------- Dynamic Artist Rendering ---------- */
    var ARTISTS_PER_PAGE = 12;
    var artistsShown = 0;
    var currentGenreFilter = 'all';
    var currentSearchQuery = '';

    function getFilteredArtists() {
        var data = window.ARTIST_DATA || [];
        return data.filter(function (artist) {
            var matchGenre = currentGenreFilter === 'all' || artist.genre === currentGenreFilter;
            var matchSearch = !currentSearchQuery || artist.name.toLowerCase().indexOf(currentSearchQuery.toLowerCase()) > -1;
            return matchGenre && matchSearch;
        });
    }

    function renderArtistCard(artist) {
        var follows = getFollowedArtists();
        var isFollowing = follows.indexOf(artist.slug) > -1;
        var tourBadge = artist.onTour
            ? '<div class="artists__card-live"><span class="artists__card-live-dot"></span>On Tour</div>'
            : '';
        var fillAttr = isFollowing ? 'currentColor' : 'none';
        var followClass = isFollowing ? ' artists__follow-btn--following' : '';
        var followLabel = isFollowing ? 'Following' : 'Follow';

        return '<div class="artists__card" data-genre="' + artist.genre + '">' +
            '<div class="artists__card-img-wrap">' +
            '<img src="https://images.unsplash.com/' + artist.img + '?w=400&q=80&fit=crop" alt="' + artist.name + ' performing live" class="artists__card-img" loading="lazy" width="400" height="400">' +
            '<div class="artists__card-overlay"></div>' +
            tourBadge +
            '</div>' +
            '<div class="artists__card-body">' +
            '<h3 class="artists__card-name">' + artist.name + '</h3>' +
            '<span class="artists__card-genre">' + artist.genreLabel + '</span>' +
            '<div class="artists__card-stats">' +
            '<div class="artists__card-stat"><span class="artists__card-stat-num">' + artist.shows + '</span><span class="artists__card-stat-label">Shows Left</span></div>' +
            '<div class="artists__card-stat"><span class="artists__card-stat-num">' + artist.cities + '</span><span class="artists__card-stat-label">Cities</span></div>' +
            '</div>' +
            '<div class="artists__card-cities">' + artist.cityList + '</div>' +
            '<button class="artists__follow-btn' + followClass + '" data-artist="' + artist.slug + '" aria-label="Follow ' + artist.name + '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + fillAttr + '" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
            '<span>' + followLabel + '</span>' +
            '</button>' +
            '</div></div>';
    }

    function renderArtists(reset) {
        var grid = document.getElementById('artists-grid');
        if (!grid) return;
        var filtered = getFilteredArtists();

        if (reset) {
            grid.innerHTML = '';
            artistsShown = 0;
        }

        var batch = filtered.slice(artistsShown, artistsShown + ARTISTS_PER_PAGE);
        var fragment = document.createDocumentFragment();
        var temp = document.createElement('div');

        batch.forEach(function (artist) {
            temp.innerHTML = renderArtistCard(artist);
            fragment.appendChild(temp.firstChild);
        });

        grid.appendChild(fragment);
        artistsShown += batch.length;

        updateArtistFooter(filtered.length);
        bindFollowButtons();
    }

    function updateArtistFooter(totalCount) {
        var loadMoreBtn = document.querySelector('.artists__load-more');
        var countEl = document.querySelector('.artists__count');
        var shown = Math.min(artistsShown, totalCount);

        if (countEl) {
            countEl.textContent = 'Showing ' + shown + ' of ' + totalCount + ' artists';
        }
        if (loadMoreBtn) {
            var remaining = totalCount - shown;
            if (remaining <= 0) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = '';
                var countSpan = loadMoreBtn.querySelector('.artists__load-more-count');
                if (countSpan) countSpan.textContent = remaining + ' more';
            }
        }
    }

    function bindFollowButtons() {
        var followBtns = document.querySelectorAll('.artists__follow-btn:not([data-bound])');
        followBtns.forEach(function (btn) {
            btn.setAttribute('data-bound', 'true');
            var artistId = btn.getAttribute('data-artist');

            btn.addEventListener('click', function () {
                var follows = getFollowedArtists();
                var idx = follows.indexOf(artistId);
                var label = btn.querySelector('span');
                var svg = btn.querySelector('svg');

                if (idx > -1) {
                    follows.splice(idx, 1);
                    btn.classList.remove('artists__follow-btn--following');
                    if (label) label.textContent = 'Follow';
                    if (svg) svg.setAttribute('fill', 'none');
                } else {
                    follows.push(artistId);
                    btn.classList.add('artists__follow-btn--following');
                    if (label) label.textContent = 'Following';
                    if (svg) svg.setAttribute('fill', 'currentColor');
                }

                localStorage.setItem('concertbet_follows', JSON.stringify(follows));
            });
        });
    }

    /* ---------- Artist Filter Buttons ---------- */
    var artistFilterBtns = document.querySelectorAll('.artists__filter-btn');
    artistFilterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var genre = btn.getAttribute('data-genre');
            currentGenreFilter = genre;

            artistFilterBtns.forEach(function (b) { b.classList.remove('artists__filter-btn--active'); });
            btn.classList.add('artists__filter-btn--active');

            renderArtists(true);
        });
    });

    /* ---------- Artist Search ---------- */
    var artistSearchInput = document.querySelector('.artists__search');
    var searchTimeout;
    if (artistSearchInput) {
        artistSearchInput.addEventListener('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function () {
                currentSearchQuery = artistSearchInput.value.trim();
                renderArtists(true);
            }, 250);
        });
    }

    /* ---------- Load More Button ---------- */
    var loadMoreBtn = document.querySelector('.artists__load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            renderArtists(false);
        });
    }

    /* ---------- Initial Artist Render ---------- */
    renderArtists(true);

    /* ---------- Re-observe new reveal elements ---------- */
    if ('IntersectionObserver' in window) {
        var newRevealElements = document.querySelectorAll('.reveal:not(.revealed)');
        if (newRevealElements.length > 0 && typeof revealObserver !== 'undefined') {
            newRevealElements.forEach(function (el) {
                revealObserver.observe(el);
            });
        }
    }

    /* ---------- Stagger new grid sections ---------- */
    var newGridSections = document.querySelectorAll('.trip-builder__options');
    newGridSections.forEach(function (grid) {
        var cards = grid.querySelectorAll('.reveal');
        cards.forEach(function (card, index) {
            card.style.transitionDelay = (index * 0.1) + 's';
        });
    });

})();
