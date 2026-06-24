const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto'); // Nativo do Node.js para gerar textos aleatórios
const app = express();
const PORT = 3000;

const DB_USERS = 'usuarios.json';
const DB_KEYS = 'keys.json';

app.use(cors());
app.use(express.json());

// Funções Auxiliares de Leitura/Escrita
function lerArquivo(nomeArquivo) {
    if (!fs.existsSync(nomeArquivo)) fs.writeFileSync(nomeArquivo, JSON.stringify({}));
    return JSON.parse(fs.readFileSync(nomeArquivo));
}
function salvarArquivo(nomeArquivo, dados) {
    fs.writeFileSync(nomeArquivo, JSON.stringify(dados, null, 2));
}

// ==========================================
// ROTA PARA GERAR UMA KEY (VÁLIDA POR 24 HORAS)
// ==========================================
app.get('/generate-key', (req, res) => {
    const keys = lerArquivo(DB_KEYS);
    
    // Cria uma string aleatória (Ex: a1b2c3d4)
    const novaKey = crypto.randomBytes(4).toString('hex').toUpperCase(); 
    
    // Define a expiração para daqui a 24 horas
    const dataExpiracao = Date.now() + (24 * 60 * 60 * 1000); 

    keys[novaKey] = { expiresAt: dataExpiracao };
    salvarArquivo(DB_KEYS, keys);

    // Retorna a key criada para o usuário
    res.json({ success: true, key: novaKey });
});

// ==========================================
// ROTA PARA VERIFICAR SE A KEY É VÁLIDA
// ==========================================
app.post('/verify-key', (req, res) => {
    const { key } = req.body;
    const keys = lerArquivo(DB_KEYS);

    if (!keys[key]) {
        return res.status(400).json({ success: false, message: "Key inválida ou inexistente!" });
    }

    // Verifica se o tempo da key já passou do limite atual
    if (Date.now() > keys[key].expiresAt) {
        delete keys[key]; // Remove a key expirada do banco
        salvarArquivo(DB_KEYS, keys);
        return res.status(400).json({ success: false, message: "Esta Key já expirou!" });
    }

    res.json({ success: true, message: "Key Válida! Acesso Concedido." });
});

// Mantive as rotas antigas de login/registro caso queira usar as duas juntas
app.post('/register', (req, res) => { /* Código antigo... */ });
app.post('/login', (req, res) => { /* Código antigo... */ });

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
