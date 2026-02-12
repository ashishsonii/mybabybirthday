/* ================================
   COSMIC LOVE STORY - ADVANCED THREE.JS
   3D Photo Spheres & Cinematic Effects
   ================================ */

// === GLOBAL STATE ===
const state = {
    currentChapter: 1,
    totalChapters: 6,
    touchCount: 0,
    requiredTouches: 4,
    isTransitioning: false,
    isHolding: false,
    holdStartTime: null,
    celebrationActive: false,
    chapterTitles: [
        'The Beginning',
        'First Memory',
        'Memory Constellations',
        'Time Slows',
        'Favorite Universe',
        'Birthday Wish'
    ]
};

// === THREE.JS SETUP ===
let scene, camera, renderer;
let particleSystem, photoSpheres = [];
let animationId;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

// Photo URLs - You will replace these with your actual photos
const photoUrls = [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'
];

// === INITIALIZE ===
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initThreeJS();
    initChapterSystem();
    initTouchCounter();
    initPanda();
    initBirthdayWish();
    initAudio();
    initMouseTracking();
    disableScroll();
});

// === DISABLE SCROLL ===
function disableScroll() {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

// === PRELOADER ===
function initPreloader() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            preloader.classList.add('hidden');
            startExperience();
        }, 2000);
    });
}

// === START EXPERIENCE ===
function startExperience() {
    setTimeout(() => {
        const indicator = document.querySelector('.chapter-indicator');
        indicator.classList.add('visible');
    }, 500);
    
    setTimeout(() => {
        const counter = document.getElementById('touchCounter');
        counter.classList.add('visible');
    }, 1000);
    
    gsap.to('.cosmic-text', {
        opacity: 1,
        y: 0,
        duration: 2,
        delay: 0.5,
        ease: 'power3.out'
    });
    
    const ambient = document.getElementById('ambientAudio');
    if (ambient) {
        ambient.volume = 0;
        ambient.play().catch(e => console.log('Audio autoplay blocked'));
        gsap.to(ambient, { volume: 0.3, duration: 3 });
    }
}

// === THREE.JS INITIALIZATION ===
function initThreeJS() {
    const container = document.getElementById('three-container');
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x7b68ee, 2, 100);
    pointLight.position.set(0, 0, 30);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xff6ec7, 1.5, 100);
    pointLight2.position.set(-30, 20, 20);
    scene.add(pointLight2);
    
    // Create initial particle system
    createStarField();
    
    // Start animation loop
    animate();
    
    // Handle resize
    window.addEventListener('resize', onWindowResize);
}

// === CREATE STAR FIELD ===
function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    
    const starCount = window.innerWidth < 768 ? 3000 : 5000;
    
    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        vertices.push(x, y, z);
        
        // Random colors for stars
        const color = new THREE.Color();
        const colorChoice = Math.random();
        if (colorChoice > 0.8) {
            color.setHex(0x7b68ee); // Purple
        } else if (colorChoice > 0.6) {
            color.setHex(0xff6ec7); // Pink
        } else {
            color.setHex(0xffffff); // White
        }
        colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

// === CREATE PHOTO SPHERE ===
function createPhotoSphere(photoUrl, position, scale = 1) {
    const geometry = new THREE.SphereGeometry(8 * scale, 32, 32);
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(photoUrl);
    
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        emissive: 0x7b68ee,
        emissiveIntensity: 0.2,
        shininess: 30
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    
    // Add glow
    const glowGeometry = new THREE.SphereGeometry(8.5 * scale, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x7b68ee,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sphere.add(glow);
    
    sphere.userData.glow = glow;
    sphere.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.002,
        y: (Math.random() - 0.5) * 0.002
    };
    
    scene.add(sphere);
    photoSpheres.push(sphere);
    
    return sphere;
}

