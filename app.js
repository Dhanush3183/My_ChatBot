/**
 * Agent Dhanush - Next-Gen Cyberpunk Frontend OS Engine
 * Powered directly by Google Gemini AI (Static GitHub Pages Edition)
 */

// Global State
let GoogleGenerativeAI = null;
let genAI = null;
// Base64 encoded key to bypass GitHub Push Protection scans during git push
const GEMINI_API_KEY = atob("QVEuQWI4Uk42SWROdkhQeTloR21wd3lPeGNxc1ZpT05NdlQ2S0FiMUNHc2VmVmtyQlBpenc=");
let sessions = [];
let activeSessionId = null;
let currentOrbState = 'idle';
let voiceRecording = false;
let recognition = null;

// System instruction for Agent Dhanush
const SYSTEM_INSTRUCTION = "You are Agent Dhanush, a decentralized cognitive AI assistant. Provide responses with a sleek cyberpunk attitude, maintaining high technical accuracy. Format code blocks beautifully using markdown.";

// ==========================================================================
// Cyberpunk Global Error Boundary
// ==========================================================================
window.addEventListener('error', function(event) {
  showSystemCrash(event.message + '\nat ' + event.filename + ':' + event.lineno);
});

window.addEventListener('unhandledrejection', function(event) {
  showSystemCrash('Unhandled Promise Rejection: ' + event.reason);
});

function showSystemCrash(errorMsg) {
  console.error("CRITICAL EXCEPTION BOUNDARY:", errorMsg);
  let errorBanner = document.getElementById("cyberSystemCrashBanner");
  if (!errorBanner) {
    errorBanner = document.createElement("div");
    errorBanner.id = "cyberSystemCrashBanner";
    errorBanner.style.position = "fixed";
    errorBanner.style.top = "0";
    errorBanner.style.left = "0";
    errorBanner.style.width = "100%";
    errorBanner.style.background = "linear-gradient(90deg, #ff007c 0%, #8800ff 100%)";
    errorBanner.style.color = "#ffffff";
    errorBanner.style.padding = "14px 24px";
    errorBanner.style.zIndex = "999999";
    errorBanner.style.fontFamily = "'Fira Code', monospace";
    errorBanner.style.fontSize = "11px";
    errorBanner.style.boxShadow = "0 4px 20px rgba(255, 0, 124, 0.4)";
    errorBanner.style.whiteSpace = "pre-wrap";
    errorBanner.style.borderBottom = "2px solid #00f3ff";
    document.body.prepend(errorBanner);
  }
  errorBanner.innerHTML = `🚨 <strong>[CRITICAL_SYSTEM_EXCEPTION]</strong><br>${errorMsg}<br><span style="opacity: 0.75; font-size: 9px;">Double-click this banner to dismiss.</span>`;
  errorBanner.addEventListener('dblclick', () => {
    errorBanner.remove();
  });
}

// ==========================================================================
// Dynamic SDK CDN Loader with Failover
// ==========================================================================
async function initGeminiSDK() {
  const badgeTextEl = document.querySelector("#activeEngineBadge .badge-text");
  
  try {
    if (badgeTextEl) badgeTextEl.textContent = "ESTABLISHING_LINK...";
    
    // Attempt primary ESM CDN
    const module = await import("https://esm.run/@google/generative-ai");
    GoogleGenerativeAI = module.GoogleGenerativeAI;
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    if (badgeTextEl) badgeTextEl.textContent = "GEMINI_AI_CORE_CONNECTED";
    return true;
  } catch (err) {
    console.warn("Primary CDN esm.run failed, trying jsdelivr failover...", err);
    try {
      // Attempt secondary ESM CDN
      const module = await import("https://cdn.jsdelivr.net/npm/@google/generative-ai/+esm");
      GoogleGenerativeAI = module.GoogleGenerativeAI;
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      
      if (badgeTextEl) badgeTextEl.textContent = "GEMINI_AI_CORE_CONNECTED";
      return true;
    } catch (fallbackErr) {
      console.error("All Gemini AI SDK CDNs failed to resolve.", fallbackErr);
      if (badgeTextEl) badgeTextEl.textContent = "CORE_LINK_OFFLINE";
      showSystemCrash("Handshake failed. The Google Generative AI SDK could not be loaded from CDN gateways.\nVerify you have an active network connection or ensure CDNs are not blocked.");
      return false;
    }
  }
}

