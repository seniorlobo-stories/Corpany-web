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

    // Si el sheet está vacío crea la cabecera completa.
    // Si ya existe pero le falta la columna G (Archivo adjunto), la añade.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Fecha', 'Nombre', 'Empresa', 'Qué necesita', 'Presupuesto', 'Email', 'Archivo adjunto']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    } else if (!sheet.getRange(1, 7).getValue()) {
      sheet.getRange(1, 7).setValue('Archivo adjunto');
      sheet.getRange(1, 7).setFontWeight('bold');
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
        fileUrl = 'Error: ' + fileErr.message;
      }
    }

    // Orden de columnas: Fecha | Nombre | Empresa | Qué necesita | Presupuesto | Email | Archivo adjunto
    sheet.appendRow([
      new Date(),
      data.nombre      || '',
      data.empresa     || '',
      data.necesitas   || '',
      data.presupuesto || '',
      data.email       || '',
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

// Ejecuta esta función UNA VEZ desde el editor para autorizar el acceso a Drive
function authorizeDrive() {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  Logger.log('Autorizado. Carpeta: ' + folder.getName());
}
