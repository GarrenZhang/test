/**
 *  @param { number } num
 */
export const formatMoney = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// 截取字符串并加上省略号
export function subText(str, length) {
  if (str.length === 0) {
      return '';
  }
  if (str.length > length) {
      return str.substr(0, length) + "...";
  } else {
      return str;
  }
}
// 获取文件base64编码
/**
 * @param file
 * @param format  指定文件格式
 * @param size  指定文件大小(字节)
 * @param formatMsg 格式错误提示
 * @param sizeMsg   大小超出限制提示
 * @returns {Promise<any>}
 */
export function fileToBase64String(file, format = ['jpg', 'jpeg', 'png', 'gif'], size = 20 * 1024 * 1024, formatMsg = '文件格式不正确', sizeMsg = '文件大小超出限制') {
  return new Promise((resolve, reject) => {
      // 格式过滤
      let suffix = file.type.split('/')[1].toLowerCase();
      let inFormat = false;
      for (let i = 0; i < format.length; i++) {
          if (suffix === format[i]) {
              inFormat = true;
              break;
          }
      }
      if (!inFormat) {
          reject(formatMsg);
      }
      // 大小过滤
      if (file.size > size) {
          reject(sizeMsg);
      }
      // 转base64字符串
      let fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
          let res = fileReader.result;
          resolve({base64String: res, suffix: suffix});
          reject('异常文件，请重新选择');
      }
  })
}

// B转换到KB,MB,GB并保留两位小数
/**
 * @param { number } fileSize
 */
export function formatFileSize(fileSize) {
  let temp;
  if (fileSize < 1024) {
      return fileSize + 'B';
  } else if (fileSize < (1024 * 1024)) {
      temp = fileSize / 1024;
      temp = temp.toFixed(2);
      return temp + 'KB';
  } else if (fileSize < (1024 * 1024 * 1024)) {
      temp = fileSize / (1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'MB';
  } else {
      temp = fileSize / (1024 * 1024 * 1024);
      temp = temp.toFixed(2);
      return temp + 'GB';
  }
}

// base64转file
/**
 *  @param { base64 } base64
 *  @param { string } filename 转换后的文件名
 */
export const base64ToFile = (base64, filename )=> {
  let arr = base64.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let suffix = mime.split('/')[1] ;// 图片后缀
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${filename}.${suffix}`, { type: mime })
};
// base64转blob
/**
 *  @param { base64 } base64
 */
export const base64ToBlob = base64 => {
  let arr = base64.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};
// blob 转 file
/**
 *  @param { blob } blob
 *  @param { string } fileName
 */
export const blobToFile = (blob, fileName) => {
  blob.lastModifiedDate = new Date();
  blob.name = fileName;
  return blob;
};

// file转 base64
/**
 * @param { * } file 图片文件
 */
export const fileToBase64 = file => {
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
      return e.target.result
  };
};
// 递归生成树形结构
export function getTreeData(data, pid, pidName = 'parentId', idName = 'id', childrenName = 'children', key) {
  let arr = [];

  for (let i = 0; i < data.length; i++) {
      if (data[i][pidName] == pid) {
          data[i].key = data[i][idName];
          data[i][childrenName] = getTreeData(data, data[i][idName], pidName, idName, childrenName);
          arr.push(data[i]);
      }
  }

  return arr;
}

// 遍历树节点
export function foreachTree(data, childrenName = 'children', callback) {
  for (let i = 0; i < data.length; i++) {
      callback(data[i]);
      if (data[i][childrenName] && data[i][childrenName].length > 0) {
          foreachTree(data[i][childrenName], childrenName, callback);
      }
  }
}

// 追溯父节点
export function traceParentNode(pid, data, rootPid, pidName = 'parentId', idName = 'id', childrenName = 'children') {
  let arr = [];
  foreachTree(data, childrenName, (node) => {
      if (node[idName] == pid) {
          arr.push(node);
          if (node[pidName] != rootPid) {
              arr = arr.concat(traceParentNode(node[pidName], data, rootPid, pidName, idName));
          }
      }
  });
  return arr; 
}

// 寻找所有子节点
export function traceChildNode(id, data, pidName = 'parentId', idName = 'id', childrenName = 'children') {
  let arr = [];
  foreachTree(data, childrenName, (node) => {
      if (node[pidName] == id) {
          arr.push(node);
          arr = arr.concat(traceChildNode(node[idName], data, pidName, idName, childrenName));
      }
  });
  return arr;
}

// 根据pid生成树形结构
/**
 *  @param { object } items 后台获取的数据
 *  @param { * } id 数据中的id
 *  @param { * } link 生成树形结构的依据
 */
export const createTree = (items, id = null, link = 'pid') =>{
  items.filter(item => item[link] === id).map(item => ({ ...item, children: createTree(items, item.id) }));
};

// Windows根据详细版本号判断当前系统名称
/**
 * @param { string } osVersion 
 */
export function OutOsName(osVersion) {
  if(!osVersion){
      return
  }
  let str = osVersion.substr(0, 3);
  if (str === "5.0") {
      return "Win 2000"
  } else if (str === "5.1") {
      return "Win XP"
  } else if (str === "5.2") {
      return "Win XP64"
  } else if (str === "6.0") {
      return "Win Vista"
  } else if (str === "6.1") {
      return "Win 7"
  } else if (str === "6.2") {
      return "Win 8"
  } else if (str === "6.3") {
      return "Win 8.1"
  } else if (str === "10.") {
      return "Win 10"
  } else {
      return "Win"
  }
}

// 判断手机是Andoird还是IOS
/**
 *  0: ios
 *  1: android
 *  2: 其它
 */
export function getOSType() {
  let u = navigator.userAgent, app = navigator.appVersion;
  let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
  let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  if (isIOS) {
      return 0;
  }
  if (isAndroid) {
      return 1;
  }
  return 2;
}
