import blem from 'blem'
import logo from './logo.svg'
import './App.css'

const bem = blem('App')

const App = () => (
  <div className={bem()}>
    <header className={bem('header')}>
      <img src={logo} className={bem('logo')} alt="logo" />
      <p>
        Edit <code>src/App.js</code> and save to reload.
      </p>
      <a
        className={bem('link')}
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
)

export default App
