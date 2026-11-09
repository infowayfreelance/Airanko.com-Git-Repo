# Ai Ranko — SynthID Image Lab (experimental)

Standalone, dependency-free image processing app; includes a Next.js App Router wrapper for the existing Ai Ranko project.

## Features

- PNG / JPEG / WebP, up to 10 files per batch; 20 MB and 24 MP per image.
- Drag/drop, file selection and clipboard paste.
- Pixel-level, high-frequency blockwise perturbation in Gentle / Balanced / Stronger modes (visual-first experiment).
- Same pixel dimensions and compatible alpha preservation; metadata stripped by Canvas re-export in most cases.
- Before/after slider, decoded-image PSNR score, file size and previews.
- Download an individual result or all results in a store-mode ZIP (generated entirely in the browser).
- No image uploads, image storage, account, backend or third-party processing service.

## Critical limitation

This app **does not detect or verify SynthID** and **cannot truthfully claim that SynthID has been removed**. Google SynthID is intentionally robust to normal edits. The experiment changes image pixels but has **not been shown to defeat the official detector**. The UI always reports verification as unknown and links to https://synthid.com/. The reference website's removal claims are not evidence of effectiveness.

For genuine SynthID removal product claims, run detector-before/detector-after trials on a representative, permissioned dataset and report success rate, false negatives, image-quality metrics and exact detector versions. Do not substitute EXIF/C2PA cleanup for pixel watermark removal.

## Deploy inside Ai Ranko

Copy these paths to the Next.js repository root:

- `public/synthid-image-tool/index.html`
- `app/tools/synthid-remover/page.tsx`
- `app/tools/synthid-remover/synthid-frame.tsx`

The Next page serves `/tools/synthid-remover`; the standalone file can also be opened directly or served at `/synthid-image-tool/index.html`.

The page is deliberately `noindex` until validation. No existing website files need to be changed.

## Local demo

Run `python3 -m http.server 8765 --directory public` from this folder and open `http://localhost:8765/synthid-image-tool/index.html`.

## Testing

Run `python3 tests/test_browser.py` if `playwright` and Chromium are installed. The tests check upload, visible image preservation, result downloads, ZIP output, limits, errors and privacy (zero upload requests).