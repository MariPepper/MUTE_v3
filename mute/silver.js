function acceptConsent() {
    sessionStorage.setItem('cookieConsent', 'true');
    document.getElementById('consent-box').style.display = 'none';
}

function rejectConsent() {
    alert("Chat requires session storage. Please accept or leave.");
    document.getElementById('consent-box').style.display = 'none';
    window.location.href = "about:blank";
}

if (!sessionStorage.getItem('cookieConsent')) {
    const consentBox = document.getElementById('consent-box');
    if (consentBox) {
        consentBox.style.display = 'block';
    }
}

const keyManager = (() => {
    const KEY_TTL = 60000;
    let state = JSON.parse(sessionStorage.getItem('keyManagerState')) || {
        keys: [],
        lastFetch: 0
    };

    const saveState = () => {
        sessionStorage.setItem('keyManagerState', JSON.stringify(state));
    };

    return {
        get: async (forceFetch = false) => {
            const now = Date.now();
            if (forceFetch || state.keys.length === 0 || (now - state.lastFetch > KEY_TTL)) {
                console.log("Fetching keys... Force fetch:", forceFetch);
                const formData = new FormData();
                formData.append('action', 'get_key');
                try {
                    const response = await fetch(window.location.href, {
                        method: 'POST',
                        body: formData
                    });
                    const responseText = await response.text();
                    console.log("Key fetch response:", responseText);
                    if (!response.ok) {
                        console.error('Key fetch failed:', response.status, response.statusText);
                        throw new Error('Failed to fetch key: HTTP ' + response.status);
                    }
                    const data = JSON.parse(responseText);
                    if (data.error) {
                        console.error('Server error:', data.error);
                        throw new Error(data.error);
                    }
                    const keyData = data.key;
                    state.keys = [keyData];
                    state.lastFetch = now;
                    saveState();
                    console.log("Keys fetched:", state.keys);
                } catch (error) {
                    console.error("Key manager error:", error);
                    throw error;
                }
            }
            return state.keys;
        },
        getCurrentKey: async () => {
            const allKeys = await keyManager.get();
            return allKeys[allKeys.length - 1];
        },
        forceRefresh: async () => {
            return await keyManager.get(true);
        }
    };
})();

function arrayBufferToStr(buffer) {
    return new TextDecoder().decode(buffer);
}

async function deriveMessageKey(sharedKey, salt) {
    const baseKey = await crypto.subtle.importKey(
        'raw',
        Uint8Array.from(atob(sharedKey), c => c.charCodeAt(0)),
        { name: 'HKDF' },
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: salt,
            info: new TextEncoder().encode('MUTE-per-message-key')
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encryptMessage(text) {
    try {
        const sharedKey = await keyManager.getCurrentKey();
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const messageKey = await deriveMessageKey(sharedKey, salt);

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const displayName = sessionStorage.getItem('displayName') || 'Anonymous';
        const timestamp = Math.floor(Date.now() / 1000);
        const payload = JSON.stringify({ name: displayName, message: text, timestamp });

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            messageKey,
            new TextEncoder().encode(payload)
        );

        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);

        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error("Encryption failed:", error);
        throw error;
    }
}

async function decryptMessage(encryptedStr) {
    try {
        const combined = Uint8Array.from(atob(encryptedStr), c => c.charCodeAt(0));
        if (combined.length < 28) throw new Error("Invalid encrypted data");

        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const ciphertext = combined.slice(28);

        let allKeys = await keyManager.get();

        for (const sharedKey of allKeys) {
            try {
                const messageKey = await deriveMessageKey(sharedKey, salt);
                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    messageKey,
                    ciphertext
                );
                const payload = JSON.parse(new TextDecoder().decode(decrypted));
                console.log("Decrypted:", payload);
                return { name: payload.name || 'Anonymous', message: payload.message, timestamp: payload.timestamp };
            } catch (e) {
                console.warn("Decryption attempt failed with key:", sharedKey.substring(0, 10) + "...", e.message);
                continue;
            }
        }

        console.log("All keys failed — forcing refresh...");
        allKeys = await keyManager.forceRefresh();
        for (const sharedKey of allKeys) {
            try {
                const messageKey = await deriveMessageKey(sharedKey, salt);
                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    messageKey,
                    ciphertext
                );
                const payload = JSON.parse(new TextDecoder().decode(decrypted));
                return { name: payload.name || 'Anonymous', message: payload.message, timestamp: payload.timestamp };
            } catch (e) {
                continue;
            }
        }

        return "[Failed to decrypt]";
    } catch (error) {
        console.error("Decryption error:", error);
        return "[Failed to decrypt]";
    }
}

