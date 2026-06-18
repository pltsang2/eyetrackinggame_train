/**
 * UI Manager for Eye-Tracking Game
 */

class UIManager {
  constructor() {
    this.currentScreen = 'mainMenu';
    this.settings = StorageManager.loadSettings();
  }

  /**
   * Initialize UI
   */
  init() {
    this.setupEventListeners();
    this.updateDeviceList();
    this.updateScoresList();
    this.applySettings();
    Utils.log('UIManager initialized');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Main Menu
    document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
    document.getElementById('settingsBtn').addEventListener('click', () => this.showScreen('settingsScreen'));
    document.getElementById('scoresBtn').addEventListener('click', () => this.showScreen('scoresScreen'));
    document.getElementById('helpBtn').addEventListener('click', () => this.showScreen('helpScreen'));

    // Settings
    document.getElementById('closeSettings').addEventListener('click', () => this.showScreen('mainMenu'));
    document.getElementById('applyWebcamSettings').addEventListener('click', () => this.applyWebcamSettings());
    document.getElementById('resetWebcamSettings').addEventListener('click', () => this.resetWebcamSettings());
    document.getElementById('applyGameSettings').addEventListener('click', () => this.applyGameSettings());
    document.getElementById('resetGameSettings').addEventListener('click', () => this.resetGameSettings());
    document.getElementById('startCalibration').addEventListener('click', () => this.startCalibration());
    document.getElementById('resetCalibration').addEventListener('click', () => this.resetCalibration());

    // Settings Range Sliders
    document.getElementById('gazeHoldTime').addEventListener('input', (e) => {
      document.getElementById('gazeHoldTimeValue').textContent = e.target.value + 'ms';
    });
    document.getElementById('gazeTolerance').addEventListener('input', (e) => {
      document.getElementById('gazeToleranceValue').textContent = e.target.value + 'px';
    });
    document.getElementById('soundVolume').addEventListener('input', (e) => {
      document.getElementById('soundVolumeValue').textContent = e.target.value + '%';
      audioManager.setVolume(e.target.value / 100);
    });
    document.getElementById('trailLength').addEventListener('input', (e) => {
      document.getElementById('trailLengthValue').textContent = e.target.value;
    });

    // Scores
    document.getElementById('closeScores').addEventListener('click', () => this.showScreen('mainMenu'));
    document.getElementById('clearScoresBtn').addEventListener('click', () => this.clearScores());

    // Help
    document.getElementById('closeHelp').addEventListener('click', () => this.showScreen('mainMenu'));

    // Game Controls
    document.getElementById('pauseGameBtn').addEventListener('click', () => this.pauseGame());
    document.getElementById('menuGameBtn').addEventListener('click', () => this.quitGame());

    // Pause Screen
    document.getElementById('resumeGameBtn').addEventListener('click', () => this.resumeGame());
    document.getElementById('quitGameBtn').addEventListener('click', () => this.quitToMenu());

    // Game Over Screen
    document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
    document.getElementById('menuBtn').addEventListener('click', () => this.showScreen('mainMenu'));

    // High Contrast Mode
    document.getElementById('highContrastMode').addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    });

    // Display Scale
    document.getElementById('displayScale').addEventListener('change', (e) => {
      const scale = e.target.value / 100;
      document.body.style.transform = `scale(${scale})`;
      document.body.style.transformOrigin = 'top center';
    });
  }

  /**
   * Show screen
   * @param {string} screenId - Screen ID to show
   */
  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
    });

    // Show target screen
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = screenId;
      Utils.log('Screen shown', screenId);
    }
  }

  /**
   * Update device list
   */
  async updateDeviceList() {
    const select = document.getElementById('deviceSelect');
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    select.innerHTML = '';
    videoDevices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.textContent = device.label || `Camera ${index + 1}`;
      select.appendChild(option);
    });
  }

  /**
   * Apply webcam settings
   */
  async applyWebcamSettings() {
    this.settings.webcam.deviceId = document.getElementById('deviceSelect').value;
    this.settings.webcam.resolution = document.getElementById('resolutionSelect').value;
    this.settings.webcam.fps = parseInt(document.getElementById('fpsSelect').value);
    this.settings.webcam.flipHorizontal = document.getElementById('flipHorizontal').checked;
    this.settings.webcam.flipVertical = document.getElementById('flipVertical').checked;
    this.settings.webcam.rotation = parseInt(document.getElementById('rotationSelect').value);

    StorageManager.saveSettings(this.settings);
    audioManager.speak('Webcam settings applied');
    Utils.log('Webcam settings applied');
  }

  /**
   * Reset webcam settings
   */
  resetWebcamSettings() {
    this.settings.webcam = DEFAULT_SETTINGS.webcam;
    this.applyWebcamSettings();
  }

  /**
   * Apply game settings
   */
  applyGameSettings() {
    this.settings.game.difficulty = document.getElementById('difficultySelect').value;
    this.settings.game.targetSize = document.getElementById('targetSizeSelect').value;
    this.settings.game.gazeHoldTime = parseInt(document.getElementById('gazeHoldTime').value);
    this.settings.game.gazeTolerance = parseInt(document.getElementById('gazeTolerance').value);
    this.settings.game.soundVolume = parseInt(document.getElementById('soundVolume').value) / 100;
    this.settings.game.voiceFeedback = document.getElementById('voiceFeedback').checked;
    this.settings.game.highContrast = document.getElementById('highContrastMode').checked;
    this.settings.game.displayScale = parseInt(document.getElementById('displayScale').value);

    StorageManager.saveSettings(this.settings);
    audioManager.speak('Game settings applied');
    Utils.log('Game settings applied');
  }

  /**
   * Reset game settings
   */
  resetGameSettings() {
    this.settings.game = DEFAULT_SETTINGS.game;
    this.applyGameSettings();
  }

  /**
   * Apply all settings to UI
   */
  applySettings() {
    // Load settings to form
    document.getElementById('resolutionSelect').value = this.settings.webcam.resolution;
    document.getElementById('fpsSelect').value = this.settings.webcam.fps;
    document.getElementById('flipHorizontal').checked = this.settings.webcam.flipHorizontal;
    document.getElementById('flipVertical').checked = this.settings.webcam.flipVertical;
    document.getElementById('rotationSelect').value = this.settings.webcam.rotation;

    document.getElementById('difficultySelect').value = this.settings.game.difficulty;
    document.getElementById('targetSizeSelect').value = this.settings.game.targetSize;
    document.getElementById('gazeHoldTime').value = this.settings.game.gazeHoldTime;
    document.getElementById('gazeTolerance').value = this.settings.game.gazeTolerance;
    document.getElementById('soundVolume').value = this.settings.game.soundVolume * 100;
    document.getElementById('voiceFeedback').checked = this.settings.game.voiceFeedback;
    document.getElementById('highContrastMode').checked = this.settings.game.highContrast;
    document.getElementById('displayScale').value = this.settings.game.displayScale;

    document.getElementById('gazeHoldTimeValue').textContent = this.settings.game.gazeHoldTime + 'ms';
    document.getElementById('gazeToleranceValue').textContent = this.settings.game.gazeTolerance + 'px';
    document.getElementById('soundVolumeValue').textContent = (this.settings.game.soundVolume * 100) + '%';
  }

  /**
   * Update scores list
   */
  updateScoresList() {
    const scores = StorageManager.loadScores();
    const tbody = document.getElementById('scoresTableBody');

    if (scores.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="no-scores">No scores yet. Play a game!</td></tr>';
      return;
    }

    tbody.innerHTML = scores.map((score, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${score.score}</td>
        <td>${Utils.formatTime(score.duration * 1000)}</td>
        <td>${score.accuracy}%</td>
        <td>${new Date(score.timestamp).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  /**
   * Clear all scores
   */
  clearScores() {
    if (confirm('Are you sure you want to clear all scores?')) {
      StorageManager.clearScores();
      this.updateScoresList();
      audioManager.speak('All scores cleared');
    }
  }

  /**
   * Start calibration
   */
  startCalibration() {
    this.showScreen('calibrationScreen');
    // Calibration logic will be handled in main.js
  }

  /**
   * Reset calibration
   */
  resetCalibration() {
    calibrationManager.reset();
    audioManager.speak('Calibration reset');
  }

  /**
   * Start game
   */
  startGame() {
    this.showScreen('gameScreen');
    // Game logic will be handled in main.js
  }

  /**
   * Pause game
   */
  pauseGame() {
    game.pause();
    document.getElementById('pauseScore').textContent = game.score;
    document.getElementById('pauseTime').textContent = Utils.formatTime(game.getTime());
    document.getElementById('pauseAccuracy').textContent = game.gameStats.accuracy + '%';
    this.showScreen('pauseScreen');
  }

  /**
   * Resume game
   */
  resumeGame() {
    game.resume();
    this.showScreen('gameScreen');
  }

  /**
   * Quit game
   */
  quitGame() {
    if (confirm('Are you sure you want to quit?')) {
      game.end();
      this.quitToMenu();
    }
  }

  /**
   * Quit to menu
   */
  quitToMenu() {
    this.showScreen('mainMenu');
  }

  /**
   * Update game HUD
   * @param {number} score - Current score
   * @param {number} time - Current time in ms
   * @param {number} level - Current level
   * @param {number} fps - Current FPS
   */
  updateHUD(score, time, level, fps) {
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('timeDisplay').textContent = Utils.formatTime(time);
    document.getElementById('levelDisplay').textContent = level;
    document.getElementById('fpsDisplay').textContent = fps;
  }

  /**
   * Show game over screen
   * @param {Object} stats - Game stats
   */
  showGameOver(stats) {
    document.getElementById('finalScore').textContent = stats.score;
    document.getElementById('finalTime').textContent = Utils.formatTime(stats.duration * 1000);
    document.getElementById('finalAccuracy').textContent = stats.accuracy + '%';
    document.getElementById('finalLevel').textContent = stats.level;
    this.showScreen('gameOverScreen');
  }
}

// Global instance
const uiManager = new UIManager();