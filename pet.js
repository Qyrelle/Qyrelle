// --- QYRELLE ULTIMATE INTERACTIVE EXTENSION WORKSPACE ENGINE ---

const element = document.getElementById('shimeji-character');

let currentX = 150;
let currentY = window.innerHeight - 65;
let prevX = currentX;
let prevY = currentY;
let direction = 1;
let state = 'FLOOR_WALKING';

// Overdrive configuration states
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
    return {
        x: rect.left + (rect.width / 2) - 24,
        y: rect.top - 42 
    };
}

// --- SYNTH ACCENT SOUND GENERATOR (Tuned to low-end aggressive bass red theme) ---
function playClickSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();

        const osc = audioCtx.createOscillator();
        const dist = audioCtx.createWaveShaper(); // Distorts sound wave for an aggressive grit feel
        const gainNode = audioCtx.createGain();
        
        // Custom distortion curve values
        function makeDistortionCurve(amount) {
            let k = typeof amount === 'number' ? amount : 50,
                n_samples = 44100,
                curve = new Float32Array(n_samples),
                deg = Math.PI / 180, i = 0, x;
            for ( ; i < n_samples; ++i ) {
                x = i * 2 / n_samples - 1;
                curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
            }
            return curve;
        }
        
        dist.curve = makeDistortionCurve(isOverdriveActive ? 120 : 60);
        dist.oversample = '4x';
        
        osc.type = 'sawtooth'; // Aggressive harmonic wave shape
        osc.frequency.setValueAtTime(isOverdriveActive ? 180 : 90, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.4);

        gainNode.gain.setValueAtTime(isOverdriveActive ? 0.4 : 0.25, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

        osc.connect(dist);
        dist.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch(e) {
        console.log("Audio block bypass active.");
    }
}

// --- HIGH-INTENSITY PIXEL TRAIL GENERATOR ---
function spawnTrailParticle(x, y) {
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.left = (x + 14 + Math.random() * 20) + 'px';
    trail.style.top = (y + 10 + Math.random() * 30) + 'px';
    trail.style.width = Math.floor(Math.random() * 4 + 3) + 'px';
    trail.style.height = trail.style.width;
    
    // In overdrive mode, trails burn completely red, otherwise standard brand pink
    trail.style.backgroundColor = isOverdriveActive ? '#ff0000' : '#ff0055'; 
    trail.style.boxShadow = isOverdriveActive ? '0 0 10px #ff0000, 0 0 20px #ff0000' : '0 0 8px #ff0055, 0 0 15px #ff0055';
    
    trail.style.zIndex = '99'; 
    trail.style.pointerEvents = 'none';
    trail.style.borderRadius = '1px';
    trail.style.transition = 'all 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)';
    
    document.body.appendChild(trail);

    setTimeout(() => {
        trail.style.transform = isOverdriveActive ? 'translateY(25px) scale(0) rotate(90deg)' : 'translateY(15px) scale(0) rotate(45deg)';
        trail.style.opacity = '0';
    }, 50);

    setTimeout(() => { trail.remove(); }, 450);
}

// --- INTERACTIVE EASTER EGG OVERDRIVE INITIATION ---
const headerTitle = document.querySelector('header h1');
if (headerTitle) {
    headerTitle.style.cursor = 'pointer';
    headerTitle.addEventListener('click', () => {
        clickCount++;
        clearTimeout(resetTimeout);
        
        // Resets click tracking state if user pauses clicking sequence
        resetTimeout = setTimeout(() => { clickCount = 0; }, 1000);
        
        if (clickCount >= 3) {
            clickCount = 0;
            isOverdriveActive = !isOverdriveActive;
            
            if (isOverdriveActive) {
                // Set layout engine parameters to MAX velocity configuration
                headerTitle.style.animation = 'phonkGlow 0.3s infinite alternate ease-in-out';
                headerTitle.style.color = '#ff0000';
                document.documentElement.style.setProperty('--accent-color', '#ff0000');
                
                // Audio spike feedback cue
                playClickSound();
            } else {
                // Return parameters back to normal base values
                headerTitle.style.animation = 'phonkGlow 3s infinite alternate ease-in-out';
                headerTitle.style.color = '#ffffff';
                document.documentElement.style.setProperty('--accent-color', '#ff0055');
            }
        }
    });
}

function updateMakimaBehavior() {
    if (mouseX > currentX) {
        element.style.transform = 'scaleX(1)'; 
    } else {
        element.style.transform = 'scaleX(-1)'; 
    }

    // Dynamic speed scalar based on event triggers
    let speedModifier = isOverdriveActive ? 3.6 : 1.2;

    if (state === 'FLOOR_WALKING') {
        currentX += speedModifier * direction;
        element.style.left = currentX + 'px';
        element.style.top = (window.innerHeight - 65) + 'px';

        const maxW = window.innerWidth - 60;
        if (currentX > maxW) direction = -1;
        if (currentX < 15) direction = 1;

        // Skip random sitting cycles if she's in an active overdrive sprint
        if (Math.random() < 0.006 && !isOverdriveActive) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            const coord = findTargetCoords(randomTarget);
            if (coord) {
                state = 'PANEL_SITTING';
                currentX = coord.x;
                currentY = coord.y;
                element.style.left = currentX + 'px';
                element.style.top = currentY + 'px';
                element.classList.add('reactive-pulse');
            }
        }
    } 
    else if (state === 'PANEL_SITTING') {
        if (Math.random() < 0.005 || isOverdriveActive) {
            state = 'FLOOR_WALKING';
            currentY = window.innerHeight - 65;
            element.style.top = currentY + 'px';
            element.classList.remove('reactive-pulse');
        }
    }

    // Spawns persistent trail calculations
    let velocity = Math.abs(currentX - prevX) + Math.abs(currentY - prevY);
    if (velocity > 0.5) {
        spawnTrailParticle(currentX, currentY);
        if (isOverdriveActive || Math.abs(currentY - prevY) > 2) {
            spawnTrailParticle(currentX, currentY);
            spawnTrailParticle(currentX, currentY);
        }
    }

    prevX = currentX;
    prevY = currentY;
}

element.addEventListener('click', (e) => {
    e.stopPropagation();
    const originalY = currentY;
    element.style.top = (originalY - 30) + 'px';
    
    // Dynamic color illumination parameters
    element.style.filter = isOverdriveActive ? 'drop-shadow(0 0 15px #ff0000) brightness(1.4)' : 'drop-shadow(0 0 10px #ff0055)';
    element.classList.add('reactive-pulse');
    
    playClickSound();
    
    setTimeout(() => {
        element.style.top = originalY + 'px';
        element.style.filter = '';
        if (state !== 'PANEL_SITTING') {
            element.classList.remove('reactive-pulse');
        }
    }, 600);
});

document.querySelectorAll('.player-card, .platform-card').forEach(item => {
    item.addEventListener('mouseenter', () => {
        element.classList.add('reactive-pulse');
    });
    item.addEventListener('mouseleave', () => {
        if (state !== 'PANEL_SITTING') {
            element.classList.remove('reactive-pulse');
        }
    });
});

setInterval(updateMakimaBehavior, 20);

element.style.left = currentX + 'px';
element.style.top = currentY + 'px';
