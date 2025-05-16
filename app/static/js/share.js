document.addEventListener('DOMContentLoaded', function() {
    // Display the current date
    updateDateDisplay();
    
    // Initialize the checkbox
    initCheckboxes();
    
    // Initialize the share sessions checkbox
    initShareSessionsCheckbox();
    
    // Initialize to generate the button
    document.getElementById('generate-url-btn').addEventListener('click', generateShareUrl);
    
    // Initialize the copy button
    document.getElementById('copy-url-btn').addEventListener('click', copyShareUrl);
    
    // Initialize the QR code generation button
    document.getElementById('generate-qr-btn').addEventListener('click', generateQRCodeFromUrl);
    
    // Initialize the QR code copy button
    document.getElementById('copy-qr-btn').addEventListener('click', copyQRCode);
    
    // Initialize the QR code download button
    document.getElementById('download-qr-btn').addEventListener('click', downloadQRCode);
});

// Initialize the share sessions checkbox
function initShareSessionsCheckbox() {
    const shareSessionsCheckbox = document.getElementById('share-sessions-checkbox');
    
    if (shareSessionsCheckbox) {
        shareSessionsCheckbox.addEventListener('click', function() {
            // Toggle checked state
            this.classList.toggle('checked');
            
            // Add animation class
            this.classList.add('animate');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                this.classList.remove('animate');
            }, 800);
            
            // Hide URL display when selection changes
            const urlDisplay = document.getElementById('share-url-display');
            if (urlDisplay) {
                urlDisplay.style.display = 'none';
            }
        });
    }
}

// Update date display
function updateDateDisplay() {
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayOfWeek = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    
    const formattedDate = `${dayOfWeek}, ${month} ${date}, ${year}`;
    dateElement.textContent = formattedDate;
}

// Initialize the checkbox
function initCheckboxes() {
    const checkboxes = document.querySelectorAll('.custom-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
         
            this.classList.toggle('checked');
            
           
            this.classList.add('checkbox-animation');
            
            setTimeout(() => {
                this.classList.remove('checkbox-animation');
            }, 500);
            
            
            const isChecked = this.classList.contains('checked');
            this.setAttribute('data-checked', isChecked);
          
            const urlDisplay = document.getElementById('share-url-display');
            urlDisplay.style.display = 'none';
        });
    });
}

// Generate the sharing URL
function generateShareUrl() {
    const shareSessionsCheckbox = document.getElementById('share-sessions-checkbox');
    const selectedItems = [];
    
    // Check if sessions are selected for sharing
    if (shareSessionsCheckbox && shareSessionsCheckbox.classList.contains('checked')) {
        // Get all selected session IDs
        const selectedSessions = getSelectedSessions();
        if (selectedSessions.length > 0) {
            selectedItems.push('sessions=' + selectedSessions.join(','));
        } else {
            showFlashMessage('Please select at least one session to share', 'error');
            return;
        }
    }
    
    // If nothing is selected, show a flash message
    if (selectedItems.length === 0) {
        showFlashMessage('Please select content to share', 'error');
        return;
    }
    
    const baseUrl = window.location.origin + window.location.pathname;
    const queryParams = '?' + selectedItems.join('&');
    const shareUrl = baseUrl + queryParams;

    const urlDisplay = document.getElementById('share-url-display');
    urlDisplay.textContent = shareUrl;
    urlDisplay.style.display = 'block';
    generateQRCode(shareUrl);
}

// Get selected sessions based on page type
function getSelectedSessions() {
    const selectedSessions = [];
    const sessionRows = document.querySelectorAll('.notes-row');
    
    // Check if we're on the share page
    if (window.location.pathname.includes('/share')) {
        // In share page, we select all visible sessions
        sessionRows.forEach(row => {
            if (row.style.display !== 'none') {
                const sessionId = row.getAttribute('data-session-id');
                if (sessionId) {
                    selectedSessions.push(sessionId);
                }
            }
        });
    } else {
        // In upload page, we select only checked sessions
        sessionRows.forEach(row => {
            const checkbox = row.querySelector('.entry-checkbox');
            if (checkbox && checkbox.checked) {
                const sessionId = row.getAttribute('data-session-id');
                if (sessionId) {
                    selectedSessions.push(sessionId);
                }
            }
        });
    }
    
    return selectedSessions;
}

