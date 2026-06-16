// ===== MOOD EMOJI MAPPING =====
const moodEmojis = {
    1: '😢',
    2: '😞',
    3: '😕',
    4: '😐',
    5: '🙂',
    6: '😊',
    7: '😄',
    8: '😁',
    9: '🤩',
    10: '😄'
};

// ===== DOM ELEMENTS =====
const entryForm = document.getElementById('entryForm');
const moodSlider = document.getElementById('moodSlider');
const moodEmoji = document.getElementById('moodEmoji');
const moodValue = document.getElementById('moodValue');
const stressSlider = document.getElementById('stress');
const stressValue = document.getElementById('stressValue');
const entriesList = document.getElementById('entriesList');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearDataBtn = document.getElementById('clearDataBtn');

// ===== LOCAL STORAGE KEY =====
const STORAGE_KEY = 'myAuraDailyEntries';

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    displayEntries();
    updateStats();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Mood slider
    moodSlider.addEventListener('input', updateMoodEmoji);
    
    // Stress slider
    stressSlider.addEventListener('input', updateStressValue);
    
    // Form submission
    entryForm.addEventListener('submit', saveEntry);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayEntries(btn.dataset.filter);
        });
    });
    
    // Clear data button
    clearDataBtn.addEventListener('click', clearAllData);
}

// ===== UPDATE MOOD EMOJI =====
function updateMoodEmoji() {
    const value = parseInt(moodSlider.value);
    moodEmoji.textContent = moodEmojis[value];
    moodValue.textContent = value;
}

// ===== UPDATE STRESS VALUE =====
function updateStressValue() {
    stressValue.textContent = stressSlider.value;
}

// ===== SAVE ENTRY =====
function saveEntry(e) {
    e.preventDefault();
    
    const today = new Date().toISOString().split('T')[0];
    
    const entry = {
        date: today,
        mood: parseInt(moodSlider.value),
        stress: parseInt(stressSlider.value),
        sleep: parseFloat(document.getElementById('sleep').value),
        exercise: parseInt(document.getElementById('exercise').value),
        screenTime: parseFloat(document.getElementById('screenTime').value),
        outsideTime: parseInt(document.getElementById('outsideTime').value),
        notes: document.getElementById('notes').value.trim(),
        timestamp: new Date().getTime()
    };
    
    // Get existing entries
    let entries = getEntries();
    
    // Remove entry for today if it exists
    entries = entries.filter(e => e.date !== today);
    
    // Add new entry
    entries.push(entry);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    // Reset form
    entryForm.reset();
    moodSlider.value = 5;
    stressSlider.value = 5;
    updateMoodEmoji();
    updateStressValue();
    
    // Update display
    displayEntries();
    updateStats();
    
    // Show success message
    showNotification('✅ Entry saved successfully!');
}

// ===== GET ENTRIES FROM STORAGE =====
function getEntries() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// ===== DISPLAY ENTRIES =====
function displayEntries(filterDays = 'all') {
    const entries = getEntries();
    
    let filteredEntries = entries;
    
    if (filterDays !== 'all') {
        const days = parseInt(filterDays);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        filteredEntries = entries.filter(entry => {
            return new Date(entry.date) >= cutoffDate;
        });
    }
    
    // Sort by date (newest first)
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredEntries.length === 0) {
        entriesList.innerHTML = '<p class="no-entries">No entries found. Start tracking today!</p>';
        return;
    }
    
    entriesList.innerHTML = filteredEntries.map(entry => `
        <div class="entry-card">
            <div class="entry-date">📅 ${formatDate(entry.date)}</div>
            <div class="entry-mood">${moodEmojis[entry.mood]} Mood: ${entry.mood}/10</div>
            <div class="entry-details">
                <div class="detail-item">
                    <span class="detail-label">😰 Stress:</span>
                    <span class="detail-value">${entry.stress}/10</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">😴 Sleep:</span>
                    <span class="detail-value">${entry.sleep} hrs</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">🏃 Exercise:</span>
                    <span class="detail-value">${entry.exercise} min</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">📱 Screen Time:</span>
                    <span class="detail-value">${entry.screenTime} hrs</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">🌞 Outside:</span>
                    <span class="detail-value">${entry.outsideTime} min</span>
                </div>
            </div>
            ${entry.notes ? `<div class="entry-notes">💭 "${entry.notes}"</div>` : ''}
        </div>
    `).join('');
}

// ===== UPDATE STATS =====
function updateStats() {
    const entries = getEntries();
    
    if (entries.length === 0) {
        document.getElementById('avgMood').textContent = '--';
        document.getElementById('avgSleep').textContent = '--';
        document.getElementById('totalExercise').textContent = '--';
        document.getElementById('totalEntries').textContent = '0';
        return;
    }
    
    // Average mood
    const avgMood = (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1);
    document.getElementById('avgMood').textContent = `${avgMood} ${moodEmojis[Math.round(avgMood)]}`;
    
    // Average sleep
    const avgSleep = (entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length).toFixed(1);
    document.getElementById('avgSleep').textContent = `${avgSleep} hrs`;
    
    // Total exercise
    const totalExercise = entries.reduce((sum, e) => sum + e.exercise, 0);
    document.getElementById('totalExercise').textContent = `${totalExercise} min`;
    
    // Total entries
    document.getElementById('totalEntries').textContent = entries.length;
}

// ===== UTILITY FUNCTIONS =====

// Format date to readable format
function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #6bcf7f;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Clear all data
function clearAllData() {
    if (confirm('⚠️ Are you sure you want to delete ALL entries? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        displayEntries();
        updateStats();
        showNotification('🗑️ All data cleared');
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
