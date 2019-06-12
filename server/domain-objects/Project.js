/**
 * This converts between a mongoose Project model
 * and the public API Project object properties
 *
 */
export function toApi(model) {
  return {
    id: model.id,
    name: model.name,
  };
}

export function toModel(object) {

}
