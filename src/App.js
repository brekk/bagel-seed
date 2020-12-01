import { useState, useEffect } from 'react'
import {
  addIndex,
  find,
  reduce,
  propEq,
  mergeRight,
  uniqBy,
  reject,
  curry,
  nth,
  pipe,
  prop,
  map,
  sortBy
} from 'ramda'
import distance from 'leven'
import coeff from 'dice-similarity-coeff'
import blem from 'blem'
import { trace } from 'xtrace'
import API from './api'
import './App.css'

const imap = addIndex(map)

const bem = blem('App')

const percentage = (x) => Math.round(x * 100) / 100

const Result = ({ id, name, similarity, term, active }) => {
  const [c, d] = similarity
  const c2 = percentage(c)
  const match = id.indexOf(term.toLowerCase())
  const displayName =
    match > -1 ? (
      match === 0 ? (
        <>
          <strong>{name.slice(0, term.length)}</strong>
          {name.slice(term.length, Infinity)}
        </>
      ) : (
        <>
          {name.slice(0, match)}
          <strong>{name.slice(match, match + term.length)}</strong>
          {name.slice(match + term.length, Infinity)}
        </>
      )
    ) : (
      name
    )
  return (
    <span className={bem('search-option', active ? 'active' : 'inactive')}>
      {displayName} ({JSON.stringify({ similarity }, null, 2)})
    </span>
  )
}
const longestId = (raw) =>
  pipe(
    reduce(
      (last, { id }) =>
        id.length > last.length ? { length: id.length, id } : last,
      { length: -1, id: '?' }
    ),
    prop('length')
  )(raw)
const diff = curry((size, x, y) => {
  const x2 = x.toLowerCase()
  const y2 = y.toLowerCase()
  const finalDist = size - distance(x2, y2)
  // const finalDist = y.indexOf(x) > -1 ? dist - 1 : dist
  const aInB = x2.indexOf(y2)
  const bInA = y2.indexOf(x2)
  const contained = aInB > -1 || bInA > -1
  return [coeff.twoStrings(x2, y2), finalDist, contained]
})

const filterForClosest = curry((results, search) =>
  pipe(
    uniqBy(prop('id')),
    map((raw) =>
      mergeRight(raw, { similarity: diff(longestId(results), search, raw.id) })
    ),
    // filters out anything with zero relevance
    reject(({ similarity: [x, y] }) => x * y === 0),
    // sorts most relevant stuff first
    sortBy(
      pipe(prop('similarity'), ([x, y, z]) => {
        if (!z) return x * -y
        return x * -y * 3
      })
    )
  )(results)
)

const App = () => {
  const [searching, setSearching] = useState('')
  const [results, setResults] = useState([])
  const [found, setFound] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [retry, setRetry] = useState(-1)
  const [cursor, setCursor] = useState(Infinity)
  const [preferred, setPreferred] = useState('')

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
    if (preferred.length && preferred.length < search.length) {
      setPreferred(search)
    }
    if (results.length) {
      const filtered = filterForClosest(results, search)
      setFound(filtered)
      setCursor(Infinity)
    }
  }
  const CONSTANTS = Object.freeze({
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    BACKSPACE: 8
  })
  const navigateByArrowKeys = (e) => {
    e.stopPropagation()
    const { keyCode } = e
    console.log('WHAT KEY?', keyCode)
    const cc = cursor === Infinity ? -1 : cursor
    if (keyCode === CONSTANTS.UP) {
      setCursor(cc - 1 >= 0 ? cc - 1 : found.length - 1)
    } else if (keyCode === CONSTANTS.DOWN) {
      setCursor(cc + 1 < found.length ? cc + 1 : 0)
    } else if (keyCode === CONSTANTS.ENTER) {
      console.log(found, cursor, '>>>', found[cursor])
      const c2 = cc === Infinity || cc === -1 ? 0 : cc
      if (found[c2] && found[c2].name) {
        setPreferred(found[c2].name)
        setSearching(found[c2].name)
      }
      setFound([])
      setCursor(Infinity)
    } else if (keyCode === CONSTANTS.BACKSPACE) {
      setPreferred('')
      if (preferred === searching) {
        setSearching('')
        setCursor(Infinity)
      } else {
        setSearching(searching.substr(0, searching.length - 1))
        setCursor(cc)
      }
    }
  }
  return (
    <main className={bem()} onKeyDown={navigateByArrowKeys} tabIndex="0">
      <header className={bem('header')}>
        <div className={bem('logo')}>🥯</div>
        <input
          type="text"
          className={bem('search')}
          value={preferred || searching}
          defaultValue={searching}
          onChange={updateText}
        />
      </header>
      {searching.length && found.length ? (
        <section>
          <ul>
            {pipe(
              imap(
                (res, i) =>
                  res && (
                    <li key={res.id}>
                      <Result {...res} active={i === cursor} term={searching} />
                    </li>
                  )
              )
            )(found)}
          </ul>
        </section>
      ) : null}
    </main>
  )
}

export default App
