import friendlyWords from 'friendly-words';

/**
 * Generates a random friendly project name composed of an adjective and an object.
 * @example
 * generateProjectName(); // "brave mountain"
 */
export function generateProjectName(): string {
  const adj =
    friendlyWords.predicates[
      Math.floor(Math.random() * friendlyWords.predicates.length)
    ];
  const obj =
    friendlyWords.objects[
      Math.floor(Math.random() * friendlyWords.objects.length)
    ];
  return `${adj} ${obj}`;
}

/**
 * Generates a random friendly collection name using an adjective.
 * @example
 * generateCollectionName(); // "My clever collection"
 */
export function generateCollectionName(): string {
  const adj =
    friendlyWords.predicates[
      Math.floor(Math.random() * friendlyWords.predicates.length)
    ];
  return `My ${adj} collection`;
}
