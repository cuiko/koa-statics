import { fullFileName, fileExtWithoutDot } from './regexp'

const common_contentType = new Map([
  [
    ['mp4'],
    'video'
  ],
  [
    ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'image'
  ],
  [
    ['html', 'xml', 'css'],
    'text'
  ],
  [
    ['json', 'pdf'],
    'application'
  ]
])
const unique_contentType = new Map([
  [
    ['txt'],
    'text/plain'
  ],
  [
    ['js'],
    'text/javascript'
  ]
])
const getContentType = (ext: string): string => {
  for (let [exts, type] of common_contentType) {
    if (exts.includes(ext)) {
      return `${type}/${ext}`
    }
  }
  for (let [exts, contentType] of unique_contentType) {
    if (exts.includes(ext)) {
      return contentType
    }
  }
  return 'text/plain'
}

const expectedRoute = (path: string): string => {
  if (path !== '/') {
    path = path.startsWith('/') ? path : `/${path}`
    path = path.endsWith('/') ? path : `${path}/`
  }
  return path
}

const expectedPathForDir = (path: string): string => path.endsWith('/') ? path : `${path}/`

const expectedPathForFile = (path: string): string => path.endsWith('/') ? path.slice(0, path.length - 1) : path

const expectedExt = (ext: string): string => ext.startsWith('.') ? ext : `.${ext}`

// 不带后缀 用于获取目录下文件名后缀 e.g aa.a.txt 提取出 aa.a
const getFileName = (str: string): string => str.match(fullFileName)[0]

// 不带.
const getFileExtWithoutDot = (str: string): string => str.match(fileExtWithoutDot)[0]

const routeParams = (str: string, length: number): string => {
  if (length === 0) {
    return expectedPathForFile(str)
  } else {
    return routeParams(`${str}:${--length}_params/`, length)
  }
}

const extMap = {
  pug: 'pug',
  ejs: 'ejs',
}
const getExtByTplType = (tplType: string) => extMap[tplType]

export {
  getContentType,
  expectedRoute,
  expectedPathForDir,
  expectedPathForFile,
  expectedExt,
  getFileName,
  getFileExtWithoutDot,
  routeParams,
  getExtByTplType,
}