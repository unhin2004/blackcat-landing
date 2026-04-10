/**
 * Black Cat Analytics — Airbnb Profit Tracker Spreadsheet Generator
 * Generates a polished .xlsx file with multiple sheets:
 *   1. Instructions
 *   2. Revenue & Expense Log
 *   3. Monthly Dashboard
 *   4. Per-Property Summary
 *   5. Schedule E Tax Report
 *   6. Cleaning Cost Tracker
 */

const ExcelJS = require('exceljs');
const path = require('path');

const BRAND = {
  dark: '1A1A2E',
  green: '22C55E',
  blue: '3B82F6',
  purple: '8B5CF6',
  red: 'EF4444',
  cyan: '06B6D4',
  white: 'FFFFFF',
  lightGray: 'F3F4F6',
  medGray: 'E5E7EB',
  darkGray: '6B7280',
  headerBg: '111827',
  rowAlt: 'F9FAFB',
};

function styleHeader(row, color = BRAND.headerBg) {
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    cell.font = { bold: true, color: { argb: BRAND.white }, size: 11, name: 'Calibri' };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: BRAND.medGray } },
    };
  });
  row.height = 28;
}

function styleCurrency(cell) {
  cell.numFmt = '$#,##0.00';
}

function stylePercent(cell) {
  cell.numFmt = '0.0%';
}

