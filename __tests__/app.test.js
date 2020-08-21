import FinderApp from 'nyc-lib/nyc/ol/FinderApp'
import CsvPoint from 'nyc-lib/nyc/ol/format/CsvPoint'
import FilterAndSort from 'nyc-lib/nyc/ol/source/FilterAndSort'
import App from '../src/js/App'
import poletop from '../src/js/poletop'
import decorations from '../src/js/decorations'
import facilityStyle from '../src/js/facility-style'
import Layer from 'ol/layer/Vector'
import {poleFeature1, poleFeature2, cbFeature} from './test-features'
import { resolvePlugin } from '@babel/core'
import { Feature } from 'ol'

jest.mock('nyc-lib/nyc/ol/FinderApp')
jest.mock('nyc-lib/nyc/ol/format/CsvPoint')
jest.mock('nyc-lib/nyc/ol/source/FilterAndSort')
jest.mock('ol/layer/Vector')

const rearrangeLayers = App.prototype.rearrangeLayers
const resizeBanner = App.prototype.resizeBanner
const communityBoardCsv = `"community_board","count"
"205","168"
"306","95"
"312","70"
`

beforeEach(() => {
  $.resetMocks()
  FinderApp.mockClear()
  Layer.mockClear()
  CsvPoint.mockClear()
  fetch.mockClear()
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

    app.zoomTo(poleFeature1)

    expect(app.tabs.open).toHaveBeenCalledTimes(1)
    expect(app.tabs.open.mock.calls[0][0]).toBe('#map')

    mockMap.trigger('moveend')

    expect(App.noPanIntoView).toHaveBeenCalledTimes(1)
    expect(mockPopup.panIntoView).toHaveBeenCalledTimes(0)
    expect(app.popup.showFeature).toHaveBeenCalledTimes(1)
    expect(app.popup.showFeature.mock.calls[0][0]).toBe(poleFeature1)

    expect(FinderApp.prototype.view.animate).toHaveBeenCalledTimes(1)
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].center).toEqual(poleFeature1.getGeometry().getCoordinates())
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
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].center).toEqual(poleFeature1.getGeometry().getCoordinates())
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

    app.zoomTo(poleFeature1)

    expect(app.tabs.open).toHaveBeenCalledTimes(0)

    mockMap.trigger('moveend')

    expect(App.noPanIntoView).toHaveBeenCalledTimes(1)
    expect(mockPopup.panIntoView).toHaveBeenCalledTimes(0)
    expect(app.popup.showFeature).toHaveBeenCalledTimes(1)
    expect(app.popup.showFeature.mock.calls[0][0]).toBe(poleFeature1)

    expect(FinderApp.prototype.view.animate).toHaveBeenCalledTimes(1)
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].center).toEqual(poleFeature1.getGeometry().getCoordinates())
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

    app.zoomTo(poleFeature1)

    expect(app.tabs.open).toHaveBeenCalledTimes(1)
    expect(app.tabs.open.mock.calls[0][0]).toBe('#map')

    mockMap.trigger('moveend')

    expect(App.noPanIntoView).toHaveBeenCalledTimes(1)
    expect(mockPopup.panIntoView).toHaveBeenCalledTimes(0)
    expect(app.popup.showFeature).toHaveBeenCalledTimes(1)
    expect(app.popup.showFeature.mock.calls[0][0]).toBe(poleFeature1)

    expect(FinderApp.prototype.view.animate).toHaveBeenCalledTimes(1)
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].center).toEqual(poleFeature1.getGeometry().getCoordinates())
    expect(FinderApp.prototype.view.animate.mock.calls[0][0].zoom).toBe(17)
  })

})


test('zoomToArea', () => {
    
})

test('getUrl', () => {
    
})

