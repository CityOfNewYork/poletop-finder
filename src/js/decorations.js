import ReplaceTokens from 'nyc-lib/nyc/ReplaceTokens'
import { wrapX } from 'ol/extent'

const common = {
	getCommunityBoardNum() {
		const cBoard = this.get('community_board').toString()
		return `${parseInt(cBoard.substring(1))}`
	},
	getBoroNum() {
		const cBoard = this.get('community_board').toString()
		return cBoard.substring(0,1)
	},
	getBoroName() {
		return {
			'1': 'Manhattan',
			'2': 'Bronx',
			'3': 'Brooklyn',
			'4': 'Queens',
			'5': 'Staten Island'
		}[this.getBoroNum()]
	},
	getCommunityBoardName() {
		return `${this.getBoroName()} Community Board ${this.getCommunityBoardNum()}`
	}
}

const communityBoard = {
	extendFeature() {
		this.isCommunityBoard = true
	},
	html() {
		return $('<div class="facility"></div>')
			.append(this.getTip())
			.append(this.zoomBtn())
	},
	getName() {
		return $(`<div class="name">${this.getCommunityBoardName()}</div>`)
	},
	zoomBtn() {
		return $('<button class="btn rad-all">Show all poles</button>')
			.data('feature', this)
			.click($.proxy(this.app.showPoles, this.app))
	},
	getTip() {
		return $('<div></div>')
			.append(this.getName())
			.append(`<div>${this.getCount()} 4G poles<div>`)
	},
	getCount() {
    const cdNum = `${this.get('community_board')}`
    return this.app.communityBoardCounts[cdNum]
	}
}

const pole = {
	extendFeature() {
		this.replace = new ReplaceTokens().replace
	},
	html() {
    return $('<div class="facility"></div>')
			.append(this.distanceHtml())
			.append(this.nameHtml())
			.append(this.distanceHtml(true))
			.append(this.addressHtml())
			.append(`<div><strong>Community Board: </strong>${this.getCommunityBoardNum()}</div>`)
			.append(`<div><strong>Council District: </strong>${this.getCouncilDistrict()}</div>`)
			.append(this.mapButton())
			.append(this.directionsButton())
			.append(this.detailsCollapsible())
	},
	getFranchisee() {
		return this.get('franchisee')
	},
	getName() {
		return `Poletop Reservation ID ${this.getId()}`
	},
	getAddress1() {
		return `${this.get('on_street')}`
	},
	getAddress2() {
		return `Between ${this.get('cross_street_1')} and ${this.get('cross_street_2')}`
	},
	getCityStateZip() {
		return `${this.get('borough')}, NY ${this.get('zipcode')}`
	},
	getPoleType() {
		return this.get('pole_type')
	},
	getZone() {
		return {
			'A': 'A - Manhattan South of 96th Street',
			'B': 'B - All boroughs excluding those areas in Zones A and C',
			'C': 'C - Parts of Harlem, the South Bronx and East New York (Brooklyn)',
		}[this.get('zone')]
	},
	getCouncilDistrict() {
		return this.get('council_district')
	},
	reservationDate() {
		return new Date(this.get('reservation_date').split('T')[0]).toLocaleDateString()
	},
	detailsHtml() {
		const ul = $('<ul></ul>')

		const advisories = this.getAdvisories()
		
		ul.append(`<li><strong>Ownership: </strong>${this.getPoleType()}</li>`)
		ul.append(`<li><strong>Franchisee: </strong>${this.getFranchisee()}</li>`)
		ul.append(`<li><strong>Franchise Contract Zone: </strong>${this.getZone()}</li>`)
		ul.append(`<li><strong>Reservation Date: </strong>${this.reservationDate()}</li>`)
		if (this.isInstalled()) {
			ul.append('<li><strong>Equipment is installed</strong></li>')
		} else {
			ul.append('<li><strong>Equipment is not yet installed</strong></li>')
		}
		if (advisories) {
			ul.append($(`<li><strong>Additional Notes: </strong></li>`).append(this.getAdvisories()))
		}
		return $('<div></div>').append(ul)
	},
	isInstalled() {
		return this.get('equipment_installed_yes_no') === 'Y'
	},
	getAdvisories() {
		const messages = {
			park_advisory: 'Pole is located within ${value} under the jurisdiction of the Department of Parks and Recreation.',
			historic_advisory: 'Pole is located near or within the ${value} under the jurisdiction of the Landmarks Preservation Commission.',
			scenic_landmark_advisory: 'Pole is located adjacent to ${value} scenic landmark under the jurisdiction of the Landmarks Preservation Commission.',
			bid_advisory: 'Pole is located within Business Improvement District ${value}.',
			school_advisory: 'Pole is located within 20 feet of ${value}.'
			// nysdot_advisory: 'NYS DOT',
			// port_auth_advisory: 'Port Authority'
		}
		const ul = $('<ul class="adv"></ul>')
		Object.keys(messages).forEach(col => {
			const value = this.get(col)
			if (value) {
				ul.append(`<li>${this.replace(messages[col], {value})}</li>`)
			}
		})
		if (ul.children().length) {
			return ul
		}
	}
}

export default {common, communityBoard, pole}
