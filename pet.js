// --- MAKIMA ADVANCED NAVIGATION EYE ENGINE ---

const element = document.getElementById('shimeji-character');

let currentX = 150;
let currentY = window.innerHeight - 65;
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

function updateMakimaBehavior() {
    // Face the mouse cursor dynamically
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
                
                // Triggers her eye glow bloom when she arrives on a media card panel!
                element.classList.add('reactive-pulse');
            }
        }
    } 
    else if (state === 'PANEL_SITTING') {
        if (Math.random() < 0.005) {
            state = 'FLOOR_WALKING';
            currentY = window.innerHeight - 65;
            element.style.top = currentY + 'px';
            
            // Turns off eye glow when she jumps back down to floor walk
            element.classList.remove('reactive-pulse');
        }
    }
}

// INTERACTIVE ACTION: Click response jolt
element.addEventListener('click', (e) => {
    e.stopPropagation();
    const originalY = currentY;
    element.style.top = (originalY - 30) + 'px';
    element.style.filter = 'drop-shadow(0 0 8px #ff0055)';
    element.classList.add('reactive-pulse'); // Force flash eyes on shock click
    
    setTimeout(() => {
        element.style.top = originalY + 'px';
        element.style.filter = '';
        if (state !== 'PANEL_SITTING') {
            element.classList.remove('reactive-pulse');
        }
    }, 600);
});

// AUDIO GLOBAL LISTENERS: Trigger her eye glow whenever mouse enters any player or streaming card
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
