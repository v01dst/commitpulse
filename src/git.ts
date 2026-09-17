import { execFile } from "child_process";
import * as vscode from "vscode";

export interface CommitInfo {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
  date: string;
}

export interface StreakData {
  currentStreak: number;
  todayCount: number;
  hasToday: boolean;
  bestStreak: number;
  lastCommitDate: string | null;
  todayCommits: CommitInfo[];
  recentCommits: CommitInfo[];
}

function git(cwd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("git", args, { cwd, maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function isGitRepo(cwd: string): Promise<boolean> {
  try {
    const out = await git(cwd, ["rev-parse", "--is-inside-work-tree"]);
    return out.trim() === "true";
  } catch {
    return false;
  }
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseCommit(line: string): CommitInfo {
  const sep = "\u001f";
  const [hash, shortHash, subject, author, date] = line.split(sep);
  return { hash, shortHash, subject, author, date };
}

export async function getStreak(cwd: string): Promise<StreakData> {
  const sep = "\u001f";
  const logFormat = `--pretty=format:%H${sep}%h${sep}%s${sep}%an${sep}%aI`;

  const since = new Date();
  since.setDate(since.getDate() - 400);
  const sinceKey = dayKey(since);

  const logOut = await git(cwd, ["log", "--all", "--author-date-order", `--since=${sinceKey}`, logFormat]);
  const lines = logOut.split("\n").filter((l) => l.trim().length > 0);

  const allCommits = lines.map(parseCommit);
  const byDay = new Map<string, number>();
  const today = new Date();
  const todayKey = dayKey(today);

  for (const c of allCommits) {
    const d = new Date(c.date);
    const key = dayKey(d);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  let currentStreak = 0;
  const cursor = new Date(today);
  if (!(byDay.get(todayKey) ?? 0)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while ((byDay.get(dayKey(cursor)) ?? 0) > 0) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let bestStreak = 0;
  let run = 0;
  const sortedDays = [...byDay.keys()].sort();
  let prev: string | null = null;
  for (const day of sortedDays) {
    if (prev !== null) {
      const diff = (new Date(day).getTime() - new Date(prev).getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > bestStreak) {
      bestStreak = run;
    }
    prev = day;
  }

  const todayCommits = allCommits.filter((c) => dayKey(new Date(c.date)) === todayKey);
  const recentCommits = allCommits.slice(0, 10);

  return {
    currentStreak,
    todayCount: byDay.get(todayKey) ?? 0,
    hasToday: (byDay.get(todayKey) ?? 0) > 0,
    bestStreak,
    lastCommitDate: allCommits.length ? allCommits[0].date : null,
    todayCommits,
    recentCommits
  };
}
