const express = require('express');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });
const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 'mkv'];

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const allowedFile = (filename) => {
    const extension = path.extname(filename).toLowerCase().slice(1);
    return allowedExtensions.includes(extension);
};

function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
            mimeType: mimeType,
        },
    };
}

app.get('/', (req, res) => {
    res.render('index', { response: null, file_url: null, processing_time: null, prompt: null });
});

app.post('/', upload.array('file', 2), async (req, res) => { 
    const startTime = Date.now();
    const userPrompt = req.body.prompt; 
    const hiddenPrompt = "Responda de maneira tecnica realizando uma analise futebolistica a fundo, como epoca, campeonato, taticas e jogadores: "; // Prompt oculto
    const finalPrompt = hiddenPrompt + userPrompt; // Concatenando os prompts
    let responseText = ""; 
    let file_url = []; 

    try {
        const imageParts = [];

        for (let file of req.files) {
            if (allowedFile(file.originalname)) {
                const filePath = path.join(__dirname, file.path);
                const mimeType = file.mimetype; 
                imageParts.push(fileToGenerativePart(filePath, mimeType)); 
                file_url.push(`/uploads/${file.filename}`);
            } else {
                responseText = "Erro: Tipo de arquivo não suportado. Use imagens.";
                break;
            }
        }

        if (responseText === "") {
            const result = await model.generateContent([finalPrompt, ...imageParts]); // Enviando o prompt final
            const response = await result.response;
            responseText = response.text();
        }
    } catch (error) {
        console.error('Erro ao gerar conteúdo:', error);
        responseText = "Erro ao processar sua solicitação.";
    }

    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    res.render('index', {
        response: responseText,
        file_url: file_url,
        processing_time: processingTime,
        prompt: userPrompt // Mantém o prompt original para exibir no chat
    });
});

app.get('/uploads/:filename', (req, res) => {
    const options = {
        root: path.join(__dirname, 'uploads'),
        headers: {
            'Content-Type': 'application/octet-stream',
        },
    };
    res.sendFile(req.params.filename, options);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
