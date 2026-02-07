// ===== APP STATE =====
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Splash screen auto-advance
    setTimeout(() => {
        navigateToScreen('parent-setup-screen');
    }, 2000);

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
            navigateToScreen('kids-setup-screen');
        } else {
            parentNameInput.style.border = '1px solid var(--primary-orange)';
        }
    });

    // Kids setup
    document.getElementById('addKidBtn')?.addEventListener('click', showAddKidModal);
    document.getElementById('cancelKidBtn')?.addEventListener('click', hideAddKidModal);
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
        btn.innerHTML = 'Filtres appliqués';
        btn.style.background = 'var(--primary-teal)';

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
            <div class="profile-avatar" style="background: linear-gradient(135deg, ${getRandomColor()}, ${getRandomColor()})"></div>
            <p class="profile-name">${kid.name}</p>
        `;
        profileSelector.appendChild(profileCard);
    });

    // Add "Add Profile" button
    const addBtn = document.createElement('div');
    addBtn.className = 'add-profile-btn';
    addBtn.onclick = showAddKidModal;
    addBtn.innerHTML = `
        <div class="add-icon">+</div>
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
            <div class="thumb" style="background: linear-gradient(45deg, ${getRandomColor()}, #333)"></div>
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
