/**
 * Game Logic for Eye-Tracking Game
 */

class Game {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.isPaused = false;
    this.gameMode = CONFIG.GAME_MODES.CLASSIC;
    this.difficulty = 'medium';
    this.score = 0;
    this.level = 1;
    this.startTime = 0;
    this.pauseTime = 0;
    this.totalPausedTime = 0;
    this.target = null;
    this.targets = [];
    this.gazeFixationTime = 0;
    this.gazeOnTarget = false;
    this.settings = StorageManager.loadSettings();
    this.gameStats = {
      shotsAttempted: 0,
      shotsMade: 0,
      accuracy: 0
    };
  }

  /**
   * Initialize game
   * @param {HTMLCanvasElement} canvas - Canvas element for game
   */
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120; // Account for HUD
    Utils.log('Game initialized', { width: canvas.width, height: canvas.height });
  }

  /**
   * Start game
   * @param {string} mode - Game mode
   * @param {string} difficulty - Difficulty level
   */
  start(mode = CONFIG.GAME_MODES.CLASSIC, difficulty = 'medium') {
    this.gameMode = mode;
    this.difficulty = difficulty;
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.level = 1;
    this.startTime = Utils.now();
    this.totalPausedTime = 0;
    this.gazeFixationTime = 0;
    this.gameStats = { shotsAttempted: 0, shotsMade: 0, accuracy: 0 };

    this.spawnTarget();
    Utils.log('Game started', { mode, difficulty });
  }

  /**
   * Pause game
   */
  pause() {
    if (!this.isRunning) return;
    this.isPaused = true;
    this.pauseTime = Utils.now();
    Utils.log('Game paused');
  }

  /**
   * Resume game
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.totalPausedTime += Utils.now() - this.pauseTime;
    this.isPaused = false;
    Utils.log('Game resumed');
  }

  /**
   * End game
   * @returns {Object} Final game stats
   */
  end() {
    this.isRunning = false;
    this.gameStats.accuracy = this.gameStats.shotsAttempted > 0
      ? Math.round((this.gameStats.shotsMade / this.gameStats.shotsAttempted) * 100)
      : 0;

    const finalStats = {
      score: this.score,
      level: this.level,
      duration: this.getDuration(),
      accuracy: this.gameStats.accuracy,
      shotsAttempted: this.gameStats.shotsAttempted,
      shotsMade: this.gameStats.shotsMade
    };

    Utils.log('Game ended', finalStats);
    return finalStats;
  }

  /**
   * Update game state
   * @param {Object} gazePoint - Current gaze point {x, y}
   * @param {number} gazeConfidence - Gaze detection confidence
   */
  update(gazePoint, gazeConfidence) {
    if (!this.isRunning || this.isPaused) return;

    // Check if gaze is on target
    if (this.target && gazeConfidence >= this.settings.game.gazeTolerance / 100) {
      const isOnTarget = Utils.isGazeOnTarget(
        gazePoint.x,
        gazePoint.y,
        this.target.x,
        this.target.y,
        this.settings.game.gazeTolerance
      );

      if (isOnTarget) {
        this.gazeFixationTime += 16; // ~16ms per frame at 60fps
        this.gazeOnTarget = true;

        // Check if fixation time exceeded threshold
        const threshold = CONFIG.DIFFICULTIES[this.difficulty.toUpperCase()].gazeHoldTime ||
                         this.settings.game.gazeHoldTime;

        if (this.gazeFixationTime >= threshold) {
          this.hitTarget();
        }
      } else {
        this.gazeFixationTime = 0;
        this.gazeOnTarget = false;
      }
    } else {
      this.gazeFixationTime = 0;
      this.gazeOnTarget = false;
    }

    // Check for level progression
    if (this.score > 0 && this.score % 10 === 0 && this.score !== this.level * 10) {
      this.levelUp();
    }
  }

  /**
   * Spawn new target
   */
  spawnTarget() {
    const sizeMap = { small: 20, medium: 40, large: 60 };
    const size = sizeMap[this.settings.game.targetSize] || 40;

    this.target = {
      x: Utils.random(size + 20, this.canvas.width - size - 20),
      y: Utils.random(size + 80, this.canvas.height - size - 20),
      size: size,
      color: this.settings.game.targetColor,
      spawnTime: Utils.now()
    };

    audioManager.playSound(CONFIG.AUDIO.SOUND_EFFECTS.TARGET_APPEAR);
    Utils.log('Target spawned', this.target);
  }

  /**
   * Hit target
   */
  hitTarget() {
    this.score++;
    this.gameStats.shotsMade++;
    this.gazeFixationTime = 0;
    this.gazeOnTarget = false;

    audioManager.playSound(CONFIG.AUDIO.SOUND_EFFECTS.TARGET_HIT);

    // Spawn new target after cooldown
    const cooldown = CONFIG.DIFFICULTIES[this.difficulty.toUpperCase()].cooldown || 200;
    setTimeout(() => this.spawnTarget(), cooldown);
  }

  /**
   * Level up
   */
  levelUp() {
    this.level++;
    audioManager.playSound(CONFIG.AUDIO.SOUND_EFFECTS.LEVEL_UP);
    audioManager.speak(`Level ${this.level}`);
    Utils.log('Level up', this.level);
  }

  /**
   * Draw game
   */
  draw() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.target) {
      this.drawTarget(this.target);
    }

    // Draw gaze point if enabled
    if (this.settings.calibration.showGazePoint) {
      const gaze = eyeTracker.getSmoothedGaze();
      if (gaze.x > 0 && gaze.y > 0) {
        this.drawGazePoint(gaze);
      }
    }
  }

  /**
   * Draw target
   * @param {Object} target - Target object
   */
  drawTarget(target) {
    const { ctx } = this;
    const now = Utils.now();
    const age = now - target.spawnTime;
    const pulseFactor = Math.sin(age / 100) * 0.1 + 0.9; // Pulse effect

    ctx.fillStyle = target.color;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.size * pulseFactor, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw gaze fixation indicator
    if (this.gazeOnTarget && this.gazeFixationTime > 0) {
      const progress = Math.min(1, this.gazeFixationTime / this.settings.game.gazeHoldTime);
      ctx.strokeStyle = `rgba(81, 207, 102, ${progress})`;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.size * pulseFactor + 10, 0, Math.PI * 2 * progress);
      ctx.stroke();
    }
  }

  /**
   * Draw gaze point
   * @param {Object} gaze - Gaze point {x, y}
   */
  drawGazePoint(gaze) {
    const { ctx } = this;
    const color = this.settings.calibration.gazeMarkerColor || '#FF0000';
    const sizeMap = { small: 10, medium: 15, large: 20 };
    const size = sizeMap[this.settings.calibration.gazeMarkerSize] || 15;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(gaze.x, gaze.y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * Get game time in milliseconds
   * @returns {number} Game time
   */
  getTime() {
    if (!this.isRunning) return 0;
    const elapsed = Utils.now() - this.startTime - this.totalPausedTime;
    return Math.max(0, elapsed);
  }

  /**
   * Get game duration in milliseconds
   * @returns {number} Game duration
   */
  getDuration() {
    return Math.floor(this.getTime() / 1000);
  }

  /**
   * Check if game time exceeded
   * @param {number} maxTime - Maximum time in milliseconds
   * @returns {boolean} True if time exceeded
   */
  isTimeExceeded(maxTime) {
    return this.getTime() >= maxTime;
  }
}

// Global instance
const game = new Game();