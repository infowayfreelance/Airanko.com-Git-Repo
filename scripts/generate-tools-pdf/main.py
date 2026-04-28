"""Generate a comprehensive PDF of all free, in-browser tool ideas discussed.

Usage:  uv run main.py
Output: /vercel/share/v0-project/public/free-browser-tools.pdf
"""

from __future__ import annotations

import os
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUTPUT_PATH = "/vercel/share/v0-project/public/free-browser-tools.pdf"


# ---------------------------------------------------------------------------
# Data: every tool discussed in the conversation, grouped by category.
# Each tool is (name, library / API / approach, short description).
# ---------------------------------------------------------------------------

CATEGORIES: list[tuple[str, str, list[tuple[str, str, str]]]] = [
    (
        "Highest-Traffic Universal Tools",
        "Massive search demand, easy to rank, fast to build.",
        [
            ("PDF Merger", "pdf-lib", "Combine multiple PDFs into one file."),
            ("PDF Splitter", "pdf-lib", "Extract pages or split into multiple files."),
            ("Image Compressor", "browser-image-compression", "Shrink JPG/PNG/WebP without quality loss."),
            ("HEIC to JPG", "heic2any", "Convert iPhone photos to web-friendly JPG."),
            ("OCR (Image to Text)", "tesseract.js", "Extract text from any image."),
            ("Video to GIF", "ffmpeg.wasm", "Convert short clips into shareable GIFs."),
            ("Word Counter", "Pure JS", "Count words, characters, and reading time."),
            ("QR Code Generator", "qrcode", "Create QR codes with logos and colors."),
            ("Password Generator", "Pure JS", "Strong, customizable password creator."),
            ("Age Calculator", "Pure JS", "Calculate exact age in years/months/days."),
        ],
    ),
    (
        "Image and Photo Tools",
        "Run fully on-device using Canvas, WASM, or browser AI models.",
        [
            ("Image Resizer (single + bulk)", "Canvas API", "Resize one image or many at once."),
            ("Image Format Converter", "Canvas API", "Convert PNG/JPG/WebP/AVIF formats."),
            ("Image Cropper", "react-image-crop", "Drag-to-crop with aspect ratios."),
            ("Image Rotator / Flipper", "Canvas API", "Rotate or mirror images."),
            ("Image Color Picker / Palette Extractor", "colorthief", "Extract dominant colors from any image."),
            ("Image to ASCII Art", "Custom canvas", "Fun, viral-friendly conversion tool."),
            ("Image to Pixel Art", "Custom canvas", "Convert photos into retro pixel art."),
            ("Photo Filters (Instagram-style)", "glfx.js", "Apply WebGL-powered photo filters."),
            ("Polaroid / Frame Maker", "Canvas API", "Add classic Polaroid-style frames."),
            ("Meme Generator", "Canvas API", "Top/bottom text overlay on images."),
            ("Watermark Adder (batch)", "Canvas API", "Add text or logo watermarks in bulk."),
            ("Collage Maker", "Canvas API", "Combine multiple photos into a layout."),
            ("Favicon Generator (multi-size)", "Canvas API", "Export all favicon sizes from one image."),
            ("App Icon Generator", "Canvas API", "Generate iOS and Android icon sets."),
            ("Open Graph Image Generator", "Canvas API", "Create social preview images."),
            ("Twitter Header / YouTube Thumbnail Maker", "Canvas API", "Templates for social headers."),
            ("Image Background Remover", "RMBG-1.4 + Canvas", "Remove backgrounds with on-device AI."),
            ("Image Background Replacer", "RMBG-1.4 + Canvas", "Swap backgrounds with custom colors or images."),
            ("Face Blur / Pixelator", "@vladmandic/face-api", "Auto-detect faces and blur them."),
            ("Remove EXIF / GPS Metadata", "exifr", "Strip privacy data from photos."),
            ("AVIF Converter", "@jsquash/avif", "Convert images to modern AVIF format."),
            ("Image Upscaler 2x/4x", "upscaler (UpscalerJS)", "AI upscaling using TensorFlow.js."),
            ("Image Sharpener", "Canvas + unsharp mask", "Boost image clarity."),
            ("Image Denoiser", "DnCNN ONNX", "Remove noise from photos."),
            ("Old Photo Restorer", "GFPGAN ONNX", "Restore faces in old photos."),
            ("Old Photo Colorizer", "DeOldify ONNX", "Add color to black and white photos."),
            ("Anime / Cartoon Style Filter", "AnimeGANv3 ONNX", "Stylize photos as anime/cartoon."),
            ("Sketch / Pencil Drawing Filter", "Canvas + edge detection", "Convert photos to sketches."),
            ("Image Color Correction", "Canvas + histogram math", "Auto-adjust levels and contrast."),
        ],
    ),
    (
        "PDF and Document Tools",
        "All operations run locally — files never leave the browser.",
        [
            ("PDF Merger", "pdf-lib", "Combine PDFs into one file."),
            ("PDF Splitter", "pdf-lib", "Extract pages or split by range."),
            ("PDF to Image", "pdfjs-dist", "Convert PDF pages to JPG/PNG."),
            ("Image to PDF", "jspdf", "Combine images into a single PDF."),
            ("PDF Page Rotator", "pdf-lib", "Rotate pages 90/180/270 degrees."),
            ("PDF Compressor", "pdf-lib + Canvas", "Re-encode images at lower quality."),
            ("PDF Watermark Adder", "pdf-lib", "Add text or logo watermark to all pages."),
            ("PDF Page Reorder", "pdf-lib", "Drag to rearrange PDF pages."),
            ("PDF Password Remover", "pdf-lib", "Remove password if user knows it."),
            ("PDF Metadata Editor", "pdf-lib", "Edit title, author, and keywords."),
            ("PDF Form Filler", "pdf-lib", "Fill in interactive PDF forms."),
            ("PDF Redactor", "pdf-lib", "Permanently black out sensitive content."),
            ("DOCX Viewer", "mammoth.js", "Open Word documents in the browser."),
            ("DOCX to HTML", "mammoth.js", "Convert Word documents to HTML."),
            ("Excel (XLSX) Viewer / Editor", "xlsx (SheetJS)", "Open and edit spreadsheets."),
            ("CSV Editor", "papaparse", "Spreadsheet-style editing for CSV files."),
            ("ePub Reader", "epub.js", "Read ebooks in the browser."),
        ],
    ),
    (
        "AI Tools (In-Browser, No API)",
        "Powered by Transformers.js, ONNX, TensorFlow.js, and WebLLM.",
        [
            ("AI Image Tagger / Describer", "ViT or BLIP", "Auto-generate alt text for images."),
            ("Image Captioner", "BLIP", "Describe images in natural language."),
            ("AI Object Detection", "@tensorflow-models/coco-ssd", "Detect 80 object classes."),
            ("Speech to Text (Whisper)", "@xenova/transformers Whisper", "Transcribe audio offline."),
            ("Text to Speech", "Web Speech API", "Convert text to spoken audio."),
            ("Text Summarizer", "DistilBART CNN", "Auto-summarize long text or articles."),
            ("Article TL;DR Generator", "DistilBART", "One-paragraph summary of articles."),
            ("Sentiment Analyzer", "DistilBERT", "Detect positive, negative, or neutral tone."),
            ("Email Tone Detector", "DistilBERT fine-tunes", "Analyze tone before you send."),
            ("Spam Detector", "TinyBERT", "Classify text as spam or not."),
            ("Language Detector", "XLM-RoBERTa", "Identify text language."),
            ("Translator (200 languages)", "NLLB-200 distilled", "Offline translation."),
            ("Grammar Checker", "T5 small", "Fix grammar mistakes in text."),
            ("Paraphraser / Rewriter", "T5 paraphrase", "Rewrite sentences."),
            ("Question Answering (over a doc)", "DistilBERT QA", "Answer questions from a document."),
            ("Named Entity Recognizer", "BERT NER", "Extract people, places, organizations."),
            ("Text Classifier (custom labels)", "Zero-shot BART MNLI", "Classify text by your own labels."),
            ("Image Similarity / Reverse Search", "CLIP", "Find visually similar images."),
            ("Image Search by Text", "CLIP", "Search image library with natural language."),
            ("Pose Detection", "MoveNet (TF.js)", "Detect human poses in real time."),
            ("Hand Tracking", "MediaPipe Hands", "Track hand landmarks live."),
            ("Face Mesh / Landmarks", "MediaPipe FaceMesh", "468-point face mesh."),
            ("Selfie Segmentation", "MediaPipe Selfie", "Real-time person segmentation."),
            ("Body Segmentation", "BodyPix", "Person/background segmentation."),
            ("Gesture Controller", "MediaPipe Gestures", "Control UI with hand gestures."),
            ("Emotion Detector (from face)", "Face-API.js", "Detect 7 facial emotions."),
            ("Age & Gender Estimator", "Face-API.js", "Estimate age and gender from face."),
            ("Face Recognizer / Matcher", "Face-API.js", "Match faces across photos."),
            ("Real-time Style Transfer", "Magenta arbitrary style", "Stylize webcam in real time."),
            ("Sketch to Image", "Pix2Pix ONNX", "Turn sketches into images."),
            ("Tiny Local Chatbot", "WebLLM (Llama 3.2 1B)", "Runs LLMs in the browser."),
            ("In-browser Code Assistant", "WebLLM (Qwen Coder)", "Local AI coding helper."),
            ("Math Equation Solver from photo", "Nougat / Pix2Tex ONNX", "OCR for math equations."),
            ("Handwriting to Text", "TrOCR via Transformers.js", "Read handwriting."),
            ("Document Scanner", "opencv.js", "Detect and rectify document edges."),
            ("Receipt Scanner + total extractor", "tesseract.js + regex", "Scan receipts and pull totals."),
            ("Business Card Scanner", "tesseract.js + parsing", "Scan and export as vCard."),
            ("Background Music Remover", "Demucs ONNX", "Isolate vocals from music."),
            ("Vocal Isolator / Karaoke Maker", "Spleeter ONNX", "Remove vocals from songs."),
            ("Noise Remover (audio cleanup)", "rnnoise-wasm", "Clean up noisy audio."),
            ("Sheet Music to MIDI", "magenta (TensorFlow.js)", "Convert sheet music to MIDI."),
            ("Chord Detector from audio", "essentia.js", "Detect chord progressions."),
            ("BPM / Tempo Detector", "essentia.js", "Find tempo of songs."),
            ("Key Detector (musical key)", "essentia.js", "Detect musical key."),
        ],
    ),
    (
        "SEO Tools",
        "Useful for marketers, bloggers, and webmasters.",
        [
            ("Meta Tag Generator", "Pure JS", "Generate clean title/description meta tags."),
            ("Sitemap Generator", "sitemap npm + crawler", "Build sitemap.xml files."),
            ("Robots.txt Tester", "Pure regex", "Test crawler rules locally."),
            ("Schema Markup Generator", "Pure JS templates", "Generate JSON-LD schema."),
            ("Open Graph Preview", "cheerio (serverless)", "Preview how links look on social."),
            ("Word/Character Counter", "Pure JS", "Count words, characters, paragraphs."),
            ("Keyword Density Analyzer", "Pure JS", "Find dominant keywords in text."),
            ("Hreflang Tag Generator", "Pure JS", "Generate hreflang tags for multilingual sites."),
            ("Reading Time Calculator", "Pure JS", "Estimate reading time from word count."),
            ("Slug Generator (SEO URLs)", "slugify", "Convert titles to URL-friendly slugs."),
            ("UTM Builder", "Pure JS", "Build trackable campaign URLs."),
            ("Site Audit Tool", "cheerio + Lighthouse", "Run on-page SEO audits."),
            ("Bulk Meta & OG Checker", "fetch + cheerio", "Check meta tags across many URLs."),
            ("Mobile Friendliness Checker", "Headless viewport / Lighthouse", "Test mobile rendering."),
        ],
    ),
    (
        "Developer / Utility Tools",
        "Massive search volume across the developer community.",
        [
            ("JSON Formatter / Validator", "Built-in JSON.parse", "Pretty-print and validate JSON."),
            ("JSON Diff", "jsondiffpatch", "Find differences between two JSON files."),
            ("JSON to CSV / CSV to JSON", "papaparse", "Convert between formats."),
            ("JSON to YAML / YAML to JSON", "js-yaml", "Bidirectional format conversion."),
            ("JSON to TypeScript Interface", "quicktype-core", "Generate TypeScript types from JSON."),
            ("JSON Path Tester", "jsonpath-plus", "Test JSONPath expressions."),
            ("JSONata Playground", "jsonata", "Test JSONata queries live."),
            ("JWT Decoder", "jwt-decode", "Decode JWT tokens to view payload."),
            ("Base64 Encoder / Decoder", "Built-in btoa/atob", "Encode and decode Base64."),
            ("URL Encoder / Decoder", "Built-in", "URL-safe encoding."),
            ("HTML Entity Encode / Decode", "he", "Encode and decode HTML entities."),
            ("Regex Tester / Builder", "Pure JS", "Test regular expressions live."),
            ("Cron Expression Parser", "cronstrue", "Convert cron to plain English."),
            ("UUID Generator", "uuid", "Generate v1, v4, and v7 UUIDs."),
            ("Hash Generator (MD5/SHA-1/SHA-256)", "SubtleCrypto", "Hash text or files."),
            ("HMAC Generator", "SubtleCrypto", "Generate HMAC signatures."),
            ("Diff Checker", "diff / jsdiff", "Compare two text blobs."),
            ("Markdown to HTML", "marked / remark", "Convert markdown to HTML."),
            ("HTML to Markdown", "turndown", "Convert HTML back to markdown."),
            ("Color Picker / Converter", "colorjs.io", "Convert HEX/RGB/HSL/OKLCH."),
            ("CSS Gradient Generator", "Pure JS", "Visual gradient builder."),
            ("Box Shadow Generator", "Pure JS", "Build CSS box-shadows visually."),
            ("Border Radius Generator", "Pure JS", "Generate complex border radii."),
            ("Flexbox Playground", "Pure JS", "Visual flexbox tester."),
            ("Grid Playground", "Pure JS", "Visual CSS grid tester."),
            ("SVG to JSX Converter", "svgr", "Convert SVG to React components."),
            ("Minifier / Beautifier", "prettier (browser build)", "Format JS/CSS/HTML."),
            ("Code Diff Viewer", "diff2html", "Visual diff viewer."),
            ("Image to Base64", "Pure JS", "Encode images for inline use."),
            ("Mock Data Generator", "@faker-js/faker", "Generate fake JSON data."),
            ("QR Code Decoder", "jsqr", "Read QR codes from images."),
        ],
    ),
    (
        "Audio and Video Tools",
        "Powered by ffmpeg.wasm and the Web Audio API.",
        [
            ("Video Trimmer", "ffmpeg.wasm", "Trim videos without re-encoding."),
            ("Video Compressor", "ffmpeg.wasm", "Shrink video file size."),
            ("Video to MP3 / Audio Extractor", "ffmpeg.wasm", "Extract audio tracks."),
            ("Video to GIF", "ffmpeg.wasm", "Convert clips to GIFs."),
            ("GIF Maker from images", "gif.js", "Create animated GIFs."),
            ("Audio Trimmer", "Web Audio API", "Trim audio files."),
            ("Audio Format Converter", "ffmpeg.wasm", "Convert WAV/MP3/OGG/FLAC."),
            ("Voice Recorder", "MediaRecorder API", "Record audio in the browser."),
            ("Screen Recorder", "getDisplayMedia API", "Record screen + audio."),
            ("Webcam Recorder", "MediaRecorder API", "Record webcam to file."),
            ("Audio Pitch / Speed Changer", "Web Audio API", "Change pitch or speed independently."),
            ("Audio Visualizer", "Web Audio API + Canvas", "Visualize audio frequency spectrum."),
            ("Subtitle (SRT/VTT) Editor", "Pure JS", "Edit subtitle files."),
            ("Subtitle Translator", "NLLB via Transformers.js", "Translate subtitles offline."),
            ("Video Caption Burner", "ffmpeg.wasm", "Burn subtitles into video."),
            ("Audiogram Generator", "Canvas + ffmpeg.wasm", "Make video clips from audio."),
            ("Podcast Show Notes Generator", "Whisper + summarizer", "Auto-generate show notes."),
        ],
    ),
    (
        "Math, Science, and Converters",
        "Calculators and converters for everyday and technical use.",
        [
            ("Unit Converter", "Pure JS", "Length, weight, temperature, and more."),
            ("Currency Converter (offline rates)", "Cached JSON", "Convert with daily-cached rates."),
            ("Time Zone Converter", "luxon", "Convert times across zones."),
            ("Date Difference Calculator", "date-fns", "Days, months, years between dates."),
            ("Percentage Calculator", "Pure JS", "Multi-purpose percentage tool."),
            ("Loan / EMI Calculator", "Pure JS", "Calculate monthly loan payments."),
            ("Mortgage Amortization", "Pure JS", "Full amortization schedule."),
            ("Tip Calculator", "Pure JS", "Quick tip and split calculator."),
            ("Tax Calculator (per country)", "Pure JS", "Income tax estimator."),
            ("BMI / Body Fat Calculator", "Pure JS", "Calculate body metrics."),
            ("Calorie Calculator", "Pure JS", "Daily calorie needs (TDEE)."),
            ("Pregnancy Due Date Calculator", "Pure JS", "Estimate due dates."),
            ("Ovulation Calculator", "Pure JS", "Predict fertile windows."),
            ("GPA Calculator", "Pure JS", "Calculate GPA across grading systems."),
            ("Scientific Calculator", "mathjs", "Full scientific calculator."),
            ("Graphing Calculator", "mathjs + recharts", "Plot equations visually."),
            ("Equation Solver", "mathjs", "Solve algebraic equations."),
            ("Matrix Calculator", "mathjs", "Matrix operations."),
            ("Statistical Calculator", "simple-statistics", "Mean, median, stdev, regression."),
            ("Roman Numeral Converter", "Pure JS", "Convert to/from Roman numerals."),
            ("Binary / Hex / Octal Converter", "Pure JS", "Number base converter."),
            ("Compound Interest Calculator", "Pure JS", "Plot compound growth."),
            ("Retirement Calculator", "Pure JS", "Plan retirement savings."),
            ("Investment Return Calculator", "Pure JS", "Calculate ROI and IRR."),
            ("Net Worth Calculator", "Pure JS", "Track assets minus liabilities."),
            ("Salary to Hourly Converter", "Pure JS", "Convert salary types."),
        ],
    ),
    (
        "Privacy and Security Tools",
        "Built around the browser's SubtleCrypto API.",
        [
            ("Strong Password Generator", "Pure JS", "Customizable secure passwords."),
            ("Diceware Passphrase Generator", "Pure JS + word list", "Memorable passphrases."),
            ("Password Strength Checker", "zxcvbn", "Estimate crack time."),
            ("Pwned Password Checker", "SubtleCrypto + k-anonymity", "Check breach lists offline."),
            ("Encrypt / Decrypt Text & Files", "SubtleCrypto AES-GCM", "Strong encryption locally."),
            ("File Integrity Checker", "SubtleCrypto", "Verify SHA-256 hashes."),
            ("Secret Sharing (Shamir's)", "secrets.js-grempe", "Split secrets into shares."),
            ("Steganography (hide text in image)", "Canvas API", "Hide messages in images."),
            ("PDF Redactor", "pdf-lib", "Permanently redact PDF content."),
            ("Image Metadata Stripper", "exifr", "Remove EXIF/GPS data."),
            ("PDF Metadata Stripper", "pdf-lib", "Strip metadata from PDFs."),
            ("URL Safety Tester", "Regex + tldts", "Pattern-based URL safety check."),
            ("Phishing URL Checker", "Regex heuristics", "Detect phishing patterns."),
            ("Crypto Wallet Address Validator", "bitcoin-address-validation, web3-utils", "Validate BTC/ETH addresses."),
            ("BIP39 Mnemonic Generator (educational)", "bip39", "Generate seed phrases."),
            ("ETH / BTC Address Generator (offline)", "ethers, bitcoinjs-lib", "Educational wallet generator."),
        ],
    ),
    (
        "Design and Creative Tools",
        "Visual builders and generators powered by Canvas and Fabric.js.",
        [
            ("Color Palette Generator", "chroma-js", "Generate harmonious palettes."),
            ("Color Contrast Checker (WCAG)", "chroma-js", "Test for AA/AAA compliance."),
            ("Color Blindness Simulator", "Canvas matrix filters", "Simulate color vision types."),
            ("Gradient Generator", "Pure JS", "Build CSS and SVG gradients."),
            ("Pattern / Background Generator", "SVG / Canvas", "Generate seamless patterns."),
            ("Logo Maker (text + icon)", "fabric.js", "Build simple text logos."),
            ("Wallpaper Generator", "Canvas", "Make device wallpapers."),
            ("Mockup Generator", "Canvas", "Place screenshots in device frames."),
            ("Social Media Post Designer", "fabric.js", "Design posts visually."),
            ("Business Card Designer", "fabric.js + pdf-lib", "Export print-ready PDFs."),
            ("Presentation Maker (slides)", "reveal.js", "Build HTML slide decks."),
            ("Font Pair Generator", "Google Fonts (free)", "Suggest matching font pairs."),
            ("Icon Generator (SVG → multi format)", "Canvas", "Export icons in many sizes."),
            ("ASCII Banner Generator", "figlet", "Generate large ASCII text."),
            ("Pixel Art Editor", "Canvas", "Tile-based pixel editor."),
            ("Vector Editor (mini Figma)", "fabric.js", "Lightweight vector editor."),
            ("Voxel Builder", "three.js", "Build 3D voxel scenes."),
            ("Particle Effect Playground", "three.js", "Visual particle simulator."),
        ],
    ),
    (
        "Health, Fitness, and Lifestyle",
        "Personal trackers stored locally via IndexedDB.",
        [
            ("Calorie / Macro Tracker", "idb-keyval", "Daily nutrition tracker."),
            ("Water Intake Tracker", "idb-keyval", "Hydration logger."),
            ("Period / Cycle Tracker", "idb-keyval", "Menstrual cycle tracking."),
            ("Workout Timer (Tabata/HIIT)", "Pure JS", "Interval workout timer."),
            ("Sleep Calculator", "Pure JS", "Sleep cycle bedtime calculator."),
            ("Habit Tracker", "idb-keyval", "Track daily habits and streaks."),
            ("Meditation Timer", "Pure JS + sounds", "Mindfulness timer with bells."),
            ("White Noise / Rain Sounds", "Web Audio API", "Generate ambient sounds."),
            ("Recipe Scaler", "Pure JS", "Scale recipes up or down."),
            ("Cooking Timer", "Pure JS", "Multi-step cooking timer."),
            ("1RM Calculator", "Pure JS", "Estimate one-rep max."),
            ("Pace Calculator (running)", "Pure JS", "Pace, time, distance triangles."),
            ("Marathon Training Plan Generator", "Pure JS", "Custom training plans."),
            ("Cycling Power Calculator", "Pure JS", "Estimate watts and FTP."),
            ("Yoga Pose Reference", "Static images + UI", "Browse poses by category."),
            ("Habit Streak Tracker", "idb-keyval", "Visualize streaks."),
            ("Mood Journal", "idb-keyval", "Daily mood logging."),
            ("Gratitude Journal", "idb-keyval", "Daily gratitude entries."),
            ("Dream Journal", "idb-keyval", "Log dreams privately."),
            ("Symptom Tracker", "idb-keyval", "Track recurring symptoms."),
        ],
    ),
    (
        "Education and Language",
        "Tools for students, teachers, and language learners.",
        [
            ("Flashcards (spaced repetition)", "idb-keyval", "Custom flashcard decks."),
            ("Flashcard Maker (Anki export)", "genanki-js", "Export decks to Anki."),
            ("Typing Speed Test", "Pure JS", "WPM with accuracy tracking."),
            ("Speed Reading Trainer", "Pure JS", "RSVP-style trainer."),
            ("Pronunciation Checker", "Web Speech API", "Compare pronunciation."),
            ("Vocabulary Quiz", "idb-keyval + word lists", "Custom quiz builder."),
            ("Math Quiz Generator", "Pure JS", "Auto-generate math problems."),
            ("Periodic Table Explorer", "Static data", "Interactive element table."),
            ("Quiz / Test Maker (PDF)", "pdf-lib", "Build printable quizzes."),
            ("Worksheet Generator", "pdf-lib", "Auto-generate worksheets."),
            ("Multiple Choice Grader", "tesseract.js", "Scan and grade bubble sheets."),
            ("Random Student Picker", "Pure JS", "Fair random selection."),
            ("Class Seating Chart", "react-grid-layout", "Drag-and-drop seating."),
            ("Lesson Plan Template", "Pure JS + PDF export", "Reusable plan templates."),
            ("Permission Slip Generator", "pdf-lib", "Auto-fill permission forms."),
            ("Certificate Generator", "pdf-lib + Canvas", "Award certificates."),
            ("Attendance Tracker", "idb-keyval", "Offline attendance records."),
            ("Reading Level Analyzer", "Pure JS", "Flesch-Kincaid analysis."),
            ("Citation Generator (APA/MLA/Chicago)", "Pure JS templates", "Create academic citations."),
            ("Bibliography Builder", "Pure JS", "Manage references."),
        ],
    ),
    (
        "Family, Parents, and Kids",
        "Tools for everyday family use.",
        [
            ("Baby Name Generator", "Static data", "Browse names by origin/meaning."),
            ("Pregnancy Tracker", "idb-keyval", "Week-by-week tracker."),
            ("Feeding / Diaper Logger", "idb-keyval", "Newborn tracker."),
            ("Chore Chart Maker (PDF)", "pdf-lib", "Printable chore charts."),
            ("Allowance Calculator", "Pure JS", "Track kids' allowance."),
            ("Kids Coloring Book Generator", "Canvas + edge detection", "Convert photos to coloring pages."),
            ("Maze Generator", "Pure JS", "Random mazes for printing."),
            ("Connect-the-Dots Maker", "Canvas", "Make custom dot puzzles."),
            ("Handwriting Worksheet Maker", "pdf-lib", "Custom tracing sheets."),
        ],
    ),
    (
        "Hobbies and Crafts",
        "Tools for makers and hobbyists.",
        [
            ("Knitting Pattern Maker", "Canvas grid", "Design knitting patterns."),
            ("Cross-Stitch Pattern from Photo", "Canvas + color quantization", "Photo to stitch pattern."),
            ("Beading Pattern Generator", "Canvas", "Design bead patterns."),
            ("Crochet Stitch Counter", "Pure JS", "Track crochet rounds."),
            ("Origami Folding Diagrams", "Static data + viewer", "Step-by-step diagrams."),
            ("Recipe Card Maker (PDF)", "pdf-lib", "Printable recipe cards."),
            ("Cookbook Builder", "pdf-lib", "Compile recipes into a PDF cookbook."),
            ("Cocktail Recipe Generator", "Static data", "Random cocktail picker."),
            ("Wine Pairing Helper", "Static data", "Pair wines with meals."),
            ("Garden Planner", "Drag UI + idb-keyval", "Plan garden beds."),
            ("Plant Care Tracker", "idb-keyval", "Watering and care reminders."),
        ],
    ),
    (
        "Sports and Games (Browser-Native)",
        "Quick-build games and trackers.",
        [
            ("Dart Score Tracker", "Pure JS", "Live dart scoring."),
            ("Bowling Score Calculator", "Pure JS", "Standard bowling scoring."),
            ("Golf Handicap Calculator", "Pure JS", "Track handicaps."),
            ("Fantasy League Draft Board", "@dnd-kit/core", "Live drag-and-drop draft."),
            ("Bracket Maker", "Custom UI + share link", "Tournament bracket builder."),
            ("2048", "Pure JS", "Classic puzzle game."),
            ("Wordle clone", "Pure JS", "Daily word puzzle."),
            ("Sudoku", "sudoku-gen", "Generate and solve puzzles."),
            ("Crossword", "crossword-builder", "Custom crossword puzzles."),
            ("Tic-Tac-Toe (with AI)", "Pure JS minimax", "Unbeatable AI."),
            ("Connect 4 (with AI)", "Pure JS minimax", "Smart Connect 4 opponent."),
            ("Snake", "Canvas", "Classic snake game."),
            ("Tetris", "Canvas", "Classic block puzzle."),
            ("Memory Match", "Pure JS", "Card matching game."),
            ("Hangman", "Pure JS", "Word guessing."),
            ("Typing Race", "Pure JS", "Multiplayer-style typing test."),
            ("Reaction Time Tester", "Pure JS", "Measure reflexes."),
            ("Aim Trainer", "Canvas", "FPS-style aim practice."),
            ("Pong / Breakout", "Canvas", "Classic arcade games."),
            ("Minesweeper", "Pure JS", "Classic minesweeper."),
            ("Solitaire", "Pure JS", "Klondike solitaire."),
            ("Chess (with Stockfish)", "stockfish.js (WASM)", "Strong chess engine."),
        ],
    ),
    (
        "Music and DJ Tools",
        "Powered by the Web Audio API and Tone.js.",
        [
            ("Online Metronome", "Web Audio API", "Tap or set BPM."),
            ("Tuner (chromatic, instrument)", "Web Audio API + FFT", "Pitch-detect via mic."),
            ("Drum Machine", "Tone.js", "Step sequencer."),
            ("Synth / Keyboard", "Tone.js", "Play synth in browser."),
            ("Loop Pedal", "Web Audio API", "Layer audio loops live."),
            ("Audio Crossfader", "Web Audio API", "DJ-style crossfade."),
            ("BPM Tap Counter", "Pure JS", "Tap to find BPM."),
            ("Chord Finder", "Music theory data", "Identify chords."),
            ("Scale / Mode Visualizer", "Pure JS", "Visualize scales on instruments."),
            ("Guitar Chord Library", "Static data", "Searchable chord shapes."),
            ("Piano Chord Library", "Static data", "Piano voicings."),
            ("Ear Training Trainer", "Tone.js", "Interval and chord ear training."),
            ("MIDI Keyboard Tester", "Web MIDI API", "Test MIDI controllers."),
            ("Audio File Visualizer", "Web Audio API + Canvas", "Visualize uploaded tracks."),
        ],
    ),
    (
        "3D, AR, and Creative Coding",
        "Powered by three.js and MediaPipe.",
        [
            ("3D Model Viewer", "three.js + react-three-fiber", "View GLB/GLTF/OBJ/STL files."),
            ("3D Model Format Converter", "three.js exporters", "Convert between formats."),
            ("STL Repair / Slicer Preview", "three.js", "Inspect 3D-printable models."),
            ("AR QR Try-On", "mind-ar-js", "WebXR-style AR."),
            ("Face Filter Studio", "MediaPipe + three.js", "Snapchat-style filters."),
            ("360 Photo Viewer", "pannellum", "View panoramic photos."),
            ("Spritesheet Animator", "Canvas", "Preview sprite animations."),
            ("Sign Language Avatar Demo", "MediaPipe + three.js", "3D sign language preview."),
        ],
    ),
    (
        "Web, Social, and Content Creators",
        "Tools for creators publishing across platforms.",
        [
            ("Social Media Post Resizer", "Canvas", "Multi-platform export."),
            ("Aspect Ratio Cropper for Instagram/TikTok", "Canvas", "Crop for mobile-first formats."),
            ("Carousel / Slideshow Maker", "Canvas", "Build photo carousels."),
            ("Twitter Thread Splitter", "Pure JS", "Split long text into threads."),
            ("Hashtag Generator (offline rules)", "Static lists", "Suggest hashtags by topic."),
            ("Link in Bio Page Builder", "idb-keyval", "Build a one-page link site."),
            ("YouTube Thumbnail Maker", "fabric.js", "Design clickable thumbnails."),
            ("Twitch / YouTube Overlay Maker", "fabric.js", "Design stream overlays."),
            ("Email Signature Generator", "Pure JS", "Build HTML email signatures."),
            ("Coupon Code Generator", "nanoid", "Generate unique coupon codes."),
        ],
    ),
    (
        "Productivity and Writing",
        "Boost output with offline-first writing and planning tools.",
        [
            ("Markdown Editor (live preview)", "marked + dompurify", "Safe markdown editor."),
            ("Notepad with autosave", "idb-keyval", "Distraction-free notepad."),
            ("Pomodoro Timer", "Pure JS", "Work/break cycles."),
            ("To-do list (offline, PWA)", "idb-keyval", "Installable to-do app."),
            ("Sticky Notes board", "react-grid-layout", "Drag-and-drop notes."),
            ("Mind Map maker", "reactflow", "Visual mind mapping."),
            ("Whiteboard / Drawing board", "excalidraw", "Sketch ideas freely."),
            ("Resume Builder (PDF export)", "react-pdf / pdf-lib", "Export polished resumes."),
            ("Cover Letter Generator", "Pure JS templates", "Customizable cover letters."),
            ("Lorem Ipsum Generator", "Pure JS", "Filler text generator."),
            ("Text Case Converter", "Pure JS", "UPPER/lower/Title/Sentence case."),
            ("Reading Time Estimator", "Pure JS", "Calculate read time."),
        ],
    ),
    (
        "Business and Marketing",
        "Tools for solopreneurs and small businesses.",
        [
            ("QR Code Generator (with logo)", "qrcode", "Branded QR codes."),
            ("Barcode Generator", "jsbarcode", "Multiple barcode formats."),
            ("Receipt Generator", "pdf-lib", "Printable receipts."),
            ("Invoice Generator", "pdf-lib", "Branded PDF invoices."),
            ("Quote / Estimate Generator", "pdf-lib", "Customer quotes."),
            ("Signature Pad (with PDF embed)", "signature_pad", "Sign and embed in PDFs."),
            ("Personal CRM (offline)", "idb-keyval", "Track contacts privately."),
            ("Expense Tracker (CSV import)", "papaparse + chart", "Visualize spending."),
            ("Subscription Tracker", "idb-keyval", "Track recurring subscriptions."),
        ],
    ),
    (
        "Data and CSV Power Tools",
        "Operate on data without uploading to a server.",
        [
            ("CSV to JSON / JSON to CSV", "papaparse", "Bidirectional conversion."),
            ("CSV Splitter", "papaparse", "Split by rows or column value."),
            ("CSV Merger", "papaparse", "Combine many CSVs."),
            ("CSV Deduplicator", "papaparse", "Remove duplicate rows."),
            ("CSV Column Renamer / Reorderer", "papaparse", "Rearrange columns."),
            ("CSV to SQL Insert Generator", "papaparse + templates", "Create SQL inserts."),
            ("Excel to JSON", "xlsx", "Convert spreadsheets."),
            ("Data Visualizer (drag CSV → chart)", "recharts + papaparse", "Build charts from CSV."),
            ("Pivot Table Builder", "pivottable", "Drag-and-drop pivot tables."),
            ("Spreadsheet Editor", "handsontable (CE)", "Excel-style editing."),
        ],
    ),
    (
        "Accessibility Tools",
        "Make the web more inclusive.",
        [
            ("Color Contrast Checker (WCAG AA/AAA)", "chroma-js", "Verify accessible color pairs."),
            ("Color Blindness Simulator", "Canvas matrix filters", "Simulate vision types."),
            ("Dyslexia-Friendly Reader", "Pure CSS + custom font", "Reformat text for dyslexia."),
            ("Screen Reader Simulator", "Web Speech API", "Hear how a page is read aloud."),
            ("Image Alt Text Generator", "BLIP via Transformers.js", "Generate accessible alt text."),
            ("Captions Generator from audio", "Whisper.js", "Auto-caption videos offline."),
            ("Reading Ruler / Focus Mode", "Pure JS overlay", "Reduce visual distractions."),
        ],
    ),
    (
        "Geo, Mapping, and Travel",
        "Powered by Leaflet, Turf.js, and proj4.",
        [
            ("GPX / KML Viewer", "leaflet + togeojson", "View GPS tracks."),
            ("Route Distance Calculator", "leaflet + turf.js", "Measure routes on a map."),
            ("Area Calculator (drag polygons)", "leaflet-draw + turf.js", "Calculate map areas."),
            ("Coordinates Converter", "proj4", "Convert lat/long ↔ DMS ↔ UTM."),
            ("Time Zone Map", "leaflet + tz data", "Pick timezone visually."),
            ("World Clock with Map", "leaflet + luxon", "Visual world clock."),
            ("Trip Cost Calculator", "Pure JS", "Estimate travel cost."),
            ("Fuel Cost Calculator", "Pure JS", "Cost of a road trip."),
            ("Country Info Explorer", "REST Countries data", "Static country dataset."),
            ("Flight Time Calculator", "Pure JS", "Estimate flight times."),
        ],
    ),
    (
        "Tiny but Addictive Utilities",
        "Quick wins with strong evergreen demand.",
        [
            ("Stopwatch", "Pure JS", "Lap stopwatch."),
            ("Countdown Timer", "Pure JS", "Set custom countdowns."),
            ("World Clock", "luxon", "Multi-zone clock."),
            ("Calendar / Schedule Generator", "date-fns", "Printable calendars."),
            ("Event Countdown / Birthday Counter", "Pure JS", "Live countdowns."),
            ("Tip Splitter", "Pure JS", "Split tips fairly."),
            ("Random Number Generator", "Pure JS", "Customizable RNG."),
            ("Random Decision Wheel", "Canvas", "Spin to decide."),
            ("Coin Flipper / Dice Roller", "Canvas", "Animated randomizers."),
            ("Yes / No Picker", "Pure JS", "Quick decisions."),
            ("Magic 8-Ball", "Pure JS", "Classic novelty."),
            ("Random Quote Generator", "Static data", "Daily quotes."),
            ("Random Joke Generator", "Static data", "Clean joke generator."),
            ("Truth or Dare Generator", "Static data", "Party game prompts."),
            ("Would You Rather Generator", "Static data", "Conversation starter."),
            ("Movie Recommender", "Static dataset", "Filter recommendations."),
            ("Book Recommender", "Static dataset", "Browse and filter books."),
            ("Wheel of Names / Random Picker", "Canvas API", "Spinner for raffles."),
            ("Personality Quiz Maker", "Pure JS", "Build BuzzFeed-style quizzes."),
            ("Tier List Maker", "@dnd-kit/core", "Drag-and-drop tier lists."),
            ("Bingo Card Generator", "Pure JS", "Print bingo cards."),
            ("Jeopardy Board Maker", "Pure JS", "Custom trivia boards."),
            ("Word Search Generator", "Pure JS", "Print word search puzzles."),
            ("Compatibility / Love Calculator (joke)", "Pure JS", "Fun novelty tool."),
        ],
    ),
]


