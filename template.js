/* =============================================================
   Release Email Template
   Produces the full HTML for an OrangeHRM release email,
   matching the structure of the original 8.1.1 template.
   ============================================================= */

(function (global) {
  'use strict';

  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Allow newlines in long blocks
  const escMulti = (s) => esc(s).replace(/\n/g, '<br>');

  // Plain placeholder data URI (1x1 transparent) used when no image is set
  const BLANK =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="100%" height="100%" fill="%23111a30"/><text x="50%" y="50%" fill="%2364728c" font-family="Inter,sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">Upload image</text></svg>'
    );
  const BLANK_ICON =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="58" height="58"><rect width="100%" height="100%" rx="14" fill="%23ff7b1d33"/><text x="50%" y="58%" fill="%23ff7b1d" font-family="Inter,sans-serif" font-size="22" font-weight="700" text-anchor="middle">▸</text></svg>'
    );

  // ---------- Version text style presets ----------
  // Each preset describes how the version number is colored.
  //   - solid: { kind: 'solid', color: '#hex' }
  //   - gradient: { kind: 'gradient', start, end, angle }
  // For gradients we emit both a solid `color:` (Outlook fallback) and the
  // CSS gradient with -webkit-text-fill-color: transparent so Gmail, Apple
  // Mail, and modern web clients show the gradient correctly.
  const VERSION_STYLES = {
    amber:    { kind: 'solid',    color: '#f59e0b', label: 'Amber' },
    orange:   { kind: 'solid',    color: '#ff6a00', label: 'Orange' },
    white:    { kind: 'solid',    color: '#ffffff', label: 'White' },
    red:      { kind: 'solid',    color: '#ef4444', label: 'Red' },
    pink:     { kind: 'solid',    color: '#ec4899', label: 'Pink' },
    purple:   { kind: 'solid',    color: '#a855f7', label: 'Purple' },
    blue:     { kind: 'solid',    color: '#3b82f6', label: 'Blue' },
    sky:      { kind: 'solid',    color: '#38bdf8', label: 'Sky' },
    mint:     { kind: 'solid',    color: '#34d399', label: 'Mint' },
    lime:     { kind: 'solid',    color: '#a3e635', label: 'Lime' },
    sunset:   { kind: 'gradient', start: '#f59e0b', end: '#ef4444', angle: 90,  label: 'Sunset'  },
    citrus:   { kind: 'gradient', start: '#fbbf24', end: '#f97316', angle: 90,  label: 'Citrus'  },
    aurora:   { kind: 'gradient', start: '#f59e0b', end: '#ec4899', angle: 90,  label: 'Aurora'  },
    ocean:    { kind: 'gradient', start: '#38bdf8', end: '#0ea5e9', angle: 90,  label: 'Ocean'   },
    teal:     { kind: 'gradient', start: '#34d399', end: '#0d9488', angle: 90,  label: 'Teal'    },
    violet:   { kind: 'gradient', start: '#a78bfa', end: '#ec4899', angle: 90,  label: 'Violet'  },
    royal:    { kind: 'gradient', start: '#818cf8', end: '#d946ef', angle: 90,  label: 'Royal'   },
    flame:    { kind: 'gradient', start: '#fb923c', end: '#dc2626', angle: 135, label: 'Flame'   },
    candy:    { kind: 'gradient', start: '#f472b6', end: '#a855f7', angle: 90,  label: 'Candy'   },
    lagoon:   { kind: 'gradient', start: '#22d3ee', end: '#3b82f6', angle: 90,  label: 'Lagoon'  },
    forest:   { kind: 'gradient', start: '#a3e635', end: '#15803d', angle: 90,  label: 'Forest'  },
    grape:    { kind: 'gradient', start: '#c084fc', end: '#6d28d9', angle: 90,  label: 'Grape'   },
    peach:    { kind: 'gradient', start: '#fdba74', end: '#fb7185', angle: 90,  label: 'Peach'   },
    steel:    { kind: 'gradient', start: '#cbd5e1', end: '#64748b', angle: 90,  label: 'Steel'   },
    gold:     { kind: 'gradient', start: '#fde68a', end: '#d97706', angle: 90,  label: 'Gold'    },
    neon:     { kind: 'gradient', start: '#34d399', end: '#38bdf8', angle: 90,  label: 'Neon'    },
    /* extra orange */
    ember:    { kind: 'gradient', start: '#fdba74', end: '#ea580c', angle: 90,  label: 'Ember'   },
    tangerine:{ kind: 'gradient', start: '#fb923c', end: '#f59e0b', angle: 90,  label: 'Tangerine' },
    apricot:  { kind: 'gradient', start: '#fed7aa', end: '#fb923c', angle: 90,  label: 'Apricot' },
    rust:     { kind: 'gradient', start: '#f97316', end: '#9a3412', angle: 90,  label: 'Rust'    },
    marigold: { kind: 'gradient', start: '#fbbf24', end: '#ea580c', angle: 135, label: 'Marigold' },
    /* extra green */
    emerald:  { kind: 'gradient', start: '#6ee7b7', end: '#059669', angle: 90,  label: 'Emerald' },
    jade:     { kind: 'gradient', start: '#5eead4', end: '#0f766e', angle: 90,  label: 'Jade'    },
    meadow:   { kind: 'gradient', start: '#bef264', end: '#16a34a', angle: 90,  label: 'Meadow'  },
    pine:     { kind: 'gradient', start: '#4ade80', end: '#14532d', angle: 135, label: 'Pine'    },
    sprout:   { kind: 'gradient', start: '#d9f99d', end: '#65a30d', angle: 90,  label: 'Sprout'  },
    /* extra yellow */
    sunbeam:  { kind: 'gradient', start: '#fef08a', end: '#facc15', angle: 90,  label: 'Sunbeam' },
    honey:    { kind: 'gradient', start: '#fde047', end: '#d97706', angle: 90,  label: 'Honey'   },
    lemon:    { kind: 'gradient', start: '#fef9c3', end: '#eab308', angle: 90,  label: 'Lemon'   },
    brass:    { kind: 'gradient', start: '#facc15', end: '#a16207', angle: 135, label: 'Brass'   },
    zest:     { kind: 'gradient', start: '#fde047', end: '#f97316', angle: 90,  label: 'Zest'    }
  };

  // Custom gradient supplied by the user. renderEmail() refreshes this from
  // state before any style lookup happens, so `getStyle('custom')` always
  // reflects the latest picker values.
  let CUSTOM_STYLE = { kind: 'gradient', start: '#f59e0b', end: '#ec4899', angle: 90, label: 'Custom' };

  function setCustomStyle(cfg) {
    if (!cfg) return;
    const kind = cfg.kind === 'solid' ? 'solid' : 'gradient';
    CUSTOM_STYLE = {
      kind,
      color: cfg.start || cfg.color || '#f59e0b',
      start: cfg.start || '#f59e0b',
      end:   cfg.end   || '#ec4899',
      angle: Number(cfg.angle) || 90,
      label: 'Custom'
    };
  }

  function getStyle(key) {
    if (key === 'custom') return CUSTOM_STYLE;
    return VERSION_STYLES[key] || null;
  }

  function versionInlineStyle(styleKey) {
    const s = getStyle(styleKey) || VERSION_STYLES.amber;
    if (s.kind === 'solid') {
      return `color:${s.color};`;
    }
    // gradient: order matters — set fallback color FIRST, then gradient.
    return (
      `color:${s.start};` +
      `background:linear-gradient(${s.angle}deg, ${s.start}, ${s.end});` +
      `-webkit-background-clip:text;background-clip:text;` +
      `-webkit-text-fill-color:transparent;`
    );
  }

  // ---------- Version text animation effects ----------
  // CSS keyframes only — modern web clients (Apple Mail, iOS Mail, Gmail iOS,
  // any browser preview) animate; Outlook & Gmail web/Android gracefully
  // show the final state.
  const VERSION_EFFECTS = {
    none: {
      label: 'None',
      keyframes: '',
      defaultLoop: false
    },
    pop: {
      label: 'Pop',
      keyframes:
        '0%{transform:scale(.3);opacity:0}' +
        '60%{transform:scale(1.12);opacity:1}' +
        '80%{transform:scale(.96)}' +
        '100%{transform:scale(1);opacity:1}',
      defaultLoop: false
    },
    fade: {
      label: 'Fade',
      keyframes:
        '0%{opacity:0}100%{opacity:1}',
      defaultLoop: false
    },
    'slide-up': {
      label: 'Slide',
      keyframes:
        '0%{transform:translateY(24px);opacity:0}' +
        '100%{transform:translateY(0);opacity:1}',
      defaultLoop: false
    },
    bounce: {
      label: 'Bounce',
      keyframes:
        '0%{transform:translateY(-30px);opacity:0}' +
        '55%{transform:translateY(10px);opacity:1}' +
        '75%{transform:translateY(-5px)}' +
        '100%{transform:translateY(0);opacity:1}',
      defaultLoop: false
    },
    glow: {
      label: 'Glow',
      keyframes:
        '0%,100%{filter:drop-shadow(0 0 0 currentColor)}' +
        '50%{filter:drop-shadow(0 0 12px currentColor)}',
      defaultLoop: true
    },
    wiggle: {
      label: 'Wiggle',
      keyframes:
        '0%,100%{transform:rotate(0)}' +
        '20%{transform:rotate(-4deg)}' +
        '40%{transform:rotate(4deg)}' +
        '60%{transform:rotate(-3deg)}' +
        '80%{transform:rotate(2deg)}',
      defaultLoop: true
    },
    pulse: {
      label: 'Pulse',
      keyframes:
        '0%,100%{transform:scale(1)}' +
        '50%{transform:scale(1.08)}',
      defaultLoop: true
    }
  };

  function versionEffectCss(d) {
    const key = d.versionEffect || 'none';
    if (key === 'none' || !VERSION_EFFECTS[key]) return { headStyle: '', spanInline: '' };
    const eff = VERSION_EFFECTS[key];
    const dur = Math.max(100, Math.min(8000, Number(d.versionDuration) || 800));
    const delay = Math.max(0, Math.min(5000, Number(d.versionDelay) || 0));
    const loop = d.versionLoop ? 'infinite' : '1';
    const headStyle = `
    @keyframes ohrm_ver_${key} { ${eff.keyframes} }
    .ohrm-ver { display: inline-block; transform-origin: center; will-change: transform, opacity, filter; }`;
    const spanInline =
      `animation: ohrm_ver_${key} ${dur}ms cubic-bezier(.2,.9,.3,1.2) ${delay}ms ${loop} both;`;
    return { headStyle, spanInline };
  }

  // Base CSS injected into every email's <head>. Holds the play-button
  // animation keyframes plus the copy-button tooltip rules.
  const EMAIL_BASE_CSS = `
    @keyframes ohrm_play_pulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.16); }
    }
    @keyframes ohrm_play_halo {
      0%   { transform: scale(1);   opacity: 0.55; }
      80%  { transform: scale(1.9); opacity: 0;    }
      100% { transform: scale(1.9); opacity: 0;    }
    }
    .oxd-copy-btn { position: relative; }
    .oxd-copy-btn::after {
      content: attr(data-tip);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 4px;
      font: 600 11px/1 'Inter', -apple-system, sans-serif;
      letter-spacing: 0.02em;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity .15s, transform .15s;
      z-index: 10;
    }
    .oxd-copy-btn::before {
      content: '';
      position: absolute;
      bottom: calc(100% + 1px);
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: #1f2937;
      opacity: 0;
      pointer-events: none;
      transition: opacity .15s;
    }
    .oxd-copy-btn:hover::after,
    .oxd-copy-btn:hover::before { opacity: 1; }
    .oxd-copy-btn[data-copied]::after {
      content: 'Copied!';
      background: #10b981;
      opacity: 1;
    }
    .oxd-copy-btn[data-copied]::before {
      border-top-color: #10b981;
      opacity: 1;
    }

    /* ---------- Mobile responsive (Apple Mail, iOS Mail, Gmail iOS) ----------
       Gmail strips <style> blocks on web, but iOS Mail, Apple Mail and most
       webmails respect this. On screens narrower than 620px we let the 600px
       inner table become fluid so it doesn't horizontally scroll, and force
       all interior tables to fill the parent so feature cards stop shrink-
       wrapping to their bullet count. */
    @media only screen and (max-width: 620px) {
      .ohrm-email { width: 100% !important; max-width: 100% !important; }
      .ohrm-email td.ohrm-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .ohrm-email .ohrm-card { width: 100% !important; }
      .ohrm-email .ohrm-btn-row td { padding-left: 16px !important; padding-right: 16px !important; }
      .ohrm-email .ohrm-btn { width: 100% !important; }
      .ohrm-email img.ohrm-fluid { width: 100% !important; height: auto !important; max-width: 100% !important; }
    }
  `;

  // Play-button icon. Generated as a PNG data URL via canvas so it survives
  // every email sanitiser, including Gmail's forward filter (SVG data URLs
  // sometimes get stripped on forward). Cached — same bytes every render.
  let PLAY_BUTTON_PNG_CACHE = null;
  function defaultVideoIconDataUrl() {
    if (PLAY_BUTTON_PNG_CACHE) return PLAY_BUTTON_PNG_CACHE;
    if (typeof document === 'undefined') return '';
    const size = 28;
    const dpr = 2;
    const c = document.createElement('canvas');
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    // White disc
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    // Dark triangle, nudged 1px right for optical centring
    ctx.fillStyle = '#050a1f';
    ctx.beginPath();
    ctx.moveTo(size / 2 - 4, size / 2 - 6);
    ctx.lineTo(size / 2 - 4, size / 2 + 6);
    ctx.lineTo(size / 2 + 7, size / 2);
    ctx.closePath();
    ctx.fill();
    PLAY_BUTTON_PNG_CACHE = c.toDataURL('image/png');
    return PLAY_BUTTON_PNG_CACHE;
  }

  function renderPlayButton(customSrc) {
    const src = customSrc || defaultVideoIconDataUrl();
    if (!src) return '';
    return (
      `<img src="${esc(src)}" width="24" height="24" alt="" ` +
      `style="display:inline-block;width:24px;height:24px;vertical-align:middle;margin-right:10px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">`
    );
  }

  // ---------- Section blocks ----------

  function renderHeader(d) {
    const titlePrefix = d.productName || 'ORANGEHRM';
    const versionText = d.version || '';
    const logoH = Math.max(20, Math.min(160, Number(d.logoHeight) || 60));
    const aspect = Number(d.logoAspect) > 0 ? Number(d.logoAspect) : 3.74;
    const logoW = Math.round(logoH * aspect);

    // Header wordmark: when we have a pre-rendered PNG (built in the generator
    // while Inter is loaded), embed it as an image so Gmail / Outlook can't
    // reflow it with their fallback fonts. The image is sized to keep the
    // visual height ~52px regardless of source resolution.
    const headerHtml = d.headerImage
      ? (() => {
          const srcW = Number(d.headerImageW) || 0;
          const srcH = Number(d.headerImageH) || 0;
          const displayH = 52;
          const displayW = srcW && srcH ? Math.round(srcW * (displayH / srcH)) : 0;
          const wAttr = displayW ? ` width="${displayW}"` : '';
          const wStyle = displayW ? `width:${displayW}px;` : '';
          return (
            `<img src="${esc(d.headerImage)}"${wAttr} height="${displayH}" alt="${esc(titlePrefix)} ${esc(versionText)}" ` +
            `style="display:inline-block;${wStyle}height:${displayH}px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">`
          );
        })()
      : `<h1 style="margin:0;font-size:48px;font-weight:800;color:#ffffff;letter-spacing:-0.04em;text-transform:uppercase;line-height:1.1;font-family:'Inter',sans-serif;">
        ${esc(titlePrefix)} <span class="ohrm-ver" style="${versionInlineStyle(d.versionStyle)}${versionEffectCss(d).spanInline}">${esc(versionText)}</span>
      </h1>`;

    return `
  <!-- Top Branding Area -->
  <tr><td style="text-align:center;padding:40px 40px 0px;">
    <div style="margin-bottom:0px;">
      <img src="${esc(d.logo || 'assets/orangehrm-logo-white.png')}" width="${logoW}" height="${logoH}" alt="${esc(titlePrefix)}" style="display:inline-block;height:${logoH}px;width:${logoW}px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
    </div>
    <div style="position:relative;z-index:20;padding-top:8px;">
      ${headerHtml}
      <p style="margin:4px 0 0 0;font-size:18px;color:#cbd5e1;font-weight:400;font-family:'Inter',sans-serif;">${esc(d.tagline || '')}</p>
    </div>
  </td></tr>

  <!-- Hero Image -->
  <tr><td align="center" width="600" style="line-height:0;padding:0;width:600px;font-size:0;">
    <img src="${esc(d.heroImage || BLANK)}" width="600" alt="" style="display:block;width:600px;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
  </td></tr>`;
  }

  function renderSectionHeader(eyebrow, title, subtitle, withRule, versionStyle) {
    const eyebrowStyle = versionInlineStyle(versionStyle);
    return `
  <tr><td style="background-color:#050a1f;text-align:center;padding:32px 40px 16px;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;font-family:'Inter',sans-serif;${eyebrowStyle}">${esc(eyebrow)}</p>
    <h2 style="margin:8px 0 0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em;font-family:'Inter',sans-serif;">${esc(title)}</h2>
    ${withRule ? '<div style="height:2px;background:linear-gradient(90deg,transparent,#ff6a00,transparent);border-radius:2px;margin-top:10px;"></div>' : ''}
    ${subtitle ? `<p style="margin:12px 0 0;color:#cbd5e1;font-size:15px;line-height:1.6;font-weight:400;font-family:'Inter',sans-serif;">${escMulti(subtitle)}</p>` : ''}
  </td></tr>`;
  }

  function renderFeatureModule(mod, iconSize) {
    const sz = Math.max(16, Math.min(60, Number(iconSize) || 32));
    const radius = Math.max(4, Math.round(sz / 4));
    const bulletPad = sz + 10;

    const renderSubItems = (subs) => {
      const sub = (subs || []).filter((s) => (s || '').trim().length > 0);
      if (sub.length === 0) return '';
      const rows = sub
        .map(
          (s) => `
              <tr>
                <td valign="top" style="padding:0 8px 0 0;width:10px;">
                  <span style="color:#94a3b8;font-size:16px;line-height:1.4;">&#9702;</span>
                </td>
                <td valign="top" style="padding:0 0 4px 0;">
                  <span style="color:#cbd5e1;font-size:14px;line-height:1.4;font-weight:400;font-family:'Inter',sans-serif;">${esc(s)}</span>
                </td>
              </tr>`
        )
        .join('');
      return `
            <table cellpadding="0" cellspacing="0" style="margin-top:6px;margin-left:6px;">${rows}</table>`;
    };

    const items = (mod.items || [])
      .filter((it) => {
        if (typeof it === 'string') return it.trim().length > 0;
        return it && (it.text || '').trim().length > 0;
      })
      .map((it) => {
        const text = typeof it === 'string' ? it : it.text;
        const subBlock = typeof it === 'object' ? renderSubItems(it.sub) : '';
        return `
          <tr>
            <td valign="top" style="padding:0 8px 0 0;width:12px;">
              <span style="color:#ffffff;font-size:18px;line-height:1.4;">&#8226;</span>
            </td>
            <td valign="top" style="padding:0 0 6px 0;">
              <span style="color:#ffffff;font-size:15px;line-height:1.4;font-weight:400;font-family:'Inter',sans-serif;">${esc(text)}</span>${subBlock}
            </td>
          </tr>`;
      })
      .join('');

    return `
      <tr><td class="ohrm-pad" style="padding:0 40px 16px 40px;">
        <table class="ohrm-card" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:rgba(13,17,33,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:24px;border-collapse:separate;table-layout:fixed;">
          <tr><td style="padding:20px 24px;">
            <!-- Module header: icon + name in a 2-cell table so Gmail/Outlook align them reliably -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;border-collapse:collapse;">
              <tr>
                <td valign="middle" width="${sz}" style="width:${sz}px;padding-right:12px;line-height:0;font-size:0;">
                  <img src="${esc(mod.icon || BLANK_ICON)}" width="${sz}" height="${sz}" alt="" style="display:block;width:${sz}px;height:${sz}px;border-radius:${radius}px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                </td>
                <td valign="middle" style="color:#ffffff;font-size:18px;font-weight:700;line-height:1.1;letter-spacing:-0.02em;font-family:'Inter',sans-serif;">
                  ${esc(mod.name || 'Module name')}
                </td>
              </tr>
            </table>
            <!-- Module bullets -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
              <tr><td style="padding-left:${bulletPad}px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">${items}</table>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </td></tr>`;
  }

  function renderFeaturesSection(d) {
    const modules = (d.features || []).map((m) => renderFeatureModule(m, d.iconSize)).join('');
    return `
  ${renderSectionHeader("WHAT'S NEW", 'Features', '', true, d.versionStyle).replace('padding:32px 40px 16px', 'padding:8px 40px 16px')}
  <tr><td style="background-color:#050a1f;padding:4px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;">${modules}</table>
  </td></tr>`;
  }

  function renderHighlightsSection(d) {
    const framed = d.highlightsFrame !== false;
    const src = esc(d.highlightsImage || BLANK);
    // Media area inside the frame: 600 container − 40px side padding ×2 = 520;
    // minus 2px border ×2 and 8px inner padding ×2 → 500px wide.
    const MEDIA_W = 500;
    // Height comes from the uploaded image's own aspect ratio (measured in the
    // generator), so the screen always fits the GIF exactly — no overflow, no
    // letterboxing — and Outlook gets explicit width+height attributes.
    const aspect = Number(d.highlightsAspect) > 0 ? Number(d.highlightsAspect) : 16 / 9;
    const MEDIA_H = Math.round(MEDIA_W / aspect);

    const media = framed
      ? `
  <tr><td align="center" class="ohrm-pad" style="padding:4px 40px 8px;background-color:#050a1f;">
    <table cellpadding="0" cellspacing="0" border="0" align="center" width="520" style="width:520px;max-width:520px;border-collapse:separate;border:2px solid #ffffff;border-radius:20px;background-color:#0b1326;">
      <tr><td align="center" height="${MEDIA_H}" style="padding:8px;line-height:0;font-size:0;height:${MEDIA_H}px;border-radius:20px;overflow:hidden;">
        <img src="${src}" width="${MEDIA_W}" height="${MEDIA_H}" alt="" class="ohrm-fluid" style="display:block;width:${MEDIA_W}px;max-width:100%;height:${MEDIA_H}px;max-height:${MEDIA_H}px;object-fit:contain;border:0;outline:none;text-decoration:none;border-radius:13px;-ms-interpolation-mode:bicubic;">
      </td></tr>
    </table>
  </td></tr>`
      : `
  <tr><td align="center" width="600" style="line-height:0;padding:0;width:600px;font-size:0;">
    <img src="${src}" width="600" alt="" class="ohrm-fluid" style="display:block;width:600px;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
  </td></tr>`;

    return `
  ${renderSectionHeader(d.highlightsEyebrow || 'HIGHLIGHTS', d.highlightsTitle || 'NEW FEATURE HIGHLIGHTS', d.highlightsDesc || '', false, d.versionStyle)}
  ${media}
  <tr><td align="center" style="padding:18px 40px 24px;background-color:#050a1f;">
    <!-- Outer pill: white-outlined rounded button, table-based for Gmail/Outlook reliability -->
    <table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;border:2px solid #ffffff;border-radius:50px;background-color:rgba(255,255,255,0.06);">
      <tr>
        <td align="center" valign="middle" style="padding:10px 22px;">
          <a href="${esc(d.highlightsVideoUrl || '#')}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;font-family:'Inter',sans-serif;display:inline-block;line-height:24px;">${renderPlayButton(d.videoIcon)}<span style="vertical-align:middle;">${esc(d.highlightsButtonText || 'Watch the Video')}</span></a>
        </td>
      </tr>
    </table>
  </td></tr>`;
  }

  function renderEnhancementsSection(d) {
    const sz = Math.max(16, Math.min(60, Number(d.iconSize) || 32));
    const radius = Math.max(4, Math.round(sz / 4));
    const rows = (d.enhancements || [])
      .filter((e) => (e.text || '').trim().length > 0)
      .map(
        (e) => `
          <tr>
            <td valign="top" style="padding:0 12px 12px 0;width:${sz}px;">
              <img src="${esc(e.icon || BLANK_ICON)}" width="${sz}" height="${sz}" alt="" style="display:block;width:${sz}px;height:${sz}px;border-radius:${radius}px;border:0;">
            </td>
            <td valign="middle" style="padding:0 0 12px 0;">
              <span style="font-size:15px;color:#cbd5e1;font-weight:400;font-family:'Inter',sans-serif;line-height:1.6;">${esc(e.text)}</span>
            </td>
          </tr>`
      )
      .join('');

    return `
  ${renderSectionHeader(d.enhancementsEyebrow || 'UPDATES', d.enhancementsTitle || 'Enhancements', '', false, d.versionStyle)}
  <tr><td style="padding:12px 40px 28px 40px;background-color:#050a1f;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(13,17,33,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:24px;">
      <tr><td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td></tr>
    </table>
  </td></tr>`;
  }

  // Copy icon used on PW values. Inline onclick uses navigator.clipboard
  // — works in the live preview and in clients that don't strip event
  // handlers (Apple Mail, iOS Mail). Gmail strips onclick → the button
  // becomes a visual affordance + the `user-select:all` on the value pill
  // lets users select-and-copy with one click.
  const COPY_ICON_SVG =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

  const COPY_ONCLICK =
    "var b=this;try{navigator.clipboard.writeText(b.getAttribute('data-pw')||'').then(function(){b.setAttribute('data-copied','1');b.style.color='#34d399';b.style.background='rgba(52,211,153,0.18)';b.style.borderColor='rgba(52,211,153,0.45)';setTimeout(function(){b.removeAttribute('data-copied');b.style.color='';b.style.background='';b.style.borderColor=''},1400)},function(){})}catch(e){}";

  function renderCopyButton(escapedValue) {
    return (
      `<button type="button" class="oxd-copy-btn" aria-label="Copy password" data-tip="Copy"` +
      ` data-pw="${escapedValue}" onclick="${COPY_ONCLICK}"` +
      ` style="display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;margin-left:6px;width:22px;height:22px;padding:0;border:1px solid rgba(255,255,255,0.18);border-radius:6px;background:rgba(255,255,255,0.06);color:#94a3b8;cursor:pointer;font:inherit;transition:color .15s,background .15s,border-color .15s;">` +
      COPY_ICON_SVG +
      `</button>`
    );
  }

  // ---- Hosted/credentials section ---------------------------------
  // We parse the user's free-form list of credential lines into structured
  // groups (account blocks + standalone notes) and render with a proper
  // 2-column label/value table so usernames and passwords line up cleanly.

  function parseHostedLines(lines) {
    const groups = [];
    let current = null;
    (lines || []).forEach((raw) => {
      const line = String(raw || '').trim();
      if (!line) return;

      // "Admin Account:" / "Sysadmin Account:" / etc — possibly with inline UN/PW
      const acctMatch = line.match(/^(.*?Account)\s*:\s*(.*)$/i);
      if (acctMatch) {
        current = { kind: 'account', name: acctMatch[1].trim(), username: '', password: '' };
        const rest = acctMatch[2] || '';
        const un = rest.match(/UN\s*:\s*(\S+)/i);
        const pw = rest.match(/PW\s*:\s*(\S+)/i);
        if (un) current.username = un[1];
        if (pw) current.password = pw[1];
        groups.push(current);
        return;
      }

      // Bare UN:/PW: line attaches to most-recent account block
      const unBare = line.match(/^UN\s*:\s*(\S.*)$/i);
      if (unBare && current && current.kind === 'account' && !current.username) {
        current.username = unBare[1].trim();
        return;
      }
      const pwBare = line.match(/^PW\s*:\s*(\S.*)$/i);
      if (pwBare && current && current.kind === 'account' && !current.password) {
        current.password = pwBare[1].trim();
        return;
      }

      // Otherwise it's a standalone note (may contain inline UN/PW)
      const un = line.match(/UN\s*:\s*(\S+)/i);
      const pw = line.match(/PW\s*:\s*(\S+)/i);
      const prose = line
        .replace(/\bUN\s*:\s*\S+/gi, '')
        .replace(/\bPW\s*:\s*\S+/gi, '')
        .replace(/[:\s,;.]+$/, '')
        .trim();
      groups.push({
        kind: 'note',
        text: prose,
        username: un ? un[1] : '',
        password: pw ? pw[1] : ''
      });
      current = null;
    });
    return groups;
  }

  // Derive a soft "value" color from the selected version style so the
  // credential values feel like part of the same palette without screaming.
  function valueColorFor(styleKey) {
    const s = getStyle(styleKey) || VERSION_STYLES.amber;
    const base = s.kind === 'gradient' ? s.start : s.color;
    return lightenHex(base, 0.45);
  }

  // Mix a hex color toward white. `amount` 0-1.
  function lightenHex(hex, amount) {
    const h = String(hex).replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    const r = Math.round(((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * amount);
    const g = Math.round(((n >> 8)  & 0xff) + (255 - ((n >> 8)  & 0xff)) * amount);
    const b = Math.round((n & 0xff)         + (255 - (n & 0xff))         * amount);
    const toHex = (v) => v.toString(16).padStart(2, '0');
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function renderCredValue(value, styleKey) {
    const color = valueColorFor(styleKey);
    return (
      `<span style="display:inline-block;font-family:'SF Mono',Menlo,Monaco,Consolas,'Courier New',monospace;` +
      `font-size:14px;color:${color};letter-spacing:0.4px;user-select:all;word-break:break-all;">${esc(value)}</span>`
    );
  }

  const HOSTED_LABEL_STYLE =
    `color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;` +
    `padding-right:18px;width:88px;vertical-align:middle;font-family:'Inter',sans-serif;`;

  function renderAccountBlock(g, isLast, styleKey) {
    // 2-column layout: username on the left, password on the right.
    // Falls back to a single column if only one of them is present.
    const hasU = !!g.username;
    const hasP = !!g.password;

    const cellLabel =
      `color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.08em;` +
      `text-transform:uppercase;font-family:'Inter',sans-serif;padding-bottom:4px;`;
    const cellValue = `padding-right:18px;`;

    let columns = '';
    if (hasU && hasP) {
      columns =
        `<table cellpadding="0" cellspacing="0" border="0" width="100%">` +
          `<tr>` +
            `<td valign="top" width="50%" style="width:50%;padding-right:14px;">` +
              `<div style="${cellLabel}">Username</div>` +
              renderCredValue(g.username, styleKey) +
            `</td>` +
            `<td valign="top" width="50%" style="width:50%;padding-left:14px;border-left:1px solid rgba(255,255,255,0.08);">` +
              `<div style="${cellLabel}">Password</div>` +
              renderCredValue(g.password, styleKey) +
            `</td>` +
          `</tr>` +
        `</table>`;
    } else if (hasU || hasP) {
      columns =
        `<div style="${cellLabel}">${hasU ? 'Username' : 'Password'}</div>` +
        renderCredValue(hasU ? g.username : g.password, styleKey);
    }

    const divider = isLast
      ? ''
      : `<div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);font-size:0;line-height:0;">&nbsp;</div>`;

    return (
      `<div style="margin-top:14px;">` +
        `<div style="padding-bottom:10px;color:#ffffff;font-size:13px;font-weight:700;` +
          `letter-spacing:0.08em;text-transform:uppercase;font-family:'Inter',sans-serif;">${esc(g.name)}</div>` +
        columns +
      `</div>` +
      divider
    );
  }

  function renderNoteBlock(g, styleKey) {
    const valueLabel = g.password ? 'Password' : g.username ? 'Username' : '';
    const value = g.password || g.username || '';
    const cellLabel =
      `color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:0.08em;` +
      `text-transform:uppercase;font-family:'Inter',sans-serif;padding-bottom:4px;`;
    return (
      `<div style="margin-top:14px;">` +
        (g.text
          ? `<div style="padding-bottom:8px;color:#cbd5e1;font-size:13px;line-height:1.6;font-family:'Inter',sans-serif;">${esc(g.text)}</div>`
          : '') +
        (value
          ? `<div style="${cellLabel}">${valueLabel}</div>` + renderCredValue(value, styleKey)
          : '') +
      `</div>`
    );
  }

  function renderHostedSection(d) {
    if (!d.hostedEnabled) return '';

    const groups = parseHostedLines(d.hostedLines || []);
    const styleKey = d.versionStyle || 'amber';
    const bodyHtml = groups
      .map((g, i) => {
        const isLast = i === groups.length - 1;
        return g.kind === 'account'
          ? renderAccountBlock(g, isLast, styleKey)
          : renderNoteBlock(g, styleKey);
      })
      .join('');

    const urlColor = valueColorFor(styleKey);
    const urlBlock = d.hostedUrl
      ? `<table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="${HOSTED_LABEL_STYLE}">URL</td>
            <td valign="middle"><a href="${esc(d.hostedUrl)}" style="color:${urlColor};font-size:14px;font-weight:600;text-decoration:none;font-family:'SF Mono',Menlo,Monaco,monospace;letter-spacing:0.2px;word-break:break-all;">${esc(d.hostedUrl)}</a></td>
          </tr>
        </table>`
      : '';

    return `
  ${renderSectionHeader(d.hostedEyebrow || 'TRY IT NOW', d.hostedTitle || 'Hosted Environment', d.hostedDesc || '', false, d.versionStyle)}
  ${d.hostedImage ? `<tr><td align="center" width="600" style="line-height:0;padding:0;width:600px;font-size:0;"><img src="${esc(d.hostedImage)}" width="600" alt="" style="display:block;width:600px;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></td></tr>` : ''}
  <tr><td style="background-color:#050a1f;padding:8px 40px 24px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:rgba(13,17,33,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:14px;">
      <tr><td style="padding:18px 22px 22px;">
        ${urlBlock}
        ${groups.length && d.hostedUrl ? `<div style="margin-top:14px;font-size:0;line-height:0;border-top:1px solid rgba(255,255,255,0.08);">&nbsp;</div>` : ''}
        ${bodyHtml}
      </td></tr>
    </table>
  </td></tr>`;
  }

  function renderDemoSection(d) {
    if (!d.demoEnabled) return '';
    const buttons = (d.demoButtons || [])
      .filter((b) => (b.label || '').trim().length > 0)
      .map(
        (b) => `
    <tr class="ohrm-btn-row"><td align="center" style="padding:8px 40px;">
      <table class="ohrm-btn" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="width:100%;border-collapse:separate;table-layout:fixed;">
        <tr>
          <td align="center" valign="middle" style="border:2px solid #ffffff;border-radius:50px;background:rgba(255,255,255,0.06);padding:0;">
            <a href="${esc(b.url || '#')}" style="display:block;padding:12px 18px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;text-align:center;font-family:'Inter',sans-serif;">${esc(b.label)}</a>
          </td>
        </tr>
      </table>
    </td></tr>`
      )
      .join('');

    return `
  <tr><td style="background-color:#050a1f;text-align:center;padding:32px 40px 12px;">
    <h2 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.02em;white-space:pre-line;font-family:'Inter',sans-serif;">${escMulti(d.demoTitle || 'Stakeholder Demo')}</h2>
  </td></tr>
  ${d.demoImage ? `<tr><td align="center" width="600" style="line-height:0;padding:0;width:600px;font-size:0;"><img src="${esc(d.demoImage)}" width="600" alt="" style="display:block;width:600px;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;"></td></tr>` : ''}
  <tr><td style="background-color:#050a1f;padding:8px 0 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;">${buttons}</table>
  </td></tr>`;
  }

  function renderFooter(d) {
    if (!d.footerText) return '';
    let styleKey = d.footerStyle || 'match';
    if (styleKey === 'match') styleKey = d.versionStyle || 'sunset';

    if (styleKey === 'none') {
      return `
  <tr><td style="background:#050a1f;border-top:1px solid rgba(255,255,255,0.1);text-align:center;padding:22px 40px;">
    <p style="margin:0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:600;font-family:'Inter',sans-serif;">${esc(d.footerText)}</p>
  </td></tr>`;
    }

    const s = getStyle(styleKey) || VERSION_STYLES.sunset;
    // Use the EXACT picked colours. Previously these were flattened to a very
    // low alpha over the dark container, which muddied every hue (Flame read
    // as brown). Now the band is the real gradient, and the label flips to a
    // dark ink on light swatches so it stays legible.
    const start = s.kind === 'gradient' ? s.start : s.color;
    const end   = s.kind === 'gradient' ? s.end   : s.color;
    const angle = s.kind === 'gradient' ? (s.angle || 90) : 90;
    const bg = s.kind === 'gradient'
      ? `linear-gradient(${angle}deg, ${start}, ${end})`
      : start;
    const ink = isLightColor(start) && isLightColor(end) ? '#0b1020' : '#ffffff';

    return `
  <tr><td bgcolor="${end}" style="background-color:${end};background:${bg};border-top:1px solid rgba(255,255,255,0.12);text-align:center;padding:22px 40px;">
    <p style="margin:0;color:${ink};font-size:14px;font-weight:700;letter-spacing:0.01em;font-family:'Inter',sans-serif;">${esc(d.footerText)}</p>
  </td></tr>`;
  }

  // Relative luminance test so footer text stays readable on pale gradients.
  function isLightColor(hex) {
    const h = String(hex).replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 165;
  }

  // Tiny hex → rgba helper for footer gradient softening
  function hexToRgba(hex, alpha) {
    const h = String(hex).replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ---------- Top-level render ----------

  function renderEmail(d) {
    setCustomStyle(d.customGradient);
    const fx = versionEffectCss(d);
    const styleBlock = `<style>${EMAIL_BASE_CSS}${fx.headStyle}</style>`;
    const pageBg = d.pageBg || '#E5E9F0';
    const pagePadding = d.pagePadding == null ? 24 : Math.max(0, Math.min(80, Number(d.pagePadding)));
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.documentTitle || (d.productName + ' ' + d.version + ' Release'))}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
${styleBlock}
</head>
<body style="margin:0;padding:0;background-color:${pageBg};" bgcolor="${pageBg}">
<!-- 100% wrapper (light page background) -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${pageBg}" style="background-color:${pageBg};border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">
<tr><td align="center" style="padding:${pagePadding}px 0;">
<!--[if mso | IE]>
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" width="600"><tr><td>
<![endif]-->
<!-- 600px container - forced width keeps Gmail/Outlook layout identical to the preview -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="600" bgcolor="#050a1f" class="ohrm-email" style="width:600px;max-width:600px;margin:0 auto;background-color:#050a1f;border-collapse:collapse;table-layout:fixed;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
${renderHeader(d)}
${renderFeaturesSection(d)}
${renderHighlightsSection(d)}
${renderEnhancementsSection(d)}
${renderHostedSection(d)}
${renderDemoSection(d)}
${renderFooter(d)}
</table>
<!--[if mso | IE]>
</td></tr></table>
<![endif]-->
</td></tr>
</table>
</body>
</html>`;
  }

  global.ReleaseEmailTemplate = { render: renderEmail, BLANK, BLANK_ICON, VERSION_STYLES, VERSION_EFFECTS, setCustomStyle, getStyle };
})(window);
