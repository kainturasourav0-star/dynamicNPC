<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>x402 Protocol - Dynamic NPC Dialogue Simulator</title>
    <style>
        :root {
            --bg-color: #030712;
            --card-bg: rgba(17, 24, 39, 0.85);
            --border-color: #1f2937;
            --accent-cyan: #06b6d4;
            --accent-rose: #f43f5e;
            --accent-gold: #eab308;
            --accent-green: #10b981;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
        body { background: var(--bg-color); color: #f3f4f6; display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 20px; }
        
        header { text-align: center; margin-bottom: 20px; }
        h1 { font-size: 26px; color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 12px rgba(6, 182, 212, 0.4); }
        p.subtitle { color: #9ca3af; font-size: 14px; margin-top: 4px; }

        .dashboard { display: flex; gap: 20px; width: 1050px; max-width: 100%; }

        /* Game Canvas Container */
        .viewport { position: relative; width: 620px; height: 420px; background: #0b0f19; border: 1px solid #374151; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
        canvas { display: block; width: 100%; height: 100%; }

        /* Dialogue Card Overlay */
        .dialogue-card {
            position: absolute; bottom: 15px; left: 15px; right: 15px;
            background: var(--card-bg); backdrop-filter: blur(8px);
            border: 1px solid var(--accent-cyan); border-radius: 8px; padding: 14px;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
            display: none; animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

        .dialogue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .npc-title { font-weight: 700; color: var(--accent-gold); font-size: 15px; }
        .cost-badge { background: rgba(244, 63, 94, 0.2); color: var(--accent-rose); border: 1px solid var(--accent-rose); padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .dialogue-body { font-size: 13px; line-height: 1.5; color: #e5e7eb; margin-bottom: 8px; min-height: 38px; }
        .receipt-footer { font-family: monospace; font-size: 11px; color: var(--accent-green); text-align: right; opacity: 0.9; }

        /* Real-Time Protocol Inspector */
        .inspector { flex: 1; background: #030712; border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; height: 420px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
        .inspector-title { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 12px; }
        .inspector-title span { font-weight: 600; font-size: 14px; color: #f9fafb; }
        .status-pill { background: rgba(16, 185, 129, 0.2); color: var(--accent-green); border: 1px solid var(--accent-green); padding: 2px 8px; border-radius: 10px; font-size: 11px; transition: all 0.3s ease; }
        .status-pill.processing {
            background: rgba(234, 179, 8, 0.2);
            color: var(--accent-gold);
            border-color: var(--accent-gold);
            animation: pulse-glow 1s infinite alternate;
        }

        @keyframes pulse-glow {
            from { box-shadow: 0 0 2px rgba(234, 179, 8, 0.4); }
            to { box-shadow: 0 0 10px rgba(234, 179, 8, 0.7); }
        }

        .log-container { flex: 1; overflow-y: auto; font-family: 'Consolas', monospace; font-size: 11px; line-height: 1.6; display: flex; flex-direction: column; gap: 8px; }
        .log-entry { padding: 8px; border-radius: 6px; border-left: 3px solid transparent; animation: fadeIn 0.25s ease-in; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .type-req { background: rgba(6, 182, 212, 0.1); border-color: var(--accent-cyan); color: #38bdf8; }
        .type-402 { background: rgba(244, 63, 94, 0.1); border-color: var(--accent-rose); color: #fb7185; }
        .type-sig { background: rgba(234, 179, 8, 0.1); border-color: var(--accent-gold); color: #fde047; }
        .type-200 { background: rgba(16, 185, 129, 0.1); border-color: var(--accent-green); color: #4ade80; }

        /* Metrics Toolbar */
        .metrics { width: 1050px; max-width: 100%; margin-top: 18px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px 20px; display: flex; justify-content: space-between; font-size: 13px; }
        .metric-item span { color: var(--accent-cyan); font-weight: 700; }
    </style>
</head>
<body>

    <header>
        <h1>⚡ Dynamic NPC Dialogue via x402 Micropayments</h1>
        <p class="subtitle">Use WASD or Arrow Keys to move. Approach an NPC and press [SPACE] to trigger real-time HTTP 402 settlement.</p>
    </header>

    <div class="dashboard">
        <!-- Interactive Game Viewport -->
        <div class="viewport">
            <canvas id="gameCanvas" width="620" height="420"></canvas>
            
            <div id="dialogueCard" class="dialogue-card">
                <div class="dialogue-header">
                    <span id="npcTitle" class="npc-title">Guard Grom</span>
                    <span id="costBadge" class="cost-badge">$0.01 USDC</span>
                </div>
                <div id="dialogueBody" class="dialogue-body">Awaiting payment initialization...</div>
                <div id="receiptFooter" class="receipt-footer">x402 Verification: Waiting...</div>
            </div>
        </div>

        <!-- Real-Time Protocol Inspector -->
        <div class="inspector">
            <div class="inspector-title">
                <span>🛰️ x402 Protocol Inspector</span>
                <span id="statusPill" class="status-pill">READY</span>
            </div>
            <div id="logContainer" class="log-container">
                <div style="color: #6b7280;">[System Initialized] Move character near NPC to test...</div>
            </div>
        </div>
    </div>

    <!-- Live Analytics Bar -->
    <div class="metrics">
        <div>Active Inventory: <span>🔮 Arcane Staff</span></div>
        <div>Total Dynamic Calls: <span id="metricCalls">0</span></div>
        <div>Merchant Wallet Balance: <span id="metricRevenue">$0.00 USDC</span></div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const logContainer = document.getElementById('logContainer');

        let calls = 0;
        let revenue = 0.00;
        let activeNPC = null;
        let isProcessing = false;

        // Player configuration
        const player = { x: 310, y: 340, radius: 12, speed: 3.5, color: '#06b6d4', pulse: 0 };
        const particles = [];

        // New animations state
        const floatingTexts = []; // Elements: { x, y, text, color, alpha, speedY }
        const paymentPackets = []; // Elements: { x, y, targetX, targetY, t, speed, color }
        let paymentConnection = null; // { from: {x,y}, to: {x,y}, active: boolean, state: string }

        // Dynamic NPCs Configuration
        const npcs = [
            { id: 1, name: 'Grom (Guard)', x: 120, y: 120, color: '#f43f5e', price: 0.01, role: 'Dislikes magic users' },
            { id: 2, name: 'Eldrin (Merchant)', x: 500, y: 140, color: '#eab308', price: 0.01, role: 'Trades potions' },
            { id: 3, name: 'Aria (Mystic Monk)', x: 310, y: 80, color: '#a855f7', price: 0.02, role: 'Reads cosmic aura' }
        ];

        const mockResponses = {
            1: [
                "Lower that glowing staff immediately, wizard. Magic is forbidden inside city gates.",
                "Keep moving, spellcaster. One rogue spark and I will place you in anti-magic chains."
            ],
            2: [
                "Ah, carrying an Arcane Staff! I have a rare Mana Crystal that matches your weapon for 50 gold.",
                "Looking to trade? I pay top coin for enchanted artifacts!"
            ],
            3: [
                "I sense intense mana radiating from your staff... your destiny reaches far beyond this town.",
                "The cosmic tides are shifting. Walk with intention, hero."
            ]
        };

        const keys = {};
        window.addEventListener('keydown', e => keys[e.key] = true);
        window.addEventListener('keyup', e => keys[e.key] = false);

        function addLog(title, body, type) {
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.innerHTML = `<strong>${title}</strong><br>${body}`;
            logContainer.appendChild(entry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }

        async function triggerDialogue(npc) {
            if (isProcessing) return;
            isProcessing = true;

            const card = document.getElementById('dialogueCard');
            card.style.display = 'block';
            document.getElementById('npcTitle').innerText = npc.name;
            document.getElementById('costBadge').innerText = `$${npc.price.toFixed(2)} USDC`;
            document.getElementById('dialogueBody').innerText = 'Initializing payment challenge...';
            document.getElementById('receiptFooter').innerText = 'x402 Verification: Pending...';

            const statusPill = document.getElementById('statusPill');
            statusPill.innerText = 'PROCESSING';
            statusPill.className = 'status-pill processing';

            // Establish connection animation
            paymentConnection = {
                from: { x: player.x, y: player.y },
                to: { x: npc.x, y: npc.y },
                active: true,
                state: 'requesting'
            };

            // 1. Initial Request
            addLog('[1] POST /api/generate-dialogue', `Target: ${npc.name} | Context: { item: 'Arcane Staff' }`, 'type-req');
            
            // Spawn initial request packets (cyan)
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if (paymentConnection && paymentConnection.active) {
                        paymentPackets.push({
                            from: { x: player.x, y: player.y },
                            to: { x: npc.x, y: npc.y },
                            t: 0,
                            speed: 0.04,
                            color: '#06b6d4'
                        });
                    }
                }, i * 120);
            }
            await new Promise(r => setTimeout(r, 350));

            // 2. HTTP 402 Payment Required
            if (paymentConnection) paymentConnection.state = 'paying';
            addLog('[2] HTTP 402 Payment Required', `Price: $${npc.price.toFixed(2)} USDC | Recipient: 0x71C...8A2`, 'type-402');
            
            // Spawn payment request packets (rose) from NPC to Player
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    if (paymentConnection && paymentConnection.active) {
                        paymentPackets.push({
                            from: { x: npc.x, y: npc.y },
                            to: { x: player.x, y: player.y },
                            t: 0,
                            speed: 0.04,
                            color: '#f43f5e'
                        });
                    }
                }, i * 120);
            }
            await new Promise(r => setTimeout(r, 400));

            // 3. Client Sign Signature
            if (paymentConnection) paymentConnection.state = 'signing';
            const txHash = '0x' + Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16)).join('');
            addLog('[3] Signature Authorized', `Signed $${npc.price.toFixed(2)} USDC authorization header [${txHash}...]`, 'type-sig');
            
            // Spawn signing verification packets (gold) from Player to NPC
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    if (paymentConnection && paymentConnection.active) {
                        paymentPackets.push({
                            from: { x: player.x, y: player.y },
                            to: { x: npc.x, y: npc.y },
                            t: 0,
                            speed: 0.05 + Math.random() * 0.02,
                            color: '#eab308'
                        });
                    }
                }, i * 60);
            }
            await new Promise(r => setTimeout(r, 450));

            // 4. HTTP 200 OK Response
            if (paymentConnection) paymentConnection.state = 'success';
            const lines = mockResponses[npc.id];
            const text = lines[Math.floor(Math.random() * lines.length)];
            addLog('[4] HTTP 200 OK Payload Delivered', `Dialogue generated via LLM + On-Chain Settlement Receipt.`, 'type-200');

            document.getElementById('dialogueBody').innerText = `"${text}"`;
            document.getElementById('receiptFooter').innerText = `x402 Receipt: Verified (${txHash}...)`;

            // Trigger burst of particles at NPC
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.5 + Math.random() * 3.5;
                particles.push({
                    x: npc.x,
                    y: npc.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: Math.random() * 3 + 1.5,
                    alpha: 1,
                    color: Math.random() > 0.5 ? '#10b981' : npc.color
                });
            }

            // Floating text above NPC
            floatingTexts.push({
                x: npc.x,
                y: npc.y - 25,
                text: `+$${npc.price.toFixed(2)} USDC`,
                color: '#10b981',
                alpha: 1.5,
                speedY: -0.7
            });

            // Update Metrics
            calls++;
            revenue += npc.price;
            document.getElementById('metricCalls').innerText = calls;
            document.getElementById('metricRevenue').innerText = `$${revenue.toFixed(2)} USDC`;

            statusPill.innerText = 'READY';
            statusPill.className = 'status-pill';

            // Reset connection after brief delay
            setTimeout(() => {
                if (paymentConnection && paymentConnection.state === 'success') {
                    paymentConnection = null;
                }
            }, 600);

            isProcessing = false;
        }

        function createParticle(x, y, color) {
            particles.push({ x, y, radius: Math.random() * 3 + 1, alpha: 1, color });
        }

        function update() {
            let moving = false;
            if (keys['ArrowUp'] || keys['w']) { player.y = Math.max(30, player.y - player.speed); moving = true; }
            if (keys['ArrowDown'] || keys['s']) { player.y = Math.min(390, player.y + player.speed); moving = true; }
            if (keys['ArrowLeft'] || keys['a']) { player.x = Math.max(30, player.x - player.speed); moving = true; }
            if (keys['ArrowRight'] || keys['d']) { player.x = Math.min(590, player.x + player.speed); moving = true; }

            if (moving) createParticle(player.x, player.y, player.color);

            // Update custom particles with velocities
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.vx !== undefined) p.x += p.vx;
                if (p.vy !== undefined) p.y += p.vy;
            }

            // Update floating texts
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const ft = floatingTexts[i];
                ft.y += ft.speedY;
                ft.alpha -= 0.02;
                if (ft.alpha <= 0) {
                    floatingTexts.splice(i, 1);
                }
            }

            // Update payment packets
            for (let i = paymentPackets.length - 1; i >= 0; i--) {
                const pkt = paymentPackets[i];
                pkt.t += pkt.speed;
                if (pkt.t >= 1) {
                    paymentPackets.splice(i, 1);
                }
            }

            // Check NPC Proximity
            activeNPC = null;
            npcs.forEach(npc => {
                const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
                if (dist < 45) activeNPC = npc;
            });

            if (keys[' '] && activeNPC) {
                triggerDialogue(activeNPC);
                keys[' '] = false;
            }

            if (!activeNPC && !isProcessing) {
                document.getElementById('dialogueCard').style.display = 'none';
            }

            player.pulse = (player.pulse + 0.05) % (Math.PI * 2);
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Subtle Grid Lines
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 30) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 30) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // Draw Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                p.alpha -= 0.03;
                if (p.alpha <= 0) particles.splice(i, 1);
            }

            // Draw Payment Connection Beam
            if (paymentConnection && paymentConnection.active) {
                ctx.save();
                const grad = ctx.createLinearGradient(
                    paymentConnection.from.x, paymentConnection.from.y,
                    paymentConnection.to.x, paymentConnection.to.y
                );
                
                let colorStart = '#06b6d4';
                let colorEnd = '#10b981';
                
                if (paymentConnection.state === 'paying') {
                    colorStart = '#f43f5e';
                    colorEnd = '#06b6d4';
                } else if (paymentConnection.state === 'signing') {
                    colorStart = '#eab308';
                    colorEnd = '#eab308';
                } else if (paymentConnection.state === 'success') {
                    colorStart = '#10b981';
                    colorEnd = '#10b981';
                }

                grad.addColorStop(0, colorStart);
                grad.addColorStop(1, colorEnd);

                ctx.strokeStyle = grad;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = colorStart;
                ctx.shadowBlur = 10;
                ctx.setLineDash([6, 6]);
                ctx.lineDashOffset = -player.pulse * 20;

                ctx.beginPath();
                ctx.moveTo(paymentConnection.from.x, paymentConnection.from.y);
                ctx.lineTo(paymentConnection.to.x, paymentConnection.to.y);
                ctx.stroke();
                ctx.restore();
            }

            // Draw Payment Packets
            paymentPackets.forEach(pkt => {
                const currentX = pkt.from.x + (pkt.to.x - pkt.from.x) * pkt.t;
                const currentY = pkt.from.y + (pkt.to.y - pkt.from.y) * pkt.t;

                ctx.save();
                ctx.fillStyle = pkt.color;
                ctx.shadowColor = pkt.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(currentX, currentY, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Draw NPCs
            npcs.forEach(npc => {
                ctx.save();
                ctx.shadowColor = npc.color;
                ctx.shadowBlur = 12;
                ctx.fillStyle = npc.color;
                ctx.beginPath();
                ctx.arc(npc.x, npc.y, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Name Tag
                ctx.fillStyle = '#9ca3af';
                ctx.font = '11px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText(npc.name.split(' ')[0], npc.x, npc.y - 22);
            });

            // Draw Player with Glowing Ring & Orbiting Electron
            ctx.save();
            ctx.shadowColor = player.color;
            ctx.shadowBlur = 15;
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Orbit Ring around player
            ctx.save();
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius + 8, 0, Math.PI * 2);
            ctx.stroke();

            // Orbiting node
            const orbitX = player.x + Math.cos(player.pulse * 2.5) * (player.radius + 8);
            const orbitY = player.y + Math.sin(player.pulse * 2.5) * (player.radius + 8);
            ctx.fillStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(orbitX, orbitY, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Floating Texts
            floatingTexts.forEach(ft => {
                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
                ctx.fillStyle = ft.color;
                ctx.font = 'bold 13px Consolas, monospace';
                ctx.textAlign = 'center';
                ctx.shadowColor = ft.color;
                ctx.shadowBlur = 6;
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.restore();
            });

            // Interaction Indicator
            if (activeNPC) {
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(activeNPC.x, activeNPC.y, 22 + Math.sin(player.pulse) * 3, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = '#eab308';
                ctx.font = '12px Segoe UI';
                ctx.textAlign = 'center';
                ctx.fillText('Press [SPACE] to talk', player.x, player.y - 24);
            }
        }

        function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
        }

        loop();
    </script>
</body>
</html>