
const galleries = document.querySelectorAll('.gallery');
const modal = document.querySelector('.modal');
const modalImg = modal.querySelector('img');
const closeModal = modal.querySelector('.close');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

let currentIndex = 0;
const images = [];

const username = 'aksinghrajpoot';
const repository = 'Dynamic-Gallery';
const branch = 'master';
const token = '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'; // Your GitHub Token

const headers = {
    'Authorization': `token ${token}`
};

galleries.forEach(gallery => {
    const folderPath = encodeURIComponent(gallery.getAttribute('data-folder'));
    const repoURL = `https://api.github.com/repos/${username}/${repository}/contents/${folderPath}?ref=${branch}`;

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
                        const container = document.createElement('div');
                        container.classList.add('image-container');

                        const shimmer = document.createElement('div');
                        shimmer.classList.add('shimmer');
                        container.appendChild(shimmer);

                        const img = new Image();
                        img.src = file.download_url;
                        img.onload = () => {
                            shimmer.style.display = 'none';
                            img.classList.add('loaded');
                            galleryImages.push({ src: file.download_url, alt: file.name, width: img.width, height: img.height });
                            resolve();
                        };

                        img.classList.add('lazyload');
                        container.appendChild(img);
                        gallery.appendChild(container);
                    });
                }
            });

            Promise.all(imagePromises).then(() => {
                galleryImages.sort((a, b) => (b.width * b.height) - (a.width * a.height));
                galleryImages.forEach(image => {
                    const img = document.createElement('img');
                    img.src = image.src;
                    img.alt = image.alt;
                    img.setAttribute('data-src', image.src);
                    img.classList.add('lazyload');
                    gallery.appendChild(img);
                    img.addEventListener('click', () => openModal(galleryImages.indexOf(image), galleryImages));
                });

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
    images.length = 0;
    images.push(...galleryImages);
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
