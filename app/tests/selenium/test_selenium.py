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
def auto_logged_in_driver(driver):
    # Reset test data first
    driver.get(f"{BASE_URL}/test-reset")
    
    # Then seed and login
    driver.get(f"{BASE_URL}/test-seed")
    driver.get(f"{BASE_URL}/test-login")
    return driver


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
    
    # Debug: Print the actual flash message content
    print("\nFlash message HTML:", flash_message.get_attribute('outerHTML'))
    print("Flash message text:", flash_message.text)
    
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

# def test_upload_study_data(driver):
#     # Log in
#     driver.get(f"{BASE_URL}/login")
#     email_field = driver.find_element(By.NAME, "email")
#     password_field = driver.find_element(By.NAME, "password")
#     submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
#     email_field.send_keys("testuser@example.com")
#     password_field.send_keys("password123")
#     driver.execute_script("arguments[0].scrollIntoView();", submit_button)
#     WebDriverWait(driver, 10).until(
#         EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
#     )
#     submit_button.click()
#     WebDriverWait(driver, 10).until(
#         EC.presence_of_element_located((By.TAG_NAME, "h1"))
#     )
#     body_text = driver.find_element(By.TAG_NAME, "body").text
#     assert "Welcome" in body_text or "Dashboard" in body_text

#     # Now go to upload page
#     driver.get(f"{BASE_URL}/upload/")
#     WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "new_date")))

#     # Fill out the form
#     driver.find_element(By.ID, "new_date").send_keys("2025-05-14")
#     driver.find_element(By.ID, "new_start").send_keys("09:00")
#     driver.find_element(By.ID, "new_end").send_keys("10:00")
#     driver.find_element(By.ID, "new_break").send_keys("10")
#     driver.find_element(By.ID, "new_course").send_keys("Math")
#     driver.find_element(By.ID, "new_activity").send_keys("Selenium test")
#     driver.find_element(By.ID, "new_productivity").send_keys("4")

#     # Wait for the submit button to be enabled
#     submit_btn = driver.find_element(By.ID, "create-session-btn")
#     WebDriverWait(driver, 10).until(lambda d: submit_btn.is_enabled())
#     submit_btn.click()

#     # Wait for success message
#     WebDriverWait(driver, 10).until(
#         EC.presence_of_element_located((By.CLASS_NAME, "bg-green-100"))
#     )
#     success_element = driver.find_element(By.CLASS_NAME, "bg-green-100")
#     assert "Session successfully added" in success_element.text

# def test_upload_study_data(driver, cookies):
#     # Use cookies to maintain logged-in state
#     driver.get(f"{BASE_URL}/")
#     for cookie in cookies:
#         driver.add_cookie(cookie)
#     driver.refresh()

#     # Now proceed with your test steps on the upload page
#     driver.get(f"{BASE_URL}/upload/")
    
#     # Debug: print the current URL and page source
#     print("Current URL:", driver.current_url)
#     print("Page Title:", driver.title)
    
#     # Save a screenshot for debugging
#     driver.save_screenshot("debug_upload_page.png")
    
#     # Print some page source to see what's actually loaded
#     print("Page source excerpt:", driver.page_source[:500])
    
#     # Try waiting for any element to make sure page is loaded
#     try:
#         WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
#         print("Body element found")
#     except:
#         print("Couldn't even find body element")
    
#     # Now try to find the specific element
#     try:
#         WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "new_date")))
#         print("Found the new_date element")
#     except Exception as e:
#         print(f"Error finding new_date: {e}")
        
#         # Let's see what elements ARE on the page
#         elements = driver.find_elements(By.XPATH, "//*[@id]")
#         print("Elements with IDs on the page:")
#         for element in elements[:10]:  # Show first 10 elements
#             print(f"  - {element.get_attribute('id')}")
