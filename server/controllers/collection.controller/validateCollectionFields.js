import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_NAME_MAX_LENGTH
} from '../../../common/collectionLimits';

export default function validateCollectionFields({ name, description }) {
  if (typeof name === 'string' && name.length > COLLECTION_NAME_MAX_LENGTH) {
    return `Collection name cannot exceed ${COLLECTION_NAME_MAX_LENGTH} characters.`;
  }

  if (
    typeof description === 'string' &&
    description.length > COLLECTION_DESCRIPTION_MAX_LENGTH
  ) {
    return `Description cannot exceed ${COLLECTION_DESCRIPTION_MAX_LENGTH} characters.`;
  }

  return null;
}
