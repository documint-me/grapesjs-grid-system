import Column from './Column'
import Row from './Row'
import Table from './Table'
import defaults from './options'

export default (editor, config = {}) => {
  const dc = editor.DomComponents
  const opts = {
    ...defaults,
    ...config,
    defaultModel: dc.getType('default').model,
    editor,
  }

  ;[Table, Row, Column].forEach((c) => c(dc, opts))
}
