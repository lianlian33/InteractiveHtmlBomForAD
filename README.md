# InteractiveHtmlBomForAD

[InteractiveHtmlBom](https://github.com/openscopeproject/InteractiveHtmlBom), a beatiful plugin in KiCad, this is a implementation in AD10 just with basic function. please refer to the original project for more functions.

将[InteractiveHtmlBom](https://github.com/openscopeproject/InteractiveHtmlBom)这个插件作了一些修改，使其能在AD中运行，这里只实现基础的功能，更多的功能请参考原项目。

到右边的[Releases](https://github.com/lianlian33/InteractiveHtmlBomForAD/releases)或到网盘下载http://luc33.ys168.com/ 密码123b

### 安装和使用 Installation and Usage 
 1. 运行一次Initianlize.bat
 <font color=#00008B>Run Initialize.bat once.</font>
 2. 用AD打开InteractiveHtmlBomForAD.PrjScr, 打开pcb文件，打开Run Script...窗口，运行main()函数，生成ibom。
 <font color=#00008B>Open InteractiveHtmlBomForAD.PrjScr in AD, open a pcbdoc and open *Run Script...* dialog then run main() function to generate ibom.</font>
 3. 关于脚本安装和运行的细节，请善用搜索...
  <font color=#00008B>For more details about running scripts in AD, please search on Internet...</font>

#### Link to original project for more info.

* [InteractiveHtmlBom](https://github.com/openscopeproject/InteractiveHtmlBom)

---

## v0.3.18 更新内容

### 界面中文化

- 设置窗口的“常规”和“HTML 默认设置”两个页面已全部翻译为中文。
- 专业术语按 Altium Designer 中文版习惯处理，BOM、PCB、DNP 等通用缩写保留英文，避免歧义。

### BOM 表格增强

- 新增 **Comment** 列：显示元件的 Comment 值；
- **Value** 列改为显示原理图中元件的 Value 字段，未填写时显示“-”。
- AD 中元件的 Value 或 Comment 为空时统一显示“-”，Comment为空时不再受“排除元件”的影响而隐藏。
- 新增 **Link** 列：以元件的 `ComponentLink1Description` 参数作为显示文字，带超链接，点击可跳转到 `ComponentLink1URL` 指定的链接，在新标签页打开。
  - 整块 PCB 中没有任何元件同时具备 `ComponentLink1Description` 和 `ComponentLink1URL` 参数时，不生成Link列。
  - 链接不同的元件会自动分成独立的 BOM 行，避免信息混淆。
  - 该列固定位于 BOM 表格最后一列。

### 导出与网络路径支持

- 支持导出到网络共享位置（如 `\\服务器\共享目录`），可直接在目录框输入或通过浏览按钮选择。
- 目录不存在时会自动逐级创建（共享根目录除外）。
- 生成后打开所在文件夹时，含空格的中文/网络路径也能正确定位。

### 生成后操作

- “在浏览器中打开”和“打开所在文件夹”两个选项已可用，可按需勾选，并会记住上次的选择。
- 生成完成后，按钮左侧会出现“导出完成”提示，直到下一次点击生成时清除。

### 稳定性与功能修复

- 当工程中没有可读取的原理图时，会自动放弃读取相关参数，不再生成依赖原理图的列（包括 `Value` 和 `Link` 列），也不会提示错误。
- 重新生成的 HTML 会按设置窗口里的最新选择初始化显示效果，不再被浏览器记住的旧显示状态覆盖。

  > 提示：修改设置后需重新生成一次 IBOM 才会生效。
