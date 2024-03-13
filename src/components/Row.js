import { TYPES, GS_TYPES, RESIZER_NONE, MAX_COLUMNS } from '../consts'

export default (domComponents, config) => {
  const { tableProps = {} } = config
  const type = tableProps.type || TYPES.row
  const gsType = GS_TYPES.row

  const def = {
    extend: 'table',
    extendFn: ['initTraits'],
    model: {
      defaults: {
        name: 'Row',
        columns: MAX_COLUMNS,
        droppable: false, // these components can be DROPPED INTO THIS one
        resizable: { ...RESIZER_NONE, bc: 1 },
        unstylable: ['padding'],
        ...config.rowProps,
      },
      init() {
        this.afterInit()
      },
      afterInit() {},
    },
  }

  // Force default styles
  const { styles = '', attributes } = def.model.defaults
  const defaultStyles = ` [data-gs-type="${gsType}"] { display:table; width:100%;table-layout:fixed; }`

  def.model.defaults.styles = styles + defaultStyles
  def.model.defaults.attributes = { ...attributes, 'data-gs-type': gsType }

  domComponents.addType(type, def)
}
