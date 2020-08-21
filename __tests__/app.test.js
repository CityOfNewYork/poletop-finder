import FinderApp from 'nyc-lib/nyc/ol/FinderApp'
import App from '../src/js/App'
import poletop from '../src/js/poletop'
import decorations from '../src/js/decorations'
import facilityStyle from '../src/js/facility-style'
import Layer from 'ol/layer/Vector'
import {poleFeature, cbFeature} from './test-features'

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
  FinderApp.prototype.view = {on: jest.fn(), animate: jest.fn()}
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

describe('zoomTo', () => {
  
  const mockPopup = {
    hide: jest.fn(),
    panIntoView: jest.fn(),
    showFeature: jest.fn().mockImplementation(() => {
      mockPopup.panIntoView() //standard behavior of showFeatures
    })
  }
  const mockTabs = {
    open: jest.fn()
  }
  const mockMap = {
    handlers: {},
    once: (event, handler) => {
      mockMap.handlers[event] = handler
    },
    trigger: (event) => {
      if (mockMap.handlers[event]) {
        mockMap.handlers[event]({pixel: 'mock-pixel'})
        delete mockMap.handlers[event]
      }
    }
  }
  const noPanIntoView = App.noPanIntoView
  const css = $('body').attr('class')
  let tabs
  beforeEach(() => {
    App.noPanIntoView = jest.fn()
    mockTabs.open.mockClear()
    mockPopup.hide.mockClear()
    mockPopup.panIntoView.mockClear()
    mockPopup.showFeature.mockClear()
    tabs = $('<div id="tabs"><div class="btns"><h2></h2><h2></h2></div></div>')
    $('body').append(tabs)
  })
  afterEach(() => {
    App.noPanIntoView = noPanIntoView
    $('body').attr('class', css)
    tabs.remove()
  })
  test('zoomTo - pole', () => {
    expect.assertions(9)

    const app = new App()
    app.popup = mockPopup
    app.tabs = mockTabs
    app.map = mockMap

    $('body').addClass('community-board')
    $('#tabs .btns h2:first-of-type').css('display', 'block')

    app.zoomTo(poleFeature)

    expect(app.tabs.open).toHaveBeenCalledTimes(1)
    expect(app.tabs.open.mock.calls[0][0]).toBe('#map')

    mockMap.trigger('moveend')

    expect(App.noPanIntoView).toHaveBeenCalledTimes(1)
    expect(mockPopup.panIntoView).toHaveBeenCalledTimes(0)
    expect(app.popup.showFeature).toHaveBeenCalledTimes(1)
    expect(app.popup.showFeature.mock.calls[0][0]).toBe(poleFeature)

    expect(FinderApp.prototype.view.animate).toHaveBeenCalledTimes(1)
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].center).toEqual(poleFeature.getGeometry().getCoordinates())
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].zoom).toBe(14)
  })
  test('zoomTo - community board', () => {
    expect.assertions(8)

    const app = new App()
    app.popup = mockPopup
    app.tabs = mockTabs
    app.map = mockMap

    $('body').addClass('community-board')
    $('#tabs .btns h2:first-of-type').css('display', 'block')

    app.zoomTo(cbFeature)

    expect(app.tabs.open).toHaveBeenCalledTimes(1)
    expect(app.tabs.open.mock.calls[0][0]).toBe('#map')

    mockMap.trigger('moveend')

    expect(App.noPanIntoView).toHaveBeenCalledTimes(0)
    expect(mockPopup.panIntoView).toHaveBeenCalledTimes(0)
    expect(app.popup.showFeature).toHaveBeenCalledTimes(0)

    expect(FinderApp.prototype.view.animate).toHaveBeenCalledTimes(1)
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].center).toEqual(poleFeature.getGeometry().getCoordinates())
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].zoom).toBe(14)
  })
  test('zoomTo - tab button not visible ', () => {
    expect.assertions(8)

    const app = new App()
    app.popup = mockPopup
    app.tabs = mockTabs
    app.map = mockMap

    $('body').addClass('community-board')
    $('#tabs .btns h2:first-of-type').css('display', 'none')

    app.zoomTo(poleFeature)

    expect(app.tabs.open).toHaveBeenCalledTimes(0)

    mockMap.trigger('moveend')

    expect(App.noPanIntoView).toHaveBeenCalledTimes(1)
    expect(mockPopup.panIntoView).toHaveBeenCalledTimes(0)
    expect(app.popup.showFeature).toHaveBeenCalledTimes(1)
    expect(app.popup.showFeature.mock.calls[0][0]).toBe(poleFeature)

    expect(FinderApp.prototype.view.animate).toHaveBeenCalledTimes(1)
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].center).toEqual(poleFeature.getGeometry().getCoordinates())
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].zoom).toBe(14)
  })
  test('zoomTo - no community board class', () => {
    expect.assertions(9)

    const app = new App()
    app.popup = mockPopup
    app.tabs = mockTabs
    app.map = mockMap

    $('body').removeClass('community-board')
    $('#tabs .btns h2:first-of-type').css('display', 'block')

    app.zoomTo(poleFeature)

    expect(app.tabs.open).toHaveBeenCalledTimes(1)
    expect(app.tabs.open.mock.calls[0][0]).toBe('#map')

    mockMap.trigger('moveend')

    expect(App.noPanIntoView).toHaveBeenCalledTimes(1)
    expect(mockPopup.panIntoView).toHaveBeenCalledTimes(0)
    expect(app.popup.showFeature).toHaveBeenCalledTimes(1)
    expect(app.popup.showFeature.mock.calls[0][0]).toBe(poleFeature)

    expect(FinderApp.prototype.view.animate).toHaveBeenCalledTimes(1)
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].center).toEqual(poleFeature.getGeometry().getCoordinates())
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].zoom).toBe(17)
  })

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