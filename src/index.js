import grapesjs from 'grapesjs';

export const TYPES = {
  column: 'dm-column',
  section: 'dm-section',
}

export const MAX_COMPONENTS_LENGTH = 12;

export const ACTIONS = {
  addComponent: 'add-component',
  removeComponent: 'remove-component',
  cloneComponent: 'clone-component',
  moveComponent: 'move-component',
};

export const resizerNone = { tl: 0, tc: 0, tr: 0, cr: 0, br: 0, bc: 0, bl: 0, cl: 0 };

export default grapesjs.plugins.add('gis-plugin-grid', (editor, opts = {}) => {
  let c = opts;

  let defaults = {
    default_css: true,
    default_components: true,
  };

  // Load defaults
  for (let name in defaults) {
    if (!(name in c))
      c[name] = defaults[name];
  }

  if(c.default_css){
  let css = `
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
    padding: 5px !important;
  } 
  [class^="col"]{
    float: left;
    min-height: 0.125rem;
  }
  
  .col-md-1 {
    width: 8.33%;
  }
  
  .col-md-2 {
    width: 16.66%;
  }
  
  .col-md-3 {
    width: 24.99%;
  }
  
  .col-md-4 {
    width: 33.32%;
  }
  
  .col-md-5 {
    width: 41.65%;
  }
  
  .col-md-6 {
    width: 49.98%;
  }
  
  .col-md-7 {
    width: 58.31%;
  }
  
  .col-md-8 {
    width: 66.64%;
  }
  
  .col-md-9 {
    width: 74.97%;
  }
  
  .col-md-10 {
    width: 83.30%;
  }
  
  .col-md-11 {
    width: 91.63%;
  }
  
  .col-md-12 {
    width: 99.96%;
  }

  *[data-gjs-type='dm-section']:empty {
    min-height: 100px;
  }

  *[data-gjs-type='dm-section']:empty,
  *[data-gjs-type='dm-column']:empty {
    min-height: 100px;
    position: relative;
    color: inherit;
  }

  *[data-gjs-type='dm-section']:empty:before,
  *[data-gjs-type='dm-column']:empty:before {
    content: '';
    height: calc(100% - 14px);
    background-size: 80% clamp(20px, 50%, 50px);
    background-repeat: no-repeat;
    border-radius: 4px;
    background-position: center;
    z-index: 1;
    background-color: #73737340 !important;
    -webkit-filter: invert(100%);
    filter: invert(100%);
    min-height: 100px;
    margin: 5px;
  }

  *[data-gjs-type^='dm-']:empty:before,
  *[data-gjs-type^='dm-']:empty:after {
    color: #838caa !important;
    /* font-family: Inter, Helvetica, Arial; */
    display: block;
  }

  .gjs-hovered[data-gjs-type='dm-section']:empty:before,
  .gjs-hovered[data-gjs-type='dm-column']:empty:before {
    background-color: #73737360 !important;
  }

  *[data-gjs-type='dm-section']:empty {
    min-height: 100px;
  }

  *[data-gjs-type='dm-column']:empty:before {
    background-image: url('/src/column-empty-state.svg');
  }
  `;

  editor.addStyle(css);
  }

  const columnComponent = {
    type: TYPES.column,
  }

  if(c.default_components){
  editor.on("load", function(){ 
    editor.BlockManager.remove('column1');
    editor.BlockManager.remove('column2');
    editor.BlockManager.remove('column3');
    editor.BlockManager.remove('column3-7');
  });
  }

  editor.BlockManager.add(TYPES.section, {
    label: 'Section',
    category: 'Layout',
    attributes: {
      class: "gjs-fonts gjs-f-b1"
    },
    content: {
      type: TYPES.section,
      components: [ columnComponent ],
    },
  });

  editor.BlockManager.add(TYPES.column, {
    label: 'Column',
    category: 'Layout',
    attributes: {
      class: "gjs-fonts gjs-f-b3"
    },
    content: columnComponent,
  })

  editor.DomComponents.addType(TYPES.section, {
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
          const parent = component.parent();
          if (parent && parent.components().models.length > MAX_COMPONENTS_LENGTH) {
            component.remove();
          }
        });

        editor.on('component:create', (component) => {
          if (typeof component.setSizeClass === 'function') {
          }
        });

        this.on(
          'component:update:components',
          (component, components, update) => {
            const { action, index } = update;

            if (
              action === ACTIONS.addComponent ||
              action === ACTIONS.moveComponent ||
              action === ACTIONS.cloneComponent
            ) {
              addNewComponentHandler(component, components, index);
            }

            if (action === ACTIONS.removeComponent) {
              removeComponentHandler(component, components, index);
            }
          }
        );
      },
    },
    isComponent(el) {
      // return el.dataset && el.dataset.gjsType === TYPES.section;
      return false;
    },
  });

  editor.DomComponents.addType(TYPES.column, {
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
            const deltaX = opt.resizer.delta.x;
            const side = opt.resizer.handlerAttr === 'cr' ? 'right' : 'left';
            const selected = editor.getSelected();

            if (!selected) {
              return;
            }

            const prevDeltaX = Number(selected.get('prevDeltaX') || deltaX);
            const parent = selected.parent();
            const parentEl = parent.getEl();
            const oneColWidth = parentEl.offsetWidth / 12;
            const prevDiv = Math.trunc(prevDeltaX / oneColWidth);
            const div = Math.trunc(deltaX / oneColWidth);
            const mustBeChanged = div !== prevDiv;
            const grow =
              (deltaX < 0 && side === 'left') ||
              (deltaX > 0 && side === 'right');
            const shrink =
              (deltaX > 0 && side === 'left') ||
              (deltaX < 0 && side === 'right');

            selected.set('prevDeltaX', deltaX);

            if ((shrink || grow) && mustBeChanged) {
              const columnForChange = selected.getNextColumnForChange(
                side,
                grow
              );

              const spanSum = parent.components().models.reduce((sum, col) => {
                sum += col.getSpan();
                return sum;
              }, 0);

              if ((spanSum < 12 && grow) || columnForChange) {
                const selectedNewSpan = selected.getNextSpan(grow);
                selected.setSizeClass(selectedNewSpan);
              }

              if (columnForChange && spanSum === 12) {
                const columnForChangeNewSpan = columnForChange.getNextSpan(
                  !grow
                );
                columnForChange.setSizeClass(columnForChangeNewSpan);
              }
            }
          },
          ...resizerNone,
          cr: true,
          cl: true,
        },
        draggable: `[data-gjs-type=${TYPES.section}]`, // IT CAN BE DRAGGED INTO these components
        droppable: true,
      },
      setSizeClass(size) {
        const classes = this.getClasses();
        const classNameIndex = classes.findIndex((className) =>
          className.startsWith('col-md-')
        );

        if (size > 0 && size <= 12) {
          const sizeClass = `col-md-${size}`;
          if (classNameIndex > -1) {
            classes[classNameIndex] = sizeClass;
          } else {
            classes.push(sizeClass);
          }
          this.setClass(classes);
        }
      },
      getSpan() {
        const currentSize = 'md';
        const testRegexp = new RegExp('^col-' + currentSize + '-\\d{1,2}$');
        const [columnClassName] = this.getClasses().filter((className) =>
          testRegexp.test(className)
        );

        if (columnClassName) {
          const [, , span] = columnClassName.split('-');

          return Number(span);
        }

        return 12;
      },
      getNextSpan(isGrowing) {
        const oldSpan = this.getSpan();
        const newSpan = isGrowing ? oldSpan + 1 : oldSpan > 1 ? oldSpan - 1 : 1;

        if (newSpan > 0 && newSpan <= 12) {
          return newSpan;
        }

        return oldSpan;
      },
      getNextColumnForChange(side, isGrowing) {
        const columnIndex = this.index();
        const nextIndex = side === 'right' ? columnIndex + 1 : columnIndex - 1;
        const columnsLength = this.parent().components().models.length;
        if (nextIndex < 0 || nextIndex >= columnsLength) {
          return;
        }

        const nextColumn = this.parent().getChildAt(nextIndex);
        if (!nextColumn) {
          return;
        }

        const columnSpan = this.getSpan();
        const nextColumnSpan = nextColumn.getSpan();

        if (
          (!isGrowing && columnSpan > 1) ||
          (isGrowing && nextColumnSpan > 1)
        ) {
          return nextColumn;
        } else if (isGrowing) {
          return nextColumn.getNextColumnForChange(side, isGrowing);
        } else {
          return undefined;
        }
      },
    },

    isComponent(el) {
      // return el.dataset && el.dataset.gjsType === TYPES.column;
      return false;
    },
  });


  function addNewComponentHandler(component, components, index) {
    const { models } = components;
    const oldComponents = [
      ...models.slice(index + 1),
      ...models.slice(0, index).reverse(),
    ];
    let sizeLeft = true;
    let oldComponentIndex = 0;
  
    while (sizeLeft && oldComponentIndex < oldComponents.length) {
      const oldComponent = oldComponents[oldComponentIndex];
      const span = oldComponent.getSpan();
  
      if (span !== 1) {
        const newSpan = Math.ceil(span / 2);
        oldComponent.setSizeClass(span - newSpan);
        component.setSizeClass(newSpan);
        sizeLeft = false;
      }
  
      oldComponentIndex++;
    }
  }
  
  function removeComponentHandler(component, components, index) {
    const { length: componentsLength } = components;
    if (componentsLength >= MAX_COMPONENTS_LENGTH) {
      return;
    }
    const closestIndex = index === componentsLength ? index - 1 : index;
    if (index >= 0 && componentsLength > 0) {
      const closestComponent = components.models[closestIndex];
      const closestComponentSpan = closestComponent.getSpan();
      const deletedComponentSpan = component.getSpan();
      closestComponent.setSizeClass(deletedComponentSpan + closestComponentSpan);
    } else {
      const parent = component.parent();
      parent.append({
        type: TYPES.column,
      });
    }
  }
});