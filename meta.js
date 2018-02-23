const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

function kebabToCamel(name) {
  name = name.replace(/\-(\w)/g, (match, p1) => {
    return p1.toUpperCase();
  });
  name = name.replace(/^\w/, (match) => {
    return match.toUpperCase();
  });
  return name
}

module.exports = {
  prompts: {
    cliType: {
      type: 'list',
      message: '您要开发',
      default: 0,
      choices: [{
        'name': 'Vue组件',
        'value': 'component'
      }, {
        'name': 'Vue插件',
        'value': 'plugin'
      }, {
        'name': 'js通用库',
        'value': 'jsLibary'
      }]
    },
    scope: {
      type: "list",
      message: "请选择适用范围",
      default: 0,
      choices: [{
        "name": "通用（以@istrong/作为前缀）",
        "value": "common",
        "short": "通用（以@istrong/作为前缀）"
      }, {
        "name": "自定义组件",
        "value": "customize",
        "short": "自定义组件"
      }]
    },
    name: {
      type: 'string',
      required: true,
      message: '名称'
    },
    library: {
      type: 'string',
      required: true,
      message: '浏览器使用的库名称',
      default(answers) {
        if (answers.name) {
          return kebabToCamel((answers.scope === 'common' ? 'IString' : '') + answers.name)
        } else {
          return ''
        }
      }
    },
    description: {
      type: 'string',
      required: false,
      message: '简要概述',
      default(answers) {
        return answers.cliType === 'component' ? 'Vue组件' : (answers.cliType === 'plugin' ? 'Vue插件' : '')
      }
    },
    version: {
      type: 'string',
      required: false,
      message: '版本号',
      default: '0.1.0'
    },
    author: {
      type: 'string',
      message: '作者'
    },
    githubAccount: {
      type: 'string',
      required: false,
      message: 'GitHub账号',
      default: ''
    },
    css: {
      type: "list",
      when: "cliType === 'component'",
      message: "Pick a css language",
      choices: [
        "css",
        "sass",
        "less",
        "stylus"
      ]
    }
  },
  helpers: {
    authorFullNameFrom: function (author) {
      const startPosition = author.indexOf('<')
      return author.slice(0, startPosition - 1)
    },
    authorEmailFrom: function (author) {
      const startPosition = author.indexOf('<')
      const endPosition = author.indexOf('>')
      return author.slice(startPosition + 1, endPosition)
    }
  },

  complete: (data, helpers) => {
    const runCommand = (cmd, args, options) => {
      return new Promise((resolve, reject) => {
        const spwan = spawn(
          cmd,
          args,
          Object.assign({
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: true,
          },
            options
          )
        )
        spwan.on('exit', () => {
          resolve()
        })
      })
    };
    const msg = '   常用命令：\n\n   安装依赖：npm install\n      代码规范检测：npm run lint\n   自动修复代码规范问题：npm run fix\n   启动本地服务器：npm run dev\n   发布成npm包：npm publish'
    const file = path.join(data.destDirName,
      'src', 'lib', data.name + `${data.cliType === 'component' ? '.vue' : '.js'}`
    );
    const name = `${data.scope === 'common' ? 'IString-' + data.name : data.name}`;
    const componentContent = `<template>
<div class='`+ name + `'>
Hello `+ name + `
</div>
</template>

<script>
export default {
name: '`+ name + `',
props: {

},
data () {
  return {
  }
},
created () {
},
mounted () {
},
methods: {
}
}
</script>

<style>
.`+ name + `{

}
</style>
`
    if (data.cliType === 'component') {
      fs.mkdir(path.join(data.destDirName,'src', 'lib'),function(err){
        if (err) throw err
        fs.writeFile(file, componentContent, err => {
          if (err) throw err
        })
      })
    }
    console.log('开始安装依赖......')
    runCommand('npm', ['install'], { cwd: `${data.name}` })
      .then(() => {
        console.log('\n   依赖安装完成！')
        console.log('   开始启动！')
        runCommand('npm', ['run', 'dev'], { cwd: `${data.name}` })
        console.log(msg)
      })
  }
}
