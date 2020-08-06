import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
import Icon from 'ol/style/Icon'
import poletop from './poletop'

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
  }
  const style = [new Style({
    image: new Circle({
      radius: radius,
      stroke: new Stroke({
        color: '#fff',
      }),
      fill: new Fill({
        color: 'rgba(51,153,204,.7)',
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