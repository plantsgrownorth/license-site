/**
 * Generate one simple word category per occupation for browsing/filtering.
 * SOC major group (first 2 digits) + title keyword overrides.
 * Output: src/data/occupation-categories.json
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const indexPath = join(root, 'src', 'data', 'index.json');
const outPath = join(root, 'src', 'data', 'occupation-categories.json');

const index = JSON.parse(readFileSync(indexPath, 'utf-8'));

// Title/keyword -> simple word (user-facing "like doctor")
const keywordMap = [
  [/physician|surgeon|psychiatrist|anesthesiologist|obstetrician|pediatrician|internist|dentist|orthodontist|oral.*surgeon/i, 'doctor'],
  [/\bregistered nurses?\b|\blicensed practical|\blicensed vocational|\bnurse practitioners?|\bnurse anesthetists?|\bnursing assistants?|\bnursing instructors?/i, 'nurse'],
  [/\bnursery\b|\bgreenhouse\b/i, 'agriculture'],
  [/teacher|instructor|professor|faculty/i, 'teacher'],
  [/software|developer|programmer|web developer|data scientist|computer.*analyst/i, 'developer'],
  [/pilot|flight engineer/i, 'pilot'],
  [/driver|chauffeur|truck.*operator/i, 'driver'],
  [/cook|chef|baker|bartender|waiter|server|food.*prep/i, 'food'],
  [/engineer/i, 'engineer'],
  [/manager|supervisor|executive|director|chief/i, 'manager'],
  [/accountant|auditor|analyst|financial|actuary/i, 'finance'],
  [/lawyer|attorney|judge|paralegal/i, 'legal'],
  [/therapist|psychologist|counselor|social worker/i, 'therapy'],
  [/mechanic|technician|repairer|installer/i, 'technician'],
  [/construction|mason|carpenter|electrician|plumber|painter|roofer|welder/i, 'construction'],
  [/police|sheriff|detective|correctional|security guard|firefighter/i, 'safety'],
  [/sales|agent|representative/i, 'sales'],
  [/clerk|secretary|receptionist|assistant|bookkeeping/i, 'office'],
  [/caretaker|childcare|personal care|home health/i, 'care'],
  [/scientist|chemist|biologist|physicist|researcher/i, 'scientist'],
  [/designer|artist|writer|editor|photographer|producer|director/i, 'creative'],
  [/librarian|archivist|curator/i, 'library'],
  [/farmer|agricultural|fishing|forestry/i, 'agriculture'],
  [/pilot/i, 'pilot'],
  [/pharmacist|pharmacy|dental/i, 'healthcare'],
  [/paramedic|emt|ambulance/i, 'paramedic'],
  [/veterinar/i, 'veterinarian'],
  [/real estate|realtor/i, 'real estate'],
  [/insurance/i, 'insurance'],
  [/coach|scout|athletic/i, 'coach'],
  [/clergy|chaplain/i, 'clergy'],
  [/pilot/i, 'pilot'],
];

// SOC major group (first 2 digits) -> default simple word
const socMajor = {
  '11': 'manager',
  '13': 'business',
  '15': 'tech',
  '17': 'engineer',
  '19': 'scientist',
  '21': 'community',
  '23': 'education',
  '25': 'arts',
  '27': 'creative',
  '29': 'healthcare',
  '31': 'healthcare',
  '33': 'safety',
  '35': 'food',
  '37': 'cleaning',
  '39': 'care',
  '41': 'sales',
  '43': 'office',
  '45': 'agriculture',
  '47': 'construction',
  '49': 'technician',
  '51': 'production',
  '53': 'transportation',
};

const out = {};
for (const occ of index.occupations) {
  const title = occ.title || '';
  const soc = (occ.socCode || '').split('-')[0];
  let word = socMajor[soc] || 'other';
  for (const [pattern, cat] of keywordMap) {
    if (pattern.test(title)) {
      word = cat;
      break;
    }
  }
  out[occ.slug] = word;
}

writeFileSync(outPath, JSON.stringify(out, null, 0), 'utf-8');
console.log('Wrote src/data/occupation-categories.json');
console.log('Unique categories:', [...new Set(Object.values(out))].sort().join(', '));
