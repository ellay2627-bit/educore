# DESIGN.md ↔ Figma 一致性审查报告

> **审查对象**:`DESIGN.md`(项目根目录,版本 alpha.1)
> **Figma 文件**:`eduCore`(`Y3gqxxe8kTezrsRX7mh1pz`,node `27-10`)
> **审查时间**:2026-06-20
> **审查范围**:Variables / Text Styles / Effect Styles / Paint Styles
> **结论**:**未通过**。存在多处与 Figma 实际值不一致的问题,需要按本文 §A 修复。

---

## 0. 概览(数量一致性)

| 项              | DESIGN.md 声明 | Figma 实际 | 差异 |
| -------------- | ---------- | -------- | -- |
| Variable 集合数   | 5          | 5        | ✅  |
| Variable 总数    | 418        | **421**  | ❌ +3 |
| ├ base-number  | 53         | 53       | ✅  |
| ├ semantic-number | 80     | 80       | ✅  |
| ├ base-color-light | 103   | 103      | ✅  |
| ├ base-color-dark | 100    | 100      | ✅  |
| └ semantic-color | 82     | **85**   | ❌ +3 |
| Text Styles    | **20**     | **17**   | ❌ -3 |
| Effect Styles  | **9**      | **10**   | ❌ +1 |
| Paint Styles   | 4          | 4        | ✅  |

---

## A. 严重问题(必须修复)

### A1. `gradient/brand` 颜色与文档严重不符 🔴

- **DESIGN.md §7.4 声称**:`gradient/brand` = `#1B8B65` → `#5DB897`(品牌绿色阶)
- **Figma 实际值**:`#056AE4` → `#4D8DF2`(**info 蓝色阶**)
- **影响**:
  - 文档里反复强调"品牌渐变基于品牌色阶 1~6 档",但实际渐变用的是 info 蓝。
  - 第 13 条 Vibecoding 契约、§3.4 二级辅助色使用边界、§14 Do/Don't 全部基于"渐变 = 品牌绿"建立假设,会和实际渲染不一致。
- **修复建议**:
  1. 若品牌渐变应该是绿色 → 改回 `brand-color-6` → `brand-color-4`。
  2. 若就是要用 info 蓝作为"品牌渐变" → 文档重命名,改名 `gradient/info`,把"二级辅助色"章节内的 `gradient/brand` 全部替换。
  3. 二者择一,严禁"文档说绿、实际是蓝"的状态存在。

### A2. `shadow/brand-glow` 颜色与"品牌"语义不符 🔴

- **Figma 实际值**:颜色为 `#056AE4`(info 蓝),35% 透明度
- **DESIGN.md §7.1 描述**:只写 Y-offset / Blur / Alpha,未写颜色,但 style 名是"brand-glow"
- **影响**:
  - "brand-glow"被用作"主 CTA hover 时的投影"(`§8.1.1` button-primary),如果实际是 info 蓝,在品牌色 CTA 上会出现"蓝晕"而不是"绿晕",与整个"单一品牌色"的设计语言冲突。
- **修复建议**:把 Effect Style 重命名为 `shadow/info-glow`,或把颜色改回 `brand/brand-color-7` 35%。

### A3. `gradient/brand-soft` 起点颜色与文档不符 🟠

- **DESIGN.md §7.4 声称**:`gradient/brand-soft` = `#E4EFEC` → `#F2F7FF`(极浅绿 → 极浅蓝)
- **Figma 实际值**:`#D9EBFF` → `#F2F7FF`(**起点已是浅蓝,没有绿**)
- **影响**:Hero / 引导页底色渲染出来是蓝色调,而不是品牌绿色调。
- **修复建议**:把第一个色标改回 `#E4EFEC`(品牌色阶第 1 档)。

### A4. Text Style 数量 17 ≠ 20 🟠

DESIGN.md §4.3 列出 20 条 Text Style,但 Figma 实际只有 17 条。**3 条不存在的 Style**:

| 不存在(在 DESIGN.md 列出)               | Figma 实际   | 差异            |
| -------------------------------- | ---------- | ------------- |
| `Body/Large - B`(16/24/Semibold) | 不存在       | ❌ 应删除        |
| `Title/ExtraLarge - B`(20/28/Semibold) | Figma 中只有 `Title/ExtraLarge` 一个 Style(Semibold) | ⚠️ Figma 已合并为单条 |
| `Title/ExtraLarge - R`(20/28/Regular) | 不存在       | ❌ 应删除        |

