# 📖 英语阅读实验室 (English Reader Lab)

一个模块化的英语学习辅助工具，支持文章深度解析（分句、词性标注、语法分析、知识点提取）、全文翻译、生词本管理、历史记录等核心功能。项目采用纯前端技术栈，无需后端服务器，数据存储在浏览器本地。

[![GitHub stars](https://img.shields.io/github/stars/fanqin314/english-reader-lab-?style=social)](https://github.com/fanqin314/english-reader-lab-/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ 功能特性

- **深度解析**  
  - 智能分句（处理常见缩写如 Mr. Mrs. Dr. 等）  
  - 单词词性标注（名词、动词、形容词等 10 种词性，支持颜色高亮）  
  - 句子语法结构分析（主谓宾、定状补）  
  - 知识点提取（重点搭配、作文金句）  
  - 全文翻译（中英对照）

- **生词本**  
  - 创建/删除多个生词本  
  - 右键或双击单词快速添加（自动获取词性和释义）  
  - 手动添加单词并编辑释义  
  - 导入/导出词库（JSON 格式）

- **历史记录**  
  - 自动保存每一次深度解析的完整结果（原文、翻译、所有句子分析）  
  - 历史记录列表展示（原文摘要 + 保存时间）  
  - 点击查看详情，支持缺失数据按需实时请求 API（不覆盖原记录）

- **个性化设置**  
  - 支持 DeepSeek / OpenAI 等兼容 API 配置  
  - 深色模式 / 浅色模式切换  
  - 词性高亮颜色自定义（10 种词性独立开关）

- **纯前端，无后端**  
  - 所有数据存储在浏览器本地（localStorage）  
  - 可离线使用（需首次配置 API Key）

---

## 🖥️ 技术栈

- 原生 JavaScript (ES6+)  
- HTML5 / CSS3（CSS 变量实现深色模式）  
- 模块化架构（ES Module）  
- 事件驱动通信（EventBus）  
- 依赖注入（ModuleRegistry）

---

## 🚀 快速开始

### 1. 获取代码

```bash
git clone https://github.com/fanqin314/english-reader-lab-.git
cd english-reader-lab-
2. 运行项目
由于项目使用了 ES Module 和本地存储，必须使用本地服务器运行，不能直接双击打开 index.html。

方法一：Python 自带服务器

bash
# 进入项目根目录
python -m http.server 8000
然后浏览器访问 http://localhost:8000

方法二：VS Code Live Server
右键 index.html → Open with Live Server

3. 配置 API Key
点击页面右上角的 ⚙️ 设置按钮

在 API 配置 区域填入你的 API Key（支持 DeepSeek、OpenAI 等兼容接口）

Base URL: https://api.deepseek.com

Model: deepseek-chat

点击 保存，然后 测试连接 确保成功

💡 没有 API Key？可以免费注册 DeepSeek 获取赠金。

4. 开始使用
在文本框中粘贴英文文章

点击 解析 按钮，系统会自动分句、全文翻译，并显示句子卡片

点击每个句子下方的按钮（词性、语法结构、知识点、翻译）按需获取详细分析

右键或双击任意单词可添加到生词本

点击 生词本 按钮管理你的单词库

点击 保存当前分析 将结果存入历史记录

📁 项目结构
text
英语阅读实验室/
├── core/                # 核心基础设施（事件总线、缓存、API请求、模块注册）
├── features/            # 功能模块（深度解析、生词本、历史记录等）
│   ├── deep_parse/      # 深度解析（分句、句子分析、全文翻译、词性高亮）
│   ├── vocabulary/      # 生词本
│   └── history/         # 历史记录
├── global_ui/           # 全局界面组件（主按钮、第二行按钮、设置）
├── assets/              # 静态资源（样式表）
├── index.html           # 入口页面
└── README.md
详细结构说明请参阅 项目结构与功能分析

🤝 贡献
欢迎提交 Issue 或 Pull Request。请确保遵循项目编码规范（见 docs/coding_standards.md）。

📄 许可证
MIT License © 2026 fanqin314

🙏 致谢
DeepSeek 提供的强大 AI 模型

所有参与测试和反馈的朋友们

如果觉得这个工具对你有帮助，欢迎给个 ⭐ Star 支持一下！
