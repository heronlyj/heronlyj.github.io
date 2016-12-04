title: 修复 hexo DTraceProviderBindings not found
date: 2016-08-03 15:53:28
categories:
  - 技术
tags:
  - hexo

---

错误

```
{ [Error: Cannot find module './build/Release/DTraceProviderBindings'] code: 'MODULE_NOT_FOUND' }
{ [Error: Cannot find module './build/default/DTraceProviderBindings'] code: 'MODULE_NOT_FOUND' }
{ [Error: Cannot find module './build/Debug/DTraceProviderBindings'] code: 'MODULE_NOT_FOUND' }
```

[官方解决方案](https://hexo.io/zh-cn/docs/troubleshooting.html#DTrace-错误-（Mac-OS-X）)

```
$ npm install hexo --no-optional
```

但是官方的修复方法对我来说不太好使，用下面方法重新安装解决。
	
```
$ npm uninstall hexo-cli -g
$ npm install hexo-cli -g
```
	
---
	
参考自:  [解决hexo神烦的DTraceProviderBindings MODULE_NOT_FOUND](http://kikoroc.com/2016/05/04/resolve-hexo-DTraceProviderBindings-MODULE-NOT-FOUND.html)


