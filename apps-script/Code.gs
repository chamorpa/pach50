// Pach 50 · recibe las confirmaciones y las sugerencias de música de la invitación
// y las guarda en dos hojas: "Confirmados" y "Playlist".
//
// Cómo publicarlo (una sola vez):
// 1. En el Google Sheet: Extensiones > Apps Script. Borrar lo que haya y pegar este archivo.
// 2. Implementar > Nueva implementación > tipo "Aplicación web".
//    Ejecutar como: "Yo". Quién tiene acceso: "Cualquier persona".
// 3. Autorizar cuando lo pida. Copiar la URL que termina en /exec.
// 4. Pegar esa URL en SHEET_URL dentro de index.html.

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (data.tipo === "playlist") {
    var pl = sheet(ss, "Playlist", ["Fecha", "Canción / artista", "Sugerida por"]);
    pl.appendRow([new Date(data.fecha), data.cancion, data.de || ""]);
  } else {
    var sh = sheet(ss, "Confirmados", ["Fecha", "Nombre", "Restricción alimentaria", "Colectivo", "Zona", "Grupo"]);
    var grupo = data.personas.map(function (p) { return p.nombre; }).join(" + ");
    data.personas.forEach(function (p) {
      sh.appendRow([new Date(data.fecha), p.nombre, p.comida, data.colectivo ? "Sí" : "No", data.zona || "", grupo]);
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function sheet(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function doGet() {
  return ContentService.createTextOutput("Pach 50 RSVP ok");
}
