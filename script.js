
document.getElementById('btnStart').addEventListener('click', async () => {
    const ra = document.getElementById('ra').value;
    const senha = document.getElementById('senha').value;
    const tempo = document.getElementById('tempo').value;
    
    const log = document.getElementById('logOutput');
    log.innerHTML += `<div>[${new Date().toLocaleTimeString()}] Iniciando...</div>`;
    
    try {
        const response = await fetch('/api/automate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ra, senha, tempo })
        });
        
        const result = await response.json();
        const status = result.success ? '✅ Sucesso' : '❌ Falha';
        log.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${status}: ${result.message || ''}</div>`;
    } catch (error) {
        log.innerHTML += `<div>[${new Date().toLocaleTimeString()}] 💥 Erro: ${error.message}</div>`;
    }
});