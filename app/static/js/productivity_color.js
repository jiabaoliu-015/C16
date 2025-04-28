document.addEventListener("DOMContentLoaded", () => {
    const productivityElements = document.querySelectorAll("[data-productivity]");

    productivityElements.forEach(element => {
        const score = parseInt(element.getAttribute("data-productivity"), 10);

        // Ensure consistent circular badge styles
        element.classList.add("w-8", "h-8", "flex", "items-center", "justify-center", "rounded-full", "font-bold");

        // Apply color based on productivity score
        if (score >= 0 && score <= 3) {
            element.classList.add("bg-red-200", "text-red-800");
        } else if (score >= 4 && score <= 5) {
            element.classList.add("bg-orange-200", "text-orange-800");
        } else if (score >= 6 && score <= 7) {
            element.classList.add("bg-yellow-200", "text-yellow-800");
        } else if (score >= 8 && score <= 10) {
            element.classList.add("bg-green-200", "text-green-800");
        }
    });
});
