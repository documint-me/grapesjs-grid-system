import Column from './Column'
import Row from './Row'

export default (editor, config = {}) => {
  const dc = editor.DomComponents
  const opts = {
    ...config,
    defaultModel: dc.getType('default').model,
    editor,
  }

  ;[Row, Column].forEach((c) => c(dc, opts))
}
