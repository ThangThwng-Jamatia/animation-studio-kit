// ElevenLabs voice-over with word timings. Run from _engine/:
//   node --env-file=../.env.local scripts/el_voice.mjs <slug> <voiceId> <script.txt> [tempo=1.0] [speed]
// tempo = ffmpeg atempo after generation (keep 1.0–1.1, see storytelling/references/viral-shorts-standard.md).
// speed = optional ElevenLabs voice_settings.speed (native faster read, e.g. 1.1); omit it if the API rejects it for the model.
// Then run scripts/tighten_vo.py public/jobs/<slug> and scripts/shorts_gate.py voice.
// Writes public/jobs/<slug>/{voice.mp3, words.json ([word,start,end][]), words.txt}. Key comes from ELEVENLABS_API_KEY.
import {ElevenLabsClient} from '@elevenlabs/elevenlabs-js';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const [slug, voiceId, scriptPath, tempoArg, speedArg] = process.argv.slice(2);
const tempo = Number(tempoArg ?? 1);
const dir = `public/jobs/${slug}`;
fs.mkdirSync(dir, {recursive: true});
const text = fs.readFileSync(scriptPath, 'utf8').trim();

const client = new ElevenLabsClient();
const res = await client.textToSpeech.convertWithTimestamps(voiceId, {text, modelId: 'eleven_v4', voiceSettings: {stability: 0.45, similarityBoost: 0.8, ...(speedArg ? {speed: Number(speedArg)} : {})}});
const raw = `${dir}/voice_raw.mp3`;
fs.writeFileSync(raw, Buffer.from(res.audioBase64, 'base64'));

// characters -> words
const a = res.alignment;
const words = [];
let cur = null;
a.characters.forEach((ch, i) => {
  if (/\s/.test(ch)) { if (cur) words.push(cur); cur = null; return; }
  if (!cur) cur = [ch, a.characterStartTimesSeconds[i], a.characterEndTimesSeconds[i]];
  else { cur[0] += ch; cur[2] = a.characterEndTimesSeconds[i]; }
});
if (cur) words.push(cur);
const out = words.map(([w, s, e]) => [w, +(s / tempo).toFixed(3), +(e / tempo).toFixed(3)]);

execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', `atempo=${tempo}`, '-ar', '44100', `${dir}/voice.mp3`]);
fs.writeFileSync(`${dir}/words.json`, JSON.stringify(out));
fs.writeFileSync(`${dir}/words.txt`, out.map(([w, s]) => `${s.toFixed(2)} ${w}`).join('\n'));
console.log(`${out.length} words, ${out.at(-1)[2]}s -> ${dir}`);
