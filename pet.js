// --- PRIVATE DIRECT VISUAL MONITOR ENGINE WITH SKIN SYSTEM ---

window.onload = function() {
    const element = document.getElementById('shimeji-character');
    if (!element) return;

    let currentX = 150;
    let currentY = window.innerHeight - 65;
    let prevX = currentX;
    let prevY = currentY;
    let direction = 1;
    let state = 'FLOOR_WALKING';

    let isOverdriveActive = false;
    let clickCount = 0;
    let resetTimeout = null;

    const targets = ['youtube-target', 'spotify-target', 'contact-target'];
    let mouseX = 0;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; });

    function findTargetCoords(id) {
        const target = document.getElementById(id);
        if (!target) return null;
        const rect = target.getBoundingClientRect();
        return { x: rect.left + (rect.width / 2) - 24, y: rect.top - 42 };
    }

    function playClickSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const dist = audioCtx.createWaveShaper();
            const gainNode = audioCtx.createGain();
            
            function makeDistortionCurve(amount) {
                let k = amount, n_samples = 44100, curve = new Float32Array(n_samples), i = 0, x;
                for ( ; i < n_samples; ++i ) { x = i * 2 / n_samples - 1; curve[i] = ( 3 + k ) * x * 20 / ( Math.PI + k * Math.abs(x) ); }
                return curve;
            }
            dist.curve = makeDistortionCurve(isOverdriveActive ? 120 : 60);
            osc.type = 'sawtooth'; 
            osc.frequency.setValueAtTime(isOverdriveActive ? 180 : 90, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.4);
            gainNode.gain.setValueAtTime(isOverdriveActive ? 0.4 : 0.25, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
            osc.connect(dist); dist.connect(gainNode); gainNode.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.4);
        } catch(e) {}
    }

    function spawnTrailParticle(x, y) {
        const trail = document.createElement('div');
        trail.style.position = 'fixed';
        trail.style.left = (x + 14 + Math.random() * 20) + 'px';
        trail.style.top = (y + 10 + Math.random() * 30) + 'px';
        trail.style.width = Math.floor(Math.random() * 4 + 3) + 'px';
        trail.style.height = trail.style.width;
        
        let currentColor = document.documentElement.style.getPropertyValue('--accent-color').trim() || '#ff0055';
        trail.style.backgroundColor = currentColor; 
        trail.style.boxShadow = `0 0 8px ${currentColor}`;
        
        trail.style.zIndex = '99'; trail.style.pointerEvents = 'none';
        document.body.appendChild(trail);
        setTimeout(() => { trail.style.transform = 'scale(0)'; trail.style.opacity = '0'; }, 50);
        setTimeout(() => { trail.remove(); }, 450);
    }

    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
        headerTitle.addEventListener('click', () => {
            clickCount++; clearTimeout(resetTimeout);
            resetTimeout = setTimeout(() => { clickCount = 0; }, 1000);
            if (clickCount >= 3) {
                clickCount = 0; isOverdriveActive = !isOverdriveActive;
                window.isMusicPlaying = isOverdriveActive;
                if (isOverdriveActive) {
                    headerTitle.style.animation = 'phonkGlow 0.3s infinite alternate ease-in-out';
                    headerTitle.style.color = '#ff0000';
                    document.documentElement.style.setProperty('--accent-color', '#ff0000');
                    playClickSound();
                } else {
                    headerTitle.style.animation = 'phonkGlow 3s infinite alternate ease-in-out';
                    headerTitle.style.color = '#ffffff';
                    document.documentElement.style.setProperty('--accent-color', '#ff0055');
                }
            }
        });
    }

    function updateMakimaBehavior() {
        if (mouseX > currentX) element.style.transform = 'scaleX(1)'; 
        else element.style.transform = 'scaleX(-1)'; 

        let baseSpeed = isOverdriveActive ? 3.6 : 1.2;
        let finalSpeed = baseSpeed;
        
        if (window.isMusicPlaying) {
            finalSpeed *= 1.6;
            element.classList.add('reactive-pulse');
        }

        if (state === 'FLOOR_WALKING') {
            currentX += finalSpeed * direction;
            element.style.left = currentX + 'px';
            element.style.top = (window.innerHeight - 65) + 'px';
            const maxW = window.innerWidth - 60;
            if (currentX > maxW) direction = -1; if (currentX < 15) direction = 1;

            if (Math.random() < 0.006 && !isOverdriveActive) {
                const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                const coord = findTargetCoords(randomTarget);
                if (coord) {
                    state = 'PANEL_SITTING'; currentX = coord.x; currentY = coord.y;
                    element.style.left = currentX + 'px'; element.style.top = currentY + 'px';
                    element.classList.add('reactive-pulse');
                }
            }
        } 
        else if (state === 'PANEL_SITTING') {
            if (Math.random() < 0.005 || isOverdriveActive) {
                state = 'FLOOR_WALKING'; currentY = window.innerHeight - 65;
                element.style.top = currentY + 'px'; element.classList.remove('reactive-pulse');
            }
        }

        let velocity = Math.abs(currentX - prevX) + Math.abs(currentY - prevY);
        if (velocity > 0.5) {
            spawnTrailParticle(currentX, currentY);
        }
        prevX = currentX; prevY = currentY;
    }

    element.addEventListener('click', (e) => {
        e.stopPropagation(); const originalY = currentY;
        element.style.top = (originalY - 30) + 'px';
        let auraColor = isOverdriveActive ? '#ff0000' : '#ff0055';
        element.style.filter = `drop-shadow(0 0 10px ${auraColor}) var(--pet-skin, initial)`;
        element.classList.add('reactive-pulse');
        playClickSound();
        setTimeout(() => { element.style.top = originalY + 'px'; element.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5)) var(--pet-skin, initial)'; if (state !== 'PANEL_SITTING') element.classList.remove('reactive-pulse'); }, 600);
    });

    document.querySelectorAll('.player-card, .platform-card').forEach(item => {
        item.addEventListener('mouseenter', () => element.classList.add('reactive-pulse'));
        item.addEventListener('mouseleave', () => { if (state !== 'PANEL_SITTING') element.classList.remove('reactive-pulse'); });
    });

    setInterval(updateMakimaBehavior, 20);
    element.style.left = currentX + 'px'; element.style.top = currentY + 'px';
};
