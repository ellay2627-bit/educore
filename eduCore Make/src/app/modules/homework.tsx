import { useState, useEffect, useRef } from "react";
import {
  Plus, Search, ChevronDown, Clock, CheckCircle2, AlertCircle, TrendingUp,
  ClipboardList, Edit3, RotateCcw, ChevronRight, X, MessageSquare, 
  Zap, Brain, FileText, Calendar, Users
} from "lucide-react";

// ─── Design Tokens ─────────────────────────────────────────────────────────
const tk = {
  // Backgrounds
  bgPrimary: "var(--bg-primary)",
  bgSecondary: "var(--bg-secondary)",
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
  // State
  brandDefault: "var(--state-brand-default)",
  brandHover: "var(--state-brand-hover)",
  brandSubtle: "var(--state-brand-subtle)",
  brandFocus: "var(--state-brand-focus)",
  errorDefault: "var(--state-error-default)",
  successDefault: "var(--state-success-default)",
  warningDefault: "var(--state-warning-default)",
  infoDefault: "var(--state-info-default)",
  // Radius
  radiusXs: "var(--radius-xs)",
  radiusSm: "var(--radius-sm)",
  radiusMd: "var(--radius-md)",
  radiusLg: "var(--radius-lg)",
  radiusFull: "var(--radius-full)",
  // Spacing
  spacingXs: "var(--spacing-xs)",
  spacingMd: "var(--spacing-md)",
  spacingLg: "var(--spacing-lg)",
  spacingXl: "var(--spacing-xl)",
  // Shadow
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.1)",
};

// ─── Types ─────────────────────────────────────────────────────────────────
export type HomeworkStatus = "all" | "submitted" | "unsubmitted";
export type MarkStatus = "all" | "已批改" | "未批改" | "待提交" | "已打回";
export type ClassGrade = "高一(1)班" | "高一(2)班" | "高一(3)班" | "高一(4)班" | "all";

interface Homework {
  id: number;
  title: string;
  subject: string;
  submitted: string; // "28/35"
  submitTime: string;
  grade: ClassGrade;
  markStatus: "已批改" | "未批改" | "待提交" | "已打回";
  status: "submitted" | "unsubmitted";
  createdAt: string;
  dueDate: string;
  students: StudentSubmission[];
}

interface StudentSubmission {
  id: number;
  name: string;
  submitted: boolean;
  submitTime?: string;
  score?: number;
  feedback?: string;
  status: "已批改" | "未批改" | "待提交" | "已打回";
}

// ─── Mock Data ─────────────────────────────────────────────────────────────
const HOMEWORK_DATA: Homework[] = [
  {
    id: 1,
    title: "Unit 4 词汇速记作业",
    subject: "英语",
    submitted: "28/35",
    submitTime: "2026-06-18",
    grade: "高一(3)班",
    markStatus: "已批改",
    status: "submitted",
    createdAt: "2026-06-15",
    dueDate: "2026-06-18",
    students: [
      { id: 101, name: "学生1", submitted: true, submitTime: "2026-06-18 10:30", score: 95, status: "已批改" },
      { id: 102, name: "学生2", submitted: true, submitTime: "2026-06-18 09:45", score: 88, status: "已批改" },
      { id: 103, name: "学生3", submitted: false, status: "待提交" },
    ],
  },
  {
    id: 2,
    title: "Unit 3 旅行日记写作",
    subject: "英语",
    submitted: "32/35",
    submitTime: "2026-06-17",
    grade: "高一(2)班",
    markStatus: "未批改",
    status: "submitted",
    createdAt: "2026-06-14",
    dueDate: "2026-06-17",
    students: [
      { id: 201, name: "学生1", submitted: true, submitTime: "2026-06-17 14:20", status: "未批改" },
      { id: 202, name: "学生2", submitted: true, submitTime: "2026-06-17 13:15", status: "未批改" },
      { id: 203, name: "学生3", submitted: false, status: "待提交" },
    ],
  },
  {
    id: 3,
    title: "期末模拟阅读理解",
    subject: "英语",
    submitted: "10/35",
    submitTime: "—",
    grade: "高一(2)班",
    markStatus: "待提交",
    status: "unsubmitted",
    createdAt: "2026-06-18",
    dueDate: "2026-06-20",
    students: [],
  },
  {
    id: 4,
    title: "Unit 2 听力练习",
    subject: "英语",
    submitted: "35/35",
    submitTime: "2026-06-15",
    grade: "高一(3)班",
    markStatus: "已批改",
    status: "submitted",
    createdAt: "2026-06-12",
    dueDate: "2026-06-15",
    students: [],
  },
  {
    id: 5,
    title: "Unit 1 口语录音",
    subject: "英语",
    submitted: "30/35",
    submitTime: "2026-06-14",
    grade: "高一(1)班",
    markStatus: "已打回",
    status: "submitted",
    createdAt: "2026-06-10",
    dueDate: "2026-06-14",
    students: [],
  },
];

