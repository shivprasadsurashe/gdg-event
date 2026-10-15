/**
 * PulseFlow Interactive Features:
 * 1. ROI & Productivity Calculator
 * 2. AI Prompt & Workflow Optimizer Playground
 */

document.addEventListener('DOMContentLoaded', () => {
  initRoiCalculator();
  initPromptPlayground();
});

/* --------------------------------------------------------------------------
   1. ROI & Productivity Calculator
   -------------------------------------------------------------------------- */
function initRoiCalculator() {
  const teamSlider = document.getElementById('teamSizeSlider');
  const hourlyRateSlider = document.getElementById('hourlyRateSlider');
  const manualHoursSlider = document.getElementById('manualHoursSlider');

  const teamDisplay = document.getElementById('teamSizeDisplay');
  const hourlyRateDisplay = document.getElementById('hourlyRateDisplay');
  const manualHoursDisplay = document.getElementById('manualHoursDisplay');

  const annualSavingsDisplay = document.getElementById('annualSavingsDisplay');
  const hoursSavedDisplay = document.getElementById('hoursSavedDisplay');
  const roiMultiplierDisplay = document.getElementById('roiMultiplierDisplay');

  if (!teamSlider || !annualSavingsDisplay) return;

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const numberFormatter = new Intl.NumberFormat('en-US');

  function calculate() {
    const teamSize = parseInt(teamSlider.value, 10);
    const hourlyRate = parseInt(hourlyRateSlider.value, 10);
    const manualHoursPerWeek = parseInt(manualHoursSlider.value, 10);

    // Update slider label tags
    teamDisplay.textContent = `${teamSize} engineers`;
    hourlyRateDisplay.textContent = `$${hourlyRate}/hr`;
    manualHoursDisplay.textContent = `${manualHoursPerWeek} hrs/wk`;

    // Mathematical model
    const weeksPerYear = 48;
    const totalManualHoursAnnual = teamSize * manualHoursPerWeek * weeksPerYear;
    // PulseFlow eliminates 74% of repetitive orchestration overhead
    const hoursSavedAnnual = Math.round(totalManualHoursAnnual * 0.74);
    const grossSavings = hoursSavedAnnual * hourlyRate;

    // PulseFlow Pro license cost estimation ($49/seat/mo)
    const annualSoftwareCost = teamSize * 49 * 12;
    const netSavings = Math.max(0, grossSavings - annualSoftwareCost);
    const roiMultiplier = (grossSavings / Math.max(1, annualSoftwareCost)).toFixed(1);

    annualSavingsDisplay.textContent = currencyFormatter.format(grossSavings);
    hoursSavedDisplay.textContent = `${numberFormatter.format(hoursSavedAnnual)} hrs/yr`;
    roiMultiplierDisplay.textContent = `${roiMultiplier}x ROI`;
  }

  teamSlider.addEventListener('input', calculate);
  hourlyRateSlider.addEventListener('input', calculate);
  manualHoursSlider.addEventListener('input', calculate);

  // Initial calculation
  calculate();
}

/* --------------------------------------------------------------------------
   2. AI Prompt & Workflow Optimizer Playground
   -------------------------------------------------------------------------- */
function initPromptPlayground() {
  const promptInput = document.getElementById('playgroundPromptInput');
  const goalSelect = document.getElementById('playgroundGoalSelect');
  const runBtn = document.getElementById('runOptimizerBtn');
  const copyBtn = document.getElementById('copyOptimizedBtn');
  const outputCode = document.getElementById('playgroundOutputCode');
  const originalTokensEl = document.getElementById('statOriginalTokens');
  const optimizedTokensEl = document.getElementById('statOptimizedTokens');
  const reductionEl = document.getElementById('statReductionPct');
  const promptChips = document.querySelectorAll('.prompt-chip');

  if (!runBtn || !promptInput) return;

  const samplePrompts = {
    'coldstart': 'Investigate cold start latency spikes in AWS Lambda functions handling authentication JWT decoding during 9 AM peak traffic surge.',
    'sql': 'Generate a zero-downtime PostgreSQL migration query for partitioning a 400-million row billing ledger table by month while maintaining read replica parity.',
    'orchestration': 'Orchestrate an autonomous agent workflow to ingest GitHub pull request webhooks, run static security analysis, lint diffs, and post structured review comments.'
  };

  // Preset chip clicks
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.getAttribute('data-preset');
      if (samplePrompts[key]) {
        promptInput.value = samplePrompts[key];
        promptChips.forEach(c => c.style.borderColor = 'var(--border-subtle)');
        chip.style.borderColor = 'var(--primary)';
      }
    });
  });

  // Typewriter streaming effect
  function streamTypewriter(text, element, speed = 12) {
    element.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
  }

  // Run Optimization
  runBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      if (window.Toast) window.Toast.error('Input Required', 'Please enter or select a prompt scenario to optimize.');
      promptInput.focus();
      return;
    }

    const originalBtnText = runBtn.innerHTML;
    runBtn.disabled = true;
    runBtn.innerHTML = `<span class="spinner"></span> Analyzing AST & Tokens...`;

    try {
      const result = await window.ApiService.optimizePrompt({
        prompt,
        goal: goalSelect.value
      });

      // Stream output
      streamTypewriter(result.optimizedPrompt, outputCode);

      // Update stat tags
      if (originalTokensEl) originalTokensEl.textContent = result.originalTokens;
      if (optimizedTokensEl) optimizedTokensEl.textContent = result.optimizedTokens;
      if (reductionEl) reductionEl.textContent = `-${result.reductionPct}%`;

      if (window.Toast) {
        window.Toast.success('Prompt Optimized', `Tokens reduced by ${result.reductionPct}% (${result.latencyMs}ms processing)`);
      }
    } catch (err) {
      if (window.Toast) {
        window.Toast.error('Optimization Error', err.message);
      }
    } finally {
      runBtn.disabled = false;
      runBtn.innerHTML = originalBtnText;
    }
  });

  // Copy to Clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const textToCopy = outputCode.textContent;
      if (!textToCopy || textToCopy.includes('Click "Run AI Optimization"')) {
        if (window.Toast) window.Toast.info('Nothing to Copy', 'Run an optimization first to generate code.');
        return;
      }

      try {
        await navigator.clipboard.writeText(textToCopy);
        const origText = copyBtn.innerHTML;
        copyBtn.innerHTML = `✓ Copied!`;
        setTimeout(() => {
          copyBtn.innerHTML = origText;
        }, 2000);
        if (window.Toast) window.Toast.success('Copied to Clipboard', 'Optimized pipeline configuration copied.');
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        if (window.Toast) window.Toast.success('Copied to Clipboard', 'Optimized prompt copied.');
      }
    });
  }
}
