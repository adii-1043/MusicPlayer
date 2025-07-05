# MusicPlayer

A web-based music queue player that allows users to search for songs using the iTunes Search API, play 30-second previews, and manage a dynamic queue with animated visuals and responsive design.

**Live Demo:** *(Add link here if deployed)*
**GitHub Repository:** [https://github.com/adii-1043/MusicPlayer](https://github.com/adii-1043/MusicPlayer)

---

## Features

* Search for songs via the **iTunes Search API**
* Play/Pause/Skip 30-second audio previews
* Create and manage a dynamic **queue**
* Upvote songs to reorder the queue
* Animated cover art and flowing gradient borders
* Fully responsive and mobile-friendly
* Custom arcade-style font with smooth UI transitions
* SweetAlert2 pop-ups for interactive feedback

---

## Project Structure

```
MusicPlayer/
├── ARCADE.TTF               # Custom arcade-style font
├── player.html              # Main webpage
├── player_script.js         # All interactive JavaScript functionality
└── player_style.css         # Styling and animations
```

---

## Built With

* HTML5, CSS3, JavaScript (ES6)
* iTunes Search API
* SweetAlert2 for modals
* FontAwesome for icons
* Custom TTF font (`ARCADE.TTF`)

---

## Usage

### 1. Clone the Repository

```bash
git clone https://github.com/adii-1043/MusicPlayer.git
cd MusicPlayer
```

### 2. Open the App

Simply open the `player.html` file in your web browser.
No additional setup needed!

---

## 🌐 Deployment

You can deploy this project on:

* **GitHub Pages**
* **Netlify**
* **Vercel**

🔝 Set `player.html` as your root page.

---

## Limitations

* The iTunes API only allows 30-second previews.
* Queue and votes reset on page reload.
* No backend, login, or persistent storage.
* Built for **personal use only.**
* **Group/organization use or public hosting is not allowed** without permission (see license).

---

## License

This project is licensed under a customized MIT License:

✅ Free for **personal use**
❌ Not allowed for **group, organizational, or public hosting purposes**

See [`LICENSE`](https://github.com/adii-1043/MusicPlayer/blob/main/LICENSE) for details.

---

##  Acknowledgements

* [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/)
* [SweetAlert2](https://sweetalert2.github.io/)
* [FontAwesome](https://fontawesome.com/)

