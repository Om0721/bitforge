document.getElementById('taxForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const income = parseFloat(document.getElementById('income').value);
    const status = document.getElementById('status').value;
    const dependents = parseInt(document.getElementById('dependents').value) || 0;
    const retirement = parseFloat(document.getElementById('retirement').value) || 0;
    const location = document.getElementById('location').value;
    
    if (isNaN(income) || income <= 0) {
        alert('Please enter a valid income.');
        return;
    }
    
    // Adjust for retirement contributions (pre-tax)
    let adjustedIncome = income - retirement;
    
    // Indian tax calculation (New Regime, approximate for FY 2025-26)
    let deduction = 50000; // Standard deduction
    // Add for dependents (simplified, assuming ₹50,000 per dependent)
    deduction += dependents * 50000;
    
    let taxableIncome = Math.max(0, adjustedIncome - deduction);
    
    // New Tax Regime slabs (INR)
    let tax = 0;
    if (taxableIncome <= 300000) {
        tax = 0;
    } else if (taxableIncome <= 600000) {
        tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 900000) {
        tax = 15000 + (taxableIncome - 600000) * 0.10;
    } else if (taxableIncome <= 1200000) {
        tax = 15000 + 30000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome <= 1500000) {
        tax = 15000 + 30000 + 30000 + (taxableIncome - 1200000) * 0.20;
    } else {
        tax = 15000 + 30000 + 30000 + 60000 + (taxableIncome - 1500000) * 0.30;
    }
    
    // Add 4% cess
    tax *= 1.04;
    
    const effectiveRate = income > 0 ? (tax / income * 100).toFixed(2) : 0;
    
    // AI Suggestions to reduce tax
    const suggestions = [];
    if (retirement < 150000) {
        suggestions.push('Invest up to ₹1.5 lakh in 80C options like PPF, ELSS, or life insurance for tax deduction.');
    }
    if (dependents > 0) {
        suggestions.push('Claim deductions for children\'s education or medical expenses under Section 80C/80D.');
    }
    if (income > 500000) {
        suggestions.push('Consider investing in NPS (National Pension Scheme) for additional 80CCD(1B) deduction up to ₹50,000.');
        suggestions.push('Explore home loan interest deduction under Section 24B (up to ₹2 lakh).');
    }
    if (income > 1000000) {
        suggestions.push('Donate to charity under 80G for tax benefits, or invest in infrastructure bonds.');
    }
    suggestions.push('Opt for the New Tax Regime if it suits your deductions, or Old Regime for more exemptions.');
    suggestions.push('Consult a Chartered Accountant for personalized tax planning.');
    
    // Display results on separate page
    const params = new URLSearchParams({
        tax: `₹${tax.toFixed(2)} (including 4% cess)`,
        taxable: `₹${taxableIncome.toFixed(2)} (after deductions)`,
        rate: `${effectiveRate}%`,
        income: income.toString(),
        dependents: dependents.toString(),
        retirement: retirement.toString(),
        suggestions: encodeURIComponent(JSON.stringify(suggestions))
    });
    window.location.href = `results.html?${params.toString()}`;
});

// Reset functionality
document.getElementById('resetBtn').addEventListener('click', function() {
    document.getElementById('taxForm').reset();
    document.getElementById('results').style.display = 'none';
});
