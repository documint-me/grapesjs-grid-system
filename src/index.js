import grapesjs from 'grapesjs'
import loadComponents from './components'
import loadBlocks from './blocks'
import defaultOptions from './options'

export default grapesjs.plugins.add('gjs-grid-system', (editor, opts = {}) => {
  const options = {
    ...defaultOptions,
    ...opts,
  }

  // Add components
  loadComponents(editor, options)

  // Add blocks
  loadBlocks(editor, options)
})
