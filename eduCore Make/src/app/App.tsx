import { useState, useRef, useEffect, useMemo, Fragment } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard, Bot, BookOpen, Database, Bell, Search, Settings,
  ChevronRight, Plus, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, FileText, ClipboardList, BarChart2,
  Mic, Paperclip, SendHorizonal, Sparkles, ChevronLeft, ChevronDown,
  BookMarked, PenLine, Users, Clock, CheckCircle2, AlertCircle, Info,
  GraduationCap, Calendar, Layers, Lightbulb, X, Menu, Star, Flame,
  TrendingUp, Brain, MessageSquare, FolderOpen, Upload, Maximize2, Share2, Download,
  Moon, Sun, Loader2, Check, RefreshCw, Play, List, Edit3, Eye, Video,
  MoreHorizontal, Trash2, Minimize2, MoreVertical, PanelRight, PanelLeft, History, Globe,
  CheckCircle, XCircle, Music, User, Lock, Pencil, Pointer, MessageSquarePlus, Copy
} from "lucide-react";
import { HomeworkMainView, HomeworkDetailPage, HomeworkStatsPanel } from "./modules/homework";

// ─── Design Tokens (inline via CSS variables) ─────────────────────────────
const tk = {
  // Backgrounds
  bgPrimary: "var(--bg-primary)",
  bgSecondary: "var(--bg-secondary)",
  bgTertiary: "var(--bg-tertiary)",
  bgWhite: "var(--bg-white)",
  bgBrandSubtle: "var(--bg-brand-subtle)",
  bgBrandDefault: "var(--bg-brand-default)",
  bgSuccessSubtle: "var(--bg-success-subtle)",
  bgWarningSubtle: "var(--bg-warning-subtle)",
  bgErrorSubtle: "var(--bg-error-subtle)",
  bgInfoSubtle: "var(--bg-info-subtle)",
  // Text
  textPrimary: "var(--text-black-primary)",
  textSecondary: "var(--text-black-secondary)",
  textPlaceholder: "var(--text-black-placeholder)",
  textDisabled: "var(--text-black-disabled)",
  textBrand: "var(--text-brand)",
  textLink: "var(--text-link)",
  textReverse: "var(--text-reverse)",
  textSuccess: "var(--text-success)",
  textWarning: "var(--text-warning)",
  textError: "var(--text-error)",
  textInfo: "var(--text-info)",
  // Border
  borderHairline: "var(--border-black-hairline)",
  borderFaint: "var(--border-black-faint)",
  borderDefault: "var(--border-black-default)",
  borderBrand: "var(--border-brand-default)",
  borderPureBrand: "var(--border-pure-brand)",
  borderPureGray: "var(--border-pure-gray)",
  // State
  brandDefault: "var(--state-brand-default)",
  brandHover: "var(--state-brand-hover)",
  brandSubtle: "var(--state-brand-subtle)",
  brandFocus: "var(--state-brand-focus)",
  errorDefault: "var(--state-error-default)",
  successDefault: "var(--state-success-default)",
  // Shadow
  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
  shadowXl: "var(--shadow-xl)",
  shadowBrandGlow: "var(--shadow-brand-glow)",
  // Radius
  radiusSm: "var(--radius-sm)",
  radiusMd: "var(--radius-md)",
  radiusLg: "var(--radius-lg)",
  radiusXs: "4px",
  radiusXl: "var(--radius-xl)",
  radiusFull: "var(--radius-full)",
  // Spacing
  spacingXs: "var(--spacing-xs)",
  spacingSm: "var(--spacing-sm)",
  spacingMd: "var(--spacing-md)",
  spacingLg: "var(--spacing-lg)",
  spacingXl: "var(--spacing-xl)",
  spacing2xl: "var(--spacing-2xl)",
  spacing3xl: "var(--spacing-3xl)",
};

const ANIMATION_STYLES = `
@keyframes app-toast-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

type Module = "dashboard" | "myta" | "sparkclass" | "resource" | "thoth" | "eduhub";
type SparkTab = "classes" | "homework" | "review";

// ─── Global Toast ──────────────────────────────────────────────────────────
// 简易全局 toast：模块级事件 + ToastHost 订阅，避免引入 sonner 主题依赖。
type ToastKind = "success" | "info" | "error";
type ToastEvent = { id: number; kind: ToastKind; text: string; action?: () => void; actionLabel?: string };
function dispatchToast(text: string, kind: ToastKind = "success", action?: () => void, actionLabel?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ToastEvent>("app:toast", {
    detail: { id: Date.now() + Math.random(), kind, text, action, actionLabel },
  }));
}
function toast(text: string) { dispatchToast(text, "success"); }
function toastInfo(text: string) { dispatchToast(text, "info"); }
function toastError(text: string) { dispatchToast(text, "error"); }

function ToastHost() {
  const [items, setItems] = useState<ToastEvent[]>([]);
  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<ToastEvent>).detail;
      setItems(prev => [...prev, detail]);
      window.setTimeout(() => {
        setItems(prev => prev.filter(x => x.id !== detail.id));
      }, 2400);
    };
    window.addEventListener("app:toast", onToast);
    return () => window.removeEventListener("app:toast", onToast);
  }, []);
  if (items.length === 0) return null;
  const palette: Record<ToastKind, { bg: string; fg: string; border: string }> = {
    success: { bg: "#f0fdf4", fg: "#166534", border: "#bbf7d0" },
    info:    { bg: tk.bgBrandSubtle, fg: tk.textBrand, border: tk.brandDefault },
    error:   { bg: "#fef2f2", fg: "#991b1b", border: "#fecaca" },
  };
  return (
    <div style={{
      position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
    }}>
      {items.map(it => {
        const c = palette[it.kind];
        return (
          <div key={it.id} style={{
            background: c.bg, color: c.fg,
            border: `1px solid ${c.border}`,
            borderRadius: tk.radiusMd,
            padding: "8px 16px", fontSize: 13, fontWeight: 500,
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", gap: 8,
            animation: "app-toast-in 0.2s ease-out",
          }}>
            <span style={{
              display: "inline-block", width: 16, height: 16, borderRadius: "50%",
              background: c.fg, color: "#fff", fontSize: 11, lineHeight: "16px",
              textAlign: "center", fontWeight: 700, flexShrink: 0,
            }}>{it.kind === "success" ? "✓" : it.kind === "error" ? "×" : "i"}</span>
            {it.text}
            {it.action && (
              <button 
                onClick={() => { it.action(); setItems(prev => prev.filter(x => x.id !== it.id)); }}
                style={{
                  marginLeft: "auto", padding: "4px 12px",
                  background: c.fg, color: "#fff",
                  border: "none", borderRadius: tk.radiusSm,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  pointerEvents: "auto",
                }}
              >
                {it.actionLabel}
              </button>
            )}
          </div>
        );
      })}
      <style>{ANIMATION_STYLES}</style>
    </div>
  );
}

// ─── Status Tag ────────────────────────────────────────────────────────────
// 统一色彩约定：待授课=绿 / 正在授课=黄橙 / 已授课=灰
function StatusTag({ status }: { status: "active" | "pending" | "done" }) {
  const config = {
    active:  { label: "授课中",  bg: tk.bgWarningSubtle, color: tk.textWarning },
    pending: { label: "待授课",  bg: tk.bgSuccessSubtle, color: tk.textSuccess },
    done:    { label: "已授课",  bg: tk.bgSecondary,     color: tk.textPlaceholder },
  }[status];
  return (
    <span style={{
      background: config.bg, color: config.color,
      fontSize: 12, fontWeight: 600, lineHeight: "20px",
      padding: "0 8px", borderRadius: tk.radiusXs, display: "inline-block",
    }}>{config.label}</span>
  );
}

// ─── Class Card ────────────────────────────────────────────────────────────
function ClassCard({ title, desc, subject, grade, time, status, isToday, onClick, onTeach, onReport, onView }: {
  title: string; desc: string; subject: string; grade: string; time: string;
  status: "active" | "pending" | "done"; isToday?: boolean;
  onClick?: () => void; onTeach?: () => void; onReport?: () => void; onView?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: tk.bgWhite, borderRadius: tk.radiusMd,
        border: `1px solid ${hovered ? tk.borderBrand : tk.borderHairline}`,
        boxShadow: hovered ? tk.shadowMd : "none",
        padding: tk.spacingMd, cursor: onClick ? "pointer" : "default",
        transition: "all 0.18s ease",
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isToday && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 20, height: 20, borderRadius: 4,
                background: tk.errorDefault, color: "#fff",
                fontSize: 11, fontWeight: 700, lineHeight: "20px", flexShrink: 0,
                boxShadow: "0 0 0 2px rgba(244, 63, 94, 0.15)",
              }}>今</span>
            )}
            <span style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, lineHeight: "22px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
          </div>
          <span style={{ fontSize: 12, color: tk.textSecondary, lineHeight: "20px" }}>{desc}</span>
        </div>
        <StatusTag status={status} />
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
          <BookMarked size={11} /> {subject}
        </span>
        <span style={{ fontSize: 12, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
          <Users size={11} /> {grade}
        </span>
        <span style={{ fontSize: 12, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
          <Clock size={11} /> {time}
        </span>
      </div>
      <div style={{ height: 1, background: tk.borderHairline }} />
      <div style={{ display: "flex", gap: tk.spacingXs }}>
        {status === "pending" && (
          <button
            onClick={e => { e.stopPropagation(); onTeach?.(); }}
            style={{
              background: tk.brandDefault, color: tk.textReverse,
              border: "none", borderRadius: tk.radiusSm,
              fontSize: 12, fontWeight: 600, padding: "5px 14px", cursor: "pointer",
              transition: "background 0.15s", display: "flex", alignItems: "center", gap: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = tk.brandHover)}
            onMouseLeave={e => (e.currentTarget.style.background = tk.brandDefault)}
          >去授课</button>
        )}
        {status === "active" && (
          <button
            onClick={e => { e.stopPropagation(); onTeach?.(); }}
            style={{
              background: tk.brandDefault, color: tk.textReverse,
              border: "none", borderRadius: tk.radiusSm,
              fontSize: 12, fontWeight: 600, padding: "5px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >去授课</button>
        )}
        {status === "done" && (
          <>
            <button
              onClick={e => { e.stopPropagation(); onReport?.(); }}
              style={{
                background: tk.brandDefault, color: tk.textReverse,
                border: "none", borderRadius: tk.radiusSm,
                fontSize: 12, fontWeight: 600, padding: "5px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
              }}
            ><BarChart2 size={11} /> 课后分析</button>
            <button
              onClick={e => { e.stopPropagation(); onTeach?.(); }}
              style={{
                background: "transparent", color: tk.textSecondary,
                border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
                fontSize: 12, fontWeight: 400, padding: "4px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >去授课</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Resource Card ─────────────────────────────────────────────────────────
function ResourceCard({ title, desc, type, author, date }: {
  title: string; desc: string; type: string; author: string; date: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: tk.bgWhite, borderRadius: tk.radiusMd,
        border: `1px solid ${hovered ? tk.borderBrand : tk.borderHairline}`,
        boxShadow: hovered ? tk.shadowMd : tk.shadowSm,
        padding: tk.spacingMd, cursor: "pointer",
        transition: "all 0.18s ease",
        display: "flex", flexDirection: "column", gap: tk.spacingXs,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, lineHeight: "22px" }}>{title}</span>
        <span style={{
          background: tk.bgBrandSubtle, color: tk.textBrand,
          fontSize: 12, fontWeight: 600, padding: "0 8px",
          borderRadius: tk.radiusXs, lineHeight: "20px",
        }}>{type}</span>
      </div>
      <span style={{ fontSize: 12, color: tk.textSecondary, lineHeight: "20px" }}>{desc}</span>
      <div style={{ display: "flex", gap: tk.spacingMd, marginTop: 4 }}>
        <span style={{ fontSize: 12, color: tk.textPlaceholder }}>{author}</span>
        <span style={{ fontSize: 12, color: tk.textPlaceholder }}>{date}</span>
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, trend, icon: Icon }: {
  label: string; value: string; trend?: string; icon: React.ElementType;
}) {
  return (
    <div style={{
      background: tk.bgWhite, borderRadius: tk.radiusMd,
      border: `1px solid ${tk.borderHairline}`,
      boxShadow: tk.shadowSm, padding: tk.spacingMd,
      display: "flex", flexDirection: "column", gap: tk.spacingXs,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: tk.textSecondary }}>{label}</span>
        <Icon size={16} style={{ color: tk.brandDefault }} />
      </div>
      <span style={{ fontSize: 28, fontWeight: 600, color: tk.textPrimary, lineHeight: "36px" }}>{value}</span>
      {trend && <span style={{ fontSize: 12, color: tk.textSuccess }}>{trend}</span>}
    </div>
  );
}

// ─── Todo Tag types ─────────────────────────────────────────────────────────
type TodoTag = "作业批改" | "文书审核" | "资源审核" | "学校任务";

const TODO_TAG_STYLE: Record<TodoTag, { bg: string; color: string; icon: React.ReactNode }> = {
  "作业批改": { bg: "#FFF3E0", color: "#F57C00", icon: <PenLine size={11} /> },
  "文书审核": { bg: "#F2F5FF", color: "#056AE4", icon: <FileText size={11} /> },
  "资源审核": { bg: "#E4EFEC", color: "#0A7C57", icon: <FolderOpen size={11} /> },
  "学校任务": { bg: "#FFEEEE", color: "#D9363E", icon: <ClipboardList size={11} /> },
};

// ─── Todo Item ─────────────────────────────────────────────────────────────
function TodoItem({ label, sub, tag }: { label: string; sub: string; tag: TodoTag }) {
  const ts = TODO_TAG_STYLE[tag];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 0", borderBottom: `1px solid ${tk.borderHairline}`,
      cursor: "pointer", transition: "opacity 0.12s",
    }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.75")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      {/* Tag pill */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        background: ts.bg, color: ts.color,
        fontSize: 11, fontWeight: 600,
        padding: "2px 7px", borderRadius: tk.radiusFull,
        flexShrink: 0, whiteSpace: "nowrap",
      }}>
        {ts.icon}{tag}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: tk.textPrimary,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 1 }}>{sub}</div>
      </div>
      <ChevronRight size={13} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: tk.textSecondary, letterSpacing: "0.03em", textTransform: "uppercase" }}>{title}</span>
      {action}
    </div>
  );
}

function SectionLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: tk.textPlaceholder,
      fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 3,
      transition: "color 0.12s", padding: 0,
    }}
      onMouseEnter={e => (e.currentTarget.style.color = tk.textBrand)}
      onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
    >{label} <ArrowRight size={11} /></button>
  );
}

// ─── Dashboard Module ───────────────────────────────────────────────────────
function Dashboard({ onNavigate, onClassClick }: {
  onNavigate: (m: Module) => void;
  onClassClick: (id: number) => void;
}) {
  // 本周授课：与 SparkClass 「我的课堂 → 本周课表」同源（按本周日期过滤）
  const today = new Date("2026-06-22");
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const thisWeekClasses = CLASS_DATA
    .filter(c => {
      if (!c.date) return false;
      const d = new Date(c.date);
      return d >= monday && d <= sunday;
    })
    .slice(0, 3);
  const [chatInput, setChatInput] = useState("");
    const [activeAgent, setActiveAgent] = useState(1);
  const agents = [
    { label: "全案智备", icon: <Layers size={13} /> },
    { label: "微知课", icon: <BookOpen size={13} /> },
    { label: "主题专员", icon: <Star size={13} /> },
    { label: "文书护航", icon: <FileText size={13} /> },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <div style={{ padding: `${tk.spacingLg} ${tk.spacingXl}`, display: "flex", flexDirection: "column", gap: tk.spacingXl, maxWidth: 1200, margin: "0 auto", width: "100%" }}>

      {/* ── AI Cold Start ─────────────────────────────────────────── */}
      <div style={{ paddingTop: tk.spacingXl, paddingBottom: tk.spacingMd, display: "flex", flexDirection: "column", alignItems: "center", gap: tk.spacingMd }}>
        {/* Greeting */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Sparkles size={28} style={{ color: tk.brandDefault }} />
          <h1 style={{ fontSize: 32, fontWeight: 600, color: tk.textPrimary, lineHeight: 1.2, margin: 0 }}>
            {greeting}，王老师
          </h1>
        </div>
        <p style={{ fontSize: 14, color: tk.textPlaceholder, margin: 0 }}>今天有 2 节课待准备，3 份作业待批改</p>

        {/* Chat box */}
        <div style={{
          width: "100%", maxWidth: 680,
          background: tk.bgWhite,
          borderRadius: tk.radiusLg,
          border: `1px solid ${tk.borderHairline}`,
          boxShadow: tk.shadowMd,
          overflow: "hidden",
          marginTop: 8,
        }}>
          {/* Textarea */}
          <div style={{ padding: "18px 20px 10px" }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder={`向「${agents[activeAgent].label}」描述你的教学需求…`}
              rows={3}
              style={{
                width: "100%", border: "none", outline: "none", resize: "none",
                background: "transparent", fontSize: 14, color: tk.textPrimary,
                lineHeight: "22px", fontFamily: "var(--font-family)",
              }}
            />
          </div>
          {/* Bottom toolbar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px 14px",
            borderTop: `1px solid ${tk.borderHairline}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: tk.textPlaceholder, display: "flex", alignItems: "center", padding: 4, borderRadius: tk.radiusSm }}
                onMouseEnter={e => (e.currentTarget.style.color = tk.textSecondary)}
                onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
              ><Paperclip size={15} /></button>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: tk.textPlaceholder, display: "flex", alignItems: "center", padding: 4, borderRadius: tk.radiusSm }}
                onMouseEnter={e => (e.currentTarget.style.color = tk.textSecondary)}
                onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
              ><Brain size={15} /></button>
              {/* Agent picker */}
              <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 4 }}>
                {agents.map((a, i) => (
                  <button key={a.label} onClick={() => setActiveAgent(i)} style={{
                    background: i === activeAgent ? tk.bgBrandSubtle : "transparent",
                    color: i === activeAgent ? tk.textBrand : tk.textPlaceholder,
                    border: i === activeAgent ? `1px solid ${tk.borderBrand}` : "1px solid transparent",
                    borderRadius: tk.radiusFull, fontSize: 12, fontWeight: i === activeAgent ? 600 : 400,
                    padding: "3px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    transition: "all 0.12s",
                  }}>{a.icon}{a.label}</button>
                ))}
              </div>
            </div>
            <button
              onClick={() => onNavigate("myta")}
              style={{
                width: 32, height: 32, borderRadius: tk.radiusFull,
                background: chatInput.trim() ? tk.brandDefault : tk.bgSecondary,
                color: chatInput.trim() ? tk.textReverse : tk.textPlaceholder,
                border: "none", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
                transition: "all 0.15s",
              }}
            ><SendHorizonal size={14} /></button>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: tk.spacingMd }}>
          <StatCard label="本周授课" value={String(thisWeekClasses.length)} trend={`含今日 ${thisWeekClasses.filter(c => c.status === "active").length} 节`} icon={BookOpen} />
          <StatCard label="待批改作业" value="34" icon={ClipboardList} />
          <StatCard label="课程资源" value="128" icon={FolderOpen} />
          <StatCard label="学生总数" value="320" icon={GraduationCap} />
        <StatCard label="待批改作业" value="34" icon={ClipboardList} />
        <StatCard label="课程资源" value="128" icon={FolderOpen} />
        <StatCard label="学生总数" value="320" icon={GraduationCap} />
      </div>

      {/* ── Main 2-col grid ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: tk.spacingLg, alignItems: "start" }}>

        {/* My Classes */}
        <div>
          <SectionHeader title="本周授课" action={
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{
                background: "none", border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm, fontSize: 12, color: tk.textSecondary,
                padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
              }}><Plus size={12} /> 新建</button>
              <SectionLink label="查看全部" onClick={() => onNavigate("sparkclass")} />
            </div>
          } />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {thisWeekClasses.length === 0 ? (
              <div style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusMd, padding: "20px 16px",
                textAlign: "center", color: tk.textPlaceholder, fontSize: 13,
              }}>本周暂无授课安排</div>
            ) : (
              thisWeekClasses.map(c => (
                <ClassCard
                  key={c.id}
                  title={c.title}
                  desc={c.desc}
                  subject={c.subject}
                  grade={c.grade}
                  time={c.date ? `${c.date} ${c.time || ""}` : (c.time || "")}
                  status={c.status as "active" | "pending" | "done" | "absent"}
                  onClick={() => onClassClick(c.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Resources + Todo */}
        <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingLg }}>

          {/* My Resources */}
          <div>
            <SectionHeader title="我的资源" action={
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{
                  background: "none", border: `1px solid ${tk.borderHairline}`,
                  borderRadius: tk.radiusSm, fontSize: 12, color: tk.textSecondary,
                  padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                }}><Upload size={12} /> 上传</button>
                <button style={{
                  background: "none", border: `1px solid ${tk.borderHairline}`,
                  borderRadius: tk.radiusSm, fontSize: 12, color: tk.textSecondary,
                  padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                }}><Plus size={12} /> 新建</button>
                <SectionLink label="查看全部" onClick={() => onNavigate("resource")} />
              </div>
            } />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ResourceCard title="Unit 4 Nature 精读教案" desc="含词汇表、阅读策略图示" type="教案" author="我" date="2026-06-18" />
              <ResourceCard title="高一英语期末模拟卷" desc="含答案与解析" type="作业" author="我" date="2026-06-15" />
            </div>
          </div>

          {/* Todo Center */}
          <div>
            <SectionHeader title="待办中心" action={<SectionLink label="查看全部" />} />
            <div style={{
              background: tk.bgWhite, borderRadius: tk.radiusMd,
              border: `1px solid ${tk.borderHairline}`,
              padding: `0 ${tk.spacingMd}`,
            }}>
              <TodoItem label="高一(3)班 期末模拟作业待批改 · 34份" sub="昨天截止" tag="作业批改" />
              <TodoItem label="张老师分享《Unit 4 词汇表》等待审核" sub="资源库 · 今天 09:21" tag="资源审核" />
              <TodoItem label="期末家长会邀请函待定稿" sub="需在 6月22日前完成" tag="文书审核" />
              <TodoItem label="期末监考安排 · 请确认排班" sub="教务处 · 今天 10:00" tag="学校任务" />
            </div>
          </div>

        </div>
      </div>

      {/* ── Module Dispatch ───────────────────────────────────────── */}
      <div>
        <SectionHeader title="快速入口" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: tk.spacingMd }}>
          {[
            { name: "MyTA 领教", desc: "AI 教师助手，智能备课", icon: Bot, module: "myta" as Module },
            { name: "SparkClass 熠课", desc: "互动课堂，课前课后管理", icon: BookOpen, module: "sparkclass" as Module },
            { name: "Thoth 智汇", desc: "教研协作平台", icon: Lightbulb, module: "dashboard" as Module },
            { name: "EduHub 云枢", desc: "学校资源中枢", icon: Database, module: "resource" as Module },
          ].map(({ name, desc, icon: Icon, module }) => (
            <button
              key={name}
              onClick={() => onNavigate(module)}
              style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusMd, padding: tk.spacingMd,
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = tk.borderBrand;
                e.currentTarget.style.boxShadow = tk.shadowSm;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = tk.borderHairline;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: tk.radiusSm,
                background: tk.bgBrandSubtle, display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 10,
              }}>
                <Icon size={16} style={{ color: tk.brandDefault }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>{name}</div>
              <div style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 2 }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── MyTA Module ────────────────────────────────────────────────────────────
// ─── MyTA Agents config ─────────────────────────────────────────────────────
// ─── MyTA data ──────────────────────────────────────────────────────────────
const MYTA_AGENTS = [
  {
    key: "weike", abbr: "微", name: "微知课",
    tagline: "快速制作图文、音讯、影片等多模态教学素材与微课。",
    placeholder: "描述你想制作的微课主题或教学素材，并上传参考图片…",
    prompts: ["制作 Unit 4 词汇微课", "生成听力练习音频脚本", "设计图文知识卡片"],
    needsImage: true,
  },
  {
    key: "quanan", abbr: "全", name: "全案智备",
    tagline: "基于校本知识库，一键生成专属风格教案与多语言教学材料。",
    placeholder: "告诉我要备哪一课，或上传参考资料…",
    prompts: ["帮我备一节精读课", "生成课后练习题", "写一份家长通知", "制作知识点思维导图"],
    needsImage: false,
  },
  {
    key: "chuti", abbr: "出", name: "出题专员",
    tagline: "对齐 EDB 标准生成变体题与分层练习；支援学生「逆向出题」深化理解。",
    placeholder: "描述出题需求，我来生成练习题与分层作业…",
    prompts: ["生成 Unit 4 词汇练习题", "制作期末模拟卷", "设计分层阅读练习"],
    needsImage: false,
  },
  {
    key: "wenshu", abbr: "文", name: "文书护航",
    tagline: "内建中英高频模板，自动生成家校信、通告与成绩评语。",
    placeholder: "告诉我需要哪类文书，一键生成规范模板…",
    prompts: ["写期末家长信", "生成学生成绩评语", "制作家长会通知"],
    needsImage: false,
  },
];

// ─── 每个 agent 专属的意图确认模板（占位：每个 agent 一份差异化表单）─────
type IntentField = {
  key: string;
  label: string;
  type: "select" | "radio" | "text" | "textarea" | "multi";
  options?: string[];
  required?: boolean;
  placeholder?: string;
};
const INTENT_TEMPLATES: Record<string, { title: string; fields: IntentField[]; defaultChoices?: string[] }> = {
  quanan: {
    title: "选择备课计划内容",
    fields: [
      { key: "type", label: "备课类型", type: "radio", required: true,
        options: ["新知课", "复习课", "试卷讲评课", "项目式学习"] },
      { key: "contents", label: "包含内容", type: "multi", required: true,
        options: ["结构化教案", "随堂练习", "课后作业", "教学配图", "教学视频", "分组讨论方案"] },
      { key: "duration", label: "课时长度", type: "select", required: true,
        options: ["35 分钟", "40 分钟", "45 分钟", "60 分钟"] },
    ],
    defaultChoices: ["结构化教案", "随堂练习", "课后作业"],
  },
  weike: {
    title: "微课制作条件",
    fields: [
      { key: "format", label: "微课形式", type: "radio", required: true,
        options: ["图文知识卡", "真人讲解", "MG 动画", "手写讲解"] },
      { key: "duration", label: "时长", type: "select", required: true,
        options: ["≤1 分钟", "1-3 分钟", "3-5 分钟", "5 分钟以上"] },
      { key: "voiceover", label: "旁白", type: "radio",
        options: ["普通话", "粤语", "英语", "无声字幕"] },
      { key: "notes", label: "其他要求", type: "textarea",
        placeholder: "可填：目标学生、口音偏好、配音员等" },
    ],
  },
  chuti: {
    title: "出题条件",
    fields: [
      { key: "subject", label: "学科", type: "select", required: true,
        options: ["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "道法"] },
      { key: "grades", label: "适用年级", type: "select", required: true,
        options: ["初一", "初二", "初三", "高一", "高二", "高三"] },
      { key: "types", label: "题型", type: "multi", required: true,
        options: ["选择题", "填空题", "判断题", "简答题", "应用题", "作文", "阅读理解"] },
      { key: "difficulty", label: "难度分布", type: "select", required: true,
        options: ["基础 70% + 进阶 30%", "进阶 50% + 拔高 50%", "拔高 100%", "A/B/C 三层分层"] },
      { key: "count", label: "题量", type: "text",
        placeholder: "如：8 题选择 + 2 题应用" },
    ],
  },
  wenshu: {
    title: "文书条件",
    fields: [
      { key: "scenario", label: "文书类型", type: "select", required: true,
        options: ["家长信", "成绩评语", "家长会通知", "请假条", "表扬信", "家校沟通话术"] },
      { key: "audience", label: "面向对象", type: "radio", required: true,
        options: ["家长", "学生", "同事", "上级"] },
      { key: "tone", label: "语气", type: "select", required: true,
        options: ["正式得体", "亲切温和", "简洁明了", "诚恳鼓励"] },
      { key: "lang", label: "语言", type: "radio",
        options: ["中文", "英文", "中英双语"] },
      { key: "keypoints", label: "必须包含的要点", type: "textarea",
        placeholder: "例如：表扬孩子进步，并提醒下次家长会时间…" },
    ],
  },
};

// ─── 全案智备 — 课堂包数据模型 ───────────────────────────────────────────────
type ThinkingStep = {
  key: string;
  label: string;
  detail: string;
};
const THINKING_STEPS: ThinkingStep[] = [
  { key: "analyze", label: "分析需求", detail: "解析学情、课标与教学目标，匹配教学风格" },
  { key: "frame",   label: "搭建框架", detail: "编排课堂流程、阶段节奏与互动节点" },
  { key: "gen",     label: "生成资源", detail: "生成课件、随堂练习、课后作业、教学配图" },
  { key: "verify",  label: "质量验证", detail: "校对知识点、错题去重、生成最终版本 v1.0" },
];

const WEIKE_THINKING_STEPS: ThinkingStep[] = [
  { key: "analyze", label: "分析主题", detail: "理解微课主题，提取核心知识点" },
  { key: "script",  label: "编写脚本", detail: "撰写旁白文案，设计画面分镜" },
  { key: "render",  label: "渲染制作", detail: "生成视频画面、添加动画效果" },
  { key: "export",  label: "导出成品", detail: "导出视频文件，生成预览链接" },
];

const CHUTI_THINKING_STEPS: ThinkingStep[] = [
  { key: "analyze", label: "分析考点", detail: "解析知识点，匹配课标要求" },
  { key: "design",  label: "设计题型", detail: "根据难度分布设计各类题型" },
  { key: "gen",     label: "生成题目", detail: "生成题目内容、选项、答案与解析" },
  { key: "verify",  label: "校验排版", detail: "检查题目重复，排版试卷格式" },
];

const WENSHU_THINKING_STEPS: ThinkingStep[] = [
  { key: "analyze", label: "分析场景", detail: "理解文书场景与面向对象" },
  { key: "template",label: "匹配模板", detail: "选择合适的文书模板" },
  { key: "gen",     label: "生成内容", detail: "填充内容，调整语气风格" },
  { key: "verify",  label: "校对优化", detail: "检查格式规范，优化表达" },
];

const AGENT_CONFIG: Record<string, {
  thinkingSteps: ThinkingStep[];
  loadingMessage: string;
  loadingSubtitle: string;
  outputType: "classpackage" | "video" | "testpaper" | "document";
}> = {
  quanan: {
    thinkingSteps: THINKING_STEPS,
    loadingMessage: "正在思考中...",
    loadingSubtitle: "补充信息后将开始生成文档",
    outputType: "classpackage",
  },
  weike: {
    thinkingSteps: WEIKE_THINKING_STEPS,
    loadingMessage: "正在制作微课...",
    loadingSubtitle: "正在渲染视频与动画效果",
    outputType: "video",
  },
  chuti: {
    thinkingSteps: CHUTI_THINKING_STEPS,
    loadingMessage: "正在生成试卷...",
    loadingSubtitle: "正在设计题目与答案解析",
    outputType: "testpaper",
  },
  wenshu: {
    thinkingSteps: WENSHU_THINKING_STEPS,
    loadingMessage: "正在撰写文书...",
    loadingSubtitle: "正在匹配模板并优化表达",
    outputType: "document",
  },
};

type SubResource = {
  id: string;
  name: string;
  type: "doc" | "image" | "video" | "quiz" | "ppt" | "audio";
  size: string;
  thumb?: string; // emoji or short symbol for preview
  preview: string; // preview content
};
type Phase = {
  key: string;
  label: string;
  desc: string;
  duration: string;
  resources: SubResource[];
};
type ClassPackage = {
  id: string;
  title: string;
  subject: string; // 学科
  grade: string;   // 年级
  version: string; // v1.0
  total: number;   // 总资源数
  summary: string;
  phases: Phase[];
};

// ─── 通用资源模型（8 资源列表 / 第三栏通用）────────────────────────────────
type ResourceKind = "package" | "doc" | "quiz" | "image" | "video" | "audio" | "ppt";
type Resource = {
  id: string;
  kind: ResourceKind;
  title: string;
  meta: string;
  agent: "quanan" | "weike" | "chuti" | "wenshu";
  version: string;
  updatedAt: string;
  body?: string;       // 普通资源：整页内容
  pkg?: ClassPackage;  // 课堂包：阶段组
};

type ChatMessage = { role: "user" | "ai"; text: string; resource?: Resource };

const SAMPLE_RESOURCES: Resource[] = [
  {
    id: "r-quanan-001", kind: "package",
    title: "勾股定理的认识课堂包",
    meta: "1/8（共1份课堂包，3份作业，2份文书，1份微知课）",
    agent: "quanan", version: "v2.0", updatedAt: "12-08 14:30",
    pkg: {
      id: "pkg-001", title: "勾股定理的认识课堂包", subject: "数学", grade: "八年级",
      version: "v2.0", total: 8,
      summary: "1/8（共1份课堂包，3份作业，2份文书，1份微知课）",
      phases: [
        {
          key: "p1", label: "破冰：课前导入", desc: "激发兴趣，建立勾股定理的生活直觉", duration: "约10分",
          resources: [
            { id: "r1", name: "趣味问答", type: "doc", size: "3KB", thumb: "📄",
              preview: "【教师话术】同学们，请观察这张图：梯子斜靠在墙上，离墙 6 米，梯子长 10 米，问梯子顶端离地多高？——引出本节课题。" },
            { id: "r2", name: "知识点回顾", type: "doc", size: "2KB", thumb: "📚",
              preview: "复习上节：直角三角形概念、斜边与直角边的区分。\n衔接：生活中常见的勾股现象 4 张图示。" },
            { id: "r3", name: "课前微课", type: "video", size: "1分20秒", thumb: "🎬",
              preview: "1分20秒钩子视频：航拍镜头扫过故宫角楼，字幕抛出「为什么角楼屋顶的斜面长度，刚好符合 a²+b²=c²？」" },
            { id: "r4", name: "情境图片", type: "image", size: "3张", thumb: "🖼️",
              preview: "图片 1：梯子靠墙（最经典情境）\n图片 2：足球场（已知长宽求对角线）\n图片 3：故宫角楼（文化历史维度）" },
          ],
        },
        {
          key: "p2", label: "授课：核心讲授", desc: "讲解定理、证明思路与书写规范", duration: "约20分",
          resources: [
            { id: "r5", name: "授课课件", type: "ppt", size: "8.5MB", thumb: "📊",
              preview: "幻灯片 1：直角三角形标注（斜边 Hypotenuse ÷ 直角边 Legs）\n幻灯片 2：a² + b² = c² 公式推导（赵爽弦图）\n幻灯片 3：典型例题（3-4-5 验证）\n幻灯片 4：书写格式与单位规范" },
            { id: "r6", name: "课程视频", type: "video", size: "12MB", thumb: "🎬",
              preview: "1分40秒动画：从四个全等直角三角形拼成正方形，动态演示 a² + b² = c² 几何证明，配旁白。" },
            { id: "r7", name: "板书示意", type: "image", size: "1张", thumb: "🖼️",
              preview: "教师手写板书实拍：\"求 a² + b² = c² 中 c = ?\" 完整推导过程，重点步骤用红笔圈出。" },
            { id: "r8", name: "知识点讲解", type: "doc", size: "4KB", thumb: "📚",
              preview: "1) 直角三角形斜边与直角边的概念\n2) 勾股定理的数学表达 a² + b² = c²\n3) 常见 3-4-5 ÷ 5-12-13 ÷ 8-15-17 勾股数组\n4) 公式推导思路：面积法（赵爽弦图）" },
            { id: "r9", name: "拓展链接", type: "doc", size: "5KB", thumb: "🔗",
              preview: "外部链接：\n• 勾股定理的 10 种证明方法合辑\n• 赵爽弦图互动演示（GeoGebra）\n• 拓展阅读：从毕达哥拉斯到欧几里得" },
          ],
        },
        {
          key: "p3", label: "互动：课堂互动与讨论", desc: "随堂练习 + 分组讨论", duration: "约10分",
          resources: [
            { id: "r10", name: "随堂测验", type: "quiz", size: "5题", thumb: "📝",
              preview: "【判断题】3、4、5 三个数能组成直角三角形吗？\n（限时 1 分钟，全班抢答，答对加分）\n【应用题】梯子长 10 米，离墙 6 米，求梯子顶端离地高度。" },
            { id: "r11", name: "讨论题", type: "doc", size: "1题", thumb: "💬",
              preview: "小组讨论：生活中还有哪些场景会用到勾股定理？\n请举出 3 个例子并画图说明。" },
            { id: "r12", name: "课堂活动音频", type: "audio", size: "2分30秒", thumb: "🎵",
              preview: "2分30秒课堂活动引导音频：配合「数学侦探」情境，引导学生分组排查「哪一面墙需要修补」。" },
          ],
        },
        {
          key: "p4", label: "总结：课后作业", desc: "分层作业 + 学习反思", duration: "约5分",
          resources: [
            { id: "r13", name: "分层作业", type: "doc", size: "6KB", thumb: "📋",
              preview: "A 组（基础）：1-5 题计算题\nB 组（进阶）：6-8 题应用题（含梯子问题）\nC 组（拓展）：9-10 题逆向出题（自己出一道勾股定理应用题）" },
            { id: "r14", name: "课后练习册", type: "quiz", size: "10题", thumb: "📝",
              preview: "题目 1：在 △ABC 中，∠C=90°，a=3，b=4，求 c。\n题目 2：等腰直角三角形斜边长 6√2，求直角边长。\n…（共 10 题，含答案解析）" },
            { id: "r15", name: "学习反思表", type: "doc", size: "1页", thumb: "📝",
              preview: "1. 今天我学到的核心概念是：______\n2. 我还不太理解的地方是：______\n3. 我想在下节课前完成：______" },
          ],
        },
      ],
    },
  },
  {
    id: "r-quanan-002", kind: "package",
    title: "一元二次方程的解法课堂包",
    meta: "2/8（共1份课堂包，1份教案，1份课件，2份练习）",
    agent: "quanan", version: "v1.2", updatedAt: "12-05 10:12",
    pkg: {
      id: "pkg-002", title: "一元二次方程的解法课堂包", subject: "数学", grade: "九年级",
      version: "v1.2", total: 5, summary: "2/8（共1份课堂包，1份教案，1份课件，2份练习）",
      phases: [
        {
          key: "p1", label: "导入：复习提问", desc: "回顾一元一次方程", duration: "约5分",
          resources: [
            { id: "a1", name: "复习提纲", type: "doc", size: "2KB", thumb: "📄",
              preview: "1) 什么是一元一次方程？\n2) 解方程 ax+b=0 的步骤。\n3) 引入：方程 ax²+bx+c=0 如何求解？" },
          ],
        },
        {
          key: "p2", label: "新授：四种解法", desc: "直接开平 / 配方法 / 公式法 / 因式分解", duration: "约25分",
          resources: [
            { id: "a2", name: "教学课件", type: "ppt", size: "5.2MB", thumb: "📊",
              preview: "幻灯片 1-4：直接开平方法（含 ±√ 解释）\n幻灯片 5-8：配方法（步骤化推导）\n幻灯片 9-12：公式法（求根公式由来）\n幻灯片 13-15：因式分解法" },
            { id: "a3", name: "例题集", type: "doc", size: "4KB", thumb: "📝",
              preview: "例 1：x² - 9 = 0 （直接开平方法）\n例 2：x² + 6x + 9 = 0 （配方法）\n例 3：2x² - 5x - 3 = 0 （公式法）\n例 4：x² - 5x + 6 = 0 （因式分解）" },
          ],
        },
      ],
    },
  },
  {
    id: "r-chuti-001", kind: "quiz",
    title: "Unit 4 词汇分层练习",
    meta: "3/8（共1份练习，6道选择 + 4道填空 + 2道应用）",
    agent: "chuti", version: "v1.1", updatedAt: "12-07 09:18",
    body: "Unit 4 Vocabulary Practice\n\n【A 组·基础】\n1. 选择：The word \"ancient\" means ____.\n   A. 古老的  B. 现代的  C. 未来的  D. 现在的\n2. 填空：She has a strong ____ to learn painting. (desire)\n3. 选择：The museum is full of ____ artifacts.\n   A. value  B. valuable  C. valued  D. valuing\n\n【B 组·进阶】\n4. 填空：The book is divided into five ____. (section)\n5. 用所给词的适当形式填空：\n   He showed great ____ (brave) in the face of danger.\n6. 翻译：这些古代文物具有重要的历史价值。\n\n【C 组·拔高】\n7. 同义句转换：The building is so tall. → What a ____ building it is!\n8. 选词填空：value / valuable / valued / evaluate\n   a) The painting is highly ____ by collectors.\n   b) This is a ____ information for your research.",
  },
  {
    id: "r-wenshu-001", kind: "doc",
    title: "期末家长信",
    meta: "4/8（共1份家校文书，含中英双版）",
    agent: "wenshu", version: "v1.0", updatedAt: "12-04 16:00",
    body: "尊敬的家长：\n\n您好！转眼一学期即将结束，为让您更全面了解孩子在校的综合表现，我们整理了以下信息：\n\n一、本学期表现总览\n• 出勤情况：全勤\n• 课堂参与：积极举手，互动表现优秀\n• 作业完成：按时提交，正确率 92%\n• 期末成绩：语文 88 / 数学 95 / 英语 91（年级 Top 10%）\n\n二、下学期建议\n1. 加强课外阅读，每周 2-3 本适合年龄段的英文原版\n2. 培养整理错题的习惯，建立错题本\n3. 关注书写规范，特别是数学符号与单位\n\n三、家长会安排\n• 时间：12 月 20 日（周六）上午 9:00\n• 地点：本校多功能厅\n• 流程：校长致辞 → 班主任汇报 → 分组交流 → 个别面谈\n\n期待与您的进一步沟通！\n\n班主任：李老师\n2025 年 12 月 10 日",
  },
  {
    id: "r-weike-001", kind: "video",
    title: "勾股定理 1 分钟微课",
    meta: "5/8（1分20秒，普通话旁白 + 中文字幕）",
    agent: "weike", version: "v1.0", updatedAt: "12-06 11:32",
    body: "🎬 1 分 20 秒微课脚本\n\n[0:00-0:05] 开场画面：直角三角形三维旋转，标注三条边。\n[0:05-0:15] 旁白：同学们好，今天我们用一分钟认识一个古老而美丽的定理。\n[0:15-0:30] 公式浮现：a² + b² = c²，配合面积推导动画。\n[0:30-0:50] 三个生活例子：梯子 ÷ 足球场 ÷ 矩形对角线。\n[0:50-1:10] 速记口诀：「弦上方是两边平方和」。\n[1:10-1:20] 结尾：留下思考题，欢迎在评论区留下你的答案。",
  },
  {
    id: "r-quanan-003", kind: "doc",
    title: "Unit 4 单元教案",
    meta: "6/8（共1份结构化教案，含五课时）",
    agent: "quanan", version: "v3.0", updatedAt: "12-02 08:45",
    body: "Unit 4 My Neighbourhood — 五课时结构化教案\n\n【第一课时】Section A 1a-2c\n• 教学目标：掌握 -hood 后缀词汇\n• 重点：neighborhood / childhood / brotherhood\n• 教学流程：导入(5m) → 词汇讲授(15m) → 操练(15m) → 总结(5m)\n• 板书：核心词汇 + 词性变化规律\n• 作业：抄写 5 遍 + 造句 2 个\n\n【第二课时】Section A 2d-3c\n• 教学目标：在情境中运用核心句型\n• 重点：Where do you live? / It's on...\n• 教学流程：对话示范(8m) → 角色扮演(15m) → 听力(12m) → 总结(5m)\n• 板书：句型结构 + 介词用法\n• 作业：录音对话 + 单元自测题\n\n【第三课时】Section B 1a-1e\n• 教学目标：阅读理解 + 信息提取\n• 重点：skim / scan 策略\n• 教学流程：导入(3m) → 速读(7m) → 细读(15m) → 讨论(10m) → 总结(5m)\n• 板书：阅读策略 + 思维导图\n• 作业：完成 reading log\n\n【第四课时】Section B 2a-2c\n• 教学目标：写作中运用本单元核心词汇\n• 重点：描写邻里生活的句式\n• 教学流程：范文赏析(10m) → 写作框架(10m) → 仿写(15m) → 分享(5m)\n• 板书：5W1H 写作模板\n• 作业：完成第一稿\n\n【第五课时】单元复习 + 单元测试\n• 教学目标：综合复习 + 测评\n• 教学流程：单元梳理(15m) → 重点回顾(15m) → 单元测试(30m)\n• 作业：错题整理 + 单元反思",
  },
  {
    id: "r-chuti-002", kind: "quiz",
    title: "期末模拟卷（数学）",
    meta: "7/8（共1份试卷，选择12+填空4+解答6）",
    agent: "chuti", version: "v2.0", updatedAt: "11-29 14:20",
    body: "2025-2026 学年度第一学期 期末模拟卷\n数学 · 八年级 · 90 分钟\n\n一、选择题（每题 3 分，共 36 分）\n1. 下列图形中是轴对称图形的是（   ）\n   A. 平行四边形  B. 等腰三角形  C. 直角梯形  D. 不规则四边形\n2. 点 P(2, -3) 关于 x 轴对称的点的坐标是（   ）\n   A. (-2, -3)  B. (2, 3)  C. (-2, 3)  D. (2, -3)\n3. 已知等腰三角形两边长为 3 和 7，则周长为（   ）\n   A. 13  B. 17  C. 13 或 17  D. 以上都不对\n4. ... (略)\n\n二、填空题（每题 4 分，共 16 分）\n13. 在 △ABC 中，∠A=50°，∠B=70°，则 ∠C=______．\n14. ... (略)\n\n三、解答题（共 48 分）\n17. （8 分）已知 a² + b² = 25，a - b = 3，求 a+b 的值。\n18. （10 分）作图题：用直尺和圆规作出 △ABC 的内切圆。\n19. （12 分）综合题：勾股定理应用——梯子问题。\n20. （18 分）压轴题：分类讨论 + 动态几何。",
  },
  {
    id: "r-wenshu-002", kind: "doc",
    title: "学生成绩评语合集",
    meta: "8/8（共 32 位同学的个性化评语）",
    agent: "wenshu", version: "v1.5", updatedAt: "11-26 17:08",
    body: "本学期学生成绩评语合集（节选）\n\n【A 类·学优生】\n• 张三：本学期你始终保持年级前 5 的优秀成绩，课堂上经常主动帮助同学答疑，班级里真正的「小老师」。下学期希望你能把方法论分享给更多同学。\n• 李四：数理思维突出，数学单元测试连续三次满分，期望你能在英语口语方面多花一些时间。\n\n【B 类·稳定型】\n• 王五：成绩稳定在班级前 10，听课认真，作业质量高。继续保持课堂笔记的完整性，下学期争取在难题上有所突破。\n• 赵六：本学期进步明显，期中排名 25 → 期末 12。最大的变化是养成了每天整理错题的习惯，望继续坚持。\n\n【C 类·进步型】\n• 孙七：从不敢举手到主动发言，老师为你点赞！下学期请继续保持这个势头，勇敢表达。\n• 周八：阅读量大幅提升，作文从 200 字到 400 字。下一步可以尝试不同文体的写作。\n\n【D 类·需关注】\n• 吴九：近期情绪波动较大，已与家长沟通。建议先从作息时间调整开始，每天保证 8 小时睡眠。",
  },
];

const SAMPLE_PACKAGE: ClassPackage = {
  id: "pkg-001",
  title: "勾股定理的认识课堂包",
  subject: "数学",
  grade: "八年级",
  version: "v1.0",
  total: 8,
  summary: "1/8（共1份课堂包）",
  phases: [
    {
      key: "p1", label: "破冰：课前导入", desc: "激发兴趣，建立勾股定理的生活直觉", duration: "约10分",
      resources: [
        { id: "r1", name: "生活中的勾股现象", type: "image", size: "1.2MB",
          thumb: "🖼", preview: "一组生活中的勾股定理图示：梯子斜靠墙面、矩形对角线、足球场地角旗等 4 张配图，含简短文字说明。" },
        { id: "r2", name: "情境引入脚本", type: "doc", size: "3KB",
          thumb: "📄", preview: "【教师话术】同学们，请观察这张图：梯子斜靠在墙上，离墙 6 米，梯子长 10 米，问梯子顶端离地多高？——引出本节课题。" },
      ],
    },
    {
      key: "p2", label: "授课：新知建构", desc: "讲解定理、证明思路与书写规范", duration: "约20分",
      resources: [
        { id: "r3", name: "勾股定理课件", type: "ppt", size: "8.5MB",
          thumb: "📊", preview: "幻灯片 1：直角三角形标注（斜边 Hypotenuse ÷ 直角边 Legs）\n幻灯片 2：a² + b² = c² 公式推导（赵爽弦图）\n幻灯片 3：典型例题（3-4-5 验证）\n幻灯片 4：书写格式与单位规范" },
        { id: "r4", name: "赵爽弦图动画", type: "video", size: "12MB",
          thumb: "🎬", preview: "1分40秒动画：从四个全等直角三角形拼成正方形，动态演示 a² + b² = c² 几何证明，配旁白。" },
        { id: "r5", name: "课堂例题集", type: "doc", size: "5KB",
          thumb: "📄", preview: "例 1：在 Rt△ 中，已知 a=3, b=4，求 c。\n例 2：已知斜边 c=13, a=5，求 b。\n例 3：正方形边长 6cm，求对角线长（保留两位小数）。" },
        { id: "r6", name: "易错点提示", type: "doc", size: "2KB",
          thumb: "💡", preview: "常见易错点：\n• 直角三角形必须明确哪条是斜边\n• 单位统一后再开方\n• 书写步骤分四步：已知→公式→代入→结果" },
      ],
    },
    {
      key: "p3", label: "互动：随堂练习", desc: "即时反馈、纠错与协作讨论", duration: "约10分",
      resources: [
        { id: "r7", name: "课堂随堂测", type: "quiz", size: "1题",
          thumb: "📝", preview: "【判断题】3、4、5 三个数能组成直角三角形吗？\n（限时 1 分钟，全班抢答，答对加分）" },
      ],
    },
    {
      key: "p4", label: "总结：课后作业", desc: "巩固与分层延伸", duration: "约5分",
      resources: [
        { id: "r8", name: "课后分层作业", type: "doc", size: "4KB",
          thumb: "📋", preview: "A 组（基础）：1-5 题计算题\nB 组（进阶）：6-8 题应用题（含梯子问题）\nC 组（拓展）：9-10 题逆向出题（自己出一道勾股定理应用题）" },
      ],
    },
  ],
};

const HISTORY_ITEMS_DEFAULT = [
  { id: 1, label: "勾股定理的认识课堂包", agent: 1, completed: true },
  { id: 2, label: "Unit 4 精读教案", agent: 1 },
  { id: 3, label: "期末复习练习卷", agent: 2 },
  { id: 4, label: "阅读策略微课", agent: 0 },
  { id: 5, label: "期末家长通知信", agent: 3 },
  { id: 6, label: "Unit 3 分层练习题", agent: 2 },
  { id: 7, label: "高一词汇思维导图", agent: 0 },
  { id: 8, label: "勾股定理练习作业", agent: 2 },
  { id: 9, label: "高一期末成绩评语", agent: 3 },
];

const CANVAS_VERSIONS = [
  {
    id: 1, label: "中二数学科教案：毕氏定理（勾股定理）的认识与应用",
    version: "v2", isLatest: true,
    content: `中二数学科教案：毕氏定理（勾股定理）的认识与应用

年级：中二（八年级）   科目：数学   时长：45分钟

━━ 教学目标 ━━━━━━━━━━━━━━━━━━━━

• 知识层面：学生能理解勾股定理（毕氏定理）的概念及其数学表达式（a² + b² = c²）。
• 技能层面：学生能运用毕氏定理计算直角三角形中未知的边长（包括斜边和直角边）。
• 态度层面：通过探索家居场景中的勾股问题，培养学生对数学的兴趣及解决生活实际问题的能力。

━━ 教学重点 ━━━━━━━━━━━━━━━━━━━━

• 理解直角三角形的斜边（Hypotenuse）和直角边（Legs）。
• 掌握并能应用毕氏定理公式（a² + b² = c²）进行计算，特别是步骤分明的书写格式。
• 理解毕氏定理充分条件：便用这一定理的先决条件。

━━ 教学流程 ━━━━━━━━━━━━━━━━━━━━

阶段     时长    教师活动
引入     5分钟   展示一幅日常生活的图像（把梯子斜靠在墙上，求直角的位置）。
词汇     10分钟  重点词汇：Hypotenuse / Right angle / Square root
精读     20分钟  段落结构分析 + 推断词义策略，学生分组完成阅读任务单。
讨论     10分钟  "How can we use Pythagoras in daily life?"`,
  },
  {
    id: 2, label: "勾股定理分层练习题（基础版）",
    version: "v1", isLatest: false,
    content: `勾股定理分层练习题（基础版）

班级：中二（八年级）   科目：数学   题目数量：10题

━━ A 组（基础题）━━━━━━━━━━━━━━━━━━

1. 在直角三角形中，已知两条直角边分别为 3 和 4，求斜边长度。
2. 已知斜边为 13，一条直角边为 5，求另一条直角边。
3. 判断以下三组数是否构成直角三角形：(5, 12, 13)

━━ B 组（进阶题）━━━━━━━━━━━━━━━━━━

4. 一把梯子斜靠在墙上，梯子长 10m，底部离墙 6m，求梯子顶端离地高度。
5. 正方形边长为 6cm，求对角线长度（保留两位小数）。`,
  },
  {
    id: 3, label: "勾股定理课后练习（逆向出题版）",
    version: "v1", isLatest: false,
    content: `勾股定理课后练习 — 逆向出题版

学生自主命题，深化理解

━━ 逆向出题任务 ━━━━━━━━━━━━━━━━━━

请学生根据下列条件，自行编写 2 道应用题：

条件一：直角三角形三边之比为 3:4:5
条件二：某正方形面积为 50 平方厘米

评分标准：题目情境合理、数据完整、解法唯一。`,
  },
];

// ─── Drag resize hook ────────────────────────────────────────────────────────
function useDragResize(initialWidth: number, min: number, max: number) {
  const [width, setWidth] = useState(initialWidth);
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    let active = true;
    const move = (ev: MouseEvent) => {
      if (!active) return;
      const delta = startX - ev.clientX; // dragging left handle → moving left shrinks canvas
      setWidth(Math.min(max, Math.max(min, startW + delta)));
    };
    const up = () => { active = false; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }
  return { width, onMouseDown };
}

// ─── Agent dropdown (compact, for input box label) ───────────────────────────
function AgentDropdown({ activeIdx, onChange }: { activeIdx: number; onChange: (i: number) => void }) {
  const [open, setOpen] = useState(false);
  const agent = MYTA_AGENTS[activeIdx];
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: tk.bgBrandSubtle, color: tk.textBrand,
          border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusFull,
          fontSize: 11, fontWeight: 600, padding: "2px 8px 2px 4px",
          cursor: "pointer", transition: "all 0.12s",
        }}
      >
        <span style={{
          width: 16, height: 16, borderRadius: 4,
          background: tk.brandDefault, color: tk.textReverse,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 700,
        }}>{agent.abbr}</span>
        {agent.name}
        <ChevronDown size={10} style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 300,
          background: tk.bgWhite, borderRadius: tk.radiusMd,
          border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowMd,
          minWidth: 160, overflow: "hidden",
        }}>
          {MYTA_AGENTS.map((a, i) => (
            <button key={a.key} onClick={() => { onChange(i); setOpen(false); }} style={{
              width: "100%", background: i === activeIdx ? tk.bgBrandSubtle : "transparent",
              border: "none", padding: "8px 12px", cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: 8,
              color: i === activeIdx ? tk.textBrand : tk.textPrimary,
              fontSize: 13, fontWeight: i === activeIdx ? 600 : 400,
              transition: "background 0.1s",
            }}
              onMouseEnter={e => { if (i !== activeIdx) e.currentTarget.style.background = tk.bgPrimary; }}
              onMouseLeave={e => { if (i !== activeIdx) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                background: i === activeIdx ? tk.brandDefault : tk.bgSecondary,
                color: i === activeIdx ? tk.textReverse : tk.textSecondary,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
              }}>{a.abbr}</span>
              {a.name}
              {i === activeIdx && <CheckCircle2 size={12} style={{ marginLeft: "auto", color: tk.brandDefault }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Image upload placeholder (微知课) ──────────────────────────────────────
function ImageUploadZone() {
  const [hasImage, setHasImage] = useState(false);
  return (
    <div
      onClick={() => setHasImage(true)}
      style={{
        width: 72, height: 72, flexShrink: 0, borderRadius: tk.radiusSm,
        border: `1.5px dashed ${hasImage ? tk.borderBrand : tk.borderDefault}`,
        background: hasImage ? tk.bgBrandSubtle : tk.bgPrimary,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.15s", gap: 4,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderBrand; e.currentTarget.style.background = tk.bgBrandSubtle; }}
      onMouseLeave={e => {
        if (!hasImage) {
          e.currentTarget.style.borderColor = tk.borderDefault;
          e.currentTarget.style.background = tk.bgPrimary;
        }
      }}
    >
      {hasImage ? (
        <CheckCircle2 size={20} style={{ color: tk.brandDefault }} />
      ) : (
        <>
          <Plus size={18} style={{ color: tk.textPlaceholder }} />
          <span style={{ fontSize: 9, color: tk.textPlaceholder, textAlign: "center", lineHeight: "12px" }}>上传图片</span>
        </>
      )}
    </div>
  );
}

// ─── Tall AI input box ───────────────────────────────────────────────────────
function MyTAInputBox({
  value, onChange, onSend, placeholder, agentIdx, onAgentChange,
  showSlotFilling, showAgentTabs, selectedModules, onRemoveModule,
}: {
  value: string; onChange: (v: string) => void; onSend: () => void;
  placeholder: string; agentIdx: number; onAgentChange: (i: number) => void;
  showSlotFilling: boolean; showAgentTabs?: boolean;
  selectedModules?: { name: string; type: string; id: number }[];
  onRemoveModule?: (id: number) => void;
}) {
  const [slotClass, setSlotClass] = useState("");
  const [slotCount, setSlotCount] = useState("10");
  const [slotDiff, setSlotDiff] = useState("中");
  const agent = MYTA_AGENTS[agentIdx];
  const isWeike = agentIdx === 0;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Slot-filling intent card */}
      {showSlotFilling && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
          background: tk.bgWhite, borderRadius: tk.radiusLg,
          border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowLg,
          padding: tk.spacingLg, zIndex: 200,
        }}>
          <div style={{ marginBottom: tk.spacingMd }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>补充出题信息</div>
            <div style={{ fontSize: 12, color: tk.textSecondary, marginTop: 2 }}>填写后将生成更精准的练习题</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: tk.spacingMd, marginBottom: tk.spacingMd }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, display: "block", marginBottom: 6 }}>发送班级</label>
              <select value={slotClass} onChange={e => setSlotClass(e.target.value)} style={{
                width: "100%", padding: "8px 10px", borderRadius: tk.radiusSm,
                border: `1px solid ${tk.borderDefault}`, fontSize: 13,
                color: slotClass ? tk.textPrimary : tk.textPlaceholder,
                background: tk.bgWhite, outline: "none", fontFamily: "var(--font-family)",
              }}>
                <option value="">选择班级</option>
                <option>高一(1)班</option><option>高一(2)班</option>
                <option>高一(3)班</option><option>高一(4)班</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, display: "block", marginBottom: 6 }}>题目数量</label>
              <div style={{ display: "flex", gap: 4 }}>
                {["5", "10", "15", "20"].map(n => (
                  <button key={n} onClick={() => setSlotCount(n)} style={{
                    flex: 1, padding: "7px 0",
                    border: `1px solid ${slotCount === n ? tk.brandDefault : tk.borderDefault}`,
                    background: slotCount === n ? tk.brandDefault : tk.bgWhite,
                    color: slotCount === n ? tk.textReverse : tk.textSecondary,
                    borderRadius: tk.radiusSm, fontSize: 13, fontWeight: slotCount === n ? 600 : 400, cursor: "pointer",
                  }}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, display: "block", marginBottom: 6 }}>难易度</label>
              <div style={{ display: "flex", gap: 4 }}>
                {["易", "中", "难"].map(d => (
                  <button key={d} onClick={() => setSlotDiff(d)} style={{
                    flex: 1, padding: "7px 0",
                    border: `1px solid ${slotDiff === d ? tk.brandDefault : tk.borderDefault}`,
                    background: slotDiff === d ? tk.brandDefault : tk.bgWhite,
                    color: slotDiff === d ? tk.textReverse : tk.textSecondary,
                    borderRadius: tk.radiusSm, fontSize: 13, fontWeight: slotDiff === d ? 600 : 400, cursor: "pointer",
                  }}>{d}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button style={{
              background: "none", border: `1px solid ${tk.borderDefault}`,
              borderRadius: tk.radiusSm, fontSize: 13, padding: "6px 16px", cursor: "pointer", color: tk.textSecondary,
            }}>跳过</button>
            <button onClick={onSend} style={{
              background: tk.brandDefault, color: tk.textReverse,
              border: "none", borderRadius: tk.radiusSm,
              fontSize: 13, fontWeight: 600, padding: "6px 20px", cursor: "pointer",
            }}>确认生成</button>
          </div>
        </div>
      )}



      {/* Main input card */}
      <div style={{
        background: tk.bgWhite, borderRadius: tk.radiusLg,
        border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowMd, overflow: "visible",
      }}>
        {/* Cold-start: agent switcher tabs at the top of the input card */}
        {showAgentTabs ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 4, padding: "8px 10px",
            borderBottom: `1px solid ${tk.borderHairline}`,
            flexWrap: "wrap",
          }}>
            {MYTA_AGENTS.map((a, i) => (
              <button key={a.key} onClick={() => onAgentChange(i)} style={{
                background: i === agentIdx ? tk.bgBrandSubtle : "transparent",
                color: i === agentIdx ? tk.textBrand : tk.textPlaceholder,
                border: i === agentIdx ? `1px solid ${tk.borderBrand}` : "1px solid transparent",
                borderRadius: tk.radiusFull, fontSize: 12, fontWeight: i === agentIdx ? 600 : 400,
                padding: "4px 12px 4px 6px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                transition: "all 0.12s",
              }}
                onMouseEnter={e => { if (i !== agentIdx) { e.currentTarget.style.background = tk.bgPrimary; e.currentTarget.style.color = tk.textSecondary; } }}
                onMouseLeave={e => { if (i !== agentIdx) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tk.textPlaceholder; } }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  background: i === agentIdx ? tk.brandDefault : tk.bgSecondary,
                  color: i === agentIdx ? tk.textReverse : tk.textSecondary,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                }}>{a.abbr}</span>
                {a.name}
              </button>
            ))}
          </div>
        ) : (
          /* Per-skill page: AgentDropdown at the top (unchanged) */
          <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center" }}>
            <AgentDropdown activeIdx={agentIdx} onChange={onAgentChange} />
          </div>
        )}

        {/* Editable content area with module chips */}
        <div style={{ display: "flex", gap: 10, padding: showAgentTabs ? "10px 14px 4px" : "8px 14px 6px", alignItems: "flex-start" }}>
          {isWeike && <ImageUploadZone />}
          <div
            contentEditable
            onInput={e => onChange((e.target as HTMLElement).innerText)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder={placeholder}
            style={{
              flex: 1, minHeight: (isWeike ? 3 : 4) * 22 + "px",
              border: "none", outline: "none",
              background: "transparent", fontSize: 14, color: tk.textPrimary,
              lineHeight: "22px", fontFamily: "var(--font-family)",
              padding: 0, minWidth: 0,
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}
            suppressContentEditableWarning={true}
          >
            {selectedModules && selectedModules.length > 0 && selectedModules.map(mod => (
              <span key={mod.id} contentEditable={false} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", background: tk.bgBrandSubtle,
                borderRadius: tk.radiusFull, fontSize: 13, color: tk.textBrand,
                marginRight: 4, cursor: "default",
                verticalAlign: "middle",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 3,
                  background: tk.brandDefault, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 600, color: tk.textReverse,
                }}>
                  {mod.type.charAt(0)}
                </div>
                {mod.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveModule?.(mod.id);
                  }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: tk.textBrand, padding: 0, marginLeft: 2,
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: showAgentTabs ? "4px 12px 10px" : "6px 12px 12px",
          borderTop: showAgentTabs ? "none" : `1px solid ${tk.borderHairline}`,
          gap: 8, flexWrap: "nowrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, overflow: "hidden" }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              color: tk.textPlaceholder, padding: "4px 6px", borderRadius: tk.radiusSm,
              display: "flex", alignItems: "center", flexShrink: 0,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = tk.textSecondary)}
              onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
            ><Plus size={15} /></button>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              color: tk.textPlaceholder, padding: "3px 7px", borderRadius: tk.radiusSm,
              display: "flex", alignItems: "center", gap: 4, fontSize: 11, flexShrink: 0,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = tk.textSecondary)}
              onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
            ><Brain size={12} /> 深度思考</button>
          </div>
          <button onClick={onSend} style={{
            width: 30, height: 30, borderRadius: tk.radiusFull, flexShrink: 0,
            background: value.trim() ? tk.brandDefault : tk.bgSecondary,
            color: value.trim() ? tk.textReverse : tk.textPlaceholder,
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: value.trim() ? "pointer" : "default", transition: "all 0.15s",
          }}><SendHorizonal size={13} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── 通用：意图确认弹窗（按 agent 差异化表单），独立浮层不进入 chat 流 ────────
function IntentConfirmDialog({ agentKey, onCancel, onConfirm }: {
  agentKey: "quanan" | "weike" | "chuti" | "wenshu";
  onCancel: () => void;
  onConfirm: (values: Record<string, any>) => void;
}) {
  const tpl = INTENT_TEMPLATES[agentKey];
  const [values, setValues] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    tpl.fields.forEach(f => {
      if (f.type === "multi") init[f.key] = [];
      else if (f.type === "radio" || f.type === "select") init[f.key] = "";
      else init[f.key] = "";
    });
    return init;
  });

  const agentName = MYTA_AGENTS.find(a => a.key === agentKey)?.name || "智能体";
  const accent = tk.bgBrandSubtle;

  return (
    <div style={{
      background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
      borderRadius: tk.radiusLg, boxShadow: tk.shadowLg,
      padding: 16, width: "100%",
    }}>
      {/* 头部：agent 名 + 关闭 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>{agentName} · {tpl.title}</div>
        <div style={{ flex: 1 }} />
        <button onClick={onCancel} style={{
          background: "none", border: "none", cursor: "pointer", color: tk.textPlaceholder,
          display: "flex", alignItems: "center", padding: 2,
        }}><X size={14} /></button>
      </div>

      {/* 表单字段 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tpl.fields.map(f => {
          const v = values[f.key];
          return (
            <div key={f.key}>
              <div style={{ fontSize: 11, color: tk.textSecondary, marginBottom: 5, display: "flex", alignItems: "center", gap: 3 }}>
                {f.label}
                {f.required && <span style={{ color: tk.textError }}>*</span>}
              </div>
              {f.type === "radio" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {f.options!.map(o => {
                    const checked = v === o;
                    return (
                      <button key={o} onClick={() => setValues({ ...values, [f.key]: o })} style={{
                        padding: "4px 12px", fontSize: 12,
                        background: checked ? tk.bgBrandSubtle : tk.bgPrimary,
                        color: checked ? tk.textBrand : tk.textPrimary,
                        border: `1px solid ${checked ? tk.brandDefault : tk.borderHairline}`,
                        borderRadius: tk.radiusFull, cursor: "pointer", whiteSpace: "nowrap",
                      }}>{o}</button>
                    );
                  })}
                </div>
              )}
              {f.type === "multi" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {f.options!.map(o => {
                    const arr: string[] = v || [];
                    const checked = arr.includes(o);
                    return (
                      <button key={o} onClick={() => {
                        const next = checked ? arr.filter(x => x !== o) : [...arr, o];
                        setValues({ ...values, [f.key]: next });
                      }} style={{
                        padding: "4px 12px", fontSize: 12,
                        background: checked ? tk.bgBrandSubtle : tk.bgPrimary,
                        color: checked ? tk.textBrand : tk.textPrimary,
                        border: `1px solid ${checked ? tk.brandDefault : tk.borderHairline}`,
                        borderRadius: tk.radiusFull, cursor: "pointer", whiteSpace: "nowrap",
                      }}>{o}</button>
                    );
                  })}
                </div>
              )}
              {f.type === "select" && (
                <select value={v} onChange={e => setValues({ ...values, [f.key]: e.target.value })} style={{
                  background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                  borderRadius: tk.radiusSm, fontSize: 12, padding: "5px 10px",
                  width: "100%", outline: "none", fontFamily: "var(--font-family)",
                }}>
                  <option value="">请选择…</option>
                  {f.options!.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {f.type === "text" && (
                <input value={v} placeholder={f.placeholder} onChange={e => setValues({ ...values, [f.key]: e.target.value })} style={{
                  background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                  borderRadius: tk.radiusSm, fontSize: 12, padding: "5px 10px",
                  width: "100%", outline: "none", fontFamily: "var(--font-family)",
                }} />
              )}
              {f.type === "textarea" && (
                <textarea value={v} placeholder={f.placeholder} onChange={e => setValues({ ...values, [f.key]: e.target.value })} rows={2} style={{
                  background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                  borderRadius: tk.radiusSm, fontSize: 12, padding: "6px 10px",
                  width: "100%", outline: "none", fontFamily: "var(--font-family)", resize: "vertical",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* 操作 */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 14 }}>
        <button onClick={onCancel} style={{
          background: "none", border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm,
          fontSize: 12, padding: "5px 16px", cursor: "pointer", color: tk.textSecondary,
        }}>跳过</button>
        <button onClick={() => onConfirm(values)} style={{
          background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm,
          fontSize: 12, fontWeight: 600, padding: "5px 20px", cursor: "pointer",
        }}>确认生成</button>
      </div>
    </div>
  );
}

// ─── Trae 风格：输入框上方的「意图」浮窗（仅做意图确认；思考放进 chat 流） ───
function IntentFlowCard({
  agentKey, intent, onCancelIntent, onConfirmIntent,
}: {
  agentKey: "quanan" | "weike" | "chuti" | "wenshu";
  intent: boolean;
  onCancelIntent: () => void;
  onConfirmIntent: (values: Record<string, any>) => void;
}) {
  if (!intent) return null;

  return (
    <div style={{
      position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, zIndex: 30,
      background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
      borderRadius: tk.radiusLg, boxShadow: tk.shadowLg,
      overflow: "hidden", maxWidth: 760, margin: "0 auto",
    }}>
      <IntentConfirmDialog
        agentKey={agentKey}
        onCancel={onCancelIntent}
        onConfirm={onConfirmIntent}
      />
    </div>
  );
}

// ─── Trae 风格：chat 流中的「任务思考」极简列表（仅思考阶段 + 完成后可折叠）──
function ThinkingFlowMessage({
  agentKey, thinking, thinkingIdx, thinkingDone, thinkingSteps,
  collapsed, onToggleCollapsed,
}: {
  agentKey: "quanan" | "weike" | "chuti" | "wenshu";
  thinking: boolean;
  thinkingIdx: number;
  thinkingDone: boolean;
  thinkingSteps: ThinkingStep[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  if (!thinking && !thinkingDone) return null;

  const agentName = MYTA_AGENTS.find(a => a.key === agentKey)?.name || "智能体";

  return (
    <div style={{ 
      margin: "6px 0", 
      background: tk.bgPrimary,
      border: `1px solid ${tk.borderHairline}`,
      borderRadius: tk.radiusMd,
      overflow: "hidden",
    }}>
      <div
        onClick={onToggleCollapsed}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px",
          cursor: "pointer",
          userSelect: "none",
          transition: "all 0.15s",
          fontSize: 12,
        }}
      >
        <div style={{
          width: 16, height: 16, borderRadius: 4,
          background: tk.bgBrandSubtle,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {thinking ? (
            <Loader2 size={10} style={{ color: tk.textBrand, animation: "spin 1s linear infinite" }} />
          ) : (
            <Check size={10} style={{ color: tk.textBrand, strokeWidth: 3 }} />
          )}
        </div>
        <span style={{ fontWeight: 500, color: tk.textPrimary }}>
          {thinking ? `${agentName} 正在规划任务…` : `${agentName} 思考完毕`}
        </span>
        <span style={{ fontSize: 10, color: tk.textPlaceholder }}>·</span>
        <span style={{ fontSize: 10, color: tk.textPlaceholder }}>
          {thinkingDone ? `${thinkingSteps.length} 步` : `${Math.max(thinkingIdx + 1, 1)} / ${thinkingSteps.length}`}
        </span>
        <ChevronDown size={12} style={{
          color: tk.textPlaceholder, marginLeft: "auto",
          transform: collapsed ? "rotate(-90deg)" : "none", transition: "transform 0.15s",
        }} />
      </div>

      {!collapsed && (
        <div style={{ padding: "0 14px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          {thinkingSteps.map((s, i) => {
            const isDone = thinkingDone || i < thinkingIdx;
            const isActive = !thinkingDone && i === thinkingIdx;
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                  background: isDone ? tk.brandDefault : isActive ? tk.bgBrandSubtle : "transparent",
                  border: isActive ? `1.5px solid ${tk.brandDefault}` : `1px solid ${isDone ? tk.brandDefault : tk.borderHairline}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isDone && <Check size={6} style={{ color: tk.textReverse, strokeWidth: 4 }} />}
                  {isActive && <div style={{
                    width: 4, height: 4, borderRadius: "50%", background: tk.brandDefault,
                    animation: "pulse 1.2s ease-in-out infinite",
                  }} />}
                </div>
                <span style={{
                  fontSize: 12, color: isDone ? tk.textSecondary : isActive ? tk.textBrand : tk.textPlaceholder,
                  lineHeight: "18px",
                }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 资源卡片组件：chat中展示生成的资源 ──
function ChatResourceCard({ resource, onClick }: { resource: Resource; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  
  const getIcon = () => {
    const iconProps = { size: 16 };
    switch (resource.kind) {
      case "package": return <FolderOpen {...iconProps} />;
      case "doc": return <FileText {...iconProps} />;
      case "quiz": return <Layers {...iconProps} />;
      case "image": return <Eye {...iconProps} />;
      case "video": return <Video {...iconProps} />;
      case "audio": return <Music {...iconProps} />;
      case "ppt": return <Layers {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };
  
  const getIconBg = () => {
    switch (resource.kind) {
      case "package": return tk.bgBrandSubtle;
      case "doc": return "rgba(79, 121, 243, 0.12)";
      case "quiz": return "rgba(245, 158, 11, 0.12)";
      case "image": return "rgba(16, 185, 129, 0.12)";
      case "video": return "rgba(239, 68, 68, 0.12)";
      case "audio": return "rgba(139, 92, 246, 0.12)";
      case "ppt": return "rgba(236, 72, 153, 0.12)";
      default: return tk.bgPrimary;
    }
  };
  
  const getIconColor = () => {
    switch (resource.kind) {
      case "package": return tk.brandDefault;
      case "doc": return "#4F79F3";
      case "quiz": return "#F59E0B";
      case "image": return "#10B981";
      case "video": return "#EF4444";
      case "audio": return "#8B5CF6";
      case "ppt": return "#EC4899";
      default: return tk.textSecondary;
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px",
        background: hovered ? tk.bgPrimary : tk.bgWhite,
        border: `1px solid ${hovered ? tk.borderBrand : tk.borderHairline}`,
        borderRadius: tk.radiusMd,
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: hovered ? tk.shadowSm : "none",
      }}
    >
      {/* 资源类型图标 */}
      <div style={{
        width: 32, height: 32, borderRadius: tk.radiusSm,
        background: getIconBg(),
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {getIcon()}
      </div>
      
      {/* 文件信息 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: tk.textPrimary,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{resource.title}</div>
        <div style={{
          fontSize: 11, color: tk.textPlaceholder, marginTop: 2,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span>{resource.meta || "无描述"}</span>
          <span>·</span>
          <span>{resource.updatedAt}</span>
        </div>
      </div>
      
      {/* 右侧箭头 */}
      <ChevronRight size={14} style={{
        color: hovered ? tk.brandDefault : tk.textPlaceholder,
        flexShrink: 0,
        transition: "color 0.18s",
      }} />
    </div>
  );
}

// ─── 通用第三栏：8 资源左右切换 + 版本 + 内容预览（所有 agent / 任务历史通用）──
function ResourceShelfPanel({ resources, onClose, onFullscreen }: {
  resources: Resource[];
  onClose: () => void;
  onFullscreen: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [titleDropdown, setTitleDropdown] = useState(false);
  const resource = resources[activeIdx] || resources[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: tk.bgWhite, borderLeft: `1px solid ${tk.borderHairline}` }}>
      {/* ── 第一层：标题（左侧标题 + 右侧 1/8 + 左右箭头）+ 快捷操作（紧凑） ── */}
      <div style={{
        padding: "6px 10px", borderBottom: `1px solid ${tk.borderHairline}`,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {/* 左侧：标题 + 下拉 */}
        <div style={{ position: "relative", minWidth: 0, flex: 1 }}>
          <button onClick={() => setTitleDropdown(v => !v)} style={{
            background: "none", border: "none", padding: "1px 2px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 3,
            fontSize: 13, fontWeight: 600, color: tk.textPrimary, maxWidth: "100%",
          }}>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{resource.title}</span>
            <ChevronDown size={11} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />
          </button>
          {titleDropdown && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusSm, boxShadow: tk.shadowLg,
              padding: 4, minWidth: 280, maxHeight: 360, overflowY: "auto",
            }}>
              {resources.map((r, i) => (
                <div key={r.id} onClick={() => { setActiveIdx(i); setTitleDropdown(false); }} style={{
                  padding: "6px 10px", fontSize: 12, color: tk.textPrimary,
                  background: i === activeIdx ? tk.bgBrandSubtle : "transparent",
                  borderRadius: 4, cursor: "pointer",
                }}
                  onMouseEnter={e => { if (i !== activeIdx) e.currentTarget.style.background = tk.bgPrimary; }}
                  onMouseLeave={e => { if (i !== activeIdx) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>{r.title}</span>
                    <span style={{ fontSize: 10, color: tk.textBrand, fontWeight: 600 }}>{r.version}</span>
                  </div>
                  <div style={{ fontSize: 10, color: tk.textPlaceholder, marginTop: 1 }}>{r.meta}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 中部：定位 + 左右箭头（位于标题后方） */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
          <button
            onClick={() => setActiveIdx((activeIdx - 1 + resources.length) % resources.length)}
            style={navBtn}
            title="上一个"
          ><ChevronLeft size={12} /></button>
          <span style={{ fontSize: 11, color: tk.textSecondary, minWidth: 32, textAlign: "center" }}>
            {activeIdx + 1} / {resources.length}
          </span>
          <button
            onClick={() => setActiveIdx((activeIdx + 1) % resources.length)}
            style={navBtn}
            title="下一个"
          ><ChevronRight size={12} /></button>
        </div>

        {/* 右侧：快捷操作（紧凑） */}
        <button title="分享" style={iconBtn}><Share2 size={11} /></button>
        <button title="下载" style={iconBtn}><Download size={11} /></button>
        <button title="AI 选定微调" style={iconBtn}><RefreshCw size={11} /></button>
        <button title="编辑" style={{
          ...iconBtn, color: tk.textPrimary, fontSize: 11, fontWeight: 500, padding: "3px 8px", gap: 3,
        }}>编辑</button>
        <button title="存到资源库" style={{
          ...primaryBtn, padding: "3px 10px", fontSize: 11,
        }}>存到资源库</button>
        <button title="全屏" onClick={onFullscreen} style={iconBtn}><Maximize2 size={11} /></button>
        <button title="关闭" onClick={onClose} style={iconBtn}><X size={11} /></button>
      </div>

      {/* ── 第三层：内容（课堂包 / 普通资源二选一） ── */}
      {resource.kind === "package" && resource.pkg ? (
        <PackageContentView pkg={resource.pkg} />
      ) : (
        <SimpleContentView resource={resource} />
      )}
    </div>
  );
}

// 课堂包专属：所有阶段横排一体（标题在上 + 资源 chips 在下），参考 figma 布局
function PackageContentView({ pkg }: { pkg: ClassPackage }) {
  const [activeRes, setActiveRes] = useState<{ phaseIdx: number; resId: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!pkg.phases.length) return;
    const p0 = pkg.phases[0];
    if (p0.resources.length) setActiveRes({ phaseIdx: 0, resId: p0.resources[0].id });
  }, [pkg]);
  const active = activeRes
    ? pkg.phases[activeRes.phaseIdx]?.resources.find(r => r.id === activeRes.resId)
    : null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        position: "relative", display: "flex", alignItems: "stretch",
        background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`,
      }}>
        <button onClick={() => scrollBy(-1)} style={{
          ...navBtn, position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)",
          zIndex: 5, background: tk.bgWhite, boxShadow: tk.shadowSm,
        }} title="向左滚动"><ChevronLeft size={13} /></button>

        <div ref={scrollRef} style={{
          flex: 1, display: "flex", alignItems: "stretch", gap: 6,
          padding: "6px 24px", overflowX: "auto", overflowY: "hidden",
          scrollbarWidth: "none",
        }}>
          {pkg.phases.map((p, pi) => (
            <div key={p.key} style={{
              flex: `0 0 ${Math.max(160, 30 + p.resources.reduce((s, r) => s + (r.name.length || 0) * 7 + 16, 0))}px`,
              display: "flex", flexDirection: "column",
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusSm, overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "3px 8px", borderBottom: `1px solid ${tk.borderHairline}`,
                background: tk.bgPrimary,
              }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 14, height: 14, borderRadius: "50%",
                  background: activeRes?.phaseIdx === pi ? tk.bgBrandDefault : tk.bgWhite,
                  color: activeRes?.phaseIdx === pi ? tk.textReverse : tk.textSecondary,
                  fontSize: 9, fontWeight: 700,
                  border: `1px solid ${activeRes?.phaseIdx === pi ? tk.brandDefault : tk.borderHairline}`,
                  flexShrink: 0,
                }}>{pi + 1}</span>
                <div style={{
                  fontSize: 11, fontWeight: 500, color: tk.textPrimary, flex: 1, minWidth: 0,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {p.label} <span style={{ color: tk.textPlaceholder, fontWeight: 400 }}>（{p.duration}）</span>
                </div>
                <span style={{ fontSize: 12, color: tk.textPlaceholder, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>+</span>
              </div>
              <div style={{
                display: "flex", flexWrap: "nowrap", gap: 3,
                padding: "3px 6px", overflow: "hidden",
              }}>
                {p.resources.map(r => {
                  const isActive = activeRes?.phaseIdx === pi && activeRes?.resId === r.id;
                  return (
                    <button key={r.id} onClick={() => setActiveRes({ phaseIdx: pi, resId: r.id })} title={r.name} style={{
                      padding: "2px 6px", fontSize: 10, lineHeight: "14px",
                      background: isActive ? tk.bgBrandSubtle : tk.bgPrimary,
                      color: isActive ? tk.textBrand : tk.textPrimary,
                      border: `1px solid ${isActive ? tk.brandDefault : tk.borderHairline}`,
                      borderRadius: tk.radiusSm, cursor: "pointer", whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                      minWidth: 0, flexShrink: 1,
                    }}>{r.name}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => scrollBy(1)} style={{
          ...navBtn, position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
          zIndex: 5, background: tk.bgWhite, boxShadow: tk.shadowSm,
        }} title="向右滚动"><ChevronRight size={13} /></button>
      </div>

      {active ? (
        <div style={{ flex: 1, overflowY: "auto", background: tk.bgWhite }}>
          <ResBody type={active.type} preview={active.preview} name={active.name} size={active.size} />
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: tk.textPlaceholder, fontSize: 12 }}>
          请从上方选择一个资源查看预览
        </div>
      )}
    </div>
  );
}

// 按资源类型渲染内容（文档 / 视频 / 作业 / 课件 / 图片 / 音频）—— 丰满保真
function ResBody({ type, preview, name, size }: { type: string; preview: string; name?: string; size?: string }) {
  const tag = typeLabel(type);
  const TAGS_BY_TYPE: Record<string, string[]> = {
    doc: ["教学话术", "课堂互动", "八年级", "数学"],
    ppt: ["课件", "公式推导", "几何证明", "可编辑"],
    video: ["教学视频", "动画演示", "可下载", "可投屏"],
    audio: ["课堂音频", "情境引导", "可下载"],
    image: ["板书实拍", "高清原图", "可下载"],
    quiz: ["分层作业", "答案解析", "可打印", "A/B/C 组"],
  };
  const tags = TAGS_BY_TYPE[type] || [];

  // 文档头（统一：标题 + 元信息 + 标签）
  const DocHead = (
    <div style={{ marginBottom: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: tk.textPrimary, margin: 0, lineHeight: "26px" }}>{name}</h2>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: tk.textPlaceholder, marginTop: 6, flexWrap: "wrap",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 3, background: tk.bgBrandSubtle, color: tk.textBrand, fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: "16px" }}>李</span>
          李老师
        </span>
        <span>·</span>
        <span>2025-12-08 14:30 更新</span>
        <span>·</span>
        <span>已被 32 个班级使用</span>
        <span>·</span>
        <span>阅读约 {size || "3KB"}</span>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
        <span style={{
          fontSize: 10, padding: "1px 7px", borderRadius: tk.radiusFull,
          background: tk.bgBrandSubtle, color: tk.textBrand, fontWeight: 500,
        }}>{tag}</span>
        {tags.map((t, i) => (
          <span key={i} style={{
            fontSize: 10, padding: "1px 7px", borderRadius: tk.radiusFull,
            background: tk.bgPrimary, color: tk.textSecondary,
          }}>{t}</span>
        ))}
      </div>
    </div>
  );

  // 通用页脚：操作条（点赞 / 收藏 / 引用 / 下载 / 反馈 / 相关推荐）
  const DocFooter = (
    <div style={{
      marginTop: 16, paddingTop: 12, borderTop: `1px solid ${tk.borderHairline}`,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: tk.textSecondary, cursor: "pointer" }}>
          <span style={{ color: "#f43f5e" }}>♥</span> 128
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: tk.textSecondary, cursor: "pointer" }}>
          ⭐ 收藏
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: tk.textSecondary, cursor: "pointer" }}>
          🔗 引用
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: tk.textSecondary, cursor: "pointer" }}>
          ⬇ 下载
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: tk.textPlaceholder }}>
        <span>反馈</span>
        <span>·</span>
        <span>举报</span>
      </div>
    </div>
  );

  // 相关推荐
  const DocRelated = (
    <div style={{
      marginTop: 12, padding: "10px 12px", background: tk.bgPrimary, borderRadius: tk.radiusSm,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: tk.textSecondary, marginBottom: 6 }}>📎 相关资源</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {[
          { icon: "📊", name: "勾股定理证明方法合辑", meta: "课件 · 5.2MB" },
          { icon: "🎬", name: "赵爽弦图动画演示", meta: "视频 · 2分10秒" },
          { icon: "📝", name: "勾股定理基础练习 10 题", meta: "习题 · 含答案" },
        ].map((r, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "5px 8px",
            background: tk.bgWhite, borderRadius: 4, cursor: "pointer",
            fontSize: 11, color: tk.textPrimary,
          }}
            onMouseEnter={e => e.currentTarget.style.background = tk.bgBrandSubtle}
            onMouseLeave={e => e.currentTarget.style.background = tk.bgWhite}
          >
            <span>{r.icon}</span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
            <span style={{ fontSize: 10, color: tk.textPlaceholder, flexShrink: 0 }}>{r.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === "video") {
    return (
      <div style={{ padding: "14px 20px 20px" }}>
        {DocHead}
        {/* 视频播放器 */}
        <div style={{
          position: "relative", width: "100%", aspectRatio: "16/9", maxHeight: 260,
          background: "linear-gradient(135deg, #0e1116 0%, #1f2937 100%)",
          borderRadius: tk.radiusMd, overflow: "hidden", marginBottom: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.92)", color: "#0e1116",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}>▶</div>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "8px 12px", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
            display: "flex", alignItems: "center", gap: 8, color: "#fff", fontSize: 11,
          }}>
            <span>▶</span>
            <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.3)", borderRadius: 2, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "35%", background: tk.brandDefault, borderRadius: 2 }} />
              <div style={{ position: "absolute", left: "35%", top: -3, width: 9, height: 9, borderRadius: "50%", background: tk.textReverse, transform: "translateX(-50%)" }} />
            </div>
            <span>0:48 / 1:40</span>
            <span>🔊</span>
            <span>⛶</span>
          </div>
        </div>
        {/* 视频章节时间戳 */}
        <div style={{ fontSize: 11, color: tk.textPrimary, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>📑 章节</div>
          {[
            { t: "0:00", n: "开场：直角三角形三维旋转" },
            { t: "0:15", n: "公式推导（赵爽弦图动画）" },
            { t: "0:50", n: "三个生活例子：梯子/球场/角楼" },
            { t: "1:20", n: "速记口诀 + 思考题" },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", fontSize: 11, color: tk.textSecondary, cursor: "pointer" }}>
              <span style={{ color: tk.textBrand, fontWeight: 600, minWidth: 32, fontVariantNumeric: "tabular-nums" }}>{c.t}</span>
              <span style={{ flex: 1 }}>{c.n}</span>
              <span style={{ color: tk.textPlaceholder }}>▸</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 12px", background: tk.bgPrimary, borderRadius: tk.radiusSm, fontSize: 12, lineHeight: "20px", color: tk.textPrimary, marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: tk.textSecondary, marginBottom: 4 }}>📝 视频简介</div>
          {preview}
        </div>
        {DocFooter}
        {DocRelated}
      </div>
    );
  }
  if (type === "ppt") {
    return (
      <div style={{ padding: "14px 20px 20px" }}>
        {DocHead}
        {/* 幻灯片网格 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { n: 1, t: "直角三角形标注", c: "#dbeafe" },
            { n: 2, t: "公式推导（赵爽弦图）", c: "#fef3c7" },
            { n: 3, t: "典型例题：3-4-5", c: "#dcfce7" },
            { n: 4, t: "书写规范与单位", c: "#fce7f3" },
            { n: 5, t: "变式训练", c: "#e0e7ff" },
            { n: 6, t: "课堂小结", c: "#ffe4e6" },
            { n: 7, t: "作业布置", c: "#cffafe" },
            { n: 8, t: "下节预告", c: "#ede9fe" },
          ].map((s, i) => (
            <div key={i} style={{
              aspectRatio: "16/10", padding: 6,
              background: s.c, borderRadius: 4, position: "relative", cursor: "pointer",
              border: `1px solid ${tk.borderHairline}`,
            }}>
              <div style={{ position: "absolute", top: 3, left: 5, fontSize: 9, color: tk.textPlaceholder, fontWeight: 600 }}>P{s.n}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 9, color: tk.textPrimary, textAlign: "center", lineHeight: "12px" }}>{s.t}</div>
            </div>
          ))}
        </div>
        {/* 详情列表 */}
        <div style={{ padding: "10px 12px", background: tk.bgPrimary, borderRadius: tk.radiusSm, fontSize: 12, lineHeight: "20px", color: tk.textPrimary, marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: tk.textSecondary, marginBottom: 4 }}>📊 课件大纲</div>
          {preview}
        </div>
        {DocFooter}
        {DocRelated}
      </div>
    );
  }
  if (type === "image") {
    return (
      <div style={{ padding: "14px 20px 20px" }}>
        {DocHead}
        <div style={{
          width: "100%", aspectRatio: "16/10", maxHeight: 280,
          background: "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
          borderRadius: tk.radiusMd, marginBottom: 8,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
          position: "relative",
        }}>
          <span>🖼️</span>
          <div style={{
            position: "absolute", top: 8, left: 10, fontSize: 10, color: "rgba(0,0,0,0.55)",
            background: "rgba(255,255,255,0.85)", padding: "1px 6px", borderRadius: 3,
          }}>1920×1080 · 245KB</div>
          <div style={{
            position: "absolute", bottom: 8, right: 10, fontSize: 10, color: "#fff",
            background: "rgba(0,0,0,0.45)", padding: "1px 6px", borderRadius: 3,
          }}>1/3</div>
        </div>
        <div style={{ fontSize: 11, color: tk.textSecondary, textAlign: "center", marginBottom: 10 }}>
          ← 上一张 · 下一张 →
        </div>
        <div style={{ padding: "10px 12px", background: tk.bgPrimary, borderRadius: tk.radiusSm, fontSize: 12, lineHeight: "20px", color: tk.textPrimary, marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: tk.textSecondary, marginBottom: 4 }}>🖼️ 图注与说明</div>
          {preview}
        </div>
        {DocFooter}
        {DocRelated}
      </div>
    );
  }
  if (type === "audio") {
    return (
      <div style={{ padding: "14px 20px 20px" }}>
        {DocHead}
        <div style={{
          padding: "12px 14px", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          borderRadius: tk.radiusMd, marginBottom: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <button style={{
              width: 38, height: 38, borderRadius: "50%",
              background: tk.brandDefault, color: tk.textReverse, border: "none", cursor: "pointer",
              fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
            }}>▶</button>
            <div style={{ flex: 1, height: 5, background: "rgba(0,0,0,0.08)", borderRadius: 3, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "28%", background: tk.brandDefault, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 11, color: tk.textSecondary, minWidth: 60, fontVariantNumeric: "tabular-nums" }}>0:42 / 2:30</span>
          </div>
          <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: 36 }}>
            {Array.from({ length: 48 }).map((_, i) => {
              const h = 6 + Math.abs(Math.sin(i * 0.5)) * 28 + (i % 5 === 0 ? 6 : 0);
              const played = i < 48 * 0.28;
              return <div key={i} style={{ flex: 1, height: h, background: played ? tk.brandDefault : "rgba(0,0,0,0.15)", borderRadius: 1 }} />;
            })}
          </div>
        </div>
        <div style={{ padding: "10px 12px", background: tk.bgPrimary, borderRadius: tk.radiusSm, fontSize: 12, lineHeight: "20px", color: tk.textPrimary, marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: tk.textSecondary, marginBottom: 4 }}>🎵 字幕 / 转写</div>
          {preview}
        </div>
        {DocFooter}
        {DocRelated}
      </div>
    );
  }
  if (type === "quiz") {
    // 作业/练习：完整试卷（题干 + 选项 + 答案 + 解析）
    const lines = preview.split("\n").filter(l => l.trim());
    return (
      <div style={{ padding: "14px 20px 20px" }}>
        {DocHead}
        <div style={{ fontSize: 12, color: tk.textSecondary, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ padding: "1px 7px", background: tk.bgBrandSubtle, color: tk.textBrand, borderRadius: tk.radiusFull, fontSize: 10, fontWeight: 600 }}>限时 30 分钟</span>
          <span>满分 100 分</span>
          <span>·</span>
          <span>共 {lines.length} 题</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, padding: "2px 14px" }}>
          {lines.map((line, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: i < lines.length - 1 ? `1px solid ${tk.borderHairline}` : "none" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: tk.textBrand, minWidth: 24 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, lineHeight: "22px", color: tk.textPrimary, fontWeight: 500 }}>{line.replace(/^\d+[\.\)、]\s*/, "")}</span>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: tk.textPlaceholder, paddingLeft: 34, flexWrap: "wrap" }}>
                <span>难度 ★★☆</span>
                <span>知识点：勾股定理</span>
                <span style={{ color: tk.textBrand }}>答案：C</span>
                <span>分值：{5 + (i % 3) * 5} 分</span>
              </div>
            </div>
          ))}
        </div>
        {DocFooter}
        {DocRelated}
      </div>
    );
  }
  // doc：完整文档（含摘要 / 目录 / 正文 / 小标题 / 引用块）
  return (
    <div style={{ padding: "14px 20px 20px" }}>
      {DocHead}
      {/* 摘要 */}
      <div style={{
        padding: "10px 12px", background: tk.bgBrandSubtle, borderLeft: `3px solid ${tk.brandDefault}`,
        borderRadius: 4, fontSize: 12, lineHeight: "20px", color: tk.textPrimary, marginBottom: 12,
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: tk.textBrand, marginBottom: 3 }}>📌 摘要</div>
        本资源聚焦「勾股定理」的生活直觉与几何证明方法，结合实例（梯子/球场/角楼）激发兴趣，适合八年级数学第一轮新授课使用。包含 1 份教师话术、2 个生活情境、1 套公式推导示意。
      </div>
      {/* 目录 */}
      <div style={{
        padding: "8px 12px", background: tk.bgPrimary, borderRadius: tk.radiusSm,
        fontSize: 11, color: tk.textSecondary, marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: tk.textPrimary, marginBottom: 4 }}>📑 目录</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {["一、生活情境导入（1-2 分钟）", "二、回顾直角三角形（1-2 分钟）", "三、公式推导与几何证明（3-4 分钟）", "四、速记口诀与变式（1-2 分钟）", "五、本节小结与下节预告（1 分钟）"].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 11 }}>
              <span style={{ color: tk.textBrand, minWidth: 20 }}>{i + 1}.</span>
              <span style={{ flex: 1 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      {/* 正文（按 preview 文本展示，并在前后加小标题/引用） */}
      <div style={{ fontSize: 13, lineHeight: "24px", color: tk.textPrimary }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, margin: "0 0 6px" }}>一、生活情境导入</h4>
        <pre style={{
          fontSize: 13, lineHeight: "24px", color: tk.textPrimary,
          fontFamily: "var(--font-family)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: "0 0 12px",
        }}>{preview}</pre>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, margin: "12px 0 6px" }}>二、教学要点</h4>
        <ul style={{ margin: "0 0 12px 18px", padding: 0, fontSize: 12, lineHeight: "22px" }}>
          <li>强调「直角三角形」是前提条件，非直角不成立；</li>
          <li>区分「斜边 c」与「直角边 a / b」，避免符号混淆；</li>
          <li>公式 a² + b² = c² 中，c 永远是斜边；</li>
          <li>常见勾股数组：3-4-5、5-12-13、8-15-17、7-24-25。</li>
        </ul>
        <blockquote style={{
          margin: "8px 0 12px", padding: "8px 12px",
          background: tk.bgPrimary, borderLeft: `3px solid ${tk.textPlaceholder}`,
          fontSize: 12, color: tk.textSecondary, lineHeight: "22px", borderRadius: 4,
        }}>
          💡 <b>教师贴士</b>：可让学生用 4 个全等直角三角形拼成正方形，亲手验证 a² + b² = c²，比直接讲公式印象深 3 倍。
        </blockquote>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, margin: "12px 0 6px" }}>三、常见误区</h4>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: tk.textSecondary }}>
          1) 把 c² 错位放成 a²；2) 单位忘记统一（如一边用米、一边用厘米）；3) 答题漏写「c = 6 米」等结论。
        </p>
      </div>
      {DocFooter}
      {DocRelated}
    </div>
  );
}

function typeLabel(type: string) {
  return { doc: "文档", ppt: "课件", video: "视频", audio: "音频", image: "图片", quiz: "习题" }[type] || "文档";
}

// 普通资源：直接整页内容预览
function SimpleContentView({ resource }: { resource: Resource }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", maxWidth: 820, margin: "0 auto", width: "100%" }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary, margin: "0 0 12px" }}>{resource.title}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: tk.textPlaceholder, marginBottom: 16 }}>
        <span>{resource.version} · 最新</span>
        <span>·</span>
        <span>更新于 {resource.updatedAt}</span>
      </div>
      <pre style={{
        fontSize: 14, lineHeight: "24px", color: tk.textPrimary,
        fontFamily: "var(--font-family)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
      }}>{resource.body || ""}</pre>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  background: "none", border: `1px solid ${tk.borderHairline}`,
  borderRadius: tk.radiusSm, padding: "3px 5px", cursor: "pointer",
  color: tk.textPlaceholder, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
};
const iconBtn: React.CSSProperties = {
  background: "none", border: `1px solid ${tk.borderHairline}`,
  borderRadius: tk.radiusSm, padding: "4px 6px", cursor: "pointer",
  color: tk.textPlaceholder, display: "flex", alignItems: "center", flexShrink: 0,
};
const primaryBtn: React.CSSProperties = {
  background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm,
  fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
};

// ─── Canvas Panel ────────────────────────────────────────────────────────────
function CanvasPanel({ onClose, onFullscreen, isEmpty }: {
  onClose: () => void; onFullscreen: () => void; isEmpty: boolean;
}) {
  const [activeVersion, setActiveVersion] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["文件分类", "课程资源", "课堂互动", "课后作业", "请假文书"];
  const doc = CANVAS_VERSIONS[activeVersion];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: tk.bgWhite, borderLeft: `1px solid ${tk.borderHairline}` }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px", borderBottom: `1px solid ${tk.borderHairline}`,
        display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap",
      }}>
        {isEmpty ? (
          <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: tk.textPlaceholder }}>生成资料名称</span>
        ) : (
          <>
            <VersionDropdown activeIdx={activeVersion} onChange={setActiveVersion} />
            <span style={{ flex: 1, fontSize: 12, color: tk.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {doc.label}
            </span>
            <button style={{
              background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm,
              fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            }}>应用此版本</button>
            <button style={{
              background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
              padding: "4px 6px", cursor: "pointer", color: tk.textPlaceholder, display: "flex", alignItems: "center", flexShrink: 0,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = tk.textSecondary)}
              onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
            ><Share2 size={12} /></button>
            <button style={{
              background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
              padding: "4px 6px", cursor: "pointer", color: tk.textPlaceholder, display: "flex", alignItems: "center", flexShrink: 0,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = tk.textSecondary)}
              onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
            ><Download size={12} /></button>
            <button style={{
              background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
              padding: "4px 6px", cursor: "pointer", color: tk.textPlaceholder, display: "flex", alignItems: "center", flexShrink: 0,
            }}
              onClick={onFullscreen}
              onMouseEnter={e => (e.currentTarget.style.color = tk.textSecondary)}
              onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
            ><Maximize2 size={12} /></button>
          </>
        )}
        <button onClick={onClose} style={{
          background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
          padding: "4px 6px", cursor: "pointer", color: tk.textPlaceholder, display: "flex", alignItems: "center", flexShrink: 0,
        }}
          onMouseEnter={e => (e.currentTarget.style.color = tk.textSecondary)}
          onMouseLeave={e => (e.currentTarget.style.color = tk.textPlaceholder)}
        ><X size={12} /></button>
      </div>

      {isEmpty ? (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12,
          background: tk.bgPrimary, padding: tk.spacingLg,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: tk.radiusMd,
            background: tk.bgSecondary, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={18} style={{ color: tk.textPlaceholder }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: tk.textSecondary }}>正在思考中…</div>
            <div style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 4 }}>补充信息后将开始生成文档</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {[0.3, 0.6, 1].map((op, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: tk.radiusFull, background: tk.brandDefault, opacity: op }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Type tabs */}
          <div style={{ display: "flex", padding: "0 12px", borderBottom: `1px solid ${tk.borderHairline}`, overflowX: "auto" }}>
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)} style={{
                background: "none", border: "none",
                borderBottom: i === activeTab ? `2px solid ${tk.brandDefault}` : "2px solid transparent",
                color: i === activeTab ? tk.textBrand : tk.textSecondary,
                fontSize: 11, fontWeight: i === activeTab ? 600 : 400,
                padding: "7px 10px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.12s",
              }}>{t}</button>
            ))}
          </div>
          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, margin: "0 0 12px", lineHeight: "22px" }}>{doc.label}</h3>
            <pre style={{
              fontSize: 12, lineHeight: "20px", color: tk.textPrimary,
              fontFamily: "var(--font-family)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
            }}>{doc.content}</pre>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MyTA 全屏历史面板 ─────────────────────────────────────────────────────
type HistoryItem = { id: number; label: string; agent: number; completed?: boolean; summary?: string; time?: string };
type HistoryFilter = "all" | "today" | "week" | "completed";

function MyTAHistoryPanel({
  historyList,
  activeHistory,
  onClose,
  onSelect,
  onRename,
  onDelete,
}: {
  historyList: HistoryItem[];
  activeHistory: number | null;
  onClose: () => void;
  onSelect: (id: number) => void;
  onRename: (id: number, newLabel: string) => void;
  onDelete: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 过滤逻辑
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

  const filtered = historyList.filter(item => {
    // 搜索过滤
    if (search && !item.label.toLowerCase().includes(search.toLowerCase())) return false;
    // 状态过滤
    if (filter === "today") {
      const itemTime = item.time ? new Date(item.time).getTime() : 0;
      if (itemTime < today) return false;
    } else if (filter === "week") {
      const itemTime = item.time ? new Date(item.time).getTime() : 0;
      if (itemTime < weekAgo) return false;
    } else if (filter === "completed") {
      if (!item.completed) return false;
    }
    return true;
  });

  function startEdit(id: number, currentLabel: string) {
    setEditingId(id);
    setEditValue(currentLabel);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function confirmEdit() {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  }

  // 获取助手名称
  function getAgentName(agentIdx: number) {
    return MYTA_AGENTS[agentIdx]?.name || "未知";
  }

  // 格式化时间
  function formatTime(time?: string) {
    if (!time) return "";
    const d = new Date(time);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }

  return (
    <>
      {/* 历史面板覆盖整个内容区（不包括左侧边栏） */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
        zIndex: 200,
        background: tk.bgWhite, display: "flex", flexDirection: "column",
        animation: "fadeIn 0.18s ease",
      }}>
        {/* 左上角关闭按钮（箭头/历史 icon） */}
        <div style={{
          position: "absolute", top: 12, left: 16, zIndex: 10,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <button onClick={onClose} title="返回" style={{
            width: 32, height: 32, borderRadius: tk.radiusSm,
            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: tk.textSecondary,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            transition: "all 0.12s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderBrand; e.currentTarget.style.color = tk.textBrand; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = tk.borderHairline; e.currentTarget.style.color = tk.textSecondary; }}
          >
            <ArrowLeft size={15} />
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: tk.radiusFull,
            background: tk.bgPrimary, color: tk.textSecondary,
            fontSize: 12, fontWeight: 500,
          }}>
            <Clock size={12} />对话历史
          </div>
        </div>

        {/* 内容区：居中展示 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "64px 32px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* 标题行 */}
            <div style={{
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <h1 style={{
                fontSize: 28, fontWeight: 600, color: tk.textPrimary,
                margin: 0, letterSpacing: "-0.01em",
              }}>History</h1>
              <span style={{ fontSize: 13, color: tk.textPlaceholder }}>
                共 {filtered.length} 条记录
              </span>
            </div>

            {/* 搜索 + 筛选 */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
            }}>
              <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                <Search size={15} style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  color: tk.textPlaceholder,
                }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索对话历史…"
                  style={{
                    width: "100%", padding: "9px 14px 9px 36px",
                    border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
                    fontSize: 13, color: tk.textPrimary, background: tk.bgPrimary,
                    outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={e => (e.target.style.borderColor = tk.borderBrand)}
                  onBlur={e => (e.target.style.borderColor = tk.borderHairline)}
                />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {([
                  { key: "all", label: "全部" },
                  { key: "today", label: "今天" },
                  { key: "week", label: "本周" },
                  { key: "completed", label: "已完成" },
                ] as { key: HistoryFilter; label: string }[]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    style={{
                      padding: "7px 14px", borderRadius: tk.radiusSm,
                      fontSize: 12, fontWeight: 500, cursor: "pointer",
                      background: filter === f.key ? tk.bgBrandSubtle : "transparent",
                      color: filter === f.key ? tk.textBrand : tk.textSecondary,
                      border: `1px solid ${filter === f.key ? tk.borderBrand : tk.borderHairline}`,
                      transition: "all 0.12s",
                    }}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            {/* 列表 */}
            {filtered.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "80px 20px",
                color: tk.textPlaceholder, fontSize: 14,
                border: `1px dashed ${tk.borderHairline}`, borderRadius: tk.radiusMd,
              }}>
                {search ? "未找到匹配的对话历史" : "暂无对话历史"}
              </div>
            ) : (
              <div style={{
                border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusMd,
                overflow: "hidden", background: tk.bgWhite,
              }}>
                {/* 表头 */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 120px 100px 40px",
                  padding: "10px 16px",
                  background: tk.bgPrimary,
                  fontSize: 11, fontWeight: 600, color: tk.textPlaceholder,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                  borderBottom: `1px solid ${tk.borderHairline}`,
                }}>
                  <div>Name</div>
                  <div>Updated</div>
                  <div>Status</div>
                  <div></div>
                </div>

                {filtered.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 120px 100px 40px",
                      padding: "14px 16px",
                      alignItems: "center", gap: 12,
                      borderBottom: idx < filtered.length - 1 ? `1px solid ${tk.borderHairline}` : "none",
                      cursor: "pointer", transition: "background 0.1s",
                      background: activeHistory === item.id ? tk.bgBrandSubtle : "transparent",
                    }}
                    onMouseEnter={e => {
                      if (activeHistory !== item.id) e.currentTarget.style.background = tk.bgPrimary;
                    }}
                    onMouseLeave={e => {
                      if (activeHistory !== item.id) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* 名称列 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <MessageSquare size={14} style={{ flexShrink: 0, color: tk.textPlaceholder, opacity: 0.5 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        {editingId === item.id ? (
                          <input
                            ref={inputRef}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={confirmEdit}
                            onKeyDown={e => {
                              if (e.key === "Enter") confirmEdit();
                              if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: "100%", padding: "4px 8px",
                              border: `1px solid ${tk.borderBrand}`,
                              borderRadius: tk.radiusSm,
                              fontSize: 13, fontWeight: 500,
                              color: tk.textPrimary, outline: "none",
                            }}
                          />
                        ) : (
                          <div style={{
                            fontSize: 13, fontWeight: 500, color: tk.textPrimary,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>{item.label}</div>
                        )}
                        {item.summary && (
                          <div style={{
                            fontSize: 11, color: tk.textPlaceholder,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            marginTop: 2,
                          }}>{item.summary}</div>
                        )}
                      </div>
                    </div>
                    {/* 时间列 */}
                    <div style={{ fontSize: 12, color: tk.textSecondary }}>
                      {item.time ? formatTime(item.time) : "—"}
                    </div>
                    {/* 状态列 */}
                    <div>
                      {item.completed ? (
                        <span style={{
                          display: "inline-flex", padding: "2px 8px", borderRadius: tk.radiusFull,
                          fontSize: 11, fontWeight: 600, color: tk.textSuccess,
                          background: tk.bgSuccessSubtle,
                        }}>已完成</span>
                      ) : (
                        <span style={{
                          display: "inline-flex", padding: "2px 8px", borderRadius: tk.radiusFull,
                          fontSize: 11, fontWeight: 600, color: tk.textSecondary,
                          background: tk.bgPrimary,
                        }}>进行中</span>
                      )}
                    </div>
                    {/* 操作列 */}
                    <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => startEdit(item.id, item.label)}
                        title="重命名"
                        style={{
                          width: 24, height: 24, borderRadius: tk.radiusXs,
                          background: "transparent", border: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", color: tk.textPlaceholder,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = tk.bgSecondary; e.currentTarget.style.color = tk.textSecondary; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tk.textPlaceholder; }}
                      ><Edit3 size={12} /></button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="删除"
                        style={{
                          width: 24, height: 24, borderRadius: tk.radiusXs,
                          background: "transparent", border: "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", color: tk.textPlaceholder,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = tk.bgErrorSubtle; e.currentTarget.style.color = tk.textError; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tk.textPlaceholder; }}
                      ><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


// ─── 试试精彩资源 ───────────────────────────────────────────────────────────
// 资源类型标签（与我的资产分类一致）
const RESOURCE_TAGS = [
  { key: "all",     label: "全部",     color: "#5B5BD6" },
  { key: "quanan",  label: "课堂包",   color: "#5B8DEF" },
  { key: "tool",    label: "教学应用", color: "#9B6BD4" },
  { key: "chuti",   label: "习题作业", color: "#22A06B" },
  { key: "wenshu",  label: "文档课件", color: "#D88A2F" },
  { key: "weike",   label: "视频",     color: "#E55B5B" },
  { key: "other",   label: "其他",     color: "#6B7280" },
];

// 学科（筛选项）
const RESOURCE_SUBJECTS = [
  "语文", "数学", "英语", "物理", "化学",
  "生物", "历史", "地理", "政治", "科学",
  "信息科技", "道德与法治", "美术", "音乐", "体育",
];

// 年级（筛选项）
const RESOURCE_GRADES = [
  "一年级", "二年级", "三年级", "四年级", "五年级", "六年级",
  "七年级", "八年级", "九年级",
  "高一", "高二", "高三",
];

// 资源项类型（卡片展示用）
type CardResource = {
  id: string;
  title: string;
  cover: string;        // 背景渐变
  coverEmoji: string;   // 封面图标
  coverLabel: string;   // 封面角标文字
  tag: string;          // 资源类型 key (weike/quanan/chuti/wenshu/tool/other)
  tagLabel: string;     // 资源类型显示文字（与我的资产分类一致）
  subject: string;      // 学科
  grade: string;        // 年级（如：七年级、高一）
  author: string;       // 作者/教师
  views: number;        // 使用同款次数
  hot?: boolean;        // 是否热门
  desc: string;
};

// tag到分类的映射（与我的资产分类一致）
const TAG_TO_CATEGORY: Record<string, string> = {
  quanan: "课堂包",
  tool: "教学应用",
  chuti: "习题作业",
  wenshu: "文档课件",
  weike: "视频",
  other: "其他",
};

// 大量资源卡片数据（按 tag 区分）
const CARD_RESOURCES: CardResource[] = [
  // ── 微知课 ──
  { id: "wk1", title: "Module5 Smart kids 微课", cover: "linear-gradient(135deg,#FFE9A8 0%,#FFB36B 100%)", coverEmoji: "🐝", coverLabel: "Smart Kids · Grade 5", tag: "weike", tagLabel: "微知课", subject: "英语", grade: "五年级", author: "Aliceliqi", views: 5344, hot: true, desc: "小学英语五年级微课" },
  { id: "wk2", title: "《鸟的天堂》作业收集互评系统", cover: "linear-gradient(135deg,#C8E6C9 0%,#66BB6A 100%)", coverEmoji: "🌳", coverLabel: "语文·六年级", tag: "weike", tagLabel: "微知课", subject: "语文", grade: "六年级", author: "飞象用户", views: 5319, hot: true, desc: "鸟类主题观察笔记互评" },
  { id: "wk3", title: "勾股定理动画讲解微课", cover: "linear-gradient(135deg,#E3F2FD 0%,#64B5F6 100%)", coverEmoji: "📐", coverLabel: "数学·八年级", tag: "weike", tagLabel: "微知课", subject: "数学", grade: "八年级", author: "李慧", views: 4127, desc: "赵爽弦图动态证明" },
  { id: "wk4", title: "血液循环路径微课", cover: "linear-gradient(135deg,#FFCDD2 0%,#EF5350 100%)", coverEmoji: "❤️", coverLabel: "生物·七年级", tag: "weike", tagLabel: "微知课", subject: "生物", grade: "七年级", author: "王伟", views: 3958, desc: "体循环与肺循环动画" },
  { id: "wk5", title: "声波传播原理视频", cover: "linear-gradient(135deg,#D1C4E9 0%,#7E57C2 100%)", coverEmoji: "🔊", coverLabel: "物理·八年级", tag: "weike", tagLabel: "微知课", subject: "物理", grade: "八年级", author: "陈刚", views: 3620, desc: "声音三要素可视化" },
  { id: "wk6", title: "化学反应速率微课", cover: "linear-gradient(135deg,#B2DFDB 0%,#26A69A 100%)", coverEmoji: "⚗️", coverLabel: "化学·高一", tag: "weike", tagLabel: "微知课", subject: "化学", grade: "高一", author: "张丽", views: 3147, desc: "浓度/温度/催化剂影响" },
  { id: "wk7", title: "秦朝统一六国讲解", cover: "linear-gradient(135deg,#FFE0B2 0%,#FF9800 100%)", coverEmoji: "🏯", coverLabel: "历史·七年级", tag: "weike", tagLabel: "微知课", subject: "历史", grade: "七年级", author: "赵文", views: 2890, desc: "大秦崛起时间线" },
  { id: "wk8", title: "英语自然拼读速学卡", cover: "linear-gradient(135deg,#F8BBD0 0%,#EC407A 100%)", coverEmoji: "🔤", coverLabel: "英语·三年级", tag: "weike", tagLabel: "微知课", subject: "英语", grade: "三年级", author: "May老师", views: 5416, desc: "26字母发音规则" },

  // ── 智备课堂 ──
  { id: "qa1", title: "勾股定理的认识课堂包", cover: "linear-gradient(135deg,#D4E4F7 0%,#5B8DEF 100%)", coverEmoji: "📘", coverLabel: "数学·八年级", tag: "quanan", tagLabel: "智备课堂", subject: "数学", grade: "八年级", author: "小叶老师用AI", views: 5416, hot: true, desc: "勾股定理完整课堂包" },
  { id: "qa2", title: "紫藤萝瀑布教学课件", cover: "linear-gradient(135deg,#E1D5E7 0%,#9575CD 100%)", coverEmoji: "🌸", coverLabel: "语文·七年级", tag: "quanan", tagLabel: "智备课堂", subject: "语文", grade: "七年级", author: "王媛", views: 5350, desc: "散文朗读与赏析教案" },
  { id: "qa3", title: "指数函数图像与性质", cover: "linear-gradient(135deg,#FFE082 0%,#FFA726 100%)", coverEmoji: "📈", coverLabel: "数学·高一", tag: "quanan", tagLabel: "智备课堂", subject: "数学", grade: "高一", author: "李文", views: 3210, desc: "图像平移变换" },
  { id: "qa4", title: "牛顿第三定律课堂包", cover: "linear-gradient(135deg,#C5CAE9 0%,#5C6BC0 100%)", coverEmoji: "🍎", coverLabel: "物理·高一", tag: "quanan", tagLabel: "智备课堂", subject: "物理", grade: "高一", author: "王海", views: 2980, desc: "作用力与反作用力" },
  { id: "qa5", title: "中国近代史纲要课件", cover: "linear-gradient(135deg,#FFCCBC 0%,#FF7043 100%)", coverEmoji: "📜", coverLabel: "历史·八年级", tag: "quanan", tagLabel: "智备课堂", subject: "历史", grade: "八年级", author: "赵明", views: 2750, desc: "鸦片战争至五四运动" },
  { id: "qa6", title: "光合作用与呼吸作用", cover: "linear-gradient(135deg,#C8E6C9 0%,#43A047 100%)", coverEmoji: "🌿", coverLabel: "生物·七年级", tag: "quanan", tagLabel: "智备课堂", subject: "生物", grade: "七年级", author: "周林", views: 2634, desc: "光合 vs 呼吸对比" },

  // ── 习题练习 ──
  { id: "ct1", title: "小学数学黄金矿工计算练习", cover: "linear-gradient(135deg,#5D4037 0%,#8D6E63 100%)", coverEmoji: "⛏️", coverLabel: "数学·三年级", tag: "chuti", tagLabel: "习题练习", subject: "数学", grade: "三年级", author: "小叶老师用AI", views: 5416, hot: true, desc: "加减乘除游戏化练习" },
  { id: "ct2", title: "七年级英语完形填空50篇", cover: "linear-gradient(135deg,#90CAF9 0%,#42A5F5 100%)", coverEmoji: "📝", coverLabel: "英语·七年级", tag: "chuti", tagLabel: "习题练习", subject: "英语", grade: "七年级", author: "Jane", views: 4230, desc: "高频词汇+语境理解" },
  { id: "ct3", title: "高一物理力学综合卷", cover: "linear-gradient(135deg,#B39DDB 0%,#7E57C2 100%)", coverEmoji: "🧲", coverLabel: "物理·高一", tag: "chuti", tagLabel: "习题练习", subject: "物理", grade: "高一", author: "张老师", views: 3987, desc: "牛顿定律综合应用" },
  { id: "ct4", title: "语文古诗词默写练习", cover: "linear-gradient(135deg,#FFAB91 0%,#FF7043 100%)", coverEmoji: "🖋️", coverLabel: "语文·六年级", tag: "chuti", tagLabel: "习题练习", subject: "语文", grade: "六年级", author: "王媛", views: 3754, desc: "小学必背75首" },
  { id: "ct5", title: "化学反应方程式专练", cover: "linear-gradient(135deg,#80CBC4 0%,#26A69A 100%)", coverEmoji: "⚗️", coverLabel: "化学·高一", tag: "chuti", tagLabel: "习题练习", subject: "化学", grade: "高一", author: "李华", views: 3218, desc: "配平+离子方程式" },
  { id: "ct6", title: "地理等高线地形判读", cover: "linear-gradient(135deg,#A5D6A7 0%,#66BB6A 100%)", coverEmoji: "🗻", coverLabel: "地理·七年级", tag: "chuti", tagLabel: "习题练习", subject: "地理", grade: "七年级", author: "赵亮", views: 2845, desc: "五种地形判读技巧" },

  // ── 文书文件 ──
  { id: "ws1", title: "期末家长通知书", cover: "linear-gradient(135deg,#FFE0B2 0%,#FFB74D 100%)", coverEmoji: "✉️", coverLabel: "通用·期末", tag: "wenshu", tagLabel: "文书文件", subject: "通用", grade: "全部", author: "李老师", views: 5120, desc: "标准期末家长信模板" },
  { id: "ws2", title: "学生综合素质评语集", cover: "linear-gradient(135deg,#F8BBD0 0%,#EC407A 100%)", coverEmoji: "📋", coverLabel: "通用·期末", tag: "wenshu", tagLabel: "文书文件", subject: "通用", grade: "全部", author: "王老师", views: 4870, desc: "100条个性化评语" },
  { id: "ws3", title: "家长会邀请函模板", cover: "linear-gradient(135deg,#CE93D8 0%,#AB47BC 100%)", coverEmoji: "📨", coverLabel: "通用·会议", tag: "wenshu", tagLabel: "文书文件", subject: "通用", grade: "全部", author: "陈老师", views: 4321, desc: "中英双语邀请函" },
  { id: "ws4", title: "学生请假条标准格式", cover: "linear-gradient(135deg,#80DEEA 0%,#26C6DA 100%)", coverEmoji: "📄", coverLabel: "通用·日常", tag: "wenshu", tagLabel: "文书文件", subject: "通用", grade: "全部", author: "李文", views: 3654, desc: "事假/病假模板" },
  { id: "ws5", title: "教师教学反思周记", cover: "linear-gradient(135deg,#FFCC80 0%,#FFA726 100%)", coverEmoji: "✍️", coverLabel: "通用·教研", tag: "wenshu", tagLabel: "文书文件", subject: "通用", grade: "全部", author: "张丽", views: 3120, desc: "20篇范文参考" },

  // ── 教学工具 ──
  { id: "tl1", title: "教学游戏｜《西游记》取经路", cover: "linear-gradient(135deg,#FFEB3B 0%,#FBC02D 100%)", coverEmoji: "🎮", coverLabel: "语文·古诗词", tag: "tool", tagLabel: "教学工具", subject: "语文", grade: "全部", author: "飞象教研", views: 5800, hot: true, desc: "古诗词闯关游戏" },
  { id: "tl2", title: "知识点思维导图生成器", cover: "linear-gradient(135deg,#B2EBF2 0%,#00ACC1 100%)", coverEmoji: "🧠", coverLabel: "通用·导图", tag: "tool", tagLabel: "教学工具", subject: "通用", grade: "全部", author: "eduCore", views: 5344, desc: "一键生成知识树" },
  { id: "tl3", title: "英语单词卡片翻转工具", cover: "linear-gradient(135deg,#F48FB1 0%,#EC407A 100%)", coverEmoji: "🎴", coverLabel: "英语·词汇", tag: "tool", tagLabel: "教学工具", subject: "英语", grade: "全部", author: "Aliceliqi", views: 5128, desc: "课堂互动翻转卡片" },
  { id: "tl4", title: "数学公式速查手册", cover: "linear-gradient(135deg,#9FA8DA 0%,#5C6BC0 100%)", coverEmoji: "📖", coverLabel: "数学·公式", tag: "tool", tagLabel: "教学工具", subject: "数学", grade: "全部", author: "李文", views: 4987, desc: "初高中公式集合" },
  { id: "tl5", title: "班级随机点名小程序", cover: "linear-gradient(135deg,#A5D6A7 0%,#43A047 100%)", coverEmoji: "🎯", coverLabel: "通用·课堂", tag: "tool", tagLabel: "教学工具", subject: "通用", grade: "全部", author: "eduCore", views: 4321, desc: "公平随机+历史记录" },
  { id: "tl6", title: "化学元素周期表互动版", cover: "linear-gradient(135deg,#CE93D8 0%,#8E24AA 100%)", coverEmoji: "⚛️", coverLabel: "化学·高一", tag: "tool", tagLabel: "教学工具", subject: "化学", grade: "高一", author: "张老师", views: 4012, desc: "118元素互动学习" },
  { id: "tl7", title: "历史时间轴大事件工具", cover: "linear-gradient(135deg,#FFAB91 0%,#E64A19 100%)", coverEmoji: "⏳", coverLabel: "历史·通史", tag: "tool", tagLabel: "教学工具", subject: "历史", grade: "全部", author: "陈老师", views: 3765, desc: "中外历史对照轴" },
  { id: "tl8", title: "物理实验模拟沙盒", cover: "linear-gradient(135deg,#90CAF9 0%,#1976D2 100%)", coverEmoji: "🔬", coverLabel: "物理·实验", tag: "tool", tagLabel: "教学工具", subject: "物理", grade: "全部", author: "王海", views: 3540, desc: "电学/力学虚拟实验" },
];

// 资源卡片组件（精彩资源板块用）
function FeaturedResourceCard({ r, onClick }: { r: CardResource; onClick: () => void }) {
  const category = TAG_TO_CATEGORY[r.tag] || "其他";
  return (
    <div
      onClick={onClick}
      style={{
        background: tk.bgWhite, borderRadius: tk.radiusMd,
        border: `1px solid ${tk.borderHairline}`,
        overflow: "hidden", cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = tk.shadowMd;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* 封面区（图片） */}
      <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
        <img
          src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(r.title + " education")}&image_size=landscape_4_3`}
          alt={r.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.2s" }}
          onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.05)"}
          onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
        />
        <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 3 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: tk.textBrand,
            background: "rgba(255,255,255,0.95)", padding: "2px 6px",
            borderRadius: tk.radiusXs,
          }}>{r.subject}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, color: tk.textBrand,
            background: "rgba(255,255,255,0.95)", padding: "2px 6px",
            borderRadius: tk.radiusXs,
          }}>{r.grade}</span>
        </div>
        {r.hot && (
          <div style={{
            position: "absolute", top: 6, right: 6,
            background: "rgba(255,87,87,0.95)", color: "#fff",
            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <Flame size={9} /> 热门
          </div>
        )}
      </div>
      {/* 信息区 */}
      <div style={{ padding: tk.spacingSm }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: tk.textBrand,
            background: tk.bgBrandSubtle, padding: "1px 5px",
            borderRadius: tk.radiusXs,
          }}>{category}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
            {r.title}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
            <User size={10} />
            {r.author}
          </span>
          <span style={{ fontSize: 11, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
            <Copy size={10} />
            {r.views >= 10000 ? (r.views / 10000).toFixed(1) + "万" : r.views}人使用同款
          </span>
        </div>
      </div>
    </div>
  );
}

// 试试精彩资源板块
function ResourceSection({
  mode,                  // "home" | "agent"
  agentKey,              // mode=agent 时使用
  onPick,                // 点击卡片
  onPickTag,             // 点击卡片上的标签
}: {
  mode: "home" | "agent";
  agentKey?: string;
  onPick: (r: CardResource) => void;
  onPickTag?: (tag: string) => void;
}) {
  // 筛选状态：资源类型 tab + 学科 + 年级 + 搜索
  const [tag, setTag] = useState<string>("all");
  const [subject, setSubject] = useState<string>("全部");
  const [grade, setGrade] = useState<string>("全部");
  const [keyword, setKeyword] = useState("");
  const [showSubjects, setShowSubjects] = useState(false);
  const [showGrades, setShowGrades] = useState(false);

  // 标题：统一"试试精彩资源"（home 与 agent 模式都显示）
  const title = "试试精彩资源";

  // 当前可用的 tab 列表（仅 home 模式显示）
  const tabList = mode === "home" ? RESOURCE_TAGS : [];

  // 模式切换时重置
  useEffect(() => {
    setTag("all");
    setSubject("全部");
    setGrade("全部");
    setKeyword("");
    setShowSubjects(false);
    setShowGrades(false);
  }, [mode, agentKey]);

  // 过滤资源
  const filtered = CARD_RESOURCES.filter(r => {
    // home：按 tab 筛选
    if (mode === "home" && tag !== "all" && r.tag !== tag) return false;
    // agent：tab=全部时显示该 agent 全部；否则限定该类型
    if (mode === "agent" && agentKey) {
      if (tag === "all") {
        if (r.tag !== agentKey) return false;
      } else {
        if (r.tag !== tag) return false;
      }
    }
    // 学科筛选
    if (subject !== "全部" && r.subject !== subject) return false;
    // 年级筛选
    if (grade !== "全部" && r.grade !== grade) return false;
    // 关键词
    if (keyword && !(r.title.toLowerCase().includes(keyword.toLowerCase()) || r.author.includes(keyword))) return false;
    return true;
  });

  return (
    <div style={{
      width: "100%", background: tk.bgWhite, padding: "0 0 12px",
      borderTop: `1px solid ${tk.borderHairline}`,
    }}>
      {/* 标题行（吸顶）：home 模式 标题+tab+学科+年级+搜索；agent 模式 标题+学科+年级 */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: mode === "home" ? "12px 24px 8px" : "10px 24px 6px",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        position: "sticky", top: 0, zIndex: 4,
        background: `linear-gradient(to bottom, ${tk.bgWhite} 80%, rgba(255,255,255,0.95) 100%)`,
        backdropFilter: "blur(4px)",
      }}>
        {/* 标题：两种模式都显示 "试试精彩资源" */}
        <h3 style={{
          fontSize: 15, fontWeight: 600, color: tk.textPrimary,
          margin: 0, marginRight: 4, whiteSpace: "nowrap",
        }}>{title}</h3>

        {/* 仅 home 模式：tab 筛选（全部+5 个类型） */}
        {mode === "home" && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {tabList.map(t => (
              <button key={t.key} onClick={() => setTag(t.key)} style={{
                padding: "3px 11px", borderRadius: tk.radiusFull,
                background: tag === t.key ? tk.bgBrandSubtle : tk.bgWhite,
                color: tag === t.key ? tk.textBrand : tk.textSecondary,
                border: `1px solid ${tag === t.key ? tk.borderBrand : tk.borderHairline}`,
                fontSize: 12, cursor: "pointer", transition: "all 0.12s",
                fontWeight: tag === t.key ? 600 : 400,
              }}>{t.label}</button>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right Group: Subject, Grade, Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* 学科下拉（两种模式都有） */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowSubjects(s => !s); setShowGrades(false); }} style={{
              padding: "4px 10px", borderRadius: tk.radiusFull,
              background: subject !== "全部" ? tk.bgBrandSubtle : tk.bgWhite,
              color: subject !== "全部" ? tk.textBrand : tk.textSecondary,
              border: `1px solid ${subject !== "全部" ? tk.borderBrand : tk.borderHairline}`,
              fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {subject === "全部" ? "学科" : subject} <ChevronDown size={10} />
            </button>
            {showSubjects && (
              <>
                <div onClick={() => setShowSubjects(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0,
                  background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                  borderRadius: tk.radiusMd, padding: 6, zIndex: 51,
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  minWidth: 240, maxHeight: 260, overflowY: "auto",
                }}>
                  <button onClick={() => { setSubject("全部"); setShowSubjects(false); }} style={{
                    padding: "4px 8px", borderRadius: tk.radiusXs, fontSize: 12, border: "none",
                    background: subject === "全部" ? tk.bgBrandSubtle : "transparent",
                    color: subject === "全部" ? tk.textBrand : tk.textSecondary,
                    cursor: "pointer", textAlign: "left",
                  }}>全部</button>
                  {RESOURCE_SUBJECTS.map(s => (
                    <button key={s} onClick={() => { setSubject(s); setShowSubjects(false); }} style={{
                      padding: "4px 8px", borderRadius: tk.radiusXs, fontSize: 12, border: "none",
                      background: subject === s ? tk.bgBrandSubtle : "transparent",
                      color: subject === s ? tk.textBrand : tk.textSecondary,
                      cursor: "pointer", textAlign: "left",
                    }}>{s}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 年级下拉 */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowGrades(g => !g); setShowSubjects(false); }} style={{
              padding: "4px 10px", borderRadius: tk.radiusFull,
              background: grade !== "全部" ? tk.bgBrandSubtle : tk.bgWhite,
              color: grade !== "全部" ? tk.textBrand : tk.textSecondary,
              border: `1px solid ${grade !== "全部" ? tk.borderBrand : tk.borderHairline}`,
              fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {grade === "全部" ? "年级" : grade} <ChevronDown size={10} />
            </button>
            {showGrades && (
              <>
                <div onClick={() => setShowGrades(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0,
                  background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                  borderRadius: tk.radiusMd, padding: 6, zIndex: 51,
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  minWidth: 240, maxHeight: 260, overflowY: "auto",
                }}>
                  <button onClick={() => { setGrade("全部"); setShowGrades(false); }} style={{
                    padding: "4px 8px", borderRadius: tk.radiusXs, fontSize: 12, border: "none",
                    background: grade === "全部" ? tk.bgBrandSubtle : "transparent",
                    color: grade === "全部" ? tk.textBrand : tk.textSecondary,
                    cursor: "pointer", textAlign: "left",
                  }}>全部</button>
                  {RESOURCE_GRADES.map(g => (
                    <button key={g} onClick={() => { setGrade(g); setShowGrades(false); }} style={{
                      padding: "4px 8px", borderRadius: tk.radiusXs, fontSize: 12, border: "none",
                      background: grade === g ? tk.bgBrandSubtle : "transparent",
                      color: grade === g ? tk.textBrand : tk.textSecondary,
                      cursor: "pointer", textAlign: "left",
                    }}>{g}</button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 搜索框（两种模式都有） */}
          <div style={{
            background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
            borderRadius: tk.radiusSm, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 6, minWidth: 180,
          }}>
            <Search size={12} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="请输入内容"
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 12, color: tk.textPrimary, fontFamily: "var(--font-family)",
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* 卡片网格 */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: tk.textPlaceholder, fontSize: 13 }}>
            没有匹配的资源
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}>
            {filtered.map(r => (
              <FeaturedResourceCard
                key={r.id}
                r={r}
                onClick={() => {
                  if (onPickTag) onPickTag(r.tag);
                  onPick(r);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MyTA Welcome (no agent selected — default / new task) ───────────────────
function MyTAWelcome({ agentIdx, onAgentChange, onSend, input, onInputChange }: {
  agentIdx: number; onAgentChange: (i: number) => void;
  onSend: (msg: string, agentIdx: number) => void;
  input: string;
  onInputChange: (v: string) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const agent = MYTA_AGENTS[agentIdx];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: `${tk.spacingXl} ${tk.spacingLg}`,
      gap: tk.spacingLg, background: tk.bgWhite, width: "100%",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <Sparkles size={26} style={{ color: tk.brandDefault }} />
          <h1 style={{ fontSize: 28, fontWeight: 600, color: tk.textPrimary, margin: 0, lineHeight: 1.2 }}>
            {greeting}，王老师
          </h1>
        </div>
        <p style={{ fontSize: 13, color: tk.textPlaceholder, margin: 0 }}>今天有 2 节课待准备，3 份作业待批改</p>
      </div>
    </div>
  );
}

// ─── MyTA Agent-specific welcome ─────────────────────────────────────────────
function MyTAAgentWelcome({ agentIdx, onAgentChange, onSend, input, onInputChange }: {
  agentIdx: number; onAgentChange: (i: number) => void;
  onSend: (msg: string, agentIdx: number) => void;
  input: string;
  onInputChange: (v: string) => void;
}) {
  const agent = MYTA_AGENTS[agentIdx];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: `${tk.spacingXl} ${tk.spacingLg}`,
      gap: tk.spacingLg, background: tk.bgWhite, width: "100%",
    }}>
      {/* Agent identity */}
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{
          width: 52, height: 52, borderRadius: tk.radiusMd, margin: "0 auto 14px",
          background: tk.bgBrandSubtle, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 20, fontWeight: 700, color: tk.brandDefault,
          border: `1px solid ${tk.borderBrand}`,
        }}>{agent.abbr}</div>
        <h2 style={{ fontSize: 22, fontWeight: 600, color: tk.textPrimary, margin: "0 0 8px" }}>{agent.name}</h2>
        <p style={{ fontSize: 13, color: tk.textSecondary, lineHeight: "20px", margin: 0 }}>{agent.tagline}</p>
      </div>
    </div>
  );
}

// ─── MyTA Module ─────────────────────────────────────────────────────────────
function MyTA({ onNavigate, minimalMode, setMinimalMode }: { onNavigate: (m: Module) => void; minimalMode: boolean; setMinimalMode: (v: boolean) => void }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  // null = cold-start welcome (agent not yet picked from sidebar)
  // number = specific skill page (e.g. 微知课 / 全案智备 / 备授课 / 出题)
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
  // Cold-start currently-highlighted agent (default 全案智备) — used only when activeAgent === null
  const [coldAgentIdx, setColdAgentIdx] = useState(1);
  const [viewState, setViewState] = useState<"welcome" | "chat">("welcome");
  const [activeHistory, setActiveHistory] = useState<number | null>(null);
  const [historyList, setHistoryList] = useState(HISTORY_ITEMS_DEFAULT);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showSlot, setShowSlot] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [canvasEmpty, setCanvasEmpty] = useState(true);
  const [canvasLoading, setCanvasLoading] = useState(false);
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const [taskLabel, setTaskLabel] = useState("");
  const [canvasViewMode, setCanvasViewMode] = useState<"list" | "detail">("detail");
  const [isFromHistory, setIsFromHistory] = useState(false);
  // Agent 意图流程状态（通用）
  const [agentIntent, setAgentIntent] = useState<boolean>(false);
  const [agentIntentChoices, setAgentIntentChoices] = useState<string[]>([]);
  const [agentThinking, setAgentThinking] = useState<boolean>(false);
  const [agentStepIdx, setAgentStepIdx] = useState<number>(-1);
  const [agentDone, setAgentDone] = useState<boolean>(false);
  const [quananPackage, setQuananPackage] = useState<ClassPackage | null>(null);
  const [intentFlowCollapsed, setIntentFlowCollapsed] = useState<boolean>(false);
  const [thinkingCollapsed, setThinkingCollapsed] = useState<boolean>(false);
  const [quananVersions, setQuananVersions] = useState<string[]>([]);
  const [quananActiveVersion, setQuananActiveVersion] = useState(0);
  const [resourceDropdownOpen, setResourceDropdownOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(true);
  const [previewResource, setPreviewResource] = useState<CardResource | null>(null);
  const [elementSelectMode, setElementSelectMode] = useState(false);
  const [selectedModules, setSelectedModules] = useState<{ name: string; type: string; id: number }[]>([]);
  const handleRemoveModule = (id: number) => {
    setSelectedModules(prev => prev.filter(m => m.id !== id));
  };
  const panelMinimalMode = minimalMode;
  const setPanelMinimalMode = setMinimalMode;
  const [editMode, setEditMode] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [panelFullscreen, setPanelFullscreen] = useState(false);
  const [generateClassModalOpen, setGenerateClassModalOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [activeResourceIndex, setActiveResourceIndex] = useState(0);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [taskResources, setTaskResources] = useState<{ id: number; name: string; type: string; subject: string; grade: string; count: number }[]>([]);

  useEffect(() => {
    if (!resourceDropdownOpen && !moreMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.("[data-resource-dropdown]")) setResourceDropdownOpen(false);
      if (!target.closest?.("[data-more-menu]")) setMoreMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [resourceDropdownOpen, moreMenuOpen]);

  

  const sendFloating = () => {
    if (!input.trim()) return;
    const target = activeAgent ?? coldAgentIdx;
    handleSend(input, target);
    setInput("");
  };

  // 浮层 chat 显示控制：上半部分标题区滚出视口后才显示
  const welcomeTopRef = useRef<HTMLDivElement | null>(null);
  const chatHeaderRef = useRef<HTMLDivElement | null>(null);
  const [floatingChatVisible, setFloatingChatVisible] = useState(false);
  const [floatingAgentMenuOpen, setFloatingAgentMenuOpen] = useState(false);
  // 点击外部关闭下拉菜单
  useEffect(() => {
    if (!floatingAgentMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-floating-agent-menu]')) {
        setFloatingAgentMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [floatingAgentMenuOpen]);
  // welcome 视图滚动检测
  useEffect(() => {
    if (viewState !== "welcome") { setFloatingChatVisible(false); return; }
    const el = welcomeTopRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFloatingChatVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-40px 0px 0px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [viewState]);
  // chat 视图滚动检测：监听 chat-header
  useEffect(() => {
    if (viewState !== "chat") return;
    const el = chatHeaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFloatingChatVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-40px 0px 0px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [viewState]);

  const canvasDrag = useDragResize(720, 520, 1100);
  const resolvedAgent = activeAgent ?? coldAgentIdx; // null → cold-start selected agent
  const isChuti = resolvedAgent === 2;

  function handleCreateTask(resource: CardResource) {
    const tagToAgent: Record<string, number> = { weike: 0, quanan: 1, chuti: 2, wenshu: 3, tool: 1 };
    const agentIdx = tagToAgent[resource.tag] ?? 1;
    const newId = Date.now();
    setHistoryList(prev => [{ id: newId, label: resource.title, agent: agentIdx }, ...prev]);
    setActiveHistory(newId);
    setActiveAgent(agentIdx);
    setTaskLabel(resource.title);
    setMessages([{ role: "user", text: `制作同款资源：${resource.title}` }, { role: "ai", text: `好的，已为你创建「${resource.title}」同款任务。可以在此基础上继续优化或修改。` }]);
    setViewState("chat");
    setCanvasVisible(true);
    setCanvasEmpty(false);
    setCanvasLoading(false);
    setCanvasViewMode("detail");
    setIsFromHistory(false);
    setInput("");
    toastInfo(`已创建「${resource.title}」同款任务`);
  }

  function handleSend(msg: string, agentIdx: number) {
    setActiveAgent(agentIdx);
    const label = msg.slice(0, 18) + (msg.length > 18 ? "…" : "");
    const newId = Date.now();
    setHistoryList(prev => [{ id: newId, label, agent: agentIdx }, ...prev]);
    setActiveHistory(newId);
    setTaskLabel(label);
    setMessages([{ role: "user", text: msg }]);
    setViewState("chat");
    setShowSlot(false);

    // 通用流程：所有 agent 都弹出意图确认浮层，等待用户确认后再打开 canvas
    const agentKey = MYTA_AGENTS[agentIdx].key;
    const intentTemplate = INTENT_TEMPLATES[agentKey];
    const agentName = MYTA_AGENTS[agentIdx].name;
    
    setTimeout(() => {
      let aiMessage = "";
      switch (agentKey) {
        case "quanan":
          aiMessage = "好的，已为你备下《勾股定理的认识》课案。请确认想要包含的内容：";
          break;
        case "weike":
          aiMessage = `好的，我来帮你制作微课。请确认微课的具体形式：`;
          break;
        case "chuti":
          aiMessage = `好的，我来帮你出题。请确认出题条件：`;
          break;
        case "wenshu":
          aiMessage = `好的，我来帮你撰写文书。请确认文书类型：`;
          break;
        default:
          aiMessage = `好的，我来为你处理「${msg}」。请确认相关信息：`;
      }
      setMessages(prev => [...prev, { role: "ai", text: aiMessage }]);
      setAgentIntentChoices(intentTemplate?.defaultChoices || []);
      setAgentIntent(true);
    }, 500);
  }

  // 通用：启动 agent 思考流程（4 步逐步推进）
  function startAgentFlow(_values?: Record<string, any>) {
    const agentKey = MYTA_AGENTS[activeAgent!].key;
    const agentName = MYTA_AGENTS[activeAgent!].name;
    
    setAgentIntent(false);
    setAgentThinking(true);
    setAgentStepIdx(0);
    setAgentDone(false);
    setQuananPackage(null);
    setQuananVersions([]);
    setCanvasEmpty(true);
    setCanvasLoading(true);
    setCanvasVisible(true);
    setCanvasViewMode("detail");
    setIsFromHistory(false);

    const thinkingSteps = AGENT_CONFIG[agentKey]?.thinkingSteps || THINKING_STEPS;
    const delays = [700, 700, 1100, 600];
    let acc = 0;
    thinkingSteps.forEach((_, i) => {
      acc += delays[i];
      setTimeout(() => setAgentStepIdx(i), acc);
    });
    setTimeout(() => {
      setAgentThinking(false);
      setAgentDone(true);
      setTimeout(() => setThinkingCollapsed(true), 2000);
      setCanvasLoading(false);
      setCanvasEmpty(false);

      let resultMessage = "";
      let resultLabel = "";

      switch (agentKey) {
        case "quanan":
          setQuananPackage(SAMPLE_PACKAGE);
          setQuananVersions(["v1.0"]);
          setQuananActiveVersion(0);
          resultMessage = "🎓 备课任务已完成！成功生成《勾股定理的认识课堂包》\n\n" +
            "📊 资源概览：\n" +
            "• 阶段总数：4 个教学阶段\n" +
            "• 资源总量：8 份精品资源\n" +
            "• 覆盖环节：课前导入 → 新知建构 → 随堂练习 → 课后巩固\n\n" +
            "💡 使用建议：\n" +
            "1. 点击右侧资源卡片查看完整课堂包详情\n" +
            "2. 可在预览模式下调整各阶段资源顺序\n" +
            "3. 教案阶段支持独立预览和编辑优化\n" +
            "4. 建议在授课前进行一次完整的预览演练\n\n" +
            "🎯 预期教学效果：通过分层任务设计，帮助学生从感性认识到理性理解，掌握勾股定理的核心概念与应用场景。";
          resultLabel = "勾股定理的认识课堂包";
          break;
        case "weike":
          resultMessage = "🎬 微课制作任务已完成！成功生成《Unit 4 词汇精讲》\n\n" +
            "📊 内容概览：\n" +
            "• 视频时长：3 分 25 秒\n" +
            "• 呈现形式：MG动画演示\n" +
            "• 配套资源：中英文字幕 + 知识卡片\n\n" +
            "💡 使用建议：\n" +
            "1. 可作为课前预习材料，帮助学生提前熟悉词汇\n" +
            "2. 课堂上可配合讲解重点词汇的用法拓展\n" +
            "3. 课后可分享给学生进行复习巩固\n" +
            "4. 支持下载本地视频文件用于离线教学\n\n" +
            "🎯 学习目标：掌握本单元核心词汇的发音、拼写及用法，提升学生的词汇运用能力。";
          resultLabel = "Unit 4 词汇精讲微课";
          break;
        case "chuti":
          resultMessage = "📝 出题任务已完成！成功生成《八年级数学期中模拟卷》\n\n" +
            "📊 试卷概览：\n" +
            "• 题目总数：25 道\n" +
            "• 题型分布：选择题 10 题 + 填空题 5 题 + 解答题 6 题 + 应用题 4 题\n" +
            "• 难度梯度：基础题 60% · 中档题 30% · 提高题 10%\n\n" +
            "💡 使用建议：\n" +
            "1. 已包含完整答案与详细解析，方便批改和讲解\n" +
            "2. 可根据班级实际情况调整题目难度比例\n" +
            "3. 建议搭配答题卡使用，便于统计分析\n" +
            "4. 可打印纸质版或导出电子档供学生练习\n\n" +
            "🎯 测评目标：全面考察学生对本学期数学知识的掌握程度，为后续教学提供数据支撑。";
          resultLabel = "八年级数学期中模拟卷";
          break;
        case "wenshu":
          resultMessage = "📄 文书撰写任务已完成！成功生成《期末家长信》\n\n" +
            "📊 内容概览：\n" +
            "• 学期总结：回顾本学期教学成果与班级亮点\n" +
            "• 学生表现：提供个性化评价维度\n" +
            "• 假期安排：给出科学合理的学习生活建议\n" +
            "• 下学期展望：明确新学期教学规划\n\n" +
            "💡 使用建议：\n" +
            "1. 格式规范，可直接复制发送给家长\n" +
            "2. 建议根据班级实际情况进行个性化修改\n" +
            "3. 可搭配学生成绩报告一并发送\n" +
            "4. 注意发送时间，建议在期末考试结束后一周内发送\n\n" +
            "🎯 沟通目标：建立家校共育桥梁，让家长全面了解学生本学期表现，共同规划假期学习。";
          resultLabel = "期末家长信";
          break;
        default:
          resultMessage = "✅ 任务已完成！已为你生成相关内容。\n\n💡 建议：点击右侧资源卡片查看详情，如有需要可继续调整优化。";
          resultLabel = taskLabel;
      }

      const resultResource: Resource = {
        id: `res-${Date.now()}`,
        kind: agentKey === "quanan" ? "package" : agentKey === "chuti" ? "quiz" : agentKey === "weike" ? "video" : "doc",
        title: resultLabel,
        meta: agentKey === "quanan" ? `${SAMPLE_PACKAGE.phases.length} 阶段 · ${SAMPLE_PACKAGE.total} 资源` : 
              agentKey === "chuti" ? "25 道题目 · 含答案解析" : 
              agentKey === "weike" ? "3分25秒 · MG动画" : "格式规范 · 可直接使用",
        agent: agentKey as any,
        version: "v1.0",
        updatedAt: new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
        pkg: agentKey === "quanan" ? SAMPLE_PACKAGE : undefined,
      };
      setMessages(prev => [...prev, { role: "ai", text: resultMessage, resource: resultResource }]);
      setHistoryList(prev => prev.map(h => h.id === activeHistory ? { ...h, completed: true, label: resultLabel } : h));
      setTaskResources(prev => [...prev, {
        id: prev.length + 1,
        name: resultLabel,
        type: agentKey === "quanan" ? "课堂包" : agentKey === "chuti" ? "习题作业" : agentKey === "weike" ? "视频" : "文档课件",
        subject: agentKey === "quanan" ? "数学" : agentKey === "chuti" ? "数学" : agentKey === "weike" ? "英语" : "语文",
        grade: agentKey === "quanan" ? "八年级" : agentKey === "chuti" ? "八年级" : agentKey === "weike" ? "高一" : "全部",
        count: agentKey === "quanan" ? 8 : agentKey === "chuti" ? 25 : 1,
      }]);
      setActiveResourceIndex(prev => prev.length);
    }, acc + 200);
  }

  function handleChatSend() {
    if (!input.trim()) return;
    
    const agentKey = MYTA_AGENTS[resolvedAgent].key;
    const intentTemplate = INTENT_TEMPLATES[agentKey];
    
    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setShowSlot(false);

    setTimeout(() => {
      let aiMessage = "";
      switch (agentKey) {
        case "quanan":
          aiMessage = "好的，请确认本次备课的具体内容：";
          break;
        case "weike":
          aiMessage = "好的，请确认微课制作条件：";
          break;
        case "chuti":
          aiMessage = "好的，请确认出题条件：";
          break;
        case "wenshu":
          aiMessage = "好的，请确认文书类型与条件：";
          break;
        default:
          aiMessage = "好的，请确认相关信息：";
      }
      setMessages(prev => [...prev, { role: "ai", text: aiMessage }]);
      setAgentIntentChoices(intentTemplate?.defaultChoices || []);
      setAgentIntent(true);
    }, 400);
  }

  function openHistory(id: number) {
    const item = historyList.find(h => h.id === id);
    if (!item) return;
    setActiveHistory(id);
    setActiveAgent(item.agent);
    setTaskLabel(item.label);
    setIsFromHistory(true);
    setCanvasViewMode("list");
    
    const agentKey = MYTA_AGENTS[item.agent]?.key as "quanan" | "weike" | "chuti" | "wenshu" || "quanan";
    const resource: Resource = {
      id: `history-${id}`,
      kind: agentKey === "quanan" ? "package" : 
            agentKey === "weike" ? "doc" : 
            agentKey === "chuti" ? "quiz" : "doc",
      title: item.label,
      meta: "",
      agent: agentKey,
      version: "v1.0",
      updatedAt: item.time || new Date().toISOString(),
      pkg: agentKey === "quanan" ? SAMPLE_PACKAGE : undefined,
    };
    
    setMessages([
      { role: "user", text: item.label },
      { role: "ai", text: "已为你恢复上次对话，右侧可查看生成文档。", resource },
    ]);
    setViewState("chat");
    setShowSlot(false);
    setCanvasVisible(true);
    setCanvasEmpty(false);
    setCanvasLoading(false);
    if (item.completed) {
      setAgentThinking(false);
      setAgentDone(true);
      setAgentStepIdx(THINKING_STEPS.length);
      setQuananPackage(agentKey === "quanan" ? SAMPLE_PACKAGE : null);
      setTaskResources([
        { id: 1, name: "勾股定理的认识课堂包", type: "课堂包", subject: "数学", grade: "八年级", count: 12 },
        { id: 2, name: "一元二次方程的解法课堂包", type: "课堂包", subject: "数学", grade: "九年级", count: 10 },
        { id: 3, name: "Unit 4 词汇分层练习", type: "习题作业", subject: "英语", grade: "高一", count: 5 },
        { id: 4, name: "期末家长信", type: "文档课件", subject: "语文", grade: "全部", count: 1 },
        { id: 5, name: "勾股定理 1 分钟微课", type: "视频", subject: "数学", grade: "八年级", count: 1 },
        { id: 6, name: "Unit 4 单元教案", type: "文档课件", subject: "英语", grade: "高一", count: 1 },
        { id: 7, name: "期末模拟卷（数学）", type: "习题作业", subject: "数学", grade: "高三", count: 8 },
        { id: 8, name: "学生成绩评语合集", type: "其他", subject: "全部", grade: "全部", count: 1 },
      ]);
      setActiveResourceIndex(0);
    } else {
      setAgentDone(false);
      setQuananPackage(null);
      setTaskResources([]);
    }
  }

  function newTask() {
    setViewState("welcome");
    setActiveAgent(null);
    setColdAgentIdx(1); // default to 全案智备
    setActiveHistory(null);
    setMessages([]);
    setInput("");
    setShowSlot(false);
    setCanvasVisible(false);
    setCanvasEmpty(true);
    setTaskLabel("");
    setTaskResources([]);
    setActiveResourceIndex(0);
  }

  // Sidebar / AI 助教技能 click — navigates to the dedicated skill page (unchanged)
  function selectAgent(i: number) {
    setActiveAgent(i);
    setViewState("welcome");
    setActiveHistory(null);
    setMessages([]);
    setInput("");
    setShowSlot(false);
    setCanvasVisible(false);
    setCanvasEmpty(true);
    setTaskLabel("");
  }

  const SIDEBAR_W = sidebarCollapsed ? 0 : 220;

  // 历史记录操作函数
  function handleRenameHistory(id: number, newLabel: string) {
    setHistoryList(prev => prev.map(h => h.id === id ? { ...h, label: newLabel } : h));
    toast("已重命名");
  }

  function handleDeleteHistory(id: number) {
    setHistoryList(prev => prev.filter(h => h.id !== id));
    if (activeHistory === id) {
      setActiveHistory(null);
      newTask();
    }
    toast("已删除");
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative", background: tk.bgWhite }}>
      {/* ── Left Sidebar ─────────────────────────────────── */}
      {!sidebarCollapsed && !panelMinimalMode && (
        <div style={{
          width: SIDEBAR_W, flexShrink: 0,
          borderRight: `1px solid ${tk.borderHairline}`,
          background: tk.bgPrimary,
          display: "flex", flexDirection: "column",
          transition: "width 0.18s ease", overflow: "hidden", position: "relative", zIndex: 20,
        }}>
          <div style={{ padding: "10px" }}>
            <button onClick={newTask} style={{
              width: "100%", background: tk.bgWhite,
              border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
              padding: "7px 12px",
              cursor: "pointer", display: "flex", alignItems: "center",
              gap: 6, justifyContent: "flex-start",
              fontSize: 13, fontWeight: 600, color: tk.textSecondary, transition: "all 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderBrand; e.currentTarget.style.color = tk.textBrand; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = tk.borderHairline; e.currentTarget.style.color = tk.textSecondary; }}
            ><Plus size={14} />新建任务</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            <div style={{ padding: "6px 10px 3px", fontSize: 10, fontWeight: 600, color: tk.textPlaceholder, letterSpacing: "0.05em" }}>AI助教技能</div>
            {MYTA_AGENTS.map((a, i) => {
              const isActive = activeAgent === i && viewState === "welcome";
              return (
                <button key={a.key} onClick={() => selectAgent(i)} style={{
                  width: "100%", background: isActive ? tk.bgBrandSubtle : "transparent",
                  color: isActive ? tk.textBrand : tk.textSecondary,
                  border: "none", borderRadius: tk.radiusSm,
                  padding: "7px 10px",
                  cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: isActive ? 600 : 400,
                  display: "flex", alignItems: "center",
                  gap: 8, justifyContent: "flex-start",
                  transition: "all 0.1s", margin: "1px 0",
                }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = tk.bgSecondary; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: isActive ? tk.brandDefault : tk.bgSecondary,
                    color: isActive ? tk.textReverse : tk.textSecondary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                  }}>{a.abbr}</span>
                  {a.name}
                </button>
              );
            })}

            {/* 对话任务历史分组标题（右侧保留历史icon 入口） */}
            <div style={{
              padding: "10px 10px 3px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: tk.textPlaceholder, letterSpacing: "0.05em" }}>对话任务历史</div>
              <button
                onClick={() => setHistoryPanelOpen(true)}
                title="查看全部历史"
                style={{
                  width: 18, height: 18, borderRadius: tk.radiusXs,
                  background: "transparent", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: tk.textPlaceholder,
                  transition: "all 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = tk.bgSecondary; e.currentTarget.style.color = tk.textBrand; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tk.textPlaceholder; }}
              >
                <History size={11} />
              </button>
            </div>

            {/* 历史列表（始终展示，不使用展开/收起） */}
            {historyList.map(h => (
              <button key={h.id} onClick={() => openHistory(h.id)} style={{
                width: "100%",
                background: activeHistory === h.id ? tk.bgBrandSubtle : "transparent",
                color: activeHistory === h.id ? tk.textBrand : tk.textSecondary,
                border: "none", borderRadius: tk.radiusSm,
                padding: "6px 10px", cursor: "pointer", textAlign: "left",
                fontSize: 12, display: "flex", alignItems: "center", gap: 6,
                transition: "background 0.1s", margin: "1px 0",
              }}
                onMouseEnter={e => { if (activeHistory !== h.id) e.currentTarget.style.background = tk.bgSecondary; }}
                onMouseLeave={e => { if (activeHistory !== h.id) e.currentTarget.style.background = "transparent"; }}
              >
                <MessageSquare size={11} style={{ flexShrink: 0, opacity: 0.4 }} />
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Center Column ──────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: tk.bgWhite, position: "relative" }}>
        {/* 顶部操作栏：仅左上保留收起侧边栏按钮，无底边线，无独立行 */}
        {!panelMinimalMode && (
          <div style={{
            padding: "8px 12px 0",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
            position: "absolute", top: 0, left: 0, zIndex: 5,
          }}>
          {/* 收起/展开侧边栏按钮 - 左上 */}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            style={{
              width: 28, height: 28, borderRadius: tk.radiusSm,
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: tk.textPlaceholder, flexShrink: 0,
              transition: "all 0.12s",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderDefault; e.currentTarget.style.color = tk.textSecondary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = tk.borderHairline; e.currentTarget.style.color = tk.textPlaceholder; }}
          >
            {sidebarCollapsed ? <PanelRight size={14} /> : <PanelLeft size={14} />}
          </button>
        </div>
        )}

        {/* 欢迎视图内容 - 上半居中 + 下半资源板块（可滚动） */}
        {viewState === "welcome" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto" }}>
            <div
              ref={welcomeTopRef}
              style={{
                flex: "0 0 auto", minHeight: "55%",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: `${tk.spacingXl} ${tk.spacingLg}`,
                paddingBottom: 140,   /* 给底部浮层留位置 */
                gap: tk.spacingLg,
              }}
            >
              {activeAgent === null ? (
                <MyTAWelcome
                  agentIdx={coldAgentIdx}
                  onAgentChange={(i) => setColdAgentIdx(i)}
                  onSend={handleSend}
                  input={input}
                  onInputChange={setInput}
                />
              ) : (
                <MyTAAgentWelcome
                  agentIdx={activeAgent}
                  onAgentChange={selectAgent}
                  onSend={handleSend}
                  input={input}
                  onInputChange={setInput}
                />
              )}
              {/* 完整 chat 对话框：未滚动时显示；滚出后被浮层替代 */}
              {!floatingChatVisible && (
                <div style={{ width: "100%", maxWidth: 620 }}>
                  <MyTAInputBox
                    value={input}
                    onChange={setInput}
                    onSend={() => {
                      if (input.trim()) {
                        const target = activeAgent ?? coldAgentIdx;
                        handleSend(input, target);
                        setInput("");
                      }
                    }}
                    placeholder={
                      activeAgent === null
                        ? `向「${MYTA_AGENTS[coldAgentIdx].name}」描述你的教学需求…`
                        : MYTA_AGENTS[activeAgent].placeholder
                    }
                    agentIdx={activeAgent ?? coldAgentIdx}
                    onAgentChange={(i) => {
                      if (activeAgent === null) setColdAgentIdx(i);
                      else selectAgent(i);
                    }}
                    showSlotFilling={false}
                    showAgentTabs={activeAgent === null}
                    selectedModules={selectedModules}
                    onRemoveModule={(id) => setSelectedModules(prev => prev.filter(m => m.id !== id))}
                  />
                </div>
              )}
            </div>

            {/* 试试精彩资源 - 冷启动版（activeAgent=null 时显示 home 模式；否则按对应 agent 显示 agent 模式） */}
            <ResourceSection
              mode={activeAgent === null ? "home" : "agent"}
              agentKey={activeAgent === null ? undefined : MYTA_AGENTS[activeAgent].key}
              onPick={(r) => {
                setPreviewResource(r);
              }}
            />

            {/* 浮层 chat：仅在上半部分滚出视口后出现，精简小巧，无外层背景 */}
            {floatingChatVisible && (
              <div style={{
                position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
                zIndex: 50, width: "min(560px, calc(100vw - 40px))",
                background: tk.bgWhite, borderRadius: 28,
                border: `1px solid ${tk.borderDefault}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                display: "flex", alignItems: "center", gap: 6, padding: "6px 8px 6px 6px",
                transition: "opacity 0.2s, transform 0.2s",
                opacity: floatingChatVisible ? 1 : 0,
              }} data-floating-agent-menu>
                {/* 助手选择下拉 */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setFloatingAgentMenuOpen(v => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "4px 8px 4px 10px", borderRadius: 14,
                      background: tk.bgBrandSubtle, border: `1px solid ${tk.borderBrand}`,
                      color: tk.textBrand, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ fontSize: 11 }}>{MYTA_AGENTS[activeAgent ?? coldAgentIdx].abbr}</span>
                    <span>{MYTA_AGENTS[activeAgent ?? coldAgentIdx].name}</span>
                    <ChevronDown size={10} />
                  </button>
                  {floatingAgentMenuOpen && (
                    <div style={{
                      position: "absolute", bottom: "100%", left: 0, marginBottom: 6,
                      background: tk.bgWhite, borderRadius: tk.radiusMd,
                      border: `1px solid ${tk.borderDefault}`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      zIndex: 100, minWidth: 140,
                      padding: 4,
                    }}>
                      {MYTA_AGENTS.map((a, idx) => (
                        <button
                          key={a.key}
                          onClick={() => {
                            if (activeAgent === null) setColdAgentIdx(idx);
                            else selectAgent(idx);
                            setFloatingAgentMenuOpen(false);
                          }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            width: "100%", padding: "8px 12px", borderRadius: 8,
                            border: "none", background: "transparent",
                            color: (activeAgent ?? coldAgentIdx) === idx ? tk.textBrand : tk.textPrimary,
                            fontSize: 13, cursor: "pointer", textAlign: "left",
                            transition: "all 0.1s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = tk.bgPrimary}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <span style={{
                            width: 20, height: 20, borderRadius: 6,
                            background: tk.bgBrandSubtle, display: "flex",
                            alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, color: tk.brandDefault,
                          }}>{a.abbr}</span>
                          <span>{a.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFloating(); } }}
                  placeholder={
                    activeAgent === null
                      ? `向「${MYTA_AGENTS[coldAgentIdx].name}」…`
                      : "继续描述…"
                  }
                  style={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    fontSize: 14, color: tk.textPrimary, fontFamily: "var(--font-family)",
                    minWidth: 0,
                  }}
                />
                <button title="语音" style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "transparent", border: "none", color: tk.textSecondary,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = tk.textBrand}
                  onMouseLeave={e => e.currentTarget.style.color = tk.textSecondary}
                >
                  <Mic size={16} />
                </button>
                <button
                  onClick={sendFloating}
                  disabled={!input.trim()}
                  title="发送"
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: input.trim() ? tk.brandDefault : tk.bgSecondary,
                    color: input.trim() ? tk.textReverse : tk.textPlaceholder,
                    border: "none", cursor: input.trim() ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.12s",
                  }}
                >
                  <SendHorizonal size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chat 视图内容 */}
        {viewState === "chat" && (
          <>
            {/* Chat header */}
            <div style={{
              padding: "10px 20px", borderBottom: `1px solid ${tk.borderHairline}`,
              display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
            }}>
              {/* 历史icon 按钮 - 标题栏最左侧 */}
              <button
                onClick={() => setHistoryPanelOpen(true)}
                title="查看历史对话"
                style={{
                  width: 28, height: 28, borderRadius: tk.radiusSm,
                  background: "transparent", border: `1px solid ${tk.borderHairline}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: tk.textPlaceholder, flexShrink: 0,
                  transition: "all 0.12s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderDefault; e.currentTarget.style.color = tk.textSecondary; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = tk.borderHairline; e.currentTarget.style.color = tk.textPlaceholder; }}
              >
                <History size={14} />
              </button>

              <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {taskLabel || MYTA_AGENTS[resolvedAgent].name}
              </span>
              {/* Re-open canvas button — only when canvas closed */}
              {!canvasVisible && (
                <button onClick={() => { setCanvasVisible(true); setCanvasEmpty(false); setCanvasViewMode("detail"); }} style={{
                  background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
                  borderRadius: tk.radiusSm, padding: "4px 10px",
                  fontSize: 11, color: tk.textSecondary, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderBrand; e.currentTarget.style.color = tk.textBrand; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = tk.borderHairline; e.currentTarget.style.color = tk.textSecondary; }}
                >
                  <ChevronLeft size={11} /> 展开文档
                </button>
              )}
            </div>

            {/* Messages — 可滚动；下方加资源推荐板块（一起滚动） */}
            <div style={{ flex: 1, overflowY: "auto", padding: `${tk.spacingLg} ${tk.spacingXl}` }}>
              <div style={{ maxWidth: 580, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 10 }}>
                    <div style={{
                      background: m.role === "user" ? tk.bgSecondary : "transparent",
                      color: tk.textPrimary,
                      borderRadius: m.role === "user" ? tk.radiusMd : 0,
                      padding: m.role === "user" ? "10px 14px" : "2px 0",
                      fontSize: 14, lineHeight: "22px", maxWidth: "82%",
                      whiteSpace: "pre-wrap",
                    }}>
                      {m.role === "ai" && (agentThinking || agentDone) && i === messages.length - 1 && (
                        <div style={{ marginBottom: 12 }}>
                          <ThinkingFlowMessage
                            agentKey={MYTA_AGENTS[resolvedAgent].key as any}
                            thinking={agentThinking}
                            thinkingIdx={agentStepIdx}
                            thinkingDone={agentDone}
                            thinkingSteps={AGENT_CONFIG[MYTA_AGENTS[resolvedAgent].key]?.thinkingSteps || THINKING_STEPS}
                            collapsed={thinkingCollapsed}
                            onToggleCollapsed={() => setThinkingCollapsed(v => !v)}
                          />
                        </div>
                      )}
                      {m.text}
                      {m.resource && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                          <ChatResourceCard 
                            resource={m.resource} 
                            onClick={() => {
                              setCanvasVisible(true);
                              setCanvasEmpty(false);
                              setCanvasLoading(false);
                              setCanvasViewMode("detail");
                              setIsFromHistory(false);
                              if (m.resource.kind === "package" && m.resource.pkg) {
                                setQuananPackage(m.resource.pkg);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input — 常驻底部浮层（滚动时不动） */}
            <div style={{
              position: "sticky", bottom: 0, left: 0, right: 0,
              padding: `12px ${tk.spacingXl} ${tk.spacingLg}`,
              maxWidth: 580 + 80, width: "100%", margin: "0 auto",
              boxSizing: "border-box" as const,
              background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, ${tk.bgWhite} 30%)`,
              zIndex: 10,
            }}>
              <IntentFlowCard
                agentKey={MYTA_AGENTS[resolvedAgent].key as any}
                intent={agentIntent}
                onCancelIntent={() => setAgentIntent(false)}
                onConfirmIntent={(vals) => startAgentFlow(vals)}
              />
              <MyTAInputBox
                value={input} onChange={setInput}
                onSend={handleChatSend}
                placeholder="继续描述你的需求…"
                agentIdx={resolvedAgent} onAgentChange={(i) => setActiveAgent(i)}
                showSlotFilling={showSlot}
                selectedModules={selectedModules}
                onRemoveModule={(id) => setSelectedModules(prev => prev.filter(m => m.id !== id))}
              />
            </div>
          </>
        )}
      </div>

      {/* ── 历史记录侧边面板（覆盖在右侧） ───────────────── */}
      {historyPanelOpen && (
        <MyTAHistoryPanel
          historyList={historyList}
          activeHistory={activeHistory}
          onClose={() => setHistoryPanelOpen(false)}
          onSelect={(id) => { openHistory(id); setHistoryPanelOpen(false); }}
          onRename={handleRenameHistory}
          onDelete={handleDeleteHistory}
        />
      )}

      {/* ── Drag handle + Canvas Panel ──────────────────────── */}
      {canvasVisible && !canvasFullscreen && (
        <>
          {/* Drag handle on left edge of canvas */}
          <div
            onMouseDown={canvasDrag.onMouseDown}
            style={{
              width: 6, flexShrink: 0, cursor: "col-resize", zIndex: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent",
            }}
          >
            <div style={{ width: 2, height: 40, borderRadius: 2, background: tk.borderDefault, opacity: 0.35 }} />
          </div>
          <div style={{ width: canvasDrag.width, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {canvasLoading ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", background: tk.bgWhite }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: tk.bgBrandSubtle, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Loader2 size={24} style={{ color: tk.textBrand, animation: "spin 1s linear infinite" }} />
                </div>
                <div style={{ fontSize: 14, color: tk.textSecondary, fontWeight: 500 }}>
                  {AGENT_CONFIG[MYTA_AGENTS[resolvedAgent].key]?.loadingMessage || "正在处理..."}
                </div>
                <div style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 4 }}>
                  {AGENT_CONFIG[MYTA_AGENTS[resolvedAgent].key]?.loadingSubtitle || "请稍候"}
                </div>
              </div>
            ) : canvasViewMode === "list" ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: tk.bgPrimary }}>
                <div style={{ background: tk.bgWhite, padding: "12px 16px", borderBottom: `1px solid ${tk.borderHairline}`, flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>任务资源目录</div>
                      <div style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 2 }}>
                        共 {taskResources.length} 份资源（{taskResources.filter(r => r.type === "课堂包").length}个课堂包、{taskResources.filter(r => r.type === "习题作业").length}份作业、{taskResources.filter(r => r.type === "文档课件").length}份文档、{taskResources.filter(r => r.type === "视频").length}个视频）
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 11, color: tk.textPlaceholder, background: tk.bgSecondary, padding: "4px 8px", borderRadius: tk.radiusSm }}>
                        以下资源均已存入"我的资产"中，可随时查看
                      </div>
                      <button onClick={() => setCanvasVisible(false)} style={{
                        width: 28, height: 28, borderRadius: tk.radiusSm,
                        background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: tk.textSecondary,
                      }} onMouseEnter={e => e.currentTarget.style.borderColor = tk.borderDefault} onMouseLeave={e => e.currentTarget.style.borderColor = tk.borderHairline}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {taskResources.map((res, idx) => (
                      <div 
                        key={res.id} 
                        onClick={() => { setActiveResourceIndex(idx); setCanvasViewMode("detail"); }}
                        style={{
                          background: tk.bgWhite, borderRadius: tk.radiusMd,
                          border: `1px solid ${tk.borderHairline}`, overflow: "hidden",
                          cursor: "pointer", transition: "all 0.15s",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = tk.borderBrand;
                          e.currentTarget.style.boxShadow = tk.shadowMd;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = tk.borderHairline;
                          e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
                        }}
                      >
                        <div style={{ height: 120, overflow: "hidden", position: "relative" }}>
                          <img 
                            src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(res.name + " education resource " + res.type + " thumbnail")}&image_size=square`} 
                            alt="" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                          />
                          <div style={{
                            position: "absolute", top: 8, left: 8,
                            background: tk.bgBrandSubtle, color: tk.textBrand,
                            fontSize: 10, padding: "2px 6px", borderRadius: 4,
                            fontWeight: 500,
                          }}>{res.type}</div>
                          <div style={{
                            position: "absolute", top: 8, right: 8,
                            background: tk.bgWhite, color: tk.textSecondary,
                            fontSize: 10, padding: "2px 6px", borderRadius: 4,
                            fontWeight: 500,
                          }}>{res.subject} · {res.grade}</div>
                        </div>
                        <div style={{ padding: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {res.name}
                          </div>
                          <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 4 }}>
                            更新时间：{res.count}个资源
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ background: tk.bgWhite, padding: "8px 12px", borderBottom: `1px solid ${tk.borderHairline}`, flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      <div style={{ position: "relative" }} data-resource-dropdown>
                        <IconTip label="资源目录">
                          <button onClick={() => setResourceDropdownOpen(!resourceDropdownOpen)} style={{
                            width: 32, height: 32, borderRadius: tk.radiusSm,
                            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            color: tk.textSecondary,
                          }}>
                            <Layers size={16} />
                          </button>
                        </IconTip>
                        {resourceDropdownOpen && (
                          <div style={{
                            position: "absolute", top: "100%", left: 0, marginTop: 4,
                            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                            borderRadius: tk.radiusMd, boxShadow: tk.shadowMd,
                            width: 280, zIndex: 100,
                          }}>
                            <div style={{ padding: "8px 12px", borderBottom: `1px solid ${tk.borderHairline}`, fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>
                              本任务资源（共 {taskResources.length} 个）
                            </div>
                            {taskResources.map((res, idx) => (
                              <button key={res.id} onClick={() => {
                                setActiveResourceIndex(idx);
                                setResourceDropdownOpen(false);
                              }} style={{
                                width: "100%", padding: "10px 12px",
                                border: "none", background: "transparent",
                                cursor: "pointer", textAlign: "left",
                                display: "flex", flexDirection: "column", gap: 4,
                              }} onMouseEnter={e => e.currentTarget.style.background = tk.bgSecondary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{
                                    width: 48, height: 28, borderRadius: 4,
                                    background: tk.bgSecondary, overflow: "hidden",
                                  }}>
                                    <img src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(res.name + " education resource thumbnail")}&image_size=square`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: tk.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      {res.name}
                                    </div>
                                    <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                                      <span style={{ fontSize: 10, color: tk.textPlaceholder }}>{res.type}</span>
                                      <span style={{ fontSize: 10, color: tk.textPlaceholder }}>{res.subject}</span>
                                      <span style={{ fontSize: 10, color: tk.textPlaceholder }}>{res.grade}</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => setCanvasViewMode("list")} style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          padding: "4px", borderRadius: tk.radiusXs,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: tk.textSecondary, flexShrink: 0,
                        }} onMouseEnter={e => e.currentTarget.style.background = tk.bgSecondary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <ArrowLeft size={14} />
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {taskResources[activeResourceIndex]?.name || "勾股定理的认识课堂包"}
                          </div>
                          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 2 }}>
                            <span style={{ fontSize: 11, color: tk.textPlaceholder }}>{taskResources[activeResourceIndex]?.subject || "数学"}</span>
                            <span style={{ fontSize: 11, color: tk.textPlaceholder }}>{taskResources[activeResourceIndex]?.grade || "八年级"}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px", background: tk.bgSecondary, borderRadius: tk.radiusSm }}>
                        <button onClick={() => setActiveResourceIndex(prev => Math.max(0, prev - 1))} style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          padding: "4px 6px", borderRadius: tk.radiusXs,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <ChevronLeft size={14} style={{ color: tk.textSecondary }} />
                        </button>
                        <span style={{ fontSize: 11, color: tk.textPlaceholder, minWidth: 40, textAlign: "center" }}>{activeResourceIndex + 1} / {taskResources.length}</span>
                        <button onClick={() => setActiveResourceIndex(prev => Math.min(taskResources.length - 1, prev + 1))} style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          padding: "4px 6px", borderRadius: tk.radiusXs,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <ChevronRight size={14} style={{ color: tk.textSecondary }} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <div style={{ position: "relative" }} data-more-menu>
                        <IconTip label="更多">
                          <button onClick={() => setMoreMenuOpen(!moreMenuOpen)} style={{
                            width: 28, height: 28, borderRadius: tk.radiusSm,
                            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            color: tk.textSecondary,
                          }}>
                            <MoreHorizontal size={14} />
                          </button>
                        </IconTip>
                        {moreMenuOpen && (
                          <div style={{
                            position: "absolute", top: "100%", right: 0, marginTop: 4,
                            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                            borderRadius: tk.radiusMd, boxShadow: tk.shadowMd,
                            width: 160, zIndex: 100,
                          }}>
                            <button onClick={() => { toastInfo("已复制分享链接"); setMoreMenuOpen(false); }} style={{
                              width: "100%", padding: "10px 12px",
                              border: "none", background: "transparent",
                              cursor: "pointer", textAlign: "left",
                              fontSize: 12, color: tk.textPrimary,
                              display: "flex", alignItems: "center", gap: 8,
                            }} onMouseEnter={e => e.currentTarget.style.background = tk.bgSecondary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <Share2 size={14} /> 分享链接
                            </button>
                            <button onClick={() => { toastInfo("正在重新生成..."); setMoreMenuOpen(false); }} style={{
                              width: "100%", padding: "10px 12px",
                              border: "none", background: "transparent",
                              cursor: "pointer", textAlign: "left",
                              fontSize: 12, color: tk.textPrimary,
                              display: "flex", alignItems: "center", gap: 8,
                            }} onMouseEnter={e => e.currentTarget.style.background = tk.bgSecondary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <RefreshCw size={14} /> 重新生成
                            </button>
                            <button onClick={() => { toastInfo("已删除资源"); setMoreMenuOpen(false); }} style={{
                              width: "100%", padding: "10px 12px",
                              border: "none", background: "transparent",
                              cursor: "pointer", textAlign: "left",
                              fontSize: 12, color: tk.textDanger,
                              display: "flex", alignItems: "center", gap: 8,
                            }} onMouseEnter={e => e.currentTarget.style.background = tk.bgSecondary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <Trash2 size={14} /> 删除
                            </button>
                          </div>
                        )}
                      </div>

                      <IconTip label={tocOpen ? "关闭目录" : "目录"}>
                        <button onClick={() => setTocOpen(!tocOpen)} style={{
                          width: 28, height: 28, borderRadius: tk.radiusSm,
                          background: tocOpen ? tk.bgBrandSubtle : tk.bgWhite,
                          border: tocOpen ? `1px solid ${tk.borderBrand}` : `1px solid ${tk.borderHairline}`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: tocOpen ? tk.textBrand : tk.textSecondary,
                        }}>
                          <List size={14} />
                        </button>
                      </IconTip>

                      <IconTip label={elementSelectMode ? "退出元素选择" : "元素选择"}>
                        <button onClick={() => {
                          const newMode = !elementSelectMode;
                          setElementSelectMode(newMode);
                          if (newMode) {
                            toastInfo("已进入元素选择模式，选择模块精确调整");
                          }
                        }} style={{
                          width: 28, height: 28, borderRadius: tk.radiusSm,
                          background: elementSelectMode ? tk.bgBrandSubtle : tk.bgWhite,
                          border: elementSelectMode ? `1px solid ${tk.borderBrand}` : `1px solid ${tk.borderHairline}`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: elementSelectMode ? tk.textBrand : tk.textSecondary,
                        }}>
                          <Pointer size={14} />
                        </button>
                      </IconTip>

                      <IconTip label={panelMinimalMode ? "退出精简模式" : "精简模式"}>
                        <button onClick={() => setPanelMinimalMode(!panelMinimalMode)} style={{
                          width: 28, height: 28, borderRadius: tk.radiusSm,
                          background: panelMinimalMode ? tk.bgBrandSubtle : tk.bgWhite,
                          border: panelMinimalMode ? `1px solid ${tk.borderBrand}` : `1px solid ${tk.borderHairline}`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: panelMinimalMode ? tk.textBrand : tk.textSecondary,
                        }}>
                          <PanelLeft size={14} />
                        </button>
                      </IconTip>

                      <IconTip label={editMode ? "退出编辑" : "编辑"}>
                        <button onClick={() => setEditMode(!editMode)} style={{
                          width: 28, height: 28, borderRadius: tk.radiusSm,
                          background: editMode ? tk.bgBrandSubtle : tk.bgWhite,
                          border: editMode ? `1px solid ${tk.borderBrand}` : `1px solid ${tk.borderHairline}`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: editMode ? tk.textBrand : tk.textSecondary,
                        }}>
                          <Edit3 size={14} />
                        </button>
                      </IconTip>

                      <div style={{ width: 1, height: 20, background: tk.borderHairline, margin: "0 4px" }} />

                      <button onClick={() => setGenerateClassModalOpen(true)} style={{
                        background: tk.brandDefault, border: "none",
                        borderRadius: tk.radiusSm, padding: "6px 12px",
                        fontSize: 12, fontWeight: 600, color: tk.textReverse, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <Sparkles size={12} /> 生成课堂
                      </button>

                      <div style={{ width: 1, height: 20, background: tk.borderHairline, margin: "0 4px" }} />

                      <IconTip label="关闭">
                        <button onClick={() => setCanvasVisible(false)} style={{
                          width: 28, height: 28, borderRadius: tk.radiusSm,
                          background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          color: tk.textSecondary,
                        }}>
                          <X size={14} />
                        </button>
                      </IconTip>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <ClassPackageViewer 
                    pkg={quananPackage} 
                    mode={editMode ? "edit" : "preview"}
                    externalPhasesCollapsed={!tocOpen}
                    onPhasesCollapsedChange={(collapsed) => setTocOpen(!collapsed)}
                    onModulesChange={(mod) => setSelectedModules(prev => [...prev, mod])}
                    elementSelectMode={elementSelectMode}
                    onFullscreen={() => setPanelFullscreen(true)}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}


      {/* ── Generate Class Modal ────────────────────────────── */}
      {generateClassModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setGenerateClassModalOpen(false)}>
          <div style={{
            background: tk.bgWhite, borderRadius: tk.radiusLg,
            padding: "24px", width: 420, maxWidth: "90%",
            boxShadow: tk.shadowLg,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary }}>新建课堂</div>
              <button onClick={() => setGenerateClassModalOpen(false)} style={{
                background: "none", border: "none", cursor: "pointer",
                width: 28, height: 28, borderRadius: tk.radiusSm,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: tk.textPlaceholder,
              }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: tk.textSecondary, marginBottom: 6 }}>课堂名称</div>
                <input 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="请输入课堂名称"
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm,
                    fontSize: 13, color: tk.textPrimary,
                    outline: "none", fontFamily: "inherit",
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: tk.textSecondary, marginBottom: 6 }}>关联资源</div>
                <div style={{
                  padding: "12px", background: tk.bgSecondary,
                  borderRadius: tk.radiusSm, fontSize: 13, color: tk.textPrimary,
                }}>
                  {taskResources[activeResourceIndex]?.name || "勾股定理的认识课堂包"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 24 }}>
              <button onClick={() => setGenerateClassModalOpen(false)} style={{
                padding: "8px 16px", border: `1px solid ${tk.borderDefault}`,
                borderRadius: tk.radiusSm, fontSize: 13,
                color: tk.textSecondary, background: tk.bgWhite,
                cursor: "pointer",
              }}>
                取消
              </button>
              <button onClick={() => {
                dispatchToast("已生成课堂，可进入SparkClass我的课堂查看", "success", () => {
                  onNavigate("sparkclass");
                }, "去查看");
                setGenerateClassModalOpen(false);
                setClassName("");
              }} style={{
                padding: "8px 16px", border: "none",
                borderRadius: tk.radiusSm, fontSize: 13,
                color: tk.textReverse, background: tk.brandDefault,
                cursor: "pointer", fontWeight: 500,
              }}>
                确认生成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toggle Button when Canvas Closed ────────────────── */}
      

      {/* ── MyTA Resource Preview Modal ──────────────────────── */}
      {previewResource && (
        <MyTAResourcePreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
          onCreateTask={handleCreateTask}
        />
      )}
    </div>
  );
}


// ─── SparkClass Data ─────────────────────────────────────────────────────────
type ClassItem = {
  id: number; title: string; desc: string; subject: string;
  grade: string; teacher: string; time: string; duration: number;
  status: "active" | "pending" | "done";
  // 扩展字段：用于今日高亮 / 学年归属 / 周次计算
  date?: string;        // YYYY-MM-DD
  weekDay?: number;     // 1-7 (周一-周日)
  period?: number;      // 1-4 / 5-8 (对应第几节)
  isToday?: boolean;
  deletedAt?: string;   // 删除时间（用于回收站）
};
const CLASS_DATA: ClassItem[] = [
  // 今日（2026-06-22 周一）— 含进行中 + 待授课两个课堂包
  { id: 1, title: "《Unit 4 Nature》精读课", desc: "重点词汇与阅读策略训练，课堂互动丰富", subject: "英语", grade: "高一(3)班", teacher: "王老师", time: "2026-06-22 10:00", duration: 45, status: "active",  date: "2026-06-22", weekDay: 1, period: 2, isToday: true },
  { id: 2, title: "《Unit 4 Nature》精读课", desc: "同主题第二课时，侧重写作输出", subject: "英语", grade: "高一(4)班", teacher: "王老师", time: "2026-06-22 14:00", duration: 45, status: "pending", date: "2026-06-22", weekDay: 1, period: 6, isToday: true },
  // 本周（周二-周五）
  { id: 3, title: "《Unit 3 Travel》写作课", desc: "旅行主题作文结构搭建", subject: "英语", grade: "高一(2)班", teacher: "王老师", time: "2026-06-23 09:00", duration: 45, status: "pending", date: "2026-06-23", weekDay: 2, period: 1 },
  { id: 4, title: "《Unit 3 Travel》写作课", desc: "强化段落逻辑与衔接词运用", subject: "英语", grade: "高一(1)班", teacher: "王老师", time: "2026-06-23 11:00", duration: 45, status: "pending", date: "2026-06-23", weekDay: 2, period: 4 },
  { id: 5, title: "《Unit 2 Work》听力课", desc: "职业类词汇与听力技巧", subject: "英语", grade: "高一(3)班", teacher: "王老师", time: "2026-06-24 14:00", duration: 45, status: "pending", date: "2026-06-24", weekDay: 3, period: 6 },
  { id: 6, title: "《Unit 1 Seasons》口语课", desc: "季节与天气表达输出训练", subject: "英语", grade: "高一(1)班", teacher: "王老师", time: "2026-06-25 10:00", duration: 45, status: "pending", date: "2026-06-25", weekDay: 4, period: 3 },
  { id: 7, title: "《Unit 1 Seasons》口语课", desc: "口语对话练习 + 录音点评", subject: "英语", grade: "高一(4)班", teacher: "王老师", time: "2026-06-26 09:00", duration: 45, status: "pending", date: "2026-06-26", weekDay: 5, period: 1 },
  // 历史已授课
  { id: 8, title: "《Unit 4 Nature》精读课", desc: "重点词汇与阅读策略训练", subject: "英语", grade: "高一(1)班", teacher: "王老师", time: "2026-06-15 10:00", duration: 45, status: "done" },
  { id: 9, title: "《Unit 3 Travel》写作课", desc: "旅行主题作文结构搭建", subject: "英语", grade: "高一(3)班", teacher: "王老师", time: "2026-06-12 14:00", duration: 45, status: "done" },
  { id: 10, title: "《Unit 2 Work》听力课", desc: "职业类词汇与听力技巧", subject: "英语", grade: "高一(2)班", teacher: "王老师", time: "2026-06-10 09:00", duration: 45, status: "done" },
  // 补足 done / active 池，供课表引用，避免状态错位
  { id: 11, title: "勾股定理应用题练习", desc: "经典勾股应用题精讲",     subject: "数学", grade: "六年级(2)班", teacher: "王老师", time: "2026-06-11 10:00", duration: 45, status: "done"   },
  { id: 12, title: "Unit 5 词汇精讲",     desc: "重点词汇辨析与搭配",     subject: "英语", grade: "高一(2)班", teacher: "王老师", time: "2026-06-22 14:00", duration: 45, status: "active" },
  { id: 13, title: "Unit 3 写作强化",     desc: "段落衔接与高级句型",     subject: "英语", grade: "高一(1)班", teacher: "王老师", time: "2026-06-13 09:00", duration: 45, status: "done"   },
];
// 回收站数据（已删除的课堂包）
const DELETED_CLASSES: ClassItem[] = [
  { id: 101, title: "《第三单元 进攻强化》", desc: "段落衔接与高级句型", subject: "英语", grade: "高一(1)班", teacher: "王老师", time: "2026-06-13 09:00", duration: 45, status: "done", deletedAt: "2026-06-20 15:30" },
  { id: 102, title: "《第二单元工作》听力课", desc: "职业类词汇与听力技巧", subject: "英语", grade: "高二(2)班", teacher: "王老师", time: "2026-06-10 09:00", duration: 45, status: "done", deletedAt: "2026-06-18 10:20" },
  { id: 103, title: "《Unit 1 入门》口语课", desc: "基础日常对话练习", subject: "英语", grade: "高一(3)班", teacher: "王老师", time: "2026-06-08 14:00", duration: 45, status: "done", deletedAt: "2026-06-15 09:45" },
];
// 我所教的班级（去重）
const MY_GRADES = Array.from(new Set(CLASS_DATA.map(c => c.grade)));
// 当前学年段
const CURRENT_TERM = "2025-2026 春季学期";

// ─── 共享课堂包数据（ClassDetailPage、TeachingMode、MyTA第三栏共用同一份数据）────────────────
type ClassPackageSection = { heading: string; body: string; image?: string; imageCaption?: string };
type ClassPackageChapter = { time: string; title: string };
type ClassPackageAttachment = { name: string; size: string; type: string };
type ClassPackageRes = {
  id: string;
  type: "PPT" | "教案" | "视频" | "练习" | "作业" | "文档" | "音频" | "图片" | "网页";
  name: string;
  summary: string;
  tags: string[];
  thumb?: string;
  toc?: string[];
  sections?: ClassPackageSection[];
  pages?: { title: string; content?: string; image?: string; layout?: "title" | "content" | "image" | "split" }[];
  chapters?: ClassPackageChapter[];
  questions?: { id: number; question: string; options: string[]; answer: number | number[]; type: string; explanation?: string }[];
  content?: string;
  images?: { url: string; caption: string }[];
  attachments?: ClassPackageAttachment[];
  audio?: { url: string; duration: string };
  videoUrl?: string;
  webpageUrl?: string;
  teachingNotes?: string;
};
type ClassPackagePhase = {
  num: number;
  title: string;
  subtitle: string;
  duration: string;
  resIdx: number[];
};
const CLASS_PACKAGE_RESOURCES: ClassPackageRes[] = [
  { id: "r0",  type: "PPT",  name: "趣味问答",            summary: "一个提问页，通过趣味问题引发学生思考，激发学习兴趣。", tags: ["课件", "互动", "问答"], thumb: "❓", teachingNotes: "同学们，请看这道趣味题目！有一个梯子斜靠在墙上，梯子底部离墙6米，梯子总长10米。谁能告诉我梯子顶端离地面有多高呢？给大家30秒时间思考一下！\n\n提示：可以想象梯子、墙和地面形成了一个什么形状？如果用a表示梯子底部到墙的距离，b表示梯子顶端到地面的高度，c表示梯子长度，那么它们之间有什么关系呢？这就是我们今天要学习的核心内容！", pages: [
    { title: "趣味问答", content: "八年级数学 · 勾股定理", layout: "title", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20math%20education%20slide%20with%20geometric%20shapes%20and%20question%20marks&image_size=landscape_16_9" },
    { title: "提问：梯子问题", content: "梯子斜靠在墙上，离墙 6 米，梯子长 10 米，问梯子顶端离地多高？", layout: "split", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ladder%20leaning%20against%20wall%20geometry%20problem%20illustration&image_size=square" },
  ] },
  { id: "r1",  type: "图片", name: "课前思考",            summary: "一张趣味图片，引发学生对直角三角形边长关系的直觉思考。", tags: ["图片", "情境", "思考"], thumb: "🖼️", teachingNotes: "请观察这幅图，图中有一个直角三角形。大家有没有发现什么特别的关系？如果我们知道两条直角边的长度，能不能算出斜边的长度呢？\n\n仔细观察，在直角三角形的三条边上都有一个正方形。这三个正方形的面积之间有什么关系？对，两条直角边上的正方形面积之和等于斜边上的正方形面积！这就是勾股定理的几何意义。", images: [
    { url: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20right%20triangle%20geometry%20education%20playful%20illustration&image_size=landscape_16_9", caption: "直角三角形的奥秘" },
  ] },
  { id: "r2",  type: "视频", name: "课前引导",            summary: "1 分钟短视频，快速引入本节课主题，激发学习兴趣。", tags: ["视频", "导入", "引导"], thumb: "🎬", teachingNotes: "在正式开始之前，让我们先来看一个有趣的视频，了解一下勾股定理的起源和生活中的应用。\n\n播放前：\"同学们，你们知道吗？早在几千年前，中国古代数学家就发现了直角三角形三边之间的神秘关系！让我们通过视频来了解这段有趣的历史。\"\n\n播放后：\"看完视频后，谁能告诉我勾股定理在生活中还有哪些用途呢？\"", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", chapters: [{ time: "00:00", title: "勾股定理的起源" }, { time: "00:30", title: "生活中的应用" }] },
  { id: "r3",  type: "练习", name: "回顾前节",            summary: "三道上节课知识回顾题，帮助学生温故知新，为新课做准备。", tags: ["练习", "回顾", "选择"], thumb: "📝", teachingNotes: "在开始新课之前，让我们先来回顾一下上节课的内容。\n\n\"请大家独立思考这道题，然后告诉我答案。回答正确的同学将获得一颗小星星奖励！\"\n\n讲解答案时：\"非常好！直角三角形的定义就是有一个角是直角的三角形。这个基础知识很重要，因为我们今天要学习的勾股定理只适用于直角三角形哦！\"", questions: [
    { id: 1, type: "单选题", question: "下列关于直角三角形的说法，正确的是？", options: ["A. 三个角都是直角", "B. 有一个角是直角", "C. 没有直角", "D. 两个角是直角"], answer: 1, explanation: "直角三角形的定义是有一个角是直角的三角形。" },
    { id: 2, type: "单选题", question: "直角三角形中，两个锐角的和是多少度？", options: ["A. 90°", "B. 180°", "C. 360°", "D. 60°"], answer: 0, explanation: "三角形内角和为180°，减去90°的直角，两个锐角和为90°。" },
    { id: 3, type: "判断题", question: "直角三角形的三条高都在三角形内部。", options: ["正确", "错误"], answer: 1, explanation: "直角三角形的两条直角边就是两条高，它们的交点在直角顶点，不在内部。" },
  ] },
  { id: "r4",  type: "PPT",  name: "知识点讲解",          summary: "目录与知识点汇总的气泡图+有趣的图片，系统讲解勾股定理核心概念。", tags: ["课件", "讲解", "气泡图"], thumb: "📚", teachingNotes: "现在我们来系统学习勾股定理的核心概念。\n\n\"首先，什么是勾股定理呢？它是指在直角三角形中，两条直角边的平方和等于斜边的平方。请大家认真听，这是本节课最重要的知识点！\"\n\n\"勾股定理的公式是：a² + b² = c²。其中，a和b是两条直角边，c是斜边。一定要记住，c永远是斜边！\"\n\n\"在中国古代，人们称较短的直角边为'勾'，较长的直角边为'股'，斜边为'弦'，所以称为'勾股定理'。早在公元前11世纪，数学家商高就发现了'勾三股四弦五'的规律。\"", pages: [
    { title: "知识点讲解", content: "勾股定理核心概念", layout: "title", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=knowledge%20bubbles%20mind%20map%20colorful%20education%20presentation&image_size=landscape_16_9" },
    { title: "什么是勾股定理", content: "直角三角形两直角边的平方和等于斜边的平方：a² + b² = c²", layout: "content", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pythagorean%20theorem%20formula%20visualization%20right%20triangle%20parts&image_size=square" },
    { title: "历史故事", content: "公元前 11 世纪，中国古代数学家商高就发现了「勾三股四弦五」的规律。", layout: "content", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20mathematics%20history%20bamboo%20scrolls%20illustration&image_size=square" },
    { title: "常见勾股数", content: "3-4-5、5-12-13、7-24-25、8-15-17", layout: "content" },
  ] },
  { id: "r5",  type: "PPT",  name: "知识点精讲",          summary: "可互动点击的图文形式，深入讲解重点知识点。", tags: ["课件", "精讲", "互动"], thumb: "💡", teachingNotes: "接下来我们深入探讨勾股定理的公式推导。\n\n\"请大家跟着我一起，通过面积法来证明勾股定理。这部分内容比较重要，请同学们做好笔记！\"\n\n\"我们可以用四个完全相同的直角三角形拼成一个大正方形，中间会形成一个小正方形。通过计算大正方形和四个三角形的面积关系，就能推导出a² + b² = c²。\"\n\n\"让我们通过一个具体的例子来理解：已知a=3，b=4，求斜边c。解：c = √(3²+4²) = √25 = 5。这就是著名的'勾三股四弦五'！\"", pages: [
    { title: "公式推导", content: "a² + b² = c² 的几何证明", layout: "title", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=geometric%20proof%20pythagorean%20theorem%20step%20by%20step%20colorful&image_size=landscape_16_9" },
    { title: "面积法证明", content: "通过面积相等来证明勾股定理", layout: "image", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pythagorean%20theorem%20area%20proof%20squares%20grid%20visualization&image_size=landscape_16_9" },
    { title: "例题详解", content: "已知 a=3, b=4，求斜边 c。\n\n解：c = √(3²+4²) = √25 = 5", layout: "content" },
    { title: "变式练习", content: "已知 c=13, a=5，求另一条直角边 b。", layout: "content" },
  ] },
  { id: "r6",  type: "网页", name: "知识点工具",          summary: "HTML生成的互动应用，让知识点可视化，可以进行操作。", tags: ["网页", "工具", "交互"], thumb: "🔧", teachingNotes: "现在请同学们打开这个在线工具，亲自动手操作一下。\n\n\"请大家输入不同的直角边长度，看看斜边会怎样变化。通过实践，相信大家对勾股定理会有更深的理解！\"\n\n\"试着输入3和4，看看斜边是多少？再输入5和12，斜边又是多少？这些都是常见的勾股数，记下来对以后解题很有帮助！\"\n\n\"大家还可以尝试只输入一条直角边和斜边，看看另一条直角边会怎么计算。\"", webpageUrl: "https://www.calculatorsoup.com/calculators/geometry-plane/pythagorean-theorem.php" },
  { id: "r7",  type: "练习", name: "随堂测验",            summary: "五道本节课的可点击互动测试题，涵盖单选题、判断题、填空题，全面检验学生掌握情况。", tags: ["练习", "测验", "互动"], thumb: "✅", teachingNotes: "现在我们来做几道练习题，检验一下大家的掌握情况。\n\n\"请认真思考，独立完成。做完后我们一起核对答案，看看谁是我们班的数学小天才！\"\n\n第一题讲解：\"这道题是最基础的勾股定理应用，3-4-5是最常见的勾股数，大家一定要记住！\"\n\n第二题讲解：\"这道题稍微有点难度，需要先写出公式b = √(c²-a²)，然后代入数值计算。记住，已知斜边求直角边时，要用减法哦！\"\n\n第三题讲解：\"判断三条边能否构成直角三角形，关键是看两条短边的平方和是否等于最长边的平方。7²+8²=113，9²=81，113≠81，所以不能构成直角三角形。\"", questions: [
    { id: 1, type: "单选题", question: "直角三角形两直角边分别为 3cm 和 4cm，则斜边长为？", options: ["A. 5cm", "B. 6cm", "C. 7cm", "D. 12cm"], answer: 0, explanation: "根据勾股定理：c = √(3²+4²) = √25 = 5cm" },
    { id: 2, type: "单选题", question: "如果直角三角形的斜边为 13cm，一条直角边为 5cm，则另一条直角边为？", options: ["A. 8cm", "B. 10cm", "C. 12cm", "D. 18cm"], answer: 2, explanation: "根据勾股定理：b = √(13²-5²) = √144 = 12cm" },
    { id: 3, type: "判断题", question: "7、8、9 能构成直角三角形的三边吗？", options: ["正确", "错误"], answer: 1, explanation: "7²+8²=49+64=113，9²=81，113≠81，所以不能构成直角三角形" },
    { id: 4, type: "单选题", question: "一个直角三角形的两条直角边分别是6和8，斜边上的高是多少？", options: ["A. 4.8", "B. 5", "C. 6", "D. 4"], answer: 0, explanation: "斜边 = √(6²+8²) = 10，面积 = 6×8÷2 = 24，斜边上的高 = 24×2÷10 = 4.8" },
    { id: 5, type: "填空题", question: "已知直角三角形的一条直角边为9，斜边为15，则另一条直角边为 ____。", options: ["", "", "", ""], answer: 12, explanation: "另一条直角边 = √(15²-9²) = √(225-81) = √144 = 12" },
  ] },
  { id: "r8",  type: "教案", name: "互动话题",            summary: "一个开放的讨论题目和班级的基础分组，促进课堂互动。", tags: ["文档", "讨论", "分组"], thumb: "💬", teachingNotes: "现在请大家分组讨论：生活中有哪些场景可以用勾股定理来解决？\n\n\"请每组同学举例说明，并尝试计算。讨论时间5分钟，之后每组派一位代表来分享你们的想法！\"\n\n\"比如，测量旗杆的高度、计算河流的宽度、设计楼梯的坡度等等，都可以用到勾股定理。\"\n\n\"在讨论过程中，请大家注意记录下你们想到的应用场景和计算方法，稍后我们一起分享！\"", toc: ["讨论主题", "分组建议", "讨论记录", "总结分享"], sections: [{ heading: "讨论主题", body: "请小组合作讨论：生活中有哪些场景可以用勾股定理来解决？举例说明并尝试计算。", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=group%20discussion%20students%20collaborative%20learning%20classroom%20colorful&image_size=landscape_4_3", imageCaption: "小组讨论场景" }, { heading: "分组建议", body: "建议 4-5 人一组，每组推选一名小组长负责记录和汇报。讨论时间约 5 分钟。" }] },
  { id: "r9",  type: "教案", name: "互动游戏",            summary: "互动点名小游戏，增加课堂趣味性和参与度。", tags: ["文档", "游戏", "互动"], thumb: "🎮", teachingNotes: "接下来我们玩一个互动游戏！\n\n\"我会随机点名，被点到的同学需要回答一道关于勾股定理的题目。答对的同学可以获得积分奖励，连续答对三道题的同学还会有额外惊喜哦！\"\n\n\"准备好了吗？游戏开始！\"\n\n注意事项：根据学生的反应灵活调整题目难度，鼓励回答，营造轻松愉快的课堂氛围。对于回答错误的同学，要给予鼓励和正确的引导。", toc: ["游戏规则", "点名方式", "奖励机制"], sections: [{ heading: "游戏规则", body: "随机点名回答问题，答对可获得小奖励。连续答对三道题可获得额外加分。", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fun%20classroom%20game%20random%20selection%20interactive%20education&image_size=landscape_4_3", imageCaption: "互动点名游戏" }] },
  { id: "r10", type: "PPT",  name: "观点总结",            summary: "本节课的思维导图，可互动交互，帮助学生梳理知识结构。", tags: ["课件", "思维导图", "总结"], thumb: "🧠", teachingNotes: "本节课我们学习了勾股定理的概念、公式推导和应用。\n\n\"请大家对照思维导图，回顾一下今天学的内容。记住：勾股定理只适用于直角三角形，a² + b² = c²，c永远是斜边！\"\n\n\"我们学习了三种证明方法：面积法、割补法和相似三角形法。其中面积法是最直观、最容易理解的一种。\"\n\n\"勾股定理在生活中有很多应用，比如测量高度、计算距离、判断三角形形状等等。希望大家课后能够多加练习，熟练掌握！\"", pages: [
    { title: "知识总结", content: "勾股定理知识梳理", layout: "title", image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mind%20map%20education%20knowledge%20structure%20colorful%20interactive&image_size=landscape_16_9" },
    { title: "核心概念", content: "a² + b² = c²\n直角三角形三边关系", layout: "content" },
    { title: "证明方法", content: "• 面积法\n• 割补法\n• 相似三角形法", layout: "content" },
    { title: "应用场景", content: "• 测量高度\n• 计算距离\n• 判断三角形形状", layout: "content" },
  ] },
  { id: "r11", type: "作业", name: "课后作业",            summary: "8 道题目，涵盖单选、多选、判断、填空和简答题，全面巩固勾股定理知识。", tags: ["作业", "课后", "问答"], thumb: "📋", teachingNotes: "本节课的课后作业共有8道题，包括选择题、判断题、填空题和简答题。\n\n\"请同学们认真完成，注意书写规范，明天上课我们会一起讲解这些题目！\"\n\n\"特别是最后一道简答题，请大家结合生活实际，举出一个勾股定理的应用例子。这道题需要写完整的解题过程哦！\"\n\n\"作业要求：选择题和判断题请在答题卡上作答，填空题和简答题请写在作业本上。明天上课前交给课代表。\"", questions: [
    { id: 1, type: "单选题", question: "直角三角形两直角边分别为 5 和 12，则斜边长为？", options: ["A. 13", "B. 17", "C. 60", "D. 169"], answer: 0, explanation: "c = √(5²+12²) = √169 = 13" },
    { id: 2, type: "单选题", question: "如果斜边为 17，一条直角边为 8，则另一条直角边为？", options: ["A. 9", "B. 15", "C. 25", "D. 289"], answer: 1, explanation: "b = √(17²-8²) = √225 = 15" },
    { id: 3, type: "单选题", question: "等边三角形的边长为 2，则它的高为？", options: ["A. √2", "B. √3", "C. 2", "D. √5"], answer: 1, explanation: "高 = √(2²-1²) = √3" },
    { id: 4, type: "判断题", question: "三角形三边为 7, 24, 25，该三角形是直角三角形。", options: ["正确", "错误"], answer: 0, explanation: "7²+24²=49+576=625=25²，所以是直角三角形" },
    { id: 5, type: "填空题", question: "一个直角三角形的面积为 24，一条直角边为 6，则斜边为 ____。", options: ["", "", "", ""], answer: 10, explanation: "另一条直角边 = 24×2÷6 = 8，斜边 = √(6²+8²) = 10" },
    { id: 6, type: "单选题", question: "一架梯子长 10 米，斜靠在墙上，梯子底部离墙 6 米，则梯子顶端离地面多少米？", options: ["A. 6 米", "B. 8 米", "C. 10 米", "D. 16 米"], answer: 1, explanation: "梯子顶端离地高度 = √(10²-6²) = √64 = 8 米" },
    { id: 7, type: "多选题", question: "下列各组数中，能构成直角三角形三边的是？", options: ["A. 3, 4, 5", "B. 5, 12, 13", "C. 7, 8, 9", "D. 9, 40, 41"], answer: [0, 1, 3], explanation: "A: 3²+4²=9+16=25=5² ✓\nB: 5²+12²=25+144=169=13² ✓\nC: 7²+8²=49+64=113≠81=9² ✗\nD: 9²+40²=81+1600=1681=41² ✓" },
    { id: 8, type: "简答题", question: "小明家到学校有两条路可走：一条是直接走直线穿过公园，另一条是先向东走 300 米，再向北走 400 米。请问走直线比走弯路近多少米？请写出完整解题过程。", options: ["", "", "", ""], answer: 0, explanation: "弯路距离 = 300 + 400 = 700 米\n直线距离 = √(300²+400²) = √(90000+160000) = √250000 = 500 米\n近了 = 700 - 500 = 200 米" },
  ] },
];
const CLASS_PACKAGE_PHASES: ClassPackagePhase[] = [
  { num: 1, title: "破冰", subtitle: "课前导入",     duration: "约10分", resIdx: [0, 1, 2, 3] },
  { num: 2, title: "授课", subtitle: "核心讲授",     duration: "约20分", resIdx: [4, 5, 6] },
  { num: 3, title: "互动", subtitle: "课堂互动与实践", duration: "约15分", resIdx: [7, 8, 9] },
  { num: 4, title: "总结", subtitle: "总结与延展",   duration: "约5分",  resIdx: [10, 11] },
];

// ─── Teach Confirm Modal ─────────────────────────────────────────────────────
function TeachConfirmModal({ cls, onConfirm, onCancel }: { cls: ClassItem; onConfirm: () => void; onCancel: () => void }) {
  const [grade, setGrade] = useState(cls.grade);
  const [teacher, setTeacher] = useState(cls.teacher);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: tk.bgWhite, borderRadius: tk.radiusLg,
        boxShadow: tk.shadowXl ?? "0 24px 56px rgba(0,0,0,0.18)",
        padding: tk.spacingLg, width: 440, display: "flex", flexDirection: "column", gap: tk.spacingMd,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary }}>确认开始上课</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, marginBottom: 6 }}>课堂名称</div>
            <div style={{
              padding: "9px 12px", background: tk.bgPrimary, borderRadius: tk.radiusSm,
              border: `1px solid ${tk.borderHairline}`, fontSize: 13, color: tk.textPrimary,
            }}>{cls.title}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, marginBottom: 6 }}>授课班级</div>
            <select value={grade} onChange={e => setGrade(e.target.value)} style={{
              width: "100%", padding: "9px 12px", borderRadius: tk.radiusSm,
              border: `1px solid ${tk.borderDefault}`, fontSize: 13, color: tk.textPrimary,
              background: tk.bgWhite, outline: "none", fontFamily: "var(--font-family)",
            }}>
              {["高一(1)班","高一(2)班","高一(3)班","高一(4)班"].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, marginBottom: 6 }}>授课教师</div>
            <select value={teacher} onChange={e => setTeacher(e.target.value)} style={{
              width: "100%", padding: "9px 12px", borderRadius: tk.radiusSm,
              border: `1px solid ${tk.borderDefault}`, fontSize: 13, color: tk.textPrimary,
              background: tk.bgWhite, outline: "none", fontFamily: "var(--font-family)",
            }}>
              {["王老师","张老师","李老师"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={onCancel} style={{
            background: "none", border: `1px solid ${tk.borderDefault}`,
            borderRadius: tk.radiusSm, fontSize: 13, padding: "7px 18px",
            cursor: "pointer", color: tk.textSecondary,
          }}>取消</button>
          <button onClick={onConfirm} style={{
            background: tk.brandDefault, color: tk.textReverse,
            border: "none", borderRadius: tk.radiusSm,
            fontSize: 13, fontWeight: 600, padding: "7px 24px", cursor: "pointer",
          }}>确认开始上课</button>
        </div>
      </div>
    </div>
  );
}

// ─── Teach Exit Confirm Modal ───────────────────────────────────────────────
function TeachExitConfirmModal({ onCancel, onSkipAnalysis, onExitAndGenerate }: {
  onCancel: () => void;
  onSkipAnalysis: () => void;
  onExitAndGenerate: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2100,
      background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#1a1a1f", borderRadius: tk.radiusLg,
        boxShadow: "0 24px 56px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 22px", width: 440, display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>退出授课并生成课后分析？</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>
          退出生成后您将收到通知，或在课包 / 课后模块内查看；若不生成则直接退出。
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={onCancel} style={{
            background: "transparent", border: `1px solid rgba(255,255,255,0.18)`,
            borderRadius: tk.radiusSm, fontSize: 12, padding: "7px 16px",
            cursor: "pointer", color: "rgba(255,255,255,0.7)",
          }}>取消</button>
          <button onClick={onSkipAnalysis} style={{
            background: "transparent", border: `1px solid rgba(255,255,255,0.18)`,
            borderRadius: tk.radiusSm, fontSize: 12, padding: "7px 16px",
            cursor: "pointer", color: "rgba(255,255,255,0.7)",
          }}>仅退出</button>
          <button onClick={onExitAndGenerate} style={{
            background: tk.brandDefault, color: "#fff",
            border: "none", borderRadius: tk.radiusSm,
            fontSize: 12, fontWeight: 600, padding: "7px 18px", cursor: "pointer",
          }}>退出并生成</button>
        </div>
      </div>
    </div>
  );
}

function InteractiveQuestionComponent({ res, page, setPage, theme, badge, editing = false, callbacks }: {
  res: ClassPackageRes;
  page: number;
  setPage: (p: number) => void;
  theme: "dark" | "light";
  badge: { bg: string; color: string; label: string } | undefined;
  editing?: boolean;
  callbacks?: EditCallbacks;
}) {
  const isDark = theme === "dark";
  const fg = isDark ? "rgba(255,255,255,0.92)" : tk.textPrimary;
  const fg2 = isDark ? "rgba(255,255,255,0.6)" : tk.textSecondary;
  const fg3 = isDark ? "rgba(255,255,255,0.4)" : tk.textPlaceholder;
  const bg2 = isDark ? "rgba(255,255,255,0.05)" : tk.bgPrimary;
  const border2 = isDark ? "rgba(255,255,255,0.1)" : tk.borderDefault;

  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [inputAnswer, setInputAnswer] = useState("");

  useEffect(() => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setInputAnswer("");
  }, [page]);

  const q = res.questions?.[page];
  if (!q || !res.questions) return null;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const isCorrect = () => {
    if (q.type === "判断题") {
      return selectedAnswer === (q.answer as number);
    }
    if (q.type === "单选题") {
      return selectedAnswer === (q.answer as number);
    }
    if (q.type === "多选题") {
      const correctAnswers = q.answer as number[];
      const selectedAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      return correctAnswers.length === selectedAnswers.length && 
             correctAnswers.every(a => selectedAnswers.includes(a));
    }
    if (q.type === "填空题") {
      return String(inputAnswer).trim() === String(q.answer);
    }
    return true;
  };

  const fadeIn = {
    animation: "fadeIn 0.4s ease-out",
  };

  const slideUp = (delay = 0) => ({
    animation: `slideUp 0.5s ease-out ${delay}s both`,
  });

  return (
    <div style={{ ...fadeIn, display: "flex", flexDirection: "column", gap: 16, padding: "32px 40px", height: "100%", width: "100%", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div style={{ ...slideUp(0), display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: fg3 }}>第 {page + 1} / {res.questions.length} 题</span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
          background: badge?.bg || bg2, color: badge?.color || fg2,
        }}>{badge?.label || res.type}</span>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
          background: q.type === "判断题" ? "rgba(244,114,182,0.18)" : q.type === "选择题" ? "rgba(10,124,87,0.18)" : "rgba(148,163,184,0.18)",
          color: q.type === "判断题" ? "#f472b6" : q.type === "选择题" ? "#5DB897" : "#94a3b8",
        }}>{q.type}</span>
      </div>
      
      {editing ? (
          <textarea
            value={q.question}
            onChange={e => callbacks?.updateQuestion(page, { question: e.target.value })}
            rows={2}
            style={{
              ...slideUp(0.1), fontSize: 24, fontWeight: 600, lineHeight: 1.5, width: "100%",
              border: `2px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
              padding: "12px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
              color: isDark ? "#fff" : tk.textPrimary, fontFamily: "var(--font-family)", resize: "none",
            }}
          />
        ) : (
          <div style={{ ...slideUp(0.1), fontSize: 24, fontWeight: 600, color: isDark ? "#fff" : tk.textPrimary, lineHeight: 1.5 }}>{q.question}</div>
        )}
      
      <div style={{ ...slideUp(0.2), display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {q.options && q.options.filter(o => o).length > 0 ? (
          q.options.filter(o => o).map((opt, i) => {
            const isMultiple = q.type === "多选题";
            const isSelected = isMultiple 
              ? Array.isArray(selectedAnswer) && selectedAnswer.includes(i)
              : selectedAnswer === i;
            const showResult = submitted;
            const isCorrectOption = Array.isArray(q.answer) 
              ? q.answer.includes(i)
              : i === q.answer;
            
            let bgColor = bg2;
            let borderColor = border2;
            let textColor = isDark ? "rgba(255,255,255,0.85)" : tk.textPrimary;
            
            if (showResult) {
              if (isCorrectOption) {
                bgColor = "rgba(10,124,87,0.15)";
                borderColor = "#5DB897";
                textColor = "#5DB897";
              } else if (isSelected && !isCorrectOption) {
                bgColor = "rgba(239,68,68,0.15)";
                borderColor = "#ef4444";
                textColor = "#ef4444";
              }
            } else if (isSelected) {
              bgColor = tk.bgBrandSubtle;
              borderColor = tk.brandDefault;
              textColor = tk.textBrand;
            }
            
            return (
              <div
                key={i}
                onClick={() => !submitted && !editing && (isMultiple ? setSelectedAnswer(prev => {
                  if (Array.isArray(prev)) {
                    return prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i];
                  }
                  return [i];
                }) : setSelectedAnswer(i))}
                style={{
                  padding: "12px 16px", borderRadius: 8,
                  background: bgColor,
                  border: `2px solid ${editing ? tk.borderBrand : borderColor}`,
                  fontSize: 15, color: textColor,
                  cursor: submitted || editing ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {q.type === "判断题" ? (i === 0 ? "✓" : "✗") : String.fromCharCode(65 + i)}
                </span>
                {editing ? (
                  <input
                    type="text"
                    value={opt}
                    onChange={e => callbacks?.updateOption(page, i, e.target.value)}
                    style={{
                      flex: 1, border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                      padding: "4px 8px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
                      color: textColor, fontFamily: "var(--font-family)", fontSize: 15,
                    }}
                  />
                ) : (
                  <span>{opt}</span>
                )}
                {showResult && isCorrectOption && (
                  <CheckCircle size={18} style={{ marginLeft: "auto", color: "#5DB897" }} />
                )}
                {showResult && isSelected && !isCorrectOption && (
                  <XCircle size={18} style={{ marginLeft: "auto", color: "#ef4444" }} />
                )}
              </div>
            );
          })
        ) : q.type === "填空题" ? (
          <div style={{ ...slideUp(0.3), padding: "16px", borderRadius: 8, background: bg2, border: `2px solid ${submitted ? (String(inputAnswer).trim() === String(q.answer) ? "#5DB897" : "#ef4444") : border2}`, fontSize: 16 }}>
            <input
              type="text"
              value={inputAnswer}
              onChange={(e) => setInputAnswer(e.target.value)}
              disabled={submitted}
              style={{
                border: "none", background: "transparent", fontSize: 16,
                color: submitted ? (String(inputAnswer).trim() === String(q.answer) ? "#5DB897" : "#ef4444") : (isDark ? "#fff" : tk.textPrimary),
                outline: "none", minWidth: 200,
                borderBottom: `2px solid ${submitted ? (String(inputAnswer).trim() === String(q.answer) ? "#5DB897" : "#ef4444") : fg3}`,
                paddingBottom: 4,
              }}
              placeholder="请输入答案"
            />
            {submitted && String(inputAnswer).trim() === String(q.answer) && (
              <CheckCircle size={20} style={{ marginLeft: 8, color: "#5DB897" }} />
            )}
            {submitted && String(inputAnswer).trim() !== String(q.answer) && (
              <XCircle size={20} style={{ marginLeft: 8, color: "#ef4444" }} />
            )}
          </div>
        ) : q.type === "简答题" ? (
          <textarea
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            disabled={submitted}
            style={{
              ...slideUp(0.3),
              width: "100%", minHeight: 120, padding: "14px 16px",
              borderRadius: 8, background: bg2,
              border: `2px solid ${submitted ? "#5DB897" : border2}`,
              fontSize: 15, color: isDark ? "rgba(255,255,255,0.85)" : tk.textPrimary,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
            }}
            placeholder="请输入你的答案..."
          />
        ) : null}
      </div>
      
      {!submitted && (
        <button
          onClick={handleSubmit}
          style={{
            ...slideUp(0.4),
            alignSelf: "flex-start",
            padding: "10px 24px",
            borderRadius: 6,
            background: tk.brandDefault,
            color: tk.textReverse,
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          提交答案
        </button>
      )}
      
      {submitted && q.answer && (
        <div style={{ ...slideUp(0.5), marginTop: 8, padding: "16px", borderRadius: 8, background: "rgba(10,124,87,0.12)", border: "1px solid rgba(10,124,87,0.2)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#5DB897", marginBottom: 6 }}>{isCorrect() ? "✓ 回答正确" : "✗ 回答错误"}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#5DB897", marginBottom: 4 }}>正确答案</div>
          <div style={{ fontSize: 14, color: fg2, lineHeight: 1.7 }}>
            {Array.isArray(q.answer) 
              ? q.answer.map(i => String.fromCharCode(65 + i)).join(", ")
              : q.type === "判断题" 
                ? (q.answer === 0 ? "正确" : "错误")
                : q.answer}
          </div>
        </div>
      )}
      
      {submitted && q.explanation && (
        <div style={{ ...slideUp(0.6), marginTop: 12, padding: "16px", borderRadius: 8, background: isDark ? "rgba(10,124,87,0.12)" : tk.bgBrandSubtle, border: "1px solid rgba(10,124,87,0.2)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#5DB897", marginBottom: 6 }}>解析</div>
          <div style={{ fontSize: 14, color: fg2, lineHeight: 1.7 }}>{q.explanation}</div>
        </div>
      )}
      
      <div style={{ ...slideUp(0.7), display: "flex", gap: 4, marginTop: 20, flexWrap: "wrap" }}>
        {res.questions.map((_, i) => (
          <span key={i} onClick={() => { setPage(i); setSelectedAnswer(null); setSubmitted(false); setInputAnswer(""); }} style={{
            fontSize: 12, width: 32, height: 32, borderRadius: 6, cursor: "pointer",
            color: i === page ? (isDark ? "#fff" : tk.textReverse) : fg3,
            background: i === page ? tk.brandDefault : bg2,
            border: i === page ? `1px solid ${tk.brandDefault}` : `1px solid ${border2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>{i + 1}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Resource Content Renderer (shared between TeachingMode and ClassDetailPage) ───
type EditCallbacks = {
  updatePage: (i: number, v: string) => void;
  updateSection: (i: number, p: Partial<{ heading: string; body: string; image?: string; imageCaption?: string }>) => void;
  updateChapter: (i: number, p: Partial<{ title: string; time: string }>) => void;
  updateQuestion: (i: number, p: Partial<{ question: string; options: string[]; answer: number; type: string }>) => void;
  updateOption: (qi: number, oi: number, v: string) => void;
  patchDraft: (p: Partial<ClassPackageRes>) => void;
};

function renderResourceContent(res: ClassPackageRes, page: number, setPage: (p: number) => void, theme: "dark" | "light" = "dark", editing = false, callbacks?: EditCallbacks, elementSelectMode = false) {
  const isDark = theme === "dark";
  const fg = isDark ? "rgba(255,255,255,0.92)" : tk.textPrimary;
  const fg2 = isDark ? "rgba(255,255,255,0.6)" : tk.textSecondary;
  const fg3 = isDark ? "rgba(255,255,255,0.4)" : tk.textPlaceholder;
  const bg = isDark ? "#0d0d12" : tk.bgWhite;
  const bg2 = isDark ? "rgba(255,255,255,0.05)" : tk.bgPrimary;
  const border = isDark ? "rgba(255,255,255,0.06)" : tk.borderHairline;
  const border2 = isDark ? "rgba(255,255,255,0.1)" : tk.borderDefault;

  const typeBadge: Record<ClassPackageRes["type"], { bg: string; color: string; label: string }> = {
    PPT:  { bg: "rgba(10,124,87,0.18)", color: "#5DB897", label: "PPT" },
    教案: { bg: "rgba(16,185,129,0.18)", color: "#34d399", label: "教案" },
    视频: { bg: "rgba(244,114,182,0.18)", color: "#f472b6", label: "视频" },
    练习: { bg: "rgba(251,191,36,0.18)", color: "#fbbf24", label: "练习" },
    作业: { bg: "rgba(167,139,250,0.18)", color: "#a78bfa", label: "作业" },
    文档: { bg: "rgba(59,130,246,0.18)", color: "#60a5fa", label: "文档" },
    音频: { bg: "rgba(236,72,153,0.18)", color: "#fb7185", label: "音频" },
    图片: { bg: "rgba(20,184,166,0.18)", color: "#2dd4bf", label: "图片" },
    网页: { bg: "rgba(148,163,184,0.18)", color: "#94a3b8", label: "网页" },
  };
  const badge = typeBadge[res.type];

  const fadeIn = {
    animation: "fadeIn 0.4s ease-out",
  };

  const slideUp = (delay = 0) => ({
    animation: `slideUp 0.5s ease-out ${delay}s both`,
  });

  if (res.type === "PPT" && res.pages) {
    const pg = res.pages[page];
    if (!pg) return null;
    const pageData = typeof pg === "string" ? { title: pg, content: "", layout: "content" as const } : pg;
    const layout = pageData.layout || "content";
    
    return (
      <div style={{ ...fadeIn, height: "100%", width: "100%", display: "flex", flexDirection: "column", padding: "20px" }}>
        <div data-module-name={pageData.title || `第 ${page + 1} 页`} data-module-type="ppt-page" style={{
          flex: 1, aspectRatio: "16 / 9", background: bg, border: `1px solid ${editing ? tk.borderBrand : border}`,
          borderRadius: 8, padding: 40, display: "flex",
          overflow: "hidden",
          position: "relative",
          marginBottom: 12,
        }}>
          {layout === "title" && (
            <div style={{ ...slideUp(0), flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              {pageData.image && (
                <div style={{ ...slideUp(0.1), width: "100%", maxHeight: "40%", marginBottom: 20 }}>
                  <img src={pageData.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              )}
              {editing ? (
                <textarea
                  value={pageData.title}
                  onChange={e => {
                    const newPages = [...res.pages!];
                    newPages[page] = { ...(typeof newPages[page] === "string" ? { title: newPages[page], content: "", layout: "content" } : newPages[page]), title: e.target.value };
                    callbacks?.patchDraft({ pages: newPages });
                  }}
                  rows={2}
                  style={{
                    ...slideUp(0.2), fontSize: 36, fontWeight: 700, lineHeight: 1.3, marginBottom: 12,
                    width: "100%", textAlign: "center", border: `2px solid ${tk.borderBrand}`,
                    borderRadius: tk.radiusSm, padding: "12px", outline: "none",
                    background: isDark ? "#1a1a2e" : tk.bgWhite,
                    color: isDark ? "#fff" : tk.textPrimary,
                    fontFamily: "var(--font-family)", resize: "none",
                  }}
                />
              ) : (
                <div style={{ ...slideUp(0.2), fontSize: 36, fontWeight: 700, color: isDark ? "#fff" : tk.textPrimary, lineHeight: 1.3, marginBottom: 12 }}>{pageData.title}</div>
              )}
              {pageData.content && (
                editing ? (
                  <textarea
                    value={pageData.content}
                    onChange={e => {
                      const newPages = [...res.pages!];
                      newPages[page] = { ...(typeof newPages[page] === "string" ? { title: newPages[page], content: "", layout: "content" } : newPages[page]), content: e.target.value };
                      callbacks?.patchDraft({ pages: newPages });
                    }}
                    rows={4}
                    style={{
                      ...slideUp(0.3), fontSize: 16, lineHeight: 1.6, width: "100%",
                      textAlign: "center", border: `1px solid ${tk.borderBrand}`,
                      borderRadius: tk.radiusSm, padding: "8px 12px", outline: "none",
                      background: isDark ? "#1a1a2e" : tk.bgWhite,
                      color: fg2, fontFamily: "var(--font-family)", resize: "none",
                    }}
                  />
                ) : (
                  <div style={{ ...slideUp(0.3), fontSize: 16, color: fg2, lineHeight: 1.6 }}>{pageData.content}</div>
                )
              )}
            </div>
          )}
          {layout === "image" && (
            <div style={{ ...slideUp(0), flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={pageData.image} alt={pageData.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 4 }} />
            </div>
          )}
          {layout === "split" && (
            <div style={{ ...slideUp(0), flex: 1, display: "flex", gap: 32 }}>
              <div style={{ ...slideUp(0.1), flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {editing ? (
                  <textarea
                    value={pageData.title}
                    onChange={e => {
                      const newPages = [...res.pages!];
                      newPages[page] = { ...(typeof newPages[page] === "string" ? { title: newPages[page], content: "", layout: "content" } : newPages[page]), title: e.target.value };
                      callbacks?.patchDraft({ pages: newPages });
                    }}
                    rows={2}
                    style={{
                      fontSize: 24, fontWeight: 600, lineHeight: 1.4, marginBottom: 12,
                      border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                      padding: "8px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
                      color: isDark ? "#fff" : tk.textPrimary, fontFamily: "var(--font-family)", resize: "none",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 24, fontWeight: 600, color: isDark ? "#fff" : tk.textPrimary, lineHeight: 1.4, marginBottom: 12 }}>{pageData.title}</div>
                )}
                {pageData.content && (
                  editing ? (
                    <textarea
                      value={pageData.content}
                      onChange={e => {
                        const newPages = [...res.pages!];
                        newPages[page] = { ...(typeof newPages[page] === "string" ? { title: newPages[page], content: "", layout: "content" } : newPages[page]), content: e.target.value };
                        callbacks?.patchDraft({ pages: newPages });
                      }}
                      rows={5}
                      style={{
                        fontSize: 15, lineHeight: 1.7, border: `1px solid ${tk.borderBrand}`,
                        borderRadius: tk.radiusSm, padding: "8px 12px", outline: "none",
                        background: isDark ? "#1a1a2e" : tk.bgWhite, color: fg2,
                        fontFamily: "var(--font-family)", resize: "none",
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 15, color: fg2, lineHeight: 1.7 }}>{pageData.content}</div>
                  )
                )}
              </div>
              {pageData.image && (
                <div style={{ ...slideUp(0.2), flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={pageData.image} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 4 }} />
                </div>
              )}
            </div>
          )}
          {(layout !== "title" && layout !== "image" && layout !== "split") && (
            <div style={{ ...slideUp(0), flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {editing ? (
                <textarea
                  value={pageData.title}
                  onChange={e => {
                    const newPages = [...res.pages!];
                    newPages[page] = { ...(typeof newPages[page] === "string" ? { title: newPages[page], content: "", layout: "content" } : newPages[page]), title: e.target.value };
                    callbacks?.patchDraft({ pages: newPages });
                  }}
                  rows={2}
                  style={{
                    ...slideUp(0.1), fontSize: 28, fontWeight: 600, lineHeight: 1.35, marginBottom: 20,
                    border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                    padding: "10px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
                    color: isDark ? "#fff" : tk.textPrimary, fontFamily: "var(--font-family)", resize: "none",
                  }}
                />
              ) : (
                <div style={{ ...slideUp(0.1), fontSize: 28, fontWeight: 600, color: isDark ? "#fff" : tk.textPrimary, lineHeight: 1.35, marginBottom: 20 }}>{pageData.title}</div>
              )}
              {pageData.content && (
                editing ? (
                  <textarea
                    value={pageData.content}
                    onChange={e => {
                      const newPages = [...res.pages!];
                      newPages[page] = { ...(typeof newPages[page] === "string" ? { title: newPages[page], content: "", layout: "content" } : newPages[page]), content: e.target.value };
                      callbacks?.patchDraft({ pages: newPages });
                    }}
                    rows={6}
                    style={{
                      ...slideUp(0.2), fontSize: 15, lineHeight: 1.8, maxWidth: 720,
                      border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                      padding: "10px 14px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
                      color: fg2, fontFamily: "var(--font-family)", resize: "vertical",
                    }}
                  />
                ) : (
                  <div style={{ ...slideUp(0.2), fontSize: 15, color: fg2, lineHeight: 1.8, maxWidth: 720 }}>{pageData.content}</div>
                )
              )}
              {pageData.image && (
                <div style={{ ...slideUp(0.3), marginTop: 20, maxWidth: 720 }}>
                  <img src={pageData.image} alt="" style={{ width: "100%", height: "auto", borderRadius: 4 }} />
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: fg3 }}>第 {page + 1} / {res.pages.length} 页</div>
          <div style={{ display: "flex", gap: 4 }}>
            {res.questions && res.questions.map((_, i) => (
              <span key={i} onClick={() => setPage(i)} style={{
                fontSize: 11, width: 28, height: 28, borderRadius: 4, cursor: "pointer",
                color: i === page ? (isDark ? "#fff" : tk.textReverse) : fg3,
                background: i === page ? tk.brandDefault : bg2,
                border: i === page ? `1px solid ${tk.borderBrand}` : `1px solid ${border2}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</span>
            ))}
            {!res.questions && res.pages.map((_, i) => (
              <span key={i} onClick={() => setPage(i)} style={{
                fontSize: 11, width: 28, height: 28, borderRadius: 4, cursor: "pointer",
                color: i === page ? (isDark ? "#fff" : tk.textReverse) : fg3,
                background: i === page ? tk.brandDefault : bg2,
                border: i === page ? `1px solid ${tk.borderBrand}` : `1px solid ${border2}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (res.type === "教案" && res.sections) {
    const section = res.sections[page];
    if (!section) return null;
    return (
      <div style={{ ...fadeIn, height: "100%", width: "100%", display: "flex", flexDirection: "column", padding: "32px 40px", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div style={{ ...slideUp(0), fontSize: 13, color: fg3, marginBottom: 12 }}>第 {page + 1} / {res.sections.length} 节</div>
        <div data-module-name={section.heading} data-module-type="section">
          {editing ? (
            <textarea
              value={section.heading}
              onChange={e => callbacks?.updateSection(page, { heading: e.target.value })}
              rows={2}
              style={{
                ...slideUp(0.1), fontSize: 24, fontWeight: 600, lineHeight: 1.35, marginBottom: 20,
                width: "100%", border: `2px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                padding: "12px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
                color: isDark ? "#fff" : tk.textPrimary, fontFamily: "var(--font-family)", resize: "none",
              }}
            />
          ) : (
            <div style={{ ...slideUp(0.1), fontSize: 24, fontWeight: 600, color: isDark ? "#fff" : tk.textPrimary, lineHeight: 1.35, marginBottom: 20 }}>{section.heading}</div>
          )}
          {section.image && (
            <div data-module-name="图片" data-module-type="image" style={{ ...slideUp(0.2), marginBottom: 16, borderRadius: 8, overflow: "hidden" }}>
              <img src={section.image} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />
              {section.imageCaption && (
                <div style={{ fontSize: 11, color: fg3, padding: 8 }}>{section.imageCaption}</div>
              )}
            </div>
          )}
          {editing ? (
            <textarea
              value={section.body}
              onChange={e => callbacks?.updateSection(page, { body: e.target.value })}
              rows={8}
              style={{
                ...slideUp(0.3), fontSize: 15, lineHeight: 1.8, maxWidth: 720, width: "100%",
                border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                padding: "12px 16px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
                color: fg2, fontFamily: "var(--font-family)", resize: "vertical",
              }}
            />
          ) : (
            <div data-module-name="正文" data-module-type="body" style={{ ...slideUp(0.3), fontSize: 15, color: fg2, lineHeight: 1.8, maxWidth: 720 }}>{section.body}</div>
          )}
        </div>
        <div style={{ ...slideUp(0.4), display: "flex", gap: 4, marginTop: 24, flexWrap: "wrap" }}>
          {res.sections.map((_, i) => (
            <span key={i} onClick={() => setPage(i)} style={{
              fontSize: 11, width: 28, height: 28, borderRadius: 4, cursor: "pointer",
              color: i === page ? (isDark ? "#fff" : tk.textReverse) : fg3,
              background: i === page ? tk.brandDefault : bg2,
              border: i === page ? `1px solid ${tk.borderBrand}` : `1px solid ${border2}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</span>
          ))}
        </div>
      </div>
    );
  }

  if (res.type === "视频" && res.chapters) {
    const chapter = res.chapters[page];
    if (!chapter) return null;
    return (
      <div style={{ ...fadeIn, height: "100%", width: "100%", display: "flex", flexDirection: "column", padding: "20px" }}>
        <div data-module-name={chapter.title} data-module-type="video-chapter" style={{ ...slideUp(0),
          width: "100%", aspectRatio: "16/9",
          background: isDark ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" : tk.bgPrimary,
          borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${editing ? tk.borderBrand : border}`,
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: fg3 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: bg2, border: `1px solid ${border2}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isDark ? "rgba(255,255,255,0.7)" : tk.textSecondary}><path d="M8 5v14l11-7z" /></svg>
            </div>
            {editing ? (
              <textarea
                value={chapter.title}
                onChange={e => callbacks?.updateChapter(page, { title: e.target.value })}
                rows={1}
                style={{
                  fontSize: 16, fontWeight: 600, textAlign: "center",
                  border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                  padding: "6px 10px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
                  color: isDark ? "#fff" : tk.textPrimary, fontFamily: "var(--font-family)", resize: "none",
                }}
              />
            ) : (
              <div style={{ fontSize: 16, color: isDark ? "#fff" : tk.textPrimary, fontWeight: 600 }}>{chapter.title}</div>
            )}
            {editing ? (
              <input
                type="text"
                value={chapter.time}
                onChange={e => callbacks?.updateChapter(page, { time: e.target.value })}
                style={{
                  fontSize: 13, textAlign: "center",
                  border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                  padding: "4px 8px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
                  color: fg3, fontFamily: "var(--font-family)",
                }}
              />
            ) : (
              <div style={{ fontSize: 13 }}>{chapter.time}</div>
            )}
          </div>
        </div>
        <div style={{ ...slideUp(0.1), display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto", scrollbarWidth: "none" }}>
          {res.chapters.map((c, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderRadius: 6, cursor: "pointer", textAlign: "left",
                background: i === page ? bg2 : "transparent",
                border: i === page ? `1px solid ${tk.brandDefault}` : "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 12, fontFamily: "monospace", opacity: 0.7, minWidth: 44, color: i === page ? tk.textBrand : fg3 }}>{c.time}</span>
              <span style={{ fontSize: 14, color: i === page ? (isDark ? "#fff" : tk.textPrimary) : fg2, fontWeight: i === page ? 600 : 400 }}>{c.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if ((res.type === "练习" || res.type === "作业") && res.questions) {
    return <InteractiveQuestionComponent res={res} page={page} setPage={setPage} theme={theme} badge={badge} editing={editing} callbacks={callbacks} />;
  }

  if (res.type === "文档" && res.sections) {
    const section = res.sections[page];
    if (!section) return null;
    return (
      <div style={{ ...fadeIn, height: "100%", width: "100%", display: "flex", flexDirection: "column", padding: "32px 40px", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div style={{ ...slideUp(0), fontSize: 13, color: fg3, marginBottom: 12 }}>第 {page + 1} / {res.sections.length} 节</div>
        {editing ? (
          <textarea
            value={section.heading}
            onChange={e => callbacks?.updateSection(page, { heading: e.target.value })}
            rows={2}
            style={{
              ...slideUp(0.1), fontSize: 24, fontWeight: 600, lineHeight: 1.35, marginBottom: 20,
              width: "100%", border: `2px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
              padding: "12px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
              color: isDark ? "#fff" : tk.textPrimary, fontFamily: "var(--font-family)", resize: "none",
            }}
          />
        ) : (
          <div style={{ ...slideUp(0.1), fontSize: 24, fontWeight: 600, color: isDark ? "#fff" : tk.textPrimary, lineHeight: 1.35, marginBottom: 20 }}>{section.heading}</div>
        )}
        {section.image && (
          <div style={{ ...slideUp(0.2), marginBottom: 16, borderRadius: 8, overflow: "hidden" }}>
            <img src={section.image} alt="" style={{ width: "100%", maxHeight: 300, objectFit: "cover" }} />
            {section.imageCaption && (
              <div style={{ fontSize: 11, color: fg3, padding: 8 }}>{section.imageCaption}</div>
            )}
          </div>
        )}
        {editing ? (
          <textarea
            value={section.body}
            onChange={e => callbacks?.updateSection(page, { body: e.target.value })}
            rows={8}
            style={{
              ...slideUp(0.3), fontSize: 15, lineHeight: 1.8, maxWidth: 720, width: "100%",
              border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
              padding: "12px 16px", outline: "none", background: isDark ? "#1a1a2e" : tk.bgWhite,
              color: fg2, fontFamily: "var(--font-family)", resize: "vertical",
            }}
          />
        ) : (
          <div style={{ ...slideUp(0.3), fontSize: 15, color: fg2, lineHeight: 1.8, maxWidth: 720 }}>{section.body}</div>
        )}
        <div style={{ ...slideUp(0.4), display: "flex", gap: 4, marginTop: 24, flexWrap: "wrap" }}>
          {res.sections.map((_, i) => (
            <span key={i} onClick={() => setPage(i)} style={{
              fontSize: 11, width: 28, height: 28, borderRadius: 4, cursor: "pointer",
              color: i === page ? (isDark ? "#fff" : tk.textReverse) : fg3,
              background: i === page ? tk.brandDefault : bg2,
              border: i === page ? `1px solid ${tk.brandDefault}` : `1px solid ${border2}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</span>
          ))}
        </div>
      </div>
    );
  }

  if (res.type === "图片" && res.images) {
    return (
      <div style={{ ...fadeIn, height: "100%", width: "100%", display: "flex", flexDirection: "column", padding: "20px" }}>
        <div data-module-name={res.name || `图片 ${page + 1}`} data-module-type="image" style={{ ...slideUp(0), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: bg, borderRadius: 8, marginBottom: 12 }}>
          <img src={res.images[page]?.url || res.images[0]?.url} alt={res.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 4 }} />
        </div>
        <div style={{ ...slideUp(0.1), display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, color: isDark ? "#fff" : tk.textPrimary, fontWeight: 600 }}>{res.name}</div>
          <div style={{ display: "flex", gap: 4 }}>
            {res.images.map((_, i) => (
              <span key={i} onClick={() => setPage(i)} style={{
                fontSize: 11, width: 28, height: 28, borderRadius: 4, cursor: "pointer",
                color: i === page ? (isDark ? "#fff" : tk.textReverse) : fg3,
                background: i === page ? tk.brandDefault : bg2,
                border: i === page ? `1px solid ${tk.brandDefault}` : `1px solid ${border2}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (res.type === "网页") {
    return (
      <div style={{ ...fadeIn, height: "100%", width: "100%", display: "flex", flexDirection: "column", padding: "20px" }}>
        <div style={{ ...slideUp(0), flex: 1, background: bg, borderRadius: 8, border: `1px solid ${border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: bg2, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5DB897" }} />
            </div>
            <div style={{ fontSize: 12, color: fg3, flex: 1, textAlign: "center" }}>{res.name}</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🌐</div>
              <div style={{ fontSize: 18, color: isDark ? "#fff" : tk.textPrimary, fontWeight: 600, marginBottom: 8 }}>{res.name}</div>
              <div style={{ fontSize: 14, color: fg2 }}>{res.summary}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (res.type === "音频") {
    return (
      <div style={{ ...fadeIn, height: "100%", width: "100%", display: "flex", flexDirection: "column", padding: "20px", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...slideUp(0), width: 120, height: 120, borderRadius: "50%", background: isDark ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" : tk.bgPrimary, border: `2px solid ${border2}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: 48 }}>🎵</div>
        </div>
        <div style={{ ...slideUp(0.1), fontSize: 20, color: isDark ? "#fff" : tk.textPrimary, fontWeight: 600, marginBottom: 8 }}>{res.name}</div>
        <div style={{ ...slideUp(0.2), fontSize: 14, color: fg2, marginBottom: 24 }}>{res.summary}</div>
        <div style={{ ...slideUp(0.3), width: "100%", maxWidth: 400, display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ width: 44, height: 44, borderRadius: "50%", background: tk.brandDefault, color: tk.textReverse, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            <Play size={18} />
          </button>
          <div style={{ flex: 1, height: 6, background: bg2, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "30%", height: "100%", background: tk.brandDefault, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 12, color: fg3 }}>01:30 / 03:45</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...fadeIn, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: fg3 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ ...slideUp(0), fontSize: 48, marginBottom: 12 }}>{res.thumb}</div>
        <div style={{ ...slideUp(0.1), fontSize: 18, color: isDark ? "#fff" : tk.textPrimary, fontWeight: 600 }}>{res.name}</div>
        <div style={{ ...slideUp(0.2), fontSize: 14, marginTop: 4, color: fg2 }}>{res.summary}</div>
      </div>
    </div>
  );
}

// ─── Teaching Mode (full-screen dark) ───────────────────────────────────────
function TeachingMode({ cls, onExit, onExitRequest, reviewMode = false, exitLabel, phases: externalPhases, resources: externalResources }: {
  cls: ClassItem;
  onExit?: () => void;
  onExitRequest?: () => void;
  reviewMode?: boolean;
  exitLabel?: string;
  phases?: typeof CLASS_PACKAGE_PHASES;
  resources?: typeof CLASS_PACKAGE_RESOURCES;
}) {
  // 使用外部传入的数据或默认数据
  const resources = externalResources || CLASS_PACKAGE_RESOURCES;
  const phases = externalPhases || CLASS_PACKAGE_PHASES;
  // 当前选中的资源（阶段索引 + 阶段内子资源索引）
  const [activeRes, setActiveRes] = useState<{ phaseIdx: number; resIdx: number }>({ phaseIdx: 0, resIdx: 0 });
  // 当前资源内的页/小节索引（PPT/教案/视频/练习/作业 通用）
  const [page, setPage] = useState(0);
  const switchResource = (phaseIdx: number, resIdx: number) => {
    setActiveRes({ phaseIdx, resIdx });
    setPage(0);
  };
  // 底部浮层开关
  const [showToc, setShowToc] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showInteract, setShowInteract] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  // 步骤导航水平滚动
  const tocScrollRef = useRef<HTMLDivElement | null>(null);
  const [tocOverflow, setTocOverflow] = useState(false);
  useEffect(() => {
    const el = tocScrollRef.current;
    if (!el) return;
    const check = () => setTocOverflow(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showToc]);
  // Esc 关闭浮层
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowToc(false); setShowPlan(false); setShowInteract(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  // 切换资源时归零页码
  useEffect(() => { setPage(0); }, [activeRes.phaseIdx, activeRes.resIdx]);

  const phase = phases[activeRes.phaseIdx];
  const res = resources[phase.resIdx[activeRes.resIdx]];
  // 当前资源可翻页条目数
  const pageCount = res.pages?.length ?? res.toc?.length ?? res.chapters?.length ?? 1;

  // 步骤卡片宽度：根据该阶段子资源名长度动态撑开
  const stepCardWidth = Math.max(220, 40 + phase.resIdx.reduce((s, idx) => {
    const r = resources[idx];
    return s + r.name.length * 10 + 28;
  }, 0));

  // 资源类型 icon
  const typeBadge: Record<ClassPackageRes["type"], { bg: string; color: string; label: string }> = {
    PPT:  { bg: "rgba(10,124,87,0.18)", color: "#5DB897", label: "PPT" },
    教案: { bg: "rgba(16,185,129,0.18)", color: "#34d399", label: "教案" },
    视频: { bg: "rgba(244,114,182,0.18)", color: "#f472b6", label: "视频" },
    练习: { bg: "rgba(251,191,36,0.18)", color: "#fbbf24", label: "练习" },
    作业: { bg: "rgba(167,139,250,0.18)", color: "#a78bfa", label: "作业" },
    文档: { bg: "rgba(59,130,246,0.18)", color: "#60a5fa", label: "文档" },
    音频: { bg: "rgba(236,72,153,0.18)", color: "#fb7185", label: "音频" },
    图片: { bg: "rgba(20,184,166,0.18)", color: "#2dd4bf", label: "图片" },
    网页: { bg: "rgba(148,163,184,0.18)", color: "#94a3b8", label: "网页" },
  };
  const badge = typeBadge[res.type];

  return (
    <div className="dark" style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "#0a0a0a", display: "flex", flexDirection: "column", userSelect: "none",
    }}>
      {/* 顶部极简标题（仅标识，不可操作） */}
      <div style={{
        height: 40, display: "flex", alignItems: "center", padding: "0 20px",
        color: "rgba(255,255,255,0.45)", fontSize: 12, letterSpacing: "0.02em",
      }}>
        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{cls.title}</span>
        <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
        <span>{cls.grade}</span>
        <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
        <span>{cls.teacher}</span>
      </div>

      {/* 中央放映区 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, minHeight: 0 }}>
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(180deg, #15151c 0%, #0f0f15 100%)",
          borderRadius: 0, boxShadow: "none",
          border: "none",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* 放映区顶部：阶段 + 资源名 + 类型徽标（PPT 投屏风格，极简） */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                background: tk.bgBrandSubtle, color: tk.textBrand,
                border: `1px solid ${tk.brandDefault}`, borderRadius: 5,
                fontSize: 11, fontWeight: 700, padding: "2px 8px",
              }}>§{phase.num} {phase.title}</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>{res.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                background: badge.bg, color: badge.color,
              }}>{badge.label}</span>
            </div>
          </div>

          {/* 放映主体：按资源类型渲染 */}
          <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
            {/* 主体：内容区（占满宽度，类似 PPT 投屏） */}
            <div style={{ flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "auto", minWidth: 0 }}>
              {renderResourceContent(res, page, setPage, "dark")}
            </div>
          </div>
        </div>
      </div>

      {/* AI学习建议：学生端侧边抽屉（点击底部"AI学习建议"按钮唤起） */}
      {reviewMode && showAdvice && (
        <div onClick={() => setShowAdvice(false)} style={{
          position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.35)",
        }} />
      )}
      {reviewMode && showAdvice && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 340, zIndex: 2001,
          background: "linear-gradient(180deg, #15151c 0%, #0f0f15 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.5)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={14} color={tk.textBrand} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>AI学习建议</span>
            </div>
            <button onClick={() => setShowAdvice(false)} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4, width: 26, height: 26, padding: 0, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)",
            }}><X size={13} /></button>
          </div>
          <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: 14, overflow: "auto" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
              <span style={{ color: tk.textBrand, fontWeight: 600 }}>1. 核心知识巩固</span><br/>
              本堂课应重点复习「勾股定理应用题」，特别是已知两边求斜边的解题步骤。
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
              <span style={{ color: tk.textBrand, fontWeight: 600 }}>2. 错题复盘建议</span><br/>
              第 3 题错题建议：先标注直角边，再代入公式，避免概念混淆。
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
              <span style={{ color: tk.textBrand, fontWeight: 600 }}>3. 下一步预习</span><br/>
              熟悉三角函数中的 sin/cos 关系，便于后续学习。
            </div>
            <div style={{ marginTop: 6, padding: "10px 12px", borderRadius: 6,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              以上建议基于本堂课课堂表现与错题分析，帮助你更快巩固核心知识。
            </div>
          </div>
        </div>
      )}

      {/* 底部工具栏（所有操作集中在这里） */}
      <div style={{
        height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", borderTop: "1px solid rgba(255,255,255,0.08)",
        background: "#0d0d0d", flexShrink: 0,
      }}>
        {/* 左：三个快捷按钮 */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowToc(v => !v); setShowPlan(false); setShowInteract(false); }} style={{
            background: showToc ? tk.bgBrandSubtle : "rgba(255,255,255,0.08)",
            border: `1px solid ${showToc ? tk.brandDefault : "rgba(255,255,255,0.12)"}`, borderRadius: 6,
            color: showToc ? tk.textBrand : "rgba(255,255,255,0.8)",
            fontSize: 12, padding: "7px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5, fontWeight: 500,
          }}><Layers size={13} /> 目录</button>
          {!reviewMode && (
            <button onClick={() => { setShowPlan(v => !v); setShowToc(false); setShowInteract(false); }} style={{
              background: showPlan ? tk.bgBrandSubtle : "rgba(255,255,255,0.08)",
              border: `1px solid ${showPlan ? tk.brandDefault : "rgba(255,255,255,0.12)"}`, borderRadius: 6,
              color: showPlan ? tk.textBrand : "rgba(255,255,255,0.8)",
              fontSize: 12, padding: "7px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5, fontWeight: 500,
            }}><FileText size={13} /> 教案</button>
          )}
          {!reviewMode && (
            <button onClick={() => { setShowInteract(v => !v); setShowToc(false); setShowPlan(false); setShowAdvice(false); }} style={{
              background: showInteract ? tk.bgBrandSubtle : "rgba(255,255,255,0.08)",
              border: `1px solid ${showInteract ? tk.brandDefault : "rgba(255,255,255,0.12)"}`, borderRadius: 6,
              color: showInteract ? tk.textBrand : "rgba(255,255,255,0.8)",
              fontSize: 12, padding: "7px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5, fontWeight: 500,
            }}><Users size={13} /> 互动工具</button>
          )}
          {reviewMode && (
            <button onClick={() => { setShowAdvice(v => !v); setShowToc(false); setShowPlan(false); setShowInteract(false); }} style={{
              background: showAdvice ? tk.bgBrandSubtle : "rgba(255,255,255,0.08)",
              border: `1px solid ${showAdvice ? tk.brandDefault : "rgba(255,255,255,0.12)"}`, borderRadius: 6,
              color: showAdvice ? tk.textBrand : "rgba(255,255,255,0.8)",
              fontSize: 12, padding: "7px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5, fontWeight: 500,
            }}><Sparkles size={13} /> AI学习建议</button>
          )}
        </div>

        {/* 中：翻页（在所有资源颗粒之间翻动） */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => {
            const newResIdx = activeRes.resIdx - 1;
            if (newResIdx >= 0) {
              switchResource(activeRes.phaseIdx, newResIdx);
            } else if (activeRes.phaseIdx > 0) {
              const prevPhase = phases[activeRes.phaseIdx - 1];
              switchResource(activeRes.phaseIdx - 1, prevPhase.resIdx.length - 1);
            }
          }} disabled={activeRes.phaseIdx === 0 && activeRes.resIdx === 0} style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6, color: "rgba(255,255,255,0.8)", width: 36, height: 36,
            cursor: activeRes.phaseIdx === 0 && activeRes.resIdx === 0 ? "default" : "pointer",
            opacity: activeRes.phaseIdx === 0 && activeRes.resIdx === 0 ? 0.4 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", minWidth: 56, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
            {(() => {
              let total = 0;
              for (let i = 0; i < activeRes.phaseIdx; i++) {
                total += phases[i].resIdx.length;
              }
              total += activeRes.resIdx + 1;
              let totalAll = 0;
              phases.forEach(p => totalAll += p.resIdx.length);
              return `${total} / ${totalAll}`;
            })()}
          </span>
          <button onClick={() => {
            const currentPhase = phases[activeRes.phaseIdx];
            const newResIdx = activeRes.resIdx + 1;
            if (newResIdx < currentPhase.resIdx.length) {
              switchResource(activeRes.phaseIdx, newResIdx);
            } else if (activeRes.phaseIdx < phases.length - 1) {
              switchResource(activeRes.phaseIdx + 1, 0);
            }
          }} disabled={activeRes.phaseIdx === phases.length - 1 && activeRes.resIdx === phases[phases.length - 1].resIdx.length - 1} style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6, color: "rgba(255,255,255,0.8)", width: 36, height: 36,
            cursor: activeRes.phaseIdx === phases.length - 1 && activeRes.resIdx === phases[phases.length - 1].resIdx.length - 1 ? "default" : "pointer",
            opacity: activeRes.phaseIdx === phases.length - 1 && activeRes.resIdx === phases[phases.length - 1].resIdx.length - 1 ? 0.4 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><ChevronRight size={16} /></button>
        </div>

        {/* 右：退出授课 */}
        <button onClick={onExitRequest || onExit} style={{
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 6, color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500,
          padding: "7px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <X size={13} /> {reviewMode ? (exitLabel ?? "退出回顾") : (exitLabel ?? "退出授课")}
        </button>
      </div>

      {/* 步骤导航浮层（吸底显示，与详情页全屏态完全一致） */}
      {showToc && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 2010, maxWidth: "calc(100vw - 80px)",
          background: "rgba(20,20,24,0.98)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={13} color={tk.textBrand} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>课堂包步骤导航</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>· 共 {phases.length} 步</span>
            </div>
            <button onClick={() => setShowToc(false)} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4, width: 22, height: 22, padding: 0, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)",
            }}><X size={12} /></button>
          </div>
          <div style={{ position: "relative" }}>
            {tocOverflow && (
              <button onClick={() => tocScrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })} style={{
                position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)",
                zIndex: 2, width: 28, height: 28, borderRadius: "50%",
                background: "rgba(40,40,46,0.95)", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.8)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}><ChevronLeft size={14} /></button>
            )}
            {tocOverflow && (
              <button onClick={() => tocScrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })} style={{
                position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)",
                zIndex: 2, width: 28, height: 28, borderRadius: "50%",
                background: "rgba(40,40,46,0.95)", border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.8)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}><ChevronRight size={14} /></button>
            )}
            <div ref={tocScrollRef} className="hide-scrollbar" style={{
              display: "flex", gap: 10, overflowX: "auto", padding: "2px 4px",
            }}>
              {phases.map((p, pi) => {
                const isCurrent = pi === activeRes.phaseIdx;
                return (
                  <div key={p.num} style={{
                    flex: `0 0 ${stepCardWidth}px`,
                    background: isCurrent ? tk.bgBrandSubtle : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isCurrent ? tk.brandDefault : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 8, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        background: isCurrent ? tk.brandDefault : "rgba(255,255,255,0.08)",
                        color: isCurrent ? "#fff" : "rgba(255,255,255,0.5)",
                        fontSize: 11, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{p.num}</span>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: isCurrent ? tk.textBrand : "rgba(255,255,255,0.85)",
                      }}>{p.title}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>{p.duration}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", paddingLeft: 26 }}>{p.subtitle}</div>
                    <div style={{ display: "flex", flexWrap: "nowrap", gap: 4, marginTop: 2, paddingLeft: 26, overflow: "hidden" }}>
                      {p.resIdx.map((ridx, ri) => {
                        const r = resources[ridx];
                        const isActiveRes = isCurrent && ri === activeRes.resIdx;
                        return (
                          <button key={r.id} onClick={() => switchResource(pi, ri)} style={{
                            width: 64, height: 44, borderRadius: 4, cursor: "pointer",
                            border: `2px solid ${isActiveRes ? tk.brandDefault : "rgba(255,255,255,0.1)"}`,
                            background: isActiveRes ? tk.bgBrandSubtle : "#1a1a24",
                            padding: 2,
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            gap: 2,
                            transition: "all 0.2s",
                          }}>
                            <img
                              src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`educational ${r.type} thumbnail preview ${r.name}`)}&image_size=square`}
                              alt={r.name}
                              style={{ width: "100%", height: "70%", objectFit: "cover", borderRadius: 2 }}
                            />
                            <span style={{ fontSize: 8, color: isActiveRes ? tk.textBrand : "rgba(255,255,255,0.5)", fontWeight: isActiveRes ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                              {r.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 教案浮层 */}
      {showPlan && (
        <div style={{
          position: "fixed", bottom: 80, left: 24,
          background: "rgba(20,20,24,0.98)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12, padding: 16, width: 320, maxHeight: 400, overflowY: "auto",
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)", backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>教案</span>
            <button onClick={() => setShowPlan(false)} style={{
              background: "transparent", border: "none", color: "rgba(255,255,255,0.4)",
              cursor: "pointer", padding: 0, display: "flex",
            }}><X size={14} /></button>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: "20px", whiteSpace: "pre-wrap" }}>
            {`§1 导入（5min）展示自然风景图片，激活学生背景知识。\n\n§2 词汇预热（10min）ecosystem / habitat / biodiversity。\n\n§3 精读训练（20min）段落结构分析，推断词义策略。\n\n§4 小组讨论（10min）"How can we protect local ecosystems?"\n\n§5 小结（5min）思维导图回顾，布置课后作业。`}
          </div>
        </div>
      )}

      {/* 互动工具浮层 */}
      {showInteract && (
        <div style={{
          position: "fixed", bottom: 80, left: 24,
          background: "rgba(20,20,24,0.98)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12, padding: 16, minWidth: 220,
          boxShadow: "0 16px 48px rgba(0,0,0,0.5)", backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>互动工具</span>
            <button onClick={() => setShowInteract(false)} style={{
              background: "transparent", border: "none", color: "rgba(255,255,255,0.4)",
              cursor: "pointer", padding: 0, display: "flex",
            }}><X size={14} /></button>
          </div>
          {[
            { name: "课堂讨论", icon: <MessageSquare size={14} /> },
            { name: "随堂练习", icon: <PenLine size={14} /> },
            { name: "随机点名", icon: <Users size={14} /> },
          ].map(tool => (
            <button key={tool.name} style={{
              width: "100%", background: "rgba(10,124,87,0.18)",
              border: `1px solid rgba(10,124,87,0.35)`, borderRadius: 8,
              color: tk.textBrand, fontSize: 13, fontWeight: 500,
              padding: "10px 14px", cursor: "pointer", marginBottom: 8, textAlign: "left",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {tool.icon}{tool.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Class Detail Page ───────────────────────────────────────────────────────
const LESSON_PLAN_TEXT = `教学目标
• 掌握本单元核心词汇（15个）
• 理解并运用扫读、精读策略
• 能用英语描述自然现象

教学环节
一、导入（5min）
展示自然风景图片，引发学生对"自然"话题的兴趣。

二、词汇预热（10min）
重点词汇：ecosystem / habitat / biodiversity

三、精读训练（20min）
段落结构分析 + 推断词义策略。

四、小组讨论（10min）
"How can we protect local ecosystems?"

五、小结（5min）
思维导图回顾，布置课后练习。`;

// ─── IconTip：icon 按钮 + hover tooltip（小字浮动在按钮上方） ────────────────
function IconTip({ label, active, children }: { label: string; active?: boolean; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const childRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setShow(true);
  };

  return (
    <div
      ref={childRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      style={{ position: "relative", display: "inline-flex" }}
    >
      {children}
      {show && createPortal(
        <div style={{
          position: "fixed", left: position.x, top: position.y,
          transform: "translate(-50%, -100%) translateY(-6px)",
          background: "rgba(0,0,0,0.85)", color: "#fff",
          fontSize: 11, lineHeight: "16px", padding: "3px 7px", borderRadius: 4,
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 9999,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}>{label}</div>,
        document.body
      )}
    </div>
  );
}

function ClassDetailPage({ cls, onTeach, initialTab, minimalMode, setMinimalMode, onModulesChange }: {
  cls: ClassItem; onTeach: () => void;
  initialTab?: "package" | "analysis";
  minimalMode: boolean; setMinimalMode: (v: boolean) => void;
  onModulesChange?: (module: { name: string; type: string; id: number }) => void;
}) {
  const [detailTab, setDetailTab] = useState<"package" | "analysis">(initialTab ?? "package");
  const [rightPanel, setRightPanel] = useState<"none" | "ai" | "plan">("none");
  const [moreOpen, setMoreOpen] = useState(false);  // 标题区右上"更多"下拉
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-detail-more]")) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(cls.title);
  const [editGrade, setEditGrade] = useState(cls.grade);
  const [editTeacher, setEditTeacher] = useState(cls.teacher);
  const [editTime, setEditTime] = useState(cls.time);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "你好！我是本课堂的 AI 助教，可以帮你优化课件、调整难度、生成变体题目或重写教案内容。" },
  ]);
  const [previewing, setPreviewing] = useState(false);
  useEffect(() => {
    if (previewing) {
      toastInfo("处于预览模式，退出不会生成课后分析");
    }
  }, [previewing]);

  const [planText, setPlanText] = useState(LESSON_PLAN_TEXT);
  const [pageIndex, setPageIndex] = useState(0);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [hoveredRes, setHoveredRes] = useState<{ phaseIdx: number; resIdx: number } | null>(null);
  const [elementSelectMode, setElementSelectMode] = useState(false);
  const [hoveredModule, setHoveredModule] = useState<{ name: string; type: string; rect: DOMRect } | null>(null);
  const [selectedModule, setSelectedModule] = useState<{ name: string; type: string; rect: DOMRect } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 课后分析视图自身的子状态
  const [reportTab, setReportTab] = useState(0);
  const [hwQuestion, setHwQuestion] = useState(0);
  const [hasHomework, setHasHomework] = useState(true);
  const reportTabs = ["总览", "课堂练习分析", "知识点掌握", "AI 建议", "课后作业"];

  // 使用共享数据作为初始值（支持编辑时的状态变化）
  const [resources, setResources] = useState<ClassPackageRes[]>(JSON.parse(JSON.stringify(CLASS_PACKAGE_RESOURCES)));
  // 编辑草稿：进入编辑态时从当前资源快照
  const [draft, setDraft] = useState<ClassPackageRes | null>(null);
  // 环节流程卡 — 阶段 → 子资源（引用 resources 索引），先定义供 activeResource 使用
  const [phases, setPhases] = useState<ClassPackagePhase[]>(JSON.parse(JSON.stringify(CLASS_PACKAGE_PHASES)));

  // active 资源定位：{ 阶段索引, 该阶段下子资源索引 }，初始指向第一阶段第一子资源
  const [activeRes, setActiveRes] = useState<{ phaseIdx: number; resIdx: number }>({ phaseIdx: 0, resIdx: 0 });

  const switchResource = (phaseIdx: number, resIdx: number) => {
    setActiveRes({ phaseIdx, resIdx });
    setPageIndex(0);
    if (editing) {
      const newResource = resources[phases[phaseIdx]?.resIdx?.[resIdx] ?? 0];
      setDraft({
        ...newResource,
        sections: newResource.sections ? newResource.sections.map(s => ({ ...s })) : [],
        questions: newResource.questions ? newResource.questions.map(q => ({ ...q, options: [...q.options] })) : [],
        pages: newResource.pages ? [...newResource.pages] : [],
        chapters: newResource.chapters ? [...newResource.chapters] : [],
      });
    }
  };

  // 拖拽排序状态：支持步骤和子资源的拖拽重排
  const [dragInfo, setDragInfo] = useState<
    | { kind: "step"; fromIdx: number }
    | { kind: "res"; fromPhaseIdx: number; fromResIdx: number }
    | null
  >(null);
  const [dropTarget, setDropTarget] = useState<
    | { kind: "step"; idx: number; edge: "left" | "right" }
    | { kind: "res"; phaseIdx: number; resIdx: number; edge?: "left" | "right" }
    | null
  >(null);
  // 步骤更多操作（重命名/删除）下拉
  const [stepMoreOpen, setStepMoreOpen] = useState<number | null>(null);
  const [stepMorePos, setStepMorePos] = useState<{ top: number; left: number } | null>(null);
  // 重命名弹窗
  const [renameTarget, setRenameTarget] = useState<{ phaseIdx: number; value: string } | null>(null);
  const phaseScrollRef = useRef<HTMLDivElement | null>(null);
  // 步骤卡条：是否鼠标悬停 + 内容是否超过一屏
  const [phasesHover, setPhasesHover] = useState(false);
  const [phasesOverflow, setPhasesOverflow] = useState(false);
  const [phasesCollapsed, setPhasesCollapsed] = useState(false);
  useEffect(() => {
    const el = phaseScrollRef.current;
    if (!el) return;
    const check = () => setPhasesOverflow(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    el.addEventListener("scroll", check);
    return () => { ro.disconnect(); el.removeEventListener("scroll", check); };
  }, [phases.length]);
  const panelDrag = useDragResize(360, 280, 640);

  // 当前选中的资源对象
  const activeResource = activeRes.phaseIdx === -1 
    ? ({ 
        id: "lesson-plan", name: "教案", type: "教案", 
        tags: ["教案"], summary: "教学流程、讲义等其他内容",
        toc: ["生活情境导入", "教学要点", "常见误区", "课堂小结"],
        sections: [
          { heading: "一、生活情境导入", body: "【教师话术】同学们，请观察这张图：梯子斜靠在墙上，离墙 6 米，梯子长 10 米，问梯子顶端离地多高？——引出本节课题。" },
          { heading: "二、教学要点", body: "强调「直角三角形」是前提条件，非直角不成立；区分「斜边 c」与「直角边 a / b」，避免符号混淆；公式 a² + b² = c² 中，c 永远是斜边；常见勾股数：3-4-5、5-12-13、8-15-17、7-24-25。" },
          { heading: "三、常见误区", body: "1) 把 c² 错位放成 a²；2) 单位忘记统一（如一边用米、一边用厘米）；3) 答题漏写「c = 6 米」。" },
          { heading: "四、课堂小结", body: "本节课主要学习了勾股定理的概念、公式推导及应用。请同学们课后完成习题册第 15-18 题。" },
        ]
      } as ClassPackageRes)
    : resources[phases[activeRes.phaseIdx]?.resIdx?.[activeRes.resIdx] ?? 0];
  // 编辑态下渲染的是 draft；非编辑态下渲染 activeResource。
  const view = editing && draft !== null ? draft : activeResource!;
  const currentPhase = activeRes.phaseIdx === -1 ? undefined : phases[activeRes.phaseIdx];
  const phaseResources = currentPhase ? currentPhase.resIdx.map(idx => resources[idx]) : [];
  // 草稿更新工具
  const patchDraft = (p: Partial<ClassPackageRes>) => setDraft(d => d ? { ...d, ...p } : d);
  const updateTag        = (i: number, v: string) => { const t = [...(view.tags || [])]; t[i] = v; patchDraft({ tags: t }); };
  const removeTag        = (i: number)        => { const t = (view.tags || []).filter((_, k) => k !== i); patchDraft({ tags: t }); };
  const addTag           = ()                 => { const t = [...(view.tags || []), "新标签"]; patchDraft({ tags: t }); };
  const updateTocItem    = (i: number, v: string) => { const t = [...(view.toc || [])]; t[i] = v; patchDraft({ toc: t }); };
  const removeTocItem    = (i: number)        => { const t = (view.toc || []).filter((_, k) => k !== i); patchDraft({ toc: t }); };
  const addTocItem       = ()                 => { const t = [...(view.toc || []), "新章节"]; patchDraft({ toc: t }); };
  const updateSection    = (i: number, p: Partial<{ heading: string; body: string; image?: string; imageCaption?: string }>) => {
    const arr = (view.sections || []).map((s, k) => k === i ? { ...s, ...p } : s);
    patchDraft({ sections: arr });
  };
  const removeSection    = (i: number)        => { const t = (view.sections || []).filter((_, k) => k !== i); patchDraft({ sections: t }); };
  const addSection       = ()                 => { const t = [...(view.sections || []), { heading: "新小节", body: "" }]; patchDraft({ sections: t }); };
  const updatePage       = (i: number, v: string) => { const t = [...(view.pages || [])]; t[i] = { title: v, content: "", layout: "content" as const }; patchDraft({ pages: t }); };
  const removePage       = (i: number)        => { const t = (view.pages || []).filter((_, k) => k !== i); patchDraft({ pages: t }); };
  const addPage          = ()                 => { const t = [...(view.pages || []), { title: "新条目", content: "", layout: "content" as const }]; patchDraft({ pages: t }); };
  const updateChapter    = (i: number, p: Partial<{ title: string; time: string }>) => {
    const arr = (view.chapters || []).map((c, k) => k === i ? { ...c, ...p } : c);
    patchDraft({ chapters: arr });
  };
  const removeChapter    = (i: number)        => { const t = (view.chapters || []).filter((_, k) => k !== i); patchDraft({ chapters: t }); };
  const addChapter       = ()                 => { const t = [...(view.chapters || []), { time: "00:00", title: "新章节" }]; patchDraft({ chapters: t }); };
  const updateQuestion   = (i: number, p: Partial<{ question: string; options: string[]; answer: number; type: string }>) => {
    const arr = (view.questions || []).map((q, k) => k === i ? { ...q, ...p } : q);
    patchDraft({ questions: arr });
  };
  const removeQuestion   = (i: number)        => { const t = (view.questions || []).filter((_, k) => k !== i); patchDraft({ questions: t }); };
  const addQuestion      = ()                 => { const t = [...(view.questions || []), { id: Date.now(), question: "新题目", options: ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"], answer: 0, type: "单选题" }]; patchDraft({ questions: t }); };
  const updateOption     = (qi: number, oi: number, v: string) => {
    const arr = (view.questions || []).map((q, ki) => {
      if (ki !== qi) return q;
      const opts = [...(q.options || [])];
      opts[oi] = v;
      return { ...q, options: opts };
    });
    patchDraft({ questions: arr });
  };

  // —— 新增：预览区全屏 / 全屏态下的目录浮层 / 步骤导航添加按钮 ——
  const [previewFs, setPreviewFs] = useState(false);              // 预览区独立全屏
  const [tocPanelOpen, setTocPanelOpen] = useState(false);        // 全屏态下的横向步骤导航浮层
  const [phasesAddOpen, setPhasesAddOpen] = useState(false);      // 步骤导航常驻 + 按钮的下拉
  const phasesAddRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!phasesAddOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-phases-add]")) setPhasesAddOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [phasesAddOpen]);

  // 步骤「更多」下拉：点击外部关闭
  useEffect(() => {
    if (stepMoreOpen === null) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-step-more]")) setStepMoreOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [stepMoreOpen]);

  // 全屏态下打开目录浮层时，确保默认选中当前活动资源
  useEffect(() => {
    if (previewFs) {
      setTocPanelOpen(false);
    }
  }, [previewFs]);

  // ESC 退出全屏
  useEffect(() => {
    if (!previewFs) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewFs(false);
        setTocPanelOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [previewFs]);

  // 全屏态下：横向「步骤导航」浮层专用滚动
  const tocScrollRef = useRef<HTMLDivElement | null>(null);
  const [tocOverflow, setTocOverflow] = useState(false);
  useEffect(() => {
    const el = tocScrollRef.current;
    if (!el) return;
    const check = () => setTocOverflow(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    el.addEventListener("scroll", check);
    return () => { ro.disconnect(); el.removeEventListener("scroll", check); };
  }, [tocPanelOpen, previewFs]);

  const scrollPhasesBy = (dir: 1 | -1) => {
    const el = phaseScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const scrollTocBy = (dir: 1 | -1) => {
    const el = tocScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.7), behavior: "smooth" });
  };

  // 拖拽排序工具函数
  function reorderSteps(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    setPhases(prev => {
      const next = prev.slice();
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      // 重排后保持 1..N 顺序
      return next.map((p, i) => ({ ...p, num: i + 1 }));
    });
    toastInfo("排序已完成");
  }

  function moveResource(fromPhaseIdx: number, fromResIdx: number, toPhaseIdx: number, toResIdx: number) {
    if (fromPhaseIdx === toPhaseIdx && fromResIdx === toResIdx) return;
    setPhases(prev => {
      const next = prev.map(p => ({ ...p, resIdx: p.resIdx.slice() }));
      const [moved] = next[fromPhaseIdx].resIdx.splice(fromResIdx, 1);
      next[toPhaseIdx].resIdx.splice(toResIdx, 0, moved);
      return next;
    });
    toastInfo("排序已完成");
  }

  function deleteStep(phaseIdx: number) {
    const p = phases[phaseIdx];
    if (!p) return;
    setPhases(prev => prev.filter((_, i) => i !== phaseIdx).map((ph, i) => ({ ...ph, num: i + 1 })));
    toastInfo(`已删除步骤「${p.title}」（演示）`);
  }

  function renameStep(phaseIdx: number, newTitle: string) {
    if (!newTitle.trim()) return;
    setPhases(prev => prev.map((p, i) => i === phaseIdx ? { ...p, title: newTitle.trim() } : p));
    toastInfo(`已重命名为「${newTitle.trim()}」（演示）`);
  }

  function deleteResource(phaseIdx: number, resIdx: number) {
    const p = phases[phaseIdx];
    if (!p) return;
    const resourceIdx = p.resIdx[resIdx];
    const resource = resources[resourceIdx];
    setPhases(prev => {
      const next = prev.map(p => ({ ...p, resIdx: p.resIdx.slice() }));
      next[phaseIdx].resIdx.splice(resIdx, 1);
      return next;
    });
    toastInfo(`已删除资源「${resource?.name || '未知'}」`);
  }

  function togglePanel(panel: "ai" | "plan") {
    setRightPanel(v => v === panel ? "none" : panel);
  }

  const btnStyle = (active: boolean) => ({
    background: active ? tk.bgBrandSubtle : "none",
    color: active ? tk.textBrand : tk.textSecondary,
    border: `1px solid ${active ? tk.borderBrand : tk.borderHairline}`,
    borderRadius: tk.radiusSm, fontSize: 12, padding: "5px 11px",
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    transition: "all 0.12s",
  } as React.CSSProperties);

  // icon-only 按钮：方形、只放图标，与 btnStyle 同色系但更紧凑
  const iconBtnStyle = (active: boolean) => ({
    background: active ? tk.bgBrandSubtle : "none",
    color: active ? tk.textBrand : tk.textSecondary,
    border: `1px solid ${active ? tk.borderBrand : tk.borderHairline}`,
    borderRadius: tk.radiusSm, padding: "5px 8px",
    cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.12s",
  } as React.CSSProperties);

  // 预览模式：使用 TeachingMode 暗黑全屏授课视图
  // 必须在所有 hooks 之后调用（rules of hooks）
  if (previewing) {
    return <TeachingMode cls={cls} exitLabel="退出预览" onExit={() => setPreviewing(false)} phases={phases} resources={resources} />;
  }

  // 胶囊分段样式
  const segmentStyle = (active: boolean) => ({
    background: active ? tk.bgWhite : "transparent",
    color: active ? tk.textBrand : tk.textSecondary,
    border: "none",
    fontSize: 12, fontWeight: active ? 600 : 400,
    padding: "5px 14px", cursor: "pointer",
    display: "inline-flex", alignItems: "center", gap: 5,
    borderRadius: tk.radiusFull,
    transition: "all 0.14s",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
  } as React.CSSProperties);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: tk.bgPrimary, overflow: "hidden" }}>
      {/* 胶囊分段控件：课堂包详情 / 课后分析（位于标题区上方）—— 精简模式下隐藏 */}
      {!minimalMode && (
        <div style={{ background: tk.bgWhite, padding: `8px ${tk.spacingLg} 0`, borderBottom: `1px solid ${tk.borderHairline}`, flexShrink: 0 }}>
          <div style={{
            display: "inline-flex", background: tk.bgPrimary,
            border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusFull,
            padding: 3, gap: 2,
          }}>
            <button onClick={() => setDetailTab("package")} style={segmentStyle(detailTab === "package")}>
              <Layers size={12} /> 课堂包详情
            </button>
            <button onClick={() => setDetailTab("analysis")} style={segmentStyle(detailTab === "analysis")}>
              <BarChart2 size={12} /> 课后分析
            </button>
          </div>
        </div>
      )}

      {/* Header — no inner breadcrumb, merged into this bar */}
      <div style={{ background: tk.bgWhite, padding: `${tk.spacingMd} ${tk.spacingLg}`, borderBottom: `1px solid ${tk.borderHairline}`, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          {/* Left: editable meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              {editing ? (
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{
                  fontSize: 16, fontWeight: 600, color: tk.textPrimary, border: `1px solid ${tk.borderBrand}`,
                  borderRadius: tk.radiusSm, padding: "3px 8px", outline: "none", fontFamily: "var(--font-family)",
                }} />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary }}>{editTitle}</span>
              )}
              <StatusTag status={cls.status} />
            </div>
            {editing ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "学科", val: editTitle, setter: setEditTitle, opts: ["英语", "数学", "语文", "物理"] },
                  { label: "班级", val: editGrade, setter: setEditGrade, opts: ["高一(1)班","高一(2)班","高一(3)班","高一(4)班"] },
                  { label: "教师", val: editTeacher, setter: setEditTeacher, opts: ["王老师","张老师","李老师"] },
                ].map(f => (
                  <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, color: tk.textPlaceholder }}>{f.label}</span>
                    <select value={f.val} onChange={e => f.setter(e.target.value)} style={{
                      fontSize: 12, border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm,
                      padding: "2px 6px", outline: "none", background: tk.bgWhite, cursor: "pointer",
                    }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: tk.textPlaceholder }}>时间</span>
                  <input value={editTime} onChange={e => setEditTime(e.target.value)} style={{
                    fontSize: 12, border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm,
                    padding: "2px 6px", outline: "none", background: tk.bgWhite, width: 130,
                  }} />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 14 }}>
                {[{ icon: <BookMarked size={11} />, val: cls.subject },
                  { icon: <Users size={11} />, val: editGrade },
                  { icon: <Clock size={11} />, val: editTime },
                  { icon: <GraduationCap size={11} />, val: editTeacher }].map((m, i) => (
                  <span key={i} style={{ fontSize: 12, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
                    {m.icon}{m.val}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: action buttons — 课堂包详情与课后分析共用一份标题区，胶囊下按钮按当前胶囊动态切换 */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
            {/* 更多 icon：点击下拉浮层（下载 / 分享 / 删除-危险） */}
            <div data-detail-more style={{ position: "relative" }}>
              <button
                onClick={() => setMoreOpen(v => !v)}
                style={{
                  ...btnStyle(moreOpen),
                  padding: "5px 8px",
                }}
                title="更多"
              >
                <MoreHorizontal size={14} />
              </button>
              {moreOpen && (
                <div
                  data-detail-more
                  style={{
                    position: "absolute", top: "calc(100% + 4px)", right: 0,
                    minWidth: 140, zIndex: 20,
                    background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                    borderRadius: tk.radiusMd, boxShadow: tk.shadowLg,
                    padding: 4, display: "flex", flexDirection: "column", gap: 1,
                  }}
                >
                  <button onClick={() => { setMoreOpen(false); setEditing(true); }} style={{
                    background: "none", border: "none", padding: "8px 10px",
                    fontSize: 12, color: tk.textPrimary, textAlign: "left",
                    cursor: "pointer", borderRadius: tk.radiusSm,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <PenLine size={13} /> 重命名
                  </button>
                  <button onClick={() => { setMoreOpen(false); toast("已复制课堂，已创建临时副本"); }} style={{
                    background: "none", border: "none", padding: "8px 10px",
                    fontSize: 12, color: tk.textPrimary, textAlign: "left",
                    cursor: "pointer", borderRadius: tk.radiusSm,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <ClipboardList size={13} /> 复制课堂
                  </button>
                  <button onClick={() => setMoreOpen(false)} style={{
                    background: "none", border: "none", padding: "8px 10px",
                    fontSize: 12, color: tk.textPrimary, textAlign: "left",
                    cursor: "pointer", borderRadius: tk.radiusSm,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <Download size={13} /> 下载
                  </button>
                  <button onClick={() => setMoreOpen(false)} style={{
                    background: "none", border: "none", padding: "8px 10px",
                    fontSize: 12, color: tk.textPrimary, textAlign: "left",
                    cursor: "pointer", borderRadius: tk.radiusSm,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <Share2 size={13} /> 分享
                  </button>
                  <div style={{ height: 1, background: tk.borderHairline, margin: "4px 0" }} />
                  <button onClick={() => setMoreOpen(false)} style={{
                    background: "none", border: "none", padding: "8px 10px",
                    fontSize: 12, color: tk.textError, textAlign: "left",
                    cursor: "pointer", borderRadius: tk.radiusSm,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <Trash2 size={13} /> 删除
                  </button>
                </div>
              )}
            </div>

            {detailTab === "package" ? (
              editing ? (
                /* 编辑态：只保留「取消」和「完成编辑（保存）」——主要操作放右侧 */
                <>
                  <button onClick={() => {
                    setEditing(false);
                    toastInfo("已取消编辑");
                  }} style={{
                    ...btnStyle(false),
                  }}><X size={12} /> 取消</button>
                  <button onClick={() => {
                    // 提交：把草稿写回 resources（mock 持久化），并提示
                    if (activeRes.phaseIdx === -1) {
                      toast("教案已更新");
                    } else if (draft) {
                      const next = resources.map(r => r.id === draft.id ? { ...r, ...draft } : r);
                      setResources(next);
                      toast("保存成功 · 「" + draft.name + "」已更新");
                    }
                    setEditing(false);
                  }} style={{
                    background: tk.brandDefault, color: tk.textReverse, border: "none",
                    borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600, padding: "6px 16px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                  }}><Check size={13} /> 完成编辑</button>
                </>
              ) : (
                <>
                  {/* 精简模式：icon 按钮 + hover tooltip（顶部小字提示） */}
                  
                  <IconTip label="AI 助教" active={rightPanel === "ai"}>
                    <button style={iconBtnStyle(rightPanel === "ai")} onClick={() => togglePanel("ai")}>
                      <Sparkles size={14} />
                    </button>
                  </IconTip>
                  <IconTip label={phasesCollapsed ? "展开目录" : "收起目录"} active={!phasesCollapsed}>
                    <button style={iconBtnStyle(!phasesCollapsed)} onClick={() => {
                      setPhasesCollapsed(!phasesCollapsed);
                    }}>
                      <List size={14} />
                    </button>
                  </IconTip>
                  <IconTip label={minimalMode ? "退出精简模式" : "精简模式"} active={minimalMode}>
                    <button
                      style={iconBtnStyle(minimalMode)}
                      onClick={() => setMinimalMode(!minimalMode)}
                    >
                      {minimalMode ? <PanelRight size={14} /> : <PanelLeft size={14} />}
                    </button>
                  </IconTip>

                  <button onClick={() => {
                    setDraft({
                      id: activeResource.id,
                      type: activeResource.type,
                      name: activeResource.name,
                      summary: activeResource.summary,
                      tags: [...activeResource.tags],
                      toc: activeResource.toc ? [...activeResource.toc] : [],
                      sections: activeResource.sections ? activeResource.sections.map(s => ({ ...s })) : [],
                      pages: activeResource.pages ? [...activeResource.pages] : [],
                      chapters: activeResource.chapters ? activeResource.chapters.map(c => ({ ...c })) : [],
                      questions: activeResource.questions ? activeResource.questions.map(q => ({ ...q, options: [...q.options] })) : [],
                    });
                    setEditing(true);
                  }} style={btnStyle(false)}>
                    <Edit3 size={12} /> 编辑
                  </button>
                  <button onClick={() => { setPreviewing(true); }} style={{
                    ...btnStyle(false), display: "flex", alignItems: "center", gap: 6
                  }} title="预览（授课暗黑模式）">
                    <Eye size={12} /> 预览
                  </button>
                  <button onClick={onTeach} style={{
                    background: tk.brandDefault, color: tk.textReverse, border: "none",
                    borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600, padding: "6px 16px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                  }}><BookOpen size={13} /> 去授课</button>
                </>
              )
            ) : (
              /* 课后分析胶囊下：仅保留 更多 下拉（下载/分享/删除），其他隐藏 */
              null
            )}
          </div>
        </div>
      </div>

      {/* Body — 根据胶囊Tab切换显示：课堂包详情 或 课后分析 */}
      {detailTab === "package" ? (
        <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
          <div style={{ flex: rightPanel === "ai" ? 3 : 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            {!phasesCollapsed && (
              <div style={{ flexShrink: 0, position: "relative", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}` }}>
              <div ref={phaseScrollRef} className="hide-scrollbar" style={{
                display: "flex", gap: 8, overflowX: "auto", padding: "8px",
                scrollbarWidth: "none", msOverflowStyle: "none",
                paddingRight: phasesOverflow ? 96 : 64,
                paddingLeft: phasesOverflow ? 32 : 0,
              }}>
                <div
                  onClick={() => { setActiveRes({ phaseIdx: -1, resIdx: 0 }); setPageIndex(0); }}
                  style={{
                    flex: "0 0 auto", cursor: "pointer",
                    display: "flex", flexDirection: "column",
                    background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                    borderRadius: 4, height: 100,
                  }}
                >
                  <div style={{
                    background: tk.bgPrimary, padding: "4px 8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "2px 2px 0 0",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 400, color: tk.textPlaceholder }}>教案</span>
                  </div>
                  <div style={{
                    display: "flex", padding: 8, gap: 8,
                    borderTop: `1px solid ${tk.borderHairline}`,
                    height: "calc(100% - 30px)",
                  }}>
                    <div style={{
                      width: 100, height: 56, borderRadius: 4,
                      background: activeRes.phaseIdx === -1 ? tk.bgBrandSubtle : tk.bgWhite,
                      border: activeRes.phaseIdx === -1 ? `2px solid ${tk.brandDefault}` : `1px solid ${tk.borderHairline}`,
                      position: "relative", overflow: "hidden",
                    }}>
                      <img
                        src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lesson%20plan%20document%20preview%20education%20classroom%20clean%20minimal&image_size=square"
                        alt="教案"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </div>

                {phases.map((p, pi) => {
                  const isCurrentPhase = activeRes.phaseIdx === pi;
                  const phaseResources = p.resIdx.map(idx => resources[idx] || null).filter(Boolean);
                  const isStepDragging = dragInfo?.kind === "step" && dragInfo.fromIdx === pi;
                  const isStepDragOver = dropTarget?.kind === "step" && dropTarget.idx === pi;
                  const isStepDragOverLeft = isStepDragOver && dropTarget?.edge === "left";
                  const isStepDragOverRight = isStepDragOver && dropTarget?.edge === "right";
                  return (
                    <div
                      key={p.num}
                      draggable={pi > 0}
                      onDragStart={() => {
                        if (pi > 0) {
                          setDragInfo({ kind: "step", fromIdx: pi });
                        }
                      }}
                      onDragOver={(e) => {
                        if (dragInfo?.kind !== "step") {
                          e.stopPropagation();
                          return;
                        }
                        e.preventDefault();
                        if (pi > 0) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const edge = e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                          setDropTarget({ kind: "step", idx: pi, edge });
                        }
                      }}
                      onDrop={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (dragInfo?.kind === "step" && dragInfo.fromIdx !== pi && pi > 0 && dropTarget?.kind === "step") {
                          const toIdx = dropTarget.edge === "left" ? pi : pi + (dragInfo.fromIdx < pi ? 0 : -1);
                          reorderSteps(dragInfo.fromIdx, Math.max(1, toIdx));
                        }
                        if (dragInfo?.kind !== "step") {
                          setDragInfo(null);
                          setDropTarget(null);
                        }
                      }}
                      onDragEnd={() => {
                        setDragInfo(null);
                        setDropTarget(null);
                      }}
                      style={{
                        flex: "0 0 auto",
                        display: "flex", flexDirection: "column",
                        background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                        borderRadius: 4, height: 100,
                        opacity: isStepDragging ? 0.5 : 1,
                        cursor: pi > 0 ? "grab" : "default",
                        position: "relative",
                      }}
                    >
                      {isStepDragOverLeft && (
                        <div style={{
                          position: "absolute", left: -6, top: 0, bottom: 0,
                          width: 6, background: tk.brandDefault,
                          borderRadius: 3, zIndex: 5,
                          boxShadow: `0 0 8px ${tk.brandDefault}`,
                        }} />
                      )}
                      {isStepDragOverRight && (
                        <div style={{
                          position: "absolute", right: -6, top: 0, bottom: 0,
                          width: 6, background: tk.brandDefault,
                          borderRadius: 3, zIndex: 5,
                          boxShadow: `0 0 8px ${tk.brandDefault}`,
                        }} />
                      )}
                      <div style={{
                        background: tk.bgPrimary, padding: "4px 8px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        borderRadius: "2px 2px 0 0",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{
                            fontSize: 12, fontWeight: 600, color: tk.textPlaceholder,
                            width: 16, height: 16, borderRadius: "50%",
                            background: tk.bgSecondary, display: "flex",
                            alignItems: "center", justifyContent: "center",
                          }}>{p.num}</span>
                          <span style={{ fontSize: 12, fontWeight: 400, color: tk.textPlaceholder }}>
                            {p.title}：{p.subtitle}（{p.duration}）
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStepMoreOpen(stepMoreOpen === pi ? null : pi);
                            const rect = e.currentTarget.getBoundingClientRect();
                            setStepMorePos({ top: rect.bottom + 4, left: rect.left - 40 });
                          }}
                          style={{
                            background: tk.bgSecondary, border: "none", cursor: "pointer",
                            padding: "4px 6px", borderRadius: 2,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: tk.textPlaceholder,
                          }}
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                      <div style={{
                        display: "flex", padding: 8, gap: 8,
                        borderTop: `1px solid ${tk.borderHairline}`,
                        height: "calc(100% - 30px)",
                        overflowX: "auto",
                      }}>
                        {phaseResources.length === 0 ? (
                          <div style={{
                            flex: "0 0 auto",
                            width: 100, height: 56, borderRadius: 4,
                            background: tk.bgWhite, border: `1px dashed ${tk.borderDefault}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                          }} onClick={() => toastInfo("点击添加资源颗粒（演示）")}>
                            <Plus size={20} style={{ color: tk.textPlaceholder }} />
                          </div>
                        ) : (
                          phaseResources.map((res, ri) => {
                            const isCurrent = isCurrentPhase && activeRes.resIdx === ri;
                            const isHovered = hoveredRes?.phaseIdx === pi && hoveredRes?.resIdx === ri;
                            const isDragging = dragInfo?.kind === "res" && dragInfo.fromPhaseIdx === pi && dragInfo.fromResIdx === ri;
                            const isResDragOverLeft = dropTarget?.kind === "res" && dropTarget.phaseIdx === pi && dropTarget.resIdx === ri && dropTarget.edge === "left";
                            const isResDragOverRight = dropTarget?.kind === "res" && dropTarget.phaseIdx === pi && dropTarget.resIdx === ri && dropTarget.edge === "right";
                            return (
                              <div
                                key={res.id}
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  e.dataTransfer.effectAllowed = "move";
                                  setDragInfo({ kind: "res", fromPhaseIdx: pi, fromResIdx: ri });
                                }}
                                onDragOver={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const edge = e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                                  setDropTarget({ kind: "res", phaseIdx: pi, resIdx: ri, edge });
                                }}
                                onDrop={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (dragInfo?.kind === "res") {
                                    const sourcePhaseIdx = dragInfo.fromPhaseIdx;
                                    const sourceResIdx = dragInfo.fromResIdx;
                                    const targetPhaseIdx = pi;
                                    const dropEdge = dropTarget?.edge || "left";
                                    let targetResIdx = ri;
                                    if (dropEdge === "right") {
                                      targetResIdx = ri + 1;
                                    }
                                    setPhases(prevPhases => {
                                      const newPhases = prevPhases.map(p => ({ ...p, resIdx: [...p.resIdx] }));
                                      const sourceResId = newPhases[sourcePhaseIdx].resIdx.splice(sourceResIdx, 1)[0];
                                      if (sourcePhaseIdx === targetPhaseIdx && sourceResIdx < targetResIdx) {
                                        targetResIdx -= 1;
                                      }
                                      newPhases[targetPhaseIdx].resIdx.splice(targetResIdx, 0, sourceResId);
                                      return newPhases;
                                    });
                                    toastInfo("排序已完成");
                                  }
                                  setDragInfo(null);
                                  setDropTarget(null);
                                }}
                                onDragEnd={() => {
                                  setDragInfo(null);
                                  setDropTarget(null);
                                }}
                                onClick={() => { 
                  setActiveRes({ phaseIdx: pi, resIdx: ri }); 
                  setPageIndex(0); 
                  if (editing) {
                    const newResource = resources[phases[pi]?.resIdx?.[ri] ?? 0];
                    setDraft({
                      ...newResource,
                      sections: newResource.sections ? newResource.sections.map(s => ({ ...s })) : [],
                      questions: newResource.questions ? newResource.questions.map(q => ({ ...q, options: [...q.options] })) : [],
                      pages: newResource.pages ? [...newResource.pages] : [],
                      chapters: newResource.chapters ? [...newResource.chapters] : [],
                    });
                  }
                }}
                                onMouseEnter={() => setHoveredRes({ phaseIdx: pi, resIdx: ri })}
                                onMouseLeave={() => setHoveredRes(null)}
                                style={{
                                  flex: "0 0 auto", cursor: "pointer",
                                  width: 100, height: 56, borderRadius: 4,
                                  border: isCurrent ? `2px solid ${tk.brandDefault}` : isDragging ? `2px solid ${tk.brandDefault}` : `1px solid ${tk.borderHairline}`,
                                  position: "relative", overflow: "hidden",
                                  opacity: isDragging ? 0.5 : 1,
                                  boxShadow: isDragging ? "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.06)" : isCurrent ? `0 0 8px ${tk.brandDefault}` : "none",
                                }}
                              >
                                {isResDragOverLeft && (
                                  <div style={{
                                    position: "absolute", left: -6, top: 0, bottom: 0,
                                    width: 6, background: tk.brandDefault,
                                    borderRadius: 3, zIndex: 5,
                                    boxShadow: `0 0 8px ${tk.brandDefault}`,
                                  }} />
                                )}
                                {isResDragOverRight && (
                                  <div style={{
                                    position: "absolute", right: -6, top: 0, bottom: 0,
                                    width: 6, background: tk.brandDefault,
                                    borderRadius: 3, zIndex: 5,
                                    boxShadow: `0 0 8px ${tk.brandDefault}`,
                                  }} />
                                )}
                                {res.type === "PPT" && res.pages && res.pages[0]?.image && (
                                  <img src={res.pages[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                )}
                                {res.type === "图片" && res.images && res.images[0]?.url && (
                                  <img src={res.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                )}
                                {res.type === "视频" && (
                                  <img
                                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20playback%20interface%20education%20classroom%20preview&image_size=square"
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                )}
                                {res.type === "网页" && (
                                  <img
                                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=web%20page%20interface%20education%20tool%20preview&image_size=square"
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                )}
                                {res.type === "教案" && (
                                  <img
                                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=document%20lesson%20plan%20education%20preview&image_size=square"
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                )}
                                {res.type === "练习" && (
                                  <img
                                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quiz%20question%20education%20test%20preview&image_size=square"
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                )}
                                {res.type === "作业" && (
                                  <img
                                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=homework%20assignment%20education%20preview&image_size=square"
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                )}
                                {res.type === "音频" && (
                                  <img
                                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=audio%20player%20interface%20education%20preview&image_size=square"
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                )}
                                {(isHovered || isCurrent) && (
                                  <div style={{
                                    position: "absolute", bottom: 0, left: 0, right: 0,
                                    background: "rgba(0,0,0,0.7)",
                                    padding: "4px 6px",
                                    borderRadius: "0 0 4px 4px",
                                  }}>
                                    <span style={{ fontSize: 12, color: "#fff", fontWeight: 400, textAlign: "center", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{res.name}</span>
                                  </div>
                                )}
                                {isHovered && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteResource(pi, ri); }}
                                    style={{
                                      position: "absolute", top: 4, right: 4,
                                      width: 20, height: 20,
                                      background: "rgba(0,0,0,0.7)",
                                      border: "none", borderRadius: "50%",
                                      cursor: "pointer",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      color: "#fff",
                                    }}
                                    title="删除"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setPhases(prev => {
                    const newPhases = [...prev, {
                      num: prev.length + 1,
                      title: "新阶段",
                      subtitle: "自定义阶段",
                      duration: "约5分",
                      resIdx: [],
                    }];
                    setTimeout(() => {
                      if (phaseScrollRef.current) {
                        phaseScrollRef.current.scrollTo({ left: phaseScrollRef.current.scrollWidth, behavior: "smooth" });
                      }
                    }, 100);
                    return newPhases;
                  });
                  toastInfo("已添加新阶段");
                }}
                style={{
                  position: "absolute", right: 0, top: 0, bottom: 0,
                  zIndex: 10, width: 32,
                  background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                  borderLeft: "none",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "-2px 0px 4px 0px rgba(0,0,0,0.04)",
                  color: tk.textPlaceholder,
                }}
                title="添加阶段"
              >
                <Plus size={14} />
              </button>

              {phasesOverflow && (
                <>
                  <button
                    onClick={() => scrollPhasesBy(-1)}
                    style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      zIndex: 10, width: 32,
                      background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                      borderRight: "none",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "-2px 0px 4px 0px rgba(0,0,0,0.04)",
                    }}
                  >
                    <ChevronLeft size={14} style={{ color: tk.textSecondary }} />
                  </button>
                  <button
                    onClick={() => scrollPhasesBy(1)}
                    style={{
                      position: "absolute", right: 32, top: 0, bottom: 0,
                      zIndex: 10, width: 32,
                      background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                      borderLeft: "none",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "-2px 0px 4px 0px rgba(0,0,0,0.04)",
                    }}
                  >
                    <ChevronRight size={14} style={{ color: tk.textSecondary }} />
                  </button>
                </>
              )}

              {stepMoreOpen !== null && stepMorePos && (
                <div
                  data-step-more
                  style={{
                    position: "fixed", top: stepMorePos.top, left: stepMorePos.left,
                    minWidth: 100, zIndex: 30,
                    background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                    borderRadius: tk.radiusMd, boxShadow: tk.shadowLg,
                    padding: 4, display: "flex", flexDirection: "column", gap: 1,
                  }}
                >
                  <button
                    onClick={() => {
                      const p = phases[stepMoreOpen];
                      if (p) {
                        setRenameTarget({ phaseIdx: stepMoreOpen, value: p.title });
                      }
                      setStepMoreOpen(null);
                    }}
                    style={{
                      background: "none", border: "none", padding: "6px 10px",
                      fontSize: 12, color: tk.textPrimary, textAlign: "left",
                      cursor: "pointer", borderRadius: tk.radiusSm,
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <Edit3 size={12} /> 重命名
                  </button>
                  <button
                    onClick={() => {
                      deleteStep(stepMoreOpen);
                      setStepMoreOpen(null);
                    }}
                    style={{
                      background: "none", border: "none", padding: "6px 10px",
                      fontSize: 12, color: tk.textError, textAlign: "left",
                      cursor: "pointer", borderRadius: tk.radiusSm,
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <Trash2 size={12} /> 删除
                  </button>
                </div>
              )}
              </div>
            )}

          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, background: tk.bgPrimary, padding: 16 }}>
            <div style={{ flex: rightPanelCollapsed ? 1 : 3, background: tk.bgWhite, overflow: "hidden", minWidth: 0, position: "relative", borderRadius: 8 }}>
              <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", gap: 4 }}>
                <button onClick={() => setPreviewFs(true)} title="全屏" style={{
                  background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                  borderRadius: tk.radiusSm, padding: "4px 6px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28,
                }}>
                  <Maximize2 size={14} style={{ color: tk.textSecondary }} />
                </button>
                <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)} title={rightPanelCollapsed ? "展开资源信息" : "收起资源信息"} style={{
                  background: rightPanelCollapsed ? tk.bgWhite : tk.bgBrandSubtle,
                  border: rightPanelCollapsed ? `1px solid ${tk.borderDefault}` : `1px solid ${tk.borderBrand}`,
                  borderRadius: tk.radiusSm, padding: "4px 6px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28,
                  transition: "0.12s",
                }}>
                  <ClipboardList size={14} style={{ color: rightPanelCollapsed ? tk.textSecondary : tk.textBrand }} />
                </button>
              </div>
              <div 
                ref={previewRef}
                style={{ height: "100%", overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", scrollbarWidth: "none", msOverflowStyle: "none" }}
                onMouseOver={(e) => {
                  if (!elementSelectMode) return;
                  let target = (e.target as HTMLElement).closest('[data-module-name]');
                  if (!target) {
                    target = e.target as HTMLElement;
                  }
                  if (target) {
                    target.style.outline = `2px solid ${tk.brandDefault}`;
                    target.style.outlineOffset = "2px";
                    target.style.backgroundColor = "rgba(16,185,129,0.08)";
                    target.style.borderRadius = "4px";
                    const name = target.getAttribute('data-module-name') || target.tagName.toLowerCase() + (target.textContent?.trim() ? `: ${target.textContent.trim().slice(0, 20)}` : '');
                    const type = target.getAttribute('data-module-type') || target.tagName.toLowerCase();
                    const rect = target.getBoundingClientRect();
                    setHoveredModule({ name, type, rect });
                  }
                }}
                onMouseOut={(e) => {
                  if (!elementSelectMode) return;
                  let target = (e.target as HTMLElement).closest('[data-module-name]');
                  if (!target) {
                    target = e.target as HTMLElement;
                  }
                  if (target) {
                    target.style.outline = "";
                    target.style.outlineOffset = "";
                    target.style.backgroundColor = "";
                    target.style.borderRadius = "";
                  }
                  setHoveredModule(null);
                }}
                onClick={(e) => {
                  if (!elementSelectMode) return;
                  let target = (e.target as HTMLElement).closest('[data-module-name]');
                  if (!target) {
                    target = e.target as HTMLElement;
                  }
                  if (target) {
                    const name = target.getAttribute('data-module-name') || target.tagName.toLowerCase() + (target.textContent?.trim() ? `: ${target.textContent.trim().slice(0, 20)}` : '');
                    const type = target.getAttribute('data-module-type') || target.tagName.toLowerCase();
                    const rect = target.getBoundingClientRect();
                    setSelectedModule({ name, type, rect });
                  } else {
                    setSelectedModule(null);
                  }
                }}
              >
                {activeRes.phaseIdx === -1 ? (
                  <div style={{ padding: tk.spacingLg }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary, marginBottom: 16 }}>教案</div>
                    <div style={{ fontSize: 13, color: tk.textSecondary, lineHeight: "1.8" }}>
                      {view.sections?.map((section, si) => (
                        <div 
                          key={si} 
                          style={{ marginBottom: 16 }}
                          data-module-name={section.heading}
                          data-module-type="section"
                        >
                          <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>{section.heading}</div>
                          {editing ? (
                            <textarea
                              value={section.body}
                              onChange={e => updateSection(si, { body: e.target.value })}
                              rows={4}
                              style={{
                                width: "100%", fontSize: 13, color: tk.textSecondary, lineHeight: "1.8",
                                border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                                padding: "8px 12px", outline: "none", resize: "vertical",
                                background: tk.bgWhite, fontFamily: "var(--font-family)",
                              }}
                            />
                          ) : (
                            <div>{section.body}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderResourceContent(view, pageIndex, setPageIndex, "light", editing, {
                    updatePage, updateSection, updateChapter, updateQuestion, updateOption,
                    patchDraft,
                  }, elementSelectMode)
                )}
              </div>

              {(hoveredModule || selectedModule) && (
                <div 
                  style={{
                    position: "fixed",
                    left: (hoveredModule || selectedModule)!.rect.left,
                    top: (hoveredModule || selectedModule)!.rect.top - 24,
                    backgroundColor: tk.brandDefault,
                    color: tk.textReverse,
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 4,
                    zIndex: 9999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {(hoveredModule || selectedModule)!.name}
                </div>
              )}

              {selectedModule && (
                <div 
                  style={{
                    position: "fixed",
                    left: selectedModule.rect.left + selectedModule.rect.width - 80,
                    top: selectedModule.rect.top + 8,
                    zIndex: 9999,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newModule = { name: selectedModule.name, type: selectedModule.type, id: Date.now() };
                      if (onModulesChange) {
                        onModulesChange(newModule);
                      }
                      setSelectedModule(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      backgroundColor: tk.bgWhite,
                      border: `1px solid ${tk.borderBrand}`,
                      borderRadius: tk.radiusSm,
                      color: tk.textBrand,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      boxShadow: tk.shadowMd,
                    }}
                  >
                    <MessageSquarePlus size={14} />
                    添加到对话
                  </button>
                </div>
              )}
            </div>

            {!rightPanelCollapsed && (
              <div style={{ flex: 1, background: tk.bgPrimary, flexShrink: 0, overflowY: "auto", padding: 0, marginLeft: 12 }}>
                <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: "1px solid " + tk.borderHairline, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid " + tk.borderHairline }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>资源信息</span>
                    <button onClick={() => setRightPanelCollapsed(true)} title="收起资源信息" style={{
                      background: tk.bgPrimary, border: "none", cursor: "pointer",
                      padding: "4px 6px", borderRadius: tk.radiusSm,
                      width: 24, height: 24,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <X size={14} style={{ color: tk.textSecondary }} />
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingMd }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
                      {activeRes.phaseIdx === -1 ? (
                        <div style={{ background: tk.bgSecondary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                          <div style={{ fontSize: 12, color: tk.textSecondary, lineHeight: "1.6" }}>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>类型</div>
                              <div>教案</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>描述</div>
                              <div>教学流程、讲义等其他内容</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
                          {(() => {
                            const phase = phases[activeRes.phaseIdx];
                            const globalIdx = phase?.resIdx[activeRes.resIdx];
                            const resource = globalIdx !== undefined ? resources[globalIdx] : null;
                            if (!resource) return null;
                            return (
                              <>
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                  <span style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary }}>{resource.name}</span>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <Info size={12} style={{ color: tk.textPlaceholder }} />
                                    <span style={{ fontSize: 12, color: tk.textPlaceholder }}>此模块内容授课时不显示</span>
                                  </div>
                                </div>

                                <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusMd, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 12, color: tk.textPlaceholder }}>讲授时间建议</span>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>{phase?.duration || "—"}</span>
                                </div>

                                <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>资源简介</div>
                                  <div style={{ fontSize: 14, color: tk.textSecondary, lineHeight: 1.6 }}>{resource.summary}</div>
                                  {resource.tags && resource.tags.length > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                                      {resource.tags.map((tag, ti) => (
                                        <span key={ti} style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, background: tk.bgSecondary, padding: "4px 10px", borderRadius: tk.radiusSm }}>
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>讲授备注</div>
                                  <div style={{ fontSize: 14, color: tk.textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                    {resource.teachingNotes}
                                  </div>
                                </div>

                                {resource.attachments && resource.attachments.length > 0 && (
                                  <div style={{ background: tk.bgSecondary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>附件</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                      {resource.attachments.map((att, ati) => (
                                        <div key={ati} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <div style={{ width: 24, height: 24, borderRadius: tk.radiusSm, background: tk.bgPrimary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <FileText size={12} />
                                          </div>
                                          <div>
                                            <div style={{ fontSize: 12, color: tk.textPrimary }}>{att.name}</div>
                                            <div style={{ fontSize: 10, color: tk.textPlaceholder }}>{att.size}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
          </div>

            {rightPanel === "ai" && (
              <div style={{ flex: 1, background: tk.bgWhite, flexShrink: 0, overflowY: "auto", padding: 0, marginLeft: 12, borderRadius: tk.radiusMd, border: "1px solid " + tk.borderHairline, display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid " + tk.borderHairline }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>AI 助教</span>
                  <button onClick={() => togglePanel("ai")} style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "2px", borderRadius: tk.radiusSm,
                  }}>
                    <X size={14} style={{ color: tk.textPlaceholder }} />
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingMd, display: "flex", flexDirection: "column", gap: 12 }}>
                  {aiMessages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: msg.role === "ai" ? tk.bgBrandSubtle : tk.bgPrimary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {msg.role === "ai" ? <Sparkles size={14} style={{ color: tk.textBrand }} /> : <User size={14} style={{ color: tk.textSecondary }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: msg.role === "ai" ? tk.textBrand : tk.textSecondary, marginBottom: 4 }}>{msg.role === "ai" ? "AI 助教" : "我"}</div>
                        <div style={{ fontSize: 12, color: tk.textPrimary, lineHeight: "1.6", background: msg.role === "ai" ? tk.bgPrimary : tk.bgSecondary, padding: "8px 12px", borderRadius: tk.radiusMd }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: tk.spacingMd, borderTop: "1px solid " + tk.borderHairline, display: "flex", gap: 8 }}>
                  <input
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && aiInput.trim()) {
                        setAiMessages(prev => [...prev, { role: "user", text: aiInput.trim() }]);
                        setAiInput("");
                        setTimeout(() => {
                          setAiMessages(prev => [...prev, { role: "ai", text: "好的，我来帮你分析一下这个问题..." }]);
                        }, 500);
                      }
                    }}
                    placeholder="输入你的问题..."
                    style={{
                      flex: 1, fontSize: 12, border: `1px solid ${tk.borderDefault}`,
                      borderRadius: tk.radiusMd, padding: "8px 12px", outline: "none",
                      background: tk.bgPrimary, color: tk.textPrimary,
                    }}
                  />
                  <button onClick={() => {
                    if (aiInput.trim()) {
                      setAiMessages(prev => [...prev, { role: "user", text: aiInput.trim() }]);
                      setAiInput("");
                      setTimeout(() => {
                        setAiMessages(prev => [...prev, { role: "ai", text: "好的，我来帮你分析一下这个问题..." }]);
                      }, 500);
                    }
                  }} style={{
                    background: tk.brandDefault, color: tk.textReverse, border: "none",
                    borderRadius: tk.radiusMd, padding: "8px 12px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <SendHorizonal size={14} />
                  </button>
                </div>
              </div>
            )}
      </div>
    ) : (
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: tk.bgPrimary }}>
        {cls.status === "done" ? (
          <>
            {/* 标题区由父级统一提供（课堂名 + 状态 + 操作按钮），此处不再重复子标题 */}

            {/* 统计卡 */}
            <div style={{ padding: `${tk.spacingMd} ${tk.spacingLg}`, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: tk.spacingMd }}>
              {[
                { label: "平均正确率", value: "0%" },
                { label: "在线参与",   value: "—" },
                { label: "作答学生",   value: "—" },
                { label: "练习题数",   value: "4" },
              ].map(s => (
                <div key={s.label} style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: tk.textPrimary, lineHeight: "36px" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* 子 Tab — 总览 / 课堂练习分析 / 知识点掌握 / AI 建议 / 课后作业 */}
            <div style={{ padding: `0 ${tk.spacingLg}`, background: tk.bgWhite, borderTop: `1px solid ${tk.borderHairline}`, borderBottom: `1px solid ${tk.borderHairline}`, display: "flex" }}>
              {reportTabs.map((t, i) => (
                <button key={t} onClick={() => setReportTab(i)} style={{
                  background: "none", border: "none",
                  borderBottom: reportTab === i ? `2px solid ${tk.brandDefault}` : "2px solid transparent",
                  color: reportTab === i ? tk.textBrand : tk.textSecondary,
                  fontSize: 13, fontWeight: reportTab === i ? 600 : 400,
                  padding: "12px 18px", cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap",
                }}>{t}</button>
              ))}
            </div>

            {/* Tab 内容 */}
            <div style={{ padding: tk.spacingLg, flex: 1 }}>
              {reportTab === 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: tk.spacingMd }}>
                  <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 12 }}>课堂练习分析</div>
                    <div style={{ fontSize: 12, color: tk.textSecondary, marginBottom: 10 }}>先看摘出比较 · 查看摘出和比较结果</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {["管对", "答错", "未交", "未次练习"].map(f => (
                        <button key={f} style={{
                          background: f === "答错" ? tk.bgBrandSubtle : tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
                          borderRadius: tk.radiusFull, fontSize: 11, padding: "3px 10px",
                          color: f === "答错" ? tk.textBrand : tk.textSecondary, cursor: "pointer",
                        }}>{f}</button>
                      ))}
                    </div>
                    <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusSm, padding: 12, borderLeft: `3px solid ${tk.textWarning}` }}>
                      <div style={{ fontSize: 11, color: tk.textWarning, marginBottom: 4 }}>优先讲解</div>
                      <div style={{ fontSize: 12, color: tk.textPrimary }}>在直角三角形 ABC 中，∠C＝90°，若斜边 AB 的长度为 13，且其中一股 BC 的长度为 5，…</div>
                    </div>
                  </div>
                  <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 12 }}>知识点掌握</div>
                    <div style={{ fontSize: 12, color: tk.textSecondary }}>先看风险知识点 · 优先讲解学生掌握较弱的知识点，快速指出针对题点。</div>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                      {[{ label: "勾股定理概念", pct: 85 }, { label: "斜边计算", pct: 62 }, { label: "逆勾股定理", pct: 40 }].map(k => (
                        <div key={k.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: tk.textSecondary, marginBottom: 4 }}>
                            <span>{k.label}</span><span>{k.pct}%</span>
                          </div>
                          <div style={{ height: 6, background: tk.bgSecondary, borderRadius: tk.radiusFull, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${k.pct}%`, background: k.pct > 70 ? tk.successDefault : k.pct > 50 ? tk.textWarning : tk.errorDefault, borderRadius: tk.radiusFull }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 12 }}>课后作业</div>
                    <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusSm, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>勾股定理作业</div>
                      <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 2 }}>51位学生 · 5题 · 进阶</div>
                    </div>
                    <div style={{ marginTop: 12, background: tk.bgBrandSubtle, borderRadius: tk.radiusSm, padding: "8px 12px", fontSize: 12, color: tk.textBrand }}>✓ 已布置（1份）</div>
                  </div>
                  <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>下堂课补讲与 AI 建议</div>
                      <button style={{ background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm, fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer" }}>AI 生成</button>
                    </div>
                    <div style={{ fontSize: 12, color: tk.textPlaceholder }}>未生成 — 点击右上角 AI 生成获取建议</div>
                  </div>
                </div>
              )}
              {reportTab === 1 && (
                <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 16 }}>练习详细分析</div>
                  {[{ q: "第1题", score: 92, issue: "大部分学生掌握" }, { q: "第2题", score: 45, issue: "逆勾股定理理解不足" }, { q: "第3题", score: 78, issue: "计算错误较多" }].map(q => (
                    <div key={q.q} style={{ marginBottom: 16, padding: 12, background: tk.bgPrimary, borderRadius: tk.radiusSm }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>{q.q}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: q.score > 70 ? tk.textSuccess : tk.textError }}>{q.score}%</span>
                      </div>
                      <div style={{ fontSize: 12, color: tk.textSecondary }}>{q.issue}</div>
                      <div style={{ height: 4, background: tk.bgSecondary, borderRadius: tk.radiusFull, marginTop: 8, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${q.score}%`, background: q.score > 70 ? tk.successDefault : tk.errorDefault, borderRadius: tk.radiusFull }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {reportTab === 2 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: tk.spacingMd }}>
                  {[{ label: "勾股定理", pct: 85, status: "掌握良好" }, { label: "斜边计算", pct: 62, status: "需要加强" }, { label: "逆勾股定理", pct: 40, status: "重点突破" }, { label: "实际应用", pct: 55, status: "需要练习" }, { label: "几何推导", pct: 70, status: "基本掌握" }, { label: "代入验算", pct: 90, status: "掌握良好" }].map(k => (
                    <div key={k.label} style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: k.pct > 70 ? tk.brandDefault : k.pct > 50 ? tk.textWarning : tk.errorDefault, marginBottom: 6 }}>{k.pct}%</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: 4 }}>{k.label}</div>
                      <div style={{ fontSize: 11, color: tk.textSecondary }}>{k.status}</div>
                    </div>
                  ))}
                </div>
              )}
              {reportTab === 3 && (
                <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Sparkles size={16} style={{ color: tk.brandDefault }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>AI 教学建议</span>
                  </div>
                  {[
                    { title: "重点补讲", content: "逆勾股定理的应用需要在下节课重点讲解，建议增加 2-3 道针对性练习题，帮助学生理解充分条件的概念。" },
                    { title: "学生关注", content: "班级内有 8 名学生在斜边计算题目中出现连续错误，建议课后一对一辅导或组织小组学习。" },
                    { title: "下堂课建议", content: "建议下堂课以复习形式开场（5分钟），然后引入实际生活场景（梯子、坡道），让学生在实际情境中应用定理。" },
                    { title: "资源推荐", content: "可使用 MyTA 生成一套「逆向出题」练习，让学生先构建情境再解题，有助于加深对定理本质的理解。" },
                  ].map(a => (
                    <div key={a.title} style={{ marginBottom: 16, padding: 14, background: tk.bgBrandSubtle, borderRadius: tk.radiusSm, borderLeft: `3px solid ${tk.brandDefault}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: tk.textBrand, marginBottom: 6 }}>{a.title}</div>
                      <div style={{ fontSize: 13, color: tk.textPrimary, lineHeight: "20px" }}>{a.content}</div>
                    </div>
                  ))}
                </div>
              )}
              {reportTab === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>课后作业</div>
                    {hasHomework && (
                      <button onClick={() => setHasHomework(false)} style={{
                        background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
                        fontSize: 12, color: tk.textSecondary, padding: "5px 12px", cursor: "pointer",
                      }}>清除作业</button>
                    )}
                  </div>
                  {hasHomework ? (
                    <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: `${tk.spacingMd} ${tk.spacingLg}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: tk.spacingMd }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>勾股定理作业</div>
                          <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 2 }}>31 位学生 · 5题 · 进阶</div>
                        </div>
                        <span style={{ fontSize: 12, color: tk.textBrand, fontWeight: 600 }}>已布置（1 份）</span>
                      </div>
                      <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusMd, padding: tk.spacingMd, fontSize: 13, color: tk.textPrimary, lineHeight: "22px" }}>
                        已知一直角三角形的两股边分别为 3 和 4，求其斜边长度为何？
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: `${tk.spacingXl} ${tk.spacingLg}`, textAlign: "center" }}>
                      <ClipboardList size={32} style={{ color: tk.textPlaceholder, marginBottom: 12 }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: tk.textSecondary, marginBottom: 6 }}>暂无课后作业</div>
                      <div style={{ fontSize: 12, color: tk.textPlaceholder, marginBottom: 20 }}>布置作业帮助学生巩固课堂所学内容</div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button onClick={() => setHasHomework(true)} style={{
                          background: tk.brandDefault, color: tk.textReverse, border: "none",
                          borderRadius: tk.radiusSm, fontSize: 13, fontWeight: 600,
                          padding: "8px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        }}><Plus size={14} /> 常规布置</button>
                        <button onClick={() => setHasHomework(true)} style={{
                          background: tk.bgBrandSubtle, color: tk.textBrand,
                          border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
                          fontSize: 13, fontWeight: 600, padding: "8px 20px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6,
                        }}><Sparkles size={14} /> AI 布置（出题专员）</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* 待授课 / 正在授课 — 空页面占位（与改前一致） */
          <div style={{
            background: tk.bgWhite, borderRadius: tk.radiusMd,
            border: `1px solid ${tk.borderHairline}`,
            height: "100%", minHeight: 360,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
            padding: tk.spacingLg,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: tk.bgPrimary, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <BarChart2 size={28} style={{ color: tk.textPlaceholder }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: tk.textSecondary, textAlign: "center" }}>
              请先完成授课，数据将在您完成后尽快展示
            </div>
            <div style={{ fontSize: 12, color: tk.textPlaceholder, textAlign: "center", maxWidth: 360 }}>
              课后分析将在课堂结束后自动生成，涵盖课堂练习、知识点掌握与 AI 改进建议。
            </div>
            <button onClick={onTeach} style={{
              marginTop: 8,
              background: tk.brandDefault, color: tk.textReverse, border: "none",
              borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600, padding: "7px 18px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}><BookOpen size={12} /> 去授课</button>
          </div>
        )}
      </div>
    )}

    {/* 重命名步骤弹窗 */}
      {renameTarget && (
        <div
          onClick={() => setRenameTarget(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(0,0,0,0.35)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: tk.bgWhite, borderRadius: tk.radiusMd, boxShadow: tk.shadowLg,
              padding: 18, width: 360, display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>重命名步骤</div>
            <input
              autoFocus
              value={renameTarget.value}
              onChange={e => setRenameTarget({ ...renameTarget, value: e.target.value })}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  renameStep(renameTarget.phaseIdx, renameTarget.value);
                  setRenameTarget(null);
                } else if (e.key === "Escape") {
                  setRenameTarget(null);
                }
              }}
              style={{
                width: "100%", boxSizing: "border-box", fontSize: 13,
                color: tk.textPrimary, border: `1px solid ${tk.borderBrand}`,
                borderRadius: tk.radiusSm, padding: "6px 10px", outline: "none",
                fontFamily: "var(--font-family)",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => setRenameTarget(null)}
                style={{
                  background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                  color: tk.textSecondary, fontSize: 12, padding: "5px 14px",
                  borderRadius: tk.radiusSm, cursor: "pointer",
                }}
              >取消</button>
              <button
                onClick={() => {
                  renameStep(renameTarget.phaseIdx, renameTarget.value);
                  setRenameTarget(null);
                }}
                style={{
                  background: tk.bgBrandDefault, border: `1px solid ${tk.brandDefault}`,
                  color: tk.textReverse, fontSize: 12, padding: "5px 14px",
                  borderRadius: tk.radiusSm, cursor: "pointer", fontWeight: 500,
                }}
              >确定</button>
            </div>
          </div>
        </div>
      )}

      {/* 预览区全屏 */}
      {previewFs && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: tk.bgPrimary, display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => {
                const newVal = !tocPanelOpen;
                setInternalTocPanelOpen(newVal);
                onTocOpenChange?.(newVal);
              }} style={{
                background: tocPanelOpen ? tk.bgBrandSubtle : tk.bgWhite,
                border: tocPanelOpen ? `1px solid ${tk.borderBrand}` : `1px solid ${tk.borderDefault}`,
                color: tocPanelOpen ? tk.textBrand : tk.textSecondary,
                padding: "6px 12px", borderRadius: tk.radiusSm, fontSize: 12,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>
                <List size={14} /> 目录
              </button>
              <div style={{ fontSize: 12, color: tk.textSecondary }}>
                {currentPhase?.title} · {activeResource.name}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)} title={rightPanelCollapsed ? "展开资源信息" : "收起资源信息"} style={{
                background: rightPanelCollapsed ? tk.bgWhite : tk.bgBrandSubtle,
                border: rightPanelCollapsed ? `1px solid ${tk.borderDefault}` : `1px solid ${tk.borderBrand}`,
                color: rightPanelCollapsed ? tk.textSecondary : tk.textBrand,
                padding: "6px", borderRadius: tk.radiusSm,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ClipboardList size={14} />
              </button>
              <button onClick={() => {
                if (activeRes.resIdx > 0) {
                  switchResource(activeRes.phaseIdx, activeRes.resIdx - 1);
                } else if (activeRes.phaseIdx > 0) {
                  const prevPhase = phases[activeRes.phaseIdx - 1];
                  switchResource(activeRes.phaseIdx - 1, prevPhase.resIdx.length - 1);
                }
              }} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                color: tk.textSecondary, padding: "6px", borderRadius: tk.radiusSm,
                cursor: "pointer",
              }} title="上一资源">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => {
                const currentPhaseRes = phases[activeRes.phaseIdx];
                if (activeRes.resIdx < currentPhaseRes.resIdx.length - 1) {
                  switchResource(activeRes.phaseIdx, activeRes.resIdx + 1);
                } else if (activeRes.phaseIdx < phases.length - 1) {
                  switchResource(activeRes.phaseIdx + 1, 0);
                }
              }} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                color: tk.textSecondary, padding: "6px", borderRadius: tk.radiusSm,
                cursor: "pointer",
              }} title="下一资源">
                <ChevronRight size={16} />
              </button>
              <button onClick={() => { setPreviewFs(false); setTocPanelOpen(false); }} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                color: tk.textSecondary, padding: "6px 12px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>
                <X size={14} /> 退出全屏
              </button>
            </div>
          </div>

          {tocPanelOpen && (
            <div style={{ padding: "12px 0", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`, position: "relative" }}>
              {tocOverflow && (
                <>
                  <button onClick={() => scrollTocBy(-1)} style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 5,
                    width: 40, background: "linear-gradient(to right, rgba(255,255,255,0.9), transparent)",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ChevronLeft size={16} style={{ color: tk.textSecondary }} />
                  </button>
                  <button onClick={() => scrollTocBy(1)} style={{
                    position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 5,
                    width: 40, background: "linear-gradient(to left, rgba(255,255,255,0.9), transparent)",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ChevronRight size={16} style={{ color: tk.textSecondary }} />
                  </button>
                </>
              )}
              <div ref={tocScrollRef} className="hide-scrollbar" style={{
                display: "flex", gap: 8, overflowX: "auto", padding: "0 48px",
                scrollbarWidth: "none", msOverflowStyle: "none",
              }}>
                {phases.map((p, pi) => (
                  <div key={p.num} style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontSize: 11, color: tk.textPlaceholder, paddingLeft: 4 }}>
                      {p.title}：{p.subtitle}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {p.resIdx.map((ridx, ri) => {
                        const res = resources[ridx];
                        const isCurrent = activeRes.phaseIdx === pi && activeRes.resIdx === ri;
                        return (
                          <div
                            key={res.id}
                            onClick={() => { switchResource(pi, ri); setTocPanelOpen(false); }}
                            style={{
                              width: 110, height: 64, borderRadius: 4,
                              border: isCurrent ? `2px solid ${tk.borderBrand}` : `1px solid ${tk.borderHairline}`,
                              background: isCurrent ? tk.bgBrandSubtle : tk.bgWhite,
                              cursor: "pointer", position: "relative", overflow: "hidden",
                              transition: "all 0.15s",
                            }}
                          >
                            {res.type === "PPT" && res.pages && res.pages[0]?.image && (
                              <img src={res.pages[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "图片" && res.images && res.images[0]?.url && (
                              <img src={res.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "视频" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20playback%20interface%20education%20classroom%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "练习" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quiz%20question%20education%20test%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "作业" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=homework%20assignment%20education%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "教案" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=document%20lesson%20plan%20education%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "网页" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=web%20page%20interface%20education%20tool%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "音频" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=audio%20player%20interface%20education%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            <div style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                              padding: "4px 6px",
                            }}>
                              <span style={{ fontSize: 10, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{res.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, background: tk.bgPrimary, padding: 16 }}>
            <div style={{ flex: rightPanelCollapsed ? 1 : 3, background: tk.bgWhite, overflow: "hidden", minWidth: 0, position: "relative", borderRadius: 8 }}>
              <div style={{ height: "100%", overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {activeRes.phaseIdx === -1 ? (
                  <div style={{ padding: tk.spacingLg }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary, marginBottom: 16 }}>教案</div>
                    <div style={{ fontSize: 13, color: tk.textSecondary, lineHeight: "1.8" }}>
                      {view.sections?.map((section, si) => (
                        <div key={si} style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>{section.heading}</div>
                          <div>{section.body}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderResourceContent(view, pageIndex, setPageIndex, "light", editing, {
                    updatePage, updateSection, updateChapter, updateQuestion, updateOption,
                    patchDraft,
                  }, elementSelectMode)
                )}
              </div>

              {(hoveredModule || selectedModule) && (
                <div 
                  style={{
                    position: "fixed",
                    left: (hoveredModule || selectedModule)!.rect.left,
                    top: (hoveredModule || selectedModule)!.rect.top - 24,
                    backgroundColor: tk.brandDefault,
                    color: tk.textReverse,
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 4,
                    zIndex: 9999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {(hoveredModule || selectedModule)!.name}
                </div>
              )}

              {selectedModule && (
                <div 
                  style={{
                    position: "fixed",
                    left: selectedModule.rect.left + selectedModule.rect.width - 80,
                    top: selectedModule.rect.top + 8,
                    zIndex: 9999,
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newModule = { name: selectedModule.name, type: selectedModule.type, id: Date.now() };
                      if (onModulesChange) {
                        onModulesChange(newModule);
                      }
                      setSelectedModule(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      backgroundColor: tk.bgWhite,
                      border: `1px solid ${tk.borderBrand}`,
                      borderRadius: tk.radiusSm,
                      color: tk.textBrand,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      boxShadow: tk.shadowMd,
                    }}
                  >
                    <MessageSquarePlus size={14} />
                    添加到对话
                  </button>
                </div>
              )}
            </div>

            {!rightPanelCollapsed && (
              <div style={{ flex: 1, background: tk.bgPrimary, flexShrink: 0, overflowY: "auto", padding: 0, marginLeft: 12 }}>
                <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: "1px solid " + tk.borderHairline, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid " + tk.borderHairline }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>资源信息</span>
                    <button onClick={() => setRightPanelCollapsed(true)} title="收起资源信息" style={{
                      background: tk.bgPrimary, border: "none", cursor: "pointer",
                      padding: "4px 6px", borderRadius: tk.radiusSm,
                      width: 24, height: 24,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <X size={14} style={{ color: tk.textSecondary }} />
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingMd }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
                      {activeRes.phaseIdx === -1 ? (
                        <div style={{ background: tk.bgSecondary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                          <div style={{ fontSize: 12, color: tk.textSecondary, lineHeight: "1.6" }}>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>类型</div>
                              <div>教案</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>描述</div>
                              <div>教学流程、讲义等其他内容</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ background: tk.bgSecondary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                            <div style={{ fontSize: 12, color: tk.textSecondary, lineHeight: "1.6" }}>
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>资源名称</div>
                                <div style={{ fontWeight: 600, color: tk.textPrimary }}>{activeResource.name}</div>
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>资源类型</div>
                                <div>{activeResource.type}</div>
                              </div>
                              {activeResource.summary && (
                                <div>
                                  <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>简介</div>
                                  <div>{activeResource.summary}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          {(activeResource.tags && activeResource.tags.length > 0) && (
                            <div>
                              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 8 }}>标签</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {activeResource.tags.map((tag, ti) => (
                                  <span key={ti} style={{
                                    fontSize: 11, color: tk.textSecondary,
                                    background: tk.bgBrandSubtle, padding: "2px 8px",
                                    borderRadius: tk.radiusSm,
                                  }}>{tag}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SparkClass Module ──────────────────────────────────────────────────────
function SparkClass({
  tab, setTab, view: sparkView, setView: setSparkView,
  minimalMode, setMinimalMode,
  goTeach,
}: {
  tab: SparkTab; setTab: (t: SparkTab) => void;
  view: { type: "list" } | { type: "detail"; id: number; tab?: "package" | "analysis" };
  setView: (v: { type: "list" } | { type: "detail"; id: number; tab?: "package" | "analysis" }) => void;
  minimalMode: boolean; setMinimalMode: (v: boolean) => void;
  goTeach: (id: number, ctx?: "teach" | "review") => void;
}) {
  // 默认视图改为课表
  const [viewMode, setViewMode] = useState<"card" | "calendar">("calendar");

  // SparkClass sub-state — tab/sparkView are lifted up to App for unified breadcrumb
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "done">("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"time" | "created">("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [timeRangePreset, setTimeRangePreset] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  const [hwFilter, setHwFilter] = useState<"all" | "submitted" | "unsubmitted">("all");
  const [hwMarkFilter, setHwMarkFilter] = useState<"all" | "已批改" | "未批改" | "待提交" | "已打回">("all");
  const [weekOffset, setWeekOffset] = useState(0);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  // 快速新建课堂（工具栏"新建课堂"按钮唤起）
  const [quickCreateSlot, setQuickCreateSlot] = useState<{ day: string; period: string } | null>(null);

  const tabs: { key: SparkTab; label: string }[] = [
    { key: "classes", label: "我的课堂" },
    { key: "homework", label: "我的作业" },
    { key: "review", label: "我的课后" },
  ];

  // 计算本周一日期
  const todayDate = new Date("2026-06-22");
  const dayOfWeek = todayDate.getDay() || 7; // 1-7, 周一为1
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() - dayOfWeek + 1 + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  const thisWeekClasses = CLASS_DATA.filter(c => {
    if (!c.date) return false;
    const d = new Date(c.date);
    return d >= monday && d <= sunday;
  });

  const filteredClasses = CLASS_DATA
    .filter(c => statusFilter === "all" || c.status === statusFilter)
    .filter(c => gradeFilter === "all" || c.grade === gradeFilter)
    .filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return c.title.toLowerCase().includes(q) || c.grade.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
    })
    .filter(c => {
      if (!dateFrom && !dateTo) return true;
      if (!c.date) return false;
      if (dateFrom && c.date < dateFrom) return false;
      if (dateTo && c.date > dateTo) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "time") return (a.time.localeCompare(b.time)) * dir;
      return (b.id - a.id) * dir;
    });
  const currentDetail = tab !== "homework" ? CLASS_DATA.find(c => c.id === (sparkView as { id: number }).id) : undefined;

  // 点击外部关闭下拉
  useEffect(() => {
    if (!statusOpen && !gradeOpen && !timeRangeOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-classes-dropdown]")) {
        setStatusOpen(false);
        setGradeOpen(false);
        setTimeRangeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [statusOpen, gradeOpen, timeRangeOpen]);

  if (sparkView.type === "detail" && tab !== "homework" && currentDetail) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <ClassDetailPage
          cls={currentDetail}
          initialTab={sparkView.type === "detail" ? sparkView.tab : undefined}
          onTeach={() => goTeach(currentDetail.id, "teach")}
          minimalMode={minimalMode}
          setMinimalMode={setMinimalMode}
        />
      </div>
    );
  }

  // ── 视图切换胶囊：课表 / 列表 ──────────────────────
  const renderViewSwitcher = () => (
    <div style={{
      display: "inline-flex", background: tk.bgPrimary,
      border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusFull,
      padding: 3, gap: 2,
    }}>
      {([
        { v: "calendar" as const, label: "课表" },
        { v: "card" as const, label: "列表" },
      ]).map(opt => {
        const active = viewMode === opt.v;
        return (
          <button key={opt.v} onClick={() => setViewMode(opt.v)} style={{
            background: active ? tk.bgWhite : "transparent",
            color: active ? tk.textBrand : tk.textSecondary,
            border: "none",
            borderRadius: tk.radiusFull,
            fontSize: 12, padding: "4px 14px",
            cursor: "pointer", fontWeight: active ? 600 : 400,
            boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.14s",
          }}>{opt.label}</button>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left nav */}
      <div style={{
        width: navCollapsed ? 60 : 200, flexShrink: 0, borderRight: `1px solid ${tk.borderHairline}`,
        background: tk.bgPrimary, padding: tk.spacingMd, display: "flex", flexDirection: "column",
        transition: "width 0.2s ease",
      }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: tab === t.key ? tk.bgBrandSubtle : "transparent",
            color: tab === t.key ? tk.textBrand : (navCollapsed ? tk.textBlackPrimary : tk.textSecondary),
            borderLeft: tab === t.key ? `2px solid ${tk.brandDefault}` : "2px solid transparent",
            border: "none", borderRadius: tk.radiusSm, padding: navCollapsed ? "10px" : "9px 12px",
            cursor: "pointer", textAlign: "left", fontSize: 13,
            fontWeight: tab === t.key ? 600 : 400,
            marginBottom: 2, transition: "all 0.12s",
            display: "flex", alignItems: "center", gap: navCollapsed ? 0 : 8,
            justifyContent: navCollapsed ? "center" : "flex-start",
            minHeight: navCollapsed ? 36 : "auto",
          }} title={navCollapsed ? t.label : undefined}
            onMouseEnter={e => e.currentTarget.style.color = tk.brandDefault}
            onMouseLeave={e => e.currentTarget.style.color = tab === t.key ? tk.textBrand : (navCollapsed ? tk.textBlackPrimary : tk.textSecondary)}>
            {t.key === "classes" && <BookOpen size={navCollapsed ? 20 : 14} style={{ width: navCollapsed ? 20 : undefined, height: navCollapsed ? 20 : undefined }} />}
            {t.key === "homework" && <ClipboardList size={navCollapsed ? 20 : 14} style={{ width: navCollapsed ? 20 : undefined, height: navCollapsed ? 20 : undefined }} />}
            {t.key === "review" && <BarChart2 size={navCollapsed ? 20 : 14} style={{ width: navCollapsed ? 20 : undefined, height: navCollapsed ? 20 : undefined }} />}
            {!navCollapsed && t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: `1px solid ${tk.borderHairline}`, paddingTop: tk.spacingMd }}>
          <button onClick={() => setShowRecycleBin(true)} style={{
            background: "transparent",
            color: navCollapsed ? tk.textBlackPrimary : tk.textSecondary,
            border: "none", borderRadius: tk.radiusSm, padding: navCollapsed ? "10px" : "9px 12px",
            cursor: "pointer", textAlign: "left", fontSize: 13,
            marginBottom: 2, transition: "all 0.12s",
            display: "flex", alignItems: "center", gap: navCollapsed ? 0 : 8,
            justifyContent: navCollapsed ? "center" : "flex-start",
            width: "100%",
            minHeight: navCollapsed ? 36 : "auto",
          }} title={navCollapsed ? "回收站" : undefined}
            onMouseEnter={e => e.currentTarget.style.color = tk.brandDefault}
            onMouseLeave={e => e.currentTarget.style.color = navCollapsed ? tk.textBlackPrimary : tk.textSecondary}>
            <Trash2 size={navCollapsed ? 20 : 14} style={{ width: navCollapsed ? 20 : undefined, height: navCollapsed ? 20 : undefined }} />
            {!navCollapsed && "回收站"}
          </button>
          <button onClick={() => setNavCollapsed(!navCollapsed)} style={{
            background: "transparent",
            color: navCollapsed ? tk.textBlackPrimary : tk.textSecondary,
            border: "none", borderRadius: tk.radiusSm, padding: navCollapsed ? "10px" : "9px 12px",
            cursor: "pointer", textAlign: "left", fontSize: 13,
            transition: "all 0.12s",
            display: "flex", alignItems: "center", gap: navCollapsed ? 0 : 8,
            justifyContent: navCollapsed ? "center" : "flex-start",
            width: "100%",
            minHeight: navCollapsed ? 36 : "auto",
          }} title={navCollapsed ? "展开导航" : "收起导航"}
            onMouseEnter={e => e.currentTarget.style.color = tk.brandDefault}
            onMouseLeave={e => e.currentTarget.style.color = navCollapsed ? tk.textBlackPrimary : tk.textSecondary}>
            {navCollapsed ? (<ChevronRight size={20} style={{ width: 20, height: 20 }} />) : (<ChevronLeft size={20} style={{ width: 20, height: 20 }} />)}
            {!navCollapsed && "收起"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: tk.bgPrimary }}>

        <div style={{ padding: tk.spacingLg, flex: 1, display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
          {tab === "classes" && (
            <>
              {/* ── 基础数据 + 代办：我的课堂数 / 班级数 / 待批改作业 ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: tk.spacingMd }}>
                {/* 我的课堂数 */}
                <div style={{
                  background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`,
                  padding: tk.spacingMd, display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: tk.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                      <BookOpen size={13} style={{ color: tk.brandDefault }} /> 我的课堂数
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: tk.textPrimary, lineHeight: "32px" }}>{CLASS_DATA.length}</span>
                    <span style={{ fontSize: 12, color: tk.textPlaceholder }}>个课堂包</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: tk.textPlaceholder, marginTop: 2 }}>
                    <span>待授课 <span style={{ color: tk.textWarning, fontWeight: 600 }}>{CLASS_DATA.filter(c => c.status === "pending").length}</span></span>
                    <span>已授课 <span style={{ color: tk.textSuccess, fontWeight: 600 }}>{CLASS_DATA.filter(c => c.status === "done").length}</span></span>
                  </div>
                </div>
                {/* 我的班级数 */}
                <div style={{
                  background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`,
                  padding: tk.spacingMd, display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: tk.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={13} style={{ color: tk.brandDefault }} /> 我的班级数
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: tk.textPrimary, lineHeight: "32px" }}>{MY_GRADES.length}</span>
                    <span style={{ fontSize: 12, color: tk.textPlaceholder }}>个班级</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 2 }}>
                    {MY_GRADES.map(g => (
                      <span key={g} style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: tk.radiusXs,
                        background: tk.bgPrimary, color: tk.textSecondary,
                      }}>{g}</span>
                    ))}
                  </div>
                </div>
                {/* 待批改课后作业 */}
                <div style={{
                  background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`,
                  padding: tk.spacingMd, display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: tk.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                      <ClipboardList size={13} style={{ color: tk.errorDefault }} /> 待批改课后作业
                    </span>
                    <span style={{ fontSize: 11, color: tk.textLink, cursor: "pointer" }}>去批改 →</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: tk.errorDefault, lineHeight: "32px" }}>34</span>
                    <span style={{ fontSize: 12, color: tk.textPlaceholder }}>份</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
                    {[
                      { title: "Unit 4 词汇速记作业", grade: "高一(3)班", count: 6 },
                      { title: "期末模拟阅读理解", grade: "高一(2)班", count: 25 },
                    ].map(hw => (
                      <div key={hw.title} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 6px", borderRadius: 3, cursor: "pointer",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: tk.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{hw.title} · {hw.grade}</div>
                        <span style={{
                          background: tk.bgWarningSubtle, color: tk.textWarning,
                          fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: tk.radiusFull, flexShrink: 0,
                        }}>{hw.count}份</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── 我的课堂：大模块 ── */}
              <div style={{
                background: tk.bgWhite, borderRadius: tk.radiusMd,
                border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg,
                display: "flex", flexDirection: "column", gap: tk.spacingMd,
              }}>
                {/* 标题栏：我的课堂 + 视图切换 + 搜索 + 筛选下拉 + 新建 */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  flexWrap: "wrap", rowGap: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: tk.textPrimary }}>本周授课</span>
                    {renderViewSwitcher()}
                  </div>
                  <div style={{ flex: 1 }} />
                  {/* 搜索框（仅列表模式） */}
                  {viewMode === "card" && (
                  <div style={{
                    background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
                    borderRadius: tk.radiusSm, padding: "5px 10px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Search size={12} style={{ color: tk.textPlaceholder }} />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="搜索课堂包…"
                      style={{
                        border: "none", background: "transparent", outline: "none",
                        fontSize: 12, color: tk.textPrimary, fontFamily: "var(--font-family)",
                        width: 110,
                      }}
                    />
                  </div>
                  )}

                  {/* 全部授课 下拉 */}
                  <div data-classes-dropdown style={{ position: "relative" }}>
                    <button onClick={() => { setStatusOpen(!statusOpen); setTimeRangeOpen(false); }} style={{
                      background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                      borderRadius: tk.radiusSm, padding: "5px 10px", fontSize: 12,
                      color: statusFilter === "all" ? tk.textSecondary : tk.textPrimary,
                      display: "inline-flex", alignItems: "center", gap: 4,
                      cursor: "pointer", fontFamily: "var(--font-family)",
                    }}>
                      {statusFilter === "all" ? "全部授课" : statusFilter === "pending" ? "待授课" : statusFilter === "active" ? "正在授课" : "已授课"}
                      <ChevronDown size={11} />
                    </button>
                    {statusOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
                        background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                        borderRadius: tk.radiusSm, boxShadow: tk.shadowMd,
                        minWidth: 130, padding: 4,
                      }}>
                        {([
                          { v: "all" as const,     label: "全部授课" },
                          { v: "pending" as const, label: "待授课" },
                          { v: "active" as const,  label: "正在授课" },
                          { v: "done" as const,    label: "已授课" },
                        ]).map(opt => (
                          <button key={opt.v} onClick={() => { setStatusFilter(opt.v); setStatusOpen(false); }} style={{
                            width: "100%", textAlign: "left",
                            background: statusFilter === opt.v ? tk.bgPrimary : "transparent",
                            border: "none", borderRadius: tk.radiusXs,
                            padding: "6px 10px", fontSize: 12, cursor: "pointer",
                            color: statusFilter === opt.v ? tk.textBrand : tk.textPrimary,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                          }}>
                            <span>{opt.label}</span>
                            {statusFilter === opt.v && <Check size={11} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 全部班级 下拉 */}
                  <div data-classes-dropdown style={{ position: "relative" }}>
                    <button onClick={() => { setGradeOpen(!gradeOpen); setStatusOpen(false); setTimeRangeOpen(false); }} style={{
                      background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                      borderRadius: tk.radiusSm, padding: "5px 10px", fontSize: 12,
                      color: gradeFilter === "all" ? tk.textSecondary : tk.textPrimary,
                      display: "inline-flex", alignItems: "center", gap: 4,
                      cursor: "pointer", fontFamily: "var(--font-family)",
                    }}>
                      {gradeFilter === "all" ? "全部班级" : gradeFilter}
                      <ChevronDown size={11} />
                    </button>
                    {gradeOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
                        background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                        borderRadius: tk.radiusSm, boxShadow: tk.shadowMd,
                        minWidth: 150, maxHeight: 240, overflowY: "auto", padding: 4,
                      }}>
                        {(["all", ...MY_GRADES] as const).map(g => (
                          <button key={g} onClick={() => { setGradeFilter(g); setGradeOpen(false); }} style={{
                            width: "100%", textAlign: "left",
                            background: gradeFilter === g ? tk.bgPrimary : "transparent",
                            border: "none", borderRadius: tk.radiusXs,
                            padding: "6px 10px", fontSize: 12, cursor: "pointer",
                            color: gradeFilter === g ? tk.textBrand : tk.textPrimary,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                          }}>
                            <span>{g === "all" ? "全部班级" : g}</span>
                            {gradeFilter === g && <Check size={11} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 全部授课时间 + 排序 + 清除（仅列表模式） */}
                  {viewMode === "card" && (
                  <>
                  {/* 全部授课时间 下拉（含日期段） */}
                  <div data-classes-dropdown style={{ position: "relative" }}>
                    <button onClick={() => { setTimeRangeOpen(!timeRangeOpen); setStatusOpen(false); setGradeOpen(false); }} style={{
                      background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                      borderRadius: tk.radiusSm, padding: "5px 10px", fontSize: 12,
                      color: timeRangePreset === "all" && !dateFrom && !dateTo ? tk.textSecondary : tk.textPrimary,
                      display: "inline-flex", alignItems: "center", gap: 4,
                      cursor: "pointer", fontFamily: "var(--font-family)",
                    }}>
                      {timeRangePreset !== "all" || dateFrom || dateTo
                        ? (dateFrom && dateTo
                            ? `${dateFrom.slice(5)}~${dateTo.slice(5)}`
                            : timeRangePreset === "today" ? "今天"
                            : timeRangePreset === "week" ? "本周"
                            : timeRangePreset === "month" ? "本月"
                            : "已选时间")
                        : "全部授课时间"}
                      <ChevronDown size={11} />
                    </button>
                    {timeRangeOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
                        background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                        borderRadius: tk.radiusSm, boxShadow: tk.shadowMd,
                        minWidth: 220, padding: 6,
                      }}>
                        {([
                          { v: "all" as const,   label: "全部" },
                          { v: "today" as const, label: "今天" },
                          { v: "week" as const,  label: "本周" },
                          { v: "month" as const, label: "本月" },
                        ]).map(opt => (
                          <button key={opt.v} onClick={() => {
                            setTimeRangePreset(opt.v);
                            // 根据 preset 自动填入日期段
                            if (opt.v === "today") {
                              const t = "2026-06-22";
                              setDateFrom(t); setDateTo(t);
                            } else if (opt.v === "week") {
                              setDateFrom("2026-06-22"); setDateTo("2026-06-28");
                            } else if (opt.v === "month") {
                              setDateFrom("2026-06-01"); setDateTo("2026-06-30");
                            } else {
                              setDateFrom(""); setDateTo("");
                            }
                            setTimeRangeOpen(false);
                          }} style={{
                            width: "100%", textAlign: "left",
                            background: timeRangePreset === opt.v ? tk.bgPrimary : "transparent",
                            border: "none", borderRadius: tk.radiusXs,
                            padding: "6px 10px", fontSize: 12, cursor: "pointer",
                            color: timeRangePreset === opt.v ? tk.textBrand : tk.textPrimary,
                          }}>{opt.label}</button>
                        ))}
                        <div style={{ height: 1, background: tk.borderHairline, margin: "4px 0" }} />
                        <div style={{ padding: "4px 6px", fontSize: 11, color: tk.textPlaceholder }}>自定义时间段</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 6px 6px" }}>
                          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setTimeRangePreset("custom"); }} style={{
                            flex: 1, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusXs,
                            fontSize: 11, color: tk.textSecondary, padding: "3px 6px",
                            background: tk.bgWhite, outline: "none", fontFamily: "var(--font-family)",
                          }} />
                          <span style={{ fontSize: 10, color: tk.textPlaceholder }}>至</span>
                          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setTimeRangePreset("custom"); }} style={{
                            flex: 1, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusXs,
                            fontSize: 11, color: tk.textSecondary, padding: "3px 6px",
                            background: tk.bgWhite, outline: "none", fontFamily: "var(--font-family)",
                          }} />
                        </div>
                        <button onClick={() => { setTimeRangePreset("all"); setDateFrom(""); setDateTo(""); setTimeRangeOpen(false); }} style={{
                          width: "100%", textAlign: "center", background: "none",
                          border: "none", borderRadius: tk.radiusXs, padding: "6px 10px",
                          fontSize: 11, cursor: "pointer", color: tk.textLink,
                        }}>清除</button>
                      </div>
                    )}
                  </div>

                  {/* 授课时间 排序切换（正/倒序） */}
                  <button onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")} title={sortDir === "asc" ? "正序" : "倒序"} style={{
                    background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                    borderRadius: tk.radiusSm, padding: "5px 10px", fontSize: 12,
                    color: tk.textSecondary, display: "inline-flex", alignItems: "center", gap: 4,
                    cursor: "pointer", fontFamily: "var(--font-family)",
                  }}>
                    授课时间
                    <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
                      <ChevronDown size={9} style={{ color: sortDir === "asc" ? tk.textBrand : tk.textPlaceholder, marginBottom: -2 }} />
                      <ChevronDown size={9} style={{ color: sortDir === "desc" ? tk.textBrand : tk.textPlaceholder, transform: "rotate(180deg)" }} />
                    </span>
                  </button>

                  {/* 清除筛选 */}
                  {(statusFilter !== "all" || gradeFilter !== "all" || dateFrom || dateTo || searchQuery) && (
                    <button onClick={() => {
                      setStatusFilter("all"); setGradeFilter("all");
                      setDateFrom(""); setDateTo(""); setTimeRangePreset("all");
                      setSearchQuery("");
                    }} title="清除筛选" style={{
                      background: "none", border: `1px solid ${tk.borderHairline}`,
                      borderRadius: tk.radiusSm, padding: "5px 8px", cursor: "pointer",
                      color: tk.textPlaceholder, display: "inline-flex", alignItems: "center",
                    }}><X size={12} /></button>
                  )}
                  </>
                  )}

                  {/* 新建课堂 */}
                  <button
                    onClick={() => setQuickCreateSlot({ day: "今天", period: "未指定时段" })}
                    style={{
                    background: tk.brandDefault, color: tk.textReverse,
                    border: "none", borderRadius: tk.radiusSm,
                    fontSize: 12, fontWeight: 600, padding: "6px 14px",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                    fontFamily: "var(--font-family)", flexShrink: 0,
                  }}><Plus size={12} /> 新建课堂</button>
                </div>
              {viewMode === "card" && (
                <>
                  {/* 本周课堂包：自包含版块 + 左右切换（无滚动条） */}
                  <div style={{
                    background: tk.bgPrimary, borderRadius: tk.radiusMd,
                    border: `1px solid ${tk.borderHairline}`,
                    padding: tk.spacingMd,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: tk.textSecondary }}>本周授课</span>
                        <span style={{ fontSize: 11, color: tk.textPlaceholder }}>
                          {fmt(monday)} - {fmt(sunday)} · 共 {thisWeekClasses.length} 节
                        </span>
                      </div>
                      {/* 右侧左右切换按钮（一次切一屏） */}
                      {thisWeekClasses.length > 0 && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => {
                            const el = document.getElementById("weekClassScroll");
                            if (el) el.scrollBy({ left: -el.clientWidth, behavior: "smooth" });
                          }} style={{
                            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                            borderRadius: tk.radiusFull, width: 22, height: 22,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: tk.textSecondary,
                          }}><ChevronLeft size={12} /></button>
                          <button onClick={() => {
                            const el = document.getElementById("weekClassScroll");
                            if (el) el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
                          }} style={{
                            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                            borderRadius: tk.radiusFull, width: 22, height: 22,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: tk.textSecondary,
                          }}><ChevronRight size={12} /></button>
                        </div>
                      )}
                    </div>
                    {thisWeekClasses.length === 0 ? (
                      <div style={{
                        padding: `${tk.spacingXl} ${tk.spacingLg}`,
                        textAlign: "center", color: tk.textPlaceholder, fontSize: 12,
                      }}>
                        <Calendar size={20} style={{ color: tk.textPlaceholder, marginBottom: 6 }} />
                        <div>本周暂无课堂包</div>
                      </div>
                    ) : (
                      <div
                        id="weekClassScroll"
                        style={{
                          display: "flex", gap: tk.spacingMd,
                          overflowX: "auto",
                          paddingBottom: 6,
                          scrollbarWidth: "none",     // Firefox
                          msOverflowStyle: "none",    // IE/Edge
                        }}
                        className="hide-scrollbar"
                      >
                        {thisWeekClasses.map(c => (
                          <div key={c.id} style={{ flex: "0 0 calc((100% - 32px) / 3)", minWidth: 240 }}>
                            <ClassCard {...c}
                              onClick={() => setSparkView({ type: "detail", id: c.id })}
                              onTeach={() => goTeach(c.id)}
                              onReport={() => setSparkView({ type: "detail", id: c.id, tab: "analysis" })}
                              onView={() => setSparkView({ type: "detail", id: c.id })}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* 全部课堂包（按筛选） */}
                  <div style={{ marginTop: tk.spacingMd }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: tk.textSecondary }}>全部课堂包</span>
                      <span style={{ fontSize: 11, color: tk.textPlaceholder }}>按筛选条件 · 共 {filteredClasses.length} 节</span>
                    </div>
                    {filteredClasses.length === 0 ? (
                      <div style={{
                        background: tk.bgPrimary, border: `1px dashed ${tk.borderHairline}`,
                        borderRadius: tk.radiusMd, padding: `${tk.spacingXl} ${tk.spacingLg}`,
                        textAlign: "center", color: tk.textPlaceholder, fontSize: 12,
                      }}>
                        <BookOpen size={20} style={{ color: tk.textPlaceholder, marginBottom: 6 }} />
                        <div>暂无符合条件的课堂包</div>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: tk.spacingMd }}>
                        {filteredClasses.map(c => (
                          <ClassCard key={c.id} {...c}
                            onClick={() => setSparkView({ type: "detail", id: c.id })}
                            onTeach={() => goTeach(c.id)}
                            onReport={() => setSparkView({ type: "detail", id: c.id, tab: "analysis" })}
                            onView={() => setSparkView({ type: "detail", id: c.id })}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {viewMode === "calendar" && (
                <EnhancedCalendar
                  weekOffset={weekOffset} setWeekOffset={setWeekOffset}
                  onDetail={(id) => setSparkView({ type: "detail", id })}
                  onTeach={goTeach}
                  onReport={(id) => setSparkView({ type: "detail", id, tab: "analysis" })}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  gradeFilter={gradeFilter}
                />
              )}
              </div>
            </>
          )}

          {tab === "homework" && (
            sparkView.type === "detail" ? (
              <HomeworkDetailPage
                homeworkId={sparkView.id}
                onBack={() => setSparkView({ type: "list" })}
              />
            ) : (
              <div style={{ display: "grid", gap: tk.spacingMd, minHeight: 0 }}>
                <HomeworkStatsPanel />
                <div style={{
                  background: tk.bgWhite,
                  borderRadius: tk.radiusMd,
                  border: `1px solid ${tk.borderHairline}`,
                  padding: tk.spacingLg,
                  display: "flex",
                  flexDirection: "column",
                  gap: tk.spacingMd,
                  minHeight: 0,
                }}>
                  <HomeworkMainView
                    hwFilter={hwFilter}
                    hwMarkFilter={hwMarkFilter}
                    onDetail={(id) => setSparkView({ type: "detail", id })}
                  />
                </div>
              </div>
            )
          )}
          {tab === "review" && (
            <ReviewMainView
              onDetail={(id, analysisTab) => setSparkView({ type: "detail", id, tab: analysisTab })}
              onTeach={goTeach}
              onCreateClass={() => setQuickCreateSlot({ day: "今天", period: "第1节" })}
            />
          )}
        </div>
      </div>

      {/* 工具栏"新建课堂"唤起的快速新建弹窗（与课表空白点击一致） */}
      {quickCreateSlot && (
        <QuickCreateModal slot={quickCreateSlot} onClose={() => setQuickCreateSlot(null)} />
      )}

      {/* 回收站弹窗 */}
      {showRecycleBin && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setShowRecycleBin(false)}>
          <div style={{
            background: tk.bgWhite, borderRadius: tk.radiusLg,
            width: "90%", maxWidth: 800, maxHeight: "80vh",
            overflow: "hidden",
          }} onClick={e => e.stopPropagation()}>
            {/* 标题栏 */}
            <div style={{
              padding: `${tk.spacingMd} ${tk.spacingLg}`,
              borderBottom: `1px solid ${tk.borderHairline}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Trash2 size={18} style={{ color: tk.textPlaceholder }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary }}>回收站</span>
                <span style={{ fontSize: 12, color: tk.textPlaceholder }}>共 {DELETED_CLASSES.length} 个已删除课堂包</span>
              </div>
              <button onClick={() => setShowRecycleBin(false)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: tk.textPlaceholder, padding: 4,
              }}><X size={16} /></button>
            </div>
            {/* 内容区 */}
            <div style={{ padding: tk.spacingLg, maxHeight: "calc(80vh - 60px)", overflowY: "auto" }}>
              {DELETED_CLASSES.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: `${tk.spacingXl}`,
                  color: tk.textPlaceholder,
                }}>
                  <Trash2 size={32} style={{ marginBottom: 10 }} />
                  <div>回收站是空的</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {DELETED_CLASSES.map(c => (
                    <div key={c.id} style={{
                      background: tk.bgPrimary, borderRadius: tk.radiusMd,
                      padding: tk.spacingMd,
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 4 }}>{c.title}</div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12, color: tk.textPlaceholder }}>
                          <span>{c.subject}</span>
                          <span>{c.grade}</span>
                          <span>{c.time}</span>
                          {c.deletedAt && <span>删除于 {c.deletedAt}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{
                          background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                          borderRadius: tk.radiusSm, padding: "6px 12px",
                          fontSize: 12, color: tk.textSecondary, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                        }} onMouseEnter={e => e.currentTarget.style.borderColor = tk.borderBrand}
                          onMouseLeave={e => e.currentTarget.style.borderColor = tk.borderHairline}>
                          <RefreshCw size={12} /> 恢复
                        </button>
                        <button style={{
                          background: "transparent", border: "none",
                          borderRadius: tk.radiusSm, padding: "6px 12px",
                          fontSize: 12, color: tk.textError, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          <Trash2 size={12} /> 永久删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Enhanced Calendar ────────────────────────────────────────────────────────
// ─── Quick Create Modal (teacher calendar) ───────────────────────────────────
// 一级弹窗：基础选择面板（含"选择资源包"入口）
// 二级弹窗：资源库（我的资源）多选面板，可返回一级弹窗
function QuickCreateModal({ slot, onClose }: { slot: { day: string; period: string }; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("英语");
  const [grade, setGrade] = useState("高一(1)班");
  const [teacher, setTeacher] = useState("王老师");
  const [selectedPkg, setSelectedPkg] = useState<Resource | null>(null);
  const [resourcePickerOpen, setResourcePickerOpen] = useState(false);

  // 关闭时清理
  const handleClose = () => {
    setResourcePickerOpen(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: tk.bgWhite, borderRadius: tk.radiusLg, boxShadow: tk.shadowXl ?? "0 24px 56px rgba(0,0,0,0.18)", padding: tk.spacingLg, width: 400, display: "flex", flexDirection: "column", gap: tk.spacingMd, position: "relative" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: tk.textPrimary }}>快速新建课堂</div>
          <div style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 3 }}>{slot.day} · {slot.period}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* 课堂名称 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, marginBottom: 5 }}>课堂名称</div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入课堂名称…"
              style={{ width: "100%", padding: "8px 10px", border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm, fontSize: 13, outline: "none", fontFamily: "var(--font-family)", boxSizing: "border-box" as const }}
            />
          </div>
          {/* 学科 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, marginBottom: 5 }}>学科</div>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm, fontSize: 13, outline: "none", background: tk.bgWhite, cursor: "pointer" }}
            >
              <option>英语</option>
              <option>数学</option>
              <option>语文</option>
              <option>物理</option>
            </select>
          </div>
          {/* 授课班级 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, marginBottom: 5 }}>授课班级</div>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm, fontSize: 13, outline: "none", background: tk.bgWhite, cursor: "pointer" }}
            >
              <option>高一(1)班</option>
              <option>高一(2)班</option>
              <option>高一(3)班</option>
              <option>高一(4)班</option>
            </select>
          </div>
          {/* 授课教师 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, marginBottom: 5 }}>授课教师</div>
            <select
              value={teacher}
              onChange={e => setTeacher(e.target.value)}
              style={{ width: "100%", padding: "8px 10px", border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm, fontSize: 13, outline: "none", background: tk.bgWhite, cursor: "pointer" }}
            >
              <option>王老师</option>
              <option>张老师</option>
              <option>李老师</option>
            </select>
          </div>
          {/* 选择资源包 */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, marginBottom: 5 }}>选择资源包</div>
            <button
              onClick={() => setResourcePickerOpen(true)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${tk.borderDefault}`,
                borderRadius: tk.radiusSm,
                fontSize: 13,
                outline: "none",
                background: tk.bgWhite,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                color: selectedPkg ? tk.textPrimary : tk.textPlaceholder,
                fontFamily: "var(--font-family)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                {selectedPkg ? (
                  <>
                    <FolderOpen size={13} style={{ color: tk.brandDefault, flexShrink: 0 }} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedPkg.title}</span>
                  </>
                ) : (
                  <>
                    <FolderOpen size={13} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />
                    <span>请选择资源包…</span>
                  </>
                )}
              </span>
              <ChevronRight size={13} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button
            onClick={handleClose}
            style={{ background: "none", border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm, fontSize: 13, padding: "7px 18px", cursor: "pointer", color: tk.textSecondary }}
          >取消</button>
          <button
            onClick={handleClose}
            disabled={!selectedPkg}
            style={{
              background: selectedPkg ? tk.brandDefault : tk.bgPrimary,
              color: selectedPkg ? tk.textReverse : tk.textPlaceholder,
              border: "none",
              borderRadius: tk.radiusSm,
              fontSize: 13, fontWeight: 600, padding: "7px 24px",
              cursor: selectedPkg ? "pointer" : "not-allowed",
            }}
          >创建课堂</button>
        </div>
      </div>

      {/* 二级弹窗：资源库选择器（可返回一级弹窗） */}
      {resourcePickerOpen && (
        <ResourcePickerModal
          onClose={() => setResourcePickerOpen(false)}
          onBack={() => setResourcePickerOpen(false)}
          onConfirm={(r) => { setSelectedPkg(r); setResourcePickerOpen(false); }}
          selectedId={selectedPkg?.id}
        />
      )}
    </div>
  );
}

// ─── Resource Picker Modal (二级弹窗：从资源库选择资源包) ────────────────────
function ResourcePickerModal({ onClose, onBack, onConfirm, selectedId }: {
  onClose: () => void; onBack: () => void; onConfirm: (r: Resource) => void; selectedId?: string;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [activeType, setActiveType] = useState("全部");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<Resource | null>(
    selectedId ? SAMPLE_RESOURCES.find(r => r.id === selectedId) ?? null : null
  );

  const tabs = ["我的资源", "校本资源", "其他资源"];
  const types = ["全部", "课堂包", "教案", "作业", "文书", "视频"];

  const filtered = SAMPLE_RESOURCES.filter(r => {
    // tab 过滤
    if (activeTab === 0) {
      // 我的资源：agent 限定为我
    } else if (activeTab === 1) {
      // 校本资源
    }
    // 类型过滤
    if (activeType === "课堂包" && r.kind !== "package") return false;
    if (activeType === "教案" && !(r.title.includes("教案"))) return false;
    if (activeType === "作业" && r.kind !== "quiz") return false;
    if (activeType === "文书" && r.kind !== "doc") return false;
    if (activeType === "视频" && r.kind !== "video") return false;
    // 搜索
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // 资源类型 → 标签文案/颜色
  const kindLabel = (r: Resource) => {
    if (r.kind === "package") return { label: "课堂包", color: tk.brandDefault, bg: tk.bgBrandSubtle };
    if (r.kind === "doc")     return { label: r.title.includes("教案") ? "教案" : "文书",  color: tk.textInfo,    bg: tk.bgInfoSubtle };
    if (r.kind === "quiz")    return { label: "作业",   color: tk.textWarning, bg: tk.bgWarningSubtle };
    if (r.kind === "video")   return { label: "视频",   color: tk.textError,   bg: tk.bgErrorSubtle };
    if (r.kind === "ppt")     return { label: "课件",   color: tk.textBrand,   bg: tk.bgBrandSubtle };
    if (r.kind === "image")   return { label: "图片",   color: tk.textInfo,    bg: tk.bgInfoSubtle };
    if (r.kind === "audio")   return { label: "音频",   color: tk.textWarning, bg: tk.bgWarningSubtle };
    return { label: r.kind, color: tk.textSecondary, bg: tk.bgPrimary };
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        background: tk.bgWhite, borderRadius: tk.radiusLg,
        boxShadow: tk.shadowXl ?? "0 24px 56px rgba(0,0,0,0.18)",
        width: 720, maxHeight: "85vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* 标题栏（含返回 + 关闭） */}
        <div style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${tk.borderHairline}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={onBack}
              title="返回上一级"
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                color: tk.textSecondary, fontSize: 13, padding: "4px 6px",
                borderRadius: tk.radiusXs,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <ChevronLeft size={14} />
              <span>返回</span>
            </button>
            <div style={{ width: 1, height: 14, background: tk.borderHairline }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: tk.textPrimary }}>选择资源包</div>
              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 1 }}>从我的资源库中挑选课包、教案、作业等内容</div>
            </div>
          </div>
          <button
            onClick={onClose}
            title="关闭"
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 28, height: 28, borderRadius: tk.radiusXs,
              color: tk.textSecondary,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${tk.borderHairline}`, padding: "0 20px" }}>
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              style={{
                background: "none", border: "none",
                borderBottom: i === activeTab ? `2px solid ${tk.brandDefault}` : "2px solid transparent",
                color: i === activeTab ? tk.textBrand : tk.textSecondary,
                fontSize: 13, fontWeight: i === activeTab ? 600 : 400,
                padding: "10px 18px", cursor: "pointer", transition: "all 0.12s",
              }}
            >{t}</button>
          ))}
        </div>

        {/* 筛选 + 搜索 */}
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                style={{
                  background: t === activeType ? tk.brandDefault : tk.bgPrimary,
                  color: t === activeType ? tk.textReverse : tk.textSecondary,
                  border: `1px solid ${t === activeType ? tk.brandDefault : tk.borderDefault}`,
                  borderRadius: tk.radiusFull, fontSize: 12, fontWeight: 500,
                  padding: "3px 12px", cursor: "pointer", transition: "all 0.12s",
                }}
              >{t}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            background: tk.bgPrimary, border: `1px solid ${tk.borderDefault}`,
            borderRadius: tk.radiusSm, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 6, minWidth: 200,
          }}>
            <Search size={13} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索资源…"
              style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 12, color: tk.textPrimary, fontFamily: "var(--font-family)",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* 资源列表 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 12px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: tk.textPlaceholder, fontSize: 13 }}>
              暂无匹配资源
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(r => {
              const meta = kindLabel(r);
              const isPicked = picked?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setPicked(r)}
                  style={{
                    background: isPicked ? tk.bgBrandSubtle : tk.bgWhite,
                    border: `1px solid ${isPicked ? tk.borderBrand : tk.borderHairline}`,
                    borderRadius: tk.radiusMd,
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { if (!isPicked) e.currentTarget.style.borderColor = tk.borderDefault; }}
                  onMouseLeave={e => { if (!isPicked) e.currentTarget.style.borderColor = tk.borderHairline; }}
                >
                  {/* radio */}
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: `2px solid ${isPicked ? tk.brandDefault : tk.borderDefault}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isPicked && <div style={{ width: 8, height: 8, borderRadius: "50%", background: tk.brandDefault }} />}
                  </div>
                  {/* icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: tk.radiusSm,
                    background: tk.bgPrimary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {r.kind === "package" ? <Layers size={18} style={{ color: tk.brandDefault }} /> :
                     r.kind === "video"   ? <Play size={16} style={{ color: tk.textError }} /> :
                     r.kind === "quiz"    ? <ClipboardList size={16} style={{ color: tk.textWarning }} /> :
                     r.kind === "doc"     ? <FileText size={16} style={{ color: tk.textInfo }} /> :
                                            <BookOpen size={16} style={{ color: tk.textBrand }} />}
                  </div>
                  {/* info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, lineHeight: "16px",
                        padding: "0 6px", borderRadius: tk.radiusXs,
                        background: meta.bg, color: meta.color,
                        flexShrink: 0,
                      }}>{meta.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: tk.textPlaceholder }}>{r.meta}</div>
                  </div>
                  <div style={{ fontSize: 11, color: tk.textPlaceholder, flexShrink: 0 }}>{r.updatedAt}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div style={{
          padding: "12px 20px",
          borderTop: `1px solid ${tk.borderHairline}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          background: tk.bgPrimary,
        }}>
          <div style={{ fontSize: 12, color: picked ? tk.textBrand : tk.textPlaceholder }}>
            {picked ? `已选：${picked.title}` : "请选择一个资源"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onBack}
              style={{
                background: "none", border: `1px solid ${tk.borderDefault}`,
                borderRadius: tk.radiusSm, fontSize: 13, padding: "7px 18px",
                cursor: "pointer", color: tk.textSecondary,
              }}
            >返回</button>
            <button
              onClick={() => picked && onConfirm(picked)}
              disabled={!picked}
              style={{
                background: picked ? tk.brandDefault : tk.bgPrimary,
                color: picked ? tk.textReverse : tk.textPlaceholder,
                border: "none", borderRadius: tk.radiusSm,
                fontSize: 13, fontWeight: 600, padding: "7px 24px",
                cursor: picked ? "pointer" : "not-allowed",
              }}
            >确认选择</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnhancedCalendar({ weekOffset, setWeekOffset, onDetail, onTeach, onReport, statusFilter, setStatusFilter, gradeFilter }: {
  weekOffset: number; setWeekOffset: (n: number) => void;
  onDetail: (id: number) => void; onTeach: (id: number) => void; onReport: (id: number) => void;
  statusFilter?: "all" | "active" | "pending" | "done";
  setStatusFilter?: (s: "all" | "active" | "pending" | "done") => void;
  gradeFilter?: string;
}) {
  const [createSlot, setCreateSlot] = useState<{ day: string; period: string } | null>(null);
  const [popover, setPopover] = useState<{ classId: number; x: number; y: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const periods = ["第1节", "第2节", "第3节", "第4节", "午休", "第5节", "第6节", "第7节", "第8节"];
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  // 当前学年（下拉切换）
  const ACADEMIC_YEARS = ["2024-2025 学年", "2025-2026 学年", "2026-2027 学年"];
  const [academicYear, setAcademicYear] = useState("2025-2026 学年");
  const [academicOpen, setAcademicOpen] = useState(false);

  // 课表色彩约定：绿=待授课 / 橙黄=正在授课 / 灰=已授课
  const STATUS_COLOR = {
    pending: tk.successDefault,
    active:  tk.textWarning,
    done:    tk.textPlaceholder,
  } as const;
  const STATUS_BG = {
    pending: "rgba(16, 185, 129, 0.10)",
    active:  "rgba(245, 158, 11, 0.10)",
    done:    "rgba(156, 163, 175, 0.10)",
  } as const;

  // 锚定今天为 2026-06-24（周三）
  const today = new Date("2026-06-24");
  const todayDay = today.getDay() || 7; // 1-7 周一为1
  const currentHour = today.getHours();
  const currentPeriodIdx = currentHour < 10 ? 1 : currentHour < 12 ? 2 : currentHour < 14 ? 4 : currentHour < 16 ? 5 : 6;

  // Schedule 调整：
  // 周一/周二 = 已授课(灰)
  // 周三 = 今天 正在授课(橙黄)
  // 周四 = 待授课(绿)
  // 周五 = 端午节，无课
  // 周日 = 待授课(绿)
  //
  // 跨周规则：
  // - weekOffset < 0 (上周及更早)：所有课 = 已授课(done)
  // - weekOffset === 0 (本周)：混合状态（见上）
  // - weekOffset > 0 (下周及更晚)：所有课 = 待授课(pending)
  // - 其他周的工作日（周一-周五）每天 1-3 节课，时段分散（确定性伪随机）
  const LESSON_POOL = [
    { title: "Unit 4 精读",     grade: "高一(3)班" },
    { title: "Unit 4 复习",     grade: "高一(3)班" },
    { title: "Unit 5 预习",     grade: "高一(1)班" },
    { title: "Unit 1 口语",     grade: "高一(1)班" },
    { title: "Unit 2 听力",     grade: "高一(3)班" },
    { title: "Unit 3 写作",     grade: "高一(2)班" },
    { title: "语法精讲",       grade: "高一(4)班" },
    { title: "勾股定理标准课包", grade: "六年级(1)班" },
    { title: "勾股定理应用题",   grade: "六年级(2)班" },
    { title: "议论文写作训练",   grade: "高二(1)班" },
    { title: "古诗鉴赏",       grade: "高二(2)班" },
    { title: "英语口语角",     grade: "高一(2)班" },
  ];

  // 节假日：MM-DD → 节日名
  const HOLIDAYS: Record<string, string> = {
    "06-26": "端午节",
  };

  // 基于 weekOffset 生成对应周的课表（确定性）
  function generateWeekSchedule(weekOffset: number): Record<string, { title: string; grade: string; classId: number; status: "active" | "pending" | "done" }> {
    // 当前周：硬编码详细数据
    if (weekOffset === 0) {
      return {
        "周一-第2节": { title: "《Unit 4 Nature》精读课", grade: "高一(1)班", classId: 8,  status: "done"   },
        "周一-第6节": { title: "《Unit 3 Travel》写作课", grade: "高一(3)班", classId: 9,  status: "done"   },
        "周二-第1节": { title: "《Unit 2 Work》听力课",   grade: "高一(2)班", classId: 10, status: "done"   },
        "周二-第5节": { title: "Unit 3 写作强化",          grade: "高一(1)班", classId: 13, status: "done"   },
        "周三-第3节": { title: "《Unit 4 Nature》精读课", grade: "高一(3)班", classId: 1,  status: "active" },
        "周三-第7节": { title: "Unit 5 词汇精讲",          grade: "高一(2)班", classId: 12, status: "active" },
        "周四-第2节": { title: "《Unit 4 Nature》精读课", grade: "高一(4)班", classId: 2,  status: "pending" },
        "周四-第6节": { title: "《Unit 3 Travel》写作课", grade: "高一(1)班", classId: 4,  status: "pending" },
        "周日-第3节": { title: "《Unit 2 Work》听力课",   grade: "高一(3)班", classId: 5,  status: "pending" },
      };
    }

    // 其他周：基于 weekOffset 的伪随机生成（每天 1-3 节课，时段分散）
    const status: "active" | "pending" | "done" = weekOffset < 0 ? "done" : "pending";
    const days = ["周一", "周二", "周三", "周四", "周五"];
    const periodPool = ["第1节", "第2节", "第3节", "第4节", "第5节", "第6节", "第7节", "第8节"];
    const out: Record<string, { title: string; grade: string; classId: number; status: "active" | "pending" | "done" }> = {};

    // 用 weekOffset 作种子（确保每次渲染结果稳定）
    const seed = Math.abs(weekOffset) * 9301 + 49297;
    const rand = (n: number) => ((seed + n * 7 + n * n) % 233280) / 233280;

    let cid = 100;
    days.forEach((d, di) => {
      const classCount = 1 + Math.floor(rand(di * 3 + 1) * 3); // 1-3 节
      const used = new Set<number>();
      for (let i = 0; i < classCount; i++) {
        let pi = -1;
        for (let t = 0; t < 10; t++) {
          const candidate = Math.floor(rand(di * 100 + i * 13 + t * 5) * periodPool.length);
          if (!used.has(candidate)) { pi = candidate; used.add(candidate); break; }
        }
        if (pi < 0) continue;
        const lessonIdx = Math.floor(rand(di * 7 + i * 19 + 3) * LESSON_POOL.length);
        const lesson = LESSON_POOL[lessonIdx];
        out[`${d}-${periodPool[pi]}`] = {
          title: lesson.title,
          grade: lesson.grade,
          classId: cid++,
          status,
        };
      }
    });
    return out;
  }

  // 当前视图周的课表
  const schedule = generateWeekSchedule(weekOffset);

  // 过滤后的事件
  const filteredSchedule: Record<string, { title: string; grade: string; classId: number; status: "active" | "pending" | "done" }> = useMemo(() => {
    const out: Record<string, { title: string; grade: string; classId: number; status: "active" | "pending" | "done" }> = {};
    Object.entries(schedule).forEach(([k, v]) => {
      if (statusFilter && statusFilter !== "all" && v.status !== statusFilter) return;
      if (gradeFilter && gradeFilter !== "all" && v.grade !== gradeFilter) return;
      out[k] = v;
    });
    return out;
  }, [schedule, statusFilter, gradeFilter]);

  // 本周一日期
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDay + 1 + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmtM = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  // 标签：上下周/本周/下周显示文字，更远的周显示日期段
  const weekLabel = weekOffset === 0
    ? "本周"
    : weekOffset === -1
    ? "上周"
    : weekOffset === 1
    ? "下周"
    : `${fmtM(monday).slice(5)} - ${fmtM(sunday).slice(5)}`;

  // 关闭浮层（点击外部）
  useEffect(() => {
    if (!popover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popover]);

  // 关闭学年下拉（点击外部）
  useEffect(() => {
    if (!academicOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-academic-dropdown]")) {
        setAcademicOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [academicOpen]);

  return (
    <>
      {createSlot && <QuickCreateModal slot={createSlot} onClose={() => setCreateSlot(null)} />}
      <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, overflow: "hidden", position: "relative" }}>
        {/* 课表上方：学年（下拉）| 翻周 + 标签/日期段 | 右侧图例 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderBottom: `1px solid ${tk.borderHairline}`, background: tk.bgPrimary,
          gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* 学年下拉 */}
            <div data-academic-dropdown style={{ position: "relative" }}>
              <button onClick={() => setAcademicOpen(!academicOpen)} style={{
                background: "none", border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600,
                color: tk.textPrimary, padding: "4px 10px",
                display: "inline-flex", alignItems: "center", gap: 5,
                cursor: "pointer", fontFamily: "var(--font-family)",
              }}>
                <GraduationCap size={13} style={{ color: tk.brandDefault }} />
                {academicYear}
                <ChevronDown size={11} style={{ color: tk.textSecondary }} />
              </button>
              {academicOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
                  background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                  borderRadius: tk.radiusSm, boxShadow: tk.shadowMd,
                  minWidth: 160, padding: 4,
                }}>
                  {ACADEMIC_YEARS.map(y => (
                    <button key={y} onClick={() => { setAcademicYear(y); setAcademicOpen(false); }} style={{
                      width: "100%", textAlign: "left",
                      background: academicYear === y ? tk.bgPrimary : "transparent",
                      border: "none", borderRadius: tk.radiusXs,
                      padding: "6px 10px", fontSize: 12, cursor: "pointer",
                      color: academicYear === y ? tk.textBrand : tk.textPrimary,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span>{y}</span>
                      {academicYear === y && <Check size={11} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ width: 1, height: 14, background: tk.borderHairline }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => setWeekOffset(weekOffset - 1)} style={{ background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, width: 24, height: 24, cursor: "pointer", color: tk.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={13} /></button>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, minWidth: 56, textAlign: "center" }}>{weekLabel}</span>
              <button onClick={() => setWeekOffset(weekOffset + 1)} style={{ background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, width: 24, height: 24, cursor: "pointer", color: tk.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={13} /></button>
              {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={{ background: tk.bgBrandSubtle, color: tk.textBrand, border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusFull, fontSize: 11, padding: "2px 10px", cursor: "pointer" }}>回到本周</button>}
            </div>
          </div>
          {/* 右侧图例：颜色色块 + 状态文字（点击 = 切换筛选，二合一，不含"全部"） */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {([
              { key: "pending" as const, label: "待授课",   color: STATUS_COLOR.pending, border: "none" },
              { key: "active"  as const, label: "正在授课", color: STATUS_COLOR.active,  border: "none" },
              { key: "done"    as const, label: "已授课",   color: STATUS_COLOR.done,    border: "none" },
            ]).map(l => {
              const active = (statusFilter ?? "all") === l.key;
              const clickable = !!setStatusFilter;
              return (
                <button
                  key={l.key}
                  onClick={() => setStatusFilter?.(l.key)}
                  style={{
                    background: active ? tk.bgPrimary : "transparent",
                    border: `1px solid ${active ? tk.borderHairline : "transparent"}`,
                    borderRadius: tk.radiusFull,
                    padding: "3px 10px", fontSize: 11,
                    color: active ? tk.textPrimary : tk.textSecondary,
                    fontWeight: active ? 600 : 400,
                    cursor: clickable ? "pointer" : "default",
                    display: "inline-flex", alignItems: "center", gap: 5,
                    transition: "all 0.12s",
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: l.color,
                    border: l.border,
                    flexShrink: 0,
                  }} />
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "70px repeat(7, 1fr)", fontSize: 12 }}>
          <div style={{ background: tk.bgPrimary, borderBottom: `1px solid ${tk.borderHairline}`, padding: "8px" }} />
          {days.map((d, di) => {
            const isToday = weekOffset === 0 && di + 1 === todayDay;
            const dateObj = new Date(monday);
            dateObj.setDate(monday.getDate() + di);
            return (
              <div
                key={d}
                title="点击新建课堂"
                onClick={() => setCreateSlot({ day: d, period: "未指定时段" })}
                style={{
                  background: isToday ? tk.bgBrandSubtle : tk.bgPrimary,
                  borderBottom: `1px solid ${tk.borderHairline}`,
                  borderLeft: `1px solid ${tk.borderHairline}`,
                  padding: "6px",
                  textAlign: "center",
                  color: isToday ? tk.textBrand : tk.textSecondary,
                  fontWeight: isToday ? 700 : 400,
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isToday ? tk.bgBrandSubtle : "#eef0f3")}
                onMouseLeave={e => (e.currentTarget.style.background = isToday ? tk.bgBrandSubtle : tk.bgPrimary)}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  <span>{d}</span>
                  {isToday && <span style={{ fontSize: 10, color: tk.textBrand }}>·今天</span>}
                </div>
                <div style={{ fontSize: 10, color: tk.textPlaceholder, marginTop: 1 }}>{dateObj.getMonth() + 1}/{dateObj.getDate()}</div>
              </div>
            );
          })}

          {periods.map((p, pi) => (
            <>
              <div key={`label-${p}`} style={{ borderBottom: `1px solid ${tk.borderHairline}`, padding: "10px 8px", color: tk.textPlaceholder, background: p === "午休" ? "#fafafa" : tk.bgWhite, minHeight: 60, display: "flex", alignItems: "center", position: "relative" }}>
                {p}
                {weekOffset === 0 && pi === currentPeriodIdx && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: tk.errorDefault, zIndex: 5 }}>
                    <div style={{ position: "absolute", left: -4, top: -4, width: 8, height: 8, borderRadius: "50%", background: tk.errorDefault }} />
                  </div>
                )}
              </div>
              {days.map((d, di) => {
                const key = `${d}-${p}`;
                const event = filteredSchedule[key];
                const isToday = weekOffset === 0 && di + 1 === todayDay;
                const isCurrentRow = weekOffset === 0 && pi === currentPeriodIdx;
                const isBreak = p === "午休";
                return (
                  <div
                    key={key}
                    onClick={() => { if (!event && !isBreak) setCreateSlot({ day: d, period: p }); }}
                    style={{
                      borderBottom: `1px solid ${tk.borderHairline}`,
                      borderLeft: `1px solid ${tk.borderHairline}`,
                      padding: 5, minHeight: 60, position: "relative",
                      background: isBreak ? "#fafafa" : isToday ? "rgba(228,239,236,0.2)" : tk.bgWhite,
                      cursor: !event && !isBreak ? "pointer" : "default",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (!event && !isBreak) e.currentTarget.style.background = "rgba(228,239,236,0.35)"; }}
                    onMouseLeave={e => { if (!event && !isBreak) e.currentTarget.style.background = isToday ? "rgba(228,239,236,0.2)" : tk.bgWhite; }}
                  >
                    {/* time axis */}
                    {isCurrentRow && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: tk.errorDefault, opacity: 0.3, zIndex: 5 }} />}
                    {/* Empty hint */}
                    {!event && !isBreak && (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.12s" }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                      >
                        <Plus size={12} style={{ color: tk.textPlaceholder }} />
                      </div>
                    )}
                    {event && (
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          // 正在授课：点击直接进入授课模式（沉浸大屏），不再走 popover
                          if (event.status === "active") {
                            onTeach(event.classId);
                            return;
                          }
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setPopover({ classId: event.classId, x: rect.left, y: rect.bottom + 4 });
                        }}
                        style={{
                          // 颜色约定：待授课=绿 / 正在授课=黄橙 / 已授课=灰（与图例统一）
                          background: STATUS_BG[event.status],
                          borderLeft: `3px solid ${STATUS_COLOR[event.status]}`,
                          borderRadius: tk.radiusXs, padding: "4px 6px", cursor: "pointer",
                          transition: "box-shadow 0.12s",
                          position: "relative",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = tk.shadowSm)}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                      >
                        {/* 今日标记 */}
                        {isToday && (
                          <span style={{
                            position: "absolute", top: 3, right: 3,
                            background: tk.errorDefault, color: "#fff",
                            fontSize: 9, fontWeight: 700, lineHeight: "12px",
                            padding: "0 4px", borderRadius: 2,
                          }}>今</span>
                        )}
                        <div style={{ fontSize: 11, fontWeight: 600, color: tk.textPrimary, lineHeight: "16px",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.title}</div>
                        <div style={{ fontSize: 10, color: tk.textSecondary }}>{event.grade}</div>
                        <div style={{ fontSize: 9, color: tk.textPlaceholder, marginTop: 1 }}>点击查看</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* 课包块浮层菜单 */}
      {popover && (() => {
        const ev = schedule[Object.keys(schedule).find(k => schedule[k].classId === popover.classId) || ""];
        if (!ev) return null;
        return (
          <div
            ref={popoverRef}
            style={{
              position: "fixed", left: popover.x, top: popover.y, zIndex: 1000,
              background: tk.bgWhite, borderRadius: tk.radiusMd,
              border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowLg,
              padding: 6, minWidth: 160,
              display: "flex", flexDirection: "column", gap: 2,
            }}
          >
            <div style={{ padding: "6px 10px", borderBottom: `1px solid ${tk.borderHairline}`, marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>{ev.title}</div>
              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 1 }}>{ev.grade}</div>
            </div>
            <button onClick={() => { onDetail(ev.classId); setPopover(null); }} style={popoverMenuBtnStyle}>
              <FileText size={13} /> 查看课包
            </button>
            {ev.status !== "done" ? (
              <button onClick={() => { onTeach(ev.classId); setPopover(null); }} style={popoverMenuBtnStyle}>
                <Play size={13} /> 去授课
              </button>
            ) : (
              <>
                <button onClick={() => { onTeach(ev.classId); setPopover(null); }} style={popoverMenuBtnStyle}>
                  <Play size={13} /> 去授课
                </button>
                <button onClick={() => { onReport(ev.classId); setPopover(null); }} style={{ ...popoverMenuBtnStyle, color: tk.brandDefault }}>
                  <BarChart2 size={13} /> 课后分析
                </button>
              </>
            )}
          </div>
        );
      })()}
    </>
  );
}

const popoverMenuBtnStyle: React.CSSProperties = {
  background: "none", border: "none", padding: "8px 10px",
  fontSize: 12, color: "var(--text-black-primary)", textAlign: "left",
  cursor: "pointer", borderRadius: "var(--radius-sm)",
  display: "flex", alignItems: "center", gap: 8, transition: "background 0.1s",
};

// ─── Review Main View ─────────────────────────────────────────────────────────
// 我的课后：两大 tab — 课后全局分析（默认）/ 已授课堂
function ReviewMainView({ onDetail, onTeach, onCreateClass }: {
  onDetail: (id: number, tab?: "package" | "analysis") => void;
  onTeach: (id: number) => void;
  onCreateClass: () => void;
}) {
  const [subTab, setSubTab] = useState<"global" | "done">("global");

  // Tab 1: 全局筛选
  const [classFilter, setClassFilter] = useState<"全部" | string>("全部");
  const [timeFilter, setTimeFilter] = useState<"全部" | "本学期" | "近一月" | "近一周">("全部");

  // Tab 2: 已授课堂筛选（与"我的课堂"列表同款 state 命名，缺省状态筛选）
  const [doneSearch, setDoneSearch] = useState("");
  const [doneGradeFilter, setDoneGradeFilter] = useState<string>("all");
  const [doneTimeRangePreset, setDoneTimeRangePreset] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [doneDateFrom, setDoneDateFrom] = useState("");
  const [doneDateTo, setDoneDateTo] = useState("");
  const [doneSortDir, setDoneSortDir] = useState<"asc" | "desc">("asc");
  const [doneGradeOpen, setDoneGradeOpen] = useState(false);
  const [doneTimeRangeOpen, setDoneTimeRangeOpen] = useState(false);

  // 点击外部关闭下拉
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!doneRef.current) return;
      if (!(e.target as HTMLElement).closest("[data-done-dropdown]")) {
        setDoneGradeOpen(false);
        setDoneTimeRangeOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const doneClsAll = CLASS_DATA.filter(c => c.status === "done");

  // Tab 1 计算
  const doneFilteredForStats = doneClsAll.filter(c =>
    (classFilter === "全部" || c.grade === classFilter)
  );
  const macro = {
    total: doneFilteredForStats.length,
    duration: doneFilteredForStats.length * 45,
    finishRate: 87, // mock：作业平均完成率（较上学期）
    pendingHw: 34,
  };

  // Tab 2 计算（与"我的课堂"列表同款筛选/排序管道）
  const doneFiltered = doneClsAll
    .filter(c => doneGradeFilter === "all" || c.grade === doneGradeFilter)
    .filter(c => !doneSearch.trim() || (c.title + " " + c.desc + " " + c.grade).toLowerCase().includes(doneSearch.trim().toLowerCase()))
    .filter(c => {
      // 时间段筛选：今天 / 本周 / 本月 / 自定义日期段 / 全部
      if (doneTimeRangePreset === "all" && !doneDateFrom && !doneDateTo) return true;
      if (doneTimeRangePreset === "today") return c.date === "2026-06-22";
      if (doneTimeRangePreset === "week")  return c.date && c.date >= "2026-06-22" && c.date <= "2026-06-28";
      if (doneTimeRangePreset === "month") return c.date && c.date >= "2026-06-01" && c.date <= "2026-06-30";
      if (doneTimeRangePreset === "custom" && doneDateFrom && doneDateTo)
        return c.date && c.date >= doneDateFrom && c.date <= doneDateTo;
      return true;
    })
    .sort((a, b) => {
      const cmp = (a.time || "").localeCompare(b.time || "");
      return doneSortDir === "asc" ? cmp : -cmp;
    });

  const allGrades = MY_GRADES; // 兼容旧引用

  // 顶部胶囊 tab
  const renderSubTabs = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{
        display: "inline-flex", background: tk.bgWhite,
        border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusFull,
        padding: 3, gap: 2,
      }}>
        {([
          { v: "global" as const, label: "课后全局分析" },
          { v: "done" as const,   label: "已授课堂" },
        ]).map(opt => {
          const active = subTab === opt.v;
          return (
            <button key={opt.v} onClick={() => setSubTab(opt.v)} style={{
              background: active ? tk.bgWhite : "transparent",
              color: active ? tk.textBrand : tk.textSecondary,
              border: "none", borderRadius: tk.radiusFull,
              fontSize: 12, padding: "5px 16px", cursor: "pointer",
              fontWeight: active ? 600 : 400,
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.14s",
            }}>{opt.label}</button>
          );
        })}
      </div>
      <span style={{ fontSize: 12, color: tk.textPlaceholder }}>
        <Sparkles size={11} style={{ verticalAlign: "middle", marginRight: 4, color: tk.brandDefault }} />
        AI 全局数据总结 · 已完结课堂历史档案馆
      </span>
    </div>
  );

  // ── Tab 1：课后全局分析
  const renderGlobal = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
      {/* 顶部筛选 + 宏观数据汇总 */}
      <div style={{
        background: tk.bgWhite, borderRadius: tk.radiusMd,
        border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: tk.textSecondary }}>全局筛选班级</span>
          <SimpleDropdown
            value={classFilter}
            options={["全部", ...allGrades]}
            onChange={setClassFilter as (v: string) => void}
          />
          <span style={{ fontSize: 12, color: tk.textSecondary, marginLeft: 12 }}>全局筛选时间</span>
          <SimpleDropdown
            value={timeFilter}
            options={["全部", "本学期", "近一月", "近一周"]}
            onChange={setTimeFilter as (v: string) => void}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: tk.spacingMd }}>
          <StatCard label="总授课次数" value={String(macro.total)} trend="本学期" icon={BookOpen} />
          <StatCard label="授课总时长" value={`${macro.duration} min`} trend="本学期" icon={Clock} />
          <StatCard label="作业平均完成率" value={`${macro.finishRate}%`} trend="较上学期 +5%" icon={CheckCircle2} />
          <StatCard label="待批改课后作业" value={String(macro.pendingHw)} icon={ClipboardList} />
        </div>
      </div>

      {/* AI 课后分析建议（精准总结 + 细分提醒） */}
      <div style={{
        background: tk.bgWhite, borderRadius: tk.radiusMd,
        border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Sparkles size={14} style={{ color: tk.brandDefault }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>课后分析建议</span>
          <span style={{ fontSize: 11, color: tk.textPlaceholder }}>AI 全局总结</span>
        </div>
        {/* 一句话诊断 */}
        <div style={{
          background: tk.bgWarningSubtle, borderLeft: `3px solid ${tk.textWarning}`,
          borderRadius: tk.radiusSm, padding: "10px 12px", marginBottom: 12,
          fontSize: 13, color: tk.textPrimary, lineHeight: "20px",
        }}>
          <span style={{ fontWeight: 600, color: tk.textWarning }}>⚠️ AI 诊断：</span>
          初二三班在"勾股定理"知识点错误率偏高（约 38%），建议加强练习与变式训练；同时高一(2)班本周作业提交率下滑至 71%，需关注。
        </div>
        {/* 4 个细分提醒 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "近期表现提醒", value: "高一(3)班有 8 名学生在逆勾股定理部分表现不佳，建议下周重点讲解。", type: "warn" as const },
            { label: "班级关注提醒", value: "高一(2)班整体参与率下降至 68%，建议课堂增加互动环节。",           type: "info" as const },
            { label: "关注学生提醒", value: "李明、张华、王磊三位同学作业连续未提交，请及时跟进。",               type: "error" as const },
            { label: "教学建议",     value: "近期写作类课堂评分优于听力，建议适当增加听力练习比重。",             type: "success" as const },
          ].map(a => {
            const colors = { warn: tk.textWarning, info: tk.textInfo, error: tk.textError, success: tk.textSuccess };
            const bgs = { warn: tk.bgWarningSubtle, info: tk.bgInfoSubtle, error: tk.bgErrorSubtle, success: tk.bgSuccessSubtle };
            return (
              <div key={a.label} style={{ background: bgs[a.type], borderRadius: tk.radiusSm, padding: 10, borderLeft: `3px solid ${colors[a.type]}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: colors[a.type], marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: tk.textPrimary, lineHeight: "18px" }}>{a.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 待批改作业（侧边） + 数据报表 */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: tk.spacingMd }}>
        {/* 待批改作业 */}
        <div style={{
          background: tk.bgWhite, borderRadius: tk.radiusMd,
          border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd,
          display: "flex", flexDirection: "column", gap: 10, alignSelf: "start",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ClipboardList size={14} style={{ color: tk.brandDefault }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>待批改课后作业</span>
            </div>
            <span style={{ fontSize: 11, color: tk.textPlaceholder }}>{macro.pendingHw} 份</span>
          </div>
          {[
            { cls: "高一(3)班", name: "勾股定理作业", count: 38, time: "今天 17:32" },
            { cls: "高一(1)班", name: "Unit 4 词汇练习", count: 42, time: "今天 16:10" },
            { cls: "高一(2)班", name: "Unit 3 写作草稿", count: 41, time: "昨天 22:48" },
            { cls: "六年级(2)班", name: "勾股应用题",   count: 36, time: "6/20" },
          ].map(hw => (
            <div key={hw.name} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 10px", borderRadius: tk.radiusSm,
              background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hw.name}</div>
                <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 2 }}>{hw.cls} · {hw.count} 份 · {hw.time}</div>
              </div>
              <button style={{
                background: tk.brandDefault, color: tk.textReverse, border: "none",
                borderRadius: tk.radiusSm, fontSize: 11, padding: "4px 10px", cursor: "pointer",
                flexShrink: 0,
              }}>批改</button>
            </div>
          ))}
        </div>

        {/* 数据报表 */}
        <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
          {/* 正确率趋势折线图 */}
          <div style={{
            background: tk.bgWhite, borderRadius: tk.radiusMd,
            border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={14} style={{ color: tk.brandDefault }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>整体正确率趋势（较上学期）</span>
              </div>
              <span style={{ fontSize: 11, color: tk.textPlaceholder }}>近 8 周</span>
            </div>
            <SimpleLineChart />
          </div>

          {/* 正确率排行 + 其他全局数据 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: tk.spacingMd }}>
            <div style={{
              background: tk.bgWhite, borderRadius: tk.radiusMd,
              border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: 10 }}>正确率排行（按学生）</div>
              {[
                { name: "王诗涵", rate: 96 }, { name: "李明轩", rate: 93 }, { name: "张子墨", rate: 91 },
                { name: "陈雨桐", rate: 88 }, { name: "刘思源", rate: 86 }, { name: "黄乐之", rate: 84 },
              ].map((s, i) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 5 ? `1px solid ${tk.borderHairline}` : "none" }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 9, fontSize: 11, fontWeight: 600,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: i < 3 ? tk.brandDefault : tk.bgPrimary,
                    color: i < 3 ? tk.textReverse : tk.textSecondary, flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 12, color: tk.textPrimary }}>{s.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: tk.brandDefault }}>{s.rate}%</span>
                </div>
              ))}
            </div>
            <div style={{
              background: tk.bgWhite, borderRadius: tk.radiusMd,
              border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: 10 }}>其他全局数据</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { k: "课堂活跃度", v: "82%" },
                  { k: "答题正确率", v: "78%" },
                  { k: "作业准时率", v: "85%" },
                  { k: "班级平均分", v: "82.4" },
                  { k: "高频错题",   v: "勾股定理应用" },
                  { k: "高频易错点", v: "逆推 BC 边" },
                ].map(m => (
                  <div key={m.k} style={{ background: tk.bgPrimary, borderRadius: tk.radiusSm, padding: 10 }}>
                    <div style={{ fontSize: 11, color: tk.textPlaceholder }}>{m.k}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary, marginTop: 2 }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Tab 2：已授课堂（与"我的课堂"列表完全同款：标题栏 + 同款筛选/排序 + ClassCard + 全部课堂包子版块）
  const renderDone = () => (
    <div style={{
      background: tk.bgWhite, borderRadius: tk.radiusMd,
      border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg,
      display: "flex", flexDirection: "column", gap: tk.spacingMd,
    }}>
      {/* 标题栏：已授课堂 + 搜索 + 筛选下拉 + 排序 + 清除 + 新建（结构与"我的课堂"标题栏一致；缺省"全部授课"状态筛选） */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        flexWrap: "wrap", rowGap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: tk.textPrimary }}>已授课堂</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* 搜索框（同款） */}
        <div style={{
          background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
          borderRadius: tk.radiusSm, padding: "5px 10px",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Search size={12} style={{ color: tk.textPlaceholder }} />
          <input
            value={doneSearch}
            onChange={e => setDoneSearch(e.target.value)}
            placeholder="搜索课堂包…"
            style={{
              border: "none", background: "transparent", outline: "none",
              fontSize: 12, color: tk.textPrimary, fontFamily: "var(--font-family)",
              width: 110,
            }}
          />
        </div>

        {/* 全部班级 下拉（同款） */}
        <div data-done-dropdown style={{ position: "relative" }}>
          <button onClick={() => { setDoneGradeOpen(!doneGradeOpen); setDoneTimeRangeOpen(false); }} style={{
            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
            borderRadius: tk.radiusSm, padding: "5px 10px", fontSize: 12,
            color: doneGradeFilter === "all" ? tk.textSecondary : tk.textPrimary,
            display: "inline-flex", alignItems: "center", gap: 4,
            cursor: "pointer", fontFamily: "var(--font-family)",
          }}>
            {doneGradeFilter === "all" ? "全部班级" : doneGradeFilter}
            <ChevronDown size={11} />
          </button>
          {doneGradeOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusSm, boxShadow: tk.shadowMd,
              minWidth: 150, maxHeight: 240, overflowY: "auto", padding: 4,
            }}>
              {(["all", ...MY_GRADES] as const).map(g => (
                <button key={g} onClick={() => { setDoneGradeFilter(g); setDoneGradeOpen(false); }} style={{
                  width: "100%", textAlign: "left",
                  background: doneGradeFilter === g ? tk.bgPrimary : "transparent",
                  border: "none", borderRadius: tk.radiusXs,
                  padding: "6px 10px", fontSize: 12, cursor: "pointer",
                  color: doneGradeFilter === g ? tk.textBrand : tk.textPrimary,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span>{g === "all" ? "全部班级" : g}</span>
                  {doneGradeFilter === g && <Check size={11} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 全部授课时间 下拉（含日期段，同款） */}
        <div data-done-dropdown style={{ position: "relative" }}>
          <button onClick={() => { setDoneTimeRangeOpen(!doneTimeRangeOpen); setDoneGradeOpen(false); }} style={{
            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
            borderRadius: tk.radiusSm, padding: "5px 10px", fontSize: 12,
            color: doneTimeRangePreset === "all" && !doneDateFrom && !doneDateTo ? tk.textSecondary : tk.textPrimary,
            display: "inline-flex", alignItems: "center", gap: 4,
            cursor: "pointer", fontFamily: "var(--font-family)",
          }}>
            {doneTimeRangePreset !== "all" || doneDateFrom || doneDateTo
              ? (doneDateFrom && doneDateTo
                  ? `${doneDateFrom.slice(5)}~${doneDateTo.slice(5)}`
                  : doneTimeRangePreset === "today" ? "今天"
                  : doneTimeRangePreset === "week" ? "本周"
                  : doneTimeRangePreset === "month" ? "本月"
                  : "已选时间")
              : "全部授课时间"}
            <ChevronDown size={11} />
          </button>
          {doneTimeRangeOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusSm, boxShadow: tk.shadowMd,
              minWidth: 220, padding: 6,
            }}>
              {([
                { v: "all" as const,   label: "全部" },
                { v: "today" as const, label: "今天" },
                { v: "week" as const,  label: "本周" },
                { v: "month" as const, label: "本月" },
              ]).map(opt => (
                <button key={opt.v} onClick={() => {
                  setDoneTimeRangePreset(opt.v);
                  if (opt.v === "today") { const t = "2026-06-22"; setDoneDateFrom(t); setDoneDateTo(t); }
                  else if (opt.v === "week") { setDoneDateFrom("2026-06-22"); setDoneDateTo("2026-06-28"); }
                  else if (opt.v === "month") { setDoneDateFrom("2026-06-01"); setDoneDateTo("2026-06-30"); }
                  else { setDoneDateFrom(""); setDoneDateTo(""); }
                  setDoneTimeRangeOpen(false);
                }} style={{
                  width: "100%", textAlign: "left",
                  background: doneTimeRangePreset === opt.v ? tk.bgPrimary : "transparent",
                  border: "none", borderRadius: tk.radiusXs,
                  padding: "6px 10px", fontSize: 12, cursor: "pointer",
                  color: doneTimeRangePreset === opt.v ? tk.textBrand : tk.textPrimary,
                }}>{opt.label}</button>
              ))}
              <div style={{ height: 1, background: tk.borderHairline, margin: "4px 0" }} />
              <div style={{ padding: "4px 6px", fontSize: 11, color: tk.textPlaceholder }}>自定义时间段</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 6px 6px" }}>
                <input type="date" value={doneDateFrom} onChange={e => { setDoneDateFrom(e.target.value); setDoneTimeRangePreset("custom"); }} style={{
                  flex: 1, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusXs,
                  fontSize: 11, color: tk.textSecondary, padding: "3px 6px",
                  background: tk.bgWhite, outline: "none", fontFamily: "var(--font-family)",
                }} />
                <span style={{ fontSize: 10, color: tk.textPlaceholder }}>至</span>
                <input type="date" value={doneDateTo} onChange={e => { setDoneDateTo(e.target.value); setDoneTimeRangePreset("custom"); }} style={{
                  flex: 1, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusXs,
                  fontSize: 11, color: tk.textSecondary, padding: "3px 6px",
                  background: tk.bgWhite, outline: "none", fontFamily: "var(--font-family)",
                }} />
              </div>
              <button onClick={() => { setDoneTimeRangePreset("all"); setDoneDateFrom(""); setDoneDateTo(""); setDoneTimeRangeOpen(false); }} style={{
                width: "100%", textAlign: "center", background: "none",
                border: "none", borderRadius: tk.radiusXs, padding: "6px 10px",
                fontSize: 11, cursor: "pointer", color: tk.textLink,
              }}>清除</button>
            </div>
          )}
        </div>

        {/* 授课时间 排序切换（正/倒序，同款） */}
        <button onClick={() => setDoneSortDir(doneSortDir === "asc" ? "desc" : "asc")} title={doneSortDir === "asc" ? "正序" : "倒序"} style={{
          background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
          borderRadius: tk.radiusSm, padding: "5px 10px", fontSize: 12,
          color: tk.textSecondary, display: "inline-flex", alignItems: "center", gap: 4,
          cursor: "pointer", fontFamily: "var(--font-family)",
        }}>
          授课时间
          <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1 }}>
            <ChevronDown size={9} style={{ color: doneSortDir === "asc" ? tk.textBrand : tk.textPlaceholder, marginBottom: -2 }} />
            <ChevronDown size={9} style={{ color: doneSortDir === "desc" ? tk.textBrand : tk.textPlaceholder, transform: "rotate(180deg)" }} />
          </span>
        </button>

        {/* 清除筛选（同款） */}
        {(doneGradeFilter !== "all" || doneDateFrom || doneDateTo || doneSearch) && (
          <button onClick={() => {
            setDoneGradeFilter("all");
            setDoneDateFrom(""); setDoneDateTo(""); setDoneTimeRangePreset("all");
            setDoneSearch("");
          }} title="清除筛选" style={{
            background: "none", border: `1px solid ${tk.borderHairline}`,
            borderRadius: tk.radiusSm, padding: "5px 8px", cursor: "pointer",
            color: tk.textPlaceholder, display: "inline-flex", alignItems: "center",
          }}><X size={12} /></button>
        )}

        {/* 新建课堂（与"我的课堂"同款绿色主按钮，唤起同一 QuickCreateModal） */}
        <button onClick={onCreateClass} style={{
          background: tk.brandDefault, color: tk.textReverse,
          border: "none", borderRadius: tk.radiusSm,
          fontSize: 12, fontWeight: 600, padding: "6px 14px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
          fontFamily: "var(--font-family)", flexShrink: 0,
        }}><Plus size={12} /> 新建课堂</button>
      </div>

      {/* 全部课堂包（与"我的课堂"列表子版块完全同款：相同的小标题、相同的 ClassCard、空态） */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: tk.textSecondary }}>全部课堂包</span>
          <span style={{ fontSize: 11, color: tk.textPlaceholder }}>按筛选条件 · 共 {doneFiltered.length} 节</span>
        </div>
        {doneFiltered.length === 0 ? (
          <div style={{
            background: tk.bgPrimary, border: `1px dashed ${tk.borderHairline}`,
            borderRadius: tk.radiusMd,
            padding: `${tk.spacingXl} ${tk.spacingLg}`, textAlign: "center",
            color: tk.textPlaceholder, fontSize: 12,
          }}>
            <BookOpen size={20} style={{ color: tk.textPlaceholder, marginBottom: 6 }} />
            <div>暂无符合条件的课堂包</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: tk.spacingMd }}>
            {doneFiltered.map(c => (
              <ClassCard key={c.id} {...c}
                onClick={() => onDetail(c.id, "analysis")}
                onTeach={() => onTeach(c.id)}
                onReport={() => onDetail(c.id, "analysis")}
                onView={() => onDetail(c.id, "analysis")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
      {renderSubTabs()}
      {subTab === "global" ? renderGlobal() : renderDone()}
    </div>
  );
}

// 简化下拉（点击展开列表）
function SimpleDropdown({ label, value, options, onChange }: {
  label?: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={ref} data-classes-dropdown style={{ position: "relative" }}>
      {label && <span style={{ fontSize: 12, color: tk.textSecondary, marginRight: 6 }}>{label}</span>}
      <button onClick={() => setOpen(o => !o)} style={{
        background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
        borderRadius: tk.radiusSm, padding: "5px 10px",
        fontSize: 12, color: tk.textPrimary, cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 6, minWidth: 96,
      }}>
        <span style={{ flex: 1, textAlign: "left" }}>{value}</span>
        <ChevronDown size={12} style={{ color: tk.textPlaceholder }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: label ? 60 : 0, zIndex: 50,
          background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
          borderRadius: tk.radiusSm, boxShadow: tk.shadowMd,
          minWidth: 140, padding: 4, display: "flex", flexDirection: "column",
        }}>
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{
              background: o === value ? tk.bgBrandSubtle : "transparent",
              color: o === value ? tk.textBrand : tk.textPrimary,
              border: "none", textAlign: "left",
              borderRadius: tk.radiusXs, padding: "6px 10px", fontSize: 12, cursor: "pointer",
            }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// 简化折线图（SVG）：整体正确率趋势（近 8 周，本学期 vs 上学期）
function SimpleLineChart() {
  const W = 720, H = 140, P = 24;
  const current = [72, 75, 74, 78, 81, 83, 85, 87];   // 本学期
  const last    = [68, 70, 71, 73, 74, 76, 78, 82];   // 上学期
  const xs = current.map((_, i) => P + (i * (W - P * 2)) / (current.length - 1));
  const yScale = (v: number) => H - P - ((v - 60) / 40) * (H - P * 2);
  const toPath = (arr: number[]) => arr.map((v, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${yScale(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140, display: "block" }}>
      {/* 网格 */}
      {[60, 70, 80, 90, 100].map(y => (
        <line key={y} x1={P} x2={W - P} y1={yScale(y)} y2={yScale(y)} stroke={tk.borderHairline} strokeDasharray="2 4" />
      ))}
      {/* 上学期线（虚线、灰色） */}
      <path d={toPath(last)} fill="none" stroke={tk.textPlaceholder} strokeWidth={1.5} strokeDasharray="4 4" />
      {/* 本学期线（实线、品牌色） */}
      <path d={toPath(current)} fill="none" stroke={tk.brandDefault} strokeWidth={2} />
      {/* 节点 */}
      {current.map((v, i) => (
        <circle key={i} cx={xs[i]} cy={yScale(v)} r={3} fill={tk.brandDefault} />
      ))}
      {/* 图例 */}
      <g>
        <line x1={P} y1={H - 8} x2={P + 16} y2={H - 8} stroke={tk.brandDefault} strokeWidth={2} />
        <text x={P + 20} y={H - 4} fontSize={10} fill={tk.textSecondary}>本学期</text>
        <line x1={P + 80} y1={H - 8} x2={P + 96} y2={H - 8} stroke={tk.textPlaceholder} strokeWidth={1.5} strokeDasharray="4 4" />
        <text x={P + 100} y={H - 4} fontSize={10} fill={tk.textSecondary}>上学期</text>
      </g>
    </svg>
  );
}

// ─── Resource Library Module ────────────────────────────────────────────────
type ResourceType = "全部" | "课堂包" | "教学应用" | "作业习题" | "文档课件" | "视频" | "其他";
type ReviewStatus = "pending" | "approved" | "rejected";
type ResourceItem = {
  id: number;
  name: string;
  type: ResourceType;
  author: string;
  uploadTime: string;
  grade: string;
  subject: string;
  reviewStatus?: ReviewStatus;
  reviewComment?: string;
  isMine?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

type Asset = {
  id: number;
  title: string;
  category: "课堂包" | "教学应用" | "习题作业" | "文档课件" | "视频" | "其他";
  subject: string;
  grade: string;
  updateTime: string;
  isShared: boolean;
  resource: {
    type: string;
    pkg?: ClassPackage;
  };
};
type NotificationItem = {
  id: number;
  resourceId: number;
  resourceName: string;
  status: ReviewStatus;
  time: string;
  comment?: string;
};

const GRADES = ["全部", "一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级", "高一", "高二", "高三"];
const SUBJECTS = ["全部", "语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治", "信息技术"];
const RESOURCE_TYPES: ResourceType[] = ["全部", "课堂包", "教学应用", "作业习题", "文档课件", "视频", "其他"];

const PERSONAL_RESOURCES: ResourceItem[] = [
  { id: 1, name: "Unit 4 Nature 精读教案（完整版）", type: "文档课件", author: "我", uploadTime: "2026-07-04 14:30", grade: "高一", subject: "英语", canEdit: true, canDelete: true },
  { id: 2, name: "高一英语期末模拟卷", type: "作业习题", author: "我", uploadTime: "2026-07-03 09:15", grade: "高一", subject: "英语", canEdit: true, canDelete: true },
  { id: 3, name: "Unit 3 Travel 课堂包", type: "课堂包", author: "我", uploadTime: "2026-07-02 16:45", grade: "高一", subject: "英语", canEdit: true, canDelete: true },
  { id: 4, name: "勾股定理微课视频", type: "视频", author: "我", uploadTime: "2026-07-01 11:20", grade: "八年级", subject: "数学", canEdit: true, canDelete: true },
  { id: 5, name: "家长会通知书模板", type: "文档课件", author: "我", uploadTime: "2026-06-30 15:00", grade: "高一", subject: "语文", canEdit: true, canDelete: true },
  { id: 6, name: "数学公式推导演示", type: "教学应用", author: "我", uploadTime: "2026-06-29 10:30", grade: "九年级", subject: "数学", canEdit: true, canDelete: true },
  { id: 7, name: "Unit 2 Work 词汇练习", type: "作业习题", author: "我", uploadTime: "2026-06-28 09:00", grade: "高一", subject: "英语", canEdit: true, canDelete: true },
  { id: 8, name: "化学实验模拟", type: "教学应用", author: "我", uploadTime: "2026-06-27 14:20", grade: "高二", subject: "化学", canEdit: true, canDelete: true },
  { id: 9, name: "班级管理表格模板", type: "其他", author: "我", uploadTime: "2026-06-26 16:00", grade: "全部", subject: "其他", canEdit: true, canDelete: true },
];

const SCHOOL_RESOURCES: ResourceItem[] = [
  { id: 101, name: "新课标语文教学设计指南", type: "文档课件", author: "张老师", uploadTime: "2026-07-04 10:00", grade: "全部", subject: "语文", reviewStatus: "approved", isMine: false },
  { id: 102, name: "高中数学竞赛题库", type: "作业习题", author: "李老师", uploadTime: "2026-07-03 14:30", grade: "高二", subject: "数学", reviewStatus: "approved", isMine: false },
  { id: 103, name: "英语听说训练平台", type: "教学应用", author: "我", uploadTime: "2026-07-02 16:00", grade: "高一", subject: "英语", reviewStatus: "pending", isMine: true },
  { id: 104, name: "物理实验课堂包", type: "课堂包", author: "王老师", uploadTime: "2026-07-01 09:15", grade: "高三", subject: "物理", reviewStatus: "approved", isMine: false },
  { id: 105, name: "历史朝代时间轴微课", type: "视频", author: "我", uploadTime: "2026-06-30 11:30", grade: "七年级", subject: "历史", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 106, name: "地理区域分析工具", type: "教学应用", author: "赵老师", uploadTime: "2026-06-29 15:45", grade: "高二", subject: "地理", reviewStatus: "approved", isMine: false },
  { id: 107, name: "生物细胞结构课堂包", type: "课堂包", author: "我", uploadTime: "2026-06-28 10:00", grade: "高一", subject: "生物", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 108, name: "化学元素周期表教学", type: "教学应用", author: "我", uploadTime: "2026-06-27 08:30", grade: "高一", subject: "化学", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 109, name: "信息技术编程入门", type: "文档课件", author: "我", uploadTime: "2026-06-26 14:00", grade: "九年级", subject: "信息技术", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 110, name: "音乐鉴赏课件", type: "视频", author: "孙老师", uploadTime: "2026-06-25 10:00", grade: "八年级", subject: "音乐", reviewStatus: "approved", isMine: false },
  { id: 111, name: "体育健康教案", type: "文档课件", author: "周老师", uploadTime: "2026-06-24 15:30", grade: "全部", subject: "体育", reviewStatus: "approved", isMine: false },
  { id: 112, name: "美术鉴赏课堂包", type: "课堂包", author: "我", uploadTime: "2026-06-23 09:00", grade: "高二", subject: "美术", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 113, name: "政治必修一知识点", type: "文档课件", author: "吴老师", uploadTime: "2026-06-22 11:00", grade: "高一", subject: "政治", reviewStatus: "approved", isMine: false },
  { id: 114, name: "英语口语练习平台", type: "教学应用", author: "我", uploadTime: "2026-06-21 16:00", grade: "高二", subject: "英语", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 115, name: "数学几何证明题", type: "作业习题", author: "郑老师", uploadTime: "2026-06-20 13:00", grade: "八年级", subject: "数学", reviewStatus: "approved", isMine: false },
  { id: 116, name: "物理力学模拟实验", type: "教学应用", author: "我", uploadTime: "2026-06-19 10:30", grade: "高一", subject: "物理", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 117, name: "语文古诗词赏析", type: "视频", author: "钱老师", uploadTime: "2026-06-18 09:00", grade: "七年级", subject: "语文", reviewStatus: "approved", isMine: false },
  { id: 118, name: "历史人物传记", type: "文档课件", author: "我", uploadTime: "2026-06-17 14:00", grade: "八年级", subject: "历史", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 119, name: "地理气候分布图", type: "课堂包", author: "冯老师", uploadTime: "2026-06-16 11:30", grade: "高一", subject: "地理", reviewStatus: "approved", isMine: false },
  { id: 120, name: "生物遗传学课件", type: "文档课件", author: "我", uploadTime: "2026-06-15 15:00", grade: "高二", subject: "生物", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 121, name: "化学方程式速查", type: "教学应用", author: "陈老师", uploadTime: "2026-06-14 10:00", grade: "高三", subject: "化学", reviewStatus: "approved", isMine: false },
  { id: 122, name: "英语语法精讲", type: "视频", author: "我", uploadTime: "2026-06-13 08:30", grade: "九年级", subject: "英语", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 123, name: "数学函数图像生成器", type: "教学应用", author: "黄老师", uploadTime: "2026-06-12 14:00", grade: "高一", subject: "数学", reviewStatus: "approved", isMine: false },
  { id: 124, name: "物理电学实验", type: "课堂包", author: "我", uploadTime: "2026-06-11 11:00", grade: "高二", subject: "物理", reviewStatus: "approved", isMine: true, canEdit: true },
  { id: 125, name: "语文作文模板", type: "文档课件", author: "林老师", uploadTime: "2026-06-10 09:00", grade: "高三", subject: "语文", reviewStatus: "approved", isMine: false },
];

const RECOMMENDED_RESOURCES: ResourceItem[] = [
  { id: 201, name: "全国优质课一等奖课堂实录", type: "视频", author: "教育部", uploadTime: "2026-07-04 08:00", grade: "八年级", subject: "数学", reviewStatus: "approved", isMine: false },
  { id: 202, name: "高考真题分类汇编", type: "作业习题", author: "学科网", uploadTime: "2026-07-03 12:00", grade: "高三", subject: "全部", reviewStatus: "approved", isMine: false },
  { id: 203, name: "智慧课堂互动平台", type: "教学应用", author: "教育科技", uploadTime: "2026-07-02 10:30", grade: "全部", subject: "全部", reviewStatus: "approved", isMine: false },
  { id: 204, name: "名师示范课课堂包", type: "课堂包", author: "北京四中", uploadTime: "2026-07-01 14:00", grade: "高一", subject: "语文", reviewStatus: "approved", isMine: false },
  { id: 205, name: "心理健康教育课件", type: "文档课件", author: "北师大", uploadTime: "2026-06-30 09:00", grade: "全部", subject: "政治", reviewStatus: "approved", isMine: false },
  { id: 206, name: "AI作文批改系统", type: "教学应用", author: "科大讯飞", uploadTime: "2026-06-29 16:00", grade: "全部", subject: "语文", reviewStatus: "approved", isMine: false },
  { id: 207, name: "数学思维训练课程", type: "视频", author: "学而思", uploadTime: "2026-06-28 10:00", grade: "七年级", subject: "数学", reviewStatus: "approved", isMine: false },
  { id: 208, name: "英语分级阅读材料", type: "文档课件", author: "外研社", uploadTime: "2026-06-27 14:00", grade: "全部", subject: "英语", reviewStatus: "approved", isMine: false },
  { id: 209, name: "物理虚拟实验室", type: "教学应用", author: "清华附中", uploadTime: "2026-06-26 09:00", grade: "高一", subject: "物理", reviewStatus: "approved", isMine: false },
  { id: 210, name: "历史核心素养教学", type: "课堂包", author: "华东师大", uploadTime: "2026-06-25 11:30", grade: "高二", subject: "历史", reviewStatus: "approved", isMine: false },
  { id: 211, name: "地理AR教学软件", type: "教学应用", author: "北斗导航", uploadTime: "2026-06-24 15:00", grade: "全部", subject: "地理", reviewStatus: "approved", isMine: false },
  { id: 212, name: "生物实验视频库", type: "视频", author: "人教社", uploadTime: "2026-06-23 08:30", grade: "高二", subject: "生物", reviewStatus: "approved", isMine: false },
  { id: 213, name: "化学探究性实验设计", type: "文档课件", author: "南京师大", uploadTime: "2026-06-22 13:00", grade: "高三", subject: "化学", reviewStatus: "approved", isMine: false },
  { id: 214, name: "信息技术编程课程", type: "课堂包", author: "编程猫", uploadTime: "2026-06-21 10:00", grade: "八年级", subject: "信息技术", reviewStatus: "approved", isMine: false },
  { id: 215, name: "音乐欣赏教学指南", type: "文档课件", author: "中央音乐学院", uploadTime: "2026-06-20 14:30", grade: "全部", subject: "音乐", reviewStatus: "approved", isMine: false },
  { id: 216, name: "体育健康教学大纲", type: "文档课件", author: "教育部", uploadTime: "2026-06-19 09:00", grade: "全部", subject: "体育", reviewStatus: "approved", isMine: false },
  { id: 217, name: "美术鉴赏精品课", type: "视频", author: "中央美院", uploadTime: "2026-06-18 12:00", grade: "高一", subject: "美术", reviewStatus: "approved", isMine: false },
  { id: 218, name: "法治教育课件", type: "文档课件", author: "最高法", uploadTime: "2026-06-17 15:00", grade: "全部", subject: "政治", reviewStatus: "approved", isMine: false },
  { id: 219, name: "安全教育平台", type: "教学应用", author: "教育部", uploadTime: "2026-06-16 10:00", grade: "全部", subject: "全部", reviewStatus: "approved", isMine: false },
  { id: 220, name: "传统文化教育资源包", type: "课堂包", author: "故宫博物院", uploadTime: "2026-06-15 08:30", grade: "全部", subject: "语文", reviewStatus: "approved", isMine: false },
  { id: 221, name: "STEM教育课程", type: "教学应用", author: "NASA", uploadTime: "2026-06-14 14:00", grade: "七年级", subject: "科学", reviewStatus: "approved", isMine: false },
  { id: 222, name: "家庭教育指导手册", type: "文档课件", author: "妇联", uploadTime: "2026-06-13 11:00", grade: "全部", subject: "全部", reviewStatus: "approved", isMine: false },
  { id: 223, name: "特教资源库", type: "文档课件", author: "北师大特教", uploadTime: "2026-06-12 09:00", grade: "全部", subject: "全部", reviewStatus: "approved", isMine: false },
  { id: 224, name: "教育评价体系", type: "其他", author: "教育部", uploadTime: "2026-06-11 13:00", grade: "全部", subject: "全部", reviewStatus: "approved", isMine: false },
  { id: 225, name: "智慧校园解决方案", type: "教学应用", author: "华为", uploadTime: "2026-06-10 10:00", grade: "全部", subject: "全部", reviewStatus: "approved", isMine: false },
];

const NOTIFICATIONS: NotificationItem[] = [
  { id: 1, resourceId: 103, resourceName: "英语听说训练平台", status: "pending", time: "2026-07-04 16:00" },
  { id: 2, resourceId: 105, resourceName: "历史朝代时间轴微课", status: "approved", time: "2026-07-03 10:30" },
  { id: 3, resourceId: 107, resourceName: "生物细胞结构课堂包", status: "rejected", time: "2026-07-02 15:00", comment: "资源内容需要更新至最新教材版本" },
];

const MY_ASSETS: Asset[] = [
  {
    id: 1,
    title: "勾股定理课堂包",
    category: "课堂包",
    subject: "数学",
    grade: "八年级",
    updateTime: "2026-07-13",
    isShared: true,
    resource: {
      type: "pkg",
      pkg: SAMPLE_PACKAGE,
    },
  },
  {
    id: 2,
    title: "英语听力训练教案",
    category: "文档课件",
    subject: "英语",
    grade: "高一",
    updateTime: "2026-07-12",
    isShared: false,
    resource: { type: "doc" },
  },
  {
    id: 3,
    title: "一元二次方程练习题",
    category: "习题作业",
    subject: "数学",
    grade: "九年级",
    updateTime: "2026-07-11",
    isShared: true,
    resource: { type: "exercise" },
  },
  {
    id: 4,
    title: "细胞结构微课视频",
    category: "视频",
    subject: "生物",
    grade: "高一",
    updateTime: "2026-07-10",
    isShared: false,
    resource: { type: "video" },
  },
  {
    id: 5,
    title: "化学实验模拟平台",
    category: "教学应用",
    subject: "化学",
    grade: "高二",
    updateTime: "2026-07-09",
    isShared: true,
    resource: { type: "app" },
  },
  {
    id: 6,
    title: "班级管理表格",
    category: "其他",
    subject: "全部",
    grade: "全部",
    updateTime: "2026-07-08",
    isShared: false,
    resource: { type: "other" },
  },
];

function ClassPackageViewer({ 
  pkg, 
  mode,
  externalPhasesCollapsed,
  onPhasesCollapsedChange,
  externalActiveRes,
  onActiveResChange,
  onModulesChange,
  elementSelectMode,
  externalRightPanelCollapsed,
  onRightPanelCollapsedChange,
  externalTocOpen,
  onTocOpenChange,
}: { 
  pkg?: ClassPackage; 
  mode?: "preview" | "edit" | "teaching";
  externalPhasesCollapsed?: boolean;
  onPhasesCollapsedChange?: (collapsed: boolean) => void;
  externalActiveRes?: { phaseIdx: number; resIdx: number };
  onActiveResChange?: (res: { phaseIdx: number; resIdx: number }) => void;
  onModulesChange?: (module: { name: string; type: string; id: number }) => void;
  elementSelectMode?: boolean;
  externalRightPanelCollapsed?: boolean;
  onRightPanelCollapsedChange?: (collapsed: boolean) => void;
  externalTocOpen?: boolean;
  onTocOpenChange?: (open: boolean) => void;
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [internalRightPanelCollapsed, setInternalRightPanelCollapsed] = useState(false);
  const rightPanelCollapsed = externalRightPanelCollapsed !== undefined ? externalRightPanelCollapsed : internalRightPanelCollapsed;
  const setRightPanelCollapsed = (val: boolean) => {
    setInternalRightPanelCollapsed(val);
    onRightPanelCollapsedChange?.(val);
  };
  const editing = mode === "edit";
  const [draft, setDraft] = useState<ClassPackageRes | null>(null);
  const [hoveredRes, setHoveredRes] = useState<{ phaseIdx: number; resIdx: number } | null>(null);
  const [hoveredModule, setHoveredModule] = useState<{ name: string; type: string; rect: DOMRect } | null>(null);
  const [selectedModule, setSelectedModule] = useState<{ name: string; type: string; rect: DOMRect } | null>(null);
  const [selectedModules, setSelectedModules] = useState<{ name: string; type: string; id: number }[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const convertResources = useMemo(() => {
    if (pkg && pkg.phases && pkg.phases.length > 0) {
      const allResources: ClassPackageRes[] = [];
      pkg.phases.forEach(phase => {
        if (phase.resources && phase.resources.length > 0) {
          phase.resources.forEach(res => {
            const typeMap: Record<string, ClassPackageRes["type"]> = {
              ppt: "PPT", doc: "文档", video: "视频", image: "图片",
              quiz: "练习", audio: "音频",
            };
            const resType = typeMap[res.type] || "文档";
            const newRes: ClassPackageRes = {
              id: res.id,
              type: resType,
              name: res.name,
              summary: res.preview || "",
              tags: [],
              thumb: res.thumb,
            };
            if (resType === "PPT") {
              newRes.pages = [{ title: res.name, content: res.preview, layout: "content" }];
            } else if (resType === "视频") {
              newRes.videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
              newRes.chapters = [{ time: "00:00", title: res.name }];
            } else if (resType === "图片") {
              newRes.images = [{ url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(res.name + " education")}&image_size=landscape_16_9`, caption: res.name }];
            } else if (resType === "练习") {
              newRes.questions = [{ id: 1, question: res.preview || "暂无题目", options: ["A", "B", "C", "D"], answer: 0, type: "单选题", explanation: "" }];
            } else {
              newRes.sections = [{ heading: res.name, body: res.preview || "" }];
            }
            allResources.push(newRes);
          });
        }
      });
      return allResources.length > 0 ? allResources : JSON.parse(JSON.stringify(CLASS_PACKAGE_RESOURCES));
    }
    return JSON.parse(JSON.stringify(CLASS_PACKAGE_RESOURCES));
  }, [pkg]);

  const convertPhases = useMemo(() => {
    if (pkg && pkg.phases && pkg.phases.length > 0) {
      let globalIdx = 0;
      return pkg.phases.map((phase, idx) => {
        const parts = phase.label.split("：");
        return {
          num: idx + 1,
          title: parts[0] || phase.label,
          subtitle: parts[1] || phase.desc || "自定义阶段",
          duration: phase.duration,
          resIdx: phase.resources && phase.resources.length > 0 
            ? Array.from({ length: phase.resources.length }, () => globalIdx++)
            : [],
        };
      });
    }
    return JSON.parse(JSON.stringify(CLASS_PACKAGE_PHASES));
  }, [pkg]);

  const [resources, setResources] = useState<ClassPackageRes[]>(convertResources);
  const [phases, setPhases] = useState<ClassPackagePhase[]>(convertPhases);

  useEffect(() => {
    setResources(convertResources);
    setPhases(convertPhases);
    if (!externalActiveRes) setActiveRes({ phaseIdx: 0, resIdx: 0 });
    setPageIndex(0);
  }, [convertResources, convertPhases]);

  const [internalActiveRes, setInternalActiveRes] = useState<{ phaseIdx: number; resIdx: number }>({ phaseIdx: 0, resIdx: 0 });
  const activeRes = externalActiveRes || internalActiveRes;
  const setActiveRes = (val: { phaseIdx: number; resIdx: number }) => {
    setInternalActiveRes(val);
    onActiveResChange?.(val);
  };

  const switchResource = (phaseIdx: number, resIdx: number) => {
    setActiveRes({ phaseIdx, resIdx });
    setPageIndex(0);
  };

  const [dragInfo, setDragInfo] = useState<
    | { kind: "step"; fromIdx: number }
    | { kind: "res"; fromPhaseIdx: number; fromResIdx: number }
    | null
  >(null);
  const [dropTarget, setDropTarget] = useState<
    | { kind: "step"; idx: number; edge: "left" | "right" }
    | { kind: "res"; phaseIdx: number; resIdx: number; edge?: "left" | "right" }
    | null
  >(null);
  const [stepMoreOpen, setStepMoreOpen] = useState<number | null>(null);
  const [stepMorePos, setStepMorePos] = useState<{ top: number; left: number } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ phaseIdx: number; value: string } | null>(null);
  const phaseScrollRef = useRef<HTMLDivElement | null>(null);
  const [phasesHover, setPhasesHover] = useState(false);
  const [phasesOverflow, setPhasesOverflow] = useState(false);
  const [internalPhasesCollapsed, setInternalPhasesCollapsed] = useState(false);
  const phasesCollapsed = externalPhasesCollapsed !== undefined ? externalPhasesCollapsed : internalPhasesCollapsed;
  const setPhasesCollapsed = (val: boolean) => {
    setInternalPhasesCollapsed(val);
    onPhasesCollapsedChange?.(val);
  };
  useEffect(() => {
    const el = phaseScrollRef.current;
    if (!el) return;
    const check = () => setPhasesOverflow(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    el.addEventListener("scroll", check);
    return () => { ro.disconnect(); el.removeEventListener("scroll", check); };
  }, [phases.length]);

  const activeResource = activeRes.phaseIdx === -1 
    ? ({ 
        id: "lesson-plan", name: "教案", type: "教案", 
        tags: ["教案"], summary: "教学流程、讲义等其他内容",
        toc: ["生活情境导入", "教学要点", "常见误区", "课堂小结"],
        sections: [
          { heading: "一、生活情境导入", body: "【教师话术】同学们，请观察这张图：梯子斜靠在墙上，离墙 6 米，梯子长 10 米，问梯子顶端离地多高？——引出本节课题。" },
          { heading: "二、教学要点", body: "强调「直角三角形」是前提条件，非直角不成立；区分「斜边 c」与「直角边 a / b」，避免符号混淆；公式 a² + b² = c² 中，c 永远是斜边；常见勾股数：3-4-5、5-12-13、8-15-17、7-24-25。" },
          { heading: "三、常见误区", body: "1) 把 c² 错位放成 a²；2) 单位忘记统一（如一边用米、一边用厘米）；3) 答题漏写「c = 6 米」。" },
          { heading: "四、课堂小结", body: "本节课主要学习了勾股定理的概念、公式推导及应用。请同学们课后完成习题册第 15-18 题。" },
        ]
      } as ClassPackageRes)
    : resources[phases[activeRes.phaseIdx]?.resIdx?.[activeRes.resIdx] ?? 0];

  useEffect(() => {
    if (editing) {
      setDraft({ ...activeResource });
    } else {
      setDraft(null);
    }
  }, [editing, activeResource]);

  const view = editing && draft !== null ? draft : activeResource;
  const currentPhase = activeRes.phaseIdx === -1 ? undefined : phases[activeRes.phaseIdx];

  const patchDraft = (p: Partial<ClassPackageRes>) => setDraft(d => d ? { ...d, ...p } : d);
  const updateSection = (i: number, p: Partial<{ heading: string; body: string; image?: string; imageCaption?: string }>) => {
    const arr = (view.sections || []).map((s, k) => k === i ? { ...s, ...p } : s);
    patchDraft({ sections: arr });
  };

  const [previewFs, setPreviewFs] = useState(false);
  const [internalTocPanelOpen, setInternalTocPanelOpen] = useState(false);
  const tocPanelOpen = externalTocOpen !== undefined ? externalTocOpen : internalTocPanelOpen;
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    if (previewFs) {
      setInternalTocPanelOpen(false);
    }
  }, [previewFs]);

  useEffect(() => {
    if (!previewFs) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewFs(false);
        setInternalTocPanelOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [previewFs]);

  const tocScrollRef = useRef<HTMLDivElement | null>(null);
  const [tocOverflow, setTocOverflow] = useState(false);
  useEffect(() => {
    const el = tocScrollRef.current;
    if (!el) return;
    const check = () => setTocOverflow(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    el.addEventListener("scroll", check);
    return () => { ro.disconnect(); el.removeEventListener("scroll", check); };
  }, [tocPanelOpen, previewFs]);

  const scrollPhasesBy = (dir: 1 | -1) => {
    const el = phaseScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const scrollTocBy = (dir: 1 | -1) => {
    const el = tocScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.7), behavior: "smooth" });
  };

  function reorderSteps(fromIdx: number, toIdx: number) {
    if (fromIdx === toIdx) return;
    setPhases(prev => {
      const next = prev.slice();
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((p, i) => ({ ...p, num: i + 1 }));
    });
    toastInfo("排序已完成");
  }

  function moveResource(fromPhaseIdx: number, fromResIdx: number, toPhaseIdx: number, toResIdx: number) {
    if (fromPhaseIdx === toPhaseIdx && fromResIdx === toResIdx) return;
    setPhases(prev => {
      const next = prev.map(p => ({ ...p, resIdx: p.resIdx.slice() }));
      const [moved] = next[fromPhaseIdx].resIdx.splice(fromResIdx, 1);
      next[toPhaseIdx].resIdx.splice(toResIdx, 0, moved);
      return next;
    });
    toastInfo("排序已完成");
  }

  function deleteStep(phaseIdx: number) {
    const p = phases[phaseIdx];
    if (!p) return;
    setPhases(prev => prev.filter((_, i) => i !== phaseIdx).map((ph, i) => ({ ...ph, num: i + 1 })));
    toastInfo(`已删除步骤「${p.title}」（演示）`);
  }

  function renameStep(phaseIdx: number, newTitle: string) {
    if (!newTitle.trim()) return;
    setPhases(prev => prev.map((p, i) => i === phaseIdx ? { ...p, title: newTitle.trim() } : p));
    toastInfo(`已重命名为「${newTitle.trim()}」（演示）`);
  }

  function deleteResource(phaseIdx: number, resIdx: number) {
    const p = phases[phaseIdx];
    if (!p) return;
    const resourceIdx = p.resIdx[resIdx];
    const resource = resources[resourceIdx];
    setPhases(prev => {
      const next = prev.map(p => ({ ...p, resIdx: p.resIdx.slice() }));
      next[phaseIdx].resIdx.splice(resIdx, 1);
      return next;
    });
    toastInfo(`已删除资源「${resource?.name || '未知'}」`);
  }

  useEffect(() => {
    if (stepMoreOpen === null) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-step-more]")) setStepMoreOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [stepMoreOpen]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: tk.bgPrimary, overflow: "hidden" }}>
      {!phasesCollapsed && (
        <div style={{ flexShrink: 0, position: "relative", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}` }}>
        <div ref={phaseScrollRef} className="hide-scrollbar" style={{
          display: "flex", gap: 8, overflowX: "auto", padding: "8px",
          scrollbarWidth: "none", msOverflowStyle: "none",
          paddingRight: phasesOverflow ? 96 : 64,
          paddingLeft: phasesOverflow ? 32 : 0,
        }}>
          <div
            onClick={() => { setActiveRes({ phaseIdx: -1, resIdx: 0 }); setPageIndex(0); }}
            style={{
              flex: "0 0 auto", cursor: "pointer",
              display: "flex", flexDirection: "column",
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
              borderRadius: 4, height: 100,
            }}
          >
            <div style={{
              background: tk.bgPrimary, padding: "4px 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "2px 2px 0 0",
            }}>
              <span style={{ fontSize: 12, fontWeight: 400, color: tk.textPlaceholder }}>教案</span>
            </div>
            <div style={{
              display: "flex", padding: 8, gap: 8,
              borderTop: `1px solid ${tk.borderHairline}`,
              height: "calc(100% - 30px)",
            }}>
              <div style={{
                width: 100, height: 56, borderRadius: 4,
                background: activeRes.phaseIdx === -1 ? tk.bgBrandSubtle : tk.bgWhite,
                border: activeRes.phaseIdx === -1 ? `2px solid ${tk.brandDefault}` : `1px solid ${tk.borderHairline}`,
                position: "relative", overflow: "hidden",
              }}>
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lesson%20plan%20document%20preview%20education%20classroom%20clean%20minimal&image_size=square"
                  alt="教案"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>

          {phases.map((p, pi) => {
            const isCurrentPhase = activeRes.phaseIdx === pi;
            const phaseResources = p.resIdx.map(idx => resources[idx] || null).filter(Boolean);
            const isStepDragging = dragInfo?.kind === "step" && dragInfo.fromIdx === pi;
            const isStepDragOver = dropTarget?.kind === "step" && dropTarget.idx === pi;
            const isStepDragOverLeft = isStepDragOver && dropTarget?.edge === "left";
            const isStepDragOverRight = isStepDragOver && dropTarget?.edge === "right";
            return (
              <div
                key={p.num}
                draggable={pi > 0}
                onDragStart={() => {
                  if (pi > 0) {
                    setDragInfo({ kind: "step", fromIdx: pi });
                  }
                }}
                onDragOver={(e) => {
                  if (dragInfo?.kind !== "step") {
                    e.stopPropagation();
                    return;
                  }
                  e.preventDefault();
                  if (pi > 0) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const edge = e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                    setDropTarget({ kind: "step", idx: pi, edge });
                  }
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (dragInfo?.kind === "step" && dragInfo.fromIdx !== pi && pi > 0 && dropTarget?.kind === "step") {
                    const toIdx = dropTarget.edge === "left" ? pi : pi + (dragInfo.fromIdx < pi ? 0 : -1);
                    reorderSteps(dragInfo.fromIdx, Math.max(1, toIdx));
                  }
                  if (dragInfo?.kind !== "step") {
                    setDragInfo(null);
                    setDropTarget(null);
                  }
                }}
                onDragEnd={() => {
                  setDragInfo(null);
                  setDropTarget(null);
                }}
                style={{
                  flex: "0 0 auto",
                  display: "flex", flexDirection: "column",
                  background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                  borderRadius: 4, height: 100,
                  opacity: isStepDragging ? 0.5 : 1,
                  cursor: pi > 0 ? "grab" : "default",
                  position: "relative",
                }}
              >
                {isStepDragOverLeft && (
                  <div style={{
                    position: "absolute", left: -6, top: 0, bottom: 0,
                    width: 6, background: tk.brandDefault,
                    borderRadius: 3, zIndex: 5,
                    boxShadow: `0 0 8px ${tk.brandDefault}`,
                  }} />
                )}
                {isStepDragOverRight && (
                  <div style={{
                    position: "absolute", right: -6, top: 0, bottom: 0,
                    width: 6, background: tk.brandDefault,
                    borderRadius: 3, zIndex: 5,
                    boxShadow: `0 0 8px ${tk.brandDefault}`,
                  }} />
                )}
                <div style={{
                  background: tk.bgPrimary, padding: "4px 8px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderRadius: "2px 2px 0 0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: tk.textPlaceholder,
                      width: 16, height: 16, borderRadius: "50%",
                      background: tk.bgSecondary, display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>{p.num}</span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: tk.textPlaceholder }}>
                      {p.title}：{p.subtitle}（{p.duration}）
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setStepMoreOpen(stepMoreOpen === pi ? null : pi);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setStepMorePos({ top: rect.bottom + 4, left: rect.left - 40 });
                    }}
                    style={{
                      background: tk.bgSecondary, border: "none", cursor: "pointer",
                      padding: "4px 6px", borderRadius: 2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: tk.textPlaceholder,
                    }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
                <div style={{
                  display: "flex", padding: 8, gap: 8,
                  borderTop: `1px solid ${tk.borderHairline}`,
                  height: "calc(100% - 30px)",
                  overflowX: "auto",
                }}>
                  {phaseResources.length === 0 ? (
                    <div style={{
                      flex: "0 0 auto",
                      width: 100, height: 56, borderRadius: 4,
                      background: tk.bgWhite, border: `1px dashed ${tk.borderDefault}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }} onClick={() => toastInfo("点击添加资源颗粒（演示）")}>
                      <Plus size={20} style={{ color: tk.textPlaceholder }} />
                    </div>
                  ) : (
                    phaseResources.map((res, ri) => {
                      const isCurrent = isCurrentPhase && activeRes.resIdx === ri;
                      const isHovered = hoveredRes?.phaseIdx === pi && hoveredRes?.resIdx === ri;
                      const isDragging = dragInfo?.kind === "res" && dragInfo.fromPhaseIdx === pi && dragInfo.fromResIdx === ri;
                      const isResDragOverLeft = dropTarget?.kind === "res" && dropTarget.phaseIdx === pi && dropTarget.resIdx === ri && dropTarget.edge === "left";
                      const isResDragOverRight = dropTarget?.kind === "res" && dropTarget.phaseIdx === pi && dropTarget.resIdx === ri && dropTarget.edge === "right";
                      return (
                        <div
                          key={res.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            e.dataTransfer.effectAllowed = "move";
                            setDragInfo({ kind: "res", fromPhaseIdx: pi, fromResIdx: ri });
                          }}
                          onDragOver={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const edge = e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                            setDropTarget({ kind: "res", phaseIdx: pi, resIdx: ri, edge });
                          }}
                          onDrop={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (dragInfo?.kind === "res") {
                              const sourcePhaseIdx = dragInfo.fromPhaseIdx;
                              const sourceResIdx = dragInfo.fromResIdx;
                              const targetPhaseIdx = pi;
                              const dropEdge = dropTarget?.edge || "left";
                              let targetResIdx = ri;
                              if (dropEdge === "right") {
                                targetResIdx = ri + 1;
                              }
                              setPhases(prevPhases => {
                                const newPhases = prevPhases.map(p => ({ ...p, resIdx: [...p.resIdx] }));
                                const sourceResId = newPhases[sourcePhaseIdx].resIdx.splice(sourceResIdx, 1)[0];
                                if (sourcePhaseIdx === targetPhaseIdx && sourceResIdx < targetResIdx) {
                                  targetResIdx -= 1;
                                }
                                newPhases[targetPhaseIdx].resIdx.splice(targetResIdx, 0, sourceResId);
                                return newPhases;
                              });
                              toastInfo("排序已完成");
                            }
                            setDragInfo(null);
                            setDropTarget(null);
                          }}
                          onDragEnd={() => {
                            setDragInfo(null);
                            setDropTarget(null);
                          }}
                          onClick={() => { 
                    setActiveRes({ phaseIdx: pi, resIdx: ri }); 
                    setPageIndex(0); 
                  }}
                          onMouseEnter={() => setHoveredRes({ phaseIdx: pi, resIdx: ri })}
                          onMouseLeave={() => setHoveredRes(null)}
                          style={{
                            flex: "0 0 auto", cursor: "pointer",
                            width: 100, height: 56, borderRadius: 4,
                            border: isCurrent ? `2px solid ${tk.brandDefault}` : isDragging ? `2px solid ${tk.brandDefault}` : `1px solid ${tk.borderHairline}`,
                            position: "relative", overflow: "hidden",
                            opacity: isDragging ? 0.5 : 1,
                            boxShadow: isDragging ? "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.06)" : isCurrent ? `0 0 8px ${tk.brandDefault}` : "none",
                          }}
                        >
                          {isResDragOverLeft && (
                            <div style={{
                              position: "absolute", left: -6, top: 0, bottom: 0,
                              width: 6, background: tk.brandDefault,
                              borderRadius: 3, zIndex: 5,
                              boxShadow: `0 0 8px ${tk.brandDefault}`,
                            }} />
                          )}
                          {isResDragOverRight && (
                            <div style={{
                              position: "absolute", right: -6, top: 0, bottom: 0,
                              width: 6, background: tk.brandDefault,
                              borderRadius: 3, zIndex: 5,
                              boxShadow: `0 0 8px ${tk.brandDefault}`,
                            }} />
                          )}
                          {res.type === "PPT" && res.pages && res.pages[0]?.image ? (
                            <img src={res.pages[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : res.type === "图片" && res.images && res.images[0]?.url ? (
                            <img src={res.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <img
                              src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(res.name + " education resource thumbnail preview")}&image_size=square`}
                              alt=""
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                          {(isHovered || isCurrent) && (
                            <div style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              background: "rgba(0,0,0,0.7)",
                              padding: "4px 6px",
                              borderRadius: "0 0 4px 4px",
                            }}>
                              <span style={{ fontSize: 12, color: "#fff", fontWeight: 400, textAlign: "center", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{res.name}</span>
                            </div>
                          )}
                          {isHovered && (
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteResource(pi, ri); }}
                              style={{
                                position: "absolute", top: 4, right: 4,
                                width: 20, height: 20,
                                background: "rgba(0,0,0,0.7)",
                                border: "none", borderRadius: "50%",
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff",
                              }}
                              title="删除"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            setPhases(prev => {
              const newPhases = [...prev, {
                num: prev.length + 1,
                title: "新阶段",
                subtitle: "自定义阶段",
                duration: "约5分",
                resIdx: [],
              }];
              setTimeout(() => {
                if (phaseScrollRef.current) {
                  phaseScrollRef.current.scrollTo({ left: phaseScrollRef.current.scrollWidth, behavior: "smooth" });
                }
              }, 100);
              return newPhases;
            });
            toastInfo("已添加新阶段");
          }}
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            zIndex: 10, width: 32,
            background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
            borderLeft: "none",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "-2px 0px 4px 0px rgba(0,0,0,0.04)",
            color: tk.textPlaceholder,
          }}
          title="添加阶段"
        >
          <Plus size={14} />
        </button>

        {phasesOverflow && (
          <>
            <button
              onClick={() => scrollPhasesBy(-1)}
              style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                zIndex: 10, width: 32,
                background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                borderRight: "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "-2px 0px 4px 0px rgba(0,0,0,0.04)",
              }}
            >
              <ChevronLeft size={14} style={{ color: tk.textSecondary }} />
            </button>
            <button
              onClick={() => scrollPhasesBy(1)}
              style={{
                position: "absolute", right: 32, top: 0, bottom: 0,
                zIndex: 10, width: 32,
                background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                borderLeft: "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "-2px 0px 4px 0px rgba(0,0,0,0.04)",
              }}
            >
              <ChevronRight size={14} style={{ color: tk.textSecondary }} />
            </button>
          </>
        )}

        {stepMoreOpen !== null && stepMorePos && (
          <div
            data-step-more
            style={{
              position: "fixed", top: stepMorePos.top, left: stepMorePos.left,
              minWidth: 100, zIndex: 30,
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusMd, boxShadow: tk.shadowLg,
              padding: 4, display: "flex", flexDirection: "column", gap: 1,
            }}
          >
            <button
              onClick={() => {
                const p = phases[stepMoreOpen];
                if (p) {
                  setRenameTarget({ phaseIdx: stepMoreOpen, value: p.title });
                }
                setStepMoreOpen(null);
              }}
              style={{
                background: "none", border: "none", padding: "6px 10px",
                fontSize: 12, color: tk.textPrimary, textAlign: "left",
                cursor: "pointer", borderRadius: tk.radiusSm,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Edit3 size={12} /> 重命名
            </button>
            <button
              onClick={() => {
                deleteStep(stepMoreOpen);
                setStepMoreOpen(null);
              }}
              style={{
                background: "none", border: "none", padding: "6px 10px",
                fontSize: 12, color: tk.textError, textAlign: "left",
                cursor: "pointer", borderRadius: tk.radiusSm,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Trash2 size={12} /> 删除
            </button>
          </div>
        )}
        </div>
      )}

    <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, background: tk.bgPrimary, padding: 0 }}>
      <div style={{ flex: rightPanelCollapsed ? 1 : 3, background: tk.bgWhite, overflow: "hidden", minWidth: 0, position: "relative", borderRadius: 0 }}>
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", gap: 4 }}>
          <button onClick={() => setPreviewFs(true)} title="全屏" style={{
            background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
            borderRadius: tk.radiusSm, padding: "4px 6px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28,
          }}>
            <Maximize2 size={14} style={{ color: tk.textSecondary }} />
          </button>
          <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)} title={rightPanelCollapsed ? "展开资源信息" : "收起资源信息"} style={{
            background: rightPanelCollapsed ? tk.bgWhite : tk.bgBrandSubtle,
            border: rightPanelCollapsed ? `1px solid ${tk.borderDefault}` : `1px solid ${tk.borderBrand}`,
            borderRadius: tk.radiusSm, padding: "4px 6px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28,
            transition: "0.12s",
          }}>
            <ClipboardList size={14} style={{ color: rightPanelCollapsed ? tk.textSecondary : tk.textBrand }} />
          </button>
        </div>
        <div 
          ref={previewRef}
          style={{ height: "100%", overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseOver={(e) => {
            if (!elementSelectMode) return;
            let target = (e.target as HTMLElement).closest('[data-module-name]');
            if (!target) {
              target = e.target as HTMLElement;
            }
            if (target) {
              target.style.outline = `2px solid ${tk.brandDefault}`;
              target.style.outlineOffset = "2px";
              target.style.backgroundColor = "rgba(16,185,129,0.08)";
              target.style.borderRadius = "4px";
              const name = target.getAttribute('data-module-name') || target.tagName.toLowerCase() + (target.textContent?.trim() ? `: ${target.textContent.trim().slice(0, 20)}` : '');
              const type = target.getAttribute('data-module-type') || target.tagName.toLowerCase();
              const rect = target.getBoundingClientRect();
              setHoveredModule({ name, type, rect });
            }
          }}
          onMouseOut={(e) => {
            if (!elementSelectMode) return;
            let target = (e.target as HTMLElement).closest('[data-module-name]');
            if (!target) {
              target = e.target as HTMLElement;
            }
            if (target) {
              target.style.outline = "";
              target.style.outlineOffset = "";
              target.style.backgroundColor = "";
              target.style.borderRadius = "";
            }
            setHoveredModule(null);
          }}
          onClick={(e) => {
            if (!elementSelectMode) return;
            let target = (e.target as HTMLElement).closest('[data-module-name]');
            if (!target) {
              target = e.target as HTMLElement;
            }
            if (target) {
              const name = target.getAttribute('data-module-name') || target.tagName.toLowerCase() + (target.textContent?.trim() ? `: ${target.textContent.trim().slice(0, 20)}` : '');
              const type = target.getAttribute('data-module-type') || target.tagName.toLowerCase();
              const rect = target.getBoundingClientRect();
              setSelectedModule({ name, type, rect });
            } else {
              setSelectedModule(null);
            }
          }}
        >
          {activeRes.phaseIdx === -1 ? (
            <div style={{ padding: tk.spacingLg }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary, marginBottom: 16 }}>教案</div>
              <div style={{ fontSize: 13, color: tk.textSecondary, lineHeight: "1.8" }}>
                {view.sections?.map((section, si) => (
                  <div key={si} style={{ marginBottom: 16 }} data-module-name={section.heading} data-module-type="section">
                    {editing ? (
                      <>
                        <input 
                          value={section.heading}
                          onChange={(e) => updateSection(si, { heading: e.target.value })}
                          style={{
                            fontSize: 14, fontWeight: 600, color: tk.textPrimary,
                            border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm,
                            padding: "4px 8px", marginBottom: 8, width: "100%",
                            outline: "none", fontFamily: "inherit",
                          }}
                        />
                        <textarea 
                          value={section.body}
                          onChange={(e) => updateSection(si, { body: e.target.value })}
                          style={{
                            fontSize: 13, color: tk.textSecondary, lineHeight: "1.8",
                            border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm,
                            padding: "8px 12px", width: "100%", minHeight: 80,
                            resize: "vertical", outline: "none", fontFamily: "inherit",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>{section.heading}</div>
                        <div data-module-name="正文" data-module-type="body">{section.body}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {editing && (
                <button 
                  onClick={() => {
                    const arr = [...(view.sections || []), { heading: "新小节", body: "" }];
                    patchDraft({ sections: arr });
                  }}
                  style={{
                    marginTop: 8, padding: "6px 12px",
                    background: tk.bgWhite, border: `1px dashed ${tk.borderDefault}`,
                    borderRadius: tk.radiusSm, cursor: "pointer",
                    color: tk.textSecondary, fontSize: 12,
                  }}
                >
                  <Plus size={12} style={{ marginRight: 4, display: "inline" }} /> 添加小节
                </button>
              )}
            </div>
          ) : (
            renderResourceContent(view, pageIndex, setPageIndex, "light", editing, {
              updatePage: (i, p) => {},
              updateSection,
              updateChapter: (i, p) => {},
              updateQuestion: (i, p) => {},
              updateOption: (q, o, p) => {},
              patchDraft,
            }, elementSelectMode)
          )}
        </div>

        {(hoveredModule || selectedModule) && (
          <div 
            style={{
              position: "fixed",
              left: (hoveredModule || selectedModule)!.rect.left,
              top: (hoveredModule || selectedModule)!.rect.top - 24,
              backgroundColor: tk.brandDefault,
              color: tk.textReverse,
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 4,
              zIndex: 9999,
              whiteSpace: "nowrap",
            }}
          >
            {(hoveredModule || selectedModule)!.name}
          </div>
        )}

        {selectedModule && (
          <div 
            style={{
              position: "fixed",
              left: selectedModule.rect.left + selectedModule.rect.width - 80,
              top: selectedModule.rect.top + 8,
              zIndex: 9999,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newModule = { name: selectedModule.name, type: selectedModule.type, id: Date.now() };
                if (onModulesChange) {
                  onModulesChange(newModule);
                }
                setSelectedModule(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                backgroundColor: tk.bgWhite,
                border: `1px solid ${tk.borderBrand}`,
                borderRadius: tk.radiusSm,
                color: tk.textBrand,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                boxShadow: tk.shadowMd,
              }}
            >
              <MessageSquarePlus size={14} />
              添加到对话
            </button>
          </div>
        )}
      </div>

      {!rightPanelCollapsed && (
        <div style={{ flex: 1, background: tk.bgPrimary, flexShrink: 0, overflowY: "auto", padding: 0, marginLeft: 12 }}>
          <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: "1px solid " + tk.borderHairline, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid " + tk.borderHairline }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>资源信息</span>
              <button onClick={() => setRightPanelCollapsed(true)} title="收起资源信息" style={{
                background: tk.bgPrimary, border: "none", cursor: "pointer",
                padding: "4px 6px", borderRadius: tk.radiusSm,
                width: 24, height: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={14} style={{ color: tk.textSecondary }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingMd }}>
              <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
                {activeRes.phaseIdx === -1 ? (
                  <div style={{ background: tk.bgSecondary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                    <div style={{ fontSize: 12, color: tk.textSecondary, lineHeight: "1.6" }}>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>类型</div>
                        <div>教案</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>描述</div>
                        <div>教学流程、讲义等其他内容</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
                    {(() => {
                      const phase = phases[activeRes.phaseIdx];
                      const globalIdx = phase?.resIdx[activeRes.resIdx];
                      const resource = globalIdx !== undefined ? resources[globalIdx] : null;
                      if (!resource) return null;
                      return (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary }}>{resource.name}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Info size={12} style={{ color: tk.textPlaceholder }} />
                              <span style={{ fontSize: 12, color: tk.textPlaceholder }}>此模块内容授课时不显示</span>
                            </div>
                          </div>

                          <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusMd, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: tk.textPlaceholder }}>讲授时间建议</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>{phase?.duration || "—"}</span>
                          </div>

                          <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>资源简介</div>
                            <div style={{ fontSize: 14, color: tk.textSecondary, lineHeight: 1.6 }}>{resource.summary}</div>
                            {resource.tags && resource.tags.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                                {resource.tags.map((tag, ti) => (
                                  <span key={ti} style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, background: tk.bgSecondary, padding: "4px 10px", borderRadius: tk.radiusSm }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>讲授备注</div>
                            <div style={{ fontSize: 14, color: tk.textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                              {resource.teachingNotes}
                            </div>
                          </div>

                          {resource.attachments && resource.attachments.length > 0 && (
                            <div style={{ background: tk.bgSecondary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>附件</div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {resource.attachments.map((att, ati) => (
                                  <div key={ati} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: tk.radiusSm, background: tk.bgPrimary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      <FileText size={12} />
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 12, color: tk.textPrimary }}>{att.name}</div>
                                      <div style={{ fontSize: 10, color: tk.textPlaceholder }}>{att.size}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {previewFs && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: tk.bgPrimary, display: "flex", flexDirection: "column",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => {
                const newVal = !tocPanelOpen;
                setInternalTocPanelOpen(newVal);
                onTocOpenChange?.(newVal);
              }} style={{
                background: tocPanelOpen ? tk.bgBrandSubtle : tk.bgWhite,
                border: tocPanelOpen ? `1px solid ${tk.borderBrand}` : `1px solid ${tk.borderDefault}`,
                color: tocPanelOpen ? tk.textBrand : tk.textSecondary,
                padding: "6px 12px", borderRadius: tk.radiusSm, fontSize: 12,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>
                <List size={14} /> 目录
              </button>
              <div style={{ fontSize: 12, color: tk.textSecondary }}>
                {currentPhase?.title} · {activeResource.name}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)} title={rightPanelCollapsed ? "展开资源信息" : "收起资源信息"} style={{
                background: rightPanelCollapsed ? tk.bgWhite : tk.bgBrandSubtle,
                border: rightPanelCollapsed ? `1px solid ${tk.borderDefault}` : `1px solid ${tk.borderBrand}`,
                color: rightPanelCollapsed ? tk.textSecondary : tk.textBrand,
                padding: "6px", borderRadius: tk.radiusSm,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ClipboardList size={14} />
              </button>
              <button onClick={() => {
                if (activeRes.resIdx > 0) {
                  switchResource(activeRes.phaseIdx, activeRes.resIdx - 1);
                } else if (activeRes.phaseIdx > 0) {
                  const prevPhase = phases[activeRes.phaseIdx - 1];
                  switchResource(activeRes.phaseIdx - 1, prevPhase.resIdx.length - 1);
                }
              }} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                color: tk.textSecondary, padding: "6px", borderRadius: tk.radiusSm,
                cursor: "pointer",
              }} title="上一资源">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => {
                const currentPhaseRes = phases[activeRes.phaseIdx];
                if (activeRes.resIdx < currentPhaseRes.resIdx.length - 1) {
                  switchResource(activeRes.phaseIdx, activeRes.resIdx + 1);
                } else if (activeRes.phaseIdx < phases.length - 1) {
                  switchResource(activeRes.phaseIdx + 1, 0);
                }
              }} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                color: tk.textSecondary, padding: "6px", borderRadius: tk.radiusSm,
                cursor: "pointer",
              }} title="下一资源">
                <ChevronRight size={16} />
              </button>
              <button onClick={() => { setPreviewFs(false); setTocPanelOpen(false); }} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                color: tk.textSecondary, padding: "6px 12px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>
                <X size={14} /> 退出全屏
              </button>
            </div>
          </div>

          {tocPanelOpen && (
            <div style={{ padding: "12px 0", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`, position: "relative" }}>
              {tocOverflow && (
                <>
                  <button onClick={() => scrollTocBy(-1)} style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 5,
                    width: 40, background: "linear-gradient(to right, rgba(255,255,255,0.9), transparent)",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ChevronLeft size={16} style={{ color: tk.textSecondary }} />
                  </button>
                  <button onClick={() => scrollTocBy(1)} style={{
                    position: "absolute", right: 0, top: 0, bottom: 0, zIndex: 5,
                    width: 40, background: "linear-gradient(to left, rgba(255,255,255,0.9), transparent)",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ChevronRight size={16} style={{ color: tk.textSecondary }} />
                  </button>
                </>
              )}
              <div ref={tocScrollRef} className="hide-scrollbar" style={{
                display: "flex", gap: 8, overflowX: "auto", padding: "0 48px",
                scrollbarWidth: "none", msOverflowStyle: "none",
              }}>
                {phases.map((p, pi) => (
                  <div key={p.num} style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontSize: 11, color: tk.textPlaceholder, paddingLeft: 4 }}>
                      {p.title}：{p.subtitle}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {p.resIdx.map((ridx, ri) => {
                        const res = resources[ridx];
                        const isCurrent = activeRes.phaseIdx === pi && activeRes.resIdx === ri;
                        return (
                          <div
                            key={res.id}
                            onClick={() => { switchResource(pi, ri); setTocPanelOpen(false); }}
                            style={{
                              width: 110, height: 64, borderRadius: 4,
                              border: isCurrent ? `2px solid ${tk.borderBrand}` : `1px solid ${tk.borderHairline}`,
                              background: isCurrent ? tk.bgBrandSubtle : tk.bgWhite,
                              cursor: "pointer", position: "relative", overflow: "hidden",
                              transition: "all 0.15s",
                            }}
                          >
                            {res.type === "PPT" && res.pages && res.pages[0]?.image && (
                              <img src={res.pages[0].image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "图片" && res.images && res.images[0]?.url && (
                              <img src={res.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "视频" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20playback%20interface%20education%20classroom%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "练习" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quiz%20question%20education%20test%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "作业" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=homework%20assignment%20education%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "教案" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=document%20lesson%20plan%20education%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "网页" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=web%20page%20interface%20education%20tool%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            {res.type === "音频" && (
                              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=audio%20player%20interface%20education%20preview&image_size=square" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isCurrent ? 1 : 0.7 }} />
                            )}
                            <div style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                              padding: "4px 6px",
                            }}>
                              <span style={{ fontSize: 10, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{res.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, background: tk.bgPrimary, padding: 16 }}>
            <div style={{ flex: rightPanelCollapsed ? 1 : 3, background: tk.bgWhite, overflow: "hidden", minWidth: 0, position: "relative", borderRadius: 8 }}>
              <div style={{ height: "100%", overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {activeRes.phaseIdx === -1 ? (
                  <div style={{ padding: tk.spacingLg }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary, marginBottom: 16 }}>教案</div>
                    <div style={{ fontSize: 13, color: tk.textSecondary, lineHeight: "1.8" }}>
                      {view.sections?.map((section, si) => (
                        <div key={si} style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>{section.heading}</div>
                          <div>{section.body}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  renderResourceContent(view, pageIndex, setPageIndex, "light", false)
                )}
              </div>
            </div>

            {!rightPanelCollapsed && (
              <div style={{ flex: 1, background: tk.bgPrimary, flexShrink: 0, overflowY: "auto", padding: 0, marginLeft: 12 }}>
                <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: "1px solid " + tk.borderHairline, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid " + tk.borderHairline }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>资源信息</span>
                    <button onClick={() => setRightPanelCollapsed(true)} title="收起资源信息" style={{
                      background: tk.bgPrimary, border: "none", cursor: "pointer",
                      padding: "4px 6px", borderRadius: tk.radiusSm,
                      width: 24, height: 24,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <X size={14} style={{ color: tk.textSecondary }} />
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingMd }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
                      {activeRes.phaseIdx === -1 ? (
                        <div style={{ background: tk.bgSecondary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                          <div style={{ fontSize: 12, color: tk.textSecondary, lineHeight: "1.6" }}>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>类型</div>
                              <div>教案</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>描述</div>
                              <div>教学流程、讲义等其他内容</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ background: tk.bgSecondary, borderRadius: tk.radiusMd, padding: tk.spacingMd }}>
                            <div style={{ fontSize: 12, color: tk.textSecondary, lineHeight: "1.6" }}>
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>资源名称</div>
                                <div style={{ fontWeight: 600, color: tk.textPrimary }}>{activeResource.name}</div>
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>资源类型</div>
                                <div>{activeResource.type}</div>
                              </div>
                              {activeResource.summary && (
                                <div>
                                  <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 2 }}>简介</div>
                                  <div>{activeResource.summary}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          {(activeResource.tags && activeResource.tags.length > 0) && (
                            <div>
                              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginBottom: 8 }}>标签</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {activeResource.tags.map((tag, ti) => (
                                  <span key={ti} style={{
                                    fontSize: 11, color: tk.textSecondary,
                                    background: tk.bgBrandSubtle, padding: "2px 8px",
                                    borderRadius: tk.radiusSm,
                                  }}>{tag}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {renameTarget && (
        <div
          onClick={() => setRenameTarget(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(0,0,0,0.35)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: tk.bgWhite, borderRadius: tk.radiusMd, boxShadow: tk.shadowLg,
              padding: 18, width: 360, display: "flex", flexDirection: "column", gap: 12,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>重命名步骤</div>
            <input
              autoFocus
              value={renameTarget.value}
              onChange={e => setRenameTarget({ ...renameTarget, value: e.target.value })}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  renameStep(renameTarget.phaseIdx, renameTarget.value);
                  setRenameTarget(null);
                } else if (e.key === "Escape") {
                  setRenameTarget(null);
                }
              }}
              style={{
                width: "100%", boxSizing: "border-box", fontSize: 13,
                color: tk.textPrimary, border: `1px solid ${tk.borderBrand}`,
                borderRadius: tk.radiusSm, padding: "6px 10px", outline: "none",
                fontFamily: "var(--font-family)",
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => setRenameTarget(null)}
                style={{
                  background: tk.bgWhite, border: `1px solid ${tk.borderDefault}`,
                  color: tk.textSecondary, fontSize: 12, padding: "5px 14px",
                  borderRadius: tk.radiusSm, cursor: "pointer",
                }}
              >取消</button>
              <button
                onClick={() => {
                  renameStep(renameTarget.phaseIdx, renameTarget.value);
                  setRenameTarget(null);
                }}
                style={{
                  background: tk.bgBrandDefault, border: `1px solid ${tk.brandDefault}`,
                  color: tk.textReverse, fontSize: 12, padding: "5px 14px",
                  borderRadius: tk.radiusSm, cursor: "pointer", fontWeight: 500,
                }}
              >确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyTAResourcePreviewModal({ resource, onClose, onCreateTask }: { resource: CardResource; onClose: () => void; onCreateTask: (resource: CardResource) => void }) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDirectory, setShowDirectory] = useState(true);
  const category = TAG_TO_CATEGORY[resource.tag] || "其他";

  const handleCreateTask = () => {
    onCreateTask(resource);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: tk.bgWhite, borderRadius: tk.radiusLg,
        width: "90%",
        maxWidth: "1400px",
        height: "90%",
        boxShadow: tk.shadowLg, display: "flex", flexDirection: "column",
        overflow: "hidden",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          background: tk.bgWhite,
          borderBottom: `1px solid ${tk.borderHairline}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${tk.spacingSm} ${tk.spacingMd}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: tk.textBrand,
                background: tk.bgBrandSubtle, padding: "2px 8px",
                borderRadius: tk.radiusSm,
              }}>{category}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: tk.textPrimary }}>{resource.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => setShowMoreMenu(!showMoreMenu)} style={{
                background: tk.bgWhite, border: "none",
                padding: "4px 8px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <MoreHorizontal size={14} />
              </button>
              <button onClick={() => toastInfo("分享链接（演示）")} style={{
                background: tk.bgWhite, border: "none",
                padding: "4px 8px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Share2 size={14} />
              </button>
              <button onClick={() => setShowDirectory(!showDirectory)} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                padding: "4px 8px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <List size={14} />
              </button>
              <button onClick={() => toastInfo("继续调整（演示）")} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                padding: "4px 12px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
              }}>
                继续调整
              </button>
              <button onClick={handleCreateTask} style={{
                background: tk.brandDefault, border: "none",
                padding: "4px 16px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer",
                color: tk.textReverse,
                fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
                boxShadow: tk.shadowSm,
              }}>
                <Sparkles size={12} /> 制作同款
              </button>
              <button onClick={onClose} style={{
                background: tk.bgWhite, border: "none",
                padding: "4px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", padding: `${tk.spacingXs} ${tk.spacingMd}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: tk.textBrand,
                background: tk.bgBrandSubtle, padding: "1px 5px",
                borderRadius: tk.radiusXs,
              }}>{resource.subject}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, color: tk.textBrand,
                background: tk.bgBrandSubtle, padding: "1px 5px",
                borderRadius: tk.radiusXs,
              }}>{resource.grade}</span>
            </div>
            <div style={{ flex: 1 }}></div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontSize: 11, color: tk.textPlaceholder,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <User size={10} />
                {resource.author}提供
              </span>
              <span style={{
                fontSize: 11, color: tk.textPlaceholder,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Copy size={10} />
                {resource.views >= 10000 ? (resource.views / 10000).toFixed(1) + "万" : resource.views}人使用同款
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <ClassPackageViewer pkg={SAMPLE_PACKAGE} mode="preview" externalPhasesCollapsed={!showDirectory} />
        </div>
      </div>
    </div>
  );
}

function AssetPreviewModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDirectory, setShowDirectory] = useState(true);

  const handleShare = () => {
    setShowShareConfirm(true);
  };

  const confirmShare = () => {
    toastInfo(asset.isShared ? "资源已取消共享" : "资源已共享至myTa资源推荐区");
    setShowShareConfirm(false);
  };

  const isPkg = asset.resource.type === "pkg";

  const shareStatusText = asset.isShared 
    ? "本资产已共享，本校所有教师均可见" 
    : "本资产未共享，仅个人可见";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: tk.bgWhite, borderRadius: tk.radiusLg,
        width: "90%",
        maxWidth: "1400px",
        height: "90%",
        boxShadow: tk.shadowLg, display: "flex", flexDirection: "column",
        overflow: "hidden",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          background: tk.bgWhite,
          borderBottom: `1px solid ${tk.borderHairline}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${tk.spacingSm} ${tk.spacingMd}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: tk.textSecondary,
                background: tk.bgSecondary, padding: "2px 8px",
                borderRadius: tk.radiusSm,
              }}>{asset.category}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: tk.textPrimary }}>{asset.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => setShowMoreMenu(!showMoreMenu)} style={{
                background: tk.bgWhite, border: "none",
                padding: "4px 8px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <MoreHorizontal size={14} />
              </button>
              <button onClick={() => toastInfo("分享链接（演示）")} style={{
                background: tk.bgWhite, border: "none",
                padding: "4px 8px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Share2 size={14} />
              </button>
              <button onClick={() => setShowDirectory(!showDirectory)} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                padding: "4px 8px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <List size={14} />
              </button>
              <button onClick={() => toastInfo("继续调整（打开myta）")} style={{
                background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`,
                padding: "4px 12px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
              }}>
                继续调整
              </button>
              <button onClick={handleShare} style={{
                background: asset.isShared ? tk.bgWarningSubtle : tk.bgBrandSubtle,
                border: `1px solid ${asset.isShared ? tk.borderWarning : tk.borderBrand}`,
                padding: "4px 12px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer",
                color: asset.isShared ? tk.textWarning : tk.textBrand,
                fontWeight: 500,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Share2 size={14} /> {asset.isShared ? "取消共享" : "共享"}
              </button>
              <button onClick={onClose} style={{
                background: tk.bgWhite, border: "none",
                padding: "4px", borderRadius: tk.radiusSm,
                fontSize: 12, cursor: "pointer", color: tk.textSecondary,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={14} />
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", padding: `${tk.spacingXs} ${tk.spacingMd}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: tk.textBrand,
                background: tk.bgBrandSubtle, padding: "1px 5px",
                borderRadius: tk.radiusXs,
              }}>{asset.subject}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, color: tk.textBrand,
                background: tk.bgBrandSubtle, padding: "1px 5px",
                borderRadius: tk.radiusXs,
              }}>{asset.grade}</span>
              <span style={{ fontSize: 12, color: tk.textPlaceholder }}>{asset.updateTime}</span>
            </div>
            <div style={{ flex: 1 }}></div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontSize: 11, color: asset.isShared ? tk.textSuccess : tk.textWarning,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Lock size={10} />
                {shareStatusText}
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {isPkg && asset.resource.pkg && (
            <ClassPackageViewer pkg={asset.resource.pkg} mode="preview" externalPhasesCollapsed={!showDirectory} />
          )}
          {!isPkg && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: tk.bgPrimary }}>
              <div style={{ textAlign: "center", padding: tk.spacingXl }}>
                {asset.resource.type === "doc" && (
                  <><FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ fontSize: 14, color: tk.textPlaceholder }}>文档课件预览</div></>
                )}
                {asset.resource.type === "video" && (
                  <><Video size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ fontSize: 14, color: tk.textPlaceholder }}>视频预览</div></>
                )}
                {asset.resource.type === "exercise" && (
                  <><ClipboardList size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ fontSize: 14, color: tk.textPlaceholder }}>习题作业预览</div></>
                )}
                {asset.resource.type === "app" && (
                  <><Play size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ fontSize: 14, color: tk.textPlaceholder }}>教学应用预览</div></>
                )}
                {asset.resource.type === "other" && (
                  <><FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ fontSize: 14, color: tk.textPlaceholder }}>其他资源预览</div></>
                )}
              </div>
            </div>
          )}
        </div>

        {showShareConfirm && (
          <div style={{
            position: "absolute", right: 16, top: 80, zIndex: 10,
            background: tk.bgWhite, borderRadius: tk.radiusMd,
            border: `1px solid ${tk.borderDefault}`, boxShadow: tk.shadowMd,
            padding: "12px 16px", minWidth: 240,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 13, color: tk.textPrimary, marginBottom: 10 }}>
              {asset.isShared ? "确认取消共享？" : "确认共享至myTa资源推荐区？"}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowShareConfirm(false)} style={{
                padding: "4px 12px", fontSize: 12, color: tk.textSecondary,
                background: tk.bgPrimary, border: "none", borderRadius: tk.radiusSm,
                cursor: "pointer",
              }}>取消</button>
              <button onClick={confirmShare} style={{
                padding: "4px 12px", fontSize: 12, color: tk.textReverse,
                background: tk.brandDefault, border: "none", borderRadius: tk.radiusSm,
                cursor: "pointer",
              }}>确认</button>
            </div>
          </div>
        )}

        {showMoreMenu && (
          <div style={{
            position: "absolute", right: 80, top: 44, zIndex: 10,
            background: tk.bgWhite, borderRadius: tk.radiusMd,
            border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowLg,
            minWidth: 120, overflow: "hidden",
          }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { toastInfo("重命名（演示）"); setShowMoreMenu(false); }} style={{
              width: "100%", background: "transparent", border: "none",
              padding: "8px 16px", cursor: "pointer", textAlign: "left",
              fontSize: 13, color: tk.textPrimary, fontWeight: 400,
              transition: "all 0.1s",
            }} onMouseEnter={e => e.currentTarget.style.background = tk.bgPrimary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              重命名
            </button>
            <button onClick={() => { toastInfo("删除（演示）"); setShowMoreMenu(false); }} style={{
              width: "100%", background: "transparent", border: "none",
              padding: "8px 16px", cursor: "pointer", textAlign: "left",
              fontSize: 13, color: tk.textError, fontWeight: 400,
              transition: "all 0.1s",
            }} onMouseEnter={e => e.currentTarget.style.background = tk.bgPrimary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceLibrary({ onNavigate }: { onNavigate: (m: Module) => void }) {
  const [assets, setAssets] = useState<Asset[]>(MY_ASSETS);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [selectedGrade, setSelectedGrade] = useState("全部");
  const [selectedSubject, setSelectedSubject] = useState("全部");
  const [searchText, setSearchText] = useState("");
  const [hoveredAsset, setHoveredAsset] = useState<number | null>(null);
  const [showShareConfirm, setShowShareConfirm] = useState<{ id: number; x: number; y: number } | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<{ id: number; x: number; y: number } | null>(null);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);

  const categories = ["全部", "课堂包", "教学应用", "习题作业", "文档课件", "视频", "其他"];
  const subjects = ["全部", "语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"];
  const grades = ["全部", "一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "初一", "初二", "初三", "高一", "高二", "高三"];

  const filteredAssets = assets.filter(a => {
    if (activeCategory !== "全部" && a.category !== activeCategory) return false;
    if (selectedGrade !== "全部" && a.grade !== selectedGrade) return false;
    if (selectedSubject !== "全部" && a.subject !== selectedSubject) return false;
    if (searchText && !a.title.includes(searchText)) return false;
    return true;
  }).sort((a, b) => {
    return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime();
  });

  const groupedAssets = filteredAssets.reduce((acc, asset) => {
    const date = new Date(asset.updateTime);
    const key = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  const sortedGroups = Object.keys(groupedAssets).sort((a, b) => b.localeCompare(a));

  const assetCount = assets.length;
  const mytaTaskCount = 12;
  const sharedCount = assets.filter(a => a.isShared).length;

  const handleShareClick = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setShowShareConfirm({ id: asset.id, x: rect.left, y: rect.bottom + 4 });
  };

  const confirmShare = (assetId: number) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const newStatus = !a.isShared;
        if (newStatus) {
          toastInfo("资源已共享至myTa资源推荐区");
        } else {
          toastInfo("资源已取消共享");
        }
        return { ...a, isShared: newStatus };
      }
      return a;
    }));
    setShowShareConfirm(null);
  };

  const handleMoreClick = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setShowMoreMenu({ id: asset.id, x: rect.left, y: rect.bottom + 4 });
  };

  const handleDocumentClick = () => {
    setShowShareConfirm(null);
    setShowMoreMenu(null);
    setShowSubjectDropdown(false);
    setShowGradeDropdown(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }} onClick={handleDocumentClick}>
      <div style={{ padding: `${tk.spacingMd} ${tk.spacingLg}`, background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: tk.textPrimary }}>我的资产</div>
        <button onClick={() => onNavigate("myta")} style={{
          display: "flex", alignItems: "center", gap: 4,
          background: tk.brandDefault, color: tk.textReverse,
          border: "none", borderRadius: tk.radiusSm,
          fontSize: 12, fontWeight: 600, padding: "6px 12px",
          cursor: "pointer", transition: "all 0.12s",
          boxShadow: tk.shadowSm,
        }}
          onMouseEnter={e => e.currentTarget.style.background = tk.brandHover}
          onMouseLeave={e => e.currentTarget.style.background = tk.brandDefault}
        >
          <Bot size={14} />
          MyTA生成资源
        </button>
      </div>

      <div style={{ padding: `${tk.spacingMd} ${tk.spacingLg}`, background: tk.bgPrimary }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: tk.spacingMd, marginBottom: tk.spacingMd }}>
          <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, padding: `${tk.spacingMd} ${tk.spacingLg}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: tk.textPrimary }}>{assetCount}</span>
            <span style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 4 }}>资产总数</span>
          </div>
          <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, padding: `${tk.spacingMd} ${tk.spacingLg}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: tk.textPrimary }}>{mytaTaskCount}</span>
            <span style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 4 }}>MyTA任务数</span>
          </div>
          <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, padding: `${tk.spacingMd} ${tk.spacingLg}`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: tk.textPrimary }}>{sharedCount}</span>
            <span style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 4 }}>已共享资产</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: tk.spacingMd, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: tk.spacingXs }}>
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)} style={{
                padding: "3px 11px", borderRadius: tk.radiusFull,
                background: c === activeCategory ? tk.bgBrandSubtle : tk.bgWhite,
                color: c === activeCategory ? tk.textBrand : tk.textSecondary,
                border: `1px solid ${c === activeCategory ? tk.borderBrand : tk.borderHairline}`,
                fontSize: 12, cursor: "pointer", transition: "all 0.12s",
                fontWeight: c === activeCategory ? 600 : 400,
              }}>{c}</button>
            ))}
          </div>

          <div style={{ flex: 1 }}></div>

          <div style={{ display: "flex", alignItems: "center", gap: tk.spacingMd }}>
            <div style={{ position: "relative" }}>
              <button onClick={(e) => { e.stopPropagation(); setShowSubjectDropdown(!showSubjectDropdown); setShowGradeDropdown(false); }} style={{
                padding: "4px 10px", borderRadius: tk.radiusFull,
                background: tk.bgWhite, color: tk.textSecondary,
                border: `1px solid ${tk.borderHairline}`,
                fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {selectedSubject === "全部" ? "学科" : selectedSubject}
                <ChevronDown size={10} />
              </button>
              {showSubjectDropdown && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, zIndex: 100,
                  background: tk.bgWhite, borderRadius: tk.radiusSm,
                  border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowMd,
                  minWidth: 100, marginTop: 4,
                }} onClick={(e) => e.stopPropagation()}>
                  {subjects.map(s => (
                    <button key={s} onClick={() => { setSelectedSubject(s); setShowSubjectDropdown(false); }} style={{
                      width: "100%", padding: "6px 12px", textAlign: "left",
                      background: s === selectedSubject ? tk.bgBrandSubtle : "transparent",
                      color: s === selectedSubject ? tk.textBrand : tk.textPrimary,
                      border: "none", fontSize: 12, cursor: "pointer",
                    }}>{s}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button onClick={(e) => { e.stopPropagation(); setShowGradeDropdown(!showGradeDropdown); setShowSubjectDropdown(false); }} style={{
                padding: "4px 10px", borderRadius: tk.radiusFull,
                background: tk.bgWhite, color: tk.textSecondary,
                border: `1px solid ${tk.borderHairline}`,
                fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {selectedGrade === "全部" ? "年级" : selectedGrade}
                <ChevronDown size={10} />
              </button>
              {showGradeDropdown && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, zIndex: 100,
                  background: tk.bgWhite, borderRadius: tk.radiusSm,
                  border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowMd,
                  minWidth: 100, marginTop: 4,
                }} onClick={(e) => e.stopPropagation()}>
                  {grades.map(g => (
                    <button key={g} onClick={() => { setSelectedGrade(g); setShowGradeDropdown(false); }} style={{
                      width: "100%", padding: "6px 12px", textAlign: "left",
                      background: g === selectedGrade ? tk.bgBrandSubtle : "transparent",
                      color: g === selectedGrade ? tk.textBrand : tk.textPrimary,
                      border: "none", fontSize: 12, cursor: "pointer",
                    }}>{g}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6, minWidth: 180 }}>
              <Search size={12} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />
              <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="搜索资源名称…" style={{
                border: "none", background: "transparent", outline: "none",
                fontSize: 12, color: tk.textPrimary, width: "100%",
              }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", background: tk.bgPrimary, padding: `${tk.spacingMd} ${tk.spacingLg}` }}>
        {filteredAssets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <FileText size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div style={{ fontSize: 14, color: tk.textPlaceholder }}>暂无符合条件的资产</div>
          </div>
        ) : (
          <div>
            {sortedGroups.map(groupKey => (
              <div key={groupKey} style={{ marginBottom: tk.spacingMd }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: tk.textSecondary, marginBottom: tk.spacingSm }}>
                  {groupKey}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: tk.spacingSm }}>
                  {groupedAssets[groupKey].map(asset => (
                    <div
                      key={asset.id}
                      onClick={() => setPreviewAsset(asset)}
                      onMouseEnter={() => setHoveredAsset(asset.id)}
                      onMouseLeave={() => setHoveredAsset(null)}
                      style={{
                        background: tk.bgWhite, borderRadius: tk.radiusMd,
                        border: `1px solid ${tk.borderHairline}`,
                        overflow: "hidden", cursor: "pointer",
                        transition: "all 0.15s",
                        boxShadow: hoveredAsset === asset.id ? tk.shadowMd : "none",
                      }}
                    >
                      <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
                        <img
                          src={`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(asset.title + " education")}&image_size=landscape_4_3`}
                          alt={asset.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.2s", transform: hoveredAsset === asset.id ? "scale(1.05)" : "scale(1)" }}
                        />
                        <div style={{ position: "absolute", top: 6, left: 6, display: "flex", gap: 3 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: tk.textBrand,
                            background: "rgba(255,255,255,0.95)", padding: "2px 6px",
                            borderRadius: tk.radiusXs,
                          }}>{asset.subject}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: tk.textBrand,
                            background: "rgba(255,255,255,0.95)", padding: "2px 6px",
                            borderRadius: tk.radiusXs,
                          }}>{asset.grade}</span>
                        </div>
                      </div>

                      <div style={{ padding: tk.spacingSm }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, color: tk.textBrand,
                            background: tk.bgBrandSubtle, padding: "1px 5px",
                            borderRadius: tk.radiusXs,
                          }}>{asset.category}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                            {asset.title}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} />
                            {asset.updateTime}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {hoveredAsset === asset.id && (
                              <button onClick={(e) => handleMoreClick(e, asset)} style={{
                                background: "transparent", border: "none",
                                cursor: "pointer", padding: "2px 4px",
                                borderRadius: tk.radiusXs,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: tk.textPlaceholder,
                              }} title="更多">
                                <MoreHorizontal size={12} />
                              </button>
                            )}
                            <button onClick={(e) => handleShareClick(e, asset)} style={{
                              background: asset.isShared ? tk.bgSuccessSubtle : tk.bgBrandSubtle,
                              border: `1px solid ${asset.isShared ? tk.borderSuccess : tk.borderBrand}`,
                              cursor: "pointer", padding: "3px 8px",
                              borderRadius: tk.radiusXs,
                              fontSize: 11,
                              color: asset.isShared ? tk.textSuccess : tk.textBrand,
                              fontWeight: 500,
                            }}>
                              {asset.isShared ? "已共享" : "共享"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showShareConfirm && (
        <div style={{
          position: "fixed", left: showShareConfirm.x, top: showShareConfirm.y, zIndex: 600,
          background: tk.bgWhite, borderRadius: tk.radiusMd,
          border: `1px solid ${tk.borderDefault}`, boxShadow: tk.shadowMd,
          padding: "12px 16px", minWidth: 200,
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 13, color: tk.textPrimary, marginBottom: 10 }}>
            {assets.find(a => a.id === showShareConfirm.id)?.isShared ? "确认取消共享？" : "确认共享至myTa资源推荐区？"}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setShowShareConfirm(null)} style={{
              padding: "4px 12px", fontSize: 12, color: tk.textSecondary,
              background: tk.bgPrimary, border: "none", borderRadius: tk.radiusSm,
              cursor: "pointer",
            }}>取消</button>
            <button onClick={() => confirmShare(showShareConfirm.id)} style={{
              padding: "4px 12px", fontSize: 12, color: tk.textReverse,
              background: tk.brandDefault, border: "none", borderRadius: tk.radiusSm,
              cursor: "pointer",
            }}>确认</button>
          </div>
        </div>
      )}

      {showMoreMenu && (
        <div style={{
          position: "fixed", left: showMoreMenu.x, top: showMoreMenu.y, zIndex: 500,
          background: tk.bgWhite, borderRadius: tk.radiusMd,
          border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowLg,
          minWidth: 120, overflow: "hidden",
        }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { toastInfo("重命名（演示）"); setShowMoreMenu(null); }} style={{
            width: "100%", background: "transparent", border: "none",
            padding: "8px 16px", cursor: "pointer", textAlign: "left",
            fontSize: 13, color: tk.textPrimary, fontWeight: 400,
            transition: "all 0.1s",
          }} onMouseEnter={e => e.currentTarget.style.background = tk.bgPrimary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            重命名
          </button>
          <button onClick={() => { onNavigate("myta"); setShowMoreMenu(null); }} style={{
            width: "100%", background: "transparent", border: "none",
            padding: "8px 16px", cursor: "pointer", textAlign: "left",
            fontSize: 13, color: tk.textPrimary, fontWeight: 400,
            transition: "all 0.1s",
          }} onMouseEnter={e => e.currentTarget.style.background = tk.bgPrimary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            继续调整
          </button>
          <button onClick={() => { toastInfo("资产已删除"); setShowMoreMenu(null); }} style={{
            width: "100%", background: "transparent", border: "none",
            padding: "8px 16px", cursor: "pointer", textAlign: "left",
            fontSize: 13, color: tk.textError, fontWeight: 400,
            transition: "all 0.1s",
          }} onMouseEnter={e => e.currentTarget.style.background = tk.bgPrimary} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            删除
          </button>
        </div>
      )}

      {previewAsset && (
        <AssetPreviewModal asset={previewAsset} onClose={() => setPreviewAsset(null)} />
      )}
    </div>
  );
}

// ─── Top Navigation Bar ─────────────────────────────────────────────────────
const LANGS = ["中文简体", "中文繁体", "English"] as const;
type Lang = typeof LANGS[number];

function TopNav({ activeModule, onNavigate, onAvatarClick }: { activeModule: Module; onNavigate: (m: Module) => void; onAvatarClick: () => void }) {
  const navItems: { key: Module; label: string }[] = [
    { key: "dashboard", label: "工作台" },
    { key: "myta", label: "MyTA 领教" },
    { key: "thoth", label: "Thoth 智汇" },
    { key: "sparkclass", label: "SparkClass 熠课" },
    { key: "eduhub", label: "eduhub 云枢" },
  ];

  const [lang, setLang] = useState<Lang>("中文简体");
  const [langOpen, setLangOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const [isXs, setIsXs] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hoverButton, setHoverButton] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)");
    const mqXs = window.matchMedia("(max-width: 900px)");
    const update = () => { setIsSmall(mq.matches); setIsXs(mqXs.matches); };
    update();
    mq.addEventListener("change", update);
    mqXs.addEventListener("change", update);
    return () => { mq.removeEventListener("change", update); mqXs.removeEventListener("change", update); };
  }, []);

  // Apply dark class to root
  const toggleTheme = () => {
    setIsDark(d => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  useEffect(() => {
    if (!notificationsOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-notification-center]')) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notificationsOpen]);

  return (
    <div style={{
      height: 56, background: tk.bgWhite,
      borderBottom: `1px solid ${tk.borderHairline}`,
      display: "flex", alignItems: "center",
      padding: `0 ${tk.spacingLg}`,
      position: "sticky", top: 0, zIndex: 300,
      boxShadow: tk.shadowSm,
    }}>
      {/* Logo — on extra-small screens, hide text, keep only icon */}
      <div style={{ display: "flex", alignItems: "center", gap: isXs ? 0 : tk.spacingXs, marginRight: isXs ? tk.spacingMd : tk.spacingXl }}>
        <div style={{
          width: 28, height: 28, background: tk.brandDefault,
          borderRadius: tk.radiusSm, display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}>
          <GraduationCap size={16} style={{ color: tk.textReverse }} />
        </div>
        {!isXs && (
          <span style={{ fontSize: 15, fontWeight: 600, color: tk.textPrimary, whiteSpace: "nowrap" }}>eduCore·知境</span>
        )}
      </div>

      {/* Module nav */}
      <nav style={{ display: "flex", gap: 4, flex: 1 }}>
        {navItems.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            style={{
              background: "transparent",
              color: activeModule === key ? tk.textPrimary : tk.textSecondary,
              border: "none",
              borderBottom: activeModule === key ? `2px solid ${tk.brandDefault}` : "2px solid transparent",
              borderRadius: 0,
              fontSize: 14, fontWeight: activeModule === key ? 600 : 400,
              padding: "0 4px", height: 56, cursor: "pointer",
              marginRight: tk.spacingMd,
              transition: "color 0.12s",
            }}
            onMouseEnter={e => { if (activeModule !== key) e.currentTarget.style.color = tk.textPrimary; }}
            onMouseLeave={e => { if (activeModule !== key) e.currentTarget.style.color = tk.textSecondary; }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Right tools */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Search — on small screens, collapse to icon that expands on click */}
        {isSmall ? (
          searchOpen ? (
            <div style={{
              background: tk.bgPrimary, border: `1px solid ${tk.borderDefault}`,
              borderRadius: tk.radiusSm, padding: "6px 10px",
              display: "flex", alignItems: "center", gap: 6, width: 220,
            }}>
              <Search size={14} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />
              <input
                autoFocus
                onBlur={() => setSearchOpen(false)}
                placeholder="请输入内容"
                style={{
                  border: "none", background: "transparent", outline: "none",
                  fontSize: 13, color: tk.textPrimary, fontFamily: "var(--font-family)",
                  width: "100%",
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              title="搜索"
              style={{
                width: 34, height: 34, background: "transparent", border: "none",
                borderRadius: tk.radiusSm, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: tk.textSecondary, transition: "background 0.12s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            ><Search size={16} /></button>
          )
        ) : null}

        {/* Language switcher */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setLangOpen(o => !o)}
            style={{
              background: "transparent", border: "none",
              borderRadius: tk.radiusSm, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 13, color: tk.textSecondary, padding: "5px 8px",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>🌐</span>
            <span>{lang}</span>
            <ChevronDown size={12} style={{ color: tk.textPlaceholder, transition: "transform 0.15s", transform: langOpen ? "rotate(180deg)" : "none" }} />
          </button>

          {langOpen && (
            <div
              style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0,
                background: tk.bgWhite, borderRadius: tk.radiusMd,
                border: `1px solid ${tk.borderFaint}`,
                boxShadow: tk.shadowMd, zIndex: 1100,
                minWidth: 120, overflow: "hidden",
              }}
            >
              {LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", background: l === lang ? tk.bgBrandSubtle : "transparent",
                    border: "none", padding: "9px 14px", cursor: "pointer",
                    fontSize: 13, fontWeight: l === lang ? 600 : 400,
                    color: l === lang ? tk.textBrand : tk.textPrimary,
                    textAlign: "left", transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (l !== lang) e.currentTarget.style.background = tk.bgPrimary; }}
                  onMouseLeave={e => { if (l !== lang) e.currentTarget.style.background = "transparent"; }}
                >
                  {l}
                  {l === lang && <CheckCircle2 size={13} style={{ color: tk.brandDefault }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <div style={{ position: "relative" }}>
          <button
            onClick={toggleTheme}
            style={{
              width: 34, height: 34, background: hoverButton === "theme" ? tk.bgPrimary : (isDark ? tk.bgPrimary : "transparent"),
              border: isDark ? `1px solid ${tk.borderDefault}` : "none",
              borderRadius: tk.radiusSm, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: isDark ? tk.textBrand : tk.textSecondary,
              transition: "all 0.18s",
            }}
            onMouseEnter={() => setHoverButton("theme")}
            onMouseLeave={() => setHoverButton(null)}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
            background: tk.textPrimary, color: tk.textReverse,
            padding: "4px 10px", borderRadius: tk.radiusSm,
            fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
            opacity: hoverButton === "theme" ? 1 : 0,
            visibility: hoverButton === "theme" ? "visible" : "hidden",
            transition: "all 0.12s", zIndex: 1300,
          }}>主题</div>
        </div>

        {/* Settings */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onAvatarClick /* reuse avatar handler for placeholder */}
            style={{
              width: 34, height: 34, background: hoverButton === "settings" ? tk.bgPrimary : "transparent",
              border: "none", borderRadius: tk.radiusSm, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: tk.textSecondary, transition: "background 0.12s",
            }}
            onMouseEnter={() => setHoverButton("settings")}
            onMouseLeave={() => setHoverButton(null)}
          ><Settings size={16} /></button>
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
            background: tk.textPrimary, color: tk.textReverse,
            padding: "4px 10px", borderRadius: tk.radiusSm,
            fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
            opacity: hoverButton === "settings" ? 1 : 0,
            visibility: hoverButton === "settings" ? "visible" : "hidden",
            transition: "all 0.12s", zIndex: 1300,
          }}>设置</div>
        </div>

        {/* Notification Center */}
        <div data-notification-center style={{ position: "relative" }}>
          <button onClick={(e) => { e.stopPropagation(); setNotificationsOpen(v => !v); }} style={{
            width: 34, height: 34, background: hoverButton === "notification" ? tk.bgPrimary : "transparent",
            border: "none", borderRadius: tk.radiusFull, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: tk.textSecondary, position: "relative",
          }}
            onMouseEnter={() => setHoverButton("notification")}
            onMouseLeave={() => setHoverButton(null)}
          >
            <Bell size={16} />
            {NOTIFICATIONS.filter(n => n.status === "pending").length > 0 && (
              <span style={{
                position: "absolute", top: 5, right: 5,
                width: 7, height: 7, borderRadius: tk.radiusFull,
                background: tk.textError, border: `1.5px solid ${tk.bgWhite}`,
              }} />
            )}
          </button>
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
            background: tk.textPrimary, color: tk.textReverse,
            padding: "4px 10px", borderRadius: tk.radiusSm,
            fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
            opacity: hoverButton === "notification" ? 1 : 0,
            visibility: hoverButton === "notification" ? "visible" : "hidden",
            transition: "all 0.12s", zIndex: 1300,
          }}>通知中心</div>
          {notificationsOpen && (
            <div style={{
              position: "absolute", top: "100%", right: 0, zIndex: 1200,
              background: tk.bgWhite, borderRadius: tk.radiusMd,
              border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowLg,
              minWidth: 320, maxHeight: 400, overflowY: "auto",
              padding: tk.spacingSm,
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: "8px 12px", fontSize: 14, fontWeight: 600, color: tk.textPrimary, borderBottom: `1px solid ${tk.borderHairline}`, marginBottom: 8 }}>
                资源审核通知
              </div>
              {NOTIFICATIONS.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: tk.textPlaceholder }}>暂无通知</div>
              ) : (
                NOTIFICATIONS.map(n => (
                  <div key={n.id} style={{
                    padding: "10px 12px", borderRadius: tk.radiusSm,
                    marginBottom: 4, cursor: "pointer",
                    background: tk.bgPrimary,
                  }} onMouseEnter={e => e.currentTarget.style.background = tk.bgSecondary}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: tk.textPrimary }}>{n.resourceName}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: tk.radiusFull, 
                        color: n.status === "pending" ? tk.textWarning : n.status === "approved" ? tk.textSuccess : tk.textError,
                        background: n.status === "pending" ? tk.bgWarningSubtle : n.status === "approved" ? tk.bgSuccessSubtle : tk.bgErrorSubtle }}>
                        {n.status === "pending" ? "审核中" : n.status === "approved" ? "已通过" : "不通过"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: tk.textPlaceholder }}>{n.time}</div>
                    {n.comment && (
                      <div style={{ fontSize: 12, color: tk.textError, marginTop: 4, paddingTop: 4, borderTop: `1px solid ${tk.borderHairline}` }}>
                        审核意见：{n.comment}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Resource Library — prominent CTA */}
        <button
          onClick={() => onNavigate("resource")}
          style={{
            background: activeModule === "resource" ? tk.brandHover : tk.brandDefault,
            color: tk.textReverse,
            border: "none", borderRadius: tk.radiusSm,
            fontSize: 13, fontWeight: 600,
            padding: "7px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            boxShadow: activeModule === "resource" ? "none" : tk.shadowBrandGlow,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = tk.brandHover)}
          onMouseLeave={e => (e.currentTarget.style.background = activeModule === "resource" ? tk.brandHover : tk.brandDefault)}
        >
          <Database size={14} /> 我的资产
        </button>

        {/* Avatar + dropdown */}
        <div style={{ position: "relative", marginLeft: 2 }}>
          <button
            onClick={() => onAvatarClick()}
            style={{
              width: 30, height: 30, borderRadius: tk.radiusFull,
              background: tk.bgBrandSubtle, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: tk.textBrand,
              border: "none",
            }}
          >王</button>
        </div>
      </div>
    </div>
  );
}

// ─── Coming Soon placeholder (for thoth / eduhub) ─────────────────────────
function ComingSoon({ name, slogan }: { name: string; slogan: string }) {
  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      background: tk.bgPrimary,
    }}>
      <div style={{ textAlign: "center", maxWidth: 420, padding: 40 }}>
        <div style={{
          width: 96, height: 96, margin: "0 auto 24px",
          background: tk.bgWhite, borderRadius: 24,
          boxShadow: tk.shadowMd,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: tk.textBrand,
        }}>
          <Sparkles size={44} />
        </div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: tk.textPrimary }}>{name}</h2>
        <p style={{ margin: "10px 0 6px", fontSize: 14, color: tk.textSecondary, lineHeight: 1.6 }}>{slogan}</p>
        <div style={{
          display: "inline-block", marginTop: 18,
          padding: "6px 14px", background: tk.bgBrandSubtle, color: tk.textBrand,
          borderRadius: 999, fontSize: 12, fontWeight: 500,
        }}>功能准备中....</div>
      </div>
    </div>
  );
}

// ─── Student PAD App ─────────────────────────────────────────────────────────
type StudentTab = "home" | "classes" | "homework" | "afterclass";

const STUDENT_CLASSES = [
  { id: 1, title: "Unit 4 Nature 精读", subject: "英语", teacher: "王老师", time: "周四 第2节", date: "2026-06-26", dayKey: "周四", period: "第2节", status: "active" as const, desc: "Unit 4 自然主题精读，含词汇与阅读策略训练" },
  { id: 2, title: "一元二次方程", subject: "数学", teacher: "张老师", time: "周四 第4节", date: "2026-06-26", dayKey: "周四", period: "第4节", status: "pending" as const, desc: "一元二次方程解法与应用题训练" },
  { id: 3, title: "Unit 3 Travel 写作", subject: "英语", teacher: "王老师", time: "周三 第1节", date: "2026-06-25", dayKey: "周三", period: "第1节", status: "done" as const, desc: "旅行主题写作课，学习日记与游记结构" },
  { id: 4, title: "勾股定理应用", subject: "数学", teacher: "张老师", time: "周三 第3节", date: "2026-06-25", dayKey: "周三", period: "第3节", status: "done" as const, desc: "勾股定理在实际问题中的应用" },
  { id: 5, title: "《荷塘月色》精读", subject: "语文", teacher: "李老师", time: "周二 第2节", date: "2026-06-24", dayKey: "周二", period: "第2节", status: "done" as const, desc: "散文精读与写作手法分析" },
  { id: 6, title: "Unit 2 Work 听力", subject: "英语", teacher: "王老师", time: "周二 第5节", date: "2026-06-24", dayKey: "周二", period: "第5节", status: "absent" as const, desc: "职业主题听力训练" },
];

const STUDENT_HOMEWORK = [
  { id: 1, title: "Unit 4 词汇速记作业", subject: "英语", dueDate: "2026-06-28", status: "pending", questions: 10, type: "课后作业", submitStatus: "未提交" },
  { id: 2, title: "一元二次方程练习", subject: "数学", dueDate: "2026-06-29", status: "pending", questions: 8, type: "习题", submitStatus: "未提交" },
  { id: 3, title: "荷塘月色阅读理解", subject: "语文", dueDate: "2026-06-27", status: "done", questions: 5, type: "练习", submitStatus: "已提交" },
  { id: 4, title: "Unit 3 旅行日记写作", subject: "英语", dueDate: "2026-06-24", status: "done", questions: 3, type: "课后作业", submitStatus: "已批改" },
  { id: 5, title: "勾股定理计算题", subject: "数学", dueDate: "2026-06-23", status: "done", questions: 6, type: "习题", submitStatus: "已打回" },
];

const STUDENT_WRONG_QUESTIONS = [
  { q: "下列哪组数据能构成直角三角形？", subject: "数学", lesson: "勾股定理应用", rate: "班级错误率 62%" },
  { q: "habitat 在文中的含义最接近？", subject: "英语", lesson: "Unit 4 Nature 精读", rate: "班级错误率 45%" },
  { q: "《荷塘月色》中「通感」修辞出现在哪一段？", subject: "语文", lesson: "《荷塘月色》精读", rate: "班级错误率 38%" },
];

/** 学生端课堂包环节 — 与教师端步骤条结构对齐（只读 demo） */
const STUDENT_CLASS_PHASES = [
  { num: 1, title: "破冰", subtitle: "课前导入", duration: "约10分", resIdx: [0, 1, 2, 3] },
  { num: 2, title: "授课", subtitle: "核心讲授", duration: "约20分", resIdx: [4, 5, 6, 7] },
  { num: 3, title: "互动", subtitle: "课堂互动", duration: "约10分", resIdx: [8, 9, 10] },
  { num: 4, title: "总结", subtitle: "总结与练习", duration: "约5分", resIdx: [11, 12] },
  { num: 5, title: "拓展", subtitle: "方法拓展", duration: "约5分", resIdx: [13, 14] },
];
const STUDENT_CLASS_RESOURCES = [
  { type: "PPT", name: "趣味问答" }, { type: "教案", name: "知识讲解" },
  { type: "PPT", name: "课前导入" }, { type: "教案", name: "情境引入" },
  { type: "PPT", name: "课件：Unit 4 Nature 精读" }, { type: "视频", name: "教学视频：自然生态系统" },
  { type: "PPT", name: "板书设计" }, { type: "教案", name: "知识拓展" },
  { type: "练习", name: "随堂练习" }, { type: "教案", name: "讨论环节" }, { type: "教案", name: "课堂活动" },
  { type: "练习", name: "课堂练习题（10题）" }, { type: "教案", name: "总结回顾" },
  { type: "作业", name: "课后词汇作业" }, { type: "教案", name: "精读课教学教案" },
];

function StudentStatusTag({ status }: { status: "active" | "pending" | "done" | "absent" }) {
  const cfg = {
    active: { label: "授课中", bg: tk.bgBrandSubtle, color: tk.textBrand },
    pending: { label: "待上课", bg: tk.bgWarningSubtle, color: tk.textWarning },
    done: { label: "已完成", bg: tk.bgSecondary, color: tk.textSecondary },
    absent: { label: "缺席", bg: tk.bgErrorSubtle, color: tk.textError },
  }[status];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600, padding: "2px 8px",
      borderRadius: tk.radiusFull, display: "inline-block",
    }}>{cfg.label}</span>
  );
}

// Student Teaching Mode (receive screen sync)
function StudentTeachingMode({ cls, onExit }: { cls: typeof STUDENT_CLASSES[0]; onExit: () => void }) {
  const [showInteract, setShowInteract] = useState(false);
  const [answered, setAnswered] = useState<number | null>(null);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 3000, background: "#0d0f14",
      display: "flex", flexDirection: "column", fontFamily: "var(--font-family)",
    }}>
      {/* Top bar */}
      <div style={{
        height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>正在上课 · {cls.title} · {cls.teacher}</span>
        </div>
        <button onClick={onExit} style={{
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 6, color: "rgba(255,255,255,0.6)", fontSize: 11,
          padding: "4px 12px", cursor: "pointer",
        }}>退出授课</button>
      </div>

      {/* Main: synced slide */}
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{
            width: "100%", maxWidth: 860, aspectRatio: "16/9",
            background: "#1a1e2a", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>教师投屏实时同步</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,0.9)", textAlign: "center", maxWidth: 500 }}>
              精读策略：扫读 → 精读 → 推断词义
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center", maxWidth: 400, lineHeight: "22px" }}>
              ecosystem · habitat · biodiversity
            </div>
          </div>
        </div>

        {/* Right: interaction panel */}
        {showInteract && (
          <div style={{
            width: 300, flexShrink: 0, background: "#141720",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            display: "flex", flexDirection: "column", padding: 16, gap: 12,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>随堂练习</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: "20px", background: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 8 }}>
              "Ecosystem" 在文中最接近的意思是？
            </div>
            {["A. 生态系统", "B. 环境污染", "C. 自然资源", "D. 物种多样性"].map((opt, i) => (
              <button key={i} onClick={() => setAnswered(i)} style={{
                background: answered === i ? (i === 0 ? "rgba(10,124,87,0.3)" : "rgba(217,54,62,0.2)") : "rgba(255,255,255,0.05)",
                border: `1px solid ${answered === i ? (i === 0 ? tk.brandDefault : tk.errorDefault) : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, padding: "10px 14px", color: "rgba(255,255,255,0.8)",
                fontSize: 13, textAlign: "left", cursor: "pointer", transition: "all 0.15s",
              }}>
                {answered !== null && i === 0 && <CheckCircle2 size={12} style={{ color: tk.brandDefault, marginRight: 6 }} />}
                {opt}
              </button>
            ))}
            {answered !== null && (
              <div style={{ fontSize: 11, color: answered === 0 ? "#22c55e" : tk.textError, textAlign: "center", fontWeight: 600 }}>
                {answered === 0 ? "✓ 回答正确！" : "✗ 正确答案是 A"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, borderTop: "1px solid rgba(255,255,255,0.08)", background: "#0a0c10",
      }}>
        <button onClick={() => setShowInteract(v => !v)} style={{
          background: showInteract ? tk.bgBrandSubtle : "rgba(255,255,255,0.08)",
          border: `1px solid ${showInteract ? tk.borderBrand : "rgba(255,255,255,0.12)"}`,
          borderRadius: 6, color: showInteract ? tk.textBrand : "rgba(255,255,255,0.7)",
          fontSize: 12, padding: "6px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}><PenLine size={13} /> 互动区域</button>
        <button style={{
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 6, color: "rgba(255,255,255,0.7)",
          fontSize: 12, padding: "6px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
        }}><MessageSquare size={13} /> 课堂讨论</button>
      </div>
    </div>
  );
}

// ─── Student dashboard charts (SVG, 轻量占位) ───────────────────────────────
function StudentBarLineChart({ bars, line, labels, barLabel, lineLabel }: {
  bars: number[]; line: number[]; labels: string[];
  barLabel: string; lineLabel: string;
}) {
  const W = 360, H = 120, P = 28;
  const bw = (W - P * 2) / bars.length * 0.55;
  const gap = (W - P * 2) / bars.length;
  const max = 100;
  const yScale = (v: number) => H - P - (v / max) * (H - P * 2);
  const xs = bars.map((_, i) => P + i * gap + gap / 2);
  const linePath = line.map((v, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${yScale(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 120, display: "block" }}>
      {bars.map((v, i) => (
        <rect key={i} x={xs[i] - bw / 2} y={yScale(v)} width={bw} height={H - P - yScale(v)} fill={tk.bgBrandSubtle} stroke={tk.brandDefault} strokeWidth={1} rx={2} />
      ))}
      <path d={linePath} fill="none" stroke={tk.textWarning} strokeWidth={2} />
      {line.map((v, i) => <circle key={i} cx={xs[i]} cy={yScale(v)} r={2.5} fill={tk.textWarning} />)}
      {labels.map((l, i) => (
        <text key={l} x={xs[i]} y={H - 6} fontSize={8} fill={tk.textPlaceholder} textAnchor="middle">{l}</text>
      ))}
      <text x={P} y={12} fontSize={8} fill={tk.textBrand}>{barLabel}</text>
      <text x={P + 60} y={12} fontSize={8} fill={tk.textWarning}>{lineLabel}</text>
    </svg>
  );
}

function StudentWeeklyCalendar({
  weekOffset, setWeekOffset, subjectFilter, statusFilter, setStatusFilter, search,
  onClassClick,
}: {
  weekOffset: number; setWeekOffset: (fn: (w: number) => number) => void;
  subjectFilter: string; statusFilter: "all" | "active" | "pending" | "done" | "absent";
  setStatusFilter?: (s: "all" | "active" | "pending" | "done" | "absent") => void;
  search: string;
  onClassClick: (cls: typeof STUDENT_CLASSES[0]) => void;
}) {
  const periods = ["第1节", "第2节", "第3节", "第4节", "午休", "第5节", "第6节", "第7节", "第8节"];
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const today = new Date("2026-06-26");
  const todayDay = today.getDay() || 7;
  const currentHour = today.getHours();
  const currentPeriodIdx = currentHour < 10 ? 1 : currentHour < 12 ? 2 : currentHour < 14 ? 4 : currentHour < 16 ? 5 : 6;

  const scheduleMap = useMemo(() => {
    const m: Record<string, typeof STUDENT_CLASSES[0]> = {};
    STUDENT_CLASSES.forEach(c => { m[`${c.dayKey}-${c.period}`] = c; });
    return m;
  }, []);

  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDay + 1 + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmtM = (d: Date) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  const weekLabel = weekOffset === 0 ? "本周" : weekOffset === -1 ? "上周" : weekOffset === 1 ? "下周" : `${fmtM(monday).slice(5)} - ${fmtM(sunday).slice(5)}`;

  const STATUS_COLOR = { pending: tk.successDefault, active: tk.textWarning, done: tk.textPlaceholder, absent: tk.textError } as const;
  const STATUS_BG = { pending: "rgba(16,185,129,0.10)", active: "rgba(245,158,11,0.10)", done: "rgba(156,163,175,0.10)", absent: "rgba(217,54,62,0.08)" } as const;

  return (
    <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${tk.borderHairline}`, background: tk.bgPrimary, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GraduationCap size={13} style={{ color: tk.brandDefault }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>2025-2026 学年</span>
          <div style={{ width: 1, height: 14, background: tk.borderHairline }} />
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, width: 24, height: 24, cursor: "pointer", color: tk.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={13} /></button>
          <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, minWidth: 80, textAlign: "center" }}>{weekLabel}</span>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, width: 24, height: 24, cursor: "pointer", color: tk.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={13} /></button>
          {weekOffset !== 0 && <button onClick={() => setWeekOffset(() => 0)} style={{ background: tk.bgBrandSubtle, color: tk.textBrand, border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusFull, fontSize: 11, padding: "2px 10px", cursor: "pointer" }}>回到本周</button>}
        </div>
        <div style={{ display: "flex", gap: 4, fontSize: 10, color: tk.textSecondary }}>
          {([
            { key: "pending" as const, label: "待上课", color: STATUS_COLOR.pending },
            { key: "active" as const, label: "授课中", color: STATUS_COLOR.active },
            { key: "done" as const, label: "已完成", color: STATUS_COLOR.done },
            { key: "absent" as const, label: "缺席", color: STATUS_COLOR.absent },
          ]).map(l => {
            const active = statusFilter === l.key;
            return (
              <button key={l.key} onClick={() => setStatusFilter?.(active ? "all" : l.key)} style={{
                background: active ? tk.bgPrimary : "transparent",
                border: `1px solid ${active ? tk.borderHairline : "transparent"}`,
                borderRadius: tk.radiusFull, padding: "3px 10px", fontSize: 11,
                color: active ? tk.textPrimary : tk.textSecondary,
                fontWeight: active ? 600 : 400, cursor: setStatusFilter ? "pointer" : "default",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                {l.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "70px repeat(7, 1fr)", fontSize: 12 }}>
        <div style={{ background: tk.bgPrimary, borderBottom: `1px solid ${tk.borderHairline}`, padding: 8 }} />
        {days.map((d, di) => {
          const isToday = weekOffset === 0 && di + 1 === todayDay;
          const dateObj = new Date(monday);
          dateObj.setDate(monday.getDate() + di);
          return (
            <div key={d} style={{
              background: isToday ? tk.bgBrandSubtle : tk.bgPrimary,
              borderBottom: `1px solid ${tk.borderHairline}`, borderLeft: `1px solid ${tk.borderHairline}`,
              padding: 6, textAlign: "center",
              color: isToday ? tk.textBrand : tk.textSecondary, fontWeight: isToday ? 700 : 400,
            }}>
              <div>{d}{isToday && <span style={{ fontSize: 10, color: tk.textBrand }}> · 今天</span>}</div>
              <div style={{ fontSize: 10, color: tk.textPlaceholder, marginTop: 1 }}>{dateObj.getMonth() + 1}/{dateObj.getDate()}</div>
            </div>
          );
        })}
        {periods.map((p, pi) => (
          <Fragment key={p}>
            <div key={`lbl-${p}`} style={{
              borderBottom: `1px solid ${tk.borderHairline}`, padding: "10px 8px", color: tk.textPlaceholder,
              background: p === "午休" ? "#fafafa" : tk.bgWhite, minHeight: 56, display: "flex", alignItems: "center", position: "relative",
            }}>
              {p}
              {weekOffset === 0 && pi === currentPeriodIdx && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: tk.errorDefault, zIndex: 5 }}>
                  <div style={{ position: "absolute", left: -4, top: -4, width: 8, height: 8, borderRadius: "50%", background: tk.errorDefault }} />
                </div>
              )}
            </div>
            {days.map((d, di) => {
              const key = `${d}-${p}`;
              const cls = scheduleMap[key];
              const isToday = weekOffset === 0 && di + 1 === todayDay;
              const isBreak = p === "午休";
              const visible = cls && weekOffset === 0
                && (subjectFilter === "全部" || cls.subject === subjectFilter)
                && (statusFilter === "all" || cls.status === statusFilter)
                && (!search || cls.title.includes(search) || cls.teacher.includes(search));
              return (
                <div key={key} style={{
                  borderBottom: `1px solid ${tk.borderHairline}`, borderLeft: `1px solid ${tk.borderHairline}`,
                  padding: 5, minHeight: 56, position: "relative",
                  background: isBreak ? "#fafafa" : isToday ? "rgba(228,239,236,0.2)" : tk.bgWhite,
                }}>
                  {weekOffset === 0 && pi === currentPeriodIdx && !isBreak && (
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: tk.errorDefault, opacity: 0.25, zIndex: 4 }} />
                  )}
                  {visible && cls && (
                    <div
                      onClick={() => { console.log("Calendar class clicked:", cls.id, cls.title); onClassClick(cls); }}
                      style={{
                        background: STATUS_BG[cls.status], borderLeft: `3px solid ${STATUS_COLOR[cls.status]}`,
                        borderRadius: tk.radiusXs, padding: "4px 6px", cursor: "pointer", transition: "box-shadow 0.12s",
                        position: "relative", zIndex: 10,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = tk.shadowSm)}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                    >
                      {isToday && (
                        <span style={{
                          position: "absolute", top: 3, right: 3,
                          background: tk.errorDefault, color: "#fff",
                          fontSize: 9, fontWeight: 700, lineHeight: "12px",
                          padding: "0 4px", borderRadius: 2,
                        }}>今</span>
                      )}
                      <div style={{ fontSize: 11, fontWeight: 600, color: tk.textPrimary, lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cls.title}</div>
                      <div style={{ fontSize: 10, color: tk.textSecondary }}>{cls.subject} · {cls.teacher}</div>
                      <div style={{ fontSize: 9, color: tk.textPlaceholder, marginTop: 1 }}>点击查看</div>
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function StudentHome({ onGoClasses, onGoHomework, onStartHw, onEnterClass }: {
  onGoClasses?: () => void; onGoHomework?: () => void;
  onStartHw?: (id: number) => void; onEnterClass?: (cls: typeof STUDENT_CLASSES[0]) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const [wrongIdx, setWrongIdx] = useState(0);
  const weekClasses = STUDENT_CLASSES.filter(c => c.status === "pending" || c.status === "active");
  const pendingHw = STUDENT_HOMEWORK.filter(h => h.status === "pending");
  const wq = STUDENT_WRONG_QUESTIONS[wrongIdx];

  return (
    <div style={{ padding: tk.spacingLg, display: "flex", flexDirection: "column", gap: tk.spacingMd, overflowY: "auto", height: "100%" }}>
      {/* 欢迎语 */}
      <div style={{
        background: `linear-gradient(135deg, ${tk.bgBrandSubtle} 0%, ${tk.bgWhite} 100%)`,
        borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Sparkles size={18} style={{ color: tk.brandDefault }} />
            <span style={{ fontSize: 20, fontWeight: 600, color: tk.textPrimary }}>{greeting}，李同学</span>
          </div>
          <div style={{ fontSize: 13, color: tk.textSecondary, lineHeight: "20px" }}>
            今天有 <span style={{ color: tk.textBrand, fontWeight: 600 }}>{weekClasses.length}</span> 节待上课程，
            <span style={{ color: tk.textWarning, fontWeight: 600 }}>{pendingHw.length}</span> 份作业待完成。继续加油，每一步都在进步 ✨
          </div>
        </div>
        <div style={{ fontSize: 11, color: tk.textPlaceholder, textAlign: "right", flexShrink: 0 }}>
          <Calendar size={14} style={{ color: tk.brandDefault, marginBottom: 4 }} />
          <div>2026年6月26日 · 周四</div>
          <div>高一(3)班</div>
        </div>
      </div>

      {/* 基础数据 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: tk.spacingMd }}>
        {[
          { label: "上课时长", value: "48h", icon: Clock },
          { label: "上课次数", value: "32", icon: BookOpen },
          { label: "课堂互动", value: "126", icon: MessageSquare },
          { label: "作业完成率", value: "88%", icon: CheckCircle2 },
          { label: "习题正确率", value: "76%", icon: TrendingUp },
          { label: "综合表现", value: "良好", icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} style={{
            background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`,
            padding: tk.spacingMd, display: "flex", flexDirection: "column", gap: 6,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: tk.textSecondary }}>{label}</span>
              <Icon size={14} style={{ color: tk.brandDefault }} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: tk.textPrimary }}>{value}</span>
          </div>
        ))}
      </div>

      {/* AI 学习分析 + 待办 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: tk.spacingMd }}>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Brain size={14} style={{ color: tk.brandDefault }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>AI 学习分析</span>
            <span style={{ fontSize: 10, color: tk.textPlaceholder, background: tk.bgPrimary, padding: "1px 6px", borderRadius: tk.radiusFull }}>占位</span>
          </div>
          <div style={{ background: tk.bgBrandSubtle, borderLeft: `3px solid ${tk.brandDefault}`, borderRadius: tk.radiusSm, padding: 12, marginBottom: 10, fontSize: 12, lineHeight: "20px", color: tk.textPrimary }}>
            <span style={{ fontWeight: 600, color: tk.textBrand }}>亮点：</span>英语课堂参与积极，词汇配对正确率 80%，写作表达有进步。
          </div>
          <div style={{ background: tk.bgWarningSubtle, borderLeft: `3px solid ${tk.textWarning}`, borderRadius: tk.radiusSm, padding: 12, fontSize: 12, lineHeight: "20px", color: tk.textPrimary }}>
            <span style={{ fontWeight: 600, color: tk.textWarning }}>待改进：</span>数学「逆勾股定理」应用题错误率偏高，建议复习勾股定理变式；周二英语听力课缺席需补看回放。
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
          <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>本周待上课堂</span>
              <button onClick={onGoClasses} style={{ background: "none", border: "none", fontSize: 11, color: tk.textLink, cursor: "pointer" }}>查看课表 →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {weekClasses.map(c => (
                <div key={c.id} onClick={() => onEnterClass?.(c)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  background: tk.bgPrimary, borderRadius: tk.radiusSm, cursor: "pointer",
                  border: `1px solid ${tk.borderHairline}`, transition: "border-color 0.12s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = tk.borderBrand)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = tk.borderHairline)}
                >
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: tk.bgBrandSubtle, color: tk.textBrand }}>{c.subject}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>{c.title}</span>
                  <span style={{ fontSize: 11, color: tk.textPlaceholder }}>{c.time}</span>
                  <StudentStatusTag status={c.status} />
                  <ChevronRight size={12} style={{ color: tk.textPlaceholder }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>待完成作业</span>
              <button onClick={onGoHomework} style={{ background: "none", border: "none", fontSize: 11, color: tk.textLink, cursor: "pointer" }}>全部作业 →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pendingHw.map(h => (
                <div key={h.id} onClick={() => onStartHw?.(h.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  background: tk.bgPrimary, borderRadius: tk.radiusSm, cursor: "pointer",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: tk.bgWarningSubtle, color: tk.textWarning }}>{h.subject}</span>
                  <span style={{ flex: 1, fontSize: 12, color: tk.textPrimary }}>{h.title}</span>
                  <span style={{ fontSize: 11, color: tk.textWarning }}>截止 {h.dueDate.slice(5)}</span>
                  <button style={{ background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm, fontSize: 10, fontWeight: 600, padding: "4px 10px", cursor: "pointer" }}>去做</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 图表区 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: tk.spacingMd }}>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>随堂测验正确率</div>
          <StudentBarLineChart bars={[72, 78, 85, 80, 88, 76]} line={[70, 75, 82, 78, 85, 74]} labels={["W1", "W2", "W3", "W4", "W5", "W6"]} barLabel="正确率%" lineLabel="班级均值" />
        </div>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>作业正确率</div>
          <StudentBarLineChart bars={[68, 74, 82, 79, 86, 81]} line={[65, 70, 78, 75, 80, 77]} labels={["W1", "W2", "W3", "W4", "W5", "W6"]} barLabel="正确率%" lineLabel="提交率" />
        </div>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary, marginBottom: 8 }}>作业提交率曲线</div>
          <SimpleLineChart />
        </div>
      </div>

      {/* 错题展示 */}
      <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={14} style={{ color: tk.textError }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>错题回顾</span>
            <span style={{ fontSize: 11, color: tk.textPlaceholder }}>{wrongIdx + 1} / {STUDENT_WRONG_QUESTIONS.length}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setWrongIdx(i => Math.max(0, i - 1))} disabled={wrongIdx === 0} style={{ background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, width: 28, height: 28, cursor: wrongIdx === 0 ? "default" : "pointer", opacity: wrongIdx === 0 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={14} /></button>
            <button onClick={() => setWrongIdx(i => Math.min(STUDENT_WRONG_QUESTIONS.length - 1, i + 1))} disabled={wrongIdx === STUDENT_WRONG_QUESTIONS.length - 1} style={{ background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, width: 28, height: 28, cursor: wrongIdx === STUDENT_WRONG_QUESTIONS.length - 1 ? "default" : "pointer", opacity: wrongIdx === STUDENT_WRONG_QUESTIONS.length - 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={14} /></button>
          </div>
        </div>
        <div style={{ background: tk.bgErrorSubtle, borderRadius: tk.radiusSm, padding: 14, borderLeft: `3px solid ${tk.errorDefault}` }}>
          <div style={{ fontSize: 11, color: tk.textError, fontWeight: 600, marginBottom: 6 }}>{wq.subject} · {wq.lesson} · {wq.rate}</div>
          <div style={{ fontSize: 14, color: tk.textPrimary, lineHeight: "22px" }}>{wq.q}</div>
          <button style={{ marginTop: 10, background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm, fontSize: 11, fontWeight: 600, padding: "5px 12px", cursor: "pointer" }}>错题再练</button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Class Detail — 对齐教师端 ClassDetailPage 布局 ─────────────────
function StudentClassPreviewPage({ cls, onBack, onEnterTeaching, onReview, initialTab = "package" }: {
  cls: typeof STUDENT_CLASSES[0]; onBack: () => void;
  onEnterTeaching?: () => void;
  onReview?: () => void;
  initialTab?: "package" | "analysis";
}) {
  const [detailTab, setDetailTab] = useState<"package" | "analysis">(initialTab);
  const [activeRes, setActiveRes] = useState<{ phaseIdx: number; resIdx: number }>({ phaseIdx: 0, resIdx: 0 });
  const [previewFs, setPreviewFs] = useState(false);
  const phaseScrollRef = useRef<HTMLDivElement | null>(null);
  const canAnalysis = cls.status === "done" || cls.status === "absent";

  const phases = STUDENT_CLASS_PHASES;
  const resources = STUDENT_CLASS_RESOURCES;
  const activeResource = resources[phases[activeRes.phaseIdx]?.resIdx?.[activeRes.resIdx] ?? 0];

  const scrollPhasesBy = (dir: 1 | -1) => {
    const el = phaseScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const btnStyle = (active: boolean) => ({
    background: active ? tk.bgBrandSubtle : "none",
    color: active ? tk.textBrand : tk.textSecondary,
    border: `1px solid ${active ? tk.borderBrand : tk.borderHairline}`,
    borderRadius: tk.radiusSm, fontSize: 12, padding: "5px 11px",
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
  } as React.CSSProperties);

  const segmentStyle = (active: boolean) => ({
    background: active ? tk.bgWhite : "transparent",
    color: active ? tk.textBrand : tk.textSecondary,
    border: "none", fontSize: 12, fontWeight: active ? 600 : 400,
    padding: "5px 14px", cursor: "pointer", borderRadius: tk.radiusFull,
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
    display: "inline-flex", alignItems: "center", gap: 5,
  } as React.CSSProperties);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", background: tk.bgPrimary }}>
      {/* 双胶囊 — 与教师端一致 */}
      <div style={{ background: tk.bgWhite, padding: `8px 20px 0`, borderBottom: `1px solid ${tk.borderHairline}`, flexShrink: 0 }}>
        <div style={{ display: "inline-flex", background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusFull, padding: 3, gap: 2 }}>
          <button onClick={() => setDetailTab("package")} style={segmentStyle(detailTab === "package")}><Layers size={12} /> 课堂包详情</button>
          <button onClick={() => canAnalysis && setDetailTab("analysis")} style={{ ...segmentStyle(detailTab === "analysis"), opacity: canAnalysis ? 1 : 0.45, cursor: canAnalysis ? "pointer" : "not-allowed" }}><BarChart2 size={12} /> 课后分析</button>
        </div>
      </div>

      {/* 标题区 — iPad 模式：左侧返回按钮，右侧标题 + 操作 */}
      <div style={{ background: tk.bgWhite, padding: "10px 20px", borderBottom: `1px solid ${tk.borderHairline}`, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <button onClick={onBack} style={{
                background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm, width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: tk.textSecondary, flexShrink: 0,
                transition: "all 0.12s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = tk.bgBrandSubtle; e.currentTarget.style.color = tk.textBrand; }}
                onMouseLeave={e => { e.currentTarget.style.background = tk.bgPrimary; e.currentTarget.style.color = tk.textSecondary; }}
                title="返回我的课堂">
                <ArrowLeft size={14} />
              </button>
              <div style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary }}>{cls.title}</div>
            </div>
            <div style={{ fontSize: 12, color: tk.textSecondary, marginBottom: 6, lineHeight: "18px" }}>{cls.desc}</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {[{ icon: <BookMarked size={11} />, val: cls.subject },
                { icon: <Users size={11} />, val: "高一(3)班" },
                { icon: <Clock size={11} />, val: cls.time },
                { icon: <GraduationCap size={11} />, val: cls.teacher }].map((m, i) => (
                <span key={i} style={{ fontSize: 12, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>{m.icon}{m.val}</span>
              ))}
              <StudentStatusTag status={cls.status} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
            {cls.status === "active" && (
              <button onClick={onEnterTeaching} style={{ background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600, padding: "6px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><BookOpen size={13} /> 去上课</button>
            )}
            {cls.status === "pending" && (
              <>
                <button style={btnStyle(false)}><Eye size={12} /> 预习</button>
                <span style={{ fontSize: 11, color: tk.textWarning, background: tk.bgWarningSubtle, padding: "4px 10px", borderRadius: tk.radiusSm }}>课程尚未开始</span>
              </>
            )}
            {(cls.status === "done" || cls.status === "absent") && (
              <>
                <button onClick={onReview ?? onEnterTeaching} style={btnStyle(false)}><Maximize2 size={12} /> 回顾</button>
                <button style={btnStyle(false)}><ClipboardList size={12} /> 课后作业</button>
                <button style={btnStyle(false)}><PenLine size={12} /> 错题再练</button>
              </>
            )}
          </div>
        </div>
      </div>

      {detailTab === "package" ? (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
        {/* 步骤资源条 — 与教师端同款横向环节卡 */}
        <div style={{ position: "relative", display: "flex", alignItems: "stretch", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`, flexShrink: 0 }}>
          <button onClick={() => scrollPhasesBy(-1)} style={{ ...navBtn, position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", zIndex: 5, background: tk.bgWhite, boxShadow: tk.shadowSm }} title="向左滚动"><ChevronLeft size={13} /></button>
          <div ref={phaseScrollRef} className="hide-scrollbar" style={{ flex: 1, display: "flex", alignItems: "stretch", gap: 6, padding: "6px 24px", overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none" }}>
            {phases.map((p, pi) => (
              <div key={p.num} style={{
                flex: `0 0 ${Math.max(180, 40 + p.resIdx.reduce((s, idx) => s + (resources[idx].name.length || 0) * 7 + 18, 0))}px`,
                display: "flex", flexDirection: "column", background: tk.bgWhite,
                border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, overflow: "hidden",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 8px", borderBottom: `1px solid ${tk.borderHairline}`, background: tk.bgPrimary }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, borderRadius: "50%",
                    background: activeRes.phaseIdx === pi ? tk.bgBrandDefault : tk.bgWhite,
                    color: activeRes.phaseIdx === pi ? tk.textReverse : tk.textSecondary,
                    fontSize: 9, fontWeight: 700,
                    border: `1px solid ${activeRes.phaseIdx === pi ? tk.brandDefault : tk.borderHairline}`, flexShrink: 0,
                  }}>{p.num}</span>
                  <div style={{ fontSize: 11, fontWeight: 500, color: tk.textPrimary, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.title} <span style={{ color: tk.textPlaceholder, fontWeight: 400 }}>（{p.duration}）</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "nowrap", gap: 3, padding: "3px 6px", overflow: "hidden" }}>
                  {p.resIdx.map((ridx, ri) => {
                    const r = resources[ridx];
                    const isActive = activeRes.phaseIdx === pi && activeRes.resIdx === ri;
                    return (
                      <button key={ridx} onClick={() => setActiveRes({ phaseIdx: pi, resIdx: ri })} title={r.name} style={{
                        padding: "2px 6px", fontSize: 10, lineHeight: "14px",
                        background: isActive ? tk.bgBrandSubtle : tk.bgPrimary,
                        color: isActive ? tk.textBrand : tk.textPrimary,
                        border: `1px solid ${isActive ? tk.brandDefault : tk.borderHairline}`,
                        borderRadius: tk.radiusSm, cursor: "pointer", whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flexShrink: 1,
                      }}>{r.name}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => scrollPhasesBy(1)} style={{ ...navBtn, position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", zIndex: 5, background: tk.bgWhite, boxShadow: tk.shadowSm }} title="向右滚动"><ChevronRight size={13} /></button>
        </div>

        {/* 资源预览区 */}
        <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingMd, minHeight: 0 }}>
          <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, minHeight: 360, padding: tk.spacingLg }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: tk.bgBrandSubtle, color: tk.textBrand }}>{activeResource.type}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: tk.textPrimary }}>{activeResource.name}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={btnStyle(false)}><Eye size={12} /> 预览</button>
                {(cls.status === "done" || cls.status === "absent") && (
                  <button onClick={() => setPreviewFs(true)} style={btnStyle(false)}><Maximize2 size={12} /> 全屏回顾</button>
                )}
              </div>
            </div>
            <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusSm, padding: tk.spacingLg, minHeight: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Layers size={36} style={{ color: tk.textPlaceholder }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: tk.textSecondary, textAlign: "center" }}>{activeResource.name}</div>
              <div style={{ fontSize: 12, color: tk.textPlaceholder, textAlign: "center", maxWidth: 400 }}>
                {cls.status === "pending" ? "课程开始后可查看并参与此资源" : cls.status === "active" ? "教师正在投屏此资源，请跟随课堂节奏" : "已完成授课，可随时回顾学习内容"}
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
      <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingLg }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: tk.spacingMd, marginBottom: tk.spacingMd }}>
          {[{ label: "我的正确率", value: "78%" }, { label: "参与互动", value: "5 次" }, { label: "练习题数", value: "4 题" }, { label: "作业完成", value: "85%" }].map(s => (
            <div key={s.label} style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: tk.textPrimary }}>{s.value}</div>
              <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Sparkles size={14} style={{ color: tk.brandDefault }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>AI 学习建议</span>
          </div>
          {[
            { title: "需加强", content: "逆勾股定理应用题错误率偏高，建议完成错题再练。" },
            { title: "表现亮点", content: "课堂讨论环节发言积极，词汇掌握较好。" },
          ].map(a => (
            <div key={a.title} style={{ marginBottom: 10, padding: 12, background: tk.bgBrandSubtle, borderRadius: tk.radiusSm, borderLeft: `3px solid ${tk.brandDefault}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: tk.textBrand, marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: tk.textPrimary, lineHeight: "18px" }}>{a.content}</div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

function StudentClassCard({ cls, onClick, onAction, onReview }: {
  cls: typeof STUDENT_CLASSES[0]; onClick: () => void; onAction?: () => void; onReview?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const st = cls.status === "absent" ? "done" : cls.status;
  
  const handleCardClick = () => {
    console.log("StudentClassCard clicked:", cls.id, cls.title);
    onClick();
  };
  
  return (
    <div onClick={handleCardClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: tk.bgWhite, borderRadius: tk.radiusMd,
      border: `1px solid ${hovered ? tk.borderBrand : tk.borderHairline}`,
      boxShadow: hovered ? tk.shadowMd : "none", padding: tk.spacingMd, cursor: "pointer",
      transition: "all 0.18s ease", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary, lineHeight: "22px" }}>{cls.title}</div>
          <div style={{ fontSize: 12, color: tk.textSecondary, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cls.desc}</div>
        </div>
        {cls.status === "absent" ? <StudentStatusTag status="absent" /> : <StatusTag status={st} />}
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 11, color: tk.textPlaceholder, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><BookMarked size={10} />{cls.subject}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><GraduationCap size={10} />{cls.teacher}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} />{cls.time}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, paddingTop: 4, borderTop: `1px solid ${tk.borderHairline}` }}>
        {cls.status === "active" && (
          <button onClick={e => { e.stopPropagation(); onAction?.(); }} style={{ background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm, fontSize: 11, fontWeight: 600, padding: "4px 12px", cursor: "pointer" }}>去上课</button>
        )}
        {cls.status === "pending" && (
          <button onClick={e => { e.stopPropagation(); onClick(); }} style={{ background: tk.bgBrandSubtle, color: tk.textBrand, border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm, fontSize: 11, fontWeight: 600, padding: "4px 12px", cursor: "pointer" }}>预习</button>
        )}
        {(cls.status === "done" || cls.status === "absent") && (
          <button onClick={e => { e.stopPropagation(); (onReview ?? onClick)(); }} style={{ background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, fontSize: 11, color: tk.textSecondary, padding: "4px 12px", cursor: "pointer" }}>回顾</button>
        )}
      </div>
    </div>
  );
}

function StudentClasses({ onViewClass, onEnterTeaching, onReviewClass }: {
  onViewClass: (cls: typeof STUDENT_CLASSES[0], defaultTab?: "package" | "analysis") => void;
  onEnterTeaching?: (cls: typeof STUDENT_CLASSES[0]) => void;
  onReviewClass?: (cls: typeof STUDENT_CLASSES[0]) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"calendar" | "card">("calendar");
  const [subjectFilter, setSubjectFilter] = useState("全部");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "done" | "absent">("all");
  const [search, setSearch] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const subjects = ["全部", "英语", "数学", "语文"];

  const filteredList = STUDENT_CLASSES
    .filter(c => subjectFilter === "全部" || c.subject === subjectFilter)
    .filter(c => statusFilter === "all" || c.status === statusFilter)
    .filter(c => !search || c.title.includes(search) || c.teacher.includes(search));

  function handleClassClick(cls: typeof STUDENT_CLASSES[0]) {
    console.log("StudentClasses handleClassClick:", cls.id, cls.title, cls.status);
    onViewClass(cls);
  }

  const renderViewSwitcher = () => (
    <div style={{ display: "inline-flex", background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusFull, padding: 3, gap: 2 }}>
      {([{ v: "calendar" as const, label: "课表" }, { v: "card" as const, label: "列表" }]).map(opt => (
        <button key={opt.v} onClick={() => setViewMode(opt.v)} style={{
          background: viewMode === opt.v ? tk.bgWhite : "transparent",
          color: viewMode === opt.v ? tk.textBrand : tk.textSecondary,
          border: "none", borderRadius: tk.radiusFull, fontSize: 12, padding: "4px 14px",
          cursor: "pointer", fontWeight: viewMode === opt.v ? 600 : 400,
          boxShadow: viewMode === opt.v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
        }}>{opt.label}</button>
      ))}
    </div>
  );

  return (
    <div style={{ height: "100%", overflowY: "auto", background: tk.bgPrimary, padding: tk.spacingLg, display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
      {/* 基础数据 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: tk.spacingMd }}>
        {[
          { label: "我的课堂", value: String(STUDENT_CLASSES.length), sub: `待上课 ${STUDENT_CLASSES.filter(c => c.status === "pending").length} · 已完成 ${STUDENT_CLASSES.filter(c => c.status === "done").length}`, icon: BookOpen },
          { label: "本周待上", value: String(STUDENT_CLASSES.filter(c => c.status === "pending" || c.status === "active").length), sub: "含今日授课中 1 节", icon: Calendar },
          { label: "参与互动", value: "126", sub: "本学期累计", icon: MessageSquare },
        ].map(s => (
          <div key={s.label} style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: tk.textSecondary, marginBottom: 8 }}>
              <s.icon size={13} style={{ color: tk.brandDefault }} /> {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: tk.textPrimary, lineHeight: "32px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 我的课堂主模块 — 对齐教师端白卡片 */}
      <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg, display: "flex", flexDirection: "column", gap: tk.spacingMd, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", rowGap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: tk.textPrimary }}>我的课堂</span>
            {renderViewSwitcher()}
          </div>
          <div style={{ flex: 1 }} />
          {viewMode === "card" && (
            <div style={{ background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <Search size={12} style={{ color: tk.textPlaceholder }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索课堂包…" style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, fontFamily: "var(--font-family)", width: 110 }} />
            </div>
          )}
          {/* 全部状态 下拉 */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setStatusOpen(!statusOpen); setSubjectOpen(false); }} style={{
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
              padding: "5px 10px", fontSize: 12, color: statusFilter === "all" ? tk.textSecondary : tk.textPrimary,
              display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer",
            }}>
              {statusFilter === "all" ? "全部状态" : { pending: "待上课", active: "授课中", done: "已完成", absent: "缺席" }[statusFilter]}
              <ChevronDown size={11} />
            </button>
            {statusOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50, background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, boxShadow: tk.shadowMd, minWidth: 130, padding: 4 }}>
                {([{ v: "all", label: "全部状态" }, { v: "pending", label: "待上课" }, { v: "active", label: "授课中" }, { v: "done", label: "已完成" }, { v: "absent", label: "缺席" }] as const).map(opt => (
                  <button key={opt.v} onClick={() => { setStatusFilter(opt.v); setStatusOpen(false); }} style={{
                    width: "100%", textAlign: "left", background: statusFilter === opt.v ? tk.bgPrimary : "transparent",
                    border: "none", borderRadius: tk.radiusXs, padding: "6px 10px", fontSize: 12, cursor: "pointer",
                    color: statusFilter === opt.v ? tk.textBrand : tk.textPrimary,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}><span>{opt.label}</span>{statusFilter === opt.v && <Check size={11} />}</button>
                ))}
              </div>
            )}
          </div>
          {/* 全部学科 下拉 */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setSubjectOpen(!subjectOpen); setStatusOpen(false); }} style={{
              background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
              padding: "5px 10px", fontSize: 12, color: subjectFilter === "全部" ? tk.textSecondary : tk.textPrimary,
              display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer",
            }}>
              {subjectFilter === "全部" ? "全部学科" : subjectFilter}
              <ChevronDown size={11} />
            </button>
            {subjectOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50, background: tk.bgWhite, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, boxShadow: tk.shadowMd, minWidth: 120, padding: 4 }}>
                {subjects.map(s => (
                  <button key={s} onClick={() => { setSubjectFilter(s); setSubjectOpen(false); }} style={{
                    width: "100%", textAlign: "left", background: subjectFilter === s ? tk.bgPrimary : "transparent",
                    border: "none", borderRadius: tk.radiusXs, padding: "6px 10px", fontSize: 12, cursor: "pointer",
                    color: subjectFilter === s ? tk.textBrand : tk.textPrimary,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}><span>{s === "全部" ? "全部学科" : s}</span>{subjectFilter === s && <Check size={11} />}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {viewMode === "calendar" ? (
          <StudentWeeklyCalendar
            weekOffset={weekOffset} setWeekOffset={setWeekOffset}
            subjectFilter={subjectFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            search={search} onClassClick={handleClassClick}
          />
        ) : (
          <>
            {filteredList.length === 0 ? (
              <div style={{ padding: tk.spacingXl, textAlign: "center", color: tk.textPlaceholder, fontSize: 13 }}>暂无匹配的课堂包</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: tk.spacingMd }}>
                {filteredList.map(c => (
                  <StudentClassCard key={c.id} cls={c} onClick={() => handleClassClick(c)} onAction={() => onEnterTeaching?.(c)} onReview={() => onReviewClass?.(c)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StudentHomework({ initialHwId }: { initialHwId?: number | null }) {
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [subjectFilter, setSubjectFilter] = useState("全部");
  const [submitFilter, setSubmitFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [activeHw, setActiveHw] = useState<typeof STUDENT_HOMEWORK[0] | null>(
    () => initialHwId ? STUDENT_HOMEWORK.find(h => h.id === initialHwId) ?? null : null
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState<Record<number, number>>({});

  const subjects = ["全部", "英语", "数学", "语文"];
  const submitStatuses = ["全部", "未提交", "已提交", "已批改", "已打回"];
  const filtered = STUDENT_HOMEWORK
    .filter(h => filter === "all" || h.status === filter)
    .filter(h => subjectFilter === "全部" || h.subject === subjectFilter)
    .filter(h => submitFilter === "全部" || h.submitStatus === submitFilter)
    .filter(h => !search || h.title.includes(search));
  const totalHw = STUDENT_HOMEWORK.length;
  const doneCount = STUDENT_HOMEWORK.filter(h => h.status === "done").length;
  const pendingCount = STUDENT_HOMEWORK.filter(h => h.status === "pending").length;
  const finishRate = Math.round((doneCount / totalHw) * 100);

  const SAMPLE_Q = [
    { q: "ecosystem 的中文意思是？", opts: ["A. 生态系统", "B. 自然环境", "C. 物种多样性", "D. 栖息地"], ans: 0 },
    { q: "habitat 在句中指？", opts: ["A. 食物链", "B. 生活环境", "C. 气候变化", "D. 生态平衡"], ans: 1 },
    { q: "文章第三段的主旨是什么？", opts: ["A. 气候变化影响", "B. 保护生物多样性", "C. 人类活动破坏", "D. 自然恢复能力"], ans: 1 },
  ];

  if (activeHw) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{
          padding: "10px 20px", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`,
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <button onClick={() => { setActiveHw(null); setCurrentQ(0); setAnswered({}); }} style={{
            background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm,
            fontSize: 12, color: tk.textSecondary, padding: "5px 10px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
          }}><ChevronLeft size={12} /> 返回</button>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>{activeHw.title}</span>
          <span style={{ fontSize: 12, color: tk.textSecondary }}>第 {currentQ + 1} / {SAMPLE_Q.length} 题</span>
        </div>

        {/* Question area */}
        <div style={{ flex: 1, overflowY: "auto", padding: `${tk.spacingLg} 10%`, display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
          {/* Q tabs */}
          <div style={{ display: "flex", gap: 6 }}>
            {SAMPLE_Q.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)} style={{
                padding: "5px 14px", borderRadius: tk.radiusFull,
                background: currentQ === i ? tk.brandDefault : answered[i] !== undefined ? tk.bgBrandSubtle : tk.bgPrimary,
                color: currentQ === i ? tk.textReverse : answered[i] !== undefined ? tk.textBrand : tk.textSecondary,
                border: `1px solid ${currentQ === i ? tk.brandDefault : tk.borderHairline}`,
                fontSize: 12, fontWeight: currentQ === i ? 600 : 400, cursor: "pointer",
              }}>第 {i + 1} 题</button>
            ))}
          </div>

          {/* Question */}
          <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: tk.textPrimary, lineHeight: "24px", marginBottom: tk.spacingMd }}>
              {SAMPLE_Q[currentQ].q}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SAMPLE_Q[currentQ].opts.map((opt, oi) => {
                const isAnswered = answered[currentQ] !== undefined;
                const isSelected = answered[currentQ] === oi;
                const isCorrect = oi === SAMPLE_Q[currentQ].ans;
                return (
                  <button key={oi} onClick={() => !isAnswered && setAnswered(a => ({ ...a, [currentQ]: oi }))} style={{
                    padding: "12px 16px", borderRadius: tk.radiusMd, textAlign: "left",
                    background: isAnswered ? (isCorrect ? tk.bgBrandSubtle : isSelected ? tk.bgErrorSubtle : tk.bgWhite) : tk.bgWhite,
                    border: `1px solid ${isAnswered ? (isCorrect ? tk.borderBrand : isSelected ? tk.borderBrand : tk.borderHairline) : tk.borderHairline}`,
                    color: isAnswered ? (isCorrect ? tk.textBrand : isSelected ? tk.textError : tk.textSecondary) : tk.textPrimary,
                    fontSize: 14, cursor: isAnswered ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
                    fontWeight: isAnswered && isCorrect ? 600 : 400,
                  }}>
                    {isAnswered && isCorrect && <CheckCircle2 size={14} style={{ color: tk.brandDefault, flexShrink: 0 }} />}
                    {isAnswered && isSelected && !isCorrect && <AlertCircle size={14} style={{ color: tk.textError, flexShrink: 0 }} />}
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered[currentQ] !== undefined && (
              <div style={{
                marginTop: tk.spacingMd, padding: "10px 14px", borderRadius: tk.radiusSm,
                background: answered[currentQ] === SAMPLE_Q[currentQ].ans ? tk.bgBrandSubtle : tk.bgErrorSubtle,
                fontSize: 12, color: answered[currentQ] === SAMPLE_Q[currentQ].ans ? tk.textBrand : tk.textError, fontWeight: 600,
              }}>
                {answered[currentQ] === SAMPLE_Q[currentQ].ans ? "✓ 回答正确！" : `✗ 正确答案是 ${SAMPLE_Q[currentQ].opts[SAMPLE_Q[currentQ].ans]}`}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0} style={{
              background: "none", border: `1px solid ${tk.borderDefault}`, borderRadius: tk.radiusSm,
              fontSize: 12, padding: "7px 16px", cursor: currentQ === 0 ? "default" : "pointer",
              color: currentQ === 0 ? tk.textDisabled : tk.textSecondary, opacity: currentQ === 0 ? 0.4 : 1,
              display: "flex", alignItems: "center", gap: 5,
            }}><ChevronLeft size={13} /> 上一题</button>
            {currentQ < SAMPLE_Q.length - 1
              ? <button onClick={() => setCurrentQ(q => q + 1)} style={{ background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600, padding: "7px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>下一题 <ChevronRight size={13} /></button>
              : <button style={{ background: tk.successDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600, padding: "7px 20px", cursor: "pointer" }}>提交作业</button>
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: tk.bgPrimary, overflow: "hidden" }}>
      <div style={{ padding: tk.spacingLg, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: tk.spacingMd }}>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, display: "flex", alignItems: "center", gap: 12 }}>
          <ClipboardList size={20} style={{ color: tk.brandDefault, flexShrink: 0 }} />
          <div><div style={{ fontSize: 20, fontWeight: 700, color: tk.textPrimary }}>{totalHw}</div><div style={{ fontSize: 11, color: tk.textSecondary }}>作业总数</div></div>
        </div>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, display: "flex", alignItems: "center", gap: 12 }}>
          <CheckCircle2 size={20} style={{ color: tk.brandDefault, flexShrink: 0 }} />
          <div><div style={{ fontSize: 20, fontWeight: 700, color: tk.brandDefault }}>{finishRate}%</div><div style={{ fontSize: 11, color: tk.textSecondary }}>完成率</div></div>
        </div>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertCircle size={20} style={{ color: tk.brandDefault, flexShrink: 0 }} />
          <div><div style={{ fontSize: 20, fontWeight: 700, color: tk.textPrimary }}>{pendingCount}</div><div style={{ fontSize: 11, color: tk.textSecondary }}>待完成</div></div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", padding: `0 ${tk.spacingLg} ${tk.spacingLg}` }}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: `1px solid ${tk.borderHairline}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: tk.textPrimary }}>我的作业</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {(["all", "pending", "done"] as const).map(f => {
                const labels = { all: "全部", pending: "待完成", done: "已完成" };
                return <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? tk.bgBrandSubtle : "transparent", color: filter === f ? tk.textBrand : tk.textSecondary, border: `1px solid ${filter === f ? tk.borderBrand : "transparent"}`, borderRadius: tk.radiusFull, fontSize: 11, padding: "3px 10px", cursor: "pointer" }}>{labels[f]}</button>;
              })}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <Search size={12} style={{ color: tk.textPlaceholder }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索作业…" style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, fontFamily: "var(--font-family)", width: 120 }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingMd }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: tk.spacingMd }}>
              {subjects.map(s => <button key={s} onClick={() => setSubjectFilter(s)} style={{ background: subjectFilter === s ? tk.bgBrandSubtle : "transparent", color: subjectFilter === s ? tk.textBrand : tk.textSecondary, border: `1px solid ${subjectFilter === s ? tk.borderBrand : "transparent"}`, borderRadius: tk.radiusFull, fontSize: 11, padding: "3px 10px", cursor: "pointer" }}>{s}</button>)}
              <div style={{ width: 1, height: 16, background: tk.borderHairline }} />
              {submitStatuses.map(s => <button key={s} onClick={() => setSubmitFilter(s)} style={{ background: submitFilter === s ? tk.bgBrandSubtle : "transparent", color: submitFilter === s ? tk.textBrand : tk.textSecondary, border: `1px solid ${submitFilter === s ? tk.borderBrand : "transparent"}`, borderRadius: tk.radiusFull, fontSize: 11, padding: "3px 10px", cursor: "pointer" }}>{s}</button>)}
            </div>
            <div style={{ background: tk.bgPrimary, borderRadius: tk.radiusMd, padding: tk.spacingMd, marginBottom: tk.spacingMd, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180, fontSize: 12, color: tk.textSecondary }}>共 {totalHw} 份作业，已完成 {doneCount} 份，待完成 {pendingCount} 份。</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: tk.textPlaceholder }}>筛选</span>
                <span style={{ fontSize: 11, color: tk.textPlaceholder }}>学科：{subjectFilter}</span>
                <span style={{ fontSize: 11, color: tk.textPlaceholder }}>提交：{submitFilter}</span>
              </div>
            </div>
            <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 100px 100px 120px 100px", padding: "10px 16px", background: tk.bgPrimary, borderBottom: `1px solid ${tk.borderHairline}`, fontSize: 11, fontWeight: 600, color: tk.textSecondary }}>
                <span>作业名</span><span>学科</span><span>类型</span><span>题数</span><span>提交状态</span><span>操作</span>
              </div>
              {filtered.map(hw => (
                <div key={hw.id} onClick={() => setActiveHw(hw)} style={{
                  display: "grid", gridTemplateColumns: "2fr 100px 100px 100px 120px 100px",
                  padding: "12px 16px", borderBottom: `1px solid ${tk.borderHairline}`,
                  cursor: "pointer", alignItems: "center", fontSize: 12, transition: "background 0.1s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: tk.textPrimary }}>{hw.title}</div>
                    <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 2 }}>截止 {hw.dueDate}</div>
                  </div>
                  <span style={{ color: tk.textSecondary }}>{hw.subject}</span>
                  <span style={{ color: tk.textSecondary }}>{hw.type}</span>
                  <span style={{ color: tk.textSecondary }}>{hw.questions} 题</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: tk.radiusFull, width: "fit-content",
                    background: hw.submitStatus === "未提交" ? tk.bgWarningSubtle : hw.submitStatus === "已打回" ? tk.bgErrorSubtle : tk.bgBrandSubtle,
                    color: hw.submitStatus === "未提交" ? tk.textWarning : hw.submitStatus === "已打回" ? tk.textError : tk.textBrand,
                  }}>{hw.submitStatus}</span>
                  <button onClick={e => { e.stopPropagation(); setActiveHw(hw); }} style={{
                    background: hw.status === "pending" ? tk.brandDefault : "none",
                    color: hw.status === "pending" ? tk.textReverse : tk.textBrand,
                    border: hw.status === "pending" ? "none" : `1px solid ${tk.borderBrand}`,
                    borderRadius: tk.radiusSm, fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer",
                  }}>{hw.status === "pending" ? "去作答" : "查看"}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Student After-Class Detail ──────────────────────────────────────────────
function StudentAfterClassDetail({
  cls, onBack,
}: { cls: typeof STUDENT_CLASSES[0]; onBack: () => void }) {
  const [detailTab, setDetailTab] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const detailTabs = ["授课内容", "AI 建议", "去做作业", "作业情况"];

  const sections = [
    {
      title: "§1 教学导入",
      resources: [
        { type: "PPT", name: "导入幻灯片（3页）" },
        { type: "视频", name: "导入视频：自然生态" },
      ],
      summary: "教师通过展示自然风景图片引导学生联想 Unit 4 主题词汇，课堂气氛活跃。",
      myPerf: "参与发言 2 次，表现积极。",
    },
    {
      title: "§2 词汇预热",
      resources: [
        { type: "PPT", name: "词汇表：ecosystem / habitat / biodiversity" },
        { type: "练习", name: "词汇配对练习（10题）" },
      ],
      summary: "重点词汇 ecosystem、habitat 通过例句和图示讲解，学生完成配对练习。",
      myPerf: "词汇配对正确率 80%，需复习 biodiversity 用法。",
    },
    {
      title: "§3 精读训练",
      resources: [
        { type: "文章", name: "Unit 4 课文原文（带注释）" },
        { type: "任务单", name: "精读任务单（段落结构分析）" },
      ],
      summary: "精读阶段采用扫读→精读→推断词义三步策略，分组完成阅读任务单。",
      myPerf: "任务单完成情况良好，推断词义部分用时略长。",
    },
    {
      title: "§4 小组讨论",
      resources: [
        { type: "讨论卡", name: "讨论话题卡片" },
      ],
      summary: "小组讨论「How can we protect local ecosystems?」，各组分享观点。",
      myPerf: "参与组内讨论，提出 2 个有效观点。",
    },
    {
      title: "§5 小结",
      resources: [
        { type: "思维导图", name: "Unit 4 知识点思维导图" },
        { type: "作业说明", name: "课后作业布置说明" },
      ],
      summary: "利用思维导图回顾本节课核心内容，布置课后词汇速记作业。",
      myPerf: "思维导图理解清晰，已记录作业安排。",
    },
  ];

  const sec = sections[activeSection];

  const previewContent = (
    <div style={{
      height: "100%", background: tk.bgWhite, borderRadius: tk.radiusMd,
      border: `1px solid ${tk.borderHairline}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
    }}>
      <Layers size={36} style={{ color: tk.textPlaceholder }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: tk.textSecondary }}>{sec.resources[0]?.name}</div>
        <div style={{ fontSize: 12, color: tk.textPlaceholder, marginTop: 4 }}>点击资源查看详情</div>
      </div>
      <button
        onClick={() => setFullscreen(true)}
        style={{
          background: tk.bgBrandSubtle, color: tk.textBrand,
          border: `1px solid ${tk.borderBrand}`, borderRadius: tk.radiusSm,
          fontSize: 12, padding: "6px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
        }}
      ><Maximize2 size={13} /> 全屏回顾</button>
    </div>
  );

  // Fullscreen overlay
  if (fullscreen) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "#0d0f14", display: "flex", flexDirection: "column", fontFamily: "var(--font-family)" }}>
        <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{cls.title} · {sec.title}</span>
          <button onClick={() => setFullscreen(false)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: 11, padding: "4px 12px", cursor: "pointer" }}>退出回顾</button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{
            width: "100%", maxWidth: 960, aspectRatio: "16/9", background: "#1a1e2a", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>课堂回顾 · {sec.title}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.9)", textAlign: "center", maxWidth: 560, lineHeight: "36px" }}>{sec.summary}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {sec.resources.map(r => (
                <span key={r.name} style={{ fontSize: 11, background: "rgba(10,124,87,0.25)", color: "#6ee7b7", padding: "4px 12px", borderRadius: tk.radiusFull }}>{r.type}: {r.name}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {sections.map((s, i) => (
            <button key={i} onClick={() => setActiveSection(i)} style={{
              background: i === activeSection ? "rgba(10,124,87,0.35)" : "rgba(255,255,255,0.08)",
              border: `1px solid ${i === activeSection ? tk.brandDefault : "rgba(255,255,255,0.12)"}`,
              borderRadius: 6, color: i === activeSection ? "#6ee7b7" : "rgba(255,255,255,0.6)",
              fontSize: 11, padding: "5px 12px", cursor: "pointer",
            }}>§{i + 1}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header with back + title + actions */}
      <div style={{ background: tk.bgWhite, padding: "10px 20px", borderBottom: `1px solid ${tk.borderHairline}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Breadcrumb-style back */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: tk.textSecondary }}>
            <button onClick={onBack} style={{ background: "none", border: "none", color: tk.textSecondary, cursor: "pointer", fontSize: 12, padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = tk.textBrand)}
              onMouseLeave={e => (e.currentTarget.style.color = tk.textSecondary)}
            >我的课后</button>
            <ChevronRight size={11} style={{ color: tk.textPlaceholder }} />
            <span style={{ color: tk.textPrimary, fontWeight: 600 }}>{cls.title}</span>
          </div>
          <div style={{ flex: 1 }} />
          {/* Meta */}
          {[{ icon: <BookMarked size={11} />, val: cls.subject },
            { icon: <GraduationCap size={11} />, val: cls.teacher },
            { icon: <Clock size={11} />, val: cls.time }].map((m, i) => (
            <span key={i} style={{ fontSize: 11, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
              {m.icon}{m.val}
            </span>
          ))}
          <StudentStatusTag status="done" />
          {/* Actions */}
          <button
            onClick={() => setFullscreen(true)}
            style={{ background: "none", border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, fontSize: 12, color: tk.textSecondary, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          ><Maximize2 size={12} /> 全屏回顾</button>
          <button style={{ background: tk.brandDefault, color: tk.textReverse, border: "none", borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <ClipboardList size={12} /> 去做作业
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`, display: "flex", flexShrink: 0 }}>
        {detailTabs.map((t, i) => (
          <button key={t} onClick={() => setDetailTab(i)} style={{
            background: "none", border: "none",
            borderBottom: i === detailTab ? `2px solid ${tk.brandDefault}` : "2px solid transparent",
            color: i === detailTab ? tk.textBrand : tk.textSecondary,
            fontSize: 13, fontWeight: i === detailTab ? 600 : 400,
            padding: "10px 20px", cursor: "pointer", transition: "all 0.12s",
          }}>{t}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Tab 0: 授课内容 — left section nav + right preview ── */}
        {detailTab === 0 && (
          <>
            {/* Section directory */}
            <div style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${tk.borderHairline}`, background: tk.bgWhite, overflowY: "auto" }}>
              <div style={{ padding: "10px 14px 6px", fontSize: 10, fontWeight: 600, color: tk.textPlaceholder, letterSpacing: "0.05em" }}>课堂环节</div>
              {sections.map((s, i) => (
                <button key={i} onClick={() => setActiveSection(i)} style={{
                  width: "100%", background: i === activeSection ? tk.bgBrandSubtle : "transparent",
                  border: "none", padding: "9px 14px", textAlign: "left",
                  color: i === activeSection ? tk.textBrand : tk.textSecondary,
                  fontSize: 12, fontWeight: i === activeSection ? 600 : 400,
                  borderLeft: i === activeSection ? `2px solid ${tk.brandDefault}` : "2px solid transparent",
                  cursor: "pointer", transition: "all 0.1s",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, fontSize: 9, fontWeight: 700,
                    background: i === activeSection ? tk.brandDefault : tk.bgSecondary,
                    color: i === activeSection ? tk.textReverse : tk.textSecondary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title.replace(`§${i + 1} `, "")}</span>
                </button>
              ))}
            </div>

            {/* Content area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: tk.bgPrimary }}>
              {/* Section info bar */}
              <div style={{ padding: "10px 16px", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>{sec.title}</span>
                <div style={{ flex: 1 }} />
                {/* Resources */}
                {sec.resources.map(r => (
                  <button key={r.name} style={{
                    background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`,
                    borderRadius: tk.radiusSm, fontSize: 11, color: tk.textSecondary,
                    padding: "3px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 700, background: tk.bgBrandSubtle, color: tk.textBrand, padding: "1px 4px", borderRadius: 2 }}>{r.type}</span>
                    {r.name}
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div style={{ flex: 1, padding: tk.spacingMd, overflow: "hidden" }}>
                {previewContent}
              </div>

              {/* My performance note */}
              <div style={{
                padding: "10px 16px", background: tk.bgWhite, borderTop: `1px solid ${tk.borderHairline}`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, background: tk.bgBrandSubtle, color: tk.textBrand, padding: "2px 7px", borderRadius: tk.radiusFull }}>我的表现</span>
                <span style={{ fontSize: 12, color: tk.textSecondary }}>{sec.myPerf}</span>
              </div>
            </div>
          </>
        )}

        {/* ── Tab 1: AI 建议 ── */}
        {detailTab === 1 && (
          <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingLg, display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
            {/* Overall score */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: tk.spacingMd }}>
              {[
                { label: "课堂参与", value: "92", unit: "分", color: tk.brandDefault },
                { label: "随堂正确率", value: "85", unit: "%", color: tk.brandDefault },
                { label: "作答完成", value: "10/10", unit: "", color: tk.textPrimary },
                { label: "综合表现", value: "良好", unit: "", color: tk.brandDefault },
              ].map(s => (
                <div key={s.label} style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}<span style={{ fontSize: 13, fontWeight: 400 }}>{s.unit}</span></div>
                  <div style={{ fontSize: 11, color: tk.textSecondary, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* AI summary cards */}
            <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingLg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: tk.spacingMd }}>
                <Sparkles size={14} style={{ color: tk.brandDefault }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>AI 学习建议</span>
              </div>
              {[
                { label: "本次表现", bg: tk.bgBrandSubtle, border: tk.brandDefault, text: tk.textBrand, value: "整体表现良好，课堂参与度高，词汇部分掌握扎实，小组讨论中贡献了有效观点。" },
                { label: "需要加强", bg: tk.bgWarningSubtle, border: tk.textWarning, text: tk.textWarning, value: "精读推断词义时速度偏慢，建议加强扫读策略练习。biodiversity 的具体用法需要巩固。" },
                { label: "学习建议", bg: tk.bgInfoSubtle, border: tk.textInfo, text: tk.textInfo, value: "建议本周内复习 Unit 4 词汇表（ecosystem / habitat / biodiversity），尝试用这些词造句。" },
                { label: "下节课预告", bg: tk.bgSecondary, border: tk.textSecondary, text: tk.textSecondary, value: "下节课将进入 Unit 4 写作部分，建议提前预习「自然保护」相关英文表达。" },
              ].map(a => (
                <div key={a.label} style={{ marginBottom: 10, padding: "10px 14px", background: a.bg, borderRadius: tk.radiusSm, borderLeft: `3px solid ${a.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: a.text, marginBottom: 4 }}>{a.label}</div>
                  <div style={{ fontSize: 13, color: tk.textPrimary, lineHeight: "20px" }}>{a.value}</div>
                </div>
              ))}
            </div>

            {/* Per-section performance */}
            <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: tk.spacingMd }}>各环节表现分析</div>
              {sections.map((s, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: tk.textSecondary }}>{s.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: [tk.brandDefault, tk.textWarning, tk.brandDefault, tk.brandDefault, tk.brandDefault][i] }}>{["92%", "80%", "88%", "95%", "90%"][i]}</span>
                  </div>
                  <div style={{ height: 5, background: tk.bgSecondary, borderRadius: tk.radiusFull, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: ["92%","80%","88%","95%","90%"][i], background: tk.brandDefault, borderRadius: tk.radiusFull }} />
                  </div>
                  <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 3 }}>{s.myPerf}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: 去做作业 ── */}
        {detailTab === 2 && (
          <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingLg, display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
            {STUDENT_HOMEWORK.filter(h => h.subject === cls.subject).map(hw => (
              <div key={hw.id} style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>{hw.title}</div>
                    <div style={{ fontSize: 11, color: tk.textPlaceholder, marginTop: 3 }}>{hw.questions} 题 · 截止 {hw.dueDate}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: tk.radiusFull,
                    background: hw.status === "pending" ? tk.bgWarningSubtle : tk.bgBrandSubtle,
                    color: hw.status === "pending" ? tk.textWarning : tk.textBrand,
                  }}>{hw.status === "pending" ? "待完成" : "已完成"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{
                    background: hw.status === "pending" ? tk.brandDefault : tk.bgPrimary,
                    color: hw.status === "pending" ? tk.textReverse : tk.textSecondary,
                    border: `1px solid ${hw.status === "pending" ? tk.brandDefault : tk.borderHairline}`,
                    borderRadius: tk.radiusSm, fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <PenLine size={12} /> {hw.status === "pending" ? "开始作答" : "查看作答"}
                  </button>
                </div>
              </div>
            ))}
            {STUDENT_HOMEWORK.filter(h => h.subject === cls.subject).length === 0 && (
              <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: `${tk.spacingXl} ${tk.spacingLg}`, textAlign: "center" }}>
                <ClipboardList size={28} style={{ color: tk.textPlaceholder, marginBottom: 10 }} />
                <div style={{ fontSize: 13, color: tk.textSecondary }}>暂无相关作业</div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: 作业情况 ── */}
        {detailTab === 3 && (
          <div style={{ flex: 1, overflowY: "auto", padding: tk.spacingLg, display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: tk.spacingMd }}>
              {[
                { label: "已完成题数", value: "10/10", color: tk.brandDefault },
                { label: "正确率", value: "85%", color: tk.brandDefault },
                { label: "用时", value: "18min", color: tk.textPrimary },
                { label: "提交状态", value: "已提交", color: tk.textSuccess },
              ].map(s => (
                <div key={s.label} style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: tk.textSecondary, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Per-question breakdown */}
            <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: tk.spacingMd }}>题目作答情况</div>
              {[
                { q: "第1题 — 词汇理解", result: "correct", time: "42s" },
                { q: "第2题 — 句意推断", result: "correct", time: "1min 8s" },
                { q: "第3题 — 主旨归纳", result: "wrong", time: "2min 3s" },
                { q: "第4题 — 细节理解", result: "correct", time: "55s" },
                { q: "第5题 — 综合应用", result: "correct", time: "1min 21s" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 0",
                  borderBottom: i < 4 ? `1px solid ${tk.borderHairline}` : "none",
                }}>
                  {item.result === "correct"
                    ? <CheckCircle2 size={14} style={{ color: tk.successDefault, flexShrink: 0 }} />
                    : <AlertCircle size={14} style={{ color: tk.errorDefault, flexShrink: 0 }} />
                  }
                  <span style={{ flex: 1, fontSize: 12, color: tk.textPrimary }}>{item.q}</span>
                  <span style={{ fontSize: 11, color: tk.textPlaceholder }}>用时 {item.time}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: item.result === "correct" ? tk.textSuccess : tk.textError }}>
                    {item.result === "correct" ? "正确" : "错误"}
                  </span>
                </div>
              ))}
            </div>

            {/* Wrong question analysis */}
            <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: 10 }}>错题分析</div>
              <div style={{ padding: "10px 14px", background: tk.bgErrorSubtle, borderRadius: tk.radiusSm, borderLeft: `3px solid ${tk.errorDefault}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: tk.textError, marginBottom: 4 }}>第3题 — 主旨归纳</div>
                <div style={{ fontSize: 12, color: tk.textPrimary, lineHeight: "18px" }}>
                  你选择了「气候变化影响」，正确答案是「保护生物多样性」。建议重读文章第三段，注意段落主题句位置。
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Student After-Class List ─────────────────────────────────────────────────
function StudentAfterClass({ onViewClass }: {
  onViewClass: (cls: typeof STUDENT_CLASSES[0], defaultTab?: "package" | "analysis") => void;
}) {
  const doneCls = STUDENT_CLASSES.filter(c => c.status === "done");
  const [subjectFilter, setSubjectFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const subjects = ["全部", "英语", "数学", "语文"];

  const filtered = doneCls
    .filter(c => subjectFilter === "全部" || c.subject === subjectFilter)
    .filter(c => !search || c.title.includes(search) || c.teacher.includes(search));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: tk.bgPrimary, overflow: "hidden" }}>
      <div style={{ padding: tk.spacingLg, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: tk.spacingMd }}>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, display: "flex", alignItems: "center", gap: 12 }}>
          <BookOpen size={20} style={{ color: tk.brandDefault, flexShrink: 0 }} />
          <div><div style={{ fontSize: 20, fontWeight: 700, color: tk.textPrimary }}>{doneCls.length}</div><div style={{ fontSize: 11, color: tk.textSecondary }}>已完成课堂</div></div>
        </div>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, display: "flex", alignItems: "center", gap: 12 }}>
          <TrendingUp size={20} style={{ color: tk.brandDefault, flexShrink: 0 }} />
          <div><div style={{ fontSize: 20, fontWeight: 700, color: tk.textPrimary }}>85%</div><div style={{ fontSize: 11, color: tk.textSecondary }}>平均正确率</div></div>
        </div>
        <div style={{ background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, padding: tk.spacingMd, display: "flex", alignItems: "center", gap: 12 }}>
          <CheckCircle2 size={20} style={{ color: tk.brandDefault, flexShrink: 0 }} />
          <div><div style={{ fontSize: 20, fontWeight: 700, color: tk.textPrimary }}>88%</div><div style={{ fontSize: 11, color: tk.textSecondary }}>作业完成率</div></div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", padding: `0 ${tk.spacingLg} ${tk.spacingLg}` }}>
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: tk.bgWhite, borderRadius: tk.radiusMd, border: `1px solid ${tk.borderHairline}`, overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: `1px solid ${tk.borderHairline}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: tk.textPrimary }}>我的课后</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {subjects.map(s => (
                <button key={s} onClick={() => setSubjectFilter(s)} style={{
                  background: subjectFilter === s ? tk.bgBrandSubtle : "transparent",
                  color: subjectFilter === s ? tk.textBrand : tk.textSecondary,
                  border: `1px solid ${subjectFilter === s ? tk.borderBrand : "transparent"}`,
                  borderRadius: tk.radiusFull, fontSize: 11, padding: "3px 10px", cursor: "pointer",
                }}>{s}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ background: tk.bgPrimary, border: `1px solid ${tk.borderHairline}`, borderRadius: tk.radiusSm, padding: "5px 10px", display: "flex", alignItems: "center", gap: 5 }}>
              <Search size={12} style={{ color: tk.textPlaceholder }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索课后包…" style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, fontFamily: "var(--font-family)", width: 120 }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: `${tk.spacingMd}` }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: tk.spacingXl, color: tk.textPlaceholder, fontSize: 13 }}>
                暂无匹配的课后包
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: tk.spacingMd }}>
                {filtered.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onViewClass(c, "analysis")}
                    style={{
                      background: tk.bgWhite, borderRadius: tk.radiusMd,
                      border: `1px solid ${tk.borderHairline}`,
                      padding: tk.spacingMd, cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex", flexDirection: "column", gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = tk.borderBrand; e.currentTarget.style.boxShadow = tk.shadowMd; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = tk.borderHairline; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: tk.textSecondary, marginTop: 2 }}>课后复习 · 5 个环节</div>
                      </div>
                      <StudentStatusTag status="done" />
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}><BookMarked size={10} />{c.subject}</span>
                      <span style={{ fontSize: 11, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}><GraduationCap size={10} />{c.teacher}</span>
                      <span style={{ fontSize: 11, color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}><Clock size={10} />{c.time}</span>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: tk.textPlaceholder, marginBottom: 3 }}>
                        <span>作业进度</span><span>85%</span>
                      </div>
                      <div style={{ height: 4, background: tk.bgSecondary, borderRadius: tk.radiusFull, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "85%", background: tk.brandDefault, borderRadius: tk.radiusFull }} />
                      </div>
                    </div>
                    <div style={{ height: 1, background: tk.borderHairline }} />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 11, color: tk.textBrand, display: "flex", alignItems: "center", gap: 3 }}>
                        查看课后总结 <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentApp({ onSwitchBack }: { onSwitchBack: () => void }) {
  const [tab, setTab] = useState<StudentTab>("home");
  const [teachingCls, setTeachingCls] = useState<typeof STUDENT_CLASSES[0] | null>(null);
  const [previewCls, setPreviewCls] = useState<typeof STUDENT_CLASSES[0] | null>(null);
  const [previewDefaultTab, setPreviewDefaultTab] = useState<"package" | "analysis">("package");
  const [reviewCls, setReviewCls] = useState<typeof STUDENT_CLASSES[0] | null>(null);
  const [initialHwId, setInitialHwId] = useState<number | null>(null);

  if (reviewCls) {
    return <TeachingMode cls={reviewCls} reviewMode onExit={() => setReviewCls(null)} />;
  }

  if (teachingCls) {
    return <StudentTeachingMode cls={teachingCls} onExit={() => setTeachingCls(null)} />;
  }

  function handleViewClass(cls: typeof STUDENT_CLASSES[0], defaultTab: "package" | "analysis" = "package") {
    console.log("StudentApp handleViewClass:", cls.id, cls.title, cls.status, defaultTab);
    setPreviewDefaultTab(defaultTab);
    setPreviewCls(cls);
  }

  function handleReviewClass(cls: typeof STUDENT_CLASSES[0]) {
    console.log("StudentApp handleReviewClass:", cls.id, cls.title, cls.status);
    // 如果当前已处于课程详情页，保留 previewCls，退出 review 后返回同一详情页。
    setReviewCls(cls);
  }

  function handleEnterTeaching(cls: typeof STUDENT_CLASSES[0]) {
    setPreviewCls(null);
    setTeachingCls(cls);
  }

  if (previewCls) {
    return (
      <div style={{ height: "100vh", display: "flex", background: tk.bgPrimary, fontFamily: "var(--font-family)", color: tk.textPrimary, overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <StudentClassPreviewPage
            cls={previewCls}
            initialTab={previewDefaultTab}
            onBack={() => setPreviewCls(null)}
            onEnterTeaching={() => handleEnterTeaching(previewCls)}
            onReview={() => handleReviewClass(previewCls)}
          />
        </div>
      </div>
    );
  }

  const navItems: { key: StudentTab; label: string; icon: React.ElementType }[] = [
    { key: "home", label: "首页", icon: LayoutDashboard },
    { key: "classes", label: "我的课堂", icon: BookOpen },
    { key: "homework", label: "我的作业", icon: ClipboardList },
    { key: "afterclass", label: "我的课后", icon: BarChart2 },
  ];

  return (
    <div style={{
      height: "100vh", display: "flex", background: tk.bgPrimary,
      fontFamily: "var(--font-family)", color: tk.textPrimary, overflow: "hidden",
    }}>
      {/* Left sidebar nav */}
      <div style={{
        width: 200, flexShrink: 0, background: tk.bgWhite,
        borderRight: `1px solid ${tk.borderHairline}`,
        display: "flex", flexDirection: "column",
      }}>
        {/* Logo */}
        <div style={{ padding: "16px 14px", borderBottom: `1px solid ${tk.borderHairline}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: tk.radiusSm, background: tk.brandDefault, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={15} style={{ color: tk.textReverse }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tk.textPrimary }}>学习空间</div>
              <div style={{ fontSize: 10, color: tk.textPlaceholder }}>李同学 · 高一(3)班</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              width: "100%", background: tab === key ? tk.bgBrandSubtle : "transparent",
              color: tab === key ? tk.textBrand : tk.textSecondary,
              borderLeft: tab === key ? `2px solid ${tk.brandDefault}` : "2px solid transparent",
              border: "none", borderRadius: tk.radiusSm, padding: "9px 12px",
              cursor: "pointer", textAlign: "left", fontSize: 13,
              fontWeight: tab === key ? 600 : 400, transition: "all 0.12s",
              display: "flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => { if (tab !== key) e.currentTarget.style.background = tk.bgPrimary; }}
              onMouseLeave={e => { if (tab !== key) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Bottom tools */}
        <div style={{ padding: "8px", borderTop: `1px solid ${tk.borderHairline}`, display: "flex", flexDirection: "column", gap: 2 }}>
          {[{ icon: Search, label: "搜索" }, { icon: Settings, label: "设置" }].map(({ icon: Icon, label }) => (
            <button key={label} style={{
              width: "100%", background: "transparent", border: "none", borderRadius: tk.radiusSm,
              padding: "7px 12px", cursor: "pointer", textAlign: "left", fontSize: 12,
              color: tk.textSecondary, display: "flex", alignItems: "center", gap: 8,
              transition: "background 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Icon size={13} />{label}
            </button>
          ))}
          <button onClick={onSwitchBack} style={{
            width: "100%", background: "transparent", border: "none", borderRadius: tk.radiusSm,
            padding: "7px 12px", cursor: "pointer", textAlign: "left", fontSize: 12,
            color: tk.textPlaceholder, display: "flex", alignItems: "center", gap: 8,
            marginTop: 4, transition: "all 0.1s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = tk.bgPrimary; e.currentTarget.style.color = tk.textSecondary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = tk.textPlaceholder; }}
          >
            <ArrowRight size={13} style={{ transform: "rotate(180deg)" }} /> 切换到教师端
          </button>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", background: tk.bgWhite, borderBottom: `1px solid ${tk.borderHairline}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: tk.textPrimary }}>
            {navItems.find(n => n.key === tab)?.label}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: tk.textPlaceholder }}>学生端 · iPad</span>
            <div style={{ width: 26, height: 26, borderRadius: tk.radiusFull, background: tk.bgBrandSubtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: tk.textBrand }}>李</div>
          </div>
        </div>

        {/* Module content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {tab === "home" && (
            <StudentHome
              onGoClasses={() => setTab("classes")}
              onGoHomework={() => setTab("homework")}
              onStartHw={(id) => { setInitialHwId(id); setTab("homework"); }}
              onEnterClass={handleViewClass}
            />
          )}
          {tab === "classes" && (
            <StudentClasses onViewClass={handleViewClass} onEnterTeaching={handleEnterTeaching} onReviewClass={handleReviewClass} />
          )}
          {tab === "homework" && <StudentHomework initialHwId={initialHwId} />}
          {tab === "afterclass" && <StudentAfterClass onViewClass={handleViewClass} />}
        </div>
      </div>
    </div>
  );
}

// ─── Account Dropdown ────────────────────────────────────────────────────────
function AccountDropdown({ onSwitch, onClose }: { onSwitch: (mode: "teacher" | "student") => void; onClose: () => void }) {
  return (
    <>
      {/* backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 900 }} />
      <div style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 1000,
        background: tk.bgWhite, borderRadius: tk.radiusMd,
        border: `1px solid ${tk.borderHairline}`, boxShadow: tk.shadowMd,
        minWidth: 200, overflow: "hidden",
      }}>
        {/* Profile header */}
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${tk.borderHairline}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary }}>王老师</div>
          <div style={{ fontSize: 11, color: tk.textPlaceholder }}>高一英语 · 教师端</div>
        </div>

        {/* Account switcher */}
        <div style={{ padding: "6px 0" }}>
          <div style={{ padding: "4px 14px 6px", fontSize: 10, fontWeight: 600, color: tk.textPlaceholder, letterSpacing: "0.05em" }}>切换账号</div>
          {[
            { label: "教师 - 王老师", sub: "当前账号", mode: "teacher" as const, active: true },
            { label: "学生 - 李同学", sub: "高一(3)班", mode: "student" as const, active: false },
            { label: "管理员", sub: "占位", mode: "teacher" as const, active: false, disabled: true },
          ].map(acc => (
            <button
              key={acc.label}
              onClick={() => { if (!acc.disabled && !acc.active) { onSwitch(acc.mode); onClose(); } }}
              disabled={acc.disabled}
              style={{
                width: "100%", background: acc.active ? tk.bgBrandSubtle : "transparent",
                border: "none", padding: "8px 14px", textAlign: "left", cursor: acc.disabled ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 10, opacity: acc.disabled ? 0.4 : 1,
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (!acc.active && !acc.disabled) e.currentTarget.style.background = tk.bgPrimary; }}
              onMouseLeave={e => { if (!acc.active) e.currentTarget.style.background = acc.active ? tk.bgBrandSubtle : "transparent"; }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: tk.radiusFull, flexShrink: 0,
                background: acc.active ? tk.brandDefault : tk.bgSecondary,
                color: acc.active ? tk.textReverse : tk.textSecondary,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
              }}>{acc.label[0]}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: acc.active ? 600 : 400, color: acc.active ? tk.textBrand : tk.textPrimary }}>{acc.label}</div>
                <div style={{ fontSize: 10, color: tk.textPlaceholder }}>{acc.sub}</div>
              </div>
              {acc.active && <CheckCircle2 size={12} style={{ marginLeft: "auto", color: tk.brandDefault }} />}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ borderTop: `1px solid ${tk.borderHairline}`, padding: "6px 0" }}>
          {["个人中心", "退出登录"].map(action => (
            <button key={action} onClick={onClose} style={{
              width: "100%", background: "none", border: "none", padding: "8px 14px",
              textAlign: "left", fontSize: 12, cursor: "pointer",
              color: action === "退出登录" ? tk.textError : tk.textSecondary,
              transition: "background 0.1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >{action}</button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── App Root ───────────────────────────────────────────────────────────────
export default function App() {
  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const [userMode, setUserMode] = useState<"teacher" | "student">("teacher");
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  // 精简模式：true 时隐藏 TopNav / 面包屑 / 课堂包胶囊导航，给课堂包详情沉浸式查看/编辑
  const [minimalMode, setMinimalMode] = useState(false);

  // SparkClass sub-state — lifted up so the global breadcrumb can include sub-pages
  type SparkView = { type: "list" } | { type: "detail"; id: number; tab?: "package" | "analysis" };
  const [sparkTab, setSparkTab] = useState<SparkTab>("classes");
  const [sparkView, setSparkView] = useState<SparkView>({ type: "list" });

  // ─── 全局授课/回顾流程（覆盖所有模块：教师端列表/课表/详情 + 学生端回顾） ───
  // teachContext: "teach" 老师授课；"review" 学生/老师回顾
  const [teachConfirmId, setTeachConfirmId] = useState<number | null>(null);
  const [teachConfirmCtx, setTeachConfirmCtx] = useState<"teach" | "review">("teach");
  const [teachingId, setTeachingId] = useState<number | null>(null);
  const [teachingCtx, setTeachingCtx] = useState<"teach" | "review">("teach");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  function goTeach(id: number, ctx: "teach" | "review" = "teach") {
    setTeachConfirmId(id);
    setTeachConfirmCtx(ctx);
  }
  function confirmEnterTeaching() {
    if (teachConfirmId === null) return;
    setTeachingId(teachConfirmId);
    setTeachingCtx(teachConfirmCtx);
    setTeachConfirmId(null);
  }
  function requestExitTeaching() {
    setShowExitConfirm(true);
  }
  function exitTeaching(generateAnalysis: boolean) {
    setTeachingId(null);
    setShowExitConfirm(false);
    if (generateAnalysis) {
      // 模拟生成课后分析的反馈（仅 toast 占位）
      dispatchToast("课后分析已生成，可在课包/课后模块查看", "success");
    }
  }

  // When switching modules, reset SparkClass sub-state to list view
  function handleNavigate(m: Module) {
    setActiveModule(m);
    if (m !== "sparkclass") {
      setSparkView({ type: "list" });
      setMinimalMode(false);
    }
  }

  if (userMode === "student") {
    return <StudentApp onSwitchBack={() => setUserMode("teacher")} />;
  }

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: tk.bgPrimary, fontFamily: "var(--font-family)",
      color: tk.textPrimary, overflow: "hidden",
    }}>
      {/* 全局 toast 浮层（fixed 定位，跨模块可见） */}
      <ToastHost />
      {/* 精简模式下隐藏：TopNav + 全局面包屑；胶囊导航由 ClassDetailPage 自身按 minimalMode 隐藏 */}
      {!minimalMode && (
        <div style={{ position: "relative" }}>
          <TopNav
            activeModule={activeModule}
            onNavigate={handleNavigate}
            onAvatarClick={() => setAvatarMenuOpen(v => !v)}
          />
          {avatarMenuOpen && (
            <div style={{ position: "absolute", top: 56, right: 16, zIndex: 1000 }}>
              <AccountDropdown
                onSwitch={mode => setUserMode(mode)}
                onClose={() => setAvatarMenuOpen(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Unified breadcrumb — single row across all modules（精简模式下隐藏） */}
      {!minimalMode && (
        <GlobalBreadcrumb
          activeModule={activeModule}
          onGoHome={() => handleNavigate("dashboard")}
          sparkTab={sparkTab}
          sparkView={sparkView}
          onGoSparkTab={(t) => { setSparkTab(t); setSparkView({ type: "list" }); }}
          onGoSparkDetail={(id) => setSparkView({ type: "detail", id })}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflowY: activeModule === "myta" || activeModule === "sparkclass" ? "hidden" : "auto" }}>
        {activeModule === "dashboard" && (
          <Dashboard
            onNavigate={handleNavigate}
            onClassClick={(id) => { setSparkTab("classes"); setSparkView({ type: "detail", id }); handleNavigate("sparkclass"); }}
          />
        )}
        {activeModule === "myta" && <MyTA onNavigate={handleNavigate} minimalMode={minimalMode} setMinimalMode={setMinimalMode} />}
        {activeModule === "sparkclass" && (
          <SparkClass
            tab={sparkTab} setTab={setSparkTab}
            view={sparkView} setView={setSparkView}
            minimalMode={minimalMode} setMinimalMode={setMinimalMode}
            goTeach={goTeach}
          />
        )}
        {activeModule === "resource" && <ResourceLibrary onNavigate={setActiveModule} />}
        {activeModule === "thoth" && <ComingSoon name="Thoth 智汇" slogan="AI 驱动的教学资源聚合与智能推荐中心" />}
        {activeModule === "eduhub" && <ComingSoon name="eduhub 云枢" slogan="区域教育数据互通与协同治理平台" />}
      </div>

      {/* ─── 全局授课/回顾入口（覆盖所有模块） ─── */}
      {teachConfirmId !== null && (
        <TeachConfirmModal
          cls={CLASS_DATA.find(c => c.id === teachConfirmId)!}
          onConfirm={confirmEnterTeaching}
          onCancel={() => setTeachConfirmId(null)}
        />
      )}
      {teachingId !== null && (() => {
        const cls = CLASS_DATA.find(c => c.id === teachingId);
        if (!cls) return null;
        return (
          <TeachingMode
            cls={cls}
            reviewMode={teachingCtx === "review"}
            onExitRequest={requestExitTeaching}
          />
        );
      })()}
      {showExitConfirm && (
        <TeachExitConfirmModal
          onCancel={() => setShowExitConfirm(false)}
          onSkipAnalysis={() => exitTeaching(false)}
          onExitAndGenerate={() => exitTeaching(true)}
        />
      )}
    </div>
  );
}

// ─── Global Breadcrumb ─────────────────────────────────────────────────────
function GlobalBreadcrumb({
  activeModule, onGoHome,
  sparkTab, sparkView,
  onGoSparkTab, onGoSparkDetail,
}: {
  activeModule: Module; onGoHome: () => void;
  sparkTab: SparkTab; sparkView: { type: "list" } | { type: "detail"; id: number; tab?: "package" | "analysis" };
  onGoSparkTab: (t: SparkTab) => void;
  onGoSparkDetail: (id: number) => void;
}) {
  // Each item: { label, action? | active }
  type Item = { label: string; action?: () => void; active?: boolean };
  const moduleLabels: Record<Module, string> = {
    dashboard: "工作台",
    myta: "MyTA 领教",
    sparkclass: "SparkClass 熠课",
    resource: "资源库",
    thoth: "Thoth 智汇",
    eduhub: "eduhub 云枢",
  };
  const sparkTabLabels: Record<SparkTab, string> = {
    classes: "我的课堂",
    homework: "我的作业",
    review: "我的课后",
  };

  const items: Item[] = [
    { label: "eduCore·知境", action: onGoHome },
    { label: moduleLabels[activeModule] },
  ];

  if (activeModule === "sparkclass") {
    // Tab is the 3rd level (e.g. 我的课堂)
    items.push({
      label: sparkTabLabels[sparkTab],
      action: sparkView.type !== "list" ? () => onGoSparkTab(sparkTab) : undefined,
    });
    // Detail 4th level（课后报告已并入详情胶囊下，不再单独成层）
    if (sparkView.type === "detail") {
      // For homework tab, display homework title
      if (sparkTab === "homework") {
        // The homework detail will have its own title from the module
        items.push({
          label: "作业详情",
          active: true,
        });
      } else {
        // For classes tab, display class title
        const cls = CLASS_DATA.find(c => c.id === sparkView.id);
        items.push({
          label: cls?.title ?? "课堂详情",
          active: true,
        });
      }
    }
  }

  return (
    <div style={{
      padding: `8px ${tk.spacingLg}`,
      borderBottom: `1px solid ${tk.borderHairline}`,
      background: tk.bgWhite,
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 12, color: tk.textSecondary,
      flexShrink: 0, minHeight: 36,
      flexWrap: "wrap",
    }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {i > 0 && <ChevronRight size={12} style={{ color: tk.textPlaceholder, flexShrink: 0 }} />}
          {it.action ? (
            <button
              onClick={it.action}
              style={{
                background: "none", border: "none", color: tk.textSecondary,
                cursor: "pointer", fontSize: 12, padding: 0,
                transition: "color 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = tk.textBrand)}
              onMouseLeave={e => (e.currentTarget.style.color = tk.textSecondary)}
            >{it.label}</button>
          ) : (
            <span style={{ color: tk.textPrimary, fontWeight: 600 }}>{it.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
