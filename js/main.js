/**
 * Main Application File - Eye-Tracking Game
 */

let webcamManager = null;
let gameRunning = false;
let gameLoopId = null;

/**
 * Initialize application
 */
async function initializeApp() {
  console.log('🎮 Initializing Eye-Tracking Game...');

  try {
    // Initialize UI Manager
    uiManager.init();

    // Get preview canvas
    const previewCanvas = document.getElementById('previewCanvas');
    previewCanvas.width = 640;
    previewCanvas.height = 480;

    // Initialize Webcam
    webcamManager = new WebcamManager();
    const webcamOk = await webcamManager.init(previewCanvas);

    if (!webcamOk) {
      document.getElementById('previewStatus').textContent = '❌ Webcam Access Denied';
      document.getElementById('previewStatus').style.color = '#FF6B6B';
      return;
    }

    // Initialize Eye Tracker
    const trackerOk = await eyeTracker.init();
    if (!trackerOk) {
      document.getElementById('previewStatus').textContent = '❌ Eye Tracker Failed';
      document.getElementById('previewStatus').style.color = '#FF6B6B';
      return;
    }

    // Start eye tracking
    await eyeTracker.start(webcamManager.video);

    // Initialize Game
    const gameCanvas = document.getElementById('gameCanvas');
    game.init(gameCanvas);

    // Enable start button
    document.getElementById('startGameBtn').disabled = false;
    document.getElementById('previewStatus').textContent = '✅ Ready to Play';
    document.getElementById('previewStatus').style.color = '#51CF66';

    // Start preview loop
    startPreviewLoop();

    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    document.getElementById('previewStatus').textContent = '❌ Initialization Error';
    document.getElementById('previewStatus').style.color = '#FF6B6B';
  }
}

/**
 * Start preview loop (shows webcam and gaze point on menu)
 */
function startPreviewLoop() {
  const gazePoint = document.getElementById('gazePoint');
  const previewCanvas = document.getElementById('previewCanvas');
  const gazeTrailContainer = document.getElementById('gazeTrail');

  const loop = () => {
    // Draw webcam frame
    if (webcamManager && webcamManager.isRunning) {
      webcamManager.drawFrame();
    }

    // Update gaze point position if eye tracker is detecting
    if (eyeTracker && eyeTracker.isFaceDetected()) {
      const gaze = eyeTracker.getSmoothedGaze();

      if (gaze && gaze.x > 0 && gaze.y > 0) {
        // Map gaze coordinates to canvas coordinates
        const rect = previewCanvas.getBoundingClientRect();
        const gazePx = gaze.x * rect.width;
        const gazePy = gaze.y * rect.height;

        gazePoint.style.left = (rect.left + gazePx) + 'px';
        gazePoint.style.top = (rect.top + gazePy) + 'px';
        gazePoint.classList.add('active');
      }
    } else {
      gazePoint.classList.remove('active');
    }

    requestAnimationFrame(loop);
  };

  loop();
}

/**
 * Start game
 */
function startGameSession() {
  console.log('🎮 Starting game session...');

  // Get selected difficulty
  const difficulty = document.getElementById('difficultySelect').value;

  // Initialize game
  game.start(CONFIG.GAME_MODES.CLASSIC, difficulty);
  gameRunning = true;

  // Show game screen
  uiManager.showScreen('gameScreen');

  // Start game loop
  startGameLoop();
}

/**
 * Start game loop
 */
function startGameLoop() {
  const gameCanvas = document.getElementById('gameCanvas');
  let lastUpdateTime = Utils.now();
  let frameCount = 0;
  let fpsUpdateTime = Utils.now();

  const loop = () => {
    if (!gameRunning) return;

    const now = Utils.now();
    const deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;

    // Update game state
    if (eyeTracker.isFaceDetected()) {
      const gaze = eyeTracker.getSmoothedGaze();
      const confidence = eyeTracker.getConfidence();

      // Map gaze from normalized (0-1) to canvas coordinates
      const gazeCanvas = {
        x: gaze.x * gameCanvas.width,
        y: gaze.y * gameCanvas.height
      };

      game.update(gazeCanvas, confidence);
    }

    // Draw game
    game.draw();

    // Update HUD
    frameCount++;
    const fpsDelta = now - fpsUpdateTime;
    if (fpsDelta >= 1000) {
      const fps = Math.round((frameCount * 1000) / fpsDelta);
      frameCount = 0;
      fpsUpdateTime = now;
      uiManager.updateHUD(game.score, game.getTime(), game.level, fps);
    }

    // Check if game time exceeded
    if (game.isTimeExceeded(CONFIG.GAME.DURATION)) {
      endGameSession();
      return;
    }

    gameLoopId = requestAnimationFrame(loop);
  };

  loop();
}

/**
 * End game session
 */
