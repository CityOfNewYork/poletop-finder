import Style from 'ol/style/Style'
import Circle from 'ol/style/Circle'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
import poletop from './poletop'

const style = (feature, resolution) => {
  const features = feature.get('features')
  let radius = 10
  let text
  if (features) {
    const size = features.length
    radius = size / poletop.CLUSTER_RADIUS_DENOMINATOR
    text = new Text({
      text: size.toString(),
      fill: new Fill({
        color: '#fff',
      }),
    })
  }
  const style = new Style({
    image: new Circle({
      radius: radius,
      stroke: new Stroke({
        color: '#fff',
      }),
      fill: new Fill({
        color: '#3399CC',
      }),
    })
  })
  if (text) {
    style.setText(text)
  }
  return style
}

export default style