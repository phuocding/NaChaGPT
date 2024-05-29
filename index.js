const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const APPID = process.env.APPID;
const SECRET = process.env.SECRET;
const KEY = process.env.KEY;

// Endpoint để Lark gọi webhook
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.type === 'url_verification') {
        // Xử lý yêu cầu xác minh URL
        return res.status(200).send({ challenge: body.challenge });
    }

     // Xử lý các yêu cầu khác
    const event = body.event;
    if (!event || !event.text || !event.open_chat_id) {
        console.error('Invalid data structure:', req.body);
        return res.status(400).send('Invalid data structure');
    }

    const message = event.text;
    const chatId = event.message.chat_id;

    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',
            prompt: message,
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer ${KEY}`,
                'Content-Type': 'application/json',
            }
        });

        const reply = response.data.choices[0].text.trim();

        await axios.post('https://open.larksuite.com/open-apis/message/v4/send/', {
            chat_id: chatId,
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
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send(error.response ? error.response.data : { error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
