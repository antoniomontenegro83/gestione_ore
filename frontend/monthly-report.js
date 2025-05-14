document.getElementById('report-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const employee_id = document.getElementById('employee_id').value;
  const month = document.getElementById('month').value;
  const year = document.getElementById('year').value;

  const res = await fetch('../backend_gestione_ore/reports/monthly.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id, month, year })
  });

  const data = await res.json();
  const tbody = document.getElementById('report-body');
  const header = document.getElementById('report-header');
  tbody.innerHTML = '';

  if (data.length > 0) {
    const emp = data[0];
    const empName = `${emp.cognome} ${emp.nome}`;
    const empQual = emp.qualifica;
    const empSede = emp.sede;
    header.innerHTML = `
      <p><strong>Dipendente:</strong> ${empName}</p>
      <p><strong>Qualifica:</strong> ${empQual} | <strong>Sede:</strong> ${empSede}</p>
      <p><strong>Mese:</strong> ${month}/${year}</p>
    `;

    data.forEach(s => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${s.entry_date} ${s.entry_time}</td><td>${s.exit_date} ${s.exit_time}</td>`;
      tbody.appendChild(row);
    });
  } else {
    header.innerHTML = `<p>Nessun turno trovato per il mese selezionato.</p>`;
  }
});