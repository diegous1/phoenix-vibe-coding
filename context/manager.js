/**
 * Multi-File Context Manager
 * Manages file selection, indexing, and context building for LLM interactions
 */

define(function (require, exports, module) {
    "use strict";

    const FileSystem = brackets.getModule("filesystem/FileSystem");
    const FileUtils = brackets.getModule("file/FileUtils");
    const ProjectManager = brackets.getModule("project/ProjectManager");

    // Maximum context size in tokens (approximate)
    const MAX_CONTEXT_TOKENS = 8000;
    const CHARS_PER_TOKEN = 4; // Rough estimate
    const MAX_CONTEXT_CHARS = MAX_CONTEXT_TOKENS * CHARS_PER_TOKEN;

    class ContextManager {
        constructor() {
            this.selectedFiles = [];
            this.fileContents = new Map();
            this.listeners = [];
        }

        /**
         * Add a file to the context
         */
        async addFile(filePath) {
            if (this.selectedFiles.includes(filePath)) {
                return { success: false, error: "File already in context" };
            }

            try {
                const content = await this._readFile(filePath);
                this.fileContents.set(filePath, content);
                this.selectedFiles.push(filePath);
                this._notifyChange();
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        /**
         * Remove a file from the context
         */
        removeFile(filePath) {
            const index = this.selectedFiles.indexOf(filePath);
            if (index > -1) {
                this.selectedFiles.splice(index, 1);
                this.fileContents.delete(filePath);
                this._notifyChange();
                return true;
            }
            return false;
        }

        /**
         * Clear all files from context
         */
        clearAll() {
            this.selectedFiles = [];
            this.fileContents.clear();
            this._notifyChange();
        }

        /**
         * Get all files in context
         */
        getFiles() {
            return [...this.selectedFiles];
        }

        /**
         * Build context string for LLM
         */
        buildContext() {
            let context = "";
            let totalChars = 0;

            for (const filePath of this.selectedFiles) {
                const content = this.fileContents.get(filePath);
                if (!content) continue;

                const relativePath = this._getRelativePath(filePath);
                const fileContext = `\n\n--- File: ${relativePath} ---\n${content}\n`;

                if (totalChars + fileContext.length > MAX_CONTEXT_CHARS) {
                    // Truncate if exceeds limit
                    const remaining = MAX_CONTEXT_CHARS - totalChars;
                    if (remaining > 100) {
                        context += fileContext.substring(0, remaining) + "\n... [truncated]";
                    }
                    break;
                }

                context += fileContext;
                totalChars += fileContext.length;
            }

            return context;
        }

        /**
         * Get context statistics
         */
        getStats() {
            const context = this.buildContext();
            return {
                fileCount: this.selectedFiles.length,
                charCount: context.length,
                estimatedTokens: Math.ceil(context.length / CHARS_PER_TOKEN),
                maxTokens: MAX_CONTEXT_TOKENS,
                percentage: Math.round((context.length / MAX_CONTEXT_CHARS) * 100)
            };
        }

        /**
         * Add the currently active file to context
         */
        async addCurrentFile() {
            const currentDoc = brackets.getModule("document/DocumentManager").getCurrentDocument();
            if (currentDoc) {
                return await this.addFile(currentDoc.file.fullPath);
            }
            return { success: false, error: "No active file" };
        }

        /**
         * Show file picker dialog
         */
        async showFilePicker() {
            return new Promise((resolve) => {
                const FileSystem = brackets.getModule("filesystem/FileSystem");
                const projectRoot = ProjectManager.getProjectRoot();

                if (!projectRoot) {
                    resolve({ success: false, error: "No project open" });
                    return;
                }

                brackets.getModule("widgets/FileTreeView").FileTreeView.showOpenDialog(
                    false, // allowMultipleSelection
                    false, // chooseDirectories
                    "Add File to Context",
                    projectRoot.fullPath,
                    null, // fileTypes
                    async (error, files) => {
                        if (error || !files || files.length === 0) {
                            resolve({ success: false, error: error || "No file selected" });
                            return;
                        }

                        const result = await this.addFile(files[0]);
                        resolve(result);
                    }
                );
            });
        }

        /**
         * Register change listener
         */
        onChange(callback) {
            this.listeners.push(callback);
        }

        /**
         * Read file contents
         */
        _readFile(filePath) {
            return new Promise((resolve, reject) => {
                const file = FileSystem.getFileForPath(filePath);
                file.read((err, content) => {
                    if (err) {
                        reject(new Error(`Failed to read file: ${err}`));
                    } else {
                        resolve(content);
                    }
                });
            });
        }

        /**
         * Get relative path from project root
         */
        _getRelativePath(filePath) {
            const projectRoot = ProjectManager.getProjectRoot();
            if (projectRoot) {
                return filePath.replace(projectRoot.fullPath, "");
            }
            return filePath.split("/").pop();
        }

        /**
         * Notify listeners of changes
         */
        _notifyChange() {
            const stats = this.getStats();
            this.listeners.forEach(callback => {
                try {
                    callback(stats);
                } catch (e) {
                    console.error("Error in context change listener:", e);
                }
            });
        }
    }

    // Export singleton instance
    module.exports = new ContextManager();
});
