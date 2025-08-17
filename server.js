// =======================
// IMPORTS
// =======================
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');

// =======================
// CONFIG EXPRESS
// =======================
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// =======================
// HELPER: Navegação Segura
// =======================
async function safeNavigate(page, primarySelector, fallbackSelector) {
    try {
        if (await page.$(primarySelector)) {
            await page.click(primarySelector);
        } else if (await page.$(fallbackSelector)) {
            await page.click(fallbackSelector);
        } else {
            console.log("Nenhum seletor encontrado, continuando...");
        }
    } catch (err) {
        console.log("Erro no safeNavigate:", err.message);
    }
}

// =======================
// ROTA PRINCIPAL DE AUTOMAÇÃO
// =======================
app.post('/api/automate', async (req, res) => {
    const { ra, senha } = req.body;

    // salva credenciais no localStorage
    localStorage.setItem('taskitosCredentials', JSON.stringify({ ra, senha }));

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // 1. Vai para login
        await page.goto('https://taskitos.cupiditys.lol/');
        await page.type('#studentId', ra);
        await page.type('#password', senha);
        await page.click('#loginButton');

        // 2. Continua a navegação (com fallback)
        await safeNavigate(page, '#loginNormal', '#loginOverdue');

        // TODO: aqui você adiciona o resto da automação (selecionar provas, etc.)

        await browser.close();

        res.json({ success: true, message: "Automação concluída com sucesso!" });
    } catch (error) {
        console.error("Erro durante a automação:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =======================
// AGENDADOR
// =======================
class TaskScheduler {
    constructor() {
        this.loadConfig();
        this.setupScheduler();
    }

    loadConfig() {
        const savedConfig = localStorage.getItem('taskitosConfig');
        this.config = savedConfig ? JSON.parse(savedConfig) : {
            days: [1, 3, 5], // seg, qua, sex
            time: "19:00"
        };
    }

    setupScheduler() {
        setInterval(() => {
            const now = new Date();
            const [hours, minutes] = this.config.time.split(':');

            const shouldRunToday = this.config.days.includes(now.getDay());
            const isTime = now.getHours() === parseInt(hours) &&
                           now.getMinutes() === parseInt(minutes);

            if (shouldRunToday && isTime) {
                this.executeAutomation();
            }
        }, 60000); // checa a cada minuto
    }

    async executeAutomation() {
        const savedCreds = localStorage.getItem('taskitosCredentials');
        if (!savedCreds) return;

        const config = JSON.parse(savedCreds);

        try {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();

           await page.goto('https://taskitos.cupiditys.lol/', { waitUntil: 'networkidle2' });

           await page.type('#studentId', ra, { delay: 50 });
await page.type('#password', senha, { delay: 50 });

            await page.click('#loginNormal');  // ou '#loginOverdue' se for o caso

            await safeNavigate(page, '#loginNormal', '#loginOverdue');

            // TODO: mesma lógica de automação daqui

            await browser.close();
        } catch (error) {
            console.error('Erro na execução automática:', error);
        }
    }
}

// inicializa agendamento
new TaskScheduler();

// =======================
// INICIA SERVIDOR
// =======================
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