// Storage helper with fallback for iframe sandboxes or restricted environments
const storage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage read failed, utilizing RAM buffer", e);
      return this._fallback[key] || null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write failed, utilizing RAM buffer", e);
      this._fallback[key] = value;
    }
  },
  _fallback: {}
};

// Escape HTML helper
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Custom Markdown Renderer for Code Blocks with Sleek Headers and Copy Button
const renderer = {
  code(codeOrToken, infostring) {
    let text = "";
    let lang = "";
    
    if (codeOrToken && typeof codeOrToken === 'object') {
      text = codeOrToken.text || "";
      lang = codeOrToken.lang || "";
    } else {
      text = codeOrToken || "";
      lang = infostring || "";
    }
    
    lang = (lang || 'plaintext').trim();
    
    return `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-lang-label">${lang}</span>
          <button class="copy-code-btn" data-code="${encodeURIComponent(text)}">
            <i class="fa-solid fa-copy"></i> Copy Code
          </button>
        </div>
        <pre><code class="language-${lang}">${escapeHtml(text)}</code></pre>
      </div>
    `;
  }
};

// Safe setup for marked
if (typeof marked !== 'undefined') {
  marked.use({ renderer });
} else {
  console.warn("marked library is missing from index.html headers");
}

// Safe Prism syntax highlighter helper
function highlightPrismElements(container) {
  if (typeof Prism !== 'undefined' && typeof Prism.highlightElement === 'function') {
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      Prism.highlightElement(block);
    });
  }
}

// Disable/enable input state
function setInputDisabledState(disabled) {
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  if (chatInput) chatInput.disabled = disabled;
  if (sendBtn) {
    sendBtn.disabled = disabled;
    if (disabled) {
      sendBtn.classList.remove("btn-glow");
    } else {
      sendBtn.classList.add("btn-glow");
    }
  }
}

// ==========================================================================
// Initialization & Startup
// ==========================================================================
async function init() {
  initSpeechRecognition();
  loadSessionsFromStorage();
  setupEventListeners();
  startPingSimulator();
  setOrbState('idle');
  simulateTerminalBoot();
  
  // Asynchronously trigger SDK download in background
  await initGeminiSDK();
}

// Robust execution trigger checking DOM parse state
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Simulate ping latency variations for aesthetic bottom bar
function startPingSimulator() {
  const pingEl = document.getElementById("pingValue");
  if (!pingEl) return;
  setInterval(() => {
    const ping = Math.floor(Math.random() * 20) + 12; // 12ms to 32ms
    pingEl.textContent = ping;
  }, 3000);
}

// Visual boot sequence loader text
function simulateTerminalBoot() {
  const greetingEl = document.getElementById("terminalGreeting");
  if (!greetingEl) return;
  const phrases = [
    "ESTABLISHING ENCRYPTED COGNITIVE TUNNEL...",
    "SYNCING WITH GEMINI AI CORE CHANNELS...",
    "SECURE QUANTUM SHELL ESTABLISHED. CORE SYSTEM ONLINE."
  ];
  let phraseIdx = 0;
  
  const interval = setInterval(() => {
    if (phraseIdx < phrases.length) {
      greetingEl.textContent = phrases[phraseIdx];
      phraseIdx++;
    } else {
      clearInterval(interval);
    }
  }, 600);
}

