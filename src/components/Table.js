import { TYPES } from '../consts'

export default (domComponents, { editor, ...config }) => {
  const { tableProps = {} } = config
  const type = tableProps.type || TYPES.table

  const def = {
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
        resizable: { tl: 0, tc: 0, tr: 0, cr: 0, br: 0, bc: 1, bl: 0, cl: 0 },
        ...config.rowProps,
      },
      init() {},
    },
    isComponent(el) {
      // return el.dataset && el.dataset.gjsType === TYPES.section;
      return false
    },
  }

  // Force default styles
  const { styles = '', attributes } = def.model.defaults
  def.model.defaults.styles = styles + ` [data-gs-type="row"] { display:table; width:100%;}`
  def.model.defaults.attributes = { ...attributes, 'data-gs-type': 'row' }

  domComponents.addType(type, def)
}