let isFetchingMessages = false;
let lastMessageFetch = 0;
const messageExpirationTimes = new Map();
let lastMessageTimestamp = 0;

async function renderMessages(messages, chatBox, append = false) {
    console.log('Rendering messages:', messages, 'Append:', append);
    if (!append) {
        chatBox.innerHTML = '';
    }

    if (messages.length === 0 && chatBox.children.length === 0) {
        chatBox.innerHTML = '<div class="no-messages">No messages to display.</div>';
        return;
    }

    messages.sort((a, b) => a.timestamp - b.timestamp);

    messages.forEach(msg => {
        if (typeof msg.decrypted === 'string' && msg.decrypted === '[Failed to decrypt]') {
            console.log('Skipping failed decryption:', msg.encrypted);
            return;
        }

        // Skip if already in the DOM
        if (chatBox.querySelector(`[data-enc="${CSS.escape(msg.encrypted)}"]`)) {
            return;
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.dataset.enc = msg.encrypted;

        // XSS-safe
        const nameSpan = document.createElement('span');
        nameSpan.className = 'message-name';
        nameSpan.textContent = msg.decrypted.name || 'Anonymous';

        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = msg.decrypted.message;

        msgDiv.appendChild(nameSpan);
        msgDiv.appendChild(textSpan);

        const timestamp = msg.decrypted.timestamp || msg.timestamp;
        const expirationTime = (parseInt(timestamp, 10) + 300) * 1000;
        messageExpirationTimes.set(msg.encrypted, expirationTime);

        chatBox.appendChild(msgDiv);
        lastMessageTimestamp = Math.max(lastMessageTimestamp, timestamp);
    });

    const isNearBottom = chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - 50;
    if (isNearBottom) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    console.log('Messages rendered. Total messages:', messages.length, 'Last timestamp:', lastMessageTimestamp);
}

function checkMessageExpirations() {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const now = Date.now();
    const messages = chatBox.querySelectorAll('.message');
    let removed = false;

    messages.forEach(msgDiv => {
        const encryptedContent = msgDiv.dataset.enc;
        const expirationTime = messageExpirationTimes.get(encryptedContent);

        if (expirationTime && now >= expirationTime) {
            console.log('Removing expired message:', encryptedContent, 'Expiration:', expirationTime, 'Now:', now);
            msgDiv.remove();
            messageExpirationTimes.delete(encryptedContent);
            removed = true;
        }
    });

    if (removed && chatBox.children.length === 0) {
        chatBox.innerHTML = '<div class="no-messages">No messages to display.</div>';
    }
}

async function fetchMessages() {
    if (isFetchingMessages) {
        console.log('Already fetching messages, skipping...');
        return;
    }
    const now = Date.now();
    if (now - lastMessageFetch < 1000) {
        console.log('Too soon to fetch messages, last fetch:', lastMessageFetch);
        return;
    }
    isFetchingMessages = true;
    lastMessageFetch = now;

    try {
        console.log('Fetching messages from fetch_messages_silver.php...');

        // GET version (works with the same-origin check)
        const response = await fetch('fetch_messages_silver.php?_=' + new Date().getTime(), {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
        });

        const responseText = await response.text();
        console.log('Fetch messages response:', responseText);
        if (!response.ok) {
            console.error('Failed to fetch messages, status:', response.status, response.statusText);
            return;
        }
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            console.error('Failed to parse fetch messages response:', responseText);
            return;
        }
        const encryptedMessages = Array.isArray(data) ? data : (data.messages || []);
        const chatBox = document.getElementById('chat-box');
        if (!chatBox) {
            console.error('Chat box element not found');
            return;
        }

        const existingMessages = new Set(
            Array.from(chatBox.querySelectorAll('.message')).map(msgDiv => msgDiv.dataset.enc)
        );
        console.log('Existing messages:', existingMessages);

        const newMessages = [];
        const nowSeconds = Math.floor(now / 1000);
        for (const msg of encryptedMessages) {
            if (!msg.content || !msg.timestamp) {
                console.log('Skipping invalid message:', msg);
                continue;
            }
            const timeSinceMessage = nowSeconds - msg.timestamp;
            if (timeSinceMessage >= 300) {
                console.log('Message expired:', msg);
                continue;
            }
            if (msg.timestamp <= lastMessageTimestamp) {
                console.log('Message already processed:', msg);
                continue;
            }
            if (existingMessages.has(msg.content)) {
                console.log('Message already exists:', msg.content);
                continue;
            }
            const dec = await decryptMessage(msg.content);
            console.log('Decrypted message:', dec);
            newMessages.push({ decrypted: dec, encrypted: msg.content, timestamp: msg.timestamp });
        }

        console.log('New messages to render:', newMessages);
        await renderMessages(newMessages, chatBox, true);
    } catch (error) {
        console.error('Error in fetchMessages:', error.message);
    } finally {
        isFetchingMessages = false;
    }
}

