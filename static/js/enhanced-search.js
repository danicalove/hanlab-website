// Enhanced Search Functionality
(function() {
    'use strict';
    
    // Global search state
    let searchInitialized = false;
    
    // Keyboard shortcuts for search
    document.addEventListener('keydown', function(e) {
        // Press '/' to focus search
        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            goToSearchPage();
        }
        
        // Press 'Escape' to clear search or go back
        if (e.key === 'Escape') {
            const searchInput = document.querySelector('#search-searchbar input');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                searchInput.focus();
            }
        }
        
        // Press 'Ctrl/Cmd + K' for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            goToSearchPage();
        }
    });
    
    function isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.isContentEditable
        );
    }
    
    function goToSearchPage() {
        window.location.href = '/search/';
    }
    
    // Enhanced search initialization for search page
    function initializeEnhancedSearch() {
        if (window.location.pathname.includes('/search/') && !searchInitialized) {
            searchInitialized = true;
            
            // Wait for Algolia to initialize
            setTimeout(function() {
                enhanceSearchInterface();
            }, 500);
        }
    }
    
    function enhanceSearchInterface() {
        const searchInput = document.querySelector('#search-searchbar input');
        if (!searchInput) return;
        
        // Add enhanced placeholder
        searchInput.placeholder = '搜索文章内容... (按 / 键激活搜索)';
        
        // Auto-focus search input
        searchInput.focus();
        
        // Add search tips
        addSearchTips();
        
        // Add loading indicator
        addLoadingIndicator();
        
        // Enhance results display
        enhanceResultsDisplay();
    }
    
    function addSearchTips() {
        const searchContainer = document.querySelector('#search-searchbar');
        if (!searchContainer) return;
        
        const tipsDiv = document.createElement('div');
        tipsDiv.className = 'search-tips';
        tipsDiv.innerHTML = `
            <div class="tips-content">
                <span class="tip-item"><kbd>/</kbd> 激活搜索</span>
                <span class="tip-item"><kbd>Esc</kbd> 清空搜索</span>
                <span class="tip-item"><kbd>Ctrl+K</kbd> 快速搜索</span>
            </div>
        `;
        
        searchContainer.insertAdjacentElement('afterend', tipsDiv);
    }
    
    function addLoadingIndicator() {
        const hitsContainer = document.querySelector('#search-hits');
        if (!hitsContainer) return;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'search-loading';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>搜索中...</p>
        `;
        
        hitsContainer.appendChild(loadingDiv);
        
        // Hide loading when results appear
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && 
                    hitsContainer.querySelector('.post-item')) {
                    loadingDiv.style.display = 'none';
                }
            });
        });
        
        observer.observe(hitsContainer, { childList: true, subtree: true });
    }
    
    function enhanceResultsDisplay() {
        // Add result count and search statistics
        const hitsContainer = document.querySelector('#search-hits');
        if (!hitsContainer) return;
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'search-stats';
        hitsContainer.parentNode.insertBefore(statsDiv, hitsContainer);
        
        // Monitor search results for stats update
        const observer = new MutationObserver(function() {
            updateSearchStats();
        });
        
        observer.observe(hitsContainer, { childList: true, subtree: true });
    }
    
    function updateSearchStats() {
        const statsDiv = document.querySelector('.search-stats');
        const resultItems = document.querySelectorAll('#search-hits .post-item');
        const searchInput = document.querySelector('#search-searchbar input');
        
        if (!statsDiv || !searchInput) return;
        
        const query = searchInput.value.trim();
        if (query) {
            const count = resultItems.length;
            statsDiv.innerHTML = `
                <div class="stats-content">
                    <span class="result-count">找到 ${count} 条结果</span>
                    <span class="search-query">关于 "${query}"</span>
                </div>
            `;
            statsDiv.style.display = 'block';
        } else {
            statsDiv.style.display = 'none';
        }
    }
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initializeEnhancedSearch);
    
    // Also initialize on navigation (for SPA-like behavior)
    window.addEventListener('popstate', initializeEnhancedSearch);
    
})();