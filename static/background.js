(function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    let width, height;
    let shapes = [];
    let explosions = [];
    const mouse = { x: -1000, y: -1000 };

    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        shapes = [];
        // 数量增加到 160
        for (let i = 0; i < 160; i++) {
            shapes.push(new Shape());
        }
    }

    class Shape {
        constructor() {
            this.reset();
        }

        reset() {
            const avatar = document.querySelector('.avatar');
            if (avatar) {
                const rect = avatar.getBoundingClientRect();
                this.x = rect.left + rect.width / 2;
                // 粒子从头像下方生成
                this.y = rect.bottom + 30;
            } else {
                this.x = width / 2;
                this.y = height / 2;
            }
            
            this.size = Math.random() * 12 + 6;
            const angle = Math.random() * Math.PI * 2;
            
            // 喷发速度不变 (原来的 speed)，但后续运动速度会增加
            const speed = Math.random() * 1.5 + 0.8;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            this.type = Math.floor(Math.random() * 3);
            this.color = getComputedStyle(document.documentElement).getPropertyValue('--particle-color') || '#888';
            this.opacity = Math.random() * 0.2 + 0.1;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        }

        update() {
            // 形状随时间变换
            if (Math.random() < 0.005) this.type = Math.floor(Math.random() * 3);

            // 躲避鼠标 (速度 x0.7)
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const forceDist = 80;

            if (dist < forceDist) {
                const force = (forceDist - dist) / forceDist;
                // 原来是 0.4，现在 0.4 * 0.7 = 0.28
                this.vx += (dx / dist) * force * 0.28;
                this.vy += (dy / dist) * force * 0.28;
            }

            // 离开网站的速度翻倍：通过减小阻力并增加一个持续的向外推力来实现“快走”
            // 这里的 vx, vy 会持续增加，让它们越跑越快
            this.x += this.vx * 2; 
            this.y += this.vy * 2;
            
            this.rotation += this.rotationSpeed;

            // 几乎没有摩擦力，让它们保持冲劲
            this.vx *= 0.998;
            this.vy *= 0.998;

            // 边界检查：一旦离开屏幕立即重置
            if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (this.type === 0) {
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            } else if (this.type === 1) {
                ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
            } else {
                const h = this.size * (Math.sqrt(3)/2);
                ctx.moveTo(0, -h/2);
                ctx.lineTo(this.size/2, h/2);
                ctx.lineTo(-this.size/2, h/2);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }
    }

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 1.0;
            this.decay = Math.random() * 0.03 + 0.015;
            this.color = getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#333';
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.15;
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.life -= this.decay;
        }
        draw() {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createExplosion(x, y) {
        for (let i = 0; i < 40; i++) {
            explosions.push(new Particle(x, y));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        shapes.forEach(s => {
            s.update();
            s.draw();
        });
        for (let i = explosions.length - 1; i >= 0; i--) {
            explosions[i].update();
            explosions[i].draw();
            if (explosions[i].life <= 0) explosions.splice(i, 1);
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mousedown', e => {
        const avatar = document.querySelector('.avatar');
        if (avatar && avatar.contains(e.target)) {
            const rect = avatar.getBoundingClientRect();
            createExplosion(rect.left + rect.width / 2, rect.bottom + 20);
        } else {
            createExplosion(e.clientX, e.clientY);
        }
    });

    // Also support touch on avatar
    window.addEventListener('touchstart', e => {
        const avatar = document.querySelector('.avatar');
        if (avatar && avatar.contains(e.target)) {
            const rect = avatar.getBoundingClientRect();
            createExplosion(rect.left + rect.width / 2, rect.bottom + 10);
        }
    });
    
    // Click avatar shows particles at bottom
    const avatar = document.getElementById('avatarClick');
    if (avatar) {
        avatar.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            createExplosion(rect.left + rect.width / 2, rect.bottom + 10);
        });
    }

    window.addEventListener('resize', init);

    init();
    animate();
})();