async function loadInitialMessages() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.textContent = "Decrypting messages...";
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) {
        console.error('Chat box element not found during initial load');
        return;
    }

    console.log('Initial messages:', initialMessages);

    // Normalize to real array
    const messagesArray = Array.isArray(initialMessages)
        ? initialMessages
        : Object.values(initialMessages || {});

    const decryptedMessages = await Promise.all(
        messagesArray.map(async msg => {
            if (!msg || !msg.content || !msg.timestamp) {
                console.log('Skipping invalid initial message:', msg);
                return null;
            }
            const dec = await decryptMessage(msg.content);
            console.log('Initial message decrypted:', dec);
            return { decrypted: dec, encrypted: msg.content, timestamp: msg.timestamp };
        })
    );

    const validMessages = decryptedMessages.filter(msg => msg !== null);
    console.log('Valid initial messages:', validMessages);
    await renderMessages(validMessages, chatBox);

    if (loadingIndicator) loadingIndicator.remove();
}

function clearChat() {
    document.getElementById('message-input').value = '';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    const displayName = sessionStorage.getItem('displayName') || 'Anonymous';

    if (!message) return;

    if (displayName.length + message.length > 1000) {
        alert('Combined name and message too long (max 1000 characters)');
        return;
    }

    try {
        const encrypted = await encryptMessage(message);
        console.log('Sending encrypted message:', encrypted);
        document.getElementById('encrypted-message').value = encrypted;

        const formData = new FormData();
        formData.append('encrypted_message', encrypted);
        const response = await fetch(window.location.href, {
            method: 'POST',
            body: formData
        });
        const responseText = await response.text();
        console.log('Server response:', responseText);

        if (!response.ok) {
            console.error('Message send failed:', response.status, response.statusText);
            throw new Error('Failed to send message: HTTP ' + response.status);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            console.error('Failed to parse server response:', responseText);
            throw new Error('Invalid server response format');
        }

        if (!data.success) {
            console.error('Server rejected message:', data.error);
            throw new Error('Server rejected message: ' + (data.error || 'Unknown error'));
        }

        const chatBox = document.getElementById('chat-box');
        if (!chatBox) {
            console.error('Chat box element not found during message rendering');
            throw new Error('Chat box not found');
        }

        const timestamp = Math.floor(Date.now() / 1000);
        lastMessageTimestamp = Math.max(lastMessageTimestamp, timestamp);

        // XSS-safe
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.dataset.enc = encrypted;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'message-name';
        nameSpan.textContent = displayName;

        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = message;

        msgDiv.appendChild(nameSpan);
        msgDiv.appendChild(textSpan);

        const expirationTime = (timestamp + 300) * 1000;
        messageExpirationTimes.set(encrypted, expirationTime);
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        messageInput.value = '';
        document.getElementById('encrypted-message').value = '';
        console.log('Message sent and rendered successfully:', { name: displayName, message, timestamp });
    } catch (error) {
        console.error('Error sending message:', error.message || error);
        alert('Failed to send message: ' + (error.message || 'Unknown error') + '. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    if (!chatForm) {
        console.error("Chat form not found");
        return;
    }

    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearChat);
    } else {
        console.warn("Clear button not found");
    }

    const goPrivateBtn = document.getElementById('go-private-btn');
    if (goPrivateBtn) {
        goPrivateBtn.addEventListener('click', () => {
            location.href = 'talk_gold.php';
        });
    } else {
        console.warn("Go Private button not found");
    }

    const acceptConsentBtn = document.getElementById('accept-consent');
    if (acceptConsentBtn) {
        acceptConsentBtn.addEventListener('click', acceptConsent);
    } else {
        console.warn("Accept consent button not found");
    }

    const rejectConsentBtn = document.getElementById('reject-consent');
    if (rejectConsentBtn) {
        rejectConsentBtn.addEventListener('click', rejectConsent);
    } else {
        console.warn("Reject consent button not found");
    }

    chatForm.addEventListener('submit', handleFormSubmit);

    // Always start the intervals
    setInterval(fetchMessages, 2000);
    setInterval(checkMessageExpirations, 1000);

    (async () => {
        try {
            await loadInitialMessages();
        } catch (error) {
            console.error("Error initializing chat:", error);
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) loadingIndicator.textContent = "Error loading chat. Please refresh.";
        }
    })();
});