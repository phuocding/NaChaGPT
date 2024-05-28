const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const APPID = 'your-app-id';
const SECRET = 'your-app-secret';
const KEY = 'your-openai-api-key';

// Endpoint để Lark gọi webhook
app.post('/webhook', async (req, res) => {
    const message = req.body.text;
    
    // Gọi OpenAI API để lấy phản hồi từ ChatGPT
    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: message,
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer ${KEY}`,
                'Content-Type': 'application/json',
            }
        });

        const reply = response.data.choices[0].text.trim();
        
        // Gửi phản hồi lại cho Lark
        await axios.post('https://open.larksuite.com/open-apis/message/v4/send/', {
            chat_id: req.body.chat_id,
            msg_type: 'text',
            content: JSON.stringify({ text: reply })
        }, {
            headers: {
                'Authorization': `Bearer ${APPID}:${SECRET}`,
                'Content-Type': 'application/json',
            }
        });

        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500);
    }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});