function addBranding(ws, wb, title, subtitle) {
  ws.getRow(1).height = 40;
  // Add logo image
  const logoId = wb.addImage({
    filename: path.join(__dirname, '..', 'logo-icon.png'),
    extension: 'png',
  });
  ws.addImage(logoId, {
    tl: { col: 0, row: 0 },
    ext: { width: 32, height: 32 },
    editAs: 'oneCell',
  });

  ws.mergeCells('B1:H1');
  const titleCell = ws.getCell('B1');
  titleCell.value = `Black Cat Analytics — ${title}`;
  titleCell.font = { bold: true, size: 16, color: { argb: BRAND.dark }, name: 'Calibri' };
  titleCell.alignment = { vertical: 'middle' };

  ws.mergeCells('A2:H2');
  const subCell = ws.getCell('A2');
  subCell.value = subtitle;
  subCell.font = { size: 10, color: { argb: BRAND.darkGray }, name: 'Calibri' };
  ws.getRow(2).height = 20;

  ws.getRow(3).height = 8; // spacer
}

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Black Cat Analytics';
  wb.created = new Date();

  // ═══════════════════════════════════════════
  // SHEET 1: Instructions
  // ═══════════════════════════════════════════
  const wsInstr = wb.addWorksheet('Instructions', { tabColor: { argb: BRAND.green } });
  wsInstr.getColumn('A').width = 80;

  const instructions = [
    ['Black Cat Analytics — Airbnb Profit Tracker'],
    [''],
    ['GETTING STARTED'],
    ['1. Go to the "Revenue & Expenses" tab and log every booking payout and expense.'],
    ['2. The "Monthly Dashboard" tab auto-calculates your monthly profit, margins, and trends.'],
    ['3. The "Per-Property" tab breaks down performance by listing.'],
    ['4. The "Schedule E Tax Report" tab organizes your deductions for tax filing.'],
    ['5. The "Cleaning Tracker" tab helps you track per-turnover cleaning costs.'],
    [''],
    ['TIPS'],
    ['• Enter revenue amounts as positive numbers.'],
    ['• Enter expense amounts as positive numbers (formulas handle the math).'],
    ['• Use the Category dropdown in the Revenue & Expenses tab for consistency.'],
    ['• The Monthly Dashboard updates automatically as you add entries.'],
    ['• Back up this file regularly — save a copy each month.'],
    [''],
    ['EXPENSE CATEGORIES (mapped to IRS Schedule E)'],
    ['  Cleaning → Line 7'],
    ['  Maintenance & Repairs → Line 14'],
    ['  Insurance → Line 9'],
    ['  Utilities → Line 17'],
    ['  Supplies → Line 19 (Other)'],
    ['  Platform Fees → Line 8 (Commissions)'],
    ['  Mortgage Interest → Line 12'],
    ['  Property Tax → Line 16'],
    ['  Advertising → Line 5'],
    ['  Management Fees → Line 8 (Commissions)'],
    ['  Depreciation → Line 18'],
    ['  Other → Line 19'],
    [''],
    ['OUTGROWN THE SPREADSHEET?'],
    ['Black Cat Analytics auto-imports your Airbnb CSV, tracks profit in real-time,'],
    ['generates tax reports, and gives you AI-powered insights.'],
    ['→ https://app.tryblackcat.com/signup (Free to start)'],
    [''],
    ['Questions? support@tryblackcat.com'],
  ];

  instructions.forEach((row, i) => {
    const cell = wsInstr.getCell(`A${i + 1}`);
    cell.value = row[0];
    if (i === 0) {
      cell.font = { bold: true, size: 18, color: { argb: BRAND.dark }, name: 'Calibri' };
      wsInstr.getRow(1).height = 40;
    } else if (['GETTING STARTED', 'TIPS', 'EXPENSE CATEGORIES (mapped to IRS Schedule E)', 'OUTGROWN THE SPREADSHEET?'].includes(row[0])) {
      cell.font = { bold: true, size: 12, color: { argb: BRAND.green.replace('#', '') }, name: 'Calibri' };
    } else {
      cell.font = { size: 11, color: { argb: BRAND.darkGray }, name: 'Calibri' };
    }
  });

  // ═══════════════════════════════════════════
  // SHEET 2: Revenue & Expense Log
  // ═══════════════════════════════════════════
  const wsLog = wb.addWorksheet('Revenue & Expenses', { tabColor: { argb: BRAND.blue } });
  addBranding(wsLog, wb, 'Revenue & Expense Log', 'Log every Airbnb payout and expense here. The other sheets pull from this data.');

  const logHeaders = ['Date', 'Type', 'Category', 'Property', 'Description', 'Amount', 'Tax Deductible', 'Notes'];
  const logWidths = [14, 12, 20, 22, 30, 14, 16, 30];
  logWidths.forEach((w, i) => { wsLog.getColumn(i + 1).width = w; });

  const logHeaderRow = wsLog.getRow(4);
  logHeaders.forEach((h, i) => { logHeaderRow.getCell(i + 1).value = h; });
  styleHeader(logHeaderRow, BRAND.blue.replace('#', ''));

  // Data validation for Type column
  const typeValidation = {
    type: 'list',
    allowBlank: true,
    formulae: ['"Revenue,Expense"'],
  };

  // Data validation for Category column
  const categoryValidation = {
    type: 'list',
    allowBlank: true,
    formulae: ['"Airbnb Payout,VRBO Payout,Other Revenue,Cleaning,Maintenance & Repairs,Insurance,Utilities,Supplies,Platform Fees,Mortgage Interest,Property Tax,Advertising,Management Fees,Depreciation,Other Expense"'],
  };

  // Data validation for Tax Deductible column
  const taxValidation = {
    type: 'list',
    allowBlank: true,
    formulae: ['"Yes,No"'],
  };

  // Add sample data rows
  const sampleData = [
    ['2026-01-05', 'Revenue', 'Airbnb Payout', 'Downtown Loft', 'Payout — 4 night stay (Martinez)', 1240, 'No', ''],
    ['2026-01-07', 'Expense', 'Cleaning', 'Downtown Loft', 'Turnover clean after Martinez', 150, 'Yes', ''],
    ['2026-01-10', 'Revenue', 'Airbnb Payout', 'Lakeside Cabin', 'Payout — 3 night stay (Chen)', 890, 'No', ''],
    ['2026-01-10', 'Expense', 'Cleaning', 'Lakeside Cabin', 'Turnover clean after Chen', 120, 'Yes', ''],
    ['2026-01-12', 'Expense', 'Supplies', 'Downtown Loft', 'Guest toiletries restock', 45, 'Yes', ''],
    ['2026-01-15', 'Revenue', 'Airbnb Payout', 'Beach Bungalow', 'Payout — 5 night stay (Johnson)', 1560, 'No', ''],
    ['2026-01-15', 'Expense', 'Cleaning', 'Beach Bungalow', 'Deep clean after Johnson', 180, 'Yes', ''],
    ['2026-01-18', 'Expense', 'Maintenance & Repairs', 'Downtown Loft', 'HVAC filter replacement', 340, 'Yes', ''],
    ['2026-01-20', 'Expense', 'Insurance', 'Downtown Loft', 'Monthly property insurance', 225, 'Yes', 'STR rider'],
    ['2026-01-20', 'Expense', 'Insurance', 'Lakeside Cabin', 'Monthly property insurance', 195, 'Yes', ''],
    ['2026-01-20', 'Expense', 'Insurance', 'Beach Bungalow', 'Monthly property insurance', 210, 'Yes', ''],
    ['2026-01-22', 'Revenue', 'Airbnb Payout', 'Downtown Loft', 'Payout — 3 night stay (Williams)', 980, 'No', ''],
    ['2026-01-22', 'Expense', 'Cleaning', 'Downtown Loft', 'Turnover clean after Williams', 150, 'Yes', ''],
    ['2026-01-25', 'Expense', 'Utilities', 'Downtown Loft', 'Electric + internet', 185, 'Yes', ''],
    ['2026-01-25', 'Expense', 'Utilities', 'Lakeside Cabin', 'Electric + water + internet', 210, 'Yes', ''],
    ['2026-01-25', 'Expense', 'Utilities', 'Beach Bungalow', 'Electric + water + internet', 195, 'Yes', ''],
    ['2026-01-28', 'Revenue', 'Airbnb Payout', 'Lakeside Cabin', 'Payout — 7 night stay (Davis)', 2100, 'No', ''],
    ['2026-01-28', 'Expense', 'Cleaning', 'Lakeside Cabin', 'Deep clean after Davis (7 night)', 140, 'Yes', ''],
    ['2026-01-31', 'Expense', 'Platform Fees', 'Downtown Loft', 'Airbnb host fee — January', 67, 'Yes', '3% of gross'],
    ['2026-01-31', 'Expense', 'Platform Fees', 'Lakeside Cabin', 'Airbnb host fee — January', 90, 'Yes', '3% of gross'],
    ['2026-01-31', 'Expense', 'Platform Fees', 'Beach Bungalow', 'Airbnb host fee — January', 47, 'Yes', '3% of gross'],
  ];

  sampleData.forEach((data, i) => {
    const rowNum = 5 + i;
    const row = wsLog.getRow(rowNum);
    data.forEach((val, j) => {
      const cell = row.getCell(j + 1);
      cell.value = val;
      cell.font = { size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    });
    // Format date
    row.getCell(1).numFmt = 'YYYY-MM-DD';
    // Format amount
    styleCurrency(row.getCell(6));
    // Color-code type
    if (data[1] === 'Revenue') {
      row.getCell(2).font = { size: 11, name: 'Calibri', color: { argb: BRAND.green }, bold: true };
      row.getCell(6).font = { size: 11, name: 'Calibri', color: { argb: BRAND.green }, bold: true };
    } else {
      row.getCell(2).font = { size: 11, name: 'Calibri', color: { argb: BRAND.red } };
      row.getCell(6).font = { size: 11, name: 'Calibri', color: { argb: BRAND.red } };
    }
    // Alternating row colors
    if (i % 2 === 1) {
      data.forEach((_, j) => {
        row.getCell(j + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.rowAlt } };
      });
    }
  });

  // Apply validations to a large range for future entries
  for (let r = 5; r <= 500; r++) {
    wsLog.getCell(`B${r}`).dataValidation = typeValidation;
    wsLog.getCell(`C${r}`).dataValidation = categoryValidation;
    wsLog.getCell(`G${r}`).dataValidation = taxValidation;
  }

  // Freeze header
  wsLog.views = [{ state: 'frozen', ySplit: 4, activeCell: 'A5' }];

  // ═══════════════════════════════════════════
  // SHEET 3: Monthly Dashboard
  // ═══════════════════════════════════════════
  const wsDash = wb.addWorksheet('Monthly Dashboard', { tabColor: { argb: BRAND.green } });
  addBranding(wsDash, wb, 'Monthly Dashboard', 'Auto-calculated from your Revenue & Expenses log. Do not edit the formula cells.');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dashHeaders = ['Metric', ...months, 'YTD Total'];
  const dashWidths = [22, ...Array(12).fill(12), 14];
  dashWidths.forEach((w, i) => { wsDash.getColumn(i + 1).width = w; });

  const dashHeaderRow = wsDash.getRow(4);
  dashHeaders.forEach((h, i) => { dashHeaderRow.getCell(i + 1).value = h; });
  styleHeader(dashHeaderRow, BRAND.green.replace('#', ''));

  const dashMetrics = [
    'Total Revenue',
    'Total Expenses',
    'Net Profit',
    'Profit Margin',
    '# Transactions',
    'Avg Revenue/Transaction',
  ];

  dashMetrics.forEach((metric, i) => {
    const rowNum = 5 + i;
    const row = wsDash.getRow(rowNum);
    row.getCell(1).value = metric;
    row.getCell(1).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.dark } };

    months.forEach((mon, m) => {
      const monthNum = m + 1;
      const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      const cell = row.getCell(m + 2);
      const logSheet = "'Revenue & Expenses'";

      if (metric === 'Total Revenue') {
        cell.value = { formula: `SUMPRODUCT((MONTH(${logSheet}!A5:A500)=${monthNum})*(YEAR(${logSheet}!A5:A500)=2026)*(${logSheet}!B5:B500="Revenue")*${logSheet}!F5:F500)` };
        styleCurrency(cell);
      } else if (metric === 'Total Expenses') {
        cell.value = { formula: `SUMPRODUCT((MONTH(${logSheet}!A5:A500)=${monthNum})*(YEAR(${logSheet}!A5:A500)=2026)*(${logSheet}!B5:B500="Expense")*${logSheet}!F5:F500)` };
        styleCurrency(cell);
      } else if (metric === 'Net Profit') {
        const revCell = `${String.fromCharCode(66 + m)}5`;
        const expCell = `${String.fromCharCode(66 + m)}6`;
        cell.value = { formula: `${revCell}-${expCell}` };
        styleCurrency(cell);
      } else if (metric === 'Profit Margin') {
        const revCell = `${String.fromCharCode(66 + m)}5`;
        const profCell = `${String.fromCharCode(66 + m)}7`;
        cell.value = { formula: `IF(${revCell}=0,0,${profCell}/${revCell})` };
        stylePercent(cell);
      } else if (metric === '# Transactions') {
        cell.value = { formula: `SUMPRODUCT((MONTH(${logSheet}!A5:A500)=${monthNum})*(YEAR(${logSheet}!A5:A500)=2026)*(${logSheet}!B5:B500<>""))` };
      } else if (metric === 'Avg Revenue/Transaction') {
        const revCell = `${String.fromCharCode(66 + m)}5`;
        const countFormula = `SUMPRODUCT((MONTH(${logSheet}!A5:A500)=${monthNum})*(YEAR(${logSheet}!A5:A500)=2026)*(${logSheet}!B5:B500="Revenue"))`;
        cell.value = { formula: `IF(${countFormula}=0,0,${revCell}/${countFormula})` };
        styleCurrency(cell);
      }

      cell.font = { size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    });

    // YTD Total (column N = 14)
    const ytdCell = row.getCell(14);
    if (metric === 'Profit Margin') {
      ytdCell.value = { formula: `IF(N5=0,0,N7/N5)` };
      stylePercent(ytdCell);
    } else if (metric === 'Avg Revenue/Transaction') {
      ytdCell.value = { formula: `IF(N9=0,0,N5/N9)` };
      styleCurrency(ytdCell);
    } else {
      ytdCell.value = { formula: `SUM(B${rowNum}:M${rowNum})` };
      if (['Total Revenue', 'Total Expenses', 'Net Profit'].includes(metric)) {
        styleCurrency(ytdCell);
      }
    }
    ytdCell.font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.dark } };

    // Color the net profit row
    if (metric === 'Net Profit') {
      for (let c = 1; c <= 14; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ECFDF5' } };
        row.getCell(c).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.green } };
      }
    }
  });

  wsDash.views = [{ state: 'frozen', ySplit: 4, xSplit: 1, activeCell: 'B5' }];

  // ═══════════════════════════════════════════
  // SHEET 4: Per-Property Summary
  // ═══════════════════════════════════════════
  const wsProp = wb.addWorksheet('Per-Property', { tabColor: { argb: BRAND.purple } });
  addBranding(wsProp, wb, 'Per-Property Summary', 'Performance breakdown by listing. Add your property names in column A.');

  const propHeaders = ['Property Name', 'Total Revenue', 'Total Expenses', 'Net Profit', 'Profit Margin', '# Bookings', 'Avg Booking Revenue', 'Top Expense Category'];
  const propWidths = [22, 16, 16, 16, 14, 12, 18, 22];
  propWidths.forEach((w, i) => { wsProp.getColumn(i + 1).width = w; });

  const propHeaderRow = wsProp.getRow(4);
  propHeaders.forEach((h, i) => { propHeaderRow.getCell(i + 1).value = h; });
  styleHeader(propHeaderRow, BRAND.purple.replace('#', ''));

  const properties = ['Downtown Loft', 'Lakeside Cabin', 'Beach Bungalow'];
  const logSheet = "'Revenue & Expenses'";

  properties.forEach((prop, i) => {
    const rowNum = 5 + i;
    const row = wsProp.getRow(rowNum);

    row.getCell(1).value = prop;
    row.getCell(1).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.dark } };

    // Total Revenue
    row.getCell(2).value = { formula: `SUMPRODUCT((${logSheet}!D5:D500="${prop}")*(${logSheet}!B5:B500="Revenue")*${logSheet}!F5:F500)` };
    styleCurrency(row.getCell(2));

    // Total Expenses
    row.getCell(3).value = { formula: `SUMPRODUCT((${logSheet}!D5:D500="${prop}")*(${logSheet}!B5:B500="Expense")*${logSheet}!F5:F500)` };
    styleCurrency(row.getCell(3));

    // Net Profit
    row.getCell(4).value = { formula: `B${rowNum}-C${rowNum}` };
    styleCurrency(row.getCell(4));
    row.getCell(4).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.green } };

    // Profit Margin
    row.getCell(5).value = { formula: `IF(B${rowNum}=0,0,D${rowNum}/B${rowNum})` };
    stylePercent(row.getCell(5));

    // # Bookings (count of Revenue entries)
    row.getCell(6).value = { formula: `SUMPRODUCT((${logSheet}!D5:D500="${prop}")*(${logSheet}!B5:B500="Revenue"))` };

    // Avg Booking Revenue
    row.getCell(7).value = { formula: `IF(F${rowNum}=0,0,B${rowNum}/F${rowNum})` };
    styleCurrency(row.getCell(7));

    if (i % 2 === 1) {
      for (let c = 1; c <= 8; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.rowAlt } };
      }
    }
  });

  // Totals row
  const totalRow = wsProp.getRow(5 + properties.length);
  totalRow.getCell(1).value = 'TOTAL';
  totalRow.getCell(1).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
  totalRow.getCell(2).value = { formula: `SUM(B5:B${4 + properties.length})` }; styleCurrency(totalRow.getCell(2));
  totalRow.getCell(3).value = { formula: `SUM(C5:C${4 + properties.length})` }; styleCurrency(totalRow.getCell(3));
  totalRow.getCell(4).value = { formula: `SUM(D5:D${4 + properties.length})` }; styleCurrency(totalRow.getCell(4));
  totalRow.getCell(5).value = { formula: `IF(B${5 + properties.length}=0,0,D${5 + properties.length}/B${5 + properties.length})` }; stylePercent(totalRow.getCell(5));
  totalRow.getCell(6).value = { formula: `SUM(F5:F${4 + properties.length})` };
  totalRow.getCell(7).value = { formula: `IF(F${5 + properties.length}=0,0,B${5 + properties.length}/F${5 + properties.length})` }; styleCurrency(totalRow.getCell(7));
  for (let c = 1; c <= 8; c++) {
    totalRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ECFDF5' } };
    totalRow.getCell(c).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.green } };
    totalRow.getCell(c).border = { top: { style: 'medium', color: { argb: BRAND.green } } };
  }

  wsProp.views = [{ state: 'frozen', ySplit: 4, activeCell: 'A5' }];

  // ═══════════════════════════════════════════
  // SHEET 5: Schedule E Tax Report
  // ═══════════════════════════════════════════
  const wsTax = wb.addWorksheet('Schedule E Tax Report', { tabColor: { argb: BRAND.red } });
  addBranding(wsTax, wb, 'Schedule E Tax Report', 'Auto-calculated deductions mapped to IRS Schedule E line items. Adjust "Fair Rental Days" and "Personal Use Days" below.');

  const taxWidths = [10, 28, 22, 16, 16];
  taxWidths.forEach((w, i) => { wsTax.getColumn(i + 1).width = w; });

  // Configuration section
  wsTax.getCell('A4').value = 'CONFIGURATION';
  wsTax.getCell('A4').font = { bold: true, size: 12, color: { argb: BRAND.red.replace('#', '') }, name: 'Calibri' };

  const configData = [
    ['Tax Year', 2026],
    ['Fair Rental Days', 280],
    ['Personal Use Days', 30],
    ['Rental Use %', { formula: 'C6/(C6+C7)' }],
  ];
  configData.forEach((data, i) => {
    const row = wsTax.getRow(5 + i);
    row.getCell(2).value = data[0];
    row.getCell(2).font = { size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    row.getCell(3).value = data[1];
    row.getCell(3).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    if (data[0] === 'Rental Use %') {
      stylePercent(row.getCell(3));
    }
  });

  // Schedule E lines
  wsTax.getRow(10).height = 8;
  const taxHeaderRow = wsTax.getRow(11);
  ['Line', 'Schedule E Category', 'Mapped Expense Category', 'Full Amount', 'Deductible Amount'].forEach((h, i) => {
    taxHeaderRow.getCell(i + 1).value = h;
  });
  styleHeader(taxHeaderRow, BRAND.red.replace('#', ''));

  const scheduleELines = [
    ['3', 'Rents Received', 'Airbnb Payout,VRBO Payout,Other Revenue', 'Revenue'],
    ['5', 'Advertising', 'Advertising', 'Expense'],
    ['7', 'Cleaning & Maintenance', 'Cleaning', 'Expense'],
    ['8', 'Commissions', 'Platform Fees,Management Fees', 'Expense'],
    ['9', 'Insurance', 'Insurance', 'Expense'],
    ['12', 'Mortgage Interest', 'Mortgage Interest', 'Expense'],
    ['14', 'Repairs', 'Maintenance & Repairs', 'Expense'],
    ['16', 'Taxes', 'Property Tax', 'Expense'],
    ['17', 'Utilities', 'Utilities', 'Expense'],
    ['18', 'Depreciation', 'Depreciation', 'Expense'],
    ['19', 'Other Expenses', 'Supplies,Other Expense', 'Expense'],
  ];

  scheduleELines.forEach((line, i) => {
    const rowNum = 12 + i;
    const row = wsTax.getRow(rowNum);
    row.getCell(1).value = line[0];
    row.getCell(1).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    row.getCell(1).alignment = { horizontal: 'center' };
    row.getCell(2).value = line[1];
    row.getCell(2).font = { size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    row.getCell(3).value = line[2];
    row.getCell(3).font = { size: 10, name: 'Calibri', color: { argb: BRAND.darkGray } };

    // Full Amount — SUMPRODUCT for each category
    const categories = line[2].split(',');
    const type = line[3];
    if (categories.length === 1) {
      row.getCell(4).value = { formula: `SUMPRODUCT((${logSheet}!C5:C500="${categories[0]}")*(${logSheet}!B5:B500="${type}")*${logSheet}!F5:F500)` };
    } else {
      // Multiple categories — sum them
      const parts = categories.map(cat => `SUMPRODUCT((${logSheet}!C5:C500="${cat}")*(${logSheet}!B5:B500="${type}")*${logSheet}!F5:F500)`);
      row.getCell(4).value = { formula: parts.join('+') };
    }
    styleCurrency(row.getCell(4));

    // Deductible Amount — Revenue lines are 100%, expense lines use rental ratio for shared costs
    if (type === 'Revenue') {
      row.getCell(5).value = { formula: `D${rowNum}` };
    } else if (['Cleaning', 'Advertising', 'Platform Fees,Management Fees', 'Supplies,Other Expense'].includes(line[2])) {
      // 100% deductible (exclusively rental)
      row.getCell(5).value = { formula: `D${rowNum}` };
    } else {
      // Shared expenses — apply rental use ratio
      row.getCell(5).value = { formula: `D${rowNum}*$C$8` };
    }
    styleCurrency(row.getCell(5));

    if (i % 2 === 1) {
      for (let c = 1; c <= 5; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.rowAlt } };
      }
    }
  });

  // Total Deductions row
  const deductTotalRow = wsTax.getRow(12 + scheduleELines.length);
  deductTotalRow.getCell(2).value = 'TOTAL DEDUCTIONS';
  deductTotalRow.getCell(4).value = { formula: `SUM(D13:D${11 + scheduleELines.length})` }; // skip line 3 (revenue)
  deductTotalRow.getCell(5).value = { formula: `SUM(E13:E${11 + scheduleELines.length})` };
  styleCurrency(deductTotalRow.getCell(4));
  styleCurrency(deductTotalRow.getCell(5));
  for (let c = 1; c <= 5; c++) {
    deductTotalRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF2F2' } };
    deductTotalRow.getCell(c).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.red } };
    deductTotalRow.getCell(c).border = { top: { style: 'medium', color: { argb: BRAND.red } } };
  }

  // Net Rental Income
  const netRentalRow = wsTax.getRow(12 + scheduleELines.length + 1);
  netRentalRow.getCell(2).value = 'NET RENTAL INCOME (Line 21)';
  netRentalRow.getCell(5).value = { formula: `E12-E${12 + scheduleELines.length}` };
  styleCurrency(netRentalRow.getCell(5));
  for (let c = 1; c <= 5; c++) {
    netRentalRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ECFDF5' } };
    netRentalRow.getCell(c).font = { bold: true, size: 12, name: 'Calibri', color: { argb: BRAND.green } };
  }

  wsTax.views = [{ state: 'frozen', ySplit: 11, activeCell: 'A12' }];

  // ═══════════════════════════════════════════
  // SHEET 6: Cleaning Cost Tracker
  // ═══════════════════════════════════════════
  const wsClean = wb.addWorksheet('Cleaning Tracker', { tabColor: { argb: BRAND.cyan } });
  addBranding(wsClean, wb, 'Cleaning Cost Tracker', 'Track per-turnover cleaning costs by property. Spot overcharges and optimize your biggest variable expense.');

  const cleanHeaders = ['Date', 'Property', 'Cleaner Name', 'Hours', 'Cost', 'Guest Checkout', 'Deep Clean?', 'Rating (1-5)', 'Notes'];
  const cleanWidths = [14, 22, 18, 10, 12, 18, 14, 14, 30];
  cleanWidths.forEach((w, i) => { wsClean.getColumn(i + 1).width = w; });

  const cleanHeaderRow = wsClean.getRow(4);
  cleanHeaders.forEach((h, i) => { cleanHeaderRow.getCell(i + 1).value = h; });
  styleHeader(cleanHeaderRow, BRAND.cyan.replace('#', ''));

  const deepCleanValidation = { type: 'list', allowBlank: true, formulae: ['"Yes,No"'] };
  const ratingValidation = { type: 'list', allowBlank: true, formulae: ['"1,2,3,4,5"'] };

  const cleanSample = [
    ['2026-01-07', 'Downtown Loft', 'Maria S.', 2.5, 150, 'Martinez', 'No', 4, ''],
    ['2026-01-10', 'Lakeside Cabin', 'James R.', 2, 120, 'Chen', 'No', 5, 'Very clean guest'],
    ['2026-01-15', 'Beach Bungalow', 'Maria S.', 3, 180, 'Johnson', 'Yes', 4, '5-night stay, deep clean needed'],
    ['2026-01-22', 'Downtown Loft', 'Maria S.', 2.5, 150, 'Williams', 'No', 4, ''],
    ['2026-01-28', 'Lakeside Cabin', 'James R.', 2.5, 140, 'Davis', 'No', 5, '7-night stay, long but tidy'],
  ];

  cleanSample.forEach((data, i) => {
    const rowNum = 5 + i;
    const row = wsClean.getRow(rowNum);
    data.forEach((val, j) => {
      const cell = row.getCell(j + 1);
      cell.value = val;
      cell.font = { size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    });
    row.getCell(1).numFmt = 'YYYY-MM-DD';
    styleCurrency(row.getCell(5));
    if (i % 2 === 1) {
      data.forEach((_, j) => {
        row.getCell(j + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.rowAlt } };
      });
    }
  });

  for (let r = 5; r <= 300; r++) {
    wsClean.getCell(`G${r}`).dataValidation = deepCleanValidation;
    wsClean.getCell(`H${r}`).dataValidation = ratingValidation;
  }

  // Summary section
  const sumStart = 5 + cleanSample.length + 2;
  wsClean.getCell(`A${sumStart}`).value = 'CLEANING SUMMARY';
  wsClean.getCell(`A${sumStart}`).font = { bold: true, size: 12, color: { argb: BRAND.cyan.replace('#', '') }, name: 'Calibri' };

  const cleanSummaryData = [
    ['Total Cleanings', { formula: `COUNTA(A5:A${4 + cleanSample.length})` }],
    ['Total Cost', { formula: `SUM(E5:E${4 + cleanSample.length})` }],
    ['Avg Cost per Clean', { formula: `IF(B${sumStart + 1}=0,0,B${sumStart + 2}/B${sumStart + 1})` }],
    ['Avg Hours per Clean', { formula: `IF(B${sumStart + 1}=0,0,AVERAGE(D5:D${4 + cleanSample.length}))` }],
    ['Avg Cost per Hour', { formula: `IF(B${sumStart + 4}=0,0,B${sumStart + 3}/B${sumStart + 4})` }],
  ];

  cleanSummaryData.forEach((data, i) => {
    const row = wsClean.getRow(sumStart + 1 + i);
    row.getCell(1).value = data[0];
    row.getCell(1).font = { size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    row.getCell(2).value = data[1];
    row.getCell(2).font = { bold: true, size: 11, name: 'Calibri', color: { argb: BRAND.dark } };
    if (['Total Cost', 'Avg Cost per Clean', 'Avg Cost per Hour'].includes(data[0])) {
      styleCurrency(row.getCell(2));
    }
  });

  wsClean.views = [{ state: 'frozen', ySplit: 4, activeCell: 'A5' }];

  // ═══════════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════════
  const outPath = path.join(__dirname, '..', 'downloads', 'blackcat-airbnb-profit-tracker.xlsx');
  const outDir = path.dirname(outPath);
  require('fs').mkdirSync(outDir, { recursive: true });

  await wb.xlsx.writeFile(outPath);
  console.log(`✅ Spreadsheet generated: ${outPath}`);
  console.log(`   File size: ${(require('fs').statSync(outPath).size / 1024).toFixed(1)} KB`);
}

generate().catch(console.error);
