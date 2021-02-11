/**
 * Creates an increasing numeric ID
 * for testing
 */
let nextId = 0;

export default function mockCreateId() {
  const id = nextId;
  nextId += 1;

  return String(id);
}

export function resetMockCreateId() {
  nextId = 0;
}
