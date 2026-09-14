// Tool configuration
const tools = {
    home: {
        title: 'Dashboard Overview',
        icon: '🏠',
        breadcrumb: 'Privacy Tools > Dashboard',
        url: null
    },
    chat: {
        title: 'Encrypted Chat (MUTE)',
        icon: '💬',
        breadcrumb: 'Privacy Tools > Encrypted Chat',
        url: './mute/enter.php'
    },
    scrambler: {
        title: 'Metadata Scrambler',
        icon: '🔀',
        breadcrumb: 'Privacy Tools > Metadata Scrambler',
        url: './scrambler/index.php'
    },
    transfer: {
        title: 'P2P File Transfer',
        icon: '📁',
        breadcrumb: 'Privacy Tools > P2P Transfer',
        url: './gop2p/gallery.php'
    },
    proxy: {
        title: 'Proxy Chains',
        icon: '🌐',
        breadcrumb: 'Privacy Tools > Proxy Chains',
        url: './proxies/index.php'
    },
    tempmail: {
        title: 'Temporary Mail',
        icon: '📧',
        breadcrumb: 'Privacy Tools > Temporary Mail',
        url: './tempmail/index.php'
    },
    about: {
        title: 'About Privacy Tools',
        icon: 'ℹ️',
        breadcrumb: 'Privacy Tools > About',
        url: null
    },
    privacy: {
        title: 'Why Privacy Matters',
        icon: '🛡️',
        breadcrumb: 'Privacy Tools > Why Privacy Matters',
        url: null
    }
};

let currentTool = 'home';

function loadTool(toolName) {
    console.log('Loading tool:', toolName);

    if (!tools[toolName]) {
        console.error('Tool not found:', toolName);
        return;
    }

    currentTool = toolName;
    updateNavigation();
    updateHeader(toolName);

    if (toolName === 'home') {
        showWelcomeScreen();
    } else if (toolName === 'about') {
        showAboutScreen();
    } else if (toolName === 'privacy') {
        showPrivacyScreen();
    } else {
        loadToolContent(toolName);
    }

    // Always close nav panel after selection (for mobile)
    toggleNav(false);
}

function updateNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeItem = document.querySelector(`[data-tool="${currentTool}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

function updateHeader(toolName) {
    const tool = tools[toolName];
    document.getElementById('content-icon').textContent = tool.icon;
    document.getElementById('content-title-text').textContent = tool.title;
    document.getElementById('breadcrumb').textContent = tool.breadcrumb;
}

function showWelcomeScreen() {
    document.getElementById('welcome-content').style.display = 'flex';
    document.getElementById('about-content').style.display = 'none';
    document.getElementById('privacy-content').style.display = 'none';
    document.getElementById('content-frame').style.display = 'none';
}

function showAboutScreen() {
    document.getElementById('welcome-content').style.display = 'none';
    document.getElementById('about-content').style.display = 'flex';
    document.getElementById('privacy-content').style.display = 'none';
    document.getElementById('content-frame').style.display = 'none';
}

function showPrivacyScreen() {
    document.getElementById('welcome-content').style.display = 'none';
    document.getElementById('about-content').style.display = 'none';
    document.getElementById('privacy-content').style.display = 'flex';
    document.getElementById('content-frame').style.display = 'none';
}

function loadToolContent(toolName) {
    const tool = tools[toolName];
    if (!tool.url) return;

    showLoading();
    document.getElementById('welcome-content').style.display = 'none';
    document.getElementById('about-content').style.display = 'none';
    document.getElementById('privacy-content').style.display = 'none';

    const iframe = document.getElementById('content-frame');
    iframe.style.display = 'block';
    iframe.src = tool.url;
}

function showLoading() {
    document.getElementById('loading-overlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.remove('show');
}

function toggleNav(show) {
    const navPanel = document.querySelector('.nav-panel');
    const navOverlay = document.querySelector('.nav-overlay');
    const navToggle = document.querySelector('.mobile-nav-toggle');

    if (show === undefined) {
        navPanel.classList.toggle('open');
        navOverlay.classList.toggle('show');
        navToggle.classList.toggle('active');
    } else if (show) {
        navPanel.classList.add('open');
        navOverlay.classList.add('show');
        navToggle.classList.add('active');
    } else {
        navPanel.classList.remove('open');
        navOverlay.classList.remove('show');
        navToggle.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loaded');

    // Nav menu clicks
    document.querySelectorAll('.nav-item').forEach(button => {
        button.addEventListener('click', function() {
            const toolName = button.getAttribute('data-tool');
            loadTool(toolName);
        });
    });

    // Tool preview cards (welcome screen)
    document.querySelectorAll('.tool-preview').forEach(preview => {
        preview.addEventListener('click', function() {
            const toolName = preview.getAttribute('data-tool');
            loadTool(toolName);
        });
    });

    // Mobile nav toggle button
    const navToggle = document.querySelector('.mobile-nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            toggleNav();
        });
    }

    // Overlay click closes nav
    const navOverlay = document.querySelector('.nav-overlay');
    if (navOverlay) {
        navOverlay.addEventListener('click', function() {
            toggleNav(false);
        });
    }

    // Iframe load — hide loading overlay
    const iframe = document.getElementById('content-frame');
    if (iframe) {
        iframe.addEventListener('load', function() {
            console.log('Iframe loaded');
            hideLoading();
            // Optional: re-set header in case iframe navigation changes context
            updateHeader(currentTool);
        });
    }

    // Start with welcome screen
    loadTool('home');
});
