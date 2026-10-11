// Builds a CSV file in the browser. Cells starting with = + - @ get a leading apostrophe
// so spreadsheet apps don't run them as formulas.
const RISKY_START = /^[=+\-@\t\r]/;

function cell(value) {
  let text = value == null ? '' : String(value);
  if (RISKY_START.test(text)) text = `'${text}`;
  if (/[",\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export const toCsv = (rows) => rows.map((row) => row.map(cell).join(',')).join('\n');

export function downloadCsv(filename, rows) {
  const blob = new Blob([`\ufeff${toCsv(rows)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
