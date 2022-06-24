import { TYPES, RESIZER_NONE, MAX_COLUMNS } from '../consts'

export default (domComponents, { editor, ...config }) => {
  domComponents.addType(TYPES.column, {
    extend: 'cell',
    model: {
      defaults: {
        tagName: 'td',
        name: 'Column',
        styles: `
          [data-gjs-type="${TYPES.column}"]{}          
          [data-gs-columns="1"] {width: 8.3333%;}          
          [data-gs-columns="2"] {width: 16.6666%;}          
          [data-gs-columns="3"] {width: 25%;}          
          [data-gs-columns="4"] {width: 33.3333%;}          
          [data-gs-columns="5"] {width: 41.6666%;}          
          [data-gs-columns="6"] {width: 50%;}          
          [data-gs-columns="7"] {width: 58.3333%;}          
          [data-gs-columns="8"] {width: 66.6666%;}          
          [data-gs-columns="9"] {width: 75%;}          
          [data-gs-columns="10"] {width: 83.3333%;}          
          [data-gs-columns="11"] {width: 91.6666%;}          
          [data-gs-columns="12"] {width: 100%;}
          `,
        resizable: {
          updateTarget: (el, rect, opt) => {
            const deltaX = opt.resizer.delta.x
            const side = opt.resizer.handlerAttr === 'cr' ? 'right' : 'left'
            const selected = editor.getSelected()

            if (!selected) {
              return
            }

            const prevDeltaX = Number(selected.get('prevDeltaX') || deltaX)
            const parent = selected.parent()
            const parentEl = parent.getEl()
            const oneColWidth = parentEl.offsetWidth / MAX_COLUMNS
            const prevDiv = Math.trunc(prevDeltaX / oneColWidth)
            const div = Math.trunc(deltaX / oneColWidth)
            const mustBeChanged = div !== prevDiv
            const grow = (deltaX < 0 && side === 'left') || (deltaX > 0 && side === 'right')
            const shrink = (deltaX > 0 && side === 'left') || (deltaX < 0 && side === 'right')

            selected.set('prevDeltaX', deltaX)

            if ((shrink || grow) && mustBeChanged) {
              const columnForChange = selected.getNextColumnForChange(side, grow)

              const spanSum = parent.components().models.reduce((sum, col) => {
                sum += col.getSpan()
                return sum
              }, 0)

              if ((spanSum < MAX_COLUMNS && grow) || columnForChange) {
                let selectedNewSpan = selected.getNextSpan(grow)
                selected.setSizeClass(selectedNewSpan)
              }

              if (columnForChange && spanSum === MAX_COLUMNS) {
                const columnForChangeNewSpan = columnForChange.getNextSpan(!grow)
                columnForChange.setSizeClass(columnForChangeNewSpan)
              }
            }
          },
          ...RESIZER_NONE,
          cr: true,
          cl: true,
        },
        draggable: `[data-gjs-type=${TYPES.row}]`, // IT CAN BE DRAGGED INTO these components
        droppable: true,
        ...config.columnProps,
      },

      init() {},

      setColumns(value) {
        if (!value) return
        const attrs = this.getAttributes()
        attrs['data-gs-columns'] = value
        this.setAttributes(attrs)
      },

      getColumns() {
        const attributes = this.getAttributes()
        const value = attributes['data-gs-columns']
        let result = value
        if (typeof trait === 'string' && !isNaN(parseInt(value))) result = parseInt(value)
        return result
      },

      setSizeClass(size) {
        if (size > 0 && size <= MAX_COLUMNS) this.setColumns(size)
      },

      getSpan() {
        const columns = this.getColumns() || MAX_COLUMNS
        return columns
      },

      getNextSpan(isGrowing) {
        const oldSpan = this.getSpan()
        const newSpan = isGrowing ? oldSpan + 1 : oldSpan > 1 ? oldSpan - 1 : 1

        if (newSpan > 0 && newSpan <= MAX_COLUMNS) return newSpan

        return oldSpan
      },
      getNextColumnForChange(side, isGrowing) {
        const columnIndex = this.index()
        const nextIndex = side === 'right' ? columnIndex + 1 : columnIndex - 1
        const columnsLength = this.parent().components().models.length
        if (nextIndex < 0 || nextIndex >= columnsLength) {
          return
        }

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

    isComponent(el) {
      // return el.dataset && el.dataset.gjsType === TYPES.column;
      return false
    },
  })
}
