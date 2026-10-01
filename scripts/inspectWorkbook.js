const XLSX = require('xlsx');
const path = require('path');

const wbPath = path.join(__dirname, '..', 'Copy of MAT101 2019-20CSxlsx.xlsx');
console.log('Loading workbook:', wbPath);
const wb = XLSX.readFile(wbPath, { cellFormula: true, cellHTML: false, cellText: false });

console.log('Sheet names:', wb.SheetNames);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  console.log(`\n--- Sheet: ${name} ---`);
  console.log('Range:', ws['!ref']);
  console.log('Merged cells count:', ws['!merges'] ? ws['!merges'].length : 0);

  // Let's sample key rows
  if (name === 'CO Calculation') {
    console.log('\nCO Calculation sample cells:');
    for (let r = 1; r <= 15; r++) {
      let rowStr = `R${r}: `;
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']) {
        const cell = ws[`${col}${r}`];
        if (cell) {
          rowStr += `${col}=${cell.v !== undefined ? cell.v : ''}${cell.f ? ` [f: =${cell.f}]` : ''} | `;
        }
      }
      console.log(rowStr);
    }

    console.log('\nCO Calculation summary rows 62-75:');
    for (let r = 62; r <= 76; r++) {
      let rowStr = `R${r}: `;
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']) {
        const cell = ws[`${col}${r}`];
        if (cell) {
          rowStr += `${col}=${cell.v !== undefined ? cell.v : ''}${cell.f ? ` [f: =${cell.f}]` : ''} | `;
        }
      }
      console.log(rowStr);
    }

    console.log('\nCO Calculation mapping rows 77-93:');
    for (let r = 77; r <= 93; r++) {
      let rowStr = `R${r}: `;
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']) {
        const cell = ws[`${col}${r}`];
        if (cell) {
          rowStr += `${col}=${cell.v !== undefined ? cell.v : ''}${cell.f ? ` [f: =${cell.f}]` : ''} | `;
        }
      }
      console.log(rowStr);
    }
  }

  if (name === 'OVERALL CO') {
    console.log('\nOVERALL CO sample cells:');
    for (let r = 1; r <= 30; r++) {
      let rowStr = `R${r}: `;
      for (const col of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']) {
        const cell = ws[`${col}${r}`];
        if (cell) {
          rowStr += `${col}=${cell.v !== undefined ? cell.v : ''}${cell.f ? ` [f: =${cell.f}]` : ''} | `;
        }
      }
      console.log(rowStr);
    }
  }
}
