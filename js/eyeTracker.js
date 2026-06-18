/**
 * Eye Tracker using MediaPipe FaceMesh
 */

class EyeTracker {
  constructor() {
    this.faceMesh = null;
    this.results = null;
    this.gazePoint = { x: 0, y: 0 };
    this.smoothedGaze = { x: 0, y: 0 };
    this.gazeTrail = [];
    this.isRunning = false;
    this.initialized = false;
    this.confidence = 0;
  }

  /**
   * Initialize FaceMesh
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init() {
    try {
      // Create FaceMesh instance
      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      this.faceMesh.setOptions({
        maxNumFaces: CONFIG.EYE_TRACKING.MAX_FACES,
        refineLandmarks: true,
        minDetectionConfidence: CONFIG.EYE_TRACKING.CONFIDENCE_THRESHOLD,
        minTrackingConfidence: CONFIG.EYE_TRACKING.CONFIDENCE_THRESHOLD
      });

      this.faceMesh.onResults(results => this.onResults(results));

      this.initialized = true;
      Utils.log('EyeTracker initialized');
      return true;
    } catch (error) {
      Utils.error('Failed to initialize EyeTracker', error);
      return false;
    }
  }

  /**
   * Start tracking
   * @param {HTMLVideoElement} videoElement - Video element to track
   */
  async start(videoElement) {
    try {
      if (!this.initialized) {
        await this.init();
      }

      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await this.faceMesh.send({ image: videoElement });
        },
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      });

      camera.start();
      this.isRunning = true;
      Utils.log('EyeTracker started');
    } catch (error) {
      Utils.error('Failed to start EyeTracker', error);
    }
  }

  /**
   * Stop tracking
   */
  stop() {
    this.isRunning = false;
    Utils.log('EyeTracker stopped');
  }

  /**
   * Process FaceMesh results
   * @param {Object} results - FaceMesh results
   */
  onResults(results) {
    this.results = results;

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      this.gazePoint = { x: -1, y: -1 };
      this.confidence = 0;
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    this.calculateGazePoint(landmarks);
  }

  /**
   * Calculate gaze point from landmarks
   * @param {Array} landmarks - Face landmarks
   */
  calculateGazePoint(landmarks) {
    try {
      // Get eye centers
      const leftEyeCenter = this.getEyeCenter(landmarks, 'left');
      const rightEyeCenter = this.getEyeCenter(landmarks, 'right');

      // Get iris positions
      const leftIris = landmarks[468]; // Left iris center
      const rightIris = landmarks[473]; // Right iris center

      if (!leftEyeCenter || !rightEyeCenter) return;

      // Calculate gaze direction
      let gazeX = (leftIris.x + rightIris.x) / 2;
      let gazeY = (leftIris.y + rightIris.y) / 2;

      // Smooth gaze point
      const smoothedGaze = Utils.smoothGaze(
        this.smoothedGaze,
        { x: gazeX, y: gazeY },
        CONFIG.EYE_TRACKING.GAZE_SMOOTHING
      );

      this.smoothedGaze = smoothedGaze;
      this.gazePoint = smoothedGaze;

      // Update trail
      this.addToGazeTrail(smoothedGaze);

      // Set confidence
      this.confidence = 0.9; // FaceMesh doesn't provide per-point confidence
    } catch (error) {
      Utils.error('Error calculating gaze point', error);
    }
  }

  /**
   * Get eye center point
   * @param {Array} landmarks - Face landmarks
   * @param {string} eye - 'left' or 'right'
   * @returns {Object} Eye center point {x, y}
   */
  getEyeCenter(landmarks, eye) {
    const eyeLandmarks = eye === 'left' ? EYE_LANDMARKS.LEFT_EYE : EYE_LANDMARKS.RIGHT_EYE;
    if (!eyeLandmarks || eyeLandmarks.length === 0) return null;

    let sumX = 0, sumY = 0;
    for (const idx of eyeLandmarks) {
      if (landmarks[idx]) {
        sumX += landmarks[idx].x;
        sumY += landmarks[idx].y;
      }
    }

    return {
      x: sumX / eyeLandmarks.length,
      y: sumY / eyeLandmarks.length
    };
  }

  /**
   * Add point to gaze trail
   * @param {Object} point - Gaze point {x, y}
   */
  addToGazeTrail(point) {
    this.gazeTrail.push({ ...point });
    if (this.gazeTrail.length > CONFIG.EYE_TRACKING.GAZE_TRAIL_LENGTH) {
      this.gazeTrail.shift();
    }
  }

  /**
   * Get current gaze point
   * @returns {Object} Gaze point {x, y}
   */
  getGazePoint() {
    return this.gazePoint;
  }

  /**
   * Get smoothed gaze point
   * @returns {Object} Smoothed gaze point {x, y}
   */
  getSmoothedGaze() {
    return this.smoothedGaze;
  }

  /**
   * Get gaze trail
   * @returns {Array} Array of gaze points
   */
  getGazeTrail() {
    return this.gazeTrail;
  }

  /**
   * Get eye tracking confidence
   * @returns {number} Confidence (0-1)
   */
  getConfidence() {
    return this.confidence;
  }

  /**
   * Check if face is detected
   * @returns {boolean} True if face detected
   */
  isFaceDetected() {
    return this.results && this.results.multiFaceLandmarks && this.results.multiFaceLandmarks.length > 0;
  }

  /**
   * Get face landmarks
   * @returns {Array} Face landmarks
   */
  getFaceLandmarks() {
    if (!this.results || !this.results.multiFaceLandmarks) return null;
    return this.results.multiFaceLandmarks[0];
  }

  /**
   * Clear gaze trail
   */
  clearGazeTrail() {
    this.gazeTrail = [];
  }
}

// Global instance
const eyeTracker = new EyeTracker();