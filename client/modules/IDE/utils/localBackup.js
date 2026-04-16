/**
 * Local backup utility for crash recovery.
 *
 * Persists sketch file contents to localStorage on every code change,
 * so users can recover their work if the browser tab crashes
 * (e.g. due to an infinite loop). See issue #3891.
 */

const BACKUP_KEY_PREFIX = 'p5js-backup-';
const BACKUP_TIMESTAMP_SUFFIX = '-timestamp';

/**
 * Save file contents to localStorage for a given project.
 * @param {string} projectId - The project ID (or 'unsaved' for new sketches)
 * @param {Array} files - Array of file objects with id, name, and content
 */
export function saveLocalBackup(projectId, files) {
  if (!projectId || !files) return;

  try {
    const backupData = files
      .filter((f) => f.content !== undefined)
      .map((f) => ({
        id: f.id,
        name: f.name,
        content: f.content
      }));

    const key = `${BACKUP_KEY_PREFIX}${projectId}`;
    localStorage.setItem(key, JSON.stringify(backupData));
    localStorage.setItem(
      `${key}${BACKUP_TIMESTAMP_SUFFIX}`,
      Date.now().toString()
    );
  } catch (e) {
    // localStorage may be full or unavailable — silently fail
    // since this is a best-effort recovery mechanism
  }
}

/**
 * Retrieve a local backup for a given project.
 * @param {string} projectId
 * @returns {{ files: Array, timestamp: number } | null}
 */
export function getLocalBackup(projectId) {
  if (!projectId) return null;

  try {
    const key = `${BACKUP_KEY_PREFIX}${projectId}`;
    const data = localStorage.getItem(key);
    const timestamp = localStorage.getItem(`${key}${BACKUP_TIMESTAMP_SUFFIX}`);

    if (!data) return null;

    return {
      files: JSON.parse(data),
      timestamp: parseInt(timestamp, 10) || 0
    };
  } catch (e) {
    return null;
  }
}

/**
 * Remove a local backup after a successful server save.
 * @param {string} projectId
 */
export function clearLocalBackup(projectId) {
  if (!projectId) return;

  try {
    const key = `${BACKUP_KEY_PREFIX}${projectId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}${BACKUP_TIMESTAMP_SUFFIX}`);
  } catch (e) {
    // ignore
  }
}

/**
 * Check if a local backup exists and is newer than the given timestamp.
 * @param {string} projectId
 * @param {string|Date} lastServerSave - ISO string or Date of last server save
 * @returns {boolean}
 */
export function hasNewerLocalBackup(projectId, lastServerSave) {
  const backup = getLocalBackup(projectId);
  if (!backup) return false;

  const serverTime = lastServerSave ? new Date(lastServerSave).getTime() : 0;
  return backup.timestamp > serverTime;
}
