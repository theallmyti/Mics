// Initialize the native HTML5 Audio object
const audio = new Audio();

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loadingSpinner = document.getElementById('loading-spinner');
const songInfoLarge = document.getElementById('song-info-large');
const welcomeMessage = document.getElementById('welcome-message');

const largeThumbnail = document.getElementById('large-thumbnail');
const largeTitle = document.getElementById('large-title');
const largeArtist = document.getElementById('large-artist');

const smallThumbnail = document.getElementById('small-thumbnail');
const smallTitle = document.getElementById('small-title');
const smallArtist = document.getElementById('small-artist');

const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.getElementById('progress-bar-container');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume-slider');

// --- Functions ---

/**
 * Formats seconds into MM:SS format
 * @param {number} seconds 
 * @returns {string}
 */
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

/**
 * Updates the UI with new song data
 * @param {object} data 
 */
function updateUI(data) {
    // Large view
    largeThumbnail.src = data.thumbnail;
    largeTitle.innerText = data.title;
    largeArtist.innerText = data.artist || "Local Artist";
    
    // Small view (playbar)
    smallThumbnail.src = data.thumbnail;
    smallTitle.innerText = data.title;
    smallArtist.innerText = data.artist || "Local Artist";

    // Show/Hide sections
    welcomeMessage.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    songInfoLarge.classList.remove('hidden');

    // Reset progress
    progressBar.style.width = '0%';
    currentTimeEl.innerText = "0:00";
    totalDurationEl.innerText = formatTime(data.duration);
}

/**
 * Toggles play/pause state
 */
function togglePlay() {
    if (audio.paused) {
        audio.play();
        playPauseBtn.classList.remove('fa-play-circle');
        playPauseBtn.classList.add('fa-pause-circle');
    } else {
        audio.pause();
        playPauseBtn.classList.remove('fa-pause-circle');
        playPauseBtn.classList.add('fa-play-circle');
    }
}

/**
 * Performs song search via backend API
 */
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Show loading state
    welcomeMessage.classList.add('hidden');
    songInfoLarge.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`);
        const result = await response.json();

        if (result.resultCount > 0) {
            const track = result.results[0];
            const songData = {
                title: track.trackName,
                artist: track.artistName,
                thumbnail: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '600x600bb') : '',
                duration: track.trackTimeMillis ? track.trackTimeMillis / 1000 : 0,
                audio_url: track.previewUrl
            };
            console.log('Song data received:', songData);
            
            // Set audio source
            audio.src = songData.audio_url;
            audio.load(); // Explicitly load the new source

            // Attempt to play and handle the promise
            audio.play().then(() => {
                console.log('Playback started successfully');
                playPauseBtn.classList.remove('fa-play-circle');
                playPauseBtn.classList.add('fa-pause-circle');
            }).catch(error => {
                console.error('Playback failed:', error);
                alert('Playback failed. This might be due to browser autoplay restrictions or an invalid audio format. Click the Play button to try manually.');
                playPauseBtn.classList.remove('fa-pause-circle');
                playPauseBtn.classList.add('fa-play-circle');
            });

            // Update UI
            updateUI(songData);
        } else {
            alert('Song not found or error in search.');
            loadingSpinner.classList.add('hidden');
            welcomeMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to connect to the live backend server. Please check your connection.');
        loadingSpinner.classList.add('hidden');
        welcomeMessage.classList.remove('hidden');
    }
}

// --- Event Listeners ---

// Search on Button Click
searchButton.addEventListener('click', performSearch);

// Search on Enter Key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Play/Pause Toggle
playPauseBtn.addEventListener('click', togglePlay);

// Audio Time Update
audio.addEventListener('timeupdate', () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${percent}%`;
    currentTimeEl.innerText = formatTime(audio.currentTime);
});

// Audio Loaded Metadata (to get duration if not provided or to sync)
audio.addEventListener('loadedmetadata', () => {
    totalDurationEl.innerText = formatTime(audio.duration);
});

// Seek Progress
progressBarContainer.addEventListener('click', (e) => {
    const width = progressBarContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if (duration) {
        audio.currentTime = (clickX / width) * duration;
    }
});

// Volume Control
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
});

// Auto-reset when song ends
audio.addEventListener('ended', () => {
    playPauseBtn.classList.remove('fa-pause-circle');
    playPauseBtn.classList.add('fa-play-circle');
    progressBar.style.width = '0%';
});

// Handle audio errors
audio.addEventListener('error', (e) => {
    console.error('Audio Error Details:', audio.error);
    let message = 'An error occurred during audio playback.';
    if (audio.error.code === 4) message = 'The audio format is not supported or the source is invalid.';
    else if (audio.error.code === 2) message = 'Network error while loading audio.';
    alert(message);
    loadingSpinner.classList.add('hidden');
    welcomeMessage.classList.remove('hidden');
});
