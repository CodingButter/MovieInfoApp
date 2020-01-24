import React from 'react'
import ReactDOM from 'react-dom'
import Button from '@material-ui/core/Button'
import Discoverer from './my_modules/TMDBDiscover'
const api_key = 'e8be92e5033230687ec1953e7045db83'

const disc = new Discoverer(api_key)
disc.addFilter('person', '=', 'Tom Cruise')
disc.addSort('popularity', 'desc')
disc.page = 1
disc.run(response => {
	console.log(response)
})

function App() {
	return (
		<Button variant="contained" color="primary">
			Hello World
		</Button>
	)
}

ReactDOM.render(<App />, document.querySelector('#app'))
