const display = document.getElementById('display');
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const inputSection = document.getElementById('input-section');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const bgInput = document.getElementById('bg-input');
const bgContainer = document.getElementById('background-container');

let totalSeconds = 0;
let timerInterval = null;
let isRunning = false;

// --- LOCAL STORAGE & PERSISTENCE ---

const saveData = () => {
    const timerData = {
        h: hoursInput.value,
        m: minutesInput.value,
        s: secondsInput.value
    };
    localStorage.setItem('timerValues', JSON.stringify(timerData));
};

const loadData = () => {
    const savedTime = localStorage.getItem('timerValues');
    if (savedTime) {
        const data = JSON.parse(savedTime);
        hoursInput.value = data.h || "";
        minutesInput.value = data.m || "";
        secondsInput.value = data.s || "";
    }

    const savedBg = localStorage.getItem('timerBg');
    if (savedBg) {
        bgContainer.style.backgroundImage = `url("${savedBg}")`;
    }
};

// --- CORE LOGIC ---

const formatTime = (time) => time.toString().padStart(2, '0');

const updateDisplay = () => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    display.textContent = `${formatTime(h)}:${formatTime(m)}:${formatTime(s)}`;
    
    // Update mobile browser title with time
    document.title = `${formatTime(h)}:${formatTime(m)}:${formatTime(s)} - Timer`;
};

const startTimer = () => {
    if (isRunning) return;

    if (totalSeconds === 0) {
        const h = parseInt(hoursInput.value) || 0;
        const m = parseInt(minutesInput.value) || 0;
        const s = parseInt(secondsInput.value) || 0;
        totalSeconds = (h * 3600) + (m * 60) + s;
        
        if (totalSeconds <= 0) return;
        saveData();
    }

    // Modern UI Transition
    inputSection.style.opacity = '0';
    setTimeout(() => { if(isRunning) inputSection.style.visibility = 'hidden'; }, 300);
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    updateDisplay();

    timerInterval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateDisplay();
        } else {
            handleEnd();
        }
    }, 1000);
};

const pauseTimer = () => {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    startBtn.textContent = "Resume";
    pauseBtn.disabled = true;
};

const resetTimer = () => {
    clearInterval(timerInterval);
    isRunning = false;
    totalSeconds = 0;
    display.textContent = "00:00:00";
    inputSection.style.visibility = 'visible';
    inputSection.style.opacity = '1';
    startBtn.disabled = false;
    startBtn.textContent = "Start";
    pauseBtn.disabled = true;
    document.title = "Premium Timer";
};

const handleEnd = () => {
    clearInterval(timerInterval);
    resetTimer();
    // Use a slight delay for the alert so the UI updates first
    setTimeout(() => {
        alert("Time is up!");
    }, 100);
};

// --- EVENTS ---

[hoursInput, minutesInput, secondsInput].forEach(input => {
    input.addEventListener('input', saveData);
});

if (bgInput) {
    bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imgBase64 = event.target.result;
            bgContainer.style.backgroundImage = `url("${imgBase64}")`;
            localStorage.setItem('timerBg', imgBase64);
        };
        reader.readAsDataURL(file);
    });
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

window.addEventListener('DOMContentLoaded', loadData);