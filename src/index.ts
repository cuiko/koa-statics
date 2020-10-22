/* eslint-disable camelcase */

import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as R from 'ramda'
import * as fs from 'fs'
import { resolve } from 'path'
import consolidate = require('consolidate')
const debug = require('debug')('@cuiko/koa-statics')

import {
  expectedRoute,
  expectedPathForDir,
  expectedExt,
  routeParams,
  getFileName,
  expectedPathForFile,
  getFileExtWithoutDot,
  getContentType,
  getExtByTplType,
} from './lib/util'

const router = new Router()

/**
 *  * ----------------------基本----------------------
 * @property {string} route 页面路由映射的路径
 * e.g. /a/b/ must be have '/'
 * @property {string} path 需要映射的本地地址
 * ----------------------是否启用----------------------
 * @property {boolean} showExt 路由路径是否需要带上后缀名 def:true
 * @property {boolean} exact 在此路由下只匹配一个页面，需要过滤后至少还有一个文件
 * @property {boolean} dynamic 是否启用动态监听 [需要事先确定deep] def:false
 * @property {boolean} recursive 是否递归文件夹
 * ----------------------模板引擎----------------------
 * @property {string} tplType 模板引擎名称/后缀名
 * ----------------------过滤----------------------
 * @property {array} expectedExts 限制输出的文件后缀
 * e.g. ['.html'] must be have '.'
 * @property {array} expectedFiles 期待输出的文件
 * @property {array} excludedFiles 排除的文件名
 * ----------------------其他----------------------
 * @property {number} deep 递归次数 1以上为有效值，横向后续有添加无所谓，纵向的深度需要提前确定
 * -----------------------------------------------
 */
interface IStaticOpts {
  route: string
  path: string

  showExt?: boolean
  exact?: boolean
  dynamic?: boolean
  recursive?: boolean

  tplType?: string

  expectedExts?: string[]
  excludedFiles?: string[]
  expectedFiles?: string[]

  deep?: number
}

const filterFiles = (config: IStaticOpts): string[] => {
  const findFiles = (path_last?: string) =>
    R.forEach((dir: string): void => {
      let path_current = expectedPathForDir(path_last || config.path) + dir
      let file = fs.statSync(path_current)
      if (config.recursive && file.isDirectory()) {
        ++deep
        nodeInfo = {
          ...nodeInfo,
          [path_current]: deep
        }
        findFiles(path_current)(fs.readdirSync(path_current))
        if (deep > max) {
          max = deep
        }
        // 需要-1 因为目录进入目录前会+1
        deep = nodeInfo[path_current] - 1
      } else if (file.isFile()) {
        files.push(dir)
      }
    })

  let files = [],
    max = 0,
    deep = 0,
    nodeInfo = {}

  // 获取文件名 Array
  findFiles()(fs.readdirSync(config.path))
  // 如果未设置deep，则使用max的值
  config.deep < 1 && (config.deep = max)
  // 根据expectedExt、excludeFile、expectedFiles进行过滤
  files = R.compose(
    // 过滤排除文件
    (files: string[]) =>
      files.filter(
        (file) => !config.excludedFiles.length || !config.excludedFiles.some((ext) => ext === file)
      ),
    // 期待的文件
    (files: string[]) =>
      files.filter(
        (file) => !config.expectedFiles.length || !config.expectedFiles.every((ext) => ext !== file)
      ),
    // 过滤后缀名
    (files: string[]) =>
      files.filter(
        (file: string) =>
          !config.expectedExts.length ||
          config.expectedExts.some((ext) => R.includes(expectedExt(ext), file))
      )
  )(files)
  // debug('The filtered files: %O', files)

  return files
}

const __DEFAULTS__: IStaticOpts = {
  route: '',
  path: '',
  showExt: true,
  exact: false,
  dynamic: false,
  recursive: false,
  // tplType: 'pug',
  deep: 0,
  expectedExts: [],
  excludedFiles: [],
  expectedFiles: []
}

function statics(app: Koa, configs: IStaticOpts[]) {
  R.forEach((_config: IStaticOpts) => {
    
    const config: IStaticOpts = JSON.parse(JSON.stringify(Object.assign({}, __DEFAULTS__, _config)))

    config.route = expectedRoute(config.route)
    config.path = expectedPathForDir(config.path)

    if (config.deep < 0) {
      throw new Error('deep 必须大于等于0')
    }

    if (config.tplType && !config.expectedExts.length) {
      config.expectedExts.push(expectedExt(config.tplType))
    }

    if (config.dynamic) {
      // 开启动态监听
      for (let i = Math.floor(config.deep); i >= 0; --i) {
        router.get(config.route + routeParams(`:${i}_params/`, i), async (ctx) => {
          // 拿到文件名，位于ctx.params的最后一个value
          let req_file = Object.values(ctx.params).pop()
          // 请求后，获得文件列表
          let files = filterFiles(config)
          // 生成showExt数组
          let _files = R.map((file: string) => (config.showExt ? file : getFileName(file)))(files)
          // 判断请求的文件名是否在其设置的目录内
          let findIndex = _files.indexOf(req_file as string)
          if (findIndex > -1) {
            // 请求的文件名在目录内
            let req_path = ''
            // 拼接路径
            R.forEachObjIndexed((value) => {
              req_path += `${value}/`
            })(ctx.params)
            // 删除最后的'/'
            req_path = expectedPathForFile(req_path)
            if (!config.showExt) {
              req_path += `.${getFileExtWithoutDot(files[findIndex])}`
            }
            ctx.set({
              'Content-Type': getContentType(getFileExtWithoutDot(req_path))
            })
            ctx.body = fs.createReadStream(resolve(config.path, req_path))
          } else {
            // 请求的文件名 未 在目录内
            return (ctx.status = 404)
          }
        })
      }
    } else {
      // 未开启动态监听
      let files = filterFiles(config)
      let callback = null
      // 是否使用模板引擎 决定使用哪个回调
      if (config.tplType) {
        // 使用模板引擎
        callback = (file) => async (ctx) => {
          let render = consolidate[config.tplType]
          if (!render) {
            throw new Error(`Engine not found for the ".${config.tplType}" file extension`);
          }
          await render(resolve(config.path, file), {}).then(html => {
            if (html) {
              ctx.body = html
            } else {
              return html
            }
          })
        }
      } else {
        // 未使用模板引擎
        callback = (file) => async (ctx) => {
          ctx.set({
            'Content-Type': getContentType(getFileExtWithoutDot(file))
          })
          ctx.body = fs.createReadStream(resolve(config.path, file))
        }
      }
      // 是否开启精准模式
      if (config.exact) {
        // 注册单页面路由
        if (files.length > 1) {
          debug('已启用exact，但是文件过滤结果有多个(%d)', files.length)
        }
        router.get(config.route, callback(files[0]))
      } else {
        // 注册多路由
        R.forEach((file: string) => {
          router.get(config.route + (config.showExt ? file : getFileName(file)), callback(file))
        })(files)
      }
    }
  })(configs)

  // 注册到koa
  app.use(router.routes())
  app.use(router.allowedMethods())
}

export = statics