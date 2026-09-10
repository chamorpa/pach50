// Pach 50 · recibe las confirmaciones y las sugerencias de música de la invitación
// y las guarda en el Sheet. Hojas: "Confirmados", "Playlist", "Log" (copia cruda de
// todo lo que llega, por si algo falla) y "Errores".
//
// Si editás este código, después hay que ir a Implementar > Administrar implementaciones,
// editar la implementación (lápiz) y elegir Versión: "Nueva versión". La URL /exec no cambia.

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var raw = (e && e.postData && e.postData.contents) || "";
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    logError(ss, "lock", err, raw);
    return out({ ok: false, error: "busy" });
  }
  try {
    // 1) copia cruda primero: pase lo que pase, el dato queda guardado
    sheet(ss, "Log", ["Fecha", "JSON recibido"]).appendRow([new Date(), raw]);

    // 2) procesar
    var data = JSON.parse(raw);
    if (data.tipo === "playlist") {
      sheet(ss, "Playlist", ["Fecha", "Canción / artista", "Sugerida por"])
        .appendRow([fecha(data.fecha), String(data.cancion || ""), String(data.de || "")]);
    } else {
      var sh = sheet(ss, "Confirmados", ["Fecha", "Nombre", "Restricción alimentaria", "Colectivo", "Zona", "Grupo"]);
      var personas = Array.isArray(data.personas) ? data.personas : [];
      var grupo = personas.map(function (p) { return String(p.nombre || ""); }).join(" + ");
      personas.forEach(function (p) {
        sh.appendRow([fecha(data.fecha), String(p.nombre || ""), String(p.comida || ""), data.colectivo ? "Sí" : "No", String(data.zona || ""), grupo]);
      });
    }
    return out({ ok: true });
  } catch (err) {
    logError(ss, "doPost", err, raw);
    return out({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Pach 50 RSVP ok");
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

function fecha(iso) {
  var d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

function logError(ss, donde, err, raw) {
  try {
    sheet(ss, "Errores", ["Fecha", "Dónde", "Error", "JSON recibido"]).appendRow([new Date(), donde, String(err && err.stack || err), raw]);
  } catch (ignored) {}
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
