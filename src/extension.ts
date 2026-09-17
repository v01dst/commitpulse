import * as vscode from "vscode";
import { getStreak, isGitRepo } from "./git";
import { registerActivityView } from "./activityView";

export function activate(context: vscode.ExtensionContext): void {
  const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusItem.name = "CommitPulse";
  statusItem.tooltip = "CommitPulse — click to view activity";
  statusItem.command = "commitpulse.viewActivity";
  context.subscriptions.push(statusItem);

  async function update(): Promise<void> {
    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!cwd || !(await isGitRepo(cwd))) {
      statusItem.hide();
      return;
    }
    try {
      const streak = await getStreak(cwd);
      const emojiMode = vscode.workspace.getConfiguration("commitpulse").get<string>("emojiMode");
      const fire = emojiMode === "emoji" ? "🔥" : "";
      const icon = streak.hasToday ? fire || "OK" : "⏳";
      const n = streak.currentStreak;
      if (streak.hasToday) {
        statusItem.text = `${icon} ${n}-day streak (${streak.todayCount} today)`;
      } else {
        statusItem.text = `${icon} streak: ${n} — commit today to keep it`;
      }
      statusItem.show();
    } catch {
      statusItem.hide();
    }
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  function debouncedUpdate(): void {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      update();
    }, 800);
  }

  const watcher = vscode.workspace.createFileSystemWatcher("**/.git/HEAD");
  watcher.onDidChange(debouncedUpdate);
  watcher.onDidCreate(debouncedUpdate);
  watcher.onDidDelete(debouncedUpdate);
  context.subscriptions.push(watcher);

  const commitWatcher = vscode.workspace.createFileSystemWatcher("**/.git/refs/**");
  commitWatcher.onDidChange(debouncedUpdate);
  commitWatcher.onDidCreate(debouncedUpdate);
  context.subscriptions.push(commitWatcher);

  context.subscriptions.push(vscode.commands.registerCommand("commitpulse.refresh", debouncedUpdate));

  registerActivityView(context);

  if (vscode.workspace.workspaceFolders?.length) {
    update();
  }

  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => update()));
}
