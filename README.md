# 🎯 Phoenix Vibe Coding

AI-powered vibe coding extension for Phoenix Code - experience Cursor or GitHub Copilot-like functionality with seamless LLM integration.

## Features

- **🤖 Ask AI**: Chat with AI about your code using `Ctrl+I`
- **⚡ Smart Completion**: Context-aware code completion with `Ctrl+Shift+Space`
- **🔧 AI Refactoring**: Refactor selected code intelligently with `Ctrl+Shift+R`
- **🌍 Multi-LLM Support**: Works with OpenAI, Anthropic, Groq, and other providers

## Installation

### From Phoenix Code (Recommended)

1. Open Phoenix Code at `https://create.phcode.dev`
2. Go to `File > Extension Manager`
3. Search for "Phoenix Vibe Coding"
4. Click Install

### Development Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/diegous1/phoenix-vibe-coding.git
   ```

2. Open Phoenix Code at `https://create.phcode.dev`

3. Select `Debug > Load Project As Extension`

4. Choose the cloned folder

5. The extension is now loaded! Try `Ctrl+I` to start.

## Configuration

You'll need an API key from your preferred LLM provider:

- **OpenAI**: Get it at https://platform.openai.com/api-keys
- **Anthropic**: Get it at https://console.anthropic.com/
- **Groq**: Get it at https://console.groq.com/

Add your API key in Phoenix Code settings under "Vibe Coding".

## Usage

### Ask AI (`Ctrl+I`)

Open a chat panel to ask questions about your code, get explanations, or request implementations.

### Complete Code (`Ctrl+Shift+Space`)

Place your cursor where you want completion and press the hotkey. The AI will suggest code based on context.

### Refactor (`Ctrl+Shift+R`)

Select code you want to refactor and press the hotkey. The AI will suggest improvements.

## Architecture

```
phoenix-vibe-coding/
├── main.js              # Extension entry point
├── llm/                 # LLM client modules
│   ├── client.js        # Main LLM interface
│   ├── openai.js        # OpenAI provider
│   ├── anthropic.js     # Anthropic provider
│   └── groq.js          # Groq provider
├── ui/                  # UI components
│   ├── panel.js         # Chat panel
│   └── styles.css       # Styles
├── package.json         # Extension manifest
└── README.md            # This file
```

## Development

### Hot Reload

After making changes, press `Debug > Reload With Extensions` to test.

### Debugging

Open browser DevTools (F12) to see console logs and errors.

### Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Roadmap

- [x] Basic extension structure
- [x] Command registration and shortcuts
- [ ] LLM client implementation
- [ ] Chat UI panel
- [ ] Code completion
- [ ] Refactoring support
- [ ] Settings panel
- [ ] Multi-language support
- [ ] Streaming responses
- [ ] Context management

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- **Repository**: https://github.com/diegous1/phoenix-vibe-coding
- **Phoenix Code**: https://phcode.dev
- **Documentation**: https://docs.phcode.dev

## Credits

Built with ❤️ using [Phoenix Code](https://phcode.dev)

---

**Star ⭐ this repo if you find it useful!**
