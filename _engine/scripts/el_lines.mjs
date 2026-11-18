// ElevenLabs cast lines for cinematic/versus videos: one clip per line, each with word timings. Run from _engine/:
//   node --env-file=../.env.local scripts/el_lines.mjs <slug> <lines.json>
// lines.json = [{id, voice, text}]. Writes public/jobs/<slug>/clips/<id>.mp3 + <id>.json ([word,start,end][]). Skips clips that exist.
import {ElevenLabsClient} from '@elevenlabs/elevenlabs-js';
import fs from 'node:fs';

const [slug, linesPath] = process.argv.slice(2);
const dir = `public/jobs/${slug}/clips`;
fs.mkdirSync(dir, {recursive: true});
const client = new ElevenLabsClient();
for (const {id, voice, text, stability = 0.4} of JSON.parse(fs.readFileSync(linesPath, 'utf8'))) {
  if (fs.existsSync(`${dir}/${id}.json`)) continue;
  const res = await client.textToSpeech.convertWithTimestamps(voice, {text, modelId: 'eleven_v4', voiceSettings: {stability, similarityBoost: 0.8}});
  fs.writeFileSync(`${dir}/${id}.mp3`, Buffer.from(res.audioBase64, 'base64'));
  const a = res.alignment, words = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) words.push(cur); cur = null; return; }
    if (!cur) cur = [ch, a.characterStartTimesSeconds[i], a.characterEndTimesSeconds[i]];
    else { cur[0] += ch; cur[2] = a.characterEndTimesSeconds[i]; }
  });
  if (cur) words.push(cur);
  fs.writeFileSync(`${dir}/${id}.json`, JSON.stringify(words));
  console.log(id, words.length, 'words', words.at(-1)[2].toFixed(2) + 's');
}
