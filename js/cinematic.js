// Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
    lerp: 0.05,
    smoothWheel: true
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
requestAnimationFrame(raf);

// ==========================================================================
// HAMBURGER MENU LOGIC
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const fullscreenMenu = document.querySelector('.fullscreen-menu');
    const menuLinks = document.querySelectorAll('.menu-link');

    if (hamburgerBtn && fullscreenMenu) {
        // Toggle menu open/close
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('open');
            fullscreenMenu.classList.toggle('active');

            // Optional: Pause Lenis scrolling when menu is open
            if (fullscreenMenu.classList.contains('active')) {
                lenis.stop();
            } else {
                lenis.start();
            }
        });

        // Close menu when a link is clicked
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('open');
                fullscreenMenu.classList.remove('active');
                lenis.start(); // Ensure scrolling is re-enabled
            });
        });
    }
});

// Three.js & Setup
const canvas = document.querySelector('#world');
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// scene.fog = new THREE.FogExp2(0x050505, 0.05);
// Wabi-Sabi Fog (Greenish Greige)
scene.fog = new THREE.FogExp2(0xf2f5f3, 0.08);

// PARTICLES REMOVED AS PER REQUEST
// const particlesMesh = ...

const isMobile = window.innerWidth < 768;

// Central Grain (The Core) - Procedural Rice Geometry
function createRiceGeometry() {
    // HYPER-STYLIZED: 4 Meridians, 8 Rings
    // A digital symbol of rice. Diamond/Jewel cross-section.
    const geometry = new THREE.SphereGeometry(1, 4, 8);
    const positionAttribute = geometry.attributes.position;

    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        // --- SYMBOLIC SHAPING ---

        // 1. Proportions: Cute and Heavy
        vertex.y *= 1.3;
        vertex.z *= 0.5; // Very flat

        // 2. Asymmetry (The "Belly")
        if (vertex.x > 0) {
            vertex.x *= 1.5; // Huge belly
        } else {
            vertex.x *= 0.6; // Flat back
        }

        // 3. The "Notch" (The Bite)
        // Hard, angular cut
        if (vertex.y > 0.4 && vertex.x < 0) {
            const strength = (vertex.y - 0.4) * 3;
            vertex.x += strength * 0.5;
            vertex.z *= (1 - strength * 0.4);
        }

        // 4. Rotate slightly to face camera better with 4 segments
        // (Handled by scene rotation, but let's ensure the mesh draws nicely)

        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry.computeVertexNormals();
    return geometry;
}

const grainGeometry = createRiceGeometry();
// Thin line, lower opacity for elegance
const grainMaterial = new THREE.MeshBasicMaterial({
    color: 0x2b2b2b, wireframe: true, transparent: true, opacity: 0.5
});
// const grainMesh = new THREE.Mesh(grainGeometry, grainMaterial);
// scene.add(grainMesh);

// Position adjustment (Lower and less intrusive)
// grainMesh.position.y = -1.5;
// grainMesh.scale.set(0.8, 0.8, 0.8);


// ==========================================================================
// SCROLL ANIMATIONS (GSAP + ScrollTrigger)
// ==========================================================================
gsap.registerPlugin(ScrollTrigger);

// Sync ScrollTrigger with Lenis
// ScrollTrigger.defaults({ scroller: window }); // Native scroll is hijacked by Lenis, but Lenis usually syncs well.

// 1. Intro -> Soil
// Hide Title, Move Camera
gsap.to(".intro-text", {
    y: -100, opacity: 0,
    scrollTrigger: {
        trigger: "#intro",
        start: "top top",
        end: "bottom top",
        scrub: 1
    }
});

gsap.to(camera.position, {
    z: 2,
    scrollTrigger: {
        trigger: "#intro",
        start: "top top",
        end: "bottom top",
        scrub: 1
    }
});

// Header Visibility & Style (Show only after Hero)
ScrollTrigger.create({
    trigger: "#intro",
    start: "bottom top", // When intro leaves viewport
    end: "max", // Stay active
    onEnter: () => {
        const header = document.querySelector("#global-header");
        if (header) {
            header.classList.add("visible");
            header.classList.add("scrolled");
        }
    },
    onLeaveBack: () => {
        const header = document.querySelector("#global-header");
        if (header) {
            header.classList.remove("visible");
            header.classList.remove("scrolled");
        }
    }
});

// 2. Soil Scene (Reveal)
gsap.fromTo(".content-left",
    { opacity: 0, y: 50 },
    {
        opacity: 1, y: 0,
        duration: 1.5, // Smooth duration
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#soil",
            start: "top top-=10%", // Delay animation start (wait until scrolled past header)
            toggleActions: "play none none none" // Play once and stay visible
        }
    }
);

// 2.5 Farmer Image Scene (Fade in -> Parallax -> Fade out)
let farmerScene = document.querySelector("#farmer-image-scene");
if (farmerScene) {
    let container = document.querySelector(".farmer-image-container");
    let bgImage = document.querySelector(".farmer-bg-image");

    let tl = gsap.timeline({
        scrollTrigger: {
            trigger: farmerScene,
            start: "top center+=20%", // Fade in starts when top of scene hits slightly below center
            end: "bottom 30%",      // Fade out ends when bottom hits top part of screen
            scrub: 1,               // Tie to scroll position
        }
    });

    // Fade in
    tl.to(container, { opacity: 1, duration: 1 })
        // Subtle parallax / zoom out on image during scroll
        .to(bgImage, { scale: 1, y: 50, duration: 3 }, "<")
        // Fade out
        .to(container, { opacity: 0, duration: 1 });
}

