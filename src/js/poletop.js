/**
 * @module poletop-finder/poletop
 */

/**
* @desc Constants
* @public
* @const {Object<string, string>}
*/
const poletop = {
  CLUSTER_DISTANCE: 75,
  CLUSTER_RADIUS_DENOMINATOR: 10,
  GEOCLIENT_URL: 'https://maps.nyc.gov/geoclient/v2/search.json?app_key=74DF5DB1D7320A9A2&app_id=nyc-lib-example',
  DIRECTIONS_URL: 'https://maps.googleapis.com/maps/api/js?&sensor=false&libraries=visualization',
  PUBLIC_DATA_URL: 'https://data.cityofnewyork.us/resource/tbgj-tdd6.csv?$select=x_coord%20as%20x,y_coord%20as%20y,franchisee,on_street,cross_street_1,cross_street_2,borough,pole_type,bid_advisory,historic_advisory,park_advisory,school_advisory,zipcode,community_board,council_district,scenic_landmark_advisory&$where=equipment_installed_yes_no=%27Y%27',
  CSV_DATA_URL: 'data/poles.csv',
  DATA_URL: 'https://data.cityofnewyork.us/resource/ff6t-4cfd.csv?$select=x_coordina as x,y_coordina as y,franchisee,on_street,cross_stre as cross_street_1,cross_st_1 as cross_street_2,borough,zipcode,pole_class,bid_adviso as bid_advisory,historic_l as historic_advisory,parks_advi as park_advisory,scenic_lan as scenic_advisory,school_adv as school_advisory,borocd,coundist&$where=constructi=%27Yes%27'
}

export default poletop