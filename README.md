# Phone Directory — Full Contact Management Web App

A complete, client-side **phone/contact directory web app** backed by a Google Sheet. Browse and search contacts, and add new entries through a web form that writes back to the sheet — all without a server of your own.

## What it does

- **Directory view** (`index.html`): searchable contact grid (name/role), loading spinner, paginated card layout, light professional styling with Lucide icons
- **Add-entry form** (`add.html` + `form-handler.js`): submit new contacts (name, role, phone, WhatsApp, email, Instagram, Threads, address) — POSTs to a Google Apps Script web app that appends a row to the sheet
- **Data loading** (`directory-script.js`): fetches contacts via the Google Sheets API v4, with CSV-export URLs as fallback, plus built-in sample contacts when offline
- **Sheet test page** (`test-sheet.html`): quick connectivity test for your Sheets API key + sheet
- **Apps Script backend** (`Code.gs`): `doPost(e)` appends form submissions as new rows (with timestamp); `setupSheet()` initializes headers; `testDoPost()` for verification

## Tech stack

- Multi-file HTML5 + CSS3 + vanilla JavaScript (no build step)
- [Lucide icons](https://cdnjs.cloudflare.com/ajax/libs/lucide/0.263.1/lucide.min.css), [Inter](https://fonts.google.com/specimen/Inter) font
- [Google Sheets API v4](https://developers.google.com/sheets/api) (read) + [Google Apps Script](https://www.google.com/script/start/) ContentService (write)
- No login, no backend of your own, no npm dependencies

## Data & privacy note

- The repo contains **no real contact data** — sample entries in the code are placeholders (`+1234567890`, "Test User"), and live data lives in an external Google Sheet, not in this repository. No personal data of real people is stored or reproduced here.
- The repo embeds a Google Sheets **read-only** API key in `directory-script.js` and `test-sheet.html`. If you fork, replace it (and `SHEET_ID`) with your own restricted key.

## Quick start

Serve the folder (some fetches need HTTP, not `file://`):

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

1. **Read contacts** — open `index.html`; edit `SHEET_ID` / `API_KEY` at the top of `directory-script.js` to point at your own sheet (headers: Timestamp, Name, Role, ContactNo, WhatsApp, Email, Instagram, Threads, Address).
2. **Test the sheet connection** — open `test-sheet.html` and confirm data loads.
3. **Enable the add form**:
   - Copy `Code.gs` into a new [Google Apps Script](https://script.google.com) project, run `setupSheet()` once, then Deploy → Web app → "Anyone" → copy the `/exec` URL.
   - Paste that URL into `SCRIPT_URL` at the top of `form-handler.js`.
   - Open `add.html` to submit new contacts.

## Project structure

```
.
├── index.html            # directory view (search grid)
├── add.html              # add-contact form
├── test-sheet.html       # Sheets API connectivity test
├── directory-script.js   # data loading (Sheets API + CSV fallback + samples)
├── form-handler.js       # form validation + POST to Apps Script
├── Code.gs               # Apps Script: doPost appends rows to the sheet
├── styles.css            # app styling
├── shahu palece.jpg      # local asset image
└── README.md
```

## Deployment

Fully static on the web side — deployed to **GitHub Pages**: https://girishlade111.github.io/Phone-Directory-/

The write path depends on a **Google Apps Script web app** (see Quick start step 3) — that part is external to GitHub Pages and optional; read/search works without it.

---

Built by Girish Lade — https://ladestack.in
