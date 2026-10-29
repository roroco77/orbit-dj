#!/usr/bin/env python3
"""Validate the Myspoti manifest and build a small deterministic extension zip."""
import hashlib, json, os, pathlib, re, sys, zipfile
root = pathlib.Path(__file__).resolve().parents[1]
manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
required = ("id", "name", "version", "author", "main", "actions")
missing = [key for key in required if not manifest.get(key)]
if missing:
    raise SystemExit("Missing manifest fields: " + ", ".join(missing))
if not re.fullmatch(r"[a-z][a-z0-9_]*(\.[a-z0-9_]+)+", manifest["id"]):
    raise SystemExit("Invalid reverse-domain extension id")
if len(manifest["name"]) > 40 or len(manifest["author"]) > 60:
    raise SystemExit("Manifest name or author is too long")
if manifest.get("apiVersion", 1) != 1:
    raise SystemExit("This package targets Myspoti extension API v1")
main = root / manifest["main"]
if not main.is_file() or main.suffix != ".js":
    raise SystemExit("Main script must be a root .js file")
if main.stat().st_size > 1024 * 1024:
    raise SystemExit("Main script exceeds 1 MB")
actions = manifest["actions"]
names = set()
for action in actions:
    if action.get("name") in names:
        raise SystemExit("Duplicate action: " + str(action.get("name")))
    names.add(action.get("name"))
    if not action.get("name") or not action.get("why") or len(action["why"]) > 80:
        raise SystemExit("Each action needs a name and a why of 80 characters or fewer")
    if action["name"] == "network" and not action.get("hosts"):
        raise SystemExit("The network action needs at least one host")
if "webview.page" not in names:
    raise SystemExit("Orbit DJ needs webview.page")
if os.environ.get("GITHUB_REF_TYPE") == "tag":
    expected = "v" + manifest["version"]
    actual = os.environ.get("GITHUB_REF_NAME", "")
    if actual != expected:
        raise SystemExit(f"Tag {actual} does not match manifest version {expected}")
files = [root / "manifest.json", main]
for name in ("icon.png", "LICENSE", "LICENSE.txt", "README.md"):
    path = root / name
    if path.is_file() and path not in files:
        files.append(path)
out = root / "extension.zip"
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(files, key=lambda item: item.name):
        archive.write(path, path.name)
if out.stat().st_size > 2 * 1024 * 1024:
    raise SystemExit("Package exceeds 2 MB")
print("Built", out.name, out.stat().st_size, "bytes")
print("SHA-256", hashlib.sha256(out.read_bytes()).hexdigest())
