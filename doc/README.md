# Geoportal SDK API Reference

The Geoportal SDK (Software Developement Kit) is an integrated javascript API that allows web application developpers to easyly integrate dynamic geoportal based maps on a web page.

It is a wrapper over the following libraries :

* <a href="http://openlayers.org/"> OpenLayers </a>

* <a href="http://www.itowns-project.org/"> iTowns </a>

* <a href="https://github.com/IGNF/geoportal-extensions/blob/master/build/jsdoc/README-openlayers.md"> Geoportal extension for OpenLayers </a>

* <a href="https://github.com/IGNF/geoportal-extensions/blob/master/build/jsdoc/README-itowns.md"> Geoportal extension for iTowns </a>

## Basic usage

Create a Map and attach it to your web page with the {@link module:Map Gp.Map.load()} function. It returns a {@link Gp.Map} object which provides methods to interact with the created map.

Example :

``` javascript
var map = Gp.map.load(
    "mapDiv",                     // html element id  where to attach the map
    {                             // mapOptions
        apiKey : "YOUR_API_KEY",  // geoportal access key
        viewMode : "3d",          // "2d" by default.
        center : {                // -> map center params
            location : "73 avenue de Paris, Saint-Mandé"
        },
        zoom : 16,                // -> zoom level
        layersOptions : {         // -> map layers params
            "ORTHOIMAGERY.ORTHOPHOTOS" : {}
        }
    }
) ;

```

## Functionalities

Geoportal SDK provides a simple Application Programmation Interface that allows developers to create a map with the following possibilities :

### Map and view positionning (center, orientation and zoom).

See [Gp.MapOptions properties](Gp.MapOptions.html) : **center**, **azimuth**, **zoom**, ... and {@link Gp.Map} dedicated methods : [Gp.Map.setCenter()](Gp.Map.html#.setCenter), [Gp.Map.setAzimuth()](Gp.Map.html#.setAzimuth), [Gp.Map.setZoom()](Gp.Map.html#.setZoom), ...

### Map composition (layers composition and markers positioning)

See [Gp.MapOptions properties](Gp.MapOptions.html) : **layerOptions** and  **markerOptions** and {@link Gp.Map} dedicated methods : [Gp.Map.addLayers()](Gp.Map.html#.addLayers), [Gp.Map.modifyLayers()](Gp.Map.html#.modifyLayers), [Gp.Map.removeLayers()](Gp.Map.html#.removeLayers), ...

See {@link Gp.LayerOptions} to have a overview of layer types availables.

### Providing various interaction tools for end users

See [Gp.MapOptions property](Gp.MapOptions.html) : **controlsOptions**  and {@link Gp.Map} dedicated methods : [Gp.Map.addControls()](Gp.Map.html#.addControls), [Gp.Map.modifyControls()](Gp.Map.html#.modifyControls), [Gp.Map.removeControls()](Gp.Map.html#.removeControls), ...

See {@link Gp.ControlOptions} to have a list of tools availables.

### Being able to react to end users interactions with the map.

See [Gp.MapOptions property](Gp.MapOptions.html) : **mapEventsOptions** and {@link Gp.Map} dedicated methods : [Gp.Map.listen()](Gp.Map.html#.listen), [Gp.Map.forget()](Gp.Map.html#.forget).

## Advanced Functionalities

If you want more functionalities, you will then have to use those offered by :

* [OpenLayers API](http://openlayers.org/en/latest/apidoc/) and its [dedicated Geoportal extension](https://github.com/IGNF/geoportal-extensions/blob/master/build/jsdoc/README-openlayers.md) which are part of the Geoportal SDK.

* [iTowns API](http://www.itowns-project.org/itowns/docs/) and its [dedicated Geoportal extension](https://github.com/IGNF/geoportal-extensions/blob/master/build/jsdoc/README-itowns.md) which are part of the Geoportal SDK.

Also note that the [Geoportal Access library API](https://github.com/IGNF/geoportal-access-lib) is also available with the Geoportal SDK.
