// --- MAKIMA INTELLIGENT NAVIGATION ENGINE ---

const element = document.getElementById('shimeji-character');

let currentX = 150;
let currentY = window.innerHeight - 65;
let direction = 1;
let state = 'FLOOR_WALKING';
let idleTimer = null;

// Target points cache map
const targets = ['youtube-target', 'spotify-target', 'contact-target'];

// Track mouse position to let her look toward your cursor dynamically
let mouseX = 0;
window.addEventListener('mousemove', (e) => { mouseX = e.clientX; });

function findTargetCoords(id) {
    const target = document.getElementById(id);
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    return {
        x: rect.left + (rect.width / 2) - 24,
        y: rect.top - 42 // Sits directly on top edge of card frames
    };
}

function updateMakimaBehavior() {
    // Face the mouse cursor direction smoothly
    if (mouseX > currentX) {
        element.style.transform = 'scaleX(1)'; // Face right
    } else {
        element.style.transform = 'scaleX(-1)'; // Face left
    }

    if (state === 'FLOOR_WALKING') {
        currentX += 1.2 * direction;
        element.style.left = currentX + 'px';
        element.style.top = (window.innerHeight - 65) + 'px';

        // Ground boundaries calculation
        const maxW = window.innerWidth - 60;
        if (currentX > maxW) direction = -1;
        if (currentX < 15) direction = 1;

        // Random chance to look for a panel to jump and climb on
        if (Math.random() < 0.006) {
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            const coord = findTargetCoords(randomTarget);
            if (coord) {
                state = 'PANEL_SITTING';
                currentX = coord.x;
                currentY = coord.y;
                element.style.left = currentX + 'px';
                element.style.top = currentY + 'px';
                
                // Add a cute breathing scale effect when she successfully sits on a dashboard card
                element.style.transform += ' scale(1.05)';
            }
        }
    } 
    else if (state === 'PANEL_SITTING') {
        // Safe check if browser resized out from under her position
        if (Math.random() < 0.005) {
            // Drop back down to ground floor walking mode
            state = 'FLOOR_WALKING';
            currentY = window.innerHeight - 65;
            element.style.top = currentY + 'px';
        }
    }
}

// INTERACTIVE REACTION: Leaps out of shock if a user tries clicking her
element.addEventListener('click', (e) => {
    e.stopPropagation();
    const originalY = currentY;
    element.style.top = (originalY - 30) + 'px';
    element.style.filter = 'drop-shadow(0 0 8px #ff0055)'; // Subtle pink anger aura glow
    
    setTimeout(() => {
        element.style.top = originalY + 'px';
        element.style.filter = '';
    }, 400);
});

// Smooth 50Hz animation logic ticker
setInterval(updateMakimaBehavior, 20);

// Initialize starting coordinates
element.style.left = currentX + 'px';
element.style.top = currentY + 'px';
