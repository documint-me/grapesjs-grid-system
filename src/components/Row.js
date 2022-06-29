import { TYPES, GS_TYPES } from '../consts'

export default (domComponents, { ...config }) => {
  const { tableProps = {} } = config
  const type = tableProps.type || TYPES.row
  const gsType = GS_TYPES.row

  const def = {
    extend: 'table',
    model: {
      defaults: {
        name: 'Row',
        tagName: 'table',
        badgable: true,
        selectable: true,
        hoverable: true,
        draggable: true, // this can be DRAGGED INTO THESE components
        droppable: false, // these components can be DROPPED INTO THIS one
        resizable: { tl: 0, tc: 0, tr: 0, cr: 0, br: 0, bc: 1, bl: 0, cl: 0 },
        ...config.rowProps,
      },
    },
    isComponent() {
      return false
    },
  }

  // Force default styles
  const { styles = '', attributes } = def.model.defaults
  const defaultStyles = ` [data-gs-type="${gsType}"] { display:table; width:100%;}`

  def.model.defaults.styles = styles + defaultStyles
  def.model.defaults.attributes = { ...attributes, 'data-gs-type': gsType }

  domComponents.addType(type, def)
}
