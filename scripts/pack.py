#!/usr/bin/env python3
"""Validate the manifest and create a simple Myspoti extension package."""
import json, pathlib, zipfile, hashlib, sys
root = pathlib.Path(__file__).resolve().parents[1]
manifest_path = root / "manifest.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
required = ["id", "name", "version", "author", "main", "actions"]
missing = [k for k in required if not manifest.get(k)]
if missing:
    raise SystemExit("Missing manifest fields: " + ", ".join(missing))
if not (root / manifest["main"]).is_file():
    raise SystemExit("Main script not found: " + manifest["main"])
if len(manifest["name"]) > 40:
    raise SystemExit("Extension name exceeds 40 characters")
for action in manifest["actions"]:
    if not action.get("name") or not action.get("why") or len(action["why"]) > 80:
        raise SystemExit("Each action needs a name and a why of 80 characters or fewer")
tag = "v" + manifest["version"]
if len(sys.argv) > 1 and sys.argv[1] == "--check-tag":
    import os
    actual = os.environ.get("GITHUB_REF_NAME", "")
    if actual and actual != tag:
        raise SystemExit(f"Tag {actual} does not match manifest version {tag}")
files = [manifest_path, root / manifest["main"]]
for name in ("icon.png", "LICENSE", "LICENSE.txt", "README.md"):
    p = root / name
    if p.is_file() and p not in files:
        files.append(p)
out = root / "extension.zip"
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in sorted(files, key=lambda x: x.name):
        z.write(p, p.name)
if out.stat().st_size > 2 * 1024 * 1024:
    raise SystemExit("Package exceeds 2 MB")
print("Built", out.name, out.stat().st_size, "bytes")
print("SHA-256", hashlib.sha256(out.read_bytes()).hexdigest())
