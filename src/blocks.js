import { TYPES } from './consts'

export const rowBlock = {
  label: 'Section',
  category: 'Layout',
  attributes: {
    class: 'gjs-fonts gjs-f-b1',
  },
  content: {
    type: TYPES.section,
    components: [{ type: TYPES.column }],
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
