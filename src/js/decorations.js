const common = {
	getCommunityBoard() {
		const cBoard = this.get('community_board').toString()
		const boroCode = cBoard.substring(0,1)
		const communityBoard = `${parseInt(cBoard.substring(1))}`
		const boros = {
			'1': 'Manhattan',
			'2': 'Bronx',
			'3': 'Brooklyn',
			'4': 'Queens',
			'5': 'Staten Island'
		}
		return `${boros[boroCode]} Community Board ${communityBoard}`
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
		return $(`<div class="name">${this.getCommunityBoard()}</div>`)
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
		this.set(
      'search_label',
      `<strong><span class="srch-lbl-lg">${this.getName()}</span></strong><br><span class="srch-lbl-sm">${this.getAddress1(), this.getAddress2()}</span>`
		)
		this.set('search_name', `${this.getName()}, ${this.getAddress1()} ${this.getAddress2()}`)
	},
	getName() {
		return this.get('franchisee')
	},
	getAddress1() {
		return `${this.get('on_street')}  between `
	},
	getAddress2() {
		return `${this.get('cross_street_1')} and ${this.get('cross_street_2')}`
	},
	getCityStateZip() {
		return `${this.get('borough')}, NY ${this.get('zipcode')}`
	},
	getpoleType() {
		return this.get('pole_type')
	},
	getCouncilDistrict() {
		return this.get('council_district')
	},
	detailsHtml() {
		const div = $('<div></div>')
		const ul = $('<ul></ul>')

		const communityBoard = `<li><strong>Community Board: </strong>${this.getCommunityBoard()}</li>`
		const poleType = `<li><strong>Pole Type: </strong>${this.getpoleType()}</li>`
		const councilDistrict = `<li><strong>Council District: </strong>${this.getCouncilDistrict()}</li>`
		const advisories = this.getAdvisories()
		
		ul.append(communityBoard)
		ul.append(poleType)
		ul.append(councilDistrict)
		if (advisories) {
			ul.append($(`<li><strong>Proximity: </strong></li>`).append(this.getAdvisories()))
		}
		
		return div.append(ul)
	},
	getAdvisories() {
		const advCols = {
			bid_advisory: 'Business Improvement District',
			scenic_landmark_advisory: 'Landmark',
			historic_advisory: 'Historic',
			nysdot_advisory: 'NYS DOT',
			park_advisory: 'Parks',
			port_auth_advisory: 'Port Authority',
			school_advisory: 'Schools'
		}
		const ul = $('<ul class="adv"></ul>')
		Object.keys(advCols).forEach(col => {
			const adv = this.get(col)
			if (adv) {
				ul.append(`<li><strong>${advCols[col]}</strong>: ${adv}</li>`)
			}
		})
		if (ul.children().length) {
			return ul
		}
	}
}

export default {common, communityBoard, pole}
