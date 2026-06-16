document.addEventListener('DOMContentLoaded', () => {
    // State Variables
    let allUpdates = [];
    let currentFilteredUpdates = [];
    let activeFilter = 'all';
    let searchQuery = '';
    let selectedUpdateForTweet = null;

    // DOM Elements
    const btnRefresh = document.getElementById('btn-refresh');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const refreshIcon = document.getElementById('refresh-icon');
    const btnRetry = document.getElementById('btn-retry');
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const filterChips = document.getElementById('filter-chips');
    const listContainer = document.getElementById('release-notes-list');
    
    // States
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');
    
    // Stats
    const statTotal = document.getElementById('stat-total');
    const statFeatures = document.getElementById('stat-features');
    const statBreaking = document.getElementById('stat-breaking');

    // Tweet Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const modalClose = document.getElementById('modal-close');
    const btnCancelTweet = document.getElementById('btn-cancel-tweet');
    const btnSubmitTweet = document.getElementById('btn-submit-tweet');
    const modalPreviewText = document.getElementById('modal-preview-text');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCurrent = document.getElementById('char-current');
    const charProgress = document.getElementById('char-progress');

    // Accent colors config for cards
    const themeColors = {
        'Feature': { color: '#10b981', rgb: '16, 185, 129', border: 'rgba(16, 185, 129, 0.4)' },
        'Change': { color: '#3b82f6', rgb: '59, 130, 246', border: 'rgba(59, 130, 246, 0.4)' },
        'Issue': { color: '#f43f5e', rgb: '244, 63, 94', border: 'rgba(244, 63, 94, 0.4)' },
        'Breaking': { color: '#f97316', rgb: '249, 115, 22', border: 'rgba(249, 115, 22, 0.4)' },
        'Announcement': { color: '#a855f7', rgb: '168, 85, 247', border: 'rgba(168, 85, 247, 0.4)' },
        'Update': { color: '#94a3b8', rgb: '148, 163, 184', border: 'rgba(148, 163, 184, 0.4)' }
    };

    // Initialize Page
    fetchReleaseNotes();

    // Event Listeners
    btnRefresh.addEventListener('click', fetchReleaseNotes);
    btnRetry.addEventListener('click', fetchReleaseNotes);
    btnExportCsv.addEventListener('click', () => exportToCSV(currentFilteredUpdates));
    
    // Search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        searchClear.style.display = searchQuery.length > 0 ? 'block' : 'none';
        applyFilters();
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        searchInput.focus();
        applyFilters();
    });

    // Filter Chips
    filterChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;

        // Toggle Active
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        activeFilter = chip.dataset.type;
        applyFilters();
    });

    // Fetch Feed from Backend
    async function fetchReleaseNotes() {
        showState('loading');
        btnRefresh.classList.add('spinning');
        refreshIcon.classList.add('fa-spin');

        try {
            const response = await fetch('/api/release-notes');
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                allUpdates = result.data;
                calculateStats(allUpdates);
                applyFilters();
                showState('content');
            } else {
                throw new Error(result.error || 'Failed to parse release notes feed.');
            }
        } catch (error) {
            console.error('Error fetching release notes:', error);
            errorMessage.textContent = error.message;
            showState('error');
        } finally {
            btnRefresh.classList.remove('spinning');
            refreshIcon.classList.remove('fa-spin');
        }
    }

    // Calculate Stats
    function calculateStats(updates) {
        const total = updates.length;
        const features = updates.filter(item => item.type === 'Feature').length;
        const breakingAndIssues = updates.filter(item => item.type === 'Breaking' || item.type === 'Issue').length;

        // Animate counter values
        animateCount(statTotal, total);
        animateCount(statFeatures, features);
        animateCount(statBreaking, breakingAndIssues);
    }

    function animateCount(element, target) {
        let current = 0;
        const duration = 800; // ms
        const stepTime = 15;
        const steps = duration / stepTime;
        const increment = target / steps;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    }

    // Apply Client-Side Filters (Search & Type)
    function applyFilters() {
        let filtered = allUpdates;

        // 1. Filter by category pill
        if (activeFilter !== 'all') {
            filtered = filtered.filter(item => item.type === activeFilter);
        }

        // 2. Filter by search text
        if (searchQuery) {
            filtered = filtered.filter(item => {
                const titleMatch = item.date.toLowerCase().includes(searchQuery);
                const typeMatch = item.type.toLowerCase().includes(searchQuery);
                const contentMatch = item.text_snippet.toLowerCase().includes(searchQuery);
                return titleMatch || typeMatch || contentMatch;
            });
        }

        currentFilteredUpdates = filtered;
        // Update export button visibility based on filtered results length
        if (listContainer.style.display === 'flex' || document.getElementById('empty-state').style.display === 'flex') {
            btnExportCsv.style.display = filtered.length > 0 ? 'inline-flex' : 'none';
        }
        renderNotes(filtered);
    }

    // Render Cards in Grid
    function renderNotes(notes) {
        listContainer.innerHTML = '';
        
        if (notes.length === 0) {
            showState('empty');
            return;
        }

        showState('content');
        
        notes.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Set accent CSS custom properties dynamically
            const theme = themeColors[item.type] || themeColors['Update'];
            card.style.setProperty('--card-accent-color', theme.color);
            card.style.setProperty('--card-border-color', theme.border);
            card.style.setProperty('--card-glow-color', theme.rgb);

            const badgeClass = `badge badge-${item.type.toLowerCase()}`;
            
            card.innerHTML = `
                <div class="card-header">
                    <span class="${badgeClass}">${item.type}</span>
                    <span class="card-date">
                        <i class="fa-regular fa-calendar"></i>
                        ${item.date}
                    </span>
                </div>
                <div class="card-content">
                    ${item.html}
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-card btn-copy-trigger">
                        <i class="fa-regular fa-copy"></i> Copy
                    </button>
                    <a href="${item.link}" target="_blank" class="btn btn-secondary btn-card" rel="noopener">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Docs
                    </a>
                    <button class="btn btn-twitter btn-card btn-tweet-trigger">
                        <i class="fa-brands fa-x-twitter"></i> Tweet
                    </button>
                </div>
            `;

            // Copy Trigger Button Event
            const copyBtn = card.querySelector('.btn-copy-trigger');
            copyBtn.addEventListener('click', () => {
                const copyText = `BigQuery ${item.type} (${item.date})\n\n${item.text_snippet}\n\nRead more: ${item.link}`;
                navigator.clipboard.writeText(copyText).then(() => {
                    copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                    copyBtn.style.color = 'var(--color-feature)';
                    setTimeout(() => {
                        copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
                        copyBtn.style.color = '';
                    }, 1500);
                }).catch(err => {
                    console.error('Failed to copy to clipboard:', err);
                });
            });

            // Tweet Trigger Button Event
            const tweetBtn = card.querySelector('.btn-tweet-trigger');
            tweetBtn.addEventListener('click', () => openTweetModal(item));

            listContainer.appendChild(card);
        });
    }

    // Toggle Page States
    function showState(state) {
        loadingState.style.display = state === 'loading' ? 'flex' : 'none';
        errorState.style.display = state === 'error' ? 'flex' : 'none';
        emptyState.style.display = state === 'empty' ? 'flex' : 'none';
        listContainer.style.display = state === 'content' ? 'flex' : 'none';

        // Show CSV export button only when there is content loaded
        if (state === 'content' && currentFilteredUpdates.length > 0) {
            btnExportCsv.style.display = 'inline-flex';
        } else {
            btnExportCsv.style.display = 'none';
        }
    }

    // Tweet Modal Logics
    function openTweetModal(item) {
        selectedUpdateForTweet = item;
        
        // Generate draft text
        // Limit: 280 chars total.
        // Format: "BigQuery Feature (June 15, 2026): Use Gemini Cloud Assist... https://docs.cloud.google.com/bigquery/docs/release-notes#June_15_2026 #BigQuery #GoogleCloud"
        
        const hashtag = " #BigQuery #GoogleCloud";
        const link = ` ${item.link}`;
        const prefix = `BigQuery ${item.type} (${item.date}): `;
        
        // Available space for snippet
        const availableChars = 280 - prefix.length - link.length - hashtag.length;
        
        let snippet = item.text_snippet;
        if (snippet.length > availableChars) {
            snippet = snippet.substring(0, availableChars - 3) + '...';
        }
        
        const tweetDraft = `${prefix}${snippet}${link}${hashtag}`;
        
        // Setup Modal Contents
        modalPreviewText.textContent = item.text_snippet;
        tweetTextarea.value = tweetDraft;
        updateCharCount();
        
        // Show Modal
        tweetModal.style.display = 'flex';
        tweetTextarea.focus();
    }

    function closeTweetModal() {
        tweetModal.style.display = 'none';
        selectedUpdateForTweet = null;
    }

    function updateCharCount() {
        const currentLength = tweetTextarea.value.length;
        charCurrent.textContent = currentLength;
        
        // Update Progress Bar
        const percentage = Math.min((currentLength / 280) * 100, 100);
        charProgress.style.width = `${percentage}%`;
        
        // Change colors based on warnings
        charProgress.className = 'progress-bar';
        if (currentLength > 280) {
            charProgress.classList.add('danger');
            charCurrent.style.color = 'var(--color-issue)';
            btnSubmitTweet.disabled = true;
        } else if (currentLength > 250) {
            charProgress.classList.add('warning');
            charCurrent.style.color = 'var(--color-breaking)';
            btnSubmitTweet.disabled = false;
        } else {
            charCurrent.style.color = 'var(--text-secondary)';
            btnSubmitTweet.disabled = false;
        }
    }

    // Close Modal Events
    modalClose.addEventListener('click', closeTweetModal);
    btnCancelTweet.addEventListener('click', closeTweetModal);
    
    // Close modal on clicking outside
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            closeTweetModal();
        }
    });

    // Character Counter Listener
    tweetTextarea.addEventListener('input', updateCharCount);

    // Open X / Twitter Web Intent composer
    btnSubmitTweet.addEventListener('click', () => {
        const text = tweetTextarea.value.trim();
        if (text.length === 0 || text.length > 280) return;

        const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterIntentUrl, '_blank', 'noopener,noreferrer');
        closeTweetModal();
    });

    // Helper to export filtered updates to CSV
    function exportToCSV(notes) {
        if (!notes || notes.length === 0) return;

        const headers = ['Date', 'Type', 'Description', 'Link'];
        const rows = notes.map(item => {
            const cleanSnippet = item.text_snippet.replace(/"/g, '""');
            const cleanDate = item.date.replace(/"/g, '""');
            const cleanType = item.type.replace(/"/g, '""');
            const cleanLink = item.link.replace(/"/g, '""');
            return `"${cleanDate}","${cleanType}","${cleanSnippet}","${cleanLink}"`;
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `bigquery_release_notes_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
