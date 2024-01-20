const apiKey = "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";
const requestOptions = {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
    }
};

let userPublicRepo = []; // Declare the array here

const repocards = document.getElementById('repocards');
const paginationContainer = document.getElementById('pagination');
const cardsPerPage = 10;
let currentPage = 1;

var profileImage = document.getElementById('profileImage');
var githubname = document.getElementById('githubname');
var button = document.getElementById('search');
var githubdesc = document.getElementById('githubdesc');
var locate = document.getElementById('location');
var links = document.getElementById('links');
var gihuburl = document.getElementById('gihuburl');
const loading = document.getElementById('loading');
var details = document.getElementById('details');
var notFound = document.getElementById('notfound');
const setLoading = (isLoading) => {
    loading.style.display = isLoading ? 'flex' : 'none';
     details.style.display = isLoading ? 'none' : 'flex';
};



button.addEventListener('click', function () {
    setLoading(true);
    
    const userName = document.getElementById('username').value;

    const apiUrl = `https://api.github.com/users/${userName}`;
    fetch(apiUrl, requestOptions)
        .then(response => {
            if (!response.ok) {
                alert('User not found');
                
                throw new Error('Network response is not Ok');
            }
            return response.json();
        })
        .then(userData => {
            userPublicRepo = [userData]; // Store user data in the array
            profileImage.src = userData.avatar_url;
            githubname.innerHTML = userData.name ?userData.name:"No name found";
            githubdesc.innerHTML = userData.bio?userData.bio:'No bio found';
            locate.innerHTML = userData.location ? userData.location : 'Location not found';
            links.innerHTML = `<li>Public Repos: ${userData.public_repos ? userData.public_repos : 'Not any repo found'}</li>
                               <li>Private Repos: ${userData.total_private_repos ? userData.total_private_repos : 'Not any repo found'}</li>`;
            gihuburl.href= userData.html_url;
            gihuburl.innerHTML = userData.url?userData.html_url:'No url found';
            const repourl = userData.repos_url?userData.repos_url:'Not repo url found';
            fetch(repourl, requestOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response shows error');
                    }
                    return response.json();
                })
                .then(userRepoData => {
                    userPublicRepo = [...userPublicRepo, ...userRepoData]; // Store repository data in the array
                
                    renderRepositoryCards(userRepoData);
                    renderPagination(userRepoData.length);
                    setLoading(false);
                    console.log("repo", userRepoData);
                })
                .catch(error => {
                    setLoading(false);
                    console.error('Error fetching repository data', error);
                });
        })
        .catch(error => {
            loading.style.display ='none';
            notFound.innerHTML= "User not found of this user ID"
            console.error('Error fetching user data', error);
        });
});

function renderRepositoryCards(data) {
    repocards.innerHTML = '';
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    data.slice(startIndex, endIndex).forEach(async (repoData, index) => {
        const languagesUrl = repoData.languages_url;
        
        try {
            const response = await fetch(languagesUrl, requestOptions);
            if (!response.ok) {
                throw new Error('Network response is not OK');
            }

            const languagesData = await response.json();
            const languages = Object.keys(languagesData);

            const languageDivs = languages.map(lang => `
                <div class="langusa"><p>${lang}</p></div>
            `).join('');

            const cardHTML = `
                <div class="repocards">
                    <h2 class="repoName">${repoData.name}</h2>
                    <p class="repodesc">${repoData.description || 'No description available'}</p>
                    <a href="${repoData.html_url}" target="_blank">${repoData.html_url}</a>
                    <div class="repsoLanguags">
                        ${languages.length > 0 ? languageDivs : ''}
                    </div>
                </div>
            `;
            repocards.innerHTML += cardHTML;
        } catch (error) {
            console.error('Error fetching languages data', error);
        }
    });
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / cardsPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', function () {
            currentPage = i;
            renderRepositoryCards(userPublicRepo);
        });
        paginationContainer.appendChild(pageButton);
    }
}
