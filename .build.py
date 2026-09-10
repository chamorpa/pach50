import base64, pathlib, shutil
S = pathlib.Path(__file__).parent
tpl = (S/".template.html").read_text()
vals = {
  "SHEET_URL": "https://script.google.com/macros/s/AKfycbzIJV36ZaEFjoHjYWo95TYEov13o2g_n9NPFkUBjnVSnEXNk4C67uVPf9TXxB3Uct83/exec",
  "RSVP_DEADLINE": "9 de octubre",
}
def fill(t, hero, audio):
    t = t.replace("{{HERO}}", hero).replace("{{AUDIO}}", audio)
    for k, v in vals.items(): t = t.replace("{{"+k+"}}", v)
    return t
# 1) artifact: todo embebido
b64 = lambda p, m: "data:%s;base64,%s" % (m, base64.b64encode((S/p).read_bytes()).decode())
ART = pathlib.Path("/private/tmp/claude-501/-Users-pablochamorro-Documents-Expenses/abd39d4d-b6b5-4d89-9f13-1ee88829c75f/scratchpad/pach50.html")
ART.write_text(fill(tpl, b64("img/portada.jpg","image/jpeg"), b64("audio/loco-un-poco.m4a","audio/mp4")))
# 2) carpeta para GitHub Pages
out = pathlib.Path("/Users/pablochamorro/Documents/Pach50")
(out/"img").mkdir(parents=True, exist_ok=True); (out/"audio").mkdir(exist_ok=True)
html = fill(tpl, "img/portada.jpg", "audio/loco-un-poco.m4a")
head, body = html.split("</style>\n", 1)
(out/"index.html").write_text("<!doctype html>\n<html lang=\"es\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<meta property=\"og:title\" content=\"Pach 50th · Bday Party\">\n<meta property=\"og:description\" content=\"Viernes 30 de octubre · 21 hs · La Herencia, Pilar\">\n<meta property=\"og:image\" content=\"img/portada.jpg\">\n" + head + "</style>\n</head>\n<body>\n" + body + "</body>\n</html>\n")
print("ok", ART.stat().st_size)
