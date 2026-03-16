// --- Game Config ---
const waterPerDay = 20;
const thresholds = {
    drinking: 2,
    cooking: 3,
    cleaning: 2,
    hygiene: 2
};
const ideal = {
    drinking: 3,
    cooking: 5,
    cleaning: 4,
    hygiene: 3
};
const timerDuration = 60; // seconds
const totalDays = 7;

let currentDay = 1;
let timer = timerDuration;
let paused = false;
let timerInterval;
let allocations = {
    drinking: 0,
    cooking: 0,
    cleaning: 0,
    hygiene: 0
};
let waterAvailable = waterPerDay;
let waterAllocated = 0;
let survivedAll = true;

const events = [
    { desc: "Pipe leak! You lose 2 liters of water.", effect: { water: -2 } },
    { desc: "A guest arrives. You need 1 extra liter for drinking.", effect: { drinking: 1 } },
    { desc: "Heavy rain! You collect 3 extra liters.", effect: { water: 3 } },
    { desc: "Cooking mishap. You waste 1 liter.", effect: { cooking: -1 } },
    { desc: "Hygiene emergency. You need 1 extra liter.", effect: { hygiene: 1 } },
    { desc: "Cleaning day. You need 1 extra liter.", effect: { cleaning: 1 } },
    { desc: "No event today.", effect: {} }
];

// --- DOM Elements ---
const startBtn = document.getElementById('start-btn');
const allocateBtn = document.getElementById('allocate-btn');
const pauseBtn = document.getElementById('pause-btn');
const unpauseBtn = document.getElementById('unpause-btn');
const eventContinueBtn = document.getElementById('event-continue-btn');
const nextDayBtn = document.getElementById('next-day-btn');
const restartBtn = document.getElementById('restart-btn');
const resetBtn = document.getElementById('reset-btn');

const dayNumber = document.getElementById('day-number');
const availableWater = document.getElementById('available-water');
const allocatedWaterLabel = document.getElementById('allocated-water-label');
const waterProgressBar = document.getElementById('water-progress-bar');
const timerDisplay = document.getElementById('timer');

const drinkingSlider = document.getElementById('drinking-slider');
const cookingSlider = document.getElementById('cooking-slider');
const cleaningSlider = document.getElementById('cleaning-slider');
const hygieneSlider = document.getElementById('hygiene-slider');

const drinkingValue = document.getElementById('drinking-value');
const cookingValue = document.getElementById('cooking-value');
const cleaningValue = document.getElementById('cleaning-value');
const hygieneValue = document.getElementById('hygiene-value');

// --- Event Listeners ---
startBtn.addEventListener('click', startGame);
allocateBtn.addEventListener('click', allocateWater);
// Pause modal removed, so no listeners needed
eventContinueBtn.addEventListener('click', continueAfterEvent);
nextDayBtn.addEventListener('click', nextDay);
restartBtn.addEventListener('click', restartGame);
resetBtn.addEventListener('click', restartGame);
resetBtn.addEventListener('click', restartGame);

[drinkingSlider, cookingSlider, cleaningSlider, hygieneSlider].forEach(slider => {
    slider.addEventListener('input', updateValues);
});

// --- Functions ---
function updateValues() {
    allocations.drinking = parseInt(drinkingSlider.value);
    allocations.cooking = parseInt(cookingSlider.value);
    allocations.cleaning = parseInt(cleaningSlider.value);
    allocations.hygiene = parseInt(hygieneSlider.value);

    drinkingValue.textContent = allocations.drinking + 'L';
    cookingValue.textContent = allocations.cooking + 'L';
    cleaningValue.textContent = allocations.cleaning + 'L';
    hygieneValue.textContent = allocations.hygiene + 'L';

    waterAllocated = allocations.drinking + allocations.cooking + allocations.cleaning + allocations.hygiene;
    availableWater.textContent = Math.max(0, waterPerDay - waterAllocated);
    allocatedWaterLabel.textContent = waterAllocated + 'L / ' + waterPerDay + 'L';
    let percent = Math.min(100, (waterAllocated / waterPerDay) * 100);
    waterProgressBar.style.width = percent + '%';
}

function startGame() {
    // Hide all screens except allocation
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('event-screen').classList.add('hidden');
    document.getElementById('outcome-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('allocation-screen').classList.remove('hidden');
    // Reset game state
    currentDay = 1;
    survivedAll = true;
    dayNumber.textContent = currentDay;
    resetAllocations();
    startTimer();
}

function resetAllocations() {
    drinkingSlider.value = 0;
    cookingSlider.value = 0;
    cleaningSlider.value = 0;
    hygieneSlider.value = 0;
    updateValues();
}

function startTimer() {
    timer = timerDuration;
    timerDisplay.textContent = timer;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!paused) {
            timer--;
            timerDisplay.textContent = timer;
            if (timer <= 0) {
                clearInterval(timerInterval);
                allocateWater(); // Auto allocate if time runs out
            }
        }
    }, 1000);
}



