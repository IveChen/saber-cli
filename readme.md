### 关于 saber-cli
> - 为什么叫saber?
> - 嘿嘿嘿... [Arturia Pendragon](http://baike.baidu.com/item/%E9%98%BF%E5%B0%94%E6%89%98%E5%88%A9%E4%BA%9A%C2%B7%E6%BD%98%E5%BE%B7%E6%8B%89%E8%B4%A1/10500553?fromtitle=SABER&fromid=19954634)
> - 为什么有saber?
> - 每次搞新项目就各种重新搭框架各种改这里改那里，超级烦 ...


### 要求

> - node: 6+
> - platform: osx , windows
> - 因为使用了一些奇奇怪怪的包，建议翻墙。
> - 精灵图需要使用到phantomjs，建议提前安装以免安装失败。
```
    http://phantomjs.org/download.html
```

### 警告！

在1.0.0之前的版本都不稳定，会进行破坏性变更

### 安装使用
```
npm install saber-cli -g
```

### 命令
#### init
> 在当前目录初始化工程
```
sbr init
```


#### create <projectName>
> 在当前目录创建<projectName>子目录，并初始化工程
```
sbr create <projectName>
//eg: sbr create hello-world
```


#### run [pageName]
> 打开开发服务器并自动打开 [pageName] 页面
```
sbr run [pageName]
//eg: sbr run user/list
```

#### page <pageName>
> 往工程添加 <pageName> 页面
```
sbr page <pageName>
//eg: sbr page user/list
```

#### build
> build project
```
sbr build
```

#### version
> show saber-cli version
```
sbr --version
sbr -V
```


### 开发中的功能
- 将资源文件直接注入到html中
> eg:
```html
    <script src='./index.js?inline' />
```


- 自动将px转换成rem (...因为烂用rem会导致一些问题..所以有点犹豫是不是要提供)
> - 一些 ie9+ 工程可以无兼容性问题使用此单位.
> - 一些 mobile page 工程需要使用此单位.
> - 将基于此方案实现,同时将解决1px问题 http://www.jianshu.com/p/985d26b40199 。

- 添加假数据命令
```
    sbr mock <apiName>
    //eg: sbr mock user/list/:id
```

- 添加测试命令
```
    sbr test
```

- 允许由使用者自定义生成的页面模板
```
    其实并不想提供，因为正常人都会ctrl+c ctrl+v = = 比调用命令还方便。
```


### History
#### 2017.8.9
- 参考https://github.com/youzan/sprite-loader后修改了相关的规则代码进行精灵图的生成
- 修复了使用了babel-preset导致vue无法使用的问题。

#### 2017.8.3
v0.0.18
- ~~鉴于使用精灵图会在初始化的时候编译多次从而导致一直刷新页面，因此使用了节流函数确保页面在3秒内最多刷新一次页面.更多查看 http://justclear.gitlab.io/throttle-and-debounce/~~

#### 2017.8.2
v0.0.17
- 支持精灵图，要求必须为png图片，且需要加上?sprite
~~目前使用https://github.com/youzan/sprite-loader进行精灵图的自动生成。~~
> eg
```css
    .test{
        background:url('./saber.png?sprite')
    }
```

#### 2017.8.1
v0.0.15
- 支持配置编译后的文件存放路径，相关配置在[project]/config/prod.config.js
- 使用postcss的autoprefixer自动添加css前缀，相关配置在[project]/config/base.js

#### 2017.7.31
v0.0.13
- 支持自定义vendors,可以减少其他相关文件的编译体积，具体配置查看[project]/config/base.js

#### 2017.7.20
v0.0.11
- 支持使用传统的模板化开发，使用underscore模板
- 支持代理服务器

#### 2017.7.19


v0.0.9
- 更新创建工程的流程
- 选择主框架为react时会安装一些react的默认依赖
- 修复在windows系统中的路径文件
- 当资源使用ie后缀时会自动转换为if-ie语法。
```
    // ie10 ie11 not support if condition.
    // you can use <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE9"> to make it possible
    // the best way is use modernizr.js or feature.js to check browser features.
    <script src='./index.js?ie=9'></script> //ie9
    <script src='./index.js?ie=9-'></script> //ie8,ie7 ...
    <script src='./index.js?ie=9+'></script> //ie9 ie10 ..
    <script src='./index.js?ie=9-11'></script> //ie9 ie10 ie11
```

#### 2017.7.18
v0.0.6
- 资源使用source时会只复制文件不进行任何编译，用于引入第三方文件
```
    <script src='./index.js' ></script>
    <script src='./index.js?source' ></script>
    <link src='./index.css' />
    <link src='./index.less' />
    //more details exec command  'sbr run example/tradition'
```
- 更新examples


#### 2017.7.17
v0.0.4
> - 添加了html-loader

#### 2017.7.16
v0.0.3
> - 添加了favorite.ico
> - 添加了image的loader
> - 添加了fonts的loader

#### 2017.7.14
v0.0.2
> - 完成create命令
> - 完成init命令
> - 完成page命令
> - 完成run命令
> - 完成build命令

#### 2017.7.13
v0.0.1
> 测试工程
