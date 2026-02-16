// Gallery Rotation
(function initGallery() {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.gallery-dot');
    if (!slides.length) return;

    let current = 0;
    let timer;

    function show(idx) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = idx;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function next() { show((current + 1) % slides.length); }

    function startTimer() { timer = setInterval(next, 4000); }
    function resetTimer() { clearInterval(timer); startTimer(); }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.index));
            resetTimer();
        });
    });

    startTimer();
})();

// Hero Bokeh Background
(function initHeroBokeh() {
    const hero = document.getElementById('hero');
    const canvas = document.querySelector('.hero-bokeh');
    if (!hero || !canvas) return;
    const minimumDesktopWidth = 768;
    if (window.innerWidth < minimumDesktopWidth) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const lowDataMode = Boolean(connection && connection.saveData);
    const colorPairs = [
        ['#9ed9f0', '#74c4e5'],
        ['#b7e5f7', '#86cee9'],
        ['#a8ddf3', '#69bddf'],
        ['#c8ecfa', '#93d5ee']
    ];
    const fpsInterval = 1000 / 28;
    const dprCap = 1.5;

    let blobs = [];
    let rafId = null;
    let lastFrameTs = 0;
    let resizeTimer = null;
    let sceneWidth = 1;
    let sceneHeight = 1;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function pickOne(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getProfile() {
        const width = window.innerWidth;
        if (width <= 640) {
            return {
                count: 9,
                speed: 0.22,
                blurMin: 18,
                blurMax: 42,
                radiusMinScale: 0.12,
                radiusMaxScale: 0.24,
                insetXScale: 0.08,
                insetTopScale: 0.08,
                insetBottomScale: 0.2
            };
        }
        if (width <= 1024) {
            return {
                count: 14,
                speed: 0.28,
                blurMin: 20,
                blurMax: 54,
                radiusMinScale: 0.11,
                radiusMaxScale: 0.23,
                insetXScale: 0.09,
                insetTopScale: 0.08,
                insetBottomScale: 0.22
            };
        }
        return {
            count: 20,
            speed: 0.34,
            blurMin: 24,
            blurMax: 66,
            radiusMinScale: 0.1,
            radiusMaxScale: 0.22,
            insetXScale: 0.1,
            insetTopScale: 0.08,
            insetBottomScale: 0.24
        };
    }

    function getBounds(profile, width, height) {
        const left = Math.max(20, width * profile.insetXScale);
        const right = Math.min(width - 20, width - width * profile.insetXScale);
        const top = Math.max(20, height * profile.insetTopScale);
        const bottom = Math.min(height - 20, height - height * profile.insetBottomScale);
        return { left, right, top, bottom };
    }

    function createBlob(profile, width, height, maxDimension, bounds) {
        const radius = rand(maxDimension * profile.radiusMinScale, maxDimension * profile.radiusMaxScale);
        const [colorOne, colorTwo] = pickOne(colorPairs);
        const direction = rand(0, Math.PI * 2);
        const velocity = rand(profile.speed * 0.45, profile.speed);
        const blurDirection = Math.random() > 0.5 ? 1 : -1;
        const minX = Math.max(bounds.left + radius, 0);
        const maxX = Math.min(bounds.right - radius, width);
        const minY = Math.max(bounds.top + radius, 0);
        const maxY = Math.min(bounds.bottom - radius, height);
        return {
            x: rand(minX, Math.max(minX, maxX)),
            y: rand(minY, Math.max(minY, maxY)),
            vx: Math.cos(direction) * velocity,
            vy: Math.sin(direction) * velocity,
            radius,
            blur: rand(profile.blurMin, profile.blurMax),
            blurVelocity: rand(0.08, 0.2) * blurDirection,
            colorOne,
            colorTwo
        };
    }

    function resizeCanvasAndScene() {
        const rect = hero.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
        sceneWidth = Math.max(1, Math.round(rect.width));
        sceneHeight = Math.max(1, Math.round(rect.height));

        canvas.width = Math.max(1, Math.round(sceneWidth * dpr));
        canvas.height = Math.max(1, Math.round(sceneHeight * dpr));
        canvas.style.width = `${sceneWidth}px`;
        canvas.style.height = `${sceneHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const profile = getProfile();
        const maxDimension = Math.min(sceneWidth, sceneHeight);
        const bounds = getBounds(profile, sceneWidth, sceneHeight);
        blobs = Array.from({ length: profile.count }, () =>
            createBlob(profile, sceneWidth, sceneHeight, maxDimension, bounds)
        );
    }

    function drawBlob(blob) {
        const gradient = ctx.createLinearGradient(
            blob.x - blob.radius * 0.6,
            blob.y - blob.radius * 0.4,
            blob.x + blob.radius,
            blob.y + blob.radius * 0.8
        );

        gradient.addColorStop(0, blob.colorOne);
        gradient.addColorStop(1, blob.colorTwo);

        ctx.filter = `blur(${blob.blur}px)`;
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.filter = 'none';
    }

    function renderFrame() {
        const profile = getProfile();
        const bounds = getBounds(profile, sceneWidth, sceneHeight);

        ctx.clearRect(0, 0, sceneWidth, sceneHeight);
        ctx.globalCompositeOperation = 'lighter';

        blobs.forEach(blob => {
            blob.x += blob.vx;
            blob.y += blob.vy;
            blob.blur += blob.blurVelocity;

            if (blob.x - blob.radius < bounds.left || blob.x + blob.radius > bounds.right) {
                blob.vx *= -1;
                blob.x = Math.min(Math.max(blob.x, bounds.left + blob.radius), bounds.right - blob.radius);
            }
            if (blob.y - blob.radius < bounds.top || blob.y + blob.radius > bounds.bottom) {
                blob.vy *= -1;
                blob.y = Math.min(Math.max(blob.y, bounds.top + blob.radius), bounds.bottom - blob.radius);
            }
            if (blob.blur < profile.blurMin || blob.blur > profile.blurMax) {
                blob.blurVelocity *= -1;
            }

            if (Math.abs(blob.vx) > profile.speed) {
                blob.vx = Math.sign(blob.vx) * profile.speed;
            }
            if (Math.abs(blob.vy) > profile.speed) {
                blob.vy = Math.sign(blob.vy) * profile.speed;
            }

            drawBlob(blob);
        });

        ctx.globalCompositeOperation = 'source-over';
    }

    function animate(ts) {
        if (!lastFrameTs || ts - lastFrameTs >= fpsInterval) {
            lastFrameTs = ts;
            renderFrame();
        }
        rafId = window.requestAnimationFrame(animate);
    }

    function start() {
        if (rafId) return;
        lastFrameTs = 0;
        rafId = window.requestAnimationFrame(animate);
    }

    function stop() {
        if (!rafId) return;
        window.cancelAnimationFrame(rafId);
        rafId = null;
    }

    function refresh() {
        if (window.innerWidth < minimumDesktopWidth) {
            stop();
            ctx.clearRect(0, 0, sceneWidth, sceneHeight);
            return;
        }
        resizeCanvasAndScene();
        if (reduceMotionQuery.matches || lowDataMode) {
            stop();
            renderFrame();
            return;
        }
        start();
    }

    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(refresh, 140);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
            return;
        }
        if (
            window.innerWidth >= minimumDesktopWidth &&
            !reduceMotionQuery.matches &&
            !lowDataMode
        ) {
            start();
        }
    });

    if (typeof reduceMotionQuery.addEventListener === 'function') {
        reduceMotionQuery.addEventListener('change', refresh);
    } else if (typeof reduceMotionQuery.addListener === 'function') {
        reduceMotionQuery.addListener(refresh);
    }

    refresh();
})();

// Parallax Effect
document.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxBgs = document.querySelectorAll('.parallax-bg');

    parallaxBgs.forEach(bg => {
        const speed = bg.getAttribute('data-speed') || 0.5;
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.innerWidth > 768) {
            bg.style.transform = `translateY(${scrolled * speed}px)`;
        }
    });
});

// Navigation Highlight & Smooth Scroll Fix for Multi-page
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href.includes('#' + current) && current !== '') {
            link.classList.add('active');
        }
    });
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.mobile-menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });
}

// Contact Form Handling
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        formStatus.textContent = "Sending...";
        formStatus.className = "status-msg";

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('https://api.rooots.ai/api/v1/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                formStatus.textContent = result.message || "Message sent successfully!";
                formStatus.className = "status-msg success";
                contactForm.reset();
            } else {
                formStatus.textContent = result.detail || "Something went wrong. Please try again.";
                formStatus.className = "status-msg error";
            }
        } catch (error) {
            formStatus.textContent = "Unable to connect to service. Please try again later.";
            formStatus.className = "status-msg error";
        }
    });
}
