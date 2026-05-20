# 🌙 Slumber — Sleep Journal & Wind-Down Lab

> Fix your sleep. Fix your days. One night at a time.

A beautiful, no-sign-up, privacy-first sleep tracker that lives entirely in your browser. Log your nights, visualize your patterns, and generate a personalized wind-down routine — all in 60 seconds.

---

## ✨ Features

### 🌛 Log Night
- Log bedtime, wake time, sleep quality (5-star emoji), and morning mood
- Instant sleep duration calculator with color feedback
- Optional quick notes ("had coffee too late", "woke up twice")
- Track whether you used your wind-down routine
- Streak counter with moon phase progress bar

### 📊 My Patterns
- Visual sleep bar chart (last 14 nights)
- Average sleep duration, quality, and mood stats
- **Bedtime Drift** — color-coded dots showing how consistent your bedtime is
- Personalized AI-style insight card based on your actual data
- Wind-down routine effectiveness tracking (are nights you do the routine better?)

### ✨ Wind-Down Lab
- Set your target bedtime and routine length (30 / 60 / 90 min)
- Pick from 8 evidence-based activities (screens, stretching, journaling, tea, reading, breathing, bath, gratitude)
- Generates a **time-stamped personalized routine** with science-backed explanations for each step
- Tonight's live checklist with progress bar
- Copy your full routine to clipboard

---

## 🚀 60-Second Deploy to GitHub Pages

1. Create a new GitHub repository (any name, e.g. `my-slumber-app`)
2. Upload files maintaining this exact structure:
   ```
   your-repo/
   ├── index.html
   ├── css/
   │   └── style.css
   ├── js/
   │   └── app.js
   └── README.md
   ```
3. Go to **Settings → Pages → Source → Deploy from branch → main → / (root) → Save**
4. Wait ~60 seconds
5. Visit `https://yourusername.github.io/your-repo-name` — live! 🎉

---

## 🛠 Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Framework  | None — pure HTML + Vanilla JS     |
| Styling    | Tailwind CSS via CDN + custom CSS |
| Storage    | `localStorage` (100% private)     |
| Fonts      | Playfair Display, DM Sans, JetBrains Mono (Google Fonts CDN) |
| Build tool | None needed                       |

---

## 📱 Screenshots

| Log Night | My Patterns | Wind-Down Routine |
|-----------|-------------|-------------------|
| *(screenshot placeholder)* | *(screenshot placeholder)* | *(screenshot placeholder)* |

---

## 🔬 The Science Behind It

Slumber is built around three evidence-based sleep principles:

1. **Consistency over duration** — Going to bed at the same time every night is more important than sleeping 8 hours. Your circadian rhythm is a clock that trains to your schedule.

2. **Sleep pressure + circadian timing** — Your brain tracks how long you've been awake (adenosine buildup) and what time it is. Wind-down routines help align both.

3. **Temperature drop triggers sleep** — Your core body temp needs to fall ~2°F to initiate sleep. Warm baths, cool rooms, and screens-off all help this happen.

---

## 🗺 Roadmap / Future Ideas

- [ ] **Smart alarm** — Calculate ideal wake time based on 90-min sleep cycles
- [ ] **Sleep debt tracker** — Running total of missed sleep vs target
- [ ] **Export to CSV** — Download your full sleep history
- [ ] **Weekly email digest** — "Here's your sleep week in review"
- [ ] **PWA / offline mode** — Add to home screen, works airplane mode
- [ ] **Snooze Journal** — Voice-note style dream logging
- [ ] **Partner mode** — Compare sleep patterns with a partner (shared localStorage key)
- [ ] **Sound player** — Built-in white noise / rain / brown noise
- [ ] **Caffeine cutoff calculator** — Based on your chronotype and bedtime

---

## 💰 Monetization Ideas

- **Pro tier** ($4.99/mo): Advanced charts, sleep debt calculator, smart alarm, CSV export
- **One-time purchase** ($9): Lifetime license, all future features
- **Affiliate**: Link to blue-light glasses, sleep supplements, white noise machines
- **B2B**: White-label for employer wellness programs

---

## 🔒 Privacy

Everything is stored in your browser's `localStorage`. No data ever leaves your device. No accounts, no tracking, no ads. Your sleep data is yours.

---

## 📄 License

MIT — free to use, fork, and build on.

---

*Built with care for everyone who's ever woken up exhausted and wondered why.*
