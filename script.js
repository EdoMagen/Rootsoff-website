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
            const response = await fetch('/api/v1/contact', {
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
