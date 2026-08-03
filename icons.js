/* =============================================================
   Icon library + picker
   --------------------------------------------------------------
   A curated set of HR-relevant line icons (Lucide-style) rendered
   onto colored gradient tiles. The picker returns a PNG data URL
   so the email is portable across all mail clients.
   ============================================================= */

(function (global) {
  'use strict';

  // ───────────────────────────────────────────────────────────
  // ICON LIBRARY — each icon is a snippet of SVG drawn at 24×24
  // with stroke="currentColor". We re-emit it inside our tile.
  // ───────────────────────────────────────────────────────────
  const ICONS = [
    // People & Team
    { name: 'users',           cat: 'People',  kw: 'team people staff employees',  svg: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { name: 'user',            cat: 'People',  kw: 'profile person employee',      svg: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
    { name: 'user-plus',       cat: 'People',  kw: 'add hire onboard',             svg: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>' },
    { name: 'user-check',      cat: 'People',  kw: 'approved verified',            svg: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>' },
    { name: 'user-cog',        cat: 'People',  kw: 'admin role permission',        svg: '<circle cx="9" cy="7" r="4"/><path d="M1 21v-2a4 4 0 0 1 4-4h4"/><circle cx="18" cy="15" r="3"/><path d="M18 11v1"/><path d="M18 18v1"/><path d="M14.5 13.5l.7.7"/><path d="M20.8 16.8l.7.7"/><path d="M14.5 16.5l.7-.7"/><path d="M20.8 13.2l.7-.7"/>' },
    { name: 'briefcase',       cat: 'People',  kw: 'job work career',              svg: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
    { name: 'building',        cat: 'People',  kw: 'company office org',           svg: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>' },
    { name: 'id-card',         cat: 'People',  kw: 'identity badge',               svg: '<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M5 18a4 4 0 0 1 8 0"/><line x1="15" y1="10" x2="19" y2="10"/><line x1="15" y1="14" x2="19" y2="14"/>' },

    // Time & Attendance
    { name: 'clock',           cat: 'Time',    kw: 'time hours attendance',        svg: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
    { name: 'timer',           cat: 'Time',    kw: 'stopwatch duration',           svg: '<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/>' },
    { name: 'calendar',        cat: 'Time',    kw: 'schedule date leave',          svg: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
    { name: 'calendar-check',  cat: 'Time',    kw: 'approve done leave',           svg: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>' },
    { name: 'alarm-clock',     cat: 'Time',    kw: 'alarm reminder shift',         svg: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6 19l-2 2"/><path d="m18 19 2 2"/>' },
    { name: 'hourglass',       cat: 'Time',    kw: 'wait pending duration',        svg: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>' },
    { name: 'sun',             cat: 'Time',    kw: 'morning day shift',            svg: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>' },
    { name: 'moon',            cat: 'Time',    kw: 'night shift evening',          svg: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' },

    // Performance & Goals
    { name: 'trending-up',     cat: 'Performance', kw: 'growth performance kpi',   svg: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' },
    { name: 'target',          cat: 'Performance', kw: 'goal objective okr',       svg: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' },
    { name: 'award',           cat: 'Performance', kw: 'reward badge recognition', svg: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>' },
    { name: 'trophy',          cat: 'Performance', kw: 'winner award',             svg: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>' },
    { name: 'star',            cat: 'Performance', kw: 'favorite rating review',   svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
    { name: 'medal',           cat: 'Performance', kw: 'recognition award',        svg: '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>' },
    { name: 'flag',            cat: 'Performance', kw: 'milestone goal',           svg: '<path d="M4 22V4a1 1 0 0 1 1-1h14a1 1 0 0 1 .77 1.64L16 9l3.77 4.36A1 1 0 0 1 19 15H5"/>' },
    { name: 'rocket',          cat: 'Performance', kw: 'launch boost growth',      svg: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>' },
    { name: 'gauge',           cat: 'Performance', kw: 'speed measure dashboard',  svg: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>' },
    { name: 'zap',             cat: 'Performance', kw: 'energy fast power',        svg: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },

    // Reports & Analytics
    { name: 'bar-chart',       cat: 'Reports', kw: 'analytics chart graph',        svg: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>' },
    { name: 'pie-chart',       cat: 'Reports', kw: 'analytics breakdown',          svg: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>' },
    { name: 'line-chart',      cat: 'Reports', kw: 'analytics trend',              svg: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>' },
    { name: 'activity',        cat: 'Reports', kw: 'pulse activity health',        svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
    { name: 'layout-grid',     cat: 'Reports', kw: 'dashboard view',               svg: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>' },
    { name: 'table',           cat: 'Reports', kw: 'data grid spreadsheet',        svg: '<rect width="18" height="18" x="3" y="3" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>' },
    { name: 'file-text',       cat: 'Reports', kw: 'document report file',         svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>' },

    // Money & Payroll
    { name: 'dollar-sign',     cat: 'Money',   kw: 'pay salary payroll',           svg: '<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { name: 'banknote',        cat: 'Money',   kw: 'pay cash salary',              svg: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>' },
    { name: 'wallet',          cat: 'Money',   kw: 'expense wallet',               svg: '<path d="M20 12V8a2 2 0 0 0-2-2H4a2 2 0 0 0 0 4h17a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V6"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>' },
    { name: 'credit-card',     cat: 'Money',   kw: 'card pay expense',             svg: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>' },
    { name: 'receipt',         cat: 'Money',   kw: 'expense bill claim',           svg: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>' },
    { name: 'calculator',      cat: 'Money',   kw: 'pay tax calculation',          svg: '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>' },
    { name: 'percent',         cat: 'Money',   kw: 'tax discount rate',            svg: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>' },

    // Tools & Settings
    { name: 'settings',        cat: 'Tools',   kw: 'config setup gear',            svg: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>' },
    { name: 'sliders',         cat: 'Tools',   kw: 'config options filter',        svg: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>' },
    { name: 'wrench',          cat: 'Tools',   kw: 'fix tools maintenance',        svg: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>' },
    { name: 'layers',          cat: 'Tools',   kw: 'stack levels groups',          svg: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' },
    { name: 'package',         cat: 'Tools',   kw: 'module bundle release',        svg: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>' },
    { name: 'blocks',          cat: 'Tools',   kw: 'modules builder app',          svg: '<rect width="7" height="7" x="14" y="3" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/>' },
    { name: 'puzzle',          cat: 'Tools',   kw: 'integration extension',        svg: '<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>' },
    { name: 'plug',            cat: 'Tools',   kw: 'connector integration api',    svg: '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>' },
    { name: 'database',        cat: 'Tools',   kw: 'data storage schema',          svg: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>' },

    // Communication
    { name: 'mail',            cat: 'Comm',    kw: 'email message notify',         svg: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>' },
    { name: 'message-square',  cat: 'Comm',    kw: 'chat comment feedback',        svg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
    { name: 'bell',            cat: 'Comm',    kw: 'notify alert reminder',        svg: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>' },
    { name: 'megaphone',       cat: 'Comm',    kw: 'announce broadcast',           svg: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>' },

    // Security & Admin
    { name: 'shield',          cat: 'Security', kw: 'security protection',         svg: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>' },
    { name: 'lock',            cat: 'Security', kw: 'security private password',   svg: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },
    { name: 'key',             cat: 'Security', kw: 'password access auth',        svg: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>' },
    { name: 'eye',             cat: 'Security', kw: 'view visibility audit',       svg: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>' },
    { name: 'fingerprint',     cat: 'Security', kw: 'biometric identity',          svg: '<path d="M12 10v4"/><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M12 2a10 10 0 0 0-8 4"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 16h.01"/><path d="M21.8 12V8a10 10 0 0 0-3.5-7.65"/><path d="M9.5 8.5c0-1.7 1.5-3 3-3a2.93 2.93 0 0 1 3 3V12"/>' },

    // Other
    { name: 'globe',           cat: 'Other',   kw: 'location global region',       svg: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
    { name: 'map-pin',         cat: 'Other',   kw: 'location address',             svg: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>' },
    { name: 'link',            cat: 'Other',   kw: 'integration url connect',      svg: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>' },
    { name: 'sparkles',        cat: 'Other',   kw: 'ai new improvement',           svg: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>' },
    { name: 'brain',           cat: 'Other',   kw: 'ai intelligence training',     svg: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>' },
    { name: 'bot',             cat: 'Other',   kw: 'ai chatbot mcp assistant',     svg: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>' },
    { name: 'gift',            cat: 'Other',   kw: 'benefits perks reward',        svg: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>' },
    { name: 'heart',           cat: 'Other',   kw: 'wellbeing engagement',         svg: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>' },
    { name: 'lightbulb',       cat: 'Other',   kw: 'idea suggestion',              svg: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>' },
    { name: 'search',          cat: 'Other',   kw: 'find filter lookup',           svg: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>' }
  ];

  // ───────────────────────────────────────────────────────────
  // COLOR TILES — vivid gradients that match the dark email
  // ───────────────────────────────────────────────────────────
  const ICON_COLORS = [
    { name: 'orange',   start: '#fb923c', end: '#ea580c' },
    { name: 'amber',    start: '#fbbf24', end: '#d97706' },
    { name: 'rose',     start: '#fb7185', end: '#e11d48' },
    { name: 'fuchsia',  start: '#e879f9', end: '#a21caf' },
    { name: 'violet',   start: '#a78bfa', end: '#6d28d9' },
    { name: 'indigo',   start: '#818cf8', end: '#4338ca' },
    { name: 'sky',      start: '#38bdf8', end: '#0369a1' },
    { name: 'cyan',     start: '#22d3ee', end: '#0e7490' },
    { name: 'teal',     start: '#2dd4bf', end: '#0f766e' },
    { name: 'emerald',  start: '#34d399', end: '#047857' },
    { name: 'lime',     start: '#a3e635', end: '#4d7c0f' },
    { name: 'slate',    start: '#64748b', end: '#1e293b' }
  ];

  const DEFAULT_COLOR = 'indigo';

  function getIcon(name) {
    return ICONS.find((i) => i.name === name) || null;
  }
  function getColor(name) {
    return ICON_COLORS.find((c) => c.name === name) || ICON_COLORS[5];
  }

  // ───────────────────────────────────────────────────────────
  // Render an icon onto a size×size glass-style tile.
  //   • Gradient base fill (color.start → color.end)
  //   • Top-down white shine overlay for glossy highlight
  //   • Subtle white inner stroke for the glass edge
  //   • White line icon centered
  // ───────────────────────────────────────────────────────────
  function buildSvg(iconName, colorName, size) {
    size = size || 60;
    const icon = getIcon(iconName);
    const color = getColor(colorName);
    if (!icon) return '';
    const inset = Math.round(size * 0.22);
    const iconSize = size - inset * 2;
    const radius = Math.round(size * 0.26);
    const gradId = 'g_' + iconName + '_' + colorName;
    const shineId = 's_' + iconName + '_' + colorName;
    const innerRadius = Math.max(0, radius - 0.5);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color.start}"/>
      <stop offset="100%" stop-color="${color.end}"/>
    </linearGradient>
    <linearGradient id="${shineId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.42"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#${gradId})"/>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#${shineId})"/>
  <rect x="0.75" y="0.75" width="${size - 1.5}" height="${size - 1.5}" rx="${innerRadius}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="1.25"/>
  <g transform="translate(${inset}, ${inset}) scale(${iconSize / 24})" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${icon.svg}
  </g>
</svg>`;
  }

  // ───────────────────────────────────────────────────────────
  // Convert the SVG to a PNG data URL via canvas
  // ───────────────────────────────────────────────────────────
  function svgToPng(svgString, size) {
    return new Promise((resolve, reject) => {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const scale = 2; // retina-ish for crisp scaling in emails
        const canvas = document.createElement('canvas');
        canvas.width = size * scale;
        canvas.height = size * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size * scale, size * scale);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }

  async function buildPngDataUrl(iconName, colorName, size) {
    const svg = buildSvg(iconName, colorName, size || 60);
    return await svgToPng(svg, size || 60);
  }

  // ── SVG-based icon factory ──
  // For Gmail-friendly emails. Returns a `data:image/svg+xml,...` URL that is
  // ~12× smaller than the PNG equivalent. Modern clients (Gmail web,
  // Apple Mail, iOS Mail, Outlook 365) render it sharp at any DPI; older
  // Outlook desktop falls back to alt text. Per release email we save ~50KB
  // → keeps the message under Gmail's 102KB clip threshold.
  function buildSvgDataUrl(iconName, colorName, size) {
    const svg = buildSvg(iconName, colorName, size || 60);
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // ───────────────────────────────────────────────────────────
  // PICKER UI
  // ───────────────────────────────────────────────────────────
  function open(opts) {
    opts = opts || {};
    const previousIcon = opts.currentIconName || null;
    let chosenColor = opts.currentColorName || DEFAULT_COLOR;
    let chosenIcon = previousIcon;

    // Backdrop + modal
    const backdrop = document.createElement('div');
    backdrop.className = 'icon-picker-backdrop';

    const modal = document.createElement('div');
    modal.className = 'icon-picker-modal';

    modal.innerHTML = `
      <div class="picker-head">
        <div>
          <div class="picker-title">Choose an icon</div>
          <div class="picker-sub">Pick a tile color and an icon — the email will use a flat PNG</div>
        </div>
        <button class="picker-close" type="button" aria-label="Close">×</button>
      </div>

      <div class="picker-section">
        <div class="picker-section-label">Tile color</div>
        <div class="picker-colors" id="pkr-colors"></div>
      </div>

      <div class="picker-section">
        <div class="picker-section-label-row">
          <span class="picker-section-label">Icons</span>
          <input type="text" id="pkr-search" placeholder="Search icons…" class="picker-search">
        </div>
        <div class="picker-cats" id="pkr-cats"></div>
        <div class="picker-grid" id="pkr-grid"></div>
      </div>

      <div class="picker-footer">
        <div class="picker-preview-wrap">
          <span class="picker-section-label">Preview</span>
          <div class="picker-preview" id="pkr-preview"></div>
          <span id="pkr-preview-label" class="picker-preview-label">No icon selected</span>
        </div>
        <div class="picker-actions">
          <button class="btn btn-ghost" id="pkr-cancel" type="button">Cancel</button>
          <button class="btn btn-primary" id="pkr-apply" type="button" disabled>Use this icon</button>
        </div>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Color row
    const colorRow = modal.querySelector('#pkr-colors');
    ICON_COLORS.forEach((c) => {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'picker-color' + (c.name === chosenColor ? ' selected' : '');
      s.style.background = `linear-gradient(135deg, ${c.start}, ${c.end})`;
      s.title = c.name;
      s.addEventListener('click', () => {
        chosenColor = c.name;
        colorRow.querySelectorAll('.picker-color').forEach((el) => el.classList.remove('selected'));
        s.classList.add('selected');
        renderGrid();
        renderPreview();
      });
      colorRow.appendChild(s);
    });

    // Categories
    const cats = ['All', ...Array.from(new Set(ICONS.map((i) => i.cat)))];
    let activeCat = 'All';
    const catsRow = modal.querySelector('#pkr-cats');
    cats.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'picker-cat' + (c === 'All' ? ' active' : '');
      b.textContent = c;
      b.addEventListener('click', () => {
        activeCat = c;
        catsRow.querySelectorAll('.picker-cat').forEach((el) => el.classList.remove('active'));
        b.classList.add('active');
        renderGrid();
      });
      catsRow.appendChild(b);
    });

    // Search
    const search = modal.querySelector('#pkr-search');
    let query = '';
    search.addEventListener('input', () => {
      query = search.value.trim().toLowerCase();
      renderGrid();
    });

    const grid = modal.querySelector('#pkr-grid');
    function renderGrid() {
      grid.innerHTML = '';
      const items = ICONS.filter((i) => {
        if (activeCat !== 'All' && i.cat !== activeCat) return false;
        if (query && !(i.name.includes(query) || i.kw.toLowerCase().includes(query))) return false;
        return true;
      });
      if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'picker-empty';
        empty.textContent = 'No icons match';
        grid.appendChild(empty);
        return;
      }
      items.forEach((i) => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'picker-tile' + (i.name === chosenIcon ? ' selected' : '');
        tile.title = i.name.replace(/-/g, ' ');
        const svg = buildSvg(i.name, chosenColor, 40);
        tile.innerHTML =
          '<div class="picker-tile-img">' + svg + '</div>' +
          '<div class="picker-tile-name">' + i.name.replace(/-/g, ' ') + '</div>';
        tile.addEventListener('click', () => {
          chosenIcon = i.name;
          modal.querySelector('#pkr-apply').disabled = false;
          grid.querySelectorAll('.picker-tile').forEach((el) => el.classList.remove('selected'));
          tile.classList.add('selected');
          renderPreview();
        });
        grid.appendChild(tile);
      });
    }

    const preview = modal.querySelector('#pkr-preview');
    const previewLabel = modal.querySelector('#pkr-preview-label');
    function renderPreview() {
      if (!chosenIcon) {
        preview.innerHTML = '';
        previewLabel.textContent = 'No icon selected';
        return;
      }
      preview.innerHTML = buildSvg(chosenIcon, chosenColor, 56);
      previewLabel.textContent = chosenIcon.replace(/-/g, ' ') + ' · ' + chosenColor;
    }

    function close() {
      backdrop.remove();
    }

    modal.querySelector('.picker-close').addEventListener('click', close);
    modal.querySelector('#pkr-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close();
    });

    modal.querySelector('#pkr-apply').addEventListener('click', async () => {
      if (!chosenIcon) return;
      const dataUrl = await buildPngDataUrl(chosenIcon, chosenColor, 60);
      if (typeof opts.onSelect === 'function') {
        opts.onSelect({
          iconName: chosenIcon,
          colorName: chosenColor,
          dataUrl: dataUrl
        });
      }
      close();
    });

    renderGrid();
    renderPreview();
    setTimeout(() => search.focus(), 50);
  }

  global.IconLibrary = {
    open,
    getIcon,
    getColor,
    buildSvg,
    buildSvgDataUrl,
    buildPngDataUrl,
    ICONS,
    COLORS: ICON_COLORS,
    DEFAULT_COLOR
  };
})(window);
