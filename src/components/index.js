import Column from './Column';
import Columns from './Columns';
import Row from './Row';

export default (editor, config = {}) => {
  const dc = editor.DomComponents;
  const opts = {
    ...config,
    editor,
  };

  [Row, Columns, Column].forEach((c) => c(dc, opts));
}
