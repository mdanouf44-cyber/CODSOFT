# 🤖 Rule-Based Chatbot

A simple chatbot that responds to user inputs based on predefined rules and pattern matching techniques. Now with a beautiful interactive web UI!

## 📋 Overview

This project demonstrates basic natural language processing and conversation flow using:
- **If-else statements** for command handling
- **Regex pattern matching** to identify user queries
- **Predefined responses** for various topics
- **Interactive Web Interface** for a better user experience

## 🚀 Features

- 20+ predefined response patterns
- Greetings, farewells, and casual conversation
- Jokes and fun responses
- Help system with available topics
- Conversation history tracking
- Default fallback responses for unknown inputs
- Easy to extend with new rules
- **Beautiful Web UI** with gradient design
- Quick action buttons for common queries
- Typing indicator animation
- Responsive mobile-friendly design

## 📦 Requirements

- Python 3.x (no external dependencies required)

## 🛠️ How to Run

### Option 1: Web UI (Recommended) 

1. **Start the server:**
   ```bash
   python "C:\Users\MOHAMMAD ANOUF SAANI\Desktop\Codesoft\Task 1\chatbot_ui.py"
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:8000
   ```

3. **Chat away!** Use the text input or quick action buttons.

### Option 2: Command Line Interface 💻

```bash
cd "C:\Users\MOHAMMAD ANOUF SAANI\Desktop\Codesoft\Task 1"
python chatbot.py
```

## 💬 Web UI Features

### Quick Actions
- 👋 **Hello** - Greet the chatbot
- **Help** - See available topics
- 😄 **Joke** - Get a funny joke
- **Features** - Learn what the bot can do
- 👋 **Bye** - End the conversation

### Other Features
- **Reset Button** - Clear conversation history
- **Typing Indicator** - Animated dots while bot "thinks"
- **Smooth Animations** - Fade-in messages
- **Auto-scroll** - Always shows latest messages
- **Enter Key Support** - Press Enter to send

## 📸 Web UI Preview

The web interface features:
- Purple gradient theme
- Clean, modern chat bubbles
- User/Bot avatars
- Quick action buttons
- Responsive design for mobile

## 🎯 Usage Examples

### Example Conversation
```
You: hello
Bot: Hello! How can I help you today?

You: what is your name
Bot: I'm a rule-based chatbot created to assist you!

You: tell me a joke
Bot: Why did the programmer quit his job? Because he didn't get arrays! 😄

You: bye
Bot: Goodbye! Have a great day!
```

### Supported Topics

| Category | Keywords |
|----------|----------|
| Greetings | hi, hello, hey, greetings, good morning |
| Farewells | bye, goodbye, see you, take care |
| Identity | what's your name, who are you |
| Status | how are you, what's up |
| Help | help, what can you do |
| Fun | tell me a joke |
| Info | time, weather, age, location |
| Questions | why, what, when, where, who, how |

## 📁 Project Structure

```
Task 1/
├── chatbot.py          # CLI version of chatbot
├── chatbot_ui.py       # Web server for UI
├── chatbot_ui.html     # Interactive web interface
── README.md           # This file
└── task 1.png          # Task description image
```

## 🔧 Customization

### Adding New Rules

Open `chatbot_ui.py` and add new patterns to the `self.rules` dictionary:

```python
self.rules = {
    # Add your new pattern here
    r'\b(your pattern here)\b': 
        "Your response here!",
    
    # Existing rules...
}
```

### Changing UI Colors

Edit `chatbot_ui.html` and modify the CSS gradient:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adding More Quick Actions

In `chatbot_ui.html`, add new buttons:

```html
<button class="quick-btn" onclick="sendQuickMessage('your text')">Your Label</button>
```

##  UI Customization Options

| Element | CSS Variable | Default |
|---------|-------------|---------|
| Primary Gradient | `#667eea` → `#764ba2` | Purple |
| Background | `linear-gradient` | Purple gradient |
| Chat Bubble | `#f8f9fa` | Light gray |
| Font | `Segoe UI` | System font |

## 🐛 Troubleshooting

**Issue**: Web page doesn't load
- **Solution**: Make sure `chatbot_ui.py` server is running and you're using `http://localhost:8000`

**Issue**: Chatbot doesn't recognize my input
- **Solution**: Try rephrasing. The bot uses pattern matching, so exact keywords help.

**Issue**: Python not found
- **Solution**: Ensure Python is installed and added to your system PATH.

**Issue**: Port 8000 already in use
- **Solution**: Change the port in `chatbot_ui.py`: `run_server(port=8080)`

## 🎯 Learning Outcomes

This project helps you understand:
- Basic NLP concepts
- Pattern matching with regular expressions
- Conversation flow design
- If-else logic for decision making
- Building interactive CLI and Web applications
- HTTP server basics in Python
- Frontend JavaScript for interactivity

## 📝 Code Structure

### Backend (chatbot_ui.py)
```python
class RuleBasedChatbot:
    - __init__():      Initialize rules and responses
    - get_response():  Process input and return response
    - reset():         Clear conversation history

class ChatbotHandler:
    - do_GET():        Handle web page requests
    - do_POST():       Handle chat messages
```

### Frontend (chatbot_ui.html)
```javascript
- sendMessage():     Send message to server
- addMessage():      Display message in chat
- showTyping():      Show typing animation
- resetChat():       Clear conversation
```

##  Ports & URLs

| Description | URL |
|-------------|-----|
| Web UI | http://localhost:8000 |
| Chat API | http://localhost:8000/chat |
| Reset API | http://localhost:8000/reset |

##  Notes

- The server runs locally only (not accessible from other devices)
- Press `Ctrl+C` in the terminal to stop the server
- Conversation history is stored in memory (resets when server stops)
- No internet connection required after setup

##  License

This is a learning project created for educational purposes.

---

**Happy Chatting! 🤖💬**

Made with ❤️ using Python & JavaScript