> 注:`Body/Large - R` 在 Figma 中实际是 `Body/Large`(无 -R 后缀),只是命名差异,语义对得上。

**修复建议**:
- 选项 A:把 Figma 的 `Title/ExtraLarge` 拆成 B/R 两条 → 凑齐 20 条
- 选项 B:从 DESIGN.md §4.3 删除不存在的 3 条,改口"20 条"为"17 条"

### A5. Effect Style 数量 9 ≠ 10 🟠

- **DESIGN.md frontmatter** 写 `effectStyles: 9`
- **DESIGN.md §7.1 + §7.2 实际列出**:6 shadow + 4 blur = **10 条**
- **Figma 实际**:**10 条**(`shadow/sm`、`shadow/md`、`shadow/lg`、`shadow/xl`、`shadow/inner`、`shadow/brand-glow`、`blur/sm`、`blur/md`、`blur/lg`、`blur/backdrop`)
- **修复建议**:frontmatter `effectStyles` 改为 `10`。

### A6. semantic-color 变量数 85 ≠ 82 🟠

- **DESIGN.md**:`semantic-color` = 82
- **Figma**:`semantic-color` = **85** (Light + Dark 双 mode)
- **Figma 中多出、未在 DESIGN.md 文档化的变量**(15 个,以下按 §3 章节归类):

| 未文档化变量                       | 实际值(Light)                                    | 缺失章节   |
| --------------------------- | --------------------------------------------- | ------ |
| `shadow/shadow-default-1`   | `border/border-black-hairline` 别名(色)           | §3.10  |
| `shadow/shadow-default-2`   | `border/border-black-faint` 别名(色)             | §3.10  |
| `shadow/shadow-default-3`   | `border/border-black-default` 别名(色)          | §3.10  |
| `shadow/shadow-brand-1`     | `border/border-brand-hairline` 别名(色)         | §3.10  |
| `shadow/shadow-brand-2`     | `border/border-brand-default` 别名(色)          | §3.10  |
| `shadow/shadow-white`       | `border/border-white-default` 别名(色)          | §3.10  |
| `special/highlight`         | `border/border-brand-faint` 别名                | §3.10  |
| `special/selection`         | `border/border-brand-default` 别名              | §3.10  |
| `special/codeblock`         | `gray/gray-color-1` 别名                        | §3.10  |
| `special/error-shield`      | 接近 `gray/gray-color-2`                         | §3.10  |
| `mask/mask-black-popover`   | `alpha-black-30` 别名                          | §3.10  |
| `mask/mask-black-background` | `border/border-black-default` 别名             | §3.10  |
| `border/border-pure-white`  | `base/white` 别名                              | §3.9   |
| `border/border-pure-black`  | `base/black` 别名                              | §3.9   |
| `border/border-pure-brand`  | `brand/brand-color-7` 别名                     | §3.9   |
| `border/border-pure-gray`   | `gray/gray-color-7` 别名(`#777777`)            | §3.9   |

> 注:其中 `border-pure-gray` 在 §3.12 暗色规则和 §11.2 中被提及,但 **未进 §3.9 border 表**;其他 14 个完全未出现。

**修复建议**:
- 补 §3.9 表格:`border-pure-*` 4 条;
- 补 §3.10 表格:`shadow/*`(6 条)、`special/*`(4 条)、`mask/*`(3 条,已有 1 条需补 2 条);
- frontmatter 数字更新为 `semantic-color: 85`。

### A7. 变量命名小问题(DESIGN.md §3.5 漏报) 🟡

**Figma 实际命名中混入的"裸色名"**(与其他 token 命名规范不一致):

| Figma 实际变量名                | 应有规范命名                  | 备注         |
| ------------------------- | ----------------------- | ---------- |
| `success/color-10`        | `success/success-color-10` | 重名,语义不一致 |
| `info/color-10`           | `info/info-color-10`     | 同上         |
| `error/color-10`(仅 dark) | `error/error-color-10`   | 同上,仅 dark 集合存在 |
| `alpha-black/black-90`    | `alpha-black/alpha-black-90` | 破坏命名规律  |
| `alpha-white/white-90`    | `alpha-white/alpha-white-90` | 同上        |

