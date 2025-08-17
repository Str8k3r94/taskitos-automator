
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Rota de automação
app.post('/api/automate', async (req, res) => {
    const { ra, senha, tempo } = req.body;
    
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Configuração stealth
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'pt-BR,pt;q=0.9'
        });

        // 1. Login
        await page.goto('https://taskitos.cupiditys.lol/', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });

        await page.type('#studentId', ra, { delay: 100 });
        await page.type('#password', senha, { delay: 150 });
        await page.click('#loginButton');

        // 2. Navegação (com fallback)
        await this.safeNavigate(page, '#loginNormal', '#loginOverdue');

        // 3. Execução das tarefas
        await page.waitForSelector('#startAllActivities', { timeout: 15000 });
        await page.click('#startAllActivities');
        await page.type('#time-input', tempo.toString(), { delay: 80 });
        await page.click('#confirm-button');

        await browser.close();
        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Helper para navegação resiliente
async function safeNavigate(page, primarySelector, fallbackSelector) {
    try {
        await page.waitForSelector(primarySelector, { timeout: 10000 });
        await page.click(primarySelector);
    } catch {
        await page.click(fallbackSelector);
    }
}

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));


// ... (código anterior mantido)

// Novo módulo de agendamento
class TaskScheduler {
    constructor() {
        this.loadConfig();
        this.setupScheduler();
    }

    loadConfig() {
        this.config = JSON.parse(localStorage.getItem('taskitosConfig')) || {
            days: [1, 3, 5], // Seg, Qua, Sex padrão
            time: "19:00"
        };
    }

    setupScheduler() {
        // Verifica diariamente se precisa executar
        setInterval(() => {
            const now = new Date();
            const [hours, minutes] = this.config.time.split(':');
            
            // Verifica se é um dia agendado
            const shouldRunToday = this.config.days.includes(now.getDay());
            
            // Verifica horário
            const isTime = now.getHours() === parseInt(hours) && 
                          now.getMinutes() === parseInt(minutes);
            
            if (shouldRunToday && isTime) {
                this.executeAutomation();
            }
        }, 60000); // Checa a cada minuto
    }

    async executeAutomation() {
        const config = JSON.parse(localStorage.getItem('taskitosCredentials'));
        if (!config) return;
        
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            
            await page.goto('https://taskitos.cupiditys.lol/');
            await page.type('#studentId', config.ra);
            await page.type('#password', config.senha);
            await page.click('#loginButton');
            
            // ... (processo de automação completo)
            
            await browser.close();
        } catch (error) {
            console.error('Erro na execução automática:', error);
        }
    }
}

// Inicializa junto com o servidor

new TaskScheduler();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch'); // pasta onde salva os dados
