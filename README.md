# Eye-Tracking Shooting Game

👁️ **Eye Control Training Game for Visually Impaired Students**

## Overview

This is a web-based eye-tracking shooting game built with **HTML5, JavaScript, and CSS3** using **Google MediaPipe** for real-time eye detection. The game is specifically designed to support eye control training for visually impaired students.

## Features

### 🎮 Game Mechanics
- **Classic Target Mode**: Look at targets to "shoot" them with your gaze
- **Progressive Difficulty**: Easy, Medium, and Hard modes
- **Live Score Tracking**: Real-time score, level, and time display
- **Adjustable Game Settings**: Customize gaze hold time, target size, and more

### 📹 Webcam Integration
- **Multi-Camera Support**: Select from multiple connected cameras
- **Resolution Options**: Auto, 720p, 1080p
- **FPS Control**: 24, 30, or 60 FPS
- **View Orientation**: Horizontal flip, vertical flip, and rotation controls
- **Live Preview**: Real-time webcam feed on the main menu

### 👁️ Eye Tracking & Calibration
- **MediaPipe FaceMesh**: Advanced facial landmark detection
- **Gaze Point Visualization**: See where you're looking
- **Gaze Trail**: Track eye movement history
- **Calibration System**: 9-point or 25-point calibration grid
- **Accuracy Metrics**: Real-time gaze tracking accuracy

### ♿ Accessibility Features
- **High Contrast Mode**: Enhanced visibility with high contrast colors
- **Display Scaling**: Adjust UI size from 100% to 150%
- **Voice Feedback**: Text-to-speech for game notifications
- **Audio Cues**: Sound effects for game events
- **Keyboard Navigation**: Full keyboard support for all menus

### 📊 Statistics & Progress
- **Score Tracking**: Top 50 scores stored locally
- **Performance Metrics**: Accuracy, duration, and level data
- **Session History**: View all past game sessions
- **Calibration Data**: Track eye tracking accuracy over time

## System Requirements

- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Hardware**: Webcam/camera device
- **Internet**: Required for MediaPipe libraries (via CDN)
- **Permissions**: Camera access required

## Installation

1. Clone the repository:
```bash
git clone https://github.com/pltsang2/eyetrackinggame_train.git
cd eyetrackinggame_train
```

2. Open in a web server (required for camera access):
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open browser and navigate to `http://localhost:8000`

## How to Play

### First Time Setup
1. **Allow Camera Access**: Grant browser permission to access your webcam
2. **Calibrate Eye Tracker**: 
   - Click Settings → Eye Tracking Calibration
   - Choose 9-point or 25-point calibration
   - Look at each point as it appears
   - Aim for 90%+ accuracy

### Playing the Game
1. **Select Difficulty**: Choose Easy, Medium, or Hard
2. **Click START GAME**: Begin playing
3. **Look at Targets**: Gaze at targets to shoot them
4. **Maintain Gaze**: Keep looking at target for the required time
5. **Score Points**: Each successful hit adds points
6. **Level Up**: Reach higher levels as you score

## Configuration

### Game Difficulty Settings

| Level | Target Size | Gaze Hold Time | Target Speed |
|-------|-------------|----------------|---------------|
| Easy  | 60px        | 800ms          | Slow          |
| Medium| 40px        | 500ms          | Medium        |
| Hard  | 20px        | 300ms          | Fast          |

### Customizable Options

**Webcam Settings:**
- Camera device selection
- Resolution (Auto/720p/1080p)
- Frame rate (24/30/60 fps)
- Horizontal/vertical flip
- Rotation (0°/90°/180°/270°)

**Game Settings:**
- Difficulty level
- Target size
- Gaze hold time (200-1000ms)
- Gaze tolerance (10-50px)
- Sound volume (0-100%)
- Voice feedback (on/off)

**Calibration Options:**
- Grid type (9-point or 25-point)
- Show gaze point (on/off)
- Show gaze trail (on/off)
- Trail length (5-50 frames)
- Marker color and size

