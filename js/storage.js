/**
 * Local Storage Manager for Eye-Tracking Game
 */

class StorageManager {
  /**
   * Save settings to localStorage
   * @param {Object} settings - Settings object
   */
  static saveSettings(settings) {
    try {
      const merged = Utils.merge(DEFAULT_SETTINGS, settings);
      localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      Utils.log('Settings saved', merged);
    } catch (error) {
      Utils.error('Failed to save settings', error);
    }
  }

  /**
   * Load settings from localStorage
   * @returns {Object} Settings object
   */
  static loadSettings() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
      if (saved) {
        const settings = JSON.parse(saved);
        Utils.log('Settings loaded', settings);
        return Utils.merge(DEFAULT_SETTINGS, settings);
      }
    } catch (error) {
      Utils.error('Failed to load settings', error);
    }
    return Utils.deepClone(DEFAULT_SETTINGS);
  }

  /**
   * Reset settings to default
   */
  static resetSettings() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    Utils.log('Settings reset to default');
  }

  /**
   * Save score
   * @param {Object} score - Score object
   */
  static saveScore(score) {
    try {
      const scores = this.loadScores();
      scores.push({
        ...score,
        timestamp: new Date().toISOString(),
        id: Utils.generateId()
      });
      // Keep only top 50 scores
      scores.sort((a, b) => b.score - a.score);
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.SCORES,
        JSON.stringify(scores.slice(0, 50))
      );
      Utils.log('Score saved', score);
      return true;
    } catch (error) {
      Utils.error('Failed to save score', error);
      return false;
    }
  }

  /**
   * Load scores from localStorage
   * @returns {Array} Scores array
   */
  static loadScores() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SCORES);
      if (saved) {
        const scores = JSON.parse(saved);
        Utils.log('Scores loaded', scores);
        return scores;
      }
    } catch (error) {
      Utils.error('Failed to load scores', error);
    }
    return [];
  }

  /**
   * Clear all scores
   */
  static clearScores() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SCORES);
    Utils.log('All scores cleared');
  }

  /**
   * Save calibration data
   * @param {Object} calibration - Calibration object
   */
  static saveCalibration(calibration) {
    try {
      const data = {
        ...calibration,
        lastCalibrationDate: new Date().toISOString()
      };
      localStorage.setItem(CONFIG.STORAGE_KEYS.CALIBRATION, JSON.stringify(data));
      Utils.log('Calibration saved', data);
    } catch (error) {
      Utils.error('Failed to save calibration', error);
    }
  }

  /**
   * Load calibration data from localStorage
   * @returns {Object} Calibration object
   */
  static loadCalibration() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CALIBRATION);
      if (saved) {
        const calibration = JSON.parse(saved);
        Utils.log('Calibration loaded', calibration);
        return calibration;
      }
    } catch (error) {
      Utils.error('Failed to load calibration', error);
    }
    return null;
  }

  /**
   * Clear calibration data
   */
  static clearCalibration() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CALIBRATION);
    Utils.log('Calibration cleared');
  }

  /**
   * Save device list
   * @param {Array} devices - Array of device objects
   */
  static saveDevices(devices) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.DEVICES, JSON.stringify(devices));
    } catch (error) {
      Utils.error('Failed to save devices', error);
    }
  }

  /**
   * Load device list from localStorage
   * @returns {Array} Array of device objects
   */
  static loadDevices() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.DEVICES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      Utils.error('Failed to load devices', error);
    }
    return [];
  }

  /**
   * Get stats summary
   * @returns {Object} Stats summary
   */
  static getStats() {
    const scores = this.loadScores();
    const calibration = this.loadCalibration();

    if (scores.length === 0) {
      return {
        totalGames: 0,
        bestScore: 0,
        averageScore: 0,
        totalTime: 0,
        calibrationAccuracy: calibration?.accuracy || 0
      };
    }

    const totalGames = scores.length;
    const bestScore = Math.max(...scores.map(s => s.score));
    const averageScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGames);
    const totalTime = scores.reduce((sum, s) => sum + (s.duration || 0), 0);

    return {
      totalGames,
      bestScore,
      averageScore,
      totalTime,
      calibrationAccuracy: calibration?.accuracy || 0
    };
  }
}