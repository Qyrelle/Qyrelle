// --- MAKIMA AUDIO-REACTIVE TRAIL & ELECTRONIC SYNTH SOUND ENGINE ---

const element = document.getElementById('shimeji-character');

let currentX = 150;
let currentY = window.innerHeight - 65;
let prevX = currentX;
let prevY = currentY;
let direction = 1;
let state = 'FLOOR_WALKING';

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

// --- STEP 3: CODE-GENERATED WEB AUDIO SYNTH ACCENT ---
function playClickSound() {
    try {
        // Initialize independent digital audio framework context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();

        // 1. Setup Oscillator Node for deep electronic pitch tone frequencies
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle'; // Smooth, low-end bass texture perfect for Phonk layouts
        osc.frequency.setValueAtTime(120, audioCtx.currentTime); // Mid-low sweep starting point
        osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.35); // Sweeps down into deep sub bass

        // 2. Setup Volume Envelope curve to handle fast-decay pop punch
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Sets master drop volume
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35); // Fast smooth decay fade out

        // 3. Connect audio modules together and execute tone release execution
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch(e) {
        console.log("Audio play blocked by browser sandbox policy rules.");
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
    trail.style.backgroundColor = '#ff0055'; 
    trail.style.boxShadow = '0 0 8px #ff0055, 0 0 15px #ff0055';
    trail.style.zIndex = '99'; 
    trail.style.pointerEvents = 'none';
    trail.style.borderRadius = '1px';
    trail.style.transition = 'all 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)';
    
    document.body.appendChild(trail);

    setTimeout(() => {
        trail.style.transform = 'translateY(15px) scale(0) rotate(45deg)';
        trail.style.opacity = '0';
    }, 50);

    setTimeout(() => { trail.remove(); }, 450);
}

function updateMakimaBehavior() {
    if (mouseX > currentX) {
        element.style.transform = 'scaleX(1)'; 
    } else {
        element.style.transform = 'scaleX(-1)'; 
    }

    if (state === 'FLOOR_WALKING') {
        currentX += 1.2 * direction;
        element.style.left = currentX + 'px';
        element.style.top = (window.innerHeight - 65) + 'px';

        const maxW = window.innerWidth - 60;
        if (currentX > maxW) direction = -1;
        if (currentX < 15) direction = 1;

        if (Math.random() < 0.006) {
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
        if (Math.random() < 0.005) {
            state = 'FLOOR_WALKING';
            currentY = window.innerHeight - 65;
            element.style.top = currentY + 'px';
            element.classList.remove('reactive-pulse');
        }
    }

    let velocity = Math.abs(currentX - prevX) + Math.abs(currentY - prevY);
    if (velocity > 0.5) {
        spawnTrailParticle(currentX, currentY);
        if (Math.abs(currentY - prevY) > 2) {
            spawnTrailParticle(currentX, currentY);
            spawnTrailParticle(currentX, currentY);
        }
    }

    prevX = currentX;
    prevY = currentY;
}

// Click listener with custom code synth integration
element.addEventListener('click', (e) => {
    e.stopPropagation();
    const originalY = currentY;
    element.style.top = (originalY - 30) + 'px';
    element.classList.add('reactive-pulse');
    
    // Play our new synthesized sound wave
    playClickSound();
    
    setTimeout(() => {
        element.style.top = originalY + 'px';
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
