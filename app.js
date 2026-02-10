// ===== APP STATE =====
const STORAGE_KEY = 'cartoonia_app_state';

let appState = {
    parentName: '',
    kids: [],
    selectedKid: null,
    currentMode: null, // 'parent' or 'kid'
    parentControls: {
        watchTimeLimit: 60, // minutes
        videoLimit: 5,
        filters: {
            maxAge: 6,
            blockedScenes: [],
            platforms: ['youtube']
        }
    },
    // Old legacy state for backward compatibility/reference
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
            const parsed = JSON.parse(saved);
            // Merge with default state to ensure new fields exist
            appState = { ...appState, ...parsed };
            // Ensure parentControls exists if loading old state
            if (!appState.parentControls) {
                appState.parentControls = {
                    watchTimeLimit: 60,
                    videoLimit: 5,
                    filters: { maxAge: 6, blockedScenes: [], platforms: ['youtube'] }
                };
            }
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
        // We have users, go to mode selection
        navigateToScreen('mode-selection-screen');
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
            navigateToScreen('mode-selection-screen');
        } else {
            alert('Veuillez ajouter au moins un enfant');
        }
    });

    // Mode Selection
    document.getElementById('modeParentBtn')?.addEventListener('click', () => {
        appState.currentMode = 'parent';
        updateParentDashboard();
        navigateToScreen('parent-dashboard-screen');
    });

    document.getElementById('modeKidBtn')?.addEventListener('click', () => {
        appState.currentMode = 'kid';
        navigateToScreen('home-screen');
        updateHomeScreen(); // Show profile selector
    });

    // Parent Dashboard Controls
    initParentControls();

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

    // Filter screen logic (Legacy/Individual)
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
        });
    });

    const ageSlider = document.getElementById('ageSlider');
    const ageValue = document.getElementById('ageValue');
    if (ageSlider && ageValue) {
        ageSlider.addEventListener('input', (e) => {
            ageValue.textContent = e.target.value + ' ans';
        });
    }

    // Voice Chat Logic
    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) {
        recordBtn.addEventListener('mousedown', startRecording);
        recordBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
        recordBtn.addEventListener('mouseup', stopRecording);
        recordBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(); });
    }

    // Settings button (Reset)
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        // In simplified kid mode, this button might be hidden or password protected in real app
        // For now, let's make it go back to mode selection
        navigateToScreen('mode-selection-screen');
    });
}

// ===== KID MANAGEMENT =====
function showAddKidModal() {
    document.getElementById('addKidModal').style.display = 'flex';
    populateAvatarGrid();
}

function hideAddKidModal() {
    document.getElementById('addKidModal').style.display = 'none';
    document.getElementById('kidNameInput').value = '';
    document.getElementById('kidAgeInput').value = '';
    // Reset avatar selection
    document.getElementById('selectedAvatarInput').value = 'avatar_1';
    const avatars = document.querySelectorAll('.avatar-item');
    avatars.forEach(a => a.classList.remove('selected'));
    if (avatars.length > 0) avatars[0].classList.add('selected');
}

function populateAvatarGrid() {
    const grid = document.getElementById('avatarGrid');
    grid.innerHTML = '';
    const avatarCount = 8; // Number of supported avatars

    for (let i = 1; i <= avatarCount; i++) {
        const avatarId = `avatar_${i}`;
        const item = document.createElement('div');
        item.className = `avatar-item ${i === 1 ? 'selected' : ''}`;
        item.dataset.avatar = avatarId;
        item.innerHTML = `<img src="assets/avatars/${avatarId}.png" alt="Avatar" onerror="this.src='assets/icons/profile_overlay.png'">`;

        item.addEventListener('click', () => {
            document.querySelectorAll('.avatar-item').forEach(a => a.classList.remove('selected'));
            item.classList.add('selected');
            document.getElementById('selectedAvatarInput').value = avatarId;
        });

        grid.appendChild(item);
    }
}

function addKid() {
    const name = document.getElementById('kidNameInput').value.trim();
    const age = parseInt(document.getElementById('kidAgeInput').value);
    const avatarId = document.getElementById('selectedAvatarInput').value;

    if (name && age > 0 && age <= 12) {
        const kid = {
            id: Date.now(),
            name: name,
            age: age,
            avatar: avatarId,
            videosWatched: 0,
            storiesCreated: 0,
            timeSpent: 0
        };

        appState.kids.push(kid);
        saveState(); // Persist new kid
        updateKidsList();
        hideAddKidModal();

        // If added from dashboard, refresh selector
        if (appState.currentMode === 'parent') {
            updateParentDashboard();
        }
    } else {
        alert('Nom et âge valides requis');
    }
}

