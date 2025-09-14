const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Generate PDF report with title, summary, and tabular data
 * @param {Object} params - Report parameters
 * @param {string} params.title - Report title
 * @param {Object} params.summary - Summary data to include in the report
 * @param {Array} params.items - Array of data objects to include in the report
 * @returns {Promise<Buffer>} PDF file as buffer
 */
async function generatePdfReport({ title = 'System Report', summary = {}, items = [] }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(title, { underline: true });
    doc.moveDown();

    doc.fontSize(12).text('Summary:');
    Object.entries(summary).forEach(([k, v]) => doc.text(`- ${k}: ${v}`));

    doc.moveDown().text('Items:');
    items.forEach((it, idx) => doc.text(`${idx + 1}. ${JSON.stringify(it)}`));

    doc.end();
  });
}

/**
 * Generate Excel report with title and worksheet data
 * @param {Object} params - Report parameters
 * @param {string} params.title - Report title
 * @param {Array} params.items - Array of data objects to include in the report
 * @returns {Promise<Buffer>} Excel file as buffer
 */
async function generateExcelReport({ title = 'System Report', items = [] }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(title);

  if (items.length > 0) {
    const columns = Object.keys(items[0]).map((k) => ({ header: k, key: k }));
    ws.columns = columns;
    items.forEach((it) => ws.addRow(it));
  }

  return wb.xlsx.writeBuffer();
}

module.exports = { generatePdfReport, generateExcelReport };
