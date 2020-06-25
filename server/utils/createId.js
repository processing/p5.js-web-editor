import objectID from 'bson-objectid';

/**
 * Creates a mongo ID
 */
export default function createId() {
  return objectID().toHexString();
}
