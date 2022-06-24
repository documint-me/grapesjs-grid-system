import { TYPES } from './consts'

const { table, row, column } = TYPES

export const rowBlock = {
  label: 'Row',
  category: 'Layout',
  attributes: {
    class: 'gjs-fonts gjs-f-b1',
  },
  content: {
    type: table,
    components: {
      type: row,
      components: { type: column },
    },
  },
}

export const columnBlock = {
  label: 'Column',
  category: 'Layout',
  attributes: {
    class: 'gjs-fonts gjs-f-b3',
  },
  content: { type: TYPES.column },
}

export default (editor) => {
  const bm = editor.BlockManager

  bm.add('row', rowBlock)
  bm.add('column', columnBlock)
}
