/**
 * @module poletop-finder/App
 */

import $ from 'jquery'
import FinderApp from 'nyc-lib/nyc/ol/FinderApp'
import CsvPoint from 'nyc-lib/nyc/ol/format/CsvPoint'
import decorations from './decorations'
import facilityStyle from './facility-style'
import poletop from './poletop'


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
        x: 'x_coord',
        y: 'y_coord',
        dataProjection: 'EPSG:2263'
      }),
			facilityStyle: facilityStyle.pointStyle,
			decorations: [decorations],
			facilityUrl: poletop.DATA_URL,
			facilityTabTitle: 'Locations',
			facilitySearch: { displayField: 'search_label', nameField: 'search_name' },
			geoclientUrl: poletop.GEOCLIENT_URL,
			directionsUrl: poletop.DIRECTIONS_URL
		})
	}
}

export default App