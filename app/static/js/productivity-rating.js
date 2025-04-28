document.addEventListener("DOMContentLoaded", () => {
    const productivityInput = document.getElementById("new_productivity");
    const productivityValue = document.getElementById("productivity-value");
    const productivityDescriptor = document.getElementById("productivity-descriptor");

    const descriptors = [
        "Procrastinated the whole time",
        "Barely started",
        "Distracted",
        "Could be better",
        "Average effort",
        "Decent focus",
        "Productive",
        "Good",
        "Very productive",
        "Excellent",
        "Peak performance"
    ];

    const updateProductivity = () => {
        const value = productivityInput.value;
        productivityValue.textContent = value;
        productivityDescriptor.textContent = descriptors[value];
    };

    productivityInput.addEventListener("input", updateProductivity);

    // Initialize on page load
    updateProductivity();
});