function updateKidsList() {
    const kidsList = document.getElementById('kidsList');
    if (!kidsList) return; // Might not exist on all screens if logic changes
    kidsList.innerHTML = '';

    appState.kids.forEach(kid => {
        const kidCard = document.createElement('div');
        kidCard.className = 'profile-card';
        kidCard.style.flexDirection = 'row';
        kidCard.style.padding = '10px';
        kidCard.style.marginBottom = '10px';

        const avatarSrc = kid.avatar ? `assets/avatars/${kid.avatar}.png` : 'assets/icons/profile_overlay.png';

        kidCard.innerHTML = `
            <div class="profile-avatar" style="width: 40px; height: 40px; border-width: 2px; margin-bottom: 0; background-color: var(--primary-orange);">
                 <img src="${avatarSrc}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.src='assets/icons/profile_overlay.png'">
            </div>
            <div style="margin-left: 10px; flex: 1; text-align: left;">
                <div class="profile-name">${kid.name}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${kid.age} ans</div>
            </div>
        `;
        kidsList.appendChild(kidCard);
    });
}

// ===== PARENT DASHBOARD LOGIC =====
function initParentControls() {
    // Populate Kid Selector
    const kidSelect = document.getElementById('parentKidSelector');

    // Add Kid Button (Dashboard)
    document.getElementById('addKidFromDashBtn')?.addEventListener('click', showAddKidModal);

    // Time Slider
    const timeSlider = document.getElementById('timeLimitSlider');
    const timeValue = document.getElementById('timeLimitValue');

    timeSlider?.addEventListener('input', (e) => {
        const val = e.target.value;
        const hours = Math.floor(val / 60);
        const mins = val % 60;
        timeValue.textContent = `${hours}h ${mins.toString().padStart(2, '0')}min`;
        appState.parentControls.watchTimeLimit = parseInt(val);
    });

    // Age Slider
    const ageSlider = document.getElementById('parentAgeSlider');
    const ageValue = document.getElementById('parentAgeValue');

    ageSlider?.addEventListener('input', (e) => {
        ageValue.textContent = e.target.value + ' ans';
        appState.parentControls.filters.maxAge = parseInt(e.target.value);
    });

    // Valid Counters
    const vidMinus = document.getElementById('videoLimitMinus');
    const vidPlus = document.getElementById('videoLimitPlus');
    const vidValue = document.getElementById('videoLimitValue');

    vidMinus?.addEventListener('click', () => {
        let val = parseInt(vidValue.textContent);
        if (val > 1) {
            val--;
            vidValue.textContent = val;
            appState.parentControls.videoLimit = val;
        }
    });

    vidPlus?.addEventListener('click', () => {
        let val = parseInt(vidValue.textContent);
        if (val < 20) {
            val++;
            vidValue.textContent = val;
            appState.parentControls.videoLimit = val;
        }
    });

    // Filter Chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
            const filter = chip.getAttribute('data-filter');
            const index = appState.parentControls.filters.blockedScenes.indexOf(filter);

            if (chip.classList.contains('active')) {
                if (index === -1) appState.parentControls.filters.blockedScenes.push(filter);
            } else {
                if (index > -1) appState.parentControls.filters.blockedScenes.splice(index, 1);
            }
        });
    });

    // Save Button
    document.getElementById('saveParentSettingsBtn')?.addEventListener('click', () => {
        const btn = document.getElementById('saveParentSettingsBtn');
        const originalText = btn.textContent;

        btn.textContent = 'Enregistré !';
        btn.style.background = 'var(--primary-teal)';

        saveState();

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'var(--primary-orange)';
        }, 1500);
    });
}

function updateParentDashboard() {
    const kidSelect = document.getElementById('parentKidSelector');
    if (kidSelect) {
        kidSelect.innerHTML = appState.kids.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
    }

    // Restore values from state (simplified: applying same settings to all for now)
    document.getElementById('timeLimitSlider').value = appState.parentControls.watchTimeLimit;
    // Trigger input event to update text
    document.getElementById('timeLimitSlider').dispatchEvent(new Event('input'));

    document.getElementById('parentAgeSlider').value = appState.parentControls.filters.maxAge;
    document.getElementById('parentAgeSlider').dispatchEvent(new Event('input'));

    document.getElementById('videoLimitValue').textContent = appState.parentControls.videoLimit;
}

