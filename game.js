/*!
 * 🚀 SERA DEFENDER - New Shepard Mission (ENHANCED EDITION)
 * 👨‍💻 Developer: Davi de Jesus
 * 📧 Email: davidejesus.log@proton.me
 * 🔗 GitHub: https://github.com/devdavidejesus
 * 💼 LinkedIn: https://www.linkedin.com/in/davidejesus
 * 🎮 Retro game tribute to SERA & Blue Origin
 * 📅 Version: 2.0.0 | Date: December 24, 2025
 * 🌎 Languages: English & Portuguese
 * ✨ Features: Story, Missions, Boss Fight, Easter Egg, Replay System
 */

class SERADefender {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.replayCanvas = document.getElementById('replayCanvas');
        this.replayCtx = this.replayCanvas?.getContext('2d');
        
        this.setupEventListeners();
        this.init();
        this.setupMissionSystem();
        this.setupReplaySystem();
        this.setupKonamiCode();
    }

    init() {
        // Estado do jogo
        this.gameState = 'menu';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.timeSurvived = 0;
        this.gameTime = 0;
        this.highScore = localStorage.getItem('seraHighScore') || 0;
        
        // Sistema de power-ups
        this.activePowerUps = {
            shield: { active: false, timer: 0 },
            rapidfire: { active: false, timer: 0 },
            multishot: { active: false, timer: 0 }
        };
        
        // Easter Egg Mode
        this.easterEggActive = false;
        
        // Elementos do jogo
        this.player = null;
        this.bullets = [];
        this.asteroids = [];
        this.powerUps = [];
        this.particles = [];
        this.enemies = [];
        this.boss = null;
        
        // Controles
        this.keys = {};
        
        // Configurações
        this.asteroidSpawnRate = 60;
        this.asteroidTimer = 0;
        this.enemySpawnRate = 300;
        this.enemyTimer = 0;
        this.shootCooldown = 0;
        this.bossSpawned = false;
        
        this.updateHighScoreDisplay();
    }

    setupEventListeners() {
        // Botões da UI
        document.getElementById('startButton').addEventListener('click', () => this.showStory());
        document.getElementById('skipStoryButton').addEventListener('click', () => this.startGame());
        document.getElementById('startGameButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        document.getElementById('menuButton').addEventListener('click', () => this.showMenu());
        document.getElementById('quitToMenuButton').addEventListener('click', () => this.showMenu());
        document.getElementById('resumeButton').addEventListener('click', () => this.resumeGame());
        document.getElementById('viewReplayButton').addEventListener('click', () => this.showReplay());
        document.getElementById('closeReplayButton').addEventListener('click', () => this.showMenu());

        // Controles do teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'KeyP') {
                if (this.gameState === 'playing') this.pauseGame();
                else if (this.gameState === 'paused') this.resumeGame();
            }
            
            if (e.code === 'KeyM') {
                this.showMenu();
            }
            
            if (e.code === 'Escape') {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'story') {
                    this.startGame();
                }
            }
            
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupMissionSystem() {
        this.missions = [
            {
                id: 1,
                title: "CLEAR PATH",
                description: "Destroy 10 asteroids",
                target: 10,
                current: 0,
                reward: 500,
                completed: false,
                type: 'asteroids'
            },
            {
                id: 2,
                title: "POWER COLLECTOR",
                description: "Collect 3 power-ups",
                target: 3,
                current: 0,
                reward: 800,
                completed: false,
                type: 'powerups'
            },
            {
                id: 3,
                title: "SURVIVAL EXPERT",
                description: "Survive 60 seconds",
                target: 60,
                current: 0,
                reward: 1000,
                completed: false,
                type: 'survival'
            }
        ];
        
        this.currentMissionIndex = 0;
        this.missionsCompleted = 0;
        this.survivalTimer = 0;
    }

    setupReplaySystem() {
        this.replayFrames = [];
        this.isRecording = false;
        this.maxReplayFrames = 60 * 5; // 5 seconds at 60fps
        this.epicMoments = [];
    }

    setupKonamiCode() {
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                          'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                          'KeyB', 'KeyA'];
        this.konamiIndex = 0;
        
        document.addEventListener('keydown', (e) => {
            if (e.code === this.konamiCode[this.konamiIndex]) {
                this.konamiIndex++;
                if (this.konamiIndex === this.konamiCode.length) {
                    this.activateEasterEgg();
                    this.konamiIndex = 0;
                }
            } else {
                this.konamiIndex = 0;
            }
        });
    }

    showStory() {
        this.gameState = 'story';
        this.showScreen('storyScreen');
        
        // Countdown automático
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                document.getElementById('startGameButton').classList.remove('hidden');
            }
        }, 1000);
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.timeSurvived = 0;
        this.gameTime = 0;
        this.bossSpawned = false;
        this.easterEggActive = false;
        
        // Resetar missões
        this.setupMissionSystem();
        this.updateMissionDisplay();
        
        // Resetar power-ups
        this.activePowerUps = {
            shield: { active: false, timer: 0 },
            rapidfire: { active: false, timer: 0 },
            multishot: { active: false, timer: 0 }
        };
        
        // Resetar elementos do jogo
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 120,
            width: 50,
            height: 100,
            speed: 6,
            color: '#ffffff'
        };
        
        this.bullets = [];
        this.asteroids = [];
        this.powerUps = [];
        this.particles = [];
        this.enemies = [];
        this.boss = null;
        
        // Iniciar gravação do replay
        this.startRecording();
        
        this.showScreen('gameScreen');
        this.gameLoop();
    }

    pauseGame() {
        this.gameState = 'paused';
        document.getElementById('currentMissionPause').textContent = 
            this.missions[this.currentMissionIndex].title;
        this.showScreen('pauseScreen');
    }

    resumeGame() {
        this.gameState = 'playing';
        this.showScreen('gameScreen');
        this.gameLoop();
    }

    showMenu() {
        this.gameState = 'menu';
        this.updateHighScoreDisplay();
        this.showScreen('startScreen');
    }

    showReplay() {
        this.gameState = 'replay';
        this.showScreen('replayScreen');
        this.playReplay();
    }

    gameOver() {
        this.gameState = 'over';
        
        // Salvar replay se tiver momentos épicos
        if (this.epicMoments.length > 0) {
            document.getElementById('viewReplayButton').classList.remove('hidden');
        }
        
        // Atualizar recorde
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('seraHighScore', this.highScore);
        }
        
        // Calcular estatísticas finais
        const completedMissions = this.missions.filter(m => m.completed).length;
        
        // Atualizar tela de game over
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('missionsCompleted').textContent = 
            `${completedMissions}/${this.missions.length}`;
        document.getElementById('timeSurvived').textContent = 
            `${Math.floor(this.timeSurvived)}s`;
        
        // Parar gravação
        this.stopRecording();
        
        this.showScreen('gameOverScreen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    updateHighScoreDisplay() {
        document.getElementById('highScoreValue').textContent = this.highScore;
    }

    updateMissionDisplay() {
        const mission = this.missions[this.currentMissionIndex];
        document.getElementById('missionText').textContent = mission.title;
        document.getElementById('missionProgress').textContent = 
            `${mission.current}/${mission.target}`;
    }

    checkMissionProgress() {
        const mission = this.missions[this.currentMissionIndex];
        
        if (mission.completed) return;
        
        switch(mission.type) {
            case 'asteroids':
                // Atualizado por colisões
                break;
            case 'powerups':
                // Atualizado por coleta de power-ups
                break;
            case 'survival':
                mission.current = Math.floor(this.survivalTimer / 60);
                break;
        }
        
        if (mission.current >= mission.target) {
            this.completeMission();
        }
        
        this.updateMissionDisplay();
    }

    completeMission() {
        const mission = this.missions[this.currentMissionIndex];
        mission.completed = true;
        this.missionsCompleted++;
        
        // Recompensa
        this.score += mission.reward;
        
        // Notificação
        this.showMissionNotification(mission);
        
        // Gravar momento épico
        this.saveEpicMoment(`Mission ${mission.id} Complete`);
        
        // Avançar para próxima missão
        setTimeout(() => {
            if (this.currentMissionIndex < this.missions.length - 1) {
                this.currentMissionIndex++;
                this.updateMissionDisplay();
            }
        }, 3000);
    }

    showMissionNotification(mission) {
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.innerHTML = `
            <div class="mission-popup">
                <h3>🎉 MISSION COMPLETE!</h3>
                <p>${mission.title}</p>
                <p>+${mission.reward} POINTS</p>
                <p>${mission.description}</p>
            </div>
        `;
        document.getElementById('missionNotifications').appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        
        // Mostrar power-up ativo
        let powerText = 'NORMAL';
        if (this.easterEggActive) {
            powerText = 'FOUNDER MODE 🚀';
        } else if (this.activePowerUps.shield.active) {
            powerText = 'SHIELD 🛡️';
        } else if (this.activePowerUps.rapidfire.active) {
            powerText = 'RAPID FIRE 🔥';
        } else if (this.activePowerUps.multishot.active) {
            powerText = 'MULTI SHOT 💥';
        }
        
        document.getElementById('power').textContent = powerText;
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.update();
        this.render();
        
        // Gravar frame para replay
        if (this.isRecording) {
            this.recordFrame();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.gameTime++;
        this.timeSurvived = this.gameTime / 60;
        
        // Atualizar temporizador de sobrevivência
        this.survivalTimer++;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateAsteroids();
        this.updateEnemies();
        this.updateBoss();
        this.updatePowerUps();
        this.updateActivePowerUps();
        this.updateParticles();
        this.checkCollisions();
        this.checkMissionProgress();
        this.updateHUD();
        
        // Aumentar dificuldade
        this.updateDifficulty();
        
        // Spawn de chefão no nível 3
        if (this.level >= 3 && !this.bossSpawned && this.gameTime > 60 * 60) {
            this.spawnBoss();
            this.bossSpawned = true;
        }
        
        // Cooldown do tiro
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }

    updateDifficulty() {
        // Aumentar dificuldade com pontuação e tempo
        const difficultyMultiplier = 1 + (this.level * 0.3) + (this.timeSurvived * 0.01);
        
        if (this.score > this.level * 1000) {
            this.level++;
            
            // Notificar novo nível
            this.showLevelUpNotification();
            
            // Aumentar taxa de spawn
            this.asteroidSpawnRate = Math.max(15, 60 - this.level * 8);
            this.enemySpawnRate = Math.max(120, 300 - this.level * 25);
        }
        
        // Aumentar velocidade com o tempo
        this.asteroids.forEach(asteroid => {
            asteroid.speed = asteroid.baseSpeed * difficultyMultiplier;
        });
        
        this.enemies.forEach(enemy => {
            enemy.speed = enemy.baseSpeed * difficultyMultiplier;
        });
    }

    showLevelUpNotification() {
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.innerHTML = `
            <div class="mission-popup">
                <h3>🌟 LEVEL UP!</h3>
                <p>NOW AT LEVEL ${this.level}</p>
                <p>Difficulty Increased</p>
            </div>
        `;
        document.getElementById('missionNotifications').appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }

    updatePlayer() {
        // Movimento com teclado
        let speed = this.player.speed;
        if (this.easterEggActive) speed *= 1.5;
        
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += speed;
        }
        
        // Tiro automático com rapid fire
        if ((this.activePowerUps.rapidfire.active || this.easterEggActive) && this.shootCooldown === 0) {
            this.shoot();
            this.shootCooldown = this.easterEggActive ? 2 : 5;
        }
    }

    shoot() {
        if (this.shootCooldown > 0 && !this.activePowerUps.rapidfire.active && !this.easterEggActive) return;
        
        const bulletConfig = {
            width: this.easterEggActive ? 8 : 4,
            height: this.easterEggActive ? 20 : 12,
            speed: this.easterEggActive ? 18 : 12,
            color: this.easterEggActive ? '#FF9900' : '#00ffff',
            damage: this.easterEggActive ? 2 : 1
        };
        
        if (this.activePowerUps.multishot.active || this.easterEggActive) {
            // Tiro múltiplo aprimorado no easter egg
            const shots = this.easterEggActive ? 5 : 3;
            const spread = this.easterEggActive ? 20 : 10;
            
            for (let i = 0; i < shots; i++) {
                const offset = (i - Math.floor(shots / 2)) * spread;
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - bulletConfig.width/2 + offset,
                    y: this.player.y,
                    ...bulletConfig
                });
            }
        } else {
            // Tiro simples
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - bulletConfig.width/2,
                y: this.player.y,
                ...bulletConfig
            });
        }
        
        if (!this.activePowerUps.rapidfire.active && !this.easterEggActive) {
            this.shootCooldown = 15;
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            // Remover balas que saíram da tela
            if (bullet.y < -bullet.height) {
                this.bullets.splice(i, 1);
            }
        }
    }

    updateAsteroids() {
        // Spawn de novos asteroides
        this.asteroidTimer++;
        if (this.asteroidTimer >= this.asteroidSpawnRate) {
            this.spawnAsteroid();
            this.asteroidTimer = 0;
        }

        // Atualizar asteroides existentes
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.y += asteroid.speed;
            asteroid.rotation += asteroid.rotationSpeed;
            
            // Movimento oscilante leve
            asteroid.x += Math.sin(asteroid.y * 0.02) * 0.5;
            
            // Remover asteroides que saíram da tela
            if (asteroid.y > this.canvas.height) {
                this.asteroids.splice(i, 1);
            }
        }
    }

    spawnAsteroid() {
        const size = Math.random() * 30 + 20;
        const types = [
            { color: '#8B4513', outline: '#654321' },
            { color: '#696969', outline: '#505050' },
            { color: '#2F4F4F', outline: '#1E2F2F' }
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        const baseSpeed = Math.random() * 1.5 + 1 + this.level * 0.2;
        
        this.asteroids.push({
            x: Math.random() * (this.canvas.width - size),
            y: -size,
            width: size,
            height: size,
            speed: baseSpeed,
            baseSpeed: baseSpeed,
            color: type.color,
            outline: type.outline,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            health: size > 40 ? 2 : 1
        });
    }

    updateEnemies() {
        // Spawn de inimigos especiais
        this.enemyTimer++;
        if (this.enemyTimer >= this.enemySpawnRate && Math.random() < 0.4) {
            this.spawnEnemy();
            this.enemyTimer = 0;
        }

        // Atualizar inimigos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += enemy.speed;
            
            // Movimento lateral dos inimigos
            enemy.x += Math.sin(enemy.y * 0.05 + enemy.id) * 2;
            
            if (enemy.y > this.canvas.height) {
                this.enemies.splice(i, 1);
            }
        }
    }

    spawnEnemy() {
        const types = [
            { color: '#ff4444', points: 200, speed: 2 },
            { color: '#ffaa00', points: 150, speed: 3 },
            { color: '#8844ff', points: 250, speed: 1.5 }
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.enemies.push({
            id: Date.now() + Math.random(),
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: type.speed,
            baseSpeed: type.speed,
            color: type.color,
            points: type.points,
            health: 2
        });
    }

    spawnBoss() {
        this.boss = {
            x: this.canvas.width / 2 - 75,
            y: -150,
            width: 150,
            height: 150,
            health: 25,
            maxHealth: 25,
            speed: 0.5,
            pattern: 0,
            timer: 0,
            color: '#ff0000',
            name: 'ASTEROID MOTHER',
            phase: 1
        };
        
        // Mostrar aviso
        this.showBossWarning();
        
        // Gravar momento épico
        this.saveEpicMoment('Boss Fight Started');
    }

    showBossWarning() {
        const bossWarning = document.getElementById('bossWarning');
        bossWarning.classList.remove('hidden');
        
        setTimeout(() => {
            bossWarning.classList.add('hidden');
        }, 3000);
    }

    updateBoss() {
        if (!this.boss) return;
        
        this.boss.timer++;
        this.boss.y += this.boss.speed;
        
        // Padrões de movimento do chefão
        if (this.boss.timer < 180) {
            // Entrada
            this.boss.y = Math.min(this.boss.y, 100);
        } else if (this.boss.timer < 300) {
            // Movimento lateral
            this.boss.x += Math.sin(this.boss.timer * 0.05) * 2;
        } else {
            // Ataque
            this.boss.pattern = (Math.floor(this.boss.timer / 120)) % 3;
            
            switch(this.boss.pattern) {
                case 0: // Movimento circular
                    this.boss.x = this.canvas.width/2 + Math.cos(this.boss.timer * 0.03) * 200 - this.boss.width/2;
                    this.boss.y = 150 + Math.sin(this.boss.timer * 0.03) * 50;
                    break;
                case 1: // Ataque direto
                    const targetX = this.player ? this.player.x + this.player.width/2 - this.boss.width/2 : this.canvas.width/2;
                    this.boss.x += (targetX - this.boss.x) * 0.05;
                    break;
                case 2: // Disparo de asteroides
                    if (this.boss.timer % 30 === 0) {
                        this.spawnBossAsteroid();
                    }
                    break;
            }
        }
        
        // Transição de fase
        if (this.boss.health <= this.boss.maxHealth * 0.5 && this.boss.phase === 1) {
            this.boss.phase = 2;
            this.boss.speed *= 1.5;
            this.boss.color = '#ff4500';
            this.showBossPhaseChange();
        }
        
        // Derrotar chefão
        if (this.boss.health <= 0) {
            this.defeatBoss();
        }
    }

    spawnBossAsteroid() {
        const size = 40;
        this.asteroids.push({
            x: this.boss.x + this.boss.width/2 - size/2,
            y: this.boss.y + this.boss.height,
            width: size,
            height: size,
            speed: 4,
            baseSpeed: 4,
            color: '#ff0000',
            outline: '#8b0000',
            rotation: 0,
            rotationSpeed: 0.1,
            health: 3,
            isBossAsteroid: true
        });
    }

    showBossPhaseChange() {
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.innerHTML = `
            <div class="mission-popup">
                <h3>⚡ BOSS PHASE 2!</h3>
                <p>ASTEROID MOTHER ENRAGED</p>
                <p>Speed Increased!</p>
            </div>
        `;
        document.getElementById('missionNotifications').appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
        
        // Gravar momento épico
        this.saveEpicMoment('Boss Phase 2 Activated');
    }

    defeatBoss() {
        // Explosão épica
        for (let i = 0; i < 50; i++) {
            this.createExplosion(
                this.boss.x + this.boss.width/2,
                this.boss.y + this.boss.height/2,
                this.boss.color
            );
        }
        
        // Pontuação massiva
        this.score += 5000;
        
        // Notificação
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.innerHTML = `
            <div class="mission-popup">
                <h3>🏆 BOSS DEFEATED!</h3>
                <p>ASTEROID MOTHER DESTROYED</p>
                <p>+5000 POINTS!</p>
            </div>
        `;
        document.getElementById('missionNotifications').appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
        
        // Gravar momento épico
        this.saveEpicMoment('Boss Defeated');
        
        // Limpar chefão
        this.boss = null;
        
        // Aumentar nível
        this.level += 2;
    }

    updatePowerUps() {
        // Spawn aleatório de power-ups (2% de chance a cada frame)
        const spawnChance = this.easterEggActive ? 0.05 : 0.02;
        if (Math.random() < spawnChance && this.powerUps.length < 3) {
            this.spawnPowerUp();
        }

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            
            // Movimento oscilante
            powerUp.x += Math.sin(powerUp.y * 0.1 + powerUp.id) * 1;
            
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }
    }

    updateActivePowerUps() {
        // Atualizar temporizadores dos power-ups ativos
        Object.keys(this.activePowerUps).forEach(power => {
            if (this.activePowerUps[power].active) {
                this.activePowerUps[power].timer--;
                if (this.activePowerUps[power].timer <= 0) {
                    this.activePowerUps[power].active = false;
                    this.showPowerUpEnded(power);
                }
            }
        });
    }

    spawnPowerUp() {
        const types = [
            { color: '#ffff00', type: 'shield', duration: 450, symbol: '🛡️' },
            { color: '#ff4444', type: 'rapidfire', duration: 300, symbol: '🔥' },
            { color: '#00ff00', type: 'multishot', duration: 250, symbol: '💥' }
        ];
        
        const powerUp = types[Math.floor(Math.random() * types.length)];
        
        this.powerUps.push({
            id: Date.now(),
            x: Math.random() * (this.canvas.width - 25),
            y: -25,
            width: 25,
            height: 25,
            speed: 2,
            ...powerUp
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        // Colisão bala-asteroide
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.checkCollision(bullet, this.asteroids[j])) {
                    const asteroid = this.asteroids[j];
                    asteroid.health -= bullet.damage;
                    
                    if (asteroid.health <= 0) {
                        this.createExplosion(
                            asteroid.x + asteroid.width/2, 
                            asteroid.y + asteroid.height/2,
                            asteroid.color
                        );
                        
                        const points = Math.floor(200 - asteroid.width) * (asteroid.isBossAsteroid ? 3 : 1);
                        this.score += points;
                        
                        // Atualizar missão de asteroides
                        if (!asteroid.isBossAsteroid) {
                            this.missions[0].current++;
                        }
                        
                        this.asteroids.splice(j, 1);
                    }
                    
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Colisão bala-inimigo
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.checkCollision(this.bullets[i], this.enemies[j])) {
                    this.enemies[j].health -= this.bullets[i].damage;
                    
                    if (this.enemies[j].health <= 0) {
                        this.createExplosion(
                            this.enemies[j].x + this.enemies[j].width/2, 
                            this.enemies[j].y + this.enemies[j].height/2,
                            this.enemies[j].color
                        );
                        this.score += this.enemies[j].points;
                        this.enemies.splice(j, 1);
                    }
                    
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Colisão bala-chefão
        if (this.boss) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                if (this.checkCollision(this.bullets[i], this.boss)) {
                    this.boss.health -= this.bullets[i].damage;
                    this.createHitEffect(this.bullets[i].x, this.bullets[i].y, '#ff0000');
                    this.bullets.splice(i, 1);
                }
            }
        }

        // Colisão jogador-asteroide/inimigo
        if (!this.activePowerUps.shield.active && !this.easterEggActive) {
            for (let i = this.asteroids.length - 1; i >= 0; i--) {
                if (this.checkCollision(this.player, this.asteroids[i])) {
                    this.createExplosion(
                        this.player.x + this.player.width/2, 
                        this.player.y + this.player.height/2,
                        '#ff4444'
                    );
                    this.lives--;
                    this.asteroids.splice(i, 1);
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.showDamageNotification();
                    }
                }
            }

            for (let i = this.enemies.length - 1; i >= 0; i--) {
                if (this.checkCollision(this.player, this.enemies[i])) {
                    this.createExplosion(
                        this.player.x + this.player.width/2, 
                        this.player.y + this.player.height/2,
                        '#ff4444'
                    );
                    this.lives -= 2;
                    this.enemies.splice(i, 1);
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.showDamageNotification();
                    }
                }
            }
            
            // Colisão jogador-chefão
            if (this.boss && this.checkCollision(this.player, this.boss)) {
                this.createExplosion(
                    this.player.x + this.player.width/2, 
                    this.player.y + this.player.height/2,
                    '#ff0000'
                );
                this.lives = 0;
                this.gameOver();
            }
        }

        // Colisão jogador-powerup
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.player, this.powerUps[i])) {
                this.collectPowerUp(this.powerUps[i]);
                this.powerUps.splice(i, 1);
            }
        }
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    collectPowerUp(powerUp) {
        this.createParticles(
            powerUp.x + powerUp.width/2, 
            powerUp.y + powerUp.height/2, 
            powerUp.color
        );
        
        this.activePowerUps[powerUp.type].active = true;
        this.activePowerUps[powerUp.type].timer = powerUp.duration;
        
        // Atualizar missão de power-ups
        this.missions[1].current++;
        
        // Efeitos especiais
        switch(powerUp.type) {
            case 'shield':
                this.lives = Math.min(this.lives + 1, 5);
                this.showNotification('SHIELD ACTIVATED! +1 LIFE');
                break;
            case 'rapidfire':
                this.showNotification('RAPID FIRE ACTIVATED!');
                break;
            case 'multishot':
                this.showNotification('MULTI SHOT ACTIVATED!');
                break;
        }
        
        // Gravar momento épico
        this.saveEpicMoment(`${powerUp.type.toUpperCase()} Collected`);
    }

    showPowerUpEnded(powerType) {
        const messages = {
            shield: 'SHIELD DEPLETED',
            rapidfire: 'RAPID FIRE ENDED',
            multishot: 'MULTI SHOT ENDED'
        };
        
        this.showNotification(messages[powerType]);
    }

    showDamageNotification() {
        this.showNotification('DAMAGE TAKEN!', '#ff0000');
    }

    showNotification(message, color = '#00ff00') {
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.style.borderColor = color;
        notification.innerHTML = `
            <div class="mission-popup">
                <p style="color: ${color}">${message}</p>
            </div>
        `;
        document.getElementById('missionNotifications').appendChild(notification);
        
        setTimeout(() => notification.remove(), 1500);
    }

    createExplosion(x, y, color) {
        const particleCount = this.easterEggActive ? 20 : 12;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * (this.easterEggActive ? 15 : 10),
                vy: (Math.random() - 0.5) * (this.easterEggActive ? 15 : 10),
                life: this.easterEggActive ? 35 : 25,
                color: color,
                size: Math.random() * (this.easterEggActive ? 6 : 4) + 2
            });
        }
    }

    createHitEffect(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 15,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 20,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    }

    activateEasterEgg() {
        this.easterEggActive = true;
        
        // Efeitos visuais
        document.body.style.animation = 'none';
        document.body.style.background = 'linear-gradient(45deg, #000000, #333333)';
        
        // Notificação épica
        const notification = document.createElement('div');
        notification.className = 'mission-notification';
        notification.style.borderColor = '#FF9900';
        notification.style.background = 'rgba(0, 0, 0, 0.95)';
        notification.innerHTML = `
            <div class="mission-popup">
                <h3 style="color: #FF9900">🚀 SECRET MODE UNLOCKED!</h3>
                <p style="color: #FF9900">FOUNDER'S EDITION ACTIVATED</p>
                <p>All power-ups enhanced!</p>
                <p>Orange Amazon theme!</p>
                <p>Maximum power! 💪</p>
            </div>
        `;
        document.getElementById('missionNotifications').appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
        
        // Ativar todos os power-ups
        Object.keys(this.activePowerUps).forEach(power => {
            this.activePowerUps[power].active = true;
            this.activePowerUps[power].timer = 9999; // Duração muito longa
        });
        
        // Bônus de vida
        this.lives = 5;
        
        // Gravar momento épico
        this.saveEpicMoment('Easter Egg Activated');
    }

    // Sistema de Replay
    startRecording() {
        this.replayFrames = [];
        this.isRecording = true;
        this.epicMoments = [];
    }

    stopRecording() {
        this.isRecording = false;
    }

    recordFrame() {
        if (this.replayFrames.length >= this.maxReplayFrames) {
            this.replayFrames.shift();
        }
        
        this.replayFrames.push({
            player: { ...this.player },
            asteroids: JSON.parse(JSON.stringify(this.asteroids)),
            enemies: JSON.parse(JSON.stringify(this.enemies)),
            bullets: JSON.parse(JSON.stringify(this.bullets)),
            powerUps: JSON.parse(JSON.stringify(this.powerUps)),
            particles: JSON.parse(JSON.stringify(this.particles)),
            boss: this.boss ? { ...this.boss } : null,
            score: this.score,
            level: this.level,
            timestamp: Date.now()
        });
    }

    saveEpicMoment(event) {
        this.epicMoments.push({
            event: event,
            timestamp: Date.now(),
            score: this.score,
            level: this.level
        });
        
        // Manter apenas os últimos 3 momentos épicos
        if (this.epicMoments.length > 3) {
            this.epicMoments.shift();
        }
    }

    playReplay() {
        if (this.replayFrames.length === 0) return;
        
        let frameIndex = 0;
        
        const replayLoop = () => {
            if (frameIndex >= this.replayFrames.length) {
                frameIndex = 0; // Loop
            }
            
            const frame = this.replayFrames[frameIndex];
            this.renderReplayFrame(frame);
            
            frameIndex++;
            setTimeout(replayLoop, 1000 / 30); // 30 FPS para replay
        };
        
        replayLoop();
    }

    renderReplayFrame(frame) {
        // Limpar canvas
        this.replayCtx.fillStyle = '#000011';
        this.replayCtx.fillRect(0, 0, this.replayCanvas.width, this.replayCanvas.height);
        
        // Desenhar fundo
        this.drawReplayBackground();
        
        // Desenhar elementos
        if (frame.boss) {
            this.drawReplayBoss(frame.boss);
        }
        
        frame.asteroids.forEach(asteroid => {
            this.drawReplayAsteroid(asteroid);
        });
        
        frame.enemies.forEach(enemy => {
            this.drawReplayEnemy(enemy);
        });
        
        frame.bullets.forEach(bullet => {
            this.drawReplayBullet(bullet);
        });
        
        frame.powerUps.forEach(powerUp => {
            this.drawReplayPowerUp(powerUp);
        });
        
        frame.particles.forEach(particle => {
            this.drawReplayParticle(particle);
        });
        
        this.drawReplayPlayer(frame.player);
        
        // Informações do replay
        this.replayCtx.fillStyle = '#ffffff';
        this.replayCtx.font = '16px Courier New';
        this.replayCtx.fillText(`SCORE: ${frame.score}`, 10, 30);
        this.replayCtx.fillText(`LEVEL: ${frame.level}`, 10, 60);
        this.replayCtx.fillText('REPLAY MODE', 10, 90);
    }

    // Funções de renderização do replay (simplificadas)
    drawReplayBackground() {
        // Fundo estrelado simples
        this.replayCtx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 13467) % this.replayCanvas.width;
            const y = (i * 56789) % this.replayCanvas.height;
            this.replayCtx.fillRect(x, y, 1, 1);
        }
    }

    drawReplayPlayer(player) {
        this.replayCtx.fillStyle = player.color || '#ffffff';
        this.replayCtx.fillRect(player.x, player.y, player.width, player.height);
    }

    drawReplayAsteroid(asteroid) {
        this.replayCtx.fillStyle = asteroid.color;
        this.replayCtx.beginPath();
        this.replayCtx.arc(
            asteroid.x + asteroid.width/2,
            asteroid.y + asteroid.height/2,
            asteroid.width/2,
            0,
            Math.PI * 2
        );
        this.replayCtx.fill();
    }

    drawReplayEnemy(enemy) {
        this.replayCtx.fillStyle = enemy.color;
        this.replayCtx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }

    drawReplayBullet(bullet) {
        this.replayCtx.fillStyle = bullet.color;
        this.replayCtx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    drawReplayPowerUp(powerUp) {
        this.replayCtx.fillStyle = powerUp.color;
        this.replayCtx.beginPath();
        this.replayCtx.arc(
            powerUp.x + powerUp.width/2,
            powerUp.y + powerUp.height/2,
            powerUp.width/2,
            0,
            Math.PI * 2
        );
        this.replayCtx.fill();
    }

    drawReplayParticle(particle) {
        const alpha = particle.life / 25;
        this.replayCtx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        this.replayCtx.beginPath();
        this.replayCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.replayCtx.fill();
    }

    drawReplayBoss(boss) {
        this.replayCtx.fillStyle = boss.color;
        this.replayCtx.fillRect(boss.x, boss.y, boss.width, boss.height);
        
        // Barra de saúde do chefão
        const healthWidth = 100;
        const healthPercent = boss.health / boss.maxHealth;
        
        this.replayCtx.fillStyle = '#ff0000';
        this.replayCtx.fillRect(
            this.replayCanvas.width/2 - healthWidth/2,
            20,
            healthWidth,
            10
        );
        
        this.replayCtx.fillStyle = '#00ff00';
        this.replayCtx.fillRect(
            this.replayCanvas.width/2 - healthWidth/2,
            20,
            healthWidth * healthPercent,
            10
        );
        
        this.replayCtx.strokeStyle = '#ffffff';
        this.replayCtx.lineWidth = 2;
        this.replayCtx.strokeRect(
            this.replayCanvas.width/2 - healthWidth/2,
            20,
            healthWidth,
            10
        );
        
        // Nome do chefão
        this.replayCtx.fillStyle = '#ffffff';
        this.replayCtx.font = 'bold 20px Courier New';
        this.replayCtx.textAlign = 'center';
        this.replayCtx.fillText(boss.name, this.replayCanvas.width/2, 55);
    }

    // Renderização principal do jogo (mantida do original)
    render() {
        // Limpar canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar fundo estrelado melhorado
        this.drawStars();
        
        // Desenhar nebulosa de fundo
        this.drawNebula();

        // Desenhar Terra no fundo
        this.drawEarth();

        // Desenhar elementos do jogo
        this.drawAsteroids();
        this.drawEnemies();
        if (this.boss) this.drawBoss();
        this.drawBullets();
        this.drawPowerUps();
        this.drawParticles();
        this.drawPlayer();

        // Barra de saúde do chefão
        if (this.boss) {
            this.drawBossHealthBar();
        }
    }

    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 200; i++) {
            const x = (i * 13467) % this.canvas.width;
            const y = (i * 56789) % this.canvas.height;
            const size = Math.random() * 1.5;
            const brightness = Math.random() * 0.9 + 0.1;
            const twinkle = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * twinkle})`;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    drawNebula() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 3, this.canvas.height / 4, 10,
            this.canvas.width / 3, this.canvas.height / 4, 250
        );
        gradient.addColorStop(0, 'rgba(0, 50, 100, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 50, 100, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawEarth() {
        this.ctx.fillStyle = '#1e90ff';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 80, 80, 50, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#228b22';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 100, 65, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 70, 95, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(135, 206, 250, 0.4)';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 80, 80, 54, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawPlayer() {
        const x = this.player.x;
        const y = this.player.y;
        const width = this.player.width;
        const height = this.player.height;

        // Escudo
        if (this.activePowerUps.shield.active || this.easterEggActive) {
            const shieldColor = this.easterEggActive ? '#FF9900' : 'rgba(0, 255, 255, 0.6)';
            this.ctx.strokeStyle = shieldColor;
            this.ctx.lineWidth = this.easterEggActive ? 5 : 3;
            this.ctx.beginPath();
            this.ctx.arc(x + width/2, y + height/2, width, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Efeito de pulsação do escudo
            if (this.easterEggActive) {
                const pulse = Math.sin(Date.now() * 0.01) * 3;
                this.ctx.strokeStyle = `rgba(255, 153, 0, ${0.3 + Math.sin(Date.now() * 0.02) * 0.2})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x + width/2, y + height/2, width + pulse, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }

        // Cor do foguete no easter egg
        const rocketColor = this.easterEggActive ? '#FF9900' : '#ffffff';
        const detailsColor = this.easterEggActive ? '#CC6600' : '#cccccc';
        const windowColor = this.easterEggActive ? '#FFCC00' : '#87ceeb';

        // Corpo principal
        this.ctx.fillStyle = rocketColor;
        this.ctx.fillRect(x + width*0.3, y, width*0.4, height);

        // Nariz cônico
        this.ctx.fillStyle = rocketColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width/2, y - 15);
        this.ctx.lineTo(x + width*0.3, y);
        this.ctx.lineTo(x + width*0.7, y);
        this.ctx.closePath();
        this.ctx.fill();

        // Janelas
        this.ctx.fillStyle = windowColor;
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + 25, 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Aletas
        this.ctx.fillStyle = detailsColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width*0.2, y + height*0.7);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + width*0.3, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + width*0.8, y + height*0.7);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x + width*0.7, y + height);
        this.ctx.closePath();
        this.ctx.fill();

        // Motor
        const flameHeight = 15 + Math.random() * 5;
        const gradient = this.ctx.createLinearGradient(
            x + width/2, y + height,
            x + width/2, y + height + flameHeight
        );
        
        if (this.easterEggActive) {
            gradient.addColorStop(0, '#FFCC00');
            gradient.addColorStop(0.5, '#FF6600');
            gradient.addColorStop(1, 'rgba(255, 102, 0, 0)');
        } else {
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(0.5, '#ff4500');
            gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width*0.4, y + height);
        this.ctx.lineTo(x + width*0.6, y + height);
        this.ctx.lineTo(x + width/2, y + height + flameHeight);
        this.ctx.closePath();
        this.ctx.fill();

        // Detalhes
        const stripeColor = this.easterEggActive ? '#000000' : '#1e90ff';
        this.ctx.fillStyle = stripeColor;
        this.ctx.fillRect(x + width*0.35, y + height*0.8, width*0.3, 5);
        this.ctx.fillRect(x + width*0.4, y + height*0.6, width*0.2, 3);
        
        // Logo da Blue Origin no easter egg
        if (this.easterEggActive) {
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('BLUE', x + width/2, y + height*0.4);
            this.ctx.fillText('ORIGIN', x + width/2, y + height*0.5);
        }
    }

    drawBullets() {
        this.bullets.forEach(bullet => {
            const gradient = this.ctx.createLinearGradient(
                bullet.x, bullet.y,
                bullet.x, bullet.y + bullet.height
            );
            
            if (this.easterEggActive) {
                gradient.addColorStop(0, '#FF9900');
                gradient.addColorStop(0.5, '#FF6600');
                gradient.addColorStop(1, '#FF3300');
            } else {
                gradient.addColorStop(0, '#00ffff');
                gradient.addColorStop(1, '#0088ff');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            this.ctx.fillStyle = this.easterEggActive ? 
                'rgba(255, 153, 0, 0.4)' : 'rgba(0, 255, 255, 0.3)';
            this.ctx.fillRect(bullet.x - 1, bullet.y + bullet.height, bullet.width + 2, 8);
        });
    }

    drawAsteroids() {
        this.asteroids.forEach(asteroid => {
            this.ctx.save();
            this.ctx.translate(asteroid.x + asteroid.width/2, asteroid.y + asteroid.height/2);
            this.ctx.rotate(asteroid.rotation);
            
            this.ctx.fillStyle = asteroid.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, asteroid.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = asteroid.outline;
            this.ctx.lineWidth = asteroid.isBossAsteroid ? 3 : 2;
            this.ctx.stroke();
            
            // Crateras
            this.ctx.fillStyle = asteroid.outline;
            this.ctx.beginPath();
            this.ctx.arc(-asteroid.width/4, -asteroid.height/4, asteroid.width/8, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(asteroid.width/3, asteroid.height/5, asteroid.width/10, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Indicador de saúde para asteroides do chefão
            if (asteroid.isBossAsteroid && asteroid.health > 1) {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`❤️${asteroid.health}`, 0, -asteroid.width/2 - 10);
            }
            
            this.ctx.restore();
        });
    }

    drawEnemies() {
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            
            this.ctx.beginPath();
            this.ctx.moveTo(enemy.x + enemy.width/2, enemy.y);
            this.ctx.lineTo(enemy.x, enemy.y + enemy.height);
            this.ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(enemy.x + enemy.width/2 - 2, enemy.y + 5, 4, 8);
            
            if (enemy.health > 1) {
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2 + 3, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    drawBoss() {
        if (!this.boss) return;
        
        this.ctx.save();
        
        // Corpo principal
        this.ctx.fillStyle = this.boss.color;
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.boss.x + this.boss.width/2,
            this.boss.y + this.boss.height/2,
            this.boss.width/2,
            this.boss.height/2,
            0, 0, Math.PI * 2
        );
        this.ctx.fill();
        
        // Detalhes
        this.ctx.fillStyle = '#8b0000';
        this.ctx.beginPath();
        this.ctx.arc(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/3, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.boss.x + this.boss.width/3, this.boss.y + this.boss.height * 2/3, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.boss.x + this.boss.width * 2/3, this.boss.y + this.boss.height * 2/3, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Efeito de pulsação na fase 2
        if (this.boss.phase === 2) {
            const pulse = Math.sin(Date.now() * 0.02) * 5;
            this.ctx.strokeStyle = `rgba(255, 69, 0, ${0.5 + Math.sin(Date.now() * 0.03) * 0.3})`;
            this.ctx.lineWidth = 3 + pulse;
            this.ctx.beginPath();
            this.ctx.ellipse(
                this.boss.x + this.boss.width/2,
                this.boss.y + this.boss.height/2,
                this.boss.width/2 + 5,
                this.boss.height/2 + 5,
                0, 0, Math.PI * 2
            );
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    drawBossHealthBar() {
        const barWidth = 200;
        const barHeight = 20;
        const x = this.canvas.width/2 - barWidth/2;
        const y = 20;
        const healthPercent = this.boss.health / this.boss.maxHealth;
        
        // Fundo da barra
        this.ctx.fillStyle = '#330000';
        this.ctx.fillRect(x, y, barWidth, barHeight);
        
        // Saúde atual
        const gradient = this.ctx.createLinearGradient(x, y, x + barWidth, y);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(healthPercent, this.boss.phase === 2 ? '#ff4500' : '#ff0000');
        gradient.addColorStop(healthPercent, '#00ff00');
        gradient.addColorStop(1, '#00ff00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Borda
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Texto
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 16px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.boss.name, this.canvas.width/2, y - 10);
        this.ctx.fillText(`PHASE ${this.boss.phase}`, this.canvas.width/2, y + barHeight + 20);
        this.ctx.fillText(`${this.boss.health}/${this.boss.maxHealth}`, this.canvas.width/2, y + barHeight + 40);
    }

    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            
            const pulse = Math.sin(Date.now() * 0.01) * 3;
            const size = powerUp.width + pulse;
            
            this.ctx.fillStyle = powerUp.color;
            this.ctx.beginPath();
            this.ctx.arc(
                powerUp.x + powerUp.width/2, 
                powerUp.y + powerUp.height/2, 
                size/2, 0, Math.PI * 2
            );
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                powerUp.symbol, 
                powerUp.x + powerUp.width/2, 
                powerUp.y + powerUp.height/2
            );
            
            this.ctx.strokeStyle = powerUp.color;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                powerUp.x + powerUp.width/2, 
                powerUp.y + powerUp.height/2, 
                size/2 + 3, 0, Math.PI * 2
            );
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / (this.easterEggActive ? 35 : 25);
            this.ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

// Inicializar o jogo quando a página carregar
window.addEventListener('load', () => {
    const game = new SERADefender();
    window.game = game; // Para debugging
});