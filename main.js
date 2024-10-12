async function sendMessage() {
    const userMessage = document.getElementById('message-input').value;
    const apiKey = document.getElementById('api-key').value;

    if (!userMessage) {
        alert("Please enter a message!");
        return;
    }

    // Append the user's message to the chat box
    appendMessage('User', userMessage);

    // Send the message to the backend (Python)
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: userMessage,
                api_key: apiKey,
                language: document.getElementById('language-select').value
            })
        });

        const data = await response.json();
        appendMessage('Assistant', data.reply);
    } catch (error) {
        console.error('Error communicating with backend:', error);
    }

    // Clear input field
    document.getElementById('message-input').value = '';
}

function appendMessage(role, content) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = role.toLowerCase() + '-message';
    messageDiv.textContent = `${role}: ${content}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
