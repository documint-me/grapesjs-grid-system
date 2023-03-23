import { ACTIONS, TYPES, GS_TYPES, RESIZER_NONE, RESIZABLE_PROPS } from '../consts'

export default (domComponents, { editor, ...config }) => {
  const { columnProps = {} } = config
  const type = columnProps.type || TYPES.column
  const gsType = GS_TYPES.column

  const def = {
    extend: 'cell',
    model: {
      defaults: {
        name: 'Column',
        draggable: `[data-gs-type="${GS_TYPES.columns}"]`, // this can be DRAGGED INTO THESE components
        resizable: {
          updateTarget: (el, rect, opt) => {
            editor.UndoManager.stop()
            const { currentPos, handlerAttr } = opt.resizer
            const { x: currentX } = currentPos
            const selected = el.__gjsv.model
            const maxColumns = selected.getMaxColumns()

            if (!selected) return

            let startX = Number(selected.get(RESIZABLE_PROPS.startX)) || currentX
            selected.set(RESIZABLE_PROPS.startX, startX)

            let prevX = Number(selected.get(RESIZABLE_PROPS.prevX)) || currentX
            selected.set(RESIZABLE_PROPS.prevX, prevX)

            let prevDirection = selected.get(RESIZABLE_PROPS.prevDirection)
            let currentDirection = currentX > prevX ? 'right' :
              (currentX < prevX ? 'left' : prevDirection)

            if (currentDirection !== prevDirection) {
              startX = prevX
              selected.set(RESIZABLE_PROPS.startX, startX)
              selected.set(RESIZABLE_PROPS.prevDeltaX, undefined)
            }

            const side = handlerAttr === 'cr' ? 'right' : 'left'
            const deltaX = Math.abs(currentX - startX)
            const prevDeltaX = Number(selected.get(RESIZABLE_PROPS.prevDeltaX) || deltaX)
            const parent = selected.parent()

            const oneColWidth = parent.getEl().offsetWidth / maxColumns
            const prevDiv = Math.trunc(prevDeltaX / oneColWidth)
            const div = Math.trunc(deltaX / oneColWidth)
            const mustBeChanged = div !== prevDiv

            const grow =
              (currentDirection === 'right' && side === 'right') || (currentDirection === 'left' && side === 'left')
            const shrink =
              (currentDirection === 'right' && side === 'left') || (currentDirection === 'left' && side === 'right')

            if ((shrink || grow) && mustBeChanged) {
              const columnForChange = selected.getNextColumnForChange(side, grow)
              const components = parent && parent.components && parent.components()
              if (!components) return
              const spanSum = components.models.reduce((sum, col) => sum += col.getSpan(), 0)

              editor.UndoManager.start()

              if ((spanSum < maxColumns && grow) || columnForChange) {
                selected.setSizeClass(selected.getNextSpan(grow))
              }

              if (columnForChange && spanSum === maxColumns) {
                columnForChange.setSizeClass(columnForChange.getNextSpan(!grow))
              }
            }
            editor.UndoManager.stop()

            selected.set(RESIZABLE_PROPS.prevX, currentX)
            selected.set(RESIZABLE_PROPS.prevDirection, currentDirection)
            selected.set(RESIZABLE_PROPS.prevDeltaX, deltaX)

            if (opt.store == 1) {
              selected.set(RESIZABLE_PROPS.startX, undefined)
              selected.set(RESIZABLE_PROPS.prevX, undefined)
              selected.set(RESIZABLE_PROPS.prevDirection, undefined)
              selected.set(RESIZABLE_PROPS.prevDeltaX, undefined)
            }
          },
          ...RESIZER_NONE,
          cr: true,
          cl: true,
        },
        ...config.columnProps,
      },

      init() {
        this.on('change:status', (comp) => {
          if (comp.changed.status === ACTIONS.selected) {
            const pcomps = comp.parent() && comp.parent().components()
            const last = Object.keys(pcomps.models)[Object.keys(pcomps.models).length - 1]

            if (pcomps.length == 1) {
              comp.get('resizable').cr = false
              comp.get('resizable').cl = false
            } else {
              if (pcomps.models[0].cid == comp.cid) {
                comp.get('resizable').cr = true
                comp.get('resizable').cl = false
              } else if (pcomps.models[last].cid == comp.cid) {
                comp.get('resizable').cr = false
                comp.get('resizable').cl = true
              } else {
                comp.get('resizable').cr = true
                comp.get('resizable').cl = true
              }
            }
          }
        })
      },

      removeColumns() {},


      setColumns(value) {
        if (!value) return
        this.set('columns', value)
      },

      getColumns() {
        return this.get('columns')
      },

      getMaxColumns() {
        return this.parent().parent().get('columns')
      },

      getRowId() {
        return this.parent().parent().getId()
      },

      setSizeClass(size) {
        if (size > 0 && size <= this.getMaxColumns()) this.setColumns(size)
      },

      getSpan() {
        return this.getColumns() || this.getMaxColumns()
      },

      getNextSpan(isGrowing) {
        const oldSpan = this.getSpan()
        const newSpan = isGrowing ? oldSpan + 1 : oldSpan > 1 ? oldSpan - 1 : 1

        if (newSpan > 0 && newSpan <= this.getMaxColumns()) return newSpan

        return oldSpan
      },
      getNextColumnForChange(side, isGrowing) {
        const columnIndex = this.index()
        const nextIndex = side === 'right' ? columnIndex + 1 : columnIndex - 1
        const parent = this.parent()
        if (!parent) return
        const parentsComponents = parent.components()

        if (!parentsComponents) return

        const columnsLength = parentsComponents.models.length

        if (nextIndex < 0 || nextIndex >= columnsLength) return

        const nextColumn = this.parent().getChildAt(nextIndex)
        if (!nextColumn) return

        const columnSpan = this.getSpan()
        const nextColumnSpan = nextColumn.getSpan()

        if ((!isGrowing && columnSpan > 1) || (isGrowing && nextColumnSpan > 1)) {
          return nextColumn
        } else if (isGrowing) {
          return nextColumn.getNextColumnForChange(side, isGrowing)
        } else {
          return undefined
        }
      },
    },
  }

  // Force defaults
  const { attributes = {}, styles = '' } = def.model.defaults
  const defaultStyles = ` [data-gs-type="${gsType}"]{ vertical-align: inherit; overflow:hidden; word-break:break-word;}`
  def.model.defaults.styles = styles + defaultStyles
  def.model.defaults.attributes = { ...attributes, 'data-gs-type': gsType }

  domComponents.addType(type, def)
}
