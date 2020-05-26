import friendlyWords from 'friendly-words';

export function generateProjectName() {
  const adj = friendlyWords.predicates[Math.floor(Math.random() * friendlyWords.predicates.length)];
  const obj = friendlyWords.objects[Math.floor(Math.random() * friendlyWords.objects.length)];
  return `${adj} ${obj}`;
}

export function generateCollectionName() {
  const adj = friendlyWords.predicates[Math.floor(Math.random() * friendlyWords.predicates.length)];
  return `My ${adj} collection`;
}
