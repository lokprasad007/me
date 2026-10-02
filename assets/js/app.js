/**
 * NEXUS STUDY HUB - APPLICATION LOGIC
 * High-Performance Client-Side Study Portal & Universal PDF Reader
 * Optimized for Desktop, Tablet, and Mobile Online Deployment
 */

(function () {
  'use strict';

  // Configure PDF.js Worker if available
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // Register PWA Service Worker for Offline & Fast Online Loading
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.log('SW registration note:', err.message);
      });
    });
  }

  // State Management
  const state = {
    files: window.STUDY_FILES || [],
    syllabus: window.SYLLABUS_DATA || {},
    filteredFiles: [],
    searchQuery: '',
    activeCategory: 'all',
    activeSort: 'default',
    viewMode: localStorage.getItem('nexus_view_mode') || 'grid',
    theme: localStorage.getItem('nexus_theme') || 'cyberpunk',
    soundEnabled: localStorage.getItem('nexus_sound') !== 'false',
    starred: new Set(JSON.parse(localStorage.getItem('nexus_starred') || '[]')),
    checkedTopics: new Set(JSON.parse(localStorage.getItem('nexus_syllabus_checked') || '[]')),
    currentDocIndex: -1,
    activeSyllabusSubject: 'BCSOS303',
    pomo: {
      timeLeft: 25 * 60,
      totalTime: 25 * 60,
      isRunning: false,
      timerId: null,
      mode: 'focus'
    },
    pdf: {
      doc: null,
      pageNum: 1,
      pageCount: 1,
      scale: 1.25,
      isRendering: false,
      pendingPage: null,
      activeMode: 'canvas' // 'canvas' | 'iframe' | 'gdocs'
    }
  };

  // Audio Synthesizer via Web Audio API
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const soundFX = {
    click: () => {
      if (!state.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {}
    },
    chime: () => {
      if (!state.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
        });
      } catch (e) {}
    },
    twinkle: () => {
      if (!state.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1174, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1567, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {}
    }
  };

  // Toast Notification
  function showToast(message, icon = '✨') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Interactive Particle Canvas
  function initAmbientCanvas() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(45, Math.floor((width * height) / 28000));
    const mouse = { x: -1000, y: -1000, radius: 120 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color:
          i % 3 === 0
            ? 'rgba(0, 242, 254, 0.4)'
            : i % 3 === 1
            ? 'rgba(157, 78, 221, 0.35)'
            : 'rgba(0, 245, 212, 0.35)'
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(100, 150, 255, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  // Theme Manager
  function applyTheme(themeName) {
    state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('nexus_theme', themeName);
  }

  // Filter & Search Logic
  function applyFilters() {
    const q = state.searchQuery.toLowerCase().trim();

    state.filteredFiles = state.files.filter((file) => {
      if (state.activeCategory === 'os' && file.courseCode !== 'BCSOS303') return false;
      if (state.activeCategory === 'ds' && file.courseCode !== 'BCIDS302') return false;
      if (state.activeCategory === 'arch' && !file.courseCode.includes('AT') && !file.courseCode.includes('BCO')) return false;
      if (state.activeCategory === 'qb' && file.type !== 'Question Bank') return false;
      if (state.activeCategory === 'career' && file.courseCode !== 'ROADMAP' && file.courseCode !== 'VTU-CALENDAR') return false;
      if (state.activeCategory === 'starred' && !state.starred.has(file.filename)) return false;

      if (q) {
        const inTitle = file.title.toLowerCase().includes(q);
        const inFilename = file.filename.toLowerCase().includes(q);
        const inAuthor = (file.author || '').toLowerCase().includes(q);
        const inCode = (file.courseCode || '').toLowerCase().includes(q);
        const inDesc = (file.description || '').toLowerCase().includes(q);
        const inTopics = (file.topics || []).some((t) => t.toLowerCase().includes(q));
        const inSnippet = (file.searchSnippet || '').toLowerCase().includes(q);
        return inTitle || inFilename || inAuthor || inCode || inDesc || inTopics || inSnippet;
      }
      return true;
    });

    switch (state.activeSort) {
      case 'name-asc':
        state.filteredFiles.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        state.filteredFiles.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'size-desc':
        state.filteredFiles.sort((a, b) => b.sizeBytes - a.sizeBytes);
        break;
      case 'size-asc':
        state.filteredFiles.sort((a, b) => a.sizeBytes - b.sizeBytes);
        break;
      case 'pages-desc':
        state.filteredFiles.sort((a, b) => (typeof b.pages === 'number' ? b.pages : 0) - (typeof a.pages === 'number' ? a.pages : 0));
        break;
      default:
        break;
    }

    renderDocuments();
    updateStats();
  }

  function getSubjectColor(code) {
    if (code === 'BCSOS303') return { badge: 'rgba(0, 242, 254, 0.4)', text: '#00f2fe', glow: 'rgba(0, 242, 254, 0.25)' };
    if (code === 'BCIDS302') return { badge: 'rgba(0, 245, 212, 0.4)', text: '#00f5d4', glow: 'rgba(0, 245, 212, 0.25)' };
    if (code.includes('AT') || code.includes('BCO')) return { badge: 'rgba(157, 78, 221, 0.4)', text: '#c77dff', glow: 'rgba(157, 78, 221, 0.25)' };
    if (code === 'ROADMAP') return { badge: 'rgba(255, 183, 3, 0.4)', text: '#ffb703', glow: 'rgba(255, 183, 3, 0.25)' };
    return { badge: 'rgba(255, 0, 127, 0.4)', text: '#ff70a6', glow: 'rgba(255, 0, 127, 0.25)' };
  }

  // Render Document Grid & Table
  function renderDocuments() {
    const gridEl = document.getElementById('documentsGrid');
    const tableEl = document.getElementById('documentsTable');
    const emptyStateEl = document.getElementById('emptyState');
    const resultsCountEl = document.getElementById('resultsCount');

    if (resultsCountEl) {
      resultsCountEl.textContent = `${state.filteredFiles.length} file${state.filteredFiles.length === 1 ? '' : 's'}`;
    }

    if (!state.filteredFiles.length) {
      if (gridEl) gridEl.style.display = 'none';
      if (tableEl) tableEl.style.display = 'none';
      if (emptyStateEl) emptyStateEl.style.display = 'flex';
      return;
    }

    if (emptyStateEl) emptyStateEl.style.display = 'none';

    if (state.viewMode === 'grid') {
      if (gridEl) gridEl.style.display = 'grid';
      if (tableEl) tableEl.style.display = 'none';
      renderGridView(gridEl);
    } else {
      if (gridEl) gridEl.style.display = 'none';
      if (tableEl) tableEl.style.display = 'block';
      renderTableView(tableEl);
    }
  }

  function getFileAccessPath(file) {
    // Return clean web-safe path if available
    return file.webPath || encodeURIComponent(file.filename);
  }

  function renderGridView(container) {
    container.innerHTML = state.filteredFiles
      .map((file, idx) => {
        const isStarred = state.starred.has(file.filename);
        const colors = getSubjectColor(file.courseCode);
        const targetPath = getFileAccessPath(file);

        return `
        <article class="doc-card" style="--card-glow: ${colors.text}; --card-glow-shadow: ${colors.glow};" data-index="${idx}">
          <div class="doc-thumbnail-wrap" onclick="window.nexusApp.openViewer(${idx})">
            <img class="doc-thumbnail" src="${file.thumbnail || 'assets/thumbnails/thumb_ppt.png'}" alt="${file.title}" loading="lazy" />
            <div class="thumbnail-overlay">
              <div class="top-badges">
                <span class="subject-badge" style="--badge-border: ${colors.badge}; --badge-color: ${colors.text};">
                  ${file.courseCode} &bull; ${file.badge}
                </span>
                <button class="star-btn ${isStarred ? 'starred' : ''}" title="${isStarred ? 'Remove Star' : 'Star Document'}" onclick="event.stopPropagation(); window.nexusApp.toggleStar('${file.filename}')">
                  ★
                </button>
              </div>
              <div class="bottom-badges">
                <span class="meta-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  ${typeof file.pages === 'number' ? file.pages + ' Pages' : file.pages}
                </span>
                <span class="meta-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  ${file.sizeFormatted}
                </span>
              </div>
            </div>
          </div>

          <div class="doc-content">
            <div class="doc-course-code">
              <span>${file.subject}</span> &bull; <span>${file.author}</span>
            </div>
            <h3 class="doc-title" onclick="window.nexusApp.openViewer(${idx})">${file.title}</h3>
            <p class="doc-desc">${file.description}</p>

            <div class="doc-tags">
              ${(file.topics || [])
                .slice(0, 4)
                .map(
                  (t) =>
                    `<span class="topic-tag" onclick="event.stopPropagation(); window.nexusApp.setSearch('${t}')">#${t}</span>`
                )
                .join('')}
            </div>

            <div class="doc-actions">
              <button class="action-btn preview-btn" onclick="window.nexusApp.openViewer(${idx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Read Online
              </button>
              <a class="action-btn secondary-btn" href="${targetPath}" target="_blank" title="Open in New Tab" onclick="soundFX.click()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Tab
              </a>
              <a class="action-btn secondary-btn" href="${targetPath}" download title="Download File" onclick="soundFX.click()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </a>
            </div>
          </div>
        </article>
      `;
      })
      .join('');
  }

  function renderTableView(container) {
    const tbody = container.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = state.filteredFiles
      .map((file, idx) => {
        const isStarred = state.starred.has(file.filename);
        const targetPath = getFileAccessPath(file);

        return `
        <tr data-index="${idx}">
          <td style="width: 40px; text-align: center;">
            <button class="star-btn ${isStarred ? 'starred' : ''}" style="width: 26px; height: 26px; font-size: 13px;" onclick="window.nexusApp.toggleStar('${file.filename}')">★</button>
          </td>
          <td>
            <div class="table-file-cell" onclick="window.nexusApp.openViewer(${idx})" style="cursor: pointer;">
              <img class="table-thumb" src="${file.thumbnail || 'assets/thumbnails/thumb_ppt.png'}" alt="thumb" />
              <div>
                <div class="table-title">${file.title}</div>
                <div class="table-desc">${file.description}</div>
              </div>
            </div>
          </td>
          <td><span class="subject-badge" style="font-size: 10px;">${file.courseCode}</span></td>
          <td>${file.subject}</td>
          <td>${typeof file.pages === 'number' ? file.pages + ' pages' : file.pages}</td>
          <td>${file.sizeFormatted}</td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="action-btn preview-btn" style="padding: 0.35rem 0.6rem; font-size: 11px;" onclick="window.nexusApp.openViewer(${idx})">Read</button>
              <a class="action-btn secondary-btn" style="padding: 0.35rem 0.6rem; font-size: 11px;" href="${targetPath}" target="_blank">Open ↗</a>
              <a class="action-btn secondary-btn" style="padding: 0.35rem 0.6rem; font-size: 11px;" href="${targetPath}" download>⭳</a>
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  function updateStats() {
    const starCountEl = document.getElementById('statStarredCount');
    if (starCountEl) starCountEl.textContent = state.starred.size;

    const navStarBadge = document.getElementById('navStarBadge');
    if (navStarBadge) navStarBadge.textContent = state.starred.size;

    const tabStarCount = document.getElementById('tabStarCount');
    if (tabStarCount) tabStarCount.textContent = state.starred.size;
  }

  function toggleStar(filename) {
    if (state.starred.has(filename)) {
      state.starred.delete(filename);
      showToast('Removed from favorites', '☆');
    } else {
      state.starred.add(filename);
      soundFX.twinkle();
      showToast('Added to favorites!', '★');
    }
    localStorage.setItem('nexus_starred', JSON.stringify(Array.from(state.starred)));
    applyFilters();
  }

  // =========================================================================
  // UNIVERSAL IN-BROWSER DOCUMENT VIEWER (PDF.js + NATIVE + GOOGLE DOCS)
  // =========================================================================

  function openViewer(filteredIndex) {
    const file = state.filteredFiles[filteredIndex];
    if (!file) return;

    soundFX.click();
    state.currentDocIndex = filteredIndex;

    const modal = document.getElementById('viewerModal');
    const titleEl = document.getElementById('modalDocTitle');
    const metaPillsEl = document.getElementById('modalMetaPills');
    const iframe = document.getElementById('docViewerIframe');
    const canvasWrap = document.getElementById('pdfCanvasWrapper');
    const pptCanvas = document.getElementById('pptViewerCanvas');
    const tabBtn = document.getElementById('modalOpenTabBtn');
    const downloadBtn = document.getElementById('modalDownloadBtn');
    const modalStarBtn = document.getElementById('modalStarBtn');
    const targetPath = getFileAccessPath(file);

    // Sidebar meta
    document.getElementById('sideMetaSubject').textContent = file.subject;
    document.getElementById('sideMetaCode').textContent = file.courseCode;
    document.getElementById('sideMetaAuthor').textContent = file.author || 'N/A';
    document.getElementById('sideMetaSize').textContent = file.sizeFormatted;
    document.getElementById('sideMetaPages').textContent = typeof file.pages === 'number' ? file.pages + ' pages' : file.pages;

    const sideTopics = document.getElementById('sideMetaTopics');
    sideTopics.innerHTML = (file.topics || [])
      .map((t) => `<span class="topic-tag">#${t}</span>`)
      .join('');

    // Document Scratchpad
    const notesKey = `nexus_notes_${file.filename}`;
    const notesTextarea = document.getElementById('docNotesArea');
    const notesStatus = document.getElementById('notesSaveStatus');
    notesTextarea.value = localStorage.getItem(notesKey) || '';
    notesStatus.textContent = notesTextarea.value ? 'Notes loaded from local storage' : 'No notes yet';

    notesTextarea.oninput = () => {
      localStorage.setItem(notesKey, notesTextarea.value);
      notesStatus.textContent = 'Auto-saved just now ✓';
    };

    titleEl.textContent = file.title;
    metaPillsEl.innerHTML = `
      <span class="meta-pill">${file.courseCode}</span>
      <span class="meta-pill">${file.sizeFormatted}</span>
      <span class="meta-pill">${typeof file.pages === 'number' ? file.pages + ' pages' : file.pages}</span>
    `;

    tabBtn.href = targetPath;
    downloadBtn.href = targetPath;

    if (modalStarBtn) {
      const isStarred = state.starred.has(file.filename);
      modalStarBtn.className = `star-btn ${isStarred ? 'starred' : ''}`;
      modalStarBtn.onclick = () => {
        toggleStar(file.filename);
        modalStarBtn.className = `star-btn ${state.starred.has(file.filename) ? 'starred' : ''}`;
      };
    }

    const pdfToolbar = document.getElementById('pdfReaderToolbar');

    // PDF vs PPT Display
    if (file.extension === 'pdf') {
      pptCanvas.style.display = 'none';
      if (pdfToolbar) pdfToolbar.style.display = 'flex';

      // Default to canvas viewer for best online / mobile cross-device experience
      setViewerMode('canvas', targetPath);
    } else {
      if (pdfToolbar) pdfToolbar.style.display = 'none';
      if (canvasWrap) canvasWrap.style.display = 'none';
      if (iframe) iframe.style.display = 'none';
      pptCanvas.style.display = 'flex';
      renderPptViewerCard(file, pptCanvas);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function setViewerMode(mode, targetPath) {
    state.pdf.activeMode = mode;
    const file = state.filteredFiles[state.currentDocIndex];
    const path = targetPath || getFileAccessPath(file);
    const iframe = document.getElementById('docViewerIframe');
    const canvasWrap = document.getElementById('pdfCanvasWrapper');

    // Update active button state
    document.querySelectorAll('.pdf-mode-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'canvas' && window.pdfjsLib) {
      if (iframe) iframe.style.display = 'none';
      if (canvasWrap) canvasWrap.style.display = 'flex';
      loadPdfDocument(path);
    } else if (mode === 'gdocs') {
      if (canvasWrap) canvasWrap.style.display = 'none';
      if (iframe) {
        iframe.style.display = 'block';
        // Build absolute URL for Google Docs Viewer
        const absoluteUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + path;
        iframe.src = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
      }
    } else {
      // Native iframe mode
      if (canvasWrap) canvasWrap.style.display = 'none';
      if (iframe) {
        iframe.style.display = 'block';
        iframe.src = path;
      }
    }
  }

  // PDF.js Canvas Page Renderer
  function loadPdfDocument(url) {
    const spinner = document.getElementById('pdfLoadingSpinner');
    if (spinner) spinner.style.display = 'flex';

    state.pdf.doc = null;
    state.pdf.pageNum = 1;

    window.pdfjsLib
      .getDocument(url)
      .promise.then((pdf) => {
        state.pdf.doc = pdf;
        state.pdf.pageCount = pdf.numPages;
        document.getElementById('pdfPageTotal').textContent = pdf.numPages;
        document.getElementById('pdfPageInput').value = 1;
        document.getElementById('pdfPageInput').max = pdf.numPages;
        renderPdfPage(1);
      })
      .catch((err) => {
        console.warn('PDF.js canvas load note (fallback to native embed):', err.message);
        if (spinner) spinner.style.display = 'none';
        // Fallback directly to native iframe
        setViewerMode('iframe', url);
      });
  }

  function renderPdfPage(num) {
    state.pdf.isRendering = true;
    const spinner = document.getElementById('pdfLoadingSpinner');
    if (spinner) spinner.style.display = 'flex';

    state.pdf.doc.getPage(num).then((page) => {
      const canvas = document.getElementById('pdfRenderCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const viewport = page.getViewport({ scale: state.pdf.scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTask.promise.then(() => {
        state.pdf.isRendering = false;
        if (spinner) spinner.style.display = 'none';

        if (state.pdf.pendingPage !== null) {
          renderPdfPage(state.pdf.pendingPage);
          state.pdf.pendingPage = null;
        }
      });
    });

    document.getElementById('pdfPageInput').value = num;
  }

  function queueRenderPage(num) {
    if (state.pdf.isRendering) {
      state.pdf.pendingPage = num;
    } else {
      renderPdfPage(num);
    }
  }

  function prevPdfPage() {
    if (!state.pdf.doc || state.pdf.pageNum <= 1) return;
    soundFX.click();
    state.pdf.pageNum--;
    queueRenderPage(state.pdf.pageNum);
  }

  function nextPdfPage() {
    if (!state.pdf.doc || state.pdf.pageNum >= state.pdf.pageCount) return;
    soundFX.click();
    state.pdf.pageNum++;
    queueRenderPage(state.pdf.pageNum);
  }

  function zoomPdf(delta) {
    if (!state.pdf.doc) return;
    soundFX.click();
    state.pdf.scale = Math.max(0.6, Math.min(2.5, state.pdf.scale + delta));
    queueRenderPage(state.pdf.pageNum);
    showToast(`Zoom: ${Math.round(state.pdf.scale * 100)}%`, '🔍');
  }

  function fitPdfWidth() {
    if (!state.pdf.doc) return;
    const container = document.getElementById('pdfCanvasWrapper');
    if (!container) return;
    soundFX.click();
    state.pdf.doc.getPage(state.pdf.pageNum).then((page) => {
      const viewport = page.getViewport({ scale: 1.0 });
      const availableWidth = container.clientWidth - 48;
      state.pdf.scale = Math.max(0.7, availableWidth / viewport.width);
      queueRenderPage(state.pdf.pageNum);
      showToast('Fitted to window width', '📐');
    });
  }

  function renderPptViewerCard(file, container) {
    const targetPath = getFileAccessPath(file);
    const absoluteUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + targetPath;
    const gdocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;

    container.innerHTML = `
      <div class="ppt-card-showcase">
        <span class="ppt-badge">📊 Microsoft PowerPoint Presentation (.ppt)</span>
        <h3>Chapter 1: Basic Structure of Computers</h3>
        <p style="color: #94a3b8; font-size: 1rem;">
          Computer Architecture & Organization &bull; Based on Carl Hamacher Curriculum
        </p>

        <div class="ppt-keypoints">
          <div class="ppt-point-item">
            <span>🔹</span>
            <div><strong>Functional Units:</strong> Input, Memory (MAR - Memory Address Register, MDR - Memory Data Register), Arithmetic & Logic Unit (ALU), Control Unit (CU), and Output.</div>
          </div>
          <div class="ppt-point-item">
            <span>🔹</span>
            <div><strong>Bus Structures:</strong> Single vs multi-bus configurations, bus timing, efficiency limitations where slowest connected device caps bus speed.</div>
          </div>
          <div class="ppt-point-item">
            <span>🔹</span>
            <div><strong>Performance Equation:</strong> Processor clock rate R = 1/P, basic execution steps, instruction cycles, and clock speed optimizations.</div>
          </div>
          <div class="ppt-point-item">
            <span>🔹</span>
            <div><strong>Memory Organization:</strong> 24-bit (16MB) and 32-bit (4GB) address space, word vs byte addressability, consecutive byte locations.</div>
          </div>
        </div>

        <div class="ppt-actions" style="flex-wrap: wrap;">
          <a class="action-btn preview-btn" href="${targetPath}" download style="padding: 0.85rem 1.5rem; font-size: 0.95rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download Slides (.ppt)
          </a>
          <a class="action-btn secondary-btn" href="${gdocsUrl}" target="_blank" style="padding: 0.85rem 1.5rem; font-size: 0.95rem;" title="View online in Google Slides / Docs">
            View in Google Slides ↗
          </a>
          <a class="action-btn secondary-btn" href="${targetPath}" target="_blank" style="padding: 0.85rem 1.5rem; font-size: 0.95rem;">
            Direct Open ↗
          </a>
        </div>
      </div>
    `;
  }

  function closeViewer() {
    const modal = document.getElementById('viewerModal');
    const iframe = document.getElementById('docViewerIframe');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    state.pdf.doc = null;
    setTimeout(() => {
      if (iframe) iframe.src = 'about:blank';
    }, 250);
  }

  function nextDoc() {
    if (state.currentDocIndex < state.filteredFiles.length - 1) {
      openViewer(state.currentDocIndex + 1);
    } else {
      openViewer(0);
    }
  }

  function prevDoc() {
    if (state.currentDocIndex > 0) {
      openViewer(state.currentDocIndex - 1);
    } else {
      openViewer(state.filteredFiles.length - 1);
    }
  }

  // =========================================================================
  // SYLLABUS TRACKER & EXAM CHECKLIST
  // =========================================================================

  function openSyllabusModal() {
    soundFX.click();
    const modal = document.getElementById('syllabusModal');
    renderSyllabusContent();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSyllabusModal() {
    const modal = document.getElementById('syllabusModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderSyllabusContent() {
    const subjectData = state.syllabus[state.activeSyllabusSubject];
    const container = document.getElementById('syllabusModulesContainer');
    if (!subjectData || !container) return;

    let totalTopics = 0;
    let checkedCount = 0;

    subjectData.modules.forEach((mod) => {
      mod.topics.forEach((t) => {
        totalTopics++;
        if (state.checkedTopics.has(`${subjectData.code}_${t}`)) checkedCount++;
      });
    });

    const overallPct = totalTopics > 0 ? Math.round((checkedCount / totalTopics) * 100) : 0;
    document.getElementById('overallSyllabusProgress').textContent = `${overallPct}% Prepared`;
    document.getElementById('overallProgressBar').style.width = `${overallPct}%`;

    container.innerHTML = subjectData.modules
      .map((mod, modIdx) => {
        const modChecked = mod.topics.filter((t) => state.checkedTopics.has(`${subjectData.code}_${t}`)).length;
        const modPct = Math.round((modChecked / mod.topics.length) * 100);

        return `
        <div class="module-card open" id="modCard_${mod.id}">
          <div class="module-header">
            <div class="module-title-box">
              <span class="module-num">M${modIdx + 1}</span>
              <div>
                <div class="module-name">${mod.name}</div>
                <div style="font-size: 11px; color: #94a3b8;">${mod.hours} &bull; ${modChecked}/${mod.topics.length} topics mastered</div>
              </div>
            </div>
            <div class="module-meta-actions">
              <div class="progress-bar-wrap" title="${modPct}% complete">
                <div class="progress-bar-fill" style="width: ${modPct}%;"></div>
              </div>
              <button class="filter-notes-btn" onclick="event.stopPropagation(); window.nexusApp.filterByModule('${subjectData.code}', ${modIdx + 1})">
                Study Module Notes 📖
              </button>
            </div>
          </div>
          <div class="module-topics-list">
            ${mod.topics
              .map((topic) => {
                const topicKey = `${subjectData.code}_${topic}`;
                const isChecked = state.checkedTopics.has(topicKey);
                return `
                <label class="topic-checkbox-label ${isChecked ? 'completed' : ''}">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.nexusApp.toggleTopicCheck('${topicKey}', this.checked)" />
                  <span>${topic}</span>
                </label>
              `;
              })
              .join('')}
          </div>
        </div>
      `;
      })
      .join('');
  }

  function toggleTopicCheck(topicKey, isChecked) {
    if (isChecked) {
      state.checkedTopics.add(topicKey);
      soundFX.twinkle();
    } else {
      state.checkedTopics.delete(topicKey);
      soundFX.click();
    }
    localStorage.setItem('nexus_syllabus_checked', JSON.stringify(Array.from(state.checkedTopics)));
    renderSyllabusContent();
  }

  function filterByModule(code, modNum) {
    closeSyllabusModal();
    soundFX.click();
    const query = `Module ${modNum}`;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = query;
    state.searchQuery = query;
    state.activeCategory = code === 'BCSOS303' ? 'os' : 'ds';

    document.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.category === state.activeCategory);
    });

    applyFilters();
    showToast(`Showing Module ${modNum} resources for ${code}`, '📚');
  }

  // =========================================================================
  // GLOBAL STUDY NOTEPAD & REVISION
  // =========================================================================

  function openNotesModal() {
    soundFX.click();
    const modal = document.getElementById('notesModal');
    const area = document.getElementById('globalNotesArea');
    area.value = localStorage.getItem('nexus_global_notes') || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeNotesModal() {
    const modal = document.getElementById('notesModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function saveGlobalNotes() {
    const area = document.getElementById('globalNotesArea');
    localStorage.setItem('nexus_global_notes', area.value);
    soundFX.click();
    showToast('Revision notes saved safely!', '💾');
  }

  function exportNotes() {
    const content = document.getElementById('globalNotesArea').value;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `VTU_3rd_Sem_Study_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    showToast('Notes downloaded as Markdown!', '📥');
  }

  // =========================================================================
  // ONLINE DEPLOYMENT & SHARING MODAL
  // =========================================================================

  function openDeployModal() {
    soundFX.click();
    const modal = document.getElementById('deployModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDeployModal() {
    const modal = document.getElementById('deployModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function copyText(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
      soundFX.twinkle();
      showToast('Copied to clipboard!', '📋');
      if (btnElement) {
        const oldText = btnElement.textContent;
        btnElement.textContent = 'Copied! ✓';
        setTimeout(() => (btnElement.textContent = oldText), 1500);
      }
    });
  }

  function sharePortal() {
    soundFX.click();
    if (navigator.share) {
      navigator
        .share({
          title: 'NEXUS 3.0 &bull; VTU 3rd Sem Study Hub',
          text: 'Comprehensive academic study materials, question banks, and notes for VTU 3rd Semester!',
          url: window.location.href
        })
        .catch(() => {});
    } else {
      copyText(window.location.href);
      showToast('Portal URL copied to clipboard!', '🔗');
    }
  }

  // Pomodoro Focus Timer
  function initPomodoro() {
    const display = document.getElementById('pomoDisplay');
    const playBtn = document.getElementById('pomoToggleBtn');

    function updatePomoDisplay() {
      const minutes = Math.floor(state.pomo.timeLeft / 60);
      const seconds = state.pomo.timeLeft % 60;
      const str = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      if (display) display.textContent = str;
    }

    window.nexusApp.togglePomo = () => {
      soundFX.click();
      if (state.pomo.isRunning) {
        clearInterval(state.pomo.timerId);
        state.pomo.isRunning = false;
        if (playBtn) playBtn.innerHTML = '▶';
        showToast('Study timer paused', '⏸');
      } else {
        state.pomo.isRunning = true;
        if (playBtn) playBtn.innerHTML = '❚❚';
        showToast('Focus session active! Deep work time.', '🎯');
        state.pomo.timerId = setInterval(() => {
          if (state.pomo.timeLeft > 0) {
            state.pomo.timeLeft--;
            updatePomoDisplay();
          } else {
            clearInterval(state.pomo.timerId);
            state.pomo.isRunning = false;
            soundFX.chime();
            showToast('Pomodoro session completed! Take a break.', '🔔');
            if (playBtn) playBtn.innerHTML = '▶';
          }
        }, 1000);
      }
    };

    window.nexusApp.resetPomo = (minutes = 25) => {
      clearInterval(state.pomo.timerId);
      state.pomo.isRunning = false;
      state.pomo.timeLeft = minutes * 60;
      state.pomo.totalTime = minutes * 60;
      if (playBtn) playBtn.innerHTML = '▶';
      updatePomoDisplay();
      soundFX.click();
    };

    updatePomoDisplay();
  }

  // Setup Event Listeners
  function setupEvents() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (clearBtn) clearBtn.style.display = state.searchQuery ? 'block' : 'none';
        applyFilters();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        state.searchQuery = '';
        clearBtn.style.display = 'none';
        applyFilters();
      });
    }

    // Category Tabs
    document.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        soundFX.click();
        document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeCategory = tab.dataset.category;
        applyFilters();
      });
    });

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        soundFX.click();
        state.activeSort = e.target.value;
        applyFilters();
      });
    }

    // View mode buttons
    const gridBtn = document.getElementById('viewGridBtn');
    const tableBtn = document.getElementById('viewTableBtn');

    if (gridBtn && tableBtn) {
      gridBtn.addEventListener('click', () => {
        soundFX.click();
        gridBtn.classList.add('active');
        tableBtn.classList.remove('active');
        state.viewMode = 'grid';
        localStorage.setItem('nexus_view_mode', 'grid');
        renderDocuments();
      });

      tableBtn.addEventListener('click', () => {
        soundFX.click();
        tableBtn.classList.add('active');
        gridBtn.classList.remove('active');
        state.viewMode = 'table';
        localStorage.setItem('nexus_view_mode', 'table');
        renderDocuments();
      });
    }

    // Theme selector
    const themeBtn = document.getElementById('themeCycleBtn');
    if (themeBtn) {
      const themes = ['cyberpunk', 'emerald', 'solar', 'light'];
      themeBtn.addEventListener('click', () => {
        const next = themes[(themes.indexOf(state.theme) + 1) % themes.length];
        applyTheme(next);
        soundFX.click();
        showToast(`Theme switched to ${next.toUpperCase()}`, '🎨');
      });
    }

    // Audio toggle
    const audioBtn = document.getElementById('soundToggleBtn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        localStorage.setItem('nexus_sound', state.soundEnabled);
        audioBtn.classList.toggle('active', state.soundEnabled);
        audioBtn.title = state.soundEnabled ? 'Mute Sounds' : 'Enable Sounds';
        if (state.soundEnabled) soundFX.click();
        showToast(state.soundEnabled ? 'Sound FX Enabled' : 'Sound FX Muted', state.soundEnabled ? '🔊' : '🔇');
      });
    }

    // Syllabus Subject Tabs
    document.querySelectorAll('.subject-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundFX.click();
        document.querySelectorAll('.subject-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeSyllabusSubject = btn.dataset.subject;
        renderSyllabusContent();
      });
    });

    // Page jump input
    const pageInput = document.getElementById('pdfPageInput');
    if (pageInput) {
      pageInput.addEventListener('change', (e) => {
        let p = parseInt(e.target.value, 10);
        if (state.pdf.doc && p >= 1 && p <= state.pdf.pageCount) {
          state.pdf.pageNum = p;
          queueRenderPage(p);
        }
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      const viewerModal = document.getElementById('viewerModal');
      const isViewerOpen = viewerModal && viewerModal.classList.contains('active');

      if (e.key === 'Escape') {
        closeViewer();
        closeSyllabusModal();
        closeNotesModal();
        closeDeployModal();
      } else if (isViewerOpen && e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
        nextDoc();
      } else if (isViewerOpen && e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
        prevDoc();
      } else if (!isViewerOpen && e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }
    });
  }

  // Public API attached to window
  window.nexusApp = {
    openViewer,
    closeViewer,
    nextDoc,
    prevDoc,
    toggleStar,
    setSearch: (tag) => {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = tag;
      state.searchQuery = tag;
      soundFX.click();
      applyFilters();
      window.scrollTo({ top: 380, behavior: 'smooth' });
    },
    openSyllabusModal,
    closeSyllabusModal,
    filterByModule,
    toggleTopicCheck,
    openNotesModal,
    closeNotesModal,
    saveGlobalNotes,
    exportNotes,
    openDeployModal,
    closeDeployModal,
    copyText,
    sharePortal,
    prevPdfPage,
    nextPdfPage,
    zoomPdf,
    fitPdfWidth,
    setViewerMode
  };

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(state.theme);
    initAmbientCanvas();
    setupEvents();
    initPomodoro();
    applyFilters();
  });
})();
