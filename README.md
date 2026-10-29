# Priyanshu Bhatta - Developer Portfolio & Netlify Client Database

This portfolio is structured for both local editing in **VS Code** and instant hosting on **Netlify** (`netlify.app`).

## Project Files
- `index.html`: Main landing page featuring 1st-Year CSE (AI/ML) status, Education (at the top), Projects, Skills, Hackathons, Certifications, and Netlify Forms contact section.
- `form.html`: Standalone Client & Recruiter Inquiry Form configured for Netlify Forms database ingestion.
- `database.js`: Client-side database utility (IndexedDB & LocalStorage fallback).
- `style.css`: Clean glassmorphism styling and custom scrollbars.
- `script.js`: Interactive filter buttons, architecture modals, ATS CV preview, and PDF download engine.
- `Priyanshu_Bhatta_CV.pdf`: Official 2-page ATS Curriculum Vitae.

## Hosting on Netlify (netlify.app)
1. Push this folder to a GitHub repository or drag-and-drop into the Netlify Dashboard.
2. Netlify will automatically detect `data-netlify="true"` in `index.html` and `form.html`.
3. Client submissions will appear in real-time under your Netlify Site Dashboard > **Forms** tab!
