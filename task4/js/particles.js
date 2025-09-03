// Particle Background System
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    resize() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Recreate particles on resize
        if (this.particles.length > 0) {
            this.createParticles();
        }
    }

    createParticles() {
        if (!this.canvas) return;
        
        this.particles = [];
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
    }

    setupEventListeners() {
        if (!this.canvas) return;
        
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        // Mouse leave
        this.canvas.addEventListener('mouseleave', () => {
            this.mousePosition.x = -1000;
            this.mousePosition.y = -1000;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.resize();
        });

        // Visibility change (pause when not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    animate() {
        if (!this.canvas || !this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.02)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(this.mousePosition, this.canvas.width, this.canvas.height);
            particle.draw(this.ctx);
        });

        // Draw connections
        this.drawConnections();

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - distance / 1500})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        // Connect to mouse
        this.particles.forEach(particle => {
            const dx = particle.x - this.mousePosition.x;
            const dy = particle.y - this.mousePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 200) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(255, 215, 0, ${0.3 - distance / 600})`;
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(this.mousePosition.x, this.mousePosition.y);
                this.ctx.stroke();
            }
        });
    }

    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        if (!this.animationId) {
            this.animate();
        }
    }

    handleResize() {
        this.resize();
    }

    destroy() {
        this.pause();
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        }
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}

class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 3 + 1;
        this.originalRadius = this.radius;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.originalOpacity = this.opacity;
        
        // Color variations
        const colors = [
            '255, 255, 255',
            '255, 215, 0',
            '255, 107, 107',
            '107, 255, 107'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(mousePosition, canvasWidth, canvasHeight) {
        // Mouse attraction
        const dx = mousePosition.x - this.x;
        const dy = mousePosition.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * force * 0.01;
            this.vy += Math.sin(angle) * force * 0.01;
            
            // Scale particle
            this.radius = this.originalRadius * (1 + force * 0.5);
            this.opacity = Math.min(1, this.originalOpacity * (1 + force));
        } else {
            // Return to normal
            this.radius = this.originalRadius;
            this.opacity = this.originalOpacity;
        }

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Friction
        this.vx *= 0.99;
        this.vy *= 0.99;

        // Boundary collision
        if (this.x < 0 || this.x > canvasWidth) {
            this.vx *= -0.8;
            this.x = Math.max(0, Math.min(canvasWidth, this.x));
        }
        if (this.y < 0 || this.y > canvasHeight) {
            this.vy *= -0.8;
            this.y = Math.max(0, Math.min(canvasHeight, this.y));
        }

        // Random movement
        this.vx += (Math.random() - 0.5) * 0.01;
        this.vy += (Math.random() - 0.5) * 0.01;

        // Limit velocity
        const maxVel = 2;
        if (Math.abs(this.vx) > maxVel) this.vx = this.vx > 0 ? maxVel : -maxVel;
        if (Math.abs(this.vy) > maxVel) this.vy = this.vy > 0 ? maxVel : -maxVel;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();

        // Glow effect
        if (this.radius > this.originalRadius) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity * 0.1})`;
            ctx.fill();
        }
    }
}

// Initialize particle system when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ParticleSystem = ParticleSystem;
    });
} else {
    window.ParticleSystem = ParticleSystem;
}