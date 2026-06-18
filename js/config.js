// Configuration Constants
const CONFIG = {
  // Game Modes
  GAME_MODES: {
    CLASSIC: 'classic',
    MOVING: 'moving',
    CALIBRATION: 'calibration',
    REACTION: 'reaction'
  },

  // Difficulty Levels
  DIFFICULTIES: {
    EASY: {
      name: 'easy',
      targetSize: 60,
      gazeHoldTime: 800,
      targetAppearanceTime: 3000,
      cooldown: 300
    },
    MEDIUM: {
      name: 'medium',
      targetSize: 40,
      gazeHoldTime: 500,
      targetAppearanceTime: 2000,
      cooldown: 200
    },
    HARD: {
      name: 'hard',
      targetSize: 20,
      gazeHoldTime: 300,
      targetAppearanceTime: 1500,
      cooldown: 100
    }
  },

  // Target Sizes
  TARGET_SIZES: {
    SMALL: 20,
    MEDIUM: 40,
    LARGE: 60
  },

  // Target Shapes
  TARGET_SHAPES: {
    CIRCLE: 'circle',
    SQUARE: 'square',
    STAR: 'star',
    CROSS: 'cross'
  },

  // Webcam Settings
  WEBCAM: {
    DEFAULT_WIDTH: 1280,
    DEFAULT_HEIGHT: 720,
    DEFAULT_FPS: 30,
    RESOLUTIONS: {
      AUTO: { width: 1280, height: 720, label: 'Auto' },
      HD: { width: 1280, height: 720, label: '720p' },
      FULL_HD: { width: 1920, height: 1080, label: '1080p' }
    }
  },

  // Eye Tracking
  EYE_TRACKING: {
    MODEL_PATH: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
    CONFIDENCE_THRESHOLD: 0.7,
    MAX_FACES: 1,
    GAZE_TRAIL_LENGTH: 20,
    GAZE_SMOOTHING: 0.7
  },

  // Calibration
  CALIBRATION: {
    GRID_9_POINT: [
      { x: 0.2, y: 0.2 },
      { x: 0.5, y: 0.2 },
      { x: 0.8, y: 0.2 },
      { x: 0.2, y: 0.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.8, y: 0.5 },
      { x: 0.2, y: 0.8 },
      { x: 0.5, y: 0.8 },
      { x: 0.8, y: 0.8 }
    ],
    GRID_25_POINT: (() => {
      const points = [];
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          points.push({ x: (i + 1) * 0.16, y: (j + 1) * 0.16 })
        }
      }
      return points
    })(),
    POINT_SIZE: 20,
    POINT_HOLD_TIME: 800,
    ACCURACY_THRESHOLD: 0.8
  },

  // Game Settings
  GAME: {
    DURATION: 120000, // 2 minutes in ms
    GAZE_TOLERANCE: 30, // pixels
    GAZE_HOLD_TIME: 500, // ms
    MIN_GAZE_CONFIDENCE: 0.7,
    TARGET_COLOR: '#FFE66D',
    BACKGROUND_COLOR: '#000000'
  },

  // Audio Settings
  AUDIO: {
    VOLUME: 0.7,
    SOUND_EFFECTS: {
      TARGET_APPEAR: 'target_appear',
      TARGET_HIT: 'target_hit',
      TARGET_MISS: 'target_miss',
      LEVEL_UP: 'level_up',
      CALIBRATION_POINT: 'calibration_point'
    }
  },

  // Storage Keys
  STORAGE_KEYS: {
    SETTINGS: 'eyetracking_settings',
    SCORES: 'eyetracking_scores',
    CALIBRATION: 'eyetracking_calibration',
    DEVICES: 'eyetracking_devices'
  },

  // Animation
  ANIMATIONS: {
    TARGET_SPAWN: 200,
    TARGET_HIT: 300,
    TRANSITION: 300
  },

  // Debug Mode
  DEBUG: false
};

// Default Settings
const DEFAULT_SETTINGS = {
  webcam: {
    deviceId: null,
    resolution: 'auto',
    fps: 30,
    flipHorizontal: true,
    flipVertical: false,
    rotation: 0
  },
  game: {
    difficulty: 'medium',
    targetSize: 'medium',
    targetColor: '#FFE66D',
    gazeHoldTime: 500,
    gazeTolerance: 30,
    soundVolume: 0.7,
    voiceFeedback: true,
    highContrast: false,
    displayScale: 100
  },
  calibration: {
    type: '9point',
    showGazePoint: true,
    showGazeTrail: true,
    trailLength: 20,
    gazeMarkerColor: '#FF0000',
    gazeMarkerSize: 'medium',
    lastCalibrationDate: null,
    accuracy: 0
  }
};

// Eye Landmarks for Gaze Detection (MediaPipe Face Mesh)
const EYE_LANDMARKS = {
  LEFT_EYE: [33, 133, 158, 159, 160, 161, 246, 7, 163, 144, 145, 153, 154, 155, 362, 381, 382, 381, 384, 385, 386, 387, 388],
  RIGHT_EYE: [263, 362, 387, 388, 389, 390, 391, 33, 7, 163, 144, 145, 153, 154, 155],
  LEFT_IRIS: [468, 469, 470, 471, 472],
  RIGHT_IRIS: [473, 474, 475, 476, 477],
  FACE: [0, 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
};

// Log config if debug mode
if (CONFIG.DEBUG) {
  console.log('Eye-Tracking Game Configuration:', CONFIG);
}