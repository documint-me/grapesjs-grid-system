import Column from './Column'
import Row from './Row'
import Table from './Table'
import defaults from './options'
import { TYPES } from '../consts'

export default (editor, config = {}) => {
  const dc = editor.DomComponents
  const { table, row, column } = TYPES;
  const opts = {
    ...defaults,
    ...config,
    defaultModel: dc.getType('default').model,
    editor,
  }

  const privateCls = [`.${table}`, `.${row}`, `.${column}`];
  editor.on(
    'selector:add',
    selector =>
      privateCls.indexOf(selector.getFullName()) >= 0 &&
      selector.set('private', 1)
  );

  [Table, Row, Column].forEach((c) => c(dc, opts))
}
