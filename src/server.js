import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import querystring from 'querystring';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Укажите путь к вашему сертификату
const certPath = path.resolve(__dirname, 'russian_trusted_root_ca_pem.crt');
const cert = fs.readFileSync(certPath);

const httpsAgent = new https.Agent({
    ca: cert
});

if(!process.env.GIGACHAT_API_URL || !process.env.GIGACHAT_CLIENT_ID || !process.env.GIGACHAT_CLIENT_SECRET) {
    console.error('GIGACHAT_API_URL, GIGACHAT_CLIENT_ID или GIGACHAT_CLIENT_SECRET не установлены');
    process.exit(1);
}

async function getAccessToken() {
    try {
        const data = querystring.stringify({
            scope: 'GIGACHAT_API_PERS'
        });

        const clientSecret = process.env.GIGACHAT_CLIENT_SECRET;
        const authHeader = `Basic ${clientSecret}`;
        const rqUid = process.env.RQ_UID;
        const response = await axios.post('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': rqUid,
                'Authorization': authHeader
            },
            httpsAgent
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Ошибка при получении токена доступа:', error.response ? error.response.data : error.message);
        throw error;
    }
}



app.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const token = await getAccessToken();
        if(!process.env.GIGACHAT_API_URL) {
            console.error('GIGACHAT_API_URL не установлен');
            process.exit(1);
            
        }
        const response = await axios.post(process.env.GIGACHAT_API_URL, {
            model: 'GigaChat',
            messages: [
                {
                    role: 'user',
                    content: message
                }
            ],
            stream: false,
            repetition_penalty: 1
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            httpsAgent
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при обращении к GigaChat API');
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});