# ---------------------------------------------------------------------------
# PDF generation
# ---------------------------------------------------------------------------

def build_pdf() -> None:
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Free In-Browser Tool Ideas",
        author="v0",
    )

    base = getSampleStyleSheet()

    title_style = ParagraphStyle(
        name="DocTitle",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=30,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6,
        alignment=TA_LEFT,
    )
    subtitle_style = ParagraphStyle(
        name="DocSubtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#475569"),
        spaceAfter=18,
    )
    section_style = ParagraphStyle(
        name="Section",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=18,
        spaceAfter=2,
    )
    section_caption_style = ParagraphStyle(
        name="SectionCaption",
        parent=base["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=8,
    )
    intro_heading_style = ParagraphStyle(
        name="IntroHead",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=10,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        name="Body",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6,
    )
    cell_tool_style = ParagraphStyle(
        name="CellTool",
        parent=base["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
    )
    cell_lib_style = ParagraphStyle(
        name="CellLib",
        parent=base["BodyText"],
        fontName="Courier",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0369a1"),
    )
    cell_desc_style = ParagraphStyle(
        name="CellDesc",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )

    story: list = []

    # ---- Cover / intro --------------------------------------------------
    total_tools = sum(len(items) for _, _, items in CATEGORIES)
    story.append(Paragraph("Free In-Browser Tool Ideas", title_style))
    story.append(
        Paragraph(
            f"A complete catalog of {total_tools} tool ideas across "
            f"{len(CATEGORIES)} categories — every one of them buildable with "
            "open-source libraries that run entirely in the user's browser. "
            "No paid APIs, no server costs, no per-use fees.",
            subtitle_style,
        )
    )

    story.append(Paragraph("Why these tools are free forever", intro_heading_style))
    story.append(
        Paragraph(
            "Every tool below uses one of three free patterns: pure browser APIs "
            "(Canvas, Web Audio, SubtleCrypto, MediaRecorder), open-source WASM "
            "libraries (ffmpeg.wasm, pdf-lib, tesseract.js), or open AI models "
            "running on-device via Transformers.js, ONNX Runtime, TensorFlow.js, "
            "or WebLLM. Files never leave the user's device, which means zero "
            "infrastructure cost no matter how many people use the tools — and "
            "a strong privacy story you can advertise.",
            body_style,
        )
    )

    story.append(Paragraph("How to read this catalog", intro_heading_style))
    story.append(
        Paragraph(
            "Each row shows the tool name, the open-source library or browser API "
            "you would use to build it, and a short description of what it does. "
            "Categories are roughly ordered from highest commercial intent to most "
            "creative/niche.",
            body_style,
        )
    )
    story.append(
        Paragraph(
            f"Generated on {date.today().isoformat()} for your project.",
            section_caption_style,
        )
    )

    story.append(PageBreak())

    # ---- Table of Contents ---------------------------------------------
    story.append(Paragraph("Categories", section_style))
    story.append(Spacer(1, 6))
    toc_rows = [["#", "Category", "Tools"]]
    for i, (cat_name, _, items) in enumerate(CATEGORIES, start=1):
        toc_rows.append([str(i), cat_name, str(len(items))])

    toc_table = Table(toc_rows, colWidths=[12 * mm, 130 * mm, 25 * mm])
    toc_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 8),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 10),
                ("ALIGN", (0, 0), (0, -1), "CENTER"),
                ("ALIGN", (2, 0), (2, -1), "CENTER"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#0f172a")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 1), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
            ]
        )
    )
    story.append(toc_table)
    story.append(PageBreak())

    # ---- Each category --------------------------------------------------
    for idx, (cat_name, caption, items) in enumerate(CATEGORIES, start=1):
        story.append(Paragraph(f"{idx}. {cat_name}", section_style))
        story.append(Paragraph(caption, section_caption_style))

        rows = [["Tool", "Library / API", "Description"]]
        for tool, lib, desc in items:
            rows.append(
                [
                    Paragraph(tool, cell_tool_style),
                    Paragraph(lib, cell_lib_style),
                    Paragraph(desc, cell_desc_style),
                ]
            )

        table = Table(
            rows,
            colWidths=[55 * mm, 50 * mm, 70 * mm],
            repeatRows=1,
        )
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("ALIGN", (0, 0), (-1, 0), "LEFT"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
                    ("TOPPADDING", (0, 0), (-1, 0), 7),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ("VALIGN", (0, 1), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 7),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                    ("TOPPADDING", (0, 1), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
                    ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.HexColor("#0f172a")),
                    ("LINEBELOW", (0, 1), (-1, -2), 0.25, colors.HexColor("#e2e8f0")),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 10))

    # ---- Closing page --------------------------------------------------
    story.append(PageBreak())
    story.append(Paragraph("Recommended Build Order", section_style))
    story.append(
        Paragraph(
            "If you want fast SEO wins with the same in-browser pattern as your "
            "background remover, this is a strong order to ship in:",
            body_style,
        )
    )
    plan = [
        "1. PDF Merger (pdf-lib) — millions of monthly searches.",
        "2. Image Compressor (browser-image-compression) — high demand, ~30 min build.",
        "3. HEIC to JPG (heic2any) — iPhone users always need this.",
        "4. OCR Image to Text (tesseract.js) — strong evergreen traffic.",
        "5. Word Counter (Pure JS) — ranks on long-tail in days.",
        "6. QR Code Generator (qrcode) — evergreen and fast to build.",
        "7. JSON Formatter (built-in) — developer tools rank fast.",
        "8. Video to GIF (ffmpeg.wasm) — viral potential.",
        "9. Image Upscaler (UpscalerJS) — pairs naturally with the bg remover.",
        "10. PDF to Image / Image to PDF (pdfjs-dist + jspdf) — quick double launch.",
    ]
    for item in plan:
        story.append(Paragraph(item, body_style))

    story.append(Spacer(1, 20))
    story.append(
        Paragraph(
            "Tip: every tool listed in this PDF can reuse the same template you "
            "built for the background remover — drag-and-drop upload, lazy-loaded "
            "library, in-browser processing, side-by-side preview, one-click "
            "download. Once you have one running, the next ten ship much faster.",
            body_style,
        )
    )

    doc.build(story)
    print(f"[v0] PDF written to {OUTPUT_PATH}")
    print(f"[v0] Total tools: {total_tools} across {len(CATEGORIES)} categories")


if __name__ == "__main__":
    build_pdf()