// === CREATE MULTIPLE PHOTO SPHERES (CONSTELLATION) ===
function createPhotoConstellation() {
    // Clear existing spheres
    photoSpheres.forEach(sphere => {
        scene.remove(sphere);
    });
    photoSpheres = [];
    
    // Create constellation of photo spheres
    const positions = [
        new THREE.Vector3(-15, 10, -10),
        new THREE.Vector3(15, 8, -15),
        new THREE.Vector3(0, -12, -8),
        new THREE.Vector3(-10, -8, -20),
        new THREE.Vector3(12, -5, -12)
    ];
    
    positions.forEach((pos, index) => {
        if (photoUrls[index]) {
            createPhotoSphere(photoUrls[index], pos, 0.8);
        }
    });
    
    // Animate spheres in
    photoSpheres.forEach((sphere, index) => {
        gsap.to(sphere.material, {
            opacity: 0.9,
            duration: 2,
            delay: index * 0.3,
            ease: 'power2.out'
        });
        gsap.to(sphere.userData.glow.material, {
            opacity: 0.3,
            duration: 2,
            delay: index * 0.3,
            ease: 'power2.out'
        });
        
        gsap.from(sphere.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1.5,
            delay: index * 0.3,
            ease: 'back.out(1.7)'
        });
    });
}

// === CREATE PARTICLE FIELD (TIME FREEZE) ===
function createTimeParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    
    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 50;
        vertices.push(x, y, z);
        
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.1 + 0.75, 1, 0.5);
        colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Animate particles
    gsap.to(material, {
        opacity: 0.8,
        duration: 2,
        ease: 'power2.out'
    });
    
    // Slow rotation
    gsap.to(particles.rotation, {
        y: Math.PI * 2,
        duration: 60,
        repeat: -1,
        ease: 'none'
    });
    
    return particles;
}

// === CREATE BLACK HOLE EFFECT ===
function createBlackHole() {
    // Create central photo sphere
    const centralSphere = createPhotoSphere(
        photoUrls[0], 
        new THREE.Vector3(0, 0, 0), 
        1.5
    );
    
    // Animate appearance
    gsap.to(centralSphere.material, {
        opacity: 1,
        duration: 2,
        ease: 'power2.out'
    });
    gsap.to(centralSphere.userData.glow.material, {
        opacity: 0.5,
        duration: 2,
        ease: 'power2.out'
    });
    
    // Create orbiting particles
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitVertices = [];
    const orbitColors = [];
    
    for (let i = 0; i < 1000; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 20;
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 5;
        const z = Math.sin(angle) * radius;
        orbitVertices.push(x, y, z);
        
        const color = new THREE.Color();
        color.setHex(Math.random() > 0.5 ? 0xff6ec7 : 0xffd700);
        orbitColors.push(color.r, color.g, color.b);
    }
    
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitVertices, 3));
    orbitGeometry.setAttribute('color', new THREE.Float32BufferAttribute(orbitColors, 3));
    
    const orbitMaterial = new THREE.PointsMaterial({
        size: 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const orbitParticles = new THREE.Points(orbitGeometry, orbitMaterial);
    scene.add(orbitParticles);
    
    // Spiral animation
    const positions = orbitGeometry.attributes.position.array;
    const originalPositions = Float32Array.from(positions);
    
    function animateSpiral() {
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = originalPositions[i];
            const y = originalPositions[i + 1];
            const z = originalPositions[i + 2];
            
            const radius = Math.sqrt(x * x + z * z);
            const angle = Math.atan2(z, x) + time * 0.3;
            const newRadius = radius * (1 - Math.sin(time * 0.5) * 0.1);
            
            positions[i] = Math.cos(angle) * newRadius;
            positions[i + 1] = y + Math.sin(time * 2 + i) * 0.5;
            positions[i + 2] = Math.sin(angle) * newRadius;
        }
        
        orbitGeometry.attributes.position.needsUpdate = true;
    }
    
    // Start spiral animation
    const spiralInterval = setInterval(animateSpiral, 16);
    
    return { centralSphere, orbitParticles, spiralInterval };
}

