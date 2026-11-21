# Priyanshu Bhatta - Developer Portfolio & Netlify Client Database

This portfolio is structured for both local editing in **VS Code** and instant hosting on **Netlify** (`netlify.app`).

## Project Files
- `index.html`: Main landing page featuring 1st-Year CSE (AI/ML & Cloud) status, Education, Skills, Projects, Hackathons, dynamically rendered Verified Certifications (11 Google Cloud Skill Badges + Google AI Essentials Specialization + ISRO/IICT fellowships), interactive ATS Resume switcher, and Netlify Forms + `PortfolioDB` contact section.
- `database.js`: Client-side database utility (`PortfolioDB`, IndexedDB v3 + LocalStorage fallback) storing both verified certifications (with badge images, Credly/Coursera verification URLs, and certificate PDFs) and client/recruiter submissions.
- `script.js`: Interactive skills matrix, project & credential category filters, dynamic certification card renderer, spotlight/3D tilt effects, neural canvas background, and role-focused resume switcher.
- `style.css`: Obsidian glassmorphism stylesheet with animated Google Cloud, Coursera, and National Fellowship borders and strict mobile-safe responsive layouts.
- `resume.html`: Printable A4 ATS Curriculum Vitae with live role focus selector.
- `form.html`: Standalone Client & Recruiter Inquiry Form configured for Netlify Forms database ingestion.
- `assets/badges/`: Official Google Cloud & Credly PNG skill badge emblems.
- `assets/certificates/`: Official Coursera & Google Cloud PDF certificates.
- `Priyanshu_Bhatta_CV.pdf` & `Priyanshu_Bhatta_Resume.pdf`: Official PDF resumes.

## Hosting on Netlify (netlify.app)
1. Push this folder to a GitHub repository or drag-and-drop into the Netlify Dashboard.
2. Netlify will automatically detect `data-netlify="true"` in `index.html` and `form.html`.
3. Client submissions appear in real time under your Netlify Site Dashboard > **Forms** tab and locally inside the **Inspect PortfolioDB** modal.
