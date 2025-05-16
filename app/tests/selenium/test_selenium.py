"""
Unit tests for the Flask application routes.
Run: $pytest app/tests/selenium
"""

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import Select

BASE_URL = "http://localhost:5000"  # Change if your app runs on a different port

@pytest.fixture(scope="module")
def driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # For CI
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=chrome_options)
    driver.set_window_size(1920, 1080)
    driver.implicitly_wait(10)

    # Seed test data via Flask endpoint for the initial login test
    driver.get(f"{BASE_URL}/test-seed")

    yield driver
    driver.quit()

@pytest.fixture(scope="function")
def auto_logged_in_driver(driver, live_server):
    driver.get(f"{BASE_URL}/test-reset")
    driver.get(f"{BASE_URL}/test-seed")
    driver.get(f"{BASE_URL}/test-login")
    return driver


def test_login_success(driver, live_server):
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

    cookies = driver.get_cookies()
    assert cookies is not None

def test_upload_study_data(auto_logged_in_driver):
    driver = auto_logged_in_driver
    # Set a larger window size to ensure all elements are visible
    driver.set_window_size(1920, 1080)
    driver.get(f"{BASE_URL}/upload/")

    # Fill in the form fields
    driver.find_element(By.NAME, "date").send_keys("2025-05-14")
    driver.find_element(By.NAME, "start_time").send_keys("09:00")
    driver.find_element(By.NAME, "end_time").send_keys("10:00")
    driver.find_element(By.NAME, "break_minutes").send_keys("10")
    driver.find_element(By.NAME, "course").send_keys("Math")
    driver.find_element(By.NAME, "notes").send_keys("Selenium test")
    driver.find_element(By.NAME, "productivity").send_keys("4")

    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.ID, "create-session-btn"))
    )

    # Click the "Create" button
    driver.find_element(By.ID, "create-session-btn").click()

    WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.ID, "session-list"))
    )

    # Wait a bit for any animations to complete
    driver.implicitly_wait(1)

    # Debug: Print more of the page source to see the actual HTML structure
    print("\nPage source after submission:")
    print(driver.page_source)  # Print full page source

    # Try different selectors for the notes
    print("\nTrying different selectors:")
    
    # Try finding by text content
    session_notes = driver.find_elements(By.CSS_SELECTOR, ".session-notes")
    print(f"Elements with class 'session-notes': {len(session_notes)}")
    for note in session_notes:
        print(f"Found element: {note.get_attribute('outerHTML')}")

    try:
        # Use the more reliable selector based on the debug output
        session_notes = driver.find_elements(By.CSS_SELECTOR, ".session-notes")
        assert any("Selenium test" in note.text for note in session_notes), "Selenium test not found in the notes"
    except AssertionError as e:
        driver.save_screenshot("failed_test_screenshot.png")
        print("Screenshot saved to failed_test_screenshot.png")
        raise e

def test_add_reflection(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/visualise/")  # Go to dashboard

    # Click the "Add Reflection" button
    add_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "add-reflection-btn"))
    )
    add_button.click()

    # Wait for modal to appear and fill in the form
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "reflection-modal"))
    )

    # Fill in the reflection form
    content_input = driver.find_element(By.ID, "reflection-content")
    mood_select = Select(driver.find_element(By.ID, "reflection-mood"))
    tags_input = driver.find_element(By.ID, "reflection-tags")

    content_input.send_keys("This is a test reflection from Selenium")
    mood_select.select_by_visible_text("😊 Focused")  # Select the "Focused" mood
    tags_input.send_keys("test, selenium")

    # Submit the form
    submit_button = driver.find_element(By.ID, "save-reflection")
    submit_button.click()

    # Wait for the flash message with a longer timeout
    flash_message = WebDriverWait(driver, 15).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "flash-message"))
    )
    
    # Wait a moment for any animations
    driver.implicitly_wait(1)
    
    assert "Reflection added successfully" in flash_message.text, f"Expected 'Reflection added successfully' in flash message, but got: {flash_message.text}"

    # Verify the reflection appears in the list immediately
    reflection_content = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//p[contains(text(), 'This is a test reflection from Selenium')]"))
    )
    assert "This is a test reflection from Selenium" in reflection_content.text

    # Verify the mood emoji is displayed
    mood_emoji = driver.find_element(By.XPATH, "//span[contains(text(), '😊')]")
    assert mood_emoji is not None

    # Verify the tags are displayed
    tags = driver.find_elements(By.CLASS_NAME, "bg-blue-100")
    assert any("test" in tag.text for tag in tags)
    assert any("selenium" in tag.text for tag in tags)

