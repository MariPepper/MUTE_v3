<!DOCTYPE html>
<html lang="en">

<head>
    <?php
    $nonce = base64_encode(random_bytes(16));
    ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="Strict-Transport-Security" content="max-age=31536000;">
    <meta http-equiv="Content-Security-Policy"
        content="script-src 'self' 'nonce-<?php echo $nonce; ?>'; style-src 'self'; font-src 'self'; img-src 'self';">
    <title>Privacy Tools Dashboard</title>
    <link rel="stylesheet" href="dashboard.css">
</head>

<body>
    <div class="dashboard">
        <!-- Left Navigation Panel -->
        <nav class="nav-panel">
            <div class="nav-header">
                <h1>🔐 Privacy Tools</h1>
                <p>Secure & Anonymous</p>
            </div>

            <div class="nav-menu">
                <button class="nav-item active" data-tool="home">
                    <div class="nav-content">
                        <span class="nav-icon">🏠</span>
                        <div class="nav-text">
                            Dashboard
                            <div class="nav-subtitle">Overview</div>
                        </div>
                    </div>
                </button>

                <button class="nav-item" data-tool="chat">
                    <div class="nav-content">
                        <span class="nav-icon">💬</span>
                        <div class="nav-text">
                            Encrypted Chat
                            <div class="nav-subtitle">MUTE</div>
                        </div>
                    </div>
                </button>

                <button class="nav-item" data-tool="scrambler">
                    <div class="nav-content">
                        <span class="nav-icon">🔀</span>
                        <div class="nav-text">
                            Metadata Scrambler
                            <div class="nav-subtitle">Clean Files</div>
                        </div>
                    </div>
                </button>

                <button class="nav-item" data-tool="transfer">
                    <div class="nav-content">
                        <span class="nav-icon">📁</span>
                        <div class="nav-text">
                            P2P Transfer
                            <div class="nav-subtitle">Secure Files</div>
                        </div>
                    </div>
                </button>

                <button class="nav-item" data-tool="proxy">
                    <div class="nav-content">
                        <span class="nav-icon">🌐</span>
                        <div class="nav-text">
                            Proxy Chains
                            <div class="nav-subtitle">Decentralized Network</div>
                        </div>
                    </div>
                </button>

                <button class="nav-item" data-tool="tempmail">
                    <div class="nav-content">
                        <span class="nav-icon">📧</span>
                        <div class="nav-text">
                            Temporary Mail
                            <div class="nav-subtitle">Disposable Email</div>
                        </div>
                    </div>
                </button>

                <button class="nav-item" data-tool="privacy">
                    <div class="nav-content">
                        <span class="nav-icon">🛡️</span>
                        <div class="nav-text">
                            Why Privacy Matters
                            <div class="nav-subtitle">Censorship & Freedom</div>
                        </div>
                    </div>
                </button>

                <button class="nav-item" data-tool="about">
                    <div class="nav-content">
                        <span class="nav-icon">ℹ️</span>
                        <div class="nav-text">
                            About
                            <div class="nav-subtitle">Privacy Info</div>
                        </div>
                    </div>
                </button>
            </div>

            <div class="nav-footer">
                <div class="status-indicator">
                    <div class="status-dot"></div>
                    All Services Online
                </div>
            </div>
        </nav>

        <!-- Right Content Panel -->
        <main class="content-panel">
            <button class="mobile-nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <div class="nav-overlay"></div>
            <header class="content-header">
                <div class="content-title">
                    <span id="content-icon">🏠</span>
                    <span id="content-title-text">Dashboard Overview</span>
                </div>
                <div class="breadcrumb" id="breadcrumb">
                    Privacy Tools > Dashboard
                </div>
            </header>

            <div class="content-body">
                <div class="loading-overlay" id="loading-overlay">
                    <div class="spinner"></div>
                </div>

                <div id="welcome-content" class="welcome-screen">
                    <div class="content-container">
                        <div class="welcome-icon">🛡️</div>
                        <h2>Welcome to Privacy Tools</h2>
                        <p>Your secure suite of privacy-focused applications. Click any tool in the left panel to get started with encrypted communication, metadata cleaning, or secure file transfers.</p>

                        <div class="tool-grid">
                            <div class="tool-preview" data-tool="chat">
                                <div class="tool-preview-icon">💬</div>
                                <h3>Encrypted Chat</h3>
                                <p>Secure messaging</p>
                            </div>
                            <div class="tool-preview" data-tool="scrambler">
                                <div class="tool-preview-icon">🔀</div>
                                <h3>Metadata Scrambler</h3>
                                <p>Remove file data</p>
                            </div>
                            <div class="tool-preview" data-tool="transfer">
                                <div class="tool-preview-icon">📁</div>
                                <h3>P2P Transfer</h3>
                                <p>Secure file sharing</p>
                            </div>
                            <div class="tool-preview" data-tool="proxy">
                                <div class="tool-preview-icon">🌐</div>
                                <h3>Proxy Chains</h3>
                                <p>Decentralized Mesh Network</p>
                            </div>
                            <div class="tool-preview" data-tool="tempmail">
                                <div class="tool-preview-icon">📧</div>
                                <h3>Temporary Mail</h3>
                                <p>Disposable email addresses</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="about-content" class="welcome-screen">
                    <div class="content-container">
                        <h3>🔐 Security Features</h3>
                        <ul>
                            <li>End-to-end encryption for all communications</li>
                            <li>No permanent data storage</li>
                            <li>Client-side processing when possible</li>
                            <li>Strong Content Security Policy (CSP)</li>
                        </ul>

                        <h3>🛡️ Privacy Principles</h3>
                        <ul>
                            <li>Minimal data collection</li>
                            <li>Anonymous usage supported</li>
                            <li>Automatic data expiration</li>
                            <li>Open source transparency</li>
                        </ul>

                        <h3>⚡ Performance</h3>
                        <ul>
                            <li>Lightweight applications</li>
                            <li>Browser-based processing</li>
                            <li>Efficient P2P connections</li>
                            <li>Responsive design</li>
                        </ul>
                    </div>
                </div>

                <div id="privacy-content" class="welcome-screen text-section">
                    <div class="content-container">
                        <h2>The European Censorship Machine: Why Privacy Matters More Than Ever</h2>
                        <p>Europe has become a digital authoritarian playground, wrapped in the false promise of "safety" and
                            "child protection." The EU's Digital Services Act and the UK's Online Safety Act aren't about
                            protecting anyone—they're about control, surveillance, and silencing dissent.</p>

                        <h3>The Death of Free Speech by a Thousand Cuts</h3>
                        <p>Just this week, content was being blocked within hours of the UK's Online Safety Act enforcement,
                            while actual harmful content remained untouched. This isn't incompetence—it's by
                            design. The censorship might look largely one-sided at the beginning, but it will almost uniformly
                            target political dissent under the guise of combating "hate speech."</p>

                        <p>The EU's Digital Services Act forces platforms to meet impossible transparency requirements while
                            threatening fines up to 6% of global annual turnover—billions of euros for major tech companies. The
                            result? Pre-emptive censorship on a massive scale. Why risk billion-dollar fines when you can simply
                            silence anything remotely controversial?</p>

                        <h3>Privacy Is Dead—Long Live Surveillance</h3>
                        <p>These laws don't just censor speech—they obliterate privacy. Age verification systems, mandatory
                            content scanning, and algorithmic surveillance have turned every European internet user into a
                            suspect. The law is putting up barriers for people who want to read world news, listen to music on
                            Spotify, chat on Discord, or play video games.</p>

                        <p>Your conversations, your browsing habits, your thoughts—all monitored, catalogued, and judged by
                            faceless bureaucrats who've decided they know what's best for you. This isn't protection; it's
                            digital totalitarianism with a European Union flag draped over it.</p>

                        <h3>Fight Back and Reclaim Your Digital Freedom</h3>
                        <p>Every encrypted message is an act of rebellion. Every private conversation is a middle finger to the
                            surveillance state. That's why platforms like this exist—to give you back what they've stolen: the
                            right to speak freely and privately without government eavesdropping.</p>

                        <p>Don't let them gaslight you into believing censorship is safety. Don't accept that your privacy is
                            the price of their "protection." The internet was meant to be free, and it's up to us to keep it
                            that way—one encrypted message at a time.</p>
                        <h3>Timed Encrypted Chat</h3>
                        <p>Timed Encrypted Chat provides a secure and ephemeral messaging platform designed to prioritize user
                            privacy. Whether public or private, messages are automatically deleted after 5 minutes, leaving no
                            trace behind. With end-to-end encryption for every conversation and a unique pooling system.</p>
                        <h3>Metadata Scrambler</h3>
                        <p>Our new Metadata Scrambler tool enhances your privacy by obfuscating metadata associated with your
                            files. This feature ensures that your digital footprint remains minimal, protecting your identity
                            and activities from unwanted tracking or analysis.</p>
                    </div>
                </div>

                <iframe id="content-frame" class="content-frame" sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation allow-downloads"></iframe>
            </div>
        </main>
    </div>

    <script nonce="<?php echo $nonce; ?>" src="dashboard.js"></script>
</body>

</html>