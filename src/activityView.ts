import * as vscode from "vscode";
import { getStreak, isGitRepo, StreakData } from "./git";

export class CommitPulseView implements vscode.TreeDataProvider<string> {
  private _onDidChangeTreeData = new vscode.EventEmitter<string | undefined | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private context: vscode.ExtensionContext) {}

  private data: StreakData | null = null;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: string): vscode.TreeItem {
    return new vscode.TreeItem(element, vscode.TreeItemCollapsibleState.None);
  }

  async getChildren(): Promise<string[]> {
    const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!cwd || !(await isGitRepo(cwd))) {
      return ["No git repo detected in this workspace"];
    }
    this.data = await getStreak(cwd);
    const d = this.data;
    const emojiMode = vscode.workspace.getConfiguration("commitpulse").get<string>("emojiMode");
    const fire = emojiMode === "emoji" ? " 🔥" : "";
    const lines = [
      `Current streak${fire}: ${d.currentStreak} day${d.currentStreak === 1 ? "" : "s"}`,
      `Best streak: ${d.bestStreak} day${d.bestStreak === 1 ? "" : "s"}`,
      `Today: ${d.todayCount} commit${d.todayCount === 1 ? "" : "s"}${d.hasToday ? " ✅" : " — nothing yet, ship something!"}`,
      `Total commits (last 400 days): ${d.recentCommits.length > 0 ? "" : "0"}`,
      "",
      "Today's commits:"
    ];
    for (const c of d.todayCommits) {
      lines.push(`  ${c.shortHash} ${c.subject} (${c.author})`);
    }
    if (d.todayCommits.length === 0) {
      lines.push("  none yet");
    }
    lines.push("", "Recent commits:");
    for (const c of d.recentCommits) {
      lines.push(`  ${c.shortHash} ${c.subject} (${c.author})`);
    }
    return lines;
  }
}

export function registerActivityView(context: vscode.ExtensionContext): void {
  const view = new CommitPulseView(context);
  vscode.window.registerTreeDataProvider("commitpulse.activity", view);
  vscode.commands.registerCommand("commitpulse.viewActivity", () => {
    view.refresh();
    vscode.commands.executeCommand("commitpulse.activity.focus");
  });
  vscode.commands.registerCommand("commitpulse.refresh", () => view.refresh());
}
