// --- MAKIMA NAVIGATION AURIC GLOW & VELOCITY TRAIL ENGINE ---

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

// --- STEP 2: HIGH-INTENSITY PIXEL TRAIL GENERATOR ---
function spawnTrailParticle(x, y) {
    const trail = document.createElement('div');
    // Generates square glitch blocks matching your editing aesthetic
    trail.style.position = 'fixed';
    trail.style.left = (x + 14 + Math.random() * 20) + 'px';
    trail.style.top = (y + 10 + Math.random() * 30) + 'px';
    trail.style.width = Math.floor(Math.random() * 4 + 3) + 'px';
    trail.style.height = trail.style.width;
    trail.style.backgroundColor = '#ff0055'; // High-vis Phonk pink
    trail.style.boxShadow = '0 0 8px #ff0055, 0 0 15px #ff0055';
    trail.style.zIndex = '99'; // Renders right beneath Makima but above panels
    trail.style.pointerEvents = 'none';
    trail.style.borderRadius = '1px';
    trail.style.transition = 'all 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)';
    
    document.body.appendChild(trail);

    // Force browser repaint to trigger smooth scaling physics collapse
    setTimeout(() => {
        trail.style.transform = 'translateY(15px) scale(0) rotate(45deg)';
        trail.style.opacity = '0';
    }, 50);

    // Garbage collector: clean node from background memory plane
    setTimeout(() => {
        trail.remove();
    }, 450);
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

    // TRAIL CHECKER: Spawns particles if she is moving or launching vertically
    let velocity = Math.abs(currentX - prevX) + Math.abs(currentY - prevY);
    if (velocity > 0.5) {
        spawnTrailParticle(currentX, currentY);
        // If jumping or crossing panels, add extra particles for speed intensity
        if (Math.abs(currentY - prevY) > 2) {
            spawnTrailParticle(currentX, currentY);
            spawnTrailParticle(currentX, currentY);
        }
    }

    // Store historical coordinate ticks
    prevX = currentX;
    prevY = currentY;
}

element.addEventListener('click', (e) => {
    e.stopPropagation();
    const originalY = currentY;
    element.style.top = (originalY - 30) + 'px';
    element.classList.add('reactive-pulse');
    
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
