import { Uri, Event } from 'vscode';

export interface GitExtension {
  readonly enabled: boolean;
  readonly autoRepositoryDetection: boolean | 'subFolders' | 'openEditors';
  getAPI(version: 1): API;
}

export interface API {
  readonly git: Git;
  readonly repositories: ReadonlyArray<Repository>;
  readonly onDidOpenRepository: Event<Repository>;
  readonly onDidCloseRepository: Event<Repository>;
}

export interface Git {
  readonly path: string;
}

export interface RepositoryState {
  readonly HEAD: Branch | undefined;
  readonly remotes: ReadonlyArray<Remote>;
  readonly submodules: ReadonlyArray<Submodule>;
  readonly rebaseCommit: Commit | undefined;
  readonly mergeChanges: ReadonlyArray<Change>;
  readonly indexChanges: ReadonlyArray<Change>;
  readonly workingTreeChanges: ReadonlyArray<Change>;
  readonly onDidChange: Event<void>;
}

export interface RepositoryUIState {
  readonly selected: boolean;
  readonly onDidChange: Event<void>;
}

export interface InputBox {
  value: string;
  placeholder?: string;
  readonly onDidChange: Event<string>;
}

export interface Repository {
  readonly rootUri: Uri;
  readonly inputBox: InputBox;
  readonly state: RepositoryState;
  readonly ui: RepositoryUIState;
  diff(cached?: boolean): Promise<string>;
  diffWithHEAD(): Promise<string>;
  diffWith(ref: string): Promise<string>;
  diffIndexWithHEAD(): Promise<string>;
  diffIndexWith(ref: string): Promise<string>;
}

export interface Change {
  readonly uri: Uri;
  readonly originalUri: Uri;
  readonly renameUri: Uri | undefined;
  readonly status: number;
}

export interface Branch {
  readonly name?: string;
  readonly commit?: string;
  readonly type: number;
}

export interface Remote {
  readonly name: string;
  readonly fetchUrl?: string;
  readonly pushUrl?: string;
  readonly isReadOnly: boolean;
}

export interface Submodule {
  readonly name: string;
  readonly path: string;
  readonly url: string;
}

export interface Commit {
  readonly hash: string;
  readonly message: string;
  readonly parents: ReadonlyArray<string>;
  readonly authorDate?: Date;
  readonly commitDate?: Date;
}
