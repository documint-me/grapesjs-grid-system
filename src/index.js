import grapesjs from 'grapesjs'
import blocks from './blocks'
import loadComponents from './components'
import loadBlocks from './blocks'
import defaultOptions from './options'
import { TYPES } from './consts'

export default grapesjs.plugins.add('gjs-grid-system', (editor, opts = {}) => {
  const options = {
    ...defaultOptions,
    ...opts,
  }

  console.log('OPTIONS', options)

  editor.BlockManager.add(TYPES.row, blocks.row)
  editor.BlockManager.add(TYPES.column, blocks.column)

  // Add components
  loadComponents(editor, options)

  // Add blocks
  loadBlocks(editor, options)
})