function allocateWater() {
    clearInterval(timerInterval);
    waterAllocated = allocations.drinking + allocations.cooking + allocations.cleaning + allocations.hygiene;
    if (waterAllocated > waterPerDay) {
        alert("You allocated more water than available!");
        return;
    }
    // Random event
    const event = events[Math.floor(Math.random() * events.length)];
    document.getElementById('event-description').textContent = event.desc;
    // Apply event effects
    if (event.effect.water) {
        // If water is lost/gained, adjust available for outcome check
        waterAllocated -= event.effect.water;
        // If negative, player loses water, so allocations are less effective
    }
    if (event.effect.drinking) allocations.drinking += event.effect.drinking;
    if (event.effect.cooking) allocations.cooking += event.effect.cooking;
    if (event.effect.cleaning) allocations.cleaning += event.effect.cleaning;
    if (event.effect.hygiene) allocations.hygiene += event.effect.hygiene;

    document.getElementById('allocation-screen').classList.add('hidden');
    document.getElementById('event-screen').classList.remove('hidden');
}

function continueAfterEvent() {
    document.getElementById('event-screen').classList.add('hidden');
    checkOutcome();
}

function checkOutcome() {
    let survived = true;
    let message = `Day ${currentDay} survived!\n`;
    if (allocations.drinking < thresholds.drinking) {
        survived = false;
        message += "Not enough water for drinking.\n";
    }
    if (allocations.cooking < thresholds.cooking) {
        survived = false;
        message += "Not enough water for cooking.\n";
    }
    if (allocations.cleaning < thresholds.cleaning) {
        survived = false;
        message += "Not enough water for cleaning.\n";
    }
    if (allocations.hygiene < thresholds.hygiene) {
        survived = false;
        message += "Not enough water for hygiene.\n";
    }

    if (!survived) {
        message += "Game Over!";
        survivedAll = false;
        document.getElementById('outcome-message').textContent = message;
        document.getElementById('next-day-btn').textContent = "End Game";
        document.getElementById('outcome-screen').classList.remove('hidden');
    } else {
        message += "Well done!";
        document.getElementById('outcome-message').textContent = message;
        document.getElementById('next-day-btn').textContent = currentDay === totalDays ? "See Results" : "Next Day";
        document.getElementById('outcome-screen').classList.remove('hidden');
    }
}

function nextDay() {
    if (!survivedAll || currentDay >= totalDays) {
        endGame(survivedAll);
    } else {
        currentDay++;
        dayNumber.textContent = currentDay;
        document.getElementById('outcome-screen').classList.add('hidden');
        document.getElementById('allocation-screen').classList.remove('hidden');
        resetAllocations();
        startTimer();
    }
}

function endGame(success) {
    document.getElementById('outcome-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
    if (success) {
        document.getElementById('end-message').textContent = "Congratulations! You survived all 7 days.";
        // Calculate score: sum of how close to ideal allocations
        let score = 0;
        score += Math.max(0, Math.min(allocations.drinking, ideal.drinking) - thresholds.drinking);
        score += Math.max(0, Math.min(allocations.cooking, ideal.cooking) - thresholds.cooking);
        score += Math.max(0, Math.min(allocations.cleaning, ideal.cleaning) - thresholds.cleaning);
        score += Math.max(0, Math.min(allocations.hygiene, ideal.hygiene) - thresholds.hygiene);
        document.getElementById('score-value').textContent = score;
    } else {
        document.getElementById('end-message').textContent = "You didn't survive all days.";
        document.getElementById('score-value').textContent = 0;
    }
}

function restartGame() {
    currentDay = 1;
    timer = timerDuration;
    paused = false;
    if (timerInterval) clearInterval(timerInterval);
    allocations = {
        drinking: 0,
        cooking: 0,
        cleaning: 0,
        hygiene: 0
    };
    waterAvailable = waterPerDay;
    waterAllocated = 0;
    survivedAll = true;
    dayNumber.textContent = currentDay;
    timerDisplay.textContent = timer;
    drinkingSlider.value = 0;
    cookingSlider.value = 0;
    cleaningSlider.value = 0;
    hygieneSlider.value = 0;
    updateValues();
    document.getElementById('allocation-screen').classList.add('hidden');
    document.getElementById('event-screen').classList.add('hidden');
    document.getElementById('outcome-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('restart-btn').classList.add('hidden');
    document.getElementById('next-day-btn').classList.remove('hidden');
}

// --- Initialize UI ---
updateValues();
// Pause modal removed