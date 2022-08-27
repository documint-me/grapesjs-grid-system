import { ACTIONS, TYPES, GS_TYPES, MAX_COLUMNS } from '../consts'

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
            addNewComponentHandler(component, components, index)
          }
          if (action === ACTIONS.removeComponent) {
            removeComponentHandler(component, components, index, MAX_COLUMNS)
          }
        })
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

function addNewComponentHandler(component, components, index) {
  const { models } = components
  const oldComponents = [...models.slice(index + 1), ...models.slice(0, index).reverse()]
  let sizeLeft = true
  let oldComponentIndex = 0

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
