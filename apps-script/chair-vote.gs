/**
 * Chair fabric vote — backend for /chair-vote.
 *
 * GitHub Pages is static, so this Google Apps Script web app is the whole
 * backend: every vote is appended as a row to the sheet SHEET_ID names, and
 * tallies are recomputed from the rows on each request. It is a standalone
 * project (with appsscript.json alongside) deployed as a web app through the
 * Apps Script API; it lives outside src/ and public/ so Astro never publishes it.
 *
 * The sheet's first tab holds the votes and has no header row. Rows are
 * [timestamp, name, "slug,slug,slug"]. Nothing is ever overwritten: a re-vote
 * appends a new row, and only each person's latest row counts.
 */

const SHEET_ID = '1gCH-tA-cbbvKInuoKpxiR9wRJpu6GxvYzmeaPtuSxOU';

const ALLOWED_SLUGS = [
  'alluvial-eucalyptus',
  'alluvial-river',
  'gabrielle-graphite',
  'gabrielle-walnut',
  'mokum-borabora-pacific',
  'mokum-borabora-spice',
  'mokum-vomo-basalt',
  'warwick-uluwatu-midnight',
  'warwick-uluwatu-natural',
  'warwick-uluwatu-terra',
  'zepel-montague-ash',
];
const MAX_PICKS = 3;
const MAX_NAME_LENGTH = 60;

function doGet() {
  return json(tallyVotes(readRows()));
}

function doPost(e) {
  let vote;
  try {
    vote = parseVote(e && e.postData ? e.postData.contents : '');
  } catch (err) {
    return json({ error: err.message });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return json({ error: 'The vote sheet is busy. Try again in a moment.' });
  }
  try {
    voteSheet().appendRow([new Date(), vote.name, vote.picks.join(',')]);
    // Without a flush the read below can miss the row just appended.
    SpreadsheetApp.flush();
    return json(tallyVotes(readRows()));
  } finally {
    lock.releaseLock();
  }
}

/** Parses and validates a request body; throws an Error whose message is shown to the voter. */
function parseVote(body) {
  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    throw new Error('Request body is not valid JSON.');
  }
  if (!data || typeof data !== 'object') throw new Error('Request body must be a JSON object.');

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) throw new Error('Please enter your name.');
  if (name.length > MAX_NAME_LENGTH) throw new Error(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`);

  const picks = data.picks;
  if (!Array.isArray(picks) || picks.length < 1 || picks.length > MAX_PICKS) {
    throw new Error(`Pick between 1 and ${MAX_PICKS} fabrics.`);
  }
  if (new Set(picks).size !== picks.length) throw new Error('Each fabric can only be picked once.');
  const unknown = picks.filter((slug) => ALLOWED_SLUGS.indexOf(slug) === -1);
  if (unknown.length) throw new Error(`Unknown fabric: ${unknown.join(', ')}`);

  return { name, picks };
}

// Pinned to the first tab so adding tabs for charts or notes never moves where
// votes land.
function voteSheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
}

function readRows() {
  const sheet = voteSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow === 0) return [];
  return sheet.getRange(1, 1, lastRow, 3).getValues();
}

/**
 * Pure: rows of [timestamp, name, picksCsv] in sheet order → {tallies, voters}.
 * Later rows win, keyed on the trimmed, lower-cased name, so "Mum" re-voting
 * as "mum " replaces her earlier picks. Slugs no longer in ALLOWED_SLUGS
 * (e.g. a fabric dropped after voting opened) are ignored.
 */
function tallyVotes(rows) {
  const latestByVoter = {};
  rows.forEach((row) => {
    const key = String(row[1] || '').trim().toLowerCase();
    if (key) latestByVoter[key] = String(row[2] || '');
  });

  const tallies = {};
  ALLOWED_SLUGS.forEach((slug) => { tallies[slug] = 0; });
  const voterKeys = Object.keys(latestByVoter);
  voterKeys.forEach((key) => {
    latestByVoter[key].split(',').forEach((slug) => {
      if (Object.prototype.hasOwnProperty.call(tallies, slug)) tallies[slug]++;
    });
  });

  return { tallies, voters: voterKeys.length };
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
