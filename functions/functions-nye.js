function createFirework() {

    const fireworkContainer = document.createElement('div');
    fireworkContainer.style.position = 'absolute';
    fireworkContainer.style.top = Math.random() * 50 + 'vh';
    fireworkContainer.style.left = Math.random() * 100 + 'vw';
    document.body.appendChild(fireworkContainer);

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('firework-particle');

        const angle = (i / particleCount) * 360;
        const distance = Math.random() * 100 + 50;
        const x = Math.cos((angle * Math.PI) / 180) * distance + 'px';
        const y = Math.sin((angle * Math.PI) / 180) * distance + 'px';

        particle.style.setProperty('--x', x);
        particle.style.setProperty('--y', y);

        const colors = ['#806C00', '#BFA100', '#FFD700', '#FFE140', '#FFEB80'];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        fireworkContainer.appendChild(particle);
    }

    setTimeout(() => {
        fireworkContainer.remove();
    }, 2000);
}

function launchFireworks() {
    setInterval(() => {

        const burstCount = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < burstCount; i++) {
            
            setTimeout(() => {
                createFirework();
            }, i * 150);
        }

    }, 2000);
}
