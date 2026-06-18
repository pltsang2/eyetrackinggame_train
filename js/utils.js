/**
 * Utility Functions for Eye-Tracking Game
 */

class Utils {
  /**
   * Calculate distance between two points
   * @param {number} x1 - First point x coordinate
   * @param {number} y1 - First point y coordinate
   * @param {number} x2 - Second point x coordinate
   * @param {number} y2 - Second point y coordinate
   * @returns {number} Distance between points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if gaze point is within target area
   * @param {number} gazeX - Gaze point x coordinate
   * @param {number} gazeY - Gaze point y coordinate
   * @param {number} targetX - Target center x coordinate
   * @param {number} targetY - Target center y coordinate
   * @param {number} tolerance - Tolerance in pixels
   * @returns {boolean} True if gaze is within tolerance
   */
  static isGazeOnTarget(gazeX, gazeY, targetX, targetY, tolerance) {
    const dist = this.distance(gazeX, gazeY, targetX, targetY);
    return dist <= tolerance;
  }

  /**
   * Smooth value using exponential moving average
   * @param {number} currentValue - Current value
   * @param {number} newValue - New value
   * @param {number} smoothing - Smoothing factor (0-1)
   * @returns {number} Smoothed value
   */
  static smoothValue(currentValue, newValue, smoothing = 0.7) {
    return currentValue * smoothing + newValue * (1 - smoothing);
  }

  /**
   * Smooth gaze point
   * @param {Object} currentGaze - Current gaze point {x, y}
   * @param {Object} newGaze - New gaze point {x, y}
   * @param {number} smoothing - Smoothing factor
   * @returns {Object} Smoothed gaze point
   */
  static smoothGaze(currentGaze, newGaze, smoothing = 0.7) {
    return {
      x: this.smoothValue(currentGaze.x, newGaze.x, smoothing),
      y: this.smoothValue(currentGaze.y, newGaze.y, smoothing)
    };
  }

  /**
   * Format time in milliseconds to MM:SS format
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time
   */
  static formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format number with thousands separator
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Generate random number between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate random integer between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Clamp value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation between two values
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  static lerp(a, b, t) {
    return a + (b - a) * this.clamp(t, 0, 1);
  }

  /**
   * Get current timestamp
   * @returns {number} Current timestamp in milliseconds
   */
  static now() {
    return performance.now();
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   * @param {number} radians - Radians
   * @returns {number} Degrees
   */
  static toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Check if point is within rectangle
   * @param {number} x - Point x coordinate
   * @param {number} y - Point y coordinate
   * @param {number} rectX - Rectangle x coordinate
   * @param {number} rectY - Rectangle y coordinate
   * @param {number} rectW - Rectangle width
   * @param {number} rectH - Rectangle height
   * @returns {boolean} True if point is within rectangle
   */
  static isPointInRect(x, y, rectX, rectY, rectW, rectH) {
    return x >= rectX && x <= rectX + rectW && y >= rectY && y <= rectY + rectH;
  }

  /**
   * Check if point is within circle
   * @param {number} x - Point x coordinate
   * @param {number} y - Point y coordinate
   * @param {number} circleX - Circle center x coordinate
   * @param {number} circleY - Circle center y coordinate
   * @param {number} radius - Circle radius
   * @returns {boolean} True if point is within circle
   */
  static isPointInCircle(x, y, circleX, circleY, radius) {
    const dist = this.distance(x, y, circleX, circleY);
    return dist <= radius;
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  static generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Deep clone object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge objects
   * @param {...Object} objects - Objects to merge
   * @returns {Object} Merged object
   */
  static merge(...objects) {
    return objects.reduce((result, obj) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = obj[key];
        }
      }
      return result;
    }, {});
  }

  /**
   * Get URL parameters
   * @returns {Object} URL parameters
   */
  static getUrlParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
    return params;
  }

  /**
   * Request animation frame with fallback
   * @param {Function} callback - Callback function
   * @returns {number} Request ID
   */
  static requestAnimationFrame(callback) {
    return window.requestAnimationFrame(callback);
  }

  /**
   * Cancel animation frame
   * @param {number} id - Request ID
   */
  static cancelAnimationFrame(id) {
    window.cancelAnimationFrame(id);
  }

  /**
   * Log debug message
   * @param {string} message - Message to log
   * @param {*} data - Data to log
   */
  static log(message, data = null) {
    if (CONFIG.DEBUG) {
      console.log(`[${new Date().toLocaleTimeString()}] ${message}`, data);
    }
  }

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {*} error - Error to log
   */
  static error(message, error = null) {
    console.error(`[ERROR] ${message}`, error);
  }
}