from flask import Flask, request, jsonify, render_template
import openai

app = Flask(__name__)
print("Flask server is running.")

# Store conversation history in memory
conversation_history = []

@app.route('/')
def index():
    return render_template('index.html')

# API endpoint to handle chat messages
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    api_key = data.get('api_key')
    language = data.get('language')

    if not user_message or not api_key:
        return jsonify({"error": "Message and API key are required!"}), 400

    # Update OpenAI API key
    openai.api_key = api_key

    # Add user message to conversation history
    conversation_history.append({"role": "user", "content": user_message})

    # Define system message based on language selection
    if language == 'french_a1_a2':
        system_message = "You are a French tutor teaching a student at the A1/A2 level."
    elif language == 'french_a2_b1':
        system_message = "You are a French tutor teaching a student at the A2/B1 level."
    else:
        system_message = "You are a helpful assistant."

    # Add system message if it's the first interaction
    if len(conversation_history) == 1:
        conversation_history.insert(0, {"role": "system", "content": system_message})

    # Call OpenAI API with full conversation history
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation_history
        )
        assistant_reply = response.choices[0].message.content.strip()

        # Add assistant response to conversation history
        conversation_history.append({"role": "assistant", "content": assistant_reply})

        return jsonify({"reply": assistant_reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
