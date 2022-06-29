import { TYPES, RESIZER_NONE } from '../consts'
import { elHasClass } from './utils'

const type = TYPES.table

export default (domComponents, { editor, ...config }) => {
  domComponents.addType(type, {
    extend: 'table',
    model: {
      defaults: {
        name: 'Row',
        tagName: 'table',
        badgable: true,
        selectable: true,
        hoverable: true,
        draggable: `[data-gjs-type=wrapper], [data-gjs-type=${TYPES.column}]`, // IT CAN BE DRAGGED INTO these components
        droppable: false, // these components CAN BE DROPPED INTO IT
        resizable: {
          ...RESIZER_NONE,
          bc: true,
        },
        ...config.rowProps,
      },
      init() {
        const css = editor.Css;
        this.get('classes').pluck('name').indexOf(type) < 0 && this.addClass(type);
        css.getRule(`.${type}`) || css.setRule(`.${type}`, {
          display: 'table',
          width: '100%',
          height: '250px',
        });
      },
    },
    isComponent(el) {
      // return el.dataset && el.dataset.gjsType === TYPES.section;
      if (elHasClass(el, type)) return { type };
    },
  })
}
