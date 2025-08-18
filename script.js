
async function iniciarAutomacao() {
    const ra = document.getElementById('ra').value;
    const senha = document.getElementById('senha').value;
    const tempo = document.getElementById('tempo').value;

    try {
        const response = await fetch('/save-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ra, 
                senha, 
                tempoMin: tempo, 
                tempoMax: tempo 
            })
        });

        const result = await response.json();
        log(`✅ ${result.message}`);
    } catch (err) {
        log(`❌ Erro: ${err.message}`);
    }
}
