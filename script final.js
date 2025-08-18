async function iniciarAutomacao() {
    const ra = document.getElementById('ra').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const tempoMin = document.getElementById('tempoMin').value.trim();
    const tempoMax = document.getElementById('tempoMax').value.trim();

    if (!ra || !senha || !tempoMin || !tempoMax) {
        log("❌ Preencha todos os campos!");
        return;
    }

    log("🔄 Enviando dados para o servidor...");

    try {
        const response = await fetch('/save-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra, senha, tempoMin, tempoMax })
        });

        const result = await response.json();

        if (result.success) {
            log(`✅ ${result.message}`);
        } else {
            log(`⚠️ Erro: ${result.message || 'Erro desconhecido'}`);
        }
    } catch (err) {
        log(`❌ Erro na comunicação com o servidor: ${err.message}`);
    }
}

// Função para exibir logs na tela com hora
function log(message) {
    const logContainer = document.getElementById('log');
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `[${time}] ${message}`;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight; // scroll automático
}
