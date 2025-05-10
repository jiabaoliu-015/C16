/**
 * Shared Export Functionality for Share Page
 * Handles exporting charts and tables to images/PDF
 */
(function() {
    // Configuration for export buttons and their target elements
    const exportConfigs = [
        {
            btnId: 'export-intensity',
            targetId: 'performance-message',
            filename: 'weekly_learning_intensity',
            title: 'Weekly Learning Intensity Analysis'
        },
        {
            btnId: 'export-course',
            targetSelector: '#export-course',
            containerSelector: '.flex.flex-col.lg\\:flex-row',
            filename: 'course_learning_proportion',
            title: 'Course Learning Proportion'
        },
        {
            btnId: 'export-sessions',
            targetId: 'session-list',
            filename: 'sessions',
            title: 'Sessions'
        }
    ];

    // Debounce function to prevent multiple rapid clicks
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Initialize export buttons
    function initExportButtons() {
        exportConfigs.forEach(config => {
            const btn = document.getElementById(config.btnId);
            if (btn) {
                btn.addEventListener('click', debounce(() => {
                    exportElement(config);
                }, 500));
            }
        });
    }

    // Export an element to PDF
    async function exportElement(config) {
        try {
            // Show loading state on button
            const btn = document.getElementById(config.btnId);
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg class="animate-spin h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Exporting...';
            btn.disabled = true;

            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Add title
            pdf.setFontSize(16);
            pdf.setTextColor(33, 33, 33);
            pdf.text(config.title, 20, 20);
            
            // Add date
            const date = new Date().toLocaleDateString();
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated on ${date}`, 20, 27);
            
            // Handle different export configurations
            if (config.containerSelector) {
                // For elements with container selector (like course learning proportion)
                const btn = document.getElementById(config.btnId);
                // Find the closest parent container that contains the charts
                const container = btn.closest('.bg-white.rounded-lg.shadow-xl.p-6.mb-6');
                
                if (container) {
                    // Use landscape orientation for wider elements
                    pdf.deletePage(1);
                    pdf.addPage('a4', 'landscape');
                    
                    // Add title in landscape mode
                    pdf.setFontSize(16);
                    pdf.setTextColor(33, 33, 33);
                    pdf.text(config.title, 20, 20);
                    
                    // Add date in landscape mode
                    const date = new Date().toLocaleDateString();
                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`Generated on ${date}`, 20, 27);
                    
                    // Get individual elements
                    const pieChart = container.querySelector('#course-pie-chart');
                    const barChart = container.querySelector('#weekly-bar-chart');
                    const legend = container.querySelector('#course-legend');
                    
                    if (pieChart && barChart && legend) {
                        // Capture pie chart
                        const pieCanvas = await html2canvas(pieChart.parentNode, {
                            scale: 2,
                            backgroundColor: '#ffffff',
                            logging: false,
                            useCORS: true,
                            allowTaint: true
                        });
                        
                        // Capture bar chart
                        const barCanvas = await html2canvas(barChart.parentNode, {
                            scale: 2,
                            backgroundColor: '#ffffff',
                            logging: false,
                            useCORS: true,
                            allowTaint: true
                        });
                        
                        // Capture legend
                        const legendCanvas = await html2canvas(legend, {
                            scale: 2,
                            backgroundColor: '#ffffff',
                            logging: false,
                            useCORS: true,
                            allowTaint: true
                        });
                        
                        // Convert to image data
                        const pieImgData = pieCanvas.toDataURL('image/png');
                        const barImgData = barCanvas.toDataURL('image/png');
                        const legendImgData = legendCanvas.toDataURL('image/png');
                        
                        // Calculate dimensions for better layout
                        const pageWidth = pdf.internal.pageSize.width;
                        const pageHeight = pdf.internal.pageSize.height;
                        
                        // Add pie chart to PDF (left side)
                        const pieWidth = 90;
                        const pieHeight = pieCanvas.height * pieWidth / pieCanvas.width;
                        pdf.addImage(pieImgData, 'PNG', 20, 35, pieWidth, pieHeight);
                        
                        // Add bar chart to PDF (center)
                        const barWidth = 90;
                        const barHeight = barCanvas.height * barWidth / barCanvas.width;
                        pdf.addImage(barImgData, 'PNG', pageWidth/2 - barWidth/2, 35, barWidth, barHeight);
                        
                        // Add legend to PDF (right side)
                        const legendWidth = 90;
                        const legendHeight = legendCanvas.height * legendWidth / legendCanvas.width;
                        pdf.addImage(legendImgData, 'PNG', pageWidth - legendWidth - 20, 35, legendWidth, legendHeight);
                    } else {
                        // Fallback to capturing the entire container if individual elements can't be found
                        const element = container.querySelector(config.containerSelector);
                        if (element) {
                            // Capture the entire container with proper styling
                            const canvas = await html2canvas(element, {
                                scale: 2,
                                backgroundColor: '#ffffff',
                                logging: false,
                                useCORS: true,
                                allowTaint: true,
                                // Ensure we capture the element with its responsive layout
                                windowWidth: 1200, // Force desktop layout
                                onclone: (clonedDoc) => {
                                    // Find the flex container directly in the cloned document
                                    const clonedElement = clonedDoc.querySelector(config.containerSelector);
                                    if (clonedElement) {
                                        // Force the cloned element to use row layout (desktop view)
                                        clonedElement.style.display = 'flex';
                                        clonedElement.style.flexDirection = 'row';
                                        
                                        // Ensure each child takes up equal width
                                        Array.from(clonedElement.children).forEach(child => {
                                            child.style.width = '33.33%';
                                            child.style.marginBottom = '0';
                                        });
                                    }
                                }
                            });
                            
                            const imgData = canvas.toDataURL('image/png');
                            
                            // Calculate aspect ratio to fit within landscape PDF
                            const imgWidth = 250;
                            const imgHeight = canvas.height * imgWidth / canvas.width;
                            
                            // Center the image in the landscape page
                            const xPos = (pdf.internal.pageSize.width - imgWidth) / 2;
                            pdf.addImage(imgData, 'PNG', xPos, 35, imgWidth, imgHeight);
                        }
                    }
                }
            } else if (config.targetId2) {
                // Legacy support for multiple elements (keeping for backward compatibility)
                const element1 = document.getElementById(config.targetId);
                const element2 = document.getElementById(config.targetId2);
                const element3 = document.getElementById(config.targetId3);
                
                if (element1 && element2 && element3) {
                    // Capture pie chart
                    const canvas1 = await html2canvas(element1, {
                        scale: 2,
                        backgroundColor: null,
                        logging: false
                    });
                    
                    // Capture bar chart
                    const canvas2 = await html2canvas(element2, {
                        scale: 2,
                        backgroundColor: null,
                        logging: false
                    });
                    
                    // Capture legend
                    const canvas3 = await html2canvas(element3, {
                        scale: 2,
                        backgroundColor: null,
                        logging: false
                    });
                    
                    // Add pie chart to PDF
                    const imgData1 = canvas1.toDataURL('image/png');
                    pdf.addImage(imgData1, 'PNG', 20, 35, 80, 80);
                    
                    // Add bar chart to PDF
                    const imgData2 = canvas2.toDataURL('image/png');
                    pdf.addImage(imgData2, 'PNG', 110, 35, 80, 80);
                    
                    // Add legend to PDF
                    const imgData3 = canvas3.toDataURL('image/png');
                    pdf.addImage(imgData3, 'PNG', 20, 125, 170, 40);
                }
            } else if (config.btnId === 'export-intensity') {
                // For Weekly Learning Intensity Analysis
                const element = document.getElementById(config.targetId);
                if (element) {
                    // Use portrait orientation for this element
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    
                    // Calculate aspect ratio to fit within PDF
                    const imgWidth = 170;
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    
                    pdf.addImage(imgData, 'PNG', 20, 35, imgWidth, imgHeight);
                }
            } else if (config.btnId === 'export-sessions') {
                // For Sessions
                const element = document.getElementById(config.targetId);
                if (element) {
                    // Use landscape orientation for sessions table
                    pdf.deletePage(1);
                    pdf.addPage('a4', 'landscape');
                    
                    // Add title in landscape mode
                    pdf.setFontSize(16);
                    pdf.setTextColor(33, 33, 33);
                    pdf.text(config.title, 20, 20);
                    
                    // Add date in landscape mode
                    const date = new Date().toLocaleDateString();
                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`Generated on ${date}`, 20, 27);
                    
                    // Get the table header
                    const tableHeader = document.querySelector('.flex.items-center.text-gray-700.font-bold.text-sm.border-b.border-gray-300.pb-2.justify-center');
                    
                    // Capture table header
                    let headerCanvas = null;
                    if (tableHeader) {
                        headerCanvas = await html2canvas(tableHeader, {
                            scale: 2,
                            backgroundColor: '#ffffff',
                            logging: false,
                            useCORS: true,
                            allowTaint: true
                        });
                    }
                    
                    // Capture sessions list
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });
                    
                    // Calculate dimensions for better layout
                    const pageWidth = pdf.internal.pageSize.width;
                    const pageHeight = pdf.internal.pageSize.height;
                    
                    // Add table header to PDF if available
                    if (headerCanvas) {
                        const headerImgData = headerCanvas.toDataURL('image/png');
                        const headerWidth = 250;
                        const headerHeight = headerCanvas.height * headerWidth / headerCanvas.width;
                        const headerXPos = (pageWidth - headerWidth) / 2;
                        pdf.addImage(headerImgData, 'PNG', headerXPos, 35, headerWidth, headerHeight);
                        
                        // Add sessions list below the header
                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = 250;
                        const imgHeight = canvas.height * imgWidth / canvas.width;
                        const xPos = (pageWidth - imgWidth) / 2;
                        pdf.addImage(imgData, 'PNG', xPos, 35 + headerHeight + 5, imgWidth, imgHeight);
                    } else {
                        // Add only sessions list if header is not available
                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = 250;
                        const imgHeight = canvas.height * imgWidth / canvas.width;
                        const xPos = (pageWidth - imgWidth) / 2;
                        pdf.addImage(imgData, 'PNG', xPos, 35, imgWidth, imgHeight);
                    }
                }
            } else {
                // Default case for other single element exports
                const element = document.getElementById(config.targetId);
                if (element) {
                    const canvas = await html2canvas(element, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        logging: false,
                        useCORS: true,
                        allowTaint: true
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    
                    // Calculate aspect ratio to fit within PDF
                    const imgWidth = 170;
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    
                    pdf.addImage(imgData, 'PNG', 20, 35, imgWidth, imgHeight);
                }
            }
            
            // Save the PDF
            pdf.save(`${config.filename}.pdf`);
            
            // Restore button state
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            // Show success message
            showToast('Export successful!');
        } catch (error) {
            console.error('Export failed:', error);
            
            // Restore button state
            const btn = document.getElementById(config.btnId);
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke-linecap="round" stroke-linejoin="round"/></svg> Export';
            btn.disabled = false;
            
            // Show error message
            showToast('Export failed. Please try again.', true);
        }
    }

    // Show toast notification
    function showToast(message, isError = false) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('export-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'export-toast';
            toast.className = 'fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-50 opacity-0';
            document.body.appendChild(toast);
        }
        
        // Set toast style based on type
        toast.className = `fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 z-50 ${isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`;
        
        // Set message and show toast
        toast.textContent = message;
        toast.style.opacity = '1';
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initExportButtons);
})();
