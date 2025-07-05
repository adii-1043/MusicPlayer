let music_duration;
let divisions_moved_per_second;
let cur_duration = 0;
let intervalId;
let startTime = null;
let searchController; // controller for search query bugs

const filled = "fa-solid fa-heart";
const unfilled = "fa-regular fa-heart";

const current_audio = document.getElementById("current-audio");
const current_song_name = document.querySelector(".song_name")
const current_song_artist = document.querySelector(".song_artist");

const progress_fill = document.querySelector(".progress_fill");
const pause_play = document.getElementById("pause_play");
const backward = document.getElementById("backward");
const forward = document.getElementById("forward");
const PLAY = "▶";
const PAUSE = "||";
const timestamp = document.querySelector(".timestamp h1");

const cover_art = document.querySelector(".cover_art img");

const upvote_button = document.getElementById("upvote-button");
const search_button = document.querySelector(".search-button");
const div_song_search = document.querySelector(".song-search");
const search_text = document.querySelector(".search-text");
const div_search_results = document.querySelector(".search-results");

cover_art.classList.add("paused");

// Wait for audio metadata to load
current_audio.addEventListener("loadedmetadata", () => {
    music_duration = current_audio.duration;
    divisions_moved_per_second = parseFloat((100 / music_duration).toFixed(10));
    setupControls();
});

upvote_button.addEventListener("click", () => {
    const num_upvotes = document.querySelector(".upvotes");
    num_upvotes.textContent = parseInt(num_upvotes.textContent) + 1;
    if (upvote_button.className == filled){
        upvote_button.className = unfilled;
    }
    else{
        upvote_button.className = filled;
    }
    
})

search_button.addEventListener("click", () => {
    const isActive = div_song_search.classList.contains("active");

    if (isActive){
        div_song_search.classList.remove("active");
        div_song_search.classList.remove("expanded");

        search_button.querySelector("i").classList.replace("fa-minus", "fa-plus");
    }
    else{
        div_song_search.classList.add("active");

        search_button.querySelector("i").classList.replace("fa-plus", "fa-minus");
    }
    
})

function playNextSong() {
    const nextSongDiv = document.querySelector(".queue > div:nth-child(5)");
    if (!nextSongDiv) {
        console.log("Queue is empty, no next song.");
        current_audio.pause();
        pause_play.textContent = PLAY;
        cover_art.classList.add("paused");
        cover_art.style.filter = "brightness(50%)";
        return;
    }

    const songAudio = nextSongDiv.querySelector("audio");
    const trackName = nextSongDiv.querySelector(".title").textContent;
    const artistName = nextSongDiv.querySelector(".artist").textContent;
    const bgImage = nextSongDiv.querySelector(".background-img").style.backgroundImage;

    // Set the audio src
    current_audio.src = songAudio.src;

    current_audio.addEventListener("loadedmetadata", function onLoaded() {
        music_duration = current_audio.duration;
        divisions_moved_per_second = parseFloat((100 / music_duration).toFixed(10));

        resetMusic();

        // Update UI
        current_song_name.textContent = trackName;
        current_song_artist.textContent = artistName;
        cover_art.src = extractImageUrl(bgImage);

        // Remove event listener to prevent duplicate triggers
        current_audio.removeEventListener("loadedmetadata", onLoaded);
    });

    const prev_song = document.querySelector(".queue > div:nth-child(4)");
    prev_song.remove();
}

// Helper to clean background-image url
function extractImageUrl(bgImage) {
    return bgImage.slice(5, -2); // removes url(" and ") from CSS background-image
}


function resumeMusic() {
    const now = Date.now();
    const elapsedSeconds = (now - startTime) / 1000;
    const progressPercent = Math.min((elapsedSeconds / music_duration) * 100, 100);

    progress_fill.style.width = progressPercent.toFixed(10) + "%";

    const currentSeconds = Math.floor(elapsedSeconds);
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = currentSeconds % 60;
    timestamp.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (progressPercent >= 100) {
        clearInterval(intervalId);
        pause_play.textContent = PLAY;
    
        playNextSong();
    }
}

function resetMusic() {
    progress_fill.style.width = "0%";
    startTime = Date.now();
    clearInterval(intervalId);
    pause_play.textContent = PAUSE;
    intervalId = setInterval(resumeMusic, 100);
    current_audio.currentTime = 0;
    current_audio.play();
    cover_art.classList.remove("paused");
    cover_art.style.filter = "brightness(100%)";
}