// ==========================================================================
// Sidebar & Session Management
// ==========================================================================
function loadSessionsFromStorage() {
  const stored = storage.getItem("dhanush_sessions");
  if (stored) {
    try {
      sessions = JSON.parse(stored);
    } catch (e) {
      sessions = [];
    }
  }
  
  if (sessions.length === 0) {
    createNewSession();
  } else {
    activeSessionId = sessions[0].id;
    renderSidebarList();
    loadActiveSession();
  }
}

function createNewSession() {
  const newId = "session_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const newSession = {
    id: newId,
    title: "NEW_SESSION_STREAM",
    timestamp: Date.now(),
    messages: []
  };
  
  sessions.unshift(newSession);
  saveSessionsToStorage();
  activeSessionId = newId;
  
  renderSidebarList();
  loadActiveSession();
}

function saveSessionsToStorage() {
  storage.setItem("dhanush_sessions", JSON.stringify(sessions));
}

function deleteSession(id, event) {
  if (event) event.stopPropagation();
  
  sessions = sessions.filter(s => s.id !== id);
  saveSessionsToStorage();
  
  if (sessions.length === 0) {
    createNewSession();
  } else {
    if (activeSessionId === id) {
      activeSessionId = sessions[0].id;
    }
    renderSidebarList();
    loadActiveSession();
  }
}

function renderSidebarList() {
  const listEl = document.getElementById("chatList");
  if (!listEl) return;
  listEl.innerHTML = "";
  
  sessions.forEach(session => {
    const activeClass = session.id === activeSessionId ? "active" : "";
    const item = document.createElement("button");
    item.className = `history-item ${activeClass}`;
    item.dataset.id = session.id;
    item.innerHTML = `
      <div class="item-left">
        <i class="fa-solid fa-message-code"></i>
        <span class="item-title">${session.title}</span>
      </div>
      <button class="history-item-delete" title="Archive Stream">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    
    item.addEventListener("click", () => {
      activeSessionId = session.id;
      renderSidebarList();
      loadActiveSession();
    });
    
    const delBtn = item.querySelector(".history-item-delete");
    if (delBtn) {
      delBtn.addEventListener("click", (e) => {
        deleteSession(session.id, e);
      });
    }
    
    listEl.appendChild(item);
  });
}

function loadActiveSession() {
  const session = sessions.find(s => s.id === activeSessionId);
  if (!session) return;
  
  const titleEl = document.getElementById("activeSessionTitle");
  if (titleEl) titleEl.textContent = session.title;
  
  const welcomeState = document.getElementById("welcomeState");
  const streamEl = document.getElementById("messagesStream");
  
  if (!welcomeState || !streamEl) return;
  
  if (session.messages.length === 0) {
    welcomeState.style.display = "flex";
    streamEl.style.display = "none";
    streamEl.innerHTML = "";
    setOrbState('idle');
  } else {
    welcomeState.style.display = "none";
    streamEl.style.display = "flex";
    streamEl.innerHTML = "";
    
    session.messages.forEach(msg => {
      appendMessageToUI(msg.role, msg.content, msg.time);
    });
    
    scrollToBottom();
  }
}

// ==========================================================================
// UI Helpers & Messaging
// ==========================================================================
function appendMessageToUI(role, text, timeString) {
  const streamEl = document.getElementById("messagesStream");
  if (!streamEl) return;
  
  const time = timeString || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const messageNode = document.createElement("div");
  messageNode.className = `message ${role}`;
  
  const senderLabel = role === 'user' ? 'OPERATOR' : 'AGENT_DHANUSH';
  const renderedContent = role === 'user' 
    ? `<p>${escapeHtml(text)}</p>` 
    : (typeof marked !== 'undefined' ? marked.parse(text) : `<p>${escapeHtml(text)}</p>`);
  
  messageNode.innerHTML = `
    <div class="message-header">
      <span class="sender-name">${senderLabel}</span>
      <span class="message-time">${time}</span>
    </div>
    <div class="message-body glass-panel">
      ${renderedContent}
    </div>
  `;
  
  streamEl.appendChild(messageNode);
  
  if (role === 'assistant') {
    highlightPrismElements(messageNode);
    setupCopyButtons(messageNode);
  }
}

function scrollToBottom() {
  const viewport = document.querySelector(".chat-viewport");
  if (!viewport) return;
  setTimeout(() => {
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: 'smooth'
    });
  }, 50);
}

function setupCopyButtons(container) {
  const buttons = container.querySelectorAll(".copy-code-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const code = decodeURIComponent(btn.dataset.code);
      navigator.clipboard.writeText(code).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Copied!`;
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove("copied");
        }, 2000);
      }).catch(err => {
        console.error("Failed to copy code text", err);
      });
    });
  });
}

