import { TYPES, RESIZER_NONE } from '../consts'

export default (domComponents, { editor }) => ({
  extend: 'text',
  model: {
    defaults: {
      tagName: 'div',
      name: 'Column',
      attributes: {
        'data-dm-category': 'layout',
      },
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
    setSizeClass(size) {
      const classes = this.getClasses()
      const classNameIndex = classes.findIndex((className) => className.startsWith('col-md-'))

      if (size > 0 && size <= 12) {
        const sizeClass = `col-md-${size}`
        if (classNameIndex > -1) {
          classes[classNameIndex] = sizeClass
        } else {
          classes.push(sizeClass)
        }
        this.setClass(classes)
      }
    },
    getSpan() {
      const currentSize = 'md'
      const testRegexp = new RegExp('^col-' + currentSize + '-\\d{1,2}$')
      const [columnClassName] = this.getClasses().filter((className) => testRegexp.test(className))

      if (columnClassName) {
        const [, , span] = columnClassName.split('-')

        return Number(span)
      }

      return 12
    },
    getNextSpan(isGrowing) {
      const oldSpan = this.getSpan()
      const newSpan = isGrowing ? oldSpan + 1 : oldSpan > 1 ? oldSpan - 1 : 1

      if (newSpan > 0 && newSpan <= 12) {
        return newSpan
      }

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
      if (!nextColumn) {
        return
      }

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
