window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    if (!dropdown || !button) return;

    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && dropdown && button && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (dropdown && button) {
            dropdown.classList.remove('show');
            button.classList.remove('active');
        }
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    if (!button) return;
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Bind wheel + arrow key controls to hovered carousel
    (function setupCarouselInput(instances) {
        if (!instances || instances.length === 0) return;

        var activeCarousel = null;

        instances.forEach(function(instance) {
            if (!instance || !instance.element) return;

            instance.element.addEventListener('mouseenter', function() {
                activeCarousel = instance;
            });
            instance.element.addEventListener('mouseleave', function() {
                if (activeCarousel === instance) {
                    activeCarousel = null;
                }
            });

            instance.element.addEventListener('wheel', function(event) {
                // Only react when pointer is over the carousel
                activeCarousel = instance;

                if (event.ctrlKey) return;

                var delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
                if (delta === 0) return;

                if (typeof instance.next === 'function' && typeof instance.previous === 'function') {
                    if (delta > 0) {
                        instance.next();
                    } else {
                        instance.previous();
                    }
                }

                event.preventDefault();
            }, { passive: false });
        });

        document.addEventListener('keydown', function(event) {
            if (document.body.classList.contains('lightbox-open')) return;
            if (!activeCarousel) {
                var hovered = document.querySelector('.carousel:hover');
                if (hovered) {
                    instances.forEach(function(instance) {
                        if (instance && instance.element === hovered) {
                            activeCarousel = instance;
                        }
                    });
                }
            }
            if (!activeCarousel) return;
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

            if (typeof activeCarousel.next === 'function' && typeof activeCarousel.previous === 'function') {
                if (event.key === 'ArrowRight') {
                    activeCarousel.next();
                } else {
                    activeCarousel.previous();
                }
            }

            event.preventDefault();
        });
    })(carousels);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

    // Lightbox zoom for figures
    (function setupImageLightbox() {
        var zoomableImages = Array.prototype.slice.call(document.querySelectorAll('img.zoomable'));
        if (zoomableImages.length === 0) return;

        var lightbox = document.getElementById('image-lightbox');
        if (!lightbox) return;

        var backdrop = lightbox.querySelector('.image-lightbox__backdrop');
        var closeButtons = lightbox.querySelectorAll('[data-lightbox-close]');
        var lightboxImg = lightbox.querySelector('.image-lightbox__img');
        var navPrev = lightbox.querySelector('.image-lightbox__nav--prev');
        var navNext = lightbox.querySelector('.image-lightbox__nav--next');

        var state = {
            isOpen: false,
            group: null,
            groupItems: [],
            index: 0,
            scale: 1,
            translateX: 0,
            translateY: 0,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            dragOriginX: 0,
            dragOriginY: 0
        };

        function setNavVisibility() {
            var hasGroup = state.groupItems.length > 1;
            if (hasGroup) {
                navPrev.classList.remove('is-hidden');
                navNext.classList.remove('is-hidden');
            } else {
                navPrev.classList.add('is-hidden');
                navNext.classList.add('is-hidden');
            }
        }

        function applyTransform() {
            lightboxImg.style.transform =
                'translate3d(' + state.translateX + 'px,' + state.translateY + 'px,0) scale(' + state.scale + ')';
        }

        function resetTransform() {
            state.scale = 1;
            state.translateX = 0;
            state.translateY = 0;
            applyTransform();
        }

        function setImage(src, alt) {
            lightboxImg.src = src;
            lightboxImg.alt = alt || '';
        }

        function setGroupFromImage(img) {
            var group = img.getAttribute('data-zoom-group');
            state.group = group;
            if (group) {
                state.groupItems = zoomableImages.filter(function(item) {
                    return item.getAttribute('data-zoom-group') === group;
                });
            } else {
                state.groupItems = [img];
            }
            state.index = state.groupItems.indexOf(img);
        }

        function openLightbox(img) {
            setGroupFromImage(img);
            setImage(img.src, img.alt);
            resetTransform();
            setNavVisibility();
            state.isOpen = true;
            lightbox.classList.add('is-active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('lightbox-open');
        }

        function closeLightbox() {
            state.isOpen = false;
            lightbox.classList.remove('is-active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('lightbox-open');
        }

        function showIndex(nextIndex) {
            if (!state.groupItems.length) return;
            var total = state.groupItems.length;
            state.index = (nextIndex + total) % total;
            var img = state.groupItems[state.index];
            setImage(img.src, img.alt);
            resetTransform();
        }

        function handleWheel(event) {
            if (!state.isOpen) return;
            event.preventDefault();

            var delta = event.deltaY > 0 ? -0.2 : 0.2;
            var nextScale = state.scale + delta;
            nextScale = Math.min(Math.max(nextScale, 1), 4);

            state.scale = nextScale;
            if (state.scale === 1) {
                state.translateX = 0;
                state.translateY = 0;
            }
            applyTransform();
        }

        function startDrag(event) {
            if (!state.isOpen || state.scale === 1) return;
            state.isDragging = true;
            lightboxImg.classList.add('is-panning');
            state.dragStartX = event.clientX;
            state.dragStartY = event.clientY;
            state.dragOriginX = state.translateX;
            state.dragOriginY = state.translateY;
        }

        function dragMove(event) {
            if (!state.isDragging) return;
            var dx = event.clientX - state.dragStartX;
            var dy = event.clientY - state.dragStartY;
            state.translateX = state.dragOriginX + dx;
            state.translateY = state.dragOriginY + dy;
            applyTransform();
        }

        function endDrag() {
            if (!state.isDragging) return;
            state.isDragging = false;
            lightboxImg.classList.remove('is-panning');
        }

        zoomableImages.forEach(function(img) {
            img.addEventListener('click', function() {
                openLightbox(img);
            });
        });

        if (backdrop) {
            backdrop.addEventListener('click', closeLightbox);
        }

        Array.prototype.forEach.call(closeButtons, function(btn) {
            btn.addEventListener('click', closeLightbox);
        });

        navPrev.addEventListener('click', function() {
            if (!state.isOpen || state.groupItems.length < 2) return;
            showIndex(state.index - 1);
        });

        navNext.addEventListener('click', function() {
            if (!state.isOpen || state.groupItems.length < 2) return;
            showIndex(state.index + 1);
        });

        lightboxImg.addEventListener('wheel', handleWheel, { passive: false });
        lightboxImg.addEventListener('mousedown', function(event) {
            event.preventDefault();
            startDrag(event);
        });

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', endDrag);

        document.addEventListener('keydown', function(event) {
            if (!state.isOpen) return;
            if (event.key === 'Escape') {
                closeLightbox();
                return;
            }

            if (event.key === 'ArrowLeft') {
                if (state.scale > 1) {
                    state.translateX += 40;
                    applyTransform();
                } else if (state.groupItems.length > 1) {
                    showIndex(state.index - 1);
                }
                event.preventDefault();
                return;
            }

            if (event.key === 'ArrowRight') {
                if (state.scale > 1) {
                    state.translateX -= 40;
                    applyTransform();
                } else if (state.groupItems.length > 1) {
                    showIndex(state.index + 1);
                }
                event.preventDefault();
                return;
            }

            if (event.key === 'ArrowUp') {
                if (state.scale > 1) {
                    state.translateY += 40;
                    applyTransform();
                }
                event.preventDefault();
                return;
            }

            if (event.key === 'ArrowDown') {
                if (state.scale > 1) {
                    state.translateY -= 40;
                    applyTransform();
                }
                event.preventDefault();
            }
        });
    })();

})
