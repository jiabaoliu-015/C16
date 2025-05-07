# CITS3403 Agile Web Development Project 2025

## Group Members

| UWA ID     | Name           | GitHub Username       |
|------------|----------------|-----------------------|
| 23954936   | Jiabao Liu  | jiabaoliu-015       |
| 23857377   | Marc Labouchardiere      |   marc-la         |
| 23706774   | Joshua Chin  | Jaecheonz    |

## Purpose of the Application

This web application, **Study Habit Tracker & Analysis Tool**, is designed to help students improve their study effectiveness by providing insights into their study habits. Users can log or upload study session data, analyse productivity trends, and share their progress with friends. The application aims to foster better study practices and encourage collaboration among peers.

### Key Features

- **Data Upload**: Manually log study sessions or upload .csv files containing study activity data.
- **Automated Analysis**:
  - Visualise daily/weekly trends using bar and line charts.
  - Track time spent per subject and study methods used most often.
  - Analyse correlations between mood and productivity using scatterplots.
- **Data Visualisation**: View personalised insights or compare study patterns with friends.
- **Data Sharing**: Share session stats or “study streaks” with specific friends.
- **Introductory View**: Explains the application's goal to improve study effectiveness and enable peer comparison.

### Optional Features

- Leaderboard for “most consistent week.”
- Exportable PDF reports of study stats.
- “Study partner match” suggestions based on overlapping study times.

This tool leverages a simple schema (user, study_sessions) and technologies like Flask, Chart.js/Plotly, and Tailwind CSS to deliver a user-friendly and visually appealing experience.

## How to Launch the Application

1. Clone the repository:

    ```bash
    git clone https://github.com/your-private-repo-url.git
    ```

2. Navigate to the project directory:

    ```bash
    cd agile-web-group-85
    ```

3. Set up a virtual environment and install dependencies from requirements.txt:

    ```bash
    python pip install (plugin name from requirements.txt)
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip -- version # check if the required pip files have been downloaded
    ```

4. Run the application:

    ```bash
    flask run # python run.py to launch the website
    ```

5. Open your browser and navigate to `http://127.0.0.1:5000`.

## How to Run Tests

1. Ensure the virtual environment is activated.
2. Run the test suite using `pytest`:

    ```bash
    pytest
    ```

3. View the test results in the terminal.
4. Make any changes if required
5. Consult team if any issues persist.
