// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Loading Sequence
    const initLoader = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                document.body.classList.remove('is-loading');
                startHeroAnimations();
            }
        });

        tl.to(".loader-text", { opacity: 1, duration: 1, ease: "power2.out" })
          .to(".loader", { opacity: 0, duration: 1, delay: 0.5 });
    };

    // 2. Hero Animations (After Loader)
    const startHeroAnimations = () => {
        const tl = gsap.timeline();

        // Logo Character "Breath" appearance
        tl.from(".hero-logo .char", {
            y: 50,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: "power3.out"
        })
        .from(".hero-sub", {
            y: 20,
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        }, "-=0.5")
        .from(".scroll-prompt", {
            opacity: 0,
            duration: 1
        }, "-=0.5");
    };

    // 3. Scroll Reveal Animations (General)
    const revealElements = document.querySelectorAll(".reveal-up, .reveal-text");
    
    revealElements.forEach(elem => {
        gsap.fromTo(elem, 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%", // Trigger when element is 85% down viewport
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // 4. Parallax Backgrounds
    // Hero Background Zoom
    gsap.to(".hero-media", {
        scale: 1.0, // Zoom out effect
        y: "10%",   // Parallax movement
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    // Interlude Image Parallax
    gsap.to(".parallax-img", {
        y: "-20%", // Move up slightly faster than scroll
        ease: "none",
        scrollTrigger: {
            trigger: ".parallax-container",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // 5. "Sway" Physics Animation (Continuous)
    // Applies a gentle float to elements with .sway-element
    gsap.to(".sway-element", {
        y: 15,
        rotation: 2,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
    });

    // Initialize
    initLoader();

});

// Mobile Menu Toggle (Simple JS)
const menuTrigger = document.querySelector('.menu-trigger');
// Add mobile menu logic if overlay is needed, currently just placeholder
if(menuTrigger) {
    menuTrigger.addEventListener('click', () => {
        alert('Mobile menu to be implemented');
    });
}
