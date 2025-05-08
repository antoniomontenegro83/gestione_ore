document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Modificato per puntare alla cartella dipendenti invece di employees
    const res = await fetch('../backend_gestione_ore/dipendenti/list.php');
    
    // Verifica che la risposta sia un JSON valido
    if (!res.ok) {
      throw new Error(`Errore nella richiesta: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    const tbody = document.getElementById('employee-table');

    data.forEach(emp => {
      const row = document.createElement('tr');
      // Usati i controlli null/undefined per evitare "undefined" nel campo
      row.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.cognome || ''}</td>
        <td>${emp.nome || ''}</td>
        <td><input type="text" value="${emp.qualifica || ''}" data-id="${emp.id}" class="form-control qualifica"></td>
        <td><input type="text" value="${emp.sede || ''}" data-id="${emp.id}" class="form-control sede"></td>
        <td><button class="btn btn-sm btn-primary" onclick="salva(${emp.id})">Salva</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Errore nel caricamento dei dipendenti:", error);
    alert("Si è verificato un errore nel caricamento dei dipendenti. Consulta la console per dettagli.");
  }
});

async function salva(id) {
  try {
    const qualifica = document.querySelector(`.qualifica[data-id='${id}']`).value;
    const sede = document.querySelector(`.sede[data-id='${id}']`).value;

    // Modificato per puntare alla cartella dipendenti invece di employees
    const response = await fetch('../backend_gestione_ore/dipendenti/update.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, qualifica, sede })
    });

    if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      alert("Aggiornamento completato con successo!");
    } else {
      alert("Errore durante l'aggiornamento: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    console.error("Errore durante il salvataggio:", error);
    alert("Si è verificato un errore durante il salvataggio. Consulta la console per dettagli.");
  }
}