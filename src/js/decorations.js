const decorations = {
	extendFeature() {
		this.set(
      'search_label',
      `<b><span class="srch-lbl-lg">${this.getName()}</span></b><br><span class="srch-lbl-sm">${this.getAddress1(), this.getAddress2()}</span>`
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
		const cBoard = this.get('borocd').toString()
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
	getPoleClass() {
		return this.get('pole_class')
	},
	getCouncilDistrict() {
		return this.get('coundist')
	},
	detailsHtml() {
		const div = $('<div></div>')
		const ul = $('<ul></ul>')

		const communityBoard = `<li><b>Community Board: </b>${this.getCommunityBoard()}</li>`
		const poleClass = `<li><b>Pole Class: </b>${this.getPoleClass()}</li>`
		const councilDistrict = `<li><b>Council District: </b>${this.getCouncilDistrict()}</li>`
		
		if (communityBoard)
			ul.append(communityBoard)
		if (poleClass)
			ul.append(poleClass)
		if (councilDistrict)
			ul.append(councilDistrict)
		
		return div.append(ul)
	}
}
export default decorations