# StudyTrackr — CITS3403 Agile Web Development Project 2025

## Table of Contents

- [StudyTrackr — CITS3403 Agile Web Development Project 2025](#studytrackr--cits3403-agile-web-development-project-2025)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
  - [Screenshots](#screenshots)
  - [Group Members](#group-members)
  - [Technology Stack](#technology-stack)
  - [System Architecture](#system-architecture)
  - [Database Schema](#database-schema)
  - [Setup \& Installation](#setup--installation)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
  - [Usage Guide](#usage-guide)
  - [Design Decisions](#design-decisions)
  - [Known Issues \& Limitations](#known-issues--limitations)
  - [Future Improvements](#future-improvements)
  - [License](#license)

---

## Project Overview

**StudyTrackr** is a modern web application designed to help students track, analyze, and improve their study habits. Users can log study sessions, visualize productivity trends, and share progress with friends. The platform encourages effective study practices and peer collaboration through insightful analytics and sharing features.

**Design:**

- **Engaging:** Modern UI with Tailwind CSS, interactive charts (Chart.js), and clear navigation.
- **Effective:** Automated analytics, personalised insights, and sharing features.
- **Intuitive:** Simple upload forms, dashboard visualisations, and clear sharing workflows.  
  
---

## Features

- **Manual & CSV Data Upload:** Log sessions individually or import in bulk.
- **Automated Analytics:** Visualise trends (daily/weekly), subject focus, and productivity correlations.
- **Interactive Visualizations:** Bar charts, pie charts, and scatterplots powered by Chart.js.
- **Study Streaks & Leaderboards:** Motivate users with streak tracking and weekly consistency leaderboards.
- **Data Sharing:** Share stats and streaks with friends via QR code or shareable links.
- **PDF Export:** Download personalised study reports.
- **Responsive UI:** Built with Tailwind CSS for a seamless experience on all devices.

---

## Screenshots

| Dashboard | Upload Sessions | Share Progress | Login | Home |
|-----------|----------------|-----------|---------------|-----------|
| ![Dashboard](screenshots/dashboard.png) | ![Upload](screenshots/upload.png) | ![Share](screenshots/share.png) | ![Login](screenshots/login.png) | ![Home](screenshots/home.png) |

---

## Group Members

| UWA ID     | Name                   | GitHub Username   |
|------------|------------------------|-------------------|
| 23954936   | Jiabao Liu             | jiabaoliu-015     |
| 23857377   | Marc Labouchardiere     | marc-la           |
| 23706774   | Joshua Chin            | Jaecheonz         |

---

## Technology Stack

- **Frontend:** HTML, CSS (Tailwind), JavaScript, Chart.js, Lucide Icons
- **Backend:** Python (Flask), Flask-Login, Flask-SQLAlchemy, Flask-WTF, Flask-Migrate
- **Database:** SQLite (via SQLAlchemy ORM)
- **Testing:** Unittest, Selenium
- **Other:** AJAX, QRCode.js, html2canvas, jsPDF

---

## System Architecture

- **MVC Pattern:**  
  - **Models:** SQLAlchemy models for `User`, `StudySession`, and `SharedData`.
  - **Views:** Flask templates (Jinja2) for rendering all pages (intro, dashboard, upload, share).
  - **Controllers:** Flask routes and blueprints handle logic and API endpoints.

- **Views:**
  - **Introductory View:**  
    `/` or `/info` — Describes app, login/register (info.html, home.html, login.html)
  - **Upload Data View:**  
    `/upload` — Manual entry and CSV upload (upload.html)
  - **Visualise Data View:**  
    `/dashboard` or `/visualise` — Analytics, charts, insights (dashboard.html)
  - **Share Data View:**  
    `/share` — Selectively share data with other users (share.html)

- **AJAX & API**
  - **AJAX:**  
    Used for dynamic updates (charts, stats, sharing) without page reloads.
  - **API Endpoints:**
    - `/api/sessions` — Get/add study sessions
    - `/api/analytics` — Get analytics data for charts
    - `/api/course-insights` — For advanced analytics and sharing
    - `/api/user-stats` — For user statistics
    - `/api/share` — For sharing data with other *StudyTrackr* users

- **Data Flow**

  - User interacts via browser (HTML, Tailwind, Chart.js, JS)
  - Browser submits forms to Flask (traditional HTTP) and fetches data via AJAX (REST API)
  - Flask routes requests to blueprints (auth, dashboard, sessions, api)
  - All persistent data is managed via SQLAlchemy ORM with SQLite

- **Data Flow Diagram:**  
  
> The diagram below illustrates how StudyTrackr separates concerns using Flask blueprints (auth, dashboard, sessions, api) and how the frontend interacts with the backend via both traditional HTTP and AJAX/REST calls. All persistent data is managed through SQLAlchemy ORM with SQLite.

![StudyTrackr Logic Flow](screenshots/logic_flow.svg)

---

## Database Schema

<!-- Provide an ER diagram or table definitions -->
- **User Table:** id, email, password_hash, ...
- **StudySession Table:** id, user_id, date, start_time, end_time, break_minutes, course, notes, productivity, ...

---

## Setup & Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-private-repo-url.git
    cd agile-web-group-85
    ```

2. **Set up a virtual environment:**
    ```bash
    python -m venv venv
    venv\Scripts\activate  # On Windows
    # or
    source venv/bin/activate  # On Mac/Linux
    ```

3. **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Set up the database:**
    ```bash
    flask db upgrade
    ```

---

## Running the Application

1. **Start the Flask server:**
    ```bash
    flask run
    # or
    python run.py
    ```

2. **Open your browser:**  
   Visit [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## Running Tests

1. **Activate your virtual environment.**
2. **Run the test suite:**
    ```bash
    pytest
    ```
3. **Review the results in your terminal.**

---

## Usage Guide

- **Uploading Sessions:**  
  Navigate to the Upload page to add sessions manually or upload a CSV file (see sample format on the page).
- **Viewing Analytics:**  
  Go to the Dashboard or Visualise page for interactive charts and insights.
- **Sharing Progress:**  
  Use the Share page to generate QR codes or shareable links for your stats.
- **Profile & Settings:**  
  Update your profile and manage sharing preferences from the Profile page.

---

## Design Decisions

- **Why Flask & Tailwind:**  
  Chosen for rapid development, flexibility, and modern UI.
- **Data Model:**  
  Simple, extensible schema for easy analytics and future features.
- **Security:**  
  CSRF protection, password hashing, and user authentication via Flask-Login.
- **Accessibility:**  
  Color contrast, keyboard navigation, and responsive design considered throughout.

---

## Known Issues & Limitations

- Only supports CSV uploads in the specified format.
- No email verification for sign-up (future work).
- Analytics are limited to the data uploaded/logged by the user.

---

## Future Improvements

- Add push notifications and reminders.
- Integrate calendar sync (Google Calendar, Outlook).
- Expand leaderboard and social features.
- Add more export options (Excel, PNG).

---

## License

This project is for educational purposes only.  
© 2025 StudyTrackr Team
