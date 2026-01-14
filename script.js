document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GESTION DU THÈME ---
    const themeToggles = document.querySelectorAll('.theme-btn');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') body.classList.add('dark-mode');

    themeToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    });

    // --- 2. FILTRES ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filterValue = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'block';
                        card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- 3. MODALE & SLIDER ---
    const modal = document.getElementById('project-modal');
    
    if (modal) {
        const modalTitle = document.getElementById('modal-title');
        const modalDesc = document.getElementById('modal-desc');
        const modalTools = document.getElementById('modal-tools-icons');
        const slidesWrapper = document.getElementById('modal-slides');
        const closeBtn = document.querySelector('.close-btn');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        let currentSlide = 0;
        let totalSlides = 0;

        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.getAttribute('data-title');
                const desc = card.getAttribute('data-desc');
                const tools = card.getAttribute('data-tools').split(',');
                const type = card.getAttribute('data-type'); 

                modalTitle.innerHTML = title; // innerHTML pour permettre les <br> si besoin
                modalDesc.innerHTML = desc;

                // --- Gestion des outils (Icones) ---
                modalTools.innerHTML = '';
                tools.forEach(tool => {
                    let iconClass = `devicon-${tool.trim()}-plain`;
                    // Exceptions pour certaines icônes Devicon
                    if(tool.trim() === 'blender') iconClass = `devicon-blender-original`;
                    
                    const icon = document.createElement('i');
                    icon.className = iconClass;
                    modalTools.appendChild(icon);
                });

                // --- Construction du Slider ---
                slidesWrapper.innerHTML = ''; 
                currentSlide = 0;

                if (type === 'video') {
                    // Cas : Uniquement des vidéos
                    const videoSrcRaw = card.getAttribute('data-src');
                    let videoList = videoSrcRaw.includes(',') ? videoSrcRaw.split(',') : [videoSrcRaw];
                    totalSlides = videoList.length;

                    videoList.forEach(src => {
                        const slide = document.createElement('div');
                        slide.className = 'slide';
                        slide.innerHTML = `<video controls playsinline src="${src.trim()}"></video>`;
                        slidesWrapper.appendChild(slide);
                    });

                } else if (type === '3d') {
    // Cas : Modèle 3D
    const modelSrc = card.getAttribute('data-src');
    totalSlides = 1;
    const slide = document.createElement('div');
    slide.className = 'slide';
    
    // J'ai ajouté field-of-view="30deg" pour le zoom et le style width/height à 100%
    slide.innerHTML = `
        <model-viewer 
            src="${modelSrc}" 
            auto-rotate 
            camera-controls 
            shadow-intensity="1"
            field-of-view="30deg" 
            camera-orbit="45deg 55deg 105%"
            style="width: 100%; height: 100%;">
        </model-viewer>`;
    slidesWrapper.appendChild(slide);

} else if (type === 'mixed') {
                    // NOUVEAU CAS : Mélange Images et Vidéos (Le P'tit Jardin)
                    const sourcesStr = card.getAttribute('data-images');
                    const sourcesList = sourcesStr.split(',');
                    totalSlides = sourcesList.length;

                    sourcesList.forEach(src => {
                        const s = src.trim();
                        const slide = document.createElement('div');
                        slide.className = 'slide';

                        // On détecte si c'est une vidéo par l'extension
                        if (s.endsWith('.mp4') || s.endsWith('.webm')) {
                            slide.innerHTML = `<video controls playsinline src="${s}"></video>`;
                        } else {
                            slide.innerHTML = `<img src="${s}" alt="Project Media">`;
                        }
                        slidesWrapper.appendChild(slide);
                    });

                } else {
                    // Cas : Uniquement des images (Standard)
                    const imagesStr = card.getAttribute('data-images'); 
                    let imagesList = [];
                    if (imagesStr) {
                        imagesList = imagesStr.split(',');
                    } else {
                        // Fallback si on clique sur une image seule sans data-images
                        const imgTag = card.querySelector('img');
                        if(imgTag) imagesList = [imgTag.src];
                    }
                    totalSlides = imagesList.length;

                    imagesList.forEach(imgUrl => {
                        const slide = document.createElement('div');
                        slide.className = 'slide';
                        slide.innerHTML = `<img src="${imgUrl.trim()}" alt="Project Image">`;
                        slidesWrapper.appendChild(slide);
                    });
                }

                // Gestion des boutons Prev/Next
                if (totalSlides > 1) {
                    prevBtn.style.display = 'flex';
                    nextBtn.style.display = 'flex';
                } else {
                    prevBtn.style.display = 'none';
                    nextBtn.style.display = 'none';
                }

                updateCarousel();
                modal.classList.add('active');
            });
        });

        function updateCarousel() {
            slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            // Pause toutes les vidéos quand on change de slide
            const allVideos = slidesWrapper.querySelectorAll('video');
            allVideos.forEach(vid => vid.pause());
        }

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        function closeModal() {
            modal.classList.remove('active');
            const allVideos = slidesWrapper.querySelectorAll('video');
            allVideos.forEach(vid => vid.pause());
        }
    }

    // --- 4. GESTION DES AVIS INTELLIGENTE ---
    const readMoreBtns = document.querySelectorAll('.read-more-btn');

    function checkTextOverflow() {
        document.querySelectorAll('.review-card').forEach(card => {
            const content = card.querySelector('.review-content');
            const p = content.querySelector('p');
            const btn = card.querySelector('.read-more-btn');

            if(!p || !btn) return;

            if (content.classList.contains('expanded')) {
                btn.style.display = 'flex';
                return;
            }

            if (p.scrollHeight > p.clientHeight + 1) {
                btn.style.display = 'flex'; 
            } else {
                btn.style.display = 'none'; 
            }
        });
    }

    checkTextOverflow();
    window.addEventListener('resize', checkTextOverflow);

    if (readMoreBtns.length > 0) {
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const content = btn.previousElementSibling;
                content.classList.toggle('expanded');

                if (content.classList.contains('expanded')) {
                    btn.textContent = 'Voir moins ↑';
                } else {
                    btn.textContent = 'Voir plus ↓';
                }
            });
        });
    }
});
