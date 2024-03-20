import { ACTIONS, TYPES, GS_TYPES, MAX_COLUMNS } from '../consts'

export default (domComponents, { editor, ...config }) => {
  const { rowProps = {}, maxGrid, oldMaxGrid } = config
  const componentType = rowProps.type || TYPES.columns
  const gsType = GS_TYPES.columns
  const droppable = `[data-gs-type='${GS_TYPES.column}'], [data-dm-category='column'], [data-dm-category='content']`

  const def = {
    extend: 'row',
    model: {
      defaults: {
        name: 'Columns',
        icon: '<i class="gjs-badge__icon fa-kit fa-columns-1-1-1-1"></i>',
        selectable: false,
        hoverable: false,
        draggable: false, // this can be DRAGGED INTO THESE components
        droppable, // these components can be DROPPED INTO THIS one
        droppableEnabled: droppable,
      },
      init() {
        this.on('component:update:components', (component, components, update) => {
          if (component.getAttributes()['data-columns-reset'] === GS_TYPES.column) {
            editor.UndoManager.stop()
            component.removeAttributes('data-columns-reset')
            editor.UndoManager.start()
            this.resetColumns()
          } else {
            if (!component.setSizeClass) return
            const { action, index, add, temporary } = update
            if (action === ACTIONS.removeComponent) {
              removeComponentHandler(component, components, index, this.getMaxColumns())
            } else if (action || add) {
              const oldColumns = component.get('columnsModel')
              // COMING FROM TEMPORARY ACTION
              if (oldColumns && oldColumns !== this.getId()) {
                const oldColsComp = editor.Components.getById(oldColumns)
                oldColsComp && oldColsComp.distributeColumns()
              }
              addNewComponentHandler(component, components, index, this.getMaxColumns(), maxGrid)
            } else if (temporary) {
              component.set('columnsModel', this.getId())
            }
          }
          this.setDroppable(components)
        })
        this.listenTo(this.getRow(), 'change:columns', this.resetColumns)
        this.resetColumns()
        this.setDroppable(this.components())
      },
      setDroppable(components) {
        if (components.length >= this.getMaxColumns()) {
          this.set({ droppable: `[data-columns-id=${this.getId()}]` })
        } else {
          const droppable = this.get('droppableEnabled')
          this.set({ droppable })
        }
      },
      distributeColumns() {
        distributeMissing(this.components().models, maxGrid)
      },
      resetColumns() {
        resetComponentsHandler(this.components(), maxGrid, oldMaxGrid)
      },
      getRow() {
        return this.parent()
      },
      getMaxColumns() {
        try {
          return this.parent().get('columns')
        } catch (error) {
          return MAX_COLUMNS
        }
      },
    },
  }

  // Force defaults
  const { attributes = {}, styles = '' } = def.model.defaults
  const defaultStyles = `
    [data-gs-type="${gsType}"] { 
      display:table-row;
      vertical-align: inherit;
      break-inside: auto;
    }`
  def.model.defaults.styles = styles + defaultStyles
  def.model.defaults.attributes = { ...attributes, 'data-gs-type': gsType }

  domComponents.addType(componentType, def)
}

function distributeMissing(components, maxGrid) {
  const spanSum = components.reduce((sum, col) => sum += (col.getSpan && col.getSpan()) || 0, 0)

  if (spanSum !== maxGrid) {
    const less = maxGrid - spanSum
    const len = components.length
    const lostSpan = Math.floor(less / len)
    let remainder = less % len 
    for (let i = 0; i < len; i++) {
      const left = Math.max(0, remainder)
      if (components[i] && components[i].getSpan && components[i].setSizeClass) {
        const span = components[i].getSpan()
        components[i].setSizeClass(left ? span + lostSpan + 1 : span + lostSpan)
        remainder--
      }
    }
    return
  }
}

function addNewComponentHandler(component, components, index, maxColumns, maxGrid) {
  const { models } = components
  if (models.length > maxColumns) {
    return
  }
  const oldComponents = [...models.slice(index + 1), ...models.slice(0, index).reverse()]
  let sizeLeft = true
  let oldComponentIndex = 0
  let collectSpan = 0

  const componentSpan = component.getColumns()

  if (!componentSpan) {
    component.setSizeClass(2)
  }

  const spanSum = [...oldComponents, component].reduce((sum, col) => sum += (col.getSpan && col.getSpan()) || 0, 0)

  while (sizeLeft && oldComponentIndex < oldComponents.length && spanSum !== maxGrid) {
    const oldComponent = oldComponents[oldComponentIndex]
    const span = oldComponent.getSpan ? oldComponent.getSpan() : 0

    if (span > 3) {
      const newSpan = Math.ceil(span / 2)
      oldComponent.setSizeClass(span - newSpan)
      component.setSizeClass(newSpan)
      sizeLeft = false
    } else if (span === 3) {
      collectSpan++
      oldComponent.setSizeClass(span - 1)
      component.setSizeClass(collectSpan)
      sizeLeft = collectSpan !== 2
    }

    oldComponentIndex++
  }
  distributeMissing([...oldComponents, component], maxGrid)
}

function resetComponentsHandler(components, maxGrid, oldMaxGrid) {
  const { models } = components
  const spanSum = models.reduce((sum, col) => sum += (col.getSpan && col.getSpan()) || 0, 0)
  const isEqualToOldSpanSum = oldMaxGrid && spanSum === oldMaxGrid

  if (!isEqualToOldSpanSum && spanSum !== maxGrid) {
    const len = models.length
    const span = Math.floor(maxGrid / len)
    let remainder = maxGrid % len

    for (let i = 0; i < Math.max(len, maxGrid); i++) {
      if (i >= maxGrid) {
        false && models[i] && models[i].removeAttributes(`data-gs-${models[i].getRowId()}-columns`)
      } else if (i < maxGrid) {
        const left = Math.max(0, remainder)
        if (models[i] && models[i].setSizeClass) {
          models[i].setSizeClass(left ? span + 1 : span)
          remainder--
        }
      }
    }
  }
}

function removeComponentHandler(component, components, index, maxColumns) {
  if (!components) return
  const { length: componentsLength } = components
  if (componentsLength >= maxColumns) return

  const closestIndex = index === componentsLength ? index - 1 : index
  if (index >= 0 && componentsLength > 0) {
    const closestComponent = components.models[closestIndex]
    const closestComponentSpan = closestComponent.getSpan()
    const deletedComponentSpan = component.getSpan()
    closestComponent.setSizeClass(deletedComponentSpan + closestComponentSpan)
  } else {
    if (!parent || !component.parent) return
    const parent = component.parent && component.parent()
    parent.append({
      type: TYPES.column,
    })
  }
}
