document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('log.html')) {
        loadPoliticianDetails();
    } else {
        fetchPoliticians();
    }
});

async function fetchPoliticians() {
    try {
        const response = await fetch('./data/commitments.json');
        const politicians = await response.json();
        renderPoliticians(politicians);
    } catch (error) {
        console.error('Error fetching politicians:', error);
    }
}

function renderPoliticians(politicians) {
    const politiciansSection = document.getElementById('commitments');
    politiciansSection.innerHTML = '';
    
    politicians.forEach(politician => {
        const card = createPoliticianCard(politician);
        politiciansSection.appendChild(card);
    });
}

function createPoliticianCard(politician) {
    const card = document.createElement('div');
    card.className = 'politician-card bg-white rounded-xl shadow-md p-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-300';
    card.onclick = () => window.location.href = `/pages/log.html?id=${politician.id}`;
    
    const portraitUrl = politician.image ? politician.image : '../assets/images/default-avatar.png';
    
    card.innerHTML = `
        <div class="flex items-center mb-4">
            <img src="${portraitUrl}" alt="${politician.name}" class="w-16 h-16 rounded-full mr-4 object-cover">
            <div>
                <h2 class="text-xl font-bold text-blue-800">${politician.name}</h2>
                <p class="text-gray-600 text-sm">${politician.position}</p>
                <p class="text-gray-500 text-xs">${politician.party}</p>
            </div>
        </div>
        <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Commitments: ${politician.commitments.length}</span>
            <div class="flex space-x-2">
                ${politician.socialMedia.twitter ? `<a href="https://twitter.com/${politician.socialMedia.twitter}" target="_blank" class="text-blue-400 hover:text-blue-600"><i class="fab fa-twitter"></i></a>` : ''}
                ${politician.socialMedia.facebook ? `<a href="https://facebook.com/${politician.socialMedia.facebook}" target="_blank" class="text-blue-600 hover:text-blue-800"><i class="fab fa-facebook"></i></a>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

function loadPoliticianDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const politicianId = urlParams.get('id');

    if (politicianId) {
        fetchPoliticianDetails(politicianId);
    } else {
        console.error('No politician ID provided');
    }
}

async function fetchPoliticianDetails(politicianId) {
    try {
        const response = await fetch('../data/commitments.json');
        const politicians = await response.json();
        const politician = politicians.find(p => p.id === parseInt(politicianId));

        if (politician) {
            renderPoliticianDetails(politician);
        } else {
            console.error('Politician not found');
        }
    } catch (error) {
        console.error('Error fetching politician details:', error);
    }
}

function renderPoliticianDetails(politician) {
    const detailsContainer = document.getElementById('logContent');
    const portraitUrl = politician.image ? politician.image : '../assets/images/default-avatar.png';
    
    detailsContainer.innerHTML = `
        <div class="flex items-center mb-6">
            <img src="${portraitUrl}" alt="${politician.name}" class="w-24 h-24 rounded-full mr-6 object-cover">
            <div>
                <h1 class="text-3xl font-bold mb-2">${politician.name}</h1>
                <p class="text-xl mb-1">${politician.position}</p>
                <p class="text-lg mb-2">${politician.party}</p>
                <div class="flex space-x-2">
                    ${politician.socialMedia.twitter ? `<a href="https://twitter.com/${politician.socialMedia.twitter}" target="_blank" class="text-blue-400 hover:text-blue-600"><i class="fab fa-twitter"></i></a>` : ''}
                    ${politician.socialMedia.facebook ? `<a href="https://facebook.com/${politician.socialMedia.facebook}" target="_blank" class="text-blue-600 hover:text-blue-800"><i class="fab fa-facebook"></i></a>` : ''}
                </div>
            </div>
        </div>
        <h2 class="text-2xl font-bold mb-4">Commitments</h2>
        <div class="mb-4">
            <button id="expandAll" class="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition duration-300">Expand All</button>
            <button id="collapseAll" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300">Collapse All</button>
        </div>
        <div id="commitments-list"></div>
    `;

    const commitmentsList = document.getElementById('commitments-list');
    politician.commitments.forEach(commitment => {
        const commitmentElement = createCommitmentElement(commitment);
        commitmentsList.appendChild(commitmentElement);
    });

    document.getElementById('expandAll').addEventListener('click', expandAllCommitments);
    document.getElementById('collapseAll').addEventListener('click', collapseAllCommitments);
}

