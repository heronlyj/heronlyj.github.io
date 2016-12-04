title: 在 Swift 中用 enum 来设计一个好用的网络请求模块
date: 2016-08-09 18:53:54
categories:
  - 技术
tags:
  - Swift
  - enum

---

> enum 是 Swift 中我非常喜欢的数据类型，通过枚举参数绑定不同的值，可以封装出一个能够任意组装的网络请求模块

### 绑定值

不同种类的类型所做的操作不同，可以组合成各种各样的操作，并很方便的分类，例如这样: 

```
enum Handler {
    case empty
    case sum(a: Int, b:Int)
    case alert(message: String?) // 可选值
    case completed(action: (result: AnyObject?) -> Void) // 闭包也是可以的
    
    var needMainThread: Bool {
        switch self {
        case .completed, .alert: return true
        default: return false
        }
    } 
}
```

<!--more--> 

### 与服务器的接口

用 enum 来设计与服务器的接口再合适不过了

```
enum API {
    case login(phone: String, password: String)
    case changePassword(smsCode: String, newPwd: String)
    case editUserInfo(name: String, age: Int, email: String?)
    case freshToken
    
    var name: String {
        switch self {
        case .login: return "login"
        case .changePassword: return "changePassword"
        case .editUserInfo: return "editUserInfo"
        case .freshToken: return "freshToken"
        }
    }
    
    var parame: [String: AnyObject] {
        switch self {
        case .login(let phone, let password):
            return ["phone": phone, "password": password]
            
        case .changePassword(let smsCode, let newPwd):
            return ["smsCode": smsCode, "newPwd": newPwd]
            
        case .editUserInfo(let name, let age, let email):
            var parames: [String: AnyObject] = ["name": name, "age": age]
            if let email = email {
                parames["email"] = email
            }
            return parames
            
        case .freshToken: return [:]
        }
    }	
}
```

### 分情况处理响应

为了方便的处理请求响应，可以把成功与失败与分开处理

```
enum SuccessHandler {
    case empty
    case custom(result: (response: AnyObject?) -> Void)
}

enum FailureHandler {
    case empty
    case alert
    case custom(result: (error: NSError) -> Void)
}
```

### 封装网络请求

将请求类型也用一个 enum 来分类，以后将 Alamofire 更换为其他的库，只要这里更改一下就好了，避免影响过大

```
struct Networking {

  // 其他类型不再赘叙
    enum Method {
        case GET, POST
        
        var toAlamofire: Alamofire.Method {
            switch self {
            case .GET       : return Alamofire.Method.GET
            case .POST      : return Alamofire.Method.POST
            }
        }
    }
    
    // 增加默认值, 在调用某些不需要回调的请求时非常简短
    static func request(
        method method  : Method = .POST,
               api     : API,
               success : SuccessHandler = .empty,
               failure : FailureHandler = .empty) {
        
        let alamofireRequest = Alamofire.request(
            method.toAlamofire, 
            ServerIP + api.name,
            parameters: api.parame)
        
        alamofireRequest.responseJSON
            { (response: Response<AnyObject, NSError>) -> Void in
                // 针对不同的返回状态来处理
        }   
    }

}
```

### 使用

这样的话一个网络请求语句写起来很简单了

```
// 最简单的，不需要回调
Networking.request(api: .freshToken)

// 需要返回值的请求， 失败弹出提示框
Networking.request(
    api     : .editUserInfo(name: "xxxx", age: 24, email: nil),
    success : .custom(result: { (response: AnyObject?) in
        // 处理成功的响应
    }),
    failure : .alert)
    
```

### 增加响应类型

不同的请求响应需要不同的处理方式，那么就根据 enum 来分类处理，就算后期要用其他的处理类型，也只要在成功或者失败的 handler 中增加一种类型就行了，完全不影响老代码。

例如增加一个类似 Alamofire 的 Result :

```
enum Result<Value> {
    case Success(Value)
    case Failure(NSError)
}
```

那我也想把服务器响应数据按照 Result 泛型的方式封装怎么办, 可以这样:

```
// 通用泛型 json 转 model
protocol JsonObj {
    init(data: AnyObject?)
    static func factory(data: AnyObject?) -> [Self]
}

// Networking 增加下面的方法
static func request<T: JsonObj>(
    method method   : Method = .POST,
           api      : API,
           completed: ((result: Result<T>) -> Void)) {
    
    request(
        method : method,
        api    : api,
        success: .custom(result: { (response: AnyObject?) -> Void in
            completed(result: Result.Success(T(data: response)))
        }),
        faield: .custom(result: { (error: NSError) in
            completed(result: Result.Failure(error))
        }))
}
```

对那些通用的响应处理，如上文提到的 ```.empty``` ,  ```.alert``` 则可以通过一个默认的处理方法来处理，避免大量的重复代码。

### 总结

Swift 中的 enum 灵活性很强, 很方便分类处理多种情况，上面的 API 设计也有比较啰嗦的感觉，但是 API 一般变动不大，有些请求会在很多地方使用，用 enum 来绑定参数，就不用再写烦人的字符串属性名了。通过增加网络请求方法中的 SuccessHandler 与 FailureHandler 类型，就可以组装出多种响应处理方式，总之感觉很方便。 








