import Column from './Column'
import Row from './Row'
import Table from './Table'

export default (editor, config = {}) => {
  const dc = editor.DomComponents
  const opts = {
    ...config,
    defaultModel: dc.getType('default').model,
    editor,
  }

  ;[Table, Row, Column].forEach((c) => c(dc, opts))
}
