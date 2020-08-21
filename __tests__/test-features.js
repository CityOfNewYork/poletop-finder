import Feature from 'ol/Feature'
import decorations from '../src/js/decorations'
import Point from 'ol/geom/Point'

const mockApp = {zoomToArea: jest.fn(), communityBoardCounts: {'205': 100}}

let poleFeature, cbFeature

poleFeature = new Feature({
  id: 1,
  reservation_date: '12/29/2017',
  franchisee: 'franchisee',
  pole_type: 'CITY',
  borough: 'Brooklyn',
  cross_street_1: 'W 9th St',
  cross_street_2: 'W 10th St',
  zipcode: 'ZIP',
  on_street: 'Ave P',
  park_advisory: 'park_advisory',
  historic_advisory: 'historic_advisory',
  scenic_landmark_advisory: 'scenic_landmark_advisory',
  bid_advisory: 'bid_advisory',
  school_advisory: 'school_advisory',
  community_board: '305',
  council_district: '100',
  equipment_installed_yes_no: 'Y',
  zone: 'B',
  longitude: 73.9826700,
  latitude: 40.6078500,
  x_coord: 989062,
  y_coord: 160733
})

Object.assign(poleFeature, decorations.common, decorations.pole, {app: mockApp})
poleFeature.extendFeature()
poleFeature.setId(poleFeature.get('id'))
poleFeature.setGeometry(new Point([poleFeature.get('x_coord'), poleFeature.get('y_coord')]))

cbFeature = new Feature({
  community_board: '205',
  count: 100,
  x_coord: 989062,
  y_coord: 160733
})

Object.assign(cbFeature, decorations.common, decorations.communityBoard, {app: mockApp})
cbFeature.extendFeature()
cbFeature.setId(cbFeature.get('id'))
cbFeature.setGeometry(new Point([cbFeature.get('x_coord'), cbFeature.get('y_coord')]))


module.exports = {poleFeature,cbFeature}