// === ANIMATION LOOP ===
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Rotate particle system
    if (particleSystem) {
        particleSystem.rotation.y += 0.0002;
        particleSystem.rotation.x += 0.0001;
    }
    
    // Rotate photo spheres
    photoSpheres.forEach(sphere => {
        sphere.rotation.y += sphere.userData.rotationSpeed.y;
        sphere.rotation.x += sphere.userData.rotationSpeed.x;
        
        // Gentle floating motion
        const time = Date.now() * 0.001;
        sphere.position.y += Math.sin(time + sphere.position.x) * 0.003;
    });
    
    // Mouse parallax
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// === WINDOW RESIZE ===
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// === MOUSE TRACKING ===
function initMouseTracking() {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = (e.touches[0].clientX - window.innerWidth / 2);
            mouseY = (e.touches[0].clientY - window.innerHeight / 2);
        }
    });
}

// === CHAPTER SYSTEM ===
function initChapterSystem() {
    updateChapterIndicator();
    
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetChapter = index + 1;
            if (targetChapter <= state.currentChapter) {
                transitionToChapter(targetChapter);
            }
        });
    });
}

function updateChapterIndicator() {
    const dots = document.querySelectorAll('.dot');
    const chapterTitle = document.querySelector('.chapter-title');
    
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index + 1 === state.currentChapter) {
            dot.classList.add('active');
        } else if (index + 1 < state.currentChapter) {
            dot.classList.add('completed');
        }
    });
    
    chapterTitle.textContent = `Chapter ${romanNumeral(state.currentChapter)}: ${state.chapterTitles[state.currentChapter - 1]}`;
}

function romanNumeral(num) {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI'];
    return romanNumerals[num - 1] || num;
}

// === TOUCH COUNTER SYSTEM ===
function initTouchCounter() {
    document.addEventListener('click', handleTouch);
    document.addEventListener('touchend', handleTouch);
}

function handleTouch(e) {
    if (state.isTransitioning || state.celebrationActive) return;
    if (e.target.closest('.panda-guide, .dot, .hold-area')) return;
    
    const x = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || window.innerWidth / 2;
    const y = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || window.innerHeight / 2;
    
    createTouchRipple(x, y);
    
    state.touchCount++;
    updateCounterDisplay();
    
    if (state.touchCount >= state.requiredTouches) {
        advanceChapter();
    }
}

function createTouchRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 1000);
}

function updateCounterDisplay() {
    const counterNumber = document.querySelector('.counter-number');
    
    gsap.to(counterNumber, {
        scale: 1.3,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
        onComplete: () => {
            counterNumber.textContent = state.touchCount;
        }
    });
    
    counterNumber.textContent = state.touchCount;
}

function resetTouchCounter() {
    state.touchCount = 0;
    const counterNumber = document.querySelector('.counter-number');
    counterNumber.textContent = '0';
}

// === CHAPTER TRANSITIONS ===
function advanceChapter() {
    if (state.currentChapter >= state.totalChapters) return;
    
    state.isTransitioning = true;
    
    const counter = document.getElementById('touchCounter');
    gsap.to(counter, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => counter.classList.remove('visible')
    });
    
    setTimeout(() => {
        transitionToChapter(state.currentChapter + 1);
    }, 500);
}

function transitionToChapter(chapterNumber) {
    if (chapterNumber === state.currentChapter) return;
    
    state.isTransitioning = true;
    
    const currentAct = document.querySelector(`.chapter[data-chapter="${state.currentChapter}"]`);
    const nextAct = document.querySelector(`.chapter[data-chapter="${chapterNumber}"]`);
    const transition = document.getElementById('chapterTransition');
    
    const chapterNumEl = transition.querySelector('.chapter-number');
    const chapterSubEl = transition.querySelector('.chapter-subtitle');
    chapterNumEl.textContent = `Chapter ${romanNumeral(chapterNumber)}`;
    chapterSubEl.textContent = state.chapterTitles[chapterNumber - 1];
    
    if (currentAct) {
        currentAct.classList.add('exiting');
        currentAct.classList.remove('active');
    }
    
    transition.classList.add('active');
    animateTransitionConstellation();
    
    setTimeout(() => {
        state.currentChapter = chapterNumber;
        resetTouchCounter();
        updateChapterIndicator();
        
        if (currentAct) {
            currentAct.classList.remove('exiting');
        }
        
        if (nextAct) {
            nextAct.classList.add('entering', 'active');
            triggerChapterAnimations(chapterNumber);
        }
        
        setTimeout(() => {
            transition.classList.remove('active');
            
            if (nextAct) {
                nextAct.classList.remove('entering');
            }
            
            if (state.currentChapter < state.totalChapters) {
                setTimeout(() => {
                    const counter = document.getElementById('touchCounter');
                    counter.classList.add('visible');
                    gsap.to(counter, { opacity: 1, duration: 0.5 });
                }, 500);
            }
            
            state.isTransitioning = false;
        }, 2000);
    }, 3000);
}

