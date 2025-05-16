document.addEventListener('DOMContentLoaded', function () {
    const reflectionsList = document.getElementById('reflections-list');
    const addBtn = document.getElementById('add-reflection-btn');
    const modal = document.getElementById('reflection-modal');
    const closeModal = document.getElementById('close-modal');
    const reflectionForm = document.getElementById('reflection-form');
    const contentInput = document.getElementById('reflection-content');
    const charCount = document.getElementById('char-count');
    contentInput.addEventListener('input', () => {
        charCount.textContent = `${contentInput.value.length}/500`;
    });
    const moodInput = document.getElementById('reflection-mood');
    const tagsInput = document.getElementById('reflection-tags');
    const errorMsg = document.getElementById('reflection-error');
    let editingId = null;

    // Function to show flash messages
    function showFlashMessage(message, category, duration = 3000) {
        const flashContainer = document.querySelector('.flash-container');
        const flashMessage = document.createElement('div');
        flashMessage.className = 'flash-message';
        flashMessage.innerHTML = `
            <div class="alert alert-${category}">
                ${message}
            </div>
        `;
        flashContainer.appendChild(flashMessage);

        // Remove the message after duration
        setTimeout(() => {
            flashMessage.classList.add('fade-out');
            setTimeout(() => {
                flashMessage.remove();
            }, 500);
        }, duration);
    }

    function fetchReflections() {
        fetch('/api/reflections')
            .then(res => res.json())
            .then(data => {
                reflectionsList.innerHTML = '';
                if (data.length === 0) {
                    reflectionsList.innerHTML = `
                        <div class="section-content-center">
                            <img src="/static/images/empty-reflection.png" alt="" class="empty-state-image" />
                            <span>No reflections yet. Start by adding your thoughts!</span>
                        </div>
                    `;
                    return;
                }
                data.forEach(r => {
                    const card = document.createElement('div');
                    card.className = 'p-3 bg-gray-100 rounded flex justify-between items-start group';
                    card.innerHTML = `
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                ${r.mood ? `<span class="text-xl">${r.mood}</span>` : ''}
                                <span class="text-xs text-gray-400">${new Date(r.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                            <p class="text-gray-700">${r.content}</p>
                            ${r.tags ? `<div class="mt-1 flex flex-wrap gap-1">${r.tags.split(',').map(t => `<span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">${t.trim()}</span>`).join('')}</div>` : ''}
                        </div>
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button class="edit-btn text-blue-500 hover:underline text-xs" data-id="${r.id}" title="Edit">Edit</button>
                            <button class="delete-btn text-red-400 hover:underline text-xs" data-id="${r.id}" title="Delete">Delete</button>
                        </div>
                    `;
                    reflectionsList.appendChild(card);
                });
                // Attach edit/delete handlers
                reflectionsList.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.onclick = () => startEdit(btn.dataset.id);
                });
                reflectionsList.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.onclick = () => deleteReflection(btn.dataset.id);
                });
            })
            .catch(error => {
                showFlashMessage('Failed to load reflections. Please try again.', 'error');
            });
    }

    function openModal(editing = false) {
        modal.classList.add('show');
        if (!editing) {
            reflectionForm.reset();
            editingId = null;
        }
        errorMsg.textContent = '';
    }

    function closeModalFn() {
        modal.classList.remove('show');
        editingId = null;
    }

    addBtn.onclick = () => openModal(false);
    closeModal.onclick = closeModalFn;

    reflectionForm.onsubmit = function(e) {
        e.preventDefault();
        const content = contentInput.value.trim();
        const mood = moodInput.value;
        const tags = tagsInput.value;
        if (!content) {
            showFlashMessage('Reflection cannot be empty.', 'error');
            return;
        }
        const payload = JSON.stringify({ content, mood, tags });
        const url = editingId ? `/api/reflections/${editingId}` : '/api/reflections';
        const method = editingId ? 'PUT' : 'POST';
        const csrfToken = document.querySelector('input[name="csrf_token"]').value;
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: payload
        }).then(res => {
            if (!res.ok) return res.json().then(d => { throw d; });
            return res.json();
        }).then(() => {
            closeModalFn();
            fetchReflections();
            showFlashMessage(editingId ? 'Reflection updated successfully!' : 'Reflection added successfully!', 'success');
        }).catch(err => {
            showFlashMessage(err.error || 'Error saving reflection.', 'error');
        });
    };

    function startEdit(id) {
        fetch(`/api/reflections`)
            .then(res => res.json())
            .then(data => {
                const r = data.find(x => x.id == id);
                if (r) {
                    contentInput.value = r.content;
                    moodInput.value = r.mood || '';
                    tagsInput.value = r.tags || '';
                    editingId = id;
                    openModal(true);
                }
            })
            .catch(error => {
                showFlashMessage('Failed to load reflection for editing.', 'error');
            });
    }

    function deleteReflection(id) {
        // Create flash message for confirmation
        const flashContainer = document.querySelector('.flash-container');
        const flashMessage = document.createElement('div');
        flashMessage.className = 'flash-message';
        flashMessage.innerHTML = `
            <div class="alert bg-violet-100 text-black border border-violet-200 shadow-lg rounded-lg p-4 max-w-md mx-auto" style="color: black !important;">
                Are you sure you want to delete this reflection?
                <div class="mt-2 flex justify-end space-x-2">
                    <button class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-black font-medium" onclick="this.closest('.flash-message').remove()">Cancel</button>
                    <button class="px-3 py-1 bg-violet-500 hover:bg-violet-600 text-black font-medium rounded" id="confirm-delete">Delete</button>
                </div>
            </div>
        `;
        flashContainer.appendChild(flashMessage);

        // Add event listener to the confirm button
        document.getElementById('confirm-delete').addEventListener('click', function() {
            const csrfToken = document.querySelector('input[name="csrf_token"]').value;
            fetch(`/api/reflections/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
            .then(() => {
                flashMessage.remove();
                fetchReflections();
                showFlashMessage('Reflection deleted successfully!', 'success');
            })
            .catch(error => {
                flashMessage.remove();
                showFlashMessage('Failed to delete reflection. Please try again.', 'error');
            });
        });
    }

    // Initial load
    fetchReflections();
});