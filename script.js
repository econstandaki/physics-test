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

    let validSim = false;
    
    // 3. Router (Mapped to Official AP Physics 1 Sections)
    if(simId === '1.1') { setup_1_1(); validSim = true; }
    else if(simId === '1.2') { setup_1_2(); validSim = true; }
    else if(simId === '1.3') { setup_1_3(); validSim = true; } // ADDED 1.3
    else if(simId === '2.7') { setup_2_7(); validSim = true; }
    else if(simId === '4.4') { setup_4_4(); validSim = true; }
    
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
