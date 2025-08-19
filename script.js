document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sections = {
        size: document.getElementById('size-selection-section'),
        capture: document.getElementById('capture-section'),
        edit: document.getElementById('edit-section'),
        layout: document.getElementById('layout-section'),
    };

    const buttons = {
        sizeBtns: document.querySelectorAll('.size-btn'),
        backToSizeBtn: document.getElementById('back-to-size-btn'),
        captureBtn: document.getElementById('capture-btn'),
        backToCaptureBtn: document.getElementById('back-to-capture-btn'),
        confirmEditBtn: document.getElementById('confirm-edit-btn'),
        backToEditBtn: document.getElementById('back-to-edit-btn'),
        downloadBtn: document.getElementById('download-btn'),
    };
    
        const webcamEl = document.getElementById('webcam');
    const captureInstruction = document.getElementById('capture-instruction');

    // --- State ---
    let currentStep = 'size';
    let selectedSize = null;
    let backgroundImageData = null;
        let personImageData = null;
    let stream = null; // To hold the stream object

    // --- Functions ---

    /**
     * Shows the specified section and hides others.
     * @param {string} stepName - The key of the section to show ('size', 'capture', 'edit', 'layout').
     */
        /**
     * Stops the webcam stream.
     */
    function stopWebcam() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    /**
     * Initializes and starts the webcam stream.
     */
    async function initWebcam() {
        stopWebcam(); // Stop previous stream if exists
        try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            webcamEl.srcObject = stream;
        } catch (err) {
            console.error("Error accessing webcam:", err);
            captureInstruction.textContent = 'カメラにアクセスできませんでした。ブラウザの権限を確認してください。';
        }
    }

    function showStep(stepName) {
        currentStep = stepName;
        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });
                if (stepName === 'capture') {
            initWebcam();
        } else {
            stopWebcam();
        }

        if (sections[stepName]) {
            sections[stepName].style.display = 'block';
        }
    }

    // --- Event Listeners ---

    // Size selection buttons
    buttons.sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedSize = {
                width: parseInt(btn.dataset.width),
                height: parseInt(btn.dataset.height),
                name: btn.textContent
            };
                        console.log('Selected size:', selectedSize);
            showStep('capture');
        });
    });

    // Back buttons
    buttons.backToSizeBtn.addEventListener('click', () => showStep('size'));
    buttons.backToCaptureBtn.addEventListener('click', () => showStep('capture'));
    buttons.backToEditBtn.addEventListener('click', () => showStep('edit'));

    // --- Initial Setup ---
    showStep('size');

});
