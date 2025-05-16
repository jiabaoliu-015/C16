// Function to show flash message
function showFlashMessage(message, category = 'success') {
    const flashContainer = document.querySelector('.flash-container');
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

// Function to update friends list
function updateFriendsList(friends) {
    const container = document.getElementById('friends-list-container');
    if (friends.length === 0) {
        container.innerHTML = '<p class="friends-empty">You have no friends yet.</p>';
        return;
    }
    
    const list = document.createElement('ul');
    list.className = 'friends-list-items';
    list.id = 'friends-list';
    
    friends.forEach(friend => {
        const li = document.createElement('li');
        li.className = 'friend-item';
        li.dataset.friendId = friend.id;
        li.innerHTML = `
            <span>${friend.email}</span>
            <button class="remove-friend-button" data-friend-id="${friend.id}">Remove</button>
        `;
        list.appendChild(li);
    });
    
    container.innerHTML = '';
    container.appendChild(list);
}

// Function to handle adding a friend
async function handleAddFriend(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value;
    
    try {
        const response = await fetch('/api/friends/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        // Clear form regardless of success or error
        form.reset();
        
        if (!response.ok) {
            showFlashMessage(data.error, 'error');
            return false;
        }
        
        // Show success message
        showFlashMessage(data.message, 'success');
        
        // Refresh friends list
        const friendsResponse = await fetch('/api/friends');
        const friendsData = await friendsResponse.json();
        updateFriendsList(friendsData);
        
    } catch (error) {
        showFlashMessage('An error occurred. Please try again.', 'error');
    }
    
    return false;
}

// Function to handle removing a friend
async function handleRemoveFriend(friendId) {
    // Create confirmation flash message with hardcoded purple style
    const flashContainer = document.querySelector('.flash-container');
    const flashMessage = document.createElement('div');
    flashMessage.className = 'flash-message';
    flashMessage.innerHTML = `
        <div class="alert bg-violet-100 text-black border border-violet-200 shadow-lg rounded-lg p-4 max-w-md mx-auto" style="color: black !important;">
            Are you sure you want to remove this friend?
            <div class="mt-2 flex justify-end space-x-2">
                <button class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-black font-medium" onclick="this.closest('.flash-message').remove()">Cancel</button>
                <button class="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-black font-medium rounded" id="confirm-remove">Remove</button>
            </div>
        </div>
    `;
    flashContainer.appendChild(flashMessage);

    // Add event listener to the confirm button
    document.getElementById('confirm-remove').addEventListener('click', async function() {
        try {
            const response = await fetch(`/api/friends/remove/${friendId}`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showFlashMessage(data.error, 'error');
                return;
            }
            
            // Show success message
            showFlashMessage(data.message, 'success');
            
            // Refresh friends list
            const friendsResponse = await fetch('/api/friends');
            const friendsData = await friendsResponse.json();
            updateFriendsList(friendsData);
            
        } catch (error) {
            showFlashMessage('An error occurred. Please try again.', 'error');
        }
        
        // Remove the confirmation flash message
        flashMessage.remove();
    });
}

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event delegation for remove friend buttons
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-friend-button')) {
            const friendId = event.target.dataset.friendId;
            handleRemoveFriend(friendId);
        }
    });

    // Add form submission handler
    const addFriendForm = document.getElementById('add-friend-form');
    if (addFriendForm) {
        addFriendForm.addEventListener('submit', handleAddFriend);
    }
}); 