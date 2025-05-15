document.getElementById('report-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const employee_id = document.getElementById('employee_id').value;
  const inputDate = new Date(document.getElementById('week_date').value);
  const monday = new Date(inputDate);
  monday.setDate(inputDate.getDate() - inputDate.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start_date = monday.toISOString().split('T')[0];
  const end_date = sunday.toISOString().split('T')[0];

  const res = await fetch('../backend_gestione_ore/reports/weekly.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_id, start_date, end_date })
  });

  const data = await res.json();
  const tbody = document.getElementById('report-body');
  const header = document.getElementById('report-header');
  const totalHoursCell = document.getElementById('total-hours');
  tbody.innerHTML = '';
  totalHoursCell.textContent = '';

  if (data.length > 0) {
    const emp = data[0];
    const empName = `${emp.cognome} ${emp.nome}`;
    const empQual = emp.qualifica;
    const empSede = emp.sede;
    header.innerHTML = `
      <p><strong>Dipendente:</strong> ${empName}</p>
      <p><strong>Qualifica:</strong> ${empQual} | <strong>Sede:</strong> ${empSede}</p>
      <p><strong>Periodo:</strong> ${start_date} → ${end_date}</p>
    `;

    let totalMinutes = 0;
    data.forEach(s => {
      const start = new Date(s.entry_date + 'T' + s.entry_time);
      const end = new Date(s.exit_date + 'T' + s.exit_time);
      const diffMinutes = (end - start) / 60000;
      totalMinutes += diffMinutes;

      const row = document.createElement('tr');
      const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
      const dayName = new Date(s.entry_date).toLocaleDateString('it-IT', options);
      row.innerHTML = `
        <td>${dayName}</td>
        <td>${s.entry_time}</td>
        <td>${s.exit_time}</td>
        <td>${(diffMinutes / 60).toFixed(2)}</td>
      `;
      tbody.appendChild(row);
    });

    totalHoursCell.textContent = (totalMinutes / 60).toFixed(2);
  } else {
    header.innerHTML = `<p>Nessun turno trovato per la settimana selezionata.</p>`;
  }
});