const MY_GRADES: ClassGrade[] = ["高一(1)班", "高一(2)班", "高一(3)班", "高一(4)班"];

// ─── Stat Card Component ───────────────────────────────────────────────────
function StatCard({ label, value, trend, icon: Icon }: {
  label: string;
  value: string;
  trend?: string;
  icon: React.ElementType;
}) {
  return (
    <div style={{
      background: tk.bgWhite,
      borderRadius: tk.radiusMd,
      border: `1px solid ${tk.borderHairline}`,
      boxShadow: tk.shadowSm,
      padding: tk.spacingMd,
      display: "flex",
      flexDirection: "column",
      gap: tk.spacingXs,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: tk.textSecondary }}>{label}</span>
        <Icon size={16} style={{ color: tk.brandDefault }} />
      </div>
      <span style={{ fontSize: 28, fontWeight: 600, color: tk.textPrimary, lineHeight: "36px" }}>
        {value}
      </span>
      {trend && <span style={{ fontSize: 12, color: tk.textSuccess }}>{trend}</span>}
    </div>
  );
}

// ─── Homework Statistics Panel ───────────────────────────────────────────────
export function HomeworkStatsPanel() {
  const totalHomework = HOMEWORK_DATA.length;
  const submittedCount = HOMEWORK_DATA.filter(h => h.status === "submitted").length;
  const completionRate = totalHomework > 0 ? Math.round((submittedCount / totalHomework) * 100) : 0;
  const passRate = totalHomework > 0 ? Math.round((HOMEWORK_DATA.filter(h => h.markStatus === "已批改").length / totalHomework) * 100) : 0;
  const returnRate = totalHomework > 0 ? Math.round((HOMEWORK_DATA.filter(h => h.markStatus === "已打回").length / totalHomework) * 100) : 0;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: tk.spacingMd,
    }}>
      <StatCard label="作业次数" value={totalHomework.toString()} icon={ClipboardList} />
      <StatCard
        label="作业完成率"
        value={`${completionRate}%`}
        trend="↑ 本学期"
        icon={TrendingUp}
      />
      <StatCard label="作业通过率" value={`${passRate}%`} icon={CheckCircle2} />
      <StatCard label="作业打回率" value={`${returnRate}%`} icon={AlertCircle} />
    </div>
  );
}