## File Structure

```
eyetrackinggame_train/
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # Main styles
│   └── responsive.css     # Responsive design
└── js/
    ├── config.js          # Configuration constants
    ├── utils.js           # Utility functions
    ├── audio.js           # Audio manager
    ├── storage.js         # LocalStorage manager
    ├── eyeTracker.js      # Eye tracking with MediaPipe
    ├── webcam.js          # Webcam manager
    ├── calibration.js     # Calibration system
    ├── game.js            # Game logic
    ├── ui.js              # UI manager
    └── main.js            # Application entry point
```

## Key Classes

### WebcamManager
Manages webcam access, device selection, and video stream.
```javascript
const webcamManager = new WebcamManager();
await webcamManager.init(canvas);
await webcamManager.switchDevice(deviceId);
```

### EyeTracker
Handles eye detection using MediaPipe FaceMesh.
```javascript
const eyeTracker = new EyeTracker();
await eyeTracker.init();
const gaze = eyeTracker.getSmoothedGaze();
```

### Game
Core game logic and state management.
```javascript
const game = new Game();
game.init(canvas);
game.start('classic', 'medium');
game.update(gazePoint, confidence);
```

### CalibrationManager
Handles eye tracking calibration.
```javascript
const calibrationManager = new CalibrationManager();
calibrationManager.startCalibration('9point');
const result = calibrationManager.finishCalibration();
```

### UIManager
Manages all UI screens and user interactions.
```javascript
const uiManager = new UIManager();
uiManager.init();
uiManager.showScreen('gameScreen');
```

### StorageManager
Handles local data persistence.
```javascript
StorageManager.saveSettings(settings);
const scores = StorageManager.loadScores();
```

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|----------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

## Performance Tips

1. **Better Performance**:
   - Use 30 FPS instead of 60 FPS if experiencing lag
   - Reduce resolution to 720p if needed
   - Close other CPU-intensive applications

2. **Better Accuracy**:
   - Calibrate in the same lighting conditions as gameplay
   - Ensure face is fully visible in webcam
   - Position camera at eye level
   - Maintain consistent distance from camera

3. **Accessibility**:
   - Enable High Contrast Mode for better visibility
   - Increase Display Scale if text is too small
   - Use Voice Feedback for audio cues
   - Enable keyboard navigation

## Troubleshooting

### "Camera not found"
- Check browser permissions (Settings → Privacy → Camera)
- Try a different camera device from dropdown
- Restart the browser
- Check if another application is using the camera

### "Face not detected"
- Improve room lighting
- Ensure face is within camera view
- Position camera at eye level
- Clean camera lens
- Check camera is not blocked

### "Gaze tracking inaccurate"
- Run calibration again
- Improve lighting conditions
- Adjust gaze tolerance in settings
- Ensure consistent head position

### "Low FPS"
- Close other applications
- Lower resolution setting
- Reduce FPS to 30 or 24
- Check browser tabs
- Restart browser

### "Game not starting"
- Ensure camera permission is granted
- Check console for errors (F12)
- Try different browser
- Clear browser cache

## Privacy & Data

- **No Cloud Storage**: All data stored locally in browser
- **Camera Feed**: Only processed locally, never uploaded
- **Eye Tracking**: Real-time processing, no external transmission
- **Scores**: Stored in browser LocalStorage
- **Settings**: Saved in browser LocalStorage

## API References

- **Google MediaPipe**: https://google.github.io/mediapipe/
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **WebRTC**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License - feel free to use this project for educational and commercial purposes.

## Acknowledgments

- **Google MediaPipe** for the excellent face mesh detection
- **Web Standards** for WebRTC, Web Audio, and related APIs
- **Accessibility Community** for guidance on accessible design

## Support

For issues and questions:
1. Check the Troubleshooting section
2. Review the Help section in the game
3. Check browser console for errors (F12)
4. Open an issue on GitHub

---

**Made with ❤️ for accessibility and inclusive technology**
