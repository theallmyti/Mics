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

// YouTube Player Variables
let ytPlayer;
let ytPlayerReady = false;
let ytDuration = 0;
let progressInterval;

// --- Functions ---

// Global callback for YouTube IFrame API
window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
};

function onPlayerReady(event) {
    ytPlayerReady = true;
    ytPlayer.setVolume(volumeSlider.value * 100);
}

function updateProgress() {
    if (ytPlayer && ytPlayer.getCurrentTime) {
        const currentTime = ytPlayer.getCurrentTime();
        const percent = (currentTime / ytDuration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTimeEl.innerText = formatTime(currentTime);
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        playPauseBtn.classList.remove('fa-play-circle');
        playPauseBtn.classList.add('fa-pause-circle');
        
        ytDuration = ytPlayer.getDuration();
        totalDurationEl.innerText = formatTime(ytDuration);
        
        if (!progressInterval) {
            progressInterval = setInterval(updateProgress, 1000);
        }
    } else {
        playPauseBtn.classList.remove('fa-pause-circle');
        playPauseBtn.classList.add('fa-play-circle');
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    if (event.data === YT.PlayerState.ENDED) {
        progressBar.style.width = '0%';
        currentTimeEl.innerText = "0:00";
    }
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    
    // Add specific error messages for better debugging
    let errorMsg = 'An error occurred during playback.';
    if (event.data === 101 || event.data === 150) {
        errorMsg = 'The owner of this song does not allow it to be played outside of YouTube (embedding disabled).';
    } else if (event.data === 2) {
        errorMsg = 'Invalid video ID.';
    } else if (event.data === 5) {
        errorMsg = 'HTML5 player error.';
    }
    
    alert(`${errorMsg} (Error Code: ${event.data})\n\nNote: If you are opening this file locally (file://), try hosting it on GitHub Pages or running a local server, as YouTube blocks local file playbacks.`);
    loadingSpinner.classList.add('hidden');
    welcomeMessage.classList.remove('hidden');
}

function formatTime(seconds) {
    if (isNaN(seconds) || !seconds) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

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

function togglePlay() {
    if (!ytPlayer || !ytPlayerReady) return;
    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
    } else {
        ytPlayer.playVideo();
    }
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Show loading state
    welcomeMessage.classList.add('hidden');
    songInfoLarge.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');

    try {
        // Obfuscated custom backend URL
        const apiUrl = atob('aHR0cHM6Ly9wZW8udGFpbDYzMDU5NC50cy5uZXQvYXBpL3NlYXJjaD9xdWVyeT0=');
        const response = await fetch(`${apiUrl}${encodeURIComponent(query)}`);
        const result = await response.json();

        if (result.status === 'success') {
            const songData = result.data;
            
            // Extract YouTube ID from thumbnail (e.g., https://i.ytimg.com/vi/6zDfwVSvyEk/maxresdefault.jpg)
            const match = songData.thumbnail.match(/\/vi\/([a-zA-Z0-9_-]+)\//);
            const videoId = match ? match[1] : null;

            if (videoId && ytPlayerReady) {
                ytPlayer.loadVideoById(videoId);
                updateUI(songData);
            } else {
                alert('Invalid song data or player not ready.');
                loadingSpinner.classList.add('hidden');
                welcomeMessage.classList.remove('hidden');
            }
        } else {
            alert('Song not found or error in search.');
            loadingSpinner.classList.add('hidden');
            welcomeMessage.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to connect to the backend server. Please check your connection.');
        loadingSpinner.classList.add('hidden');
        welcomeMessage.classList.remove('hidden');
    }
}

// --- Event Listeners ---
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});
playPauseBtn.addEventListener('click', togglePlay);
progressBarContainer.addEventListener('click', (e) => {
    if (!ytPlayer || !ytPlayerReady || !ytDuration) return;
    const width = progressBarContainer.clientWidth;
    const clickX = e.offsetX;
    const seekToTime = (clickX / width) * ytDuration;
    ytPlayer.seekTo(seekToTime, true);
    updateProgress();
});
volumeSlider.addEventListener('input', (e) => {
    if (ytPlayer && ytPlayerReady) {
        ytPlayer.setVolume(e.target.value * 100);
    }
});
