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

})();
