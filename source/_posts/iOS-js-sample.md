title: iOS 与 js 交互相关总结
date: 2016-8-2 23:39:04
categories:
  - 技术
tags:
  - iOS
  - JavaScript

---------

项目需要 webView 与 native 的交互，因此研究了相关的解决方案，因为功能很简单，没有用到三方库，仅仅从原生提供的 API。并且项目最低支持 iOS8，UIWebView 相关类型也不谈了。直接使用 iOS8 新增的 WebKit，对应的是 WKWebView;

<!--more--> 
	
### 初始化 webView

>在 UIWebView 中 js 调用 native 是通过拦截 request 的方式来实现的，可喜可贺的是 WebKit 新增类 WKScriptMessageHandler 直接提供调用的代理方法
	
``` Swift
// 先初始化配置
let config = WKWebViewConfiguration()

// 想要 js 调用 native, 得先将自己设置为 scriptMessageHandler，名字为 webViewApp
config.userContentController.addScriptMessageHandler(self, name: "webViewApp")

webView = WKWebView(frame: view.bounds, configuration: configuration)
webView.navigationDelegate = self
view.addSubview(webView)

// 加载url
guard let 
  urlStr = activityInfo?.url,  
  url    = NSURL(string: urlStr) 
  else { return }
/*
let request = NSURLRequest(
  URL             : url, 
  cachePolicy     : .ReloadIgnoringLocalCacheData, 
  timeoutInterval : 10.0
)
*/
webView.loadRequest(NSURLRequest(URL: url))
```
            
### 修改 WebView 的 UserAgent

***这个要在 AppDelegate 中操作，以免 webView 重新 request 新的 URL 失败的情况***

``` Swift
webView.evaluateJavaScript("navigator.userAgent") { [weak self] (obj: AnyObject?, error: NSError?) in
  guard let strongSelf = self, userAgent = obj as? String else { return }
  
  if !userAgent.hasSuffix("xxxx") {
    let newAgent = userAgent.stringByAppendingString(" xxxx")
    NSUserDefaults.standardUserDefaults().registerDefaults(["UserAgent": newAgent])
  }
}
```
	
### native 调用 js

在 webView 加载之后可以先将本地的 js 注入到 webView 中
	
例如在项目里面有这么一个 tools.js 文件
	
``` JavaScript
function getAllImageUrl(){
  var imgs = document.getElementsByTagName("img");
  var urlArr = [];
  for(var i=0;i<imgs.length;i++){
    var src = imgs[i].src;
    urlArr.push(src);
  }
  return urlArr.toString();
}
```
	
注入
	
``` Swift
guard let url = NSBundle.mainBundle().URLForResource("tools.js", withExtension: nil) else { return }
   
do {
  toolJsString = try String(contentsOfURL: url, encoding: NSUTF8StringEncoding)
  webView.evaluateJavaScript(toolJsString, completionHandler: nil)
} catch let error as NSError {
  print(error.localizedDescription)
}
```

或者直接调用 web 自己的 js 代码

``` Swift
// 先检测 reviceSchoolId 是否存在且不为 nil, 有兴趣可以搜索一下 js 中的 ‘typeof’ 关键字
webView.evaluateJavaScript("typeof reviceSchoolId;") { [unowned self, unowned webView] (_, error) in

  guard let schoolId = self.schoolId where error == nil else { return }
	
  // 调用 function reviceSchoolId() 并传递参数，obj 是返回值， 如果出错错的话 error 不为 nil
  webView.evaluateJavaScript("reviceSchoolId(\(schoolId));") { (obj, error) in
    printLogDebug(obj)
    printLogDebug(error)
  }
}
```

### js 调用 native

在 webView 初始化的时候有这么一句话
	
``` Swift
// 想要 js 调用 native, 得先将自己设置为 scriptMessageHandler，名字为 webViewApp
config.userContentController.addScriptMessageHandler(self, name: "webViewApp")
```

那么 js 里面得这么写

``` JavaScript
var message = {
  'className'  : 'Object',
  'methodName' : 'hello',
  'name'       : 'xxxxx',
  'password'   : 'xxxx'
};
// 注意 `webViewApp`, 与上面设置的要一致
window.webkit.messageHandlers.webViewApp.postMessage(message); 
```


在 native 中 WKScriptMessageHandler 有这么一个方法

``` Swift
extension SchoolAdViewController: WKScriptMessageHandler {

  func userContentController(userContentController: WKUserContentController, didReceiveScriptMessage message: WKScriptMessage) {
                
    //接受传过来的消息从而决定app调用的方法
    guard let 
      dict       = message.body as? [String:String],
      className  = dict["className"],
      methodName = dict["methodName"],
      name       = dict["name"],
      password   = dict["password"],
      else { return }
        
      // 至此，就收到了 js 传过来的值了，根据 className, methodName, 两个参数 name, password, 你可以做你想做的任何事情
      ...        
    }
    
}

```

### 总结

1. `iOS8` 的 `WKWebKit` 不用再通过拦截 `Request` 来跟 `js` 交互了
2. `js` 调用 `native` 通过 `WKScriptMessageHandler`
3. `native` 调用 `js` 通过 `WKWebView.evaluateJavaScript(javaScriptString:completionHandler:)`

那么如果 `js` 调用 `native`	需要一个返回值，或者参数中有个 callback 的话，怎么办呢？我没有找到答案，但这里有个参考 [WKWebview - Complex communication between Javascript & native code](http://stackoverflow.com/questions/29249132/wkwebview-complex-communication-between-javascript-native-code)

或许 iOS7 引入的 `JavaScriptCore` 中有解决方案，这个后期再研究

---------
参考地址:
>[UIWebView和WKWebView的使用及js交互](http://liuyanwei.jumppo.com/2015/10/17/ios-webView.html)
>[iOS JavaScriptCore使用](http://liuyanwei.jumppo.com/2016/04/03/iOS-JavaScriptCore.html)
	



