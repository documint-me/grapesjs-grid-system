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
      const columns = component.getColumns();
      columns && component.setColumns(columns);
    }
    if (
      component.getAttributes()['data-gs-type'] === GS_TYPES.row &&
      !component.parent() 
      // component.parent().getAttributes()["data-gs-type"] === GS_TYPES.columns
    ) {
      const el = component.getEl();
      el && (el.style.display = "none");
      component.remove();
    }
  });
};