// ===== HOME SCREEN (KID MODE) =====
function updateHomeScreen() {
    const greeting = document.getElementById('parentGreeting');
    greeting.textContent = `Bonjour, qui regarde ?`;

    const profileSelector = document.getElementById('profileSelector');
    profileSelector.innerHTML = '';

    appState.kids.forEach(kid => {
        const profileCard = document.createElement('div');
        profileCard.className = 'profile-card';
        profileCard.onclick = () => selectKid(kid.id);

        const avatarSrc = kid.avatar ? `assets/avatars/${kid.avatar}.png` : 'assets/icons/profile_overlay.png';

        profileCard.innerHTML = `
            <div class="profile-avatar" style="position: relative; display: flex; align-items: center; justify-content: center; background-color: var(--card-color); border: 2px solid var(--primary-orange);">
                <img src="${avatarSrc}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.src='assets/icons/profile_overlay.png'">
            </div>
            <p class="profile-name">${kid.name}</p>
        `;
        profileSelector.appendChild(profileCard);
    });
}


function getRandomColor() {
    const colors = ['#FF8A4C', '#4ECDC4', '#FF6B6B', '#6B66FF', '#FFB84C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function selectKid(kidId) {
    const kid = appState.kids.find(k => k.id === kidId);
    if (kid) {
        appState.selectedKid = kid;

        // Custom Kid View Logic
        // In the new simplified mode, we hide stats and simplify actions
        const statsRow = document.querySelector('.stats-row');
        if (statsRow) statsRow.style.display = 'none'; // Hide stats for cleaner look

        // Update name and avatar in dashboard header
        document.getElementById('dashName').textContent = kid.name;
        const avatarSrc = kid.avatar ? `assets/avatars/${kid.avatar}.png` : 'assets/icons/profile_overlay.png';
        document.getElementById('dashAvatar').style.backgroundImage = `url('${avatarSrc}')`;
        document.getElementById('dashAvatar').style.backgroundSize = 'cover';

        // Update Actions - Only Show 2 Options
        const actionsContainer = document.querySelector('.dashboard-actions');
        actionsContainer.innerHTML = `
            <div class="dash-action-card" data-screen="youtube-screen" style="background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%); border: none;">
                <div class="action-info">
                    <h3 style="color: #000; font-size: 20px;">Regarder des vidéos</h3>
                    <p style="color: rgba(0,0,0,0.6);">Dessins animés & chansons</p>
                </div>
                <div class="icon-box" style="background: rgba(255,255,255,0.4);">
                    <img src="assets/icons/play_overlay.png" alt="Watch" style="width: 28px; height: 28px; filter: brightness(0);">
                </div>
            </div>

            <div class="dash-action-card" data-screen="generate-screen" style="background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); border: none;">
                <div class="action-info">
                    <h3 style="color: #000; font-size: 20px;">Parler à l'ami IA</h3>
                    <p style="color: rgba(0,0,0,0.6);">Pose tes questions !</p>
                </div>
                <div class="icon-box" style="background: rgba(255,255,255,0.4);">
                    <img src="assets/icons/microphone.png" alt="Voice" style="width: 28px; height: 28px; filter: brightness(0);">
                </div>
            </div>
        `;

        // Re-attach listeners to new elements
        actionsContainer.querySelectorAll('.dash-action-card').forEach(card => {
            card.addEventListener('click', () => {
                const targetScreen = card.getAttribute('data-screen');
                navigateToScreen(targetScreen);
            });
        });

        navigateToScreen('profile-screen');
    }
}

function updateScreenForSelectedKid(screenId) {
    if (!appState.selectedKid) return;
    // Additional logic if needed when entering screens
}

// ===== VOICE CHAT FUNCTIONALITY =====
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

async function startRecording() {
    if (isRecording) return;
    if (!window.isSecureContext && location.hostname !== 'localhost') {
        alert("Microphone requires HTTPS"); return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            addVoiceMessage(audioUrl, 'user');
            setTimeout(() => {
                addChatMessage(getRandomAIResponse(), 'ai');
            }, 1500);
        };

        mediaRecorder.start();
        isRecording = true;
        updateRecordingUI(true);
    } catch (err) {
        console.error('Mic Error:', err);
        alert('Erreur micro: ' + err.message);
    }
}

function stopRecording() {
    if (!isRecording || !mediaRecorder) return;
    mediaRecorder.stop();
    isRecording = false;
    updateRecordingUI(false);
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
}

