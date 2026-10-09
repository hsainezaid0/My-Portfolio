const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

const mouse = {
    x: null,
    y: null,
    radius: 150
};

let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles = [];

    const spacing = 45;

    for (let y = 0; y < canvas.height; y += spacing) {
        for (let x = 0; x < canvas.width; x += spacing) {
            particles.push({
                x: x + Math.random() * Math.min(
                    spacing,
                    canvas.width - x
                ),
                y: y + Math.random() * Math.min(
                    spacing,
                    canvas.height - y
                ),
                speedX: (Math.random() - 0.5) * 1.2,
                speedY: (Math.random() - 0.5) * 1.2,
                radius: Math.random() * 2 + 1
            });
        }
    }
}

window.addEventListener("pointermove", function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

function clearMouse() {
    mouse.x = null;
    mouse.y = null;
}

document.documentElement.addEventListener("pointerleave", clearMouse);
window.addEventListener("blur", clearMouse);

window.addEventListener("resize", resizeCanvas);

function drawLine(x1, y1, x2, y2, opacity) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = `rgba(0, 255, 140, ${opacity})`;
    ctx.lineWidth = 1;

    ctx.stroke();
}

let previousTime = null;

function animate(time) {
    const step = previousTime === null
        ? 1
        : Math.min((time - previousTime) / 16.67, 2);

    previousTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const particle of particles) {
        particle.x += particle.speedX * step;
        particle.y += particle.speedY * step;

        if (particle.x < 0 || particle.x > canvas.width) {
            particle.speedX *= -1;
            particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }

        if (particle.y < 0 || particle.y > canvas.height) {
            particle.speedY *= -1;
            particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        ctx.beginPath();
        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#00ff8c";
        ctx.shadowColor = "#00ff8c";
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const distance = Math.hypot(
                particles[i].x - particles[j].x,
                particles[i].y - particles[j].y
            );

            if (distance < 110) {
                drawLine(
                    particles[i].x,
                    particles[i].y,
                    particles[j].x,
                    particles[j].y,
                    (1 - distance / 110) * 0.35
                );
            }
        }

        if (mouse.x !== null && mouse.y !== null) {
            const distance = Math.hypot(
                particles[i].x - mouse.x,
                particles[i].y - mouse.y
            );

            if (distance < mouse.radius) {
                drawLine(
                    particles[i].x,
                    particles[i].y,
                    mouse.x,
                    mouse.y,
                    1 - distance / mouse.radius
                );
            }
        }
    }

    requestAnimationFrame(animate);
}

resizeCanvas();
requestAnimationFrame(animate);