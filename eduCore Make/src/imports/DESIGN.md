---
version: alpha
name: eduCore Design System
description: |
  eduCore · 知境 教师端 / 专家 / 教研员端 Web 设计系统。
  源数据全部来自 Figma 文件 `eduCore`
  (fileKey: Y3gqxxe8kTezrsRX7mh1pz) 的 Variables 与 Styles。

  本文档面向两类读者:
    1. 设计师 —— 用作查色 / 查间距 / 查样式的「设计规范手册」
    2. 工程师 / AI (vibecoding) —— 用作设计 token 唯一可信源 (Single Source of Truth)

  规范原则:
    - 一律使用语义 token (state-*, bg-*, text-*, border-*…),禁止直接写 HEX。
    - Light / Dark 通过 semantic-color collection 的 mode 切换。
    - 任何与本文档冲突的旧实现,都视为待迁移。

source:
  figma:
    fileKey: Y3gqxxe8kTezrsRX7mh1pz
    url: "https://www.figma.com/design/Y3gqxxe8kTezrsRX7mh1pz/eduCore"
  collections:
    - id: "VariableCollectionId:6:676"
      name: base-number
      modes: [Light]
      count: 53
    - id: "VariableCollectionId:6:715"
      name: semantic-number
      modes: [Light]
      count: 80
    - id: "VariableCollectionId:6:776"
      name: base-color-light
      modes: [Light]
      count: 103
    - id: "VariableCollectionId:6:872"
      name: base-color-dark
      modes: [Light]
      count: 100
    - id: "VariableCollectionId:10:2"
      name: semantic-color
      modes: [Light, Dark]
      count: 82
  textStyles: 20
  effectStyles: 9
  paintStyles: 4
lastSyncedAt: 2026-06-16
---

# eduCore · 知境 设计系统规范

> **设计语言关键词**:克制 · 极简 · 人文 · 素净 · 自然 · 成熟 · 教师专业感 · 教育温度 · 信息密度适中 · 单一品牌色 · 深色友好

***

## Overview

eduCore · 知境 是一套面向教师 / 专家 / 教研员/学生的专业教学辅助系统。整套设计语言走的是"学院期刊 + 极简现代 SaaS"的中间路线 —— 既要有教育产品该有的沉稳与温度,又不能丢掉工程师日常依赖的工具感。

系统的视觉底色是 **温润的米白底** **`bg-primary`** **+ 近黑文字** **`text/black-primary`**,在 `PingFang SC` 字体和**紧密字距**的共同作用下,页面读起来像一份克制有度的刊物 —— 内容是主角,UI 是安静的书脊。色彩上我们坚持"**一品牌色 + 四状态色 + 一支辅助渐变**":品牌色是 `state-brand-default` 知境绿 `#0A7C57`,承担主 CTA / 选中 / 链接;success / warning / error / info 四套功能色阶仅服务于状态反馈,克制不溢出;另有一支 **二级辅助色** —— 从品牌色阶拉出的"更亮一档"色阶 `brand-color-1` ~ `brand-color-6`(`#E4EFEC → #1B8B65`),只在 `gradient/brand` / 营销背景 / 数据大屏等"强调氛围"的场景下出现,不参与组件级 CTA;自然色系(gray + white + black)和透明色(alpha)托起整个版面层级。组件级 CTA / 链接 / 选中态只从品牌色阶(`brand-color-1` \~ `brand-color-10`)内取色。

排版上只保留一个字体家族 `PingFang SC`,Regular 用于正文与链接,Semibold 用于标题与强调,绝不出现第三种字重。Display / Headline / Title / Body / Mark / Link 共 6 个语义类,字号阶梯从 12px 一路到 64px,每一步都对应一个明确的语义场景(教学场景下不同信息密度的承载)。

圆角只走一套"以小为主"的阶梯:`xs 4px / sm 6px / md 8px / lg 12px / xl 16px`,极少用 `2xl`;阴影用 Effect Style 提供的 6 级系统,但默认落在 `shadow/sm` / `shadow/md`,绝不堆叠重投影。整体气质可以概括为"**把东西做对,而不是把东西做多**"。

**Key Characteristics:**

