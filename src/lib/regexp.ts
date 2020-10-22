const email: RegExp = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/

const ip: RegExp = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/

const hex: RegExp = /^#([a-fA-F0-9]{3}){1,2}$/

const url: RegExp = /^http[s]?:\/\/[^\s]+/

// adsf_asd.txt => adsf_asd
const fullFileName: RegExp = /.*(?=\.(?=((?!\.).)*$))/g

// /asdasd/dwda_ sdf.ss.js => dwda_ sdf.ss.js
const pathToGetFileName: RegExp = /(?=((?!\/).)*$).*/g

// 获取文件拓展名 不带. /asdasd/dwda_ sdf.ss.js => js
const fileExtWithoutDot: RegExp = /(?=((?!\.).)*$)\S+$/g

// 获取文件拓展名 带. /asdasd/dwda_ sdf.ss.js => .js
const fileExtWithDot: RegExp = /(?=\.((?!\.).)*$)\S+$/g

export {
  email,
  ip,
  hex,
  url,
  fullFileName,
  pathToGetFileName,
  fileExtWithDot,
  fileExtWithoutDot,
}