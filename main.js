
const galleries = document.querySelectorAll('.custom-gallery');
const modal = document.querySelector('.custom-modal');
const modalImg = modal.querySelector('img');
const closeModal = modal.querySelector('.custom-close');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

let currentIndex = 0;
const images = [];

const username = 'aksinghrajpoot';
const repository = 'Dynamic-Gallery';
const branch = 'master';
const token = mytoken; // Your GitHub Token

const headers = {
    'Authorization': `token ${token}`
};

galleries.forEach(gallery => {
    const folderPath = encodeURIComponent(gallery.getAttribute('data-folder'));
    const repoURL = `https://api.github.com/repos/${username}/${repository}/contents/itslko/${folderPath}?ref=${branch}`;

    // Create a loading indicator for each gallery
    const loadingText = document.createElement('div');
    loadingText.classList.add('custom-loading');
    loadingText.innerHTML = '<div class="spinner"></div> Loading images...';
    gallery.appendChild(loadingText);

    fetch(repoURL, { headers: headers })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            const galleryImages = [];

            const imagePromises = data.map((file, index) => {
                if (file.type === 'file' && file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.src = file.download_url;
                        img.onload = () => {
                            galleryImages.push({ src: file.download_url, alt: file.name, width: img.width, height: img.height });
                            resolve();
                        };
                    });
                }
            });

            Promise.all(imagePromises).then(() => {
                galleryImages.sort((a, b) => (b.width * b.height) - (a.width * a.height)); // Sort by largest resolution
                galleryImages.forEach(image => {
                    const img = document.createElement('img');
                    img.src = image.src;
                    img.alt = image.alt;
                    img.setAttribute('data-src', image.src);
                    img.classList.add('lazyload');
                    gallery.appendChild(img);
                    img.addEventListener('click', () => openModal(galleryImages.indexOf(image), galleryImages));
                });

                // Remove the loading indicator once images are loaded for this gallery
                loadingText.remove();

                // Lazy load images when they are in the viewport
                const lazyImages = document.querySelectorAll('.lazyload');
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.getAttribute('data-src');
                            img.classList.add('loaded');
                            img.classList.remove('lazyload');
                            observer.unobserve(img);
                        }
                    });
                });

                lazyImages.forEach(image => {
                    imageObserver.observe(image);
                });
            });
        })
        .catch(error => console.error('Error fetching images:', error));
});

function openModal(index, galleryImages) {
    currentIndex = index;
    modalImg.src = galleryImages[currentIndex].src;
    modal.style.display = 'flex';
    images.length = 0;  // Reset images array to avoid issues with navigation
    images.push(...galleryImages); // Store the gallery images in the modal for navigation
}

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    modalImg.src = images[currentIndex].src;
});

nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    modalImg.src = images[currentIndex].src;
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