describe('createSource', () => {
  const createSource = FinderApp.prototype.createSource
  let mockSrc
  beforeEach(() => {
    mockSrc = {}
    fetch.resetMocks()
    fetch.mockResponseOnce(communityBoardCsv)
    FinderApp.prototype.createSource = jest.fn().mockImplementation(() => {
      return mockSrc
    })
  })
  afterEach(() => {
    FinderApp.prototype.createSource = createSource
  })

  test('createSource', done => {
    expect.assertions(21)

    const app = new App()
    app.layer = {changed: jest.fn()}
    app.resetList = jest.fn()

    expect(app.createSource()).toBe(mockSrc)

    setTimeout(() => {
      expect(FinderApp.prototype.createSource).toHaveBeenCalledTimes(1)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].facilityUrl).toBe(poletop.COMMUNITY_BOARD_URL)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations.length).toBe(2)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations[0]).toBe(decorations.common)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations[1]).toBe(decorations.communityBoard)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].facilityFormat).toBe(CsvPoint.mock.instances[0])
      expect(CsvPoint.mock.calls[0][0].x).toBe('x')
      expect(CsvPoint.mock.calls[0][0].y).toBe('y')
      expect(CsvPoint.mock.calls[0][0].dataProjection).toBe('EPSG:2263')
      expect(app.layer.changed).toHaveBeenCalledTimes(1)
      expect(app.resetList).toHaveBeenCalledTimes(1)
      expect(app.cdSrc).toBe(mockSrc)
      expect(app.cdSrc._name).toBe('cd')
      expect(app.poleSrc._name).toBe('pole')
      expect(FilterAndSort).toHaveBeenCalledTimes(1)
      expect(FilterAndSort.mock.calls[0][0]).toEqual({})
      expect(fetch.mock.calls[0][0]).toBe(poletop.GROUPED_DATA_URL)
      expect(app.communityBoardCounts['205']).toBe('168')
      expect(app.communityBoardCounts['306']).toBe('95')
      expect(app.communityBoardCounts['312']).toBe('70')
      done()
    }, 200)

  })
})


