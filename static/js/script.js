// Enhanced JS: Loading states, animations, dark mode, confetti
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const previewImg = document.getElementById('previewImg');
    const predictBtn = document.getElementById('predictBtn');
    const result = document.getElementById('result');
    const annotatedImg = document.getElementById('annotatedImg');
    const totalDetections = document.getElementById('totalDetections');
    const tip = document.getElementById('tip');
    const detectionList = document.getElementById('detectionList');
    const summary = document.getElementById('summary');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const uploadArea = document.getElementById('uploadArea');
    const themeToggle = document.getElementById('themeToggle');
    
    // Theme toggle
    const setTheme = (theme) => {
        document.body.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    };
    
    themeToggle.addEventListener('click', () => {
        const current = document.body.classList.contains('dark') ? 'dark' : 'light';
        setTheme(current === 'light' ? 'dark' : 'light');
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Image preview with animation
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
                previewImg.classList.add('fade-in-up');
                predictBtn.disabled = false;
                predictBtn.classList.add('pulse');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Predict with loading
    predictBtn.addEventListener('click', function() {
        const file = imageInput.files[0];
        if (!file) return;
        
        // Show loading
        loadingOverlay.style.display = 'flex';
        predictBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        predictBtn.disabled = true;
        uploadArea.style.opacity = '0.5';
        uploadArea.style.pointerEvents = 'none';
        
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loadingOverlay.style.display = 'none';
            
            if (data.error) {
                alert('Prediction error: ' + data.error);
                return;
            }
            
            // Update UI
            annotatedImg.src = data.annotated_url;
            totalDetections.innerHTML = `<i class="fas fa-search"></i> Found ${data.total_detections} waste items`;
            
            tip.textContent = data.tip;
            tip.classList.add('fade-in-up');
            
            // Clear previous
            detectionList.innerHTML = '';
            summary.innerHTML = '';
            
            // Animate detections - simplified: only class name for clean UX
            data.detections.forEach((det, i) => {
                setTimeout(() => {
                    const li = document.createElement('li');
                    li.className = `detection-item ${det.class.toLowerCase()} fade-in-up`;
                    li.innerHTML = `<strong>${det.class}</strong>`;
                    detectionList.appendChild(li);
                }, i * 150);
            });
            
            // Summary
            if (Object.keys(data.summary).length > 0) {
                const sumDiv = document.createElement('div');
                sumDiv.innerHTML = '<h3><i class="fas fa-chart-bar"></i> Summary:</h3><ul>' + 
                    Object.entries(data.summary).map(([cls, stats]) => 
                        `<li><i class="fas fa-${getIcon(cls).replace(' ', '-')}"></i> ${cls}: ${stats.count} (${stats.avg_conf})</li>`
                    ).join('') + '</ul>';
                sumDiv.classList.add('fade-in-up');
                summary.appendChild(sumDiv);
            }
            
            result.classList.remove('hidden');
            confettiCelebration();
        })
        .catch(error => {
            console.error('Error:', error);
            loadingOverlay.style.display = 'none';
            alert('Prediction failed. Check console.');
        })
        .finally(() => {
            predictBtn.innerHTML = '<i class="fas fa-magic"></i> Predict Waste Type';
            predictBtn.disabled = false;
            predictBtn.classList.remove('pulse');
            uploadArea.style.opacity = '1';
            uploadArea.style.pointerEvents = 'auto';
        });
    });
    
    // Icon mapping (unused now - kept for summary)
    function getIcon(className) {
        const icons = {
            'Bag': 'fa-shopping-bag',
            'Bottle': 'fa-bottle-water',
            'Cup': 'fa-coffee'
        };
        return icons[className] || 'fa-circle';
    }
    
    // Simple confetti
    function confettiCelebration() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.background = ['#4CAF50', '#2196F3', '#FF9800'][Math.floor(Math.random() * 3)];
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '999';
                confetti.style.animation = 'fall 3s linear forwards';
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 20);
        }
    }
    
    // Add CSS for confetti fall (injected)
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
