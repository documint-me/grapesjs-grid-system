import { TYPES, RESIZER_NONE } from '../consts'

export default (domComponents, { editor }) => {
  domComponents.addType(TYPES.column, {
    extend: 'text',
    model: {
      defaults: {
        tagName: 'div',
        name: 'Column',
        attributes: {
          'data-dm-category': 'layout',
        },
        styles: `
          [data-columns="1"] {width: 8.33%;}
          [data-columns="2"] {width: 16.66%;}
          [data-columns="3"] {width: 24.99%;}
          [data-columns="4"] {width: 33.32%;}
          [data-columns="5"] {width: 41.65%;}
          [data-columns="6"] {width: 49.98%;}
          [data-columns="7"] {width: 58.31%;}
          [data-columns="8"] {width: 66.64%;}
          [data-columns="9"] {width: 74.97%;}
          [data-columns="10"] {width: 83.30%;}
          [data-columns="11"] {width: 91.63%;}
          [data-columns="12"] {width: 99.96%;}
          [data-columns]{ float: left; min-height: 0.125rem; }`,
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
            const oneColWidth = parentEl.offsetWidth / 12
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

              if ((spanSum < 12 && grow) || columnForChange) {
                const selectedNewSpan = selected.getNextSpan(grow)
                selected.setSizeClass(selectedNewSpan)
              }

              if (columnForChange && spanSum === 12) {
                const columnForChangeNewSpan = columnForChange.getNextSpan(!grow)
                columnForChange.setSizeClass(columnForChangeNewSpan)
              }
            }
          },
          ...RESIZER_NONE,
          cr: true,
          cl: true,
        },
        draggable: `[data-gjs-type=${TYPES.section}]`, // IT CAN BE DRAGGED INTO these components
        droppable: true,
      },

      setColumns(value) {
        if (!value) return
        const attrs = this.getAttributes()
        attrs['data-columns'] = value
        this.setAttributes(attrs)
      },
      getColumns() {
        const attributes = this.getAttributes()
        const value = attributes['data-columns']
        let result = value
        if (typeof trait === 'string' && !isNaN(parseInt(value))) result = parseInt(value)
        return result
      },

      setSizeClass(size) {
        if (size > 0 && size <= 12) this.setColumns(size)
      },
      getSpan() {
        return this.getColumns() || 12
      },
      getNextSpan(isGrowing) {
        const oldSpan = this.getSpan()
        const newSpan = isGrowing ? oldSpan + 1 : oldSpan > 1 ? oldSpan - 1 : 1

        if (newSpan > 0 && newSpan <= 12) return newSpan

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
