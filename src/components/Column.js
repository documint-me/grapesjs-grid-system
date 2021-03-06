import { TYPES, GS_TYPES, RESIZER_NONE, MAX_COLUMNS, RESIZABLE_PROPS } from '../consts'

export default (domComponents, { editor, ...config }) => {
  const { columnProps = {} } = config
  const type = columnProps.type || TYPES.column
  const gsType = GS_TYPES.column

  const def = {
    extend: 'cell',
    model: {
      defaults: {
        tagName: 'td',
        name: 'Column',
        draggable: `[data-gs-type="${GS_TYPES.columns}"]`, // this can be DRAGGED INTO THESE components
        droppable: true, // these components can be DROPPED INTO THIS one
        resizable: {
          updateTarget: (el, rect, opt) => {
            editor.UndoManager.stop()
            const { currentPos, handlerAttr } = opt.resizer
            const { x: currentX } = currentPos
            const selected = editor.getSelected()

            if (!selected) return

            let startX = Number(selected.get(RESIZABLE_PROPS.startX))
            if (!startX) {
              startX = currentX
              selected.set(RESIZABLE_PROPS.startX, startX)
            }

            let prevX = Number(selected.get(RESIZABLE_PROPS.prevX))
            if (!prevX) {
              prevX = currentX
              selected.set(RESIZABLE_PROPS.prevX, prevX)
            }

            let prevDirection = selected.get(RESIZABLE_PROPS.prevDirection)
            let currentDirection = undefined

            if (currentX > prevX) {
              currentDirection = 'right'
            } else if (currentX < prevX) {
              currentDirection = 'left'
            } else {
              currentDirection = prevDirection
            }

            if (currentDirection !== prevDirection) {
              startX = prevX
              selected.set(RESIZABLE_PROPS.startX, startX)
              selected.set(RESIZABLE_PROPS.prevDeltaX, undefined)
            }

            const side = handlerAttr === 'cr' ? 'right' : 'left'
            const deltaX = Math.abs(currentX - startX)
            const prevDeltaX = Number(selected.get(RESIZABLE_PROPS.prevDeltaX) || deltaX)
            const parent = selected.parent()

            const parentEl = parent.getEl()
            const oneColWidth = parentEl.offsetWidth / 12
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
              if (!components) {
                console.log('NO COMPONENTS')
                return
              }
              const spanSum = components.models.reduce((sum, col) => {
                sum += col.getSpan()
                return sum
              }, 0)

              editor.UndoManager.start()

              if ((spanSum < 12 && grow) || columnForChange) {
                const selectedNewSpan = selected.getNextSpan(grow)
                selected.setSizeClass(selectedNewSpan)
              }

              if (columnForChange && spanSum === 12) {
                const columnForChangeNewSpan = columnForChange.getNextSpan(!grow)
                columnForChange.setSizeClass(columnForChangeNewSpan)
              }
            }
            editor.UndoManager.stop()

            selected.set(RESIZABLE_PROPS.prevX, currentX)
            selected.set(RESIZABLE_PROPS.prevDirection, currentDirection)
            selected.set(RESIZABLE_PROPS.prevDeltaX, deltaX)

            if (opt.store == 1) {
              const selected = editor.getSelected()
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

        editor.on('component:selected', (comp) => {
          
          if(comp.get('type') == this.get('type')){
            const pcomps = comp.parent() && comp.parent().components();
            const last = Object.keys(pcomps.models)[Object.keys(pcomps.models).length-1];

            if(pcomps.length == 1){
              comp.get('resizable').cr = false;
              comp.get('resizable').cl = false;
            }else{
              if(pcomps.models[0].cid == comp.cid){
                comp.get('resizable').cr = true;
                comp.get('resizable').cl = false;
              }else if(pcomps.models[last].cid == comp.cid){
                comp.get('resizable').cr = false;
                comp.get('resizable').cl = true;
              }else{
                comp.get('resizable').cr = true;
                comp.get('resizable').cl = true;
              }
            }
          }
        });
        

      },

      setColumns(value) {
        if (!value) return
        const attrs = this.getAttributes()
        attrs['data-gs-columns'] = value
        this.set('columns', value)
        this.setAttributes(attrs)
      },

      getColumns() {
        const attributes = this.getAttributes()
        const value = attributes['data-gs-columns']
        let result = value
        if (typeof trait === 'string' && !isNaN(parseInt(value))) result = parseInt(value)
        const columns = this.get('columns')
        return columns
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
        const parent = this.parent()
        if (!parent) return
        const parentsComponents = parent.components()

        if (!parentsComponents) return

        const columnsLength = parentsComponents.models.length

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

    isComponent() {
      return false
    },
  }

  // Force defaults
  const { attributes = {}, styles = '' } = def.model.defaults
  const defaultStyles = ` 
    [data-gs-type="${gsType}"]{ vertical-align: inherit; overflow:hidden; word-break:break-word;}          
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
  `
  def.model.defaults.styles = styles + defaultStyles
  def.model.defaults.attributes = { ...attributes, 'data-gs-type': gsType }

  domComponents.addType(type, def)
}