//  Generate qr code
function generateQRCode(url) {
    const qrContainer = document.getElementById('qr-code-container');
    const qrCodeActions = document.getElementById('qr-code-actions');
    
    // Clear the existing content
    qrContainer.innerHTML = '';

    console.log("QRCode library status:", typeof QRCode);
    
    try {
        if (typeof QRCode !== 'undefined') {
            // creat qr code
            new QRCode(qrContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel ? QRCode.CorrectLevel.H : 2 
            });
            console.log("QR code generated successfully");
            
         
            qrCodeActions.style.display = 'flex';
        } else {
    
            console.log("QRCode library not found, trying alternative approach");
            
            const script = document.createElement('script');
            script.src = 'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js';
            script.onload = function() {
                console.log("QRCode library loaded dynamically");
                if (typeof QRCode !== 'undefined') {
                    new QRCode(qrContainer, {
                        text: url,
                        width: 200,
                        height: 200
                    });
                    console.log("QR code generated after dynamic load");
                    
                 
                    qrCodeActions.style.display = 'flex';
                } else {
                    qrContainer.innerHTML = '<p>Could not load QR Code library. Please try again later.</p>';
                    qrCodeActions.style.display = 'none';
                }
            };
            script.onerror = function() {
                console.error("Failed to load QRCode library dynamically");
                qrContainer.innerHTML = '<p>Could not load QR Code library. Please try again later.</p>';
                qrCodeActions.style.display = 'none';
            };
            document.head.appendChild(script);
        }
    } catch (error) {
        console.error("Error generating QR code:", error);
        qrContainer.innerHTML = '<p>Error generating QR code: ' + error.message + '</p>';
        qrCodeActions.style.display = 'none';
    }
}

// Copy the QR code to the clipboard
function copyQRCode() {
    try {
        const qrContainer = document.getElementById('qr-code-container');
        const qrImage = qrContainer.querySelector('img');
        
        if (!qrImage) {
            const canvas = qrContainer.querySelector('canvas');
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/png');
                copyImageToClipboard(dataUrl);
                showCopySuccess('copy-qr-btn', 'Copied!');
                return;
            }
            throw new Error('No QR code image found');
        }
        
        copyImageToClipboard(qrImage.src);
        showCopySuccess('copy-qr-btn', 'Copied!');
    } catch (error) {
        console.error('Failed to copy QR code:', error);
        alert('Failed to copy QR code. Your browser may not support this feature.');
    }
}

// An auxiliary function for copying images to the clipboard
function copyImageToClipboard(imageUrl) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; 
    
    return new Promise((resolve, reject) => {
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            
        
            ctx.drawImage(img, 0, 0);
            
    
            canvas.toBlob(function(blob) {
     
                const item = new ClipboardItem({ 'image/png': blob });
                
             
                navigator.clipboard.write([item]).then(resolve).catch(reject);
            }, 'image/png');
        };
        
        img.onerror = reject;
        img.src = imageUrl;
    }).catch(error => {
        console.error('Error copying image to clipboard:', error);

        alert('Automatic copy not supported in your browser. Right-click on the QR code and select "Copy image".');
    });
}

// 下载 QR 码
function downloadQRCode() {
    try {
   
        const qrContainer = document.getElementById('qr-code-container');
        const qrImage = qrContainer.querySelector('img');
        
        if (!qrImage) {
    
            const canvas = qrContainer.querySelector('canvas');
            if (canvas) {
           
                const dataUrl = canvas.toDataURL('image/png');
                downloadImage(dataUrl, 'qrcode.png');
                return;
            }
            throw new Error('No QR code image found');
        }
    
        downloadImage(qrImage.src, 'qrcode.png');
    } catch (error) {
        console.error('Failed to download QR code:', error);
        alert('Failed to download QR code: ' + error.message);
    }
}


