import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:5000"  # Change if your app runs on a different port

@pytest.fixture(scope="module")
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # For CI
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=chrome_options)
    driver.set_window_size(1280, 1024)
    driver.implicitly_wait(10)

    # Seed test data via Flask endpoint
    driver.get(f"{BASE_URL}/test-seed")

    yield driver
    driver.quit()

def test_login_success(driver):
    driver.get(f"{BASE_URL}/login")

    # Locate the email and password fields and submit the login form
    email_field = driver.find_element(By.NAME, "email")
    password_field = driver.find_element(By.NAME, "password")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    # Input valid credentials (adjust based on test data setup)
    email_field.send_keys("testuser@example.com")
    password_field.send_keys("password123")

    # Scroll the submit button into view and click it
    driver.execute_script("arguments[0].scrollIntoView();", submit_button)
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
    )
    submit_button.click()

    # Wait for the dashboard or specific post-login content to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "h1"))
    )

    # Check for user-specific content (e.g., "Welcome" or "Dashboard")
    body_text = driver.find_element(By.TAG_NAME, "body").text
    assert "Welcome" in body_text or "Dashboard" in body_text

def test_upload_study_data(driver):
    driver.get(f"{BASE_URL}/upload")

    driver.find_element(By.NAME, "date").send_keys("2025-05-14")
    driver.find_element(By.NAME, "start_time").send_keys("09:00")
    driver.find_element(By.NAME, "end_time").send_keys("10:00")
    driver.find_element(By.NAME, "break_minutes").send_keys("10")
    driver.find_element(By.NAME, "course").send_keys("Math")
    driver.find_element(By.NAME, "notes").send_keys("Selenium test")
    driver.find_element(By.NAME, "productivity").send_keys("4")

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    WebDriverWait(driver, 10).until(
        EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "Session successfully added!")
    )
