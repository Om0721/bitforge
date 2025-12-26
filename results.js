// Get URL parameters
function getParameterByName(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Display results
document.getElementById('taxAmount').textContent = getParameterByName('tax') || 'N/A';
document.getElementById('taxableIncome').textContent = getParameterByName('taxable') || 'N/A';
document.getElementById('effectiveRate').textContent = getParameterByName('rate') || 'N/A';

// Suggestions
const suggestionsParam = decodeURIComponent(getParameterByName('suggestions'));
if (suggestionsParam) {
    const suggestions = JSON.parse(suggestionsParam);
    const ul = document.getElementById('suggestions');
    suggestions.forEach(sug => {
        const li = document.createElement('li');
        li.textContent = sug;
        ul.appendChild(li);
    });
}

// Back button
document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = 'index.html';
});

// Print button
document.getElementById('printBtn').addEventListener('click', function() {
    window.print();
});

// Gemini API integration
const API_KEY = 'AIzaSyADwj9Ix4l9UpnA5sJ9m9VcIv5pMu0HbgI'; // Replace with your actual Gemini API key

async function sendToGemini(message) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });
        const data = await response.json();
        console.log('Gemini API Response:', data); // Debug log
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
        }
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API Error:', error); // Debug log
        return 'Sorry, I couldn\'t process your request. Please check your API key or try again later.';
    }
}

document.getElementById('sendBtn').addEventListener('click', async function() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `<div class="message user"><strong>You:</strong> ${message}</div>`;
    input.value = '';

    // Get AI response
    const response = await sendToGemini(`You are an AI Tax Advisor. Based on Indian tax laws, answer this question: ${message}`);
    chatMessages.innerHTML += `<div class="message ai"><strong>AI Advisor:</strong> ${response}</div>`;

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Create chart
const income = parseFloat(getParameterByName('income'));
const tax = parseFloat(getParameterByName('tax').replace('₹', '').split(' ')[0]);
const takeHome = income - tax;
const dependents = parseInt(getParameterByName('dependents')) || 0;
const retirement = parseFloat(getParameterByName('retirement')) || 0;

const ctx = document.getElementById('taxChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Income Tax', 'Take-Home Income'],
        datasets: [{
            data: [tax, takeHome],
            backgroundColor: ['#e74c3c', '#27ae60'],
            hoverBackgroundColor: ['#c0392b', '#229954']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return '₹' + context.parsed.toLocaleString();
                    }
                }
            }
        }
    }
});

// Populate breakdown table
const tbody = document.getElementById('breakdownBody');
const steps = [
    { step: 1, desc: 'Gross Annual Income', amount: income },
    { step: 2, desc: 'Less: Retirement Contributions', amount: -retirement },
    { step: 3, desc: 'Adjusted Income', amount: income - retirement },
    { step: 4, desc: 'Less: Standard Deduction (₹50,000)', amount: -50000 },
    { step: 5, desc: 'Less: Dependent Exemption (₹50,000 each)', amount: - (dependents * 50000) },
    { step: 6, desc: 'Taxable Income', amount: Math.max(0, income - retirement - 50000 - dependents * 50000) },
    { step: 7, desc: 'Income Tax (before 4% cess)', amount: tax / 1.04 },
    { step: 8, desc: 'Add: Cess (4%)', amount: tax - (tax / 1.04) },
    { step: 9, desc: 'Total Income Tax Payable', amount: tax }
];

steps.forEach(step => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${step.step}</td>
        <td>${step.desc}</td>
        <td>₹${step.amount.toLocaleString()}</td>
    `;
    tbody.appendChild(tr);
});
