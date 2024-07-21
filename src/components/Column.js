import { ACTIONS, TYPES, GS_TYPES, RESIZER_NONE, RESIZABLE_PROPS, MAX_COLUMNS } from '../consts'
//LEAVING LOG FUNCTION FOR NOW

const log = (component, name = '', ...otherArgs) => {
  console.log(`COLUMN [${component.getId()}] : ${name}`, ...otherArgs)
}

export default (domComponents, { editor, ...config }) => {
  const { columnProps = {}, maxGrid } = config
  const type = columnProps.type || TYPES.column
  const gsType = GS_TYPES.column

  const sizeClassStylesMap = {}
  for (let i = 0; i < maxGrid; i++) {
    sizeClassStylesMap[i + 1] = `${(100 / maxGrid) * (i + 1)}%`
  }

  const def = {
    extend: 'cell',
    model: {
      defaults: {
        name: 'Column',
        draggable: `[data-gs-type="${GS_TYPES.columns}"]`, // this can be DRAGGED INTO THESE components
        prevRowId: '',
        traits: [
          {
            name: 'width',
            type: 'number',
            placeholder: '100',
            min: 1,
            max: 100,
            changeProp: true,
          },
        ],
        resizable: {
          updateTarget: (el, rect, opt) => {
            editor.UndoManager.stop()
            const { currentPos, handlerAttr } = opt.resizer
            const { x: currentX } = currentPos
            const selected = el.__gjsv.model
            const maxColumns = maxGrid

            if (!selected) return

            let startX = Number(selected.get(RESIZABLE_PROPS.startX)) || currentX
            selected.set(RESIZABLE_PROPS.startX, startX)

            let prevX = Number(selected.get(RESIZABLE_PROPS.prevX)) || currentX
            selected.set(RESIZABLE_PROPS.prevX, prevX)

            let prevDirection = selected.get(RESIZABLE_PROPS.prevDirection)
            let currentDirection = currentX > prevX ? 'right' : currentX < prevX ? 'left' : prevDirection

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
              const spanSum = components.models.reduce((sum, col) => (sum += (col.getSpan && col.getSpan()) || 0), 0)

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
        // log(this, 'init')
        this.getRowId()
        this.on('change:status', (comp) => {
          if (comp.changed.status === ACTIONS.selected) {
            this.resetHandles(comp)
            this.matchWidth()
            // FALLBACK TO CORRECT ALL COLUMN WIDTHS
            this.correctWidth()
            this.setColumnAttr()
          }
        })
        this.on('change:width', this.onWidthChange)
        this.on('change:columns', this.matchWidth)
      },
      onWidthChange() {
        // log(this, 'onWidthChange')
        const width = parseInt(this.get('width'))
        width !== this.getColumns() && this.updateNeighbouringColumns(width)
      },
      matchWidth() {
        // log(this, 'matchWidth')
        const cols = this.getColumns()
        // console.log('cols before setiing', cols)
        this.set('width', cols)
        const widthTrait = this.getTrait('width')
        widthTrait && widthTrait.set('value', cols)
        // console.log('matchWidth() \n', 'cols: ', cols, '\n widthTrait: ', widthTrait, ' \n ')
      },
      setColumnAttr() {
        // log(this, 'setColumnAttr')

        try {
          this.addAttributes({ 'data-columns-id': this.parent().getId() })
        } catch (error) {
          // do nothing
        }
      },
      correctWidth() {
        // log(this, 'correctWidth')
        try {
          this.parent().distributeColumns()
        } catch (error) {
          // do nothing
        }
      },
      resetHandles(comp, row = true) {
        const pcomps = comp.parent() && comp.parent().components()

        if (!pcomps || pcomps.length == 1 || !row) {
          comp.get('resizable').cr = false
          comp.get('resizable').cl = false
        } else if (pcomps) {
          const last = Object.keys(pcomps.models)[Object.keys(pcomps.models).length - 1]
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
      },

      removeColumns() {},

      setColumns(value) {
        // log(this, 'setColumns')
        if (!value) return
        this.set('columns', value)
        this.addAttributes({ 'data-gs-columns': value })
        this.addStyle({ width: sizeClassStylesMap[value] })
        // log(this, 'setColumns - END', value)
      },

      getColumns() {
        // log(this, `getColumns`, this.get('columns'))
        return this.get('columns')
      },

      getMaxColumns() {
        // console.log('COLUMN: getMaxColumns')
        try {
          return this.parent().parent().get('columns')
        } catch (error) {
          return MAX_COLUMNS
        }
      },

      getRowId() {
        try {
          const prevRowId = this.parent().parent().getId()
          this.set({ prevRowId })
          return prevRowId
        } catch (error) {
          return this.get('prevRowId')
        }
      },

      setSizeClass(size) {
        // log(this, 'setSizeClass', size)
        if (size > 0 && size <= maxGrid) this.setColumns(size)
      },

      getSpan() {
        // log(this, 'getSpan', this.getAttributes())
        const attrs = this.getAttributes()
        const width = attrs.width
        const cols = this.getColumns()
        log(this, 'getSpan', `cols: ${cols}`, `width: ${width}`)
        return cols || (width && typeof width === 'string' && parseInt(width))|| maxGrid
      },

      getNextSpan(isGrowing) {
        // log(this, 'getNextSpan')
        const oldSpan = this.getSpan()
        const newSpan = isGrowing ? oldSpan + 1 : oldSpan > 1 ? oldSpan - 1 : 1

        if (newSpan > 0 && newSpan <= maxGrid) return newSpan

        return oldSpan
      },
      updateNeighbouringColumns(width) {
        // log(this, 'updateNeighbouringColumns')
        const maxColumns = maxGrid
        const columnIndex = this.index()

        const parent = this.parent()
        if (!parent) return

        const columnComponents = parent.components()
        if (!columnComponents) return

        const { models } = columnComponents
        const peerComponents = [...models.slice(columnIndex + 1), ...models.slice(0, columnIndex).reverse()]

        const columnsLength = peerComponents.length

        if (!columnsLength) {
          this.setSizeClass(24)
          return
        }

        const columnSpan = this.getSpan()

        let delta = width - columnSpan

        if (width > columnSpan) {
          const maxPossibleWidth = maxColumns - columnsLength
          this.setSizeClass(width > maxPossibleWidth ? maxPossibleWidth : width)
          if (width > maxPossibleWidth) {
            for (let index = 0; index < peerComponents.length; index++) {
              const component = peerComponents[index]
              component.setSizeClass(1)
            }
          } else {
            let index = 0
            let sizeLeft = true
            while (sizeLeft && index < peerComponents.length) {
              const component = peerComponents[index]
              const componentSpan = component.getSpan()
              component.setSizeClass(componentSpan > delta ? componentSpan - delta : 1)
              delta -= componentSpan > delta ? delta : componentSpan - 1
              sizeLeft = delta > 0
              index++
            }
          }
        } else {
          this.setSizeClass(width)
          peerComponents[0].setSizeClass(peerComponents[0].getSpan() - delta)
        }
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