function downloadImage(imageUrl, filename) {

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    showCopySuccess('download-qr-btn', 'Downloaded!');
}

// Display the successful operation message
function showCopySuccess(buttonId, message) {
    const button = document.getElementById(buttonId);
    const originalText = button.textContent;
    button.textContent = message;
    
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Generate a QR code from the current URL
function generateQRCodeFromUrl() {
    const urlDisplay = document.getElementById('share-url-display');
    
    // Check whether the URL has been generated
    if (urlDisplay.style.display === 'none' || urlDisplay.textContent.trim() === '') {
        // If no URL is generated, first generate a URL
        generateShareUrl();
    }
    
    // Obtain the URL and generate a QR code
    const url = urlDisplay.textContent;
    generateQRCode(url);
    
    // Scroll to the QR code container
    document.getElementById('qr-code-container').scrollIntoView({ behavior: 'smooth' });
}

// Copy and share the URL to the clipboard
function copyShareUrl() {
    const urlDisplay = document.getElementById('share-url-display');
    const url = urlDisplay.textContent;
    
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    
    //Select and copy the text
    tempInput.select();
    document.execCommand('copy');
    
    // 移除临时元素
    document.body.removeChild(tempInput);

    const copyBtn = document.getElementById('copy-url-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// Parse the URL parameters and display the corresponding content (when the page is loaded through a shared link)
function parseUrlAndShowContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionsParam = urlParams.get('sessions');
    
    if (sessionsParam) {
        // Hide the navigation bar
        const navbar = document.querySelector('nav');
        if (navbar) {
            navbar.style.display = 'none';
        }
        
        // Hidden footer
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.display = 'none';
        }
        
        // Hide the welcome banner
        const welcomeBanner = document.querySelector('.welcome-banner');
        if (welcomeBanner) {
            welcomeBanner.style.display = 'none';
        }
        
        // Hide date display
        const header = document.querySelector('.header');
        if (header) {
            header.style.display = 'none';
        }
        
        // Adjust the style of the content container
        const shareContainer = document.querySelector('.share-container');
        if (shareContainer) {
            shareContainer.style.paddingTop = '20px';
            shareContainer.style.paddingBottom = '20px';
            shareContainer.style.maxWidth = '100%';
        }
        
        // Hide the share checkbox and URL generator
        const shareCheckboxContainer = document.querySelector('.share-checkbox-container');
        if (shareCheckboxContainer) {
            shareCheckboxContainer.style.display = 'none';
        }
        
        document.querySelector('.url-generator').style.display = 'none';
        
        // Create a concise content container
        const contentSection = document.querySelector('.content-section');
        if (contentSection) {
            contentSection.style.margin = '0';
        }
        
        // Hide other elements
        document.querySelectorAll('.share-container > *:not(.content-section)').forEach(element => {
            if (element !== contentSection) {
                element.style.display = 'none';
            }
        });
        
        // Wait for sessions to load, then filter them
        const checkSessionsLoaded = setInterval(() => {
            const sessionRows = document.querySelectorAll('.notes-row');
            if (sessionRows.length > 0) {
                clearInterval(checkSessionsLoaded);
                
                // Get the shared session IDs
                const sharedSessionIds = sessionsParam.split(',');
                
                // Hide sessions that are not in the shared list
                sessionRows.forEach(row => {
                    const sessionId = row.getAttribute('data-session-id');
                    if (!sharedSessionIds.includes(sessionId)) {
                        row.style.display = 'none';
                    }
                });
                
                // Hide the delete button
                document.querySelector('#delete-selected').style.display = 'none';
            }
        }, 100);
    }
}

// Check whether the page is accessed through a shared link when loading
window.addEventListener('load', parseUrlAndShowContent);
