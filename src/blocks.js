import { TYPES, BLOCKS } from './consts'

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

export default (editor, options) => {
  const bm = editor.BlockManager

  const { blocks = [] } = options

  if (!blocks || !Array.isArray(blocks)) return
  if (blocks.includes(BLOCKS.row)) bm.add(BLOCKS.row, rowBlock)
  if (blocks.includes(BLOCKS.column)) bm.add(BLOCKS.column, columnBlock)
}
