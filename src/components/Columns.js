import { ACTIONS, TYPES, GS_TYPES } from '../consts'

export default (domComponents, { ...config }) => {
  const { rowProps = {} } = config
  const componentType = rowProps.type || TYPES.columns
  const gsType = GS_TYPES.columns

  const def = {
    extend: 'row',
    model: {
      defaults: {
        name: 'Columns',
        selectable: false,
        hoverable: false,
        draggable: false, // this can be DRAGGED INTO THESE components
        droppable: `[data-gs-type='${GS_TYPES.column}']`, // these components can be DROPPED INTO THIS one
      },
      init() {
        this.on('component:update:components', (component, components, update) => {
          const { action, index } = update
          if (
            action === ACTIONS.addComponent ||
            action === ACTIONS.moveComponent ||
            action === ACTIONS.cloneComponent
          ) {
            addNewComponentHandler(
              component,
              components,
              index,
              this.getMaxColumns()
            )
          }
          if (action === ACTIONS.removeComponent) {
            removeComponentHandler(
              component,
              components,
              index,
              this.getMaxColumns()
            )
          }
        })
        this.listenTo(this.getRow(), 'change:columns', this.resetColumns)
      },
      resetColumns() {
        resetComponentsHandler(this.components(), this.getMaxColumns())
      },
      getRow() {
        return this.parent()
      },
      getMaxColumns() {
        return this.parent().get('columns')
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

function addNewComponentHandler(component, components, index, maxColumns) {
  const { models } = components
  if (models.length > maxColumns) {
    return
  }
  const oldComponents = [...models.slice(index + 1), ...models.slice(0, index).reverse()]
  let sizeLeft = true
  let oldComponentIndex = 0

  component.setSizeClass(1)
  while (sizeLeft && oldComponentIndex < oldComponents.length) {
    const oldComponent = oldComponents[oldComponentIndex]
    const span = oldComponent.getSpan()

    if (span !== 1) {
      const newSpan = Math.ceil(span / 2)
      oldComponent.setSizeClass(span - newSpan)
      component.setSizeClass(newSpan)
      sizeLeft = false
    }

    oldComponentIndex++
  }
}

function resetComponentsHandler(components, maxColumns) {
  const { models } = components

  for (let i = 0; i < Math.max(models.length, maxColumns); i++) {
    if (i >= maxColumns) {
      models[i] && models[i].removeAttributes(`data-gs-${models[i].getRowId()}-columns`)
    } else if (i < maxColumns) {
      models[i] && models[i].setSizeClass(1)
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
