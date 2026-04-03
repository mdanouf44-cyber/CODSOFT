"""
Rule-Based Chatbot with Interactive Web UI
A simple chatbot with a beautiful web interface.
"""

import re
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os


class RuleBasedChatbot:
    def __init__(self):
        self.rules = {
            # Greetings
            r'\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b': 
                "Hello! How can I help you today?",
            
            # Farewells
            r'\b(bye|goodbye|see you|take care|later)\b': 
                "Goodbye! Have a great day!",
            
            # How are you
            r'\b(how are you|how\'s it going|how do you do|what\'s up)\b': 
                "I'm doing great, thank you for asking! How about you?",
            
            # Name/Identity
            r'\b(what is your name|who are you|your name)\b': 
                "I'm a rule-based chatbot created to assist you!",
            
            # Help
            r'\b(help|assist|support|what can you do)\b': 
                "I can answer questions, have a conversation, and help with basic queries. Just ask me anything!",
            
            # Time
            r'\b(time|what time|current time)\b': 
                "I don't have access to real-time data, but you can check the time on your device!",
            
            # Weather
            r'\b(weather|temperature|forecast)\b': 
                "I can't check the weather, but I hope it's pleasant where you are!",
            
            # Thanks
            r'\b(thanks|thank you|appreciate|grateful)\b': 
                "You're welcome! Feel free to ask me anything else.",
            
            # Age
            r'\b(how old are you|your age|when were you born)\b': 
                "I don't have an age! I'm a chatbot, so I exist in the digital realm.",
            
            # Location
            r'\b(where are you from|where do you live|your location)\b': 
                "I exist in the digital world, so I'm everywhere and nowhere at once!",
            
            # Capabilities
            r'\b(what can you do|your features|your abilities)\b': 
                "I can chat with you, answer questions based on predefined rules, and have friendly conversations!",
            
            # Joke
            r'\b(tell me a joke|make me laugh|joke)\b': 
                "Why did the programmer quit his job? Because he didn't get arrays! 😄",
            
            # Favorite color
            r'\b(favorite color|favourite colour|what color)\b': 
                "I'd say my favorite color is blue - it's the color of technology!",
            
            # Hobbies
            r'\b(hobbies|what do you do|free time)\b': 
                "I enjoy chatting with people like you and learning from our conversations!",
            
            # Creator
            r'\b(who made you|who created you|your creator|your developer)\b': 
                "I was created as a learning project to demonstrate rule-based chatbot concepts!",
            
            # Yes/No
            r'\b(yes|yeah|yep|sure|ok|okay)\b': 
                "Great! Is there anything else you'd like to know?",
            
            r'\b(no|nope|nah|not really)\b': 
                "No problem! Feel free to ask something else.",
            
            # Default for questions
            r'\b(why|what|when|where|who|how)\b.*\?': 
                "That's an interesting question! While I'm a simple rule-based bot, I'd suggest looking that up for more accurate information.",
        }
        
        self.default_responses = [
            "I'm not sure I understand. Could you rephrase that?",
            "Interesting! Tell me more about that.",
            "I see. Is there something specific you'd like to know?",
            "Thanks for sharing! How can I help you further?",
            "I'm still learning, but I'd love to chat more!",
        ]
        
        self.conversation_history = []
    
    def get_response(self, user_input):
        """Process user input and return appropriate response based on rules."""
        user_input = user_input.lower().strip()
        
        if not user_input:
            return "Please type something!"
        
        # Store in history
        self.conversation_history.append(("user", user_input))
        
        # Pattern matching
        for pattern, response in self.rules.items():
            if re.search(pattern, user_input):
                self.conversation_history.append(("bot", response))
                return response
        
        # Default response if no pattern matches
        default = self.default_responses[len(self.conversation_history) % len(self.default_responses)]
        self.conversation_history.append(("bot", default))
        return default
    
    def reset(self):
        """Reset conversation history."""
        self.conversation_history = []
        return "Conversation history cleared!"


# Global chatbot instance
chatbot = RuleBasedChatbot()


class ChatbotHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/chatbot_ui.html'
            return SimpleHTTPRequestHandler.do_GET(self)
        elif self.path == '/chatbot_ui.html':
            return SimpleHTTPRequestHandler.do_GET(self)
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            user_input = data.get('message', '')
            response = chatbot.get_response(user_input)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'response': response}).encode('utf-8'))
        
        elif self.path == '/reset':
            chatbot.reset()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'reset complete'}).encode('utf-8'))
        
        else:
            self.send_error(404)
    
    def log_message(self, format, *args):
        print(f"[Server] {args[0]}")


def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, ChatbotHandler)
    print(f"\n{'='*50}")
    print(f"🤖 Chatbot Server Running!")
    print(f"{'='*50}")
    print(f"\n📍 Open your browser and go to:")
    print(f"   http://localhost:{port}")
    print(f"\n💡 Press Ctrl+C to stop the server\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Goodbye!")
        httpd.shutdown()


if __name__ == "__main__":
    run_server()
