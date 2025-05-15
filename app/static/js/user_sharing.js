document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const userSearchInput = document.getElementById('user-search');
    const userSearchResults = document.getElementById('user-search-results');
    const shareButton = document.getElementById('share-button');
    const shareStatus = document.getElementById('share-status');
    const refreshSharesButton = document.getElementById('refresh-shares');
    const receivedSharesList = document.getElementById('received-shares-list');
    
    // Selected user for sharing
    let selectedUser = null;
    
    // Debounce function to limit API calls during typing
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // Search users as user types (with debounce)
    userSearchInput.addEventListener('input', debounce(function() {
        const query = userSearchInput.value.trim();
        
        // Clear previous selection
        selectedUser = null;
        shareButton.disabled = true;
        
        // Only search if at least 3 characters
        if (query.length < 3) {
            userSearchResults.classList.add('hidden');
            return;
        }
        
        // Fetch matching users
        fetch(`/api/users/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(users => {
                userSearchResults.innerHTML = '';
                
                if (users.length === 0) {
                    userSearchResults.innerHTML = '<div class="p-2 text-gray-500">No users found</div>';
                } else {
                    users.forEach(user => {
                        const userElement = document.createElement('div');
                        userElement.className = 'p-2 hover:bg-gray-100 cursor-pointer';
                        userElement.textContent = user.email;
                        userElement.addEventListener('click', () => {
                            // Select this user
                            selectedUser = user;
                            userSearchInput.value = user.email;
                            userSearchResults.classList.add('hidden');
                            shareButton.disabled = false;
                        });
                        userSearchResults.appendChild(userElement);
                    });
                }
                
                userSearchResults.classList.remove('hidden');
            })
            .catch(error => {
                console.error('Error searching users:', error);
                userSearchResults.innerHTML = '<div class="p-2 text-red-500">Error searching users</div>';
                userSearchResults.classList.remove('hidden');
            });
    }, 300));
    
    // Hide search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!userSearchInput.contains(event.target) && !userSearchResults.contains(event.target)) {
            userSearchResults.classList.add('hidden');
        }
    });
    
    // Function to generate learning intensity evaluation
    function getLearningIntensityEvaluation(totalMinutes) {
        if (totalMinutes < 240) {
            return "Critical Alert: Learning Deficit Detected";
        } else if (totalMinutes >= 240 && totalMinutes < 600) {
            return "Positive Progress: Room for Growth";
        } else if (totalMinutes >= 600 && totalMinutes < 1500) {
            return "Excellent Commitment: On Track for Success";
        } else {
            return "Elite Performance: Academic Excellence Achieved";
        }
    }

    // Function to get total study time from all sessions
    async function getWeeklyLearningTime() {
        try {
            const response = await fetch('/api/total-study-time');
            const data = await response.json();
            return { 
                hours: data.hours, 
                minutes: data.minutes 
            };
        } catch (error) {
            console.error('Error fetching total study time:', error);
            return { hours: 0, minutes: 0 };
        }
    }

    // Function to get study time by day of week
    async function getStudyTimeByDay(day) {
        try {
            const response = await fetch('/api/sessions');
            if (!response.ok) {
                console.error('Failed to fetch sessions:', response.status);
                return { hours: 0, minutes: 0 };
            }
            
            const sessions = await response.json();
            console.log('Raw sessions data:', sessions);
            
            // Filter sessions for the specified day
            const daySessions = sessions.filter(session => {
                if (!session || !session.date || !session.duration) {
                    console.log('Invalid session:', session);
                    return false;
                }
                
                // Handle both YYYY-MM-DD and DD/MM/YYYY formats
                let date;
                try {
                    if (session.date.includes('/')) {
                        const parts = session.date.split('/');
                        if (parts.length !== 3) return false;
                        date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    } else {
                        date = new Date(session.date);
                    }
                    
                    if (isNaN(date.getTime())) {
                        console.log('Invalid date:', session.date);
                        return false;
                    }
                    
                    return date.getDay() === day; // 0=Sunday, 1=Monday, etc.
                } catch (e) {
                    console.log('Date parsing error:', e);
                    return false;
                }
            });

            console.log('Filtered day sessions:', daySessions);
            
            // Calculate total minutes
            const totalMinutes = daySessions.reduce((sum, session) => {
                try {
                    let minutes = 0;
                    // Handle both "HH:MM" and decimal hours formats
                    if (typeof session.duration === 'string') {
                        if (session.duration.includes(':')) {
                            const parts = session.duration.split(':');
                            const h = parseInt(parts[0]) || 0;
                            const m = parseInt(parts[1]) || 0;
                            minutes = h * 60 + m;
                            console.log(`HH:MM format ${session.duration} converted to ${minutes} minutes`);
                        } else {
                            // Handle decimal hours format (e.g. 8.67 hours)
                            const totalHours = parseFloat(session.duration) || 0;
                            minutes = Math.round(totalHours * 60);
                            console.log(`Decimal hours ${totalHours} converted to ${minutes} minutes`);
                        }
                    } else if (typeof session.duration === 'number') {
                        minutes = Math.floor(session.duration * 60);
                    }
                    console.log(`Session ${session.id} duration:`, session.duration, '=>', minutes, 'minutes');
                    return sum + minutes;
                } catch (e) {
                    console.log('Duration parsing error:', e);
                    return sum;
                }
            }, 0);

            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const result = { hours, minutes };
            console.log('Total minutes:', totalMinutes, '=>', hours, 'hours', minutes, 'minutes');
            console.log('Final result for day', day, 'sessions:', daySessions);
            console.log('Final time calculation for day', day, ':', result);
            return result;
        } catch (error) {
            console.error('Error fetching sessions:', error);
            return { hours: 0, minutes: 0 };
        }
    }

    // Helper function to format day name
    function getDayName(dayNum) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayNum];
    }

    // Modify the share button click handler in user_sharing.js
    shareButton.addEventListener('click', async function() {
        if (!selectedUser) return;
        
        const shareSelect = document.getElementById('share-select');
        const selectedOption = shareSelect.value;
        
        let sharedContent = 20;
        let sharedContent3 = 'YOU RECEIVE A SHARE';
        
        if (selectedOption === 'weekly') {
            const { hours, minutes } = await getWeeklyLearningTime();
            sharedContent = hours * 60 + minutes;
            sharedContent3 = `This week my study time is ${hours} hours ${minutes}.`;
        } else if (selectedOption === 'monday') {
            const { hours, minutes } = await getStudyTimeByDay(1);
            sharedContent = hours * 60 + minutes;
            const dayName = getDayName(1);
            sharedContent3 = `This ${dayName} my study time is ${hours} hours.`;
        } else if (selectedOption === 'tuesday') {
            const { hours, minutes } = await getStudyTimeByDay(2);
            sharedContent = hours * 60 + minutes;
            const dayName = getDayName(2);
            sharedContent3 = `This ${dayName} my study time is ${hours} hours.`;
        } else if (selectedOption === 'wednesday') {
            const { hours, minutes } = await getStudyTimeByDay(3);
            sharedContent = hours * 60 + minutes;
            const dayName = getDayName(3);
            sharedContent3 = `This ${dayName} my study time is ${hours} hours.`;
        } else if (selectedOption === 'thursday') {
            const { hours, minutes } = await getStudyTimeByDay(4);
            sharedContent = hours * 60 + minutes;
            const dayName = getDayName(4);
            sharedContent3 = `This ${dayName} my study time is ${hours} hours`;
        } else if (selectedOption === 'friday') {
            const { hours, minutes } = await getStudyTimeByDay(5);
            sharedContent = hours * 60 + minutes;
            const dayName = getDayName(5);
            sharedContent3 = `This ${dayName} my study time is ${hours} hours.`;
        } else if (selectedOption === 'saturday') {
            const { hours, minutes } = await getStudyTimeByDay(6);
            sharedContent = hours * 60 + minutes;
            const dayName = getDayName(6);
            sharedContent3 = `This ${dayName} my study time is ${hours} hours.`;
        } else if (selectedOption === 'sunday') {
            const { hours, minutes } = await getStudyTimeByDay(0);
            sharedContent = hours * 60 + minutes;
            const dayName = getDayName(0);
            sharedContent3 = `This ${dayName} my study time is ${hours} hours.`;
        } else if (selectedOption === 'intensity') {
            const { hours, minutes } = await getWeeklyLearningTime();
            const totalMinutes = hours * 60 + minutes;
            const evaluation = getLearningIntensityEvaluation(totalMinutes);
            sharedContent = totalMinutes;
            sharedContent3 = `My study evaluation this week is: ${evaluation}`;
        } else {
            sharedContent = parseInt(document.querySelector('input[type="number"]').value) || 20;
        }
        
        // Share data with selected user with proper parameters
        fetch('/api/share', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            },
            body: JSON.stringify({
                recipient_id: selectedUser.id,
                session_id: 1, // Default session ID
                shared_content: sharedContent,
                shared_content3: sharedContent3
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Reset selection
                selectedUser = null;
                userSearchInput.value = '';
                shareButton.disabled = true;
                // Reload page to show server-side flash message
                window.location.reload();
            } else {
                // Reload page to show server-side flash message
                window.location.reload();
            }
        })
        .catch(error => {
            console.error('Error sharing data:', error);
            // Reload page to show server-side flash message
            window.location.reload();
        });
    });

    // // Add this function to get selected sessions (based on your share.js implementation)
    // function getSelectedSessions() {
    //     const selectedSessions = [];
    //     const sessionRows = document.querySelectorAll('.notes-row');
        
    //     if (sessionRows.length > 0) {
    //         sessionRows.forEach(row => {
    //             const checkbox = row.querySelector('.entry-checkbox');
    //             if (checkbox && checkbox.checked) {
    //                 const sessionId = row.getAttribute('data-session-id');
    //                 if (sessionId) {
    //                     selectedSessions.push(sessionId);
    //                 }
    //             }
    //         });
    //     }
        
    //     return selectedSessions;
    // }
    
    // Function to load received shares
    function loadReceivedShares() {
        fetch('/api/shares/received')
            .then(response => response.json())
            .then(shares => {
                if (shares.length === 0) {
                    receivedSharesList.innerHTML = '<p class="text-gray-500 text-sm italic">No shares received yet.</p>';
                    return;
                }
                
                receivedSharesList.innerHTML = '';
                shares.forEach(share => {
                    const shareElement = document.createElement('div');
                    shareElement.className = 'border-b border-gray-200 py-2 flex justify-between items-center';
                    
                    const shareInfo = document.createElement('div');
                    shareInfo.innerHTML = `
                        <p class="font-medium">${share.shared_by} shared: ${share.shared_content3 || 'there have some error'}</p>
                        <p class="text-xs text-gray-500">${new Date(share.shared_on).toLocaleString()}</p>
                    `;
                    
                    const shareActions = document.createElement('div');
                    
                    if (share.status === 'pending') {
                        const acceptButton = document.createElement('button');
                        acceptButton.className = 'px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm';
                        acceptButton.textContent = 'Accept';
                        acceptButton.addEventListener('click', () => acceptShare(share.id));
                        shareActions.appendChild(acceptButton);
                    } else {
                        const statusBadge = document.createElement('span');
                        statusBadge.className = 'px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs';
                        statusBadge.textContent = 'Accepted';
                        shareActions.appendChild(statusBadge);
                    }
                    
                    shareElement.appendChild(shareInfo);
                    shareElement.appendChild(shareActions);
                    receivedSharesList.appendChild(shareElement);
                });
            })
            .catch(error => {
                console.error('Error loading received shares:', error);
                receivedSharesList.innerHTML = '<p class="text-red-500">Error loading shares</p>';
            });
    }
    
    // Function to accept a share
    function acceptShare(shareId) {
        fetch(`/api/shares/accept/${shareId}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reload shares to update UI
                    loadReceivedShares();
                    // The server will handle the flash message
                    window.location.reload();
                } else {
                    // The server will handle the flash message
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Error accepting share:', error);
                // The server will handle the flash message
                window.location.reload();
            });
    }

    // Function to show flash messages
    function showFlashMessage(message, category) {
        const flashContainer = document.querySelector('header .flash-container');
        if (!flashContainer) {
            console.error('Flash container not found');
            return;
        }
        const flashMessage = document.createElement('div');
        flashMessage.className = 'flash-message';
        flashMessage.innerHTML = `
            <div class="alert alert-${category}">
                ${message}
            </div>
        `;
        flashContainer.appendChild(flashMessage);

        // Remove the message after 3 seconds
        setTimeout(() => {
            flashMessage.classList.add('fade-out');
            setTimeout(() => {
                flashMessage.remove();
            }, 500);
        }, 3000);
    }
    
    // Load received shares on page load
    loadReceivedShares();
    
    // Refresh button click handler
    refreshSharesButton.addEventListener('click', loadReceivedShares);
});
