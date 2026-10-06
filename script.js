let timeLeft = 25 * 60; // Default 25 minutes
        let isWorking = true;   
        let isRunning = false;  
        let timerId;

        // Automatically match system preference for light/dark mode on load
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.classList.add('light-mode');
        }

        function flipCard(cardId, newValue) {
            const card = document.getElementById(cardId);
            const staticTop = card.querySelector('.static-top .text');
            const staticBottom = card.querySelector('.static-bottom .text');
            
            const currentValue = staticTop.textContent;
            
            if (currentValue === String(newValue)) return;

            staticTop.textContent = newValue;

            const animatedTop = document.createElement('div');
            animatedTop.className = 'half top animated-top flip';
            animatedTop.innerHTML = `<div class="text">${currentValue}</div>`;
            
            const animatedBottom = document.createElement('div');
            animatedBottom.className = 'half bottom animated-bottom flip';
            animatedBottom.innerHTML = `<div class="text">${newValue}</div>`;

            card.appendChild(animatedTop);
            card.appendChild(animatedBottom);

            setTimeout(() => {
                staticBottom.textContent = newValue;
                animatedTop.remove();
                animatedBottom.remove();
            }, 600);
        }

        function updateDisplay() {
            let m = Math.floor(timeLeft / 60);
            let s = timeLeft % 60;
            
            let sStr = s < 10 ? '0' + s : s.toString();
            let mStr = m < 10 ? '0' + m : m.toString(); 

            document.title = `${mStr}:${sStr}`; 

            flipCard('card-minutes', mStr);
            flipCard('card-seconds', sStr);
        }

        function toggleTimer() {
            if (isRunning) {
                clearInterval(timerId);
                isRunning = false;
            } else {
                isRunning = true;
                updateDisplay(); 
                timerId = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                    } else {
                        isWorking = !isWorking;
                        timeLeft = isWorking ? 25 * 60 : 5 * 60;
                    }
                    updateDisplay();
                }, 1000);
            }
        }

        updateDisplay();

        // Keyboard Event Listeners
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault(); // Stop page scroll
                toggleTimer();
            }
            if (event.code === 'KeyL') {
                // Press 'L' to toggle light mode
                document.body.classList.toggle('light-mode');
            }
        });