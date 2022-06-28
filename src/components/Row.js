import { ACTIONS, TYPES, MAX_COLUMNS } from '../consts'

export default (domComponents, { editor, ...config }) => {
  const { rowProps = {} } = config
  const type = rowProps.type || TYPES.row

  const def = {
    extend: 'row',
    model: {
      defaults: {
        name: 'Columns',
        tagName: 'tr',
        selectable: false,
        draggable: false, // IT CAN BE DRAGGED INTO these components
        droppable: `[data-gjs-type=${TYPES.column}]`, // these components CAN BE DROPPED INTO IT
      },
      init() {
        editor.on('component:add', (component) => {
          const parent = component.parent()
          if (parent && parent.components().models.length > MAX_COLUMNS) {
            component.remove()
          }
        })

        // editor.on('component:create', (component) => {
        //   // if (typeof component.setSizeClass === 'function') {}
        // })

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
    isComponent(el) {
      // return el.dataset && el.dataset.gjsType === TYPES.section;
      return false
    },
  }

  // Force defaults
  const { attributes = {}, styles = '' } = def.model.defaults

  def.model.defaults.styles = styles + ` [data-gs-type="columns"] { display:table-row; }`
  def.model.defaults.attributes = { ...attributes, 'data-gs-type': 'columns' }

  domComponents.addType(type, def)
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
  const { length: componentsLength } = components
  if (componentsLength >= maxColumns) {
    return
  }
  const closestIndex = index === componentsLength ? index - 1 : index
  if (index >= 0 && componentsLength > 0) {
    const closestComponent = components.models[closestIndex]
    const closestComponentSpan = closestComponent.getSpan()
    const deletedComponentSpan = component.getSpan()
    closestComponent.setSizeClass(deletedComponentSpan + closestComponentSpan)
  } else {
    const parent = component.parent()
    parent.append({
      type: TYPES.column,
    })
  }
}
