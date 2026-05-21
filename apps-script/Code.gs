var FOLDER_ID  = '1ntzOT5ES4YUwo2CaVX2OSBboBRTnC4oC';
var SHEET_NAME = 'Corpany — Leads';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: 'Script activo' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var ss    = getOrCreateSpreadsheet();
    var sheet = ss.getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Fecha', 'Nombre', 'Empresa', 'Email', 'Presupuesto', 'Qué necesita', 'Archivo adjunto']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    var fileUrl = '';

    if (data.archivo && data.archivoNombre) {
      try {
        var parentFolder = DriveApp.getFolderById(FOLDER_ID);
        var folderName   = (data.nombre || 'Desconocido') + ' · ' + (data.email || '');
        var existing     = parentFolder.getFoldersByName(folderName);
        var subFolder    = existing.hasNext() ? existing.next() : parentFolder.createFolder(folderName);
        var bytes        = Utilities.base64Decode(data.archivo);
        var blob         = Utilities.newBlob(bytes, data.archivoTipo || 'application/octet-stream', data.archivoNombre);
        fileUrl          = subFolder.createFile(blob).getUrl();
      } catch (fileErr) {
        fileUrl = 'Error al subir archivo: ' + fileErr.message;
      }
    }

    sheet.appendRow([
      new Date(),
      data.nombre      || '',
      data.empresa     || '',
      data.email       || '',
      data.presupuesto || '',
      data.necesitas   || '',
      fileUrl
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSpreadsheet() {
  var files = DriveApp.getFilesByName(SHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.openById(files.next().getId());
  }
  return SpreadsheetApp.create(SHEET_NAME);
}
