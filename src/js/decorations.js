const decorations = {
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
		return this.get('on_street') + ' between '
	},
	getAddress2() {
		return this.get('cross_street_1') + ' and ' + this.get('cross_street_2')
	},
	getCityStateZip() {
		return this.get('borough') + ', NY ' + this.get('zipcode')
	},
	getCommunityBoard() {
		const cBoard = this.get('community_board').toString()
		const boroCode = cBoard.substring(0,1)
		const communityBoard = cBoard.substring(1)
		const boros = {
			'1': 'Manhattan',
			'2': 'Bronx',
			'3': 'Brooklyn',
			'4': 'Queens',
			'5': 'Staten Island'
		}
		return `${boros[boroCode]} - ${communityBoard}`
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
		const advisories = $(`<li><strong>Advisories: </strong></li>`).append(this.getAdvisories())
		
		ul.append(communityBoard)
		ul.append(poleType)
		ul.append(councilDistrict)
		ul.append(advisories)
		
		return div.append(ul)
	},
	getAdvisories() {
		const advCols = {
			bid_advisory: 'Business Improvement District',
			scenic_landmark_advisory: 'Landmark/Historic',
			nysdot_advisory: 'NYS DOT',
			park_advisory: 'Parks',
			port_auth_advisory: 'Port Authority',
			school_advisory: 'Schools'
		}
		const ul = $('<ul class="adv"></ul>')
		Object.keys(advCols).forEach(col => {
			const adv = this.get(col)
			if (adv) {
				// ul.append(`<li><strong>${advCols[col]}</strong>:<br>${adv}</li>`)
				ul.append(`<li>${adv}</li>`)
			}
		})
		if (ul.children().length) {
			return ul
		}
		return 'No Advisories'
	}
}

export default decorations
