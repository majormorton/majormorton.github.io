// Sound Score Dashboard Interactivity

document.addEventListener('DOMContentLoaded', function() {
    
    // Section hover effects and information display
    const sections = document.querySelectorAll('.section');
    const microSections = document.querySelectorAll('.micro');
    
    // Enhance section hover interactions
    sections.forEach(section => {
        section.addEventListener('mouseenter', function() {
            // Get section number
            const sectionNumber = this.querySelector('.section-number').textContent;
            const sectionName = this.querySelector('h4').textContent;
            
            // Highlight corresponding sections in other visualizations
            highlightRelatedElements(sectionNumber, sectionName);
        });
        
        section.addEventListener('mouseleave', function() {
            // Remove highlights
            resetHighlights();
        });
    });
    
    // Micro section interactions
    microSections.forEach(micro => {
        micro.addEventListener('mouseenter', function() {
            const sectionNumber = this.querySelector('.section-number').textContent;
            
            // Highlight the micro sequence group in the main timeline
            const microGroup = document.querySelector('.micro-group');
            if (microGroup) {
                microGroup.classList.add('highlighted');
            }
            
            // Highlight this specific micro section
            this.classList.add('active');
        });
        
        micro.addEventListener('mouseleave', function() {
            const microGroup = document.querySelector('.micro-group');
            if (microGroup) {
                microGroup.classList.remove('highlighted');
            }
            this.classList.remove('active');
        });
    });
    
    // Function to highlight related elements
    function highlightRelatedElements(sectionNumber, sectionName) {
        // Highlight the intensity curve points if they match
        const intensityPoints = document.querySelectorAll('.intensity-svg text');
        intensityPoints.forEach(point => {
            if (point.textContent === sectionName) {
                const circle = point.previousElementSibling;
                if (circle) {
                    circle.setAttribute('r', '8');
                    circle.style.fill = '#ff0000';
                }
            }
        });
        
        // Highlight related audio waveform section
        highlightAudioWaveform(sectionNumber);
    }
    
    // Function to reset all highlights
    function resetHighlights() {
        // Reset intensity point sizes
        const intensityCircles = document.querySelectorAll('.intensity-svg circle');
        intensityCircles.forEach(circle => {
            circle.setAttribute('r', '6');
            circle.style.fill = '#661111';
        });
        
        // Reset audio waveform highlights
        resetAudioWaveformHighlights();
    }
    
    // Function to highlight specific audio waveform section
    function highlightAudioWaveform(sectionNumber) {
        // This is a placeholder - in a real implementation, we would
        // identify the specific path element corresponding to the section
        // and apply styling to highlight it
        console.log(`Highlighting waveform for section ${sectionNumber}`);
    }
    
    // Function to reset audio waveform highlights
    function resetAudioWaveformHighlights() {
        // Reset any highlighted waveform sections
        console.log("Resetting waveform highlights");
    }
    
    // Toggle section details on mobile
    if (window.innerWidth <= 900) {
        sections.forEach(section => {
            section.addEventListener('click', function() {
                const details = this.querySelector('.section-details');
                
                // Hide all other details first
                document.querySelectorAll('.section-details').forEach(el => {
                    if (el !== details) {
                        el.classList.remove('show-mobile');
                    }
                });
                
                // Toggle this section's details
                details.classList.toggle('show-mobile');
            });
        });
    }
    
    // Add playback simulation functionality
    const playButton = document.createElement('button');
    playButton.id = 'playback-button';
    playButton.className = 'playback-button';
    playButton.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg> Play';
    
    const timelineTrack = document.querySelector('.timeline-track');
    const timelineContainer = document.querySelector('.timeline');
    timelineContainer.insertBefore(playButton, timelineTrack);
    
    // Create playback position marker
    const playbackMarker = document.createElement('div');
    playbackMarker.className = 'playback-marker';
    timelineTrack.after(playbackMarker);
    
    // Create current time display
    const currentTimeDisplay = document.createElement('div');
    currentTimeDisplay.className = 'current-time';
    currentTimeDisplay.textContent = '00:00';
    timelineContainer.insertBefore(currentTimeDisplay, playbackMarker);
    
    // Playback functionality
    let isPlaying = false;
    let playbackInterval;
    let currentTime = 0;
    const totalDuration = 832; // 13:52 in seconds
    
    playButton.addEventListener('click', function() {
        if (isPlaying) {
            // Pause
            clearInterval(playbackInterval);
            this.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg> Play';
            isPlaying = false;
        } else {
            // Play
            this.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg> Pause';
            isPlaying = true;
            
            playbackInterval = setInterval(function() {
                currentTime += 1;
                if (currentTime > totalDuration) {
                    currentTime = 0;
                }
                
                // Update marker position
                const percentage = (currentTime / totalDuration) * 100;
                playbackMarker.style.left = `${percentage}%`;
                
                // Update time display
                const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
                const seconds = (currentTime % 60).toString().padStart(2, '0');
                currentTimeDisplay.textContent = `${minutes}:${seconds}`;
                
                // Highlight current section
                highlightCurrentSection(currentTime);
                
            }, 1000); // Update every second
        }
    });
    
    // Function to highlight current section based on playback time
    function highlightCurrentSection(currentTimeInSeconds) {
        // Remove highlight from all sections
        sections.forEach(section => {
            section.classList.remove('current-section');
        });
        
        // Find and highlight current section
        sections.forEach(section => {
            const timecode = section.querySelector('.timecode').textContent;
            const [start, end] = timecode.split('-');
            
            // Convert timecodes to seconds
            const startParts = start.split(':');
            const startSeconds = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
            
            const endParts = end.split(':');
            const endSeconds = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
            
            if (currentTimeInSeconds >= startSeconds && currentTimeInSeconds < endSeconds) {
                section.classList.add('current-section');
            }
        });
    }
    
    // Add event listener for manual timeline navigation
    timelineTrack.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        
        // Set current time based on click position
        currentTime = Math.floor(percentage * totalDuration);
        
        // Update marker position immediately
        playbackMarker.style.left = `${percentage * 100}%`;
        
        // Update time display
        const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
        const seconds = (currentTime % 60).toString().padStart(2, '0');
        currentTimeDisplay.textContent = `${minutes}:${seconds}`;
        
        // Highlight current section
        highlightCurrentSection(currentTime);
    });
    
    // Add window resize handler for responsive layout
    window.addEventListener('resize', function() {
        // Add any resize-specific functionality here
        const isMobile = window.innerWidth <= 900;
        
        // Adjust display of section details based on screen size
        const sectionDetails = document.querySelectorAll('.section-details h4');
        sectionDetails.forEach(el => {
            el.style.display = isMobile ? 'none' : 'block';
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === ' ' || e.key === 'k') {
            // Space or K key toggles playback
            playButton.click();
        } else if (e.key === 'ArrowRight') {
            // Right arrow skips forward 10 seconds
            currentTime = Math.min(currentTime + 10, totalDuration);
            updatePlaybackPosition();
        } else if (e.key === 'ArrowLeft') {
            // Left arrow rewinds 10 seconds
            currentTime = Math.max(currentTime - 10, 0);
            updatePlaybackPosition();
        }
    });
    
    // Helper function to update playback position display
    function updatePlaybackPosition() {
        const percentage = (currentTime / totalDuration) * 100;
        playbackMarker.style.left = `${percentage}%`;
        
        const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
        const seconds = (currentTime % 60).toString().padStart(2, '0');
        currentTimeDisplay.textContent = `${minutes}:${seconds}`;
        
        highlightCurrentSection(currentTime);
    }
    
    // Initialize audio context for potential sound playback integration
    let audioContext;
    
    try {
        // Feature detection
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        
        // This sets up the audio environment for future implementation
        // We could add actual sound samples corresponding to each section
        console.log("Audio context initialized successfully");
    } catch (e) {
        console.log("Web Audio API is not supported in this browser");
    }
});
