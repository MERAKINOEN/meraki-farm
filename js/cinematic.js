// Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
    lerp: 0.05,
    smoothWheel: true
});

// Synchronize ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
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

// 4. Horizontal Scroll (HARVEST & RECIPE)
const horizontalSections = [
    { section: "#harvest", container: "#harvest-scroll .horizontal-container" },
    { section: "#recipe", container: "#recipe-scroll .horizontal-container" }
];

horizontalSections.forEach(config => {
    const section = document.querySelector(config.section);
    const container = document.querySelector(config.container);
    if (!section || !container) return;

    function getScrollAmount() {
        let race = container.scrollWidth - window.innerWidth;
        console.log(`Scroll amount for ${config.section}:`, -(race + 50), 'ScrollWidth:', container.scrollWidth);
        return -(race + 50);
    }

    const scrollTween = gsap.to(container, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
            trigger: config.section,
            pin: true,
            pinType: "fixed",
            scrub: 1,
            end: () => "+=" + (container.scrollWidth * 1.2),
            invalidateOnRefresh: true
        }
    });

    console.log(`Initialized ScrollTrigger for ${config.section}`);

    // Mobile "Float Up" Animations
    if (isMobile) {
        const items = container.querySelectorAll(".h-item");
        items.forEach((item, i) => {
            // Spacer and Koshihikari MUST start visible because they are immediately on screen.
            // For recipe, the first item is also immediately visible.
            if (i <= 1) {
                gsap.set(item, { opacity: 1 });
                // Ensure children are fully reset too
                const imgWrap = item.querySelector(".p-image-wrap, .article-thumb");
                if (imgWrap) gsap.set(imgWrap, { opacity: 1, y: 0, scale: 1 });
                const info = item.querySelector(".p-info, .article-content");
                if (info) gsap.set(info, { opacity: 1, y: 0 });
                return;
            }

            const imgWrap = item.querySelector(".p-image-wrap, .article-thumb");
            if (imgWrap) {
                gsap.fromTo(imgWrap,
                    { opacity: 0, y: 50, scale: 0.95 },
                    {
                        opacity: 1, y: 0, scale: 1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: item,
                            containerAnimation: scrollTween,
                            start: "left 100%",
                            end: "center 60%",
                            scrub: 1
                        }
                    }
                );
            }

            const info = item.querySelector(".p-info, .article-content");
            if (info) {
                gsap.fromTo(info,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: item,
                            containerAnimation: scrollTween,
                            start: "left 80%",
                            end: "center 50%",
                            scrub: 1
                        }
                    }
                );
            }

            gsap.fromTo(item,
                { x: 200, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: item,
                        containerAnimation: scrollTween,
                        start: "left 90%",
                        end: "center center",
                        scrub: true
                    }
                }
            );
        });
    }
});


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
    if (typeof grainMesh !== 'undefined' && grainMesh) {
        grainMesh.rotation.y = time * 0.05;
    }
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

// --- Meraki Dictionary \u0026 Recipe Overlays ---
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        // Open Dictionary Modal
        // Open Dictionary Modal
        if (e.target && e.target.id === 'openDictBtn') {
            e.preventDefault();
            const dictModal = document.getElementById('merakiDictModal');
            if (dictModal) {
                dictModal.classList.add('active');
                document.body.classList.add('modal-open');
                if (typeof lenis !== 'undefined') lenis.stop();
            }
        }

        // Open Recipe Modal
        if (e.target && e.target.classList.contains('recipe-detail-btn')) {
            e.preventDefault();
            const recipeId = e.target.getAttribute('data-recipe');
            const modalId = recipeId + 'Modal';
            const recipeModal = document.getElementById(modalId);
            if (recipeModal) {
                recipeModal.classList.add('active');
                document.body.classList.add('modal-open');
                if (typeof lenis !== 'undefined') lenis.stop();
            }
        }

        // Open Black Rice Power Modal
        if (e.target && (e.target.id === 'openBlackRiceBtn' || e.target.closest('#openBlackRiceBtn'))) {
            e.preventDefault();
            const powerModal = document.getElementById('blackRicePowerModal');
            if (powerModal) {
                powerModal.classList.add('active');
                document.body.classList.add('modal-open');
                if (typeof lenis !== 'undefined') lenis.stop();
            }
        }

        // Open FAQ Modal
        if (e.target && (e.target.id === 'openFaqBtn' || e.target.closest('#openFaqBtn'))) {
            e.preventDefault();
            const faqModal = document.getElementById('faqModal');
            if (faqModal) {
                faqModal.classList.add('active');
                document.body.classList.add('modal-open');
                if (typeof lenis !== 'undefined') lenis.stop();
            }
        }

        // Open Terms of Use Modal
        if (e.target && (e.target.id === 'openTermsBtn' || e.target.closest('#openTermsBtn'))) {
            e.preventDefault();
            const termsModal = document.getElementById('termsModal');
            if (termsModal) {
                termsModal.classList.add('active');
                document.body.classList.add('modal-open');
                if (typeof lenis !== 'undefined') lenis.stop();
            }
        }

        // Open Privacy Policy Modal
        if (e.target && (e.target.id === 'openPrivacyBtn' || e.target.closest('#openPrivacyBtn'))) {
            e.preventDefault();
            const privacyModal = document.getElementById('privacyModal');
            if (privacyModal) {
                privacyModal.classList.add('active');
                document.body.classList.add('modal-open');
                if (typeof lenis !== 'undefined') lenis.stop();
            }
        }

        // Open Specified Commercial Transactions Modal
        if (e.target && (e.target.id === 'openSectaBtn' || e.target.closest('#openSectaBtn'))) {
            e.preventDefault();
            const sectaModal = document.getElementById('sectaModal');
            if (sectaModal) {
                sectaModal.classList.add('active');
                document.body.classList.add('modal-open');
                if (typeof lenis !== 'undefined') lenis.stop();
            }
        }

        // Close Dictionary Modal
        if (e.target && (
            e.target.id === 'dictCloseBtn' ||
            e.target.closest('#dictCloseBtn') ||
            e.target.classList.contains('dict-content-wrapper') ||
            e.target.classList.contains('dict-modal')
        )) {
            const dictModal = document.getElementById('merakiDictModal');
            if (dictModal && dictModal.classList.contains('active')) {
                dictModal.classList.remove('active');
                document.body.classList.remove('modal-open');
                if (typeof lenis !== 'undefined') lenis.start();
            }
        }

        // Close Black Rice Power Modal
        if (e.target && (
            e.target.id === 'powerCloseBtn' ||
            e.target.closest('#powerCloseBtn') ||
            (e.target.classList.contains('dict-modal') && e.target.id === 'blackRicePowerModal')
        )) {
            const powerModal = document.getElementById('blackRicePowerModal');
            if (powerModal && powerModal.classList.contains('active')) {
                powerModal.classList.remove('active');
                document.body.classList.remove('modal-open');
                if (typeof lenis !== 'undefined') lenis.start();
            }
        }

        // Close Recipe Modal
        if (e.target && (
            e.target.classList.contains('recipe-close') ||
            e.target.closest('.recipe-close') ||
            e.target.classList.contains('recipe-content-wrapper') ||
            e.target.classList.contains('recipe-modal')
        )) {
            const activeModal = document.querySelector('.recipe-modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.classList.remove('modal-open');
                if (typeof lenis !== 'undefined') lenis.start();
            }
        }
    });

    // Preventive scroll isolation inside modals
    const modalElements = document.querySelectorAll('.recipe-modal, .dict-modal');
    modalElements.forEach(modal => {
        modal.addEventListener('wheel', (e) => {
            e.stopPropagation();
        }, { passive: false });

        modal.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        }, { passive: false });
    });
});

