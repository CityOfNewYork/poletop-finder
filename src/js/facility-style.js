import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
import Icon from 'ol/style/Icon'
import poletop from './poletop'
import nycOl from 'nyc-lib/nyc/ol'

const IS_IE = window.navigator.userAgent.indexOf("MSIE ")
const WIFI_ICON = IS_IE ? 'img/signal.png' :  'img/signal.svg'

const getRadius = (feature, resolution) => {
  let radius = 7
  const zoom = nycOl.TILE_GRID.getZForResolution(resolution)
  if (feature.isCommunityBoard) {
    radius = feature.getCount() / window.CLUSTER_RADIUS_DENOMINATOR
    if (radius < 7) {
      radius = 7
    }
  } else {
    if (zoom < poletop.CLUSTER_CUTOFF_ZOOM) {
      return radius
    }
    if (zoom > 17) radius = 19
    else if (zoom > 16) radius = 16
    else if (zoom > 15) radius = 13
    else if (zoom > 14) radius = 10
  }
  return radius
}

const style = (feature, resolution) => {
  let radius = getRadius(feature, resolution)
  let text
  if (feature.isCommunityBoard) {
    text = new Text({
      text: `${feature.getCount()}`,
      font: 'bold 9px sans-serif',
      fill: new Fill({
        color: '#fff',
      }),
    })
  }
  const style = [new Style({
    image: new Circle({
      radius: radius,
      stroke: new Stroke({
        color: '#fff',
      }),
      fill: new Fill({
        color: 'rgba(46,107,164,.7)'
      })
    })
  })]
  if (text) {
    style[0].setText(text)
  } else if (feature.isInstalled()) {
    style.push(new Style({
      image: new Icon({
        src: WIFI_ICON,
        imageSize: [512, 512],
        scale: radius * 1.5 / 512
      })
    }))
  }
  return style
}

const highLightStyle = (feature, resolution) => {
  return new Style({
    image: new Circle({
      radius: getRadius(feature, resolution) + 2,
      stroke: new Stroke({
        color: '#F8951D',
        width: 5
      })
    })
  })
}

export default {style, highLightStyle}