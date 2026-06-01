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

    // Export the spreadsheet as an Excel file and save it into the target folder
    try {
      var ssFile = DriveApp.getFileById(ss.getId());
      var xlsxBlob = ssFile.getBlob().getAs(MimeType.MICROSOFT_EXCEL);
      var ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      var xlsxName = SHEET_NAME + ' — ' + ts + '.xlsx';
      var parentFolder = DriveApp.getFolderById(FOLDER_ID);
      parentFolder.createFile(xlsxBlob.setName(xlsxName));
    } catch (exportErr) {
      // If export fails, log the error but continue — we still want to record the lead
      Logger.log('Error exporting XLSX: ' + exportErr);
    }

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
