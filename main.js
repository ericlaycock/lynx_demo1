// Function to handle file upload and return the content
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

// Function to append messages to the chat box
function appendMessage(role, content) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = role + '-message';
    messageDiv.textContent = role + ": " + content;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle sending messages to OpenAI API
async function sendMessage() {
    const fileInput = document.getElementById('file-input');
    const systemMessage = document.getElementById('system-message').value;
    const userMessage = document.getElementById('message-input').value;
    const apiKey = document.getElementById('api-key').value;

    if (!apiKey) {
        alert("Please enter your API key.");
        return;
    }

    if (!fileInput.files.length || !userMessage) {
        alert("Please upload a file and type a message.");
        return;
    }

    const fileContent = await readFileContent(fileInput.files[0]);

    appendMessage('User', userMessage);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { "role": "system", "content": systemMessage },
                { "role": "user", "content": fileContent },
                { "role": "user", "content": userMessage }
            ],
            stream: true
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const decodedChunk = decoder.decode(value);
        const jsonChunks = decodedChunk.split('\n\n').filter(line => line.startsWith('data:'));

        for (const chunk of jsonChunks) {
            const json = chunk.replace('data: ', '').trim();

            if (json === '[DONE]') {
                break;
            }

            try {
                const parsed = JSON.parse(json);
                const deltaContent = parsed.choices[0].delta.content;

                if (deltaContent) {
                    assistantMessage += deltaContent;
                    appendMessage('Assistant', deltaContent);
                }
            } catch (e) {
                console.error("Error parsing stream data:", e);
            }
        }
    }

    document.getElementById('message-input').value = '';  // Clear input box
}
