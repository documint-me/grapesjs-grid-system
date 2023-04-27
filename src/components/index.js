import Column from "./Column";
import Columns from "./Columns";
import Row from "./Row";
import { GS_TYPES } from "../consts";

export default (editor, config = {}) => {
  const dc = editor.DomComponents;
  const opts = {
    ...config,
    editor,
  };

  [Row, Columns, Column].forEach((c) => c(dc, opts));

  editor.on("component:mount", (component) => {
    if (component.getAttributes()["data-gs-type"] === GS_TYPES.column) {
      const parent = component.parent()
      const cur = parent.components().length
      const row = parent.parent()
      const columns = component.getColumns && component.getColumns()
      component.removeColumns()
      !row && component.resetHandles(component, false)
      row && columns && component.setColumns(columns);
      const max = row && component.getMaxColumns && component.getMaxColumns()
      if (max && cur > max) {
        editor.UndoManager.stop()
        component.set('layerable', false)
        component.set('selectable', false)
        component.remove()
        editor.UndoManager.start()
      }
    }
    if (
      component.getAttributes()['data-gs-type'] === GS_TYPES.row &&
      !component.parent() 
      // component.parent().getAttributes()["data-gs-type"] === GS_TYPES.columns
    ) {
      editor.UndoManager.stop()
      const el = component.getEl();
      if (el) {
        el.style.display = "none";
        el.remove();
      }
      component.remove();
      editor.UndoManager.start()
    }
  });
};