// --- note.com RSS Integration ---
async function fetchNoteArticles() {
    const container = document.getElementById('note-article-container');
    const rssUrl = "https://note.com/meraki_noen/rss";
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        if (items.length > 0) {
            container.innerHTML = '';
            const count = Math.min(items.length, 3);

            for (let i = 0; i < count; i++) {
                const item = items[i];
                const title = item.querySelector("title").textContent;
                const link = item.querySelector("link").textContent;
                const pubDate = item.querySelector("pubDate").textContent;

                // Extract Thumbnail from <media:thumbnail>
                let thumbnail = '';
                const mediaThumb = item.getElementsByTagName("media:thumbnail")[0] || item.getElementsByTagName("thumbnail")[0];
                if (mediaThumb) {
                    thumbnail = mediaThumb.getAttribute("url") || mediaThumb.textContent;
                }

                // If still no thumbnail, try extraction from description
                if (!thumbnail || thumbnail.includes('profile_images')) {
                    const description = item.querySelector("description").textContent;
                    const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch && !imgMatch[1].includes('profile_images')) {
                        thumbnail = imgMatch[1];
                    } else {
                        thumbnail = 'images/hero_landscape.jpg';
                    }
                }

                const date = new Date(pubDate);
                const formattedDate = date.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).split('/').join('.');

                const card = document.createElement('a');
                card.href = link;
                card.target = '_blank';
                card.className = 'article-card';
                card.setAttribute('data-index', i + 1);
                card.innerHTML = `
                    <div class="article-thumb">
                        <img src="${thumbnail}" alt="${title}" loading="lazy">
                    </div>
                    <div class="article-content">
                        <div>
                            <span class="article-card-date">${formattedDate}</span>
                            <h4 class="article-card-title">${title}</h4>
                        </div>
                    </div>
                `;
                container.appendChild(card);

                // Add slight floating animation staggered
                gsap.to(card, {
                    y: 10,
                    duration: 2 + Math.random() * 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: i * 0.5
                });
            }
            ScrollTrigger.refresh();
        } else {
            container.innerHTML = '<div class="gallery-placeholder">記事が見つかりませんでした。</div>';
        }
    } catch (error) {
        console.error('Error fetching note articles:', error);
        container.innerHTML = '<div class="gallery-placeholder">記事を読み込めませんでした。</div>';
    }
}


// Contact Form Submission Handling
let submitted = false;
window.showContactSuccess = function () {
    if (submitted) {
        document.getElementById('contactForm').style.display = 'none';
        document.getElementById('contactSuccess').style.display = 'block';

        // Scroll to success message
        document.getElementById('contactSuccess').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

window.resetContactForm = function () {
    submitted = false;
    document.getElementById('contactForm').reset();
    document.getElementById('contactForm').style.display = 'flex';
    document.getElementById('contactSuccess').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    fetchNoteArticles();

    // ==========================================================================
    // FINAL BACKGROUND TRANSITION
    // ==========================================================================
    // Background Color and Fog Transition
    ScrollTrigger.create({
        trigger: "#credits",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
            const progress = self.progress;
            // Interpolate background color
            // From #f2f5f3 (rgb 242, 245, 243) to #ffffff
            const r = Math.floor(242 + (255 - 242) * progress);
            const g = Math.floor(245 + (255 - 245) * progress);
            const b = Math.floor(243 + (255 - 243) * progress);
            const bgColor = `rgb(${r}, ${g}, ${b})`;
            document.body.style.backgroundColor = bgColor;

            // Sync Three.js Fog
            if (typeof scene !== 'undefined' && scene.fog) {
                scene.fog.color.setRGB(r / 255, g / 255, b / 255);
            }
        }
    });
});
