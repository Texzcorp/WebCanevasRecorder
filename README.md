# Web Canvas Recorder

A simple and reusable JavaScript module to record HTML5 canvas content as MP4 video.

## Demo

To try out the demo:

1. Clone this repository:
```bash
git clone https://github.com/yourusername/web-canvas-recorder.git
cd web-canvas-recorder
```

2. Open `index.html` in your browser
3. Click the "Start Recording" button to begin recording the canvas animation
4. Click "Stop Recording" when you're done, and the video will automatically download

## Installation

Add the package to your project using npm or yarn:

```bash
npm install web-canvas-recorder
# or
yarn add web-canvas-recorder
```

## Basic Usage

```javascript
import { CanvasRecorder } from 'web-canvas-recorder';

// Create an instance with your canvas
const myCanvas = document.getElementById('myCanvas');
const recorder = new CanvasRecorder(myCanvas);

// Start recording
await recorder.startRecording();

// Stop recording (automatically triggers download)
await recorder.stopRecording();
```

## Advanced Options

```javascript
const recorder = new CanvasRecorder(myCanvas, {
    fps: 60,                    // Frames per second (default: 60)
    videoBitrate: 8000000,      // Video bitrate in bps (default: 8Mbps)
    filename: 'my-video',       // Output filename without extension (default: timestamp)
    mimeType: 'video/webm',     // Output format (default: video/mp4)
    autoDownload: true,         // Automatic download (default: true)
});

// Available events
recorder.onStart = () => console.log('Recording started');
recorder.onStop = (blob) => console.log('Recording finished', blob);
recorder.onError = (error) => console.error('Error:', error);
```

## Integration Guide

### 1. Setting up in your project

First, install the package and import it in your JavaScript file:

```javascript
import { CanvasRecorder } from 'web-canvas-recorder';
```

### 2. Basic Implementation

Here's a complete example of how to integrate the recorder with your canvas:

```javascript
// Get your canvas element
const canvas = document.getElementById('myCanvas');

// Create recorder instance
const recorder = new CanvasRecorder(canvas, {
    fps: 60,
    filename: 'canvas-recording'
});

// Add recording controls
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

startBtn.onclick = async () => {
    try {
        await recorder.startRecording();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (error) {
        console.error('Failed to start recording:', error);
    }
};

stopBtn.onclick = async () => {
    try {
        await recorder.stopRecording();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    } catch (error) {
        console.error('Failed to stop recording:', error);
    }
};
```

### 3. API Reference

#### CanvasRecorder Class

##### Constructor
```javascript
new CanvasRecorder(canvas: HTMLCanvasElement, options?: RecorderOptions)
```

##### Methods
- `startRecording(): Promise<void>` - Start recording
- `stopRecording(): Promise<Blob>` - Stop recording and return the Blob
- `pauseRecording(): void` - Pause recording
- `resumeRecording(): void` - Resume recording
- `isRecording(): boolean` - Get recording status

##### Options Interface
```typescript
interface RecorderOptions {
    fps?: number;              // Frames per second
    videoBitrate?: number;     // Video bitrate
    filename?: string;         // Output filename
    mimeType?: string;         // Output format
    autoDownload?: boolean;    // Automatic download
}
```

## Important Notes

- Ensure your canvas is properly initialized before creating the recorder
- Handle potential errors using try/catch blocks or the onError event
- Check browser compatibility (modern browsers required)
- For complex animations, adjust fps and bitrate accordingly
- The recorder works best with canvas content that changes over time (animations, games, etc.)

## Browser Compatibility

The recorder requires a modern browser with support for:
- Canvas API
- MediaRecorder API
- WebM/MP4 encoding

## Contributing

Feel free to open issues or submit pull requests if you find bugs or have suggestions for improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