function endGameSession() {
  console.log('🏁 Game session ended');
  gameRunning = false;

  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
  }

  // Get final stats
  const stats = game.end();

  // Save score
  StorageManager.saveScore(stats);

  // Update scores list
  uiManager.updateScoresList();

  // Show game over screen
  uiManager.showGameOver(stats);

  // Play game over sound
  audioManager.playSound(CONFIG.AUDIO.SOUND_EFFECTS.LEVEL_UP);
  audioManager.speak(`Game Over. Final Score: ${stats.score}`);
}

/**
 * Handle calibration
 */
async function startCalibrationSession() {
  console.log('📐 Starting calibration...');

  const calibrationType = document.getElementById('calibrationType').value;
  calibrationManager.startCalibration(calibrationType);

  const calibrationCanvas = document.getElementById('calibrationCanvas');
  const ctx = calibrationCanvas.getContext('2d');

  calibrationCanvas.width = window.innerWidth;
  calibrationCanvas.height = window.innerHeight;

  let currentPointIndex = 0;
  const gazeRecordingTime = 800; // Record gaze for 800ms per point
  let recordingStartTime = null;
  let gazePoints = [];

  const drawCalibrationPoint = (point) => {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, calibrationCanvas.width, calibrationCanvas.height);

    // Calculate pixel coordinates
    const px = point.x * calibrationCanvas.width;
    const py = point.y * calibrationCanvas.height;

    // Draw point
    ctx.fillStyle = '#FFE66D';
    ctx.beginPath();
    ctx.arc(px, py, CONFIG.CALIBRATION.POINT_SIZE, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw instruction text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Look at the circle', calibrationCanvas.width / 2, 50);
  };

  const recordGazeForPoint = async () => {
    if (currentPointIndex >= calibrationManager.calibrationPoints.length) {
      // Finish calibration
      finishCalibrationSession();
      return;
    }

    const point = calibrationManager.calibrationPoints[currentPointIndex];
    recordingStartTime = Utils.now();
    gazePoints = [];

    // Update UI
    const total = calibrationManager.calibrationPoints.length;
    document.getElementById('calibrationStatus').textContent = 
      `Point ${currentPointIndex + 1} of ${total}`;
    document.getElementById('calibrationProgress').style.width = 
      `${(currentPointIndex / total) * 100}%`;

    // Play sound
    audioManager.playSound(CONFIG.AUDIO.SOUND_EFFECTS.CALIBRATION_POINT);

    // Draw point and record gaze
    const recordLoop = () => {
      drawCalibrationPoint(point);

      // Record gaze
      if (eyeTracker.isFaceDetected()) {
        const gaze = eyeTracker.getSmoothedGaze();
        if (gaze) {
          gazePoints.push({ ...gaze });
        }
      }

      const elapsed = Utils.now() - recordingStartTime;
      if (elapsed < gazeRecordingTime) {
        requestAnimationFrame(recordLoop);
      } else {
        // Record this point's gaze data
        calibrationManager.recordGazeForPoint(gazePoints);
        currentPointIndex++;
        recordGazeForPoint();
      }
    };

    recordLoop();
  };

  // Setup next button
  document.getElementById('nextCalibrationPoint').onclick = () => {
    currentPointIndex++;
    recordGazeForPoint();
  };

  document.getElementById('skipCalibration').onclick = () => {
    finishCalibrationSession();
  };

  // Start recording first point
  recordGazeForPoint();
}

/**
 * Finish calibration
 */
function finishCalibrationSession() {
  console.log('✅ Calibration finished');

  const result = calibrationManager.finishCalibration();

  // Update UI with calibration result
  document.getElementById('calibrationAccuracy').textContent = result.accuracy + '%';
  document.getElementById('lastCalibration').textContent = new Date().toLocaleDateString();

  // Show message
  audioManager.speak(`Calibration complete. Accuracy: ${result.accuracy}%`);

  // Return to settings
  uiManager.showScreen('settingsScreen');
}

// Setup calibration button
document.getElementById('startCalibration').addEventListener('click', async () => {
  uiManager.showScreen('calibrationScreen');
  await startCalibrationSession();
});

// Setup game start button
document.getElementById('startGameBtn').addEventListener('click', () => {
  startGameSession();
});

// Handle window resize
window.addEventListener('resize', () => {
  const gameCanvas = document.getElementById('gameCanvas');
  if (gameCanvas) {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight - 120;
  }
});

// Request permissions and initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Request necessary permissions
  Promise.all([
    navigator.permissions.query({ name: 'camera' }),
    navigator.permissions.query({ name: 'microphone' })
  ]).then(() => {
    initializeApp();
  }).catch(() => {
    // Permissions API not available, try to initialize anyway
    initializeApp();
  });
});

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (webcamManager) {
    webcamManager.stopWebcam();
  }
  if (eyeTracker) {
    eyeTracker.stop();
  }
});

// Log when page loads
console.log('👁️ Eye-Tracking Game loaded');
