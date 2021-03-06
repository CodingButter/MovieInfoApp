/**
 * Description. This will conver the object into a string to concatonate onto a url string
 *
 * @param {Object}  data  data for url string
 * @return {String} serialized data string
 *
 */
const Serialize = (url, data) => {
	var str = url.includes('?') ? '' : '?'
	for (var key in data) {
		if (str.length > 1) str += '&'
		str += key + '=' + encodeURIComponent(data[key])
	}
	return str
}

/**
 * Description. Fetches the response from the rest api.
 *
 * @param {String or Object} _url string containing api url or object containing fetch data
 * @param {Object} _data  contains the url data to be serialized
 * @param {Function} _success callback function to fire when response is successfull
 * @param {Function} _fail callback function to fire when response comes back with an error
 *
 */
const FetchJSON = (url, data, _success) => {
	url = url + Serialize(url, data)

	fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json'
		}
	})
		.then(response => {
			if (response.ok) return response.json()
			return response.statusText
		})
		.then(_success)
}

/**
 * Builds a api call for The Movie Database.
 *
 * Sends multipler calls to the rest api and retreieves the correct information
 * to allow us to more simply retreive the data for movies from The Movie Database
 *
 * @class
 * @param {String} api_key this is the individual api key for the movie database project
 *
 */

class Discoverer {
	/*
	Config is the data returned from The Movie Database API
	that will help us piece together image urls and other data
	*/
	static _CONFIG = null
	//Current url for the movie database api we are currently using
	static _API_BASE = 'http://api.themoviedb.org/3/'
	//this allows for a more intuitive way of putting together a movie query
	static _prop_fix = {
		genre: 'with_genres',
		people: 'with_people',
		person: 'with_people',
		date: 'primary_release_date',
		year: 'primary_release_year'
	}

	//this allows us to use more intuitive words for sorting the response
	static _sort_fix = {
		date: 'release_date'
	}

	//this will let us set conditions using less than or greater than signs
	static _conds = {
		'<': 'lte',
		'>': 'gte'
	}

	//Private Properties
	_properties = {}

	//Private methods

	_putFilter(property, value, cond) {
		this.filters.push({
			prop: property,
			cond: cond ? Discoverer._conds[cond] : undefined,
			val: this._properties[property]
				? this._properties[property][value]
				: value
		})
	}

	_buildFilters(property, value, cond, callback) {
		if (property === 'people' || property === 'person') {
			value = this._addPeople(value.split(','), '', ids => {
				this._putFilter(property, ids.replace(/(^,)|(,$)/g, ''), cond)
				callback()
			})
		} else if (property === 'genre') {
			FetchJSON(
				Discoverer._API_BASE + 'genre/movie/list',
				{
					api_key: this.api_key
				},
				gen => {
					gen = gen.genres
					var genres = {}
					gen.forEach(g => {
						genres[g.name.toLowerCase()] = g.id
					})
					this._properties.genre = genres
					this._putFilter(property, value, cond)
					callback()
				}
			)
		} else {
			this._putFilter(property, value, cond)
			callback()
		}
	}

	_loopFilters(_cb) {
		if (this.rawfilters.length > 0) {
			var index = this.rawfilters.length - 1
			this._buildFilters(
				this.rawfilters[index].prop,
				this.rawfilters[index].val,
				this.rawfilters[index].cond,
				() => {
					this.rawfilters.pop()
					this._loopFilters(_cb)
				}
			)
		} else {
			_cb()
		}
	}

	_buildSends() {
		var tmp = {
			api_key: this.api_key,
			page: this.page
		}
		this.filters.forEach(f => {
			var cond = f.cond !== undefined ? '.' + f.cond : ''
			tmp[
				(Discoverer._prop_fix[f.prop]
					? Discoverer._prop_fix[f.prop]
					: f.prop) + cond
			] = f.val
		})
		if (this.sort)
			tmp['sort_by'] =
				(Discoverer._sort_fix[this.sort.prop]
					? Discoverer._sort_fix[this.sort.prop]
					: Discoverer._prop_fix[this.sort.prop]
					? Discoverer._prop_fix[this.sort.prop]
					: this.sort.prop) +
				'.' +
				this.sort.dir
		return tmp
	}

	_addPeople(value, found, callback) {
		var fnds = found.split(',')
		var index = value.length - fnds.length
		FetchJSON(
			Discoverer._API_BASE + 'search/person',
			{
				api_key: this.api_key,
				query: value[index]
			},
			data => {
				var id = parseInt(data.results[0].id, 10)
				found += ',' + id
				found.trim(',')
				if (index > 0) this._addPeople(value, found, callback)
				else callback(found)
			}
		)
	}

	constructor(api_key) {
		this.api_key = api_key
		this.disc_url = Discoverer._API_BASE + 'discover/movie'
		this.props = {}
		this.filters = []
		this.rawfilters = []
		this.page = 1
		this.total_pages = 1
	}

	/**
	 *
	 * Adds a property to filter results by.
	 * Adds a property to filter the results from the response of
	 * our api call.
	 *
	 * @param {String} property The property we will add to the filter
	 * @param {String} cond The condition to be met for filtering
	 * @param {String} value The value to be met for filtering
	 */
	addFilter(property, cond, value) {
		this.rawfilters.push({
			prop: property,
			val: value,
			cond: cond
		})
	}

	/**
	 *
	 * @param {String} property This is a property to sort by .
	 * @param {String} dir This is the direction to sort asc/desc.
	 */
	addSort(property, dir) {
		this.sort = {
			prop: property,
			dir
		}
	}

	/**
	 * Initiates the api calls based on the filters and sorts added.
	 *
	 * Initiates the api calls and does all the behind the scenes work to return the
	 * movies in the correctd order by the filters that were provided.
	 *
	 * @param {Function} callback A function that handles the response from the api call
	 *
	 * @returns {Object} A response object with all the information to build a list of movies.
	 */
	run(callback) {
		if (Discoverer._CONFIG) {
			this._loopFilters(() => {
				var sends = this._buildSends()
				FetchJSON(this.disc_url, sends, data => {
					this.total_pages = data.total_pages
					data.config = Discoverer._CONFIG
					callback(data)
				})
			})
		} else {
			FetchJSON(
				Discoverer._API_BASE + 'configuration',
				{
					api_key: this.api_key
				},
				response => {
					Discoverer._CONFIG = response
					this.run(callback)
				}
			)
		}
	}
}

export default Discoverer
