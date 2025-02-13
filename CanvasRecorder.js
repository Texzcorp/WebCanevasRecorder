/**
 * Class for recording HTML5 canvas content to video
 */
export class CanvasRecorder {
    /**
     * @param {HTMLCanvasElement} canvas - The canvas to record
     * @param {Object} options - Configuration options
     * @param {number} [options.fps=60] - Frames per second
     * @param {number} [options.videoBitrate=30000000] - Video bitrate in bps
     * @param {string} [options.filename] - Output filename without extension
     * @param {string} [options.mimeType='video/mp4;codecs=avc1.640028'] - Output format
     * @param {boolean} [options.autoDownload=true] - Automatic download
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = {
            fps: 60,
            videoBitrate: 30000000,
            mimeType: 'video/mp4;codecs=avc1.640028',
            autoDownload: true,
            ...options
        };

        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecordingActive = false;
        this.isPaused = false;
        this.recordCanvas = document.createElement('canvas');
        this.recordCtx = null;

        this.onStart = null;
        this.onStop = null;
        this.onPause = null;
        this.onResume = null;
        this.onError = null;
    }

    /**
     * Start recording
     * @returns {Promise<void>}
     */
    async startRecording() {
        try {
            this.recordCanvas.width = this.canvas.width;
            this.recordCanvas.height = this.canvas.height;
            this.recordCtx = this.recordCanvas.getContext('2d', {
                alpha: false,
                willReadFrequently: false
            });

            const stream = this.recordCanvas.captureStream(this.options.fps);
            
            let recorderOptions = {
                mimeType: this.options.mimeType,
                videoBitsPerSecond: this.options.videoBitrate
            };

            try {
                this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
            } catch (e) {
                console.warn('Requested codec not supported, using default codec:', e);
                this.mediaRecorder = new MediaRecorder(stream);
            }

            this.recordedChunks = [];
            this.setupRecorderEvents();
            
            this.mediaRecorder.start();
            this.isRecordingActive = true;
            this.startRenderLoop();

            if (this.onStart) this.onStart();

        } catch (err) {
            if (this.onError) this.onError(err);
            throw err;
        }
    }

    /**
     * Set up MediaRecorder events
     * @private
     */
    setupRecorderEvents() {
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, {
                type: this.options.mimeType
            });

            if (this.options.autoDownload) {
                this.downloadRecording(blob);
            }

            if (this.onStop) this.onStop(blob);
        };
    }

    /**
     * Start render loop
     * @private
     */
    startRenderLoop() {
        const renderFrame = () => {
            if (!this.isRecordingActive || this.isPaused) return;
            
            this.recordCtx.fillStyle = '#000000';
            this.recordCtx.fillRect(0, 0, this.recordCanvas.width, this.recordCanvas.height);
            this.recordCtx.drawImage(this.canvas, 0, 0);
            
            requestAnimationFrame(renderFrame);
        };

        renderFrame();
    }

    /**
     * Stop recording
     * @returns {Promise<Blob>} The recorded video blob
     */
    async stopRecording() {
        if (this.mediaRecorder && this.isRecordingActive) {
            this.isRecordingActive = false;
            this.mediaRecorder.stop();
            
            return new Promise((resolve) => {
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.recordedChunks, {
                        type: this.options.mimeType
                    });

                    if (this.options.autoDownload) {
                        this.downloadRecording(blob);
                    }

                    if (this.onStop) this.onStop(blob);
                    resolve(blob);
                };
            });
        }
    }

    /**
     * Pause recording
     */
    pauseRecording() {
        if (this.isRecordingActive && !this.isPaused) {
            this.isPaused = true;
            if (this.onPause) this.onPause();
        }
    }

    /**
     * Resume recording
     */
    resumeRecording() {
        if (this.isRecordingActive && this.isPaused) {
            this.isPaused = false;
            if (this.onResume) this.onResume();
        }
    }

    /**
     * Download recorded video
     * @private
     * @param {Blob} blob - The video blob
     */
    downloadRecording(blob) {
        const date = new Date();
        const defaultFilename = `recording_${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}_${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}${date.getSeconds().toString().padStart(2,'0')}`;
        
        const filename = this.options.filename || defaultFilename;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = `${filename}.mp4`;
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    /**
     * Check if recording is active
     * @returns {boolean}
     */
    isRecording() {
        return this.isRecordingActive;
    }

    /**
     * Check if recording is paused
     * @returns {boolean}
     */
    isPaused() {
        return this.isPaused;
    }
}
