/**
 * CSV to JSON Converter for Business License Data
 *
 * Usage:
 *   node scripts/csv-to-json.js path/to/your-data.csv
 *
 * Expected CSV columns (match the Google Sheets headers exactly):
 *   state, state_abbreviation, state_slug, business_type, business_type_slug,
 *   license_name, issuing_agency, agency_website, application_url,
 *   application_fee, renewal_fee, renewal_period, required_documents,
 *   prerequisites, processing_time, steps_to_apply, notes, last_verified
 *
 * Notes:
 *   - required_documents and prerequisites: separate multiple items with a pipe | character
 *   - steps_to_apply: separate steps with a pipe | character
 *   - The script merges data into existing state JSON files (non-destructive)
 *   - Run from the project root: node scripts/csv-to-json.js data.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LICENSES_DIR = path.join(__dirname, '..', 'src', 'data', 'licenses');

// ── Minimal CSV parser (handles quoted fields with commas inside) ──────────────
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Split pipe-delimited fields into arrays ────────────────────────────────────
function splitPipe(str) {
  if (!str) return [];
  return str.split('|').map((s) => s.trim()).filter(Boolean);
}

// ── Main ───────────────────────────────────────────────────────────────────────
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/csv-to-json.js path/to/data.csv');
  process.exit(1);
}

const csvText = fs.readFileSync(path.resolve(csvPath), 'utf-8');
const rows = parseCSV(csvText);

// Group rows by state_slug
const byState = {};
for (const row of rows) {
  const slug = row.state_slug || row.state?.toLowerCase().replace(/\s+/g, '-');
  if (!slug) { console.warn('Skipping row with no state slug:', row); continue; }
  if (!byState[slug]) byState[slug] = [];
  byState[slug].push(row);
}

let created = 0;
let updated = 0;
let skipped = 0;

for (const [stateSlug, stateRows] of Object.entries(byState)) {
  const filePath = path.join(LICENSES_DIR, `${stateSlug}.json`);

  // Load existing file or scaffold a new one
  let existing;
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } else {
    const firstRow = stateRows[0];
    existing = {
      state: firstRow.state,
      stateSlug,
      stateAbbreviation: firstRow.state_abbreviation,
      licenses: [],
    };
  }

  // Build a lookup of existing licenses by businessTypeSlug for deduplication
  const existingBySlug = {};
  for (const lic of existing.licenses) {
    existingBySlug[lic.businessTypeSlug] = lic;
  }

  let stateChanged = false;

  for (const row of stateRows) {
    const businessTypeSlug = row.business_type_slug || row.business_type?.toLowerCase().replace(/\s+/g, '-');
    if (!businessTypeSlug) { console.warn('Skipping row with no business_type_slug'); skipped++; continue; }

    const licenseEntry = {
      businessType: row.business_type,
      businessTypeSlug,
      licenseName: row.license_name,
      issuingAgency: row.issuing_agency,
      agencyWebsite: row.agency_website,
      officialApplicationUrl: row.application_url,
      applicationFee: row.application_fee,
      renewalFee: row.renewal_fee,
      renewalPeriod: row.renewal_period,
      requiredDocuments: splitPipe(row.required_documents),
      prerequisites: splitPipe(row.prerequisites),
      processingTimeline: row.processing_time,
      applicationProcess: splitPipe(row.steps_to_apply),
      lastVerified: row.last_verified || new Date().toISOString().split('T')[0],
      ...(row.notes ? { notes: row.notes } : {}),
    };

    if (existingBySlug[businessTypeSlug]) {
      // Update existing entry
      const idx = existing.licenses.findIndex((l) => l.businessTypeSlug === businessTypeSlug);
      existing.licenses[idx] = licenseEntry;
      console.log(`  ✏️  Updated: ${stateSlug}/${businessTypeSlug}`);
    } else {
      // Add new entry
      existing.licenses.push(licenseEntry);
      existingBySlug[businessTypeSlug] = licenseEntry;
      console.log(`  ✅ Added: ${stateSlug}/${businessTypeSlug}`);
    }
    stateChanged = true;
  }

  if (stateChanged) {
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
    if (fs.existsSync(filePath)) { updated++; } else { created++; }
    console.log(`💾 Saved: ${filePath}`);
  }
}

console.log(`\nDone! ${created} files created, ${updated} files updated, ${skipped} rows skipped.`);
console.log('Run "npm run build" to regenerate your site with the new data.');
