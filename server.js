const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;
const DB_FILE = 'usuarios.json';

app.use(cors());
app.use(express.json());

// Função para ler o banco de dados
function lerBanco() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({}));
    }
    const dados = fs.readFileSync(DB_FILE);
    return JSON.parse(dados);
}

// Função para salvar no banco de dados
function salvarBanco(dados) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2));
}

// ROTA DE REGISTRO
app.post('/register', (req, res) => {
    const { user, pass } = req.body;
    const usuarios = lerBanco();

    if (usuarios[user]) {
        return res.status(400).json({ success: false, message: "Usuário já existe!" });
    }

    // Salva o usuário no banco de dados centralizado
    usuarios[user] = pass;
    salvarBanco(usuarios);

    res.json({ success: true, message: "Registrado com sucesso!" });
});

// ROTA DE LOGIN
app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    const usuarios = lerBanco();

    if (!usuarios[user] || usuarios[user] !== pass) {
        return res.status(400).json({ success: false, message: "Usuário ou Senha incorretos!" });
    }

    res.json({ success: true, message: "Acesso Concedido!" });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em https://injectzlogin.onrender.com:${PORT}`);
});