// === TRANSITION CONSTELLATION ===
function animateTransitionConstellation() {
    const canvas = document.getElementById('transitionConstellation');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < 100; i++) {
        const angle = (Math.PI * 2 * i) / 100;
        const distance = 50 + Math.random() * 200;
        
        particles.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            targetX: centerX,
            targetY: centerY,
            size: Math.random() * 3 + 1,
            alpha: Math.random() * 0.8 + 0.2,
            speed: Math.random() * 0.02 + 0.01
        });
    }
    
    let progress = 0;
    
    function animate() {
        if (progress >= 1) {
            particles.forEach(p => {
                const angle = Math.atan2(p.y - centerY, p.x - centerX);
                const distance = 500;
                p.targetX = centerX + Math.cos(angle) * distance;
                p.targetY = centerY + Math.sin(angle) * distance;
            });
            
            let explodeProgress = 0;
            function explode() {
                if (explodeProgress >= 1) return;
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                explodeProgress += 0.05;
                
                particles.forEach(p => {
                    p.x += (p.targetX - p.x) * 0.1;
                    p.y += (p.targetY - p.y) * 0.1;
                    
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(123, 104, 238, ${p.alpha * (1 - explodeProgress)})`;
                    ctx.fill();
                    
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = 'rgba(255, 110, 199, 0.8)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
                
                requestAnimationFrame(explode);
            }
            explode();
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        progress += 0.02;
        
        particles.forEach(p => {
            p.x += (p.targetX - p.x) * p.speed;
            p.y += (p.targetY - p.y) * p.speed;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(123, 104, 238, ${p.alpha})`;
            ctx.fill();
            
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(123, 104, 238, 0.8)';
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// === CHAPTER ANIMATIONS ===
function triggerChapterAnimations(chapter) {
    switch(chapter) {
        case 2: animateChapter2(); break;
        case 3: animateChapter3(); break;
        case 4: animateChapter4(); break;
        case 5: animateChapter5(); break;
        case 6: animateChapter6(); break;
    }
}

function animateChapter2() {
    // Create single large photo sphere
    photoSpheres.forEach(sphere => scene.remove(sphere));
    photoSpheres = [];
    
    const sphere = createPhotoSphere(
        photoUrls[0],
        new THREE.Vector3(0, 0, 0),
        2
    );
    
    gsap.to(sphere.material, {
        opacity: 0.95,
        duration: 2,
        delay: 0.5,
        ease: 'power2.out'
    });
    
    gsap.to(sphere.userData.glow.material, {
        opacity: 0.4,
        duration: 2,
        delay: 0.5,
        ease: 'power2.out'
    });
    
    gsap.from(sphere.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 2,
        delay: 0.5,
        ease: 'back.out(1.7)'
    });
    
    // Animate text
    setTimeout(() => {
        gsap.to('.memory-text', {
            opacity: 1,
            duration: 1.5,
            ease: 'power2.out'
        });
    }, 1500);
    
    // Show panda
    setTimeout(() => {
        gsap.to('.panda-guide', {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    }, 2000);
}

function animateChapter3() {
    createPhotoConstellation();
    
    setTimeout(() => {
        gsap.to('.constellation-title', {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'power2.out'
        });
        gsap.to('.constellation-subtitle', {
            opacity: 1,
            y: 0,
            duration: 1.5,
            delay: 0.3,
            ease: 'power2.out'
        });
    }, 1500);
}

function animateChapter4() {
    // Clear photo spheres
    photoSpheres.forEach(sphere => scene.remove(sphere));
    photoSpheres = [];
    
    // Create time particles
    const timeParticles = createTimeParticles();
    
    // Create central photo
    const centralPhoto = createPhotoSphere(
        photoUrls[1],
        new THREE.Vector3(0, 0, -10),
        1.5
    );
    
    gsap.to(centralPhoto.material, {
        opacity: 0.9,
        duration: 2,
        delay: 1,
        ease: 'power2.out'
    });
    
    // Slow down particle rotation
    gsap.to(particleSystem.rotation, {
        x: particleSystem.rotation.x,
        y: particleSystem.rotation.y,
        duration: 3,
        ease: 'power1.out'
    });
    
    // Animate text
    setTimeout(() => {
        gsap.to('.time-text', {
            opacity: 1,
            duration: 1.5,
            ease: 'power2.out'
        });
        gsap.to('.time-subtitle', {
            opacity: 0.8,
            duration: 1.5,
            delay: 0.5,
            ease: 'power2.out'
        });
    }, 2000);
}

function animateChapter5() {
    // Clear existing
    photoSpheres.forEach(sphere => scene.remove(sphere));
    photoSpheres = [];
    
    // Create black hole effect
    const blackHole = createBlackHole();
    
    // Animate text
    setTimeout(() => {
        gsap.to('.favorite-text', {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: 'back.out(1.7)'
        });
        gsap.to('.favorite-title', {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            delay: 0.5,
            ease: 'back.out(1.7)'
        });
    }, 2000);
    
    // Vibration
    if ('vibrate' in navigator) {
        setTimeout(() => {
            navigator.vibrate([200, 100, 200]);
        }, 2500);
    }
}

function animateChapter6() {
    // Birthday chapter - minimal 3D, focus on interaction
}

// === PANDA ===
function initPanda() {
    const panda = document.getElementById('panda');
    if (!panda) return;
    
    panda.addEventListener('click', (e) => {
        e.stopPropagation();
        gsap.to(panda, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
        
        createHeartBurst(
            panda.getBoundingClientRect().left + 40,
            panda.getBoundingClientRect().top + 40
        );
    });
    
    let longPressTimer;
    
    const startLongPress = (e) => {
        e.preventDefault();
        e.stopPropagation();
        longPressTimer = setTimeout(() => showSecretMessage(), 2000);
    };
    
    const endLongPress = (e) => {
        e.stopPropagation();
        clearTimeout(longPressTimer);
    };
    
    panda.addEventListener('touchstart', startLongPress);
    panda.addEventListener('touchend', endLongPress);
    panda.addEventListener('mousedown', startLongPress);
    panda.addEventListener('mouseup', endLongPress);
}

function showSecretMessage() {
    const secretMsg = document.getElementById('secretMessage');
    secretMsg.classList.add('show');
    
    setTimeout(() => {
        gsap.to(secretMsg, {
            opacity: 0,
            scale: 0,
            duration: 0.5,
            ease: 'back.in(1.7)',
            onComplete: () => {
                secretMsg.classList.remove('show');
                secretMsg.style.opacity = '';
                secretMsg.style.transform = '';
            }
        });
    }, 3000);
}

function createHeartBurst(x, y) {
    const container = document.getElementById('heartParticles');
    if (!container) return;
    
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-particle';
        heart.textContent = '❤️';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        
        const angle = (Math.PI * 2 * i) / 5;
        const distance = 50 + Math.random() * 50;
        
        container.appendChild(heart);
        
        gsap.to(heart, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance - 100,
            opacity: 0,
            scale: 0.5,
            rotation: 360,
            duration: 2,
            ease: 'power2.out',
            onComplete: () => heart.remove()
        });
    }
}

// === BIRTHDAY WISH ===
function initBirthdayWish() {
    const holdArea = document.getElementById('holdArea');
    const progressCircle = document.querySelector('.progress-ring-fill');
    
    if (!holdArea || !progressCircle) return;
    
    const circumference = 2 * Math.PI * 90;
    let holdProgress = 0;
    let animationFrame;
    
    const startHold = (e) => {
        e.stopPropagation();
        state.isHolding = true;
        state.holdStartTime = Date.now();
        
        function updateProgress() {
            if (!state.isHolding) return;
            
            const elapsed = Date.now() - state.holdStartTime;
            holdProgress = Math.min(elapsed / 3000, 1);
            
            const offset = circumference - (holdProgress * circumference);
            progressCircle.style.strokeDashoffset = offset;
            
            gsap.to('.hold-area', {
                scale: 1 + (holdProgress * 0.2),
                duration: 0.1
            });
            
            if (holdProgress >= 1) {
                triggerCelebration();
                return;
            }
            
            animationFrame = requestAnimationFrame(updateProgress);
        }
        
        updateProgress();
    };
    
    const endHold = (e) => {
        if (e) e.stopPropagation();
        state.isHolding = false;
        cancelAnimationFrame(animationFrame);
        
        gsap.to(progressCircle, {
            strokeDashoffset: circumference,
            duration: 0.5,
            ease: 'power2.out'
        });
        
        gsap.to('.hold-area', { scale: 1, duration: 0.3 });
        holdProgress = 0;
    };
    
    holdArea.addEventListener('mousedown', startHold);
    holdArea.addEventListener('mouseup', endHold);
    holdArea.addEventListener('mouseleave', endHold);
    holdArea.addEventListener('touchstart', startHold);
    holdArea.addEventListener('touchend', endHold);
}

function triggerCelebration() {
    if (state.celebrationActive) return;
    state.celebrationActive = true;
    
    const celebration = document.getElementById('celebration');
    celebration.classList.add('active');
    
    gsap.to('.panda-birthday, .wish-instructions, .hold-area', {
        opacity: 0,
        scale: 0.8,
        duration: 0.5
    });
    
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 300]);
    }
    
    startConfetti();
    
    gsap.to('.birthday-message', {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        delay: 0.5,
        ease: 'back.out(1.7)'
    });
    
    const ambient = document.getElementById('ambientAudio');
    const celebrationAudio = document.getElementById('celebrationAudio');
    
    if (ambient) {
        gsap.to(ambient, {
            volume: 0,
            duration: 1,
            onComplete: () => ambient.pause()
        });
    }
    
    if (celebrationAudio) {
        celebrationAudio.volume = 0;
        celebrationAudio.play().catch(e => console.log('Audio blocked'));
        gsap.to(celebrationAudio, { volume: 0.5, duration: 1 });
    }
}

function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#ff6ec7', '#7b68ee', '#ffd700', '#00f5ff', '#ffffff'];
    
    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.05,
            tiltAngle: 0
        });
    }
    
    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((c, index) => {
            c.tiltAngle += c.tiltAngleIncremental;
            c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
            c.x += Math.sin(c.d);
            c.tilt = Math.sin(c.tiltAngle) * 15;
            
            if (c.y > canvas.height) {
                confetti[index] = {
                    x: Math.random() * canvas.width,
                    y: -20,
                    r: c.r,
                    d: c.d,
                    color: c.color,
                    tilt: c.tilt,
                    tiltAngleIncremental: c.tiltAngleIncremental,
                    tiltAngle: c.tiltAngle
                };
            }
            
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.tilt * Math.PI / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.r / 2, -c.r / 2, c.r, c.r);
            ctx.restore();
        });
        
        requestAnimationFrame(drawConfetti);
    }
    
    drawConfetti();
}

function initAudio() {
    const enableAudio = () => {
        const ambient = document.getElementById('ambientAudio');
        if (ambient && ambient.paused) {
            ambient.play().catch(e => console.log('Audio blocked'));
        }
    };
    
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
}

console.log('🌌 Advanced Cosmic Love Story - Three.js Active');
console.log('👆 Tap/Click anywhere 4 times to advance chapters');
console.log('📸 Remember to replace photo URLs in the code!');