- DESIGN.md §3.5 仅提到"success / info 第 10 阶存在重名 color-10 命名小问题",**漏报 error**(只在 dark 集合)
- DESIGN.md §3.5 完全**没提** `alpha-black/black-90` / `alpha-white/white-90` 这两个"裸名"

**修复建议**:
1. 把 `success/color-10` → `success/success-color-10`
2. 把 `info/color-10` → `info/info-color-10`
3. 把 dark 集合的 `error/color-10` → `error/error-color-10`
4. 把 `alpha-black/black-90` → `alpha-black/alpha-black-90`
5. 把 `alpha-white/white-90` → `alpha-white/alpha-white-90`

### A8. `success-color-9` 与 `success-color-10` 实际值重复 🔴

- Figma 中 `success/success-color-9` = `success/success-color-10` = `#00643B`
- 正确的第 10 阶 `#00472A` 反而挂在命名错误的 `success/color-10` 上
- 这是 **Figma 端的 bug**,不是文档问题
- 任何按"9 阶 = #00643B / 10 阶 = #00472A"消费代码的工程师,如果走 `success/success-color-10` 会拿到错误色

**修复建议**:
- 把 `success/success-color-10` 的值改回 `#00472A`
- 同时执行 A7 的命名修复,把 `success/color-10` 删掉

### A9. `alpha-brand-100` 存在,但文档 §3.5 标记为"不存在" 🟡

- DESIGN.md §3.5 alpha 表 `alpha-brand` 行的 100% 列显示为 "—"(不存在)
- Figma 中实际存在 `alpha-brand/alpha-brand-100`,值为 `brand-7` 的 100% 不透明(`#0A7C57`)

**修复建议**:
- §3.5 表中 `alpha-brand` 行的 100% 列改为 ✅
- 或在文档中说明"alpha-brand-100 专为 1:1 品牌色场景准备,默认不推荐使用"

---

## B. 命名 / 结构小问题(建议修复)

### B1. `shadow/*` 变量命名风格不一致 🟡

DESIGN.md §7.1 用 `shadow/sm`、`shadow/md` 这种 Effect Style 名,但 Figma semantic-color 集合里又有 `shadow/shadow-default-1`、`shadow/shadow-brand-1` 这类 **Variable** —— 两者命名空间重叠(都是 `shadow/`),语义边界不清:

- `shadow/sm` 等是 **Effect Style**(图层阴影)
- `shadow/shadow-default-1` 等是 **Variable**(色值)

**建议**:Variable 端重命名为 `shadow-color/default-1`、`shadow-color/brand-1` 等,避免和 Effect Style 撞名空间。

### B2. 文档中 `font-size/displayLarge` 等无连字符,正文却用 `font-size/display-large` 🟡

- DESIGN.md §16.5 / §4.2:`font-size/displayLarge`(驼峰,无连字符)
- DESIGN.md §5.1 Step 步进表中也用 `displayLarge`
- 但 §3.12 决策树中又出现 `font-size/display-large`(推测笔误)
- 建议统一为 `displayLarge` 驼峰,或者统一为 kebab-case

### B3. 文档 `lineheight` 命名两套并存 🟡

- base-number 集合用 `lineheight/20` / `lineheight/22` / ...(纯数字)
- semantic-number 集合用 `lineheight/lh20` / `lineheight/lh22` / ...(`lh` 前缀)
- 两套重复定义,**文档 §5.1 同时列出**,但是只推荐消费哪一套未明确

**建议**:
- 明确"消费侧用 semantic-number 中的 `lineheight/lh*`"或
- 合并为一套,把另一套删除

### B4. `spacing/xxxs` 命名不符合间距阶梯 🟡

- 间距阶梯:xxxs → xxs → xs → sm → md → lg → xl
- 但其他阶梯(字号、圆角、stroke)最多就到 `xs`
- `spacing/xxxs = 2` 的存在意义和"图标与文字的微距"用例是否真的需要新增一个层级? 见仁见智

