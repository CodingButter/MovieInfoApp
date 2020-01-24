export default (query, _cb) => {
	let url = 'http://jnich.tk/rests/auto_complete.php?q=' + query
	fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json'
		}
	})
		.then(response => {
			return response.json()
		})
		.then(response => {
			_cb(response)
		})
}