function updateRecordingUI(recording) {
    const btn = document.getElementById('recordBtn');
    const status = document.getElementById('recordingStatus');
    const waveform = document.getElementById('waveform'); // Add logic if element exists

    if (recording) {
        btn.classList.add('recording');
        status.textContent = 'Enregistrement...';
        if (waveform) waveform.classList.add('active');
    } else {
        btn.classList.remove('recording');
        status.textContent = 'Appuie pour parler';
        if (waveform) waveform.classList.remove('active');
    }
}

function addVoiceMessage(audioUrl, type) {
    const chatArea = document.getElementById('chatArea');
    const msg = document.createElement('div');
    msg.className = `msg ${type} audio-msg`;
    const audioId = 'audio_' + Date.now();
    msg.innerHTML = `<button class="audio-control-btn" onclick="playAudio('${audioId}', '${audioUrl}', this)">▶</button><audio id="${audioId}" src="${audioUrl}"></audio>`;
    chatArea.appendChild(msg);
    chatArea.scrollTop = chatArea.scrollHeight;
}

window.playAudio = function (id, url, btn) {
    const audio = document.getElementById(id);
    if (audio.paused) {
        document.querySelectorAll('audio').forEach(a => a.pause());
        audio.play();
        btn.textContent = '⏸';
        audio.onended = () => btn.textContent = '▶';
    } else {
        audio.pause();
        btn.textContent = '▶';
    }
};

function addChatMessage(message, type) {
    const chatArea = document.getElementById('chatArea');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.textContent = message;
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function getRandomAIResponse() {
    const responses = [
        "C'est super intéressant ! Raconte-m'en plus !",
        "Waouh ! Tu as une très belle voix !",
        "Je suis d'accord avec toi.",
        "C'est génial !",
        "Tu es très intelligent !"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ===== VIDEO CONTENT (YOUTUBE API) =====
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

async function fetchVideos(query) {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px;">Chargement...</div>';

    if (!CONFIG.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY.includes('YOUR_API_KEY')) {
        setTimeout(() => renderVideos(getDummyVideos(query)), 500);
        return;
    }

    try {
        const response = await fetch(`${YOUTUBE_API_BASE_URL}?part=snippet&maxResults=${appState.parentControls.videoLimit || 10}&q=${encodeURIComponent(query)}&type=video&safeSearch=strict&key=${CONFIG.YOUTUBE_API_KEY}`);
        const data = await response.json();
        if (data.items) renderVideos(data.items);
        else console.error('API Error', data);
    } catch (error) {
        console.error('Fetch Error', error);
        renderVideos(getDummyVideos(query)); // Fallback
    }
}

function renderVideos(videos) {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '';

    videos.forEach(video => {
        const videoId = video.id.videoId || video.id;
        const thumbnail = video.snippet.thumbnails.medium.url;

        const item = document.createElement('div');
        item.className = 'video-item';
        item.onclick = () => playVideo(videoId);
        item.innerHTML = `
            <div class="thumb" style="background-image: url('${thumbnail}'); background-size: cover; height: 120px;"></div>
            <div class="vid-info">
                <div class="vid-title">${video.snippet.title}</div>
            </div>
        `;
        videoGrid.appendChild(item);
    });
}

function getDummyVideos(query) {
    return [
        { id: 'dQw4w9WgXcQ', snippet: { title: 'Rick Astley - Never Gonna Give You Up', thumbnails: { medium: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' } } } },
        { id: 'L_jWHffIx5E', snippet: { title: 'Happy Pharell Williams', thumbnails: { medium: { url: 'https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg' } } } },
        { id: 'C0DPdy98e4c', snippet: { title: 'Test Video: ' + query, thumbnails: { medium: { url: 'https://img.youtube.com/vi/C0DPdy98e4c/mqdefault.jpg' } } } }
    ];
}

function playVideo(videoId) {
    const modal = document.getElementById('videoPlayerModal');
    const iframe = document.getElementById('youtubePlayer');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    modal.classList.add('active');
}

document.getElementById('closeVideoBtn')?.addEventListener('click', () => {
    document.getElementById('videoPlayerModal').classList.remove('active');
    document.getElementById('youtubePlayer').src = '';
});

// Category Tabs
const categories = {
    'Pour toi': 'dessin animé pour enfants',
    'Dessins animés': 'cartoons for kids',
    'Éducatif': 'educational videos for kids science nature',
    'Musique': 'kids songs nursery rhymes'
};

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fetchVideos(categories[btn.textContent] || 'cartoons');
    });
});

