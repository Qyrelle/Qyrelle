// --- MAKIMA STANDARD STABLE NAVIGATION ENGINE ---

window.onload = function() {
    const element = document.getElementById('shimeji-character');
    if (!element) return;

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
        return { x: rect.left + (rect.width / 2) - 24, y: rect.top - 42 };
    }

    function playClickSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'triangle'; 
            osc.frequency.setValueAtTime(110, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            
            osc.connect(gainNode); gainNode.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.3);
        } catch(e) {}
    }

    function spawnTrailParticle(x, y) {
        const trail = document.createElement('div');
        trail.style.position = 'fixed';
        trail.style.left = (x + 14 + Math.random() * 20) + 'px';
        trail.style.top = (y + 10 + Math.random() * 30) + 'px';
        trail.style.width = Math.floor(Math.random() * 4 + 3) + 'px';
        trail.style.height = trail.style.width;
        trail.style.backgroundColor = '#ff0055'; 
        trail.style.boxShadow = '0 0 8px #ff0055';
        trail.style.zIndex = '99'; trail.style.pointerEvents = 'none';
        
        document.body.appendChild(trail);
        setTimeout(() => { trail.style.transform = 'scale(0)'; trail.style.opacity = '0'; }, 50);
        setTimeout(() => { trail.remove(); }, 450);
    }

    function updateMakimaBehavior() {
        if (mouseX > currentX) element.style.transform = 'scaleX(1)'; 
        else element.style.transform = 'scaleX(-1)'; 

        if (state === 'FLOOR_WALKING') {
            currentX += 1.3 * direction;
            element.style.left = currentX + 'px';
            element.style.top = (window.innerHeight - 65) + 'px';
            const maxW = window.innerWidth - 60;
            if (currentX > maxW) direction = -1; if (currentX < 15) direction = 1;

            if (Math.random() < 0.006) {
                const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                const coord = findTargetCoords(randomTarget);
                if (coord) {
                    state = 'PANEL_SITTING'; currentX = coord.x; currentY = coord.y;
                    element.style.left = currentX + 'px'; element.style.top = currentY + 'px';
                }
            }
        } 
        else if (state === 'PANEL_SITTING') {
            if (Math.random() < 0.005) {
                state = 'FLOOR_WALKING'; currentY = window.innerHeight - 65;
                element.style.top = currentY + 'px';
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
        element.style.filter = 'drop-shadow(0 0 10px #ff0055)';
        playClickSound();
        setTimeout(() => { element.style.top = originalY + 'px'; element.style.filter = ''; }, 600);
    });

    setInterval(updateMakimaBehavior, 20);
    element.style.left = currentX + 'px'; element.style.top = currentY + 'px';
};