function forwardMusic() {
    clearInterval(intervalId);
    progress_fill.style.width = "100%";
    current_audio.currentTime = music_duration;
    timestamp.textContent = formatTime(music_duration);
    pause_play.textContent = PLAY;
    cover_art.classList.add("paused");
    cover_art.style.filter = "brightness(50%)";
    current_audio.pause();

    playNextSong();
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function setupControls() {
    pause_play.addEventListener("click", () => {
        if (pause_play.textContent === PLAY) {
            current_audio.play();
            cover_art.classList.remove("paused");
            cover_art.style.filter = "brightness(100%)";
            pause_play.textContent = PAUSE;
            startTime = Date.now() - (cur_duration * 1000);
            intervalId = setInterval(resumeMusic, 100);
        } else {
            current_audio.pause();
            cover_art.classList.add("paused");
            cover_art.style.filter = "brightness(50%)";
            pause_play.textContent = PLAY;
            clearInterval(intervalId);
            const widthPercent = parseFloat(progress_fill.style.width);
            cur_duration = (widthPercent / 100) * music_duration;
        }
    });

    backward.addEventListener("click", resetMusic);
    forward.addEventListener("click", forwardMusic);
}


search_text.addEventListener("input", debounce(() => {
    // If there's an ongoing search, abort it.
    if (searchController) {
        searchController.abort();
    }
    // Create a new controller for the new search.
    searchController = new AbortController();

    const userQuery = search_text.value.trim();
    if (userQuery){
        // Pass the controller's "signal" to your function
        getSongQuery(userQuery, searchController.signal);
        div_song_search.classList.add("expand");
    }
    else{
        div_search_results.innerHTML = "";
        div_song_search.classList.remove("expand");
    }
}, 1500));


// add a 1.5s delay before using the API to search from typing
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// animate the queue when rearranging items (*CHECK ONCE AGAIN TO REFRESH MY UNDERSTANDING)
function animateReorder(container, items) {
    const firstPositions = new Map();
    
    // 1. Record initial positions
    items.forEach(item => {
        const rect = item.getBoundingClientRect();
        firstPositions.set(item, rect.top);
    });

    // 2. Rearrange items in DOM
    items.forEach(item => container.appendChild(item));

    // 3. Measure new positions and apply transforms
    items.forEach(item => {
        const lastTop = item.getBoundingClientRect().top;
        const firstTop = firstPositions.get(item);
        const invert = firstTop - lastTop;

        item.style.transition = "none";
        item.style.transform = `translateY(${invert}px)`;

        // Trigger reflow so the transform takes effect
        item.offsetHeight;

        // 4. Animate to final position
        item.style.transition = "transform 0.5s ease";
        item.style.transform = "translateY(0)";
    });
}
// rearrange queue in descending order based on likes
function rearrangeQueue() {
    // rearrange from the second song in the queue as the first one is the one playing
    const songQueue = Array.from(document.querySelectorAll(".queue > div:nth-child(n+5)"));

    // this creates a descending sorted list
    songQueue.sort((a,b) => parseInt(b.querySelector(".upvotes").textContent) 
    - parseInt(a.querySelector(".upvotes").textContent));

    // now we bring those changes into the DOM
    // the changes are started from the 4th div itself (as hard coded lol)
    // since we don't have a specific div for containing the queue
    animateReorder(document.querySelector(".queue"), songQueue)

    // below is the code if we don't want to animate the reordering
    // songQueue.forEach(div => document.querySelector(".queue").removeChild(div));
    // songQueue.forEach(div => document.querySelector(".queue").appendChild(div));
}

function addToQueue(song, artist, image, song_preview) {
    // Create queue-list container matching your sample markup
    const queueListDiv = document.createElement("div");
    queueListDiv.className = "queue-list";

    const song_audio = document.createElement("audio");
    song_audio.src = song_preview;
    // Background image div
    const background_image = document.createElement("div");
    background_image.className = "background-img";
    if (image) {
        background_image.style.backgroundImage = `url('${image}')`;
        background_image.style.backgroundSize = "cover";
        background_image.style.backgroundPosition = "center";
    }

    // Song contents container
    const song_contents = document.createElement("div");
    song_contents.className = "song_contents";

    // First span: title + artist
    const span1 = document.createElement("span");
    const title = document.createElement("p");
    title.className = "title";
    title.textContent = song;
    const artistName = document.createElement("p");
    artistName.className = "artist";
    artistName.textContent = artist;
    span1.appendChild(title);
    span1.appendChild(artistName);

    // Second span: upvotes + button
    const span2 = document.createElement("span");
    const upvotes_display = document.createElement("p");
    upvotes_display.textContent = "Upvotes";

    const upvotes_container = document.createElement("div");
    upvotes_container.className = "upvotes-container";

    const upvotes = document.createElement("p");
    upvotes.className = "upvotes";
    upvotes.textContent = 0;

    const upvote_button = document.createElement("button");
    const upvote_icon = document.createElement("i");
    upvote_icon.className = "fa-regular fa-heart"; 
    upvote_icon.id = "upvote-button";
    upvote_button.appendChild(upvote_icon);

    upvote_button.addEventListener("click", () => {
        const currentUpvotes = parseInt(upvotes.textContent);
        upvotes.textContent = currentUpvotes + 1;

        rearrangeQueue();
    });

    upvotes_container.appendChild(upvotes);
    upvotes_container.appendChild(upvote_button);

    span2.appendChild(upvotes_display);
    span2.appendChild(upvotes_container);

    // Compose song_contents with both spans
    song_contents.appendChild(span1);
    song_contents.appendChild(span2);

    // Compose queue-list with background and song_contents
    queueListDiv.appendChild(background_image);
    queueListDiv.appendChild(song_contents);

    // add the audio preview
    queueListDiv.appendChild(song_audio);

    // Finally, add to the existing .queue-list container in your DOM
    const queueContainer = document.querySelector(".queue .queue-list");
    if (queueContainer) {
        queueContainer.parentNode.appendChild(queueListDiv);
    } else {
        console.error("No .queue-list container found to append new songs!");
    }
}


// these are limits for number of characters shown in song and artist names
const maxNameLength = 20;  // reasonable limit
const maxArtistLength = 25;

// the signal is to check if user is typing query when API is searching to gracefully handle errors
async function getSongQuery(query, signal) {
    try{
        div_search_results.innerHTML = ""; // clear older results before displaying new

        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`, {signal});
        const data = await response.json();

        // iTunes bug was sometimes getting more than 5 songs
        const all_results = data.results;
        const results = all_results.slice(0, 5);

        if (!results.length) {
            div_search_results.innerHTML = "<p>No results found 😢</p>";
            return;
        }

        results.forEach(element => {
            const resultButton = document.createElement("button");

            const trackName = element.trackName.length > maxNameLength
            ? element.trackName.slice(0, maxNameLength) + "..."
            : element.trackName;

            const artistName = element.artistName.length > maxArtistLength
            ? element.artistName.slice(0, maxArtistLength) + "..."
            : element.artistName;

            resultButton.innerHTML = `
            <img src="${element.artworkUrl100}" alt="Album Art">
            <div class="song-info">
                <p>${trackName}</p>
                <p>${artistName}</p>
            </div>
            `

            // when we click on a song preview from search results
            // we also get a fancy alert before adding to queue
            resultButton.addEventListener("click", () => {
                // Show the confirmation pop-up first
                Swal.fire({
                    title: 'Add to Queue?',
                    // Use the actual track name in the question for a better user experience
                    text: `Do you want to add "${trackName}" to the queue?`,
                    icon: 'question',
                    customClass: {
                        popup: "my-swal-font"
                    },
                    showCancelButton: true,
                    confirmButtonColor: '#4CAF50',
                    cancelButtonColor: '#f44336',
                    confirmButtonText: 'Yes, add it!',
                    cancelButtonText: 'No, cancel'
                }).then((result) => {
                    // This code only runs AFTER the user makes a choice

                    // If the user clicked "Yes, add it!"
                    if (result.isConfirmed) {
                        const second_queue_item = document.querySelector(".queue > div:nth-child(4)")
                        const highResArtworkUrl = element.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');

                        if (!second_queue_item){
                            current_audio.src = element.previewUrl;

                            // Wait for metadata before starting
                            current_audio.addEventListener("loadedmetadata", function onLoaded() {
                                music_duration = current_audio.duration;
                                divisions_moved_per_second = parseFloat((100 / music_duration).toFixed(10));

                                resetMusic();

                                // Update UI
                                current_song_name.textContent = trackName;
                                current_song_artist.textContent = artistName;
                                cover_art.src = highResArtworkUrl;

                                // Add to queue
                                addToQueue(trackName, artistName, highResArtworkUrl, element.previewUrl);

                                // Remove this one-time listener to avoid duplicates
                                current_audio.removeEventListener("loadedmetadata", onLoaded);
                            });
                        }
                        else {
                            // Add to queue only (not playing now)
                            addToQueue(trackName, artistName, highResArtworkUrl, element.previewUrl);
                        }
                        
                        // Optionally, show a confirmation that the song was added
                        Swal.fire(
                        'Added!',
                        'The song has been added to the queue.',
                        'success'
                        )

                        // Optionally close search UI
                        search_button.click();
                    }
                });
            });

            div_search_results.appendChild(resultButton);

        });
        
    }
    catch (error){
        // Gracefully handle the abort error so it doesn't show up in the console
        if (error.name === 'AbortError') {
            console.log('Search aborted');
            return;
        }
        console.error(`Something went wrong: ${error}`);
    }
}