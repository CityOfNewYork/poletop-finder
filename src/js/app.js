/**
 * @module poletop-finder/App
 */

import $ from 'jquery'
import FinderApp from 'nyc-lib/nyc/ol/FinderApp'
import CsvPoint from 'nyc-lib/nyc/ol/format/CsvPoint'
import decorations from './decorations'
import facilityStyle from './facility-style'
import poletop from './poletop'
import GeoJSON from 'ol/format/GeoJSON'
import {getCenter} from 'ol/extent'
import fetchTimeout from 'nyc-lib/nyc/fetchTimeout'
import SocrataJson from 'nyc-lib/nyc/ol/source/SocrataJson'
import SocrataFormat from 'nyc-lib/nyc/ol/format/SocrataJson'
import Decorate from 'nyc-lib/nyc/ol/format/Decorate'
import {bbox} from 'ol/loadingstrategy'
import {fromExtent as polygonFromExtent} from 'ol/geom/Polygon'
import Vector from 'ol/source/Vector'
import MapLocator from 'nyc-lib/nyc/ol/MapLocator'

MapLocator.ZOOM_LEVEL = 14

class App extends FinderApp {
	/**
	 * @desc Create an instance of App
	 * @public
	 * @constructor
	 */
	constructor() {
		super({
			title: 'Mobile Telecommunications Poletop Infrastructure Locations',
			facilityStyle,
			facilityTabTitle: 'Locations',
			geoclientUrl: poletop.GEOCLIENT_URL,
			splashOptions: App.getSplashOptions(document.location.search),
			filterChoiceOptions: [{
				title: 'Construction Status',
				choices: [
					{name: 'equipment_installed_yes_no', values: ['N'], label: 'Approved', checked: true},
					{name: 'equipment_installed_yes_no', values: ['Y'], label: 'Completed', checked: true}
				]
			}]
		})
		this.layer.setZIndex(5000)
		this.view.on('change', $.proxy(this.cluster, this))
	}
	zoomTo(feature) {
    const popup = this.popup
    if ($('#tabs .btns h2:first-of-type').css('display') !== 'none') {
      this.tabs.open('#map')
    }
		if (!feature.isCommunityBoard) {
			this.map.once('moveend', () => {
				const panIntoView = popup.panIntoView
				popup.panIntoView = () => {}
				popup.showFeature(feature)
				popup.panIntoView = panIntoView
			})
		}
    this.view.animate({
      center: feature.getGeometry().getCoordinates(),
      zoom: $('body').hasClass('community-board') ? 14 : 17
    })
  }
	showPoles(event) {
		const feature = $(event.currentTarget).data('feature')
		this.popup.hide()
		this.zoomTo(feature)
	}
	getUrl() {
		const extent = this.view.calculateExtent(this.map.getSize())
		extent[0] = extent[0] - 500
		extent[1] = extent[1] - 500
		extent[2] = extent[2] + 500
		extent[3] = extent[3] + 500
		const ext = polygonFromExtent(extent)
      .transform('EPSG:3857', 'EPSG:2263')
      .getExtent()
			const where = `x_coord > ${ext[0]} and x_coord < ${ext[2]} and y_coord > ${ext[1]} and y_coord < ${ext[3]}`
		return `${poletop.POLE_DATA_URL}&$where=${encodeURIComponent(where)}`
	}
  createSource() {
		const me = this
		me.communityBoardCounts = {}
		me.cdSrc = super.createSource({
			facilityUrl: poletop.COMMUNITY_BOARD_URL,
			decorations: [decorations.common, decorations.communityBoard],
			facilityFormat: new CsvPoint({
				x: 'x',
				y: 'y',
				dataProjection: 'EPSG:2263'
			})
		})
		fetchTimeout(poletop.GROUPED_DATA_URL).then(response => {
			response.text().then(csv => {
				const rows = Papa.parse(csv, {header: true}).data
				rows.forEach(row => {
					me.communityBoardCounts[row.community_board] = row.count
				})
				me.layer.changed()
				me.resetList()
			})
		})
		return me.cdSrc
	}
	cluster() {
		if (this.view.getZoom() < poletop.CLUSTER_CUTOFF_ZOOM) {
			$('body').addClass('community-board')
			const prevSrc = this.source
			this.layer.setSource(this.cdSrc)
			this.source = this.cdSrc
			if (this.source !== prevSrc) {
				this.resetList()
			}
			if (this.tabs.active.attr('id') === 'filters') {
				this.tabs.open('#facilities')
			}
			$('#tabs').addClass('no-flt')
		} else {
			$('body').removeClass('community-board')
			const poleSrc = super.createSource({
				facilityUrl: this.getUrl(),
				decorations: [decorations.common, decorations.pole],
				facilityFormat: new CsvPoint({
					id: 'id',
					x: 'x_coord',
					y: 'y_coord',
					dataProjection: 'EPSG:2263'
				})
			})
			poleSrc.autoLoad().then(() => {
				this.source = poleSrc
				$('#tabs').removeClass('no-flt')
				this.filters.source = poleSrc
				this.filters.filter()
				this.layer.setSource(poleSrc)
				this.resetList()
			})
		}
	}
	resetList(event) {
    const hide = this.popup.hide
		if (this.source !== this.cdSrc) {
			this.popup.hide = () => {}
		}
		super.resetList(event)
    this.popup.hide = hide
	}
  mobileDiaOpts() {
    const location = this.location
    const locationName = location.name
    const feature = this.source.sort(location.coordinate)[0]
    const options = {
      buttonText: [
        `<span class="msg-vw-list">View ${$('#tab-btn-1').text()} list</span>`,
        '<span class="msg-vw-map">View the map</span>'
			],
			message: `<strong>${locationName}</strong>`
    }
    return options
  }
}

App.getSplashOptions = (search) => {
	if (search.indexOf('splash=false') === -1) {
		return {
			message: poletop.SPLASH_MESSAGE,
			buttonText: ['Screen reader instructions', 'View map']
		}
	}
}
export default App