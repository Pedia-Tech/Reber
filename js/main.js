/**
 * MAIN INTERACTIVITY SCRIPT
 * Handles navigation, interactive BBS table, quote upload simulation,
 * rebar quick-estimator, FAQ accordions, and UI states.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
      }
    });
  }

  // 2. Sticky Header elevation on scroll
  const header = document.querySelector('.header-wrapper');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.style.boxShadow = '0 4px 20px rgba(11, 30, 54, 0.08)';
      } else {
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  // 3. FAQ Accordion Interaction
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close other FAQs
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 4. Interactive Bar Bending Schedule (BBS) Filtering
  const bbsFilterBtns = document.querySelectorAll('.bbs-filter-btn');
  const bbsRows = document.querySelectorAll('.bbs-table tbody tr:not(.bbs-summary-row)');

  if (bbsFilterBtns.length > 0) {
    bbsFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        bbsFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        let visibleCount = 0;
        let totalWeight = 0;

        bbsRows.forEach(row => {
          const category = row.getAttribute('data-category');
          const weight = parseFloat(row.getAttribute('data-weight')) || 0;

          if (filter === 'all' || category === filter) {
            row.style.display = '';
            visibleCount++;
            totalWeight += weight;
          } else {
            row.style.display = 'none';
          }
        });

        // Update live summary
        const summaryCountEl = document.getElementById('bbs-visible-count');
        const summaryWeightEl = document.getElementById('bbs-total-weight');
        if (summaryCountEl) summaryCountEl.textContent = visibleCount;
        if (summaryWeightEl) summaryWeightEl.textContent = totalWeight.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';
      });
    });
  }

  // 5. Drag & Drop File Upload Simulation
  const dropzone = document.getElementById('drawing-dropzone');
  const fileInput = document.getElementById('drawing-file-input');
  const previewList = document.getElementById('file-preview-list');

  if (dropzone && fileInput) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--brand-blue)';
        dropzone.style.backgroundColor = 'var(--bg-tint-blue)';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--steel-border)';
        dropzone.style.backgroundColor = 'var(--bg-surface)';
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      handleFiles(files);
    });

    fileInput.addEventListener('change', () => {
      handleFiles(fileInput.files);
    });

    function handleFiles(files) {
      if (!files || files.length === 0) return;
      if (previewList) {
        previewList.innerHTML = '';
        Array.from(files).forEach(file => {
          const sizeKb = (file.size / 1024).toFixed(1);
          const item = document.createElement('div');
          item.style.padding = '6px 0';
          item.style.borderBottom = '1px solid var(--steel-border-subtle)';
          item.innerHTML = `<strong>${file.name}</strong> (${sizeKb} KB) — <span style="color:#10b981;">Ready for Detailing Review</span>`;
          previewList.appendChild(item);
        });
      }
    }
  }

  // 6. Interactive Rebar Quantity Takeoff Estimator Widget
  const volumeInput = document.getElementById('calc-concrete-vol');
  const structureType = document.getElementById('calc-structure-type');
  const resultSteel = document.getElementById('calc-res-steel');
  const resultBars = document.getElementById('calc-res-bars');
  const resultHours = document.getElementById('calc-res-hours');

  function calculateTakeoff() {
    if (!volumeInput || !structureType) return;
    const vol = parseFloat(volumeInput.value) || 0;
    const density = parseFloat(structureType.value) || 120; // kg of rebar per m3 of concrete

    const totalKg = vol * density;
    const totalTonnes = totalKg / 1000;
    const estimatedBarCuts = Math.round(totalTonnes * 142); // avg cuts/bends per tonne
    const turnaroundDays = Math.max(2, Math.ceil(totalTonnes / 75));

    if (resultSteel) resultSteel.textContent = `${totalTonnes.toFixed(1)} MT`;
    if (resultBars) resultBars.textContent = `${estimatedBarCuts.toLocaleString()} Items`;
    if (resultHours) resultHours.textContent = `${turnaroundDays} Working Days`;
  }

  if (volumeInput && structureType) {
    volumeInput.addEventListener('input', calculateTakeoff);
    structureType.addEventListener('change', calculateTakeoff);
    calculateTakeoff(); // initial
  }

  // 7. Contact Form Submission Simulation
  const quoteForm = document.getElementById('project-quote-form');
  const formSuccessAlert = document.getElementById('form-success-alert');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Verifying Specifications & Submitting...';

        setTimeout(() => {
          quoteForm.reset();
          if (previewList) previewList.innerHTML = '';
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;

          if (formSuccessAlert) {
            formSuccessAlert.style.display = 'block';
            formSuccessAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              formSuccessAlert.style.display = 'none';
            }, 8000);
          } else {
            alert('Your structural detailing inquiry has been logged. Our engineering lead will review your drawings within 24 business hours.');
          }
        }, 1200);
      }
    });
  }

  // 8. Filter tabs on Projects and Services pages
  const projectTabs = document.querySelectorAll('.project-filter-tab');
  const projectCards = document.querySelectorAll('.project-filterable-card');

  if (projectTabs.length > 0 && projectCards.length > 0) {
    projectTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        projectTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filterVal = tab.getAttribute('data-filter');

        projectCards.forEach(card => {
          const cardType = card.getAttribute('data-type');
          if (filterVal === 'all' || cardType === filterVal) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 9. Interactive Before & After Visual Slider
  const compareWrapper = document.querySelector('.before-after-wrapper');
  if (compareWrapper) {
    const afterLayer = compareWrapper.querySelector('.compare-layer.after');
    const handleBar = compareWrapper.querySelector('.slider-handle-bar');
    let isSliding = false;

    const setPosition = (xPos) => {
      const rect = compareWrapper.getBoundingClientRect();
      let offsetX = xPos - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;
      const percentage = (offsetX / rect.width) * 100;
      if (afterLayer) afterLayer.style.width = percentage + '%';
      if (handleBar) handleBar.style.left = percentage + '%';
    };

    compareWrapper.addEventListener('mousedown', (e) => {
      isSliding = true;
      setPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isSliding = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isSliding) return;
      setPosition(e.clientX);
    });

    // Touch support
    compareWrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isSliding = true;
        setPosition(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isSliding || e.touches.length !== 1) return;
      setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isSliding = false;
    });
  }

  // 10. Lightbox Modal Interaction
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxClose = document.getElementById('lightbox-close');

  const openLightbox = (src, title, meta) => {
    if (!lightboxModal) return;
    if (lightboxImg) lightboxImg.src = src;
    if (lightboxTitle) lightboxTitle.textContent = title || 'High-Resolution Technical Preview';
    if (lightboxMeta) lightboxMeta.textContent = meta || 'CAD/BIM Level of Development 400';
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach zoom buttons
  document.querySelectorAll('[data-lightbox-src]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const src = btn.getAttribute('data-lightbox-src');
      const title = btn.getAttribute('data-lightbox-title');
      const meta = btn.getAttribute('data-lightbox-meta');
      openLightbox(src, title, meta);
    });
  });

  // 11. Vault Category Filter
  const vaultTabs = document.querySelectorAll('.vault-tab');
  const vaultCards = document.querySelectorAll('.vault-card');
  if (vaultTabs.length > 0 && vaultCards.length > 0) {
    vaultTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        vaultTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.getAttribute('data-vault');

        vaultCards.forEach(card => {
          const cardCat = card.getAttribute('data-vault-cat');
          if (cat === 'all' || cardCat === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 12. Project Image vs CAD Blueprint Toggle
  document.querySelectorAll('.project-image-box').forEach(box => {
    const tabs = box.querySelectorAll('.proj-tab-btn');
    const photo = box.querySelector('.project-real-photo');
    const cad = box.querySelector('.project-svg-schematic');

    if (tabs.length === 2 && photo && cad) {
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const mode = tab.getAttribute('data-mode');
          if (mode === 'cad') {
            cad.style.display = 'block';
            photo.style.display = 'none';
          } else {
            cad.style.display = 'none';
            photo.style.display = 'block';
          }
        });
      });
    }
  });
});
