import { ACTIONS, TYPES, GS_TYPES } from '../consts'

export default (domComponents, { ...config }) => {
  const { rowProps = {} } = config
  const componentType = rowProps.type || TYPES.columns
  const gsType = GS_TYPES.columns
  const droppable = `[data-gs-type='${GS_TYPES.column}'], [data-gs-type='${GS_TYPES.row}']`

  const def = {
    extend: 'row',
    model: {
      defaults: {
        name: 'Columns',
        selectable: false,
        hoverable: false,
        draggable: false, // this can be DRAGGED INTO THESE components
        droppable, // these components can be DROPPED INTO THIS one
      },
      init() {
        this.on('component:update:components', (component, components, update) => {
          if (component.getAttributes()['data-gs-type'] === GS_TYPES.row) {
            const { action, index } = update
            if (action !== ACTIONS.removeComponent) {
              component.set('layerable', false)
              component.set('selectable', false)
              const cols = component.components().models[0].components()
              cols.each((col) => col.removeColumns())
              const toHandle = JSON.parse(JSON.stringify(cols))
              const el = component.getEl()
              el && (el.style.display = 'none')
              component.remove()
              this.append(toHandle, { at: index })
              this.resetColumns()
            }
          } else {
            if (!component.setSizeClass) return
            const { action, index } = update
            if (action === ACTIONS.removeComponent) {
              removeComponentHandler(
                component,
                components,
                index,
                this.getMaxColumns()
              )
            } else {
              addNewComponentHandler(
                component,
                components,
                index,
                this.getMaxColumns()
              )
            }
          }
          if (components.length >= this.getMaxColumns()) {
            this.set({ droppable: false })
          } else {
            this.set({ droppable })
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

  const componentSpan = component.getColumns()

  if (!componentSpan) {
    component.setSizeClass(2)
  }

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
  const len = models.length
  const maxGrid = maxColumns * 2
  const span = Math.floor(maxGrid / len)
  let remainder = maxGrid % len

  for (let i = 0; i < Math.max(len, maxGrid); i++) {
    if (i >= maxGrid) {
      config.useIds && models[i] && models[i].removeAttributes(`data-gs-${models[i].getRowId()}-columns`)
    } else if (i < maxGrid) {
      const left = Math.max(0, remainder)
      models[i] && models[i].setSizeClass(left ? span + 1 : span)
      remainder--
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
