export function downloadCsv(rows, name) {
 const keys = Object.keys(rows[0] || {});
 const escape = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
 const csv = [keys.map(escape).join(','), ...rows.map(row => keys.map(key => escape(row[key])).join(','))].join('\r\n');
 downloadFile(csv, `${name}.csv`, 'text/csv;charset=utf-8');
}
export function downloadFile(content, filename, type) {
 const url = URL.createObjectURL(new Blob([content], {type}));
 const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
 setTimeout(() => URL.revokeObjectURL(url), 1000);
}

