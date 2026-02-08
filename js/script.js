document.addEventListener('DOMContentLoaded', () => {
    // Loading Screen
    const loadingScreen = document.getElementById('loadingScreen');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1200);
    });

    // Scroll Header Background
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Burger Menu Logic
    const burgerMenu = document.getElementById('hamburger');
    const nav = document.querySelector('.nav');

    if (burgerMenu && nav) {
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('open');
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('open');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.fade-in, .reveal-up, .reveal-text, .reveal-image');
    revealElements.forEach(el => {
        observer.observe(el);
    });

    // Hero Parallax Effect
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            // Parallax the text: move it down slowly as we scroll down
            // Keep the horizontal centering (-50%)
            heroContent.style.transform = `translate(-50%, calc(-50% + ${scrolled * 0.4}px))`;
            heroContent.style.opacity = 1 - (scrolled / 700);
        }
    });

    // Hero Slideshow
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    const slideInterval = 10000; // 10 seconds

    if (slides.length > 0) {
        setInterval(() => {
            // Remove active from current
            slides[currentSlide].classList.remove('active');

            // Calculate next
            currentSlide = (currentSlide + 1) % slides.length;

            // Add active to next
            slides[currentSlide].classList.add('active');
        }, slideInterval);
    }


    // Typewriter Effect
    const typingTarget = document.querySelector('.typing-target');
    if (typingTarget) {
        // Prepare content
        const paragraphs = typingTarget.querySelectorAll('p');
        const contents = [];

        paragraphs.forEach(p => {
            contents.push(p.innerHTML);
            p.innerHTML = ''; // Clear content
        });

        const typingObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                typingTarget.classList.add('is-typing');
                startTypingSequence(paragraphs, contents);
                typingObserver.disconnect();
            }
        }, { threshold: 0.3 });

        typingObserver.observe(typingTarget);
    }

    async function startTypingSequence(elements, contents) {
        for (let i = 0; i < elements.length; i++) {
            const p = elements[i];
            const content = contents[i];

            // Regex to split by tags or characters
            // This splits into ["text", "<br>", "text", ...]
            const tokens = content.split(/(<[^>]+>)/g).filter(t => t !== "");

            for (const token of tokens) {
                if (token.startsWith('<')) {
                    // If tag, append immediately
                    p.innerHTML += token;
                } else {
                    // If text, type char by char
                    for (const char of token) {
                        p.innerHTML += char;
                        await new Promise(r => setTimeout(r, 50)); // Faster typing speed (50ms)
                    }
                }
            }
            // Small pause between paragraphs
            await new Promise(r => setTimeout(r, 200)); // Shorter pause
        }
    }

    // Note Integration
    // ★★★★ CHANGE THIS TO YOUR NOTE ID ★★★★
    const NOTE_ID = 'meraki_noen'; // Correct ID provided by user
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★

    const blogList = document.getElementById('blog-list');
    const blogViewAll = document.getElementById('blog-view-all');

    if (blogList && NOTE_ID) {
        // Update View All Link
        if (blogViewAll) {
            blogViewAll.href = `https://note.com/${NOTE_ID}`;
        }

        // Use a CORS proxy to fetch the RSS feed (since note blocks direct browser requests)
        // We use 'rss2json' for easier parsing (free tier)
        // Use a CORS proxy to fetch the RSS feed (since note blocks direct browser requests)
        // We use 'rss2json' for easier parsing (free tier)
        const rssUrl = `https://note.com/${NOTE_ID}/rss?v=${new Date().getTime()}`;
        // Add cache buster to date
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok' && data.items.length > 0) {
                    blogList.innerHTML = ''; // Clear loading message

                    // Display up to 3 items
                    const items = data.items.slice(0, 3);

                    items.forEach((item, index) => {
                        // Extract first image from content if thumbnail is missing
                        // Extract image logic for note RSS (rss2json)
                        let imageUrl = item.thumbnail;

                        // Fallback 1: Check enclosure
                        if (!imageUrl && item.enclosure && item.enclosure.link) {
                            imageUrl = item.enclosure.link;
                        }

                        const htmlContent = (item.description || "") + (item.content || "");

                        // Fallback 2: Regex for standard img tags
                        if (!imageUrl || imageUrl === "") {
                            const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
                            if (imgMatch) {
                                imageUrl = imgMatch[1];
                            }
                        }

                        // Fallback 3: Regex for data-src
                        if (!imageUrl || imageUrl === "") {
                            const dataSrcMatch = htmlContent.match(/data-src=["']([^"']+)["']/i);
                            if (dataSrcMatch) {
                                imageUrl = dataSrcMatch[1];
                            }
                        }

                        // Fallback 4: BRUTE FORCE for note specific assets
                        // Note images usually come from assets.st-note.com
                        if (!imageUrl || imageUrl === "") {
                            // Find any URL containing assets.st-note.com that ends with jpg, png, or jpeg (ignoring query params)
                            // This regex looks for https://...assets.st-note.com... .jpg/png
                            const noteAssetMatch = htmlContent.match(/(https:\/\/assets\.st-note\.com\/[^"'\s>)]+\.(jpg|jpeg|png|gif))/i);
                            if (noteAssetMatch) {
                                imageUrl = noteAssetMatch[1];
                            }
                        }

                        // Fallback 5: Default Placeholder
                        if (!imageUrl || imageUrl === "") {
                            imageUrl = 'images/concept.png';
                        }

                        // Format Date
                        const dateObj = new Date(item.pubDate);
                        const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}`;

                        // Create HTML logic
                        const delayClass = index > 0 ? `delay-${index * 200}` : '';

                        const articleHtml = `
                            <article class="blog-card reveal-up ${delayClass}">
                                <a href="${item.link}" target="_blank" class="blog-link">
                                    <div class="blog-thumb">
                                        <img src="${imageUrl}" alt="${item.title}">
                                    </div>
                                    <div class="blog-content">
                                        <span class="blog-date">${dateStr}</span>
                                        <h4 class="blog-card-title">${item.title}</h4>
                                        <p class="blog-excerpt" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                            <!-- Remove HTML tags for excerpt -->
                                            ${item.description.replace(/<[^>]+>/g, '').substring(0, 60)}...
                                        </p>
                                        <span class="read-more">noteで読む →</span>
                                    </div>
                                </a>
                            </article>
                        `;
                        blogList.insertAdjacentHTML('beforeend', articleHtml);
                    });

                    // Trigger animations for new elements
                    const newReveals = blogList.querySelectorAll('.reveal-up');
                    newReveals.forEach(el => observer.observe(el));

                } else {
                    blogList.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">記事が見つかりませんでした。</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching note RSS:', error);
                blogList.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">記事の読み込みに失敗しました。</p>';
            });
    }


    // Concept Slideshow
    function initConceptSlideshow() {
        const slideshow = document.querySelector('.concept-slideshow');
        if (!slideshow) return;

        const images = slideshow.querySelectorAll('img');
        if (images.length < 2) return;

        let currentIndex = 0;
        // Find which is active initially (or default to 0)
        // Note: HTML has class="active" on first img
        images.forEach((img, i) => {
            if (img.classList.contains('active')) currentIndex = i;
        });

        const intervalTime = 6000; // 6 seconds

        setInterval(() => {
            // Remove active from current
            images[currentIndex].classList.remove('active');

            // Next index
            currentIndex = (currentIndex + 1) % images.length;

            // Add active to next
            images[currentIndex].classList.add('active');
        }, intervalTime);
    }
    initConceptSlideshow();
});
