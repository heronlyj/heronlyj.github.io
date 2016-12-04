title: 初学 C++ 发现一个奇怪的问题
date: 2016-12-4 14:32:04
categories:
  - 技术
tags:
  - C++

---------
有这么一段 C++ 代码:

```c
int main(int argc, const char * argv[]) {
    vector<string> s{"aa", "bb"};
    vector<string> v{"AA", "BB"};
    cout << *s.end() << endl;
    return 0;
}
```

终端输出为  

```c
AA
```
<!--more-->

容器的迭代器方法 `s.end()` 返回的是 `AA`, 现在注释 `v` 的初始化:

```c
vector<string> s{"aa", "bb"};
// vector<string> v{"AA", "BB"};
cout << *s.end() << endl; // 输出为 空
```

改为如下:

```c
vector<string> s{"aa", "bb", "cc"};
vector<string> v{"AA", "BB"};
cout << *s.end() << endl; // 输出为 空
```

将 s 的个数增加为 4 个

```c
vector<string> s{"aa", "bb", "cc", "dd"};
vector<string> v{"AA", "BB"};
cout << *s.end() << endl; // 输出为 AA
```

是不是当 `s` 初始化成偶数个元素的时候，`s.end()` 返回的对象是 `v.begin()` ? 验证一下!

```c
vector<string> s{"aa","bb"};
vector<string> v{"AA"};
if (s.end() == v.begin()) {
    cout << "==" << endl; // 输出 ==
} else {
    cout << "!=" << endl;
}
```

连续初始化两个容器, 第一个容器的元素个数为偶数的话, 两个容器的内存地址是连在一起的, 所以第一个容器的 `s.end()` 是第二个容器的`v.begin()`

可为什么是偶数个元素呢？

