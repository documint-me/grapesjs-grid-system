import grapesjs from 'grapesjs'
import blocks from './blocks'
import loadComponents from './components'
import loadBlocks from './blocks'
import defaultOptions from './options'
import { TYPES } from './consts'

export default grapesjs.plugins.add('gis-grid-system', (editor, opts = {}) => {
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
  [class^="col"]{
    float: left;
    min-height: 0.125rem;
  }
  
  .col-md-1 {
    width: 8.33%;
  }
  
  .col-md-2 {
    width: 16.66%;
  }
  
  .col-md-3 {
    width: 24.99%;
  }
  
  .col-md-4 {
    width: 33.32%;
  }
  
  .col-md-5 {
    width: 41.65%;
  }
  
  .col-md-6 {
    width: 49.98%;
  }
  
  .col-md-7 {
    width: 58.31%;
  }
  
  .col-md-8 {
    width: 66.64%;
  }
  
  .col-md-9 {
    width: 74.97%;
  }
  
  .col-md-10 {
    width: 83.30%;
  }
  
  .col-md-11 {
    width: 91.63%;
  }
  
  .col-md-12 {
    width: 99.96%;
  }

  *[data-gjs-type='dm-section']:empty {
    min-height: 100px;
  }

  *[data-gjs-type='dm-section']:empty,
  *[data-gjs-type='dm-column']:empty {
    min-height: 100px;
    position: relative;
    color: inherit;
  }

  *[data-gjs-type='dm-section']:empty:before,
  *[data-gjs-type='dm-column']:empty:before {
    content: '';
    height: calc(100% - 14px);
    background-size: 80% clamp(20px, 50%, 50px);
    background-repeat: no-repeat;
    border-radius: 4px;
    background-position: center;
    z-index: 1;
    background-color: #73737340 !important;
    -webkit-filter: invert(100%);
    filter: invert(100%);
    min-height: 100px;
    margin: 5px;
  }

  *[data-gjs-type^='dm-']:empty:before,
  *[data-gjs-type^='dm-']:empty:after {
    color: #838caa !important;
    /* font-family: Inter, Helvetica, Arial; */
    display: block;
  }

  .gjs-hovered[data-gjs-type='dm-section']:empty:before,
  .gjs-hovered[data-gjs-type='dm-column']:empty:before {
    background-color: #73737360 !important;
  }

  *[data-gjs-type='dm-section']:empty {
    min-height: 100px;
  }

  *[data-gjs-type='dm-column']:empty:before {
    background-image: url('/src/assets/column-empty-state.svg');
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
