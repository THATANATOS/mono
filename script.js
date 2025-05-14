// Elements
        const startCameraBtn = document.getElementById('start-camera');
        const cameraContainer = document.getElementById('camera-container');
        const videoElement = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        const photoStrip = document.getElementById('photo-strip');
        const stripContext = photoStrip.getContext('2d');
        const closeCameraBtn = document.getElementById('close-camera');

        const filterSelect = document.getElementById('filter-select');
        const countdownInput = document.getElementById('countdown-input');
        const countdownValue = document.getElementById('countdown-value');
        const countdownOverlay = document.getElementById('countdown-overlay');
        const countdownText = document.getElementById('countdown-text');

        const addCaptionBtn = document.getElementById('add-caption');
        const modalOverlay = document.getElementById('modal-overlay');
        const saveCaptionBtn = document.getElementById('save-caption');
        const cancelCaptionBtn = document.getElementById('cancel-caption');
        const captionInput = document.getElementById('caption-input');

        const downloadBtn = document.getElementById('download');
        const resetBtn = document.getElementById('reset');
        const captureBtn = document.getElementById('capture');

        let userCaption = '';
        let photos = [];
        let countdownInterval;

        // Update countdown value display
        countdownInput.addEventListener('input', () => {
            countdownValue.textContent = `${countdownInput.value}s`;
        });

        // Open Camera
        startCameraBtn.addEventListener('click', async () => {
            // Add animation to button
            startCameraBtn.classList.add('animate-pulse');
            
            // Show loading state
            startCameraBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading Camera...';
            
            cameraContainer.style.display = 'flex';
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: 'user',
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                
                videoElement.srcObject = stream;
                startCameraBtn.innerHTML = '<i class="fas fa-camera mr-2"></i> Start Snapping';
                startCameraBtn.classList.remove('animate-pulse');
                
                // Play camera sound
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-camera-shutter-click-1133.mp3');
                audio.volume = 0.3;
                audio.play();
                
            } catch (error) {
                alert('Camera access denied or unavailable.');
                startCameraBtn.innerHTML = '<i class="fas fa-camera mr-2"></i> Start Snapping';
                startCameraBtn.classList.remove('animate-pulse');
            }
        });

        // Show Caption Modal
        addCaptionBtn.addEventListener('click', () => {
            captionInput.value = userCaption;
            modalOverlay.classList.remove('hidden');
            
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');
            audio.volume = 0.3;
            audio.play();
        });

        // Save Caption
        saveCaptionBtn.addEventListener('click', () => {
            userCaption = captionInput.value.trim();
            
            // Show notification
            showNotification(`Caption added: "${userCaption}"`);
            
            modalOverlay.classList.add('hidden');
            
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
            audio.volume = 0.3;
            audio.play();
        });

        // Cancel Caption
        cancelCaptionBtn.addEventListener('click', () => {
            modalOverlay.classList.add('hidden');
            
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-close-erase-1178.mp3');
            audio.volume = 0.3;
            audio.play();
        });

        // Apply Filter
        filterSelect.addEventListener('change', () => {
            videoElement.style.filter = getFilterStyle(filterSelect.value);
            
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3');
            audio.volume = 0.2;
            audio.play();
        });

        // Capture Photo with Countdown
        captureBtn.addEventListener('click', () => {
            const countdownValue = parseInt(countdownInput.value) || 3;
            
            // Disable button during countdown
            captureBtn.disabled = true;
            
            // Show countdown overlay
            countdownOverlay.classList.remove('hidden');
            countdownText.textContent = countdownValue;
            
            let countdownTimer = countdownValue;
            
            // Play countdown sound
            const countdownAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-countdown-921.mp3');
            countdownAudio.volume = 0.3;
            countdownAudio.play();
            
            countdownInterval = setInterval(() => {
                countdownTimer--;
                countdownText.textContent = countdownTimer;
                
                if (countdownTimer < 0) {
                    clearInterval(countdownInterval);
                    
                    // Capture Image
                    const date = new Date().toLocaleDateString();
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    
                    context.filter = getFilterStyle(filterSelect.value);
                    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    
                    // Play shutter sound
                    const shutterAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-camera-shutter-click-1133.mp3');
                    shutterAudio.volume = 0.5;
                    shutterAudio.play();
                    
                    // Add flash effect
                    cameraContainer.style.backgroundColor = 'white';
                    setTimeout(() => {
                        cameraContainer.style.backgroundColor = 'rgb(15 15 15)';
                    }, 100);
                    
                    const imgData = canvas.toDataURL('image/png');
                    photos.push({ imgData, caption: userCaption, date });
                    
                    displayPhotoStrip();
                    
                    if (photos.length >= 1) {
                        downloadBtn.style.display = 'flex';
                    }
                    
                    // Re-enable button
                    captureBtn.disabled = false;
                    
                    // Hide countdown overlay
                    countdownOverlay.classList.add('hidden');
                }
            }, 1000);
        });

        // Display Photo Strip
        function displayPhotoStrip() {
            const photoHeightWithText = canvas.height + 60;
            
            photoStrip.width = canvas.width;
            photoStrip.height = photoHeightWithText * photos.length;
            
            // Draw polaroid-style background for each photo
            photos.forEach((photo, index) => {
                const img = new Image();
                img.src = photo.imgData;
                img.onload = () => {
                    // Draw polaroid background
                    stripContext.fillStyle = 'white';
                    stripContext.fillRect(0, photoHeightWithText * index, canvas.width, photoHeightWithText);
                    
                    // Add shadow effect
                    stripContext.shadowColor = 'rgba(0,0,0,0.1)';
                    stripContext.shadowBlur = 10;
                    stripContext.shadowOffsetY = 5;
                    
                    // Draw image with border
                    const borderSize = 10;
                    stripContext.fillStyle = '#f3f4f6';
                    stripContext.fillRect(
                        borderSize, 
                        photoHeightWithText * index + borderSize, 
                        canvas.width - borderSize * 2, 
                        canvas.height - borderSize * 2
                    );
                    
                    stripContext.drawImage(
                        img, 
                        borderSize, 
                        photoHeightWithText * index + borderSize, 
                        canvas.width - borderSize * 2, 
                        canvas.height - borderSize * 2
                    );
                    
                    // Reset shadow
                    stripContext.shadowColor = 'transparent';
                    
                    // Draw caption
                    stripContext.font = '20px "Inter", sans-serif';
                    stripContext.fillStyle = '#4b5563';
                    stripContext.textAlign = 'center';
                    
                    const captionY = photoHeightWithText * index + canvas.height + 30;
                    const dateY = captionY + 30;
                    
                    stripContext.fillText(photo.caption || 'Your Caption Here', canvas.width / 2, captionY);
                    
                    // Draw date
                    stripContext.font = '16px "Inter", sans-serif';
                    stripContext.fillStyle = '#9ca3af';
                    stripContext.fillText(photo.date, canvas.width / 2, dateY);
                };
            });
            
            // Auto-scroll to bottom
            const stripContainer = document.querySelector('.photo-strip-container');
            stripContainer.scrollTop = stripContainer.scrollHeight;
            
            // Show notification
            showNotification('Photo added to your strip!');
        }

        // Download Photo Strip
        downloadBtn.addEventListener('click', () => {
            const stripURL = photoStrip.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = stripURL;
            link.download = `memorysnap_${new Date().toISOString().slice(0, 10)}.png`;
            link.click();
            
            // Play success sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
            audio.volume = 0.3;
            audio.play();
            
            // Show notification
            showNotification('Photo strip downloaded!');
        });

        // Reset Photo Strip
        resetBtn.addEventListener('click', () => {
            photos = [];
            stripContext.clearRect(0, 0, photoStrip.width, photoStrip.height);
            downloadBtn.style.display = 'none';
            
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-close-erase-1178.mp3');
            audio.volume = 0.3;
            audio.play();
            
            // Show notification
            showNotification('Photo strip cleared!');
        });

        // Filter Function
        function getFilterStyle(filter) {
            switch (filter) {
                case 'high-contrast': return 'contrast(200%) brightness(0.8)';
                case 'sepia': return 'sepia(100%)';
                case 'invert': return 'invert(100%)';
                default: return filter === 'none' ? 'none' : 'grayscale(100%)';
            }
        }

        // Close Camera
        closeCameraBtn.addEventListener('click', () => {
            // Clear any ongoing countdown
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            const stream = videoElement.srcObject;
            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
            
            videoElement.srcObject = null;
            cameraContainer.style.display = 'none';
            
            // Play sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-close-erase-1178.mp3');
            audio.volume = 0.3;
            audio.play();
        });

        // Notification function
        function showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in';
            notification.innerHTML = `
                <i class="fas fa-check-circle text-gray-300 mr-2"></i>
                <span>${message}</span>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('animate-fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out forwards;
            }
            
            .animate-fade-out {
                animation: fadeOut 0.3s ease-out forwards;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(20px);
                }
            }
        `;
        document.head.appendChild(style);