const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// ===================
// CLASSE DE AGENDAMENTO
// ===================
class TaskScheduler {
    constructor() {
        this.loadConfig();
        this.setupScheduler();
    }

    loadConfig() {
        const savedConfig = global.savedConfig || null;
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
        const savedCreds = global.savedCreds || null;
        if (!savedCreds) return;

        const config = JSON.parse(savedCreds);

        try {
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();

            // Vai para a página de login
            await page.goto('https://taskitos.cupiditys.lol/', { waitUntil: 'networkidle2' });

            // Preenche RA e senha
            await page.type('#studentId', config.ra, { delay: 50 });
            await page.type('#password', config.senha, { delay: 50 });

            // Clica no botão "Atividades Pendentes"
            await page.waitForSelector('#loginNormal');
            await page.click('#loginNormal');

            console.log("Login executado!");

            // Espera abrir a modal de seleção
            await page.waitForSelector('input[placeholder="Tempo Mínimo (minutos)"]');

            // Preenche tempo mínimo e máximo
            await page.type('input[placeholder="Tempo Mínimo (minutos)"]', config.tempoMin.toString(), { delay: 50 });
            await page.type('input[placeholder="Tempo Máximo (minutos)"]', config.tempoMax.toString(), { delay: 50 });

            console.log(`Configurações de tempo aplicadas: ${config.tempoMin} - ${config.tempoMax} min`);

            // Clica no botão "Fazer Lições Todas"
            await page.waitForSelector('button:has-text("Fazer Lições Todas")');
            await page.click('button:has-text("Fazer Lições Todas")');

            console.log("Atividades iniciadas automaticamente!");

            // Espera para ver o processo
            await page.waitForTimeout(10000);

            await browser.close();
        } catch (error) {
            console.error('Erro na execução automática:', error);
        }
    }
}

// ===================
// ROTAS DA API
// ===================
app.post('/save-config', (req, res) => {
    const { ra, senha, tempoMin, tempoMax } = req.body;
    if (!ra || !senha || !tempoMin || !tempoMax) {
        return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
    }

    global.savedCreds = JSON.stringify({ ra, senha, tempoMin, tempoMax });

    res.json({ success: true, message: 'Configurações salvas com sucesso!' });
});

// ===================
// INICIALIZA AGENDAMENTO
// ===================
new TaskScheduler();

// ===================
// INICIA SERVIDOR
// ===================
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
