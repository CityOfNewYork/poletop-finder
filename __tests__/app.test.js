import FinderApp from 'nyc-lib/nyc/ol/FinderApp'
import App from '../src/js/App'
import poletop from '../src/js/poletop'
import decorations from '../src/js/decorations'
import facilityStyle from '../src/js/facility-style'
import Layer from 'ol/layer/Vector'

jest.mock('nyc-lib/nyc/ol/FinderApp')
jest.mock('ol/layer/Vector')

const rearrangeLayers = App.prototype.rearrangeLayers
const resizeBanner = App.prototype.resizeBanner

beforeEach(() => {
  $.resetMocks()
  FinderApp.mockClear()
  Layer.mockClear()
  App.prototype.rearrangeLayers = jest.fn()
  App.prototype.resizeBanner = jest.fn()
  FinderApp.prototype.view = {on: jest.fn()}
})
afterEach(() => {
  App.prototype.rearrangeLayers = rearrangeLayers
  App.prototype.resizeBanner = resizeBanner
})

test('constructor', () => {
  expect.assertions(10)
  const app = new App()

  expect(FinderApp).toHaveBeenCalledTimes(1)
  expect(FinderApp.mock.calls[0][0]).toEqual({
    title: 'Mobile Telecommunications Poletop Infrastructure Locations',
    facilityStyle: facilityStyle.style,
    highlightStyle: facilityStyle.highLightStyle,
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
  
  expect(App.prototype.rearrangeLayers).toHaveBeenCalledTimes(1)
  expect(FinderApp.prototype.view.on).toHaveBeenCalledTimes(1)
  expect(FinderApp.prototype.view.on.mock.calls[0][0]).toBe('change')

  expect($.proxy).toHaveBeenCalledTimes(1)
  expect($.proxy.mock.calls[0][0]).toBe(app.cluster)
  expect($.proxy.mock.calls[0][1]).toBe(app)

  expect(app.extents).toEqual([])
  expect(App.prototype.resizeBanner).toHaveBeenCalledTimes(1)

})

describe('rearrangeLayers', () => {
  const setZ = jest.fn()
  
  const mockLayer = {
    setZIndex: setZ
  }
  beforeEach(() => {
    setZ.mockClear()
  })

  test('rearrangeLayers', () => {
    expect.assertions(3)

    const app = new App()
    app.layer = mockLayer
    app.highlightLayer = mockLayer

    app.rearrangeLayers = rearrangeLayers
    app.rearrangeLayers()

    expect(setZ).toHaveBeenCalledTimes(2)
    expect(setZ.mock.calls[0][0]).toBe(5000)
    expect(setZ.mock.calls[1][0]).toBe(5001)
  })
})

test('resizeBanner', () => {
    
})

test('zoomTo', () => {
    
})

test('zoomToArea', () => {
    
})

test('getUrl', () => {
    
})

test('createSource', () => {
    
})

test('cluster', () => {
    
})

test('showPoles', () => {
    
})

test('srcChange', () => {
    
})

test('resetList', () => {
    
})

test('mobileDiaOpts', () => {

})

test('getSplashOptions', () => {
  expect.assertions(2)

  expect(App.getSplashOptions('')).toEqual({message: poletop.SPLASH_MESSAGE, buttonText: ['Screen reader instructions', 'View map']})
  expect(App.getSplashOptions('?splash=false')).toBeUndefined()
})