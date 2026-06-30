// --- MAKIMA FLUSHED STANDALONE SCRIPT ENGINE ---

window.onload = function() {
    const element = document.getElementById('shimeji-character');
    const bubble = document.getElementById('shimeji-bubble');
    if (!element || !bubble) return;

    let currentX = 150;
    let currentY = window.innerHeight - 65;
    let prevX = currentX;
    let prevY = currentY;
    let direction = 1;
    let state = 'FLOOR_WALKING';
    let bubbleTimeout = null;

    const targets = ['youtube-target', 'spotify-target', 'contact-target'];
    let mouseX = 0;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; });

    const DIALOGUE_BANK = {
        GREETING: [
            "Welcome to the hub. Don't touch anything without permission.",
            "I'm keeping an eye on this workspace.",
            "A quiet listener is a good listener."
        ],
        SPOTIFY: [
            "Let's see what tracks you're vibing with on Spotify.",
            "Qyrelle's audio work is under my absolute control.",
            "This beat meets my expectations."
        ],
        YOUTUBE: [
            "Monitoring the latest visual edits.",
            "High velocity structure. Keep watching.",
            "The visuals are proceeding according to plan."
        ],
        CLICK: [
            "Do not make me repeat myself.",
            "You are testing my patience.",
            "Everything here belongs to me, including your attention."
        ],
        AMBIENT: [
            "Listen closely to the audio work.",
            "The atmosphere here suits me.",
            "Keep exploring. I am watching."
        ]
    };

    function triggerLocalDialogue(category) {
        const lines = DIALOGUE_BANK[category];
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        showSpeechBubble(randomLine);
    }

    function showSpeechBubble(text) {
        clearTimeout(bubbleTimeout);
        bubble.innerText = text;
        bubble.classList.add('visible');
        positionSpeechBubble();

        bubbleTimeout = setTimeout(() => {
            bubble.classList.remove('visible');
        }, 4500);
    }

    function positionSpeechBubble() {
        bubble.style.left = (currentX - 20) + 'px';
        bubble.style.top = (currentY - 45) + 'px';
    }

    function playClickSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'triangle'; osc.frequency.setValueAtTime(110, audioCtx.currentTime);
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
        trail.style.backgroundColor = '#ff0055'; trail.style.boxShadow = '0 0 8px #ff0055';
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

            if (Math.random() < 0.0015 && !bubble.classList.contains('visible')) {
                triggerLocalDialogue('AMBIENT');
            }

            if (Math.random() < 0.006) {
                const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                const coord = findTargetCoords(randomTarget);
                if (coord) {
                    state = 'PANEL_SITTING'; currentX = coord.x; currentY = coord.y;
                    element.style.left = currentX + 'px'; element.style.top = currentY + 'px';
                    
                    if (randomTarget === 'spotify-target') triggerLocalDialogue('SPOTIFY');
                    else if (randomTarget === 'youtube-target') triggerLocalDialogue('YOUTUBE');
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
        
        if (bubble.classList.contains('visible')) {
            positionSpeechBubble();
        }

        prevX = currentX; prevY = currentY;
    }

    element.addEventListener('click', (e) => {
        e.stopPropagation(); const originalY = currentY;
        element.style.top = (originalY - 30) + 'px';
        element.style.filter = 'drop-shadow(0 0 10px #ff0055)';
        playClickSound();
        
        triggerLocalDialogue('CLICK');

        setTimeout(() => { element.style.top = originalY + 'px'; element.style.filter = ''; }, 600);
    });

    setTimeout(() => {
        triggerLocalDialogue('GREETING');
    }, 1000);

    setInterval(updateMakimaBehavior, 20);
    element.style.left = currentX + 'px'; element.style.top = currentY + 'px';
};
