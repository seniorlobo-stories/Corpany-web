// Pega este código en tu editor de Apps Script
// (Extensions → Apps Script dentro del Google Sheet)

var FOLDER_ID = '1ntzOT5ES4YUwo2CaVX2OSBboBRTnC4oC';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Si es la primera fila, añade cabeceras
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Fecha', 'Nombre', 'Empresa', 'Email', 'Presupuesto', 'Qué necesita', 'Archivo adjunto']);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    var fileUrl = '';

    // Guarda el archivo adjunto en una subcarpeta con el nombre del contacto
    if (data.archivo && data.archivoNombre) {
      var parentFolder = DriveApp.getFolderById(FOLDER_ID);
      var folderName   = (data.nombre || 'Desconocido') + ' · ' + (data.email || '');

      var existing  = parentFolder.getFoldersByName(folderName);
      var subFolder = existing.hasNext() ? existing.next() : parentFolder.createFolder(folderName);

      var bytes = Utilities.base64Decode(data.archivo);
      var blob  = Utilities.newBlob(bytes, data.archivoTipo || 'application/octet-stream', data.archivoNombre);
      fileUrl   = subFolder.createFile(blob).getUrl();
    }

    // Añade fila con los datos del formulario
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
