import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
import Icon from 'ol/style/Icon'
import poletop from './poletop'
import nycOl from 'nyc-lib/nyc/ol'

const getRadius = (resolution) => {
  let radius = 7
  const zoom = nycOl.TILE_GRID.getZForResolution(resolution)
  if (zoom < poletop.CLUSTER_CUTOFF_ZOOM) {
    return radius
  }
  if (zoom > 17) radius = 19
  else if (zoom > 16) radius = 16
  else if (zoom > 15) radius = 13
  else if (zoom > 14) radius = 10
  return radius
}

const style = (feature, resolution) => {
  let radius = 7
  let text
  if (feature.isCommunityBoard) {
    const count = feature.getCount()
    radius = count / window.CLUSTER_RADIUS_DENOMINATOR
    if (radius < 7) {
      radius = 7
    }
    text = new Text({
      text: `${count}`,
      font: 'bold 9px sans-serif',
      fill: new Fill({
        color: '#fff',
      }),
    })
  } else {
    radius = getRadius(resolution)
  }
  const style = [new Style({
    image: new Circle({
      radius: radius,
      stroke: new Stroke({
        color: '#fff',
      }),
      fill: new Fill({
        color: 'rgb(46,107,164,.7)'
      }),
    })
  })]
  if (text) {
    style[0].setText(text)
  } else if (feature.isInstalled()) {
    style.push(new Style({
      image: new Icon({
        src: 'img/signal.svg',
        imageSize: [512, 512],
        scale: radius * 1.5 / 512
      })
    }))
  }
  return style
}

export default style