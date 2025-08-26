// Simple Local Search Implementation
(function() {
    'use strict';
    
    let searchData = [];
    let searchIndex = null;
    
    // Initialize search
    async function initSearch() {
        try {
            const response = await fetch('/index.json');
            if (response.ok) {
                searchData = await response.json();
                console.log('Search data loaded:', searchData.length, 'items');
            }
        } catch (error) {
            console.log('Could not load search index, generating from DOM');
            generateSearchDataFromDOM();
        }
    }
    
    // Generate search data from current page content
    function generateSearchDataFromDOM() {
        // This is a fallback when no search index exists
        searchData = [{
            title: "搜索功能",
            url: "/search/",
            content: "搜索功能已启用，正在生成索引...",
            date: new Date().toISOString()
        }];
    }
    
    // Simple search function
    function performSearch(query) {
        if (!query || query.length < 2) {
            return [];
        }
        
        query = query.toLowerCase();
        const results = [];
        
        searchData.forEach(item => {
            let score = 0;
            const title = (item.title || '').toLowerCase();
            const content = (item.content || '').toLowerCase();
            const summary = (item.summary || '').toLowerCase();
            
            // Title matches get higher score
            if (title.includes(query)) {
                score += 10;
            }
            
            // Content matches
            if (content.includes(query) || summary.includes(query)) {
                score += 5;
            }
            
            if (score > 0) {
                results.push({
                    ...item,
                    score,
                    highlight: highlightText(item.title, query)
                });
            }
        });
        
        return results.sort((a, b) => b.score - a.score);
    }
    
    // Highlight matching text
    function highlightText(text, query) {
        if (!text || !query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Render search results
    function renderResults(results, query) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>未找到匹配结果</h3>
                    <p>尝试使用不同的关键词搜索</p>
                </div>
            `;
            return;
        }
        
        const statsHtml = `
            <div class="search-stats">
                <div class="stats-content">
                    <span class="result-count">找到 ${results.length} 条结果</span>
                    <span class="search-query">关于 "${query}"</span>
                </div>
            </div>
        `;
        
        const resultsHtml = results.map(result => {
            const date = result.date ? new Date(result.date).toLocaleDateString('zh-CN') : '';
            const excerpt = result.content || result.summary || '';
            const truncatedExcerpt = excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt;
            
            return `
                <div class="post-item">
                    <div class="post-header">
                        ${date ? `<span class="post-meta">${date}</span>` : ''}
                    </div>
                    <h2><a class="post-link" href="${result.url}">${result.highlight || result.title}</a></h2>
                    <div class="post-snippet">${highlightText(truncatedExcerpt, query)}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = statsHtml + resultsHtml;
    }
    
    // Setup search interface
    function setupSearchInterface() {
        const searchContainer = document.querySelector('#search-container');
        if (!searchContainer) return;
        
        searchContainer.innerHTML = `
            <div class="search-tips">
                <div class="tips-content">
                    <span class="tip-item"><kbd>/</kbd> 激活搜索</span>
                    <span class="tip-item"><kbd>Esc</kbd> 清空搜索</span>
                    <span class="tip-item"><kbd>Ctrl+K</kbd> 快速搜索</span>
                </div>
            </div>
            
            <div class="local-search-box">
                <input type="text" id="search-input" placeholder="搜索研究文章、团队信息..." autocomplete="off">
                <div class="search-loading" id="search-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <p>搜索中...</p>
                </div>
            </div>
            
            <div id="search-results"></div>
        `;
        
        const searchInput = document.getElementById('search-input');
        const loadingDiv = document.getElementById('search-loading');
        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (query.length < 2) {
                document.getElementById('search-results').innerHTML = '';
                return;
            }
            
            loadingDiv.style.display = 'block';
            
            searchTimeout = setTimeout(() => {
                const results = performSearch(query);
                renderResults(results, query);
                loadingDiv.style.display = 'none';
            }, 300);
        });
        
        // Auto-focus
        searchInput.focus();
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Press '/' to focus search
        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            if (window.location.pathname.includes('/search/')) {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            } else {
                window.location.href = '/search/';
            }
        }
        
        // Press 'Escape' to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            }
        }
        
        // Press 'Ctrl/Cmd + K' for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (!window.location.pathname.includes('/search/')) {
                window.location.href = '/search/';
            } else {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
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
    
    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.pathname.includes('/search/')) {
            initSearch().then(() => {
                setupSearchInterface();
            });
        }
    });
    
})();