function createCommitmentElement(commitment) {
    const element = document.createElement('div');
    element.className = 'commitment-item mb-4 border-b pb-4';
    
    const deadlineDate = new Date(commitment.announcedDate);
    deadlineDate.setDate(deadlineDate.getDate() + commitment.timeframe);
    
    element.innerHTML = `
        <h3 class="text-xl font-bold cursor-pointer flex items-center justify-between commitment-header hover:bg-gray-100 p-2 rounded transition duration-300" onclick="toggleCommitment(this)">
            <span>${commitment.commitment}</span>
            <span class="text-sm font-normal ml-2 status-indicator ${getStatusClass(commitment.status)}">${commitment.status}</span>
            <i class="fas fa-chevron-down text-gray-500"></i>
        </h3>
        <div class="commitment-details hidden mt-2">
            <div class="bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
            </div>
            <div class="flex justify-between items-center text-sm mb-2">
                <span class="timer text-blue-600 font-bold">00:00:00:00</span>
            </div>
            <p><strong>Announced Date:</strong> ${new Date(commitment.announcedDate).toLocaleDateString()}</p>
            <p><strong>Deadline:</strong> ${deadlineDate.toLocaleDateString()}</p>
            <p><strong>Details:</strong> ${commitment.details}</p>
            ${renderAdditionalKeys(commitment.additional_keys)}
            <h4 class="font-bold mt-2">Evidence:</h4>
            <ul class="list-disc pl-5">
                ${commitment.evidence.map(e => `<li><a href="${e.link}" target="_blank" class="text-blue-600 hover:underline">${e.description}</a></li>`).join('')}
            </ul>
        </div>
    `;

    updateTimer(element.querySelector('.timer'), deadlineDate, new Date(commitment.announcedDate));
    updateProgressBar(element.querySelector('.bg-blue-600'), new Date(commitment.announcedDate), deadlineDate);

    return element;
}

function renderAdditionalKeys(additionalKeys) {
    if (!additionalKeys || Object.keys(additionalKeys).length === 0) {
        return '';
    }

    return Object.entries(additionalKeys)
        .map(([key, value]) => {
            const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return `<p><strong>${formattedKey}:</strong> ${value}</p>`;
        })
        .join('');
}

function toggleCommitment(element) {
    const details = element.nextElementSibling;
    const chevron = element.querySelector('i.fas');
    details.classList.toggle('hidden');
    chevron.classList.toggle('fa-chevron-down');
    chevron.classList.toggle('fa-chevron-up');
}

function expandAllCommitments() {
    document.querySelectorAll('.commitment-details').forEach(details => {
        details.classList.remove('hidden');
        const chevron = details.previousElementSibling.querySelector('i.fas');
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
    });
}

function collapseAllCommitments() {
    document.querySelectorAll('.commitment-details').forEach(details => {
        details.classList.add('hidden');
        const chevron = details.previousElementSibling.querySelector('i.fas');
        chevron.classList.add('fa-chevron-down');
        chevron.classList.remove('fa-chevron-up');
    });
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

function updateTimer(timerElement, deadline, announcedDate) {
    const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = deadline - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        timerElement.textContent = `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (distance < 0) {
            clearInterval(timer);
            timerElement.textContent = "EXPIRED";
            timerElement.classList.remove('text-blue-600');
            timerElement.classList.add('text-red-600');
        }
    }, 1000);
}

function updateProgressBar(progressBar, startDate, endDate) {
    const updateProgress = () => {
        const now = new Date().getTime();
        const total = endDate - startDate;
        const elapsed = now - startDate;
        const progress = Math.min((elapsed / total) * 100, 100);
        progressBar.style.width = `${progress}%`;
    };

    updateProgress();
    setInterval(updateProgress, 60000); // Update every minute
}