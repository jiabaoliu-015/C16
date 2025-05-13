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
    
    // Modify the share button click handler in user_sharing.js
    shareButton.addEventListener('click', function() {
        if (!selectedUser) return;
        
        // Get selected sessions or use default if none are selected
        const selectedSessions = getSelectedSessions();
        const sessionId = selectedSessions.length > 0 ? selectedSessions[0] : null;
        
        if (!sessionId) {
            shareStatus.innerHTML = '<div class="text-red-600">Please select at least one session to share</div>';
            return;
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
                session_id: sessionId,
                shared_content: 20 // This can be customized based on what you're sharing
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
                shareStatus.innerHTML = `<div class="text-green-600">${data.message}</div>`;
                // Reset selection
                selectedUser = null;
                userSearchInput.value = '';
                shareButton.disabled = true;
            } else {
                shareStatus.innerHTML = `<div class="text-red-600">Error: ${data.error}</div>`;
            }
        })
        .catch(error => {
            console.error('Error sharing data:', error);
            shareStatus.innerHTML = '<div class="text-red-600">Error sharing data: ' + error.message + '</div>';
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
                        <p class="font-medium">${share.shared_by} shared: <span class="text-indigo-600 font-bold">${share.shared_content}</span></p>
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
                } else {
                    alert(`Error: ${data.error}`);
                }
            })
            .catch(error => {
                console.error('Error accepting share:', error);
                alert('Error accepting share');
            });
    }
    
    // Load received shares on page load
    loadReceivedShares();
    
    // Refresh button click handler
    refreshSharesButton.addEventListener('click', loadReceivedShares);
});
