# 游戏公共资源库

## 目录结构

```
common/
├── css/
│   ├── reset.css          # 样式重置
│   ├── responsive.css     # 响应式布局
│   └── animations.css     # 动画效果
└── js/
    ├── StorageManager.js  # 通用存储管理类
    └── Utils.js           # 通用工具函数
```

## 功能说明

### CSS 部分

1. **reset.css**
   - 统一浏览器默认样式
   - 重置盒模型
   - 移除默认内外边距
   - 设置基础字体样式

2. **responsive.css**
   - 响应式布局系统
   - 断点定义（xs, sm, md, lg, xl, xxl）
   - 栅格系统（row, col）
   - 响应式显示/隐藏
   - 移动端适配

3. **animations.css**
   - 淡入淡出动画
   - 缩放动画
   - 滑动动画
   - 弹跳动画
   - 旋转动画
   - 抖动动画
   - 游戏特定动画

### JavaScript 部分

1. **StorageManager.js**
   - 通用存储管理类
   - 支持 localStorage 操作
   - 支持游戏状态保存/加载
   - 支持成就系统
   - 支持排行榜
   - 支持设置保存

2. **Utils.js**
   - 时间格式化
   - 随机数生成
   - 数组操作
   - 设备检测
   - 防抖/节流
   - 消息提示
   - 滚动动画

## 使用方法

### 在 HTML 中引入

```html
<!-- 公共样式 -->
<link rel="stylesheet" href="../common/css/reset.css">
<link rel="stylesheet" href="../common/css/responsive.css">
<link rel="stylesheet" href="../common/css/animations.css">

<!-- 公共 JavaScript -->
<script src="../common/js/StorageManager.js"></script>
<script src="../common/js/Utils.js"></script>
```

### 继承 StorageManager 类

```javascript
class GameStorageManager extends StorageManager {
    constructor() {
        super('gameName');
    }
    
    // 添加游戏特定的存储方法
}

// 全局实例
window.storageManager = new GameStorageManager();
```

### 使用 Utils 工具函数

```javascript
// 时间格式化
Utils.formatTime(123456); // 返回 "02:03"

// 随机数生成
Utils.getRandomInt(1, 10); // 返回 1-10 之间的随机整数

// 设备检测
if (Utils.isMobile()) {
    // 移动端处理逻辑
}
```

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge
- 移动端浏览器

## 开发说明

1. 公共资源库的修改会影响所有游戏，请谨慎修改
2. 新增功能时，请确保兼容性
3. 定期清理无用代码
4. 保持代码风格一致

## 更新日志

### v1.0.0
- 初始版本
- 添加样式重置
- 添加响应式布局
- 添加动画效果
- 添加存储管理类
- 添加工具函数
