import {
  defaultTo,
  objOf,
  values,
  pathOr,
  map,
  pipe,
  curry,
  merge
} from 'ramda'
import { trace } from 'xtrace'
import axios from 'axios'

const config = { BACKEND: { DOMAIN: 'localhost', PORT: '3001' } }

const BACKEND = 'http://' + config.BACKEND.DOMAIN + ':' + config.BACKEND.PORT
const api = pipe(merge({ url: BACKEND, method: 'get' }), axios)

const defaultify = pipe(
  merge({ title: 'Untitled', data: [], color: '#888', opacity: 1 })
)

const then = curry((fn, thenable) => thenable.then(fn))
const snag = curry((fn, thenable) => thenable.catch(fn))

const hardThrow = (e) => {
  if (e instanceof Error) throw e
  throw new Error('General problem in the computer unit.')
}

export default {
  fetchItem: (id) =>
    pipe(
      objOf('id'),
      objOf('data'),
      api,
      snag(hardThrow),
      then(pipe(pathOr([], ['data', 'data', id]), defaultify))
    )(id),
  fetchAllItems: () =>
    pipe(
      defaultTo({}),
      api,
      snag(hardThrow),
      then(pipe(pathOr([], ['data', 'data'])))
    )()
}