**建议**:保留并写明 `xxxs` 仅用于"图标+文字"的微观场景,其他位置禁止使用。

---

## C. 颜色取值核查(已校验,全部一致 ✅)

| 关键色                          | 文档值       | Figma 实际      | 一致 |
| ---------------------------- | --------- | ------------- | -- |
| `brand/brand-color-1`        | `#E4EFEC` | rgb(229,240,236) | ✅ |
| `brand/brand-color-7`        | `#0A7C57` | rgb(10,124,87)   | ✅ |
| `brand/brand-color-10`       | `#00372A` | rgb(0,55,42)     | ✅ |
| `state/state-brand-default`  | `#0A7C57` | 别名 → brand-7  | ✅ |
| `state/state-info-default`   | `#056AE4` | 别名 → info-7   | ✅ |
| `state/state-error-default`  | `#D9363E` | 别名 → error-7  | ✅ |
| `gray/gray-color-1`          | `#F3F3F3` | rgb(243,243,243) | ✅ |
| `gray/gray-color-10`         | `#181818` | rgb(24,24,24)   | ✅ |
| `bg/bg-primary`              | `#F3F3F3` | 别名 → gray-1   | ✅ |
| `text/black-primary`         | `rgba(0,0,0,0.90)` | 别名 → `VariableID:16:2` | ✅(此为独立的 raw 变量) |

> **5 族色板所有具体取值已全部对照 Figma 一致**,唯一不一致在 gradient 渲染上(见 A1/A3)。

---

## D. 修复优先级建议

| 优先级  | 任务                                            | 涉及方            |
| ---- | --------------------------------------------- | -------------- |
| P0   | A1: 修复 `gradient/brand` 颜色(绿/蓝二选一)            | 设计师 + Figma  |
| P0   | A2: 修复 `shadow/brand-glow` 颜色(绿/蓝二选一)          | 设计师 + Figma  |
| P0   | A8: 修复 `success/success-color-10` 值重复         | 设计师 + Figma  |
| P1   | A3: 修复 `gradient/brand-soft` 起点色                | 设计师 + Figma  |
| P1   | A4: 决定 Text Style 是 17 条还是 20 条              | 设计师           |
| P1   | A5: frontmatter `effectStyles: 9` → `10`        | 文档维护者         |
| P1   | A6: 补全 §3.9 / §3.10 表格 + 改 `semantic-color: 85` | 文档维护者         |
| P2   | A7: 修 5 个"裸名" token                              | 设计师 + Figma  |
| P2   | A9: §3.5 alpha-brand 100% 列改 ✅                 | 文档维护者         |
| P3   | B1 ~ B4 命名风格统一                                | 设计师 + 文档维护者    |

---

## E. 已确认无问题(无需修复)

- 5 个 Variable 集合全部存在
- 4 个 Paint Style 全部存在(`gradient/brand` / `gradient/brand-soft` / `gradient/overlay` / `gradient/highlight`)
- 10 个 Effect Style 全部存在(只是 frontmatter 数字错)
- 17 个 Text Style 全部存在
- 5 族色板(品牌 / 自然 / 功能 / 二级辅助色 / 透明色)的具体 HEX 取值全部对得上
- 状态色 5 族 × 5 态(default / hover / active / focus / subtle)语义层全部存在
- 圆角 10 阶、字号 17 阶、间距 13 阶、行高 10 阶、Size 28 阶、Stroke 4 阶、Z-index 8 阶、Opacity 3 阶 — 数量全部匹配
- §1 ~ §15 所有组件规格 / 决策树 / Do-Dont 表格 / Vibecoding 契约 / 可访问性要求的"语义描述"部分与 Figma 中实际能消费到的 token 一一对应

---

## F. 后续动作

本审查仅做"静态一致性"判断。下一步建议:

1. **设计师侧**:在 Figma 中执行 P0/P1 修复(主要在变量、Effect Style 端)
2. **文档侧**:把本报告 §A/B 中的"P1 文档问题"同步进 `DESIGN.md`,frontmatter 数字刷到最新
3. **自动化**:跑一次 `figma_export_tokens` → `dtcg` 格式 + 跑 `tokens.config.json` 校验,确保本报告列出的差异已归零