// ─── Homework List Main View ───────────────────────────────────────────────
export function HomeworkMainView({
  hwFilter,
  hwMarkFilter,
  onDetail,
  onCreateHomework,
}: {
  hwFilter: HomeworkStatus;
  hwMarkFilter: MarkStatus;
  onDetail?: (id: number) => void;
  onCreateHomework?: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState<HomeworkStatus>("all");
  const [gradeFilter, setGradeFilter] = useState<ClassGrade | "all">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredHomeworks = HOMEWORK_DATA
    .filter(h => statusFilter === "all" || h.status === statusFilter)
    .filter(h => gradeFilter === "all" || h.grade === gradeFilter)
    .filter(h => hwMarkFilter === "all" || h.markStatus === hwMarkFilter)
    .filter(h => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return h.title.toLowerCase().includes(q) || h.subject.toLowerCase().includes(q);
    });

  // Detect outside clicks for dropdowns
  useEffect(() => {
    if (!statusOpen && !gradeOpen && !timeOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-dropdown]")) {
        setStatusOpen(false);
        setGradeOpen(false);
        setTimeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [statusOpen, gradeOpen, timeOpen]);

  const getMarkStatusColor = (status: string) => {
    switch (status) {
      case "已批改":
        return tk.textSuccess;
      case "已打回":
        return tk.textError;
      case "待提交":
        return tk.textPlaceholder;
      case "未批改":
        return tk.textWarning;
      default:
        return tk.textSecondary;
    }
  };

  const cols = "2.5fr 1fr 1.2fr 1.2fr 1.2fr 1.5fr 1.2fr";
  const headers = ["作业名", "学科", "提交情况", "提交时间", "所属班级", "批改状态", "操作"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: tk.spacingMd, flexWrap: "wrap" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: tk.textPrimary }}>我的作业</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* ── Filters & Search ── */}
          <div
            style={{
              background: tk.bgWhite,
              borderRadius: tk.radiusMd,
              border: `1px solid ${tk.borderHairline}`,
              padding: tk.spacingMd,
              display: "flex",
              gap: tk.spacingMd,
              alignItems: "center",
              flexWrap: "wrap",
              rowGap: 8,
              minWidth: 0,
            }}
          >
        {/* Status Filter */}
        <div style={{ position: "relative" }} data-dropdown>
          <button
            onClick={() => {
              setStatusOpen(!statusOpen);
              setGradeOpen(false);
              setTimeOpen(false);
            }}
            style={{
              background: tk.bgWhite,
              border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusSm,
              padding: "6px 10px",
              fontSize: 12,
              color: statusFilter === "all" ? tk.textSecondary : tk.textPrimary,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              fontFamily: "var(--font-family)",
              transition: "all 0.12s",
            }}
          >
            {statusFilter === "all"
              ? "全部状态"
              : statusFilter === "submitted"
                ? "已提交"
                : "未提交"}
            <ChevronDown size={11} />
          </button>
          {statusOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                zIndex: 50,
                background: tk.bgWhite,
                border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm,
                boxShadow: tk.shadowMd,
                minWidth: 120,
              }}
            >
              {(["all", "submitted", "unsubmitted"] as HomeworkStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setStatusOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    border: "none",
                    background: statusFilter === s ? tk.bgPrimary : "transparent",
                    fontSize: 12,
                    color: tk.textPrimary,
                    cursor: "pointer",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  {s === "all" ? "全部状态" : s === "submitted" ? "已提交" : "未提交"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grade Filter */}
        <div style={{ position: "relative" }} data-dropdown>
          <button
            onClick={() => {
              setGradeOpen(!gradeOpen);
              setStatusOpen(false);
              setTimeOpen(false);
            }}
            style={{
              background: tk.bgWhite,
              border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusSm,
              padding: "6px 10px",
              fontSize: 12,
              color: gradeFilter === "all" ? tk.textSecondary : tk.textPrimary,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              fontFamily: "var(--font-family)",
              transition: "all 0.12s",
            }}
          >
            {gradeFilter === "all" ? "全部班级" : gradeFilter}
            <ChevronDown size={11} />
          </button>
          {gradeOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                zIndex: 50,
                background: tk.bgWhite,
                border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm,
                boxShadow: tk.shadowMd,
                minWidth: 140,
              }}
            >
              <button
                onClick={() => {
                  setGradeFilter("all");
                  setGradeOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 12px",
                  border: "none",
                  background: gradeFilter === "all" ? tk.bgPrimary : "transparent",
                  fontSize: 12,
                  color: tk.textPrimary,
                  cursor: "pointer",
                  fontFamily: "var(--font-family)",
                }}
              >
                全部班级
              </button>
              {MY_GRADES.map(g => (
                <button
                  key={g}
                  onClick={() => {
                    setGradeFilter(g);
                    setGradeOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    border: "none",
                    background: gradeFilter === g ? tk.bgPrimary : "transparent",
                    fontSize: 12,
                    color: tk.textPrimary,
                    cursor: "pointer",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time Filter */}
        <div style={{ position: "relative" }} data-dropdown>
          <button
            onClick={() => {
              setTimeOpen(!timeOpen);
              setStatusOpen(false);
              setGradeOpen(false);
            }}
            style={{
              background: tk.bgWhite,
              border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusSm,
              padding: "6px 10px",
              fontSize: 12,
              color: timeFilter === "all" ? tk.textSecondary : tk.textPrimary,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              fontFamily: "var(--font-family)",
              transition: "all 0.12s",
            }}
          >
            {timeFilter === "all"
              ? "全部时间"
              : timeFilter === "today"
                ? "今天"
                : timeFilter === "week"
                  ? "本周"
                  : timeFilter === "month"
                    ? "本月"
                    : "自定义"}
            <ChevronDown size={11} />
          </button>
          {timeOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                zIndex: 50,
                background: tk.bgWhite,
                border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm,
                boxShadow: tk.shadowMd,
                minWidth: 120,
              }}
            >
              {(["all", "today", "week", "month", "custom"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setTimeFilter(t);
                    setTimeOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    border: "none",
                    background: timeFilter === t ? tk.bgPrimary : "transparent",
                    fontSize: 12,
                    color: tk.textPrimary,
                    cursor: "pointer",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  {t === "all"
                    ? "全部时间"
                    : t === "today"
                      ? "今天"
                      : t === "week"
                        ? "本周"
                        : t === "month"
                          ? "本月"
                          : "自定义"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div
          style={{
            background: tk.bgPrimary,
            border: `1px solid ${tk.borderHairline}`,
            borderRadius: tk.radiusSm,
            padding: "5px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Search size={13} style={{ color: tk.textPlaceholder }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索作业…"
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 12,
              color: tk.textPrimary,
              fontFamily: "var(--font-family)",
              width: 100,
            }}
          />
        </div>

        {/* Create New */}
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: tk.brandDefault,
            color: tk.textReverse,
            border: "none",
            borderRadius: tk.radiusSm,
            fontSize: 12,
            fontWeight: 600,
            padding: "6px 12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "var(--font-family)",
            transition: "background 0.12s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = tk.brandHover)}
          onMouseLeave={e => (e.currentTarget.style.background = tk.brandDefault)}
        >
          <Plus size={13} /> 新建作业
        </button>
      </div>
    </div>
  </div>

      {/* ── Table ── */}
      <div
        style={{
          background: tk.bgWhite,
          borderRadius: tk.radiusMd,
          border: `1px solid ${tk.borderHairline}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: cols,
            background: tk.bgPrimary,
            borderBottom: `1px solid ${tk.borderHairline}`,
            padding: `10px ${tk.spacingMd}`,
          }}
        >
          {headers.map(h => (
            <span
              key={h}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: tk.textSecondary,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {h}
            </span>
          ))}
        </div>
        {filteredHomeworks.length === 0 ? (
          <div
            style={{
              padding: `${tk.spacingXl} ${tk.spacingLg}`,
              textAlign: "center",
              color: tk.textPlaceholder,
              fontSize: 12,
            }}
          >
            <ClipboardList size={20} style={{ color: tk.textPlaceholder, marginBottom: 6 }} />
            <div>暂无符合条件的作业</div>
          </div>
        ) : (
          filteredHomeworks.map((hw, i) => (
            <div
              key={hw.id}
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                padding: `12px ${tk.spacingMd}`,
                borderBottom:
                  i < filteredHomeworks.length - 1
                    ? `1px solid ${tk.borderHairline}`
                    : "none",
                alignItems: "center",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = tk.bgPrimary)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onClick={() => onDetail?.(hw.id)}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: tk.textPrimary,
                  cursor: "pointer",
                }}
              >
                {hw.title}
              </span>
              <span style={{ fontSize: 12, color: tk.textSecondary }}>{hw.subject}</span>
              <span style={{ fontSize: 12, color: tk.textPrimary }}>{hw.submitted}</span>
              <span style={{ fontSize: 12, color: tk.textSecondary }}>{hw.submitTime}</span>
              <span style={{ fontSize: 12, color: tk.textSecondary }}>{hw.grade}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: getMarkStatusColor(hw.markStatus),
                }}
              >
                {hw.markStatus}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDetail?.(hw.id);
                  }}
                  style={{
                    background: tk.bgWhite,
                    border: `1px solid ${tk.borderHairline}`,
                    borderRadius: tk.radiusSm,
                    padding: "6px 12px",
                    fontSize: 12,
                    color: tk.textPrimary,
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = tk.bgBrandSubtle;
                    e.currentTarget.style.color = tk.textBrand;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = tk.bgWhite;
                    e.currentTarget.style.color = tk.textPrimary;
                  }}
                >
                  批改
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDetail?.(hw.id);
                  }}
                  style={{
                    background: tk.bgWhite,
                    border: `1px solid ${tk.borderHairline}`,
                    borderRadius: tk.radiusSm,
                    padding: "6px 12px",
                    fontSize: 12,
                    color: tk.textError,
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = tk.bgErrorSubtle;
                    e.currentTarget.style.color = tk.textError;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = tk.bgWhite;
                    e.currentTarget.style.color = tk.textError;
                  }}
                >
                  打回
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateHomeworkModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

// ─── Create Homework Modal ──────────────────────────────────────────────────
function CreateHomeworkModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("英语");
  const [grade, setGrade] = useState<ClassGrade>("高一(1)班");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: tk.bgWhite,
          borderRadius: tk.radiusLg,
          width: "90%",
          maxWidth: 500,
          padding: tk.spacingLg,
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: tk.spacingMd,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: tk.textPrimary, margin: 0 }}>
            新建作业
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: tk.textPlaceholder,
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: tk.spacingMd }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, display: "block", marginBottom: 6 }}>
              作业名称 <span style={{ color: tk.textError }}>*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例：Unit 4 词汇速记"
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm,
                fontSize: 12,
                fontFamily: "var(--font-family)",
                outline: "none",
                color: tk.textPrimary,
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, display: "block", marginBottom: 6 }}>
              学科
            </label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm,
                fontSize: 12,
                fontFamily: "var(--font-family)",
                outline: "none",
                color: tk.textPrimary,
              }}
            >
              <option>英语</option>
              <option>数学</option>
              <option>语文</option>
            </select>
          </div>

          {/* Grade */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, display: "block", marginBottom: 6 }}>
              班级 <span style={{ color: tk.textError }}>*</span>
            </label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value as ClassGrade)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm,
                fontSize: 12,
                fontFamily: "var(--font-family)",
                outline: "none",
                color: tk.textPrimary,
              }}
            >
              {MY_GRADES.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, display: "block", marginBottom: 6 }}>
              截止日期
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm,
                fontSize: 12,
                fontFamily: "var(--font-family)",
                outline: "none",
                color: tk.textPrimary,
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary, display: "block", marginBottom: 6 }}>
              作业描述
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="输入作业描述（可选）"
              style={{
                width: "100%",
                padding: "8px 10px",
                border: `1px solid ${tk.borderHairline}`,
                borderRadius: tk.radiusSm,
                fontSize: 12,
                fontFamily: "var(--font-family)",
                outline: "none",
                color: tk.textPrimary,
                minHeight: 80,
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: tk.spacingMd,
            marginTop: tk.spacingLg,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: tk.bgPrimary,
              border: `1px solid ${tk.borderHairline}`,
              borderRadius: tk.radiusSm,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              color: tk.textSecondary,
              cursor: "pointer",
              fontFamily: "var(--font-family)",
              transition: "all 0.12s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = tk.borderBrand;
              e.currentTarget.style.color = tk.textBrand;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = tk.borderHairline;
              e.currentTarget.style.color = tk.textSecondary;
            }}
          >
            取消
          </button>
          <button
            onClick={onClose}
            style={{
              background: tk.brandDefault,
              border: "none",
              borderRadius: tk.radiusSm,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              color: tk.textReverse,
              cursor: "pointer",
              fontFamily: "var(--font-family)",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = tk.brandHover)}
            onMouseLeave={e => (e.currentTarget.style.background = tk.brandDefault)}
          >
            创建作业
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Homework Detail Page ───────────────────────────────────────────────────
export function HomeworkDetailPage({
  homeworkId,
  onBack,
}: {
  homeworkId: number;
  onBack: () => void;
}) {
  const homework = HOMEWORK_DATA.find(h => h.id === homeworkId);
  if (!homework) return null;

  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(
    homework.students[0] || null
  );
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [feedback, setFeedback] = useState(selectedStudent?.feedback || "");

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left Panel: Student List */}
      <div
        style={{
          width: 280,
          borderRight: `1px solid ${tk.borderHairline}`,
          background: tk.bgWhite,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: tk.spacingMd,
            borderBottom: `1px solid ${tk.borderHairline}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: tk.textPlaceholder,
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: tk.textSecondary }}>
              提交学生
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: tk.textPrimary }}>
              {homework.submitted}
            </div>
          </div>
        </div>

        {/* Student List */}
        <div style={{ flex: 1, overflowY: "auto", padding: `${tk.spacingMd} 0` }}>
          {homework.students.length === 0 ? (
            <div
              style={{
                padding: tk.spacingLg,
                textAlign: "center",
                color: tk.textPlaceholder,
                fontSize: 12,
              }}
            >
              暂无学生数据
            </div>
          ) : (
            homework.students.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                style={{
                  width: "100%",
                  background: selectedStudent?.id === student.id ? tk.bgBrandSubtle : "transparent",
                  border: "none",
                  borderLeft:
                    selectedStudent?.id === student.id
                      ? `3px solid ${tk.brandDefault}`
                      : "3px solid transparent",
                  padding: `10px ${tk.spacingMd}`,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
                onMouseEnter={e => {
                  if (selectedStudent?.id !== student.id) {
                    e.currentTarget.style.background = tk.bgPrimary;
                  }
                }}
                onMouseLeave={e => {
                  if (selectedStudent?.id !== student.id) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: tk.textPrimary }}>
                  {student.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: tk.textPlaceholder,
                    marginTop: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        student.status === "已批改"
                          ? tk.successDefault
                          : student.status === "已打回"
                            ? tk.errorDefault
                            : student.status === "待提交"
                              ? tk.textPlaceholder
                              : tk.warningDefault,
                    }}
                  />
                  {student.status}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Detail & Grading */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: tk.bgPrimary,
          overflow: "hidden",
        }}
      >
        {selectedStudent ? (
          <>
            {/* Info Header */}
            <div
              style={{
                padding: tk.spacingLg,
                borderBottom: `1px solid ${tk.borderHairline}`,
                background: tk.bgWhite,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tk.textPrimary }}>
                    {selectedStudent.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: tk.textSecondary,
                      marginTop: 4,
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <span>
                      {selectedStudent.submitted
                        ? `提交于 ${selectedStudent.submitTime}`
                        : "未提交"}
                    </span>
                    {selectedStudent.score !== undefined && (
                      <span>得分：{selectedStudent.score}</span>
                    )}
                  </div>
                </div>
                <div style={{ flex: 1 }} />
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: tk.radiusSm,
                    fontSize: 11,
                    fontWeight: 600,
                    background:
                      selectedStudent.status === "已批改"
                        ? tk.bgSuccessSubtle
                        : selectedStudent.status === "已打回"
                          ? tk.bgErrorSubtle
                          : selectedStudent.status === "待提交"
                            ? tk.bgPrimary
                            : tk.bgWarningSubtle,
                    color:
                      selectedStudent.status === "已批改"
                        ? tk.textSuccess
                        : selectedStudent.status === "已打回"
                          ? tk.textError
                          : selectedStudent.status === "待提交"
                            ? tk.textPlaceholder
                            : tk.textWarning,
                  }}
                >
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: tk.spacingLg,
                display: "flex",
                flexDirection: "column",
                gap: tk.spacingMd,
              }}
            >
              {/* Student Response */}
              <div
                style={{
                  background: tk.bgWhite,
                  borderRadius: tk.radiusMd,
                  border: `1px solid ${tk.borderHairline}`,
                  padding: tk.spacingMd,
                }}
              >
                <h3 style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: 10 }}>
                  学生作答
                </h3>
                <div
                  style={{
                    background: tk.bgPrimary,
                    borderRadius: tk.radiusSm,
                    padding: tk.spacingMd,
                    fontSize: 12,
                    color: tk.textSecondary,
                    minHeight: 100,
                  }}
                >
                  [学生作答内容会显示在这里]
                </div>
              </div>

              {/* Grading Section */}
              <div
                style={{
                  background: tk.bgWhite,
                  borderRadius: tk.radiusMd,
                  border: `1px solid ${tk.borderHairline}`,
                  padding: tk.spacingMd,
                }}
              >
                <h3 style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, marginBottom: 10 }}>
                  快捷评分
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[90, 80, 70, 60].map(score => (
                    <button
                      key={score}
                      style={{
                        background: selectedStudent.score === score ? tk.bgBrandSubtle : tk.bgPrimary,
                        border: `1px solid ${
                          selectedStudent.score === score ? tk.borderBrand : tk.borderHairline
                        }`,
                        borderRadius: tk.radiusSm,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                          selectedStudent.score === score ? tk.textBrand : tk.textSecondary,
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={e => {
                        if (selectedStudent.score !== score) {
                          e.currentTarget.style.borderColor = tk.borderBrand;
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedStudent.score !== score) {
                          e.currentTarget.style.borderColor = tk.borderHairline;
                        }
                      }}
                    >
                      {score}分
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div
                style={{
                  background: tk.bgWhite,
                  borderRadius: tk.radiusMd,
                  border: `1px solid ${tk.borderHairline}`,
                  padding: tk.spacingMd,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: tk.textPrimary, margin: 0 }}>
                    评语反馈
                  </h3>
                  <button
                    onClick={() => setShowAIFeedback(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: tk.textBrand,
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      padding: 0,
                    }}
                  >
                    <Brain size={13} /> AI 生成
                  </button>
                </div>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="输入针对性评语…"
                  style={{
                    width: "100%",
                    padding: tk.spacingMd,
                    border: `1px solid ${tk.borderHairline}`,
                    borderRadius: tk.radiusSm,
                    fontSize: 12,
                    fontFamily: "var(--font-family)",
                    outline: "none",
                    color: tk.textPrimary,
                    minHeight: 80,
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Action Bar */}
            <div
              style={{
                padding: tk.spacingLg,
                borderTop: `1px solid ${tk.borderHairline}`,
                background: tk.bgWhite,
                display: "flex",
                gap: tk.spacingMd,
                justifyContent: "flex-end",
              }}
            >
              <button
                style={{
                  background: tk.bgErrorSubtle,
                  color: tk.textError,
                  border: "none",
                  borderRadius: tk.radiusSm,
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-family)",
                  transition: "all 0.12s",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = tk.errorDefault;
                  e.currentTarget.style.color = tk.textReverse;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = tk.bgErrorSubtle;
                  e.currentTarget.style.color = tk.textError;
                }}
              >
                <RotateCcw size={13} /> 打回重做
              </button>
              <button
                style={{
                  background: tk.brandDefault,
                  color: tk.textReverse,
                  border: "none",
                  borderRadius: tk.radiusSm,
                  padding: "8px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-family)",
                  transition: "background 0.12s",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = tk.brandHover)}
                onMouseLeave={e => (e.currentTarget.style.background = tk.brandDefault)}
              >
                <CheckCircle2 size={13} /> 完成批改
              </button>
            </div>

            {/* AI Feedback Modal */}
            {showAIFeedback && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2000,
                }}
                onClick={() => setShowAIFeedback(false)}
              >
                <div
                  style={{
                    background: tk.bgWhite,
                    borderRadius: tk.radiusLg,
                    width: "90%",
                    maxWidth: 400,
                    padding: tk.spacingLg,
                    boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: tk.spacingMd,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: tk.textPrimary,
                        margin: 0,
                      }}
                    >
                      AI 生成评语
                    </h2>
                    <button
                      onClick={() => setShowAIFeedback(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: tk.textPlaceholder,
                        padding: 4,
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: tk.textSecondary,
                      marginBottom: tk.spacingMd,
                    }}
                  >
                    AI 正在生成针对性的评语模板...
                  </p>
                  <div
                    style={{
                      background: tk.bgPrimary,
                      borderRadius: tk.radiusSm,
                      padding: tk.spacingMd,
                      fontSize: 12,
                      color: tk.textSecondary,
                      minHeight: 80,
                      marginBottom: tk.spacingMd,
                    }}
                  >
                    这是一个很好的尝试。你理解了词汇的基本含义，但在应用到实际语境时还需要加强。建议多看相关的例句和用法。
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: tk.spacingMd,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => setShowAIFeedback(false)}
                      style={{
                        background: tk.bgPrimary,
                        border: `1px solid ${tk.borderHairline}`,
                        borderRadius: tk.radiusSm,
                        padding: "8px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: tk.textSecondary,
                        cursor: "pointer",
                        fontFamily: "var(--font-family)",
                      }}
                    >
                      取消
                    </button>
                    <button
                      onClick={() => {
                        setFeedback(
                          "这是一个很好的尝试。你理解了词汇的基本含义，但在应用到实际语境时还需要加强。建议多看相关的例句和用法。"
                        );
                        setShowAIFeedback(false);
                      }}
                      style={{
                        background: tk.brandDefault,
                        border: "none",
                        borderRadius: tk.radiusSm,
                        padding: "8px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: tk.textReverse,
                        cursor: "pointer",
                        fontFamily: "var(--font-family)",
                      }}
                    >
                      使用这个评语
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: tk.textPlaceholder,
              flexDirection: "column",
              gap: 8,
            }}
          >
            <ClipboardList size={32} style={{ opacity: 0.3 }} />
            <div style={{ fontSize: 12 }}>选择学生查看作答详情</div>
          </div>
        )}
      </div>
    </div>
  );
}
