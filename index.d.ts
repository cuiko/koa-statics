/* =================== USAGE ===================

    const Koa = require('koa');
    const statics = require('@cuiko/koa-statics');
    const path = require('path');

    const app = new Koa();
    statics(app, [{
      route: '/',
      path: path.resolve('./static/tpl'),
      exact: true,
      expectedFiles: 'ejs3.ejs',
      tplType: 'ejs',
      // ...other
    }]);

 =============================================== */

import * as Koa from "koa"

declare function statics(app: Koa, configs: {
  /**
   * 页面路由映射的路径
   * e.g. It must start with '/', like /a/b/
   */
  route: string
  /**
   * 需要映射的本地地址
   * e.g. path.resolve(__dirname)
   */
  path: string

  /**
   * 路由路径是否需要带上后缀名
   * @default true
   */
  showExt?: boolean
  /**
   * 在此路由下只匹配一个页面，需要过滤后至少还有一个文件
   * @default true
   */
  exact?: boolean
  /**
   * 是否启用动态监听，需要事先确定deep
   * @default false
   */
  dynamic?: boolean
  /**
   * 是否递归文件夹
   * @default false
   */
  recursive?: boolean

  /**
   * 模板引擎名称 参考: https://github.com/tj/consolidate.js
   */
  tplType?: string

  /**
   * 限制输出的文件后缀
   * e.g. ['.html'] It must have '.'
   */
  expectedExts?: string[]
  /**
   * 期待输出的文件
   */
  expectedFiles?: string[]
  /**
   * 排除的文件名
   */
  excludedFiles?: string[]

  /**
   * 1以上为有效值，横向后续有添加无所谓，纵向的深度需要提前确定
   */
  deep?: number
}[]): void

export = statics