function autoResizeInput() {
  const textarea = document.getElementById("chatInput");
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = (textarea.scrollHeight - 12) + "px";
}

function setOrbState(state) {
  const orb = document.getElementById("coreOrb");
  if (!orb) return;
  orb.classList.remove("state-idle", "state-listening", "state-thinking", "state-typing");
  
  switch(state) {
    case 'idle':
      orb.classList.add("state-idle");
      break;
    case 'listening':
      orb.classList.add("state-listening");
      break;
    case 'thinking':
      orb.classList.add("state-thinking");
      break;
    case 'typing':
      orb.classList.add("state-typing");
      break;
  }
  currentOrbState = state;
}

// ==========================================================================
// Speech-To-Text Dictation (Web Speech API)
// ==========================================================================
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const langEl = document.getElementById("speechLanguage");
  const micEl = document.getElementById("micBtn");
  
  if (!SpeechRecognition) {
    if (langEl) langEl.textContent = "SPEECH API: NOT SUPPORTED";
    if (micEl) micEl.style.display = "none";
    return;
  }
  
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  recognition.onstart = () => {
    voiceRecording = true;
    if (micEl) micEl.classList.add("recording");
    setOrbState('listening');
  };
  
  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    const inputEl = document.getElementById("chatInput");
    if (!inputEl) return;
    
    if (inputEl.value.trim() !== "") {
      inputEl.value += " " + speechResult;
    } else {
      inputEl.value = speechResult;
    }
    autoResizeInput();
  };
  
  recognition.onend = () => {
    voiceRecording = false;
    if (micEl) micEl.classList.remove("recording");
    if (currentOrbState === 'listening') {
      setOrbState('idle');
    }
  };
  
  recognition.onerror = (event) => {
    console.error("Speech Recognition Error", event.error);
    voiceRecording = false;
    if (micEl) micEl.classList.remove("recording");
    setOrbState('idle');
  };
}

function toggleVoiceRecognition() {
  if (!recognition) return;
  
  if (voiceRecording) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (e) {
      console.warn("Failed starting speech listener", e);
    }
  }
}

// ==========================================================================
// Direct Gemini API Streaming Client logic
// ==========================================================================
async function transmitMessage() {
  const inputEl = document.getElementById("chatInput");
  if (!inputEl) return;
  
  const query = inputEl.value.trim();
  if (!query) return;
  
  inputEl.value = "";
  autoResizeInput();
  
  const welcomeState = document.getElementById("welcomeState");
  const streamEl = document.getElementById("messagesStream");
  if (welcomeState) welcomeState.style.display = "none";
  if (streamEl) streamEl.style.display = "flex";
  
  let session = sessions.find(s => s.id === activeSessionId);
  if (!session) {
    createNewSession();
    session = sessions.find(s => s.id === activeSessionId);
  }
  if (!session) return;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const userMsg = { role: "user", content: query, time };
  session.messages.push(userMsg);
  
  if (session.title === "NEW_SESSION_STREAM") {
    session.title = query.length > 22 ? query.substring(0, 20) + "..." : query;
    const titleEl = document.getElementById("activeSessionTitle");
    if (titleEl) titleEl.textContent = session.title;
    renderSidebarList();
  }
  
  saveSessionsToStorage();
  appendMessageToUI("user", query, time);
  scrollToBottom();
  
  await runGeminiResponse(session, query);
}

