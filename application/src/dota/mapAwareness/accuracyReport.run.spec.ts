import * as fs from 'fs';
import * as path from 'path';
import { readRecording, replay } from './replay';
import { computeMatchAccuracy, summarize, formatReport, FileReport } from './accuracy';

const recordingsDir = process.env.MAP_AWARENESS_RECORDINGS;
const describeIfRecordings = recordingsDir ? describe : describe.skip;

describeIfRecordings('map awareness accuracy report', () => {
  it('replays every recording, matches live warnings and meets the pass gate', () => {
    const dir = path.resolve(recordingsDir!);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl.gz')).sort();
    const reports: FileReport[] = [];
    const mismatches: string[] = [];

    for (const file of files) {
      const result = replay(readRecording(path.join(dir, file)));
      const notes: string[] = [];
      let replayMatchesLive: boolean | null = null;
      if (!result.hasSettings) notes.push('settings unknown — default settings used, live comparison skipped');
      else if (!result.hasLiveWarnings) notes.push('no live warnings recorded — live comparison skipped');
      else {
        replayMatchesLive = JSON.stringify(result.replayWarnings) === JSON.stringify(result.liveWarnings);
        if (!replayMatchesLive) mismatches.push(file);
      }
      reports.push({ file, accuracy: computeMatchAccuracy(result.timeline, result.engageDistance), replayMatchesLive, notes });
    }

    const summary = summarize(reports.map((r) => r.accuracy));
    const reportPath = path.join(dir, 'accuracy-report.md');
    fs.writeFileSync(reportPath, formatReport(reports, summary), 'utf-8');
    console.info(`[map-awareness] report written to ${reportPath}`);

    expect(files.length).toBeGreaterThan(0);
    expect(mismatches).toEqual([]);
    expect(summary.failures).toEqual([]);
  });
});
