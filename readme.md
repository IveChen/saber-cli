### about saber-cli

saber is my wife. her name is  [Arturia Pendragon](http://baike.baidu.com/item/%E9%98%BF%E5%B0%94%E6%89%98%E5%88%A9%E4%BA%9A%C2%B7%E6%BD%98%E5%BE%B7%E6%8B%89%E8%B4%A1/10500553?fromtitle=SABER&fromid=19954634)

### note

cli is unstable before 1.0.0

### install
```
npm install saber-cli -g
```

### commands
#### init
> create project in current fold
```
sbr init
```


#### create <projectName>
> create project in current fold
```
sbr create <projectName>
//eg: sbr create hello-world
```


#### run [pageName]
> run project with [pageName] page
```
sbr run [pageName]
//eg: sbr run user/list
```

#### page <pageName>
> add <pageName> page
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


### features in developing
- tag include source rules.
> eg:
```html
    <script src='./index.js?ie9' />
    <script src='./index.js?inline' />
```
- tpl support
> for some traditional projects.

- upgrade project when cli is update before it's not stable.

### History
#### 2017.7.18
- <script src='./index.js' /> support
- <script src='./index.js?source' /> support
- <link src='./index.less' /> support
- update cli example app.


#### 2017.7.17
v0.0.4
> - html-loader support

#### 2017.7.16
v0.0.3
> - favorite.ico support
> - image loader support
> - fonts loader support

#### 2017.7.14
v0.0.2
> - create command
> - init command
> - page command
> - run command
> - build command

#### 2017.7.13
v0.0.1
> init project
