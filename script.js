class PomodoroTimer {
    constructor() {
        this.workTime = 25 * 60; // 25 minutes
        this.breakTime = 5 * 60; // 5 minutes
        this.currentTime = this.workTime;
        this.isWorking = true;
        this.isRunning = false;
        this.timer = null;
        this.completedSessions = 0;
        this.totalMinutes = 0;
        this.streak = 0;
        
        this.blockedSites = [
            'instagram.com',
            'tiktok.com',
            'facebook.com',
            'twitter.com',
            'youtube.com',
            'reddit.com',
            'x.com',
            'snapchat.com'
        ];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timerDisplay');
        this.sessionInfo = document.getElementById('sessionInfo');
        this.progressFill = document.getElementById('progressFill');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.blockingStatus = document.getElementById('blockingStatus');
        this.container = document.querySelector('.container');
        this.completedSessionsEl = document.getElementById('completedSessions');
        this.totalTimeEl = document.getElementById('totalTime');
        this.streakEl = document.getElementById('streak');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Block navigation during work sessions
        window.addEventListener('beforeunload', (e) => {
            if (this.isRunning && this.isWorking) {
                e.preventDefault();
                e.returnValue = 'You have an active focus session. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
        
        // Monitor for blocked sites
        this.monitorNavigation();
    }
    
    monitorNavigation() {
        // Check current URL for blocked sites
        const checkCurrentSite = () => {
            if (this.isRunning && this.isWorking) {
                const currentUrl = window.location.href.toLowerCase();
                for (let site of this.blockedSites) {
                    if (currentUrl.includes(site)) {
                        this.showBlockWarning();
                        break;
                    }
                }
            }
        };
        
        // Check every 2 seconds
        setInterval(checkCurrentSite, 2000);
    }
    
    showBlockWarning() {
        const modal = document.getElementById('blockModal');
        const modalTimer = document.getElementById('modalTimer');
        modalTimer.textContent = this.formatTime(this.currentTime);
        modal.style.display = 'flex';
    }
    
    start() {
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.timer = setInterval(() => {
            this.currentTime--;
            this.updateDisplay();
            
            if (this.currentTime <= 0) {
                this.complete();
            }
        }, 1000);
        
        this.updateBlockingStatus();
        this.playNotification();
    }
    
    pause() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timer);
        this.updateBlockingStatus();
    }
    
    reset() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timer);
        
        this.currentTime = this.isWorking ? this.workTime : this.breakTime;
        this.updateDisplay();
        this.updateBlockingStatus();
    }
    
    complete() {
        this.isRunning = false;
        clearInterval(this.timer);
        
        if (this.isWorking) {
            this.completedSessions++;
            this.totalMinutes += 25;
            this.streak++;
            this.saveStats();
            this.showNotification('Work session complete! Time for a break 🎉');
            this.isWorking = false;
            this.currentTime = this.breakTime;
        } else {
            this.showNotification('Break complete! Ready for another focus session? 💪');
            this.isWorking = true;
            this.currentTime = this.workTime;
        }
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.updateDisplay();
        this.updateBlockingStatus();
        this.playNotification();
    }
    
    updateDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.currentTime);
        
        if (this.isWorking) {
            this.sessionInfo.textContent = this.isRunning ? 'Focus time - Stay concentrated!' : 'Ready for a focus session';
            this.container.style.background = this.isRunning ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 255, 255, 0.25)';
        } else {
            this.sessionInfo.textContent = this.isRunning ? 'Break time - Relax and recharge' : 'Ready for a break';
            this.container.style.background = this.isRunning ? 'rgba(81, 207, 102, 0.1)' : 'rgba(255, 255, 255, 0.25)';
        }
        
        // Update progress bar
        const totalTime = this.isWorking ? this.workTime : this.breakTime;
        const progress = ((totalTime - this.currentTime) / totalTime) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Update work mode animation
        if (this.isRunning && this.isWorking) {
            this.container.classList.add('work-mode');
        } else {
            this.container.classList.remove('work-mode');
        }
        
        // Update stats display
        this.completedSessionsEl.textContent = this.completedSessions;
        this.totalTimeEl.textContent = this.totalMinutes;
        this.streakEl.textContent = this.streak;
        
        // Update modal timer if visible
        const modalTimer = document.getElementById('modalTimer');
        if (modalTimer) {
            modalTimer.textContent = this.formatTime(this.currentTime);
        }
    }
    
    updateBlockingStatus() {
        const isBlocking = this.isRunning && this.isWorking;

        if (isBlocking) {
            this.blockingStatus.className = 'blocking-status active';
            this.blockingStatus.innerHTML = `
                <strong> Website Blocking: Available </strong>
                <p>Download Archive.zip via GitHub</p>
            `;
        } else {
            this.blockingStatus.className = 'blocking-status';
            this.blockingStatus.innerHTML = `
                <strong> Website Blocking: Inactive </strong>
                <p>Download Archive.zip via GitHub</p>
            `;
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', { body: message });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Pomodoro Timer', { body: message });
                }
            });
        }
    }
    
    playNotification() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    saveStats() {
        const stats = {
            completedSessions: this.completedSessions,
            totalMinutes: this.totalMinutes,
            streak: this.streak
        };
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }
    
    loadStats() {
        const saved = localStorage.getItem('pomodoroStats');
        if (saved) {
            const stats = JSON.parse(saved);
            this.completedSessions = stats.completedSessions || 0;
            this.totalMinutes = stats.totalMinutes || 0;
            this.streak = stats.streak || 0;
        }
    }
}

// Global functions
function closeBlockModal() {
    document.getElementById('blockModal').style.display = 'none';
}

// Initialize the timer
const pomodoro = new PomodoroTimer();

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}