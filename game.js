const TARGET_SCORE = 520;
document.getElementById('targetDisplay').innerText = TARGET_SCORE;

// Cấu hình danh sách chướng ngại vật (Đã giảm độ cao chướng ngại vật đất)
const OBSTACLE_CONFIGS = [
    {
        id: 'pot',
        name: 'Chậu hoa hồng',
        width: 48,
        height: 48,
        isFlying: false,
        groundImgType: 1, // Dùng chuong_ngai_vat_dat_1.png
        color: '#f43f5e'
    },
    {
        id: 'gift',
        name: 'Hộp quà 20/10',
        width: 50,
        height: 42,
        isFlying: false,
        groundImgType: 2, // Dùng chuong_ngai_vat_dat_2.png
        color: '#9333ea'
    },
    {
        id: 'flower_cactus',
        name: 'Khóm hoa',
        width: 46,
        height: 50,
        isFlying: false,
        groundImgType: 1, // Dùng chuong_ngai_vat_dat_1.png
        color: '#16a34a'
    },
    {
        id: 'bird',
        name: 'Chim hoa bay',
        width: 54,
        height: 36,
        isFlying: true,
        flyHeight: 72,
        color: '#0284c7'
    },
    {
        id: 'balloon',
        name: 'Bóng bay trái tim',
        width: 48,
        height: 40,
        isFlying: true,
        flyHeight: 72,
        color: '#ec4899'
    }
];

// Load ảnh nhân vật
const playerImg = new Image();
playerImg.src = 'nhan_vat.PNG';
let isPlayerImgLoaded = false;
playerImg.onload = () => {
    isPlayerImgLoaded = true;
};

// Load ảnh chướng ngại vật đất 1
const obsGroundImg1 = new Image();
obsGroundImg1.src = 'chuong_ngai_vat_dat_1.png';
let isObsGroundImg1Loaded = false;
obsGroundImg1.onload = () => {
    isObsGroundImg1Loaded = true;
};

// Load ảnh chướng ngại vật đất 2
const obsGroundImg2 = new Image();
obsGroundImg2.src = 'chuong_ngai_vat_dat_2.png';
let isObsGroundImg2Loaded = false;
obsGroundImg2.onload = () => {
    isObsGroundImg2Loaded = true;
};

