/**
 * BLS OEWS Data Processor — CSV VERSION
 * 
 * Reads a CSV export of the BLS data (MUCH faster than xlsx for large files).
 * 
 * HOW TO GET THE CSV:
 *   1. Open all_data_M_2024.xlsx in Excel
 *   2. File > Save As > CSV (Comma delimited) > Save as "all_data.csv"
 *   3. Put all_data.csv in this folder
 *   4. Run: node process-csv.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('====================================');
console.log('BLS Salary Data Processor (CSV)');
console.log('====================================\n');

// ============================================================
// STEP 0: Find CSV file
// ============================================================
console.log('STEP 0: Looking for CSV file...');
const allFiles = fs.readdirSync(__dirname);
const csvFiles = allFiles.filter(f => f.endsWith('.csv') && !f.includes('node_modules'));

if (csvFiles.length === 0) {
  console.error('❌ No CSV file found.');
  console.error('Open all_data_M_2024.xlsx in Excel, then File > Save As > CSV.');
  console.error('Put the .csv file in:', __dirname);
  process.exit(1);
}

const csvFile = csvFiles[0];
const fileSize = (fs.statSync(path.join(__dirname, csvFile)).size / 1024 / 1024).toFixed(1);
console.log(`✅ Found: ${csvFile} (${fileSize} MB)\n`);

// ============================================================
// STEP 1: Read and parse CSV
// ============================================================
console.log('STEP 1: Reading CSV file...');
const startTime = Date.now();

const raw = fs.readFileSync(path.join(__dirname, csvFile), 'utf-8');
const readTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`  File read in ${readTime}s`);

// Split into lines
const lines = raw.split('\n').filter(l => l.trim().length > 0);
console.log(`  Total lines: ${lines.length.toLocaleString()}`);

// Parse header
const header = parseCSVLine(lines[0]);
console.log(`  Columns: ${header.join(', ')}`);

// Parse all data rows
console.log('  Parsing rows...');
const rows = [];
let parseErrors = 0;
for (let i = 1; i < lines.length; i++) {
  try {
    const values = parseCSVLine(lines[i]);
    if (values.length === header.length) {
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        obj[header[j]] = values[j];
      }
      rows.push(obj);
    } else {
      parseErrors++;
    }
  } catch (e) {
    parseErrors++;
  }
  
  // Progress every 100k rows
  if (i % 100000 === 0) {
    console.log(`  ...parsed ${i.toLocaleString()} rows`);
  }
}

const parseTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`✅ Parsed ${rows.length.toLocaleString()} rows in ${parseTime}s (${parseErrors} errors skipped)\n`);

// Show sample
console.log('First data row:');
const sample = rows[0];
for (const [k, v] of Object.entries(sample)) {
  console.log(`  ${k}: "${v}"`);
}
console.log('');

// ============================================================
// STEP 2: Map columns
// ============================================================
console.log('STEP 2: Mapping columns...');

function findCol(candidates) {
  for (const c of candidates) {
    if (header.includes(c)) return c;
    const match = header.find(h => h.toLowerCase().trim() === c.toLowerCase());
    if (match) return match;
  }
  return null;
}

const COL = {
  areaTitle: findCol(['AREA_TITLE', 'area_title']),
  areaType: findCol(['AREA_TYPE', 'area_type']),
  naics: findCol(['NAICS', 'naics']),
  iGroup: findCol(['I_GROUP', 'i_group']),
  ownCode: findCol(['OWN_CODE', 'own_code']),
  occCode: findCol(['OCC_CODE', 'occ_code']),
  occTitle: findCol(['OCC_TITLE', 'occ_title']),
  oGroup: findCol(['O_GROUP', 'o_group']),
  totEmp: findCol(['TOT_EMP', 'tot_emp']),
  hMean: findCol(['H_MEAN', 'h_mean']),
  aMean: findCol(['A_MEAN', 'a_mean']),
  hMedian: findCol(['H_MEDIAN', 'h_median']),
  aMedian: findCol(['A_MEDIAN', 'a_median']),
  hPct10: findCol(['H_PCT10', 'h_pct10']),
  hPct25: findCol(['H_PCT25', 'h_pct25']),
  hPct75: findCol(['H_PCT75', 'h_pct75']),
  hPct90: findCol(['H_PCT90', 'h_pct90']),
  aPct10: findCol(['A_PCT10', 'a_pct10']),
  aPct25: findCol(['A_PCT25', 'a_pct25']),
  aPct75: findCol(['A_PCT75', 'a_pct75']),
  aPct90: findCol(['A_PCT90', 'a_pct90']),
  locQuotient: findCol(['LOC_QUOTIENT', 'loc_quotient']),
};

for (const [key, val] of Object.entries(COL)) {
  console.log(`  ${key}: ${val ? `✅ "${val}"` : '❌ NOT FOUND'}`);
}
console.log('');

// ============================================================
// STEP 3: Filter rows
// ============================================================
console.log('STEP 3: Filtering data...');

const STATE_MAP = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'District of Columbia': 'DC', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI',
  'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME',
  'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN',
  'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE',
  'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
  'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX',
  'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA',
  'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'Guam': 'GU', 'Puerto Rico': 'PR', 'Virgin Islands': 'VI'
};

function slugify(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/\(.*?\)/g, '').replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').trim();
}

function parseNum(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (str === '' || str === '**' || str === '#' || str === '*' || 
      str === 'N/A' || str === 'n/a' || str === '-') return null;
  const cleaned = str.replace(/,/g, '').replace(/\$/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

const MIN_EMPLOYMENT = 50000;

// First pass: filter to cross-industry, detailed occupations only
const nationalRows = [];
const stateRows = [];
let skipped = { industry: 0, group: 0, allOcc: 0, otherArea: 0 };

for (const row of rows) {
  // Only cross-industry data
  const iGroup = (row[COL.iGroup] || '').trim().toLowerCase();
  const naics = (row[COL.naics] || '').trim();
  if (iGroup && iGroup !== 'cross-industry' && naics !== '000000') {
    skipped.industry++;
    continue;
  }
  
  // Only detailed occupations
  const oGroup = (row[COL.oGroup] || '').trim().toLowerCase();
  if (oGroup !== 'detailed') { skipped.group++; continue; }
  
  // Skip "all occupations"
  const occCode = (row[COL.occCode] || '').trim();
  if (occCode.startsWith('00-')) { skipped.allOcc++; continue; }
  
  // Categorize by area type
  const areaType = (row[COL.areaType] || '').trim();
  const areaTitle = (row[COL.areaTitle] || '').trim();
  
  if (areaType === '1') {
    nationalRows.push(row);
  } else if (areaType === '2') {
    stateRows.push(row);
  } else {
    skipped.otherArea++;
  }
}

console.log(`  Skipped (industry-specific): ${skipped.industry.toLocaleString()}`);
console.log(`  Skipped (not detailed occ): ${skipped.group.toLocaleString()}`);
console.log(`  Skipped (all-occupations): ${skipped.allOcc.toLocaleString()}`);
console.log(`  Skipped (metro/other area): ${skipped.otherArea.toLocaleString()}`);
console.log(`  → National rows: ${nationalRows.length.toLocaleString()}`);
console.log(`  → State rows: ${stateRows.length.toLocaleString()}`);
console.log('');

if (stateRows.length === 0) {
  console.error('❌ No state-level data found. Something is wrong with the filtering.');
  console.error('Copy this entire output and paste it into Cursor chat for help.');
  process.exit(1);
}

// ============================================================
// STEP 4: Build national index & filter occupations
// ============================================================
console.log('STEP 4: Building national occupation index...');

const nationalOccMap = new Map();
for (const row of nationalRows) {
  const code = (row[COL.occCode] || '').trim();
  const title = (row[COL.occTitle] || '').trim();
  if (!code || !title) continue;
  
  nationalOccMap.set(code, {
    title, code, slug: slugify(title),
    totalEmployment: parseNum(row[COL.totEmp]) ? Math.round(parseNum(row[COL.totEmp])) : null,
    meanHourly: parseNum(row[COL.hMean]),
    meanAnnual: parseNum(row[COL.aMean]),
    medianHourly: parseNum(row[COL.hMedian]),
    medianAnnual: parseNum(row[COL.aMedian]),
    pct10Hourly: parseNum(row[COL.hPct10]),
    pct25Hourly: parseNum(row[COL.hPct25]),
    pct75Hourly: parseNum(row[COL.hPct75]),
    pct90Hourly: parseNum(row[COL.hPct90]),
    pct10Annual: parseNum(row[COL.aPct10]),
    pct25Annual: parseNum(row[COL.aPct25]),
    pct75Annual: parseNum(row[COL.aPct75]),
    pct90Annual: parseNum(row[COL.aPct90]),
  });
}

const qualifiedOccs = new Set();
for (const [code, data] of nationalOccMap) {
  if (data.totalEmployment && data.totalEmployment >= MIN_EMPLOYMENT) {
    qualifiedOccs.add(code);
  }
}

console.log(`  National occupations: ${nationalOccMap.size}`);
console.log(`  With ${MIN_EMPLOYMENT.toLocaleString()}+ employment: ${qualifiedOccs.size}`);

// Show top 10
const top10 = Array.from(nationalOccMap.values())
  .filter(d => d.totalEmployment)
  .sort((a, b) => b.totalEmployment - a.totalEmployment)
  .slice(0, 10);
console.log('  Top 10 by employment:');
top10.forEach(d => console.log(`    ${d.title}: ${d.totalEmployment?.toLocaleString()} (median $${d.medianAnnual?.toLocaleString()})`));
console.log('');

// ============================================================
// STEP 5: Build state data
// ============================================================
console.log('STEP 5: Building state files...');

const stateData = new Map();
let stateSkipped = 0;

for (const row of stateRows) {
  const areaTitle = (row[COL.areaTitle] || '').trim();
  const occCode = (row[COL.occCode] || '').trim();
  const occTitle = (row[COL.occTitle] || '').trim();
  
  if (!occCode || !occTitle) continue;
  if (!qualifiedOccs.has(occCode)) { stateSkipped++; continue; }
  
  const stateAbbr = STATE_MAP[areaTitle];
  if (!stateAbbr) continue;
  
  const stateSlug = slugify(areaTitle);
  
  if (!stateData.has(stateSlug)) {
    stateData.set(stateSlug, {
      state: areaTitle, stateSlug, stateAbbreviation: stateAbbr,
      dataYear: 2024, occupations: []
    });
  }
  
  stateData.get(stateSlug).occupations.push({
    title: occTitle, slug: slugify(occTitle), socCode: occCode,
    totalEmployment: parseNum(row[COL.totEmp]) ? Math.round(parseNum(row[COL.totEmp])) : null,
    meanHourly: parseNum(row[COL.hMean]),
    meanAnnual: parseNum(row[COL.aMean]),
    medianHourly: parseNum(row[COL.hMedian]),
    medianAnnual: parseNum(row[COL.aMedian]),
    pct10Hourly: parseNum(row[COL.hPct10]),
    pct25Hourly: parseNum(row[COL.hPct25]),
    pct75Hourly: parseNum(row[COL.hPct75]),
    pct90Hourly: parseNum(row[COL.hPct90]),
    pct10Annual: parseNum(row[COL.aPct10]),
    pct25Annual: parseNum(row[COL.aPct25]),
    pct75Annual: parseNum(row[COL.aPct75]),
    pct90Annual: parseNum(row[COL.aPct90]),
    locationQuotient: parseNum(row[COL.locQuotient])
  });
}

for (const [, data] of stateData) {
  data.occupations.sort((a, b) => a.title.localeCompare(b.title));
}

console.log(`  States: ${stateData.size}`);
for (const [slug, data] of Array.from(stateData.entries()).sort()) {
  console.log(`    ${data.stateAbbreviation}: ${data.occupations.length} occupations`);
}
console.log('');

// ============================================================
// STEP 6: Build occupation data
// ============================================================
console.log('STEP 6: Building occupation files...');

const occData = new Map();

for (const [, state] of stateData) {
  for (const occ of state.occupations) {
    if (!occData.has(occ.slug)) {
      const natData = nationalOccMap.get(occ.socCode);
      occData.set(occ.slug, {
        title: occ.title, slug: occ.slug, socCode: occ.socCode,
        dataYear: 2024,
        typicalEducation: null, workExperience: null, onJobTraining: null,
        jobOutlookPercent: null, jobOutlookLabel: null,
        national: natData ? {
          totalEmployment: natData.totalEmployment,
          meanHourly: natData.meanHourly, meanAnnual: natData.meanAnnual,
          medianHourly: natData.medianHourly, medianAnnual: natData.medianAnnual,
          pct10Hourly: natData.pct10Hourly, pct25Hourly: natData.pct25Hourly,
          pct75Hourly: natData.pct75Hourly, pct90Hourly: natData.pct90Hourly,
          pct10Annual: natData.pct10Annual, pct25Annual: natData.pct25Annual,
          pct75Annual: natData.pct75Annual, pct90Annual: natData.pct90Annual,
        } : null,
        states: []
      });
    }
    
    occData.get(occ.slug).states.push({
      state: state.state, stateSlug: state.stateSlug, stateAbbreviation: state.stateAbbreviation,
      totalEmployment: occ.totalEmployment,
      medianAnnual: occ.medianAnnual, meanAnnual: occ.meanAnnual,
      pct10Annual: occ.pct10Annual, pct90Annual: occ.pct90Annual,
      locationQuotient: occ.locationQuotient
    });
  }
}

for (const [, data] of occData) {
  data.states.sort((a, b) => a.state.localeCompare(b.state));
}

console.log(`  Occupations: ${occData.size}`);
console.log('');

// ============================================================
// STEP 7: Load education data if available
// ============================================================
console.log('STEP 7: Looking for education data...');

const eduFiles = allFiles.filter(f =>
  (f.toLowerCase().includes('education') || f.toLowerCase().includes('training')) &&
  (f.endsWith('.xlsx') || f.endsWith('.xls') || f.endsWith('.csv'))
);

if (eduFiles.length > 0) {
  console.log(`  Found: ${eduFiles[0]}`);
  try {
    let eduData;
    const eduPath = path.join(__dirname, eduFiles[0]);
    
    if (eduFiles[0].endsWith('.csv')) {
      const eduRaw = fs.readFileSync(eduPath, 'utf-8');
      const eduLines = eduRaw.split('\n').filter(l => l.trim());
      const eduHeader = parseCSVLine(eduLines[0]);
      eduData = [];
      for (let i = 1; i < eduLines.length; i++) {
        const vals = parseCSVLine(eduLines[i]);
        if (vals.length === eduHeader.length) {
          const obj = {};
          for (let j = 0; j < eduHeader.length; j++) obj[eduHeader[j]] = vals[j];
          eduData.push(obj);
        }
      }
    } else {
      const XLSX = require('xlsx');
      const eduWb = XLSX.readFile(eduPath);
      eduData = XLSX.utils.sheet_to_json(eduWb.Sheets[eduWb.SheetNames[0]]);
    }
    
    let matched = 0;
    for (const row of eduData) {
      const code = String(
        row['OCC_CODE'] || row['occ_code'] || row['SOC Code'] || row['2018 SOC Code'] || ''
      ).trim();
      const education = row['TYPICAL_EDUCATION'] || row['typical_education'] ||
        row['Typical entry-level education'] || null;
      const experience = row['WORK_EXPERIENCE'] || row['work_experience'] ||
        row['Work experience in a related occupation'] || null;
      const training = row['ON_THE_JOB_TRAINING'] || row['on_the_job_training'] ||
        row['Typical on-the-job training'] || null;
      
      for (const [, occ] of occData) {
        if (occ.socCode === code) {
          if (education) occ.typicalEducation = String(education).trim();
          if (experience) occ.workExperience = String(experience).trim();
          if (training) occ.onJobTraining = String(training).trim();
          matched++;
          break;
        }
      }
    }
    console.log(`  ✅ Matched education data for ${matched} occupations`);
  } catch (err) {
    console.log(`  ⚠️ Could not read education file: ${err.message}`);
  }
} else {
  console.log('  No education file found (optional)');
}
console.log('');

// ============================================================
// STEP 8: Write output files
// ============================================================
console.log('STEP 8: Writing files...');

const STATES_DIR = path.join(__dirname, 'src', 'data', 'states');
const OCC_DIR = path.join(__dirname, 'src', 'data', 'occupations');
const NAT_DIR = path.join(__dirname, 'src', 'data', 'national');

[STATES_DIR, OCC_DIR, NAT_DIR].forEach(dir => fs.mkdirSync(dir, { recursive: true }));

// Write state files
let stateCount = 0;
for (const [slug, data] of stateData) {
  fs.writeFileSync(path.join(STATES_DIR, `${slug}.json`), JSON.stringify(data, null, 2));
  stateCount++;
}
console.log(`  ✅ ${stateCount} state files → src/data/states/`);

// Write occupation files
let occCount = 0;
for (const [slug, data] of occData) {
  fs.writeFileSync(path.join(OCC_DIR, `${slug}.json`), JSON.stringify(data, null, 2));
  occCount++;
}
console.log(`  ✅ ${occCount} occupation files → src/data/occupations/`);

// Write index.json
const indexData = {
  states: Array.from(stateData.values())
    .map(s => ({ name: s.state, slug: s.stateSlug, abbreviation: s.stateAbbreviation }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  occupations: Array.from(occData.values())
    .map(o => ({ title: o.title, slug: o.slug, socCode: o.socCode }))
    .sort((a, b) => a.title.localeCompare(b.title))
};
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'index.json'), JSON.stringify(indexData, null, 2));
console.log(`  ✅ index.json`);

// Write national summary
const natSummary = Array.from(nationalOccMap.values())
  .filter(n => qualifiedOccs.has(n.code))
  .sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync(path.join(NAT_DIR, 'occupations.json'), JSON.stringify(natSummary, null, 2));
console.log(`  ✅ national/occupations.json`);

// ============================================================
// DONE
// ============================================================
const totalCombos = Array.from(stateData.values()).reduce((s, d) => s + d.occupations.length, 0);
const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n====================================');
console.log('✅ ALL DONE!');
console.log('====================================');
console.log(`Total time: ${totalTime} seconds`);
console.log(`States: ${stateCount}`);
console.log(`Occupations: ${occCount}`);
console.log(`Detail pages: ${totalCombos.toLocaleString()}`);
console.log(`Total pages: ~${(totalCombos + stateCount + occCount + 10).toLocaleString()}`);
console.log('');
console.log('Next steps:');
console.log('  1. npm run build');
console.log('  2. npm run dev      (preview locally)');
console.log('  3. git add . && git commit -m "add salary data" && git push');


// ============================================================
// CSV PARSER (handles quoted fields with commas inside)
// ============================================================
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else if (char === '\r') {
        // skip carriage return
      } else {
        current += char;
      }
    }
  }
  
  result.push(current.trim());
  return result;
}