// 3. Growth Scene (CONCEPT Section Reveal)
// Title & Lead text from Bottom
gsap.fromTo("#growth .concept-title, #growth .concept-lead",
    { opacity: 0, y: 50 },
    {
        opacity: 1, y: 0,
        duration: 2.5, // Much slower
        stagger: 0.4, // Title then lead with more delay
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#growth",
            start: "top 70%",
            toggleActions: "play none none reverse"
        }
    }
);

// Image Slider from Left
gsap.fromTo("#growth .concept-image-slider",
    { opacity: 0, x: -100 },
    {
        opacity: 1, x: 0,
        duration: 3.0, // Very slow and elegant
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#growth",
            start: "top 60%", // Triggers slightly after title
            toggleActions: "play none none reverse"
        }
    }
);

// Description Text from Right
gsap.fromTo("#growth .concept-desc",
    { opacity: 0, x: 60 },
    {
        opacity: 1, x: 0,
        duration: 2.8, // Slow and elegant
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#growth",
            start: "top 60%", // Triggers same time as image
            toggleActions: "play none none reverse"
        }
    }
);

// 4. HARVEST: Horizontal Scroll
// Particles color shift removed

// Pin and Slide (Container Based)
const harvestSection = document.querySelector("#harvest");
const horizontalContainer = document.querySelector(".horizontal-container");

// Calculate scroll amount: Total width - Viewport width
function getScrollAmount() {
    // Add extra buffer (e.g., 50px or 10vw) to ensure we reach the end
    let race = horizontalContainer.scrollWidth - window.innerWidth;
    return -(race + 50);
}

const scrollTween = gsap.to(horizontalContainer, {
    x: getScrollAmount, // Functional value for responsiveness
    ease: "none",
    scrollTrigger: {
        trigger: "#harvest",
        pin: true,
        scrub: 1,
        end: () => "+=" + (horizontalContainer.scrollWidth * 1.5), // Scale scroll speed automatically based on total width
        invalidateOnRefresh: true
    }
});

// Mobile "Float Up" Animations (Container Animation)
// Mobile "Float Up" Animations (Container Animation)
if (isMobile) {
    const items = document.querySelectorAll(".h-item");
    items.forEach((item, i) => {
        // Item 0 is Title Card: It starts visible
        if (i === 0) {
            gsap.set(item, { opacity: 1 });
            return;
        }

        // Items 1+: Enter from right

        // Image Fade In & Up
        const imgWrap = item.querySelector(".p-image-wrap");
        if (imgWrap) {
            gsap.fromTo(imgWrap,
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: item,
                        containerAnimation: scrollTween,
                        start: "left 100%", // Start animating as soon as it enters viewport
                        end: "center 60%", // Finished by the time it's centered
                        scrub: 1,
                        id: `img-${i}`
                    }
                }
            );
        }

        // Text Fade In & Up (Staggered)
        const info = item.querySelector(".p-info");
        if (info) {
            gsap.fromTo(info,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: item,
                        containerAnimation: scrollTween,
                        start: "left 80%", // Starts slightly after image
                        end: "center 50%",
                        scrub: 1,
                        id: `info-${i}`
                    }
                }
            );
        }

        // Base Opacity for the wrapper
        // fade in from 0.2 to 1 as it centers
        gsap.fromTo(item,
            { opacity: 0.2 },
            {
                opacity: 1,
                scrollTrigger: {
                    trigger: item,
                    containerAnimation: scrollTween,
                    start: "left 90%",
                    end: "center center",
                    scrub: true,
                    toggleActions: "play reverse play reverse"
                }
            }
        );
    });
}


// 5. Constellation & Credits
// Particle shrinking removed


// ==========================================================================
// LOOP & INTERACTION
// ==========================================================================
const clock = new THREE.Clock();
let mouseX = 0, mouseY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

const tick = () => {
    const time = clock.getElapsedTime();

    // Rotate (Slower, Organic)
    grainMesh.rotation.y = time * 0.05;
    // particlesMesh.rotation.y = Math.sin(time * 0.1) * 0.2;

    // Mouse Parallax (Dampened)
    camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}

tick();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Nav Dot Highlights
const navDots = document.querySelectorAll('.nav-dot');
const scenes = ["#intro", "#growth", "#harvest", "#soil", "#journal", "#recipe", "#faq", "#credits"];

scenes.forEach((id, index) => {
    ScrollTrigger.create({
        trigger: id,
        start: "top center",
        end: "bottom center",
        onEnter: () => updateNav(index),
        onEnterBack: () => updateNav(index)
    });
});

function updateNav(index) {
    navDots.forEach(dot => dot.classList.remove('active'));
    if (navDots[index]) navDots[index].classList.add('active');
}

// Ensure ScrollTrigger uses correct dimensions after load
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});