// Load ảnh chướng ngại vật bay
const obsFlyingImg = new Image();
obsFlyingImg.src = 'chuong_ngai_vat_bay.png';
let isObsFlyingImgLoaded = false;
obsFlyingImg.onload = () => {
    isObsFlyingImgLoaded = true;
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgMusic = document.getElementById('bgMusic');
const endMusic = document.getElementById('endMusic');

let soundEnabled = true;
let audioCtx = null;
let synthBgmInterval = null;

function handlePhotoFallback(imgEl) {
    imgEl.onerror = null;
    imgEl.src = 'https://placehold.co/600x340/fbcfe8/be123c?text=Th%C3%BAy+Hi%E1%BB%81n+20/10+%E2%9D%A4%EF%B8%8F';
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let gameActive = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('thuyhien_high_score') || 0;
let gameSpeed = 5.5;
let frameCount = 0;
let milestonesHit = new Set();

document.getElementById('highScoreDisplay').innerText = highScore;

// Đã giảm độ to nhân vật (66 x 82)
const player = {
    x: 50,
    y: 0,

    normalWidth: 66,
    normalHeight: 82,

    crouchWidth: 72,
    crouchHeight: 38,

    width: 66,
    height: 82,

    velocityY: 0,
    gravity: 0.6,
    jumpStrength: -14.5,

    isGrounded: false,
    isCrouching: false,

    draw: function() {
        ctx.save();

        if (isPlayerImgLoaded) {
            if (this.isCrouching && this.isGrounded) {
                const crouchVisualHeight = this.crouchHeight;
                const ratio = playerImg.naturalWidth / playerImg.naturalHeight;
                const crouchVisualWidth = crouchVisualHeight * ratio;

                const drawX = this.x + (this.width - crouchVisualWidth) / 2;
                const drawY = this.y + this.height - crouchVisualHeight;

                ctx.drawImage(
                    playerImg,
                    drawX,
                    drawY,
                    crouchVisualWidth,
                    crouchVisualHeight
                );
            } else {
                ctx.drawImage(
                    playerImg,
                    this.x,
                    this.y,
                    this.normalWidth,
                    this.normalHeight
                );
            }
        } else {
            ctx.translate(this.x, this.y);

            if (this.isCrouching && this.isGrounded) {
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.beginPath();
                ctx.ellipse(this.width / 2, this.height - 2, 22, 4, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#f43f5e';
                ctx.fillRect(4, 6, this.width - 8, this.height - 6);

                ctx.fillStyle = '#ffedd5';
                ctx.beginPath();
                ctx.arc(this.width - 12, 10, 9, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#371b12';
                ctx.beginPath();
                ctx.arc(this.width - 12, 8, 10, Math.PI, Math.PI * 2);
                ctx.fill();
            } else {
                const legOffset = Math.sin(frameCount * 0.2) * 6;

                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.beginPath();
                ctx.ellipse(this.width / 2, this.height - 2, 16, 4, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#f43f5e';
                ctx.beginPath();
                ctx.moveTo(this.width / 2 - 15, 28);
                ctx.lineTo(this.width / 2 + 15, 28);
                ctx.lineTo(this.width / 2 + 18, 52);
                ctx.lineTo(this.width / 2 - 18, 52);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();

                ctx.moveTo(this.width / 2 - 6, 50);
                ctx.lineTo(
                    this.width / 2 - 9 + (this.isGrounded ? legOffset : 0),
                    this.height - 3
                );

                ctx.moveTo(this.width / 2 + 6, 50);
                ctx.lineTo(
                    this.width / 2 + 9 - (this.isGrounded ? legOffset : 0),
                    this.height - 3
                );

                ctx.stroke();

                ctx.fillStyle = '#ffedd5';
                ctx.beginPath();
                ctx.arc(this.width / 2, 18, 14, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#371b12';
                ctx.beginPath();
                ctx.arc(this.width / 2, 16, 15, Math.PI * 0.8, Math.PI * 2.2);
                ctx.fill();

                ctx.fillRect(this.width / 2 - 15, 16, 8, 20);

                ctx.fillStyle = '#e11d48';
                ctx.beginPath();
                ctx.arc(this.width / 2 + 9, 8, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    },

    update: function(groundY) {
        const onGround = this.isGrounded || this.y + this.height >= groundY - 5;

        if (this.isCrouching && onGround && this.velocityY >= 0) {
            this.width = this.crouchWidth;
            this.height = this.crouchHeight;
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            return;
        }

        this.width = this.normalWidth;
        this.height = this.normalHeight;

        this.velocityY += this.gravity;
        this.y += this.velocityY;

        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }
    },

    jump: function() {
        if (this.isGrounded && gameActive) {
            this.isCrouching = false;
            this.velocityY = this.jumpStrength;
            this.isGrounded = false;
            playTone(523.25, 'sine', 0.12);
        }
    },

    setCrouch: function(crouchState) {
        if (gameActive) {
            this.isCrouching = crouchState;
        }
    }
};

let obstacles = [];

function spawnObstacle() {
    if (frameCount % Math.max(70, Math.floor(150 - gameSpeed * 5)) === 0) {
        const config = OBSTACLE_CONFIGS[Math.floor(Math.random() * OBSTACLE_CONFIGS.length)];

        obstacles.push({
            x: canvas.width + 20,
            width: config.width,
            height: config.height,
            id: config.id,
            isFlying: config.isFlying,
            flyHeight: config.flyHeight || 0,
            groundImgType: config.groundImgType || 1,
            color: config.color
        });
    }
}

function drawObstacle(obs, groundY) {
    const y = obs.isFlying
        ? groundY - obs.height - obs.flyHeight
        : groundY - obs.height;

    ctx.save();

    // Vẽ chướng ngại vật bay
    if (obs.isFlying && isObsFlyingImgLoaded) {
        ctx.drawImage(obsFlyingImg, obs.x, y, obs.width, obs.height);
        ctx.restore();
        return;
    }

    // Vẽ chướng ngại vật đất 1
    if (!obs.isFlying && obs.groundImgType === 1 && isObsGroundImg1Loaded) {
        ctx.drawImage(obsGroundImg1, obs.x, y, obs.width, obs.height);
        ctx.restore();
        return;
    }

    // Vẽ chướng ngại vật đất 2
    if (!obs.isFlying && obs.groundImgType === 2 && isObsGroundImg2Loaded) {
        ctx.drawImage(obsGroundImg2, obs.x, y, obs.width, obs.height);
        ctx.restore();
        return;
    }

    // Fallback vẽ bằng Canvas Vector nếu chưa tải xong ảnh
    if (obs.id === 'pot') {
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.moveTo(obs.x + 3, y + obs.height);
        ctx.lineTo(obs.x + obs.width - 3, y + obs.height);
        ctx.lineTo(obs.x + obs.width, y + obs.height - 15);
        ctx.lineTo(obs.x, y + obs.height - 15);
        ctx.fill();

        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, y + obs.height - 15);
        ctx.lineTo(obs.x + obs.width / 2, y + 6);
        ctx.stroke();

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, y + 5, 6, 0, Math.PI * 2);
        ctx.fill();
    } else if (obs.id === 'gift') {
        ctx.fillStyle = '#9333ea';
        ctx.fillRect(obs.x, y + 4, obs.width, obs.height - 4);

        ctx.fillStyle = '#fde047';
        ctx.fillRect(obs.x + obs.width / 2 - 3, y + 4, 6, obs.height - 4);
        ctx.fillRect(obs.x, y + 4 + (obs.height - 4) / 2 - 2, obs.width, 4);
    } else if (obs.id === 'flower_cactus') {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(obs.x + obs.width / 2 - 2, y + 8, 4, obs.height - 8);
        ctx.fillRect(obs.x + 3, y + 14, obs.width - 6, 4);

        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
    } else if (obs.id === 'bird') {
        const wingFlap = Math.sin(frameCount * 0.3) * 5;

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(obs.x, y + 10);
        ctx.lineTo(obs.x + 12, y + 2 + wingFlap);
        ctx.lineTo(obs.x + 24, y + 10);
        ctx.lineTo(obs.x + 12, y + 18);
        ctx.fill();

        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(obs.x, y + 10);
        ctx.lineTo(obs.x - 5, y + 8);
        ctx.lineTo(obs.x, y + 12);
        ctx.fill();
    } else if (obs.id === 'balloon') {
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(obs.x + 9, y + 8, 7, 0, Math.PI * 2);
        ctx.arc(obs.x + 17, y + 8, 7, 0, Math.PI * 2);
        ctx.lineTo(obs.x + 13, y + 18);
        ctx.fill();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obs.x + 13, y + 18);
        ctx.lineTo(obs.x + 13, y + obs.height);
        ctx.stroke();
    }

    ctx.restore();
}

let particles = [];

function addMilestoneParticles() {
    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#eab308', '#06b6d4'];

    for (let i = 0; i < 45; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 3,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12 - 3,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            type: Math.random() > 0.4 ? 'heart' : 'circle'
        });
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= 0.015;

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.type === 'heart') {
            ctx.beginPath();
            const topCurveHeight = p.size * 0.3;
            ctx.moveTo(p.x, p.y + topCurveHeight);
            ctx.bezierCurveTo(p.x, p.y, p.x - p.size / 2, p.y, p.x - p.size / 2, p.y + topCurveHeight);
            ctx.bezierCurveTo(p.x - p.size / 2, p.y + (p.size + topCurveHeight) / 2, p.x, p.y + p.size, p.x, p.y + p.size);
            ctx.bezierCurveTo(p.x, p.y + p.size, p.x + p.size / 2, p.y + (p.size + topCurveHeight) / 2, p.x + p.size / 2, p.y + topCurveHeight);
            ctx.bezierCurveTo(p.x + p.size / 2, p.y, p.x, p.y, p.x, p.y + topCurveHeight);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

let bgOffset = 0;

function drawBackground(groundY) {
    bgOffset += gameSpeed * 0.3;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';

    for (let i = 0; i < 4; i++) {
        let cloudX = ((i * 240) - (bgOffset * 0.5)) % (canvas.width + 100);

        if (cloudX < -100) {
            cloudX += canvas.width + 100;
        }

        const cloudY = 35 + (i % 2) * 20;

        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 18, 0, Math.PI * 2);
        ctx.arc(cloudX + 15, cloudY - 8, 22, 0, Math.PI * 2);
        ctx.arc(cloudX + 32, cloudY, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.moveTo(0, groundY);

    for (let x = 0; x <= canvas.width + 50; x += 50) {
        const hillY = groundY - 22 - Math.sin((x + bgOffset * 0.2) * 0.01) * 12;
        ctx.lineTo(x, hillY);
    }

    ctx.lineTo(canvas.width, groundY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fb7185';
    ctx.fillRect(0, groundY, canvas.width, 5);

    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(0, groundY + 5, canvas.width, canvas.height - groundY - 5);

    ctx.fillStyle = '#fda4af';

    for (let i = 0; i < canvas.width; i += 40) {
        const dotX = i - (bgOffset % 40);
        ctx.fillRect(dotX, groundY + 14, 12, 3);
    }
}

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type = 'sine', duration = 0.1) {
    if (!soundEnabled) return;

    try {
        initAudioContext();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function startSynthBGM() {
    if (synthBgmInterval || !soundEnabled) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00];
    let noteIdx = 0;

    synthBgmInterval = setInterval(() => {
        if (gameActive && soundEnabled && bgMusic.paused) {
            playTone(notes[noteIdx], 'triangle', 0.25);
            noteIdx = (noteIdx + 1) % notes.length;
        }
    }, 320);
}

function stopSynthBGM() {
    if (synthBgmInterval) {
        clearInterval(synthBgmInterval);
        synthBgmInterval = null;
    }
}

function playSoundtrack() {
    if (!soundEnabled) return;

    initAudioContext();

    bgMusic.play().then(() => {
        stopSynthBGM();
    }).catch(() => {
        startSynthBGM();
    });
}

function playWinAudio() {
    bgMusic.pause();
    stopSynthBGM();

    if (!soundEnabled) return;

    endMusic.currentTime = 0;

    endMusic.play().catch(() => {
        playTone(523.25, 'sine', 0.2);

        setTimeout(() => { playTone(659.25, 'sine', 0.2); }, 180);
        setTimeout(() => { playTone(783.99, 'sine', 0.2); }, 360);
        setTimeout(() => { playTone(1046.50, 'sine', 0.4); }, 540);
    });
}

function toggleSound() {
    soundEnabled = !soundEnabled;

    const icon = document.getElementById('soundIcon');
    const label = document.getElementById('soundLabel');

    if (soundEnabled) {
        icon.className = 'fas fa-volume-up text-base';
        label.innerText = 'Nhạc: BẬT';

        if (gameActive) {
            playSoundtrack();
        }
    } else {
        icon.className = 'fas fa-volume-mute text-base';
        label.innerText = 'Nhạc: TẮT';

        bgMusic.pause();
        endMusic.pause();
        stopSynthBGM();
    }
}

function checkMilestone() {
    const progressPercent = Math.min(100, (score / TARGET_SCORE) * 100);
    document.getElementById('progressBar').style.width = progressPercent + '%';

    const milestones = [400, 800, 1200, 1600, 2000, 2010];

    milestones.forEach(m => {
        if (score >= m && !milestonesHit.has(m)) {
            milestonesHit.add(m);
            addMilestoneParticles();

            const toast = document.getElementById('milestoneToast');
            toast.innerText = `🎉 Mốc ${m} Điểm! Tiến gần mục tiêu 2010 điểm!`;
            toast.classList.remove('hidden');

            playTone(523.25, 'sine', 0.1);

            setTimeout(() => { playTone(659.25, 'sine', 0.15); }, 100);
            setTimeout(() => { toast.classList.add('hidden'); }, 2500);
        }
    });

    if (score >= TARGET_SCORE && gameActive) {
        handleWin();
    }
}

function checkCollision(p, obs, groundY) {
    const pBox = {
        left: p.x + 4,
        right: p.x + p.width - 4,
        top: p.y + 2,
        bottom: p.y + p.height
    };

    const obsY = obs.isFlying
        ? groundY - obs.height - obs.flyHeight
        : groundY - obs.height;

    const obsBox = {
        left: obs.x + 3,
        right: obs.x + obs.width - 3,
        top: obsY + 2,
        bottom: obsY + obs.height - 2
    };

    return (
        pBox.left < obsBox.right &&
        pBox.right > obsBox.left &&
        pBox.top < obsBox.bottom &&
        pBox.bottom > obsBox.top
    );
}

function gameLoop() {
    if (!gameActive) return;

    frameCount++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const groundY = canvas.height - 35;

    drawBackground(groundY);

    player.update(groundY);
    player.draw();

    spawnObstacle();

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];

        obs.x -= gameSpeed;
        drawObstacle(obs, groundY);

        if (checkCollision(player, obs, groundY)) {
            handleGameOver();
            return;
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);

            score += 10;

            document.getElementById('scoreDisplay').innerText = score;

            checkMilestone();

            if (score % 100 === 0 && gameSpeed < 9.5) {
                gameSpeed += 0.25;
            }
        }
    }

    updateAndDrawParticles();

    requestAnimationFrame(gameLoop);
}

function startGame() {
    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('losePopup').classList.add('hidden');
    document.getElementById('winPopup').classList.add('hidden');

    score = 0;
    gameSpeed = 3.8;
    frameCount = 0;
    obstacles = [];
    particles = [];
    milestonesHit.clear();

    document.getElementById('scoreDisplay').innerText = score;
    document.getElementById('progressBar').style.width = '0%';

    player.width = player.normalWidth;
    player.height = player.normalHeight;
    player.y = canvas.height - 35 - player.height;
    player.velocityY = 0;
    player.isGrounded = false;
    player.isCrouching = false;

    gameActive = true;
    gameOver = false;

    playSoundtrack();
    requestAnimationFrame(gameLoop);
}

function handleGameOver() {
    gameActive = false;
    gameOver = true;

    bgMusic.pause();
    stopSynthBGM();
    playTone(261.63, 'sawtooth', 0.3);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('thuyhien_high_score', highScore);
        document.getElementById('highScoreDisplay').innerText = highScore;
    }

    document.getElementById('loseScore').innerText = score;
    document.getElementById('losePopup').classList.remove('hidden');
}

function handleWin() {
    gameActive = false;
    gameOver = true;

    playWinAudio();
    addMilestoneParticles();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('thuyhien_high_score', highScore);
        document.getElementById('highScoreDisplay').innerText = highScore;
    }

    document.getElementById('winPopup').classList.remove('hidden');
}

function restartGame() {
    endMusic.pause();
    startGame();
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (gameActive) player.jump();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        if (gameActive) player.setCrouch(true);
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        if (gameActive) player.setCrouch(false);
    }
});

const touchJumpBtn = document.getElementById('touchJumpBtn');
const touchDuckBtn = document.getElementById('touchDuckBtn');

touchJumpBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameActive) player.jump();
});

touchJumpBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (gameActive) player.jump();
});

touchDuckBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameActive) player.setCrouch(true);
});

touchDuckBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameActive) player.setCrouch(false);
});

touchDuckBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (gameActive) player.setCrouch(true);
});

touchDuckBtn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    if (gameActive) player.setCrouch(false);
});

function openInstructions() {
    document.getElementById('instructionsModal').classList.remove('hidden');
}

function closeInstructions() {
    document.getElementById('instructionsModal').classList.add('hidden');
}

window.onload = function() {
    resizeCanvas();

    const groundY = canvas.height - 35;

    drawBackground(groundY);

    player.y = groundY - player.height;
    player.draw();
};