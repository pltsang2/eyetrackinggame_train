/**
 * Calibration Manager for Eye-Tracking Game
 */

class CalibrationManager {
  constructor() {
    this.calibrationPoints = [];
    this.currentPointIndex = 0;
    this.gazeRecordings = [];
    this.isCalibrating = false;
    this.calibrationType = '9point';
  }

  /**
   * Start calibration
   * @param {string} type - Calibration type ('9point' or '25point')
   */
  startCalibration(type = '9point') {
    this.calibrationType = type;
    this.calibrationPoints = type === '9point' 
      ? CONFIG.CALIBRATION.GRID_9_POINT 
      : CONFIG.CALIBRATION.GRID_25_POINT;
    this.currentPointIndex = 0;
    this.gazeRecordings = [];
    this.isCalibrating = true;
    Utils.log('Calibration started', { type, pointCount: this.calibrationPoints.length });
  }

  /**
   * Get current calibration point
   * @returns {Object} Current point {x, y}
   */
  getCurrentPoint() {
    if (this.currentPointIndex >= this.calibrationPoints.length) return null;
    return this.calibrationPoints[this.currentPointIndex];
  }

  /**
   * Record gaze data for current point
   * @param {Array} gazePoints - Array of gaze points to record
   */
  recordGazeForPoint(gazePoints) {
    if (!this.isCalibrating) return;

    this.gazeRecordings.push({
      pointIndex: this.currentPointIndex,
      expectedPoint: this.calibrationPoints[this.currentPointIndex],
      recordedGaze: gazePoints
    });
  }

  /**
   * Move to next calibration point
   * @returns {boolean} True if there are more points
   */
  nextPoint() {
    this.currentPointIndex++;
    return this.currentPointIndex < this.calibrationPoints.length;
  }

  /**
   * Finish calibration and calculate accuracy
   * @returns {Object} Calibration result with accuracy
   */
  finishCalibration() {
    if (!this.isCalibrating || this.gazeRecordings.length === 0) {
      return { accuracy: 0, error: 'No calibration data' };
    }

    let totalError = 0;
    let validRecordings = 0;

    for (const recording of this.gazeRecordings) {
      if (recording.recordedGaze.length === 0) continue;

      // Calculate average gaze point
      const avgGaze = recording.recordedGaze.reduce((acc, point) => ({
        x: acc.x + point.x / recording.recordedGaze.length,
        y: acc.y + point.y / recording.recordedGaze.length
      }), { x: 0, y: 0 });

      // Calculate error from expected point
      const error = Utils.distance(
        avgGaze.x,
        avgGaze.y,
        recording.expectedPoint.x,
        recording.expectedPoint.y
      );

      totalError += error;
      validRecordings++;
    }

    const averageError = totalError / validRecordings;
    const accuracy = Math.max(0, 100 - (averageError * 100));

    const result = {
      accuracy: Math.round(accuracy),
      averageError: Math.round(averageError * 100) / 100,
      pointsRecorded: validRecordings,
      totalPoints: this.calibrationPoints.length
    };

    this.isCalibrating = false;
    Utils.log('Calibration finished', result);

    // Save calibration
    StorageManager.saveCalibration(result);

    return result;
  }

  /**
   * Reset calibration
   */
  reset() {
    this.calibrationPoints = [];
    this.currentPointIndex = 0;
    this.gazeRecordings = [];
    this.isCalibrating = false;
    StorageManager.clearCalibration();
    Utils.log('Calibration reset');
  }

  /**
   * Get progress percentage
   * @returns {number} Progress percentage (0-100)
   */
  getProgress() {
    if (this.calibrationPoints.length === 0) return 0;
    return (this.currentPointIndex / this.calibrationPoints.length) * 100;
  }
}

// Global instance
const calibrationManager = new CalibrationManager();