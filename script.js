// === GLOBAL ENGINE ===
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let currentSim = null;
let animId = null;
let state = {};

// ===============================================
// === GLOBAL STORAGE ENGINE (The Brain) ===
// ===============================================
const STORAGE_KEY = 'ap_physics_lab_progress';

function saveProgress(simId, level) {
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    if (!data[simId] || level > data[simId]) {
        data[simId] = level;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log(`Progress Saved: Unit ${simId} = Level ${level}`);
    }
}

function loadProgress(simId) {
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return data[simId] || 0; 
}

function clearProgress() {
    if(confirm("Are you sure you want to reset all progress?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
}

// ===============================================
// === GLOBAL UI: SIDEBAR TOGGLE ===
// ===============================================
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById('menu-btn');
    const sidebar = document.querySelector('aside'); 

    if (btn && sidebar) {
        btn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            btn.classList.toggle('dark-mode');
            btn.innerHTML = sidebar.classList.contains('collapsed') ? "☰" : "✕"; 
            setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 350);
        });
    }
});

function toggleMenu(id) {
    document.getElementById(id).classList.toggle('open');
}

// === HELPER: DRAW ARROW ===
function drawVector(x, y, dx, dy, color) {
    let head = 10;
    let angle = Math.atan2(dy, dx);
    let len = Math.sqrt(dx*dx + dy*dy);
    if(len < 1) return; 
    
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke();
    ctx.beginPath(); 
    ctx.moveTo(x+dx, y+dy);
    ctx.lineTo(x+dx - head*Math.cos(angle-Math.PI/6), y+dy - head*Math.sin(angle-Math.PI/6));
    ctx.lineTo(x+dx - head*Math.cos(angle+Math.PI/6), y+dy - head*Math.sin(angle+Math.PI/6));
    ctx.fill();
}

// === HELPER: COMING SOON SCREEN ===
function showComingSoon(simId) {
    if(state.running) state.running = false;
    currentSim = null;
    
    // 1. Hide the Sim Interface
    let ui = document.getElementById('sim-interface');
    if(ui) ui.style.display = 'none';
    
    // 2. Show the Placeholder
    let ph = document.getElementById('sim-placeholder');
    if(ph) {
        ph.style.display = 'block';
        ph.innerHTML = `
            <div style="background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #ddd; display: inline-block;">
                <h3 style="margin-top:0; color: #f39c12; font-size: 1.5em;">🚧 Under Construction 🚧</h3>
                <p style="font-size: 1.1em; line-height: 1.6;">
                    The simulation for <b>Unit ${simId}</b> is currently being engineered.<br>
                    Please check back soon!
                </p>
            </div>
        `;
    }
    
    // 3. SMART TITLE LOOKUP
    // Find the button in the sidebar that was clicked to get the full text
    let btn = document.querySelector(`button[onclick="loadSim('${simId}')"]`);
    let titleText = btn ? btn.innerText : `Unit ${simId}`; // Fallback if not found
    
    document.getElementById('sim-title').innerText = titleText;
}

// === SIMULATION LOADER (ROUTER) ===
function loadSim(simId) {
    if(state.running) state.running = false;
    if(animId) cancelAnimationFrame(animId);
    ctx.clearRect(0,0,canvas.width, canvas.height);
    currentSim = simId;

    // --- SIDEBAR HIGHLIGHTING ---
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    let activeBtn = document.querySelector(`button[onclick="loadSim('${simId}')"]`);
    if(activeBtn) activeBtn.classList.add('active');

    let validSim = false;
    
    // 3. Router
    try {
        // Unit 1: Kinematics
        if      (simId === '1.1') { setup_1_1(); validSim = true; }
        else if (simId === '1.2') { setup_1_2(); validSim = true; }
        else if (simId === '1.3') { setup_1_3(); validSim = true; }
        else if (simId === '1.4') { setup_1_4(); validSim = true; }
        else if (simId === '1.5') { setup_1_5(); validSim = true; }
        
        // Unit 2: Dynamics
        else if (simId === '2.1') { setup_2_1(); validSim = true; }
        else if (simId === '2.2') { setup_2_2(); validSim = true; }
        else if (simId === '2.3') { setup_2_3(); validSim = true; }
        else if (simId === '2.4') { setup_2_4(); validSim = true; }
        else if (simId === '2.5') { setup_2_5(); validSim = true; }
        else if (simId === '2.6') { setup_2_6(); validSim = true; }
        else if (simId === '2.7') { setup_2_7(); validSim = true; }
        else if (simId === '2.8') { setup_2_8(); validSim = true; }
        else if (simId === '2.9') { setup_2_9(); validSim = true; }
        
        // Unit 3: Energy
        else if (simId === '3.1') { setup_3_1(); validSim = true; }
        else if (simId === '3.2') { setup_3_2(); validSim = true; }
        else if (simId === '3.3') { setup_3_3(); validSim = true; }
        else if (simId === '3.4') { setup_3_4(); validSim = true; }
        else if (simId === '3.5') { setup_3_5(); validSim = true; }
        
        // Unit 4: Momentum
        else if (simId === '4.1') { setup_4_1(); validSim = true; }
        else if (simId === '4.2') { setup_4_2(); validSim = true; }
        else if (simId === '4.3') { setup_4_3(); validSim = true; }
        else if (simId === '4.4') { setup_4_4(); validSim = true; }
        
        // Unit 5: Torque & Rotation
        else if (simId === '5.1') { setup_5_1(); validSim = true; }
        else if (simId === '5.2') { setup_5_2(); validSim = true; }
        else if (simId === '5.3') { setup_5_3(); validSim = true; }
        else if (simId === '5.4') { setup_5_4(); validSim = true; }
        else if (simId === '5.5') { setup_5_5(); validSim = true; }
        else if (simId === '5.6') { setup_5_6(); validSim = true; }
        
        // Unit 6: Rotational Energy
        else if (simId === '6.1') { setup_6_1(); validSim = true; }
        else if (simId === '6.2') { setup_6_2(); validSim = true; }
        else if (simId === '6.3') { setup_6_3(); validSim = true; }
        else if (simId === '6.4') { setup_6_4(); validSim = true; }
        else if (simId === '6.5') { setup_6_5(); validSim = true; }
        else if (simId === '6.6') { setup_6_6(); validSim = true; }
        
        // Unit 7: Oscillations
        else if (simId === '7.1') { setup_7_1(); validSim = true; }
        else if (simId === '7.2') { setup_7_2(); validSim = true; }
        else if (simId === '7.3') { setup_7_3(); validSim = true; }
        else if (simId === '7.4') { setup_7_4(); validSim = true; }
        
        // Unit 8: Fluids
        else if (simId === '8.1') { setup_8_1(); validSim = true; }
        else if (simId === '8.2') { setup_8_2(); validSim = true; }
        else if (simId === '8.3') { setup_8_3(); validSim = true; }
        else if (simId === '8.4') { setup_8_4(); validSim = true; }

    } catch (e) {
        console.error(`Simulation ${simId} error:`, e);
        validSim = false; 
    }
    
    // 4. Update UI Visibility
    let ph = document.getElementById('sim-placeholder');
    let ui = document.getElementById('sim-interface');

    if (validSim) {
        if(ph) ph.style.display = 'none'; 
        if(ui) {
            ui.style.display = 'grid'; 
            ui.classList.remove('hidden');
        }
    } else {
        showComingSoon(simId);
    }
}

// ===============================================
// === UNIT 1.1: SCALARS & VECTORS (Gold Standard v4.0) ===
// ===============================================

function setup_1_1() {
    canvas.width = 700; 
    canvas.height = 600; 

    document.getElementById('sim-title').innerText = "1.1 Scalars and Vectors in 1D";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Distance vs. Displacement</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        <b>Scalars (Distance)</b> add up every step you take.<br>
        <b>Vectors (Displacement)</b> care only about Start vs. End.<br>
        <i><b>Mission:</b> Add motion vectors to match the targets below.</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_1_1('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_1_1('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u1-1-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> SCALAR MASTER
            </div>
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px;">
            <label style="color:#8e44ad; font-weight:bold;">Next Displacement (<i class="var">&Delta;x</i>): <span id="v-dx">0.0</span> m</label>
            <input type="range" id="in-dx" class="phys-slider" min="-8" max="8" step="1" value="0" 
                oninput="updateState_1_1('nextDx', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="step_1_1()" id="btn-move">Move Cart</button>
            <button class="btn btn-red" onclick="reset_1_1()">Reset</button>
        </div>

        <div style="margin-top:15px; padding:15px; background:#fff; border:1px solid #ddd; border-radius:4px; font-family:'Times New Roman', serif;">
            <div id="eq-dist" style="margin-bottom:8px; font-size:1.0em;"></div>
            <div id="eq-disp" style="font-size:1.0em;"></div>
        </div>
        
        <div id="u1-1-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    // Snap Protection
    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_1_1();
}

function updateState_1_1(key, val) {
    if(state.moving) return; // Lock while animating
    
    state[key] = parseFloat(val);
    if(key === 'nextDx') {
        document.getElementById('v-dx').innerText = state.nextDx.toFixed(1);
    }
    
    // Preview the arrow
    draw_1_1();
}

function setMode_1_1(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u1-1-questions');
    const badge = document.getElementById('u1-1-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_1_1();
    }
    updateLocks_1_1();
}

function updateLocks_1_1() {
    let sliders = document.querySelectorAll('.phys-slider');
    let moveBtn = document.getElementById('btn-move');
    
    // Lock if moving
    let lock = state.moving;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    moveBtn.disabled = lock;
    moveBtn.style.opacity = lock ? "0.5" : "1.0";
}

function step_1_1() {
    if(state.moving || Math.abs(state.nextDx) < 0.1) return;
    
    // Commit the move
    state.history.push(state.nextDx);
    
    // Animation Setup
    state.startPos = state.currentPos;
    state.targetPos = state.currentPos + state.nextDx;
    state.animProgress = 0;
    state.moving = true;
    
    updateLocks_1_1();
    loop_1_1();
}

function reset_1_1() {
    let savedLevel = loadProgress('1.1'); 

    state = {
        nextDx: parseFloat(document.getElementById('in-dx').value),
        currentPos: 0,
        distance: 0,
        
        history: [], // Stores list of moves [3, -2, 5]
        
        // Animation State
        moving: false,
        startPos: 0,
        targetPos: 0,
        animProgress: 0,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    if(state.level >= 3) document.getElementById('u1-1-badge').style.display = 'block';

    setMode_1_1(state.mode);
    draw_1_1(); // Initial Draw
}

function loop_1_1() {
    if(currentSim !== '1.1') return;

    if(state.moving) {
        // Animation Logic
        state.animProgress += 0.05; // Speed
        if(state.animProgress >= 1) {
            state.animProgress = 1;
            state.moving = false;
            state.currentPos = state.targetPos;
            
            // Update Distance Accumulator
            state.distance += Math.abs(state.history[state.history.length-1]);
            
            // Check Level Completion
            if(state.mode === 'guided') checkLevel_1_1();
            updateLocks_1_1();
        } else {
            // Lerp Position
            state.currentPos = state.startPos + (state.targetPos - state.startPos) * state.animProgress;
        }
    }

    // Live Equation Update
    let dColor = "#e67e22"; // Orange for Distance
    let xColor = "#8e44ad"; // Purple for Displacement
    
    document.getElementById('eq-dist').innerHTML = 
        `<span style="color:${dColor}; font-weight:bold;">Distance:</span> <i>d</i> = ${state.distance.toFixed(1)} m`;
        
    let dispVal = state.currentPos.toFixed(1);
    document.getElementById('eq-disp').innerHTML = 
        `<span style="color:${xColor}; font-weight:bold;">Displacement:</span> <i class="var">&Delta;x</i> = ${dispVal} m`;

    draw_1_1();
    
    if(state.moving) requestAnimationFrame(loop_1_1);
}

function draw_1_1() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // --- ZONE 1: THE WORLD (Top 200px) ---
    let trackY = 150; 
    let trackH = 40;
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, trackY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, trackY, 700, trackH); 
    
    // Ticks
    let pxPerM = 30; // Scale: 30px = 1m
    let centerX = 350;
    
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    for(let i=-10; i<=10; i++) {
        let x = centerX + i*pxPerM;
        ctx.fillRect(x, trackY, 1, 10);
        ctx.fillText(i, x, trackY + 25);
    }

    // Draw History Arrows (Ghost Vectors)
    let cursorX = centerX; // Start at 0
    let yStack = trackY - 40; // Stack arrows upwards
    
    state.history.forEach((dx) => {
        let startX = cursorX;
        let endX = cursorX + dx*pxPerM;
        
        // Draw dashed arrow for past moves
        drawVector(startX, yStack, dx*pxPerM, 0, "rgba(52, 152, 219, 0.5)");
        
        cursorX = endX;
        yStack -= 25; // Stack up
    });
    
    // Draw Current Move (Animated or Preview)
    if(state.moving) {
        // We are animating the cart, but the vector is fixed for this step
        let moveDx = state.history[state.history.length-1];
        // Draw the active vector solid
        let startX = centerX + state.startPos*pxPerM;
        drawVector(startX, yStack, moveDx*pxPerM, 0, "#3498db");
    } else if (Math.abs(state.nextDx) > 0) {
        // Preview Vector
        let startX = centerX + state.currentPos*pxPerM;
        drawVector(startX, yStack, state.nextDx*pxPerM, 0, "rgba(142, 68, 173, 0.5)"); // Faint purple
        
        ctx.fillStyle = "#8e44ad"; ctx.font="bold 12px sans-serif";
        ctx.fillText("Next", startX + (state.nextDx*pxPerM)/2, yStack - 5);
    }

    // Draw The Cart
    let cartX = centerX + (state.currentPos * pxPerM);
    let cartY = trackY - 30; 
    let cartW = 50; 
    let cartH = 30;

    ctx.fillStyle = "#e74c3c"; // Red Cart
    ctx.fillRect(cartX - cartW/2, cartY, cartW, cartH);
    ctx.strokeStyle = "#c0392b"; ctx.lineWidth = 2; 
    ctx.strokeRect(cartX - cartW/2, cartY, cartW, cartH);
    
    ctx.fillStyle = "#333"; // Wheels
    ctx.beginPath(); ctx.arc(cartX - 15, cartY + cartH, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cartX + 15, cartY + cartH, 6, 0, Math.PI*2); ctx.fill();


    // --- ZONE 2: THE DASHBOARD (Bottom 400px) ---
    // Split Panel: Scalars Left, Vectors Right
    let panelY = 250; 
    let panelH = 350; 
    ctx.fillStyle = "white"; ctx.fillRect(0, panelY, 700, panelH);
    ctx.strokeStyle = "#ddd"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0, panelY); ctx.lineTo(700, panelY); ctx.stroke();
    
    // Draw Divider
    ctx.beginPath(); ctx.moveTo(350, panelY); ctx.lineTo(350, panelY+panelH); ctx.stroke();

    // --- LEFT GRAPH: DISTANCE (Scalar) ---
    let dZeroX = 50;
    let dZeroY = panelY + 300; 
    let dScale = 8; // Pixels per meter (accumulates fast)
    
    // Axes
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(dZeroX, dZeroY); ctx.lineTo(320, dZeroY); ctx.stroke(); // X
    ctx.beginPath(); ctx.moveTo(dZeroX, panelY+30); ctx.lineTo(dZeroX, dZeroY); ctx.stroke(); // Y
    
    // Scale Numbers (Distance)
    ctx.fillStyle = "#555"; ctx.font = "10px sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for(let v = 0; v <= 30; v += 5) {
        let y = dZeroY - (v * dScale);
        if(y > panelY+30) {
            ctx.beginPath(); ctx.moveTo(dZeroX, y); ctx.lineTo(dZeroX-5, y); ctx.stroke();
            ctx.fillText(v, dZeroX - 8, y);
        }
    }
    
    // Title Left
    ctx.save();
    ctx.translate(20, dZeroY - 120); 
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = "center"; ctx.font = "bold 14px sans-serif"; ctx.fillStyle = "#e67e22";
    ctx.fillText("Distance (m)", 0, 0);
    ctx.restore();
    
    // Distance Bar
    drawBar(185, dZeroY, state.distance, dScale, "#e67e22", "d", "", true);


    // --- RIGHT GRAPH: DISPLACEMENT (Vector) ---
    let vZeroX = 400; 
    let vZeroY = panelY + 160; // Center Y
    let vScale = 12; // Pixels per meter
    
    // Axes
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(vZeroX, vZeroY); ctx.lineTo(670, vZeroY); ctx.stroke(); // X
    ctx.beginPath(); ctx.moveTo(vZeroX, panelY+30); ctx.lineTo(vZeroX, panelY+panelH-30); ctx.stroke(); // Y
    
    // Scale Numbers (Displacement)
    ctx.fillStyle = "#555"; ctx.font = "10px sans-serif"; ctx.textAlign = "right"; 
    for(let v = -10; v <= 10; v += 5) {
        if(v===0) continue;
        let y = vZeroY - (v * vScale);
        ctx.beginPath(); ctx.moveTo(vZeroX, y); ctx.lineTo(vZeroX-5, y); ctx.stroke();
        ctx.fillText(v, vZeroX - 8, y);
    }
    ctx.fillText("0", vZeroX - 8, vZeroY);

    // Title Right
    ctx.save();
    ctx.translate(370, vZeroY); 
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = "center"; ctx.font = "bold 14px sans-serif"; ctx.fillStyle = "#8e44ad";
    ctx.fillText("Position (m)", 0, 0);
    ctx.restore();
    
    // Displacement Bar
    drawBar(535, vZeroY, state.currentPos, vScale, "#8e44ad", "x", "", false);
}

function renderQuestions_1_1() {
    let div = document.getElementById('u1-1-questions');
    
    // Typography Helper
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#e67e22;">Level 1: The Commute</h4>
            <p style="margin-bottom:10px;">Move <b>+5 m</b>, then move <b>-5 m</b>.</p>
            <p style="margin-bottom:10px;">Observe the <b style="color:#e67e22">Distance</b> vs. <b style="color:#8e44ad">Displacement</b>.</p>
            <p>Target: ${v('x')} = 0 m, Distance = 10 m.</p>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 2: Negative Territory</h4>
            <p style="margin-bottom:10px;">Reach a position of <b>-8 m</b> using exactly <b>3 moves</b>.</p>
            <p>Target: ${v('x')} = -8 m.</p>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 3: Efficiency</h4>
            <p style="margin-bottom:10px;">Reset. Make <b>Displacement = Distance</b>.</p>
            <p>Target: ${v('x')} > 5 m, ${v('x')} == Distance.</p>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; SCALAR MASTER &#9733;</h3>
            <p>You understand that distance adds up, but displacement cancels out!</p>
        `;
    }
}

function checkLevel_1_1() {
    let correct = false;
    
    if(state.level === 0) {
        // Target: x=0, dist=10
        if(Math.abs(state.currentPos) < 0.1 && Math.abs(state.distance - 10) < 0.1) correct = true;
    }
    else if(state.level === 1) {
        // Target: x=-8, moves=3
        if(Math.abs(state.currentPos - (-8)) < 0.1 && state.history.length === 3) correct = true;
    }
    else if(state.level === 2) {
        // Target: x > 5, x == dist
        if(state.currentPos > 5 && Math.abs(state.currentPos - state.distance) < 0.1) correct = true;
    }
    
    if(correct) {
        // Visual Feedback
        let div = document.getElementById('u1-1-questions');
        div.innerHTML += `<div style="margin-top:10px; font-weight:bold; color:green;">Correct! Unlocking next step...</div>`;
        
        state.level++;
        saveProgress('1.1', state.level);
        
        if(state.level >= 3) document.getElementById('u1-1-badge').style.display = 'block';
        
        setTimeout(() => {
            state.history = []; // Clear history for next level cleanly
            state.currentPos = 0; state.distance = 0;
            state.startPos = 0; state.targetPos = 0;
            updateState_1_1('nextDx', 0); // Reset slider
            document.getElementById('in-dx').value = 0;
            renderQuestions_1_1();
        }, 1500);
    }
}

// ===============================================
// === UNIT 1.2: DISPLACEMENT & VELOCITY (Formerly 1.1) ===
// ===============================================

function setup_1_2() {
    canvas.width = 700; 
    canvas.height = 600; 

    document.getElementById('sim-title').innerText = "1.2 Displacement, Velocity & Acceleration";
    document.getElementById('sim-title').style.marginBottom = "-10px";

    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">1D Kinematics</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        <b>Position (<i class="var">x</i>)</b> is your location.
        <br><b>Velocity (<i class="var">v</i>)</b> is how fast your position changes.
        <br><i><b>Mission:</b> Master the relationship between x and v to unlock the full controls!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_1_2('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_1_2('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u1-mastery-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> AP MASTER
            </div>
        </div>

        <div class="control-group" style="border-left: 4px solid #3498db; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold;">Initial Position (<i class="var">x<sub>0</sub></i>): <span id="v-x0">0.0</span> m</label>
            <input type="range" id="in-x0" class="phys-slider" min="-10" max="10" step="1" value="0" 
                oninput="updateState_1_2('x0', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #9b59b6; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold;">Velocity (<i class="var">v</i>): <span id="v-v">0.0</span> m/s</label>
            <input type="range" id="in-v" class="phys-slider" min="-10" max="10" step="1" value="0" 
                oninput="updateState_1_2('v', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_1_2()">Start Moving</button>
            <button class="btn btn-red" onclick="reset_1_2()">Reset</button>
        </div>

        <div style="margin-top:15px; padding:15px; background:#fff; border:1px solid #ddd; border-radius:4px; font-family:'Times New Roman', serif;">
            <div id="eq-pos" style="margin-bottom:8px; font-size:1.1em; color:#000;"></div>
            <div id="eq-time" style="font-size:1.0em; color:#555;"></div>
        </div>
        
        <div id="u1-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    // Snap Protection
    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_1_2();
}

function updateState_1_2(key, val) {
    if(state.running) return; 
    state[key] = parseFloat(val);
    
    if(key === 'x0') {
        document.getElementById('v-x0').innerText = state.x0.toFixed(1);
        state.x = state.x0; 
    }
    if(key === 'v') {
        document.getElementById('v-v').innerText = state.v.toFixed(1);
    }
    loop_1_2(); 
}

function setMode_1_2(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u1-questions');
    const badge = document.getElementById('u1-mastery-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_1_2();
    }
    updateLocks_1_2();
}

function updateLocks_1_2() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.querySelector('.btn-green');
    let lockAll = state.running; 
    
    sliders.forEach(s => {
        s.disabled = lockAll;
        s.style.opacity = lockAll ? "0.5" : "1.0";
    });
    runBtn.disabled = lockAll;
    runBtn.style.opacity = lockAll ? "0.5" : "1.0";
}

function start_1_2() {
    if(!state.running) {
        state.running = true;
        updateLocks_1_2(); 
        loop_1_2();
    }
}

function reset_1_2() {
    let savedLevel = loadProgress('1.2'); // Updated ID

    state = {
        x0: parseFloat(document.getElementById('in-x0').value),
        v: parseFloat(document.getElementById('in-v').value),
        x: 0, 
        t: 0,
        graphData: [],
        running: false,
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    state.x = state.x0; 
    
    if(state.level >= 3) document.getElementById('u1-mastery-badge').style.display = 'block';

    setMode_1_2(state.mode);
    loop_1_2();
}

function loop_1_2() {
    if(currentSim !== '1.2') return;

    if(state.running) {
        let dt = 0.02; 
        state.t += dt;
        state.x += state.v * dt;
        
        if(Math.floor(state.t * 100) % 5 === 0) {
            state.graphData.push({t: state.t, x: state.x});
        }
        
        if(state.x < -20 || state.x > 20) state.running = false;
        if(!state.running) updateLocks_1_2();
    }

    let colorV = "#9b59b6"; 
    let colorX = "#2980b9"; 
    
    document.getElementById('eq-pos').innerHTML = 
        `Position: <span style="color:${colorX}; font-weight:bold;">x</span> = ${state.x.toFixed(1)} m`;
    document.getElementById('eq-time').innerHTML = 
        `Time: t = ${state.t.toFixed(1)} s`;

    draw_1_2();
    
    if(state.running) requestAnimationFrame(loop_1_2);
}

function draw_1_2() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // 1. WORLD SETUP
    let trackY = 200; 
    let trackH = 40;
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, trackY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, trackY, 700, trackH); 
    
    // 2. THE CAR
    let pxPerM = 17.5;
    let centerX = 350;
    let carX = centerX + (state.x * pxPerM);
    let carY = trackY - 30; 
    let carW = 60; 
    let carH = 30;

    ctx.fillStyle = "#3498db"; 
    ctx.fillRect(carX - carW/2, carY, carW, carH);
    ctx.strokeStyle = "#2980b9"; ctx.lineWidth = 2; 
    ctx.strokeRect(carX - carW/2, carY, carW, carH);
    
    ctx.fillStyle = "#333";
    ctx.beginPath(); ctx.arc(carX - 20, carY + carH, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(carX + 20, carY + carH, 6, 0, Math.PI*2); ctx.fill();
    
    if(Math.abs(state.v) > 0.1) {
        let vLen = state.v * 10; 
        let vy = carY - 15;
        drawVector(carX, vy, vLen, 0, "#9b59b6");
        ctx.fillStyle = "#9b59b6"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("v", carX + vLen/2, vy - 10);
    }

    // 3. GRAPH (x vs t)
    let graphY = 350; 
    let graphH = 250; 
    
    ctx.fillStyle = "white"; ctx.fillRect(0, graphY, 700, graphH);
    ctx.strokeStyle = "#ddd"; ctx.lineWidth=1;
    ctx.strokeRect(0, graphY, 700, graphH);

    let gZeroY = graphY + graphH/2; 
    let gZeroX = 50; 
    
    ctx.strokeStyle = "#333"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(gZeroX, gZeroY); ctx.lineTo(680, gZeroY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(gZeroX, graphY+10); ctx.lineTo(gZeroX, graphY+graphH-10); ctx.stroke();
    
    // Labels
    ctx.fillStyle = "#333"; ctx.font = "italic 14px Times New Roman";
    ctx.textAlign = "right"; ctx.fillText("Time (s)", 680, gZeroY + 20);
    
    // FIX: Rotated Y-Axis Label
    ctx.save();
    ctx.translate(gZeroX - 30, graphY + graphH/2); // Move to left center of axis
    ctx.rotate(-Math.PI/2); // Rotate 90 degrees CCW
    ctx.textAlign = "center";
    ctx.fillText("Position (m)", 0, 0);
    ctx.restore();

    if(state.graphData.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = "#2980b9"; ctx.lineWidth = 2;
        let pxPerSec = 40;
        let pYScale = 4; 
        
        let tOffset = 0;
        let lastT = state.graphData[state.graphData.length-1].t;
        if(lastT * pxPerSec > 600) {
            tOffset = (lastT * pxPerSec) - 600;
        }

        for(let i=0; i<state.graphData.length; i++) {
            let p = state.graphData[i];
            let plotX = gZeroX + (p.t * pxPerSec) - tOffset;
            let plotY = gZeroY - (p.x * pYScale);
            
            if(plotX >= gZeroX && plotY >= graphY && plotY <= graphY + graphH) {
                if(i===0) ctx.moveTo(plotX, plotY);
                else ctx.lineTo(plotX, plotY);
            }
        }
        ctx.stroke();
    }
}

function renderQuestions_1_2() {
    let div = document.getElementById('u1-questions');
    let inputStyle = "width:80px; padding:5px; margin-right:10px; border:1px solid #ccc; border-radius:4px;";
    let btnStyle = "padding:5px 15px; background:#27ae60; color:white; border:none; border-radius:4px; cursor:pointer;";

    // Helper for variable styling (Serif Math Font)
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Position</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                Set Velocity ${v('v')} to <b>0 m/s</b>.<br>
                Move the car to <b style="color:#2980b9">${v('x')} = -5.0 m</b>.
            </p>
            <p style="margin-bottom:10px;">Press "Check" when you are there.</p>
            <div>
                <button style="${btnStyle}" onclick="checkAnswer_1_2(0)">Check Position</button>
            </div>
            <span id="fb-0" style="display:block; margin-top:10px; font-weight:bold;"></span>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#9b59b6;">Level 2: Velocity</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                Set Position ${v('x')} to <b>0 m</b>.<br>
                Set Velocity ${v('v')} to <b style="color:#9b59b6">5 m/s</b>.
            </p>
            <p style="margin-bottom:10px;">Calculate where the car will be after ${v('t')} = <b>2.0 s</b>.</p>
            <div>
                <input type="number" id="ans-1" placeholder="meters" style="${inputStyle}" onkeydown="if(event.key==='Enter') checkAnswer_1_2(1)">
                <button style="${btnStyle}" onclick="checkAnswer_1_2(1)">Check</button>
            </div>
            <span id="fb-1" style="display:block; margin-top:10px; font-weight:bold;"></span>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#e67e22;">Level 3: Backwards!</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                Start at <b style="color:#2980b9">${v('x<sub>0</sub>')} = 8 m</b>.<br>
                You want to reach <b style="color:#2980b9">${v('x')} = -2 m</b> in exactly <b>5 seconds</b>.
            </p>
            <p style="margin-bottom:10px;">What Velocity ${v('v')} do you need?</p>
            <div>
                <input type="number" id="ans-2" placeholder="m/s" style="${inputStyle}" onkeydown="if(event.key==='Enter') checkAnswer_1_2(2)">
                <button style="${btnStyle}" onclick="checkAnswer_1_2(2)">Check</button>
            </div>
            <span id="fb-2" style="display:block; margin-top:10px; font-weight:bold;"></span>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; MASTERY ACHIEVED &#9733;</h3>
            <p>You have mastered 1D Motion!</p>
        `;
    }
}

function checkAnswer_1_2(lvl) {
    let correct = false;
    let tol = 0.5;

    if(lvl === 0) {
        if(Math.abs(state.x - (-5)) < tol && Math.abs(state.v) < 0.1) correct = true;
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-1').value);
        if(Math.abs(val - 10.0) < tol) correct = true;
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-2').value);
        if(Math.abs(val - (-2.0)) < tol) correct = true;
    }

    let fb = document.getElementById('fb-'+lvl);
    
    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        if(state.level === lvl) {
             state.level++;
             saveProgress('1.2', state.level); // Updated ID
        }
        if(state.level >= 3) document.getElementById('u1-mastery-badge').style.display = 'block';
        setTimeout(renderQuestions_1_2, 1500); 
        updateLocks_1_2();
    } else {
        fb.innerHTML = "<b style='color:red'>Try Again.</b>";
    }
}

// ===============================================
// === UNIT 1.3: REPRESENTING MOTION (Gold Standard v4.0) ===
// ===============================================

function setup_1_3() {
    canvas.width = 700; 
    canvas.height = 640; // Taller canvas to fit 3 graphs

    document.getElementById('sim-title').innerText = "1.3 Representing Motion";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Graph Trio</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Motion can be viewed through three lenses: <b>Position</b>, <b>Velocity</b>, and <b>Acceleration</b>.<br>
        <i><b>Mission:</b> Adjust the parameters to match the graph descriptions below.</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_1_3('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_1_3('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u1-3-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> GRAPH MASTER
            </div>
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold;">Initial Position (<i class="var">x<sub>0</sub></i>): <span id="v-x0">0.0</span> m</label>
            <input type="range" id="in-x0" class="phys-slider" min="-10" max="10" step="1" value="0" 
                oninput="updateState_1_3('x0', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold;">Initial Velocity (<i class="var">v<sub>0</sub></i>): <span id="v-v0">0.0</span> m/s</label>
            <input type="range" id="in-v0" class="phys-slider" min="-10" max="10" step="1" value="0" 
                oninput="updateState_1_3('v0', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #e67e22; padding-left: 10px; margin-top:10px;">
            <label style="color:#e67e22; font-weight:bold;">Acceleration (<i class="var">a</i>): <span id="v-a">0.0</span> m/s²</label>
            <input type="range" id="in-a" class="phys-slider" min="-5" max="5" step="0.5" value="0" 
                oninput="updateState_1_3('a', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_1_3()" id="btn-start">Run Graph</button>
            <button class="btn btn-red" onclick="reset_1_3()">Reset</button>
        </div>
        
        <div id="u1-3-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    // Snap Protection
    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_1_3();
}

function updateState_1_3(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'x0') document.getElementById('v-x0').innerText = state.x0.toFixed(1);
    if(key === 'v0') document.getElementById('v-v0').innerText = state.v0.toFixed(1);
    if(key === 'a') document.getElementById('v-a').innerText = state.a.toFixed(1);
    
    // Update cart position for preview
    state.x = state.x0;
    
    draw_1_3();
}

function setMode_1_3(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u1-3-questions');
    const badge = document.getElementById('u1-3-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_1_3();
    }
    updateLocks_1_3();
    
    // FIX: Force a redraw immediately so ticks/labels appear/disappear instantly
    draw_1_3();
}

function updateLocks_1_3() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function start_1_3() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.history = []; // Clear live history
        updateLocks_1_3();
        loop_1_3();
    }
}

function reset_1_3() {
    let savedLevel = loadProgress('1.3'); 

    state = {
        x0: parseFloat(document.getElementById('in-x0').value),
        v0: parseFloat(document.getElementById('in-v0').value),
        a: parseFloat(document.getElementById('in-a').value),
        
        x: 0, v: 0, t: 0,
        history: [],
        
        running: false,
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    state.x = state.x0; // Sync start pos
    
    if(state.level >= 3) document.getElementById('u1-3-badge').style.display = 'block';

    setMode_1_3(state.mode);
    draw_1_3();
}

function loop_1_3() {
    if(currentSim !== '1.3') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // Kinematics
        state.v = state.v0 + state.a * state.t;
        state.x = state.x0 + state.v0 * state.t + 0.5 * state.a * state.t * state.t;
        
        // Record History
        if(state.t * 60 % 2 < 1) { 
            state.history.push({t: state.t, x: state.x, v: state.v, a: state.a});
        }
        
        // --- SMART WALL DETECTION ---
        let hitWall = false;
        const limit = 20; // Track limits (+/- 20m)
        const vTol = 0.01; // Velocity tolerance for "stopped" check

        // Check Left Wall
        if (state.x <= -limit) {
            // It's a crash if:
            // 1. Moving Left (v < 0)
            // 2. Stopped (v~0) but Accelerating Left (a <= 0)
            if (state.v < -vTol || (Math.abs(state.v) < vTol && state.a <= 0)) {
                hitWall = true;
            }
        }
        
        // Check Right Wall
        if (state.x >= limit) {
            // It's a crash if:
            // 1. Moving Right (v > 0)
            // 2. Stopped (v~0) but Accelerating Right (a >= 0)
            if (state.v > vTol || (Math.abs(state.v) < vTol && state.a >= 0)) {
                hitWall = true;
            }
        }

        let timeUp = (state.t >= 10.0);

        if(timeUp || hitWall) {
            state.running = false;
            
            // Handle Wall Impact: Clamp position visual
            if(hitWall) {
                // Strictly clamp to +/- 20 for the final resting spot
                state.x = (state.x >= limit) ? limit : -limit;
            } else {
                state.t = 10.0;
            }
            
            // Record final "Stop" state (dropping graph lines to zero)
            state.history.push({t: state.t, x: state.x, v: 0, a: 0});
            
            if(state.mode === 'guided') checkLevel_1_3();
            updateLocks_1_3();
        }
    }

    draw_1_3();
    
    if(state.running) requestAnimationFrame(loop_1_3);
}

function draw_1_3() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 150px) ===
    let trackY = 100; 
    let trackH = 40;
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, trackY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, trackY, 700, trackH); 
    
    // Ticks & Label (Range -20 to 20)
    let pxPerM = 15; 
    let centerX = 350;
    
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    for(let i=-20; i<=20; i+=5) {
        let x = centerX + i*pxPerM;
        ctx.fillRect(x, trackY, 1, 10);
        ctx.fillText(i, x, trackY + 25);
    }

    // Cart
    let cartX = centerX + (state.x * pxPerM);
    // Limit visuals to screen bounds
    let visCartX = Math.max(25, Math.min(675, cartX));
    let cartY = trackY - 30;
    
    ctx.fillStyle = "#3498db"; 
    ctx.fillRect(visCartX - 25, cartY, 50, 30);
    ctx.strokeStyle = "#2980b9"; ctx.lineWidth=2; 
    ctx.strokeRect(visCartX - 25, cartY, 50, 30);
    
    // Wheels
    ctx.fillStyle = "#333";
    ctx.beginPath(); ctx.arc(visCartX - 15, cartY+30, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(visCartX + 15, cartY+30, 6, 0, Math.PI*2); ctx.fill();
    
    // Speed Lines
    if(Math.abs(state.v) > 0.5) {
        ctx.strokeStyle = "rgba(52, 152, 219, 0.5)"; ctx.lineWidth = 2;
        let dir = Math.sign(state.v);
        let tailX = visCartX - (dir * 30);
        ctx.beginPath(); ctx.moveTo(tailX, cartY+5); ctx.lineTo(tailX - (dir*15), cartY+5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tailX, cartY+15); ctx.lineTo(tailX - (dir*15), cartY+15); ctx.stroke();
    }


    // === ZONE 2: GRAPHS (Bottom 490px) ===
    
    // 1. POSITION GRAPH (y=180 to 320)
    // FIX: Exact range -20 to 20 to match track
    drawMiniGraph(180, 140, state.history, 'x', "#2980b9", "Position (m)", -20, 20);
    
    // 2. VELOCITY GRAPH (y=330 to 470)
    // Range: -20 to 20
    drawMiniGraph(330, 140, state.history, 'v', "#8e44ad", "Velocity (m/s)", -20, 20);
    
    // 3. ACCELERATION GRAPH (y=480 to 620)
    // Range: -6 to 6
    drawMiniGraph(480, 140, state.history, 'a', "#e67e22", "Accel (m/s²)", -6, 6);
}

// Helper to draw the stacked graphs
function drawMiniGraph(y, h, data, key, color, label, minVal, maxVal) {
    // Background
    ctx.fillStyle = "white"; ctx.fillRect(0, y, 700, h);
    ctx.strokeStyle = "#eee"; ctx.lineWidth=1;
    ctx.strokeRect(60, y, 600, h);
    
    let zeroY = y + h/2; 
    let pxPerVal = (h/2) / maxVal;
    
    // Zero Line (The Main Time Axis)
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1; // Solid dark line for zero
    ctx.beginPath(); ctx.moveTo(60, zeroY); ctx.lineTo(660, zeroY); ctx.stroke();
    
    // Vertical Axis Line
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(60, y+h); ctx.stroke(); 
    
    // Y-Axis Rotated Label
    ctx.save();
    ctx.translate(25, zeroY); 
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = "center"; ctx.font = "bold 12px sans-serif"; ctx.fillStyle = color;
    ctx.fillText(label, 0, 0);
    ctx.restore();
    
    // Y-Axis Scale Numbers
    ctx.fillStyle = "#555"; ctx.font = "10px sans-serif"; ctx.textAlign = "right"; ctx.textBaseline="middle";
    ctx.fillText(maxVal, 55, y + 10);
    ctx.fillText(minVal, 55, y + h - 10);
    // Note: We don't draw "0" on the y-axis here to avoid cluttering the time axis origin
    
    // --- TIME AXIS ---
    let tMax = 10;
    let width = 600;
    let panelX = 60;
    
    // 1. Draw Label "t (s)" aligned with the Zero Line
    ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#333"; 
    
    // Draw 't' in Serif Italic
    ctx.font = "italic bold 14px 'Times New Roman', serif";
    ctx.fillText("t", panelX + width + 8, zeroY); 
    
    // Draw '(s)' in Sans-Serif
    let tWidth = ctx.measureText("t").width;
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(" (s)", panelX + width + 8 + tWidth, zeroY); 

    // 2. Draw Ticks & Numbers (Conditional)
    let showTimeScale = (state.level >= 3 || state.mode === 'challenge');
    
    if(showTimeScale) {
        ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = "#555";
        ctx.font = "10px sans-serif"; 
        
        for(let t=0; t<=tMax; t+=1) {
            let tx = panelX + (t/tMax) * width;
            
            // Draw Tick Mark (Crossing the zero line slightly)
            ctx.beginPath(); ctx.moveTo(tx, zeroY - 3); ctx.lineTo(tx, zeroY + 3); ctx.stroke();
            
            // Draw Number (Just below the zero line)
            ctx.fillText(t, tx, zeroY + 6);
        }
    }

    // --- DRAW PREDICTION CURVE (Dashed) ---
    ctx.beginPath();
    ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
    
    let step = 0.2; 
    
    for(let t=0; t<=tMax; t+=step) {
        let val = 0;
        if(key === 'a') val = state.a;
        else if(key === 'v') val = state.v0 + state.a * t;
        else if(key === 'x') val = state.x0 + state.v0 * t + 0.5 * state.a * t * t;
        
        if(val > maxVal) val = maxVal;
        if(val < minVal) val = minVal;
        
        let plotX = 60 + (t / tMax) * width;
        let plotY = zeroY - (val * pxPerVal);
        
        if(t===0) ctx.moveTo(plotX, plotY);
        else ctx.lineTo(plotX, plotY);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // --- DRAW LIVE DATA (Solid) ---
    if(data.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            
            if(val > maxVal) val = maxVal;
            if(val < minVal) val = minVal;
            
            let plotX = 60 + (p.t / tMax) * width;
            let plotY = zeroY - (val * pxPerVal);
            
            if(i===0) ctx.moveTo(plotX, plotY);
            else ctx.lineTo(plotX, plotY);
        }
        ctx.stroke();
    }
}

function renderQuestions_1_3() {
    let div = document.getElementById('u1-3-questions');
    let btnStyle = "padding:5px 15px; background:#27ae60; color:white; border:none; border-radius:4px; cursor:pointer;";
    
    // Typography Helper
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Constant Velocity</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                Create a graph where <b>Position</b> increases linearly.<br>
                Conditions: Start at ${v('x<sub>0</sub>')} = -5.0 m. Move forward at constant speed.
            </p>
            <p>Target: ${v('x<sub>0</sub>')} = -5.0 m, ${v('a')} = 0.0 m/s², ${v('v<sub>0</sub>')} > 0.0 m/s.</p>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#e67e22;">Level 2: Speeding Up</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                Create a "smiley face" parabola on the <b>Position</b> graph.<br>
                Start at rest (${v('v<sub>0</sub>')} = 0 m/s). Accelerate forward.
            </p>
            <p>Target: ${v('v<sub>0</sub>')} = 0.0 m/s, ${v('a')} > 1.0 m/s².</p>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: The Slow Down</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                Start moving forward fast (${v('v<sub>0</sub>')} = 8.0 m/s).<br>
                Use acceleration to come to a stop exactly at ${v('t')} = 4.0 s.
            </p>
            <p>Hint: You need negative acceleration.</p>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; GRAPH MASTER &#9733;</h3>
            <p>You can read the matrix of motion graphs!</p>
        `;
    }
}

function checkLevel_1_3() {
    let correct = false;
    
    if(state.level === 0) {
        // Target: x0 = -5, a = 0, v0 > 0
        if(Math.abs(state.x0 - (-5)) < 0.1 && Math.abs(state.a) < 0.1 && state.v0 > 0.5) correct = true;
    }
    else if(state.level === 1) {
        // Target: v0 = 0, a > 1
        if(Math.abs(state.v0) < 0.1 && state.a > 1.0) correct = true;
    }
    else if(state.level === 2) {
        // Target: v0 = 8, Stop at t=4 -> v = 8 + a(4) = 0 -> a = -2
        if(Math.abs(state.v0 - 8) < 0.1 && Math.abs(state.a - (-2.0)) < 0.2) correct = true;
    }
    
    if(correct) {
        let div = document.getElementById('u1-3-questions');
        div.innerHTML += `<div style="margin-top:10px; font-weight:bold; color:green;">Correct! Unlocking next step...</div>`;
        
        state.level++;
        saveProgress('1.3', state.level);
        
        if(state.level >= 3) document.getElementById('u1-3-badge').style.display = 'block';
        
        setTimeout(() => {
            reset_1_3();
        }, 1500);
    }
}

// ===============================================
// === UNIT 1.4: REFERENCE FRAMES (Gold Standard v4.1) ===
// ===============================================

function setup_1_4() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "1.4 Reference Frames & Relative Motion";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Moving Walkway</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Velocity depends on your frame of reference.
        <br><b>Resultant Velocity</b> = Walkway Velocity + Passenger Velocity.
        <br><i><b>Mission:</b> Master relative motion to solve the travelator challenges!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_1_4('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_1_4('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u1-4-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> RELATIVITY MASTER
            </div>
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold;">Walkway Velocity (<i class="var">v<sub>WG</sub></i>): <span id="v-vw">0.0</span> m/s</label>
            <input type="range" id="in-vw" class="phys-slider" min="-5" max="5" step="0.5" value="0" 
                oninput="updateState_1_4('vw', this.value)">
            <div style="font-size:0.85em; color:#555; margin-top:2px;">(Velocity of Walkway relative to Ground)</div>
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold;">Passenger Velocity (<i class="var">v<sub>PW</sub></i>): <span id="v-vp">0.0</span> m/s</label>
            <input type="range" id="in-vp" class="phys-slider" min="-5" max="5" step="0.5" value="0" 
                oninput="updateState_1_4('vp', this.value)">
            <div style="font-size:0.85em; color:#555; margin-top:2px;">(Velocity of Passenger relative to Walkway)</div>
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_1_4()" id="btn-start">Start Walking</button>
            <button class="btn btn-red" onclick="reset_1_4()">Reset</button>
        </div>
        
        <div id="u1-4-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    // Snap Protection
    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_1_4();
}

function updateState_1_4(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'vw') document.getElementById('v-vw').innerText = state.vw.toFixed(1);
    if(key === 'vp') document.getElementById('v-vp').innerText = state.vp.toFixed(1);
    
    // Resultant Preview
    state.vResult = state.vw + state.vp;
    
    draw_1_4();
}

function setMode_1_4(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u1-4-questions');
    const badge = document.getElementById('u1-4-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_1_4();
    }
    updateLocks_1_4();
    draw_1_4(); // Initial Redraw for tick visibility
}

function updateLocks_1_4() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function start_1_4() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.history = []; 
        updateLocks_1_4();
        loop_1_4();
    }
}

function reset_1_4() {
    let savedLevel = loadProgress('1.4'); 

    state = {
        vw: parseFloat(document.getElementById('in-vw').value), // Walkway vs Ground
        vp: parseFloat(document.getElementById('in-vp').value), // Passenger vs Walkway
        
        xw: 0, // Position of Walkway Center (relative to Ground)
        xp_rel: 0, // Position of Passenger (relative to Walkway Center)
        xp_g: 0, // Position of Passenger (relative to Ground)
        
        t: 0,
        history: [],
        running: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Calculate Resultant
    state.vResult = state.vw + state.vp;

    if(state.level >= 3) document.getElementById('u1-4-badge').style.display = 'block';

    setMode_1_4(state.mode);
    draw_1_4();
}

function loop_1_4() {
    if(currentSim !== '1.4') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // --- KINEMATICS ---
        // 1. Update Walkway Position
        state.xw += state.vw * dt;
        
        // 2. Update Passenger Relative Position
        state.xp_rel += state.vp * dt;
        
        // 3. Calc Ground Position
        state.xp_g = state.xw + state.xp_rel;
        
        // Resultant Velocity (Live calculation)
        let vr = state.vw + state.vp;

        // Record History
        if(state.t * 60 % 2 < 1) { 
            state.history.push({
                t: state.t, 
                vw: state.vw, 
                vp: state.vp, 
                vr: vr
            });
        }
        
        // --- SMART LIMITS (v4.1) ---
        let stop = false;
        
        // Limit 1: Walkway hits end of Terminal (+/- 20m)
        if(state.xw <= -20 || state.xw >= 20) {
            // Stop if moving INTO the wall
            if((state.xw <= -20 && state.vw < 0) || (state.xw >= 20 && state.vw > 0)) {
                stop = true;
                state.xw = (state.xw >= 20) ? 20 : -20; // Clamp
            }
        }
        
        // Limit 2: Passenger hits end of Walkway (+/- 10m relative to walkway center)
        if(state.xp_rel <= -10 || state.xp_rel >= 10) {
            // Stop if moving OFF the walkway
            if((state.xp_rel <= -10 && state.vp < 0) || (state.xp_rel >= 10 && state.vp > 0)) {
                stop = true;
                state.xp_rel = (state.xp_rel >= 10) ? 10 : -10; // Clamp
            }
        }

        // Time Limit
        if(state.t >= 10.0) stop = true;

        if(stop) {
            state.running = false;
            state.t = 10.0;
            
            // Ghost State: Push Zeros to graph, but keep slider values
            state.history.push({t: state.t, vw: 0, vp: 0, vr: 0});
            
            if(state.mode === 'guided') checkLevel_1_4();
            updateLocks_1_4();
        }
    }

    draw_1_4();
    
    if(state.running) requestAnimationFrame(loop_1_4);
}

function draw_1_4() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 180px) ===
    let groundY = 120; 
    let pxPerM = 15; // 15px = 1m
    let centerX = 350;

    // 1. Draw Fixed Ground (Frame A)
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, groundY); 
    ctx.fillStyle = "#95a5a6"; ctx.fillRect(0, groundY, 700, 40); // Floor
    
    // Ground Ticks
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    for(let i=-20; i<=20; i+=5) {
        let x = centerX + i*pxPerM;
        ctx.fillRect(x, groundY, 1, 10);
        ctx.fillText(i, x, groundY + 25);
    }
    
    // 2. Draw Moving Walkway (Frame B)
    // Walkway is 20m long (+/- 10m)
    let wwW = 20 * pxPerM; 
    let wwH = 15;
    let wwX = centerX + (state.xw * pxPerM); 
    let wwY = groundY - wwH;
    
    // Draw Belt
    ctx.fillStyle = "#34495e"; ctx.fillRect(wwX - wwW/2, wwY, wwW, wwH);
    ctx.strokeStyle = "#2c3e50"; ctx.strokeRect(wwX - wwW/2, wwY, wwW, wwH);
    
    // Draw "Tread" pattern on belt to show motion
    ctx.fillStyle = "#5d6d7e";
    for(let i=-9; i<=9; i+=2) {
        let treadX = wwX + i*pxPerM;
        // Clip treads to walkway bounds
        if(treadX > wwX - wwW/2 + 2 && treadX < wwX + wwW/2 - 2) {
             ctx.fillRect(treadX, wwY+2, 2, wwH-4);
        }
    }

    // 3. Draw Passenger (Object C)
    let pX = wwX + (state.xp_rel * pxPerM); // Position relative to ground visually
    // Clamp visual to screen
    let visPX = Math.max(20, Math.min(680, pX));
    let pY = wwY - 30;
    
    // Stick Figure
    ctx.strokeStyle = "#e67e22"; ctx.lineWidth = 2; 
    ctx.beginPath();
    ctx.arc(visPX, pY, 6, 0, Math.PI*2); // Head
    ctx.moveTo(visPX, pY+6); ctx.lineTo(visPX, pY+20); // Body
    ctx.moveTo(visPX, pY+20); ctx.lineTo(visPX-5, pY+30); // Leg 1
    ctx.moveTo(visPX, pY+20); ctx.lineTo(visPX+5, pY+30); // Leg 2
    ctx.moveTo(visPX-5, pY+10); ctx.lineTo(visPX+5, pY+10); // Arms
    ctx.stroke();

    // 4. Vector Diagram (The "Math" Visual)
    // Show v_WG (Blue) + v_PW (Red) = v_PG (Purple)
    let vecY = pY - 25;
    let vScale = 8; 
    
    // Draw Resultant (Purple)
    if(Math.abs(state.vw + state.vp) > 0.1) {
        drawVector(visPX, vecY - 5, (state.vw+state.vp)*vScale, 0, "#8e44ad");
    }
    // Draw Components (Offset slightly)
    if(Math.abs(state.vw) > 0.1) {
        drawVector(visPX, vecY + 5, state.vw*vScale, 0, "#2980b9"); // Walkway (Blue)
    }
    if(Math.abs(state.vp) > 0.1) {
        drawVector(visPX, vecY + 12, state.vp*vScale, 0, "#c0392b"); // Passenger (Red)
    }


    // === ZONE 2: GRAPHS (Bottom 460px) ===
    let graphH = 120;
    
    // 1. WALKWAY VELOCITY (Blue)
    drawMiniGraph(180, graphH, state.history, 'vw', "#2980b9", "V (Walkway)", -5, 5);
    
    // 2. PASSENGER VELOCITY (Red)
    drawMiniGraph(310, graphH, state.history, 'vp', "#c0392b", "V (Relative)", -5, 5);
    
    // 3. RESULTANT VELOCITY (Purple)
    drawMiniGraph(440, graphH, state.history, 'vr', "#8e44ad", "V (Ground)", -10, 10);
}

function renderQuestions_1_4() {
    let div = document.getElementById('u1-4-questions');
    let btnStyle = "padding:5px 15px; background:#27ae60; color:white; border:none; border-radius:4px; cursor:pointer;";
    
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: The Late Passenger</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                You are late! You need a total ground speed of <b>8.0 m/s</b>.<br>
                The walkway moves at ${v('v<sub>WG</sub>')} = <b>3.0 m/s</b>.
            </p>
            <p>Set the walkway speed to 3.0. How fast must you walk (${v('v<sub>PW</sub>')})?</p>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Treadmill</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                Stay perfectly still relative to the <b>Ground</b> (${v('v<sub>PG</sub>')} = 0).<br>
                The walkway is moving backwards at ${v('v<sub>WG</sub>')} = <b>-4.0 m/s</b>.
            </p>
            <p>What is your required walking speed?</p>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Upstream</h4>
            <p style="margin-bottom:10px; line-height:1.6;">
                You are walking against the flow at ${v('v<sub>PW</sub>')} = <b>-2.0 m/s</b>.<br>
                But you are still moving forward relative to the ground at ${v('v<sub>PG</sub>')} = <b>3.0 m/s</b>.
            </p>
            <p>How fast is the walkway moving?</p>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; RELATIVITY MASTER &#9733;</h3>
            <p>You understand how velocities add in different reference frames!</p>
        `;
    }
}

function checkLevel_1_4() {
    let correct = false;
    
    if(state.level === 0) {
        // Target: Vg = 8, Vw = 3 -> Vp = 5
        if(Math.abs(state.vw - 3.0) < 0.1 && Math.abs(state.vp - 5.0) < 0.1) correct = true;
    }
    else if(state.level === 1) {
        // Target: Vg = 0, Vw = -4 -> Vp = 4
        if(Math.abs(state.vw - (-4.0)) < 0.1 && Math.abs(state.vp - 4.0) < 0.1) correct = true;
    }
    else if(state.level === 2) {
        // Target: Vp = -2, Vg = 3 -> Vw = 5
        if(Math.abs(state.vp - (-2.0)) < 0.1 && Math.abs(state.vw - 5.0) < 0.1) correct = true;
    }
    
    if(correct) {
        let div = document.getElementById('u1-4-questions');
        div.innerHTML += `<div style="margin-top:10px; font-weight:bold; color:green;">Correct! Unlocking next step...</div>`;
        
        state.level++;
        saveProgress('1.4', state.level);
        
        if(state.level >= 3) document.getElementById('u1-4-badge').style.display = 'block';
        
        setTimeout(() => {
            reset_1_4();
        }, 1500);
    }
}

// ===============================================
// === UNIT 1.5: VECTORS & 2D MOTION (Gold Standard v4.1) ===
// ===============================================

function setup_1_5() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "1.5 Vectors & Motion in 2D";
    
    // FIX: Updated description with units and g value
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Projectile Motion</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Horizontal motion is constant: <i class="var">a<sub>x</sub></i> = 0 m/s². 
        <br>Vertical motion is affected by gravity: <i class="var">a<sub>y</sub></i> = <i class="var">g</i> = -9.8 m/s².
        <br><i><b>Mission:</b> Adjust the cannon to hit the target. Watch how the vectors change!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_1_5('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_1_5('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u1-5-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> SNIPER
            </div>
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Launch Speed (<i class="var">v<sub>0</sub></i>):</span>
                <span><span id="v-spd">15.0</span> m/s</span>
            </label>
            <input type="range" id="in-spd" class="phys-slider" min="5" max="25" step="0.5" value="15.0" 
                oninput="updateState_1_5('v0', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Launch Angle (<i class="var">&theta;</i>):</span>
                <span><span id="v-ang">45</span>&deg;</span>
            </label>
            <input type="range" id="in-ang" class="phys-slider" min="0" max="90" step="1" value="45" 
                oninput="updateState_1_5('theta', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #2c3e50; padding-left: 10px; margin-top:10px;">
            <label style="color:#2c3e50; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Cliff Height (<i class="var">h</i>):</span>
                <span><span id="v-h">0.0</span> m</span>
            </label>
            <input type="range" id="in-h" class="phys-slider" min="0" max="20" step="1" value="0" 
                oninput="updateState_1_5('h', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="fire_1_5()" id="btn-fire">Fire Cannon</button>
            <button class="btn btn-red" onclick="reset_1_5()">Reset</button>
        </div>
        
        <div id="u1-5-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_1_5();
}

function updateState_1_5(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'v0') document.getElementById('v-spd').innerText = state.v0.toFixed(1);
    if(key === 'theta') document.getElementById('v-ang').innerText = state.theta.toFixed(0);
    if(key === 'h') document.getElementById('v-h').innerText = state.h.toFixed(1);
    
    // Update Vectors for preview
    let rad = state.theta * Math.PI / 180;
    state.vx = state.v0 * Math.cos(rad);
    state.vy = state.v0 * Math.sin(rad);
    state.y = state.h;
    state.x = 0;
    
    draw_1_5();
}

function setMode_1_5(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u1-5-questions');
    const badge = document.getElementById('u1-5-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        // Randomize target for fun in challenge mode
        state.targetX = 20 + Math.random()*60;
        state.targetY = Math.random()*15;
    } else {
        qDiv.style.display = 'block';
        renderQuestions_1_5();
    }
    updateLocks_1_5();
    draw_1_5();
}

function updateLocks_1_5() {
    let sliders = document.querySelectorAll('.phys-slider');
    let fireBtn = document.getElementById('btn-fire');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    fireBtn.disabled = lock;
    fireBtn.style.opacity = lock ? "0.5" : "1.0";
}

function fire_1_5() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.history = []; 
        updateLocks_1_5();
        loop_1_5();
    }
}

function reset_1_5() {
    let savedLevel = loadProgress('1.5'); 

    state = {
        v0: parseFloat(document.getElementById('in-spd').value),
        theta: parseFloat(document.getElementById('in-ang').value),
        h: parseFloat(document.getElementById('in-h').value),
        
        x: 0, y: 0, 
        vx: 0, vy: 0,
        t: 0,
        history: [],
        running: false,
        
        // Target Logic
        targetX: 40, 
        targetY: 0,
        targetHit: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Init values
    state.y = state.h;
    let rad = state.theta * Math.PI / 180;
    state.vx = state.v0 * Math.cos(rad);
    state.vy = state.v0 * Math.sin(rad);

    if(state.level >= 3) document.getElementById('u1-5-badge').style.display = 'block';

    setMode_1_5(state.mode); // Will handle question rendering
    draw_1_5();
}

function loop_1_5() {
    if(currentSim !== '1.5') return;

    if(state.running) {
        let dt = 0.03; // Slightly faster time step
        state.t += dt;
        
        // Physics (g = 9.8)
        // x is constant velocity
        state.x += state.vx * dt;
        
        // y is constant acceleration
        state.vy -= 9.8 * dt;
        state.y += state.vy * dt;
        
        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                x: state.x, 
                y: state.y,
                vx: state.vx,
                vy: state.vy
            });
        }
        
        // --- STOP CONDITIONS ---
        let stop = false;
        
        // 1. Hit Ground (y < 0)
        if(state.y <= 0) {
            stop = true;
            state.y = 0; // Clamp
        }
        
        // 2. Hit Wall (x > 80m visual limit)
        if(state.x >= 80) {
            stop = true;
            state.x = 80;
        }

        // 3. Check Target Hit
        // Simple AABB collision
        let hitDist = Math.sqrt(Math.pow(state.x - state.targetX, 2) + Math.pow(state.y - state.targetY, 2));
        if(hitDist < 3.0) { // 3m radius tolerance
            state.targetHit = true;
            stop = true;
        }

        if(stop) {
            state.running = false;
            
            // Ghost State: Zero out graph values for "stop", but keep sliders
            state.history.push({t: state.t, x: state.x, y: state.y, vx: 0, vy: 0});
            
            if(state.mode === 'guided' && state.targetHit) checkLevel_1_5();
            updateLocks_1_5();
        }
    }

    draw_1_5();
    
    if(state.running) requestAnimationFrame(loop_1_5);
}

function draw_1_5() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 220px) ===
    let groundY = 200; 
    let pxPerM = 7; // Scale: 7px = 1m (Scene is ~100m wide)
    
    // Sky
    ctx.fillStyle = "#eaf2f8"; ctx.fillRect(0,0,700, groundY);
    
    // Ground
    ctx.fillStyle = "#27ae60"; ctx.fillRect(0, groundY, 700, 40);
    
    // Gridlines (World)
    ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.lineWidth=1;
    for(let i=0; i<700; i+=10*pxPerM) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, groundY); ctx.stroke();
    }
    
    // Ticks on Ground
    ctx.fillStyle = "white"; ctx.font = "10px sans-serif"; ctx.textAlign="center";
    for(let i=0; i<=100; i+=10) {
        let tx = i*pxPerM;
        ctx.fillRect(tx, groundY, 1, 5);
        ctx.fillText(i, tx, groundY+15);
    }
    
    // Cannon Base (Cliff)
    let cliffH = state.h * pxPerM;
    let cannonX = 20;
    let cannonY = groundY - cliffH;
    
    if(state.h > 0) {
        ctx.fillStyle = "#95a5a6"; 
        ctx.fillRect(0, cannonY, 40, cliffH);
        ctx.strokeStyle = "#7f8c8d"; ctx.strokeRect(0, cannonY, 40, cliffH);
    }

    // Cannon Barrel (Rotates)
    ctx.save();
    ctx.translate(cannonX, cannonY - 5);
    ctx.rotate(-state.theta * Math.PI / 180);
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(0, -5, 30, 10); // Barrel
    ctx.restore();
    
    // Cannon Wheel
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(cannonX, cannonY-5, 8, 0, Math.PI*2); ctx.fill();

    // Target
    let tX = state.targetX * pxPerM;
    let tY = groundY - (state.targetY * pxPerM);
    
    // Target Graphic (Bullseye)
    ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(tX, tY, 15, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(tX, tY, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(tX, tY, 5, 0, Math.PI*2); ctx.fill();
    
    if(state.targetHit) {
        ctx.fillStyle = "green"; ctx.font = "bold 16px sans-serif"; ctx.textAlign="center";
        ctx.fillText("HIT!", tX, tY - 20);
    } else {
        ctx.fillStyle = "#333"; ctx.font = "10px sans-serif"; ctx.textAlign="center";
        ctx.fillText(`${state.targetX.toFixed(0)}m`, tX, tY + 25);
    }

    // Trajectory (History Dots)
    ctx.fillStyle = "#333";
    for(let i=0; i<state.history.length; i++) {
        let p = state.history[i];
        if(p.y < 0) continue;
        let px = p.x * pxPerM;
        let py = groundY - (p.y * pxPerM);
        ctx.fillRect(px, py, 2, 2);
    }

    // Projectile (Ball)
    let ballX = state.x * pxPerM;
    let ballY = groundY - (state.y * pxPerM);
    
    // Don't draw ball below ground
    if(state.y >= 0) {
        ctx.fillStyle = "#333";
        ctx.beginPath(); ctx.arc(ballX, ballY, 5, 0, Math.PI*2); ctx.fill();

        // Vectors on Ball
        let vScale = 2; // Pixel per m/s
        // Vx (Blue - Constant)
        if(Math.abs(state.vx) > 0.1) {
            drawVector(ballX, ballY, state.vx*vScale, 0, "#2980b9");
        }
        // Vy (Red - Changing)
        if(Math.abs(state.vy) > 0.1) {
            drawVector(ballX, ballY, 0, -state.vy*vScale, "#c0392b"); // Negative because canvas Y is down
        }
    }


    // === ZONE 2: SPLIT DASHBOARD (Bottom 400px) ===
    let panelY = 240;
    let panelH = 380;
    let halfW = 350;
    
    // Divider
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(halfW, panelY); ctx.lineTo(halfW, panelY+panelH); ctx.stroke();
    
    // --- LEFT: HORIZONTAL (Blue) ---
    // x vs t
    drawMiniGraph_1_5(0, panelY, 340, 180, state.history, 'x', "#2980b9", "Pos X (m)", 0, 100, false);
    // vx vs t
    drawMiniGraph_1_5(0, panelY+190, 340, 180, state.history, 'vx', "#2980b9", "Vel X (m/s)", 0, 30, false);
    
    // --- RIGHT: VERTICAL (Red) ---
    // y vs t
    drawMiniGraph_1_5(350, panelY, 340, 180, state.history, 'y', "#c0392b", "Pos Y (m)", 0, 50, false);
    // vy vs t (Has negative!)
    drawMiniGraph_1_5(350, panelY+190, 340, 180, state.history, 'vy', "#c0392b", "Vel Y (m/s)", -30, 30, true);
}

// Customized Graph Function for Split Panel
function drawMiniGraph_1_5(x, y, w, h, data, key, color, label, minVal, maxVal, isZeroCentered) {
    let pad = 40;
    let graphW = w - pad - 10;
    let graphH = h - pad;
    let startX = x + pad;
    let startY = y + 5;
    
    // Background
    ctx.fillStyle = "white"; ctx.fillRect(x, y, w, h);
    
    let zeroY = isZeroCentered ? (startY + graphH/2) : (startY + graphH);
    let pxPerVal = isZeroCentered ? (graphH/2)/maxVal : graphH/maxVal;
    
    // Zero Line
    ctx.strokeStyle = "#333"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(startX, zeroY); ctx.lineTo(startX+graphW, zeroY); ctx.stroke();
    
    // Vertical Axis
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(startX, startY+graphH); ctx.stroke();
    
    // Labels
    ctx.fillStyle = color; ctx.font = "bold 11px sans-serif";
    ctx.save();
    ctx.translate(startX - 25, startY + graphH/2);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign="center";
    ctx.fillText(label, 0, 0);
    ctx.restore();
    
    // Time Label (t)
    ctx.fillStyle = "#333"; ctx.font = "italic bold 12px 'Times New Roman', serif";
    ctx.textAlign = "left"; 
    ctx.fillText("t", startX + graphW + 5, zeroY + 4);
    
    // Data
    if(data.length > 0) {
        let tMax = 5.0; // Fixed 5s window for consistency
        
        // Draw Prediction (Dashed)
        // ... omitted for brevity in v1, focusing on live data quality ...
        
        // Draw Live
        ctx.beginPath();
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            
            // Clamp visual
            if(val > maxVal) val = maxVal;
            if(val < minVal) val = minVal;
            
            let px = startX + (p.t / tMax) * graphW;
            let py = zeroY - (val * pxPerVal);
            
            if(i===0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    
    // Ticks (Mastery Only)
    if(state.level >= 3 || state.mode === 'challenge') {
        ctx.fillStyle = "#777"; ctx.font = "9px sans-serif"; ctx.textAlign="right";
        ctx.fillText(maxVal, startX - 5, startY + 10);
        if(isZeroCentered) ctx.fillText(minVal, startX - 5, startY + graphH - 5);
        else ctx.fillText("0", startX - 5, startY + graphH - 5);
    }
}

function renderQuestions_1_5() {
    let div = document.getElementById('u1-5-questions');
    
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Max Range</h4>
            <p style="margin-bottom:10px;">The target is far away at <b>x = 23 m</b> on the ground (${v('h')} = 0 m).</p>
            <p style="margin-bottom:10px;">Set Speed to <b>15.0 m/s</b>. Find the angle ${v('&theta;')} that gives maximum range.</p>
        `;
        state.targetX = 22.9; state.targetY = 0;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 2: The Cliff</h4>
            <p style="margin-bottom:10px;">We are now on a cliff <b>${v('h')} = 10 m</b> high.</p>
            <p style="margin-bottom:10px;">The target is at <b>x = 30 m</b> on the ground.</p>
            <p>Launch horizontally (${v('&theta;')} = 0&deg;). What Speed ${v('v<sub>0</sub>')} is needed?</p>
        `;
        state.targetX = 30; state.targetY = 0;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 3: High Target</h4>
            <p style="margin-bottom:10px;">The target is floating in the air at <b>x = 20 m, y = 10 m</b>.</p>
            <p>Launch from the ground (${v('h')} = 0 m) with ${v('v<sub>0</sub>')} = <b>20.0 m/s</b>.</p>
            <p>Find the correct angle.</p>
        `;
        state.targetX = 20; state.targetY = 10;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; SNIPER ELITE &#9733;</h3>
            <p>You have mastered 2D Kinematics!</p>
        `;
    }
}

function checkLevel_1_5() {
    let correct = false;
    
    // We check purely based on "Did you hit the target?" which is set by state.targetHit
    if(state.targetHit) {
        // Specific constraints per level
        if(state.level === 0) {
            // Must be near 45 degrees
            if(Math.abs(state.theta - 45) < 5) correct = true;
        }
        else if(state.level === 1) {
            // Must be horizontal launch
            if(state.theta === 0 && Math.abs(state.h - 10) < 0.1) correct = true;
        }
        else if(state.level === 2) {
            // Must be ground launch
            if(state.h === 0) correct = true;
        }
    }
    
    if(correct) {
        let div = document.getElementById('u1-5-questions');
        div.innerHTML += `<div style="margin-top:10px; font-weight:bold; color:green;">Target Destroyed! Next Level...</div>`;
        
        state.level++;
        saveProgress('1.5', state.level);
        
        if(state.level >= 3) document.getElementById('u1-5-badge').style.display = 'block';
        
        setTimeout(() => {
            state.targetHit = false;
            reset_1_5();
        }, 1500);
    } else if (state.targetHit) {
        // Hit target but wrong parameters (e.g., used wrong angle in L1)
        let div = document.getElementById('u1-5-questions');
        div.innerHTML += `<div style="margin-top:10px; font-weight:bold; color:orange;">Hit! But check the constraints.</div>`;
    }
}

// ===============================================
// === UNIT 2.1: SYSTEMS & CENTER OF MASS (Gold Standard v4.3) ===
// ===============================================

function setup_2_1() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "2.1 Systems & Center of Mass";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The "Ghost" Particle</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        A System behaves as if all its mass were concentrated at the <b>Center of Mass (CM)</b>.
        <br><b>Internal Forces</b> (collisions) do not change the CM's velocity.
        <br><b>External Forces</b> (walls) do.</p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_1('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_1('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u2-1-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> SYSTEM ARCHITECT
            </div>
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass 1 (<i class="var">m<sub>1</sub></i>):</span>
                <span><span id="v-m1">1.0</span> kg</span>
            </label>
            <input type="range" id="in-m1" class="phys-slider" min="0.5" max="5.0" step="0.5" value="1.0" oninput="updateState_2_1('m1', this.value)">
            
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between; margin-top:5px;">
                <span>Velocity 1 (<i class="var">v<sub>1</sub></i>):</span>
                <span><span id="v-v1">0.0</span> m/s</span>
            </label>
            <input type="range" id="in-v1" class="phys-slider" min="-5.0" max="5.0" step="0.5" value="0.0" oninput="updateState_2_1('v1', this.value)">
            
             <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between; margin-top:5px;">
                <span>Position 1 (<i class="var">x<sub>1</sub></i>):</span>
                <span><span id="v-x1">-10</span> m</span>
            </label>
            <input type="range" id="in-x1" class="phys-slider" min="-20" max="20" step="1" value="-10" oninput="updateState_2_1('x1', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass 2 (<i class="var">m<sub>2</sub></i>):</span>
                <span><span id="v-m2">1.0</span> kg</span>
            </label>
            <input type="range" id="in-m2" class="phys-slider" min="0.5" max="5.0" step="0.5" value="1.0" oninput="updateState_2_1('m2', this.value)">
            
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between; margin-top:5px;">
                <span>Velocity 2 (<i class="var">v<sub>2</sub></i>):</span>
                <span><span id="v-v2">0.0</span> m/s</span>
            </label>
            <input type="range" id="in-v2" class="phys-slider" min="-5.0" max="5.0" step="0.5" value="0.0" oninput="updateState_2_1('v2', this.value)">

             <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between; margin-top:5px;">
                <span>Position 2 (<i class="var">x<sub>2</sub></i>):</span>
                <span><span id="v-x2">10</span> m</span>
            </label>
            <input type="range" id="in-x2" class="phys-slider" min="-20" max="20" step="1" value="10" oninput="updateState_2_1('x2', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_2_1()" id="btn-start">Run System</button>
            <button class="btn btn-red" onclick="reset_2_1()">Reset</button>
        </div>
        
        <div id="u2-1-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_2_1();
}

function updateState_2_1(key, val) {
    if(state.running) return;
    state[key] = parseFloat(val);
    
    // Update Display
    if(key === 'm1') document.getElementById('v-m1').innerText = state.m1.toFixed(1);
    if(key === 'v1') document.getElementById('v-v1').innerText = state.v1.toFixed(1);
    if(key === 'x1') document.getElementById('v-x1').innerText = state.x1.toFixed(0);
    
    if(key === 'm2') document.getElementById('v-m2').innerText = state.m2.toFixed(1);
    if(key === 'v2') document.getElementById('v-v2').innerText = state.v2.toFixed(1);
    if(key === 'x2') document.getElementById('v-x2').innerText = state.x2.toFixed(0);
    
    // Calc CM Preview
    state.xCom = (state.m1*state.x1 + state.m2*state.x2)/(state.m1+state.m2);
    
    draw_2_1();
}

function setMode_2_1(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u2-1-questions');
    const badge = document.getElementById('u2-1-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_1();
    }
    updateLocks_2_1();
    draw_2_1();
}

function updateLocks_2_1() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function start_2_1() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.history = []; 
        updateLocks_2_1();
        loop_2_1();
    }
}

function reset_2_1() {
    let savedLevel = loadProgress('2.1'); 

    state = {
        m1: parseFloat(document.getElementById('in-m1').value),
        v1: parseFloat(document.getElementById('in-v1').value),
        x1: parseFloat(document.getElementById('in-x1').value),
        
        m2: parseFloat(document.getElementById('in-m2').value),
        v2: parseFloat(document.getElementById('in-v2').value),
        x2: parseFloat(document.getElementById('in-x2').value),
        
        t: 0,
        history: [],
        running: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    state.xCom = (state.m1*state.x1 + state.m2*state.x2)/(state.m1+state.m2);

    if(state.level >= 3) document.getElementById('u2-1-badge').style.display = 'block';

    setMode_2_1(state.mode);
    draw_2_1();
}

function loop_2_1() {
    if(currentSim !== '2.1') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // --- PHYSICS ENGINE (1D Collision) ---
        // 1. Move
        state.x1 += state.v1 * dt;
        state.x2 += state.v2 * dt;
        
        // 2. Calc CM
        state.xCom = (state.m1*state.x1 + state.m2*state.x2)/(state.m1+state.m2);
        let vCom = (state.m1*state.v1 + state.m2*state.v2)/(state.m1+state.m2);
        
        // 3. Collision Logic (Elastic)
        let dist = state.x2 - state.x1;
        let radius = 2.0; 
        
        if(Math.abs(dist) < radius) {
            let u1 = state.v1;
            let u2 = state.v2;
            let m1 = state.m1;
            let m2 = state.m2;
            
            if((state.x1 < state.x2 && u1 > u2) || (state.x1 > state.x2 && u1 < u2)) {
                state.v1 = ((m1 - m2)*u1 + 2*m2*u2) / (m1 + m2);
                state.v2 = ((m2 - m1)*u2 + 2*m1*u1) / (m1 + m2);
            }
        }
        
        // 4. Wall Collisions
        if(state.x1 <= -20 && state.v1 < 0) state.v1 *= -1;
        if(state.x1 >= 20 && state.v1 > 0) state.v1 *= -1;
        if(state.x2 <= -20 && state.v2 < 0) state.v2 *= -1;
        if(state.x2 >= 20 && state.v2 > 0) state.v2 *= -1;

        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, x1: state.x1, x2: state.x2, xCom: state.xCom,
                v1: state.v1, v2: state.v2, vCom: vCom
            });
        }

        // --- LEVEL 1 SHORTCUT ---
        // If we are in Level 0 (Static Balance) and correct, stop early.
        if (state.mode === 'guided' && state.level === 0 && state.t > 0.8) {
             if (Math.abs(state.xCom) < 0.2 && state.m1===3.0 && state.m2===1.5) {
                 state.running = false;
                 checkLevel_2_1();
                 updateLocks_2_1();
                 draw_2_1();
                 return;
             }
        }

        // Time Limit
        if(state.t >= 10.0) {
            state.running = false;
            state.history.push({t: state.t, x1: state.x1, x2: state.x2, xCom: state.xCom, v1: 0, v2: 0, vCom: 0});
            if(state.mode === 'guided') checkLevel_2_1();
            updateLocks_2_1();
        }
    }

    draw_2_1();
    if(state.running) requestAnimationFrame(loop_2_1);
}

function draw_2_1() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 150px) ===
    let trackY = 100; 
    let pxPerM = 15; // 15px = 1m
    let centerX = 350;

    // Track
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, trackY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, trackY, 700, 40);
    
    // Ticks
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    for(let i=-20; i<=20; i+=5) {
        let x = centerX + i*pxPerM;
        ctx.fillRect(x, trackY, 1, 10);
        ctx.fillText(i, x, trackY + 25);
    }
    
    // Helper to draw cart
    const drawCart = (x, color, label) => {
        let cx = centerX + x*pxPerM;
        cx = Math.max(20, Math.min(680, cx)); // Clamp visual
        let cy = trackY - 30;
        
        ctx.fillStyle = color; 
        ctx.fillRect(cx - 15, cy, 30, 30);
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth=2;
        ctx.strokeRect(cx - 15, cy, 30, 30);
        
        ctx.fillStyle = "white"; ctx.font = "bold 12px sans-serif"; ctx.textAlign="center";
        ctx.fillText(label, cx, cy + 20);
        
        // Wheels
        ctx.fillStyle = "#333";
        ctx.beginPath(); ctx.arc(cx - 10, cy+30, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 10, cy+30, 5, 0, Math.PI*2); ctx.fill();
        
        return cx;
    };
    
    // Draw Carts
    drawCart(state.x1, "#2980b9", "1"); // Blue
    drawCart(state.x2, "#c0392b", "2"); // Red
    
    // Draw CM (The Ghost Particle)
    let comX = centerX + state.xCom*pxPerM;
    let comY = trackY - 45;
    
    // Diamond Shape
    ctx.fillStyle = "#8e44ad"; 
    ctx.beginPath();
    ctx.moveTo(comX, comY);
    ctx.lineTo(comX + 6, comY + 6);
    ctx.lineTo(comX, comY + 12);
    ctx.lineTo(comX - 6, comY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "white"; ctx.font = "bold 10px sans-serif";
    ctx.fillText("CM", comX, comY - 5);


    // === ZONE 2: GRAPHS (Bottom 460px) ===
    let panelY = 180;
    let panelH = 440;
    let halfW = 350;
    
    // Divider
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(halfW, panelY); ctx.lineTo(halfW, panelY+panelH); ctx.stroke();
    
    // --- LEFT: POSITION ---
    // x vs t
    drawMiniGraph_2_1(0, panelY, 340, 200, state.history, 'x', [-25, 25], "Position (m)");
    
    // --- RIGHT: VELOCITY ---
    // v vs t
    drawMiniGraph_2_1(350, panelY, 340, 200, state.history, 'v', [-10, 10], "Velocity (m/s)");
}

// Customized Graph for Multi-Line
function drawMiniGraph_2_1(x, y, w, h, data, type, range, label) {
    let pad = 40;
    let graphW = w - pad - 10;
    let graphH = h - pad;
    let startX = x + pad;
    let startY = y + 10;
    
    // Background
    ctx.fillStyle = "white"; ctx.fillRect(x, y, w, h);
    
    let minVal = range[0];
    let maxVal = range[1];
    let zeroY = startY + graphH/2;
    let pxPerVal = (graphH/2) / maxVal;
    
    // Zero Line (Zero-Line Axis Rule)
    ctx.strokeStyle = "#333"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(startX, zeroY); ctx.lineTo(startX+graphW, zeroY); ctx.stroke();
    
    // Vertical Axis
    ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(startX, startY+graphH); ctx.stroke();
    
    // Y Label
    ctx.save();
    ctx.translate(startX - 25, startY + graphH/2);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign="center"; ctx.fillStyle = "#333"; ctx.font = "bold 11px sans-serif";
    ctx.fillText(label, 0, 0);
    ctx.restore();
    
    // T Label (On Zero Line)
    ctx.textAlign="left"; ctx.fillStyle = "#333"; 
    ctx.font = "italic bold 12px 'Times New Roman', serif";
    ctx.fillText("t", startX + graphW + 5, zeroY + 4);
    
    // Helper to plot line
    const plotLine = (key, color, width) => {
        if(data.length === 0) return;
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width;
        let tMax = 10;
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            if(val > maxVal) val = maxVal;
            if(val < minVal) val = minVal;
            
            let px = startX + (p.t / tMax) * graphW;
            let py = zeroY - (val * pxPerVal);
            if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    };
    
    if(type === 'x') {
        plotLine('x1', "#2980b9", 1); // Blue Thin
        plotLine('x2', "#c0392b", 1); // Red Thin
        plotLine('xCom', "#8e44ad", 3); // Purple Thick
    } else {
        plotLine('v1', "#2980b9", 1);
        plotLine('v2', "#c0392b", 1);
        plotLine('vCom', "#8e44ad", 3);
    }
    
    // Ticks (Mastery Only)
    if(state.level >= 3 || state.mode === 'challenge') {
        ctx.fillStyle = "#777"; ctx.font = "9px sans-serif"; ctx.textAlign="right";
        ctx.fillText(maxVal, startX - 5, startY + 10);
        ctx.fillText(minVal, startX - 5, startY + graphH - 5);
        
        // Time Ticks
        ctx.textAlign="center";
        for(let t=0; t<=10; t+=2) {
             let tx = startX + (t/10)*graphW;
             ctx.fillRect(tx, zeroY-2, 1, 4);
             ctx.fillText(t, tx, zeroY + 12);
        }
    }
}

function renderQuestions_2_1() {
    let div = document.getElementById('u2-1-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 1: The Seesaw</h4>
            <p>Balance the system! The Center of Mass (${v('x_{cm}')}) must be at <b>0 m</b>.</p>
            <p>Set ${v('m<sub>1</sub>')} = <b>3.0 kg</b> at ${v('x<sub>1</sub>')} = <b>-5 m</b>.</p>
            <p>Set ${v('m<sub>2</sub>')} = <b>1.5 kg</b>. Where must you place ${v('x<sub>2</sub>')}?</p>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 2: Dynamic System</h4>
            <p>The CM moves at constant velocity if no external forces act.</p>
            <p>Set ${v('m<sub>1</sub>')} = ${v('m<sub>2</sub>')} = <b>1.0 kg</b>.</p>
            <p>Set ${v('v<sub>1</sub>')} = <b>4.0 m/s</b> and ${v('v<sub>2</sub>')} = <b>-2.0 m/s</b>.</p>
            <p>Run the sim. What is the velocity of the Center of Mass?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2-1" placeholder="v_cm" 
                       style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_1()"> 
                <button onclick="checkAnswer_2_1()" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: The Collision</h4>
            <p>Create a collision where the Center of Mass stays <b>stationary</b> (${v('v_{cm}')} = 0).</p>
            <p>Set ${v('m<sub>1</sub>')} = <b>2.0 kg</b> and ${v('v<sub>1</sub>')} = <b>3.0 m/s</b>.</p>
            <p>Set ${v('m<sub>2</sub>')} = <b>1.0 kg</b>. What must ${v('v<sub>2</sub>')} be?</p>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; SYSTEM ARCHITECT &#9733;</h3>
            <p>You understand that internal forces (collisions) cannot move the Center of Mass!</p>
        `;
    }
}

function checkAnswer_2_1() {
    // For Level 2 (Manual Input)
    if(state.level === 1) {
        let val = parseFloat(document.getElementById('ans-2-1').value);
        const v = (text) => `<i class="var">${text}</i>`;

        // (4 + (-2)) / 2 = 1.0
        if(Math.abs(val - 1.0) < 0.1) {
             let fb = document.getElementById('fb-2-1');
             fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
             setTimeout(() => {
                state.level++;
                saveProgress('2.1', state.level);
                renderQuestions_2_1(); // Refresh UI
             }, 1500);
        } else {
             // FIX: Styled Incorrect message with subscripts
             document.getElementById('fb-2-1').innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Recall: ${v('v_{cm}')} = ${v('P_{sys}')} / ${v('M_{tot}')}</span>`;
        }
    }
}

function checkLevel_2_1() {
    let correct = false;
    
    // Auto-check for L1 and L3 (Slider based)
    if(state.level === 0) {
        // Target: x_com = 0. 
        if(Math.abs(state.xCom) < 0.2 && state.m1===3.0 && state.m2===1.5) correct = true;
    }
    else if(state.level === 2) {
        // Target: v_com = 0.
        let pSys = state.m1*state.v1 + state.m2*state.v2;
        if(Math.abs(pSys) < 0.1 && Math.abs(state.v1) > 0.5) correct = true;
    }
    
    if(correct) {
        let div = document.getElementById('u2-1-questions');
        // Clear previous feedback to ensure the new one "pops"
        let existing = div.querySelector('.success-msg');
        if(!existing) {
            div.innerHTML += `<div class="success-msg" style="margin-top:10px; font-weight:bold; color:green;">Correct! Unlocking next step...</div>`;
            
            state.level++;
            saveProgress('2.1', state.level);
            
            if(state.level >= 3) document.getElementById('u2-1-badge').style.display = 'block';
            
            setTimeout(() => {
                reset_2_1();
            }, 1500);
        }
    }
}

// ===============================================
// === UNIT 2.2: FORCES & FREE-BODY DIAGRAMS (Gold Standard v4.5) ===
// ===============================================

function setup_2_2() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "2.2 Forces & Free-Body Diagrams";
    
    // FIX: Use HTML subscripts in description
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Newton's Second Law</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Forces cause acceleration. <i class="var">F<sub>net</sub></i> = <i class="var">ma</i>.
        <br><b>Free-Body Diagrams (FBD)</b> show all forces acting on a single object.
        <br>Balance the forces to stay at rest, or unbalance them to accelerate.</p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_2('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_2('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u2-2-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> FORCE MASTER
            </div>
        </div>

        <div id="calc-2-2" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
            </div>

        <div class="control-group" style="border-left: 4px solid #2c3e50; padding-left: 10px;">
            <label style="color:#2c3e50; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">10.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="5" max="50" step="1" value="10" 
                oninput="updateState_2_2('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px; margin-top:10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Applied Force (<i class="var">F<sub>app</sub></i>):</span>
                <span><span id="v-fa">0.0</span> N</span>
            </label>
            <input type="range" id="in-fa" class="phys-slider" min="-100" max="100" step="5" value="0" 
                oninput="updateState_2_2('fa', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Friction Coeff (<i class="var">&mu;</i>):</span>
                <span><span id="v-mu">0.0</span></span>
            </label>
            <input type="range" id="in-mu" class="phys-slider" min="0" max="0.8" step="0.1" value="0.0" 
                oninput="updateState_2_2('mu', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_2_2()" id="btn-start">Apply Forces</button>
            <button class="btn btn-red" onclick="reset_2_2()">Reset</button>
        </div>
        
        <div id="u2-2-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    // Snap Protection
    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_2_2();
}

function updateState_2_2(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    if(key === 'fa') document.getElementById('v-fa').innerText = state.fa.toFixed(1);
    if(key === 'mu') document.getElementById('v-mu').innerText = state.mu.toFixed(1);
    
    // Preview Forces
    calcForces_2_2();
    draw_2_2();
    updateCalcDisplay_2_2();
}

function setMode_2_2(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u2-2-questions');
    const badge = document.getElementById('u2-2-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_2();
    }
    updateLocks_2_2();
    draw_2_2();
    updateCalcDisplay_2_2();
}

function updateLocks_2_2() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcForces_2_2() {
    // 1. Gravity & Normal
    state.fg = state.m * 9.8; 
    state.fn = state.fg; // Flat surface
    
    // 2. Friction
    let fMax = state.mu * state.fn;
    
    // Determine Direction of Friction
    if(Math.abs(state.v) > 0.01) {
        // Kinetic: Opposite to velocity
        state.ff = -1 * Math.sign(state.v) * fMax;
    } else {
        // Static: Opposite to Applied Force, up to Max
        if(Math.abs(state.fa) <= fMax) {
            state.ff = -1 * state.fa; // Cancel out
        } else {
            state.ff = -1 * Math.sign(state.fa) * fMax; // Break away
        }
    }
    
    // 3. Net Force
    state.fnet = state.fa + state.ff;
    state.a = state.fnet / state.m;
}

function updateCalcDisplay_2_2() {
    let box = document.getElementById('calc-2-2');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    // Formatting helper - Added 'N' units
    let fNetHtml = `${state.fnet.toFixed(1)} N`;
    let faHtml = `<span style="color:#2980b9; font-weight:bold;">${state.fa.toFixed(1)} N</span>`;
    let ffHtml = `<span style="color:#c0392b; font-weight:bold;">${state.ff.toFixed(1)} N</span>`;
    
    // REVISED LAYOUT: Symbolic on top line, Numerical substitution on bottom line
    box.innerHTML = `
        <div style="margin-bottom:15px;">
            <div style="margin-bottom:4px; color:#555;">
                ${v('F<sub>net</sub>')} = ${v('F<sub>app</sub>')} + ${v('F<sub>f</sub>')} &nbsp;&rightarrow;
            </div>
            <div style="font-size:1.1em;">
                <b>${fNetHtml}</b> = ${faHtml} + (${ffHtml})
            </div>
        </div>
        <div>
            <div style="margin-bottom:4px; color:#555;">
                ${v('a')} = ${v('F<sub>net</sub>')} / ${v('m')} &nbsp;&rightarrow;
            </div>
            <div style="font-size:1.1em;">
                <b>${state.a.toFixed(2)}</b> m/s² = ${state.fnet.toFixed(1)} N / ${state.m.toFixed(1)} kg
            </div>
        </div>
    `;
}

function start_2_2() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.history = []; 
        updateLocks_2_2();
        loop_2_2();
    }
}

function reset_2_2() {
    let savedLevel = loadProgress('2.2'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        fa: parseFloat(document.getElementById('in-fa').value),
        mu: parseFloat(document.getElementById('in-mu').value),
        
        x: 0, 
        v: 0, 
        a: 0,
        
        fg: 0, fn: 0, ff: 0, fnet: 0,
        
        t: 0,
        history: [],
        running: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    calcForces_2_2();
    if(state.level >= 3) document.getElementById('u2-2-badge').style.display = 'block';

    setMode_2_2(state.mode);
    draw_2_2();
    updateCalcDisplay_2_2();
}

function loop_2_2() {
    if(currentSim !== '2.2') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // Physics Loop
        calcForces_2_2(); // Recalc friction based on current v
        
        state.v += state.a * dt;
        state.x += state.v * dt;
        
        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                a: state.a,
                v: state.v,
                fnet: state.fnet
            });
        }
        
        // Stop Condition (Time or Wall)
        let stop = false;
        if(state.x <= -20 || state.x >= 20) {
            stop = true;
            state.x = (state.x > 0) ? 20 : -20;
        }
        if(state.t >= 10.0) stop = true;

        if(stop) {
            state.running = false;
            state.v = 0; state.a = 0; state.fnet = 0; // Force stop visuals
            
            // Ghost State
            state.history.push({t: state.t, a: 0, v: 0, fnet: 0});
            
            if(state.mode === 'guided') checkLevel_2_2();
            updateLocks_2_2();
        }
    }

    updateCalcDisplay_2_2();
    draw_2_2();
    
    if(state.running) requestAnimationFrame(loop_2_2);
}

function draw_2_2() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 200px) ===
    let floorY = 160; 
    let pxPerM = 15; 
    let centerX = 350;

    // Floor
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, floorY); 
    ctx.fillStyle = "#7f8c8d"; ctx.fillRect(0, floorY, 700, 40);
    
    // Ticks
    ctx.fillStyle = "#bdc3c7"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    for(let i=-20; i<=20; i+=5) {
        let x = centerX + i*pxPerM;
        ctx.fillRect(x, floorY, 1, 10);
        ctx.fillText(i, x, floorY + 25);
    }
    
    // Crate
    let boxW = 50; 
    let boxH = 50;
    let boxX = centerX + (state.x * pxPerM);
    // Clamp visual
    boxX = Math.max(boxW/2 + 5, Math.min(700 - boxW/2 - 5, boxX));
    let boxY = floorY - boxH;
    
    ctx.fillStyle = "#e67e22"; ctx.fillRect(boxX - boxW/2, boxY, boxW, boxH);
    ctx.strokeStyle = "#d35400"; ctx.lineWidth=2; ctx.strokeRect(boxX - boxW/2, boxY, boxW, boxH);
    
    // Mass Label
    ctx.fillStyle = "white"; ctx.font = "bold 12px sans-serif";
    ctx.fillText(`${state.m}kg`, boxX, boxY + boxH/2 + 4);
    
    // Draw Applied Force on the box to show "pushing"
    // Use smaller scale for world vector (0.2)
    if(Math.abs(state.fa) > 1) {
        drawVector_2_2(boxX, boxY + boxH/2, state.fa * 0.2, 0, "#2980b9", "");
    }


    // === ZONE 2: SPLIT DASHBOARD (Bottom 400px) ===
    let panelY = 220;
    let panelH = 400;
    let midX = 350;
    
    // Divider
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(midX, panelY); ctx.lineTo(midX, panelY+panelH); ctx.stroke();
    
    // --- LEFT: FREE BODY DIAGRAM ---
    let fbdCX = 175; 
    let fbdCY = panelY + 180;
    
    ctx.fillStyle = "#333"; ctx.font = "bold 14px sans-serif"; ctx.textAlign="center";
    ctx.fillText("Free-Body Diagram", fbdCX, panelY + 30);
    
    // The "Dot"
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(fbdCX, fbdCY, 5, 0, Math.PI*2); ctx.fill();
    
    // Scale for vectors (pixels per Newton)
    // FIX: Reduced scale to 0.15 to prevent overlap/large vectors
    let vScale = 0.15;
    
    // F_g (Down) - Use "F_g" style for subscript parsing
    drawVector_2_2(fbdCX, fbdCY, 0, -state.fg * vScale, "#7f8c8d", "F_g");
    // F_N (Up)
    drawVector_2_2(fbdCX, fbdCY, 0, state.fn * vScale, "#7f8c8d", "F_N");
    // F_app (Horizontal)
    if(Math.abs(state.fa) > 0.1) drawVector_2_2(fbdCX, fbdCY, state.fa * vScale, 0, "#2980b9", "F_app");
    // F_f (Horizontal)
    if(Math.abs(state.ff) > 0.1) drawVector_2_2(fbdCX, fbdCY, state.ff * vScale, 0, "#c0392b", "F_f");
    
    
    // --- RIGHT: ACCELERATION GRAPH ---
    let graphX = 370;
    let gY = panelY + 70;
    let gH = 200;
    let gW = 280;
    
    drawMiniGraph_2_2(graphX, gY, gW, gH, state.history, 'a', [-10, 10], "Accel (m/s²)");
}

// FIX: Custom Draw Vector that parses Subscripts (e.g. "F_g")
function drawVector_2_2(x, y, vx, vy, color, label) {
    // Flip Y because canvas Y is down
    let endX = x + vx;
    let endY = y - vy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    // Arrowhead
    let angle = Math.atan2(-vy, vx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    // Label with Subscript Parsing
    if(label) {
        ctx.fillStyle = color;
        // Split by underscore
        let parts = label.split('_');
        let main = parts[0];
        let sub = parts[1] || "";

        // Positioning logic
        let lblX = endX + (vx>0 ? 10 : -25);
        let lblY = endY + (vy>0 ? -5 : 20);
        
        // Draw Main
        ctx.font = "italic bold 14px 'Times New Roman', serif";
        ctx.fillText(main, lblX, lblY);
        
        // Draw Subscript
        if(sub) {
            let mainWidth = ctx.measureText(main).width;
            ctx.font = "italic bold 10px 'Times New Roman', serif";
            ctx.fillText(sub, lblX + mainWidth + 1, lblY + 4);
        }
    }
}

function drawMiniGraph_2_2(x, y, w, h, data, key, range, label) {
    ctx.fillStyle = "white"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#333"; ctx.strokeRect(x,y,w,h);
    
    let midY = y + h/2;
    let pxPerVal = (h/2) / range[1];
    
    // Zero Line
    ctx.strokeStyle = "#ccc"; ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(x+w, midY); ctx.stroke();
    
    // Axis Label
    ctx.fillStyle = "#333"; ctx.textAlign = "right"; ctx.font = "10px sans-serif";
    ctx.fillText(label, x+w-5, y+15);
    
    if(data.length > 0) {
        ctx.beginPath(); ctx.strokeStyle = "#e67e22"; ctx.lineWidth = 2;
        let tMax = 10;
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            if(val > range[1]) val = range[1];
            if(val < range[0]) val = range[0];
            
            let px = x + (p.t / tMax) * w;
            let py = midY - (val * pxPerVal);
            if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}

function renderQuestions_2_2() {
    let div = document.getElementById('u2-2-questions');
    // Helper wraps text in <i class="var">
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Tug of War</h4>
            <p>The box is stuck in mud (${v('&mu;')} = 0.5). Mass = <b>10 kg</b>.</p>
            <p>Apply enough force to <b>just break static friction</b> and start moving.</p>
            <p>Hint: ${v('F<sub>app</sub>')} must exceed ${v('F<sub>f,max</sub>')}.</p>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: Precision Push</h4>
            <p>Set ${v('m')} = <b>20 kg</b> and ${v('&mu;')} = <b>0.0</b> (No friction).</p>
            <p>You need an acceleration of exactly <b>2.5 m/s²</b>.</p>
            <p>Calculate the required ${v('F<sub>app</sub>')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2-2" placeholder="F_app" 
                       style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_2()"> 
                <button onclick="checkAnswer_2_2()" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2-2"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#e67e22;">Level 3: Friction Master</h4>
            <p>Set ${v('m')} = <b>10 kg</b> and ${v('&mu;')} = <b>0.3</b>.</p>
            <p>If you push with ${v('F<sub>app</sub>')} = <b>50 N</b>, what will the acceleration be?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2-2b" placeholder="a" 
                       style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_2()"> 
                <button onclick="checkAnswer_2_2()" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2-2b"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; FORCE MASTER &#9733;</h3>
            <p>May the Force (Net) be with you!</p>
        `;
    }
}

function checkAnswer_2_2() {
    const v = (text) => `<i class="var">${text}</i>`;
    
    // Level 2 Check
    if(state.level === 1) {
        let val = parseFloat(document.getElementById('ans-2-2').value);
        // F = ma => F = 20 * 2.5 = 50 N
        let fb = document.getElementById('fb-2-2');
        if(Math.abs(val - 50.0) < 1.0) {
             fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
             setTimeout(() => {
                state.level++;
                saveProgress('2.2', state.level);
                renderQuestions_2_2(); 
             }, 1500);
        } else {
             // FIX: Use HTML formatting in error message
             fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Use ${v('F')} = ${v('ma')}</span>`;
        }
    }
    
    // Level 3 Check
    if(state.level === 2) {
        let val = parseFloat(document.getElementById('ans-2-2b').value);
        // F_f = 0.3 * (10*9.8) = 29.4 N
        // F_net = 50 - 29.4 = 20.6 N
        // a = 20.6 / 10 = 2.06
        let fb = document.getElementById('fb-2-2b');
        if(Math.abs(val - 2.06) < 0.2) {
             fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
             setTimeout(() => {
                state.level++;
                saveProgress('2.2', state.level);
                document.getElementById('u2-2-badge').style.display = 'block';
                renderQuestions_2_2(); 
             }, 1500);
        } else {
             fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Remember: ${v('F<sub>net</sub>')} = ${v('F<sub>app</sub>')} - ${v('F<sub>f</sub>')}</span>`;
        }
    }
}

function checkLevel_2_2() {
    // Level 1 Check (Slider based)
    if(state.level === 0) {
        // m=10, mu=0.5. Fn = 98. Ff_max = 49.
        // Need F_app > 49.
        if(Math.abs(state.v) > 0.1 && state.m === 10 && state.mu === 0.5) {
             let div = document.getElementById('u2-2-questions');
             div.innerHTML += `<div style="margin-top:10px; font-weight:bold; color:green;">Correct! Unlocking next step...</div>`;
             
             state.level++;
             saveProgress('2.2', state.level);
             setTimeout(() => {
                 renderQuestions_2_2();
             }, 1500);
        }
    }
}

// ===============================================
// === UNIT 2.3: NEWTON'S THIRD LAW (Gold Standard v4.6) ===
// ===============================================

function setup_2_3() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "2.3 Newton's Third Law";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Action & Reaction</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        For every action force, there is an equal and opposite reaction force.
        <br><b>F<sub>1&rarr;2</sub></b> = -<b>F<sub>2&rarr;1</sub></b> always, regardless of mass or motion.
        <br><i><b>Mission:</b> Release the spring and analyze the recoil velocities!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_3('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_3('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u2-3-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> FORCE PAIR PRO
            </div>
        </div>

        <div id="calc-2-3" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Blue Mass (<i class="var">m<sub>1</sub></i>):</span>
                <span><span id="v-m1">2.0</span> kg</span>
            </label>
            <input type="range" id="in-m1" class="phys-slider" min="1.0" max="10.0" step="0.5" value="2.0" 
                oninput="updateState_2_3('m1', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Red Mass (<i class="var">m<sub>2</sub></i>):</span>
                <span><span id="v-m2">2.0</span> kg</span>
            </label>
            <input type="range" id="in-m2" class="phys-slider" min="1.0" max="10.0" step="0.5" value="2.0" 
                oninput="updateState_2_3('m2', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Spring Force (<i class="var">F<sub>push</sub></i>):</span>
                <span><span id="v-f">50</span> N</span>
            </label>
            <input type="range" id="in-f" class="phys-slider" min="20" max="100" step="10" value="50" 
                oninput="updateState_2_3('F', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_2_3()" id="btn-start">Release Spring</button>
            <button class="btn btn-red" onclick="reset_2_3()">Reset</button>
        </div>
        
        <div id="u2-3-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_2_3();
}

function updateState_2_3(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm1') document.getElementById('v-m1').innerText = state.m1.toFixed(1);
    if(key === 'm2') document.getElementById('v-m2').innerText = state.m2.toFixed(1);
    if(key === 'F') document.getElementById('v-f').innerText = state.F.toFixed(0);
    
    draw_2_3();
    updateCalcDisplay_2_3();
}

function setMode_2_3(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u2-3-questions');
    const badge = document.getElementById('u2-3-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_3();
    }
    updateLocks_2_3();
    draw_2_3();
    updateCalcDisplay_2_3();
}

function updateLocks_2_3() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function updateCalcDisplay_2_3() {
    let box = document.getElementById('calc-2-3');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let fDisplay = state.pushing ? state.F.toFixed(0) : "0";
    
    box.innerHTML = `
        <div style="margin-bottom:10px;">
            <div style="margin-bottom:4px; color:#555;">Newton's 3rd Law:</div>
            <div style="font-size:1.1em;">
                ${v('F<sub>1&rarr;2</sub>')} = -${v('F<sub>2&rarr;1</sub>')}
            </div>
            <div style="font-size:1.0em; margin-top:4px;">
                <span style="color:#c0392b;">${fDisplay} N</span> = <span style="color:#2980b9;">-${fDisplay} N</span>
            </div>
        </div>
        <div style="font-size:0.9em; color:#777;">
            (Forces are equal magnitude, opposite direction)
        </div>
    `;
}

function start_2_3() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.pushTime = 0;
        state.pushDuration = 0.5; 
        state.pushing = true;
        state.history = []; 
        updateLocks_2_3();
        loop_2_3();
    }
}

function reset_2_3() {
    let savedLevel = loadProgress('2.3'); 

    state = {
        m1: parseFloat(document.getElementById('in-m1').value),
        m2: parseFloat(document.getElementById('in-m2').value),
        F: parseFloat(document.getElementById('in-f').value),
        
        x1: -1.5, v1: 0, a1: 0,
        x2: 1.5, v2: 0, a2: 0,
        
        t: 0,
        pushing: false,
        history: [],
        running: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    if(state.level >= 3) document.getElementById('u2-3-badge').style.display = 'block';

    setMode_2_3(state.mode);
    updateCalcDisplay_2_3();
    requestAnimationFrame(draw_2_3);
}

function loop_2_3() {
    if(currentSim !== '2.3') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        if(state.t < state.pushDuration) {
            state.pushing = true;
            let fMag = state.F;
            
            state.a1 = -fMag / state.m1;
            state.a2 = fMag / state.m2;
            
            state.v1 += state.a1 * dt;
            state.v2 += state.a2 * dt;
            
            state.currentF1 = -fMag;
            state.currentF2 = fMag;
        } else {
            state.pushing = false;
            state.a1 = 0;
            state.a2 = 0;
            state.currentF1 = 0;
            state.currentF2 = 0;
        }
        
        state.x1 += state.v1 * dt;
        state.x2 += state.v2 * dt;
        
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                v1: state.v1, 
                v2: state.v2,
                f1: state.currentF1,
                f2: state.currentF2
            });
        }
        
        if(state.x1 < -20 || state.x2 > 20 || state.t > 3.0) {
            state.running = false;
            state.history.push({t: state.t, v1: state.v1, v2: state.v2, f1: 0, f2: 0});
            
            if(state.mode === 'guided') checkLevel_2_3();
            updateLocks_2_3();
        }
    }

    updateCalcDisplay_2_3();
    draw_2_3();
    
    if(state.running) requestAnimationFrame(loop_2_3);
}

function draw_2_3() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    let trackY = 160; 
    let pxPerM = 20; 
    let centerX = 350;

    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, trackY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, trackY, 700, 40);
    
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    for(let i=-15; i<=15; i+=5) {
        let x = centerX + i*pxPerM;
        ctx.fillRect(x, trackY, 1, 10);
        ctx.fillText(i, x, trackY + 25);
    }
    
    let w1 = 40 + state.m1 * 3; 
    let w2 = 40 + state.m2 * 3;
    let h = 30;
    
    let c1x = centerX + state.x1*pxPerM; 
    ctx.fillStyle = "#2980b9"; ctx.fillRect(c1x - w1, trackY - h, w1, h);
    ctx.fillStyle = "white"; ctx.font = "bold 12px sans-serif"; ctx.textAlign="center";
    ctx.fillText(state.m1+"kg", c1x - w1/2, trackY - 10);
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(c1x-w1+10, trackY, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(c1x-10, trackY, 5, 0, Math.PI*2); ctx.fill();

    let c2x = centerX + state.x2*pxPerM;
    ctx.fillStyle = "#c0392b"; ctx.fillRect(c2x, trackY - h, w2, h);
    ctx.fillStyle = "white"; ctx.textAlign="center";
    ctx.fillText(state.m2+"kg", c2x + w2/2, trackY - 10);
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(c2x+10, trackY, 5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(c2x+w2-10, trackY, 5, 0, Math.PI*2); ctx.fill();
    
    if(Math.abs(state.x2 - state.x1) < 5) {
        ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth=2;
        let sx = c1x; 
        let ex = c2x;
        let sy = trackY - h/2;
        ctx.beginPath(); ctx.moveTo(sx, sy);
        for(let i=0; i<=1; i+=0.1) {
            ctx.lineTo(sx + (ex-sx)*i, sy + (i%0.2 < 0.1 ? -5 : 5));
        }
        ctx.stroke();
    }
    
    if(state.pushing) {
        let fScale = 0.8;
        drawVector_2_3(c1x, trackY - h/2, -state.F * fScale, 0, "#2980b9", "F_12");
        drawVector_2_3(c2x, trackY - h/2, state.F * fScale, 0, "#c0392b", "F_21");
    }

    let panelY = 220;
    let panelH = 400;
    let midX = 350;
    
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(midX, panelY); ctx.lineTo(midX, panelY+panelH); ctx.stroke();
    
    drawMiniGraph_2_3(0, panelY, 340, 200, state.history, 'f', [-120, 120], "Force (N)");
    drawMiniGraph_2_3(350, panelY, 340, 200, state.history, 'v', [-15, 15], "Velocity (m/s)");
}

function drawVector_2_3(x, y, vx, vy, color, label) {
    let endX = x + vx;
    let endY = y - vy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(-vy, vx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        let parts = label.split('_');
        let main = parts[0];
        let sub = parts[1] || "";
        let lblX = endX + (vx>0 ? 10 : -35);
        let lblY = endY + (vy>0 ? -5 : 20);
        ctx.font = "italic bold 14px 'Times New Roman', serif";
        ctx.fillText(main, lblX, lblY);
        if(sub) {
            let mw = ctx.measureText(main).width;
            ctx.font = "italic bold 10px 'Times New Roman', serif";
            ctx.fillText(sub, lblX + mw + 1, lblY + 4);
        }
    }
}

function drawMiniGraph_2_3(x, y, w, h, data, type, range, label) {
    ctx.fillStyle = "white"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#333"; ctx.strokeRect(x,y,w,h);
    
    let midY = y + h/2;
    let pxPerVal = (h/2) / range[1];
    
    ctx.strokeStyle = "#ccc"; ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(x+w, midY); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.textAlign = "right"; ctx.font = "10px sans-serif";
    ctx.fillText(label, x+w-5, y+15);
    
    if(data.length > 0) {
        let tMax = 3.0;
        
        let plotLine = (key, col) => {
            ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 2;
            for(let i=0; i<data.length; i++) {
                let p = data[i];
                let val = p[key];
                if(val > range[1]) val = range[1];
                if(val < range[0]) val = range[0];
                let px = x + (p.t / tMax) * w;
                let py = midY - (val * pxPerVal);
                if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
        };
        
        if(type === 'f') {
            plotLine('f1', "#2980b9");
            plotLine('f2', "#c0392b");
        } else {
            plotLine('v1', "#2980b9");
            plotLine('v2', "#c0392b");
        }
    }
}

function renderQuestions_2_3() {
    let div = document.getElementById('u2-3-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Symmetry</h4>
            <p>Set masses equal: ${v('m<sub>1</sub>')} = ${v('m<sub>2</sub>')} = <b>2.0 kg</b>.</p>
            <p>Set Spring Force ${v('F<sub>push</sub>')} = <b>50 N</b>.</p>
            <p>Release. Compare the final velocities.</p>
            <div style="margin-top:10px;">
                <button onclick="checkAnswer_2_3(0)" style="padding:5px 15px; cursor:pointer;">They are equal & opposite</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Mass Difference</h4>
            <p>Set Blue Mass ${v('m<sub>1</sub>')} = <b>4.0 kg</b>.</p>
            <p>Set Red Mass ${v('m<sub>2</sub>')} = <b>2.0 kg</b>.</p>
            <p>If Red shoots off at ${v('v<sub>2</sub>')} = <b>4.0 m/s</b>, what is ${v('v<sub>1</sub>')}?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_3(1)"> 
                <button onclick="checkAnswer_2_3(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: The Force Trap</h4>
            <p>Keep ${v('m<sub>1</sub>')} = 4.0 kg (Big) and ${v('m<sub>2</sub>')} = 2.0 kg (Small).</p>
            <p>The spring pushes Red (${v('m<sub>2</sub>')}) with <b>50 N</b>.</p>
            <p>How much force does it push Blue (${v('m<sub>1</sub>')}) with?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_3(2)"> 
                <button onclick="checkAnswer_2_3(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; FORCE PAIR PRO &#9733;</h3>
            <p>You understand that forces always come in equal and opposite pairs!</p>
        `;
    }
}

function checkAnswer_2_3(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        if(state.m1 === 2.0 && state.m2 === 2.0 && Math.abs(state.v1 + state.v2) < 0.1 && Math.abs(state.v1) > 0.1) {
            correct = true;
        } else {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Run the sim with equal masses first!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-1').value);
        if(Math.abs(Math.abs(val) - 2.0) < 0.2) correct = true;
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-2').value);
        if(Math.abs(val - 50) < 1.0) correct = true;
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('2.3', state.level);
            
            if(state.level >= 3) document.getElementById('u2-3-badge').style.display = 'block';
            renderQuestions_2_3();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Try again.</span>`;
    }
}

function checkLevel_2_3() {
}

// ===============================================
// === UNIT 2.4: NEWTON'S FIRST LAW (Gold Standard v4.6) ===
// ===============================================

function setup_2_4() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "2.4 Newton's First Law (Inertia)";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Law of Inertia</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        An object in motion stays in motion with constant velocity unless acted upon by a net force.
        <br>Once the thruster stops, <b>acceleration becomes zero</b>, but <b>velocity continues unchanged</b>.
        <br><i><b>Mission:</b> Burn fuel to reach speed, then coast to the target!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_4('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_4('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u2-4-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> INERTIA CAPTAIN
            </div>
        </div>

        <div id="calc-2-4" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2c3e50; padding-left: 10px;">
            <label style="color:#2c3e50; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Probe Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">100</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="50" max="200" step="10" value="100" 
                oninput="updateState_2_4('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px; margin-top:10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Thruster Force (<i class="var">F<sub>thrust</sub></i>):</span>
                <span><span id="v-f">200</span> N</span>
            </label>
            <input type="range" id="in-f" class="phys-slider" min="0" max="500" step="10" value="200" 
                oninput="updateState_2_4('F', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #e67e22; padding-left: 10px; margin-top:10px;">
            <label style="color:#e67e22; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Burn Duration (<i class="var">&Delta;t</i>):</span>
                <span><span id="v-dt">2.0</span> s</span>
            </label>
            <input type="range" id="in-dt" class="phys-slider" min="0.5" max="5.0" step="0.5" value="2.0" 
                oninput="updateState_2_4('dtBurn', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_2_4()" id="btn-start">Launch Probe</button>
            <button class="btn btn-red" onclick="reset_2_4()">Reset</button>
        </div>
        
        <div id="u2-4-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    // Generate random stars for background
    state.stars = [];
    for(let i=0; i<100; i++) {
        state.stars.push({x: Math.random()*700, y: Math.random()*300, r: Math.random()*1.5});
    }

    reset_2_4();
}

function updateState_2_4(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(0);
    if(key === 'F') document.getElementById('v-f').innerText = state.F.toFixed(0);
    if(key === 'dtBurn') document.getElementById('v-dt').innerText = state.dtBurn.toFixed(1);
    
    // Preview Accel
    state.a = state.F / state.m;
    
    updateCalcDisplay_2_4();
}

function setMode_2_4(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u2-4-questions');
    const badge = document.getElementById('u2-4-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_4();
    }
    updateLocks_2_4();
    draw_2_4();
    updateCalcDisplay_2_4();
}

function updateLocks_2_4() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function updateCalcDisplay_2_4() {
    let box = document.getElementById('calc-2-4');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let aVal = state.F / state.m;
    
    box.innerHTML = `
        <div style="margin-bottom:10px;">
            <div style="margin-bottom:4px; color:#555;">Phase 1: Acceleration (Burn)</div>
            <div style="font-size:1.1em;">
                ${v('a')} = ${v('F<sub>net</sub>')} / ${v('m')} = 
                <b>${aVal.toFixed(2)}</b> m/s²
            </div>
        </div>
        <div>
            <div style="margin-bottom:4px; color:#555;">Phase 2: Coasting (Inertia)</div>
            <div style="font-size:1.1em;">
                ${v('F<sub>net</sub>')} = 0 &nbsp;&rightarrow;&nbsp; ${v('a')} = 0 &nbsp;&rightarrow;&nbsp; ${v('v')} = Constant
            </div>
        </div>
    `;
}

function start_2_4() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.a = state.F / state.m;
        state.history = []; 
        state.traces = []; // Dots for motion diagram
        updateLocks_2_4();
        loop_2_4();
    }
}

function reset_2_4() {
    let savedLevel = loadProgress('2.4'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        F: parseFloat(document.getElementById('in-f').value),
        dtBurn: parseFloat(document.getElementById('in-dt').value),
        
        x: 0, 
        v: 0, 
        a: 0,
        
        t: 0,
        history: [],
        traces: [],
        running: false,
        stars: state.stars || [], // Preserve stars
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Initial Calc
    state.a = state.F / state.m;

    if(state.level >= 3) document.getElementById('u2-4-badge').style.display = 'block';

    setMode_2_4(state.mode);
    updateCalcDisplay_2_4();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_2_4();
        });
    });
}

function loop_2_4() {
    if(currentSim !== '2.4') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // --- PHYSICS ENGINE ---
        if(state.t < state.dtBurn) {
            // Phase 1: Burn
            state.a = state.F / state.m;
            state.isBurning = true;
        } else {
            // Phase 2: Coast
            state.a = 0;
            state.isBurning = false;
        }
        
        state.v += state.a * dt;
        state.x += state.v * dt;
        
        // Trace Logic (Drop a dot every 0.5s)
        if(state.t % 0.5 < dt) {
            state.traces.push({x: state.x, isBurn: state.isBurning});
        }
        
        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                v: state.v,
                f: state.isBurning ? state.F : 0
            });
        }
        
        // Stop Condition (Visual Limit or Time)
        // Screen width ~700px. Let's stop at x = 700m (scale 1px = 1m)
        if(state.x > 700 || state.t > 10.0) {
            state.running = false;
            // Ghost State
            state.history.push({t: state.t, v: state.v, f: 0});
            
            if(state.mode === 'guided') checkLevel_2_4();
            updateLocks_2_4();
        }
    }

    draw_2_4();
    
    if(state.running) requestAnimationFrame(loop_2_4);
}

function draw_2_4() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: SPACE (Top 250px) ===
    let spaceH = 250; 
    let pxPerM = 1; // 1px = 1m
    
    // Background
    ctx.fillStyle = "#0b1021"; ctx.fillRect(0,0,700, spaceH);
    
    // Stars
    ctx.fillStyle = "white";
    state.stars.forEach(s => {
        if(s.y < spaceH) {
            ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
        }
    });
    ctx.globalAlpha = 1.0;
    
    // Target Line (e.g., at 500m)
    let targetX = 500;
    ctx.strokeStyle = "rgba(46, 204, 113, 0.5)"; ctx.lineWidth=2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(targetX, 0); ctx.lineTo(targetX, spaceH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#2ecc71"; ctx.font = "12px sans-serif";
    ctx.fillText("TARGET ZONE", targetX + 5, 20);
    
    // Motion Traces (Dots)
    state.traces.forEach(tr => {
        ctx.fillStyle = tr.isBurn ? "#e67e22" : "#3498db";
        ctx.beginPath(); ctx.arc(tr.x, spaceH/2 + 25, 3, 0, Math.PI*2); ctx.fill();
    });
    
    // The Probe
    let pX = state.x;
    let pY = spaceH/2;
    
    // Draw Probe Body
    ctx.fillStyle = "#95a5a6"; 
    ctx.beginPath(); ctx.arc(pX, pY, 15, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth=2; ctx.stroke();
    
    // Draw Engine (Flash if burning)
    if(state.isBurning) {
        ctx.fillStyle = "#f1c40f"; // Yellow core
        ctx.beginPath(); ctx.moveTo(pX-12, pY-5); ctx.lineTo(pX-25, pY); ctx.lineTo(pX-12, pY+5); ctx.fill();
        ctx.fillStyle = "#e74c3c"; // Red outer
        ctx.beginPath(); ctx.moveTo(pX-15, pY-8); ctx.lineTo(pX-35, pY); ctx.lineTo(pX-15, pY+8); ctx.fill();
    }
    
    // Force Vector (Only during burn)
    if(state.isBurning && Math.abs(state.F) > 1) {
        drawVector_2_4(pX, pY - 20, 60, 0, "#2980b9", "F_thrust");
    }
    
    // Velocity Vector (Always, if moving)
    if(state.v > 0.5) {
        // Scale v for visibility. Max v might be ~20 m/s. 
        let vLen = Math.min(100, state.v * 4); 
        drawVector_2_4(pX, pY, vLen, 0, "#27ae60", "v");
    }
    
    // HUD Info
    ctx.fillStyle = "white"; ctx.font = "14px monospace"; ctx.textAlign = "left";
    ctx.fillText(`t: ${state.t.toFixed(2)}s`, 10, spaceH - 10);
    ctx.fillText(`v: ${state.v.toFixed(1)} m/s`, 100, spaceH - 10);
    ctx.fillText(`x: ${state.x.toFixed(0)} m`, 220, spaceH - 10);


    // === ZONE 2: GRAPHS (Bottom) ===
    let panelY = 270;
    let panelH = 350;
    let midX = 350;
    
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(midX, panelY); ctx.lineTo(midX, panelY+panelH); ctx.stroke();
    
    // Left: Force vs Time
    drawMiniGraph_2_4(0, panelY, 340, 180, state.history, 'f', [0, 500], "Force (N)");
    
    // Right: Velocity vs Time
    drawMiniGraph_2_4(350, panelY, 340, 180, state.history, 'v', [0, 50], "Velocity (m/s)");
}

function drawVector_2_4(x, y, vx, vy, color, label) {
    let endX = x + vx;
    let endY = y - vy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(-vy, vx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        let parts = label.split('_');
        let main = parts[0];
        let sub = parts[1] || "";
        let lblX = endX + (vx>0 ? 5 : -25);
        let lblY = endY + (vy>0 ? -5 : -10);
        ctx.font = "italic bold 14px 'Times New Roman', serif";
        ctx.fillText(main, lblX, lblY);
        if(sub) {
            let mw = ctx.measureText(main).width;
            ctx.font = "italic bold 10px 'Times New Roman', serif";
            ctx.fillText(sub, lblX + mw + 1, lblY + 4);
        }
    }
}

function drawMiniGraph_2_4(x, y, w, h, data, key, range, label) {
    ctx.fillStyle = "white"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#333"; ctx.strokeRect(x,y,w,h);
    
    let midY = y + h - 20; // Bottom aligned for 0
    let pxPerVal = (h-40) / range[1];
    let tMax = 10.0;
    
    // Grid
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(x+w, midY); ctx.stroke();
    
    ctx.fillStyle = "#333"; ctx.textAlign = "right"; ctx.font = "10px sans-serif";
    ctx.fillText(label, x+w-5, y+15);
    ctx.fillText("t(s)", x+w-5, midY-5);
    
    if(data.length > 0) {
        ctx.beginPath(); ctx.strokeStyle = (key==='f') ? "#2980b9" : "#27ae60"; ctx.lineWidth = 2;
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            if(val > range[1]) val = range[1];
            
            let px = x + (p.t / tMax) * w;
            let py = midY - (val * pxPerVal);
            if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}

function renderQuestions_2_4() {
    let div = document.getElementById('u2-4-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: The Drift</h4>
            <p>Once the thruster stops, the probe coasts forever at constant velocity.</p>
            <p>Set Burn Time ${v('&Delta;t')} = <b>2.0 s</b>.</p>
            <p>Set Force ${v('F')} = <b>100 N</b>.</p>
            <p>Launch! Watch the velocity graph flatten out.</p>
            <div style="margin-top:10px;">
                <button onclick="checkAnswer_2_4(0)" style="padding:5px 15px; cursor:pointer;">I see it!</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: Speed Calculation</h4>
            <p>Set Mass ${v('m')} = <b>100 kg</b>.</p>
            <p>Set Burn Time ${v('&Delta;t')} = <b>3.0 s</b>.</p>
            <p>You need a final Coasting Velocity of <b>6.0 m/s</b>.</p>
            <p>What Force ${v('F')} is required?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_4(1)"> 
                <button onclick="checkAnswer_2_4(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Distance Prediction</h4>
            <p>Set ${v('m')} = <b>50 kg</b>, ${v('F')} = <b>100 N</b>, ${v('&Delta;t')} = <b>2.0 s</b>.</p>
            <p>After the burn, the probe coasts.</p>
            <p>How far will the probe be at <b>t = 5.0 s</b>?</p>
            <p style="font-size:0.9em; color:#666;">(Hint: Calculate x at end of burn, then add coast distance)</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="meters" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_4(2)"> 
                <button onclick="checkAnswer_2_4(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; INERTIA CAPTAIN &#9733;</h3>
            <p>You have mastered Newton's First Law!</p>
        `;
    }
}

function checkAnswer_2_4(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        if(state.dtBurn === 2.0 && state.F === 100 && state.history.length > 50) {
            correct = true;
        } else {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set the values and Run the simulation first!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // v = a*t = (F/m)*t. 6 = (F/100)*3. 6 = 0.03F. F = 200.
        if(Math.abs(val - 200) < 5) correct = true;
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // m=50, F=100 => a=2. t_burn=2.
        // x_burn = 0.5 * 2 * 2^2 = 4m.
        // v_final = 2 * 2 = 4 m/s.
        // Coast time = 5 - 2 = 3s.
        // x_coast = 4 * 3 = 12m.
        // Total = 16m.
        if(Math.abs(val - 16) < 1.0) correct = true;
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('2.4', state.level);
            
            if(state.level >= 3) document.getElementById('u2-4-badge').style.display = 'block';
            renderQuestions_2_4();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Try again.</span>`;
    }
}

function checkLevel_2_4() {
    // No auto-check needed
}

// ===============================================
// === UNIT 2.5: NEWTON'S SECOND LAW (Gold Standard v4.6) ===
// ===============================================

function setup_2_5() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "2.5 Newton's Second Law";
    
    // FIX: Removed undefined v() calls, replaced with raw HTML
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Law of Acceleration</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Acceleration is directly proportional to Net Force and inversely proportional to Mass.
        <br><b>Equation:</b> <i class="var">a</i> = <i class="var">F<sub>net</sub></i> / <i class="var">m</i>
        <br><i><b>Mission:</b> Control the variables to achieve the target motion!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_5('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_5('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u2-5-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> ACCELERATION ACE
            </div>
        </div>

        <div id="calc-2-5" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Net Force (<i class="var">F<sub>net</sub></i>):</span>
                <span><span id="v-f">0</span> N</span>
            </label>
            <input type="range" id="in-f" class="phys-slider" min="-100" max="100" step="5" value="0" 
                oninput="updateState_2_5('F', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #2c3e50; padding-left: 10px; margin-top:10px;">
            <label style="color:#2c3e50; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">5.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="1.0" max="20.0" step="0.5" value="5.0" 
                oninput="updateState_2_5('m', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_2_5()" id="btn-start">Run Experiment</button>
            <button class="btn btn-red" onclick="reset_2_5()">Reset</button>
        </div>
        
        <div id="u2-5-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_2_5();
}

function updateState_2_5(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'F') document.getElementById('v-f').innerText = state.F.toFixed(0);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    
    // Calculate A
    state.a = state.F / state.m;
    
    updateCalcDisplay_2_5();
    draw_2_5();
}

function setMode_2_5(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u2-5-questions');
    const badge = document.getElementById('u2-5-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        // Unlock mass slider in challenge if it was locked
        document.getElementById('in-m').disabled = false;
        document.getElementById('in-m').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_5();
    }
    
    // In Level 3 (Mystery Mass), we lock the mass slider visually or override it?
    // We'll handle that in renderQuestions/reset.
    
    updateLocks_2_5();
    draw_2_5();
    updateCalcDisplay_2_5();
}

function updateLocks_2_5() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        // Don't unlock mass if in mystery mode (Level 2)
        if(state.mode === 'guided' && state.level === 2 && s.id === 'in-m') return;
        
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function updateCalcDisplay_2_5() {
    let box = document.getElementById('calc-2-5');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let aVal = state.a.toFixed(2);
    let mDisplay = state.isMystery ? "?" : state.m.toFixed(1);
    let aDisplay = state.running || state.history.length > 0 ? aVal : "?";
    
    if(state.mode === 'guided' && state.level === 2) {
        // Mystery Mode Display
        box.innerHTML = `
            <div style="margin-bottom:5px;">
                ${v('a')} = ${v('F_{net}')} / ${v('m')}
            </div>
            <div style="font-size:1.1em;">
                <b>${aDisplay}</b> m/s² = ${state.F.toFixed(0)} N / <b>${mDisplay}</b> kg
            </div>
        `;
    } else {
        // Normal Display
        box.innerHTML = `
            <div style="margin-bottom:5px;">
                ${v('a')} = ${v('F_{net}')} / ${v('m')}
            </div>
            <div style="font-size:1.1em;">
                <b>${aVal}</b> m/s² = ${state.F.toFixed(0)} N / ${mDisplay} kg
            </div>
        `;
    }
}

function start_2_5() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.history = []; 
        state.x = 0;
        state.v = 0;
        
        // Final calc before run
        state.a = state.F / state.m;
        
        updateLocks_2_5();
        loop_2_5();
    }
}

function reset_2_5() {
    let savedLevel = loadProgress('2.5'); 

    state = {
        F: parseFloat(document.getElementById('in-f').value),
        m: parseFloat(document.getElementById('in-m').value),
        
        x: 0, 
        v: 0, 
        a: 0,
        t: 0,
        
        history: [],
        running: false,
        isMystery: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Level 3 Setup: Mystery Mass
    if(state.mode === 'guided' && state.level === 2) {
        state.isMystery = true;
        // Randomize mass between 2 and 10, keep it secret
        // We set a fixed random mass for the session or purely random?
        // Let's use a fixed "Mystery" mass so they can solve it. Say 8.5 kg.
        state.m = 8.0; 
        
        // Lock Mass Slider
        let mSlider = document.getElementById('in-m');
        mSlider.disabled = true;
        mSlider.parentElement.style.opacity = "0.5";
        document.getElementById('v-m').innerText = "???";
    } else {
        // Unlock Mass Slider
        let mSlider = document.getElementById('in-m');
        mSlider.disabled = false;
        mSlider.parentElement.style.opacity = "1.0";
    }
    
    state.a = state.F / state.m;

    if(state.level >= 3) document.getElementById('u2-5-badge').style.display = 'block';

    setMode_2_5(state.mode);
    updateCalcDisplay_2_5();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_2_5();
        });
    });
}

function loop_2_5() {
    if(currentSim !== '2.5') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        state.v += state.a * dt;
        state.x += state.v * dt;
        
        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                v: state.v,
                a: state.a
            });
        }
        
        // Stop Condition
        if(state.x > 20 || state.x < -20 || state.t > 5.0) {
            state.running = false;
            // Ghost State
            state.history.push({t: state.t, v: state.v, a: state.a});
            
            if(state.mode === 'guided') checkLevel_2_5();
            updateLocks_2_5();
        }
    }

    updateCalcDisplay_2_5();
    draw_2_5();
    
    if(state.running) requestAnimationFrame(loop_2_5);
}

function draw_2_5() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 200px) ===
    let trackY = 150; 
    let pxPerM = 20; 
    let centerX = 350;

    // Track
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, trackY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, trackY, 700, 40);
    
    // Ticks
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    for(let i=-15; i<=15; i+=5) {
        let x = centerX + i*pxPerM;
        ctx.fillRect(x, trackY, 1, 10);
        ctx.fillText(i, x, trackY + 25);
    }
    
    // Cart
    let cartW = 60; 
    let cartH = 30;
    let cartX = centerX + (state.x * pxPerM);
    // Clamp visual
    cartX = Math.max(cartW/2 + 5, Math.min(700 - cartW/2 - 5, cartX));
    let cartY = trackY - cartH;
    
    ctx.fillStyle = "#34495e"; ctx.fillRect(cartX - cartW/2, cartY, cartW, cartH);
    // Wheels
    ctx.fillStyle = "#2c3e50"; 
    ctx.beginPath(); ctx.arc(cartX - 20, trackY, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cartX + 20, trackY, 6, 0, Math.PI*2); ctx.fill();
    
    // Mass Label on Cart
    ctx.fillStyle = "white"; ctx.font = "bold 12px sans-serif";
    let mText = state.isMystery ? "?" : state.m + "kg";
    ctx.fillText(mText, cartX, cartY + 18);
    
    // VECTORS
    // Force (Blue)
    if(Math.abs(state.F) > 1) {
        drawVector_2_5(cartX, cartY + cartH/2, state.F * 0.8, 0, "#2980b9", "F_net");
    }
    
    // Acceleration (Orange) - Offset vertically
    if(Math.abs(state.a) > 0.1) {
        drawVector_2_5(cartX, cartY - 15, state.a * 5, 0, "#e67e22", "a");
    }


    // === ZONE 2: GRAPHS (Bottom 440px) ===
    let panelY = 220;
    let panelH = 400;
    let midX = 350;
    
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(midX, panelY); ctx.lineTo(midX, panelY+panelH); ctx.stroke();
    
    // Left: Velocity vs Time
    drawMiniGraph_2_5(0, panelY, 340, 200, state.history, 'v', [-20, 20], "Velocity (m/s)");
    
    // Right: Acceleration vs Time
    drawMiniGraph_2_5(350, panelY, 340, 200, state.history, 'a', [-20, 20], "Accel (m/s²)");
}

function drawVector_2_5(x, y, vx, vy, color, label) {
    let endX = x + vx;
    let endY = y - vy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(-vy, vx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        let parts = label.split('_');
        let main = parts[0];
        let sub = parts[1] || "";
        let lblX = endX + (vx>0 ? 10 : -35);
        let lblY = endY + (vy>0 ? -5 : 20);
        ctx.font = "italic bold 14px 'Times New Roman', serif";
        ctx.fillText(main, lblX, lblY);
        if(sub) {
            let mw = ctx.measureText(main).width;
            ctx.font = "italic bold 10px 'Times New Roman', serif";
            ctx.fillText(sub, lblX + mw + 1, lblY + 4);
        }
    }
}

function drawMiniGraph_2_5(x, y, w, h, data, key, range, label) {
    ctx.fillStyle = "white"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#333"; ctx.strokeRect(x,y,w,h);
    
    let midY = y + h/2;
    let pxPerVal = (h/2) / range[1];
    
    ctx.strokeStyle = "#ccc"; ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(x+w, midY); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.textAlign = "right"; ctx.font = "10px sans-serif";
    ctx.fillText(label, x+w-5, y+15);
    ctx.fillText("t(s)", x+w-5, midY-5);
    
    if(data.length > 0) {
        let tMax = 5.0;
        ctx.beginPath(); ctx.strokeStyle = (key==='v') ? "#2980b9" : "#e67e22"; ctx.lineWidth = 2;
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            if(val > range[1]) val = range[1];
            if(val < range[0]) val = range[0];
            
            let px = x + (p.t / tMax) * w;
            let py = midY - (val * pxPerVal);
            if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}

function renderQuestions_2_5() {
    let div = document.getElementById('u2-5-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Target Acceleration</h4>
            <p>Set Mass ${v('m')} = <b>5.0 kg</b>.</p>
            <p>You need an acceleration of <b>4.0 m/s²</b>.</p>
            <p>Calculate and set the required Net Force ${v('F_{net}')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_5(0)"> 
                <button onclick="checkAnswer_2_5(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: Target Mass</h4>
            <p>Set Net Force ${v('F_{net}')} = <b>60 N</b>.</p>
            <p>You want an acceleration of <b>3.0 m/s²</b>.</p>
            <p>What must the Mass ${v('m')} be?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="kg" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_5(1)"> 
                <button onclick="checkAnswer_2_5(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#e67e22;">Level 3: Mystery Mass</h4>
            <p>I have hidden the mass value.</p>
            <p><b>1.</b> Set ${v('F_{net}')} to any non-zero value.</p>
            <p><b>2.</b> Run the sim and read ${v('a')} from the panel.</p>
            <p><b>3.</b> Calculate the hidden mass.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="kg" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_5(2)"> 
                <button onclick="checkAnswer_2_5(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; ACCELERATION ACE &#9733;</h3>
            <p>You have mastered the F=ma relationship!</p>
        `;
    }
}

function checkAnswer_2_5(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // a = F/m -> 4 = F/5 -> F = 20.
        // Check if slider is set AND value is typed correctly
        if(state.m === 5.0 && Math.abs(state.F - 20) < 1.0 && Math.abs(val - 20) < 1.0) correct = true;
        else if (state.F !== 20) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set the Force slider to the correct value first!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // a = F/m -> 3 = 60/m -> m = 20.
        if(state.F === 60 && Math.abs(state.m - 20) < 0.5 && Math.abs(val - 20) < 0.5) correct = true;
        else if (Math.abs(state.m - 20) > 0.5) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Adjust the Mass slider to match your calculation!</span>`;
            return;
        }
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // Mystery mass is set to 8.0
        if(Math.abs(val - 8.0) < 0.2) correct = true;
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('2.5', state.level);
            
            if(state.level >= 3) document.getElementById('u2-5-badge').style.display = 'block';
            renderQuestions_2_5();
            
            // Re-run reset to handle mystery mode toggles
            reset_2_5();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your math: ${v('F')} = ${v('ma')}</span>`;
    }
}

function checkLevel_2_5() {
}

// ===============================================
// === UNIT 2.6: INCLINED PLANES (Gold Standard v4.6) ===
// ===============================================

function setup_2_6() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "2.6 Inclined Planes";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Geometry of Force</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Gravity doesn't just pull down; it pulls <i>into</i> the ramp and <i>down</i> the slope.
        <br><b>Parallel:</b> <i class="var">mg sin(&theta;)</i> causes acceleration.
        <br><b>Perpendicular:</b> <i class="var">mg cos(&theta;)</i> creates the Normal Force.</p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_6('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_6('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u2-6-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> VECTOR VICTOR
            </div>
        </div>

        <div id="calc-2-6" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">10.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="1.0" max="50.0" step="1.0" value="10.0" 
                oninput="updateState_2_6('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Angle (<i class="var">&theta;</i>):</span>
                <span><span id="v-ang">30</span>&deg;</span>
            </label>
            <input type="range" id="in-ang" class="phys-slider" min="0" max="90" step="1" value="30" 
                oninput="updateState_2_6('theta', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_2_6()" id="btn-start">Release Block</button>
            <button class="btn btn-red" onclick="reset_2_6()">Reset</button>
        </div>
        
        <div style="margin-top:10px;">
            <label style="cursor:pointer; display:flex; align-items:center;">
                <input type="checkbox" id="chk-components" checked onchange="state.showComponents=this.checked; draw_2_6();" style="margin-right:5px;"> Show Components
            </label>
        </div>

        <div id="u2-6-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_2_6();
}

function updateState_2_6(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    if(key === 'theta') document.getElementById('v-ang').innerText = state.theta.toFixed(0);
    
    // Recalc Physics
    calcPhysics_2_6();
    updateCalcDisplay_2_6();
    draw_2_6();
}

function setMode_2_6(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u2-6-questions');
    const badge = document.getElementById('u2-6-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_6();
    }
    updateLocks_2_6();
    draw_2_6();
    updateCalcDisplay_2_6();
}

function updateLocks_2_6() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_2_6() {
    let g = 9.8;
    let rad = state.theta * Math.PI / 180;
    
    state.fg = state.m * g;
    
    // Components
    state.fg_par = state.fg * Math.sin(rad); // Parallel (pushes down ramp)
    state.fg_perp = state.fg * Math.cos(rad); // Perpendicular (pushes into ramp)
    
    state.fn = state.fg_perp; // Normal force balances perp component
    state.fnet = state.fg_par; // No friction, so net force is just parallel grav
    
    state.a = state.fnet / state.m;
}

function updateCalcDisplay_2_6() {
    let box = document.getElementById('calc-2-6');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    // Formatting
    let theta = state.theta.toFixed(0);
    let aVal = state.a.toFixed(2);
    let fnVal = state.fn.toFixed(1);
    
    box.innerHTML = `
        <div style="margin-bottom:10px;">
            <div style="margin-bottom:4px; color:#555;">Parallel (Acceleration):</div>
            <div style="font-size:1.1em;">
                ${v('a')} = ${v('g')} sin(${theta}&deg;) = <b>${aVal}</b> m/s²
            </div>
        </div>
        <div>
            <div style="margin-bottom:4px; color:#555;">Perpendicular (Normal Force):</div>
            <div style="font-size:1.1em;">
                ${v('F<sub>N</sub>')} = ${v('mg')} cos(${theta}&deg;) = <b>${fnVal}</b> N
            </div>
        </div>
    `;
}

function start_2_6() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.history = []; 
        state.dist = 0; // Distance down ramp
        state.v = 0;
        
        calcPhysics_2_6();
        updateLocks_2_6();
        loop_2_6();
    }
}

function reset_2_6() {
    let savedLevel = loadProgress('2.6'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        theta: parseFloat(document.getElementById('in-ang').value),
        
        dist: 0, 
        v: 0, 
        t: 0,
        
        history: [],
        running: false,
        showComponents: document.getElementById('chk-components').checked,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    calcPhysics_2_6();

    if(state.level >= 3) document.getElementById('u2-6-badge').style.display = 'block';

    setMode_2_6(state.mode);
    updateCalcDisplay_2_6();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_2_6();
        });
    });
}

function loop_2_6() {
    if(currentSim !== '2.6') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        state.v += state.a * dt;
        state.dist += state.v * dt;
        
        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                v: state.v,
                a: state.a
            });
        }
        
        // Stop Condition (Visual Limit e.g. 10m ramp)
        // Let's say ramp is 15 meters long
        if(state.dist > 15.0) {
            state.running = false;
            // Ghost State
            state.history.push({t: state.t, v: state.v, a: state.a});
            
            if(state.mode === 'guided') checkLevel_2_6();
            updateLocks_2_6();
        }
    }

    draw_2_6();
    
    if(state.running) requestAnimationFrame(loop_2_6);
}

function draw_2_6() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 300px) ===
    let worldH = 300; 
    let pxPerM = 20; // 1m = 20px
    let originX = 50; 
    let originY = 250;
    
    // Draw Sky/Ground
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, worldH);
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, worldH, 700, 40); // Footer
    
    // Draw Ramp
    // Triangle coordinates
    let rampLen = 600; // Visual length in px
    let thetaRad = state.theta * Math.PI / 180;
    let rampX = rampLen * Math.cos(thetaRad);
    let rampY = rampLen * Math.sin(thetaRad);
    
    ctx.fillStyle = "#95a5a6";
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + rampX, originY); // Base
    ctx.lineTo(originX, originY - rampY); // Top
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth=2; ctx.stroke();
    
    // Angle Arc
    ctx.strokeStyle = "#c0392b"; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(originX + rampX, originY, 40, Math.PI, Math.PI + thetaRad);
    ctx.stroke();
    ctx.fillStyle = "#c0392b"; ctx.font="bold 12px sans-serif";
    ctx.fillText(state.theta.toFixed(0)+"°", originX + rampX - 60, originY - 10);
    
    // --- DRAW BLOCK ---
    // Start at top, move down by state.dist
    // Start position (Top of ramp)
    let startX = originX;
    let startY = originY - rampY;
    
    // Calculate current position on canvas
    let cx = startX + state.dist * pxPerM * Math.cos(thetaRad);
    let cy = startY + state.dist * pxPerM * Math.sin(thetaRad);
    
    // Block dimensions
    let bw = 40; let bh = 25;
    
    // Rotate canvas for block
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(thetaRad); 
    
    // Draw Block (centered on bottom edge)
    ctx.fillStyle = "#e67e22"; ctx.fillRect(-bw/2, -bh, bw, bh);
    ctx.strokeStyle = "#d35400"; ctx.lineWidth=2; ctx.strokeRect(-bw/2, -bh, bw, bh);
    
    // Mass Label (Inside block, rotated)
    ctx.fillStyle = "white"; ctx.font = "bold 10px sans-serif"; ctx.textAlign="center";
    ctx.fillText(state.m.toFixed(0)+"kg", 0, -bh/2 + 3);
    
    // VECTORS (If enabled)
    if(state.showComponents) {
        let vScale = 0.5; // Scale factor for vectors
        
        // 1. Normal Force (Up, Perpendicular)
        // Rotated frame: Up is -y
        drawVector_2_6(0, -bh, 0, -state.fn * vScale, "#2980b9", "F_N");
        
        // 2. Gravity Parallel (Down ramp)
        // Rotated frame: Right is +x
        drawVector_2_6(0, -bh/2, state.fg_par * vScale, 0, "#e74c3c", "mg_sin");
        
        // 3. Gravity Perpendicular (Into ramp)
        // Rotated frame: Down is +y
        drawVector_2_6(0, -bh/2, 0, state.fg_perp * vScale, "#8e44ad", "mg_cos");
    }
    
    ctx.restore(); // Restore un-rotated context
    
    // Draw "True" Gravity Vector (Straight Down)
    if(state.showComponents) {
        let vScale = 0.5;
        // Need absolute coordinates for this
        // Block center in world space is approx (cx, cy - bh/2 rotated??)
        // Let's simplified: draw from center of block visual
        // The previous transforms are hard to match perfectly without matrix math.
        // Easier approach: Redraw just this vector at estimated center.
        // Actually, let's skip "True Gravity" to avoid visual clutter vs components.
        // Students need components more than the resultant here.
    }


    // === ZONE 2: GRAPHS (Bottom 340px) ===
    let panelY = 320;
    let panelH = 320;
    let midX = 350;
    
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(midX, panelY); ctx.lineTo(midX, panelY+panelH); ctx.stroke();
    
    // Left: Velocity vs Time
    drawMiniGraph_2_6(0, panelY, 340, 160, state.history, 'v', [0, 20], "Velocity (m/s)");
    
    // Right: Acceleration vs Time
    drawMiniGraph_2_6(350, panelY, 340, 160, state.history, 'a', [0, 10], "Accel (m/s²)");
}

function drawVector_2_6(x, y, vx, vy, color, label) {
    let endX = x + vx;
    let endY = y - vy; // Canvas Y inverted? No, inside rotated context Y is local
    // Wait, in standard canvas, +y is down.
    // In physics, "Up" vector usually means -y on canvas.
    // Let's assume input (vx, vy) are standard physics vectors where +y is UP.
    // So canvas dy = -vy.
    
    let cEndX = x + vx;
    let cEndY = y + vy; // Actually, let's pass direct pixel offsets to keep it simple
    // Update: logic in draw_2_6 passed direct offsets.
    
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cEndX, cEndY); ctx.stroke();
    
    // Arrowhead
    let angle = Math.atan2(cEndY-y, cEndX-x);
    let headLen = 6;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cEndX, cEndY);
    ctx.lineTo(cEndX - headLen * Math.cos(angle - Math.PI/6), cEndY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(cEndX - headLen * Math.cos(angle + Math.PI/6), cEndY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    // Label (Rotated with context, so text might be sideways? Yes. That's actually helpful on a ramp.)
    if(label) {
        ctx.fillStyle = color;
        // Parse subscript
        let parts = label.split('_');
        let main = parts[0];
        let sub = parts[1] || "";
        
        ctx.font = "bold 12px serif";
        ctx.fillText(main, cEndX + 5, cEndY);
        if(sub) {
            ctx.font = "bold 9px serif";
            ctx.fillText(sub, cEndX + 15, cEndY + 5);
        }
    }
}

function drawMiniGraph_2_6(x, y, w, h, data, key, range, label) {
    ctx.fillStyle = "white"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#333"; ctx.strokeRect(x,y,w,h);
    
    let midY = y + h - 20; // Zero at bottom
    let pxPerVal = (h-40) / range[1];
    let tMax = 5.0;
    
    ctx.fillStyle = "#333"; ctx.textAlign = "right"; ctx.font = "10px sans-serif";
    ctx.fillText(label, x+w-5, y+15);
    ctx.fillText("t(s)", x+w-5, midY-5);
    
    if(data.length > 0) {
        ctx.beginPath(); ctx.strokeStyle = (key==='v') ? "#2980b9" : "#e67e22"; ctx.lineWidth = 2;
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            if(val > range[1]) val = range[1];
            
            let px = x + (p.t / tMax) * w;
            let py = midY - (val * pxPerVal);
            if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}

function renderQuestions_2_6() {
    let div = document.getElementById('u2-6-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: The Slide</h4>
            <p>Gravity's parallel component causes the slide.</p>
            <p>Set ${v('&theta;')} = <b>30&deg;</b>.</p>
            <p>Calculate acceleration: ${v('a')} = ${v('g')} sin(30&deg;).</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="m/s²" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_6(0)"> 
                <button onclick="checkAnswer_2_6(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Crush</h4>
            <p>Normal Force balances the perpendicular squeeze.</p>
            <p>Set ${v('m')} = <b>20 kg</b>, ${v('&theta;')} = <b>45&deg;</b>.</p>
            <p>Calculate ${v('F<sub>N</sub>')} = ${v('mg')} cos(45&deg;).</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_6(1)"> 
                <button onclick="checkAnswer_2_6(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Target Angle</h4>
            <p>You need an acceleration of exactly <b>4.9 m/s²</b>.</p>
            <p>Find the angle ${v('&theta;')} that creates this slide.</p>
            <p style="font-size:0.9em; color:#666;">(Hint: 4.9 is half of g)</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="degrees" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_6(2)"> 
                <button onclick="checkAnswer_2_6(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; VECTOR VICTOR &#9733;</h3>
            <p>You have mastered Inclined Planes!</p>
        `;
    }
}

function checkAnswer_2_6(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // a = 9.8 * sin(30) = 4.9
        if(state.theta === 30 && Math.abs(val - 4.9) < 0.2) correct = true;
        else if(state.theta !== 30) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Angle to 30&deg; first!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // Fn = 20 * 9.8 * cos(45) = 196 * 0.707 = 138.6
        let target = 20 * 9.8 * Math.cos(45 * Math.PI/180);
        if(state.m === 20 && state.theta === 45 && Math.abs(val - target) < 2.0) correct = true;
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // a = 4.9. g=9.8. sin(theta) = 0.5. theta = 30.
        // Check if slider is set AND typed
        if(Math.abs(state.theta - 30) < 2 && Math.abs(val - 30) < 2) correct = true;
        else if (Math.abs(state.theta - 30) > 2) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Adjust the slider to the correct angle!</span>`;
            return;
        }
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('2.6', state.level);
            
            if(state.level >= 3) document.getElementById('u2-6-badge').style.display = 'block';
            renderQuestions_2_6();
            reset_2_6();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your math!</span>`;
    }
}

function checkLevel_2_6() {
}

// ===============================================
// === UNIT 2.7: STATIC VS KINETIC FRICTION (Formerly 2.4) ===
// ===============================================

function setup_2_7() {
    canvas.width = 700; 
    canvas.height = 640; 
    document.getElementById('sim-title').innerText = "2.7 Kinetic & Static Friction";
    document.getElementById('sim-title').style.marginBottom = "-10px"; 

    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Friction "Hump"</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        <b>Static Friction</b> matches Applied Force up to a limit. 
        <br><b>Kinetic Friction</b> is constant while sliding.
        <br><i><b>Mission:</b> Answer the questions below to unlock controls and earn the Mastery Badge!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_7('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_7('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="mastery-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> AP MASTER
            </div>
        </div>

        <div class="control-group" style="margin-bottom:12px;">
            <label>Mass (<i class="var">m</i>): <span id="v-m">5.0</span> kg</label>
            <input type="range" id="in-m" class="phys-slider" min="1.0" max="10.0" step="0.5" value="5.0" 
                oninput="updateState_2_7('m', this.value)">
        </div>
        
        <div class="control-group" style="margin-bottom:12px;">
            <label>Applied Force (<i class="var">F<sub>app</sub></i>): <span id="v-fa">0</span> N</label>
            <input type="range" id="in-fa" class="phys-slider" min="0" max="100" value="0" step="0.5" 
                oninput="state.Fa=parseFloat(this.value);">
        </div>

        <div class="control-group" style="margin-bottom:12px;">
            <label>Static Coeff (<i class="var">&mu;<sub>s</sub></i>): <span id="v-mus">0.6</span></label>
            <input type="range" id="in-mus" class="phys-slider" min="0.1" max="1.0" step="0.05" value="0.6" 
                oninput="updateState_2_7('mu_s', this.value)">
        </div>

        <div class="control-group" style="margin-bottom:12px;">
            <label>Kinetic Coeff (<i class="var">&mu;<sub>k</sub></i>): <span id="v-muk">0.4</span></label>
            <input type="range" id="in-muk" class="phys-slider" min="0.1" max="1.0" step="0.05" value="0.4" 
                oninput="updateState_2_7('mu_k', this.value)">
        </div>
        
        <div class="control-group" style="margin-top:15px; margin-bottom:15px; display:flex; align-items:center;">
            <label style="margin-right:15px; margin-bottom:0;">Speed:</label>
            <label style="font-weight:normal; margin-right:20px; margin-bottom:0; display:flex; align-items:center;">
                <input type="radio" name="spd" value="1" checked onclick="state.timeScale=1" style="margin-right:5px;"> Regular
            </label>
            <label style="font-weight:normal; margin-bottom:0; display:flex; align-items:center;">
                <input type="radio" name="spd" value="0.1" onclick="state.timeScale=0.1" style="margin-right:5px;"> Slow Motion
            </label>
        </div>

        <div style="padding:10px; background:#fff; border:1px solid #ddd; border-radius:4px; font-family:'Times New Roman', serif; margin-bottom:10px;">
            <div id="eq-x" style="margin-bottom:12px; height:24px; display:flex; align-items:center; font-size:1.0em;"></div>
            <div id="eq-y" style="height:24px; display:flex; align-items:center; font-size:1.0em;"></div>
        </div>

        <div style="margin-top:10px; display:flex; flex-direction:column; gap:5px;">
            <div style="padding:6px; background:#f8f9fa; border-radius:4px; border:1px solid #eee; text-align:center; font-size:0.9rem;">
                <span id="out-stat" style="font-weight:bold; color:#c0392b;">Static (Stuck)</span>
                &nbsp;&nbsp;
                <span id="out-f-label" class="var">f<sub>s</sub></span> = <span id="out-ff">0.0</span> N
            </div>
            <button class="btn btn-red" onclick="reset_2_7()" style="width:100%; padding:6px;">Reset Graph</button>
        </div>
        
        <div id="questions-section" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    let savedLevel = loadProgress('2.7'); // Updated ID
    
    state = {
        Fa: 0, m: 5.0, mu_s: 0.6, mu_k: 0.4,
        v: 0, x: 0,
        graphData: [],
        running: true,
        lastFa: -1, lastFriction: -1, timeScale: 1, maxFriction: 100,
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };

    if(state.level >= 6) {
        document.getElementById('mastery-badge').style.display = 'block';
    }

    setMode_2_7(state.mode);
    loop_2_7();
}

function updateState_2_7(key, val) {
    state[key] = parseFloat(val);
    if(key==='m') document.getElementById('v-m').innerText = state.m.toFixed(1);
    if(key==='mu_s') document.getElementById('v-mus').innerText = state.mu_s.toFixed(2);
    if(key==='mu_k') document.getElementById('v-muk').innerText = state.mu_k.toFixed(2);
}

function setMode_2_7(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('questions-section');
    const badge = document.getElementById('mastery-badge');

    if(state.level >= 6) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        document.querySelectorAll('.phys-slider').forEach(s => {
            s.disabled = false;
            s.style.opacity = "1.0";
        });
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_7(); 
    }
}

function updateLocks_2_7() {
    let lockM = (state.level < 1);
    let lockMu = (state.level < 2);
    
    if(state.mode === 'challenge' || state.level >= 2) { lockM = false; lockMu = false; }

    let setLock = (id, locked) => {
        let el = document.getElementById(id);
        if(el) {
            el.disabled = locked;
            el.style.opacity = locked ? "0.4" : "1.0";
            el.style.cursor = locked ? "not-allowed" : "pointer";
        }
    };
    setLock('in-m', lockM);
    setLock('in-mus', lockMu);
    setLock('in-muk', lockMu);
}

function checkAnswer_2_7(qIdx) {
    let val = parseFloat(document.getElementById('ans-'+qIdx).value);
    let correct = false;
    let feedback = "";
    let tol = 0.5;

    if(qIdx === 0) { 
        let target = state.mu_s * state.m * 9.8;
        if(Math.abs(val - target) < tol) correct = true;
    } 
    else if(qIdx === 1) { 
        let target = state.mu_k * state.m * 9.8;
        if(Math.abs(val - target) < tol) correct = true;
    }
    else if(qIdx === 2) { 
        let fk = state.mu_k * state.m * 9.8;
        let target = (state.Fa - fk) / state.m;
        if(state.Fa <= state.mu_s * state.m * 9.8) target = 0;
        if(Math.abs(val - target) < 0.2) correct = true;
    }
    else if(qIdx === 3) { 
        let target = state.mu_k * state.m * 9.8;
        if(Math.abs(val - target) < tol) correct = true;
    }
    else if(qIdx === 4) { 
        let fk = state.mu_k * state.m * 9.8;
        let target = (state.Fa - fk) / state.m;
        if(Math.abs(state.v) < 0.01) feedback = " (Get it moving first!)";
        else if(Math.abs(val - target) < 0.2) correct = true;
    }
    else if(qIdx === 5) { 
        if(Math.abs(state.v) > 0.01) feedback = " (Stop the block first!)";
        else {
            let fsMax = state.mu_s * state.m * 9.8;
            if(state.Fa > fsMax) feedback = " (It's slipping! Lower the force.)";
            else {
                let target = state.Fa;
                let trap = fsMax;
                if(Math.abs(val - trap) < tol && Math.abs(val - target) > tol) 
                    feedback = " (Careful! Is it at the limit?)";
                else if(Math.abs(val - target) < tol) correct = true;
            }
        }
    }

    let fbEl = document.getElementById('fb-'+qIdx);
    if(correct) {
        fbEl.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        if(state.level === qIdx) {
            state.level++;
            saveProgress('2.7', state.level); // Updated ID
        }
        if(state.level >= 6) {
            document.getElementById('mastery-badge').style.display = 'block';
        }
        setTimeout(renderQuestions_2_7, 1500); 
    } else {
        fbEl.innerHTML = "<span style='color:red'>Try again." + feedback + "</span>";
    }
}

function renderQuestions_2_7() {
    let div = document.getElementById('questions-section');
    let pStyle = "margin:10px 0; line-height:1.6;";
    let hStyle = "margin:0 0 10px 0; font-size:1.1rem;";
    let inputStyle = "width:100px; padding:5px; margin-right:10px;";
    let btnStyle = "padding:5px 15px;";
    
    // Helper for variable styling
    const v = (text) => `<i class="var">${text}</i>`;
    
    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="${hStyle}">Level 1: Static Limits</h4>
            <p style="${pStyle}">
                Current Mass: <b>${state.m} kg</b> | ${v('&mu;')}<sub>s</sub>: <b>${state.mu_s}</b>
            </p>
            <p style="${pStyle}">Calculate the <b>Maximum Static Friction</b> force possible before it slips.</p>
            <div style="margin-top:15px;">
                <input type="number" id="ans-0" placeholder="Newtons" style="${inputStyle}" 
                    onkeydown="if(event.key==='Enter') checkAnswer_2_7(0)">
                <button class="btn btn-green" style="${btnStyle}" onclick="checkAnswer_2_7(0)">Check</button>
            </div>
            <span id="fb-0" style="display:block; margin-top:10px;"></span>
            <p style="font-size:0.85em; color:#666; margin-top:15px;"><i>Reward: Unlock Mass Slider</i></p>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="${hStyle}">Level 2: Kinetic Friction</h4>
            <p style="${pStyle}">
                Current Mass: <b>${state.m} kg</b> | ${v('&mu;')}<sub>k</sub>: <b>${state.mu_k}</b>
            </p>
            <p style="${pStyle}">If the block is sliding, what is the constant <b>Kinetic Friction</b> force?</p>
            <div style="margin-top:15px;">
                <input type="number" id="ans-1" placeholder="Newtons" style="${inputStyle}"
                    onkeydown="if(event.key==='Enter') checkAnswer_2_7(1)">
                <button class="btn btn-green" style="${btnStyle}" onclick="checkAnswer_2_7(1)">Check</button>
            </div>
            <span id="fb-1" style="display:block; margin-top:10px;"></span>
            <p style="font-size:0.85em; color:#666; margin-top:15px;"><i>Reward: Unlock All Coefficients</i></p>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="${hStyle}">Level 3: Newton's 2nd Law</h4>
            <p style="${pStyle}">Set ${v('F')}<sub>app</sub> to <b>${state.Fa} N</b>.</p>
            <p style="${pStyle}">Based on current Mass and ${v('&mu;')}<sub>k</sub>, calculate the <b>Acceleration</b>.</p>
            <div style="margin-top:15px;">
                <input type="number" id="ans-2" placeholder="m/s²" style="${inputStyle}"
                    onkeydown="if(event.key==='Enter') checkAnswer_2_7(2)">
                <button class="btn btn-green" style="${btnStyle}" onclick="checkAnswer_2_7(2)">Check</button>
            </div>
            <span id="fb-2" style="display:block; margin-top:10px;"></span>
            <p style="font-size:0.85em; color:#666; margin-top:15px;"><i>Reward: Unlock Full Version</i></p>
        `;
    } 
    else if(state.level === 3) {
        div.innerHTML = `
            <h4 style="color:#d35400; ${hStyle}">AP Mastery Q1: Constant Velocity</h4>
            <p style="${pStyle}">Adjust ${v('F')}<sub>app</sub> so the block moves at <b>constant velocity</b> (${v('a')} = 0).</p>
            <p style="${pStyle}">What Applied Force is required?</p>
             <div style="margin-top:15px;">
                <input type="number" id="ans-3" placeholder="Newtons" style="${inputStyle}"
                    onkeydown="if(event.key==='Enter') checkAnswer_2_7(3)">
                <button class="btn btn-green" style="${btnStyle}" onclick="checkAnswer_2_7(3)">Check</button>
            </div>
            <span id="fb-3" style="display:block; margin-top:10px;"></span>
        `;
    } else if(state.level === 4) {
            div.innerHTML = `
            <h4 style="color:#d35400; ${hStyle}">AP Mastery Q2: The Brakes</h4>
            <p style="${pStyle}">Get the block moving, then increase ${v('&mu;')}<sub>k</sub> so friction is larger than ${v('F')}<sub>app</sub>.</p>
            <p style="${pStyle}">Calculate the <b>deceleration</b> (negative acceleration) at this moment.</p>
                <div style="margin-top:15px;">
                <input type="number" id="ans-4" placeholder="m/s²" style="${inputStyle}"
                    onkeydown="if(event.key==='Enter') checkAnswer_2_7(4)">
                <button class="btn btn-green" style="${btnStyle}" onclick="checkAnswer_2_7(4)">Check</button>
            </div>
            <span id="fb-4" style="display:block; margin-top:10px;"></span>
        `;
    } else if(state.level === 5) {
            div.innerHTML = `
            <h4 style="color:#c0392b; ${hStyle}">AP Mastery Q3: The Static Trap</h4>
            <p style="${pStyle}"><b>Stop the block.</b> Set ${v('&mu;')}<sub>s</sub> = ${state.mu_s}. Set ${v('F')}<sub>app</sub> to <b>10 N</b>.</p>
            <p style="${pStyle}">What is the exact magnitude of the <b>Friction Force</b>?</p>
                <div style="margin-top:15px;">
                <input type="number" id="ans-5" placeholder="Newtons" style="${inputStyle}"
                    onkeydown="if(event.key==='Enter') checkAnswer_2_7(5)">
                <button class="btn btn-green" style="${btnStyle}" onclick="checkAnswer_2_7(5)">Check</button>
            </div>
            <span id="fb-5" style="display:block; margin-top:10px;"></span>
            <p style="font-size:0.85em; color:#666; margin-top:15px;"><i>Hint: Check the "Impossible Zone"</i></p>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; AP PHYSICS MASTER &#9733;</h3>
            <p style="${pStyle}">You have completed all challenges. You understand the difference between static limits, kinetic constant, and Newton's laws!</p>
        `;
    }
}

function reset_2_7() {
    document.getElementById('in-m').value = "5.0";
    document.getElementById('in-fa').value = "0";
    document.getElementById('in-mus').value = "0.6";
    document.getElementById('in-muk').value = "0.4";
    document.querySelector('input[name="spd"][value="1"]').checked = true;

    document.getElementById('v-m').innerText = "5.0";
    document.getElementById('v-fa').innerText = "0";
    document.getElementById('v-mus').innerText = "0.6";
    document.getElementById('v-muk').innerText = "0.4";

    state = {
        Fa: 0, 
        m: 5.0, 
        mu_s: 0.6, 
        mu_k: 0.4,
        v: 0, x: 0,
        graphData: [],
        running: true,
        lastFa: -1,
        lastFriction: -1, 
        timeScale: 1,
        maxFriction: 100,
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: 0 
    };
    
    setMode_2_7(state.mode);
    loop_2_7(); 
}

function loop_2_7() {
    if(currentSim !== '2.7') return; 
    
    document.getElementById('v-fa').innerText = state.Fa;
    
    let Fn = state.m * 9.8;
    let fs_max = state.mu_s * Fn;
    let fk = state.mu_k * Fn;
    
    let friction = 0;
    let Fnet = 0;
    
    if (Math.abs(state.v) < 0.001) {
        let limit = Math.max(fs_max, fk); 
        
        if (state.Fa <= limit) {
            friction = state.Fa; 
            Fnet = 0;
            state.v = 0;
            
            document.getElementById('out-stat').innerText = "Static (Stuck)";
            document.getElementById('out-stat').style.color = "#c0392b";
            document.getElementById('out-f-label').innerHTML = "f<sub>s</sub>"; 
        } else {
            state.v = 0.01; 
            friction = fk; 
        }
    } else {
        friction = fk; 
        
        if (state.Fa < fk) Fnet = state.Fa - fk;
        else Fnet = state.Fa - fk;
        
        document.getElementById('out-stat').innerText = "Kinetic (Sliding)";
        document.getElementById('out-stat').style.color = "#27ae60";
        document.getElementById('out-f-label').innerHTML = "f<sub>k</sub>"; 
        
        let a = Fnet / state.m;
        let dt = 0.1 * state.timeScale; 
        state.v += a * dt; 
        state.x += state.v * dt;
        
        if (state.v <= 0) {
            state.v = 0;
            if (state.Fa <= fs_max || state.Fa <= fk) {
                friction = state.Fa; 
                Fnet = 0;            
                document.getElementById('out-stat').innerText = "Static (Stuck)";
                document.getElementById('out-stat').style.color = "#c0392b";
                document.getElementById('out-f-label').innerHTML = "f<sub>s</sub>"; 
            }
        }
    }
    
    let isMoving = (Math.abs(state.v) > 0.001);
    let isGuided = (state.mode === 'guided');
    
    let applyLock = (id, isLocked) => {
        let el = document.getElementById(id);
        if(!el) return;
        el.disabled = isLocked;
        el.style.opacity = isLocked ? "0.4" : "1.0";
        el.style.cursor = isLocked ? "not-allowed" : "pointer";
    };

    if(isGuided) {
        let lockM = isMoving || (state.level < 1);
        applyLock('in-m', lockM);
        let lockMu = isMoving || (state.level < 2);
        applyLock('in-mus', lockMu);
        applyLock('in-muk', lockMu);
        
    } else {
        applyLock('in-m', false);
        applyLock('in-mus', false);
        applyLock('in-muk', false);
    }

    document.getElementById('out-ff').innerText = friction.toFixed(1);
    
    let getFs = (val, max) => {
        let s = 14 + (Math.abs(val) / max) * 20; 
        if(s > 34) s = 34;
        return s + "px";
    };

    let sizeFa = getFs(state.Fa, 100);
    let sizeFf = getFs(friction, 100);
    
    let fricVar = (Math.abs(state.v) < 0.001) ? "f<sub>s</sub>" : "f<sub>k</sub>";
    const subStyle = 'font-size:0.75em; vertical-align:-0.25em;';

    let htmlX = `&Sigma;<i>F</i><span style="${subStyle}">x</span> &nbsp;=&nbsp;&nbsp; 
        <span style="font-size:${sizeFa}; font-weight:bold; color:black; transition: font-size 0.1s;">F<sub>app</sub></span> 
        &nbsp;&nbsp;&minus;&nbsp;&nbsp; 
        <span style="font-size:${sizeFf}; font-weight:bold; color:#c0392b; transition: font-size 0.1s;">${fricVar}</span> 
        &nbsp;&nbsp;=&nbsp;&nbsp; ${Fnet.toFixed(1)} N`;
    document.getElementById('eq-x').innerHTML = htmlX;

    let sizeFy = getFs(state.m, 10); 
    let htmlY = `&Sigma;<i>F</i><span style="${subStyle}">y</span> &nbsp;=&nbsp;&nbsp; 
        <span style="font-size:${sizeFy}; font-weight:bold; color:blue; transition: font-size 0.1s;">F<sub>n</sub></span> 
        &nbsp;&nbsp;&minus;&nbsp;&nbsp; 
        <span style="font-size:${sizeFy}; font-weight:bold; color:green; transition: font-size 0.1s;">F<sub>g</sub></span> 
        &nbsp;&nbsp;=&nbsp;&nbsp; 0`;
    document.getElementById('eq-y').innerHTML = htmlY;

    if(state.Fa !== state.lastFa || Math.abs(friction - state.lastFriction) > 0.1) {
            state.graphData.push({x: state.Fa, y: friction});
            state.lastFa = state.Fa;
            state.lastFriction = friction;
    }
    
    draw_2_7(friction, Fn, (Math.abs(state.v) < 0.001 ? "static" : "kinetic"), fk, fs_max);
    animId = requestAnimationFrame(loop_2_7);
}

function draw_2_7(fVal, Fn, status, fk, fs_max) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let floorY = 215; 
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,canvas.width,floorY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0,floorY,canvas.width,140); 
    
    let drawX = 150 + (state.x % 400); 
    let size = 30 + state.m * 4; 
    let by = floorY - size;
    
    ctx.fillStyle = "#e67e22"; ctx.fillRect(drawX, by, size, size);
    ctx.strokeStyle = "#d35400"; ctx.lineWidth=2; ctx.strokeRect(drawX, by, size, size);
    ctx.fillStyle = "white"; ctx.font = "bold 12px serif"; ctx.textAlign="center";
    ctx.fillText(state.m+"kg", drawX + size/2, by + size/2 + 4);

    let cx = drawX + size/2;
    let cy = by + size/2;
    
    let vectorScale = 1.2; 
    
    function drawLabel(main, sub, x, y, color) {
        ctx.fillStyle = color;
        ctx.font = "bold 14px serif";
        let mw = ctx.measureText(main).width;
        ctx.fillText(main, x, y);
        ctx.font = "bold 10px serif";
        ctx.fillText(sub, x + mw, y + 5);
    }

    let fgLen = (state.m * 9.8) * vectorScale; 
    drawVector(cx, floorY, 0, fgLen, "green"); 
    drawLabel("F", "g", cx+5, floorY + fgLen + 10, "black");

    let fnLen = fgLen; 
    drawVector(cx, by, 0, -fnLen, "blue");
    drawLabel("F", "n", cx+5, by - fnLen - 5, "black");

    if(state.Fa > 0) {
        let faLen = state.Fa * 1.5; 
        drawVector(cx + size/2, cy, faLen, 0, "black");
        drawLabel("F", "app", cx + size/2 + faLen + 10, cy+4, "black");
    }

    if(fVal > 0) {
        let fLen = fVal * 1.5;
        drawVector(cx - size/2, cy, -fLen, 0, "red");
        let labelChar = (status === 'static') ? "s" : "k";
        let labelX = cx - size/2 - fLen - 20;
        let labelY = cy+4;
        drawLabel("f", labelChar, labelX, labelY, "black");
    }

    let bubbleX = 80; 
    let bubbleY = 135; 
    let r = 40;
    ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth=1; ctx.setLineDash([2,2]);
    ctx.beginPath(); ctx.moveTo(bubbleX, bubbleY + r); ctx.lineTo(drawX + size/2, floorY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(bubbleX, bubbleY, r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#333"; ctx.lineWidth=3; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.rect(bubbleX-r, bubbleY-r, 2*r, 2*r); ctx.clip(); 
    ctx.strokeStyle = "#e67e22"; ctx.lineWidth=3; 
    let offset = (state.x * 20) % 20; 
    ctx.beginPath();
    for(let i=-r; i<r; i+=10) { ctx.lineTo(bubbleX + i - offset, bubbleY - 5); ctx.lineTo(bubbleX + i + 5 - offset, bubbleY + 5); } ctx.stroke();
    ctx.strokeStyle = "#7f8c8d"; 
    ctx.beginPath();
    for(let i=-r; i<r; i+=10) { ctx.lineTo(bubbleX + i, bubbleY + 2); ctx.lineTo(bubbleX + i + 5, bubbleY + 12); } ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "#555"; ctx.font="10px sans-serif";
    ctx.fillText("Microscopic", bubbleX, bubbleY - r - 5);

    // --- GRAPH ADJUSTMENT: gy = 382 ---
    // This provides a safe gap from the vectors above and keeps the footer visible.
    let gy = 382; 
    let gh = 220; 
    let gx = 50; let gw = 600; 
    
    ctx.fillStyle = "white"; ctx.fillRect(0, gy, canvas.width, 258); // Clear to bottom
    
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh); 
    ctx.lineTo(gx, gy);      
    ctx.lineTo(gx + gw, gy); 
    ctx.closePath();
    ctx.fillStyle = "rgba(127, 140, 141, 0.15)"; 
    ctx.fill();
    
    ctx.save();
    ctx.translate(gx + gw/4, gy + gh/2.2); 
    let angle = Math.atan2(-gh, gw);
    ctx.rotate(angle); 
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(127, 140, 141, 0.8)"; 
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Impossible Region", 0, 0);
    ctx.font = "italic 12px sans-serif";
    ctx.fillText("(static)", 0, 15); 
    ctx.restore();

    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1; ctx.strokeRect(gx, gy, gw, gh);
    
    ctx.fillStyle = "#2c3e50"; ctx.font = "bold 14px Sans-Serif"; ctx.textAlign = "center";
    ctx.fillText("Friction Force vs. Applied Force", gx + gw/2, gy - 5);
    
    ctx.font = "italic 13px Serif";
    ctx.fillText("Applied Force (0 - 100N)", gx + gw/2, gy + gh + 20);
    
    ctx.save(); ctx.translate(15, gy + gh/2); ctx.rotate(-Math.PI/2); ctx.fillText("Friction (0 - 100N)", 0, 0); ctx.restore();

    let maxFric = state.maxFriction; 
    let fkY = (gy + gh) - (fk / maxFric) * gh;
    ctx.strokeStyle = "#27ae60"; ctx.setLineDash([5,5]); ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(gx, fkY); ctx.lineTo(gx+gw, fkY); ctx.stroke();
    ctx.fillStyle = "#27ae60"; ctx.textAlign="right"; ctx.font="12px sans-serif";
    ctx.fillText("Kinetic (" + fk.toFixed(1) + "N)", gx + gw - 5, fkY - 5);

    let fsY = (gy + gh) - (fs_max / maxFric) * gh;
    ctx.strokeStyle = "#95a5a6"; ctx.setLineDash([5,5]); ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(gx, fsY); ctx.lineTo(gx+gw, fsY); ctx.stroke();
    ctx.fillStyle = "#7f8c8d"; ctx.textAlign="right";
    ctx.fillText("Max Static (" + fs_max.toFixed(1) + "N)", gx + gw - 5, fsY - 5);
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.strokeStyle = "#c0392b"; ctx.lineWidth=3;
    let maxFa = 100; 
    state.graphData.forEach((p, i) => {
        let plotX = gx + (p.x / maxFa) * gw;
        let plotY = (gy + gh) - (p.y / maxFric) * gh;
        if(i===0) ctx.moveTo(plotX, plotY); else ctx.lineTo(plotX, plotY);
    });
    ctx.stroke();
    
    if(state.graphData.length > 0) {
        let last = state.graphData[state.graphData.length-1];
        let dotX = gx + (last.x / maxFa) * gw;
        let dotY = (gy + gh) - (last.y / maxFric) * gh;
        ctx.fillStyle = "black"; ctx.beginPath(); ctx.arc(dotX, dotY, 4, 0, Math.PI*2); ctx.fill();
    }
}

// ===============================================
// === UNIT 2.8: UNIFORM CIRCULAR MOTION (Gold Standard v4.6) ===
// ===============================================

function setup_2_8() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "2.8 Uniform Circular Motion";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Centripetal Force</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        To move in a circle, a net force must pull <b>inward</b> toward the center.
        <br><b>Equation:</b> <i class="var">F<sub>c</sub></i> = <i class="var">m v</i>² / <i class="var">r</i>
        <br><i><b>Mission:</b> Spin the puck without breaking the string!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_8('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_8('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u2-8-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> SPIN DOCTOR
            </div>
        </div>

        <div id="calc-2-8" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">2.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="1.0" max="10.0" step="0.5" value="2.0" 
                oninput="updateState_2_8('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Velocity (<i class="var">v</i>):</span>
                <span><span id="v-v">5.0</span> m/s</span>
            </label>
            <input type="range" id="in-v" class="phys-slider" min="1.0" max="15.0" step="0.5" value="5.0" 
                oninput="updateState_2_8('v', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Radius (<i class="var">r</i>):</span>
                <span><span id="v-r">2.0</span> m</span>
            </label>
            <input type="range" id="in-r" class="phys-slider" min="1.0" max="5.0" step="0.5" value="2.0" 
                oninput="updateState_2_8('r', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_2_8()" id="btn-start">Spin</button>
            <button class="btn btn-red" onclick="reset_2_8()">Reset</button>
        </div>
        
        <div id="u2-8-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_2_8();
}

function updateState_2_8(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    if(key === 'v') document.getElementById('v-v').innerText = state.v.toFixed(1);
    if(key === 'r') document.getElementById('v-r').innerText = state.r.toFixed(1);
    
    // Recalc Physics
    calcPhysics_2_8();
    updateCalcDisplay_2_8();
    draw_2_8();
}

function setMode_2_8(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u2-8-questions');
    const badge = document.getElementById('u2-8-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_8();
    }
    updateLocks_2_8();
    draw_2_8();
    updateCalcDisplay_2_8();
}

function updateLocks_2_8() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        // Unlock R slider in level 3 (mystery) if needed, but normally we lock all while running
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_2_8() {
    state.fc = (state.m * state.v * state.v) / state.r;
}

function updateCalcDisplay_2_8() {
    let box = document.getElementById('calc-2-8');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    // Formatting
    let fcVal = state.fc.toFixed(1);
    let rVal = state.isMystery ? "?" : state.r.toFixed(1);
    
    box.innerHTML = `
        <div style="margin-bottom:10px;">
            <div style="margin-bottom:4px; color:#555;">Centripetal Force (Tension):</div>
            <div style="font-size:1.1em;">
                ${v('F<sub>c</sub>')} = ${v('mv²')} / ${v('r')} = <b>${fcVal}</b> N
            </div>
        </div>
        <div style="font-size:0.9em; color:#777;">
            ${state.m.toFixed(1)}kg &times; (${state.v.toFixed(1)}m/s)² / ${rVal}m
        </div>
    `;
}

function start_2_8() {
    if(!state.running) {
        state.running = true;
        state.theta = 0;
        state.history = []; 
        
        calcPhysics_2_8();
        updateLocks_2_8();
        loop_2_8();
    }
}

function reset_2_8() {
    let savedLevel = loadProgress('2.8'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        v: parseFloat(document.getElementById('in-v').value),
        r: parseFloat(document.getElementById('in-r').value),
        
        theta: 0,
        t: 0,
        history: [],
        running: false,
        isMystery: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Mystery Mode (Level 3)
    if(state.mode === 'guided' && state.level === 2) {
        state.isMystery = true;
        state.r = 3.5; // Fixed secret radius
        
        let rSlider = document.getElementById('in-r');
        rSlider.disabled = true;
        rSlider.parentElement.style.opacity = "0.5";
        document.getElementById('v-r').innerText = "???";
    } else {
        let rSlider = document.getElementById('in-r');
        rSlider.disabled = false;
        rSlider.parentElement.style.opacity = "1.0";
    }
    
    calcPhysics_2_8();

    if(state.level >= 3) document.getElementById('u2-8-badge').style.display = 'block';

    setMode_2_8(state.mode);
    updateCalcDisplay_2_8();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_2_8();
        });
    });
}

function loop_2_8() {
    if(currentSim !== '2.8') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // Angular Velocity w = v/r
        let w = state.v / state.r;
        state.theta += w * dt;
        
        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                fc: state.fc
            });
        }
        
        // Stop Condition (Time or Break)
        // Check if string breaks (e.g. Tension > 150N for Level 2)
        // We'll handle breakage visually but not force stop unless gamified
        
        if(state.t > 10.0) {
            state.running = false;
            // Ghost State
            state.history.push({t: state.t, fc: state.fc});
            
            if(state.mode === 'guided') checkLevel_2_8();
            updateLocks_2_8();
        }
    }

    draw_2_8();
    
    if(state.running) requestAnimationFrame(loop_2_8);
}

function draw_2_8() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 350px) ===
    let worldH = 350; 
    let pxPerM = 30; // 1m = 30px
    let centerX = 350; 
    let centerY = 175;
    
    // Table Background
    ctx.fillStyle = "#2c3e50"; ctx.fillRect(0,0,700, worldH);
    
    // Grid (Faint)
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth=1;
    for(let i=0; i<700; i+=pxPerM) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i, worldH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(700,i); ctx.stroke();
    }
    
    // Center Pin
    ctx.fillStyle = "#bdc3c7"; ctx.beginPath(); ctx.arc(centerX, centerY, 8, 0, Math.PI*2); ctx.fill();
    
    // Puck Calculation
    let puckX = centerX + state.r * pxPerM * Math.cos(state.theta);
    let puckY = centerY + state.r * pxPerM * Math.sin(state.theta);
    
    // String
    ctx.strokeStyle = "#ecf0f1"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(puckX, puckY); ctx.stroke();
    
    // Puck
    ctx.fillStyle = "#e67e22"; 
    ctx.beginPath(); ctx.arc(puckX, puckY, 15, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#d35400"; ctx.lineWidth=2; ctx.stroke();
    
    // Mass Label
    ctx.fillStyle = "white"; ctx.font = "bold 10px sans-serif"; ctx.textAlign="center";
    ctx.fillText(state.m.toFixed(0)+"kg", puckX, puckY + 4);
    
    // VECTORS
    // 1. Centripetal Force (Blue, Inward)
    // Direction is opposite to radius vector
    let angleIn = state.theta + Math.PI;
    let fcScale = 1.0; // Visual scale
    let fcLen = Math.min(80, state.fc * fcScale);
    drawVector_2_8(puckX, puckY, fcLen * Math.cos(angleIn), fcLen * Math.sin(angleIn), "#2980b9", "F_c");
    
    // 2. Velocity (Green, Tangent)
    // Tangent is +90 deg from radius
    let angleTan = state.theta + Math.PI/2;
    let vScale = 8.0; 
    let vLen = state.v * vScale;
    drawVector_2_8(puckX, puckY, vLen * Math.cos(angleTan), vLen * Math.sin(angleTan), "#27ae60", "v");


    // === ZONE 2: GRAPH (Bottom 290px) ===
    let panelY = 350;
    let panelH = 290;
    
    ctx.fillStyle = "white"; ctx.fillRect(0, panelY, 700, panelH);
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0, panelY); ctx.lineTo(700, panelY); ctx.stroke();
    
    // Draw Tension vs Time
    // Max tension roughly 150-200 N
    drawMiniGraph_2_8(50, panelY + 20, 600, 250, state.history, 'fc', [0, 200], "Tension (N)");
}

function drawVector_2_8(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(dy, dx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        let parts = label.split('_');
        let main = parts[0];
        let sub = parts[1] || "";
        
        ctx.font = "bold 14px serif";
        let lblX = endX + (dx>0 ? 5 : -25);
        let lblY = endY + (dy>0 ? 15 : -5);
        ctx.fillText(main, lblX, lblY);
        if(sub) {
            ctx.font = "bold 10px serif";
            ctx.fillText(sub, lblX + ctx.measureText(main).width, lblY + 5);
        }
    }
}

function drawMiniGraph_2_8(x, y, w, h, data, key, range, label) {
    // Axis
    ctx.strokeStyle = "#333"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y+h); ctx.lineTo(x+w, y+h); ctx.stroke();
    
    // Label
    ctx.fillStyle = "#333"; ctx.textAlign = "center"; ctx.font = "bold 12px sans-serif";
    ctx.save(); ctx.translate(x-30, y+h/2); ctx.rotate(-Math.PI/2); ctx.fillText(label, 0, 0); ctx.restore();
    ctx.fillText("Time (s)", x+w/2, y+h+20);
    
    // Scale
    ctx.textAlign = "right"; ctx.font = "10px sans-serif";
    ctx.fillText(range[1], x-5, y+10);
    ctx.fillText(range[0], x-5, y+h);
    
    if(data.length > 0) {
        let tMax = 10.0;
        let pxPerVal = h / range[1];
        
        ctx.beginPath(); ctx.strokeStyle = "#2980b9"; ctx.lineWidth = 2;
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            if(val > range[1]) val = range[1];
            
            let px = x + (p.t / tMax) * w;
            let py = (y + h) - (val * pxPerVal);
            if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}

function renderQuestions_2_8() {
    let div = document.getElementById('u2-8-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Tension Calculation</h4>
            <p>Set ${v('m')} = <b>2.0 kg</b>, ${v('r')} = <b>2.0 m</b>.</p>
            <p>Spin it at ${v('v')} = <b>4.0 m/s</b>.</p>
            <p>Calculate the Centripetal Force (Tension).</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_8(0)"> 
                <button onclick="checkAnswer_2_8(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Breaking Point</h4>
            <p>The string breaks at <b>100 N</b>.</p>
            <p>Set ${v('m')} = <b>5.0 kg</b>, ${v('r')} = <b>2.0 m</b>.</p>
            <p>What is the maximum speed ${v('v')} before it breaks?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_8(1)"> 
                <button onclick="checkAnswer_2_8(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Mystery Radius</h4>
            <p>I have hidden the radius value.</p>
            <p>Set ${v('m')} = <b>4.0 kg</b>, ${v('v')} = <b>5.0 m/s</b>.</p>
            <p>Spin the puck. Read the Force from the panel.</p>
            <p>Calculate the hidden radius ${v('r')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="meters" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_8(2)"> 
                <button onclick="checkAnswer_2_8(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; SPIN DOCTOR &#9733;</h3>
            <p>You have mastered Uniform Circular Motion!</p>
        `;
    }
}

function checkAnswer_2_8(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // Fc = 2 * 16 / 2 = 16 N
        if(state.m === 2.0 && state.r === 2.0 && state.v === 4.0 && Math.abs(val - 16.0) < 0.5) correct = true;
        else if(state.v !== 4.0 || state.m !== 2.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set the sliders to the correct values first!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // 100 = 5 * v^2 / 2  -> 200 = 5 v^2 -> 40 = v^2 -> v = sqrt(40) = 6.32
        if(state.m === 5.0 && state.r === 2.0 && Math.abs(val - 6.32) < 0.2) correct = true;
        else if(state.m !== 5.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Mass to 5.0 kg first!</span>`;
            return;
        }
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // Mystery r is set to 3.5 in reset_2_8
        if(Math.abs(val - 3.5) < 0.2) correct = true;
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('2.8', state.level);
            
            if(state.level >= 3) document.getElementById('u2-8-badge').style.display = 'block';
            renderQuestions_2_8();
            reset_2_8();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your math: ${v('F<sub>c</sub>')} = ${v('mv²')} / ${v('r')}</span>`;
    }
}

function checkLevel_2_8() {
}

// ===============================================
// === UNIT 2.9: VERTICAL CIRCULAR MOTION (Gold Standard v4.6) ===
// ===============================================

function setup_2_9() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "2.9 Vertical Circular Motion";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Fighting Gravity</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        In a vertical loop, Gravity helps you turn at the top but fights you at the bottom.
        <br><b>Equation:</b> <i class="var">F<sub>net</sub></i> = <i class="var">F<sub>T</sub></i> &pm; <i class="var">mg</i> = <i class="var">mv</i>²/<i class="var">r</i>
        <br><i><b>Mission:</b> Maintain circular motion despite the changing weight!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_2_9('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_2_9('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u2-9-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> LOOP MASTER
            </div>
        </div>

        <div id="calc-2-9" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">5.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="1.0" max="10.0" step="0.5" value="5.0" 
                oninput="updateState_2_9('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Velocity (<i class="var">v</i>):</span>
                <span><span id="v-v">8.0</span> m/s</span>
            </label>
            <input type="range" id="in-v" class="phys-slider" min="2.0" max="15.0" step="0.5" value="8.0" 
                oninput="updateState_2_9('v', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Radius (<i class="var">r</i>):</span>
                <span><span id="v-r">3.0</span> m</span>
            </label>
            <input type="range" id="in-r" class="phys-slider" min="1.0" max="5.0" step="0.5" value="3.0" 
                oninput="updateState_2_9('r', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_2_9()" id="btn-start">Start Loop</button>
            <button class="btn btn-red" onclick="reset_2_9()">Reset</button>
        </div>
        
        <div id="u2-9-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_2_9();
}

function updateState_2_9(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    if(key === 'v') document.getElementById('v-v').innerText = state.v.toFixed(1);
    if(key === 'r') document.getElementById('v-r').innerText = state.r.toFixed(1);
    
    calcPhysics_2_9();
    updateCalcDisplay_2_9();
    draw_2_9();
}

function setMode_2_9(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u2-9-questions');
    const badge = document.getElementById('u2-9-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_2_9();
    }
    updateLocks_2_9();
    draw_2_9();
    updateCalcDisplay_2_9();
}

function updateLocks_2_9() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_2_9() {
    let g = 9.8;
    // Calculate required Centripetal Force (Constant if Uniform)
    state.fc = (state.m * state.v * state.v) / state.r;
    
    // Calculate Forces at specific points for Preview
    state.fg = state.m * g;
    state.ft_bottom = state.fc + state.fg; // At bottom, Tension must support weight + turn
    state.ft_top = state.fc - state.fg;    // At top, Gravity helps turn
}

function updateCalcDisplay_2_9() {
    let box = document.getElementById('calc-2-9');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    // Determine position description
    let posText = "Ready";
    if(state.theta !== undefined) {
        // Normalize angle 0-2PI
        let ang = state.theta % (Math.PI*2);
        if(ang < 0) ang += Math.PI*2;
        
        // Bottom is PI/2, Top is 3PI/2 in canvas coord? 
        // Let's rely on draw logic: (0,0) center. 
        // We'll calculate current T live in loop, but here show static info
    }

    let fcVal = state.fc.toFixed(1);
    
    box.innerHTML = `
        <div style="margin-bottom:10px;">
            <div style="margin-bottom:4px; color:#555;">Required Centripetal Force:</div>
            <div style="font-size:1.1em;">
                ${v('F<sub>net</sub>')} = ${v('mv²')} / ${v('r')} = <b>${fcVal}</b> N
            </div>
        </div>
        <div style="font-size:0.9em; color:#777;">
            ${v('F<sub>g</sub>')} = <b>${state.fg.toFixed(1)}</b> N (Constant)
        </div>
    `;
}

function start_2_9() {
    if(!state.running) {
        state.running = true;
        state.theta = Math.PI / 2; // Start at bottom (90 deg in canvas, y is down)
        state.history = []; 
        
        calcPhysics_2_9();
        updateLocks_2_9();
        loop_2_9();
    }
}

function reset_2_9() {
    let savedLevel = loadProgress('2.9'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        v: parseFloat(document.getElementById('in-v').value),
        r: parseFloat(document.getElementById('in-r').value),
        
        theta: Math.PI / 2, // Start at bottom
        t: 0,
        history: [],
        running: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    calcPhysics_2_9();

    if(state.level >= 3) document.getElementById('u2-9-badge').style.display = 'block';

    setMode_2_9(state.mode);
    updateCalcDisplay_2_9();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_2_9();
        });
    });
}

function loop_2_9() {
    if(currentSim !== '2.9') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // Angular Velocity w = v/r
        let w = state.v / state.r;
        state.theta += w * dt; // Clockwise
        
        // Calculate Instantaneous Tension
        // Angle definition: Canvas Y is down. 
        // Center (0,0). Bottom is (0, r). Angle = PI/2.
        // Gravity acts in +Y direction.
        // Radial vector points from Center TO Mass.
        // F_net_radial = F_c (Inward).
        // Forces along radial line: T (Inward) + Fg_radial (Outward/Inward) = F_c
        
        // Let's project Gravity onto radius.
        // Radius vector unit: (cos(theta), sin(theta))
        // Gravity vector: (0, mg)
        // Dot product = mg * sin(theta) => Component along radius (Outward positive?)
        // Wait, standard angle 0 is Right. PI/2 is Bottom.
        // At Bottom (PI/2): sin(PI/2) = 1. Gravity is along radius, OUTWARD from center.
        // At Top (3PI/2): sin(3PI/2) = -1. Gravity is INWARD to center.
        
        // Newton 2: F_in - F_out = ma_c
        // T + (Gravity Inward Component) = F_c
        // Gravity Inward = -mg * sin(theta)  (Because +sin is down/outward)
        
        // T - mg*sin(theta) = F_c
        // T = F_c + mg*sin(theta)
        
        state.currentT = state.fc + state.fg * Math.sin(state.theta);
        
        // If speed is too low at top, T becomes negative (string slack)
        if(state.currentT < 0) state.currentT = 0; // Slack string
        
        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                ft: state.currentT
            });
        }
        
        if(state.t > 10.0) {
            state.running = false;
            // Ghost State
            state.history.push({t: state.t, ft: state.currentT});
            
            if(state.mode === 'guided') checkLevel_2_9();
            updateLocks_2_9();
        }
    }

    draw_2_9();
    
    if(state.running) requestAnimationFrame(loop_2_9);
}

function draw_2_9() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Left Side) ===
    // Side view of vertical circle
    let cx = 200; 
    let cy = 200;
    let pxPerM = 40; // 1m = 40px
    
    // Draw Stand
    ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, 400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-20, 400); ctx.lineTo(cx+20, 400); ctx.stroke();
    
    // Draw Path (Faint)
    ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(cx, cy, state.r * pxPerM, 0, Math.PI*2); ctx.stroke();
    
    // Pivot
    ctx.fillStyle = "#34495e"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2); ctx.fill();
    
    // Mass Position
    let mx = cx + state.r * pxPerM * Math.cos(state.theta);
    let my = cy + state.r * pxPerM * Math.sin(state.theta);
    
    // Rod/String
    ctx.strokeStyle = state.currentT === 0 ? "#e74c3c" : "#2c3e50"; // Red if slack
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx, my); ctx.stroke();
    
    // Mass
    ctx.fillStyle = "#e67e22"; 
    ctx.beginPath(); ctx.arc(mx, my, 12, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#d35400"; ctx.lineWidth=2; ctx.stroke();
    
    // VECTORS
    // 1. Gravity (Always Down)
    // Fixed scale
    let fScale = 0.5;
    drawVector_2_9(mx, my, 0, state.fg * fScale, "#27ae60", "mg");
    
    // 2. Tension (Always Inward)
    // Vector points from Mass to Center
    let angleToCenter = state.theta + Math.PI;
    let tLen = state.currentT !== undefined ? state.currentT * fScale : (state.fc + state.fg)*fScale; // Default to max for preview
    
    if(Math.abs(tLen) > 1) {
        drawVector_2_9(mx, my, tLen * Math.cos(angleToCenter), tLen * Math.sin(angleToCenter), "#2980b9", "F_T");
    }
    
    // 3. Net Force (Resultant) - Optional visual aid, maybe clutter?
    // Let's just stick to T and mg as requested "how T changes to compensate"


    // === ZONE 2: GRAPHS (Right Side) ===
    // Tension Gauge / Graph
    let panelX = 400;
    let panelY = 50;
    let panelW = 280;
    let panelH = 300;
    
    // Divider
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(350, 20); ctx.lineTo(350, 420); ctx.stroke();
    
    drawMiniGraph_2_9(panelX, panelY, panelW, panelH, state.history, 'ft', [0, 200], "Tension (N)");
}

function drawVector_2_9(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(dy, dx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        let parts = label.split('_');
        let main = parts[0];
        let sub = parts[1] || "";
        
        ctx.font = "bold 14px serif";
        let lblX = endX + (dx>0 ? 5 : -25);
        let lblY = endY + (dy>0 ? 15 : -5);
        ctx.fillText(main, lblX, lblY);
        if(sub) {
            ctx.font = "bold 10px serif";
            ctx.fillText(sub, lblX + ctx.measureText(main).width, lblY + 5);
        }
    }
}

function drawMiniGraph_2_9(x, y, w, h, data, key, range, label) {
    ctx.fillStyle = "white"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#333"; ctx.strokeRect(x,y,w,h);
    
    let midY = y + h - 20; 
    let pxPerVal = (h-40) / range[1];
    
    ctx.fillStyle = "#333"; ctx.textAlign = "right"; ctx.font = "10px sans-serif";
    ctx.fillText(label, x+w-5, y+15);
    ctx.fillText("Time", x+w-5, midY-5);
    
    // Y-Axis Ticks
    ctx.fillText(range[1], x-5, y+10);
    ctx.fillText("0", x-5, midY);
    
    if(data.length > 0) {
        let tMax = 10.0;
        
        ctx.beginPath(); ctx.strokeStyle = "#2980b9"; ctx.lineWidth = 2;
        for(let i=0; i<data.length; i++) {
            let p = data[i];
            let val = p[key];
            if(val > range[1]) val = range[1];
            if(val < 0) val = 0;
            
            let px = x + (p.t / tMax) * w;
            let py = midY - (val * pxPerVal);
            if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}

function renderQuestions_2_9() {
    let div = document.getElementById('u2-9-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: The Bottom (Max Load)</h4>
            <p>At the bottom, Tension must fight Gravity AND turn the mass.</p>
            <p>Set ${v('m')} = <b>5.0 kg</b>, ${v('v')} = <b>6.0 m/s</b>, ${v('r')} = <b>2.0 m</b>.</p>
            <p>Calculate Tension at the bottom: ${v('F<sub>T</sub>')} = ${v('F<sub>c</sub>')} + ${v('mg')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_9(0)"> 
                <button onclick="checkAnswer_2_9(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Top (Weightless?)</h4>
            <p>At the top, Gravity helps you turn.</p>
            <p>Keep the same settings (${v('m')}=5, ${v('v')}=6, ${v('r')}=2).</p>
            <p>Calculate Tension at the top: ${v('F<sub>T</sub>')} = ${v('F<sub>c</sub>')} - ${v('mg')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_9(1)"> 
                <button onclick="checkAnswer_2_9(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Critical Speed</h4>
            <p>If speed is too low, the string goes slack at the top (${v('F<sub>T</sub>')} = 0).</p>
            <p>This happens when ${v('F<sub>c</sub>')} = ${v('mg')}, or ${v('v')} = &radic;(${v('rg')}).</p>
            <p>Set ${v('r')} = <b>4.0 m</b>. What is the minimum speed to stay taut?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_2_9(2)"> 
                <button onclick="checkAnswer_2_9(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; LOOP MASTER &#9733;</h3>
            <p>You have conquered the vertical loop!</p>
        `;
    }
}

function checkAnswer_2_9(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // Fc = 5 * 36 / 2 = 90 N. Fg = 5 * 9.8 = 49 N. T = 139 N.
        if(state.m === 5.0 && state.v === 6.0 && state.r === 2.0 && Math.abs(val - 139) < 2.0) correct = true;
        else if(state.v !== 6.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Check your slider settings!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // Fc = 90. Fg = 49. T = 90 - 49 = 41 N.
        if(state.m === 5.0 && state.v === 6.0 && state.r === 2.0 && Math.abs(val - 41) < 2.0) correct = true;
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // v = sqrt(r*g) = sqrt(4 * 9.8) = sqrt(39.2) = 6.26
        if(state.r === 4.0 && Math.abs(val - 6.26) < 0.2) correct = true;
        else if (state.r !== 4.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Radius to 4.0 m!</span>`;
            return;
        }
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('2.9', state.level);
            
            if(state.level >= 3) document.getElementById('u2-9-badge').style.display = 'block';
            renderQuestions_2_9();
            reset_2_9();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your math!</span>`;
    }
}

function checkLevel_2_9() {
}

// ===============================================
// === UNIT 3.1: TRANSLATIONAL KINETIC ENERGY (Gold Standard v4.6) ===
// ===============================================

function setup_3_1() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "3.1 Translational Kinetic Energy";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Energy of Motion</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Moving objects possess Kinetic Energy ($K$). It depends on mass and the <b>square</b> of velocity.
        <br><b>Equation:</b> <i class="var">K</i> = &frac12;<i class="var">mv</i>²
        <br><i><b>Mission:</b> See how speed affects stopping distance!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_3_1('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_3_1('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u3-1-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> ENERGY EXPERT
            </div>
        </div>

        <div id="calc-3-1" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">1000</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="500" max="2000" step="100" value="1000" 
                oninput="updateState_3_1('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Velocity (<i class="var">v</i>):</span>
                <span><span id="v-v">10</span> m/s</span>
            </label>
            <input type="range" id="in-v" class="phys-slider" min="5" max="30" step="1" value="10" 
                oninput="updateState_3_1('v', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_3_1()" id="btn-start">Launch Sled</button>
            <button class="btn btn-red" onclick="reset_3_1()">Reset</button>
        </div>
        
        <div id="u3-1-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_3_1();
}

function updateState_3_1(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(0);
    if(key === 'v') document.getElementById('v-v').innerText = state.v.toFixed(0);
    
    calcPhysics_3_1();
    updateCalcDisplay_3_1();
    draw_3_1();
}

function setMode_3_1(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u3-1-questions');
    const badge = document.getElementById('u3-1-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        // Unlock controls
        document.getElementById('in-m').disabled = false;
        document.getElementById('in-m').parentElement.style.opacity = "1.0";
        document.getElementById('in-v').disabled = false;
        document.getElementById('in-v').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_3_1();
    }
    
    updateLocks_3_1();
    draw_3_1();
    updateCalcDisplay_3_1();
}

function updateLocks_3_1() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        // Special case for Level 3 (target) - we might want to lock mass but unlock velocity
        if(state.mode === 'guided' && state.level === 2 && s.id === 'in-m') return; // Handled in reset
        
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_3_1() {
    // K = 0.5 * m * v^2
    state.k = 0.5 * state.m * state.v * state.v;
    
    // Braking Force (Constant Friction)
    // Let's set mu such that distance is reasonable.
    // Work = F * d = K.  d = K / F.
    // Let's set F = 5000 N constant braking force.
    state.f_brake = 5000;
    state.stopDist = state.k / state.f_brake;
}

function updateCalcDisplay_3_1() {
    let box = document.getElementById('calc-3-1');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let kDisplay = (state.k / 1000).toFixed(1) + " kJ"; // Kilojoules for readability
    
    box.innerHTML = `
        <div style="margin-bottom:10px;">
            <div style="margin-bottom:4px; color:#555;">Kinetic Energy:</div>
            <div style="font-size:1.1em;">
                ${v('K')} = &frac12;${v('mv²')} = <b>${kDisplay}</b>
            </div>
        </div>
        <div style="font-size:0.9em; color:#777;">
            Expected Skid Distance: <b>${state.stopDist.toFixed(1)} m</b>
        </div>
    `;
}

function start_3_1() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.x = 0;
        state.currentV = state.v;
        state.skidStart = null;
        state.stopped = false;
        
        calcPhysics_3_1();
        updateLocks_3_1();
        loop_3_1();
    }
}

function reset_3_1() {
    let savedLevel = loadProgress('3.1'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        v: parseFloat(document.getElementById('in-v').value),
        
        x: 0,
        currentV: 0,
        t: 0,
        running: false,
        stopped: false,
        skidStart: null,
        
        k: 0,
        stopDist: 0,
        f_brake: 5000,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Setup for Level 3 (Precision Parking)
    if(state.mode === 'guided' && state.level === 2) {
        // Lock Mass, force specific scenario
        state.m = 1500; 
        let mSlider = document.getElementById('in-m');
        mSlider.disabled = true;
        mSlider.parentElement.style.opacity = "0.5";
        document.getElementById('v-m').innerText = "1500";
    } else if (state.mode === 'guided') {
        // Ensure unlocked for other levels
        let mSlider = document.getElementById('in-m');
        mSlider.disabled = false;
        mSlider.parentElement.style.opacity = "1.0";
    }
    
    calcPhysics_3_1();

    if(state.level >= 3) document.getElementById('u3-1-badge').style.display = 'block';

    setMode_3_1(state.mode);
    updateCalcDisplay_3_1();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_3_1();
        });
    });
}

function loop_3_1() {
    if(currentSim !== '3.1') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // Physics Logic
        // Phase 1: Moving at constant V until x = 100 (Braking Line)
        let brakeLine = 100;
        
        if(state.x < brakeLine) {
            state.currentV = state.v;
            state.x += state.currentV * dt * 5; // *5 for visual speed up
        } else {
            // Phase 2: Braking
            if(state.skidStart === null) state.skidStart = state.x;
            
            // Work-Energy: K_final = K_initial - Work_f
            // Or simpler: a = F/m. v = v0 - at.
            let a = state.f_brake / state.m;
            
            // Time since braking started
            // Ideally we iterate v. v_new = v_old - a*dt.
            // But we accelerated time by 5x above. Let's keep physics consistent.
            // Visual scale: 1m = 1px? No, we need to fit ~200m track.
            // Let's integrate properly.
            
            state.currentV -= a * dt * 5; // Applying accel
            
            if(state.currentV <= 0) {
                state.currentV = 0;
                state.stopped = true;
                state.running = false; // Stop loop
                
                if(state.mode === 'guided') checkLevel_3_1();
                updateLocks_3_1();
            }
            
            state.x += state.currentV * dt * 5;
        }
    }

    draw_3_1();
    
    if(state.running || state.stopped) requestAnimationFrame(loop_3_1);
}

function draw_3_1() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === WORLD ===
    let roadY = 300;
    let scale = 1.0; // 1 px = 1 m
    // We need to fit up to ~250m. Canvas 700px. Scale 2px = 1m?
    scale = 1.5; 
    let startX = 50;
    let brakeLineX = startX + 100 * scale; // 100m run up
    
    // Draw Road
    ctx.fillStyle = "#34495e"; ctx.fillRect(0, roadY, 700, 100);
    // Dashed Line
    ctx.strokeStyle = "#f1c40f"; ctx.lineWidth=2; ctx.setLineDash([20, 20]);
    ctx.beginPath(); ctx.moveTo(0, roadY+50); ctx.lineTo(700, roadY+50); ctx.stroke();
    ctx.setLineDash([]);
    
    // Brake Line (Red)
    ctx.strokeStyle = "#e74c3c"; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(brakeLineX, roadY); ctx.lineTo(brakeLineX, roadY+100); ctx.stroke();
    ctx.fillStyle = "#e74c3c"; ctx.font = "bold 12px sans-serif";
    ctx.fillText("BRAKE LINE", brakeLineX - 35, roadY - 10);
    
    // Target Line (For Level 3) - Say at +90m past brake line (190m total)
    if(state.mode === 'guided' && state.level === 2) {
        let targetDist = 90; 
        let targetX = brakeLineX + targetDist * scale;
        
        ctx.fillStyle = "rgba(46, 204, 113, 0.3)";
        ctx.fillRect(targetX - 10, roadY, 20, 100); // Tolerance zone
        
        ctx.strokeStyle = "#2ecc71"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(targetX, roadY); ctx.lineTo(targetX, roadY+100); ctx.stroke();
        ctx.fillStyle = "#2ecc71"; ctx.fillText("TARGET (90m)", targetX - 35, roadY - 10);
    }
    
    // Sled Position
    let sledX = startX + state.x * scale;
    // Camera Pan: Keep sled in view if it goes off screen
    let camOffset = 0;
    if(sledX > 500) {
        camOffset = sledX - 500;
    }
    
    ctx.save();
    ctx.translate(-camOffset, 0);
    
    // Redraw fixed elements that need to scroll?
    // Actually, simple scrolling:
    // We should have drawn the road *after* translating, or cleared and redrawn.
    // Let's re-draw road logic simply with offset.
    // For efficiency in this code block, I'll just draw the sled relative to the static road
    // and let it go off screen? No, stopping distance can be large (200m+).
    // Let's implement a simple "follow" cam by re-clearing.
    
    // RE-CLEAR & DRAW SCROLLED WORLD
    ctx.restore(); // Undo prev
    ctx.clearRect(0,0,700,640);
    ctx.save();
    ctx.translate(-camOffset, 0);
    
    // Road (Infinite look)
    ctx.fillStyle = "#34495e"; ctx.fillRect(camOffset, roadY, 700, 100); 
    // Draw Brake Line again relative to world
    ctx.strokeStyle = "#e74c3c"; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(brakeLineX, roadY); ctx.lineTo(brakeLineX, roadY+100); ctx.stroke();
    ctx.fillStyle = "#e74c3c"; ctx.font = "bold 12px sans-serif";
    ctx.fillText("BRAKE LINE", brakeLineX - 35, roadY - 10);
    
    // Target Line again
    if(state.mode === 'guided' && state.level === 2) {
        let targetDist = 90; 
        let targetX = brakeLineX + targetDist * scale;
        ctx.fillStyle = "rgba(46, 204, 113, 0.3)";
        ctx.fillRect(targetX - 10, roadY, 20, 100);
        ctx.strokeStyle = "#2ecc71"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(targetX, roadY); ctx.lineTo(targetX, roadY+100); ctx.stroke();
        ctx.fillStyle = "#2ecc71"; ctx.fillText("TARGET", targetX - 20, roadY - 10);
    }
    
    // Ticks on road
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px sans-serif";
    for(let i=0; i<500; i+=10) { // Every 10m
        let tx = startX + i*scale;
        ctx.fillRect(tx, roadY+50, 2, 10);
        if(i%50===0) ctx.fillText(i+"m", tx-5, roadY+75);
    }
    
    // Skid Marks
    if(state.x > 100) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        let skidLen = (state.x - 100) * scale;
        ctx.fillRect(brakeLineX, roadY+30, skidLen, 10);
        ctx.fillRect(brakeLineX, roadY+60, skidLen, 10);
        
        // Distance Text
        let dist = state.x - 100;
        ctx.fillStyle = "white"; ctx.font = "bold 14px monospace";
        ctx.fillText("d = " + dist.toFixed(1) + "m", brakeLineX + skidLen/2 - 30, roadY + 45);
    }
    
    // Sled
    let sledW = 60; let sledH = 30;
    ctx.fillStyle = "#e67e22"; ctx.fillRect(sledX, roadY+20, sledW, sledH);
    // Ski/Wheels
    ctx.fillStyle = "#d35400"; ctx.fillRect(sledX, roadY+50, sledW, 5);
    
    // Velocity Vector
    if(state.currentV > 0.1) {
        let vLen = state.currentV * 5;
        ctx.strokeStyle = "#2ecc71"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sledX + sledW/2, roadY+10); 
        ctx.lineTo(sledX + sledW/2 + vLen, roadY+10); ctx.stroke();
        // Arrow
        ctx.beginPath(); ctx.moveTo(sledX + sledW/2 + vLen, roadY+10);
        ctx.lineTo(sledX + sledW/2 + vLen - 5, roadY+5);
        ctx.lineTo(sledX + sledW/2 + vLen - 5, roadY+15); ctx.fill();
    }
    
    ctx.restore();
    
    // === HUD (Fixed on screen) ===
    // Energy Bar
    let barW = 300; let barH = 20; let barX = 350; let barY = 50;
    
    // Max Energy Reference (for scaling)
    let maxK = 0.5 * 2000 * 30 * 30; // ~900 kJ
    // Current K
    let curK = 0.5 * state.m * state.currentV * state.currentV;
    
    // Background
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(barX, barY, barW, barH);
    // Fill
    let fillW = (curK / maxK) * barW;
    ctx.fillStyle = "#f1c40f"; ctx.fillRect(barX, barY, fillW, barH);
    // Border
    ctx.strokeStyle = "#7f8c8d"; ctx.strokeRect(barX, barY, barW, barH);
    
    ctx.fillStyle = "#333"; ctx.font = "bold 14px sans-serif";
    ctx.fillText("Kinetic Energy", barX, barY - 8);
    ctx.fillText((curK/1000).toFixed(1) + " kJ", barX + barW + 10, barY + 15);
}

function renderQuestions_3_1() {
    let div = document.getElementById('u3-1-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Calculation</h4>
            <p>Set Mass ${v('m')} = <b>1000 kg</b>.</p>
            <p>Set Velocity ${v('v')} = <b>20 m/s</b>.</p>
            <p>Calculate the Kinetic Energy in <b>kJ</b> (Kilojoules).</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="kJ" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_1(0)"> 
                <button onclick="checkAnswer_3_1(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Squared Law</h4>
            <p>At <b>10 m/s</b>, the sled slides <b>10 meters</b>.</p>
            <p>If you double the speed to <b>20 m/s</b>, how far will it slide?</p>
            <p style="font-size:0.9em; color:#666;">(Hint: Energy &prop; v²)</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="meters" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_1(1)"> 
                <button onclick="checkAnswer_3_1(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Precision Parking</h4>
            <p>The Target Line is at <b>90 meters</b> past the brake line.</p>
            <p>Mass is locked at <b>1500 kg</b>.</p>
            <p>Adjust ${v('v')} to make the sled stop exactly on the target.</p>
            <div style="margin-top:10px;">
                <button onclick="checkAnswer_3_1(2)" style="padding:5px 15px; cursor:pointer;">I stopped on the line!</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; ENERGY EXPERT &#9733;</h3>
            <p>You understand the power of v²!</p>
        `;
    }
}

function checkAnswer_3_1(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // K = 0.5 * 1000 * 400 = 200,000 J = 200 kJ
        if(state.m === 1000 && state.v === 20 && Math.abs(val - 200) < 5) correct = true;
        else if (state.v !== 20 || state.m !== 1000) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set sliders to m=1000, v=20 first!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // Double speed -> Quadruple energy -> Quadruple distance.
        // 10m * 4 = 40m.
        if(Math.abs(val - 40) < 1.0) correct = true;
    }
    else if(lvl === 2) {
        // Target dist = 90m.
        // F = 5000. Work = 5000 * 90 = 450,000 J.
        // K = 0.5 * 1500 * v^2 = 450,000
        // v^2 = 900,000 / 1500 = 600.
        // v = sqrt(600) = 24.49 m/s.
        // Slider is integer. 24 -> 576 -> d=86.4. 25 -> 625 -> d=93.75.
        // Wait, slider step is 1. We can't hit 90m exactly with integer v.
        // Let's check if they are CLOSE (within the green zone drawn).
        // Zone drawn is +/- 10m? No, drawing was targetX-10 width 20. So +/- 10m.
        // 24 m/s => 86.4m (Error -3.6m). Inside zone.
        // 25 m/s => 93.75m (Error +3.75m). Inside zone.
        
        let dist = state.x - 100; // Skid distance
        if(state.stopped && Math.abs(dist - 90) < 5.0) { // 5m tolerance
            correct = true;
        } else if (!state.stopped) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Run the simulation until it stops!</span>`;
            return;
        }
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('3.1', state.level);
            
            if(state.level >= 3) document.getElementById('u3-1-badge').style.display = 'block';
            renderQuestions_3_1();
            reset_3_1();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Try again.</span>`;
    }
}

function checkLevel_3_1() {
}

// ===============================================
// === UNIT 3.2: WORK (Gold Standard v4.6) ===
// ===============================================

function setup_3_2() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "3.2 Work";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Force &times; Displacement</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Work is the transfer of energy by a force. Only the component of force <b>parallel</b> to motion does work.
        <br><b>Equation:</b> <i class="var">W</i> = <i class="var">Fd</i> cos(<i class="var">&theta;</i>)
        <br><i><b>Mission:</b> Push the crate to the target and calculate the energy transfer!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_3_2('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_3_2('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u3-2-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> WORKHORSE
            </div>
        </div>

        <div id="calc-3-2" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Applied Force (<i class="var">F</i>):</span>
                <span><span id="v-f">100</span> N</span>
            </label>
            <input type="range" id="in-f" class="phys-slider" min="0" max="200" step="10" value="100" 
                oninput="updateState_3_2('F', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Push Angle (<i class="var">&theta;</i>):</span>
                <span><span id="v-ang">0</span>&deg;</span>
            </label>
            <input type="range" id="in-ang" class="phys-slider" min="0" max="90" step="5" value="0" 
                oninput="updateState_3_2('theta', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #27ae60; padding-left: 10px; margin-top:10px;">
            <label style="color:#27ae60; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Distance (<i class="var">d</i>):</span>
                <span><span id="v-d">10.0</span> m</span>
            </label>
            <input type="range" id="in-d" class="phys-slider" min="5.0" max="20.0" step="1.0" value="10.0" 
                oninput="updateState_3_2('dTarget', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_3_2()" id="btn-start">Push Crate</button>
            <button class="btn btn-red" onclick="reset_3_2()">Reset</button>
        </div>
        
        <div id="u3-2-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_3_2();
}

function updateState_3_2(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'F') document.getElementById('v-f').innerText = state.F.toFixed(0);
    if(key === 'theta') document.getElementById('v-ang').innerText = state.theta.toFixed(0);
    if(key === 'dTarget') document.getElementById('v-d').innerText = state.dTarget.toFixed(1);
    
    calcPhysics_3_2();
    updateCalcDisplay_3_2();
    draw_3_2();
}

function setMode_3_2(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u3-2-questions');
    const badge = document.getElementById('u3-2-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        // Unlock controls
        document.getElementById('in-f').disabled = false;
        document.getElementById('in-f').parentElement.style.opacity = "1.0";
        document.getElementById('in-ang').disabled = false;
        document.getElementById('in-ang').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_3_2();
    }
    
    updateLocks_3_2();
    draw_3_2();
    updateCalcDisplay_3_2();
}

function updateLocks_3_2() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        // Special case: Level 3 (Net Work) locks angle to 0 for simplicity? Or keeps it open?
        // Let's keep things mostly unlocked unless a level specifically sets them
        if(state.mode === 'guided' && state.level === 0 && s.id === 'in-ang') return; // L1 locks angle
        
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_3_2() {
    // Work = F * d * cos(theta)
    let rad = state.theta * Math.PI / 180;
    state.w = state.F * state.dTarget * Math.cos(rad);
    
    // Friction (for Level 3)
    let mu = 0.2;
    let m = 20; // Fixed mass
    let g = 9.8;
    // Normal Force: F_N = mg - F_sin(theta) (if lifting)
    let fn = (m * g) - (state.F * Math.sin(rad));
    if(fn < 0) fn = 0; // Flying?
    state.ff = mu * fn;
    
    state.w_fric = -state.ff * state.dTarget;
    state.w_net = state.w + state.w_fric;
}

function updateCalcDisplay_3_2() {
    let box = document.getElementById('calc-3-2');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let wDisplay = state.w.toFixed(0);
    let cosTerm = Math.cos(state.theta * Math.PI / 180).toFixed(2);
    
    if(state.mode === 'guided' && state.level === 2) {
        // Net Work Mode
        box.innerHTML = `
            <div style="margin-bottom:5px;">
                ${v('W<sub>net</sub>')} = ${v('W<sub>app</sub>')} + ${v('W<sub>f</sub>')}
            </div>
            <div style="font-size:1.1em;">
                <b>${state.w_net.toFixed(0)} J</b> = ${wDisplay} J - ${Math.abs(state.w_fric.toFixed(0))} J
            </div>
        `;
    } else {
        // Basic Work Mode
        box.innerHTML = `
            <div style="margin-bottom:5px;">
                ${v('W')} = ${v('Fd')} cos(${state.theta.toFixed(0)}&deg;)
            </div>
            <div style="font-size:1.1em;">
                <b>${wDisplay} J</b> = (${state.F})(${state.dTarget})(${cosTerm})
            </div>
        `;
    }
}

function start_3_2() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.d = 0; // Current distance
        state.history = []; 
        
        calcPhysics_3_2();
        updateLocks_3_2();
        loop_3_2();
    }
}

function reset_3_2() {
    let savedLevel = loadProgress('3.2'); 

    state = {
        F: parseFloat(document.getElementById('in-f').value),
        theta: parseFloat(document.getElementById('in-ang').value),
        dTarget: parseFloat(document.getElementById('in-d').value),
        
        d: 0,
        t: 0,
        history: [],
        running: false,
        finished: false,
        
        w: 0,
        w_fric: 0,
        w_net: 0,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Level 1: Lock angle to 0
    if(state.mode === 'guided' && state.level === 0) {
        state.theta = 0;
        let angSlider = document.getElementById('in-ang');
        angSlider.disabled = true;
        angSlider.parentElement.style.opacity = "0.5";
        document.getElementById('v-ang').innerText = "0";
    } else {
        let angSlider = document.getElementById('in-ang');
        angSlider.disabled = false;
        angSlider.parentElement.style.opacity = "1.0";
    }
    
    calcPhysics_3_2();

    if(state.level >= 3) document.getElementById('u3-2-badge').style.display = 'block';

    setMode_3_2(state.mode);
    updateCalcDisplay_3_2();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_3_2();
        });
    });
}

function loop_3_2() {
    if(currentSim !== '3.2') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // Constant velocity visual for Work demo? 
        // Or accel? Work demos are usually clearer if we just animate the move
        // without worrying about a=0 start. Let's move at const speed for visuals.
        let v = 2.0; 
        state.d += v * dt;
        
        if(state.d >= state.dTarget) {
            state.d = state.dTarget;
            state.running = false;
            state.finished = true;
            
            if(state.mode === 'guided') checkLevel_3_2();
            updateLocks_3_2();
        }
    }

    draw_3_2();
    
    if(state.running) requestAnimationFrame(loop_3_2);
}

function draw_3_2() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 300px) ===
    let floorY = 250; 
    let pxPerM = 25; // 1m = 25px
    let startX = 50;
    
    // Floor
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, floorY); 
    ctx.fillStyle = "#95a5a6"; ctx.fillRect(0, floorY, 700, 100);
    // Ticks
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif";
    for(let i=0; i<25; i+=5) {
        let x = startX + i*pxPerM;
        ctx.fillRect(x, floorY, 1, 10);
        ctx.fillText(i+"m", x-5, floorY+25);
    }
    
    // Target Line
    let targetX = startX + state.dTarget * pxPerM;
    ctx.strokeStyle = "#27ae60"; ctx.lineWidth=3; ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(targetX, floorY-100); ctx.lineTo(targetX, floorY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#27ae60"; ctx.font = "bold 12px sans-serif";
    ctx.fillText("TARGET", targetX - 25, floorY - 110);
    
    // Ghost Crate (Start Position)
    ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth=2;
    ctx.strokeRect(startX, floorY - 50, 50, 50);
    
    // Current Crate
    let curX = startX + state.d * pxPerM;
    ctx.fillStyle = "#e67e22"; ctx.fillRect(curX, floorY - 50, 50, 50);
    ctx.strokeStyle = "#d35400"; ctx.lineWidth=2; ctx.strokeRect(curX, floorY - 50, 50, 50);
    
    // Displacement Vector
    if(state.d > 0.1) {
        drawVector_3_2(startX + 25, floorY + 20, state.d * pxPerM, 0, "#27ae60", "d");
    }
    
    // Force Vector
    // Drawn from center of crate
    let rad = state.theta * Math.PI / 180;
    // Scale: 1N = 0.8px
    let fScale = 0.8;
    let fx = state.F * fScale * Math.cos(rad);
    let fy = state.F * fScale * Math.sin(rad); // Up is -y in canvas, but logic handles it
    
    if(state.F > 0) {
        drawVector_3_2(curX + 25, floorY - 25, fx, -fy, "#2980b9", "F");
    }
    
    // === ZONE 2: ENERGY BAR (Bottom) ===
    let barY = 400;
    let barH = 40;
    let barX = 100;
    let barMaxW = 500;
    
    // Max Work reference (200N * 20m = 4000J)
    let maxJ = 4000;
    
    // Current Work Accumulation
    let curW = (state.F * Math.cos(rad)) * state.d;
    if(curW < 0) curW = 0; // Don't show neg work on main bar yet
    
    // Background
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(barX, barY, barMaxW, barH);
    
    // Fill
    let fillW = (curW / maxJ) * barMaxW;
    ctx.fillStyle = "#f1c40f"; ctx.fillRect(barX, barY, fillW, barH);
    
    // Border
    ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth=2; ctx.strokeRect(barX, barY, barMaxW, barH);
    
    // Labels
    ctx.fillStyle = "#333"; ctx.font = "bold 16px sans-serif"; ctx.textAlign="right";
    ctx.fillText("Work Done:", barX - 10, barY + 25);
    ctx.textAlign="left";
    ctx.fillText(curW.toFixed(0) + " J", barX + fillW + 10, barY + 25);
    
    // Net Work Bar (Level 3)
    if(state.mode === 'guided' && state.level === 2) {
        let netY = barY + 60;
        let fricW = Math.abs(state.ff * state.d); // Magnitude
        
        ctx.fillText("Energy Lost (Friction):", barX - 10, netY + 25);
        
        // Red bar for loss
        let lossW = (fricW / maxJ) * barMaxW;
        ctx.fillStyle = "#e74c3c"; ctx.fillRect(barX, netY, lossW, barH);
        ctx.fillText("-" + fricW.toFixed(0) + " J", barX + lossW + 10, netY + 25);
    }
}

function drawVector_3_2(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(dy, dx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        ctx.font = "bold 14px serif";
        ctx.fillText(label, endX + 10, endY);
    }
}

function renderQuestions_3_2() {
    let div = document.getElementById('u3-2-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: The Basic Push</h4>
            <p>Push horizontally (${v('&theta;')} = 0&deg;). Force aligns with Motion.</p>
            <p>Set ${v('F')} = <b>100 N</b>, ${v('d')} = <b>10.0 m</b>.</p>
            <p>Calculate Work: ${v('W')} = ${v('Fd')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="Joules" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_2(0)"> 
                <button onclick="checkAnswer_3_2(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Angle</h4>
            <p>You are taller than the crate, so you push down at an angle.</p>
            <p>Set ${v('F')} = <b>150 N</b>, ${v('&theta;')} = <b>60&deg;</b>.</p>
            <p>Push for ${v('d')} = <b>10.0 m</b>. Calculate Work done.</p>
            <p style="font-size:0.9em; color:#666;">(Hint: cos(60&deg;) = 0.5)</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="Joules" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_2(1)"> 
                <button onclick="checkAnswer_3_2(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Net Work</h4>
            <p>Friction fights back! ${v('W_{net}')} = ${v('W_{app}')} - ${v('W_{fric}')}.</p>
            <p>Set ${v('F')} = <b>200 N</b>, ${v('&theta;')} = <b>0&deg;</b>, ${v('d')} = <b>10 m</b>.</p>
            <p>If Friction Force is <b>40 N</b>, what is the Net Work?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="Joules" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_2(2)"> 
                <button onclick="checkAnswer_3_2(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; WORKHORSE &#9733;</h3>
            <p>You understand that only parallel force counts!</p>
        `;
    }
}

function checkAnswer_3_2(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // 100 * 10 = 1000
        if(state.F === 100 && state.dTarget === 10.0 && state.theta === 0 && Math.abs(val - 1000) < 10) correct = true;
        else if (state.F !== 100 || state.theta !== 0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set sliders to F=100, Angle=0 first!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // 150 * 10 * 0.5 = 750
        if(state.F === 150 && state.theta === 60 && Math.abs(val - 750) < 10) correct = true;
        else if (state.theta !== 60) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Angle to 60&deg;!</span>`;
            return;
        }
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // W_app = 200 * 10 = 2000. W_fric = 40 * 10 = 400. Net = 1600.
        // We override physics engine friction just for this question check?
        // Sim calculates dynamic friction.
        // Let's accept 1600 explicitly based on text prompt.
        if(state.F === 200 && Math.abs(val - 1600) < 10) correct = true;
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('3.2', state.level);
            
            if(state.level >= 3) document.getElementById('u3-2-badge').style.display = 'block';
            renderQuestions_3_2();
            reset_3_2();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your math!</span>`;
    }
}

function checkLevel_3_2() {
}

// ===============================================
// === UNIT 3.3: POTENTIAL ENERGY (Gold Standard v4.6) ===
// ===============================================

function setup_3_3() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "3.3 Gravitational Potential Energy";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Stored by Gravity</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Potential Energy ($U_g$) is the energy stored in an object due to its height in a gravitational field.
        <br><b>Equation:</b> <i class="var">U<sub>g</sub></i> = <i class="var">mgh</i>
        <br><i><b>Mission:</b> Lift the payload and analyze the energy storage!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_3_3('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_3_3('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u3-3-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> GRAVITY GURU
            </div>
        </div>

        <div id="calc-3-3" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">10.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="1.0" max="50.0" step="1.0" value="10.0" 
                oninput="updateState_3_3('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Height (<i class="var">h</i>):</span>
                <span><span id="v-h">0.0</span> m</span>
            </label>
            <input type="range" id="in-h" class="phys-slider" min="0.0" max="20.0" step="0.5" value="0.0" 
                oninput="updateState_3_3('h', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Gravity (<i class="var">g</i>):</span>
                <span><span id="v-g">9.8</span> m/s²</span>
            </label>
            <input type="range" id="in-g" class="phys-slider" min="1.6" max="25.0" step="0.1" value="9.8" 
                oninput="updateState_3_3('g', this.value)">
            <div style="font-size:0.8em; color:#666; margin-top:5px; text-align:right;">
                (Moon: 1.6, Earth: 9.8, Jupiter: 24.8)
            </div>
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-red" onclick="reset_3_3()">Reset</button>
        </div>
        
        <div id="u3-3-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_3_3();
}

function updateState_3_3(key, val) {
    state[key] = parseFloat(val);
    
    // Update labels
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    if(key === 'h') document.getElementById('v-h').innerText = state.h.toFixed(1);
    if(key === 'g') document.getElementById('v-g').innerText = state.g.toFixed(1);
    
    // Instant calculation (no running loop needed for static potential energy)
    state.u = state.m * state.g * state.h;
    
    updateCalcDisplay_3_3();
    requestAnimationFrame(draw_3_3);
}

function setMode_3_3(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u3-3-questions');
    const badge = document.getElementById('u3-3-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        // Unlock all
        document.getElementById('in-m').disabled = false;
        document.getElementById('in-h').disabled = false;
        document.getElementById('in-g').disabled = false;
        document.getElementById('in-g').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_3_3();
    }
    
    updateLocks_3_3();
    requestAnimationFrame(draw_3_3);
    updateCalcDisplay_3_3();
}

function updateLocks_3_3() {
    // In Level 3 (Mystery Planet), lock G
    let gSlider = document.getElementById('in-g');
    if (state.mode === 'guided' && state.level === 2) {
        gSlider.disabled = true;
        gSlider.parentElement.style.opacity = "0.5";
    } else {
        gSlider.disabled = false;
        gSlider.parentElement.style.opacity = "1.0";
    }
}

function updateCalcDisplay_3_3() {
    let box = document.getElementById('calc-3-3');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let uDisplay = state.isMystery ? "?" : state.u.toFixed(0);
    let gDisplay = state.isMystery ? "?" : state.g.toFixed(1);
    
    // In Mystery mode, we might want to show U but hide g?
    // Actually, prompt usually says "Read Energy". So show U, hide g.
    if(state.isMystery) uDisplay = state.u.toFixed(0);

    box.innerHTML = `
        <div style="margin-bottom:5px;">
            ${v('U<sub>g</sub>')} = ${v('mgh')}
        </div>
        <div style="font-size:1.1em;">
            <b>${uDisplay} J</b> = (${state.m.toFixed(1)})(${gDisplay})(${state.h.toFixed(1)})
        </div>
    `;
}

function reset_3_3() {
    let savedLevel = loadProgress('3.3'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        h: parseFloat(document.getElementById('in-h').value),
        g: parseFloat(document.getElementById('in-g').value),
        
        u: 0,
        isMystery: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Level 3 Setup: Mystery Planet
    if(state.mode === 'guided' && state.level === 2) {
        state.isMystery = true;
        // Set random-ish gravity. Let's use Mars (3.7)
        state.g = 3.7;
        document.getElementById('v-g').innerText = "???";
    } else {
        state.isMystery = false;
        // Default to Earth if slider says 9.8
        // Or keep slider value
        document.getElementById('v-g').innerText = state.g.toFixed(1);
    }
    
    state.u = state.m * state.g * state.h;

    if(state.level >= 3) document.getElementById('u3-3-badge').style.display = 'block';

    setMode_3_3(state.mode);
    updateCalcDisplay_3_3();
    
    requestAnimationFrame(draw_3_3);
}

function draw_3_3() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: THE CRANE (Left Side) ===
    let groundY = 550;
    let groundX = 50;
    let groundW = 350;
    let maxH = 400; // Pixels representing 20m
    let pxPerM = maxH / 20; // 20px per meter
    
    // Draw Ground
    ctx.fillStyle = "#2c3e50"; ctx.fillRect(groundX - 20, groundY, groundW + 40, 20);
    // Hatching
    ctx.strokeStyle = "#34495e"; ctx.lineWidth=2;
    for(let i=groundX-20; i<groundX+groundW+40; i+=10) {
        ctx.beginPath(); ctx.moveTo(i, groundY); ctx.lineTo(i-10, groundY+20); ctx.stroke();
    }
    
    // Ruler / Height Lines
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif"; ctx.textAlign = "right";
    ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 1;
    for(let i=0; i<=20; i+=2) {
        let y = groundY - i * pxPerM;
        ctx.beginPath(); ctx.moveTo(groundX, y); ctx.lineTo(groundX + groundW, y); ctx.stroke();
        ctx.fillText(i + "m", groundX - 5, y + 4);
    }
    
    // Crane Top
    let craneTopY = groundY - maxH - 40;
    ctx.fillStyle = "#2c3e50"; ctx.fillRect(groundX + 100, craneTopY, 200, 20);
    // Crane Support
    ctx.fillRect(groundX + 280, craneTopY, 20, maxH + 40 + 20);
    
    // The Payload (Weight)
    let cx = groundX + 150;
    let cy = groundY - state.h * pxPerM;
    let boxSize = 30 + state.m; // Visual mass scaling
    
    // Cable
    ctx.strokeStyle = "#333"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, craneTopY + 20); ctx.lineTo(cx, cy - boxSize/2); ctx.stroke();
    
    // Box
    ctx.fillStyle = "#e67e22"; ctx.fillRect(cx - boxSize/2, cy - boxSize/2, boxSize, boxSize);
    ctx.strokeStyle = "#d35400"; ctx.lineWidth = 3; ctx.strokeRect(cx - boxSize/2, cy - boxSize/2, boxSize, boxSize);
    
    // Label
    ctx.fillStyle = "white"; ctx.font = "bold 12px sans-serif"; ctx.textAlign="center";
    ctx.fillText(state.m.toFixed(0) + "kg", cx, cy + 5);
    
    // === ZONE 2: ENERGY TANK (Right Side) ===
    let tankX = 450;
    let tankY = 550;
    let tankW = 150;
    let tankH = 400;
    
    // Max Energy Ref (50kg * 25g * 20m = 25,000 J)
    let maxJ = 25000;
    // Current Level
    let fluidH = (state.u / maxJ) * tankH;
    
    // Tank Back
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(tankX, tankY - tankH, tankW, tankH);
    
    // Fluid
    ctx.fillStyle = "#2980b9"; 
    // Gradient
    let grad = ctx.createLinearGradient(tankX, tankY - tankH, tankX + tankW, tankY);
    grad.addColorStop(0, "#3498db"); grad.addColorStop(1, "#2980b9");
    ctx.fillStyle = grad;
    
    // Animate fluid level if we wanted, but static is fine for now
    ctx.fillRect(tankX, tankY - fluidH, tankW, fluidH);
    
    // Tank Frame
    ctx.strokeStyle = "#2c3e50"; ctx.lineWidth = 4; ctx.strokeRect(tankX, tankY - tankH, tankW, tankH);
    
    // Labels
    ctx.fillStyle = "#2c3e50"; ctx.font = "bold 16px sans-serif"; ctx.textAlign="center";
    ctx.fillText("Potential Energy", tankX + tankW/2, tankY + 25);
    
    // Value Label (Floating on top of fluid)
    if(fluidH > 20) {
        ctx.fillStyle = "white"; ctx.font = "bold 14px sans-serif";
        ctx.fillText(state.u.toFixed(0) + " J", tankX + tankW/2, tankY - fluidH + 20);
    }
}

function renderQuestions_3_3() {
    let div = document.getElementById('u3-3-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Earth Lift</h4>
            <p>We are on Earth (${v('g')} = 9.8 m/s²).</p>
            <p>Set Mass ${v('m')} = <b>10.0 kg</b>.</p>
            <p>Lift it to ${v('h')} = <b>5.0 m</b>.</p>
            <p>Calculate ${v('U<sub>g</sub>')} = ${v('mgh')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="Joules" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_3(0)"> 
                <button onclick="checkAnswer_3_3(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: Target Height</h4>
            <p>We need to store exactly <b>2000 Joules</b> of energy.</p>
            <p>Set Mass ${v('m')} = <b>20.0 kg</b> (on Earth, ${v('g')} = 9.8).</p>
            <p>Calculate the required Height ${v('h')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="meters" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_3(1)"> 
                <button onclick="checkAnswer_3_3(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Mystery Planet</h4>
            <p>We've landed on a new world. The gravity ${v('g')} is unknown.</p>
            <p>Set ${v('m')} = <b>10.0 kg</b> and ${v('h')} = <b>10.0 m</b>.</p>
            <p>Look at the Energy Tank. Use ${v('U<sub>g</sub>')} to calculate ${v('g')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="m/s²" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_3(2)"> 
                <button onclick="checkAnswer_3_3(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; GRAVITY GURU &#9733;</h3>
            <p>You understand how energy is stored in gravitational fields!</p>
        `;
    }
}

function checkAnswer_3_3(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // U = 10 * 9.8 * 5 = 490 J
        if(state.m === 10.0 && state.h === 5.0 && Math.abs(state.g - 9.8) < 0.1 && Math.abs(val - 490) < 5) correct = true;
        else if (Math.abs(state.g - 9.8) > 0.1) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Gravity to Earth (9.8)!</span>`;
            return;
        } else if (state.m !== 10.0 || state.h !== 5.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Check your mass and height sliders!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // 2000 = 20 * 9.8 * h -> h = 2000 / 196 = 10.2
        if(state.m === 20.0 && Math.abs(state.g - 9.8) < 0.1 && Math.abs(val - 10.2) < 0.2) correct = true;
        // Also check if they actually moved the slider near the target?
        // Prompt asks to calculate, not necessarily set. But setting helps verify visually.
        // Let's just check the calculation input.
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // Mystery g is 3.7 (Mars).
        if(Math.abs(val - 3.7) < 0.2) correct = true;
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('3.3', state.level);
            
            if(state.level >= 3) document.getElementById('u3-3-badge').style.display = 'block';
            renderQuestions_3_3();
            reset_3_3();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your math!</span>`;
    }
}

function checkLevel_3_3() {
}

// ===============================================
// === UNIT 3.4: CONSERVATION OF ENERGY (Gold Standard v4.6) ===
// ===============================================

function setup_3_4() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "3.4 Conservation of Energy";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Roller Coaster</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Energy cannot be created or destroyed, only transformed.
        <br><b>Equation:</b> <i class="var">E<sub>total</sub></i> = <i class="var">K</i> + <i class="var">U<sub>g</sub></i> + <i class="var">E<sub>th</sub></i>
        <br><i><b>Mission:</b> Convert potential energy into speed without running out!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_3_4('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_3_4('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u3-4-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> ENERGY TYCOON
            </div>
        </div>

        <div id="calc-3-4" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">100</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="50" max="200" step="10" value="100" 
                oninput="updateState_3_4('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Start Height (<i class="var">h<sub>0</sub></i>):</span>
                <span><span id="v-h">10.0</span> m</span>
            </label>
            <input type="range" id="in-h" class="phys-slider" min="5.0" max="15.0" step="0.5" value="10.0" 
                oninput="updateState_3_4('h', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Friction (<i class="var">&mu;</i>):</span>
                <span><span id="v-mu">0.0</span></span>
            </label>
            <input type="range" id="in-mu" class="phys-slider" min="0.0" max="0.2" step="0.01" value="0.0" 
                oninput="updateState_3_4('mu', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_3_4()" id="btn-start">Release Cart</button>
            <button class="btn btn-red" onclick="reset_3_4()">Reset</button>
        </div>
        
        <div id="u3-4-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_3_4();
}

function updateState_3_4(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(0);
    if(key === 'h') document.getElementById('v-h').innerText = state.h.toFixed(1);
    if(key === 'mu') document.getElementById('v-mu').innerText = state.mu.toFixed(2);
    
    calcInitialEnergy_3_4();
    updateCalcDisplay_3_4();
    draw_3_4();
}

function setMode_3_4(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u3-4-questions');
    const badge = document.getElementById('u3-4-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        // Unlock all
        document.getElementById('in-mu').disabled = false;
        document.getElementById('in-mu').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_3_4();
    }
    
    updateLocks_3_4();
    draw_3_4();
    updateCalcDisplay_3_4();
}

function updateLocks_3_4() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        if(state.mode === 'guided' && (state.level === 0 || state.level === 1) && s.id === 'in-mu') {
            s.disabled = true; // Lock friction for first two levels
            s.parentElement.style.opacity = "0.5";
            return;
        }
        
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcInitialEnergy_3_4() {
    let g = 9.8;
    state.uStart = state.m * g * state.h;
    state.kStart = 0;
    state.eTotal = state.uStart;
    
    // Reset live values
    state.u = state.uStart;
    state.k = 0;
    state.eTh = 0;
    state.v = 0;
}

function updateCalcDisplay_3_4() {
    let box = document.getElementById('calc-3-4');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let uDisplay = (state.u / 1000).toFixed(1);
    let kDisplay = (state.k / 1000).toFixed(1);
    let ethDisplay = (state.eTh / 1000).toFixed(1);
    let totalDisplay = (state.eTotal / 1000).toFixed(1);
    
    box.innerHTML = `
        <div style="margin-bottom:5px; font-size:0.9em; color:#555;">
            ${v('E<sub>tot</sub>')} = ${v('U<sub>g</sub>')} + ${v('K')} + ${v('E<sub>th</sub>')}
        </div>
        <div style="font-size:1.1em; display:flex; justify-content:space-between;">
            <span><b>${totalDisplay} kJ</b> =</span>
            <span style="color:#2980b9;">${uDisplay}</span> + 
            <span style="color:#27ae60;">${kDisplay}</span> + 
            <span style="color:#c0392b;">${ethDisplay}</span>
        </div>
    `;
}

function start_3_4() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.trackPos = 0; // x-coordinate
        state.trackLength = 600; // end of track
        
        // Reset dynamic energies
        state.u = state.uStart;
        state.k = 0;
        state.eTh = 0;
        state.v = 0;
        
        updateLocks_3_4();
        loop_3_4();
    }
}

function reset_3_4() {
    let savedLevel = loadProgress('3.4'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        h: parseFloat(document.getElementById('in-h').value),
        mu: parseFloat(document.getElementById('in-mu').value),
        
        trackPos: 0,
        t: 0,
        running: false,
        
        u: 0, k: 0, eTh: 0, eTotal: 0, v: 0,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Level Controls
    if(state.mode === 'guided' && state.level <= 1) {
        state.mu = 0;
        document.getElementById('in-mu').value = 0;
        document.getElementById('v-mu').innerText = "0.0";
    }
    
    calcInitialEnergy_3_4();

    if(state.level >= 3) document.getElementById('u3-4-badge').style.display = 'block';

    setMode_3_4(state.mode);
    updateCalcDisplay_3_4();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_3_4();
        });
    });
}

// Track Geometry Function: Returns y (height in m) for a given x (pixels)
// Canvas Height is 640. Ground is at y=500?
// x from 0 to 700.
// Let's define the track in meters relative to ground.
// x_m = x_px / 40.
function getTrackHeight_3_4(x_px) {
    let x = x_px / 40; // Convert to meters
    let h0 = state.h; // Starting height
    
    // Section 1: Drop (x = 0 to 5m) - Cosine curve from h0 to 0
    // y = A cos(Bx) + C
    // Start (0, h0), End (5, 0).
    // Half period of cosine.
    if(x < 5) {
        return (h0 / 2) * (Math.cos(Math.PI * x / 5) + 1);
    }
    // Section 2: Valley (x = 5 to 8m) - Flat at 0
    else if(x < 8) {
        return 0;
    }
    // Section 3: Hill (x = 8 to 14m) - Sine bump
    // Peak at x=11. Height = 6m (fixed second hill)
    else if(x < 14) {
        let h_hill = 6.0;
        // Map x [8,14] to [-PI, PI]?
        // -cos gives a bump. 
        // x_local = x - 8. Range 0 to 6.
        return (h_hill / 2) * (1 - Math.cos(2 * Math.PI * (x - 8) / 6));
    }
    // Section 4: End Flat (x > 14)
    else {
        return 0;
    }
}

function getTrackSlopeAngle_3_4(x_px) {
    // Simple numerical derivative
    let dx = 1; 
    let dy = getTrackHeight_3_4(x_px + dx) - getTrackHeight_3_4(x_px);
    // Slope = dy/dx (meters). Canvas y is inverted, but getTrackHeight returns Physics Height (+ is up).
    // So positive slope means going uphill.
    // However, canvas drawing needs adjustment.
    return Math.atan(dy / (dx/40)); 
}

function loop_3_4() {
    if(currentSim !== '3.4') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        let xOld = state.trackPos;
        // Estimate velocity from Kinetic Energy
        // K = E_tot - U - E_th
        // U = mgh
        let curH = getTrackHeight_3_4(state.trackPos);
        state.u = state.m * 9.8 * curH;
        
        // Calculate Friction Loss
        // dE_th = force_fric * distance
        // F_f = mu * F_N.
        // Approximate F_N ~ mg cos(theta) + F_c.
        // For stability, let's ignore F_c in friction term and just use slope.
        let theta = getTrackSlopeAngle_3_4(state.trackPos);
        let f_n = state.m * 9.8 * Math.cos(theta);
        if(f_n < 0) f_n = 0; // Shouldn't happen on this track
        
        let v_inst = Math.sqrt(2 * state.k / state.m) || 0;
        let distStep = v_inst * dt;
        
        let dEth = state.mu * f_n * distStep;
        
        state.eTh += dEth;
        state.k = state.eTotal - state.u - state.eTh;
        
        // Check if stuck (K < 0)
        if(state.k <= 0) {
            state.k = 0;
            state.v = 0;
            state.running = false; // Stopped
        } else {
            state.v = Math.sqrt(2 * state.k / state.m);
            // Move cart
            // dx = ds * cos(theta).
            // But x is our primary coordinate.
            // ds = dx / cos(theta).
            // v = ds/dt. -> dx/dt = v * cos(theta).
            
            // Correction: If slope is steep, x moves slower.
            let dx = state.v * Math.cos(theta) * dt * 40; // 40 px/m
            state.trackPos += dx;
        }
        
        // Stop at end
        if(state.trackPos > 650) {
            state.running = false;
            if(state.mode === 'guided') checkLevel_3_4();
            updateLocks_3_4();
        }
    }

    updateCalcDisplay_3_4();
    draw_3_4();
    
    if(state.running) requestAnimationFrame(loop_3_4);
}

function draw_3_4() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    // === ZONE 1: WORLD (Top 400px) ===
    let groundY = 400;
    
    // Draw Track
    ctx.beginPath();
    ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth = 5;
    for(let x=0; x<=700; x+=5) {
        let h = getTrackHeight_3_4(x);
        let y = groundY - h * 40; // 40px scale
        if(x===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Supports
    ctx.fillStyle = "#bdc3c7";
    for(let x=0; x<=700; x+=50) {
        let h = getTrackHeight_3_4(x);
        let y = groundY - h * 40;
        if(h > 0.1) ctx.fillRect(x-2, y, 4, groundY-y);
    }
    
    // Ground
    ctx.fillStyle = "#2c3e50"; ctx.fillRect(0, groundY, 700, 20);
    
    // Cart
    let cx = state.trackPos;
    let ch = getTrackHeight_3_4(cx);
    let cy = groundY - ch * 40;
    
    // Rotation
    let theta = getTrackSlopeAngle_3_4(cx); // radians, + is uphill
    // Canvas rotation: + is clockwise. 
    // Uphill (positive slope) means we need to rotate Counter-Clockwise (-theta)
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-theta); // Align with track
    
    // Cart Body
    ctx.fillStyle = "#e67e22"; ctx.fillRect(-15, -15, 30, 15);
    // Wheels
    ctx.fillStyle = "#333"; 
    ctx.beginPath(); ctx.arc(-10, 0, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, 0, 4, 0, Math.PI*2); ctx.fill();
    // Passenger
    ctx.fillStyle = "#3498db"; ctx.beginPath(); ctx.arc(0, -20, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-5, -15, 10, 8);
    
    ctx.restore();
    
    // Velocity Vector (Green)
    if(state.v > 0.5) {
        let vScale = 3.0;
        // Velocity is tangent
        let vx = state.v * Math.cos(theta) * vScale;
        let vy = state.v * Math.sin(theta) * vScale; // Phys Y
        // Canvas dy = -vy
        drawVector_3_4(cx, cy - 10, vx, -vy, "#27ae60", "");
    }
    
    // Height Marker
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.font = "10px sans-serif";
    ctx.fillText("h=" + ch.toFixed(1) + "m", cx + 20, cy - 20);


    // === ZONE 2: ENERGY BARS (Bottom) ===
    let barY = 450;
    let barH = 150;
    let barW = 60;
    let gap = 40;
    let startX = 150;
    
    let maxE = 200 * 9.8 * 15; // Max possible (200kg * 15m) approx 30kJ
    // Better scale: Max of current setup
    let currentMax = state.eTotal; 
    // Avoid div by zero
    if(currentMax < 1) currentMax = 1000;
    
    const drawBar = (x, val, color, label) => {
        let h = (val / currentMax) * barH;
        let y = barY + barH - h;
        ctx.fillStyle = color; ctx.fillRect(x, y, barW, h);
        ctx.strokeStyle = "#333"; ctx.strokeRect(x, barY, barW, barH); // Frame
        
        ctx.fillStyle = "#333"; ctx.textAlign="center"; ctx.font = "bold 12px sans-serif";
        ctx.fillText(label, x + barW/2, barY + barH + 15);
        ctx.fillText((val/1000).toFixed(1) + "k", x + barW/2, y - 5);
    };
    
    drawBar(startX, state.u, "#2980b9", "Potential (U)");
    drawBar(startX + barW + gap, state.k, "#27ae60", "Kinetic (K)");
    drawBar(startX + 2*(barW + gap), state.eTh, "#c0392b", "Thermal (Eth)");
    
    // Total Line
    let totalH = barH; // Since we scaled to currentMax
    ctx.strokeStyle = "#f39c12"; ctx.lineWidth=2; ctx.setLineDash([5,5]);
    let lineY = barY; 
    ctx.beginPath(); ctx.moveTo(startX - 20, lineY); ctx.lineTo(startX + 3*barW + 2*gap + 20, lineY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f39c12"; ctx.fillText("Total E", startX - 30, lineY + 5);
}

function drawVector_3_4(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(dy, dx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
}

function renderQuestions_3_4() {
    let div = document.getElementById('u3-4-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: The Drop</h4>
            <p>Start at ${v('h<sub>0</sub>')} = <b>10.0 m</b>. (Valley is at 0m).</p>
            <p>All Potential becomes Kinetic at the bottom: ${v('mgh')} = &frac12;${v('mv²')}.</p>
            <p>Calculate the maximum speed ${v('v')} at the bottom.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_4(0)"> 
                <button onclick="checkAnswer_3_4(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Hill</h4>
            <p>The second hill is <b>6.0 m</b> high.</p>
            <p>Start at ${v('h<sub>0</sub>')} = <b>10.0 m</b>.</p>
            <p>Calculate the speed ${v('v')} at the top of the second hill.</p>
            <p style="font-size:0.9em; color:#666;">(Hint: ${v('K')} = ${v('U<sub>start</sub>')} - ${v('U<sub>hill</sub>')})</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_4(1)"> 
                <button onclick="checkAnswer_3_4(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Energy Loss</h4>
            <p>Set Friction ${v('&mu;')} = <b>0.10</b>. Start at ${v('h')} = <b>10.0 m</b>.</p>
            <p>Run the cart until it stops or passes the hill.</p>
            <p>Read the Thermal Energy (${v('E<sub>th</sub>')}) from the red bar.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="kJ" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_4(2)"> 
                <button onclick="checkAnswer_3_4(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; ENERGY TYCOON &#9733;</h3>
            <p>You have mastered Conservation of Energy!</p>
        `;
    }
}

function checkAnswer_3_4(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // v = sqrt(2gh) = sqrt(2 * 9.8 * 10) = 14.0
        if(state.h === 10.0 && Math.abs(val - 14.0) < 0.5) correct = true;
        else if (state.h !== 10.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Height to 10.0 m!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // h_diff = 10 - 6 = 4m.
        // v = sqrt(2 * 9.8 * 4) = sqrt(78.4) = 8.85
        if(state.h === 10.0 && Math.abs(val - 8.85) < 0.5) correct = true;
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // Accept approximate value from bar chart reading
        // Exact calc difficult due to path integral.
        // We check if it matches the current state Eth.
        if(state.mu === 0.10 && state.h === 10.0 && state.trackPos > 50) {
            let ethKJ = state.eTh / 1000;
            if(Math.abs(val - ethKJ) < 0.5) correct = true;
        } else if (state.mu !== 0.10) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Friction to 0.10!</span>`;
            return;
        } else {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Run the sim first!</span>`;
            return;
        }
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('3.4', state.level);
            
            if(state.level >= 3) document.getElementById('u3-4-badge').style.display = 'block';
            renderQuestions_3_4();
            reset_3_4();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your calculation!</span>`;
    }
}

function checkLevel_3_4() {
}

// ===============================================
// === UNIT 3.5: ELASTIC POTENTIAL ENERGY (Gold Standard v4.6) ===
// ===============================================

function setup_3_5() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "3.5 Elastic Potential Energy";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Springs & Conservation</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Energy can be stored in a compressed spring. When released, this potential energy converts to motion.
        <br><b>Equations:</b> <i class="var">F</i> = <i class="var">-kx</i> &nbsp;|&nbsp; <i class="var">U<sub>s</sub></i> = &frac12;<i class="var">kx</i>²
        <br><i><b>Mission:</b> Compress the spring and launch the block!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_3_5('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_3_5('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u3-5-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> SPRING MASTER
            </div>
        </div>

        <div id="calc-3-5" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Spring Constant (<i class="var">k</i>):</span>
                <span><span id="v-k">100</span> N/m</span>
            </label>
            <input type="range" id="in-k" class="phys-slider" min="50" max="500" step="10" value="100" 
                oninput="updateState_3_5('k', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Compression (<i class="var">x</i>):</span>
                <span><span id="v-x">0.0</span> m</span>
            </label>
            <input type="range" id="in-x" class="phys-slider" min="0.0" max="2.0" step="0.1" value="0.0" 
                oninput="updateState_3_5('x', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Block Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">2.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="0.5" max="10.0" step="0.5" value="2.0" 
                oninput="updateState_3_5('m', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_3_5()" id="btn-start">Fire Spring</button>
            <button class="btn btn-red" onclick="reset_3_5()">Reset</button>
        </div>
        
        <div id="u3-5-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_3_5();
}

function updateState_3_5(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'k') document.getElementById('v-k').innerText = state.k.toFixed(0);
    if(key === 'x') document.getElementById('v-x').innerText = state.x.toFixed(1);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    
    calcPhysics_3_5();
    updateCalcDisplay_3_5();
    draw_3_5();
}

function setMode_3_5(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u3-5-questions');
    const badge = document.getElementById('u3-5-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        document.getElementById('in-k').disabled = false;
        document.getElementById('in-k').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_3_5();
    }
    
    updateLocks_3_5();
    draw_3_5();
    updateCalcDisplay_3_5();
}

function updateLocks_3_5() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        // Specific locks for levels handled in renderQuestions
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_3_5() {
    // Force required to hold spring at x: F = kx
    state.f_hold = state.k * state.x;
    
    // Potential Energy: Us = 0.5 * k * x^2
    state.u_s = 0.5 * state.k * state.x * state.x;
    
    // Max Velocity (Conservation): 0.5*m*v^2 = U_s  -> v = sqrt(2*U_s/m)
    state.v_max = Math.sqrt((2 * state.u_s) / state.m);
}

function updateCalcDisplay_3_5() {
    let box = document.getElementById('calc-3-5');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    // Values
    let uVal = state.u_s.toFixed(1);
    let kVal = state.k.toFixed(0);
    let xVal = state.x.toFixed(1);
    
    // Dynamic Display based on state
    let content = "";
    
    if(state.running && state.blockX > state.eqX) {
        // Block Launched
        content = `
            <div style="margin-bottom:5px;">
                ${v('K<sub>final</sub>')} = ${v('U<sub>elastic</sub>')}
            </div>
            <div style="font-size:1.1em;">
                &frac12;${v('mv²')} = <b>${uVal} J</b>
            </div>
        `;
    } else {
        // Compressed State
        content = `
            <div style="margin-bottom:5px;">
                ${v('U<sub>s</sub>')} = &frac12;${v('kx²')}
            </div>
            <div style="font-size:1.1em;">
                <b>${uVal} J</b> = &frac12;(${kVal})(${xVal})²
            </div>
        `;
    }
    
    box.innerHTML = content;
}

function start_3_5() {
    if(!state.running && state.x > 0) {
        state.running = true;
        state.t = 0;
        state.history = []; 
        
        calcPhysics_3_5();
        updateLocks_3_5();
        loop_3_5();
    }
}

function reset_3_5() {
    let savedLevel = loadProgress('3.5'); 

    state = {
        k: parseFloat(document.getElementById('in-k').value),
        x: parseFloat(document.getElementById('in-x').value),
        m: parseFloat(document.getElementById('in-m').value),
        
        t: 0,
        history: [],
        running: false,
        
        // Physics Layout
        wallX: 50,
        eqX: 250, // Equilibrium position of block's back edge (Spring Natural Length = 200px)
        
        // Dynamic
        blockX: 0, // Calculated in loop
        blockV: 0,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Initial Block Position (Compressed)
    // 1m = 100px for scale?
    // Let's say max compression 2.0m = 200px.
    state.pxPerM = 100;
    state.blockX = state.eqX - (state.x * state.pxPerM);
    
    // Level Logic
    if(state.mode === 'guided') {
        let kSlider = document.getElementById('in-k');
        if(state.level === 0) {
            // Level 1: Lock K
            state.k = 100;
            kSlider.disabled = true;
            kSlider.parentElement.style.opacity = "0.5";
            document.getElementById('v-k').innerText = "100";
        } else {
            kSlider.disabled = false;
            kSlider.parentElement.style.opacity = "1.0";
        }
    }
    
    calcPhysics_3_5();

    if(state.level >= 3) document.getElementById('u3-5-badge').style.display = 'block';

    setMode_3_5(state.mode);
    updateCalcDisplay_3_5();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_3_5();
        });
    });
}

function loop_3_5() {
    if(currentSim !== '3.5') return;

    if(state.running) {
        // Physics Engine
        // Phase 1: Acceleration (Block still attached to spring, x < 0 relative to eq)
        // Phase 2: Coasting (Block detached, x >= 0)
        
        // We use a small time step integration
        let dt = 0.015; // slightly slower for visibility
        state.t += dt;
        
        // Current compression (meters)
        // eqX is where spring is relaxed. blockX is current position.
        // compression dx = (eqX - blockX) / pxPerM
        let dx = (state.eqX - state.blockX) / state.pxPerM;
        
        if(dx > 0) {
            // Phase 1: Spring Pushing
            let f = state.k * dx;
            let a = f / state.m;
            state.blockV += a * dt;
            state.blockX += state.blockV * dt * state.pxPerM;
        } else {
            // Phase 2: Detached (Constant V)
            // Snap to equilibrium for spring visualization, allow block to fly
            // blockV is now constant (max velocity)
            state.blockX += state.blockV * dt * state.pxPerM;
        }
        
        // Record History
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                v: state.blockV
            });
        }
        
        // Stop Condition (Wall or time)
        if(state.blockX > 650 || state.t > 5.0) {
            state.running = false;
            if(state.mode === 'guided') checkLevel_3_5();
            updateLocks_3_5();
        }
    }

    draw_3_5();
    
    if(state.running) requestAnimationFrame(loop_3_5);
}

function draw_3_5() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    let floorY = 350;
    
    // === ZONE 1: WORLD ===
    // Floor
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, floorY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, floorY, 700, 100);
    // Wall
    ctx.fillStyle = "#95a5a6"; ctx.fillRect(0, 0, state.wallX, 640);
    ctx.strokeStyle = "#7f8c8d"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(state.wallX, 0); ctx.lineTo(state.wallX, 640); ctx.stroke();
    
    // Ticks (Meters)
    ctx.fillStyle = "#7f8c8d"; ctx.font = "10px sans-serif";
    for(let i=0; i<=6; i++) {
        let x = state.eqX + (i-2)*state.pxPerM; // EQ is at 0m relative to spring? No, EQ is origin.
        // Let's make EQ = 0m on the ruler.
        let rulerX = state.eqX + i*state.pxPerM;
        if(rulerX > state.wallX) {
            ctx.fillRect(rulerX, floorY, 1, 10);
            ctx.fillText(i+"m", rulerX-5, floorY+25);
        }
    }
    
    // Spring
    // Starts at wallX, Ends at... blockX (if pushing) or eqX (if detached)
    let springEndX = state.blockX;
    if(state.running && state.blockX > state.eqX) springEndX = state.eqX; // Spring stops expanding
    
    drawSpring_3_5(state.wallX, floorY - 30, springEndX, floorY - 30, 20);
    
    // Block
    let boxSize = 40;
    ctx.fillStyle = "#e67e22"; ctx.fillRect(state.blockX, floorY - boxSize, boxSize, boxSize);
    ctx.strokeStyle = "#d35400"; ctx.lineWidth=2; ctx.strokeRect(state.blockX, floorY - boxSize, boxSize, boxSize);
    // Mass Label
    ctx.fillStyle = "white"; ctx.font = "bold 10px sans-serif"; ctx.textAlign="center";
    ctx.fillText(state.m.toFixed(1)+"kg", state.blockX + boxSize/2, floorY - 15);
    
    // Force Vector (Restoring Force) - Only if compressed
    if(springEndX < state.eqX - 1) { // 1px tolerance
        // Force points Right
        // F = kx. Max F approx 500*2 = 1000N. Scale 0.1?
        let dx = (state.eqX - springEndX) / state.pxPerM;
        let f = state.k * dx;
        let fLen = f * 0.15; 
        drawVector_3_5(state.blockX + boxSize/2, floorY - boxSize/2, fLen, 0, "#2980b9", "F_s");
    }
    
    // Velocity Vector
    if(state.blockV > 0.1) {
        drawVector_3_5(state.blockX + boxSize/2, floorY - boxSize/2, state.blockV * 15, 0, "#27ae60", "v");
    }
    
    // === ZONE 2: ENERGY BARS ===
    let barX = 100;
    let barY = 500;
    let barH = 30;
    let barMaxW = 500;
    
    // Calculate Energies
    // If not running, U is static. If running, U converts to K.
    // U = 0.5 k x^2 (where x is remaining compression)
    let currentX = 0;
    if(!state.running) currentX = (state.eqX - state.blockX)/state.pxPerM;
    else if(state.blockX < state.eqX) currentX = (state.eqX - state.blockX)/state.pxPerM;
    
    let curU = 0.5 * state.k * currentX * currentX;
    let curK = state.u_s - curU; // Conservation
    if(curK < 0) curK = 0; // Floating point safety
    
    // Max Energy Reference (for scaling visual)
    // 0.5 * 500 * 4 = 1000 J max possible
    let maxJ = 1000;
    
    // Draw Bars
    // U (Blue)
    let uW = (curU / maxJ) * barMaxW;
    ctx.fillStyle = "#2980b9"; ctx.fillRect(barX, barY, uW, barH);
    
    // K (Green) - Stacked? Or separate? Let's stack to show conservation (Total width constant)
    let kW = (curK / maxJ) * barMaxW;
    ctx.fillStyle = "#27ae60"; ctx.fillRect(barX + uW, barY, kW, barH);
    
    // Frame
    ctx.strokeStyle = "#333"; ctx.lineWidth=2; 
    let totalW = ((state.u_s)/maxJ) * barMaxW; // Current total E width
    ctx.strokeRect(barX, barY, Math.max(totalW, 2), barH);
    
    // Labels
    ctx.fillStyle = "#333"; ctx.font = "bold 14px sans-serif"; ctx.textAlign="right";
    ctx.fillText("Energy:", barX - 10, barY + 20);
    
    // Legend
    ctx.textAlign="left";
    ctx.fillStyle = "#2980b9"; ctx.fillText(`U: ${curU.toFixed(0)}J`, barX, barY - 10);
    if(curK > 1) {
        ctx.fillStyle = "#27ae60"; ctx.fillText(`K: ${curK.toFixed(0)}J`, barX + uW + 10, barY - 10);
    }
}

function drawSpring_3_5(x1, y1, x2, y2, coils) {
    ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    
    let dist = x2 - x1;
    let step = dist / coils;
    
    for(let i=0; i<coils; i++) {
        let x = x1 + i*step;
        // Zigzag
        ctx.lineTo(x + step/4, y1 - 10);
        ctx.lineTo(x + 3*step/4, y1 + 10);
        ctx.lineTo(x + step, y1);
    }
    ctx.stroke();
}

function drawVector_3_5(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(dy, dx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        ctx.font = "bold 14px serif";
        ctx.fillText(label, endX + 5, endY - 5);
    }
}

function renderQuestions_3_5() {
    let div = document.getElementById('u3-5-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Hooke's Law</h4>
            <p>Set Spring Constant ${v('k')} = <b>100 N/m</b>.</p>
            <p>Compress the spring by ${v('x')} = <b>1.5 m</b>.</p>
            <p>Calculate the Force required to hold it: ${v('F')} = ${v('kx')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_5(0)"> 
                <button onclick="checkAnswer_3_5(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: Stored Energy</h4>
            <p>Set ${v('k')} = <b>200 N/m</b>.</p>
            <p>Compress by ${v('x')} = <b>1.0 m</b>.</p>
            <p>Calculate the Elastic Potential Energy: ${v('U<sub>s</sub>')} = &frac12;${v('kx²')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="Joules" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_5(1)"> 
                <button onclick="checkAnswer_3_5(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Launch Speed</h4>
            <p>Set ${v('k')} = <b>100 N/m</b>, ${v('m')} = <b>2.0 kg</b>, ${v('x')} = <b>2.0 m</b>.</p>
            <p>Upon release, all ${v('U<sub>s</sub>')} becomes ${v('K')}.</p>
            <p>Calculate the final velocity ${v('v')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_3_5(2)"> 
                <button onclick="checkAnswer_3_5(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; SPRING MASTER &#9733;</h3>
            <p>You have mastered Elastic Energy!</p>
        `;
    }
}

function checkAnswer_3_5(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // F = 100 * 1.5 = 150
        if(state.k === 100 && state.x === 1.5 && Math.abs(val - 150) < 5) correct = true;
        else if (state.k !== 100 || state.x !== 1.5) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set sliders to k=100, x=1.5!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // U = 0.5 * 200 * 1^2 = 100 J
        if(state.k === 200 && state.x === 1.0 && Math.abs(val - 100) < 5) correct = true;
        else if (state.k !== 200) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set k=200, x=1.0!</span>`;
            return;
        }
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // U = 0.5 * 100 * 4 = 200 J
        // K = 200 = 0.5 * 2 * v^2 = v^2
        // v = sqrt(200) = 14.14
        if(state.k === 100 && state.m === 2.0 && state.x === 2.0 && Math.abs(val - 14.1) < 0.5) correct = true;
        else if (state.m !== 2.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Check your sliders (k=100, m=2, x=2)!</span>`;
            return;
        }
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('3.5', state.level);
            
            if(state.level >= 3) document.getElementById('u3-5-badge').style.display = 'block';
            renderQuestions_3_5();
            reset_3_5();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your formula!</span>`;
    }
}

function checkLevel_3_5() {
}

// ===============================================
// === UNIT 4.1: MOMENTUM (Gold Standard v4.6) ===
// ===============================================

function setup_4_1() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "4.1 Momentum";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Quantity of Motion</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Momentum is the product of mass and velocity. It represents how hard it is to stop an object.
        <br><b>Equation:</b> <i class="var">p</i> = <i class="var">mv</i>
        <br><i><b>Mission:</b> Calibrate the cart to hit the wall with precise force!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_4_1('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_4_1('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u4-1-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> HEAVY HITTER
            </div>
        </div>

        <div id="calc-4-1" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">5.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="1.0" max="20.0" step="0.5" value="5.0" 
                oninput="updateState_4_1('m', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #27ae60; padding-left: 10px; margin-top:10px;">
            <label style="color:#27ae60; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Velocity (<i class="var">v</i>):</span>
                <span><span id="v-v">5.0</span> m/s</span>
            </label>
            <input type="range" id="in-v" class="phys-slider" min="-10.0" max="10.0" step="0.5" value="5.0" 
                oninput="updateState_4_1('v', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_4_1()" id="btn-start">Launch Cart</button>
            <button class="btn btn-red" onclick="reset_4_1()">Reset</button>
        </div>
        
        <div id="u4-1-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_4_1();
}

function updateState_4_1(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    if(key === 'v') document.getElementById('v-v').innerText = state.v.toFixed(1);
    
    calcPhysics_4_1();
    updateCalcDisplay_4_1();
    draw_4_1();
}

function setMode_4_1(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u4-1-questions');
    const badge = document.getElementById('u4-1-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        // Unlock all
        document.getElementById('in-m').disabled = false;
        document.getElementById('in-m').parentElement.style.opacity = "1.0";
        document.getElementById('in-v').disabled = false;
        document.getElementById('in-v').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_4_1();
    }
    
    updateLocks_4_1();
    draw_4_1();
    updateCalcDisplay_4_1();
}

function updateLocks_4_1() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_4_1() {
    state.p = state.m * state.v;
}

function updateCalcDisplay_4_1() {
    let box = document.getElementById('calc-4-1');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let pDisplay = state.p.toFixed(1);
    // Purple color for Momentum, Green for Velocity
    box.innerHTML = `
        <div style="margin-bottom:5px;">
            ${v('p')} = ${v('mv')}
        </div>
        <div style="font-size:1.1em;">
            <span style="color:#8e44ad; font-weight:bold;">${pDisplay} kg·m/s</span> = 
            ${state.m.toFixed(1)}kg &times; 
            <span style="color:#27ae60;">${state.v.toFixed(1)} m/s</span>
        </div>
    `;
}

function start_4_1() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.crashed = false;
        state.history = []; 
        
        calcPhysics_4_1();
        updateLocks_4_1();
        loop_4_1();
    }
}

function reset_4_1() {
    let savedLevel = loadProgress('4.1'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        v: parseFloat(document.getElementById('in-v').value),
        
        x: 0, // Cart center position (World is -350 to +350 relative to canvas center?)
              // Let's use 0 to 700. Wall at 650. Cart starts at 50.
        
        t: 0,
        running: false,
        crashed: false,
        impactP: 0,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    state.x = 100; // Start position
    
    // Level Specific Setup
    if(state.mode === 'guided') {
        let mSlider = document.getElementById('in-m');
        if(state.level === 1) { // Level 2: Lock Mass
            state.m = 10.0;
            mSlider.disabled = true;
            mSlider.parentElement.style.opacity = "0.5";
            document.getElementById('v-m').innerText = "10.0";
        } else {
            mSlider.disabled = false;
            mSlider.parentElement.style.opacity = "1.0";
        }
    }
    
    calcPhysics_4_1();

    if(state.level >= 3) document.getElementById('u4-1-badge').style.display = 'block';

    setMode_4_1(state.mode);
    updateCalcDisplay_4_1();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_4_1();
        });
    });
}

function loop_4_1() {
    if(currentSim !== '4.1') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // Move Cart
        if(!state.crashed) {
            state.x += state.v * dt * 20; // 20 px/m visual scaling
        }
        
        // Wall Collision
        let wallX = 600;
        let cartW = 60;
        // Check front bumper
        let bumperX = state.x + (state.v > 0 ? cartW/2 : -cartW/2);
        
        // Hit right wall or left wall?
        // Sim mostly set up for Left -> Right launch.
        if(state.v > 0 && bumperX >= wallX) {
            state.crashed = true;
            state.running = false;
            state.impactP = state.p; // Record impact momentum
            state.x = wallX - cartW/2; // Snap to wall
            
            // Screen Shake Effect?
            // Handled in draw via offsets if we wanted.
            
            if(state.mode === 'guided') checkLevel_4_1();
            updateLocks_4_1();
        } else if (state.v < 0 && bumperX <= 100) {
            // Hit left bumper (start)
             state.crashed = true;
             state.running = false;
             state.impactP = state.p;
             state.x = 100 + cartW/2;
             updateLocks_4_1();
        }
    }

    draw_4_1();
    
    if(state.running) requestAnimationFrame(loop_4_1);
}

function draw_4_1() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    let floorY = 400;
    
    // === ZONE 1: TRACK ===
    // Floor
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, floorY); 
    ctx.fillStyle = "#7f8c8d"; ctx.fillRect(0, floorY, 700, 50);
    
    // Track Markings
    ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 2;
    for(let i=0; i<700; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, floorY); ctx.lineTo(i+20, floorY+20); ctx.stroke();
    }
    
    // Wall (Target)
    let wallX = 600;
    ctx.fillStyle = "#c0392b"; ctx.fillRect(wallX, 300, 20, 100);
    // Caution Stripes
    ctx.fillStyle = "#f1c40f"; 
    for(let y=300; y<400; y+=20) {
        ctx.beginPath(); ctx.moveTo(wallX, y); ctx.lineTo(wallX+20, y+10); ctx.lineTo(wallX+20, y+20); ctx.lineTo(wallX, y+10); ctx.fill();
    }
    
    // Cart
    let cartW = 60; let cartH = 40;
    // Visual Mass scaling
    let scaleM = 0.8 + (state.m / 20) * 0.4; // 0.8 to 1.2 scale
    let w = cartW * scaleM;
    let h = cartH * scaleM;
    
    let cx = state.x;
    let cy = floorY - h;
    
    // Body
    ctx.fillStyle = state.crashed ? "#e74c3c" : "#3498db"; 
    ctx.fillRect(cx - w/2, cy, w, h);
    ctx.strokeStyle = "#2980b9"; ctx.lineWidth=2; ctx.strokeRect(cx - w/2, cy, w, h);
    
    // Wheels
    ctx.fillStyle = "#333";
    ctx.beginPath(); ctx.arc(cx - w/3, floorY, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + w/3, floorY, 8, 0, Math.PI*2); ctx.fill();
    
    // Mass Label
    ctx.fillStyle = "white"; ctx.font = "bold 12px sans-serif"; ctx.textAlign="center";
    ctx.fillText(state.m.toFixed(1) + "kg", cx, cy + h/2 + 4);
    
    // Vectors (if moving or just set up)
    // 1. Velocity (Green) - From Center
    if(Math.abs(state.v) > 0.1) {
        let vLen = state.v * 10;
        drawVector_4_1(cx, cy - 10, vLen, 0, "#27ae60", "v");
    }
    
    // 2. Momentum (Purple) - Above Velocity
    if(Math.abs(state.p) > 1) {
        let pLen = state.p * 1.5; // Scale for visibility
        // Cap length
        if(pLen > 200) pLen = 200;
        if(pLen < -200) pLen = -200;
        
        drawVector_4_1(cx, cy - 30, pLen, 0, "#8e44ad", "p");
    }
    
    // Impact Effect
    if(state.crashed) {
        ctx.fillStyle = "#e67e22"; ctx.font = "bold 24px sans-serif";
        ctx.fillText("CRASH!", cx, cy - 60);
        ctx.font = "16px sans-serif";
        ctx.fillText("Impact: " + state.impactP.toFixed(1) + " kg·m/s", cx, cy - 40);
    }
    
    // === ZONE 2: MOMENTUM BAR (Bottom) ===
    let barY = 500;
    let barH = 40;
    let barX = 100;
    let barW = 500;
    
    // Max P scale (20kg * 10m/s = 200)
    let maxP = 200;
    let curP = Math.abs(state.p);
    let fillW = (curP / maxP) * barW;
    
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = "#8e44ad"; ctx.fillRect(barX, barY, fillW, barH);
    ctx.strokeStyle = "#333"; ctx.lineWidth=2; ctx.strokeRect(barX, barY, barW, barH);
    
    ctx.fillStyle = "#333"; ctx.textAlign="right"; ctx.font = "bold 16px sans-serif";
    ctx.fillText("Momentum:", barX - 10, barY + 25);
    ctx.textAlign="left";
    ctx.fillText(curP.toFixed(1), barX + fillW + 10, barY + 25);
}

function drawVector_4_1(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(dy, dx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        ctx.font = "bold 14px serif";
        ctx.fillText(label, endX + (dx>0?5:-15), endY - 5);
    }
}

function renderQuestions_4_1() {
    let div = document.getElementById('u4-1-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Calculation</h4>
            <p>Set Mass ${v('m')} = <b>5.0 kg</b>.</p>
            <p>Set Velocity ${v('v')} = <b>8.0 m/s</b>.</p>
            <p>Calculate the Momentum ${v('p')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="kg·m/s" style="width:100px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_4_1(0)"> 
                <button onclick="checkAnswer_4_1(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: Target Velocity</h4>
            <p>You need an Impact Momentum of exactly <b>60.0 kg·m/s</b>.</p>
            <p>The Mass is locked at <b>10.0 kg</b>.</p>
            <p>Find the required velocity ${v('v')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_4_1(1)"> 
                <button onclick="checkAnswer_4_1(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Precision Demolition</h4>
            <p>The wall requires exactly <b>96.0 kg·m/s</b> to break optimally.</p>
            <p>You have free control of Mass and Velocity.</p>
            <p>Set the sliders and <b>Hit the Wall</b> with exactly 96.0!</p>
            <div style="margin-top:10px;">
                <button onclick="checkAnswer_4_1(2)" style="padding:5px 15px; cursor:pointer;">I Crushed It!</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; HEAVY HITTER &#9733;</h3>
            <p>You have mastered the basics of Momentum!</p>
        `;
    }
}

function checkAnswer_4_1(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    const v = (text) => `<i class="var">${text}</i>`;

    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // p = 5 * 8 = 40.
        if(state.m === 5.0 && state.v === 8.0 && Math.abs(val - 40.0) < 1.0) correct = true;
        else if(state.m !== 5.0 || state.v !== 8.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set sliders to m=5, v=8 first!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // 60 = 10 * v -> v = 6.0
        if(state.m === 10.0 && Math.abs(val - 6.0) < 0.2) correct = true;
    }
    else if(lvl === 2) {
        // Check actual impact
        if(state.crashed && Math.abs(state.impactP - 96.0) < 2.0) {
            correct = true;
        } else if (!state.crashed) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Launch the cart and hit the wall first!</span>`;
            return;
        } else {
             fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Impact was ${state.impactP.toFixed(1)}. Aim for 96.0!</span>`;
             return;
        }
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('4.1', state.level);
            
            if(state.level >= 3) document.getElementById('u4-1-badge').style.display = 'block';
            renderQuestions_4_1();
            reset_4_1();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your math!</span>`;
    }
}

function checkLevel_4_1() {
}

// ===============================================
// === UNIT 4.2: IMPULSE (Gold Standard v4.6) ===
// ===============================================

function setup_4_2() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "4.2 Impulse";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Force &times; Time</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Impulse (<i class="var">J</i>) is the change in momentum. It equals the Force multiplied by the Duration of impact.
        <br><b>Equation:</b> <i class="var">J</i> = <i class="var">F&Delta;t</i> = <i class="var">&Delta;p</i>
        <br><i><b>Mission:</b> Control the rocket burn to achieve the target velocity!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_4_2('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_4_2('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u4-2-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> IMPULSE ENGINEER
            </div>
        </div>

        <div id="calc-4-2" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Force (<i class="var">F</i>):</span>
                <span><span id="v-f">100</span> N</span>
            </label>
            <input type="range" id="in-f" class="phys-slider" min="-200" max="200" step="10" value="100" 
                oninput="updateState_4_2('F', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Duration (<i class="var">&Delta;t</i>):</span>
                <span><span id="v-dt">2.0</span> s</span>
            </label>
            <input type="range" id="in-dt" class="phys-slider" min="0.5" max="5.0" step="0.5" value="2.0" 
                oninput="updateState_4_2('dtBurn', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Mass (<i class="var">m</i>):</span>
                <span><span id="v-m">10.0</span> kg</span>
            </label>
            <input type="range" id="in-m" class="phys-slider" min="5.0" max="50.0" step="1.0" value="10.0" 
                oninput="updateState_4_2('m', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_4_2()" id="btn-start">Fire Rockets</button>
            <button class="btn btn-red" onclick="reset_4_2()">Reset</button>
        </div>
        
        <div id="u4-2-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_4_2();
}

function updateState_4_2(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'F') document.getElementById('v-f').innerText = state.F.toFixed(0);
    if(key === 'dtBurn') document.getElementById('v-dt').innerText = state.dtBurn.toFixed(1);
    if(key === 'm') document.getElementById('v-m').innerText = state.m.toFixed(1);
    
    calcPhysics_4_2();
    updateCalcDisplay_4_2();
    draw_4_2();
}

function setMode_4_2(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u4-2-questions');
    const badge = document.getElementById('u4-2-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        document.getElementById('in-f').disabled = false;
        document.getElementById('in-dt').disabled = false;
        document.getElementById('in-f').parentElement.style.opacity = "1.0";
        document.getElementById('in-dt').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_4_2();
    }
    
    updateLocks_4_2();
    draw_4_2();
    updateCalcDisplay_4_2();
}

function updateLocks_4_2() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_4_2() {
    state.impulse = state.F * state.dtBurn;
    state.deltaV = state.impulse / state.m;
    state.finalV = (state.v0 || 0) + state.deltaV;
}

function updateCalcDisplay_4_2() {
    let box = document.getElementById('calc-4-2');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let impulseVal = state.impulse.toFixed(0);
    let dvVal = state.deltaV.toFixed(1);
    
    box.innerHTML = `
        <div style="margin-bottom:10px;">
            ${v('J')} = ${v('F&Delta;t')} = <b>${impulseVal} N&middot;s</b>
        </div>
        <div style="font-size:1.1em;">
            ${v('&Delta;v')} = ${v('J')} / ${v('m')} = <b>${dvVal} m/s</b>
        </div>
    `;
}

function start_4_2() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.history = []; 
        
        calcPhysics_4_2();
        updateLocks_4_2();
        loop_4_2();
    }
}

function reset_4_2() {
    let savedLevel = loadProgress('4.2'); 

    state = {
        m: parseFloat(document.getElementById('in-m').value),
        F: parseFloat(document.getElementById('in-f').value),
        dtBurn: parseFloat(document.getElementById('in-dt').value),
        
        v0: 0,
        x: 0, 
        v: 0, 
        t: 0,
        
        running: false,
        burning: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    state.x = 50; 
    
    if(state.mode === 'guided') {
        if(state.level === 1 || state.level === 2) {
            state.v0 = 20.0;
            state.v = 20.0;
            state.x = 50;
        } else {
            state.v0 = 0;
            state.v = 0;
        }
    }
    
    calcPhysics_4_2();

    if(state.level >= 3) document.getElementById('u4-2-badge').style.display = 'block';

    setMode_4_2(state.mode);
    updateCalcDisplay_4_2();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_4_2();
        });
    });
}

function loop_4_2() {
    if(currentSim !== '4.2') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        if(state.t <= state.dtBurn) {
            state.burning = true;
            let a = state.F / state.m;
            state.v += a * dt;
        } else {
            state.burning = false;
        }
        
        state.x += state.v * dt * 5; 
        
        if(state.t * 60 % 3 < 1) { 
            state.history.push({
                t: state.t, 
                f: state.burning ? state.F : 0
            });
        }
        
        if(state.t > state.dtBurn + 2.0 || state.x > 650 || state.x < 0) {
            state.running = false;
            state.burning = false;
            if(state.mode === 'guided') checkLevel_4_2();
            updateLocks_4_2();
        }
    }

    draw_4_2();
    if(state.running) requestAnimationFrame(loop_4_2);
}

function draw_4_2() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let floorY = 300;

    // === ZONE 1: WORLD ===
    // Sky/Bg
    ctx.fillStyle = "#ecf0f1";
    ctx.fillRect(0, 0, 700, floorY);

    // Track
    ctx.fillStyle = "#95a5a6";
    ctx.fillRect(0, floorY, 700, 20);
    
    // Ticks
    ctx.fillStyle = "#7f8c8d";
    for (let i = 0; i < 700; i += 50) {
        ctx.fillRect(i, floorY, 2, 20);
    }

    // Sled
    let w = 60;
    let h = 30;
    let cx = state.x;
    let cy = floorY - h;

    // Body
    ctx.fillStyle = "#34495e";
    ctx.fillRect(cx - w / 2, cy, w, h);

    // Nozzle & Flame
    ctx.fillStyle = "#7f8c8d";
    
    if (state.F >= 0) {
        // Nozzle on Left (Pushing Right)
        ctx.fillRect(cx - w / 2 - 10, cy + 5, 10, 20);
        
        if (state.burning) {
            ctx.fillStyle = "#e67e22";
            ctx.beginPath();
            ctx.moveTo(cx - w / 2 - 10, cy + 5);
            ctx.lineTo(cx - w / 2 - 40, cy + 15);
            ctx.lineTo(cx - w / 2 - 10, cy + 25);
            ctx.fill();
        }
    } else {
        // Nozzle on Right (Pushing Left/Braking)
        ctx.fillRect(cx + w / 2, cy + 5, 10, 20);
        
        if (state.burning) {
            ctx.fillStyle = "#e67e22";
            ctx.beginPath();
            ctx.moveTo(cx + w / 2 + 10, cy + 5);
            ctx.lineTo(cx + w / 2 + 40, cy + 15);
            ctx.lineTo(cx + w / 2 + 10, cy + 25);
            ctx.fill();
        }
    }

    if (Math.abs(state.v) > 0.1) {
        drawVector_4_2(cx, cy - 20, state.v * 5, 0, "#27ae60", "v");
    }

    // === ZONE 2: GRAPHS ===
    let panelY = 350;
    let panelH = 250;
    let midX = 350;

    ctx.fillStyle = "white";
    ctx.fillRect(0, panelY, 700, panelH);
    
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, panelY);
    ctx.lineTo(midX, panelY + panelH);
    ctx.stroke();

    drawAreaGraph_4_2(50, panelY + 20, 250, 200, state.history, state.dtBurn);
    drawMomentumBars_4_2(400, panelY + 20, 250, 200);
}

function drawVector_4_2(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    let angle = Math.atan2(dy, dx);
    let headLen = 8;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.fill();

    if (label) {
        ctx.fillStyle = color;
        ctx.font = "bold 14px serif";
        ctx.fillText(label, endX + (dx > 0 ? 5 : -15), endY - 5);
    }
}

function drawAreaGraph_4_2(x, y, w, h, data, dtTotal) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    let midY = y + h / 2;
    ctx.beginPath();
    ctx.moveTo(x, midY);
    ctx.lineTo(x + w, midY);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.font = "12px sans-serif";
    ctx.fillText("Force vs Time", x + w / 2, y - 5);

    if (data.length > 0) {
        let tMax = Math.max(dtTotal * 1.5, 5.0);
        let fMax = 220;

        ctx.fillStyle = "rgba(142, 68, 173, 0.3)";
        ctx.beginPath();
        ctx.moveTo(x, midY);
        
        for (let i = 0; i < data.length; i++) {
            let p = data[i];
            let px = x + (p.t / tMax) * w;
            let py = midY - (p.f / fMax) * (h / 2);
            ctx.lineTo(px, py);
        }
        
        let last = data[data.length - 1];
        let pxEnd = x + (last.t / tMax) * w;
        ctx.lineTo(pxEnd, midY);
        ctx.fill();
    }
}

function drawMomentumBars_4_2(x, y, w, h) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    let midY = y + h / 2;
    ctx.beginPath();
    ctx.moveTo(x, midY);
    ctx.lineTo(x + w, midY);
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("Momentum Change", x + w / 2, y - 5);

    let scale = (h / 2) / 1000;

    // Initial Momentum
    let p0 = state.m * (state.v0 || 0);
    let h0 = p0 * scale;
    ctx.fillStyle = "#3498db";
    ctx.fillRect(x + 30, midY - h0, 40, h0);

    // Impulse
    let j = state.burning ? (state.F * state.t) : (state.F * state.dtBurn);
    if (state.t === 0) j = 0;
    let hj = j * scale;
    ctx.fillStyle = "#8e44ad";
    ctx.fillRect(x + 105, midY - hj, 40, hj);

    // Final Momentum
    let pf = state.m * state.v;
    let hf = pf * scale;
    ctx.fillStyle = "#27ae60";
    ctx.fillRect(x + 180, midY - hf, 40, hf);

    // Math Symbols
    ctx.fillStyle = "#333";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("+", x + 90, midY - 10);
    ctx.fillText("=", x + 165, midY - 10);
}

function checkLevel_4_2() {
}

// ===============================================
// === UNIT 4.3: CONSERVATION OF MOMENTUM (Gold Standard v4.6) ===
// ===============================================

function setup_4_3() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "4.3 Conservation of Momentum";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Collisions & Explosions</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        In an isolated system, the total momentum before an event equals the total momentum after.
        <br><b>Equation:</b> <i class="var">m<sub>1</sub>v<sub>1i</sub></i> + <i class="var">m<sub>2</sub>v<sub>2i</sub></i> = <i class="var">m<sub>1</sub>v<sub>1f</sub></i> + <i class="var">m<sub>2</sub>v<sub>2f</sub></i>
        <br><i><b>Mission:</b> Predict the outcome of the crash!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_4_3('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_4_3('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u4-3-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> COLLISION EXPERT
            </div>
        </div>

        <div id="calc-4-3" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-bottom:10px;">
            <label style="font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                <span>Type:</span>
                <select id="sel-type" onchange="updateState_4_3('type', this.value)" style="padding:2px;">
                    <option value="elastic">Elastic (Bounce)</option>
                    <option value="inelastic">Inelastic (Stick)</option>
                    <option value="explosion">Explosion (Push Apart)</option>
                </select>
            </label>
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Red Mass (<i class="var">m<sub>1</sub></i>):</span>
                <span><span id="v-m1">2.0</span> kg</span>
            </label>
            <input type="range" id="in-m1" class="phys-slider" min="1.0" max="10.0" step="0.5" value="2.0" 
                oninput="updateState_4_3('m1', this.value)">
            
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between; margin-top:5px;">
                <span>Red Vel (<i class="var">v<sub>1</sub></i>):</span>
                <span><span id="v-v1">4.0</span> m/s</span>
            </label>
            <input type="range" id="in-v1" class="phys-slider" min="-10.0" max="10.0" step="0.5" value="4.0" 
                oninput="updateState_4_3('v1', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px; margin-top:10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Blue Mass (<i class="var">m<sub>2</sub></i>):</span>
                <span><span id="v-m2">2.0</span> kg</span>
            </label>
            <input type="range" id="in-m2" class="phys-slider" min="1.0" max="10.0" step="0.5" value="2.0" 
                oninput="updateState_4_3('m2', this.value)">
            
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between; margin-top:5px;">
                <span>Blue Vel (<i class="var">v<sub>2</sub></i>):</span>
                <span><span id="v-v2">0.0</span> m/s</span>
            </label>
            <input type="range" id="in-v2" class="phys-slider" min="-10.0" max="10.0" step="0.5" value="0.0" 
                oninput="updateState_4_3('v2', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_4_3()" id="btn-start">Start</button>
            <button class="btn btn-red" onclick="reset_4_3()">Reset</button>
        </div>
        
        <div id="u4-3-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_4_3();
}

function updateState_4_3(key, val) {
    if(state.running) return;
    
    if(key === 'type') {
        state.type = val;
        // Logic for explosion: lock velocities to 0 visually?
        if(state.type === 'explosion') {
            document.getElementById('in-v1').disabled = true;
            document.getElementById('in-v2').disabled = true;
            document.getElementById('in-v1').parentElement.style.opacity = "0.5";
            document.getElementById('in-v2').parentElement.style.opacity = "0.5";
            state.v1 = 0; state.v2 = 0;
            document.getElementById('v-v1').innerText = "0.0";
            document.getElementById('v-v2').innerText = "0.0";
        } else {
            // Restore
            if(state.mode !== 'guided' || state.level !== 2) {
                document.getElementById('in-v1').disabled = false;
                document.getElementById('in-v2').disabled = false;
                document.getElementById('in-v1').parentElement.style.opacity = "1.0";
                document.getElementById('in-v2').parentElement.style.opacity = "1.0";
                state.v1 = parseFloat(document.getElementById('in-v1').value);
                state.v2 = parseFloat(document.getElementById('in-v2').value);
            }
        }
    } else {
        state[key] = parseFloat(val);
    }
    
    // Update labels
    document.getElementById('v-m1').innerText = state.m1.toFixed(1);
    document.getElementById('v-m2').innerText = state.m2.toFixed(1);
    
    // Only update V text if not in explosion mode (which forces 0)
    if(state.type !== 'explosion') {
        if(key === 'v1') document.getElementById('v-v1').innerText = state.v1.toFixed(1);
        if(key === 'v2') document.getElementById('v-v2').innerText = state.v2.toFixed(1);
    }

    calcPhysics_4_3();
    updateCalcDisplay_4_3();
    draw_4_3();
}

function setMode_4_3(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u4-3-questions');
    const badge = document.getElementById('u4-3-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        document.getElementById('sel-type').disabled = false;
    } else {
        qDiv.style.display = 'block';
        renderQuestions_4_3();
    }
    
    updateLocks_4_3();
    draw_4_3();
    updateCalcDisplay_4_3();
}

function updateLocks_4_3() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let typeSel = document.getElementById('sel-type');
    let lock = state.running;
    
    sliders.forEach(s => {
        // Exception for explosion velocities handled in updateState
        if(state.type === 'explosion' && (s.id==='in-v1'||s.id==='in-v2')) return;
        
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    
    typeSel.disabled = lock;
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_4_3() {
    // Initial Momentum
    state.p1i = state.m1 * state.v1;
    state.p2i = state.m2 * state.v2;
    state.ptot = state.p1i + state.p2i;
    
    // Final Velocities
    if(state.type === 'inelastic') {
        // v_f = (m1v1 + m2v2) / (m1+m2)
        let vf = state.ptot / (state.m1 + state.m2);
        state.v1f = vf;
        state.v2f = vf;
    } else if (state.type === 'elastic') {
        // Standard Elastic Formulas
        let m1 = state.m1, m2 = state.m2;
        let v1 = state.v1, v2 = state.v2;
        
        state.v1f = ((m1 - m2)*v1 + 2*m2*v2) / (m1 + m2);
        state.v2f = ((2*m1)*v1 + (m2 - m1)*v2) / (m1 + m2);
    } else {
        // Explosion
        // Assume Impulse J based on spring energy? 
        // Let's just define a separation speed V_sep = 5.0 m/s for simplicity
        // v2f - v1f = 5.0
        // m1v1f + m2v2f = 0 (since start 0)
        // v1f = - (m2/m1) v2f
        // v2f - (-m2/m1 v2f) = 5
        // v2f (1 + m2/m1) = 5
        // v2f = 5 / (1 + m2/m1)
        
        let v_sep = 6.0; // Explosion force
        state.v2f = v_sep / (1 + state.m2/state.m1);
        state.v1f = -state.v2f * (state.m2/state.m1);
        
        // Update ptot for display? It should be 0.
        // ptot is calculated from v1, v2 (which are 0)
    }
}

function updateCalcDisplay_4_3() {
    let box = document.getElementById('calc-4-3');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    // If explosion, showing P=0 is boring. Show recoil ratio?
    if(state.type === 'explosion') {
        box.innerHTML = `
            <div style="margin-bottom:5px;">
                <b>Explosion (Recoil)</b>
            </div>
            <div style="font-size:1.1em;">
                ${v('p<sub>total</sub>')} = 0 &nbsp;&rightarrow;&nbsp; ${v('m<sub>1</sub>v<sub>1</sub>')} = -${v('m<sub>2</sub>v<sub>2</sub>')}
            </div>
        `;
    } else {
        let pStr = state.ptot.toFixed(1);
        box.innerHTML = `
            <div style="margin-bottom:5px;">
                ${v('p<sub>total</sub>')} = ${v('p<sub>1</sub>')} + ${v('p<sub>2</sub>')}
            </div>
            <div style="font-size:1.1em;">
                <b>${pStr}</b> = (${state.p1i.toFixed(1)}) + (${state.p2i.toFixed(1)})
            </div>
        `;
    }
}

function start_4_3() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.collided = false;
        state.history = []; 
        
        // Reset positions
        // Center collision at x=350.
        // Need time to collision.
        // x1 = 350 - d1, x2 = 350 + d2
        // We want them to hit in ~1.5 seconds?
        // Let's just spawn them 200px apart and let them move.
        // Wait, what if velocities are away?
        
        if(state.type === 'explosion') {
            state.x1 = 340; // Touching
            state.x2 = 360;
            state.collided = true; // Start in "post collision" logic immediately
        } else {
            state.x1 = 150;
            state.x2 = 550;
            state.collided = false;
        }
        
        // Current velocities start as initial
        if(state.type === 'explosion') {
            state.cv1 = state.v1f; // Jump to final
            state.cv2 = state.v2f;
        } else {
            state.cv1 = state.v1;
            state.cv2 = state.v2;
        }
        
        calcPhysics_4_3(); // Ensure finals are ready
        updateLocks_4_3();
        loop_4_3();
    }
}

function reset_4_3() {
    let savedLevel = loadProgress('4.3'); 

    state = {
        m1: parseFloat(document.getElementById('in-m1').value),
        v1: parseFloat(document.getElementById('in-v1').value),
        m2: parseFloat(document.getElementById('in-m2').value),
        v2: parseFloat(document.getElementById('in-v2').value),
        
        type: document.getElementById('sel-type').value,
        
        x1: 150, x2: 550,
        cv1: 0, cv2: 0,
        
        t: 0,
        running: false,
        collided: false,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Level Setup
    if(state.mode === 'guided') {
        let sel = document.getElementById('sel-type');
        let v1s = document.getElementById('in-v1');
        let v2s = document.getElementById('in-v2');
        let m1s = document.getElementById('in-m1');
        let m2s = document.getElementById('in-m2');
        
        // Reset locks
        v1s.disabled = false; v2s.disabled = false; m1s.disabled = false; m2s.disabled = false;
        v1s.parentElement.style.opacity = "1.0";
        
        if(state.level === 0) {
            // Level 1: Inelastic
            sel.value = 'inelastic';
            state.type = 'inelastic';
            sel.disabled = true;
            
            // Set scenario
            state.m1 = 4.0; state.v1 = 5.0;
            state.m2 = 4.0; state.v2 = 0.0;
            
            // Update inputs
            document.getElementById('in-m1').value = 4;
            document.getElementById('in-v1').value = 5;
            document.getElementById('in-m2').value = 4;
            document.getElementById('in-v2').value = 0;
            
            // Lock sliders to ensure simplicity?
            // Prompt asks "Calculate final v". Let them play with sliders?
            // Usually guided levels imply specific setup.
            // Let's force values in reset, but let user change them?
            // No, the checkAnswer usually expects specific numbers. 
            // Let's Lock the scenario for L1.
            m1s.disabled = true; m2s.disabled = true; v2s.disabled = true;
            m1s.parentElement.style.opacity = "0.5";
        } 
        else if (state.level === 1) {
            // Level 2: Elastic
            sel.value = 'elastic';
            state.type = 'elastic';
            sel.disabled = true;
            // Newton's Cradle setup
            state.m1 = 3.0; state.v1 = 6.0;
            state.m2 = 3.0; state.v2 = 0.0;
            
            document.getElementById('in-m1').value = 3;
            document.getElementById('in-v1').value = 6;
            document.getElementById('in-m2').value = 3;
            document.getElementById('in-v2').value = 0;
            
            m1s.disabled = true; m2s.disabled = true; v2s.disabled = true;
            m1s.parentElement.style.opacity = "0.5";
        }
        else if (state.level === 2) {
            // Level 3: Explosion
            sel.value = 'explosion';
            state.type = 'explosion';
            sel.disabled = true;
            
            // User can change masses to see recoil ratio
            state.v1 = 0; state.v2 = 0;
            v1s.disabled = true; v2s.disabled = true; // Locked to 0
        }
        
        // Visual updates
        document.getElementById('v-m1').innerText = state.m1.toFixed(1);
        document.getElementById('v-v1').innerText = state.v1.toFixed(1);
        document.getElementById('v-m2').innerText = state.m2.toFixed(1);
        document.getElementById('v-v2').innerText = state.v2.toFixed(1);
    }
    
    calcPhysics_4_3();

    if(state.level >= 3) document.getElementById('u4-3-badge').style.display = 'block';

    setMode_4_3(state.mode);
    updateCalcDisplay_4_3();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_4_3();
        });
    });
}

function loop_4_3() {
    if(currentSim !== '4.3') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        if(state.type === 'explosion') {
            // They just move apart
            state.x1 += state.cv1 * dt * 20;
            state.x2 += state.cv2 * dt * 20;
        } else {
            // Collision Logic
            // Check proximity
            let dist = state.x2 - state.x1;
            let combinedWidth = 80; // 40 half-width * 2
            
            if(!state.collided && dist <= combinedWidth) {
                // COLLISION EVENT
                state.collided = true;
                
                // Swap to final velocities
                state.cv1 = state.v1f;
                state.cv2 = state.v2f;
                
                // Correction to prevent overlap sticking
                // If stick: move together
                // If bounce: ensure separating
            }
            
            state.x1 += state.cv1 * dt * 20;
            state.x2 += state.cv2 * dt * 20;
        }
        
        // Stop if off screen
        if(state.x1 < -50 || state.x2 > 750 || state.x1 > 750 || state.x2 < -50) {
            state.running = false;
            if(state.mode === 'guided') checkLevel_4_3();
            updateLocks_4_3();
        }
    }

    draw_4_3();
    
    if(state.running) requestAnimationFrame(loop_4_3);
}

function draw_4_3() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    let trackY = 300;
    
    // === ZONE 1: TRACK ===
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, trackY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, trackY, 700, 40);
    
    // Carts
    let w = 80; let h = 40;
    
    // Cart 1 (Red)
    let c1x = state.x1;
    ctx.fillStyle = "#c0392b"; ctx.fillRect(c1x - w/2, trackY - h, w, h);
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(c1x - 20, trackY, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(c1x + 20, trackY, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "white"; ctx.font = "bold 12px sans-serif"; ctx.textAlign="center";
    ctx.fillText(state.m1+"kg", c1x, trackY - 15);
    
    // Cart 2 (Blue)
    let c2x = state.x2;
    ctx.fillStyle = "#2980b9"; ctx.fillRect(c2x - w/2, trackY - h, w, h);
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(c2x - 20, trackY, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(c2x + 20, trackY, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "white"; ctx.fillText(state.m2+"kg", c2x, trackY - 15);
    
    // Vectors (Velocity)
    // Red
    if(Math.abs(state.cv1) > 0.1) {
        drawVector_4_3(c1x, trackY - h - 10, state.cv1 * 10, 0, "#e74c3c", "v1");
    }
    // Blue
    if(Math.abs(state.cv2) > 0.1) {
        drawVector_4_3(c2x, trackY - h - 10, state.cv2 * 10, 0, "#3498db", "v2");
    }
    
    // Bang!
    if(state.collided && state.type !== 'explosion' && state.running) {
        // Show flash for a few frames? 
        // Simplification: Just visual text nearby if recently collided?
        // Let's skip complex particles for now.
    }
    
    // === ZONE 2: DATA PANEL ===
    let panelY = 360;
    
    // Momentum Bars
    // Draw stacked bar for total momentum
    // Or simpler: Red Bar (p1), Blue Bar (p2), Total Line
    let graphX = 100; let graphY = 400; let gH = 150; let gW = 500;
    
    ctx.fillStyle = "white"; ctx.fillRect(0, panelY, 700, 300);
    ctx.strokeStyle = "#ccc"; ctx.lineWidth=1; ctx.strokeRect(0, panelY, 700, 0); // Divider line
    
    // Axis
    let midY = graphY + gH/2;
    ctx.strokeStyle = "#333"; ctx.beginPath(); ctx.moveTo(graphX, midY); ctx.lineTo(graphX+gW, midY); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.textAlign="center"; ctx.fillText("Momentum (kg·m/s)", graphX + gW/2, graphY - 10);
    
    // Scale
    let maxP = 60; // Fixed scale
    let scale = (gW/2) / maxP; // px per unit
    let zeroX = graphX + gW/2;
    
    // Function to draw bar
    const drawBar = (y, val, color, label) => {
        let len = val * scale;
        ctx.fillStyle = color;
        ctx.fillRect(zeroX, y, len, 20);
        ctx.textAlign = len > 0 ? "left" : "right";
        ctx.fillText(val.toFixed(1), zeroX + len + (len>0?5:-5), y+15);
        ctx.textAlign = "right";
        ctx.fillStyle = "#333";
        ctx.fillText(label, zeroX - 10, y+15);
    };
    
    let p1 = state.m1 * state.cv1;
    let p2 = state.m2 * state.cv2;
    let pTot = p1 + p2;
    
    drawBar(midY - 50, p1, "#c0392b", "Red P");
    drawBar(midY - 20, p2, "#2980b9", "Blue P");
    drawBar(midY + 30, pTot, "#8e44ad", "Total P");
}

function drawVector_4_3(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(dy, dx);
    let headLen = 8;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        ctx.font = "bold 12px serif";
        ctx.fillText(label, endX, endY - 5);
    }
}

function renderQuestions_4_3() {
    let div = document.getElementById('u4-3-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Sticky Collision</h4>
            <p>Red (${v('m')} = 4kg, ${v('v')} = 5m/s) hits stationary Blue (${v('m')} = 4kg).</p>
            <p>They stick together. Momentum is conserved.</p>
            <p>Calculate the final velocity ${v('v<sub>f</sub>')} of the combined mass.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_4_3(0)"> 
                <button onclick="checkAnswer_4_3(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: Newton's Cradle</h4>
            <p>Elastic Collision. Masses are equal (3kg). Red hits Blue at 6 m/s.</p>
            <p>Blue is initially at rest.</p>
            <p>Predict Blue's final velocity ${v('v<sub>2f</sub>')}.</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_4_3(1)"> 
                <button onclick="checkAnswer_4_3(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Recoil Ratio</h4>
            <p>Explosion! Total Momentum is zero.</p>
            <p>Set ${v('m<sub>1</sub>')} = <b>2.0 kg</b> and ${v('m<sub>2</sub>')} = <b>4.0 kg</b>.</p>
            <p>If Red shoots left at <b>-4.0 m/s</b>, what is Blue's velocity?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-3" placeholder="m/s" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_4_3(2)"> 
                <button onclick="checkAnswer_4_3(2)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; COLLISION EXPERT &#9733;</h3>
            <p>You have mastered Conservation of Momentum!</p>
        `;
    }
}

function checkAnswer_4_3(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    
    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // p_tot = 4*5 + 0 = 20. m_tot = 8. vf = 20/8 = 2.5
        if(Math.abs(val - 2.5) < 0.2) correct = true;
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // Equal mass elastic -> velocity swap. Blue gets 6.0.
        if(Math.abs(val - 6.0) < 0.2) correct = true;
    }
    else if(lvl === 2) {
        let val = parseFloat(document.getElementById('ans-3').value);
        // p1 + p2 = 0. m1v1 + m2v2 = 0.
        // 2*(-4) + 4*v2 = 0.
        // -8 + 4v2 = 0. v2 = 2.0.
        if(Math.abs(val - 2.0) < 0.2) correct = true;
        // Verify they set the sliders? 
        // Logic check: if they just type 2.0 without setting mass, is it cheating?
        // Sim shows "Explosion" mode locks v. They just need to set M.
        if(state.m1 !== 2.0 || state.m2 !== 4.0) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set masses to 2.0 and 4.0!</span>`;
            return;
        }
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('4.3', state.level);
            
            if(state.level >= 3) document.getElementById('u4-3-badge').style.display = 'block';
            renderQuestions_4_3();
            reset_4_3();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check the momentum equation!</span>`;
    }
}

function checkLevel_4_3() {
}

// ===============================================
// === UNIT 4.4: 1D COLLISIONS (Formerly 5.1) ===
// ===============================================

function setup_4_4() {
    canvas.width = 700; 
    canvas.height = 600; 

    document.getElementById('sim-title').innerText = "4.4 Elastic & Inelastic Collisions";
    document.getElementById('sim-title').style.marginBottom = "-10px";

    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">Conservation of Momentum</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        <b>Momentum</b> (<span class="var">p = mv</span>) is conserved in all collisions.
        <br><b>Elasticity</b> determines if Kinetic Energy is conserved (Bounce) or lost (Stick).
        <br><i><b>Mission:</b> Analyze the collisions below to unlock the simulation controls!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_4_4('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_4_4('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u5-mastery-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> AP MASTER
            </div>
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold;">Blue Cart Mass (<i class="var">m<sub>1</sub></i>): <span id="v-m1">2.0</span> kg</label>
            <input type="range" id="in-m1" class="phys-slider" min="1.0" max="10.0" step="0.5" value="2.0" 
                oninput="updateState_4_4('m1', this.value)">
            
            <label style="color:#2980b9;">Initial Velocity (<i class="var">v<sub>1i</sub></i>): <span id="v-u1">4.0</span> m/s</label>
            <input type="range" id="in-u1" class="phys-slider" min="-10" max="10" step="1" value="4.0" 
                oninput="updateState_4_4('u1', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold;">Red Cart Mass (<i class="var">m<sub>2</sub></i>): <span id="v-m2">2.0</span> kg</label>
            <input type="range" id="in-m2" class="phys-slider" min="1.0" max="10.0" step="0.5" value="2.0" 
                oninput="updateState_4_4('m2', this.value)">
            
            <label style="color:#c0392b;">Initial Velocity (<i class="var">v<sub>2i</sub></i>): <span id="v-u2">-4.0</span> m/s</label>
            <input type="range" id="in-u2" class="phys-slider" min="-10" max="10" step="1" value="-4.0" 
                oninput="updateState_4_4('u2', this.value)">
        </div>

        <div class="control-group" style="margin-top:10px;">
            <label>Elasticity (<i class="var">e</i>): <span id="v-e">100</span>%</label>
            <input type="range" id="in-e" class="phys-slider" min="0" max="1" step="0.1" value="1.0" 
                oninput="updateState_4_4('e', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">
            <div style="display:flex; gap:10px;">
                <button class="btn btn-green" onclick="start_4_4()">Run Collision</button>
                <button class="btn btn-red" onclick="reset_4_4()">Reset</button>
            </div>
            <label style="font-weight:normal; cursor:pointer; display:flex; align-items:center; white-space:nowrap;">
                <input type="checkbox" id="show-cm" style="margin-right:5px;" onclick="state.showCM = this.checked; loop_4_4();"> 
                Show Center of Mass
            </label>
        </div>

        <div style="margin-top:15px; padding:15px; background:#fff; border:1px solid #ddd; border-radius:4px; font-family:'Times New Roman', serif;">
            <div id="eq-p-init" style="margin-bottom:8px; font-size:1.0em; color:#555;"></div>
            <div id="eq-p-final" style="font-size:1.0em; font-weight:bold; color:#000;"></div>
        </div>
        
        <div id="u5-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
            </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_4_4();
}

function updateState_4_4(key, val) {
    if(state.running) return; 
    state[key] = parseFloat(val);
    
    if(key === 'm1') document.getElementById('v-m1').innerText = state.m1.toFixed(1);
    if(key === 'u1') document.getElementById('v-u1').innerText = state.u1.toFixed(1);
    if(key === 'm2') document.getElementById('v-m2').innerText = state.m2.toFixed(1);
    if(key === 'u2') document.getElementById('v-u2').innerText = state.u2.toFixed(1);
    if(key === 'e') document.getElementById('v-e').innerText = (state.e * 100).toFixed(0);
    
    if(key === 'e') document.getElementById('in-e').value = state.e;

    state.v1 = state.u1;
    state.v2 = state.u2;
    state.x1 = 200;
    state.x2 = 500;
    state.collided = false;
    
    loop_4_4(); 
}

function setMode_4_4(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u5-questions');
    const badge = document.getElementById('u5-mastery-badge');

    if(state.level >= 4) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
    } else {
        qDiv.style.display = 'block';
        renderQuestions_4_4();
    }
    updateLocks_4_4();
}

function updateLocks_4_4() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.querySelector('.btn-green');
    
    let lockAll = state.running; 
    
    sliders.forEach(s => {
        s.disabled = lockAll;
        s.style.opacity = lockAll ? "0.5" : "1.0";
    });
    runBtn.disabled = lockAll;
    runBtn.style.opacity = lockAll ? "0.5" : "1.0";

    if(!state.running && state.mode === 'guided') {
        if(state.level === 0) {
            let eSlider = document.getElementById('in-e');
            eSlider.disabled = true;
            eSlider.style.opacity = "0.5";
            if(state.e !== 0) updateState_4_4('e', 0);
        }
    }
}

function start_4_4() {
    if(!state.running) {
        state.running = true;
        updateLocks_4_4(); 
        loop_4_4();
    }
}

function reset_4_4() {
    let savedLevel = loadProgress('4.4'); // Updated ID

    state = {
        m1: parseFloat(document.getElementById('in-m1').value),
        m2: parseFloat(document.getElementById('in-m2').value),
        u1: parseFloat(document.getElementById('in-u1').value),
        u2: parseFloat(document.getElementById('in-u2').value),
        e: parseFloat(document.getElementById('in-e').value),
        
        v1: 0, v2: 0,
        x1: 200, x2: 500,
        w: 80, h: 50,
        
        running: false,
        collided: false,
        showCM: document.getElementById('show-cm').checked,
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    state.v1 = state.u1;
    state.v2 = state.u2;
    
    if(state.level >= 4) document.getElementById('u5-mastery-badge').style.display = 'block';

    setMode_4_4(state.mode);
    loop_4_4();
}

function loop_4_4() {
    if(currentSim !== '4.4') return;

    if(state.running) {
        let dt = 0.05; 
        let steps = 4; 

        for(let i=0; i<steps; i++) {
            state.x1 += state.v1 * dt;
            state.x2 += state.v2 * dt;

            let dist = state.x2 - state.x1;
            let minDist = state.w; 
            
            if(!state.collided && dist <= minDist) {
                state.collided = true;
                
                let m1 = state.m1, m2 = state.m2;
                let u1 = state.v1, u2 = state.v2;
                let e = state.e;

                let v1f = ((m1 - e*m2)*u1 + (1+e)*m2*u2) / (m1+m2);
                let v2f = ((m2 - e*m1)*u2 + (1+e)*m1*u1) / (m1+m2);

                state.v1 = v1f;
                state.v2 = v2f;

                let overlap = minDist - dist;
                state.x1 -= overlap/2 + 0.1;
                state.x2 += overlap/2 + 0.1;
            }
        }
        
        if(state.x1 < -200 || state.x2 > 900) state.running = false;
        if(!state.running) updateLocks_4_4();
    }

    let p1 = state.m1 * state.v1;
    let p2 = state.m2 * state.v2;
    let pTotal = p1 + p2;
    
    let p1i = state.m1 * state.u1;
    let p2i = state.m2 * state.u2;
    let pTi = p1i + p2i;

    let ke_init = 0.5*state.m1*state.u1*state.u1 + 0.5*state.m2*state.u2*state.u2;
    let ke_curr = 0.5*state.m1*state.v1*state.v1 + 0.5*state.m2*state.v2*state.v2;
    let thermal = Math.max(0, ke_init - ke_curr);

    let fmtP = (val, col) => {
        let num = val.toFixed(1);
        if(val < 0) num = `(${num})`;
        return `<span style="color:${col}; font-weight:bold;">${num}</span>`;
    };

    // FIX: Reduced font size to 0.9em to prevent line breaks
    document.getElementById('eq-p-init').innerHTML = 
        `<div style="font-size:0.95em; color:#555; margin-bottom:2px;">Initial Momentum:</div>
         <div style="font-size:0.9em; margin-bottom:10px;">
            ${fmtP(p1i, '#2980b9')} + ${fmtP(p2i, '#c0392b')} = <b>${pTi.toFixed(1)}</b> kg·m/s
         </div>`;
    
    document.getElementById('eq-p-final').innerHTML = 
        `<div style="font-size:0.95em; color:#000; margin-bottom:2px;">Current Momentum:</div>
         <div style="font-size:0.9em;">
            ${fmtP(p1, '#2980b9')} + ${fmtP(p2, '#c0392b')} = <b>${pTotal.toFixed(1)}</b> kg·m/s
         </div>`;

    draw_4_4(p1, p2, pTotal, ke_curr, thermal, ke_init);
    
    if(state.running) requestAnimationFrame(loop_4_4);
}

function draw_4_4(p1, p2, pTotal, ke, thermal, eTotal) {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    let trackY = 150; 
    let trackH = 40;
    ctx.fillStyle = "#ecf0f1"; ctx.fillRect(0,0,700, trackY); 
    ctx.fillStyle = "#bdc3c7"; ctx.fillRect(0, trackY, 700, trackH); 
    
    let cartY = trackY - state.h; 
    drawCart(state.x1, cartY, state.w, state.h, "#3498db", "#2980b9", state.m1, state.v1);
    drawCart(state.x2, cartY, state.w, state.h, "#e74c3c", "#c0392b", state.m2, state.v2);
    
    if(state.showCM) {
        let cmX = (state.m1*(state.x1+state.w/2) + state.m2*(state.x2+state.w/2)) / (state.m1+state.m2);
        let cmY = cartY + state.h/2;
        ctx.fillStyle = "#f1c40f"; ctx.strokeStyle = "black"; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cmX, cmY-10); ctx.lineTo(cmX+10, cmY); ctx.lineTo(cmX, cmY+10); ctx.lineTo(cmX-10, cmY);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "black"; ctx.font = "bold 11px sans-serif"; ctx.fillText("CM", cmX-8, cmY-15);
    }

    // FIX: Moved Up to 250, Height increased to 350
    let panelY = 250; 
    let panelH = 350; 
    ctx.fillStyle = "white"; ctx.fillRect(0, panelY, 700, panelH);
    ctx.strokeStyle = "#ddd"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(0, panelY); ctx.lineTo(700, panelY); ctx.stroke();

    // --- LEFT GRAPH: MOMENTUM ---
    let mZeroX = 60; 
    let mZeroY = panelY + 175; // Centered vertically in the new taller panel
    // FIX: Scale set to 0.7 to fit 200 units into roughly 150px
    let mScale = 0.7; 

    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mZeroX, mZeroY); ctx.lineTo(330, mZeroY); ctx.stroke(); 
    ctx.beginPath(); ctx.moveTo(mZeroX, panelY+20); ctx.lineTo(mZeroX, panelY+panelH-20); ctx.stroke(); 

    ctx.fillStyle = "#555"; ctx.font = "10px sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    // FIX: Axis Loop now covers -200 to 200
    for(let v = -200; v <= 200; v += 50) { 
        if(v === 0) continue; 
        let y = mZeroY - (v * mScale);
        if(y > panelY+20 && y < panelY+panelH-20) {
            ctx.beginPath(); ctx.moveTo(mZeroX, y); ctx.lineTo(mZeroX-5, y); ctx.stroke();
            ctx.fillText(v, mZeroX - 8, y);
        }
    }
    ctx.fillText("0", mZeroX - 8, mZeroY);

    ctx.save();
    ctx.translate(20, mZeroY); 
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = "center";
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#333";
    ctx.fillText("Momentum (kg·m/s)", 0, 0);
    ctx.restore();

    drawBar(110, mZeroY, p1, mScale, "#2980b9", "p", "1");
    drawBar(190, mZeroY, p2, mScale, "#c0392b", "p", "2");
    drawBar(270, mZeroY, pTotal, mScale, "#8e44ad", "p", "tot");


    // --- RIGHT GRAPH: ENERGY ---
    let eZeroX = 420; 
    let eZeroY = panelY + 310; // Lowered baseline for taller graph
    let eScale = 0.25; 

    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(eZeroX, eZeroY); ctx.lineTo(680, eZeroY); ctx.stroke(); 
    ctx.beginPath(); ctx.moveTo(eZeroX, panelY+20); ctx.lineTo(eZeroX, eZeroY); ctx.stroke(); 

    ctx.fillStyle = "#555"; ctx.font = "10px sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for(let v = 200; v <= 1000; v += 200) {
        let y = eZeroY - (v * eScale);
        if(y > panelY+20) {
            ctx.beginPath(); ctx.moveTo(eZeroX, y); ctx.lineTo(eZeroX-5, y); ctx.stroke();
            ctx.fillText(v, eZeroX - 8, y);
        }
    }
    ctx.fillText("0", eZeroX - 8, eZeroY);

    ctx.save();
    ctx.translate(380, eZeroY - 140); 
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = "center";
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "#333";
    ctx.fillText("Energy (J)", 0, 0);
    ctx.restore();

    drawBar(480, eZeroY, ke, eScale, "#27ae60", "KE", "", true);
    drawBar(560, eZeroY, thermal, eScale, "#e67e22", "T", "", true);
    drawBar(640, eZeroY, eTotal, eScale, "#333", "E", "tot", true);
}

function drawCart(x, y, w, h, fill, stroke, m, v) {
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
    
    ctx.fillStyle = "#333";
    ctx.beginPath(); ctx.arc(x+15, y+h+5, 6, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+w-15, y+h+5, 6, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = "white"; ctx.font = "bold 12px sans-serif"; ctx.textAlign="center";
    ctx.fillText(m.toFixed(1)+"kg", x+w/2, y+h/2+5);
    
    if(Math.abs(v) > 0.1) {
        let vLen = v * 8; 
        let vy = y - 20; 
        let vx = x + w/2;
        drawVector(vx, vy, vLen, 0, "#9b59b6");
        
        ctx.fillStyle = "#9b59b6"; ctx.font = "bold 12px sans-serif";
        ctx.fillText(v.toFixed(1)+" m/s", vx + vLen/2, vy - 10);
    }
}

function drawBar(x, zeroY, val, scale, color, label, sub="", anchorBottom=false) {
    let h = val * scale;
    ctx.fillStyle = color;
    if(anchorBottom) {
        ctx.fillRect(x-15, zeroY - h, 30, h);
    } else {
        ctx.fillRect(x-15, zeroY, 30, -h);
    }
    
    ctx.fillStyle = "#333"; 
    let textY = zeroY + (anchorBottom ? 20 : (h>0 ? 20 : -20));
    
    // Draw Label with Subscript logic
    if(label) {
        if(sub) {
            // Draw Main Variable (Italic)
            ctx.font = "italic 16px Times New Roman"; 
            let mainW = ctx.measureText(label).width;
            
            // Draw Subscript (Normal, smaller)
            ctx.font = "12px Times New Roman";
            let subW = ctx.measureText(sub).width;
            let totalW = mainW + subW;
            
            let startX = x - totalW/2;
            
            ctx.font = "italic 16px Times New Roman";
            ctx.textAlign = "left";
            ctx.fillText(label, startX, textY);
            
            ctx.font = "12px Times New Roman";
            ctx.fillText(sub, startX + mainW, textY + 5); // Shifted down for subscript effect
        } else {
            // Standard Label
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(label, x, textY);
        }
    }
    
    // Draw Value
    ctx.font = "bold 12px sans-serif"; ctx.textAlign="center";
    ctx.fillText(val.toFixed(1), x, zeroY + (anchorBottom ? -h-5 : (h>0 ? -h-5 : -h+15)));
}

function renderQuestions_4_4() {
    let div = document.getElementById('u5-questions');
    let inputStyle = "width:80px; padding:5px; margin-right:10px; border:1px solid #ccc; border-radius:4px;";
    let btnStyle = "padding:5px 15px; background:#27ae60; color:white; border:none; border-radius:4px; cursor:pointer;";

    // Helper for variable styling
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: The Sticky Crash</h4>
            <p style="line-height:1.6; margin-bottom:10px;">
                Set ${v('e')} (Elasticity) to <b>0%</b>.<br>
                Set <b style="color:#2980b9">${v('m<sub>1</sub>')} = 2.0 kg</b>, ${v('v<sub>1i</sub>')} = 4.0 m/s.<br>
                Set <b style="color:#c0392b">${v('m<sub>2</sub>')} = 2.0 kg</b>, ${v('v<sub>2i</sub>')} = 0 m/s.
            </p>
            <p style="margin-bottom:10px;">Calculate the final velocity when they stick together.</p>
            <div>
                <input type="number" id="ans-0" placeholder="m/s" style="${inputStyle}" onkeydown="if(event.key==='Enter') checkAnswer_4_4(0)">
                <button style="${btnStyle}" onclick="checkAnswer_4_4(0)">Check</button>
            </div>
            <span id="fb-0" style="display:block; margin-top:10px; font-weight:bold;"></span>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Head-On Collision</h4>
            <p style="line-height:1.6; margin-bottom:10px;">
                Set ${v('e')} to <b>0%</b>.<br>
                Set <b style="color:#2980b9">${v('m<sub>1</sub>')} = 4.0 kg</b>, ${v('v<sub>1i</sub>')} = 4.0 m/s.<br>
                Set <b style="color:#c0392b">${v('m<sub>2</sub>')} = 4.0 kg</b>, ${v('v<sub>2i</sub>')} = -4.0 m/s.
            </p>
            <p style="margin-bottom:10px;">What is the total final momentum?</p>
            <div>
                <input type="number" id="ans-1" placeholder="kg·m/s" style="${inputStyle}" onkeydown="if(event.key==='Enter') checkAnswer_4_4(1)">
                <button style="${btnStyle}" onclick="checkAnswer_4_4(1)">Check</button>
            </div>
            <span id="fb-1" style="display:block; margin-top:10px; font-weight:bold;"></span>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: Elastic Bounce</h4>
            <p style="line-height:1.6; margin-bottom:10px;">
                Set ${v('e')} to <b>100%</b>. Equal masses (<b>2.0 kg</b>).<br>
                ${v('v<sub>1i</sub>')} = 4.0 m/s, ${v('v<sub>2i</sub>')} = 0 m/s.
            </p>
            <p style="margin-bottom:10px;">Predict the final velocity of the <b style="color:#c0392b">Red Cart</b> (${v('v<sub>2f</sub>')}).</p>
            <div>
                <input type="number" id="ans-2" placeholder="m/s" style="${inputStyle}" onkeydown="if(event.key==='Enter') checkAnswer_4_4(2)">
                <button style="${btnStyle}" onclick="checkAnswer_4_4(2)">Check</button>
            </div>
            <span id="fb-2" style="display:block; margin-top:10px; font-weight:bold;"></span>
        `;
    } else if(state.level === 3) {
         div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#f39c12;">Level 4: AP Challenge</h4>
            <p style="line-height:1.6; margin-bottom:10px;">
                Elastic (<b>100%</b>).<br>
                <b style="color:#2980b9">${v('m<sub>1</sub>')} = 1.0 kg</b>, ${v('v<sub>1i</sub>')} = 6.0 m/s.<br>
                <b style="color:#c0392b">${v('m<sub>2</sub>')} = 3.0 kg</b>, ${v('v<sub>2i</sub>')} = 0 m/s.
            </p>
            <p style="margin-bottom:10px;">Calculate ${v('v<sub>1f</sub>')} (Careful with the sign!).</p>
            <div>
                <input type="number" id="ans-3" placeholder="m/s" style="${inputStyle}" onkeydown="if(event.key==='Enter') checkAnswer_4_4(3)">
                <button style="${btnStyle}" onclick="checkAnswer_4_4(3)">Check</button>
            </div>
            <span id="fb-3" style="display:block; margin-top:10px; font-weight:bold;"></span>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; MASTERY ACHIEVED &#9733;</h3>
            <p>You have unlocked the Center of Mass tool and full controls.</p>
        `;
    }
}

function checkAnswer_4_4(lvl) {
    let val = parseFloat(document.getElementById('ans-'+lvl).value);
    let correct = false;
    let tol = 0.2;
    
    if(lvl === 0) {
        if(Math.abs(val - 2.0) < tol) correct = true;
    }
    else if(lvl === 1) {
        if(Math.abs(val - 0) < tol) correct = true;
    }
    else if(lvl === 2) {
        if(Math.abs(val - 4.0) < tol) correct = true;
    }
    else if(lvl === 3) {
        if(Math.abs(val - (-3.0)) < tol) correct = true;
    }
    
    let fb = document.getElementById('fb-'+lvl);
    if(correct) {
        // FIX: Updated message to be consistent with Units 1.2 and 2.7
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        
        if(state.level === lvl) {
             state.level++;
             saveProgress('4.4', state.level); 
        }
        
        if(state.level >= 4) document.getElementById('u5-mastery-badge').style.display = 'block';
        
        // FIX: Increased delay to 1500ms so the user has time to read the message
        setTimeout(renderQuestions_4_4, 1500);
        updateLocks_4_4();
    } else {
        fb.innerHTML = "<b style='color:red'>Try Again.</b>";
    }
}

// ===============================================
// === UNIT 5.1: TORQUE (Gold Standard v4.6) ===
// ===============================================

function setup_5_1() {
    canvas.width = 700; 
    canvas.height = 640; 

    document.getElementById('sim-title').innerText = "5.1 Torque";
    
    document.getElementById('sim-desc').innerHTML = `
        <h3 style="margin-top:0; margin-bottom:10px;">The Turning Force</h3>
        <p style="margin-bottom:10px; line-height:1.4;">
        Torque ($\tau$) measures how effective a force is at causing rotation.
        <br><b>Equation:</b> <i class="var">&tau;</i> = <i class="var">r F</i> sin(<i class="var">&theta;</i>)
        <br><i><b>Mission:</b> Apply enough torque to break the rusty bolt loose!</i></p>`;

    document.getElementById('sim-controls').innerHTML = `
        <div style="background:#eef2f3; padding:10px; border-radius:5px; margin-bottom:15px; border:1px solid #ccc; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label style="font-weight:bold; margin:0;">Mode:</label>
                <div style="display:flex; gap:15px;">
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="guided" checked onchange="setMode_5_1('guided')" style="margin-right:5px;"> Guided
                    </label>
                    <label style="cursor:pointer; margin:0; display:flex; align-items:center;">
                        <input type="radio" name="sim-mode" value="challenge" onchange="setMode_5_1('challenge')" style="margin-right:5px;"> Full Version
                    </label>
                </div>
            </div>
            <div id="u5-1-badge" style="display:none; font-weight:bold; color:#f39c12; font-family:sans-serif; text-align:right;">
                <span style="font-size:1.5em; vertical-align:middle;">&#9733;</span> MECHANIC
            </div>
        </div>

        <div id="calc-5-1" style="background:white; border:1px solid #2c3e50; border-radius:4px; padding:10px; margin-bottom:15px; font-family:'Times New Roman', serif; font-size:1.0em; line-height:1.6;">
        </div>

        <div class="control-group" style="border-left: 4px solid #2980b9; padding-left: 10px;">
            <label style="color:#2980b9; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Force (<i class="var">F</i>):</span>
                <span><span id="v-f">50</span> N</span>
            </label>
            <input type="range" id="in-f" class="phys-slider" min="0" max="100" step="5" value="50" 
                oninput="updateState_5_1('F', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #8e44ad; padding-left: 10px; margin-top:10px;">
            <label style="color:#8e44ad; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Radius (<i class="var">r</i>):</span>
                <span><span id="v-r">0.50</span> m</span>
            </label>
            <input type="range" id="in-r" class="phys-slider" min="0.1" max="1.0" step="0.05" value="0.50" 
                oninput="updateState_5_1('r', this.value)">
        </div>

        <div class="control-group" style="border-left: 4px solid #c0392b; padding-left: 10px; margin-top:10px;">
            <label style="color:#c0392b; font-weight:bold; display:flex; justify-content:space-between;">
                <span>Angle (<i class="var">&theta;</i>):</span>
                <span><span id="v-ang">90</span>&deg;</span>
            </label>
            <input type="range" id="in-ang" class="phys-slider" min="0" max="180" step="5" value="90" 
                oninput="updateState_5_1('theta', this.value)">
        </div>

        <div style="margin-top:15px; display:flex; gap:10px;">
            <button class="btn btn-green" onclick="start_5_1()" id="btn-start">Apply Torque</button>
            <button class="btn btn-red" onclick="reset_5_1()">Reset</button>
        </div>
        
        <div id="u5-1-questions" style="margin-top:20px; border-top:2px solid #eee; padding-top:15px; background:#fafafa; padding:15px; border-radius:5px;">
        </div>
    `;

    const preventJump = (e) => {
        const rect = e.target.getBoundingClientRect();
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        const val = parseFloat(e.target.value);
        let clientX = e.clientX;
        if(e.type === 'touchstart') clientX = e.touches[0].clientX;
        const ratio = (val - min) / (max - min);
        const clickX = clientX - rect.left;
        const thumbX = ratio * rect.width;
        if(Math.abs(clickX - thumbX) > 35) e.preventDefault();
    };

    document.querySelectorAll('.phys-slider').forEach(s => {
        s.addEventListener('mousedown', preventJump);
        s.addEventListener('touchstart', preventJump, {passive: false});
    });

    reset_5_1();
}

function updateState_5_1(key, val) {
    if(state.running) return;
    
    state[key] = parseFloat(val);
    if(key === 'F') document.getElementById('v-f').innerText = state.F.toFixed(0);
    if(key === 'r') document.getElementById('v-r').innerText = state.r.toFixed(2);
    if(key === 'theta') document.getElementById('v-ang').innerText = state.theta.toFixed(0);
    
    calcPhysics_5_1();
    updateCalcDisplay_5_1();
    draw_5_1();
}

function setMode_5_1(mode) {
    state.mode = mode;
    const qDiv = document.getElementById('u5-1-questions');
    const badge = document.getElementById('u5-1-badge');

    if(state.level >= 3) badge.style.display = 'block';
    else badge.style.display = 'none';

    if(mode === 'challenge') {
        qDiv.style.display = 'none';
        // Unlock all
        document.getElementById('in-f').disabled = false;
        document.getElementById('in-f').parentElement.style.opacity = "1.0";
        document.getElementById('in-r').disabled = false;
        document.getElementById('in-r').parentElement.style.opacity = "1.0";
        document.getElementById('in-ang').disabled = false;
        document.getElementById('in-ang').parentElement.style.opacity = "1.0";
    } else {
        qDiv.style.display = 'block';
        renderQuestions_5_1();
    }
    
    updateLocks_5_1();
    draw_5_1();
    updateCalcDisplay_5_1();
}

function updateLocks_5_1() {
    let sliders = document.querySelectorAll('.phys-slider');
    let runBtn = document.getElementById('btn-start');
    let lock = state.running;
    
    sliders.forEach(s => {
        // Specific locks for levels
        if(state.mode === 'guided') {
            if(state.level === 0 && s.id === 'in-ang') { // L1 locks angle
                s.disabled = true; s.parentElement.style.opacity = "0.5"; return;
            }
            if(state.level === 1 && s.id === 'in-r') { // L2 locks radius
                s.disabled = true; s.parentElement.style.opacity = "0.5"; return;
            }
        }
        
        s.disabled = lock;
        s.style.opacity = lock ? "0.5" : "1.0";
    });
    runBtn.disabled = lock;
    runBtn.style.opacity = lock ? "0.5" : "1.0";
}

function calcPhysics_5_1() {
    let rad = state.theta * Math.PI / 180;
    state.tau = state.r * state.F * Math.sin(rad);
}

function updateCalcDisplay_5_1() {
    let box = document.getElementById('calc-5-1');
    if(!box) return;
    
    const v = (t) => `<i class="var" style="font-family:'Times New Roman',serif">${t}</i>`;
    
    let tauDisplay = state.tau.toFixed(1);
    let sinVal = Math.sin(state.theta * Math.PI / 180).toFixed(2);
    
    box.innerHTML = `
        <div style="margin-bottom:5px;">
            ${v('&tau;')} = ${v('r F')} sin(${v('&theta;')})
        </div>
        <div style="font-size:1.1em;">
            <b>${tauDisplay} N&middot;m</b> = (${state.r.toFixed(2)})(${state.F})(${sinVal})
        </div>
    `;
}

function start_5_1() {
    if(!state.running) {
        state.running = true;
        state.t = 0;
        state.angle = 0; // Visual rotation of wrench
        
        calcPhysics_5_1();
        updateLocks_5_1();
        loop_5_1();
    }
}

function reset_5_1() {
    let savedLevel = loadProgress('5.1'); 

    state = {
        F: parseFloat(document.getElementById('in-f').value),
        r: parseFloat(document.getElementById('in-r').value),
        theta: parseFloat(document.getElementById('in-ang').value),
        
        tau: 0,
        t: 0,
        running: false,
        angle: 0, // Visual rotation angle (radians)
        
        mode: document.querySelector('input[name="sim-mode"]:checked').value,
        level: savedLevel
    };
    
    // Level Setup
    if(state.mode === 'guided') {
        if(state.level === 0) {
            state.theta = 90;
            document.getElementById('v-ang').innerText = "90";
            document.getElementById('in-ang').value = 90;
        }
        else if(state.level === 1) {
            state.r = 0.50;
            document.getElementById('v-r').innerText = "0.50";
            document.getElementById('in-r').value = 0.50;
        }
    }
    
    calcPhysics_5_1();

    if(state.level >= 3) document.getElementById('u5-1-badge').style.display = 'block';

    setMode_5_1(state.mode);
    updateCalcDisplay_5_1();
    
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            draw_5_1();
        });
    });
}

function loop_5_1() {
    if(currentSim !== '5.1') return;

    if(state.running) {
        let dt = 0.02;
        state.t += dt;
        
        // Visual Rotation: angular acceleration alpha = tau / I.
        // Assume I = 1 for visual feel.
        // Alpha is proportional to tau.
        let alpha = state.tau * 0.5; 
        
        // Simple kinematics for visual spin
        // theta = 0.5 * alpha * t^2
        state.angle = 0.5 * alpha * state.t * state.t;
        
        if(state.t > 2.0) {
            state.running = false;
            if(state.mode === 'guided') checkLevel_5_1();
            updateLocks_5_1();
        }
    }

    draw_5_1();
    
    if(state.running) requestAnimationFrame(loop_5_1);
}

function draw_5_1() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    let cx = 350; 
    let cy = 320;
    let pxPerM = 250; // 1m = 250px (wrench fits on screen)
    
    // Background Bolt
    ctx.fillStyle = "#95a5a6";
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.angle); // Rotate bolt
    
    // Hex Bolt
    ctx.beginPath();
    for(let i=0; i<6; i++) {
        let a = i * Math.PI/3;
        let r = 40;
        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    
    // Wrench
    // Wrench rotates with bolt? Usually wrench turns the bolt.
    // Yes, rotate wrench same angle.
    
    // Wrench Handle
    ctx.fillStyle = "#34495e";
    // Rectangle for handle, length r
    let handleLen = state.r * pxPerM;
    let handleW = 30;
    
    // Draw handle extending right
    ctx.fillRect(20, -handleW/2, handleLen, handleW);
    // Wrench Head (Circle-ish)
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI*2); ctx.fill(); 
    
    // Force Vector
    // Applied at end of handle (x = handleLen)
    // Force angle is relative to the wrench handle.
    // Angle input theta is usually angle between r and F.
    // If handle is horizontal (0 deg), F points at angle theta.
    // Wait, typical physics diagram: theta is angle between r vector extension and F.
    // If theta=90, F is perpendicular.
    
    let fx = state.F * Math.cos(state.theta * Math.PI / 180) * 1.5; // Scale
    let fy = state.F * Math.sin(state.theta * Math.PI / 180) * 1.5;
    
    // In canvas, y is down. Physics y is up. 
    // Let's assume input angle 90 means "Pushing Up" (counter-clockwise torque)? 
    // Or "Pushing Down"? Wrench usually turns clockwise to tighten?
    // Let's stick to standard math: 90 deg is +y direction (up/ccw torque).
    
    // Force Origin (End of wrench)
    let endX = handleLen + 20; 
    let endY = 0;
    
    // Draw Vector
    ctx.restore(); // Undo rotation for vector? 
    // No, vector should rotate with wrench if it's a "pushing" simulation?
    // Actually, usually you keep applying force perpendicular to the handle as it turns.
    // So force rotates WITH wrench.
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.angle);
    
    if(state.F > 0) {
        drawVector_5_1(endX, endY, fx, -fy, "#c0392b", "F"); // -fy for canvas
    }
    
    ctx.restore();
    
    // Legend / Info
    ctx.fillStyle = "#333"; ctx.font = "14px sans-serif";
    ctx.fillText(`Torque: ${state.tau.toFixed(1)} N·m`, cx - 50, cy + 150);
}

function drawVector_5_1(x, y, dx, dy, color, label) {
    let endX = x + dx;
    let endY = y + dy; 
    
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
    
    let angle = Math.atan2(dy, dx);
    let headLen = 10;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI/6), endY - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI/6), endY - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    if(label) {
        ctx.fillStyle = color;
        ctx.font = "bold 14px serif";
        ctx.fillText(label, endX + 10, endY);
    }
}

function renderQuestions_5_1() {
    let div = document.getElementById('u5-1-questions');
    const v = (text) => `<i class="var">${text}</i>`;

    if(state.level === 0) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#2980b9;">Level 1: Max Torque</h4>
            <p>Angle is locked to 90&deg; (Max efficiency).</p>
            <p>Set Radius ${v('r')} = <b>0.50 m</b>.</p>
            <p>We need <b>40.0 N&middot;m</b> of torque.</p>
            <p>What Force ${v('F')} is required?</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-1" placeholder="Newtons" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_5_1(0)"> 
                <button onclick="checkAnswer_5_1(0)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-0"></div>
        `;
    } else if(state.level === 1) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#c0392b;">Level 2: The Angle</h4>
            <p>You can't push straight. Angle is <b>30&deg;</b>.</p>
            <p>Radius is locked at <b>0.80 m</b>.</p>
            <p>Set Force ${v('F')} = <b>100 N</b>.</p>
            <p>Calculate the resulting Torque ${v('&tau;')}.</p>
            <p style="font-size:0.9em; color:#666;">(Hint: sin(30&deg;) = 0.5)</p>
            <div style="margin-top:10px;">
                <input type="number" id="ans-2" placeholder="N·m" style="width:80px; padding:4px;" 
                       onkeypress="if(event.key==='Enter') checkAnswer_5_1(1)"> 
                <button onclick="checkAnswer_5_1(1)" style="cursor:pointer; padding:4px 8px;">Check</button>
            </div>
            <div id="fb-1"></div>
        `;
    } else if(state.level === 2) {
        div.innerHTML = `
            <h4 style="margin:0 0 10px 0; color:#8e44ad;">Level 3: The Rusty Bolt</h4>
            <p>The bolt requires <b>45.0 N&middot;m</b> to break.</p>
            <p>You are limited: Max Force = <b>60 N</b>.</p>
            <p>Find a combination of $r$ and $\\theta$ to break it.</p>
            <div style="margin-top:10px;">
                <button onclick="checkAnswer_5_1(2)" style="padding:5px 15px; cursor:pointer;">Break the Bolt!</button>
            </div>
            <div id="fb-2"></div>
        `;
    } else {
        div.innerHTML = `
            <h3 style="color:#f39c12; margin:0;">&#9733; MECHANIC &#9733;</h3>
            <p>You have mastered Torque!</p>
        `;
    }
}

function checkAnswer_5_1(lvl) {
    let correct = false;
    let fb = document.getElementById('fb-'+lvl);
    
    if(lvl === 0) {
        let val = parseFloat(document.getElementById('ans-1').value);
        // tau = 40. r = 0.5. sin(90)=1. F = 40/0.5 = 80.
        if(state.r === 0.50 && Math.abs(val - 80.0) < 2.0) correct = true;
        else if(state.r !== 0.50) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Radius to 0.50 m!</span>`;
            return;
        }
    }
    else if(lvl === 1) {
        let val = parseFloat(document.getElementById('ans-2').value);
        // tau = 0.8 * 100 * 0.5 = 40.
        if(state.F === 100 && state.theta === 30 && Math.abs(val - 40.0) < 1.0) correct = true;
        else if (state.theta !== 30) {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Set Angle to 30&deg;!</span>`;
            return;
        }
    }
    else if(lvl === 2) {
        // Need tau >= 45.0
        if(state.tau >= 45.0) {
            correct = true;
        } else {
            fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Current Torque: ${state.tau.toFixed(1)}. Need 45.0!</span>`;
            return;
        }
    }

    if(correct) {
        fb.innerHTML = "<span style='color:green; font-weight:bold;'>Correct! Unlocking next step...</span>";
        setTimeout(() => {
            state.level++;
            saveProgress('5.1', state.level);
            
            if(state.level >= 3) document.getElementById('u5-1-badge').style.display = 'block';
            renderQuestions_5_1();
            reset_5_1();
        }, 1500);
    } else {
        fb.innerHTML = `<span style='color:#c0392b; font-weight:bold;'>Incorrect. Check your calculation!</span>`;
    }
}

function checkLevel_5_1() {
}