- **单一品牌色驱动**:全站的主结构色是 `state-brand-default` (#0A7C57),所有组件级强调、链接、选中态都从这一支绿系延展
- **二级辅助色克制出场**:品牌色阶更亮一档 `brand-color-1` ~ `-6` 只服务于 `gradient/brand` / 营销背景氛围,不参与组件级 CTA
- **四族状态色板**:success / warning / error / info 各 10 阶,仅用于状态反馈(成功 / 警告 / 错误 / 信息)
- **小圆角 + 多层细阴影**:默认 `radius-md` (8px),阴影走 Effect Style 6 级系统,默认 `shadow/sm` \~ `shadow/md`
- **三段式 token 架构**:semantic → base-color → base-number,改一处全链路跟随
- **Light / Dark 同等优先级**:`semantic-color` 双 mode 设计,Dark 切换无需重写组件
- **可访问性原生**:正文对比度 ≥ 4.5:1、触控目标 ≥ 44、焦点外环必显

***

## 目录

1. [品牌与设计原则](#1-品牌与设计原则)
2. [设计 Token 总览(系统架构)](#2-设计-token-总览系统架构)
3. [颜色 Colors](#3-颜色-colors)
4. [字体 Typography](#4-字体-typography)
5. [尺寸 Size · 间距 Spacing · 圆角 Radius](#5-尺寸-size--间距-spacing--圆角-radius)
6. [描边 Stroke · 不透明度 Opacity · Z 轴](#6-描边-stroke--不透明度-opacity--z-轴)
7. [阴影 Shadow · 模糊 Blur · 渐变 Gradient](#7-阴影-shadow--模糊-blur--渐变-gradient)
8. [组件 Components](#8-组件-components)
9. [图标 Icon](#9-图标-icon)
10. [栅格 · 断点 · 响应式](#10-栅格--断点--响应式)
11. [Dark Mode 翻转规则](#11-dark-mode-翻转规则)
12. [可访问性 Accessibility](#12-可访问性-accessibility)
13. [Vibecoding 契约 15 条](#13-vibecoding-契约-15-条)
14. [Do / Don't 设计避坑](#14-do--dont-设计避坑)
15. [变更日志 Changelog](#15-变更日志-changelog)
16. [附录:原始 Token 引用](#16-附录原始-token-引用)

***

## 1. 品牌与设计原则

### 1.1 品牌定位

| 维度   | 定位                                               |
| ---- | ------------------------------------------------ |
| 产品   | eduCore · 知境,面向中小学 / 高中 / 高校教师的智能备课与教学辅助平台(下设 SparkClass 熠课 / Thoth 智汇 / MyTA 领教 / EduHub 云枢 四大子模块) |
| 用户   | 一线教师、教研组长、学科专家、教育管理者                             |
| 关键词  | 克制 · 极简 · 人文 · 素净 · 自然 · 成熟                      |
| 视觉气质 | 学术期刊感 + 现代 SaaS 体验,克制不喧宾夺主                       |
| 主品牌色 | 知境绿 `#0A7C57`                                    |
| 色板族  | 品牌色 / 自然色 / 功能色 / 二级辅助色 / 透明色                    |

### 1.2 设计原则(5 条)

1. **以内容为中心** —— 信息密度服务于教学场景,反对装饰性元素侵占注意。
2. **一致优于花哨** —— 任何视觉决策必须能映射到 token 表内的某个值。
3. **可读性优先** —— 文字对比度遵循 WCAG AA(正文 ≥ 4.5:1,大字号 ≥ 3:1)。
4. **双模式原生** —— Light / Dark 同等优先级,组件设计时不可只考虑单模式。
5. **单一品牌色** —— 全站只有一个品牌色,不引入第二色,避免品牌认知分裂。

***

## 2. 设计 Token 总览(系统架构)

```
┌──────────────────────────────┐
│      semantic-color          │  ← 业务侧直接消费(默认)
│  state-* / bg-* / text-*     │
│  border-* / mask-* / shadow-*│
└──────────────┬───────────────┘
               │  alias 引用
┌──────────────┴───────────────┐
│     base-color-light/dark    │  ← 调色板原料(勿直接用)
│  brand-*  gray-*  success-*  │
│  warning-* error-* info-*    │
│  alpha-*  base/white/black   │
└──────────────┬───────────────┘
               │
        base-number / semantic-number
```

**三段式好处**

- 改一处 → 全链路自动跟随(Light / Dark 切换、状态色统一调教)
- 设计师调色板(下层),工程师语义层(上层),各司其职
- AI 直接消费 `state-brand-default` 等语义名,无需关心 HEX

***

## 3. 颜色 Colors

> **色板五族声明**:本系统包含 **品牌色 / 自然色 / 功能色 / 二级辅助色 / 透明色** 五族。
> "二级辅助色"是品牌色阶的 **1~6 档**(更亮一档)的复用,只服务于品牌渐变 / 营销氛围渲染,**不参与组件级 CTA / 链接 / 选中态**;组件层需要"另一种强调"时,统一回到 `brand-color-*` 阶内取色。

> Light 为默认主题。色卡以色块示意,实际 HEX 已在表中。

### 3.1 五族色板总览

| 族         | 角色                               | Base 命名                                                    | 数量         | 用途                           |
| --------- | -------------------------------- | ---------------------------------------------------------- | ---------- | ---------------------------- |
| **品牌色**   | 单一品牌色,主 CTA / 链接 / 选中(1~6 兼作二级辅助,见 [§3.4](#34-二级辅助色--品牌色更亮一档)) | `brand/brand-color-1` \~ `-10`                             | 10 阶       | 强调、CTA、链接、状态选中;1~6 档兼作二级辅助(渐变 / 营销) |
| **自然色**   | 中性灰阶 + 纯白纯黑                      | `gray/gray-color-1` \~ `-10` + `base/white` + `base/black` | 12 阶       | 文字、背景、描边、版面层级                |
| **功能色**   | success / warning / error / info | `success/color-1` \~ `-10` × 4                             | 4 × 10 阶   | 状态反馈(成功 / 警告 / 错误 / 信息)      |
| **透明色**   | 遮罩 / 玻璃 / 浮层                     | `alpha/alpha-black-*` / `alpha-white-*` / `alpha-brand-*`  | 37 阶 × 3 族 | 蒙层、玻璃、悬浮、水印                  |

> **关于"二级辅助色"的边界声明**:"二级辅助色"**不**是新增一族,而是品牌色阶的 **1~6 档**(更亮一档)被复用于 `gradient/brand` 等品牌渐变与营销氛围渲染。**不参与组件级 CTA / 链接 / 选中态**。组件层需要强调时,统一回到 `brand/brand-color-*` 阶内取色。

### 3.2 品牌色 `brand-`

> 主品牌色绿(`brand-color-*`)。第 7 阶 `#0A7C57` 为 **Brand Default**。

| 阶     | Token                     | HEX           | 用途                    |
| ----- | ------------------------- | ------------- | --------------------- |
| 1     | `brand/brand-color-1`     | `#E4EFEC`     | 极浅底 / 禁用底             |
| 2     | `brand/brand-color-2`     | `#CBE4DC`     | hover 浅底              |
| 3     | `brand/brand-color-3`     | `#94CFB9`     | 浅装饰                   |
| 4     | `brand/brand-color-4`     | `#5DB897`     | 浅描边                   |
| 5     | `brand/brand-color-5`     | `#34A07A`     | focus ring / 链接 hover |
| 6     | `brand/brand-color-6`     | `#1B8B65`     | hover                 |
| **7** | **`brand/brand-color-7`** | **`#0A7C57`** | **品牌主色 / Default**    |
| 8     | `brand/brand-color-8`     | `#005F48`     | hover-pressed         |
| 9     | `brand/brand-color-9`     | `#004A39`     | active / pressed      |
| 10    | `brand/brand-color-10`    | `#00372A`     | 深底文字                  |

**色卡**:

```
#E4EFEC  #CBE4DC  #94CFB9  #5DB897  #34A07A  #1B8B65  #0A7C57  #005F48  #004A39  #00372A
  ░░       ▒▒       ▒▒       ▓▓       ██       ██       ██       ██       ██       ██
浅 1      浅 2      浅 3      浅 4      主 1      主 2      主 3      深 1      深 2      深 3
```

> **⚠️ 重要约束**:`brand-color-3` (浅装饰) **不允许** 用作"辅助强调色"。要更亮或更深的品牌感,要么回退到 `bg-brand-subtle` (1 阶),要么前进到 `state-brand-focus` (5 阶)。中间档位保留给"插画 / 装饰图形"使用。

### 3.3 自然色 `gray-` + `base/white/black`

**Gray 中性(冷调)**:

| 阶  | Token                | HEX       | 用途      |
| -- | -------------------- | --------- | ------- |
| 1  | `gray/gray-color-1`  | `#F3F3F3` | 极浅底     |
| 2  | `gray/gray-color-2`  | `#E7E7E7` | 分割线     |
| 3  | `gray/gray-color-3`  | `#DDDDDD` | 浅描边     |
| 4  | `gray/gray-color-4`  | `#C6C6C6` | 占位 / 骨架 |
| 5  | `gray/gray-color-5`  | `#A6A6A6` | 弱化文字    |
| 6  | `gray/gray-color-6`  | `#8B8B8B` | 副文字     |
| 7  | `gray/gray-color-7`  | `#777777` | 副标题     |
| 8  | `gray/gray-color-8`  | `#5E5E5E` | 正文      |
| 9  | `gray/gray-color-9`  | `#393939` | 强调正文    |
| 10 | `gray/gray-color-10` | `#181818` | 标题      |

**Base 纯色**:`base/white = #FFFFFF` · `base/black = #000000`

### 3.4 二级辅助色 · 品牌色更亮一档

> "二级辅助色"**不**是新增一族色板,而是 **品牌色阶 `brand-color-1` ~ `brand-color-6` 的复用**。
> 这 6 档是品牌色阶中"更亮一档"的色值(从 `#E4EFEC` 极浅底,到 `#1B8B65` 中明度绿),专门服务于 `gradient/brand` 等品牌渐变与营销氛围渲染。**不出现在组件级 CTA / 链接 / 选中态**。组件层需要"另一种强调"时,统一回到 `brand-color-*` 阶内取色。
> 注意:这是品牌色 **更亮一档** 的延伸,**不是引入新色相**,保持品牌的视觉一致性。

**对应关系**(完整定义见 [§3.2](#32-品牌色-brand-)):

| 用途         | Token(直接复用品牌色阶)          | HEX        |
| ---------- | ----------------------- | ---------- |
| 极浅渐变起点     | `brand/brand-color-1`   | `#E4EFEC`  |
| 浅渐变中段      | `brand/brand-color-2`   | `#CBE4DC`  |
| 渐变中段       | `brand/brand-color-3`   | `#94CFB9`  |
| 渐变中段       | `brand/brand-color-4`   | `#5DB897`  |
| 渐变中段       | `brand/brand-color-5`   | `#34A07A`  |
| 品牌渐变主色     | `brand/brand-color-6`   | `#1B8B65`  |

**色卡**:

```
#E4EFEC  #CBE4DC  #94CFB9  #5DB897  #34A07A  #1B8B65
  ░░       ▒▒       ▒▒       ▓▓       ██       ██
浅 1      浅 2      浅 3      浅 4      主 1      主 2
```

> 💡 **核心理念**:二级辅助色是"品牌色的亮一档",**不发明新 token**。所有视觉决策都落在"一支绿系"的明度阶梯内,这才是"克制 · 极简 · 成熟"设计语言的体现。

**使用边界**:
- ✅ 用于 `gradient/brand` 渐变 / 营销 Hero 背景 / 数据大屏氛围
- ✅ 用于插画 / 装饰图形 / 海报 banner
- ❌ **不**用于按钮底色、链接色、选中态
- ❌ **不**用于组件级强调(组件强调统一回退到 `brand-color-*` 阶)

### 3.5 功能色 success / warning / error / info

> 4 套状态色各 10 阶。**第 7 阶 = Default**,**第 1 阶 = Subtle 底色**。

| 阶               | Success       | Warning       | Error         | Info          |
| --------------- | ------------- | ------------- | ------------- | ------------- |
| 1               | `#E3F9EB`     | `#FFF3E0`     | `#FFEEEE`     | `#F2F5FF`     |
| 2               | `#C9F2D8`     | `#FFE0B2`     | `#FCD3D3`     | `#D9E1FF`     |
| 3               | `#94E2B5`     | `#FFCC80`     | `#F8B4B4`     | `#B5C7FF`     |
| 4               | `#60D394`     | `#FFB74D`     | `#F58F8F`     | `#8EABFF`     |
| 5               | `#3CC576`     | `#FFA726`     | `#F36868`     | `#618DFF`     |
| 6               | `#1FB463`     | `#FF9800`     | `#E64545`     | `#366EF4`     |
| **7 (Default)** | **`#00A854`** | **`#F57C00`** | **`#D9363E`** | **`#056AE4`** |
| 8               | `#00874A`     | `#E65100`     | `#C12A33`     | `#0052D9`     |
| 9               | `#00643B`     | `#BF360C`     | `#A21D27`     | `#003CAB`     |
| 10              | `#00472A`     | `#8B2E00`     | `#801319`     | `#002A7C`     |

> ⚠️ **使用边界**:`info` 第 7 阶 `#056AE4` 服务"信息提示"语义(系统通知 / 教学引导),**不是**品牌色,也**不是**二级辅助色(品牌色阶 1~6 档的复用)。组件层需要"另一种强调"时,统一回退到 `brand-color-*` 阶内取色,或使用品牌色阶 1~6 档渲染品牌渐变 / 营销氛围。

> 注:success / info 的第 10 阶存在重名 `color-10` 命名小问题,消费侧统一使用 `state-*-default` 等语义 token 即可绕开。

### 3.5 透明色 `alpha-`

**Alpha 透明叠加(用于遮罩 / 玻璃 / 水印)**:

| 色族          | 4% | 8% | 10% | 12% | 20% | 30% | 40% | 50% | 60% | 70% | 80% | 90% | 100% |
| ----------- | -- | -- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---- |
| alpha-black | ✅  | ✅  | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | —    |
| alpha-white | ✅  | ✅  | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | —    |
| alpha-brand | ✅  | ✅  | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅    |

### 3.6 Semantic · 状态色 `state-*`

> 业务层使用最多的 token。`default` / `hover` / `active` / `focus` / `subtle` 5 态闭合。

| 状态族         | default   | hover     | active    | focus     | subtle    |
| ----------- | --------- | --------- | --------- | --------- | --------- |
| **brand**   | `#0A7C57` | `#005F48` | `#004A39` | `#34A07A` | `#E4EFEC` |
| **success** | `#00A854` | `#00874A` | `#00643B` | `#3CC576` | `#E3F9EB` |
| **warning** | `#F57C00` | `#E65100` | `#BF360C` | `#FFA726` | `#FFF3E0` |
| **error**   | `#D9363E` | `#C12A33` | `#A21D27` | `#F36868` | `#FFEEEE` |
| **info**    | `#056AE4` | `#0052D9` | `#003CAB` | `#618DFF` | `#F2F5FF` |

**Dark mode** 切换后值整体替换为深色调色板的对应阶(详见 [§11](#11-dark-mode-翻转规则))。

### 3.7 Semantic · 背景 `bg-*`

| Token                  | Light              | Dark               | 用途          |
| ---------------------- | ------------------ | ------------------ | ----------- |
| `bg/bg-primary`        | `#F3F3F3`          | `#181818`          | 页面主背景       |
| `bg/bg-secondary`      | `#E7E7E7`          | `#242424`          | 卡片底         |
| `bg/bg-tertiary`       | `#DDDDDD`          | `#2C2C2C`          | 输入框底        |
| `bg/bg-elevated`       | `#C6C6C6`          | `#393939`          | 浮起卡片        |
| `bg/bg-white`          | `#FFFFFF`          | `#000000`          | 纯白底(暗色下取反)  |
| `bg/bg-skeleton`       | `#E7E7E7`          | `#242424`          | 骨架屏         |
| `bg/bg-overlay`        | `rgba(0,0,0,0.50)` | `rgba(0,0,0,0.50)` | 全局遮罩        |
| `bg/bg-brand-subtle`   | `#E4EFEC`          | `#011A14`          | 品牌弱化底       |
| `bg/bg-brand-default`  | `#0A7C57`          | `#009466`          | 品牌强调底(按钮)   |
| `bg/bg-brand-deep`     | `#94CFB9`          | `#00432F`          | 品牌深色 Hero 底 |
| `bg/bg-success-subtle` | `#E3F9EB`          | `#0F2A1B`          | 成功提示底       |
| `bg/bg-warning-subtle` | `#FFF3E0`          | `#3A1F00`          | 警告提示底       |
| `bg/bg-error-subtle`   | `#FFEEEE`          | `#3D0A0F`          | 错误提示底       |
| `bg/bg-info-subtle`    | `#F2F5FF`          | `#1A2A3E`          | 信息提示底       |

### 3.8 Semantic · 文字 `text-*`

| Token                    | Light                    | 用途               |
| ------------------------ | ------------------------ | ---------------- |
| `text/black-primary`     | `rgba(0,0,0,0.90)`       | 主标题 / 重要正文       |
| `text/black-secondary`   | `rgba(0,0,0,0.70)`       | 副标题 / 正文         |
| `text/black-placeholder` | `rgba(0,0,0,0.50)`       | 输入占位 / 辅助        |
| `text/black-disabled`    | `rgba(0,0,0,0.30)`       | 禁用文字             |
| `text/white-primary`     | `rgba(255,255,255,0.90)` | 深色底文字            |
| `text/white-secondary`   | `rgba(255,255,255,0.70)` | 深色底副文            |
| `text/white-placeholder` | `rgba(255,255,255,0.50)` | 深色底占位            |
| `text/white-disabled`    | `rgba(255,255,255,0.30)` | 深色底禁用            |
| `text/brand-primary`     | `rgba(10,124,87,0.90)`   | 品牌主文字            |
| `text/brand-secondary`   | `rgba(10,124,87,0.70)`   | 品牌副文字            |
| `text/brand-placeholder` | `rgba(10,124,87,0.40)`   | 品牌占位             |
| `text/brand-disabled`    | `rgba(10,124,87,0.30)`   | 品牌禁用             |
| `text/brand`             | `#0A7C57`                | 纯品牌文字(链接)        |
| `text/link`              | `#0A7C57`                | 链接               |
| `text/success`           | `#00A854`                | 成功文字             |
| `text/warning`           | `#F57C00`                | 警告文字             |
| `text/error`             | `#D9363E`                | 错误文字             |
| `text/info`              | `#056AE4`                | 信息文字             |
| `text/pure-black`        | `#000000`                | 100% 黑色(印刷 / 导出) |
| `text/reverse`           | `#FFFFFF`                | 反色文字             |

> Dark mode 下 `text/black-*` 与 `text/white-*` 的 RGBA **相互置换**;`text/reverse` 变为 `rgba(0,0,0,0.90)`,`text/pure-black` 变为 `#FFFFFF`。

### 3.9 Semantic · 边框 `border-*`

| Token                          | Light                    | 用途       |
| ------------------------------ | ------------------------ | -------- |
| `border/border-black-hairline` | `rgba(0,0,0,0.04)`       | 1px 极细描边 |
| `border/border-black-faint`    | `rgba(0,0,0,0.08)`       | 弱描边      |
| `border/border-black-default`  | `rgba(0,0,0,0.20)`       | 默认描边     |
| `border/border-white-hairline` | `rgba(255,255,255,0.04)` | 深色底细描边   |
| `border/border-white-faint`    | `rgba(255,255,255,0.08)` | 深色底弱描边   |
| `border/border-white-default`  | `rgba(255,255,255,0.20)` | 深色底默认描边  |
| `border/border-brand-hairline` | `rgba(10,124,87,0.04)`   | 品牌色细描边   |
| `border/border-brand-faint`    | `rgba(10,124,87,0.08)`   | 品牌色弱描边   |
| `border/border-brand-default`  | `rgba(10,124,87,0.20)`   | 品牌色默认描边  |
| `border/border-pure-white`     | `#FFFFFF`                | 纯白描边     |
| `border/border-pure-black`     | `#000000`                | 纯黑描边     |
| `border/border-pure-brand`     | `#0A7C57`                | 纯品牌描边    |
| `border/border-pure-gray`      | `#DDDDDD`                | 纯灰描边     |

### 3.10 Semantic · 蒙层 / 阴影 / 特殊

**蒙层 mask**(用于模态、抽屉、悬浮背景):

| Token                        | Light              | Dark                     | 用途    |
| ---------------------------- | ------------------ | ------------------------ | ----- |
| `mask/mask-black-modal`      | `rgba(0,0,0,0.60)` | `rgba(255,255,255,0.60)` | 模态层   |
| `mask/mask-black-popover`    | `rgba(0,0,0,0.80)` | `rgba(255,255,255,0.80)` | 浮层    |
| `mask/mask-black-background` | `rgba(0,0,0,0.20)` | `rgba(255,255,255,0.20)` | 背景弱遮罩 |

**阴影色 shadow**(与 Effect Style 配合使用):

| Token                     | Light                    | 用途      |
| ------------------------- | ------------------------ | ------- |
| `shadow/shadow-default-1` | `rgba(0,0,0,0.04)`       | 1px 阴影  |
| `shadow/shadow-default-2` | `rgba(0,0,0,0.08)`       | 4px 阴影  |
| `shadow/shadow-default-3` | `rgba(0,0,0,0.20)`       | 10px 阴影 |
| `shadow/shadow-brand-1`   | `rgba(10,124,87,0.20)`   | 品牌主阴影   |
| `shadow/shadow-brand-2`   | `rgba(10,124,87,0.30)`   | 品牌重阴影   |
| `shadow/shadow-white`     | `rgba(255,255,255,0.20)` | 高光阴影    |

**特殊 special**:

| Token                  | Light                  | 用途     |
| ---------------------- | ---------------------- | ------ |
| `special/highlight`    | `rgba(10,124,87,0.08)` | 文本高亮底色 |
| `special/selection`    | `rgba(10,124,87,0.20)` | 选区底色   |
| `special/codeblock`    | `#E7E7E7`              | 代码块底色  |
| `special/error-shield` | `rgba(0,0,0,0.40)`     | 错误护盾   |

### 3.11 Dark Mode 调色板

> Dark 主题下,品牌色阶整体"反转"为深→浅(更暗为低阶,更亮为高阶),便于在深色背景中保持对比度。

| 阶               | brand (Dark)  | gray (Dark) |
| --------------- | ------------- | ----------- |
| 1               | `#011A14`     | `#181818`   |
| 2               | `#003225`     | `#242424`   |
| 3               | `#00432F`     | `#2C2C2C`   |
| 4               | `#00573C`     | `#393939`   |
| 5               | `#006D49`     | `#4B4B4B`   |
| 6               | `#008158`     | `#5E5E5E`   |
| **7 (Default)** | **`#009466`** | —           |
| 8               | `#33AB85`     | `#A6A6A6`   |
| 9               | `#66C5A6`     | `#DDDDDD`   |
| 10              | `#99DCC3`     | `#FFFFFF`   |

> Gray 阶 7 在 Dark 中保留 `#777777` 作为分界点(供 `border-pure-gray` 引用)。其它状态色阶对应翻转,见 [§11](#11-dark-mode-翻转规则)。

### 3.12 色彩使用决策树(看图选 token)

```
想要…
│
├─ 按钮 / 主操作底色
│   → state-brand-default / state-brand-hover / state-brand-active
│
├─ 按钮文字(主品牌按钮)
│   → text/reverse
│
├─ 普通正文
│   → text/black-primary
├─ 辅助说明文
│   → text/black-secondary
├─ 占位
│   → text/black-placeholder
├─ 禁用
│   → text/black-disabled
│
├─ 卡片底
│   → bg-secondary
├─ 浮起卡片
│   → bg-elevated
├─ 整页背景
│   → bg-primary
│
├─ 链接
│   → text/link  (颜色)  + state-brand-focus (下划线 / 外环)
│
├─ 描边
│   ├─ 默认 → border-black-default
│   ├─ 极细 → border-black-hairline
│   └─ 品牌 → border-brand-default
│
├─ 反馈色
│   ├─ 成功 → state-success-* / text/success / bg-success-subtle
│   ├─ 警告 → state-warning-* / text/warning / bg-warning-subtle
│   ├─ 错误 → state-error-*   / text/error   / bg-error-subtle
│   └─ 信息 → state-info-*    / text/info    / bg-info-subtle
│
└─ 永远不要直接写 HEX
    → 必须用 token,Dark Mode 才能自动切换
```

***

## 4. 字体 Typography

### 4.1 字体家族与字重

| Token                  | 值             | 用途           |
| ---------------------- | ------------- | ------------ |
| `font/family`          | `PingFang SC` | 中文主字体(苹方)    |
| `font/family-mono`     | `Menlo`       | 等宽(代码)       |
| `font/weight/regular`  | `Regular`     | 正文 / 链接 / 弱化 |
| `font/weight/semibold` | `Semibold`    | 标题 / 强调      |
| `font/weight/bold`     | `Bold`        | 极强调(备用)      |

> Web 兜底建议:`font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;`

> **克制原则**:全站只有 Regular 与 Semibold 两个字重,`bold` 留作极少数"强引导"场景备用,日常不出现。

### 4.2 字号 / 行高 / 字距 阶梯

| 阶梯 Token                    | 字号 | 典型行高 | 典型字距 | 场景          |
| --------------------------- | -- | ---- | ---- | ----------- |
| `font-size/displayLarge`    | 64 | 72   | 0%   | 营销大数字(数据大屏) |
| `font-size/displayMedium`   | 48 | 56   | 0%   | 封面主标题       |
| `font-size/headlineLarge`   | 36 | 44   | 0%   | 页面主标题       |
| `font-size/headlineMedium`  | 28 | 36   | 0%   | 区域标题        |
| `font-size/headlineSmall`   | 24 | 32   | 0%   | 卡片标题        |
| `font-size/titleExtraLarge` | 20 | 28   | 0%   | 重要列表项       |
| `font-size/titleLarge`      | 18 | 26   | 0%   | 二级标题        |
| `font-size/titleMedium`     | 16 | 24   | 0%   | Tab / 导航    |
| `font-size/titleSmall`      | 14 | 22   | 0%   | 标签头         |
| `font-size/bodyLarge`       | 16 | 24   | 0px  | 大正文         |
| `font-size/bodyMedium`      | 14 | 22   | 0%   | 常规正文        |
| `font-size/bodySmall`       | 12 | 20   | 0%   | 辅助文字        |
| `font-size/markMedium`      | 14 | 22   | 0%   | Mark 标签     |
| `font-size/markSmall`       | 12 | 20   | 0%   | 角标          |
| `font-size/linkLarge`       | 16 | 24   | 0%   | 大链接         |
| `font-size/linkMedium`      | 14 | 22   | 0%   | 默认链接        |
| `font-size/linkSmall`       | 12 | 20   | 0%   | 小链接         |

### 4.3 Text Style 全表(20 条)

> 这是 Figma 中实际定义并发布给工程侧的 Text Style,**AI 生成 UI 时应直接消费这 20 条**,不要重新组合 size / weight / lineheight。

| #  | Style Name             | Family      | Weight   | Size | LH | 字距  |
| -- | ---------------------- | ----------- | -------- | ---- | -- | --- |
| 1  | `Display/Large`        | PingFang SC | Semibold | 64   | 72 | 0%  |
| 2  | `Display/Medium`       | PingFang SC | Semibold | 48   | 56 | 0%  |
| 3  | `Headline/Large`       | PingFang SC | Semibold | 36   | 44 | 0%  |
| 4  | `Headline/Medium`      | PingFang SC | Semibold | 28   | 36 | 0%  |
| 5  | `Headline/Small`       | PingFang SC | Semibold | 24   | 32 | 0%  |
| 6  | `Title/ExtraLarge - B` | PingFang SC | Semibold | 20   | 28 | 0%  |
| 7  | `Title/ExtraLarge - R` | PingFang SC | Regular  | 20   | 28 | 0%  |
| 8  | `Title/Large`          | PingFang SC | Semibold | 18   | 26 | 0%  |
| 9  | `Title/Medium`         | PingFang SC | Semibold | 16   | 24 | 0%  |
| 10 | `Title/Small`          | PingFang SC | Semibold | 14   | 22 | 0%  |
| 11 | `Body/Large - B`       | PingFang SC | Semibold | 16   | 24 | 0px |
| 12 | `Body/Large - R`       | PingFang SC | Regular  | 16   | 24 | 0px |
| 13 | `Body/Medium - B`      | PingFang SC | Semibold | 14   | 22 | 0%  |
| 14 | `Body/Medium - R`      | PingFang SC | Regular  | 14   | 22 | 0%  |
| 15 | `Body/Small`           | PingFang SC | Regular  | 12   | 20 | 0%  |
| 16 | `Mark/Medium`          | PingFang SC | Semibold | 14   | 22 | 0%  |
| 17 | `Mark/Small`           | PingFang SC | Semibold | 12   | 20 | 0%  |
| 18 | `Link/Large`           | PingFang SC | Regular  | 16   | 24 | 0%  |
| 19 | `Link/Medium`          | PingFang SC | Regular  | 14   | 22 | 0%  |
| 20 | `Link/Small`           | PingFang SC | Regular  | 12   | 20 | 0%  |

### 4.4 使用建议

- **正文永远用** **`Body/*`**,不要用 Title 代替(影响阅读节奏)。
- **数字 / 数据高亮** 用 `Display/Medium` \~ `Headline/Large`,与正文拉开层级。
- **链接** 用 `Link/*` + 颜色 `text/link`;hover 时加下划线 + 颜色 `state-brand-hover`。
- **Mark** 用于 Tab 选中、筛选 chip、强调标签。
- **行高规则**:`1.4 ~ 1.6`(正文) > `1.0 ~ 1.3`(标题);数字型 Display 例外(72/64=1.125)。

***

## 5. 尺寸 Size · 间距 Spacing · 圆角 Radius

### 5.1 Base Number 原子表

> 这是所有语义的"原料",**消费侧**应优先用 [§5.2](#52-semantic-number-语义表) 的语义值。

**Size 步进(像素)**:

```
0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48,
56, 64, 72, 80, 96, 128, 144, 160, 200, 240
```

**Radius 步进**:

```
0, 2, 4, 6, 8, 12, 16, 20, 24, 9999 (full)
```

**Lineheight 步进**:

```
20, 22, 24, 26, 28, 32, 36, 44, 56, 72
```

### 5.2 Semantic Number 语义表

**Radius 圆角**:

| Token            | 值    | 用途           |
| ---------------- | ---- | ------------ |
| `radius/none`    | 0    | 方形           |
| `radius/xxs`     | 2    | tag 极小       |
| `radius/xs`      | 4    | 标签、小按钮       |
| `radius/sm`      | 6    | 输入框、checkbox |
| `radius/md`      | 8    | 按钮、卡片(默认)    |
| `radius/lg`      | 12   | 大卡片、modal    |
| `radius/xl`      | 16   | 弹层           |
| `radius/2xl`     | 24   | 大容器          |
| `radius/2xl-mid` | 20   | 中型容器         |
| `radius/full`    | 9999 | 胶囊 / 头像      |

**Spacing 间距**(padding / margin / gap):

| Token            | 值   | 典型场景          |
| ---------------- | --- | ------------- |
| `spacing/none`   | 0   | 无             |
| `spacing/xxxs`   | 2   | 图标与文字的微距      |
| `spacing/xxs`    | 4   | 紧凑列表          |
| `spacing/xs`     | 8   | 组件内元素         |
| `spacing/sm`     | 12  | 控件内边距         |
| `spacing/md`     | 16  | 卡片内边距(默认)     |
| `spacing/lg`     | 24  | 卡片间距 / 大内边距   |
| `spacing/lg-mid` | 20  | 介于 md / lg 之间 |
| `spacing/xl`     | 32  | 区域间隔          |
| `spacing/2xl`    | 40  | 大模块间隔         |
| `spacing/3xl`    | 48  | 页面分区          |
| `spacing/4xl`    | 64  | 章节间隔          |
| `spacing/5xl`    | 96  | 营销留白          |
| `spacing/6xl`    | 128 | Hero 留白       |

**Stroke 描边宽度**:

| Token            | 值 | 用途   |
| ---------------- | - | ---- |
| `stroke/none`    | 0 | 无线   |
| `stroke/thin`    | 1 | 默认描边 |
| `stroke/regular` | 2 | 强调描边 |
| `stroke/thick`   | 4 | 焦点外环 |

**Size 控件 / 图标 / 容器**:

| 类别  | Token                         | 值                      |
| --- | ----------------------------- | ---------------------- |
| 控件高 | `size/control-xs/sm/md/lg/xl` | 24 / 32 / 36 / 40 / 48 |
| 图标  | `size/icon-xs/sm/md/lg/xl`    | 12 / 16 / 20 / 24 / 32 |
| 容器  | `size/container-sm/md/lg/xl`  | 160 / 200 / 240 / 128  |

### 5.3 布局节奏推荐

- **页面顶部** `padding-top: 32` (`spacing/xl`)
- **页面侧边** `padding-inline: 24 ~ 48`
- **卡片内边距** `padding: 16` (`spacing/md`)
- **卡片间距** `gap: 16` 或 `24`
- **表单字段间** `gap: 16`
- **章节留白** `margin-block: 48` (`spacing/3xl`)

***

## 6. 描边 Stroke · 不透明度 Opacity · Z 轴

**Stroke 描边**(与 [§5.2](#52-semantic-number-语义表) 一致):

- thin 1px 默认;regular 2px 强调;thick 4px 焦点外环

**Opacity 不透明度**:

| Token              | 值   | 用途                |
| ------------------ | --- | ----------------- |
| `opacity/disabled` | 0.4 | 整体禁用              |
| `opacity/hover`    | 0.8 | 整体 hover(图片 / 插画) |
| `opacity/active`   | 0.6 | 整体 active         |

> 文字 / 边框的"半透明"应直接使用 [§3.8](#38-semantic--文字-text-) / [§3.9](#39-semantic--边框-border-) 中已经带 alpha 的 token,不要叠加 opacity。

**Z-index 层级**(避免互相打架):

| Token              | 值    | 用途                 |
| ------------------ | ---- | ------------------ |
| `z-index/base`     | 0    | 默认                 |
| `z-index/dropdown` | 100  | 下拉                 |
| `z-index/sticky`   | 200  | 吸顶                 |
| `z-index/fixed`    | 300  | 固定栏(导航 / 工具)       |
| `z-index/modal`    | 1000 | 模态                 |
| `z-index/popover`  | 1100 | 浮层(高于模态内的 popover) |
| `z-index/tooltip`  | 1200 | 提示                 |
| `z-index/toast`    | 1300 | 全局消息               |

***

## 7. Elevation & Depth · 阴影 / 模糊 / 装饰深度 / 渐变

### 7.1 Levels · 阴影 Effect Style 6 种

> Effect Style 是 Figma 已发布的"可被代码复用"的阴影规格。**AI 直接消费 style 名**。

| Style               | Y-offset | Blur    | Alpha       | 组合        |
| ------------------- | -------- | ------- | ----------- | --------- |
| `shadow/sm`         | 1 / 1    | 2 / 3   | 0.06 / 0.10 | 2 层       |
| `shadow/md`         | 4 / 2    | 6 / 4   | 0.08 / 0.10 | 2 层       |
| `shadow/lg`         | 10 / 4   | 15 / 6  | 0.10 / 0.06 | 2 层       |
| `shadow/xl`         | 20 / 10  | 25 / 10 | 0.12 / 0.08 | 2 层       |
| `shadow/inner`      | 1(内)     | 2       | 0.08        | 1 层 inner |
| `shadow/brand-glow` | 4        | 12      | 0.35        | 1 层(品牌色)  |

**使用建议**:

- 卡片: `shadow/sm`
- 浮起卡片 / Dropdown: `shadow/md`
- 模态头部: `shadow/lg`
- 抽屉: `shadow/xl`
- 主 CTA 按钮 hover: `shadow/brand-glow`
- 内嵌凹陷: `shadow/inner`

### 7.2 Blur · 模糊 Effect Style 4 种

| Style           | 半径 | 用途            |
| --------------- | -- | ------------- |
| `blur/sm`       | 4  | 内容模糊(loading) |
| `blur/md`       | 8  | 中等模糊          |
| `blur/lg`       | 16 | 大幅模糊          |
| `blur/backdrop` | 12 | 背景模糊(毛玻璃)     |

### 7.3 Decorative Depth · 装饰性深度

> 区别于功能阴影(告诉用户"这是个能点的东西"),装饰性深度用于制造"内容层级"和"画面情绪",不参与交互反馈。
> 教学场景下尤其克制 —— 用得太多会"喧宾夺主"。

**两种装饰性深度**:

| 场景         | 组合                                               | 用途                     |
| ---------- | ------------------------------------------------ | ---------------------- |
| **柔和内发光**  | `shadow/inner` + `alpha/alpha-white-4%` 内层       | 卡片上沿高光,模拟"光从上方打下来"的纸张感 |
| **品牌氛围晕**  | `gradient/brand-soft` + `blur/lg`                | Hero 区域 / 营销页底色氛围      |
| **顶部高光描线** | `gradient/highlight` + 1px `border/brand-subtle` | 浮起卡片顶边                 |
| **背景呼吸**   | `alpha/alpha-brand-4%` 圆形 + `blur/lg`            | 头像 / Logo 背景氛围         |

**原则**:

- 装饰性深度**不**叠在交互元素上(按钮、输入框、checkbox)。
- 单屏装饰性深度\*\*≤ 2 处\*\*。
- 不使用多于 2 层的 blur + gradient 组合(避免视觉糊化)。

### 7.4 Gradients · 渐变 Paint Style 4 种

> `gradient/brand` 与 `gradient/brand-soft` 基于 **品牌色阶 1~6 档**(更亮一档)渲染,服务于品牌渐变与营销氛围。
> 它们**不参与组件级 CTA / 链接 / 选中态**;按钮、链接、选中态的强调色统一从 `brand-color-*` 阶内取。

| Style                 | 方向     | 停靠点                                                | 用途                   |
| --------------------- | ------ | -------------------------------------------------- | -------------------- |
| `gradient/brand`      | linear | `brand/brand-color-6` `#1B8B65` → `brand/brand-color-4` `#5DB897` | 品牌渐变(基于品牌色 1~6 档更亮段)    |
| `gradient/brand-soft` | linear | `brand/brand-color-1` `#E4EFEC` → `#F2F7FF`        | 极浅绿渐变(Hero / 引导页底色) |
| `gradient/overlay`    | linear | `rgba(0,0,0,0.00) → rgba(0,0,0,0.60)`              | 模态渐入 / 遮罩渐变          |
| `gradient/highlight`  | linear | `rgba(255,255,255,0.20) → rgba(255,255,255,0.00)`  | 顶部高光                 |

**使用建议**:

- 营销位 / 数据大屏背景: `gradient/brand-soft`(默认)或 `gradient/brand`
- 模态渐入: `gradient/overlay`
- 浮起卡片顶部高光: `gradient/highlight`
- ❌ **不**用于按钮底色、链接色、选中态

***

## 8. Shapes · 圆角与摄影几何

### 8.1 Border Radius Scale · 圆角阶梯

> 圆角只走"以小为主"的一套阶梯。教学场景下"小圆角"传递"严谨 / 工具感",大圆角只留给营销位 / 大容器。

| Token            | 值     | 典型用途                         |
| ---------------- | ----- | ---------------------------- |
| `radius/none`    | 0     | 方形(表格分隔、线状进度条)               |
| `radius/xxs`     | 2     | tag 极小(标签 chip 角)            |
| `radius/xs`      | 4     | 小标签、小按钮、check / radio        |
| **`radius/sm`**  | **6** | **输入框、checkbox、紧凑按钮(默认小圆角)** |
| **`radius/md`**  | **8** | **按钮、卡片(全站默认)**              |
| `radius/lg`      | 12    | 大卡片、Modal、Drawer             |
| `radius/xl`      | 16    | 弹层、营销卡                       |
| `radius/2xl`     | 24    | 大容器、数据大屏卡                    |
| `radius/2xl-mid` | 20    | 中型容器                         |
| `radius/full`    | 9999  | 胶囊、头像、icon-button            |

**原则**:

- 卡片 / 按钮 / 输入框默认走 `radius/md` (8),表达"严谨而不死板"。
- 控件内部的图标 / 文字对齐按 4 像素栅格走,圆角与对齐共存。
- 头像永远 `radius/full`;不混用"圆 + 切角"。
- 任何 `border-radius: 10px` / `12px` / `14px` 等"非 token 圆角"**禁止**出现。

**与 Elevation 配合**:

- `shadow/sm` + `radius/md` → 卡片(默认)
- `shadow/md` + `radius/lg` → 浮起卡片 / Dropdown
- `shadow/lg` + `radius/xl` → Modal
- `shadow/xl` + `radius/xl` → Drawer

### 8.2 Photography Geometry · 摄影几何

> 教学产品里所有的"图片"—— 课程封面、教师头像、校园场景、营销 Banner —— 都遵循同一套几何规则,让"图"与"界面"在视觉上自然衔接。

| 资产类型              | 长宽比    | 圆角                   | 用途          |
| ----------------- | ------ | -------------------- | ----------- |
| **课程封面**          | 16 : 9 | `radius/md` (8)      | 卡片缩略图、列表项   |
| **课程封面 - 大**      | 4 : 3  | `radius/lg` (12)     | 课程详情页 Hero  |
| **教师头像**          | 1 : 1  | `radius/full` (9999) | 评论、协作列表、作者卡 |
| **Banner / Hero** | 21 : 9 | `radius/lg` (12)     | 营销位 Hero 区  |
| **插画 / 装饰**       | 自由     | `radius/md` (8)      | 空状态、引导页插画   |
| **图标容器**          | 1 : 1  | `radius/sm` (6)      | 列表项前的小图标底   |

**图片处理原则**:

- 默认开启 `object-fit: cover`,始终填满容器,不留白。
- 头像 `object-position: center`;封面允许 `object-position: center 30%`(避开上方标题)。
- 模糊占位:加载中用 `blur/md` + `bg/bg-skeleton`。
- 错误占位:用 `bg/bg-tertiary` + 占位 icon,不上破碎图。
- 暗色模式:不强制反色;允许"暗色图"在暗色背景下原生存在。
- 摄影图优先"自然光 / 学院场景 / 师生互动",不取"摆拍强、色彩过饱和"的素材。

**禁区**:

- ❌ 课程封面不强制 1:1(教学场景下 16:9 / 4:3 信息更丰富)。
- ❌ 头像不用方角(`radius/none`),避免与"卡片"混淆。
- ❌ 营销 Banner 不用 `radius/full`(圆头会显得轻浮)。

***

## 9. 组件 Components

> 所有组件的 token 引用必须落在 [§3](#3-颜色-colors) / [§4](#4-字体-typography) / [§5](#5-尺寸-size--间距-spacing--圆角-radius) / [§7](#7-elevation--depth--阴影--模糊--装饰深度--渐变) / [§8](#8-shapes--圆角与摄影几何) 之中。
> 组件级 CTA / 链接 / 选中态的强调色统一从 `brand-color-*` 阶内取,品牌色阶 1~6 档(更亮一档)仅在品牌渐变 / 营销氛围场景下使用。

### 9.1 按钮 Button

> 按钮是品牌色唯一被"大色块"使用的载体。所有 button 内的颜色都从 `state-brand-*` / `bg-*` / `text-*` 中取,**不要**给按钮发明新的颜色。

#### 8.1.1 `button-primary` —— 主品牌按钮

承担"最重要的下一步"。教学场景下,只允许 1 个 / 屏。

| 属性           | 值                                                   |
| ------------ | --------------------------------------------------- |
| 背景(默认)       | `state-brand-default` / `bg/bg-brand-default`       |
| 背景(hover)    | `state-brand-hover`                                 |
| 背景(active)   | `state-brand-active`                                |
| 背景(disabled) | `text/black-disabled` 透明度压低                         |
| 文字           | `text/reverse`                                      |
| 字号           | `Body/Medium - B`(14 / Semibold)                    |
| 圆角           | `radius/sm`(6,紧凑按钮) / `radius/md`(8,卡片内)            |
| 内边距          | `0 spacing/md` 或 `0 spacing/lg`                     |
| 高度           | `size/control-lg`(40,默认) / `size/control-xl`(48,大号) |
| 焦点           | 2px `state-brand-focus` 外环 + 4px offset             |
| 投影           | `shadow/brand-glow`(hover 时)                        |

**变体**:

- `button-primary-sm` — 高度 32,用于表格行内 / 卡片角
- `button-primary-lg` — 高度 48,用于落地页 / 关键引导
- `button-primary-block` — 宽度 100%,用于表单底部 / 移动端 CTA

#### 8.1.2 `button-secondary` —— 次按钮

| 属性        | 值                                                 |
| --------- | ------------------------------------------------- |
| 背景        | `bg/bg-secondary`(Light) / `bg/bg-tertiary`(Dark) |
| 背景(hover) | `bg/bg-tertiary`                                  |
| 文字        | `text/black-primary`                              |
| 字号        | `Body/Medium - B`                                 |
| 圆角        | `radius/sm` (6) / `radius/md` (8)                 |
| 描边        | 1px `border-black-default`(可选)                    |
| 高度        | 40 / 32 / 48                                      |

#### 8.1.3 `button-tertiary` —— 文字按钮

| 属性        | 值                 |
| --------- | ----------------- |
| 背景        | transparent       |
| 背景(hover) | `bg/bg-secondary` |
| 文字        | `text/link`       |
| 字号        | `Link/Medium`     |
| 圆角        | `radius/sm` (6)   |
| 高度        | 32 / 40           |

#### 8.1.4 `button-danger` —— 危险操作

| 属性        | 值                         |
| --------- | ------------------------- |
| 背景(默认)    | `state-error-default`     |
| 背景(hover) | `state-error-hover`       |
| 文字        | `text/reverse`            |
| 字号        | `Body/Medium - B`         |
| 圆角        | `radius/sm` / `radius/md` |

#### 8.1.5 `icon-button` —— 圆形图标按钮

| 属性   | 值                                       |
| ---- | --------------------------------------- |
| 背景   | transparent / `bg/bg-secondary`         |
| 尺寸   | 32 / 40 / 48(等于 `size/control-*`)       |
| 圆角   | `radius/full`(9999)                     |
| 图标尺寸 | `size/icon-md`(20) / `size/icon-lg`(24) |
| 图标色  | `currentColor`(跟随父级文字色)                 |

**vibecoding 提示**:button 上的图标 `fill="currentColor"`,颜色永远由父级文字 token 决定。

### 8.2 表单 Form

#### 8.2.1 `input-text` —— 单行输入

| 属性  | 值                                                      |
| --- | ------------------------------------------------------ |
| 背景  | `bg/bg-white`                                          |
| 描边  | 1px `border-black-default`;focus 时 `state-brand-focus` |
| 文字  | `text/black-primary`                                   |
| 占位  | `text/black-placeholder`                               |
| 字号  | `Body/Medium - R` (14)                                 |
| 圆角  | `radius/sm` (6)                                        |
| 高度  | 40(`size/control-lg`)                                  |
| 内边距 | `0 spacing/md` (16)                                    |
| 焦点  | `state-brand-focus` 描边 + 2px 外环                        |

**变体**:`input-text-sm`(高 32) · `input-text-lg`(高 48) · `input-text-disabled`

#### 8.2.2 `input-textarea` —— 多行输入

| 属性   | 值                               |
| ---- | ------------------------------- |
| 背景   | `bg/bg-white`                   |
| 描边   | 1px `border-black-default`      |
| 文字   | `text/black-primary`            |
| 字号   | `Body/Medium - R`               |
| 圆角   | `radius/sm` (6)                 |
| 内边距  | `spacing/sm spacing/md` (12 16) |
| 最小高度 | 96;建议 120                       |

#### 8.2.3 `input-select` / `input-checkbox` / `input-radio` / `input-switch`

- `input-select` — 与 `input-text` 同高 / 同圆角,右侧带 16px 下拉图标
- `input-checkbox` — 16×16,选中态 `state-brand-default` 填色 + `text/reverse` 对勾
- `input-radio` — 16×16 外圆,选中态 8×8 内圆 `state-brand-default`
- `input-switch` — 高 24,宽 44;轨道 `bg-tertiary`;thumb `bg-white` 带 `shadow/sm`

#### 8.2.4 `form-field` —— 字段容器(Label + Input + Help)

| 属性         | 值                                                  |
| ---------- | -------------------------------------------------- |
| Label      | `Title/Small`(14 / Semibold)+ `text/black-primary` |
| Input      | 见 [§8.2.1](#821-input-text--单行输入)                  |
| Help text  | `Body/Small` (12) + `text/black-secondary`         |
| Error text | `Body/Small` + `text/error` + 错误图标                 |
| 字段间距       | `spacing/md` (16)                                  |

### 8.3 反馈 Feedback

#### 8.3.1 `alert-banner` —— 顶部横幅提示

| 属性  | 值                                                                                            |
| --- | -------------------------------------------------------------------------------------------- |
| 背景  | `bg/bg-info-subtle` / `bg/bg-success-subtle` / `bg/bg-warning-subtle` / `bg/bg-error-subtle` |
| 描边  | 1px 同色阶 4 阶                                                                                  |
| 图标  | 16 / 20,左对齐,色 = 同状态色 `default`                                                               |
| 文字  | `Body/Medium - R` + `text/black-primary`                                                     |
| 内边距 | `spacing/sm spacing/md` (12 16)                                                              |
| 圆角  | `radius/sm` (6)                                                                              |

**变体**:`alert-info` · `alert-success` · `alert-warning` · `alert-error`

#### 8.3.2 `toast` —— 浮层消息

| 属性  | 值                                             |
| --- | --------------------------------------------- |
| 背景  | `bg/bg-white`(Light) / `bg/bg-elevated`(Dark) |
| 描边  | 1px `border-black-faint`                      |
| 投影  | `shadow/lg`                                   |
| 文字  | `Body/Medium - R` (14) + `text/black-primary` |
| 内边距 | `spacing/sm spacing/md` (12 16)               |
| 圆角  | `radius/md` (8)                               |
| 层级  | `z-index/toast` (1300)                        |
| 时长  | 3s,可手动关闭                                      |

#### 8.3.3 `modal` —— 模态弹窗

| 属性   | 值                                       |
| ---- | --------------------------------------- |
| 蒙层   | `mask/mask-black-modal`                 |
| 容器背景 | `bg/bg-white`                           |
| 投影   | `shadow/xl`                             |
| 圆角   | `radius/lg` (12)                        |
| 内边距  | `spacing/lg` (24)                       |
| 层级   | `z-index/modal` (1000)                  |
| 标题   | `Headline/Small`(24 / Semibold)         |
| 描述   | `Body/Medium - R`                       |
| 操作   | 右下 `button-primary` + `button-tertiary` |

#### 8.3.4 `tag` —— 标签 / 标记

| 属性  | 值                           |
| --- | --------------------------- |
| 背景  | `bg/bg-secondary`           |
| 文字  | `text/black-secondary`      |
| 字号  | `Mark/Small`(12 / Semibold) |
| 内边距 | `0 spacing/xs` (0 8)        |
| 圆角  | `radius/xs` (4)             |
| 高度  | 20 / 24                     |

**变体**:

- `tag-brand` — 背景 `bg-brand-subtle`,文字 `text/brand-primary`
- `tag-success` / `tag-warning` / `tag-error` / `tag-info` — 状态色阶 1 底 + 状态文字

### 8.4 数据展示 Data Display

#### 8.4.1 `card` —— 通用卡片

| 属性  | 值                                        |
| --- | ---------------------------------------- |
| 背景  | `bg/bg-white`                            |
| 描边  | 1px `border-black-hairline`              |
| 投影  | `shadow/sm`                              |
| 圆角  | `radius/md` (8) 默认 / `radius/lg` (12) 大卡 |
| 内边距 | `spacing/md`(16) / `spacing/lg`(24)      |
| 标题  | `Title/ExtraLarge - B` (20 / Semibold)   |
| 描述  | `Body/Medium - R` (14)                   |

**变体**:

- `card-elevated` — 投影升级为 `shadow/md`
- `card-outlined` — 描边升级为 `border-black-default`,无投影
- `card-soft` — 背景 `bg-primary`(浅底),用于信息密度低的章节

#### 8.4.2 `table` —— 数据表

| 属性      | 值                                                   |
| ------- | --------------------------------------------------- |
| 容器背景    | `bg/bg-white`                                       |
| 圆角      | `radius/md` (8)                                     |
| 描边      | 1px `border-black-hairline`                         |
| 表头背景    | `bg/bg-primary`                                     |
| 表头文字    | `Mark/Small`(12 / Semibold)+ `text/black-secondary` |
| 单元格文字   | `Body/Medium - R`(14)+ `text/black-primary`         |
| 行高      | 48                                                  |
| 单元格内边距  | `0 spacing/md` (0 16)                               |
| 行描边     | 1px `border-black-hairline`                         |
| hover 行 | `bg/bg-primary`                                     |

#### 8.4.3 `stat-card` —— 数据指标卡

| 属性  | 值                                                       |
| --- | ------------------------------------------------------- |
| 背景  | `bg/bg-white`                                           |
| 圆角  | `radius/md` (8)                                         |
| 投影  | `shadow/sm`                                             |
| 内边距 | `spacing/lg` (24)                                       |
| 数值  | `Display/Medium` (48 / Semibold) + `text/black-primary` |
| 标签  | `Body/Small` (12) + `text/black-secondary`              |
| 趋势  | `Body/Small` + `text/success`(上涨)/ `text/error`(下跌)     |

#### 8.4.4 `empty-state` —— 空状态

| 属性   | 值                                            |
| ---- | -------------------------------------------- |
| 容器   | `bg/bg-primary`                              |
| 内边距  | `spacing/3xl` (48) 垂直 / `spacing/lg` (24) 水平 |
| 圆角   | `radius/lg` (12)                             |
| 居中布局 | 插画 + 标题 + 描述 + 主按钮                           |
| 标题   | `Title/ExtraLarge - B` (20 / Semibold)       |
| 描述   | `Body/Medium - R` + `text/black-secondary`   |

### 8.5 导航 Navigation

#### 8.5.1 `nav-bar` —— 顶部主导航

| 属性         | 值                                           |
| ---------- | ------------------------------------------- |
| 背景         | `bg/bg-white`                               |
| 描边(底)      | 1px `border-black-hairline`                 |
| 高度         | 64                                          |
| 内边距        | `0 spacing/lg` (0 24)                       |
| 文字(链接)     | `Body/Medium - R`(14)+ `text/black-primary` |
| 文字(active) | `text/brand`                                |
| 圆角(链接)     | `radius/sm` (6)                             |
| 内边距(链接)    | `0 spacing/sm` (0 12)                       |
| 层级         | `z-index/fixed` (300)                       |

#### 8.5.2 `nav-sidebar` —— 侧边栏(教师工作台主导航)

| 属性        | 值                                                                                 |
| --------- | --------------------------------------------------------------------------------- |
| 背景        | `bg/bg-primary`                                                                   |
| 宽度        | 240(展开)/ 64(折叠)                                                                   |
| 项高        | 44                                                                                |
| 圆角(项)     | `radius/sm` (6)                                                                   |
| 内边距(项)    | `0 spacing/sm` (0 12)                                                             |
| 项文字       | `Body/Medium - R` (14) + `text/black-secondary`                                   |
| 项(hover)  | 背景 `bg/bg-secondary`                                                              |
| 项(active) | 背景 `bg-brand-subtle` + 文字 `text/brand-primary` + 左侧 2px `state-brand-default` 指示条 |

#### 8.5.3 `breadcrumb` —— 面包屑

| 属性  | 值                                        |
| --- | ---------------------------------------- |
| 容器  | `text/black-secondary`                   |
| 当前页 | `text/black-primary` + `Body/Medium - B` |
| 分隔符 | `/` 或 `›`,`text/black-placeholder`       |

#### 8.5.4 `tabs` —— 标签页

| 属性         | 值                                               |
| ---------- | ----------------------------------------------- |
| 容器         | 底部 1px `border-black-hairline`                  |
| Tab 高      | 44                                              |
| 文字         | `Body/Medium - R` (14) + `text/black-secondary` |
| 文字(active) | `text/brand` + `Title/Medium` (16 / Semibold)   |
| 指示条        | 底部 2px `state-brand-default`                    |
| 间距         | `spacing/lg` (24)                               |

### 8.6 布局容器 Layout

#### 8.6.1 `app-shell` —— 应用骨架

```
┌────────────────────────────────────┐
│  nav-bar (z-index/fixed)           │  ← 64
├──────┬─────────────────────────────┤
│      │                             │
│ nav  │  main content               │
│ side │  (spacing/lg 内边距)         │
│ bar  │                             │
│      │                             │
└──────┴─────────────────────────────┘
```

- `nav-bar` 顶部 64,固定
- `nav-sidebar` 左侧 240(可折叠至 64)
- 主区背景 `bg/bg-primary`,内边距 `spacing/lg` (24)
- 卡片间距 `spacing/md` (16)

#### 8.6.2 `section` —— 内容区段

| 属性       | 值                                          |
| -------- | ------------------------------------------ |
| 上下间距     | `spacing/3xl` (48)                         |
| 左右内边距    | 0 / `spacing/lg`                           |
| 标题区与内容间距 | `spacing/lg` (24)                          |
| 标题字号     | `Headline/Small` (24 / Semibold)           |
| 副标题      | `Body/Medium - R` + `text/black-secondary` |

#### 8.6.3 `divider` —— 分割线

| 属性 | 值                                                 |
| -- | ------------------------------------------------- |
| 颜色 | `border-black-hairline`(默认)/ `border-black-faint` |
| 方向 | horizontal / vertical                             |
| 间距 | 上下各 `spacing/md` (16)                             |

***

## 9. 图标 Icon

| 类别 | Token          | 值  | 用法        |
| -- | -------------- | -- | --------- |
| 超小 | `size/icon-xs` | 12 | 表内辅助      |
| 小  | `size/icon-sm` | 16 | 行内图标(默认)  |
| 中  | `size/icon-md` | 20 | 按钮内图标     |
| 大  | `size/icon-lg` | 24 | 列表项图标     |
| 特大 | `size/icon-xl` | 32 | 引导 / 插画图标 |

> 图标颜色跟随父级文字色(默认 `text/black-primary`);激活态用 `text/brand`。
> 推荐使用线性图标库(如 Phosphor / Lucide),线宽 1.5 \~ 2,圆角端点。

***

## 10. 栅格 · 断点 · 响应式

| 断点         | 宽度           | 容器最大宽 | 列数 | 间距 |
| ---------- | ------------ | ----- | -- | -- |
| `xs` (手机)  | < 640px      | 100%  | 4  | 16 |
| `sm` (大手机) | 640 \~ 768   | 100%  | 8  | 16 |
| `md` (平板)  | 768 \~ 1024  | 720   | 12 | 24 |
| `lg` (笔电)  | 1024 \~ 1280 | 960   | 12 | 24 |
| `xl` (桌面)  | 1280 \~ 1536 | 1200  | 12 | 32 |
| `2xl`(大屏)  | ≥ 1536       | 1440  | 12 | 32 |

**栅格公式**: `12 列 / gutter 24 / 边距 32`,**关键尺寸** 见 `size/container-*`。

***

## 11. Dark Mode 翻转规则

> `semantic-color` 集合提供两个 mode(默认 `Light` / `Dark`),AI 切换模式时**只需切换 mode**,无需重写 token。

### 11.1 翻转映射速查

| 类别                                       | Light → Dark                                                          |
| ---------------------------------------- | --------------------------------------------------------------------- |
| `bg-primary/secondary/tertiary/elevated` | `#F3F3F3/#E7E7E7/#DDDDDD/#C6C6C6` → `#181818/#242424/#2C2C2C/#393939` |
| `bg-white`                               | `#FFFFFF` → `#000000`                                                 |
| `bg-brand-default`                       | `#0A7C57` → `#009466`                                                 |
| `state-brand-default`                    | `#0A7C57` → `#009466`                                                 |
| `state-brand-subtle`                     | `#E4EFEC` → `#011A14`                                                 |
| `text/black-primary`                     | `rgba(0,0,0,0.90)` → `rgba(255,255,255,0.90)`                         |
| `text/white-primary`                     | `rgba(255,255,255,0.90)` → `rgba(0,0,0,0.90)`                         |
| `border/border-black-default`            | `rgba(0,0,0,0.20)` → `rgba(255,255,255,0.20)`                         |
| `border/border-white-default`            | `rgba(255,255,255,0.20)` → `rgba(0,0,0,0.20)`                         |
| `mask/mask-black-modal`                  | `rgba(0,0,0,0.60)` → `rgba(255,255,255,0.60)`                         |
| `text/reverse`                           | `#FFFFFF` → `rgba(0,0,0,0.90)`                                        |
| `text/pure-black`                        | `#000000` → `#FFFFFF`                                                 |

### 11.2 翻转"反直觉"点(易踩坑)

- `bg-elevated` 在 Light 是 `#C6C6C6`(比 tertiary 略深),在 Dark 是 `#393939`(比 tertiary 略浅)——始终保持"浮起 = 离用户更近 = 更亮(Light)/ 更深但更亮一层(Dark)"。
- `border-pure-gray` 在 Dark 是 `#777777`,而非 `#DDDDDD`。
- `mask-black-modal` 在 Dark 改为白遮罩,用于在深色底上让模态层更明显。

***

## 12. 可访问性 Accessibility

| 项目      | 要求                                      | 参考 token                                    |
| ------- | --------------------------------------- | ------------------------------------------- |
| 正文对比度   | ≥ 4.5:1                                 | `text/black-primary` on `bg/white` ≈ 18:1 ✅ |
| 大字号对比度  | ≥ 3:1                                   | `Headline/Large` 36px ✅                     |
| 焦点可见    | 2px `state-brand-focus` 外环 + 4px offset | `stroke/thick` + `state-brand-focus`        |
| 触控目标    | ≥ 44 × 44                               | `size/control-lg/xl`                        |
| 颜色非唯一信号 | 错误必带图标 + 文案                             | `state-error-default` + icon                |
| 动效偏好    | `@media (prefers-reduced-motion)` 关闭    | —                                           |

***

## 13. Vibecoding 契约 15 条

> 给 AI 编码 / 复刻 / 审稿的硬规则,违反任一条都视为不符合本设计系统。

1. **禁用硬编码 HEX** —— 一律用 `var(--state-brand-default)` 形式消费,允许 CSS 变量别名,但禁止 `#0A7C57` 字面量出现在组件代码。
2. **圆角用 token** —— `border-radius: var(--radius-md)`(8px),不写 `8px` 字面量。
3. **间距用 token** —— `padding: var(--spacing-md) var(--spacing-lg)`,不写 `16px 24px`。
4. **字号用 Text Style** —— 20 条 Style 名直接对应 CSS class,不要自己组合 size+weight+lineheight。
5. **品牌按钮底色 =** **`state-brand-default`** —— hover/active/focus 用对应 state,subtle 背景用 `bg-brand-subtle`。
6. **正文颜色 =** **`text/black-primary`** —— 不要用 `gray-8` / `gray-9` 替代,后者只用于边框/分割线。
7. **错误色必须配套图标** —— 单用 `state-error-default` 文字不通过可访问性审查。
8. **Dark Mode 自动跟随** —— 颜色 token 全部走 mode 切换;禁止在 `useEffect` 里判断 `prefers-color-scheme` 后写死值。
9. **阴影用 Effect Style 名** —— `box-shadow: var(--shadow-md)`,不要手写 `0 4px 6px ...`。
10. **z-index 必须落在层级表内** —— 不允许 `z-index: 999` 之类。
11. **不透明度优先用带 alpha 的 token** —— 用 `text/black-disabled`,而不是 `opacity: 0.4`。
12. **触控目标 ≥ 44** —— `min-height: var(--size-control-lg)`(40,接近)、`xl`(48) 优先。
13. **图标颜色 = currentColor** —— 不在 SVG 内写死 fill,让父级文字色决定。
14. **链接样式** —— 默认 `text/link`,hover 加下划线 + 颜色 `state-brand-hover`。
15. **任何"新"颜色 / "新"间距 / "新"字号** —— 必须先在 figma `eduCore` 文件新增 token,再回到代码使用,严禁组件层私自约定。

> **附加契约**:
>
> - **组件级 CTA / 链接 / 选中态** —— 统一从 `brand-color-*` 阶内取色(1 \~ 10),禁止发明"副品牌色 / 装饰强调色 / 第二强调色"。
> - **二级辅助色**(`brand-color-1` ~ `-6` 档)—— 只服务于 `gradient/brand` / 营销氛围 / 插画装饰,**不**参与组件级 CTA / 链接 / 选中态。
> - **info 蓝 ≠ 品牌色 ≠ 二级辅助色** —— `state-info-default` 仅用于信息提示语义,**不可**作为主 CTA 或品牌强调。

***

## 14. Do / Don't 设计避坑

| 场景        | Do ✅                                            | Don't ❌                        |
| --------- | ----------------------------------------------- | ------------------------------ |
| 主按钮       | `bg/state-brand-default` + `text/reverse`       | `#0A7C57` 写在 style 里           |
| 弱化按钮      | `bg/bg-secondary` + `text/black-primary`        | 用 brand 浅色当"次要按钮"              |
| 错误提示      | `bg/bg-error-subtle` + `text/error` + 图标        | 只把文字标红                         |
| 链接        | `text/link` 颜色,hover 加下划线                       | 链接和正文同色,只靠下划线区分                |
| 描边        | `border: 1px solid var(--border-black-default)` | 写死 `#E7E7E7`                   |
| 卡片间距      | `gap: var(--spacing-md)`                        | `gap: 16px`                    |
| 标题        | `Headline/Large`                                | 把 `Body/Large` 加粗当标题           |
| 圆角        | `radius/md`(8)                                  | `border-radius: 10px`(非 token) |
| Dark 下按钮  | 自动跟随 `state-brand-default` 切换                   | 用 JS 判断媒体查询后改写颜色               |
| 焦点        | `state-brand-focus` 外环                          | 默认浏览器蓝边                        |
| **二级辅助色** | `brand-color-1` ~ `-6` 档仅用于 `gradient/brand` / 营销氛围    | 把品牌色 1~6 档拿去当按钮底色 / 链接色   |
| **信息强调**  | `state-info-default` 仅用于"信息"语义                  | 用 info 蓝当"另一个 CTA 色"           |

***

## 15. 变更日志 Changelog

| 日期         | 版本        | 变更                                                                                                                                                                                                                                                         |
| ---------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-17 | alpha.1   | 重写:新增 Overview 散文气质 + Key Characteristics;新增 §8 组件章节(Button / Form / Feedback / Data Display / Navigation / Layout);声明色板五族(品牌色 / 自然色 / 功能色 / **二级辅助色**(品牌色阶 1~6 档复用) / 透明色);关键词扩充至 克制 · 极简 · 人文 · 素净 · 自然 · 成熟;Vibecoding 契约新增 2 条副条款;info 蓝边界说明指向二级辅助色 |
| 2026-06-17 | alpha.0.1 | 修正:二级辅助色从新增 `brand-soft-*` token 改为 **直接复用** 品牌色阶 1~6 档(`brand-color-1` ~ `-6`),不发明新 token,保持视觉一致性与体系纯净 |
| 2026-06-16 | alpha     | 同步 figma 最新值:`brand-color-1/2`、`state-brand-subtle`、`bg-brand-subtle` 更新为 `#E4EFEC` / `#CBE4DC`;新增 `bg/bg-white`、`bg/bg-brand-deep`、`text/brand` 等语义 token;`gradient/brand-soft` 起点更新为 `#D9EBFF`                                                           |
| 2026-06-15 | alpha.0   | 初版:从 figma eduCore 同步 5 套 Variable Collections(共 418 变量)+ 20 Text Styles + 9 Effect Styles + 4 Paint Styles                                                                                                                                                |
| 2026-06-14 | pre-alpha | 设计 token 表(草稿),与 figma 不一致                                                                                                                                                                                                                                 |

***

## 16. 附录:原始 Token 引用

> 下面是 figma 中 token 的"原文名 → 用途"对照,方便设计师 / 工程师直接复制粘贴。

### 16.1 颜色(Light 默认)

```
brand/brand-color-1   = #E4EFEC
brand/brand-color-2   = #CBE4DC
brand/brand-color-3   = #94CFB9
brand/brand-color-4   = #5DB897
brand/brand-color-5   = #34A07A
brand/brand-color-6   = #1B8B65
brand/brand-color-7   = #0A7C57   ← Brand Default
brand/brand-color-8   = #005F48
brand/brand-color-9   = #004A39
brand/brand-color-10  = #00372A
```

### 16.2 语义状态色(Light)

```
state/state-brand-default     = #0A7C57
state/state-brand-hover       = #005F48
state/state-brand-active      = #004A39
state/state-brand-focus       = #34A07A
state/state-brand-subtle      = #E4EFEC

state/state-success-default   = #00A854
state/state-success-hover     = #00874A
state/state-success-active    = #00643B
state/state-success-focus     = #3CC576
state/state-success-subtle    = #E3F9EB

state/state-warning-default   = #F57C00
state/state-warning-hover     = #E65100
state/state-warning-active    = #BF360C
state/state-warning-focus     = #FFA726
state/state-warning-subtle    = #FFF3E0

state/state-error-default     = #D9363E
state/state-error-hover       = #C12A33
state/state-error-active      = #A21D27
state/state-error-focus       = #F36868
state/state-error-subtle      = #FFEEEE

state/state-info-default      = #056AE4
state/state-info-hover        = #0052D9
state/state-info-active       = #003CAB
state/state-info-focus        = #618DFF
state/state-info-subtle       = #F2F5FF
```

### 16.3 间距

```
spacing/none=0 xxxs=2 xxs=4 xs=8 sm=12 md=16
spacing/lg=24 lg-mid=20 xl=32 2xl=40 3xl=48 4xl=64 5xl=96 6xl=128
```

### 16.4 圆角

```
radius/none=0 xxs=2 xs=4 sm=6 md=8 lg=12 xl=16 2xl=24 2xl-mid=20 full=9999
```

### 16.5 字号 / 行高

```
font-size/displayLarge=64   displayMedium=48  headlineLarge=36
font-size/headlineMedium=28 headlineSmall=24  titleExtraLarge=20
font-size/titleLarge=18     titleMedium=16    titleSmall=14
font-size/bodyLarge=16      bodyMedium=14     bodySmall=12
font-size/markMedium=14     markSmall=12
font-size/linkLarge=16      linkMedium=14     linkSmall=12

lineheight/lh20=20 lh22=22 lh24=24 lh26=26 lh28=28 lh32=32 lh36=36 lh44=44 lh56=56 lh72=72
```

### 16.6 Effect / Paint Styles

```
Effect: shadow/sm, shadow/md, shadow/lg, shadow/xl,
        shadow/inner, shadow/brand-glow,
        blur/sm, blur/md, blur/lg, blur/backdrop

Paint:  gradient/brand       (#1B8B65 → #5DB897)         ← 基于品牌色阶 1~6 档(更亮一档)渲染,服务品牌渐变 / 营销氛围
        gradient/brand-soft  (#E4EFEC → #F2F7FF)
        gradient/overlay     (transparent → rgba(0,0,0,0.6))
        gradient/highlight   (rgba(255,255,255,0.2) → transparent)
```

***

