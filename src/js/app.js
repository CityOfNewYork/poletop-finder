/**
 * @module poletop-finder/App
 */

import $ from 'jquery'
import FinderApp from 'nyc-lib/nyc/ol/FinderApp'
import CsvPoint from 'nyc-lib/nyc/ol/format/CsvPoint'
import decorations from './decorations'
import facilityStyle from './facility-style'
import poletop from './poletop'
import Cluster from 'ol/source/Cluster'
import {ExtentGetCenter} from 'ol/extent'

class App extends FinderApp {
	/**
	 * @desc Create an instance of App
	 * @public
	 * @constructor
	 */
	constructor() {
		super({
			title: '4G Poletop Installation Locations',
			facilityFormat: new CsvPoint({
        x: 'x',
        y: 'y',
        dataProjection: 'EPSG:2263'
      }),
			facilityStyle,
			decorations: [decorations],
			facilityUrl: poletop.PUBLIC_DATA_URL,
			facilityTabTitle: 'Locations',
			facilitySearch: { displayField: 'search_label', nameField: 'search_name' },
			geoclientUrl: poletop.GEOCLIENT_URL,
			directionsUrl: poletop.DIRECTIONS_URL
		})
	}
  createSource(options) {
		this.notClusteredSrc = super.createSource(options)
		this.clusteredSrc = new Cluster({
			distance: poletop.CLUSTER_DISTANCE,
			source: this.notClusteredSrc
		})
		this.decorateClusteredFeatures()
		this.clusteredSrc.on('change', $.proxy(this.decorateClusteredFeatures, this))
		this.view.on('change:resolution', $.proxy(this.cluster, this))
		return this.notClusteredSrc
	}
	decorateClusteredFeatures() {
		this.clusteredSrc.getFeatures().forEach(feature => {
			feature.getTip = () => {
				return feature.get('features').length + ' poletop devices'
			}
		})
	}
	cluster() {
		const previousSrc = this.source
		if (this.view.getZoom() < 12) {
			this.source = this.clusteredSrc
		} else {
			this.source = this.notClusteredSrc
		}
		if (previousSrc !== this.source) {
			this.layer.setSource(this.source)
			this.resetList()
		}
	}
	ready(feats) {
		super.ready(feats)
		this.hackPopup()
	}
	hackPopup() {
		const pop = this.popup
		pop.showFeatures = (features, coordinate) => {
			let clusteredFeatures = []
			features.forEach(feature => {
				const more = feature.get('features')
				if (more) {
					clusteredFeatures = clusteredFeatures.concat(more)
				}
			})
			features = clusteredFeatures.length ? clusteredFeatures : features
			coordinate = coordinate || ExtentGetCenter(features[0].getGeometry().getExtent())
			pop.pager.show(features)
			pop.show({coordinate})
		}
	}
}

export default App