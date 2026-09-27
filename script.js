// ============================================================
// INCOME TAX CALCULATOR - FY 2026-27
// Core Logic Module
// All slabs verified from official Income Tax Department sources
// ============================================================

/**
 * Tax Slabs Configuration (FY 2026-27)
 */
const TAX_SLABS = {
  new: [
    { min: 0,       max: 400000,   rate: 0.00 },
    { min: 400000,  max: 800000,   rate: 0.05 },
    { min: 800000,  max: 1200000,  rate: 0.10 },
    { min: 1200000, max: 1600000,  rate: 0.15 },
    { min: 1600000, max: 2000000,  rate: 0.20 },
    { min: 2000000, max: 2400000,  rate: 0.25 },
    { min: 2400000, max: Infinity, rate: 0.30 }
  ],
  old_below60: [
    { min: 0,       max: 250000,   rate: 0.00 },
    { min: 250000,  max: 500000,   rate: 0.05 },
    { min: 500000,  max: 1000000,  rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ],
  old_senior: [
    { min: 0,       max: 300000,   rate: 0.00 },
    { min: 300000,  max: 500000,   rate: 0.05 },
    { min: 500000,  max: 1000000,  rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ],
  old_superSenior: [
    { min: 0,       max: 500000,   rate: 0.00 },
    { min: 500000,  max: 1000000,  rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ]
};

const SURCHARGE_RATES = {
  new: [
    { min: 0,         max: 5000000,  rate: 0.00 },
    { min: 5000000,   max: 10000000, rate: 0.10 },
    { min: 10000000,  max: 20000000, rate: 0.15 },
    { min: 20000000,  max: 50000000, rate: 0.25 },
    { min: 50000000,  max: Infinity, rate: 0.25 }
  ],
  old: [
    { min: 0,         max: 5000000,  rate: 0.00 },
    { min: 5000000,   max: 10000000, rate: 0.10 },
    { min: 10000000,  max: 20000000, rate: 0.15 },
    { min: 20000000,  max: 50000000, rate: 0.25 },
    { min: 50000000,  max: Infinity, rate: 0.37 }
  ]
};

// ============================================================
// CORE CALCULATION FUNCTIONS
// ============================================================

function calculateSlabTax(taxableIncome, slabs) {
  let tax = 0;
  for (let i = 0; i < slabs.length; i++) {
    const slab = slabs[i];
    if (taxableIncome <= slab.min) break;
    const incomeInSlab = Math.min(taxableIncome, slab.max) - slab.min;
    tax += incomeInSlab * slab.rate;
  }
  return tax;
}

function calculateSurcharge(tax, income, regime) {
  const rates = SURCHARGE_RATES[regime];
  for (let i = 0; i < rates.length; i++) {
    const bracket = rates[i];
    if (income > bracket.min && income <= bracket.max) {
      return tax * bracket.rate;
    }
  }
  return 0;
}

function applyRebate(tax, taxableIncome, regime) {
  if (regime === 'new') {
    if (taxableIncome <= 1200000) {
      const rebate = Math.min(tax, 60000);
      return Math.max(0, tax - rebate);
    }
  } else {
    if (taxableIncome <= 500000) {
      const rebate = Math.min(tax, 12500);
      return Math.max(0, tax - rebate);
    }
  }
  return tax;
}

function addCess(tax) {
  return tax * 1.04;
}

function calculateTaxForRegime(grossIncome, deductions, regime, ageGroup) {
  let taxableIncome = grossIncome;
  let standardDeduction = 0;
  let slabs = [];

  if (regime === 'new') {
    standardDeduction = 75000;
    taxableIncome = Math.max(0, grossIncome - standardDeduction);
    slabs = TAX_SLABS.new;
  } else {
    standardDeduction = 50000;
    if (ageGroup === 'superSenior') {
      slabs = TAX_SLABS.old_superSenior;
    } else if (ageGroup === 'senior') {
      slabs = TAX_SLABS.old_senior;
    } else {
      slabs = TAX_SLABS.old_below60;
    }
    const totalDeductions = Math.min(deductions, grossIncome - standardDeduction);
    taxableIncome = Math.max(0, grossIncome - standardDeduction - totalDeductions);
  }

  let taxBeforeSurcharge = calculateSlabTax(taxableIncome, slabs);
  taxBeforeSurcharge = applyRebate(taxBeforeSurcharge, taxableIncome, regime);

  let surcharge = 0;
  if (taxBeforeSurcharge > 0) {
    surcharge = calculateSurcharge(taxBeforeSurcharge, taxableIncome, regime);
  }

  const totalBeforeCess = taxBeforeSurcharge + surcharge;
  const totalTax = addCess(totalBeforeCess);

  return {
    grossIncome: grossIncome,
    standardDeduction: standardDeduction,
    deductions: regime === 'old' ? deductions : 0,
    taxableIncome: taxableIncome,
    baseTax: taxBeforeSurcharge,
    surcharge: surcharge,
    cess: totalTax - totalBeforeCess,
    totalTax: totalTax
  };
}

function calculateTax() {
  const grossIncome = parseFloat(document.getElementById('income').value) || 0;
  const regime = document.getElementById('regime').value;
  const ageGroup = document.getElementById('age').value;

  const sec80c = Math.min(parseFloat(document.getElementById('sec80c').value) || 0, 150000);
  const sec80d = Math.min(parseFloat(document.getElementById('sec80d').value) || 0, 50000);
  const nps = Math.min(parseFloat(document.getElementById('nps').value) || 0, 50000);
  const homeloan = Math.min(parseFloat(document.getElementById('homeloan').value) || 0, 200000);

  const totalDeductions = sec80c + sec80d + nps + homeloan;

  let newResult = null;
  let oldResult = null;

  if (regime === 'new' || regime === 'both') {
    newResult = calculateTaxForRegime(grossIncome, 0, 'new', ageGroup);
  }
  if (regime === 'old' || regime === 'both') {
    oldResult = calculateTaxForRegime(grossIncome, totalDeductions, 'old', ageGroup);
  }

  let html = '<div id="results" class="visible">';

  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const buildCard = (result, regimeName, isWinner) => {
    return `
      <div class="result-card ${isWinner ? 'winner' : ''}">
        <h3>
          ${regimeName}
          ${isWinner ? '<span class="regime-tag" style="background:#16a34a;color:white;">RECOMMENDED</span>' : ''}
        </h3>
        <div class="result-row">
          <span class="label">Gross Income</span>
          <span class="value">${formatCurrency(result.grossIncome)}</span>
        </div>
        <div class="result-row">
          <span class="label">Standard Deduction</span>
          <span class="value">- ${formatCurrency(result.standardDeduction)}</span>
        </div>
        ${result.deductions > 0 ? `
        <div class="result-row">
          <span class="label">Other Deductions</span>
          <span class="value">- ${formatCurrency(result.deductions)}</span>
        </div>
        ` : ''}
        <div class="result-row">
          <span class="label">Taxable Income</span>
          <span class="value">${formatCurrency(result.taxableIncome)}</span>
        </div>
        <div class="result-row">
          <span class="label">Base Tax</span>
          <span class="value">${formatCurrency(result.baseTax)}</span>
        </div>
        ${result.surcharge > 0 ? `
        <div class="result-row">
          <span class="label">Surcharge</span>
          <span class="value">${formatCurrency(result.surcharge)}</span>
        </div>
        ` : ''}
        <div class="result-row">
          <span class="label">Health & Education Cess (4%)</span>
          <span class="value">${formatCurrency(result.cess)}</span>
        </div>
        <div class="result-row total">
          <span class="label">Total Tax Payable</span>
          <span class="value">${formatCurrency(result.totalTax)}</span>
        </div>
      </div>
    `;
  };

  if (regime === 'both' && newResult && oldResult) {
    const newIsWinner = newResult.totalTax <= oldResult.totalTax;
    const saving = Math.abs(newResult.totalTax - oldResult.totalTax);

    html += buildCard(newResult, 'New Regime', newIsWinner);
    html += buildCard(oldResult, 'Old Regime', !newIsWinner);

    if (saving > 0) {
      html += `
        <div class="result-card" style="border:2px solid #2563eb;background:#f0f7ff;">
          <div class="result-row saving">
            <span class="label">You save with ${newIsWinner ? 'New' : 'Old'} Regime</span>
            <span class="value">${formatCurrency(saving)}</span>
          </div>
        </div>
      `;
    }
  } else if (newResult) {
    html += buildCard(newResult, 'New Regime', true);
  } else if (oldResult) {
    html += buildCard(oldResult, 'Old Regime', true);
  }

  html += '</div>';

  const resultsDiv = document.getElementById('results');
  if (resultsDiv) {
    resultsDiv.outerHTML = html;
  } else {
    document.querySelector('.btn-calculate').insertAdjacentHTML('afterend', html);
  }

  const actionButtons = document.getElementById('action-buttons');
  if (actionButtons) {
    actionButtons.style.display = 'grid';
  }

  generateSuggestions(grossIncome, regime, newResult, oldResult);
}

// ============================================================
// PART 2: ACTION BUTTONS & SUGGESTIONS
// ============================================================

function downloadPDF() {
  const userConfirmed = confirm(
    "PDF Download: A print dialog will open. Choose 'Save as PDF' to download.\n\n" +
    "Note: This is a FREE feature. Upgrade to premium for direct PDF download."
  );
  if (userConfirmed) {
    window.print();
  }
}

function shareOnWhatsApp() {
  const income = document.getElementById('income').value;
  const regime = document.getElementById('regime').value;
  const resultCards = document.querySelectorAll('.result-card');
  let taxInfo = '';
  if (resultCards.length > 0) {
    const totalRow = resultCards[0].querySelector('.result-row.total .value');
    if (totalRow) {
      taxInfo = totalRow.textContent;
    }
  }
  const message = `Income Tax Calculation (FY 2026-27)\n\n` +
    `Gross Income: ₹${parseInt(income).toLocaleString('en-IN')}\n` +
    `Regime: ${regime === 'both' ? 'Compared Both' : regime === 'new' ? 'New' : 'Old'}\n` +
    `Tax Payable: ${taxInfo}\n\n` +
    `Calculate yours free: ${window.location.href}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

function copyResult() {
  const resultCards = document.querySelectorAll('.result-card');
  let text = 'Income Tax Calculation (FY 2026-27)\n\n';
  resultCards.forEach(card => {
    const title = card.querySelector('h3')?.textContent || '';
    const rows = card.querySelectorAll('.result-row');
    text += `${title}\n`;
    rows.forEach(row => {
      const label = row.querySelector('.label')?.textContent || '';
      const value = row.querySelector('.value')?.textContent || '';
      text += `  ${label}: ${value}\n`;
    });
    text += '\n';
  });
  text += `Calculated at: ${window.location.href}`;
  navigator.clipboard.writeText(text).then(() => {
    alert('Result copied to clipboard! Paste it anywhere.');
  }).catch(() => {
    alert('Copy failed. Please try again.');
  });
}

function generateSuggestions(grossIncome, regime, newResult, oldResult) {
  const suggestions = [];

  const iconLightbulb = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"></path></svg>`;
  const iconCheck = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const iconArrow = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;

  if (newResult && oldResult) {
    if (newResult.totalTax < oldResult.totalTax) {
      const saving = oldResult.totalTax - newResult.totalTax;
      suggestions.push(
        `${iconCheck} <strong>The New Regime is better for you:</strong> You can save ₹${Math.round(saving).toLocaleString('en-IN')} by choosing the New Regime.`
      );
    } else if (oldResult.totalTax < newResult.totalTax) {
      const saving = newResult.totalTax - oldResult.totalTax;
      suggestions.push(
        `${iconCheck} <strong>The Old Regime is better for you:</strong> You can save ₹${Math.round(saving).toLocaleString('en-IN')} by choosing the Old Regime and claiming your deductions.`
      );
    } else {
      suggestions.push(
        `${iconCheck} <strong>Both regimes result in the same tax.</strong> The New Regime is simpler, so it may be the easier choice.`
      );
    }
  }

  if (regime === 'old' || regime === 'both') {
    const sec80c = parseFloat(document.getElementById('sec80c').value) || 0;
    if (sec80c < 150000) {
      const remaining = 150000 - sec80c;
      const taxSaving = remaining * 0.30;
      suggestions.push(
        `${iconArrow} <strong>Section 80C:</strong> You can invest ₹${remaining.toLocaleString('en-IN')} more (PPF, ELSS, LIC). Estimated tax saving: ~₹${Math.round(taxSaving).toLocaleString('en-IN')}.`
      );
    }
  }

  if (regime === 'old' || regime === 'both') {
    const nps = parseFloat(document.getElementById('nps').value) || 0;
    if (nps < 50000) {
      const remaining = 50000 - nps;
      const taxSaving = remaining * 0.30;
      suggestions.push(
        `${iconArrow} <strong>NPS (80CCD-1B):</strong> You can invest ₹${remaining.toLocaleString('en-IN')} more for an additional deduction and retirement savings. Estimated tax saving: ~₹${Math.round(taxSaving).toLocaleString('en-IN')}.`
      );
    }
  }

  if (regime === 'old' || regime === 'both') {
    const sec80d = parseFloat(document.getElementById('sec80d').value) || 0;
    if (sec80d < 25000) {
      const remaining = 25000 - sec80d;
      suggestions.push(
        `${iconArrow} <strong>Health Insurance (80D):</strong> You can deduct up to ₹${remaining.toLocaleString('en-IN')} more in premiums. This gives you health cover and tax savings.`
      );
    }
  }

  if (grossIncome <= 1200000 && regime === 'new') {
    suggestions.push(
      `${iconCheck} <strong>Good news:</strong> Your income is below ₹12L, so under the New Regime your tax is effectively zero. Make sure you claim the Section 87A rebate.`
    );
  }

  if (grossIncome > 5000000) {
    suggestions.push(
      `${iconArrow} <strong>High income:</strong> Surcharge applies at this level. Consider consulting a Chartered Accountant for tax planning.`
    );
  }

  suggestions.push(
    `${iconArrow} <strong>Tax Saving Tip:</strong> Start your tax planning in April, not in March. This gives you time to choose the right investments instead of rushing at the last minute.`
  );

  if (suggestions.length > 0) {
    const suggestionsHTML = `
      <h3>${iconLightbulb} Tax Saving Suggestions</h3>
      <ul>
        ${suggestions.map(s => `<li>${s}</li>`).join('')}
      </ul>
    `;
    document.getElementById('suggestions').innerHTML = suggestionsHTML;
    document.getElementById('suggestions').style.display = 'block';
  }
}

// ============================================================
// UI EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  const regimeSelect = document.getElementById('regime');
  const deductionsSection = document.getElementById('old-regime-section');

  if (regimeSelect.value === 'old' || regimeSelect.value === 'both') {
    deductionsSection.style.display = 'block';
  }

  regimeSelect.addEventListener('change', function() {
    if (this.value === 'old' || this.value === 'both') {
      deductionsSection.style.display = 'block';
    } else {
      deductionsSection.style.display = 'none';
    }
  });
});