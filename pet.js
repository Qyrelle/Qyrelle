// --- MAKIMA ADVANCED LIFE-LIKE BEHAVIORAL ENGINE ---

window.onload = function() {
    const element = document.getElementById('shimeji-character');
    const bubble = document.getElementById('shimeji-bubble');
    if (!element || !bubble) return;

    let currentX = 150;
    let currentY = window.innerHeight - 65;
    let prevX = currentX;
    let prevY = currentY;
    let direction = 1;
    let state = 'FLOOR_WALKING'; // FLOOR_WALKING, PANEL_SITTING, STALKING_MOUSE
    let bubbleTimeout = null;

    const targets = ['youtube-target', 'spotify-target', 'contact-target'];
    let mouseX = 0;
    let mouseY = 0;
    let mouseIdleTimer = null;
    let isMouseIdle = false;

    // Monitor exact mouse vector arrays
    window.addEventListener('mousemove', (e) => { 
        mouseX = e.clientX; 
        mouseY = e.clientY;
        
        // Reset idle tracking state on cursor move
        isMouseIdle = false;
        clearTimeout(mouseIdleTimer);
        
        // If mouse stops moving for 1.2 seconds, she locks onto it
        mouseIdleTimer = setTimeout(() => {
            isMouseIdle = true;
        }, 1200);
    });

    const DIALOGUE_BANK = {
        GREETING: ["I'm keeping an eye on this workspace.", "A quiet listener is a good listener."],
        SPOTIFY: ["Let's see what tracks you're vibing with on Spotify.", "This beat meets my expectations."],
        YOUTUBE: ["Monitoring the latest visual edits.", "High velocity structure. Keep watching."],
        CLICK: ["Do not make me repeat myself.", "You are testing my patience."],
        STALKING: ["Why did you stop here?", "Are you waiting for me?", "I see what you are doing."],
        PEEK: ["Hiding in plain sight.", "Don't mind me...", "Observing."]
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
        bubbleTimeout = setTimeout(() => { bubble.classList.remove('visible'); }, 4000);
    }

    function positionSpeechBubble() {
        bubble.style.left = (currentX - 20) + 'px';
        bubble.style.top = (currentY - 45) + 'px';
    }

    function findTargetCoords(id) {
        const target = document.getElementById(id);
        if (!target) return null;
        const rect = target.getBoundingClientRect();
        // Return coordinate right on the bottom border frame line for peeking
        return { x: rect.left + (rect.width / 2) - 24, y: rect.bottom - 12, targetId: id };
    }

    function updateMakimaBehavior() {
        // Face the cursor direction naturally
        if (mouseX > currentX) element.style.transform = 'scaleX(1)'; 
        else element.style.transform = 'scaleX(-1)'; 

        // Apply a gentle breathing/swimming sway to her body naturally
        let baseSway = Math.sin(Date.now() / 300) * 2;
        element.style.paddingBottom = (Math.abs(baseSway)) + 'px';

        // --- CORE STATE MACHINE ---
        
        // Priority Override: If cursor is parked still, she walks towards it
        if (isMouseIdle && state !== 'PANEL_SITTING') {
            state = 'STALKING_MOUSE';
            let targetX = mouseX - 24;
            let targetY = mouseY - 42;
            
            // Move incrementally toward mouse position coordinates
            let diffX = targetX - currentX;
            let diffY = targetY - currentY;
            
            if (Math.abs(diffX) > 5) currentX += Math.sign(diffX) * 2.0;
            if (Math.abs(diffY) > 5) currentY += Math.sign(diffY) * 2.0;
            
            element.style.left = currentX + 'px';
            element.style.top = currentY + 'px';
            element.style.zIndex = "100"; // Stay in front while hunting cursor
            
            // If she reaches the cursor, say something and reset idle
            if (Math.abs(diffX) <= 6 && Math.abs(diffY) <= 6) {
                isMouseIdle = false;
                state = 'FLOOR_WALKING';
                triggerLocalDialogue('STALKING');
            }
        }
        // Baseline Floor Roaming behavior
        else if (state === 'FLOOR_WALKING') {
            element.style.zIndex = "100"; // Reset layer priority
            currentX += 1.3 * direction;
            currentY = window.innerHeight - 65;
            element.style.left = currentX + 'px';
            element.style.top = currentY + 'px';
            
            const maxW = window.innerWidth - 60;
            if (currentX > maxW) direction = -1; 
            if (currentX < 15) direction = 1;

            // Roll odds to climb and hide/peek behind an interface panel
            if (Math.random() < 0.006) {
                const randomTarget = targets[Math.floor(Math.random() * targets.length)];
                const coord = findTargetCoords(randomTarget);
                if (coord) {
                    state = 'PANEL_SITTING';
                    currentX = coord.x;
                    currentY = coord.y;
                    element.style.left = currentX + 'px';
                    element.style.top = currentY + 'px';
                    
                    // LAYER TRICK: Push her behind the card so she looks up from the bottom!
                    element.style.zIndex = "1"; 
                    
                    if (Math.random() < 0.5) triggerLocalDialogue('PEEK');
                    else if (randomTarget === 'spotify-target') triggerLocalDialogue('SPOTIFY');
                    else if (randomTarget === 'youtube-target') triggerLocalDialogue('YOUTUBE');
                }
            }
        } 
        // Peeking state loop
        else if (state === 'PANEL_SITTING') {
            // Keep her anchored down behind the card block layer
            element.style.zIndex = "1";
            
            // Randomly decide to slide out from behind the button/card back to floor
            if (Math.random() < 0.004) {
                state = 'FLOOR_WALKING';
                currentY = window.innerHeight - 65;
                element.style.top = currentY + 'px';
                element.style.zIndex = "100";
            }
        }

        // Particle trail tracking vector loops
        let velocity = Math.abs(currentX - prevX) + Math.abs(currentY - prevY);
        if (velocity > 0.5) {
            // Add custom forward tilt mechanics depending on movement speed
            let tilt = direction * 4;
            if (state === 'STALKING_MOUSE') tilt = Math.sign(currentX - prevX) * 6;
            element.style.transform += ` rotate(${tilt}deg)`;
        }
        
        if (bubble.classList.contains('visible')) { positionSpeechBubble(); }
        prevX = currentX; prevY = currentY;
    }

    element.addEventListener('click', (e) => {
        e.stopPropagation();
        const originalY = currentY;
        element.style.top = (originalY - 30) + 'px';
        element.style.filter = 'drop-shadow(0 0 10px #ff0055)';
        element.style.zIndex = "100"; // Force front if clicked while hiding
        
        triggerLocalDialogue('CLICK');
        setTimeout(() => { element.style.top = originalY + 'px'; element.style.filter = ''; }, 600);
    });

    setTimeout(() => { triggerLocalDialogue('GREETING'); }, 1000);
    setInterval(updateMakimaBehavior, 20);
    element.style.left = currentX + 'px'; element.style.top = currentY + 'px';
};
