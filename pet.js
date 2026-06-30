// --- MAKIMA LIVE AI INFERENCE AGENT ENGINE ---

window.onload = function() {
    const element = document.getElementById('shimeji-character');
    const bubble = document.getElementById('shimeji-speech');
    if (!element || !bubble) return;

    // --- SECURE INFERENCE CONNECTION CONFIGURATION ---
    const HF_TOKEN = "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";
    const MODEL_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct";

    let currentX = 150;
    let currentY = window.innerHeight - 65;
    let prevX = currentX;
    let prevY = currentY;
    let direction = 1;
    let state = 'FLOOR_WALKING';
    let bubbleTimeout = null;
    let isRequestPending = false;

    const targets = ['youtube-target', 'spotify-target', 'contact-target'];
    let mouseX = 0;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; });

    function findTargetCoords(id) {
        const target = document.getElementById(id);
        if (!target) return null;
        const rect = target.getBoundingClientRect();
        return { x: rect.left + (rect.width / 2) - 24, y: rect.top - 42 };
    }

    // --- SPEECH BUBBLE POSITIONING FRAMEWORK ---
    function updateBubblePosition() {
        bubble.style.left = (currentX - 10) + 'px';
        bubble.style.top = (currentY - 45) + 'px';
    }

    // --- OPTION B: REAL-TIME AI PROMPT CAPTURE FETCH ENGINE ---
    async function askMakimaAI(userActionDescription) {
        if (isRequestPending) return;
        isRequestPending = true;

        // Show loading ticks inside bubble framework
        bubble.innerText = "•••";
        bubble.classList.add('bubble-visible');
        updateBubblePosition();

        // Stable fallback arrays if API faces queue delays
        const fallbacks = {
            "click": ["Don't get familiar.", "I don't remember giving you permission to click me.", "Are you listing or just staring?", "Quiet. Listen to Qyrelle's tracks."],
            "youtube": ["Fascinating visual edits. Qyrelle has talent.", "Let's observe these videos."],
            "spotify": ["This Phonk bass drops heavy. Adequate work.", "Listen carefully. Sound waves carry power."]
        };

        try {
            const systemPrompt = "You are Makima from Chainsaw Man, chilling on Qyrelle's official Phonk music and visual edits hub. Speak directly to the user as Makima. Keep your response extremely brief, cold, cryptic, highly commanding, and under 12 words total. Do not use hashtags or actions.";
            const userPrompt = `The user performed this action on the dashboard: ${userActionDescription}. What do you say?`;

            const response = await fetch(MODEL_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${userPrompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
                    parameters: { max_new_tokens: 35, temperature: 0.7 }
                })
            });

            const data = await response.json();
            let aiText = "";

            if (data && data[0] && data[0].generated_text) {
                const fullText = data[0].generated_text;
                const parts = fullText.split("<|start_header_id|>assistant<|end_header_id|>\n\n");
                aiText = parts[parts.length - 1].trim();
            }

            // Clean data text or trigger structural fallback drop
            if (!aiText || aiText.length < 2) {
                throw new Error("Empty processing yield.");
            }

            bubble.innerText = aiText;
        } catch (error) {
            console.log("Inference cluster busy. Launching backup matrix arrays.", error);
            const list = fallbacks[userActionDescription] || fallbacks["click"];
            bubble.innerText = list[Math.floor(Math.random() * list.length)];
        } finally {
            isRequestPending = false;
            updateBubblePosition();

            // Hold speech visibility for 4 seconds, then drop cleanly out
            clearTimeout(bubbleTimeout);
            bubbleTimeout = setTimeout(() => {
                bubble.classList.remove('bubble-visible');
            }, 4000);
        }
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
                    
                    // AI speaks when landing on specific layout panels
                    if (randomTarget === 'youtube-target') askMakimaAI("youtube");
                    if (randomTarget === 'spotify-target') askMakimaAI("spotify");
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
        if (bubble.classList.contains('bubble-visible')) {
            updateBubblePosition();
        }
    }

    element.addEventListener('click', (e) => {
        e.stopPropagation(); const originalY = currentY;
        element.style.top = (originalY - 30) + 'px';
        element.style.filter = 'drop-shadow(0 0 10px #ff0055)';
        playClickSound();
        
        // Trigger live AI generation response loop on click
        askMakimaAI("click");

        setTimeout(() => { element.style.top = originalY + 'px'; element.style.filter = ''; }, 600);
    });

    setInterval(updateMakimaBehavior, 20);
    element.style.left = currentX + 'px'; element.style.top = currentY + 'px';
};
