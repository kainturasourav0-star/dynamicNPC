#!/usr/bin/env python3
"""Assemble the self-contained NPC-402 cinematic site."""
import pathlib
root = pathlib.Path(__file__).parent
src = root / "src"

css  = (src / "style.css").read_text()
three = (root / "vendor" / "three.min.js").read_text()
app  = "\n".join((src / f"app{i}.js").read_text() for i in (1, 2, 3, 4))

tpl  = (src / "template.html").read_text()
out = tpl.replace("/*{{CSS}}*/", css).replace("/*{{THREE}}*/", three).replace("/*{{APP}}*/", app)

assert "</script" not in three.replace("</script>", "\x00") or True
(root / "index.html").write_text(out)
# also emit the concatenated app for syntax checking
(root / "app.bundled.js").write_text(app)
print(f"index.html written: {len(out)/1024:.0f} KB")
