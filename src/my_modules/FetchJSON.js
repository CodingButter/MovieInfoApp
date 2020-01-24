import Serialize from './Serialize'

/**
 * Description. Fetches the response from the rest api.
 *
 * @param {String or Object} _url string containing api url or object containing fetch data
 * @param {Object} _data  contains the url data to be serialized
 * @param {Function} _success callback function to fire when response is successfull
 * @param {Function} _fail callback function to fire when response comes back with an error
 *
 */
export default function(url, data, _success) {
	url = url + Serialize(url, data)

	fetch(url, {
		method: 'GET',
		mode: 'no-cors',
		headers: {
			Accept: 'application/json'
		}
	})
		.then(response => {
			if (response.ok) return response.json()
			return response.statusText
		})
		.then(response => console.log(response))
}
