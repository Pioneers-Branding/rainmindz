document.addEventListener('DOMContentLoaded', () => {

    /* ======== 1. Scroll Animations (Intersection Observer) ======== */
    const animElements = document.querySelectorAll('.animate-on-scroll');
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before it hits bottom
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, origObserver) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                origObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    animElements.forEach(el => {
        scrollObserver.observe(el);

        // Safety fallback if IntersectionObserver fails or elements are on top
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add('is-visible');
            scrollObserver.unobserve(el);
        }
    });

    /* ======== 2. Navbar Scroll Effect ======== */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    // Trigger on load
    if (window.scrollY > 50) navbar.classList.add('scrolled');

    /* ======== 3. Mobile Menu Toggle ======== */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
        });
    });

    /* ======== 4. Custom Mouse Glow Effect ======== */
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor follow function
    function animateGlow() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;

        cursorGlow.style.transform = `translate3d(${Math.round(glowX)}px, ${Math.round(glowY)}px, 0)`;

        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    /* ======== 5. 3D Tilt Effect on interactive cards ======== */
    const interactiveCards = document.querySelectorAll('.service-card, .visual-card');

    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // max 5deg tilt
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
            // Wait for transition to finish then remove inline transform
            setTimeout(() => {
                if (!card.matches(':hover')) {
                    card.style.transform = '';
                }
            }, 400); // 400ms matches css transition
        });
    });

    /* ======== 6. 3D Globe Orbit Animation with Three.js ======== */
    const canvasContainer = document.getElementById('three-canvas-container');
    const overlaysContainer = document.getElementById('orbit-overlays-container');

    if (canvasContainer && typeof THREE !== 'undefined') {
        // Setup Three.js Scene
        const scene = new THREE.Scene();

        // Camera setup - Centered
        const camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 23); // Pulled back to accommodate wider spaced orbits

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        canvasContainer.appendChild(renderer.domElement);

        // Group to hold all orbiting elements so we can tilt the entire system
        const orbitSystem = new THREE.Group();
        orbitSystem.rotation.x = 0.5; // Tilt the solar system
        orbitSystem.rotation.z = -0.15; // Extra 3D Tilt so orbits look visually layered and dynamic
        scene.add(orbitSystem);

        // Function to handle responsive scaling of the solar system
        function updateSolarSystemScale() {
            if (window.innerWidth <= 768) {
                // Shrink solar system for mobile devices to fit all 6 orbits
                orbitSystem.scale.set(0.5, 0.5, 0.5);
            } else {
                // Default scale for desktop
                orbitSystem.scale.set(1, 1, 1);
            }
        }

        // Initial setup for scale
        updateSolarSystemScale();

        // --- Create Central Sphere (Thread-like aesthetic) ---
        // Using an Icosahedron with wireframe true
        const coreGeometry = new THREE.IcosahedronGeometry(2.5, 3); // Medium balanced core size
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
        orbitSystem.add(coreSphere); // Add to orbitSystem so it tilts perfectly with the rings

        // --- Orbiting Nodes Math ---
        const nodes = [];
        const numNodes = 6; // Updated to 6 tools
        const planets = []; // to hold meshes for raycasting

        // Define individual, increasing radii for concentric orbits (Wider spacing to avoid collisions)
        const orbitRadii = [5.5, 7.5, 9.5, 11.5, 13.5, 15.5];

        // Small planet geometries for tools (wireframe like the center)
        const planetGeometry = new THREE.IcosahedronGeometry(0.4, 1); // Medium planet size
        const planetMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff, // primary dark blue
            wireframe: true,
            transparent: true,
            opacity: 0.9
        });

        for (let i = 0; i < numNodes; i++) {
            const angle = (i / numNodes) * Math.PI * 2;
            const currentRadius = orbitRadii[i];

            // We create an invisible 3D object just to track position easily via ThreeJS
            const nodeObject = new THREE.Object3D();

            // Add a small planet mesh to the node
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            planetMesh.userData = { index: i };
            nodeObject.add(planetMesh);
            planets.push(planetMesh);

            orbitSystem.add(nodeObject);

            nodes.push({
                object: nodeObject,
                angle: angle,
                radius: currentRadius,
                speed: 0.002 + (Math.random() * 0.0015), // Different speeds
                labelEl: document.getElementById(`orbit-label-${i}`),
                cardEl: document.getElementById(`detail-card-${i}`)
            });

            // Visual Orbit Ring for this specific orbit radius
            const ringGeometry = new THREE.RingGeometry(currentRadius - 0.03, currentRadius + 0.03, 128);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.15
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            orbitSystem.add(ring);
        }

        // Add subtle lighting just in case
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 3, 50);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // --- Interaction Logic ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredPlanetIndex = -1;
        let isGlobalHover = false;

        // Listen for mouse move on canvas to detect 3D hovering
        canvasContainer.addEventListener('mousemove', (event) => {
            const rect = canvasContainer.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / canvasContainer.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / canvasContainer.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // Check intersection with planets
            const intersects = raycaster.intersectObjects(planets);

            if (intersects.length > 0) {
                // Hovering over a 3D small planet
                document.body.style.cursor = 'pointer';
                const planet = intersects[0].object;

                if (hoveredPlanetIndex !== planet.userData.index) {
                    if (hoveredPlanetIndex !== -1 && planets[hoveredPlanetIndex]) {
                        planets[hoveredPlanetIndex].scale.set(1, 1, 1);
                    }
                    hoveredPlanetIndex = planet.userData.index;
                    planet.scale.set(1.5, 1.5, 1.5);
                }

                isGlobalHover = true;
                showCard(hoveredPlanetIndex);
            } else {
                // Raycaster not hitting any planets
                document.body.style.cursor = 'default';
                if (hoveredPlanetIndex !== -1 && planets[hoveredPlanetIndex]) {
                    planets[hoveredPlanetIndex].scale.set(1, 1, 1);
                    hoveredPlanetIndex = -1;
                }
                // We do NOT set isGlobalHover=false and hideAllCards here unconditionally, 
                // because the user might be hovering an HTML label/card instead of a 3D planet.
                // We let the HTML hover listeners control that. 
            }
        });

        // Listen for clicks on the canvas to open the product link
        canvasContainer.addEventListener('click', (event) => {
            const rect = canvasContainer.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / canvasContainer.clientWidth) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / canvasContainer.clientHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(planets);

            if (intersects.length > 0) {
                const planetIndex = intersects[0].object.userData.index;
                const urls = [
                    'https://aicrmz.com',
                    'https://www.aitelz.com/',
                    'https://aifilmz.com/',
                    'https://aitextbotz.com/',
                    'https://aillmz.com/',
                    'https://airatingz.com/'
                ];
                if (urls[planetIndex]) {
                    window.open(urls[planetIndex], '_blank');
                }
            }
        });

        // Add a general mouse listener to hide cards if not hitting ANYTHING (html or 3d) 
        // This is tricky because canvas gets all mouse events if overlays are pointer-events:none.
        // Actually, we are safe relying on HTML mouseleave to close things if opened via HTML,
        // and if opened via 3D but we move off 3D, we need it to close unless we moved onto the card itself.
        // Best approach: close it on canvas mousemove if raycaster hit resolves empty AND we aren't in HTML hover state.

        // Let's add an explicit flag for HTML hover
        let isHtmlHover = false;

        function showCard(index) {
            document.querySelectorAll('.orbit-detail').forEach((card, i) => {
                if (i === index) {
                    card.classList.add('card-visible');
                } else {
                    card.classList.remove('card-visible');
                }
            });

            document.querySelectorAll('.orbit-label').forEach((label, i) => {
                if (i === index) {
                    label.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    label.style.color = '#ffffff'; // explicitly dark blue on hover
                    label.style.textShadow = '0 0 20px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,0.8)';
                } else {
                    label.style.transform = 'translate(-50%, -50%) scale(1)';
                    label.style.color = '#ffffff';
                    label.style.textShadow = '0 0 10px rgba(255,255,255,0.8), 0 0 5px rgba(255,255,255,0.8)';
                }
            });
        }

        function hideAllCards() {
            document.querySelectorAll('.orbit-detail').forEach(card => {
                card.classList.remove('card-visible');
            });
            document.querySelectorAll('.orbit-label').forEach(label => {
                label.style.transform = 'translate(-50%, -50%) scale(1)';
                label.style.color = '#ffffff';
                label.style.textShadow = '0 0 10px rgba(255,255,255,0.8), 0 0 5px rgba(255,255,255,0.8)';
            });
        }

        // Add hover listeners to HTML Labels
        document.querySelectorAll('.orbit-label').forEach((label, index) => {
            // Ignore center-label
            if (label.id === 'center-label') return;

            label.addEventListener('mouseenter', () => {
                isHtmlHover = true;
                isGlobalHover = true;
                showCard(index);
                if (planets[index]) planets[index].scale.set(1.5, 1.5, 1.5);
            });
            label.addEventListener('mouseleave', () => {
                isHtmlHover = false;
                isGlobalHover = false;
                hideAllCards();
                if (planets[index]) planets[index].scale.set(1, 1, 1);
            });
        });

        // Add hover listeners to HTML Cards
        document.querySelectorAll('.orbit-detail').forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                isHtmlHover = true;
                isGlobalHover = true;
                showCard(index);
                if (planets[index]) planets[index].scale.set(1.5, 1.5, 1.5);
            });
            card.addEventListener('mouseleave', () => {
                isHtmlHover = false;
                isGlobalHover = false;
                hideAllCards();
                if (planets[index]) planets[index].scale.set(1, 1, 1);
            });
        });

        // Connect the empty raycaster check to isHtmlHover
        canvasContainer.addEventListener('mousemove', () => {
            const intersects = raycaster.intersectObjects(planets);
            if (intersects.length === 0 && !isHtmlHover) {
                isGlobalHover = false;
                hideAllCards();
            }
        });

        // --- Animation Loop ---
        let isOrbitVisible = false;
        const orbitObserver = new IntersectionObserver((entries) => {
            isOrbitVisible = entries[0].isIntersecting;
        }, { threshold: 0 });
        orbitObserver.observe(canvasContainer);

        function animate() {
            requestAnimationFrame(animate);
            if (!isOrbitVisible) return; // Pause heavy rendering when out of view

            // Rotate core thread sphere continuously
            coreSphere.rotation.y += 0.002;
            coreSphere.rotation.x += 0.001;

            // Slowly rotate the whole orbit system for dynamic 3D feel
            orbitSystem.rotation.y += 0.0005;
            // Add a subtle wobble/breathing tilt over time
            orbitSystem.rotation.x = 0.5 + Math.sin(Date.now() * 0.0005) * 0.05;

            // Rotate the individual planets
            planets.forEach(planet => {
                planet.rotation.y += 0.01;
                planet.rotation.x += 0.005;
            });

            // Move the dummy objects in the ThreeJS scene
            nodes.forEach(node => {
                if (!isGlobalHover) {
                    // Update angle
                    node.angle += node.speed;
                }

                // Update 3D position of the tracked Object3D
                node.object.position.x = Math.cos(node.angle) * node.radius;
                node.object.position.y = 0; // It sits flat on the ring's plane
                node.object.position.z = Math.sin(node.angle) * node.radius;

                // --- Sync HTML Elements to 3D positions ---
                // Project 3D vector to 2D screen coordinates
                const vector = new THREE.Vector3();
                // We need to get the world position because it's inside the tilted orbitSystem group
                node.object.getWorldPosition(vector);
                vector.project(camera);

                // Convert to CSS coordinates
                const x = (vector.x * 0.5 + 0.5) * canvasContainer.clientWidth;
                const y = -(vector.y * 0.5 - 0.5) * canvasContainer.clientHeight;

                // Use constant scale and opacity to ensure the names are clearly readable and don't shrink to 0 size
                const depthScale = 1;
                const opacity = 1;
                const zIndex = Math.round((2 - vector.z) * 100);

                // Update the Label (attaching it right above the planet)
                const labelEl = node.labelEl;
                if (labelEl) {
                    labelEl.style.left = `${x}px`;
                    labelEl.style.top = `${y - 30}px`; // slightly above the 3D planet
                    labelEl.style.zIndex = zIndex;

                    // Only apply depth opacity/scale if not hovered globally
                    if (!isGlobalHover) {
                        labelEl.style.opacity = opacity;
                        labelEl.style.transform = `translate(-50%, -50%) scale(${depthScale})`;
                    }
                }

                // Update the Card (attaching it near the planet dynamically)
                const cardEl = node.cardEl;
                if (cardEl) {
                    const isRightSide = x > (canvasContainer.clientWidth / 2);

                    if (isRightSide) {
                        // Planet is on the right, card goes on its left
                        cardEl.classList.add('align-left');
                        cardEl.style.left = `${x - 290}px`; // Shift left by card width
                    } else {
                        // Planet is on the left, card goes on its right
                        cardEl.classList.remove('align-left');
                        cardEl.style.left = `${x + 30}px`; // Default offset to right
                    }

                    cardEl.style.top = `${y - 30}px`; // align height of arrow to planet
                    cardEl.style.zIndex = zIndex + 10; // always above its label
                }
            });

            renderer.render(scene, camera);
        }

        animate();

        // Handle Window Resize
        window.addEventListener('resize', () => {
            camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
            updateSolarSystemScale(); // Update scale on window resize
        });

    }

    /* ======== 7. FAQ Accordion ======== */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => i.classList.remove('active'));

            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    /* ======== 8. Stat Counter Animation ======== */
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateCounters() {
        if (statsAnimated) return;
        statsAnimated = true;

        statNumbers.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(eased * target);

                num.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    // Use IntersectionObserver to trigger when stats section is visible
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        statsObserver.observe(statsSection);
    }

    /* ======== 9. Journey V3 Scroll-activated Steps ======== */
    const journeySteps = document.querySelectorAll('.j3-step');
    const trackFill = document.querySelector('.j3-track-fill');
    const journeyContainer = document.querySelector('.journey-v3');

    if (journeySteps.length > 0 && trackFill && journeyContainer) {
        const stepObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('j3-active');
                }
            });
        }, { threshold: 0.3 });

        journeySteps.forEach(step => stepObserver.observe(step));

        // Use rAF for smooth track fill on scroll
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const rect = journeyContainer.getBoundingClientRect();
                    const scrolled = (window.innerHeight - rect.top) / (rect.height + window.innerHeight);
                    trackFill.style.height = `${Math.max(0, Math.min(1, scrolled)) * 100}%`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* ======== 10. WCU Performance Bar Animations ======== */
    const perfFills = document.querySelectorAll('.wcu-perf-fill');
    if (perfFills.length > 0) {
        // Store target widths from inline styles, then reset to 0
        perfFills.forEach(fill => {
            fill._targetWidth = fill.style.width || '0%';
            fill.style.width = '0%';
        });

        const featCard = document.querySelector('.wcu-feat-card');
        if (featCard) {
            const perfObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        perfFills.forEach((fill, i) => {
                            setTimeout(() => {
                                fill.style.width = fill._targetWidth;
                            }, 150 + i * 120);
                        });
                        perfObserver.unobserve(featCard);
                    }
                });
            }, { threshold: 0.4 });
            perfObserver.observe(featCard);
        }
    }

    /* ======== 11. FAQ Final Accordion ======== */
    const faqBtns = document.querySelectorAll('.faqcf-btn');
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faqcf-item');
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.faqcf-item').forEach(el => el.classList.remove('open'));

            // If it wasn't open, open it
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });

});
