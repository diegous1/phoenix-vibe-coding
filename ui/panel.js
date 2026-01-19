/*
 * AI Chat Panel UI
 * Creates a sidebar panel for AI interactions
 */

define(function (require, exports, module) {
    "use strict";

    const WorkspaceManager = brackets.getModule("view/WorkspaceManager");
    const Resizer = brackets.getModule("utils/Resizer");
    const ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    const PANEL_ID = "vibe-coding-panel";
    const PANEL_MIN_WIDTH = 200;
    const PANEL_DEFAULT_WIDTH = 400;

    let $panel;
    let panel;
    let messages = [];

    // HTML template for the panel
    const panelHTML = `
        <div id="${PANEL_ID}" class="vibe-coding-panel">
            <div class="vibe-panel-header">
                <span class="vibe-panel-title">🤖 AI Assistant</span>
                <button class="vibe-close-btn" title="Close panel">×</button>
            </div>
            <div class="vibe-messages-container" id="vibe-messages">
                <div class="vibe-welcome-message">
                    <div class="vibe-welcome-icon">🎯</div>
                    <h3>Welcome to Vibe Coding!</h3>
                    <p>Ask me anything about your code, request completions, or get refactoring suggestions.</p>
                    <div class="vibe-shortcuts">
                        <div class="vibe-shortcut">
                            <kbd>Ctrl+I</kbd> <span>Ask AI</span>
                        </div>
                        <div class="vibe-shortcut">
                            <kbd>Ctrl+Shift+Space</kbd> <span>Complete</span>
                        </div>
                        <div class="vibe-shortcut">
                            <kbd>Ctrl+Shift+R</kbd> <span>Refactor</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="vibe-input-container">
                <textarea 
                    id="vibe-input" 
                    class="vibe-input" 
                    placeholder="Ask AI about your code..."
                    rows="3"
                ></textarea>
                <button id="vibe-send-btn" class="vibe-send-btn" title="Send (Ctrl+Enter)">
                    <span class="send-icon">➤</span>
                </button>
            </div>
        </div>
    `;

    /**
     * Add a message to the chat
     */
    function addMessage(content, type = "user") {
        const $messagesContainer = $("#vibe-messages");
        const $welcomeMessage = $messagesContainer.find(".vibe-welcome-message");
        
        // Remove welcome message on first interaction
        if ($welcomeMessage.length && messages.length === 0) {
            $welcomeMessage.fadeOut(300, function() { $(this).remove(); });
        }

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const icon = type === "user" ? "👤" : "🤖";
        
        const $message = $(`
            <div class="vibe-message vibe-message-${type}">
                <div class="vibe-message-header">
                    <span class="vibe-message-icon">${icon}</span>
                    <span class="vibe-message-time">${timestamp}</span>
                </div>
                <div class="vibe-message-content">${escapeHtml(content)}</div>
            </div>
        `);

        $messagesContainer.append($message);
        $message.hide().fadeIn(300);
        
        // Scroll to bottom
        $messagesContainer.scrollTop($messagesContainer[0].scrollHeight);
        
        messages.push({ content, type, timestamp });
    }

    /**
     * Add AI response with loading indicator
     */
    function addAIResponse(content) {
        const $messagesContainer = $("#vibe-messages");
        
        // Add loading indicator
        const $loading = $(`
            <div class="vibe-message vibe-message-ai vibe-loading">
                <div class="vibe-message-header">
                    <span class="vibe-message-icon">🤖</span>
                </div>
                <div class="vibe-message-content">
                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
            </div>
        `);
        
        $messagesContainer.append($loading);
        $messagesContainer.scrollTop($messagesContainer[0].scrollHeight);

        // Simulate AI response delay (replace with actual LLM call)
        setTimeout(() => {
            $loading.remove();
            addMessage(content, "ai");
        }, 1000);
    }

    /**
     * Handle send message
     */
    function handleSendMessage() {
        const $input = $("#vibe-input");
        const message = $input.val().trim();
        
        if (!message) return;
        
        // Add user message
        addMessage(message, "user");
        $input.val("");
        
        // TODO: Call LLM API here
        // For now, send a mock response
        addAIResponse("This is a mock AI response. LLM integration coming soon! Your message was: " + message);
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show the panel
     */
    function show(context) {
        if (!panel) {
            createPanel();
        }
        
        if (!panel.isVisible()) {
            panel.show();
            $("#vibe-input").focus();
        }

        // If context provided, add it as a message
        if (context && context.selectedText) {
            addMessage(`Selected code:\n\`\`\`${context.language}\n${context.selectedText}\n\`\`\``, "user");
        }
    }

    /**
     * Hide the panel
     */
    function hide() {
        if (panel && panel.isVisible()) {
            panel.hide();
        }
    }

    /**
     * Toggle panel visibility
     */
    function toggle() {
        if (panel && panel.isVisible()) {
            hide();
        } else {
            show();
        }
    }

    /**
     * Create and initialize the panel
     */
    function createPanel() {
        // Load CSS
        ExtensionUtils.loadStyleSheet(module, "styles.css");
        
        // Create panel
        $panel = $(panelHTML);
        panel = WorkspaceManager.createBottomPanel(PANEL_ID, $panel, PANEL_DEFAULT_WIDTH);
        
        // Make resizable
        $panel.resizable({
            handles: "n",
            minHeight: 200,
            maxHeight: 600
        });

        // Event listeners
        $("#vibe-send-btn").on("click", handleSendMessage);
        
        $("#vibe-input").on("keydown", function(e) {
            if (e.ctrlKey && e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
            }
        });
        
        $(".vibe-close-btn").on("click", hide);
    }

    // Public API
    exports.show = show;
    exports.hide = hide;
    exports.toggle = toggle;
    exports.addMessage = addMessage;
});