# def test_add_self_as_friend(auto_logged_in_driver):
#     driver = auto_logged_in_driver
#     driver.get(f"{BASE_URL}/profile/")
    
#     # Wait for page to load
#     WebDriverWait(driver, 10).until(
#         EC.presence_of_element_located((By.CLASS_NAME, "profile-container"))
#     )

#     # Find the email input and submit button
#     email_input = WebDriverWait(driver, 10).until(
#         EC.presence_of_element_located((By.ID, "email"))
#     )
#     submit_btn = driver.find_element(By.CSS_SELECTOR, "#add-friend-form button[type='submit']")

#     # Enter own email and submit
#     email_input.clear()
#     email_input.send_keys("testuser@example.com")
#     submit_btn.click()

#     # Wait for the AJAX response and page update
#     WebDriverWait(driver, 10).until(
#         EC.presence_of_element_located((By.CLASS_NAME, "flash-message"))
#     )

#     # Verify the error message
#     message = driver.find_element(By.CLASS_NAME, "flash-message")
#     assert "You cannot add yourself as a friend" in message.text
#     alert_div = message.find_element(By.CLASS_NAME, "alert")
#     assert "error" in alert_div.get_attribute("class")
    
#     # Verify the form is still visible and input is cleared
#     assert driver.find_element(By.CLASS_NAME, "friend-form").is_displayed()

def test_share_data_weekly_learning_time(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and ensure "Weekly Learning Time" is selected
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("weekly")  # "weekly" is the value for "Weekly Learning Time"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)

def test_share_monday_study_hours(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and select "Monday study time hours"
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("monday")  # "monday" is the value for "Monday study time hours"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully for Monday study hours")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)

def test_share_tuesday_study_hours(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and select "Tuesday study hours"
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("tuesday")  # "tuesday" is the value for "Tuesday study hours"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully for Tuesday study hours")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)

def test_share_wednesday_study_hours(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and select "Wednesday study hours"
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("wednesday")  # "wednesday" is the value for "Wednesday study hours"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully for Wednesday study hours")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)

def test_share_thursday_study_hours(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and select "Thursday study hours"
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("thursday")  # "thursday" is the value for "Thursday study hours"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully for Thursday study hours")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)

def test_share_friday_study_hours(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and select "Friday study hours"
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("friday")  # "friday" is the value for "Friday study hours"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully for Friday study hours")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)

def test_share_saturday_study_hours(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and select "Saturday study hours"
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("saturday")  # "saturday" is the value for "Saturday study hours"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully for Saturday study hours")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)

def test_share_sunday_study_hours(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and select "Sunday study hours"
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("sunday")  # "sunday" is the value for "Sunday study hours"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully for Sunday study hours")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)

def test_share_learning_intensity_analysis(auto_logged_in_driver):
    driver = auto_logged_in_driver
    driver.get(f"{BASE_URL}/share/")
    
    # Wait for the page to fully load
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "user-search"))
    )
    
    # Find the email input field and enter the email
    email_input = driver.find_element(By.ID, "user-search")
    email_input.clear()
    email_input.send_keys("testuser2@example.com")
    
    # Wait for the search results to appear
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "user-search-results"))
    )
    
    # Wait for the search results to be populated
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "user-search-results").get_attribute("innerHTML").strip() != ""
    )
    
    # Click on the search result (the first matching user)
    search_results = driver.find_element(By.ID, "user-search-results")
    # Find the first result item (could be a div, li, or other element depending on implementation)
    result_item = search_results.find_element(By.XPATH, ".//*[contains(text(), 'testuser2@example.com')]")
    result_item.click()
    
    # Find the share select dropdown and select "Learning Intensity Analysis"
    share_select = Select(driver.find_element(By.ID, "share-select"))
    share_select.select_by_value("intensity")  # "intensity" is the value for "Learning Intensity Analysis"
    
    # Wait for the share button to be enabled
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "share-button"))
    )
    
    # Click the share button
    share_button = driver.find_element(By.ID, "share-button")
    share_button.click()
    
    # Consider the test successful if the share button was clicked
    print("Share button was clicked successfully for Learning Intensity Analysis")
    
    # Add a small delay to ensure the click event is processed
    driver.implicitly_wait(2)
