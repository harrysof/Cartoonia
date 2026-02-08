// ===== APP STATE =====
const STORAGE_KEY = 'cartoonia_app_state';

let appState = {
    parentName: '',
    kids: [],
    selectedKid: null,
    filters: {
        platforms: ['youtube'],
        maxAge: 6,
        blockedScenes: [],
        keywords: ''
    }
};

// ===== PERSISTENCE =====
function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            appState = JSON.parse(saved);
            return true;
        } catch (e) {
            console.error('Failed to parse saved state', e);
        }
    }
    return false;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const hasSavedState = loadState();

    if (hasSavedState && appState.parentName && appState.kids.length > 0) {
        // Skip splash/onboarding if we have data
        navigateToScreen('home-screen');
        updateHomeScreen();
        generateVideos();
    } else {
        // Splash screen auto-advance
        setTimeout(() => {
            if (appState.parentName) {
                navigateToScreen('kids-setup-screen');
                updateKidsList();
            } else {
                navigateToScreen('parent-setup-screen');
            }
        }, 2000);
    }

    initializeEventListeners();
});

// ===== SCREEN NAVIGATION =====
function navigateToScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        targetScreen.scrollTop = 0;
    }
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Parent setup
    const continueParentBtn = document.getElementById('continueParentBtn');
    const parentNameInput = document.getElementById('parentNameInput');

    continueParentBtn?.addEventListener('click', () => {
        const name = parentNameInput.value.trim();
        if (name) {
            appState.parentName = name;
            saveState(); // Persist name
            navigateToScreen('kids-setup-screen');
        } else {
            parentNameInput.style.border = '1px solid var(--primary-orange)';
        }
    });

    // Kids setup
    document.getElementById('addKidBtn')?.addEventListener('click', showAddKidModal);
    document.getElementById('cancelKidBtn')?.addEventListener('click', hideAddKidModal);
    document.getElementById('closeModalBtn')?.addEventListener('click', hideAddKidModal);
    document.getElementById('confirmKidBtn')?.addEventListener('click', addKid);
    document.getElementById('continueKidsBtn')?.addEventListener('click', () => {
        if (appState.kids.length > 0) {
            navigateToScreen('home-screen');
            updateHomeScreen();
        } else {
            alert('Veuillez ajouter au moins un enfant');
        }
    });

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetScreen = btn.getAttribute('data-back');
            navigateToScreen(targetScreen);
        });
    });

    // Profile Action cards
    document.querySelectorAll('.dash-action-card').forEach(card => {
        card.addEventListener('click', () => {
            const targetScreen = card.getAttribute('data-screen');
            if (appState.selectedKid) {
                updateScreenForSelectedKid(targetScreen);
                navigateToScreen(targetScreen);
            }
        });
    });

    // Filter screen logic
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
            // Logic to update state would go here
        });
    });

    const ageSlider = document.getElementById('ageSlider');
    const ageValue = document.getElementById('ageValue');

    ageSlider?.addEventListener('input', (e) => {
        const value = e.target.value;
        ageValue.textContent = value + ' ans';
        appState.filters.maxAge = parseInt(value);
    });

    document.getElementById('applyFilterBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('applyFilterBtn');
        btn.innerHTML = '<img src="assets/icons/checkmark.png" alt="Checked" style="width: 20px; height: 20px; margin-right: 8px;"> Filtres appliqués';
        btn.style.background = 'var(--primary-teal)';

        saveState(); // Persist filters

        setTimeout(() => {
            btn.innerHTML = 'Appliquer les filtres';
            btn.style.background = '';
            navigateToScreen('profile-screen');
        }, 1000);
    });

    // Generate screen logic
    const sendStoryBtn = document.getElementById('sendStoryBtn');
    const storyInput = document.getElementById('storyInput');

    function sendStory() {
        const message = storyInput.value.trim();
        if (message) {
            addChatMessage(message, 'user');
            storyInput.value = '';

            setTimeout(() => {
                const response = generateStoryResponse(message);
                addChatMessage(response, 'ai');
                document.getElementById('generateVideoBtn').disabled = false;
            }, 1000);
        }
    }

    sendStoryBtn?.addEventListener('click', sendStory);

    storyInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendStory();
        }
    });

    document.getElementById('generateVideoBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('generateVideoBtn');
        btn.innerHTML = 'Génération...';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = 'Vidéo générée';
            btn.style.background = 'var(--primary-teal)';

            setTimeout(() => {
                navigateToScreen('profile-screen');
                btn.innerHTML = 'Générer la vidéo';
                btn.disabled = false;
                btn.style.background = '';
            }, 1500);
        }, 2000);
    });

    // Settings button
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        if (confirm('Recommencer la configuration ?')) {
            appState = {
                parentName: '',
                kids: [],
                selectedKid: null,
                filters: { platforms: ['youtube'], maxAge: 6, blockedScenes: [], keywords: '' }
            };
            localStorage.removeItem(STORAGE_KEY); // Clear persisted data
            navigateToScreen('parent-setup-screen');
        }
    });

    // Content Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Logic to filter content
        });
    });
}

// ===== KID MANAGEMENT =====
function showAddKidModal() {
    document.getElementById('addKidModal').style.display = 'flex';
}

function hideAddKidModal() {
    document.getElementById('addKidModal').style.display = 'none';
    document.getElementById('kidNameInput').value = '';
    document.getElementById('kidAgeInput').value = '';
}

