/*
 * Phoenix Vibe Coding Extension
 * AI-powered coding assistant for Phoenix Code
 */

define(function (require, exports, module) {
    "use strict";

    // Phoenix/Brackets modules
    const CommandManager = brackets.getModule("command/CommandManager");
    const Menus = brackets.getModule("command/Menus");
    const KeyBindingManager = brackets.getModule("command/KeyBindingManager");
    const EditorManager = brackets.getModule("editor/EditorManager");
    const DocumentManager = brackets.getModule("document/DocumentManager");

    // Extension modules (to be created)
    // const LLMClient = require("llm/client");
        const ContextManager = require("context/manager");
    // const UIPanel = require("ui/panel");

    // Constants
    const COMMAND_ID_ASK_AI = "phoenixVibeCoding.askAI";
    const COMMAND_ID_COMPLETE = "phoenixVibeCoding.complete";
    const COMMAND_ID_REFACTOR = "phoenixVibeCoding.refactor";

    /**
     * Get current editor context
     */
    function getEditorContext() {
        const editor = EditorManager.getActiveEditor();
        if (!editor) return null;

        const document = editor.document;
        const selection = editor.getSelection();
        const selectedText = editor.getSelectedText();
        const cursorPos = editor.getCursorPos();

        return {
            editor,
            document,
            selection,
            selectedText,
            cursorPos,
            fullText: document.getText(),
            fileName: document.file.name,
            language: document.getLanguage().getName()
        };
    }

    /**
     * Ask AI command - opens chat panel
     */
    function handleAskAI() {
        const context = getEditorContext();
        if (!context) {
            console.log("No active editor");
            return;
        }

        console.log("Ask AI triggered", context);
        // TODO: Open chat panel with context
        // UIPanel.show(context);
    }

        
        // Add multi-file context
        const fileContext = ContextManager.buildContext();
        if (fileContext) {
            context.additionalContext = fileContext;
            const stats = ContextManager.getStats();
            console.log(`Context includes ${stats.fileCount} files (${stats.estimatedTokens} tokens)`);
        }
    /**
     * Code completion command
     */
    function handleComplete() {
        const context = getEditorContext();
        if (!context) return;

        console.log("Complete triggered", context);
        // TODO: Call LLM for completion
        // LLMClient.complete(context).then(result => {
        //     context.editor.document.replaceRange(result, context.cursorPos);
        // });
    }

    /**
     * Refactor selected code
     */
    function handleRefactor() {
        const context = getEditorContext();
        if (!context || !context.selectedText) {
            console.log("No text selected");
            return;
        }

        console.log("Refactor triggered", context);
        // TODO: Call LLM for refactoring
        // LLMClient.refactor(context).then(result => {
        //     context.editor.document.replaceRange(result, context.selection.start, context.selection.end);
        // });
    }

    /**
     * Initialize extension
     */
    function init() {
        // Register commands
        CommandManager.register("Ask AI", COMMAND_ID_ASK_AI, handleAskAI);
        CommandManager.register("AI Complete", COMMAND_ID_COMPLETE, handleComplete);
        CommandManager.register("AI Refactor", COMMAND_ID_REFACTOR, handleRefactor);
                CommandManager.register("Add File to Context", "phoenixVibeCoding.addToContext", async () => {
            const result = await ContextManager.addCurrentFile();
            if (result.success) {
                const stats = ContextManager.getStats();
                console.log(`File added to context. Total: ${stats.fileCount} files, ${stats.estimatedTokens} tokens`);
            } else {
                console.error(result.error);
            }
        });
        CommandManager.register("Clear Context", "phoenixVibeCoding.clearContext", () => {
            ContextManager.clearAll();
            console.log("Context cleared");
        });

        // Add menu items
        const menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
        menu.addMenuDivider();
        menu.addMenuItem(COMMAND_ID_ASK_AI);
        menu.addMenuItem(COMMAND_ID_COMPLETE);
        menu.addMenuItem(COMMAND_ID_REFACTOR);

        // Register keyboard shortcuts
        KeyBindingManager.addBinding(COMMAND_ID_ASK_AI, "Ctrl-I");
        KeyBindingManager.addBinding(COMMAND_ID_COMPLETE, "Ctrl-Shift-Space");
        KeyBindingManager.addBinding(COMMAND_ID_REFACTOR, "Ctrl-Shift-R");

        console.log("Phoenix Vibe Coding extension loaded! 🎯");
    }

    // Start extension
    init();
});
