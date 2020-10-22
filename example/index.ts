import * as Koa from 'koa'
import statics = require('../src/index')
import { resolve } from 'path'

const app = new Koa()

statics(app, [
  // http://localhost:4000/pug1.pug
  {
    route: '/',
    path: resolve(__dirname, './static/'),
    tplType: 'pug'
  },
  // http://localhost:4000/
  {
    route: '/',
    path: resolve(__dirname, './static/tpl'),
    exact: true,
    expectedFiles: ['ejs3.ejs'],
    tplType: 'ejs',
  },
  // http://localhost:4000/image/avatar.png
  {
    route: '/image',
    path: resolve(__dirname, './static/image'),
  },
])

app.listen(4000, '0.0.0.0', () => {
  console.log('server is starting on 4000 port')
  console.log('http://localhost:4000')
})
