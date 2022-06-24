export const TYPES = {
  column: 'gs-column',
  row: 'gs-row',
}

export const MAX_COMPONENTS_LENGTH = 12

export const ACTIONS = {
  addComponent: 'add-component',
  removeComponent: 'remove-component',
  cloneComponent: 'clone-component',
  moveComponent: 'move-component',
}

export const RESIZER_NONE = { tl: 0, tc: 0, tr: 0, cr: 0, br: 0, bc: 0, bl: 0, cl: 0 }

export default { TYPES, ACTIONS, MAX_COMPONENTS_LENGTH, RESIZER_NONE }
