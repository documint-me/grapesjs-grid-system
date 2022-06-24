import { ACTIONS, TYPES, MAX_COMPONENTS_LENGTH } from '../consts'

export default (domComponents, { editor }) => {
  domComponents.addType(TYPES.section, {
    extend: 'text',
    model: {
      defaults: {
        name: 'Section',
        draggable: true, // IT CAN BE DRAGGED INTO these components
        droppable: `[data-gjs-type=${TYPES.column}]`, // these components CAN BE DROPPED INTO IT
        attributes: { class: 'container' },
      },
      init() {
        editor.on('component:add', (component) => {
          const parent = component.parent()
          if (parent && parent.components().models.length > MAX_COMPONENTS_LENGTH) {
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
            removeComponentHandler(component, components, index)
          }
        })
      },
    },
    isComponent(el) {
      // return el.dataset && el.dataset.gjsType === TYPES.section;
      return false
    },
  })
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

function removeComponentHandler(component, components, index) {
  const { length: componentsLength } = components
  if (componentsLength >= MAX_COMPONENTS_LENGTH) {
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