function addKid() {
    const name = document.getElementById('kidNameInput').value.trim();
    const age = parseInt(document.getElementById('kidAgeInput').value);

    if (name && age > 0 && age <= 12) {
        const kid = {
            id: Date.now(),
            name: name,
            age: age,
            videosWatched: Math.floor(Math.random() * 20),
            storiesCreated: Math.floor(Math.random() * 10),
            timeSpent: Math.floor(Math.random() * 5)
        };

        appState.kids.push(kid);
        saveState(); // Persist new kid
        updateKidsList();
        hideAddKidModal();
    } else {
        alert('Nom et âge valides requis');
    }
}

function updateKidsList() {
    const kidsList = document.getElementById('kidsList');
    kidsList.innerHTML = '';

    appState.kids.forEach(kid => {
        const kidCard = document.createElement('div');
        kidCard.className = 'profile-card';
        kidCard.style.flexDirection = 'row';
        kidCard.style.padding = '10px';
        kidCard.style.marginBottom = '10px';

        kidCard.innerHTML = `
            <div class="profile-avatar" style="width: 40px; height: 40px; border-width: 2px; margin-bottom: 0; background-color: var(--primary-orange);"></div>
            <div style="margin-left: 10px; flex: 1; text-align: left;">
                <div class="profile-name">${kid.name}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${kid.age} ans</div>
            </div>
        `;
        kidsList.appendChild(kidCard);
    });
}

// ===== HOME SCREEN =====
function updateHomeScreen() {
    const greeting = document.getElementById('parentGreeting');
    greeting.textContent = `Bonjour ${appState.parentName}, qui regarde ?`;

    const profileSelector = document.getElementById('profileSelector');
    profileSelector.innerHTML = '';

    appState.kids.forEach(kid => {
        const profileCard = document.createElement('div');
        profileCard.className = 'profile-card';
        profileCard.onclick = () => selectKid(kid.id);
        profileCard.innerHTML = `
            <div class="profile-avatar" style="background: linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()}); position: relative; display: flex; align-items: center; justify-content: center;">
                <img src="assets/icons/profile_overlay.png" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8; border-radius: 50%;">
            </div>
            <p class="profile-name">${kid.name}</p>
        `;
        profileSelector.appendChild(profileCard);
    });

    // Add "Add Profile" button
    const addBtn = document.createElement('div');
    addBtn.className = 'add-profile-btn';
    addBtn.onclick = showAddKidModal;
    addBtn.innerHTML = `
        <img src="assets/icons/add_profile.png" alt="Add" style="width: 32px; height: 32px; margin-bottom: 8px;">
        <span>Ajouter</span>
    `;
    profileSelector.appendChild(addBtn);
}

function getRandomColor() {
    const colors = ['#FF8A4C', '#4ECDC4', '#FF6B6B', '#6B66FF', '#FFB84C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function selectKid(kidId) {
    const kid = appState.kids.find(k => k.id === kidId);
    if (kid) {
        appState.selectedKid = kid;

        // Update dashboard
        document.getElementById('dashName').textContent = kid.name;
        document.getElementById('statVideos').textContent = kid.videosWatched;
        document.getElementById('statStories').textContent = kid.storiesCreated;
        document.getElementById('statTime').textContent = `${kid.timeSpent}h`;

        navigateToScreen('profile-screen');
    }
}

function updateScreenForSelectedKid(screenId) {
    if (!appState.selectedKid) return;

    if (screenId === 'filter-screen') {
        document.getElementById('ageSlider').value = appState.selectedKid.age;
        document.getElementById('ageValue').textContent = appState.selectedKid.age + ' ans';
    }
}

// ===== CHAT FUNCTIONALITY =====
function addChatMessage(message, type) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `msg ${type}`;
    messageDiv.textContent = message;

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function generateStoryResponse(userMessage) {
    const responses = [
        `J'ai créé une belle histoire sur ce thème pour ${appState.selectedKid.name}. Voulez-vous la générer en vidéo ?`,
        `Excellente idée. Voici une histoire adaptée. On lance la vidéo ?`,
        `C'est noté. L'histoire est prête. Créons la vidéo maintenant.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ===== VIDEO CONTENT =====
function generateVideos() {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '';

    const videos = [
        { title: 'Peppa Pig en Français', duration: '12:34' },
        { title: 'Apprendre les Couleurs', duration: '08:15' },
        { title: 'Comptines Douces', duration: '15:22' },
        { title: 'Pat Patrouille', duration: '10:45' },
        { title: 'Histoires du Soir', duration: '06:30' },
        { title: 'Dessin Facile', duration: '20:10' }
    ];

    videos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.innerHTML = `
            <div class="thumb" style="background: linear-gradient(45deg, ${getRandomColor()}, #333); position: relative; display: flex; align-items: center; justify-content: center;">
                <img src="assets/icons/play_overlay.png" alt="Play" style="width: 48px; height: 48px;">
            </div>
            <div class="vid-info">
                <div class="vid-title">${video.title}</div>
                <div class="vid-meta">${video.duration} • Vu 1.2k</div>
            </div>
        `;
        videoGrid.appendChild(item);
    });
}

// Initialize videos
generateVideos();

// ===== MASCOT GLASSY EFFECT =====
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('clickable-mascot')) {
        const mascot = e.target;
        const container = mascot.parentElement;

        // Create ripple element
        const ripple = document.createElement('div');
        ripple.className = 'glassy-ripple';

        // Position ripple at click location
        const rect = mascot.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.transform = 'translate(-50%, -50%)';

        container.style.position = 'relative';
        container.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 800);
    }
});
