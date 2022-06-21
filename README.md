# GrapesJS Grid System Plugin

This plugin add the Grid System for editor


<b>GrapesJS Development</b> - <a href="https://devfuture.pro/grapesjs-development/" target="_blank">link</a>
<br/>

## Summary

* Plugin
  * Name: `gis-plugin-grid`
  * Options:
      * `default_css` Disable the default grid css, default =  true
      * `default_components` Remove from blocks 4 default components, default =  true



## Download

* `npm i grapesjs-plugin-grid`
* Latest release link  {ADD URL}



## Usage

```html
<link href="path/to/grapes.min.css" rel="stylesheet"/>
<script src="path/to/grapes.min.js"></script>
<script src="dist/grapesjs-plugin-grid.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container : '#gjs',
      plugins: ['gis-plugin-grid'],
      pluginsOpts: {
        'gis-plugin-grid': {
            default_css: true,
            default_components: true,
          }
      }
  });
</script>
```



## Development

Clone the repository

```sh
$ git clone {ADD URL}
$ cd grapesjs-plugin-grid
```

Install dependencies

```sh
$ npm i
```

Start the dev server

```sh
$ npm start
```
