import { TYPES } from '../consts'

const type = TYPES.table

export default (domComponents, { editor }) => {
  domComponents.addType(type, {
    extend: 'table',
    model: {
      defaults: {
        name: 'Row',
        tagName: 'table',
        badgable: true,
        selectable: true,
        hoverable: true,
        draggable: `.wrapper, [data-gjs-type=${TYPES.column}]`, // IT CAN BE DRAGGED INTO these components
        droppable: false, // these components CAN BE DROPPED INTO IT
        attributes: {
          'data-dm-category': 'layout',
        },
        styles: `
          [data-gjs-type="${type}"] {
            display:table;
            width:100%;
          }`,
        stylable: ['height', 'vertical-align', 'break-inside', 'padding'],
      },
      init() {},
    },
    isComponent(el) {
      // return el.dataset && el.dataset.gjsType === TYPES.section;
      return false
    },
  })
}
