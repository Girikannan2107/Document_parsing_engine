/* ==========================================================================
   Forge.IQ Interactive Engine (Landing Page Logic)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. THEME TOGGLER
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  
  // Load saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Adjust canvas particle color schemes instantly
    if (initParticles) {
      initParticles();
    }
  });

  // 2. MOBILE MENU NAVIGATION
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      mobileNav.classList.remove('open');
    });
  });

  // 3. CANVAS PARTICLE SYSTEM
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  let particleColor = '#FF6B00';
  let connectionColor = 'rgba(255, 107, 0, 0.05)';

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.4 - 0.2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Bounce boundaries
      if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
      if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
    }
    draw() {
      ctx.fillStyle = particleColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particlesArray = [];
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    // Set colors based on active theme
    particleColor = isDark ? 'rgba(255, 107, 0, 0.65)' : 'rgba(255, 107, 0, 0.45)';
    connectionColor = isDark ? 'rgba(255, 107, 0, 0.06)' : 'rgba(255, 107, 0, 0.05)';
    
    const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / 16000), 100);
    for (let i = 0; i < numberOfParticles; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particlesArray.push(new Particle(x, y));
    }
  }

  function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
          + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
        if (distance < 12000) {
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animateParticles);
  }

  initParticles();
  animateParticles();

  // 4. INTERACTIVE WORKFLOW NODES & SVG ANTIMATION
  const activePath = document.getElementById('active-path');
  const workflowCards = document.querySelectorAll('.workflow-card');
  const telemetryPopup = document.getElementById('telemetry-popup');
  
  // Calculate path properties
  let pathLength = 0;
  if (activePath) {
    pathLength = activePath.getTotalLength();
    activePath.style.strokeDasharray = pathLength;
    activePath.style.strokeDashoffset = pathLength;
  }

  const stageData = [
    { name: "Moulding Telemetry", efficiency: "94.8%", capacity: "1.5 Tons", status: "OPTIMAL" },
    { name: "Melting Telemetry", efficiency: "92.1%", capacity: "3.0 Tons", status: "HEATING (1650°C)" },
    { name: "Pouring Telemetry", efficiency: "97.4%", capacity: "2.2 Tons", status: "FLOWING" },
    { name: "Heat Treatment Telemetry", efficiency: "95.3%", capacity: "1.8 Tons", status: "STABILIZING" },
    { name: "Closing Telemetry", efficiency: "99.1%", capacity: "2.5 Tons", status: "QA APPROVED" }
  ];

  workflowCards.forEach((card, index) => {
    // 1. Mouse hover highlights paths and brings popup
    card.addEventListener('mouseenter', (e) => {
      // Animate active connector path
      if (activePath) {
        // Map 5 stages (index 0 to 4) onto SVG length
        const offset = pathLength - (index / 4) * pathLength;
        activePath.style.strokeDashoffset = offset;
      }
      
      // Update popup content
      document.getElementById('popup-stage-name').textContent = stageData[index].name;
      document.getElementById('popup-efficiency').textContent = stageData[index].efficiency;
      document.getElementById('popup-capacity').textContent = stageData[index].capacity;
      document.getElementById('popup-status').textContent = stageData[index].status;
      
      // Position popup dynamically over hovered card
      const rect = card.getBoundingClientRect();
      const popupWidth = telemetryPopup.offsetWidth;
      const xPos = rect.left + window.scrollX + (rect.width / 2) - (popupWidth / 2);
      const yPos = rect.top + window.scrollY - 130; // Float above
      
      telemetryPopup.style.left = `${xPos}px`;
      telemetryPopup.style.top = `${yPos}px`;
      telemetryPopup.classList.add('active');
    });

    card.addEventListener('mouseleave', () => {
      // Hide active line overlay and popup
      if (activePath) {
        activePath.style.strokeDashoffset = pathLength;
      }
      telemetryPopup.classList.remove('active');
    });

    // 2. Direct click launches module in new tab
    card.addEventListener('click', () => {
      const link = card.dataset.link;
      if (link) {
        window.open(link, '_blank');
      }
    });
  });

  // 5. INTERACTIVE DASHBOARD TERMINAL TAB CONTROLLER
  const menuItems = document.querySelectorAll('.menu-item');
  const tabPanes = document.querySelectorAll('.console-tab-pane');
  const consoleTabTitle = document.getElementById('console-tab-title');

  const tabLabels = {
    analytics: { title: "OPERATIONAL ANALYTICS", desc: "Tonnage, yields, and active furnace outputs." },
    logs: { title: "HISTORICAL LOGS DATABASE", desc: "Granular details of saved, verified, and parsed moulds." },
    ingest: { title: "INTELLIGENT OCR INGESTION", desc: "Upload raw plans to stage, digitize, and parse templates." }
  };

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.dataset.tab;
      
      // Toggle menu active states
      menuItems.forEach(m => m.classList.remove('active'));
      item.classList.add('active');
      
      // Toggle tab pane visibility
      tabPanes.forEach(pane => pane.classList.remove('active'));
      document.getElementById(`tab-${targetTab}`).classList.add('active');

      // Update text titles
      consoleTabTitle.textContent = tabLabels[targetTab].title;
      document.querySelector('.sub-nav-desc').textContent = tabLabels[targetTab].desc;
    });
  });

  // 6. SIMULATED LIVE DASHBOARD TELEMETRY UPDATES
  const totalMouldsElem = document.getElementById('val-total-moulds');
  const totalTonnageElem = document.getElementById('val-total-tonnage');
  const yieldEffElem = document.getElementById('val-yield-eff');
  const qaScoreElem = document.getElementById('val-qa-score');
  
  const tickerVals = document.querySelectorAll('.ticker-val');
  const floatingYieldElem = document.getElementById('floating-yield');
  const floatingMiniFill = document.querySelector('.floating-mini-fill');

  function updateDashboardSim() {
    // Random variations
    const mouldsCount = parseInt(totalMouldsElem.textContent);
    const progress = Math.random() > 0.85; // 15% chance of addition
    
    if (progress) {
      // Add a mould
      const newCount = mouldsCount + 1;
      totalMouldsElem.textContent = newCount;
      
      const addedWeight = (Math.random() * 0.9 + 0.5).toFixed(2);
      const curTonnage = parseFloat(totalTonnageElem.textContent);
      const newTonnage = (curTonnage + parseFloat(addedWeight)).toFixed(2);
      totalTonnageElem.textContent = `${newTonnage} t`;
      
      // Add row to historical logs
      const tableBody = document.getElementById('log-table-body');
      if (tableBody) {
        const tr = document.createElement('tr');
        const randId = `D23722-${String(newCount).padStart(2, '0')}`;
        const todayStr = new Date().toLocaleDateString('en-GB');
        const weight = `${(Math.random() * 1.5 + 0.5).toFixed(2)} t`;
        const grades = ["WCB", "LCC", "CF8M"];
        const selectGrade = grades[Math.floor(Math.random() * grades.length)];
        
        tr.innerHTML = `
          <td class="numeric font-glow">${randId}</td>
          <td class="numeric">${todayStr}</td>
          <td>1 Ton</td>
          <td><span class="badge badge-gray">${selectGrade}</span></td>
          <td class="numeric">1 Pours</td>
          <td class="numeric">${weight}</td>
          <td><span class="badge badge-green">VERIFIED</span></td>
        `;
        tableBody.insertBefore(tr, tableBody.firstChild);
        // keep table clean, limit to 6 entries
        if (tableBody.children.length > 7) {
          tableBody.removeChild(tableBody.lastChild);
        }
      }
    }
    
    // Minor yield fluctuations
    const baseYield = 41.2;
    const offset = (Math.random() * 0.8 - 0.4);
    const tempYield = (baseYield + offset).toFixed(1);
    
    yieldEffElem.textContent = `${tempYield}%`;
    if (floatingYieldElem) {
      floatingYieldElem.textContent = `${tempYield}%`;
    }
    if (floatingMiniFill) {
      floatingMiniFill.style.width = `${tempYield}%`;
    }
    
    // Ticker adjustments
    tickerVals.forEach((el, index) => {
      // Plant Temp (first item)
      if (index === 0) {
        const randTemp = Math.floor(Math.random() * 10 + 1038);
        el.textContent = `${randTemp}°C`;
      }
      // OCR Tonnage rate
      if (index === 2) {
        const randRate = (Math.random() * 1 + 12.0).toFixed(1);
        el.textContent = `${randRate} t/h`;
      }
    });
  }

  // Poll simulator adjustments every 3.5 seconds
  setInterval(updateDashboardSim, 3500);

  // Manual Simulator Refresh button click
  const refreshBtn = document.getElementById('refresh-dashboard-btn');
  refreshBtn.addEventListener('click', () => {
    const icon = refreshBtn.querySelector('.refresh-icon');
    icon.classList.add('spin');
    
    // Force refresh metrics
    setTimeout(() => {
      icon.classList.remove('spin');
      // trigger simulation update instantly
      updateDashboardSim();
      updateDashboardSim();
    }, 800);
  });

  // 7. FILE UPLOAD & OCR PARSER SIMULATION
  const dragDropZone = document.getElementById('drag-drop-zone');
  const fileInput = document.getElementById('file-input');
  const selectFileBtn = document.getElementById('select-file-btn');
  const parsingFeedback = document.getElementById('parsing-feedback');
  const parsingProgressFill = document.getElementById('parsing-progress-fill');
  const parsingStatusText = document.getElementById('parsing-status-text');
  const parsedResults = document.getElementById('parsed-results');

  // Click triggers file selector
  selectFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dragDropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // Drag and Drop triggers
  dragDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropZone.classList.add('dragover');
  });

  dragDropZone.addEventListener('dragleave', () => {
    dragDropZone.classList.remove('dragover');
  });

  dragDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateParsing(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      simulateParsing(e.target.files[0]);
    }
  });

  function simulateParsing(file) {
    // Switch visual panels
    dragDropZone.style.display = 'none';
    parsingFeedback.style.display = 'block';
    parsedResults.style.display = 'none';
    parsingProgressFill.style.width = '0%';
    
    let progress = 0;
    const stages = [
      "INITIALIZING NEURAL PARSER...",
      "EXTRACTING CHEMICAL SPECTRA METRICS...",
      "MAPPING OCR DOCUMENT COORDINATES...",
      "VALIDATING CASTING CAPACITY LOGS...",
      "DIGITIZING MATRIX ENTRIES..."
    ];
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8 + 3);
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Finalize
        parsingProgressFill.style.width = '100%';
        parsingStatusText.textContent = "DOCUMENT INGESTED SUCCESSFULLY";
        parsingStatusText.style.color = "var(--green-active)";
        
        setTimeout(() => {
          parsedResults.style.display = 'block';
          // Generate realistic parsing response text matching Forge.IQ formats
          const docId = `M-${Math.floor(Math.random() * 90000 + 10000)}`;
          const parsedContent = `[OCR REPORT SUCCESS]
File: ${file.name}
Parsed ID: ${docId}
Material Category: Steel / Grade WCB
Tonnage Target: ${(Math.random() * 1.5 + 0.5).toFixed(2)} t
Clay Binder ratio: 18.2%
Silica Sand Weight: 9,240 kg
Inspection Result: QA VERIFIED (Score 9.8)
Telemetry matched: TRUE`;
          parsedResults.textContent = parsedContent;
          
          // Add close button or reset trigger
          const resetBtn = document.createElement('button');
          resetBtn.className = "btn btn-xs btn-outline";
          resetBtn.style.marginTop = "14px";
          resetBtn.style.width = "100%";
          resetBtn.textContent = "Upload Another File";
          resetBtn.addEventListener('click', () => {
            dragDropZone.style.display = 'block';
            parsingFeedback.style.display = 'none';
            fileInput.value = ''; // clear input
          });
          parsedResults.appendChild(resetBtn);
        }, 600);
      } else {
        parsingProgressFill.style.width = `${progress}%`;
        const stageIndex = Math.min(Math.floor(progress / 20), stages.length - 1);
        parsingStatusText.textContent = `${stages[stageIndex]} (${progress}%)`;
      }
    }, 120);
  }

  // 8. SCROLL INTERSECTION ANIMATOR
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // trigger only once
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('[data-scroll-fade]');
  animatedElements.forEach(el => scrollObserver.observe(el));
});
