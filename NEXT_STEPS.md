# Next Steps and Context

This document captures the latest context so you can resume seamlessly after closing the editor.

## Summary of Latest Changes
- app navigation: switched to pure hash-based steps (`#size`, `#camera`, `#editor`, `#layout`) and listen to `hashchange`/`popstate` to keep state in sync. File: `src/app/page.tsx`.
- camera capture: capture at the video element's native resolution via an offscreen canvas for sharper images. File: `src/components/CameraCapture.tsx`.
- workflow: GitHub Pages workflow cleaned up, schema header added, and job-level permissions set. File: `.github/workflows/deploy.yml`.

## Deployed Site
- URL: https://machapillo.github.io/PicID/
- Note: If behavior looks stale, try a hard reload (Shift+Reload) due to GitHub Pages caching.

## What To Verify Next
- Browser back/forward returns to the previous step correctly on the deployed site. URL hash should change among `#camera → #editor → #layout` and back.
- Mobile slider handling (in the editor) still prevents page scroll while dragging.
- L-size print outputs correct physical dimensions (print with no scaling, borderless if available).

## Printing Notes
- Layout is generated at 300 DPI for 89x127mm (L-size). Photos are sized in mm → px correctly.
- Ensure printer scaling is off (100%) and paper size is set to L-size.

## Open Items / Ideas
- Optional: add a 10mm scale marker on the layout for after-print verification.
- Optional: expose min/max margin range in the UI.

## How To Continue After Reopening
1. Open the same workspace folder:
   `c:/Users/010030012/OneDrive - OMRON/ドキュメント/dev/証明写真/`
2. If VS Code shows YAML red markers, they should clear now; if not, reload the window and check Problems for details.
3. Test the site URL above and validate back/forward navigation.

If you need more context, ask me to generate a short session summary or expand these notes.