describe('cluster', () => {
  let zoom
  let mockView
  let app
  let tabs
  let url
  let features
  const createSource = FinderApp.prototype.createSource
  let mockSrc
  beforeEach(() => {
    mockSrc = {
      autoLoad: jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          resolve(features)
        })
      })
    }
    FinderApp.prototype.createSource = jest.fn().mockImplementation(() => {
      return mockSrc
    })
    tabs = $('<div id="tabs"></div>')
    $('body').append(tabs)
    app = new App()
    app.view = {getZoom: () => { return zoom}}
    app.layer = {setSource: jest.fn()}
    app.cdSrc = {_name: 'cd'}
    app.poleSrc = {
      _name: 'pole',
      getFeatureById: id => {
        let feature
        app.poleSrc.allFeatures.forEach(f => {
          if (f.getId() === id) feature = f
        })
        return feature
      }
    }
    app.tabs = {open: jest.fn()}
    app.srcChange = jest.fn()
    app.showPoles = jest.fn().mockImplementation(() => {
      app.source = app.poleSrc
    })
    url = undefined
    app.getUrl = () => {return url}
    $('body').removeClass('community-board')
  })

  afterEach(() => {
    tabs.remove()
    FinderApp.prototype.createSource = createSource
  })

  test('cluster - shows community boards - prev source was cdSrc - filters tab is open', () => {
    expect.assertions(9)

    zoom = poletop.CLUSTER_CUTOFF_ZOOM - 1
    app.tabs.active = $('<div id="filters"></div>')
    app.source = app.cdSrc

    app.cluster()

    expect($('body').hasClass('community-board')).toBe(true)
    expect(app.source).toBe(app.cdSrc)
    expect(app.layer.setSource).toHaveBeenCalledTimes(1)
    expect(app.layer.setSource.mock.calls[0][0]).toBe(app.cdSrc)
    expect(app.tabs.open).toHaveBeenCalledTimes(1)
    expect(app.tabs.open.mock.calls[0][0]).toBe('#facilities')    
    expect(tabs.hasClass('no-flt')).toBe(true)
    expect(app.srcChange).toHaveBeenCalledTimes(1)
    expect(app.srcChange.mock.calls[0][0]).toBe(app.cdSrc)
  })

  test('cluster - shows community boards - prev source was poleSrc - filters tab is not open', () => {
    expect.assertions(8)

    zoom = poletop.CLUSTER_CUTOFF_ZOOM - 1
    app.tabs.active = $('<div id="facilities"></div>')
    app.poleSrc = mockSrc
    app.source = mockSrc
    app.cluster()

    expect($('body').hasClass('community-board')).toBe(true)
    expect(app.source).toBe(app.cdSrc)
    expect(app.layer.setSource).toHaveBeenCalledTimes(1)
    expect(app.layer.setSource.mock.calls[0][0]).toBe(app.cdSrc)
    expect(app.tabs.open).toHaveBeenCalledTimes(0)
    expect(tabs.hasClass('no-flt')).toBe(true)
    expect(app.srcChange).toHaveBeenCalledTimes(1)
    expect(app.srcChange.mock.calls[0][0]).toBe(mockSrc)
  })

  test('cluster - shows poles - prev source was cdSrc - has url - first time getting poles', done => {
    expect.assertions(16)

    zoom = poletop.CLUSTER_CUTOFF_ZOOM
    app.poleSrc.allFeatures = []
    app.source = app.cdSrc
    url = 'mock-url'
    features = [poleFeature1]

    app.cluster()

    setTimeout(() => {
      expect($('body').hasClass('community-board')).toBe(false)
      expect(FinderApp.prototype.createSource).toHaveBeenCalledTimes(1)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].facilityUrl).toBe(url)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations.length).toBe(2)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations[0]).toBe(decorations.common)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations[1]).toBe(decorations.pole)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].facilityFormat).toBe(CsvPoint.mock.instances[0])
      expect(CsvPoint.mock.calls[0][0].x).toBe('x_coord')
      expect(CsvPoint.mock.calls[0][0].y).toBe('y_coord')
      expect(CsvPoint.mock.calls[0][0].dataProjection).toBe('EPSG:2263')
      expect(app.source).toBe(app.poleSrc)
      expect(app.source._name).toBe('pole')
      expect(app.source.allFeatures.length).toBe(1)
      expect(app.source.allFeatures[0]).toBe(poleFeature1)
      expect(app.showPoles).toHaveBeenCalledTimes(1)
      expect(app.showPoles.mock.calls[0][0]).toBe(app.cdSrc)
      done()
    }, 200)
  })

  test('cluster - shows poles - prev source was poleSrc - has url - not first time getting poles', done => {
    expect.assertions(17)

    zoom = poletop.CLUSTER_CUTOFF_ZOOM
    app.poleSrc.allFeatures = [poleFeature1]
    app.source = app.poleSrc
    url = 'mock-url'
    features = [poleFeature1, poleFeature2]

    app.cluster()

    setTimeout(() => {
      expect($('body').hasClass('community-board')).toBe(false)
      expect(FinderApp.prototype.createSource).toHaveBeenCalledTimes(1)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].facilityUrl).toBe(url)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations.length).toBe(2)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations[0]).toBe(decorations.common)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].decorations[1]).toBe(decorations.pole)
      expect(FinderApp.prototype.createSource.mock.calls[0][0].facilityFormat).toBe(CsvPoint.mock.instances[0])
      expect(CsvPoint.mock.calls[0][0].x).toBe('x_coord')
      expect(CsvPoint.mock.calls[0][0].y).toBe('y_coord')
      expect(CsvPoint.mock.calls[0][0].dataProjection).toBe('EPSG:2263')
      expect(app.source).toBe(app.poleSrc)
      expect(app.source._name).toBe('pole')
      expect(app.source.allFeatures.length).toBe(2)
      expect(app.source.allFeatures[0]).toBe(poleFeature1)
      expect(app.source.allFeatures[1]).toBe(poleFeature2)
      expect(app.showPoles).toHaveBeenCalledTimes(1)
      expect(app.showPoles.mock.calls[0][0]).toBe(app.poleSrc)
      done()
    }, 200)
  })

  test('cluster - shows poles - prev source was poleSrc - no url - not first time getting poles', done => {
    expect.assertions(8)

    zoom = poletop.CLUSTER_CUTOFF_ZOOM
    app.poleSrc.allFeatures = [poleFeature1]
    app.source = app.poleSrc
    url = undefined

    app.cluster()

    setTimeout(() => {
      expect($('body').hasClass('community-board')).toBe(false)
      expect(FinderApp.prototype.createSource).toHaveBeenCalledTimes(0)
      expect(app.source).toBe(app.poleSrc)
      expect(app.source._name).toBe('pole')
      expect(app.source.allFeatures.length).toBe(1)
      expect(app.source.allFeatures[0]).toBe(poleFeature1)
      expect(app.showPoles).toHaveBeenCalledTimes(1)
      expect(app.showPoles.mock.calls[0][0]).toBe(app.poleSrc)
      done()
    }, 200)
  })
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