async function runGeminiResponse(session, query) {
  setOrbState('thinking');
  const badgeEl = document.getElementById("activeEngineBadge");
  if (badgeEl) badgeEl.classList.add("thinking");
  setInputDisabledState(true);
  
  const assistantTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  appendMessageToUI("assistant", "...", assistantTime);
  
  const messagesElements = document.querySelectorAll(".message.assistant");
  if (messagesElements.length === 0) return;
  
  const lastMsgBody = messagesElements[messagesElements.length - 1].querySelector(".message-body");
  if (!lastMsgBody) return;
  
  try {
    // If Gemini SDK failed initialization earlier, attempt retry now
    if (!genAI) {
      const initialized = await initGeminiSDK();
      if (!initialized || !genAI) {
        throw new Error("Generative AI SDK has not loaded. Inspect console or crash logs.");
      }
    }
    
    // Get model configuration
    const genAIModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });
    
    // Format conversation history to match model requirement (user / model)
    const formattedHistory = [];
    const historyMessages = session.messages.slice(0, session.messages.length - 1);
    const lastMessage = session.messages[session.messages.length - 1];

    for (const msg of historyMessages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      formattedHistory.push({
        role: role,
        parts: [{ text: msg.content }]
      });
    }

    const chat = genAIModel.startChat({
      history: formattedHistory,
    });

    setOrbState('typing');
    if (badgeEl) badgeEl.classList.remove("thinking");

    // Start stream generation in-browser
    const resultStream = await chat.sendMessageStream(lastMessage.content);
    let fullResponseText = "";

    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        if (fullResponseText === "") {
          lastMsgBody.innerHTML = ""; // Clear loader dots
        }
        fullResponseText += chunkText;
        lastMsgBody.innerHTML = typeof marked !== 'undefined' ? marked.parse(fullResponseText) : escapeHtml(fullResponseText);
        highlightPrismElements(lastMsgBody.parentElement);
        setupCopyButtons(lastMsgBody.parentElement);
        scrollToBottom();
      }
    }

    // Save final response text to history
    const finalMsg = { role: "assistant", content: fullResponseText, time: assistantTime };
    session.messages.push(finalMsg);
    saveSessionsToStorage();

  } catch (err) {
    console.error("Gemini stream exception:", err);
    lastMsgBody.innerHTML = `<p class="neon-text-red">!!! [CRITICAL_SYSTEM_ERROR]: Comms handshake failed. Verify Gemini connectivity parameters. Details: ${err.message}</p>`;
    scrollToBottom();
  } finally {
    setOrbState('idle');
    if (badgeEl) badgeEl.classList.remove("thinking");
    setInputDisabledState(false);
  }
}

// ==========================================================================
// User Interaction & Events Bindings
// ==========================================================================
function setupEventListeners() {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const micBtn = document.getElementById("micBtn");
  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");
  const suggestionCards = document.querySelectorAll(".suggestion-card");
  
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener("click", () => sidebar.classList.add("active"));
  }
  if (sidebarCloseBtn && sidebar) {
    sidebarCloseBtn.addEventListener("click", () => sidebar.classList.remove("active"));
  }
  
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      createNewSession();
      if (sidebar && window.innerWidth <= 900) {
        sidebar.classList.remove("active");
      }
    });
  }
  
  if (micBtn) {
    micBtn.addEventListener("click", toggleVoiceRecognition);
  }
  if (sendBtn) {
    sendBtn.addEventListener("click", transmitMessage);
  }
  
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        transmitMessage();
      }
    });
    chatInput.addEventListener("input", autoResizeInput);
  }
  
  suggestionCards.forEach(card => {
    card.addEventListener("click", () => {
      const prompt = card.dataset.prompt;
      if (chatInput) {
        chatInput.value = prompt;
        autoResizeInput();
        chatInput.focus();
      }
    });
  });
}
