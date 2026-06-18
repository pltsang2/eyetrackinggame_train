/**
 * Webcam Manager for Eye-Tracking Game
 */

class WebcamManager {
  constructor() {
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.isRunning = false;
    this.devices = [];
    this.currentDeviceId = null;
    this.settings = StorageManager.loadSettings();
    this.fps = 0;
    this.frameCount = 0;
    this.lastFrameTime = 0;
  }

  /**
   * Initialize webcam
   * @param {HTMLCanvasElement} canvas - Canvas element to draw to
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init(canvas) {
    try {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      // Get available devices
      await this.enumerateDevices();

      // Request webcam access
      await this.startWebcam();

      Utils.log('WebcamManager initialized');
      return true;
    } catch (error) {
      Utils.error('Failed to initialize webcam', error);
      return false;
    }
  }

  /**
   * Enumerate available video input devices
   * @returns {Promise<Array>} Array of video input devices
   */
  async enumerateDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(device => device.kind === 'videoinput');
      StorageManager.saveDevices(this.devices);
      Utils.log('Enumerated devices', this.devices);
      return this.devices;
    } catch (error) {
      Utils.error('Failed to enumerate devices', error);
      return [];
    }
  }

  /**
   * Start webcam stream
   * @returns {Promise<MediaStream>} Media stream
   */
  async startWebcam() {
    try {
      // Get resolution constraints
      const resolution = CONFIG.WEBCAM.RESOLUTIONS[this.settings.webcam.resolution.toUpperCase()] ||
                        CONFIG.WEBCAM.RESOLUTIONS.AUTO;

      const constraints = {
        video: {
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
          facingMode: 'user'
        },
        audio: false
      };

      // If device ID specified, use it
      if (this.settings.webcam.deviceId) {
        constraints.video.deviceId = { exact: this.settings.webcam.deviceId };
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentDeviceId = this.settings.webcam.deviceId;

      // Create video element if not exists
      if (!this.video) {
        this.video = document.createElement('video');
        this.video.setAttribute('autoplay', true);
        this.video.setAttribute('playsinline', true);
        this.video.srcObject = this.stream;
      } else {
        this.video.srcObject = this.stream;
      }

      // Wait for video to load
      await new Promise(resolve => {
        this.video.onloadedmetadata = () => {
          resolve();
        };
      });

      this.isRunning = true;
      this.startFrameLoop();

      Utils.log('Webcam started');
      return this.stream;
    } catch (error) {
      Utils.error('Failed to start webcam', error);
      throw error;
    }
  }

  /**
   * Stop webcam stream
   */
  stopWebcam() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isRunning = false;
    Utils.log('Webcam stopped');
  }

  /**
   * Switch to different camera device
   * @param {string} deviceId - Device ID to switch to
   * @returns {Promise<boolean>} True if switch successful
   */
  async switchDevice(deviceId) {
    try {
      this.stopWebcam();
      this.settings.webcam.deviceId = deviceId;
      StorageManager.saveSettings(this.settings);
      await this.startWebcam();
      return true;
    } catch (error) {
      Utils.error('Failed to switch device', error);
      return false;
    }
  }

  /**
   * Draw current video frame to canvas
   */
  drawFrame() {
    if (!this.video || !this.isRunning) return;

    const { ctx, canvas, video } = this;

    // Draw video frame
    if (this.settings.webcam.flipHorizontal) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
    }

    if (this.settings.webcam.flipVertical) {
      ctx.save();
      ctx.scale(1, -1);
      ctx.translate(0, -canvas.height);
    }

    // Apply rotation if needed
    const rotation = this.settings.webcam.rotation || 0;
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Utils.toRadians(rotation));
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (rotation !== 0 || this.settings.webcam.flipVertical || this.settings.webcam.flipHorizontal) {
      ctx.restore();
    }

    // Update FPS
    this.updateFPS();
  }

  /**
   * Update FPS counter
   */
  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    const delta = now - this.lastFrameTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }

  /**
   * Start frame drawing loop
   */
  startFrameLoop() {
    const loop = () => {
      if (this.isRunning && this.video && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.drawFrame();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  /**
   * Get canvas as blob
   * @returns {Promise<Blob>} Canvas blob
   */
  getCanvasBlob() {
    return new Promise(resolve => {
      this.canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  }

  /**
   * Get canvas as data URL
   * @returns {string} Canvas data URL
   */
  getCanvasDataURL() {
    return this.canvas.toDataURL('image/jpeg', 0.8);
  }

  /**
   * Get FPS
   * @returns {number} Current FPS
   */
  getFPS() {
    return this.fps;
  }

  /**
   * Get video dimensions
   * @returns {Object} Video dimensions {width, height}
   */
  getVideoDimensions() {
    if (!this.video) return { width: 0, height: 0 };
    return {
      width: this.video.videoWidth,
      height: this.video.videoHeight
    };
  }
}