export const TYPES = {
  row: 'gs-row',
  columns: 'gs-columns',
  column: 'gs-column',
}

export const BLOCKS = {
  row: 'gs-row',
  column: 'gs-column',
}

export const GS_TYPES = {
  row: 'row',
  columns: 'columns',
  column: 'column',
}

export const MAX_COLUMNS = 12

export const ACTIONS = {
  addComponent: 'add-component',
  removeComponent: 'remove-component',
  cloneComponent: 'clone-component',
  moveComponent: 'move-component',
}

export const RESIZER_NONE = { tl: 0, tc: 0, tr: 0, cr: 0, br: 0, bc: 0, bl: 0, cl: 0 }

export default { TYPES, ACTIONS, MAX_COLUMNS, RESIZER_NONE }

export const RESIZABLE_PROPS = {
  startX: 'startX',
  prevX: 'prevX',
  prevDirection: 'prevDirection',
  prevDeltaX: 'prevDeltaX',
}
