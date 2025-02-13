import { CanvasRecorder } from './CanvasRecorder.js';

/**
 * DemoAnimation class for creating a particle animation.
 */
export class DemoAnimation {
    /**
     * Constructor for DemoAnimation.
     * @param {HTMLCanvasElement} canvas - The canvas element to render the animation on.
     */
    constructor(canvas) {
        this.displayCanvas = canvas;
        this.displayCtx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true
        });

        // Create a Full HD canvas for rendering and recording
        this.renderCanvas = document.createElement('canvas');
        this.renderCanvas.width = 1920;
        this.renderCanvas.height = 1080;
        this.renderCtx = this.renderCanvas.getContext('2d', {
            alpha: false
        });

        // Animation configuration
        this.particles = [];
        this.time = 0;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.recorder = null;
        this.rafId = null;

        // Particle parameters (fixed size for FHD canvas)
        this.numParticles = 150;
        this.numSpirals = 3;
        this.baseRadius = 100;
        this.radiusRange = 400;
        this.baseSpeed = 0.02;
        this.speedVariation = 0.015;
        this.particleSize = 6;
        this.particleSizeVariation = 2;

        // Rendering setup
        this.initOffscreenCanvas();
        this.initParticles();

        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize size
        this.handleResize();
    }

    /**
     * Initialize the offscreen canvas for rendering.
     */
    initOffscreenCanvas() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = 1920;  // Always Full HD
        this.offscreenCanvas.height = 1080;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', {
            alpha: false
        });
    }

    /**
     * Initialize the particles for the animation.
     */
    initParticles() {
        this.particles = [];
        
        for (let spiral = 0; spiral < this.numSpirals; spiral++) {
            const spiralOffset = (spiral / this.numSpirals) * Math.PI * 2;
            const particlesPerSpiral = this.numParticles / this.numSpirals;
            
            for (let i = 0; i < particlesPerSpiral; i++) {
                const progress = i / particlesPerSpiral;
                const angle = progress * Math.PI * 2 + spiralOffset;
                const radius = this.baseRadius + progress * this.radiusRange;
                const speed = this.baseSpeed - progress * this.speedVariation;
                const size = this.particleSize + Math.random() * this.particleSizeVariation;
                const hue = (spiral * 120 + progress * 60) % 360;
                
                this.particles.push({
                    angle,
                    radius,
                    speed,
                    size,
                    color: `hsla(${hue}, 100%, 60%, 1)`,
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }
        }
    }

    /**
     * Draw a particle at the specified position with the given size and color.
     * @param {number} x - The x-coordinate of the particle.
     * @param {number} y - The y-coordinate of the particle.
     * @param {number} size - The size of the particle.
     * @param {string} color - The color of the particle.
     * @param {number} pulseIntensity - The pulse intensity of the particle.
     */
    drawParticle(x, y, size, color, pulseIntensity) {
        const ctx = this.offscreenCtx;
        const glow = size * 4;
        
        ctx.shadowBlur = glow;
        ctx.shadowColor = color.replace('1)', '0.6)');
        
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = color.replace('1)', '0.2)');
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = color.replace('1)', '0.8)');
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    /**
     * Draw a trail from the previous position to the current position of a particle.
     * @param {number} fromX - The x-coordinate of the previous position.
     * @param {number} fromY - The y-coordinate of the previous position.
     * @param {number} toX - The x-coordinate of the current position.
     * @param {number} toY - The y-coordinate of the current position.
     * @param {string} color - The color of the trail.
     * @param {number} width - The width of the trail.
     * @param {number} alpha - The alpha value of the trail.
     */
    drawTrail(fromX, fromY, toX, toY, color, width, alpha) {
        const ctx = this.offscreenCtx;
        ctx.strokeStyle = color.replace('1)', `${alpha})`);
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
    }

    /**
     * Animate the particles.
     * @param {number} currentTime - The current time.
     */
    animate(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.time += deltaTime * 0.001;

        // Clear buffer
        this.offscreenCtx.fillStyle = '#000';
        this.offscreenCtx.fillRect(0, 0, 1920, 1080);

        const centerX = 1920 / 2;
        const centerY = 1080 / 2;

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.angle += particle.speed;
            
            const x = centerX + Math.cos(particle.angle + this.time) * particle.radius;
            const y = centerY + Math.sin(particle.angle + this.time) * particle.radius;
            
            const prevX = centerX + Math.cos(particle.angle + this.time - 0.1) * particle.radius;
            const prevY = centerY + Math.sin(particle.angle + this.time - 0.1) * particle.radius;
            this.drawTrail(prevX, prevY, x, y, particle.color, particle.size, 0.3);
            
            const pulseIntensity = Math.sin(this.time * 2 + particle.pulsePhase) * 0.5 + 0.5;
            this.drawParticle(x, y, particle.size, particle.color, pulseIntensity);
        });

        // Copy to display canvas with scaling
        this.displayCtx.fillStyle = '#000';
        this.displayCtx.fillRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
        this.displayCtx.drawImage(
            this.offscreenCanvas,
            0, 0, 1920, 1080,
            0, 0, this.displayCanvas.width, this.displayCanvas.height
        );

        this.rafId = requestAnimationFrame(this.animate);
    }

    /**
     * Handle the resize event.
     */
    handleResize() {
        const container = this.displayCanvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Adjust display canvas size
        this.displayCanvas.width = rect.width;
        this.displayCanvas.height = rect.height;
    }

    /**
     * Start the animation.
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            this.animate();
        }
    }

    /**
     * Stop the animation.
     */
    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Start recording the animation.
     */
    async startRecording() {
        if (!this.recorder) {
            // Use Full HD render canvas for recording
            this.recorder = new CanvasRecorder(this.offscreenCanvas, {
                mimeType: 'video/webm',
                fps: 60
            });
            await this.recorder.startRecording();
        }
    }

    /**
     * Stop recording the animation.
     */
    async stopRecording() {
        if (this.recorder) {
            await this.recorder.stopRecording();
            this.recorder = null;
        }
    }
}

// Demo configuration
const canvas = document.getElementById('demoCanvas');
const animation = new DemoAnimation(canvas);

// Start the animation
animation.start();
