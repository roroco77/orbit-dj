# Orbit DJ — Smart Sessions

A Myspoti extension for mood-based music discovery and DJ-style session planning. It searches real Spotify tracks through the signed-in Myspoti account and builds a queue; it does not claim to perform audio crossfades or BPM/key mixing when the API does not expose those controls.

## Install

In Myspoti, open Extensions → Install from an address and enter `https://github.com/roroco77/orbit-dj`. The repository must be public for store discovery. Add the topic `myspoti-extension` in GitHub repository settings to make it discoverable in the store.

## Package

The root files `manifest.json`, `main.js`, `icon.png`, `README.md` and `LICENSE` are the extension package. Tag a version `v1.0.0` to build and attach `extension.zip` via the included GitHub Actions workflow.

## Limitations

Track search and queue control depend on the signed-in Spotify account and the permissions accepted at install. Spotify's public data available through Myspoti does not guarantee BPM, key, or real-time crossfade control; mix styles therefore describe queue ordering, not audio manipulation.
