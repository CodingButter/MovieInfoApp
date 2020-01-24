/**
 * Description. This will conver the object into a string to concatonate onto a url string
 *
 * @param {Object}  data  data for url string
 * @return {String} serialized data string
 *
 */
export default (url, data) => {
	var str = url.includes('?') ? '' : '?'
	for (var key in data) {
		if (str.length > 1) str += '&'
		str += key + '=' + encodeURIComponent(data[key])
	}
	return str
}
