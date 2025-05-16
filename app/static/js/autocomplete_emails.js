document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.zIndex = '1000';
    dropdown.style.background = '#fff';
    dropdown.style.border = '1px solid #e5e7eb';
    dropdown.style.borderRadius = '0.5rem';
    dropdown.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
    dropdown.style.display = 'none';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';

    emailInput.parentNode.style.position = 'relative';
    emailInput.parentNode.appendChild(dropdown);

    let lastQuery = '';
    emailInput.addEventListener('input', function () {
        const query = emailInput.value.trim();
        if (query.length < 3) {
            dropdown.style.display = 'none';
            return;
        }
        if (query === lastQuery) return;
        lastQuery = query;

        fetch(`/api/users/search?query=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(users => {
                dropdown.innerHTML = '';
                if (users.length === 0) {
                    dropdown.style.display = 'none';
                    return;
                }
                users.forEach(user => {
                    const option = document.createElement('div');
                    option.textContent = user.email;
                    option.className = 'autocomplete-option';
                    option.style.padding = '0.5rem 1rem';
                    option.style.cursor = 'pointer';
                    option.addEventListener('mousedown', function (e) {
                        e.preventDefault();
                        emailInput.value = user.email;
                        dropdown.style.display = 'none';
                    });
                    dropdown.appendChild(option);
                });
                dropdown.style.display = 'block';
            });
    });

    // Hide dropdown on blur
    emailInput.addEventListener('blur', function () {
        setTimeout(() => dropdown.style.display = 'none', 100);
    });
});