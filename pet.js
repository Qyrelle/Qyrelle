// --- QYRELLE COGNITIVE SHIMEJI INTERACTION ENGINE ---

const element = document.getElementById('shimeji-character');

// --- ANIMATION CONTENT LINKS ---
// Swap these URLs out with transparent anime girl GIFs or custom sprite artwork matching your ideal outfits
const ANIMATION_STATES = {
    WALKING: 'https://i.imgur.com/vH6vA5A.gif',  // Walking loops
    IDLE: 'https://i.imgur.com/8N4F9Xy.gif',     // Standing chill state
    SINGING: 'https://i.imgur.com/Xm6zS5l.gif',  // Vibes/smiles on music components
    ANGRY: 'https://i.imgur.com/mY7L9m0.gif'     // Click shock reaction state
};

let currentX = 100;
let currentY = window.innerHeight - 120;
let state = 'IDLE';
let targetElementId = null;

// Baseline rendering logic
function setCharacterVisual(stateKey) {
    state = stateKey;
    element.style.backgroundImage = `url('${ANIMATION_STATES[stateKey]}')`;
}

// AI TARGET ENGINE: Finds coordinates of elements (like Spotify or YouTube windows) to jump on them
function findTargetCoordinates(id) {
    const target = document.getElementById(id);
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    return {
        x: rect.left + (rect.width / 2) - 40,
        y: rect.top - 105 // Sits perfectly on top of the container tab menu
    };
}

// CRADLE CONTROLLER: Handles AI decision states dynamically
function runIntelligenceTicker() {
    if (state === 'ANGRY' || state === 'SINGING') return;

    const roll = Math.random();

    if (roll < 0.15) {
        // ACTION: Jump up onto the YouTube Dashboard window
        const coord = findTargetCoordinates('youtube-target');
        if (coord) {
            currentX = coord.x;
            currentY = coord.y;
            setCharacterVisual('IDLE');
        }
    } 
    else if (roll < 0.30) {
        // ACTION: Go sit on the Spotify Player and vibe to your music tracks
        const coord = findTargetCoordinates('spotify-target');
        if (coord) {
            currentX = coord.x;
            currentY = coord.y;
            setCharacterVisual('SINGING');
            // Remains vibing for 5 seconds before moving again
            setTimeout(() => setCharacterVisual('IDLE'), 5000);
        }
    } 
    else if (roll < 0.70) {
        // ACTION: Jump back down to walk along the bottom window panel base
        currentY = window.innerHeight - 120;
        setCharacterVisual('WALKING');
        const direction = Math.random() > 0.5 ? 1 : -1;
        currentX += (Math.random() * 120 + 40) * direction;
        
        // Boundaries processing
        if (currentX < 20) currentX = 50;
        if (currentX > window.innerWidth - 100) currentX = window.innerWidth - 150;
        
        element.style.transform = direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
    } 
    else {
        // ACTION: Stand still and stay idle
        setCharacterVisual('IDLE');
    }

    // Apply positioning updates smoothly
    element.style.left = currentX + 'px';
    element.style.top = currentY + 'px';
}

// EMOTION HOOK: Triggers anger expression when a user clicks directly on her body structure
element.addEventListener('click', (e) => {
    e.stopPropagation();
    setCharacterVisual('ANGRY');
    // Jumps vertically out of shock
    element.style.top = (currentY - 20) + 'px';
    
    setTimeout(() => {
        element.style.top = currentY + 'px';
        setCharacterVisual('IDLE');
    }, 1500);
});

// Run character logic cycles every 3.5 seconds
setInterval(runIntelligenceTicker, 3500);

// Initialize baseline character values
setCharacterVisual('IDLE');
element.style.left = currentX + 'px';
element.style.top = currentY + 'px';
