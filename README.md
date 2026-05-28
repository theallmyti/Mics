# Mics

Mics is a web-based music player interface built with vanilla HTML, CSS, and JavaScript. It replicates the core layout and functionality of a modern music streaming application and allows users to search for and play full music tracks directly in the browser.

## How It Works

The application operates as a static frontend that interfaces with a custom backend and the YouTube IFrame Player API to bypass preview limitations and stream full-length audio tracks.

### Architecture and Data Flow
1. **User Interface:** The layout is constructed using standard HTML5 and styled with a custom CSS file to mimic a popular music streaming service. Font Awesome is utilized for icons.
2. **Search Functionality:** When a user enters a search query and submits it, the JavaScript application intercepts the request and communicates with a custom backend API. The backend returns metadata including the track title, artist name, and a YouTube thumbnail URL.
3. **Audio Playback:** Instead of relying on restricted audio streams, the application extracts the YouTube Video ID directly from the thumbnail URL. It then uses the official YouTube IFrame Player API in a hidden container to stream the full, high-quality audio natively.
4. **Controls:** The application includes custom event listeners for play/pause toggle, volume adjustment, and seeking within the audio track. The progress bar updates in real-time as the audio plays, driven by the YouTube Player's internal state.

## Features

* **Full Song Playback:** Bypasses standard 30-second API limitations by leveraging the YouTube Player API for full track streaming.
* **Search Integration:** Fetches live song metadata via a custom search backend.
* **Audio Controls:** Includes a fully functional playbar with play/pause, seek, and volume control mechanisms that control the hidden YouTube player.
* **Dynamic UI:** Automatically updates album art, track titles, and artist names without requiring a page reload.
* **Obfuscated API Configuration:** The backend API endpoint is obfuscated using base64 encoding to prevent plaintext exposure in public repositories like GitHub Pages.

## Local Development

Due to strict origin policies enforced by the YouTube IFrame Player API, running this project directly from the file system (file:// protocol) will result in playback errors. 

To run this project locally, you must serve it over an HTTP server. For example:
`python -m http.server 8080` or `npx http-server`
Then navigate to `http://localhost:8080` in your browser.

## Technical Stack

* HTML5
* CSS3
* Vanilla JavaScript
* YouTube IFrame Player API
* Custom Search API
