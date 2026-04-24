import objectID from 'bson-objectid';

export interface OpSketch {
  visualID: number | string;
  title: string;
  userID: number;
  isPrivate?: number;
  mode?: string;
  description?: string;
  updatedOn?: string;
  createdOn?: string;
}

export interface OpCodeTab {
  codeID?: number;
  title: string;
  code: string;
  orderID?: number;
}

export interface EditorFile {
  id: string;
  _id: string;
  name: string;
  content: string;
  fileType: 'file' | 'folder';
  children: string[];
  url?: string;
  isSelectedFile?: boolean;
  filePath?: string;
}

export interface CodeTabPayload {
  title: string;
  code: string;
  orderID: number;
}

export function opVisualIdToProjectId(visualID: number | string): string {
  return String(visualID);
}

// OP isPrivate int (0=public, 1+=private) → editor visibility string
export function opPrivacyToVisibility(isPrivate: number = 0): string {
  return isPrivate === 0 ? 'Public' : 'Private';
}

// editor visibility string → OP isPrivate int
export function visibilityToOpPrivacy(visibility: string): number {
  return visibility === 'Public' ? 0 : 1;
}

// Convert OP code tabs to editor file nodes, including a root folder
export function codeTabsToFiles(codeTabs: OpCodeTab[]): EditorFile[] {
  const rootId = objectID().toHexString();
  const fileNodes: EditorFile[] = codeTabs.map((tab, index) => {
    const id = objectID().toHexString();
    return {
      id,
      _id: id,
      name: tab.title,
      content: tab.code,
      fileType: 'file',
      children: [],
      filePath: '',
      isSelectedFile: index === 0
    };
  });

  const root: EditorFile = {
    id: rootId,
    _id: rootId,
    name: 'root',
    content: '',
    fileType: 'folder',
    children: fileNodes.map((f) => f.id)
  };

  return [root, ...fileNodes];
}

// Build a Redux-compatible project object from OP sketch metadata + code tabs
export function opSketchToProject(
  sketch: OpSketch,
  codeTabs: OpCodeTab[],
  username: string
) {
  const files = codeTabsToFiles(codeTabs);
  const savedCodeTitles = codeTabs.map((t) => t.title);
  return {
    id: opVisualIdToProjectId(sketch.visualID),
    name: sketch.title,
    visibility: opPrivacyToVisibility(sketch.isPrivate),
    files,
    savedCodeTitles,
    updatedAt: sketch.updatedOn ?? '',
    user: {
      id: String(sketch.userID),
      username
    }
  };
}

// Collect text file nodes from editor files (skip folders and binary url files)
// Returns flat array ordered by root's children list
export function editorFilesToCodeTabs(files: EditorFile[]): CodeTabPayload[] {
  const root = files.find((f) => f.name === 'root' && f.fileType === 'folder');
  if (!root) return [];

  return root.children
    .map((id) => files.find((f) => f.id === id))
    .filter((f): f is EditorFile => !!f && f.fileType === 'file' && !f.url)
    .map((f, index) => ({
      // OP code tab titles are max 25 chars
      title: f.name.length > 25 ? f.name.slice(0, 25) : f.name,
      code: f.content,
      orderID: index
    }));
}
