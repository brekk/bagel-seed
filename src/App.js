import { useState, useEffect } from 'react'
import { uniqBy, reject, curry, nth, pipe, prop, map, sortBy } from 'ramda'
import distance from 'leven'
import coeff from 'dice-similarity-coeff'
import blem from 'blem'
import { trace } from 'xtrace'
import API from './api'
import './App.css'

const bem = blem('App')

const Result = ({ name }) => {
  return <span>{name}</span>
}
const diff = (x, y) => [coeff.twoStrings(x, y), distance(x, y)]

const filterForClosest = curry((results, search) =>
  pipe(
    uniqBy(prop('id')),
    map((raw) => mergeRight(raw, {similarity: diff(raw.id, search)}),
    trace('what are the values of similarity?'),
    reject(([_, d]) => d === 0),
    sortBy(pipe(nth(1), (z) => z * -1))
  )(results)
)

const App = () => {
  const [searching, setSearching] = useState('')
  const [results, setResults] = useState([])
  const [found, setFound] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [retry, setRetry] = useState(-1)

  useEffect(() => {
    const grabData = () => {
      console.log('asking for data...', attempts, '/ 3 attempts')
      setAttempts(attempts + 1)
      API.fetchAllItems()
        .catch((e) => {
          throw e
        })
        .then((data) => {
          console.log('DATA', data)
          setResults(data)
          setAttempts(0)
          clearTimeout(retry)
        })
    }

    if (!results.length && attempts < 3) {
      setRetry(setTimeout(grabData, 1e5))
      grabData()
    }
    return () => {
      clearTimeout(retry)
    }
  }, [results, attempts, retry])
  const updateText = (e) => {
    const search = e.target.value
    setSearching(search)
    if (results.length) {
      const filtered = filterForClosest(results, search)
      console.log('el filto', filtered)
      setFound(filtered)
    }
  }
  return (
    <main className={bem()}>
      <header className={bem('header')}>
        <div className={bem('logo')}>🥯</div>
        <input
          type="text"
          className={bem('search')}
          defaultValue={searching}
          onChange={updateText}
        />
      </header>
      <section>
        {searching.length && found.length && (
          <ul>
            {pipe(
              map(nth(0)),
              map(
                (res) =>
                  res && (
                    <li key={res.id}>
                      <Result {...res} />
                    </li>
                  )
              )
            )(found)}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
