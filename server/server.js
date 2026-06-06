const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Excel = require('exceljs');
const multer = require('multer');

const UPLOAD_TMP = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_TMP)) fs.mkdirSync(UPLOAD_TMP, { recursive: true });

const upload = multer({ dest: UPLOAD_TMP });
const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

const DRIVE_PATH = process.env.DRIVE_PATH || path.join(__dirname, '..', 'drive');
if (!fs.existsSync(DRIVE_PATH)) fs.mkdirSync(DRIVE_PATH, { recursive: true });

const EXCEL_NAME = 'Corpany — Leads.xlsx';
const EXCEL_PATH = path.join(DRIVE_PATH, EXCEL_NAME);
const SHEET_TITLE = 'Leads';

async function ensureWorkbook() {
  const workbook = new Excel.Workbook();
  let worksheet;
  if (fs.existsSync(EXCEL_PATH)) {
    await workbook.xlsx.readFile(EXCEL_PATH);
    worksheet = workbook.getWorksheet(SHEET_TITLE) || workbook.worksheets[0];
  } else {
    worksheet = workbook.addWorksheet(SHEET_TITLE);
    worksheet.addRow(['Fecha', 'Nombre', 'Empresa', 'Servicio', 'Email', 'Presupuesto', 'Qué necesita', 'Archivo adjunto']);
    await workbook.xlsx.writeFile(EXCEL_PATH);
  }
  return { workbook, worksheet };
}

function saveFileFromBase64(base64, filename, folderName) {
  const folderPath = path.join(DRIVE_PATH, folderName);
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
  const filePath = path.join(folderPath, filename);
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

app.post('/submit', upload.single('archivo'), async (req, res) => {
  try {
    let data = req.body || {};

    // If multipart/form-data with a file, multer put file info in req.file
    let savedFilePath = '';
    if (req.file) {
      const folderName = (data.nombre || 'Desconocido') + ' · ' + (data.email || '');
      const destFolder = path.join(DRIVE_PATH, folderName);
      if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
      const destPath = path.join(destFolder, req.file.originalname || req.file.filename);
      fs.renameSync(req.file.path, destPath);
      savedFilePath = destPath;
    } else if (data.archivo && data.archivoNombre) {
      const folderName = (data.nombre || 'Desconocido') + ' · ' + (data.email || '');
      savedFilePath = saveFileFromBase64(data.archivo, data.archivoNombre, folderName);
    }

    const { workbook, worksheet } = await ensureWorkbook();
    const row = [new Date().toISOString(), data.nombre || '', data.empresa || '', data.servicio || '', data.email || '', data.presupuesto || '', data.necesitas || '', savedFilePath || ''];
    worksheet.addRow(row);
    await workbook.xlsx.writeFile(EXCEL_PATH);

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
