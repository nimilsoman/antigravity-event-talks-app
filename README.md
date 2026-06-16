# BigQuery Release Notes Explorer

A modern, responsive, and aesthetically premium Flask-based web application to explore, search, filter, and tweet Google Cloud BigQuery release updates.

## 🌟 Key Features

* **Live Atom Feed Parser:** Fetch and parse the live BigQuery release notes XML feed directly from Google Cloud Platform.
* **Granular Update Splits:** Automatically segment single-day combined updates into individual categorized items.
* **Search & Filter:** Instant client-side search by keyword and filtering by update categories (*Feature*, *Change*, *Issue*, *Breaking*, *Announcement*).
* **Interactive Dashboard Stats:** Dynamic stat banner computing features, issues, and overall counts with numerical increments.
* **X/Twitter Composer Integration:** Customize and share drafts on Twitter/X with automated character limits, a visual warnings progress bar, and built-in tweet composer launching.

---

## 🛠️ Technology Stack

* **Backend:** Python 3.12, Flask, Requests
* **Frontend:** Plain Vanilla HTML5, CSS3, JavaScript (ES6+)
* **Icons & Fonts:** FontAwesome Icons, Plus Jakarta Sans (Google Fonts)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Python 3.12+** and **Git** installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nimilsoman/antigravity-event-talks-app.git
   cd antigravity-event-talks-app
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   * **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Windows (Command Prompt):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

Start the Flask development server:
```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 📁 Directory Structure

```
antigravity-event-talks-app/
├── static/
│   ├── css/
│   │   └── style.css       # Glassmorphic UI stylesheet
│   └── js/
│       └── app.js          # Interactive frontend & filtering logic
├── templates/
│   └── index.html          # Main HTML structure and tweet modal
├── app.py                  # Python Flask server & XML parsing
├── requirements.txt        # Flask & requests package dependencies
├── .gitignore              # Files ignored in version control
└── README.md               # Project guide and overview
```
