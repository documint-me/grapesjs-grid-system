import grapesjs from 'grapesjs'
import blocks from './blocks'
import loadComponents from './components'
import loadBlocks from './blocks'
import defaultOptions from './options'
import { TYPES } from './consts'

export default grapesjs.plugins.add('gjs-grid-system', (editor, opts = {}) => {
  let c = opts

  let defaults = {
    default_css: true,
    default_components: true,
  }

  // Load defaults
  for (let name in defaults) {
    if (!(name in c)) c[name] = defaults[name]
  }

  if (c.default_css) {
    let css = `
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
    padding: 5px !important;
  } 
  `

    editor.addStyle(css)
  }

  if (c.default_components) {
    editor.on('load', function () {
      editor.BlockManager.remove('column1')
      editor.BlockManager.remove('column2')
      editor.BlockManager.remove('column3')
      editor.BlockManager.remove('column3-7')
    })
  }

  editor.BlockManager.add(TYPES.section, blocks.row)
  editor.BlockManager.add(TYPES.column, blocks.column)

  const options = {
    ...defaultOptions,
    ...opts,
  }

  // Add components
  loadComponents(editor, options)

  // Add blocks
  loadBlocks(editor, options)
})
