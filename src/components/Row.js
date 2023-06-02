import { TYPES, GS_TYPES, RESIZER_NONE, MAX_COLUMNS } from '../consts'

export default (domComponents, { editor, ...config }) => {
  const { tableProps = {} } = config
  const type = tableProps.type || TYPES.row
  const gsType = GS_TYPES.row

  const def = {
    extend: 'table',
    extendFn: ['initTraits'],
    model: {
      defaults: {
        name: 'Row',
        lastColumns: MAX_COLUMNS,
        columns: MAX_COLUMNS,
        droppable: false, // these components can be DROPPED INTO THIS one
        resizable: { ...RESIZER_NONE, bc: 1 },
        unstylable: ['padding'],
        ...config.rowProps,
      },
      init() {
        this.on('change:columns', this.updateColumnStyles)
        this.on('component:remove:before', this.cleanColumnStyles)
        this.updateColumnStyles()
      },
      initTraits() {
        if (config.useIds) {
          const name = 'columns'
          const tr = this.get('traits')
          tr.unshift({
            name,
            label: 'Max Columns',
            type: 'number',
            changeProp: 1,
            min: 1,
            max: 18,
          })
          this.set('traits', tr)
        }
      },
      updateColumnStyles() {
        const cols = this.get('columns')
        const lastCols = this.get('lastColumns')
        const grid = cols * 2
        const id = this.getId()
        const css = editor.Css
        for (let i = 0; i < Math.max(grid, lastCols * 2); i++) {
          if (i >= grid) {
            css.remove(css.getRule(`[data-gs${config.useIds ? `-${id}` : ''}-columns="${i + 1}"]`))
          } else {
            css.setRule(`[data-gs${config.useIds ? `-${id}` : ''}-columns="${i + 1}"]`, {
              width: `${(100 / grid) * (i + 1)}%`,
            })
          }
          this.set('lastColumns', cols)
        }
      },
      cleanColumnStyles() {
        if (config.useIds) {
          const cols = this.get('columns')
          const lastCols = this.get('lastColumns')
          const id = this.getId()
          const css = editor.Css
          for (let i = 0; i < Math.max(cols * 2, lastCols * 2); i++) {
            css.remove(css.getRule(`[data-gs-${id}-columns="${i + 1}"]`))
          }
        }
      },
    },
  }

  // Force default styles
  const { styles = '', attributes } = def.model.defaults
  const defaultStyles = ` [data-gs-type="${gsType}"] { display:table; width:100%;table-layout:fixed; }`

  def.model.defaults.styles = styles + defaultStyles
  def.model.defaults.attributes = { ...attributes, 'data-gs-type': gsType }

  domComponents.addType(type, def)
}
