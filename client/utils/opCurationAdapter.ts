import {
  opPrivacyToVisibility,
  opVisualIdToProjectId
} from './opSketchAdapter';

/**
 * Adapters between OpenProcessing "curations" (the API/backend concept) and the
 * editor's "collections" data shape that the Redux store, selectors and
 * components already expect.
 *
 * The editor UI only surfaces public, owner-curated collections, so OP-only
 * fields (isPrivate, submitLevel, freezeSketches, followers, approval status)
 * are intentionally not exposed here.
 */

export interface OpCuration {
  curationID: number | string;
  title: string;
  slug: string;
  description?: string;
  isPrivate?: number;
  submitLevel?: number;
  createdOn?: string;
  updatedOn?: string;
  userID: number | string;
  username?: string;
  numSketches?: number;
}

export interface OpCurationSketch {
  visualID: number | string;
  title: string;
  description?: string;
  userID: number | string;
  username?: string;
  fullname?: string;
  isPrivate?: number;
  submittedOn?: string;
  status?: number;
}

export interface CollectionItem {
  id: string;
  projectId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    visibility: string;
    user: { id: string; username: string };
  };
}

export interface Collection {
  id: string;
  name: string;
  slug?: string;
  description: string;
  owner: { id: string; username: string };
  items: CollectionItem[];
  numItems: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Editor collection id. The slug is the canonical identifier — URLs and API
 * calls are slug-based. All curations have a slug.
 */
export function opCurationToCollectionId(curation: OpCuration): string {
  return curation.slug;
}

/** Map one OP curation-sketch row to a collection item. */
export function opCurationSketchToItem(
  sketch: OpCurationSketch
): CollectionItem {
  const projectId = opVisualIdToProjectId(sketch.visualID);
  return {
    id: projectId,
    projectId,
    isDeleted: false,
    createdAt: sketch.submittedOn ?? '',
    updatedAt: sketch.submittedOn ?? '',
    project: {
      id: projectId,
      name: sketch.title,
      visibility: opPrivacyToVisibility(sketch.isPrivate ?? 0),
      user: {
        id: String(sketch.userID),
        username: sketch.username ?? ''
      }
    }
  };
}

/**
 * Map an OP curation (metadata only) to a collection. Used for list views where
 * the sketches aren't loaded yet — `items` is empty and `numItems` carries the
 * count returned by the API.
 *
 * @param ownerUsername Username of the curation owner. The list endpoint
 *   (`/user/{id}/curations`) doesn't echo it back, so the caller passes the
 *   username of the dashboard being viewed.
 */
export function opCurationToCollection(
  curation: OpCuration,
  ownerUsername?: string
): Collection {
  return {
    id: opCurationToCollectionId(curation),
    name: curation.title,
    slug: curation.slug,
    description: curation.description ?? '',
    owner: {
      id: String(curation.userID),
      username: curation.username ?? ownerUsername ?? ''
    },
    items: [],
    numItems: curation.numSketches ?? 0,
    createdAt: curation.createdOn ?? '',
    updatedAt: curation.updatedOn ?? ''
  };
}

/** Map an OP curation plus its sketches to a fully-populated collection. */
export function opCurationWithSketchesToCollection(
  curation: OpCuration,
  sketches: OpCurationSketch[],
  ownerUsername?: string
): Collection {
  const base = opCurationToCollection(curation, ownerUsername);
  const items = sketches.map(opCurationSketchToItem);
  return {
    ...base,
    items,
    numItems: items.length
  };
}

/**
 * Build the JSON body for creating/updating a curation from editor fields.
 *
 * Only title/description are sent. submitLevel, isPrivate and freezeSketches are
 * intentionally omitted so the editor relies on the API defaults (public,
 * owner-only submissions, no freeze). When the editor UI later adds toggles for
 * these, extend this payload accordingly.
 */
export function collectionToOpCurationPayload(fields: {
  name?: string;
  description?: string;
}): { title?: string; description?: string } {
  const payload: { title?: string; description?: string } = {};
  if (fields.name !== undefined) {
    payload.title = fields.name;
  }
  if (fields.description !== undefined) {
    payload.description = fields.description;
  }
  return payload;
}
