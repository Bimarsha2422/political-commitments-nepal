document.addEventListener('DOMContentLoaded', () => {
    fetchCommitments();
});

async function fetchCommitments() {
    try {
        const response = await fetch('commitments.json');
        const commitments = await response.json();
        renderCommitments(commitments);
    } catch (error) {
        console.error('Error fetching commitments:', error);
    }
}

function renderCommitments(commitments) {
    const commitmentsSection = document.getElementById('commitments');
    commitmentsSection.innerHTML = '';
    
    commitments.forEach(commitment => {
        const card = createCommitmentCard(commitment);
        commitmentsSection.appendChild(card);
    });
}

function createCommitmentCard(commitment) {
    const card = document.createElement('div');
    card.className = 'commitment-card bg-white rounded-xl shadow-md p-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-300';
    card.onclick = () => window.location.href = `log.html?id=${commitment.id}`;
    
    const portraitUrl = commitment.image ? commitment.image : 'default-avatar.png';
    
    card.innerHTML = `
        <div class="flex items-center mb-4">
            <img src="${portraitUrl}" alt="${commitment.name}" class="w-16 h-16 rounded-full mr-4 object-cover">
            <div>
                <h2 class="text-xl font-bold text-blue-800">${commitment.name}</h2>
                <p class="text-gray-600 text-sm">${commitment.position}</p>
            </div>
        </div>
        <p class="mb-4 text-gray-700 text-sm">${commitment.commitment}</p>
        <div class="flex justify-between items-center text-sm">
            <span class="status-indicator ${getStatusClass(commitment.status)}">${commitment.status}</span>
            <span class="text-gray-500">Deadline: ${formatDeadline(commitment.announcedDate, commitment.timeframe)}</span>
        </div>
    `;
    
    return card;
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'status-completed';
        case 'in progress':
            return 'status-in-progress';
        case 'failed':
            return 'status-failed';
        default:
            return '';
    }
}

function formatDeadline(announcedDate, timeframe) {
    const deadline = new Date(announcedDate);
    deadline.setDate(deadline.getDate() + parseInt(timeframe));
    return deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function createCommitmentCard(commitment) {
    const card = document.createElement('div');
    card.className = 'commitment-card bg-white rounded-xl shadow-md p-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-300';
    card.onclick = () => window.location.href = `log.html?id=${commitment.id}`;
    
    const portraitUrl = commitment.image ? commitment.image : 'default-avatar.png';
    
    card.innerHTML = `
        <div class="flex items-center mb-4">
            <img src="${portraitUrl}" alt="${commitment.name}" class="w-16 h-16 rounded-full mr-4 object-cover">
            <div>
                <h2 class="text-xl font-bold text-blue-800">${commitment.name}</h2>
                <p class="text-gray-600 text-sm">${commitment.position}</p>
            </div>
        </div>
        <p class="mb-4 text-gray-700 text-sm">"${commitment.commitment}"</p>
        <div class="bg-gray-200 rounded-full h-2 mb-2">
            <div class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
        </div>
        <div class="flex justify-between items-center text-sm mb-2">
            <span class="status-indicator ${getStatusClass(commitment.status)}">${commitment.status}</span>
            <span class="timer text-blue-600 font-bold">00:00:00:00</span>
        </div>
        <span class="text-gray-500 text-xs">Deadline: ${formatDeadline(commitment.announcedDate, commitment.timeframe)}</span>
    `;
    
    const announcedDate = new Date(commitment.announcedDate);
    const deadlineDate = new Date(announcedDate.getTime() + commitment.timeframe * 24 * 60 * 60 * 1000);
    updateTimer(card, deadlineDate, announcedDate);
    
    return card;
}

// Add back the updateTimer function
function updateTimer(card, deadline, announcedDate) {
    const timerElement = card.querySelector('.timer');
    const progressBar = card.querySelector('.bg-blue-600');
    
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = deadline - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        timerElement.textContent = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const totalTime = deadline - announcedDate.getTime();
        const progress = ((totalTime - distance) / totalTime) * 100;
        progressBar.style.width = `${progress}%`;
        
        if (distance < 0) {
            clearInterval(timer);
            timerElement.textContent = "EXPIRED";
            timerElement.classList.remove('text-blue-600');
            timerElement.classList.add('text-red-600');
        }
    }, 1000);
}