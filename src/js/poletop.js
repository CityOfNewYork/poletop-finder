/**
 * @module poletop-finder/poletop
 */

/**
* @desc Constants
* @public
* @const {Object<string, string>}
*/
const poletop = {
  CLUSTER_RADIUS_DENOMINATOR: 11,
  CLUSTER_CUTOFF_ZOOM: 14,
  GEOCLIENT_URL: 'https://maps.nyc.gov/geoclient/v2/search.json?app_key=74DF5DB1D7320A9A2&app_id=nyc-lib-example',
  DIRECTIONS_URL: 'https://maps.googleapis.com/maps/api/js?&sensor=false&libraries=visualization',
  // POLE_DATA_URL: 'https://data.cityofnewyork.us/resource/tbgj-tdd6.csv?$select=x_coord%20as%20x,y_coord%20as%20y,reservation_date,zone,franchisee,on_street,cross_street_1,cross_street_2,borough,pole_type,bid_advisory,historic_advisory,scenic_landmark_advisory,park_advisory,school_advisory,zipcode,community_board,council_district,scenic_landmark_advisory,equipment_installed_yes_no',
  POLE_DATA_URL: 'https://data.cityofnewyork.us/resource/tbgj-tdd6.csv?',
  GROUPED_DATA_URL: 'https://data.cityofnewyork.us/resource/tbgj-tdd6.csv?$select=community_board,count(community_board)%20as%20count&$where=equipment_installed_yes_no=%27Y%27&$group=community_board',
  COMMUNITY_BOARD_URL: 'data/community-board.csv',
}
window.CLUSTER_RADIUS_DENOMINATOR = 11
export default poletop