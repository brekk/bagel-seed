const { fork, chain } = require('fluture')
const { writeFile } = require('torpor')
const { merge, pipe, __ } = require('ramda')

const md = require('half-baked')

const jj = (nn) => (xx) => JSON.stringify(xx, null, nn)
const j0 = jj(0)
// const j2 = jj(2)

const slugify = (x) => x.toLowerCase().replace(/\W/g, '-')

const CONFIG = {
  PORT: 3001,
  STORAGE: {
    BRAIN: 'data.json',
    BACKUP: 'data.json.bak'
  },
  logging: false,
  onPostRoot: ({ updateBrain }) => (req, res, next) => {
    const { points, name } = req.body
    const file = `${slugify(name)}.json`
    const update = (raw) =>
      merge(raw, { files: (raw.files || []).concat(file) })
    pipe(
      j0,
      writeFile(`./${file}`, __, 'utf8'),
      chain(() => updateBrain(update)),
      fork(next)(() => res.json({ saved: true }))
    )({ points, meta: { modified: new Date().toString() } })
  }
}

fork(console.warn)(({ config }) => {
  const storage = `(${config.STORAGE.BRAIN})`
  const accessPath = config.STORAGE.ACCESS_PATH
  const accessString = accessPath.slice(0, -1).join('.') + '[id]'
  const host = `http://localhost:${config.PORT}`
  console.log(`
    __                     __                         __
   / /_  ____ _____ ____  / /     ________  ___  ____/ /
  / __ \\/ __ \`/ __ \`/ _ \\/ /_____/ ___/ _ \\/ _ \\/ __  /
 / /_/ / /_/ / /_/ /  __/ /_____(__  )  __/  __/ /_/ /
/_.___/\\__,_/\\__, /\\___/_/     /____/\\___/\\___/\\__,_/
            /____/
======== ${host} =======================================
    HEAD ${host}/    ~ 204
    GET  ${host}/    ~ 200 + ${storage}
    POST ${host}/    ~ {data, meta: {modified}}
    HEAD ${host}/:id ~ 204
    GET  ${host}/:id ~ 200 + ${storage}.${accessString}
`)
})(md(CONFIG))
