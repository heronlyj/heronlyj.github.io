title: Swift 中一个简单的 KVO 小工具
date: 2016-08-22 21:49:00
categories:
  - 技术
tags:
  - Swift
  - 响应式

---


> 发现原作者已经分享过，有更详尽的设计思路过程，此处是原文 
> [用 Swift 实现轻量的属性监听系统](https://github.com/nixzhu/dev-blog/blob/master/2015-04-30-property-listener.md)



之前在看开源项目  [Yep](https://github.com/CatchChat/Yep)  源码的时候，看到了这么一个东西 *( 感谢 Yep 团队的开源 )*


``` 
// 观察者
struct Listener<T>: Hashable {
    let name: String
    
    typealias Action = T -> Void
    let action: Action
    
    var hashValue: Int {
        return name.hashValue
    }
}

func ==<T>(lhs: Listener<T>, rhs: Listener<T>) -> Bool {
    return lhs.name == rhs.name
}

```

<!--more-->

```
// 被观察的类型
class Listenable<T> {
    // 观察的值
    var value: T {
        didSet {
            setterAction(value)
            
            for listener in listenerSet {
                listener.action(value)
            }
        }
    }
    
    typealias SetterAction = T -> Void
    
    var setterAction: SetterAction
    
    var listenerSet = Set<Listener<T>>()
    
    // 绑定观察者
    func bindListener(name: String, action: Listener<T>.Action) {
        let listener = Listener(name: name, action: action)
        listenerSet.insert(listener)
    }
    
    // 绑定观察者并直接触发响应事件
    func bindAndFireListener(name: String, action: Listener<T>.Action) {
        bindListener(name, action: action)
        action(value)
    }
    
    // 移除
    func removeListenerWithName(name: String) {
        for listener in listenerSet {
            if listener.name == name {
                listenerSet.remove(listener)
                break
            }
        }
    }
    
    // 移除全部
    func removeAllListeners() {
        listenerSet.removeAll(keepCapacity: false)
    }
    
    init(_ v: T, setterAction action: SetterAction) {
        value = v
        setterAction = action
    }
}

```


挺有意思，想想使用场景，觉得可以部分代替 `NSNotificationCenter`，于是：

```
struct UserCenter {
    
    static let defaults = NSUserDefaults.standardUserDefaults()
        
    static func removeALLListener() {
        loginUser.removeAllListeners()
    }
    
    // 类型为 UserItem 的被观察对象
    static var loginUser: Listenable<UserItem?> = {
        
        var userItem: UserItem? = nil
        let realm = try! Realm()
        
        // 此处通过 userId 取出 Realm 中的 User 对象
        if let userId = defaults.objectForKey("loginUserId") as? Int,
            userModel = getUserModel(userId, realm: realm) {
            
            userItem = userModel.userItem
        }
        
        return Listenable<UserItem?>(userItem) { changUser in
            
            if let changUser = changUser {
                defaults.setObject(changUser.id, forKey: "loginUserId")
            } else {
                defaults.removeObjectForKey("loginUserId")
            }
            
            defaults.synchronize()
        }
        
    }()
}
```

这里定义了一个登录用户中心，静态类型为登录用户信息，任何地方都可以访问当前登录用户的信息，并且一旦用户更改了个人信息，观察者都会接受到更新：

```
// 观察者绑定用户信息并且立即触发监听事件，用来更新用户积分
UserCenter.loginUser.bindAndFireListener("UserVC.loginUser") { [weak self] loginUser in
    guard let sSelf = self else { return }
    dispatch_async(dispatch_get_main_queue()) { 
        sSelf.point.text = loginUser?.point ?? "0"
    }
}
```

如果在项目中另外一个地方用户发了一条评论，因此积分有所增加，此时只要：

```
var newValue = UserCenter.loginUser.value
newValue?.point = newPoint
UserCenter.loginUser.value = newValue
```

上面的分数在界面上就会得到更新。并且 `UserCenter` 中 `loginUser` 初始化的 `action` 同样也会接收到回调，将 `loginUserId` 写入到 `NSUserDefaults` 里

当然，每次使用一个字符串来绑定观察对象不是太方便，我们定义一个 `ListenerObject`, 然后让 `NSObject` 增加一个 `listener` 属性

```
struct ListenerObject {
    let name: String
    var loginUser: String {
        return name + ".loginUser"
    }
}

extension NSObject {   
    var listener: ListenerObject {
        return ListenerObject(name: String(self))
    }
}
```

那么我们绑定监听对象的时候，在任何一个 `NSObject` 的子类里面都有一个 `listener` 属性，拿来即用


```
UserCenter.loginUser.bindAndFireListener(listener.loginUser) { [weak self] loginUser in
   ......
}
```

注意使用的时候，观察者需要手动移除监听，类似于 `NSNotificationCenter`，可以放在 `deinit` 中, 不存在内存泄漏的情况下会跟随对象释放:

``` 
deinit {
    UserCenter.loginUser.removeListenerWithName(listener.loginUser)
}
```

当然，还必须注意，不要多个观察者相互调用造成死循环

这只是一个简单的响应式工具，更加强大的响应式库可以参考 [ReactiveCocoa](https://github.com/ReactiveCocoa/ReactiveCocoa) 或者 [RxSwift](https://github.com/ReactiveX/RxSwift)



