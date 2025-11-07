function createSnowflakes() {
    const snowflakeCount = 50;
    const snowflakeContainer = document.createElement('div');
    snowflakeContainer.classList.add('snowflake-container');
    document.body.appendChild(snowflakeContainer);

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = (Math.random() * 10 + 5) + 's';
        snowflake.style.animationDelay = '-' + (Math.random() * 15) + 's';
        const size = Math.random() * 5 + 5;
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';
        snowflakeContainer.appendChild(snowflake);
    }
}
