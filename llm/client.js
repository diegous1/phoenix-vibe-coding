/*
 * LLM Client - Main interface for AI providers
 * Supports OpenAI, Anthropic, Groq, and others
 */

define(function (require, exports, module) {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    const prefs = PreferencesManager.getExtensionPrefs("vibe-coding");

    // Provider modules (to be created)
    // const OpenAIProvider = require("llm/openai");
    // const AnthropicProvider = require("llm/anthropic");
    // const GroqProvider = require("llm/groq");

    // Default preferences
    prefs.definePreference("provider", "string", "openai");
    prefs.definePreference("apiKey", "string", "");
    prefs.definePreference("model", "string", "gpt-4o-mini");
    prefs.definePreference("temperature", "number", 0.7);
    prefs.definePreference("maxTokens", "number", 2000);

    /**
     * Available providers configuration
     */
    const PROVIDERS = {
        openai: {
            name: "OpenAI",
            baseURL: "https://api.openai.com/v1",
            models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]
        },
        anthropic: {
            name: "Anthropic",
            baseURL: "https://api.anthropic.com/v1",
            models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]
        },
        groq: {
            name: "Groq",
            baseURL: "https://api.groq.com/openai/v1",
            models: ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"]
        }
    };

    /**
     * Make API call to LLM provider
     */
    async function callAPI(messages, options = {}) {
        const provider = prefs.get("provider");
        const apiKey = prefs.get("apiKey");
        const model = options.model || prefs.get("model");
        const temperature = options.temperature || prefs.get("temperature");
        const maxTokens = options.maxTokens || prefs.get("maxTokens");

        if (!apiKey) {
            throw new Error("API key not configured. Please set it in extension settings.");
        }

        const config = PROVIDERS[provider];
        if (!config) {
            throw new Error(`Unknown provider: ${provider}`);
        }

        try {
            // Build request based on provider
            const requestBody = buildRequest(provider, {
                messages,
                model,
                temperature,
                max_tokens: maxTokens
            });

            const response = await fetch(`${config.baseURL}/chat/completions`, {
                method: "POST",
                headers: buildHeaders(provider, apiKey),
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            return parseResponse(provider, data);

        } catch (error) {
            console.error("LLM API Error:", error);
            throw error;
        }
    }

    /**
     * Build request body for specific provider
     */
    function buildRequest(provider, params) {
        const base = {
            model: params.model,
            temperature: params.temperature,
            max_tokens: params.max_tokens
        };

        if (provider === "anthropic") {
            // Anthropic uses system message separately
            const systemMessage = params.messages.find(m => m.role === "system");
            const userMessages = params.messages.filter(m => m.role !== "system");
            
            return {
                ...base,
                system: systemMessage?.content || "",
                messages: userMessages
            };
        }

        // OpenAI and Groq use standard format
        return {
            ...base,
            messages: params.messages
        };
    }

    /**
     * Build headers for specific provider
     */
    function buildHeaders(provider, apiKey) {
        const base = {
            "Content-Type": "application/json"
        };

        if (provider === "anthropic") {
            return {
                ...base,
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            };
        }

        // OpenAI and Groq use Bearer auth
        return {
            ...base,
            "Authorization": `Bearer ${apiKey}`
        };
    }

    /**
     * Parse response from specific provider
     */
    function parseResponse(provider, data) {
        if (provider === "anthropic") {
            return {
                content: data.content[0].text,
                model: data.model,
                usage: data.usage
            };
        }

        // OpenAI and Groq format
        return {
            content: data.choices[0].message.content,
            model: data.model,
            usage: data.usage
        };
    }

    /**
     * Chat completion - general purpose
     */
    async function chat(userMessage, context = {}) {
        const messages = [
            {
                role: "system",
                content: "You are an AI coding assistant integrated into Phoenix Code editor. Help users with code questions, completions, and refactoring. Be concise and practical."
            },
            {
                role: "user",
                content: userMessage
            }
        ];

        // Add context if provided
        if (context.selectedText) {
            messages[1].content = `${userMessage}\n\nContext:\n\`\`\`${context.language || ""}\n${context.selectedText}\n\`\`\``;
        }

        const response = await callAPI(messages);
        return response.content;
    }

    /**
     * Code completion
     */
    async function complete(context) {
        const prompt = `Complete the following code. Only return the completion, no explanations:\n\n\`\`\`${context.language}\n${context.fullText}\n\`\`\``;
        
        const response = await chat(prompt, {});
        return response;
    }

    /**
     * Code refactoring
     */
    async function refactor(context) {
        const prompt = `Refactor this code to be cleaner, more efficient, and follow best practices. Return only the refactored code:\n\n\`\`\`${context.language}\n${context.selectedText}\n\`\`\``;
        
        const response = await chat(prompt, {});
        return response;
    }

    /**
     * Get available providers
     */
    function getProviders() {
        return PROVIDERS;
    }

    /**
     * Get current configuration
     */
    function getConfig() {
        return {
            provider: prefs.get("provider"),
            model: prefs.get("model"),
            temperature: prefs.get("temperature"),
            maxTokens: prefs.get("maxTokens"),
            hasApiKey: !!prefs.get("apiKey")
        };
    }

    // Public API
    exports.chat = chat;
    exports.complete = complete;
    exports.refactor = refactor;
    exports.callAPI = callAPI;
    exports.getProviders = getProviders;
    exports.getConfig = getConfig;
    exports.PROVIDERS = PROVIDERS;
});
