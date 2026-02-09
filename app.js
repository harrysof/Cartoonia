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
        fetchVideos('dessin animé pour enfants');
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

    // Generate screen logic (Now Voice Chat)
    const recordBtn = document.getElementById('recordBtn');

    if (recordBtn) {
        recordBtn.addEventListener('mousedown', startRecording);
        recordBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
        recordBtn.addEventListener('mouseup', stopRecording);
        recordBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(); });
    }

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

// ===== VOICE CHAT FUNCTIONALITY =====
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

async function startRecording() {
    if (isRecording) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            addVoiceMessage(audioUrl, 'user');

            // AI Response
            setTimeout(() => {
                const randomResponse = getRandomAIResponse();
                addChatMessage(randomResponse, 'ai');
            }, 1500);
        };

        mediaRecorder.start();
        isRecording = true;
        updateRecordingUI(true);
    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Impossible d\'accéder au micro. Vérifiez les permissions.');
    }
}

function stopRecording() {
    if (!isRecording || !mediaRecorder) return;

    mediaRecorder.stop();
    isRecording = false;
    updateRecordingUI(false);

    // Stop all tracks to release mic
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
}

function updateRecordingUI(recording) {
    const btn = document.getElementById('recordBtn');
    const status = document.getElementById('recordingStatus');
    const waveform = document.getElementById('waveform');

    if (recording) {
        btn.classList.add('recording');
        status.textContent = 'Enregistrement... (Relâche pour envoyer)';
        waveform.classList.add('active');
    } else {
        btn.classList.remove('recording');
        status.textContent = 'Appuie pour parler';
        waveform.classList.remove('active');
    }
}

function addVoiceMessage(audioUrl, type) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `msg ${type} audio-msg`;

    // Unique ID for this audio player
    const audioId = 'audio_' + Date.now();

    messageDiv.innerHTML = `
        <button class="audio-control-btn" onclick="playAudio('${audioId}', '${audioUrl}', this)">
            <img src="assets/icons/play_overlay.png" style="width: 14px; height: 14px;">
        </button>
        <div class="audio-wave"></div>
        <audio id="${audioId}" src="${audioUrl}"></audio>
    `;

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

window.playAudio = function (audioId, url, btn) {
    const audio = document.getElementById(audioId);
    const icon = btn.querySelector('img');

    if (audio.paused) {
        // Stop all other audios
        document.querySelectorAll('audio').forEach(a => {
            if (a.id !== audioId) {
                a.pause();
                a.currentTime = 0;
                // Reset other buttons if needed (would need more complex logic/state)
            }
        });

        audio.play();
        // Change icon to pause (if we had one, or just keep play to restart)
        // For simplicity:
        btn.style.background = 'var(--primary-orange)';

        audio.onended = () => {
            btn.style.background = 'rgba(255,255,255,0.2)';
        };
    } else {
        audio.pause();
        btn.style.background = 'rgba(255,255,255,0.2)';
    }
};

function addChatMessage(message, type) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `msg ${type}`;
    messageDiv.textContent = message;

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function getRandomAIResponse() {
    const responses = [
        "C'est super intéressant ! Raconte-m'en plus !",
        "Waouh ! Tu as une très belle voix !",
        "Hahaha, c'est très drôle !",
        "Je suis d'accord avec toi.",
        "Est-ce que tu peux répéter ?",
        "C'est génial !",
        "Tu es très intelligent !",
        "J'aime beaucoup parler avec toi."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// ===== VIDEO CONTENT (YOUTUBE API) =====
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

async function fetchVideos(query) {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Chargement...</div>';

    if (!CONFIG.YOUTUBE_API_KEY || CONFIG.YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
        // Fallback for demo if no key provided
        console.warn('No API Key provided. Using dummy data.');
        setTimeout(() => renderVideos(getDummyVideos(query)), 500);
        return;
    }

    try {
        const response = await fetch(`${YOUTUBE_API_BASE_URL}?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&safeSearch=strict&key=${CONFIG.YOUTUBE_API_KEY}`);
        const data = await response.json();

        if (data.items) {
            renderVideos(data.items);
        } else {
            console.error('API Error:', data);
            videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--primary-orange);">Erreur de chargement. Vérifiez la clé API.</div>';
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--primary-orange);">Erreur de connexion.</div>';
    }
}

function renderVideos(videos) {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '';

    videos.forEach(video => {
        const videoId = video.id.videoId || video.id; // Handle API vs Dummy format
        const title = video.snippet.title;
        const thumbnail = video.snippet.thumbnails.medium.url;
        const channelTitle = video.snippet.channelTitle;

        const item = document.createElement('div');
        item.className = 'video-item';
        item.onclick = () => playVideo(videoId);
        item.innerHTML = `
            <div class="thumb" style="background-image: url('${thumbnail}'); background-size: cover; background-position: center; position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="background: rgba(0,0,0,0.5); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
                    <img src="assets/icons/play_overlay.png" alt="Play" style="width: 24px; height: 24px;">
                </div>
            </div>
            <div class="vid-info">
                <div class="vid-title">${title}</div>
                <div class="vid-meta">${channelTitle}</div>
            </div>
        `;
        videoGrid.appendChild(item);
    });
}

function getDummyVideos(query) {
    // Fallback data
    return [
        { id: 'dQw4w9WgXcQ', snippet: { title: 'Rick Astley - Never Gonna Give You Up', channelTitle: 'Official Rick Astley', thumbnails: { medium: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' } } } },
        { id: 'C0DPdy98e4c', snippet: { title: 'TEST VIDEO: ' + query, channelTitle: 'Test Channel', thumbnails: { medium: { url: 'https://img.youtube.com/vi/C0DPdy98e4c/mqdefault.jpg' } } } },
        { id: 'L_jWHffIx5E', snippet: { title: 'Happy Pharell Williams', channelTitle: 'Pharell', thumbnails: { medium: { url: 'https://img.youtube.com/vi/L_jWHffIx5E/mqdefault.jpg' } } } }
    ];
}

function playVideo(videoId) {
    if (!videoId) return;

    console.log('Playing video:', videoId);
    const modal = document.getElementById('videoPlayerModal');
    const iframe = document.getElementById('youtubePlayer');

    // Attempt to get a valid origin for the YouTube API
    // Local files often have 'null' or 'file://' origins which can cause Error 153
    const origin = window.location.origin === 'null' ? window.location.href.split('/')[0] + '//' + window.location.hostname : window.location.origin;

    // Use a clean URL with standard parameters for better compatibility
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&origin=${encodeURIComponent(origin)}`;

    iframe.src = embedUrl;
    modal.classList.add('active');
}

function closeVideo() {
    const modal = document.getElementById('videoPlayerModal');
    const iframe = document.getElementById('youtubePlayer');
    iframe.src = ''; // Stop video
    modal.classList.remove('active');
}

// Initialize videos with default category
fetchVideos('dessin animé pour enfants');

// Tab handling
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

        const categoryName = btn.textContent;
        const query = categories[categoryName] || 'cartoons for kids';
        fetchVideos(query);
    });
});

// Video Modal Event Listeners
document.getElementById('closeVideoBtn')?.addEventListener('click', closeVideo);
document.getElementById('videoPlayerModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'videoPlayerModal') closeVideo();
});

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
