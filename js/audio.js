/**
 * Audio Manager for Eye-Tracking Game
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.volume = 0.7;
    this.sounds = {};
    this.voiceEnabled = true;
    this.initialized = false;
    this.init();
  }

  /**
   * Initialize Web Audio API
   */
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      Utils.log('AudioManager initialized');
    } catch (error) {
      Utils.error('Failed to initialize AudioManager', error);
    }
  }

  /**
   * Set volume level
   * @param {number} level - Volume level (0-1)
   */
  setVolume(level) {
    this.volume = Utils.clamp(level, 0, 1);
  }

  /**
   * Play sound effect
   * @param {string} soundId - Sound identifier
   */
  playSound(soundId) {
    if (!this.initialized) return;

    try {
      const now = this.audioContext.currentTime;
      let oscillator, gainNode;

      switch (soundId) {
        case CONFIG.AUDIO.SOUND_EFFECTS.TARGET_APPEAR:
          // Low beep sound
          oscillator = this.audioContext.createOscillator();
          gainNode = this.audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.frequency.value = 400;
          gainNode.gain.setValueAtTime(this.volume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;

        case CONFIG.AUDIO.SOUND_EFFECTS.TARGET_HIT:
          // Higher beep sound
          oscillator = this.audioContext.createOscillator();
          gainNode = this.audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(this.volume, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;

        case CONFIG.AUDIO.SOUND_EFFECTS.TARGET_MISS:
          // Low falling beep
          oscillator = this.audioContext.createOscillator();
          gainNode = this.audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.frequency.setValueAtTime(600, now);
          oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2);
          gainNode.gain.setValueAtTime(this.volume * 0.7, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;

        case CONFIG.AUDIO.SOUND_EFFECTS.LEVEL_UP:
          // Ascending beeps
          for (let i = 0; i < 3; i++) {
            oscillator = this.audioContext.createOscillator();
            gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.frequency.value = 400 + (i * 200);
            gainNode.gain.setValueAtTime(this.volume, now + (i * 0.1));
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.1);
            oscillator.start(now + (i * 0.1));
            oscillator.stop(now + (i * 0.1) + 0.1);
          }
          break;

        case CONFIG.AUDIO.SOUND_EFFECTS.CALIBRATION_POINT:
          // Single beep for calibration
          oscillator = this.audioContext.createOscillator();
          gainNode = this.audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.frequency.value = 600;
          gainNode.gain.setValueAtTime(this.volume * 0.8, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;
      }
    } catch (error) {
      Utils.error('Error playing sound', error);
    }
  }

  /**
   * Speak text using Web Speech API
   * @param {string} text - Text to speak
   */
  speak(text) {
    if (!this.voiceEnabled) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      Utils.error('Error speaking text', error);
    }
  }

  /**
   * Set voice feedback enabled/disabled
   * @param {boolean} enabled - Whether voice feedback is enabled
   */
  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
  }

  /**
   * Stop all audio
   */
  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.initialized = false;
    }
  }
}

// Global instance
const audioManager = new AudioManager();