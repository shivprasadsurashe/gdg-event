/**
 * PulseFlow Master Application Logic
 * Orchestrates themes, navigation, dynamic metrics, tabs, pricing toggles, modals, and forms.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeader();
  initMobileMenu();
  initTelemetrySandbox();
  initFeatureTabs();
  initPricingToggle();
  initAnimatedCounters();
  initDemoModal();
  initNewsletter();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Light / Dark)
   -------------------------------------------------------------------------- */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const storedTheme = localStorage.getItem('pulseflow-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'dark');
  document.documentElement.setAttribute('data-theme', initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('pulseflow-theme', nextTheme);

      if (window.Toast) {
        window.Toast.info('Theme Changed', `Switched to ${nextTheme} mode.`);
      }
    });
  }
}

/* --------------------------------------------------------------------------
   2. Header & Scroll Effects
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Tracking
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const drawer = document.getElementById('mobileMenuDrawer');
  const links = drawer ? drawer.querySelectorAll('a') : [];

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
    const isOpen = drawer.classList.contains('open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  links.forEach(l => {
    l.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   4. Telemetry Sandbox & Real-time Live Stream
   -------------------------------------------------------------------------- */
function initTelemetrySandbox() {
  const chartCanvas = document.getElementById('telemetryChart');
  if (!chartCanvas) return;

  const chart = new TelemetryChart('telemetryChart', 'chartTooltip');

  // Time Range Buttons
  const rangeBtns = document.querySelectorAll('.time-btn');
  rangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const range = btn.getAttribute('data-range');
      chart.setRange(range);
    });
  });

  // Spike Simulation Button
  const spikeBtn = document.getElementById('simulateSpikeBtn');
  if (spikeBtn) {
    spikeBtn.addEventListener('click', () => {
      chart.simulateSpike();
    });
  }

  // Live Metrics Polling
  const metricActiveAgents = document.getElementById('metricActiveAgents');
  const metricLatency = document.getElementById('metricLatency');
  const metricEfficiency = document.getElementById('metricEfficiency');
  const metricCostSaved = document.getElementById('metricCostSaved');

  async function updateMetrics() {
    try {
      const data = await window.ApiService.fetchMetrics();
      if (metricActiveAgents) {
        metricActiveAgents.textContent = data.activeAgents.toLocaleString();
        metricActiveAgents.classList.add('flash-updated');
        setTimeout(() => metricActiveAgents.classList.remove('flash-updated'), 1000);
      }
      if (metricLatency) {
        metricLatency.textContent = `${data.p99LatencyMs}ms`;
      }
      if (metricEfficiency) {
        metricEfficiency.textContent = `${data.tokenEfficiencyPct}%`;
      }
      if (metricCostSaved) {
        metricCostSaved.textContent = `$${data.costSavedTotalUsd.toLocaleString()}`;
      }
    } catch (err) {
      console.warn('Metrics polling error:', err);
    }
  }

  // Poll metrics every 4.5 seconds
  setInterval(updateMetrics, 4500);
}

/* --------------------------------------------------------------------------
   5. Interactive Feature Tabs
   -------------------------------------------------------------------------- */
function initFeatureTabs() {
  const tabBtns = document.querySelectorAll('.feature-tab-btn');
  const tabPanels = document.querySelectorAll('.feature-tab-content-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const panel = document.getElementById(targetId);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. Pricing Billing Toggle (Monthly / Annual)
   -------------------------------------------------------------------------- */
function initPricingToggle() {
  const toggleInput = document.getElementById('billingCycleToggle');
  const proPrice = document.getElementById('pricePro');
  const enterprisePrice = document.getElementById('priceEnterprise');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelAnnual = document.getElementById('labelAnnual');

  if (!toggleInput) return;

  toggleInput.addEventListener('change', () => {
    const isAnnual = toggleInput.checked;
    if (labelMonthly) labelMonthly.classList.toggle('active', !isAnnual);
    if (labelAnnual) labelAnnual.classList.toggle('active', isAnnual);

    if (isAnnual) {
      if (proPrice) proPrice.textContent = '39';
      if (enterprisePrice) enterprisePrice.textContent = '149';
      if (window.Toast) {
        window.Toast.info('Annual Discount Applied', 'Saved 25% across all PulseFlow subscription tiers.');
      }
    } else {
      if (proPrice) proPrice.textContent = '49';
      if (enterprisePrice) enterprisePrice.textContent = '199';
    }
  });
}

/* --------------------------------------------------------------------------
   7. Animated Scroll Counters
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.counter-value[data-target]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = target % 1 !== 0;

        let start = 0;
        const duration = 1800;
        const startTime = performance.now();

        function updateNumber(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = start + (target - start) * eased;

          el.textContent = `${prefix}${isDecimal ? current.toFixed(2) : Math.floor(current)}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          } else {
            el.textContent = `${prefix}${target}${suffix}`;
          }
        }

        requestAnimationFrame(updateNumber);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

/* --------------------------------------------------------------------------
   8. Lead Capture & Demo Modal
   -------------------------------------------------------------------------- */
function initDemoModal() {
  const modalOverlay = document.getElementById('demoModalOverlay');
  const closeBtn = document.getElementById('closeModalBtn');
  const triggerBtns = document.querySelectorAll('.btn-open-demo, .btn-open-trial');
  const form = document.getElementById('demoBookingForm');
  const submitBtn = document.getElementById('demoSubmitBtn');

  if (!modalOverlay || !form) return;

  function openModal() {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    const firstInput = form.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('demoName');
    const emailInput = document.getElementById('demoEmail');
    const sizeSelect = document.getElementById('demoCompanySize');
    const interestSelect = document.getElementById('demoInterest');

    // Reset error styles
    [nameInput, emailInput, sizeSelect].forEach(inp => inp.classList.remove('error'));

    let hasError = false;

    if (!nameInput.value.trim()) {
      nameInput.classList.add('error');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('error');
      hasError = true;
    }

    if (!sizeSelect.value) {
      sizeSelect.classList.add('error');
      hasError = true;
    }

    if (hasError) {
      if (window.Toast) window.Toast.error('Validation Error', 'Please complete all required fields correctly.');
      return;
    }

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      companySize: sizeSelect.value,
      interest: interestSelect ? interestSelect.value : 'General'
    };

    const origBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Confirming Reservation...`;

    try {
      const response = await window.ApiService.submitLead(payload);
      if (window.Toast) {
        window.Toast.success('Demo Reserved', response.message, 6000);
      }
      form.reset();
      closeModal();
    } catch (err) {
      if (window.Toast) {
        window.Toast.error('Submission Failed', err.message);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnHtml;
    }
  });
}

/* --------------------------------------------------------------------------
   9. Footer Newsletter Subscription
   -------------------------------------------------------------------------- */
function initNewsletter() {
  const form = document.getElementById('footerNewsletterForm');
  const input = document.getElementById('footerEmailInput');
  const submitBtn = document.getElementById('footerNewsletterBtn');

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      if (window.Toast) window.Toast.error('Invalid Email', 'Please enter a valid email address.');
      input.focus();
      return;
    }

    const origHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span>`;

    try {
      const res = await window.ApiService.subscribeNewsletter(email);
      if (window.Toast) {
        window.Toast.success('Subscribed!', res.message);
      }
      input.value = '';
    } catch (err) {
      if (window.Toast) {
        window.Toast.error('Error', err.message);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;
    }
  });
}
