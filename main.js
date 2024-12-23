
        // Create the modal dynamically
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <span class="custom-close">&times;</span>
            <div class="custom-controls">
                <button id="prev">&#10094;</button>
                <button id="next">&#10095;</button>
            </div>
            <img src="" alt="">
        `;
        document.body.appendChild(modal);

        const modalImg = modal.querySelector('img');
        const closeModal = modal.querySelector('.custom-close');
        const prevButton = document.getElementById('prev');
        const nextButton = document.getElementById('next');

        let currentIndex = 0;
        const images = [];

        const username = 'aksinghrajpoot';
        const repository = 'Dynamic-Gallery';
        const folderName = "itslko";
        const branch = 'master';

        const galleryDiv = document.querySelector('.custom-gallery');
        const folderPath = encodeURIComponent(galleryDiv.getAttribute('data-folder') + '/' + galleryDiv.getAttribute('subfolder'));
        const repoURL = `https://api.github.com/repos/${username}/${repository}/contents/${folderPath}?ref=${branch}`;

        const loadingText = document.createElement('div');
        loadingText.classList.add('custom-loading');
        loadingText.innerHTML = '<div class="spinner"></div> Loading images...';
        galleryDiv.appendChild(loadingText);

        fetch(repoURL)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                const galleryImages = [];

                const imagePromises = data.map((file) => {
                    if (file.type === 'file' && file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        const imgSrc = `https://raw.githubusercontent.com/${username}/${repository}/${branch}/${folderPath}/${file.name}`;
                        return new Promise((resolve) => {
                            const img = new Image();
                            img.src = imgSrc;
                            img.onload = () => {
                                galleryImages.push({ src: imgSrc, alt: file.name });
                                resolve();
                            };
                        });
                    }
                });

                Promise.all(imagePromises).then(() => {
                    galleryImages.forEach(image => {
                        const img = document.createElement('img');
                        img.src = image.src;
                        img.alt = image.alt;
                        img.setAttribute('data-src', image.src);
                        img.classList.add('lazyload');
                        galleryDiv.appendChild(img);
                        img.addEventListener('click', () => openModal(galleryImages.indexOf(image), galleryImages));
                    });

                    loadingText.remove();

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
    