/* =============================================================
   Release Email Generator — UI logic
   Manages form state, image uploads, repeatable lists, and the
   live preview iframe. Vanilla JS, no framework.
   ============================================================= */

(function () {
  'use strict';

  // ---------- Default state (matches a real release email) ----------
  const DEFAULT_STATE = {
    productName: 'ORANGEHRM',
    version: '8.1.1',
    tagline: 'Is Out As a Stable Version',
    logo: 'assets/orangehrm-logo-white.png',
    logoHeight: 60,
    logoAspect: 3.74,
    versionStyle: 'amber',
    customGradient: { kind: 'gradient', start: '#f59e0b', end: '#ec4899', angle: 90 },
    versionEffect: 'pop',
    versionDuration: 900,
    versionDelay: 200,
    versionLoop: false,
    iconSize: 32,
    footerStyle: 'match',
    pageBg: '#E5E9F0',
    pagePadding: 24,
    videoIcon: '',
    videoIconRef: null,
    heroImage: '',

    features: [
      {
        name: 'App Builder',
        icon: '',
        iconRef: { iconName: 'blocks', colorName: 'violet' },
        items: ['Data Group Permissions for App Builder']
      },
      {
        name: 'Attendance',
        icon: '',
        iconRef: { iconName: 'clock', colorName: 'amber' },
        items: [
          'Display an Edited Icon for Modified Attendance Records',
          'Display a Rounded-Off Icon for Rounded-Off Attendance Records',
          'Exception Rule: Work on Non-Working Day Exception',
          'Manual Pay Policy Assignment for Employees'
        ]
      },
      {
        name: 'Citra',
        icon: '',
        iconRef: { iconName: 'sparkles', colorName: 'rose' },
        items: [
          {
            text: 'Attendance Compliance Tracking Enhancements',
            sub: ['Early Departure', 'Excess Work Duration']
          },
          'MCP Connector for OrangeHRM'
        ]
      },
      {
        name: 'Employee Management',
        icon: '',
        iconRef: { iconName: 'users', colorName: 'sky' },
        items: ['Ability to enable LATAM Name Format Configuration for Users']
      },
      {
        name: 'Performance Core',
        icon: '',
        iconRef: { iconName: 'star', colorName: 'emerald' },
        items: [
          'Add Rating Answer Type to Review Template Questions',
          'Admin Updates Authorized Performance Review Templates',
          'Customize Rating Labels for Rating Answer Type',
          'Admin Creates Review Templates'
        ]
      },
      {
        name: 'Performance Pro',
        icon: '',
        iconRef: { iconName: 'trophy', colorName: 'orange' },
        items: [
          'Include Final Rating in the Appraisal Completed Notification',
          'Default Goal/OKR Weightage selection changes to 1–100 Scale',
          'Simplified Employee Selection in the Appraisal Cycle Setup — Joined Date-Based Filtering',
          'Way to Add/Skip the IDP as a Section in the Appraisal Template'
        ]
      },
      {
        name: 'Power BI',
        icon: '',
        iconRef: { iconName: 'bar-chart', colorName: 'cyan' },
        items: [
          'Improvements to the Employee Data and Location Views',
          'Introduction of 8 New Views for Emergency Contacts, Immigration Details, Memberships, Work Experience, Education, Skills, Languages, and Licenses'
        ]
      },
      {
        name: 'Roster',
        icon: '',
        iconRef: { iconName: 'calendar-check', colorName: 'indigo' },
        items: [
          'Copy Weekly Schedule — Enforce Shift Creation Rules and Role-Based Behavior',
          'Enforce Shift Type Validity on Shift Group Change Based on “Modify Shift Times” Setting',
          'Select Employees from Multiple Locations When Assigning Shifts'
        ]
      }
    ],

    highlightsEyebrow: 'HIGHLIGHTS',
    highlightsTitle: 'NEW FEATURE HIGHLIGHTS',
    highlightsDesc:
      "Experience the new features in action. Click the button below to watch quick walkthrough videos.\nOrangeHRM Citra: A Smarter Look. A Smoother Experience.",
    highlightsImage: '',
    highlightsFrame: true,
    highlightsButtonText: 'Watch the Video',
    highlightsVideoUrl: '',

    enhancementsEyebrow: 'UPDATES',
    enhancementsTitle: 'Enhancements',
    enhancements: [
      { icon: '', iconRef: { iconName: 'wrench', colorName: 'orange' }, text: 'Customer Reported Bug Fixes' }
    ],

    hostedEnabled: true,
    hostedEyebrow: 'TRY IT NOW',
    hostedTitle: 'Hosted Environment',
    hostedDesc:
      "If you would like to play around with the new features, please feel free to use the below system. However, please ensure you don't change the default passwords of admin accounts.",
    hostedImage: '',
    hostedUrl: 'https://81-tag-kord.orangehrm.com/',
    hostedLines: [
      'Admin Account: UN: admin',
      'PW: BestSystemEver100%',
      'Sysadmin Account: UN: _ohrmSysAdmin_',
      'PW: >+$8YuqH3;W~&Nmw',
      'For any other user, use this password: PW: user@OHRM123'
    ],

    demoEnabled: true,
    demoTitle: 'Stakeholder Demo (Feature Demo)\nVideo & Slide',
    demoImage: '',
    demoButtons: [
      { label: 'Demo Video', url: '' },
      { label: 'Presentation Slide Deck', url: '' },
      { label: 'Release Notes & Build Information', url: '' },
      { label: 'Schema Changes in 8.1', url: '' }
    ],

    footerText: 'Bring Innovation to Human Resource Management !!!'
  };

  // localStorage so users don't lose work on reload
  const LS_KEY = 'release-email-generator:v11';

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      // Shallow merge so newly-added fields get defaults
      return Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      /* quota — silently skip; preview still works in memory */
    }
  }

  let state = loadState();

  // ---------- Hydrate logo aspect ratio ----------
  // If state.logo doesn't have a stored aspect (e.g. uploaded before this
  // feature existed, or restored from older localStorage), measure it now
  // so the email renders the logo at the correct width = height × aspect.
  function hydrateLogoAspect() {
    if (state.highlightsImage && !(state.highlightsAspect > 0)) {
      const hi = new Image();
      hi.onload = () => {
        if (hi.naturalHeight > 0) {
          state.highlightsAspect = hi.naturalWidth / hi.naturalHeight;
          scheduleRender();
        }
      };
      hi.onerror = () => {};
      hi.src = state.highlightsImage;
    }
    if (!state.logo) return;
    if (state.logoAspect && state.logoAspect > 0) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalHeight > 0) {
        state.logoAspect = img.naturalWidth / img.naturalHeight;
        scheduleRender();
      }
    };
    img.onerror = () => {};
    img.src = state.logo;
  }

  // ---------- Hydrate icon refs into actual data URLs ----------
  // Modules / enhancements may carry an `iconRef` (from defaults or library
  // picks). Always re-materialise so style updates (e.g. glass effect) take
  // effect even on previously-saved state. Uploads (no iconRef) are left
  // untouched.
  async function hydrateIcons() {
    if (!window.IconLibrary) return;
    const collect = (obj) => {
      // Always rebuild from iconRef → SVG data URL (small).
      // Switching from PNG (~6KB each) to SVG (~600 bytes each) saves ~50KB
      // across a typical release email, keeping it under Gmail's 102KB clip
      // threshold. Modern clients (Gmail web, Apple Mail, iOS Mail, Outlook
      // 365) render SVG sharp at any DPI.
      if (obj && obj.iconRef && obj.iconRef.iconName) {
        try {
          obj.icon = window.IconLibrary.buildSvgDataUrl(
            obj.iconRef.iconName,
            obj.iconRef.colorName,
            60
          );
        } catch (e) {}
      }
    };
    (state.features || []).forEach(collect);
    (state.enhancements || []).forEach(collect);
    scheduleRender();
  }

  // ---------- Render the email into the preview iframe ----------
  const previewFrame = document.getElementById('preview-frame');
  const sizeMeter = document.getElementById('size-meter');
  let renderPending = false;

  function updateSizeMeter(html) {
    if (!sizeMeter) return;
    // Approximate byte size of the rendered email
    const bytes = new Blob([html]).size;
    const kb = bytes / 1024;
    const valueEl = sizeMeter.querySelector('.size-meter-value');
    valueEl.textContent = (kb < 10 ? kb.toFixed(1) : Math.round(kb)) + ' KB';
    // Color coding: green < 70KB, amber 70-95KB, red > 95KB
    sizeMeter.classList.remove('size-ok', 'size-warn', 'size-bad');
    if (kb < 70) sizeMeter.classList.add('size-ok');
    else if (kb < 95) sizeMeter.classList.add('size-warn');
    else sizeMeter.classList.add('size-bad');
    sizeMeter.title =
      `Approximate email size: ${kb.toFixed(1)} KB.\n` +
      (kb >= 95
        ? '⚠ Over Gmail\'s 102 KB clip limit — recipients will see "[Message clipped]" and need to click "View entire message". Reduce hero/highlight image sizes.'
        : kb >= 70
        ? 'Approaching Gmail\'s 102 KB limit. Consider reducing large images.'
        : 'Well under Gmail\'s 102 KB clip limit.');
  }

  function scheduleRender() {
    saveState();
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      renderPending = false;
      // Pre-render the wordmark to a PNG so Gmail sees real Inter glyphs.
      // ensureHeaderImage caches on (productName + version + versionStyle),
      // so it only does real work when those inputs change.
      ensureHeaderImage()
        .catch(() => false)
        .then(() => {
          const html = window.ReleaseEmailTemplate.render(state);
          previewFrame.srcdoc = html;
          updateSizeMeter(html);
        });
    });
  }

  // ---------- Helpers ----------
  function uid() {
    return 'id_' + Math.random().toString(36).slice(2, 9);
  }

  function global_AIEnabled() {
    return !!(window.AIImage && window.AIImage.isEnabled());
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // ----------------------------------------------------------------
  // Image optimisation
  // ----------------------------------------------------------------
  // Why: the original 8.1.1 release email was ~3.8MB because every image
  // (hero photo, highlights GIF, screenshots) was inlined at full resolution.
  // Big emails are slow to load in Gmail and over Gmail's 102KB clip limit.
  //
  // What this does:
  //   • Resizes large images down to the email's max display width (600px)
  //     so we never carry pixels that nobody sees.
  //   • Re-encodes JPEGs at quality 0.82 (visually identical, 5-10× smaller).
  //   • Passes GIFs through untouched so animations survive.
  //   • Keeps PNG with transparency intact (used for logos / icons).
  // ----------------------------------------------------------------
  async function optimizeImage(file, opts = {}) {
    // High-quality defaults: 1200px max (retina-sharp at 600px display) and
    // JPEG 0.92 (visually lossless). Callers can override per use-case.
    const maxWidth = opts.maxWidth || 1200;
    const jpegQuality = opts.jpegQuality || 0.92;

    // GIFs: we can't resize without losing animation. Pass through.
    if (file.type === 'image/gif') {
      return await fileToDataURL(file);
    }
    // Anything not a raster image we recognise — pass through (e.g. SVG)
    if (!/^image\/(jpeg|jpg|png|webp|bmp)$/i.test(file.type)) {
      return await fileToDataURL(file);
    }

    const srcUrl = await fileToDataURL(file);
    let img;
    try {
      img = await loadImage(srcUrl);
    } catch (e) {
      return srcUrl;
    }

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    if (!naturalW || !naturalH) return srcUrl;

    let outW = naturalW;
    let outH = naturalH;
    if (naturalW > maxWidth) {
      outW = maxWidth;
      outH = Math.round(naturalH * (maxWidth / naturalW));
    }

    // If nothing to resize AND the file is already reasonably small for its
    // format, return the original bytes — no quality loss from a needless
    // re-encode.
    if (outW === naturalW && file.size < 250 * 1024) {
      return srcUrl;
    }

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, outW, outH);

    // Preserve PNG transparency for screenshots / UI captures. Only re-encode
    // to JPEG when the source was already JPEG (so we'd lose nothing).
    const isPng = file.type === 'image/png';
    if (isPng) {
      return canvas.toDataURL('image/png');
    }
    return canvas.toDataURL('image/jpeg', jpegQuality);
  }

  // Friendly byte→KB formatter for the dropzone status hint
  function approxKb(dataUrl) {
    if (!dataUrl) return 0;
    // Base64 ≈ 4/3× the byte length; data URL prefix is short, we ignore it.
    const i = dataUrl.indexOf(',');
    const b64 = i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
    return Math.round((b64.length * 0.75) / 1024);
  }

  // ----------------------------------------------------------------
  // Header-to-PNG renderer
  // ----------------------------------------------------------------
  // The "ORANGEHRM 8.1.1" wordmark is the email's visual signature. Gmail
  // strips the <link> tag that loads Inter, so the header text would fall
  // back to Arial on Windows / Roboto on Android. We pre-render the header
  // to a PNG using canvas (while Inter IS loaded in the generator page) and
  // embed that PNG — every client sees identical letterforms.
  // ----------------------------------------------------------------
  const HEADER_RENDER_CACHE = { key: null, src: null, w: 0, h: 0 };

  async function ensureHeaderImage() {
    const styleKey = state.versionStyle || 'amber';
    const cacheKey = [state.productName || '', state.version || '', styleKey].join('|');
    if (HEADER_RENDER_CACHE.key === cacheKey && HEADER_RENDER_CACHE.src) {
      state.headerImage = HEADER_RENDER_CACHE.src;
      state.headerImageW = HEADER_RENDER_CACHE.w;
      state.headerImageH = HEADER_RENDER_CACHE.h;
      return false;
    }
    try {
      if (document.fonts && document.fonts.load) {
        await document.fonts.load('800 48px "Inter"');
      }
    } catch (e) {}

    const styles =
      (window.ReleaseEmailTemplate && window.ReleaseEmailTemplate.VERSION_STYLES) || {};
    const style =
      styles[styleKey] || styles.amber || { kind: 'solid', color: '#f59e0b' };

    const productName = (state.productName || 'ORANGEHRM').toUpperCase();
    const versionText = (state.version || '').toUpperCase();
    const fontSize = 48;
    const letterSpacing = -0.04 * fontSize; // -0.04em equivalent
    const fontStack =
      '800 ' + fontSize + 'px "Inter", -apple-system, BlinkMacSystemFont, Arial, sans-serif';

    const measure = document.createElement('canvas').getContext('2d');
    measure.font = fontStack;
    function widthWithSpacing(text) {
      let w = 0;
      for (let i = 0; i < text.length; i++) {
        w += measure.measureText(text[i]).width + (i < text.length - 1 ? letterSpacing : 0);
      }
      return w;
    }
    const productW = widthWithSpacing(productName);
    const spaceW = measure.measureText(' ').width;
    const versionW = versionText ? widthWithSpacing(versionText) : 0;
    const padX = 12;
    const padY = 8;
    const totalW = Math.ceil(padX * 2 + productW + (versionText ? spaceW + versionW : 0));
    const totalH = Math.ceil(padY * 2 + fontSize * 1.1);

    const dpr = 2;
    const canvas = document.createElement('canvas');
    canvas.width = totalW * dpr;
    canvas.height = totalH * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.font = fontStack;
    ctx.textBaseline = 'middle';
    const baselineY = totalH / 2;

    function drawSpaced(text, startX, y, fillStyle) {
      ctx.fillStyle = fillStyle;
      let x = startX;
      for (let i = 0; i < text.length; i++) {
        ctx.fillText(text[i], x, y);
        x += measure.measureText(text[i]).width + letterSpacing;
      }
      return x;
    }

    let cursorX = drawSpaced(productName, padX, baselineY, '#ffffff');
    cursorX += spaceW;

    if (versionText) {
      let versionFill;
      if (style.kind === 'gradient') {
        const ang = ((style.angle || 90) - 90) * (Math.PI / 180);
        const x0 = cursorX;
        const y0 = baselineY - (versionW / 2) * Math.sin(ang);
        const x1 = cursorX + versionW * Math.cos(ang);
        const y1 = baselineY + (versionW / 2) * Math.sin(ang);
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, style.start);
        grad.addColorStop(1, style.end);
        versionFill = grad;
      } else {
        versionFill = style.color;
      }
      drawSpaced(versionText, cursorX, baselineY, versionFill);
    }

    const dataUrl = canvas.toDataURL('image/png');
    HEADER_RENDER_CACHE.key = cacheKey;
    HEADER_RENDER_CACHE.src = dataUrl;
    HEADER_RENDER_CACHE.w = totalW;
    HEADER_RENDER_CACHE.h = totalH;
    state.headerImage = dataUrl;
    state.headerImageW = totalW;
    state.headerImageH = totalH;
    return true;
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  // ---------- Image dropzone (re-used everywhere) ----------
  // opts.enableIconLibrary: show "Icons" pill to open the library picker
  // opts.iconRef: { iconName, colorName } previously chosen via library
  // opts.onIconRefChange: called with new {iconName, colorName} when user
  //                      picks from the library; onChange still fires with dataUrl
  // opts.optimizeOpts: { maxWidth, jpegQuality, preserveAlpha } passed to
  //                    optimizeImage(). Defaults to banner-style (600px, JPEG).
  function makeDropzone({
    label,
    hint,
    wide,
    currentValue,
    onChange,
    enableIconLibrary,
    iconRef,
    onIconRefChange,
    optimizeOpts,
    enableAi,
    aiAspect
  }) {
    const wrap = document.createElement('label');
    wrap.className = 'dropzone' + (wide ? ' wide' : '');
    if (currentValue) wrap.classList.add('has-image');

    const thumb = document.createElement('div');
    thumb.className = 'dropzone-thumb';
    if (currentValue) thumb.style.backgroundImage = `url("${currentValue}")`;

    const text = document.createElement('div');
    text.className = 'dropzone-text';
    text.innerHTML = `<strong>${label}</strong>${hint ? `<span class="filename">${hint}</span>` : ''}`;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'dropzone-clear';
    clear.innerHTML = '×';
    clear.title = 'Remove image';
    clear.style.display = currentValue ? '' : 'none';

    // Optional library button — bubble-stopped so clicking it doesn't
    // trigger the file-input behind the label.
    let iconBtn = null;
    if (enableIconLibrary && window.IconLibrary) {
      const actions = document.createElement('div');
      actions.className = 'dropzone-actions';
      iconBtn = document.createElement('button');
      iconBtn.type = 'button';
      iconBtn.className = 'dropzone-action';
      iconBtn.innerHTML = '✨ Icons';
      iconBtn.title = 'Pick from icon library';
      iconBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.IconLibrary.open({
          currentIconName: iconRef && iconRef.iconName,
          currentColorName: (iconRef && iconRef.colorName) || window.IconLibrary.DEFAULT_COLOR,
          onSelect: ({ iconName, colorName, dataUrl }) => {
            // Update the ref first so the subsequent setValue() → onChange()
            // → saveState() captures both the new dataUrl AND the new ref.
            if (typeof onIconRefChange === 'function') {
              onIconRefChange({ iconName, colorName });
            }
            setValue(dataUrl, iconName.replace(/-/g, ' '));
          }
        });
      });
      actions.appendChild(iconBtn);
      wrap.appendChild(actions);
    }

    // Optional "AI" button — only when a proxy endpoint is configured.
    if (enableAi && global_AIEnabled()) {
      let actions = wrap.querySelector('.dropzone-actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'dropzone-actions';
        wrap.appendChild(actions);
      }
      const aiBtn = document.createElement('button');
      aiBtn.type = 'button';
      aiBtn.className = 'dropzone-action is-ai';
      aiBtn.innerHTML = '◇ AI';
      aiBtn.title = 'Generate this image with AI';
      aiBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.AIImage.open({
          title: label,
          aspect: aiAspect || '16:9',
          onSelect: (dataUrl) => {
            setValue(dataUrl, 'AI generated — ' + approxKb(dataUrl) + ' KB');
            if (typeof onIconRefChange === 'function') onIconRefChange(null);
          }
        });
      });
      actions.appendChild(aiBtn);
    }

    wrap.appendChild(thumb);
    wrap.appendChild(text);
    wrap.appendChild(clear);
    wrap.appendChild(input);

    async function setValue(dataUrl, filename) {
      if (dataUrl) {
        wrap.classList.add('has-image');
        thumb.style.backgroundImage = `url("${dataUrl}")`;
        clear.style.display = '';
        if (filename) {
          text.innerHTML = `<strong>${label}</strong><span class="filename">${filename}</span>`;
        }
      } else {
        wrap.classList.remove('has-image');
        thumb.style.backgroundImage = '';
        clear.style.display = 'none';
        text.innerHTML = `<strong>${label}</strong>${hint ? `<span class="filename">${hint}</span>` : ''}`;
      }
      onChange(dataUrl);
    }

    input.addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const originalKb = Math.round(f.size / 1024);
      const url = await optimizeImage(f, optimizeOpts || {});
      const outKb = approxKb(url);
      const sizeNote =
        outKb < originalKb
          ? `${f.name} — ${originalKb} KB → ${outKb} KB`
          : `${f.name} — ${outKb} KB`;
      setValue(url, sizeNote);
      if (typeof onIconRefChange === 'function') onIconRefChange(null);
    });

    // Paste-from-clipboard: click the dropzone to focus it, then Ctrl/Cmd+V.
    // Lets you copy an image straight out of Gemini (or any tool) and drop it
    // in without a download → upload round trip.
    wrap.tabIndex = 0;
    wrap.addEventListener('paste', (e) => {
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image') === 0) {
          const f = items[i].getAsFile();
          if (!f) continue;
          e.preventDefault();
          const originalKb = Math.round(f.size / 1024);
          optimizeImage(f, optimizeOpts || {}).then((url) => {
            const outKb = approxKb(url);
            setValue(url, `pasted image — ${outKb} KB`);
            if (typeof onIconRefChange === 'function') onIconRefChange(null);
          });
          return;
        }
      }
    });

    // Drag-drop on the label itself
    ['dragenter', 'dragover'].forEach((evt) =>
      wrap.addEventListener(evt, (e) => {
        e.preventDefault();
        wrap.classList.add('dragging');
      })
    );
    ['dragleave', 'drop'].forEach((evt) =>
      wrap.addEventListener(evt, (e) => {
        if (evt === 'drop') {
          e.preventDefault();
          const f = e.dataTransfer.files && e.dataTransfer.files[0];
          if (f) {
            const originalKb = Math.round(f.size / 1024);
            optimizeImage(f, optimizeOpts || {}).then((url) => {
              const outKb = approxKb(url);
              const note =
                outKb < originalKb
                  ? `${f.name} — ${originalKb} KB → ${outKb} KB`
                  : `${f.name} — ${outKb} KB`;
              setValue(url, note);
              if (typeof onIconRefChange === 'function') onIconRefChange(null);
            });
          }
        }
        wrap.classList.remove('dragging');
      })
    );

    clear.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setValue('', '');
      if (typeof onIconRefChange === 'function') onIconRefChange(null);
    });

    return wrap;
  }

  // ---------- Form builder primitives ----------
  function field(label, control, hint) {
    const f = document.createElement('div');
    f.className = 'field';
    const l = document.createElement('label');
    l.className = 'field-label';
    l.innerHTML = label;
    f.appendChild(l);
    f.appendChild(control);
    if (hint) {
      const h = document.createElement('div');
      h.className = 'field-hint';
      h.textContent = hint;
      f.appendChild(h);
    }
    return f;
  }

  function textInput(value, onChange, opts = {}) {
    const i = document.createElement('input');
    i.className = 'input';
    i.type = 'text';
    i.value = value || '';
    if (opts.placeholder) i.placeholder = opts.placeholder;
    i.addEventListener('input', () => onChange(i.value));
    return i;
  }
  function textarea(value, onChange, opts = {}) {
    const t = document.createElement('textarea');
    t.className = 'textarea';
    t.value = value || '';
    if (opts.placeholder) t.placeholder = opts.placeholder;
    if (opts.rows) t.rows = opts.rows;
    t.addEventListener('input', () => onChange(t.value));
    return t;
  }
  function switchToggle(value, onChange) {
    const s = document.createElement('div');
    s.className = 'switch' + (value ? ' on' : '');
    s.addEventListener('click', () => {
      const next = !s.classList.contains('on');
      s.classList.toggle('on', next);
      onChange(next);
    });
    return s;
  }

  // Slider with live value readout
  function slider(value, onChange, opts = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'slider-wrap';
    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'slider';
    input.min = opts.min != null ? opts.min : 0;
    input.max = opts.max != null ? opts.max : 100;
    input.step = opts.step != null ? opts.step : 1;
    input.value = value == null ? input.min : value;
    const readout = document.createElement('span');
    readout.className = 'slider-readout';
    const fmt = (v) => (opts.unit ? `${v}${opts.unit}` : String(v));
    readout.textContent = fmt(input.value);
    input.addEventListener('input', () => {
      readout.textContent = fmt(input.value);
      onChange(Number(input.value));
    });
    wrap.appendChild(input);
    wrap.appendChild(readout);
    return wrap;
  }

  // Segmented pill control (radio-like)
  function segmented(options, value, onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'segmented';
    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'segmented-btn' + (opt.value === value ? ' selected' : '');
      btn.innerHTML = `
        <span class="segmented-label">${opt.label}</span>
        ${opt.sub ? `<span class="segmented-sub">${opt.sub}</span>` : ''}
      `;
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.segmented-btn').forEach((el) => el.classList.remove('selected'));
        btn.classList.add('selected');
        onChange(opt.value);
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  // ---------- Sections ----------
  function makeSection({ step, title, sub, open, build }) {
    const wrap = document.createElement('section');
    wrap.className = 'section' + (open ? ' open' : '');
    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'section-header';
    header.innerHTML = `
      <span class="section-step">${step}</span>
      <span>
        <span class="section-title">${title}</span>
        ${sub ? `<div class="section-sub">${sub}</div>` : ''}
      </span>
      <span class="chevron"></span>
    `;
    const body = document.createElement('div');
    body.className = 'section-body';
    build(body);
    header.addEventListener('click', () => wrap.classList.toggle('open'));
    wrap.appendChild(header);
    wrap.appendChild(body);
    return wrap;
  }

  function buildVersionEffectPicker(onChange) {
    const wrap = document.createElement('div');
    wrap.className = 'swatch-grid effect-grid';
    const effects = (window.ReleaseEmailTemplate && window.ReleaseEmailTemplate.VERSION_EFFECTS) || {};

    function render() {
      wrap.innerHTML = '';
      Object.entries(effects).forEach(([key, eff]) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch effect-swatch' + (state.versionEffect === key ? ' selected' : '');
        sw.title = eff.label;
        sw.innerHTML = `
          <span class="effect-glyph" data-effect="${key}">Aa</span>
          <span class="swatch-label">${eff.label}</span>
        `;
        sw.addEventListener('click', () => {
          state.versionEffect = key;
          // Loop is auto-on for effects that need it; user can override
          if (eff.defaultLoop && state.versionLoop == null) state.versionLoop = true;
          render();
          if (typeof onChange === 'function') onChange();
          scheduleRender();
        });
        wrap.appendChild(sw);
      });
    }
    render();
    return wrap;
  }

  function buildPageBgPicker() {
    const options = [
      { value: '#E5E9F0', label: 'Cool gray' },
      { value: '#F0F1F5', label: 'OXD gray' },
      { value: '#F5F6FA', label: 'Light' },
      { value: '#FFFFFF', label: 'White' },
      { value: '#FAF5EE', label: 'Warm' },
      { value: '#1E293B', label: 'Slate' },
      { value: '#050a1f', label: 'Match' }
    ];
    const wrap = document.createElement('div');
    wrap.className = 'swatch-grid';
    function render() {
      wrap.innerHTML = '';
      options.forEach((o) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch' + (state.pageBg === o.value ? ' selected' : '');
        sw.title = o.label;
        sw.innerHTML = `
          <span class="swatch-chip" style="background:${o.value};border:1px solid rgba(0,0,0,0.08);"></span>
          <span class="swatch-label">${o.label}</span>
        `;
        sw.addEventListener('click', () => {
          state.pageBg = o.value;
          render();
          scheduleRender();
        });
        wrap.appendChild(sw);
      });
    }
    render();
    return wrap;
  }

  // -------- Section 1: Release info --------
  function buildVersionStylePicker() {
    const host = document.createElement('div');
    const wrap = document.createElement('div');
    wrap.className = 'swatch-grid';
    host.appendChild(wrap);

    const custom = document.createElement('div');
    custom.className = 'custom-grad';
    host.appendChild(custom);

    const styles = (window.ReleaseEmailTemplate && window.ReleaseEmailTemplate.VERSION_STYLES) || {};

    function customFill() {
      const c = state.customGradient || {};
      return c.kind === 'solid'
        ? (c.start || '#f59e0b')
        : `linear-gradient(${c.angle || 90}deg, ${c.start || '#f59e0b'}, ${c.end || '#ec4899'})`;
    }

    function renderCustomControls() {
      custom.innerHTML = '';
      if (state.versionStyle !== 'custom') return;
      const c = state.customGradient || (state.customGradient = { kind: 'gradient', start: '#f59e0b', end: '#ec4899', angle: 90 });

      const row = document.createElement('div');
      row.className = 'custom-grad-row';

      const mk = (labelText, key, fallback) => {
        const box = document.createElement('label');
        box.className = 'custom-grad-field';
        const lab = document.createElement('span');
        lab.className = 'custom-grad-label';
        lab.textContent = labelText;
        const input = document.createElement('input');
        input.type = 'color';
        input.className = 'custom-grad-color';
        input.value = c[key] || fallback;
        input.addEventListener('input', () => {
          c[key] = input.value;
          render();
          scheduleRender();
        });
        box.appendChild(lab);
        box.appendChild(input);
        return box;
      };

      row.appendChild(mk('From', 'start', '#f59e0b'));
      row.appendChild(mk('To', 'end', '#ec4899'));
      custom.appendChild(row);

      custom.appendChild(
        field(
          'Angle',
          slider(c.angle == null ? 90 : c.angle, (v) => {
            c.angle = v;
            render();
            scheduleRender();
          }, { min: 0, max: 360, step: 5, unit: '°' })
        )
      );

      const solidRow = document.createElement('div');
      solidRow.className = 'toggle-row';
      solidRow.innerHTML = '<span><strong>Solid colour</strong><div class="field-hint">Use only the “From” colour</div></span>';
      solidRow.appendChild(
        switchToggle(c.kind === 'solid', (v) => {
          c.kind = v ? 'solid' : 'gradient';
          render();
          scheduleRender();
        })
      );
      custom.appendChild(solidRow);
    }

    function render() {
      wrap.innerHTML = '';
      const entries = Object.entries(styles).concat([['custom', { kind: 'custom', label: 'Custom' }]]);
      entries.forEach(([key, s]) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch' + (state.versionStyle === key ? ' selected' : '');
        sw.title = s.label || key;
        const fill =
          key === 'custom'
            ? customFill()
            : s.kind === 'gradient'
            ? `linear-gradient(${s.angle}deg, ${s.start}, ${s.end})`
            : s.color;
        sw.innerHTML = `
          <span class="swatch-chip" style="background:${fill};"></span>
          <span class="swatch-label">${s.label || key}</span>
        `;
        sw.addEventListener('click', () => {
          state.versionStyle = key;
          render();
          scheduleRender();
        });
        wrap.appendChild(sw);
      });
      renderCustomControls();
    }
    render();
    return host;
  }

  function buildReleaseInfo(body) {
    const row = document.createElement('div');
    row.className = 'row-2';
    row.appendChild(
      field(
        'Product name',
        textInput(state.productName, (v) => {
          state.productName = v;
          scheduleRender();
        })
      )
    );
    row.appendChild(
      field(
        'Version',
        textInput(state.version, (v) => {
          state.version = v;
          scheduleRender();
        }, { placeholder: '8.1.1' })
      )
    );
    body.appendChild(row);

    body.appendChild(
      field(
        'Tagline',
        textInput(state.tagline, (v) => {
          state.tagline = v;
          scheduleRender();
        }, { placeholder: 'Is Out As a Stable Version' })
      )
    );

    // Version color (solid + gradient swatches)
    body.appendChild(
      field(
        'Version text color',
        buildVersionStylePicker(),
        'Modern clients show the gradient; Outlook falls back to the first color'
      )
    );

    body.appendChild(
      field(
        'Logo',
        makeDropzone({
          label: 'Drop logo or click to upload',
          hint: 'Defaults to OrangeHRM mark',
          wide: true,
          currentValue: state.logo,
          // Logos need transparency — keep PNG, modest max width.
          optimizeOpts: { maxWidth: 400, preserveAlpha: true },
          onChange: (v) => {
            state.logo = v || 'assets/orangehrm-logo-white.png';
            // Measure the natural aspect ratio so we can emit explicit width
            // AND height HTML attrs in the email (Gmail respects HTML attrs
            // even when CSS is stripped → no resize on paste).
            if (v) {
              const img = new Image();
              img.onload = () => {
                if (img.naturalHeight > 0) {
                  state.logoAspect = img.naturalWidth / img.naturalHeight;
                  scheduleRender();
                }
              };
              img.src = v;
            } else {
              state.logoAspect = null; // default builtin: aspect ~5.4 for orange logo
            }
            scheduleRender();
          }
        })
      )
    );

    body.appendChild(
      field(
        'Logo size',
        slider(
          state.logoHeight || 60,
          (v) => {
            state.logoHeight = v;
            scheduleRender();
          },
          { min: 30, max: 120, step: 1, unit: 'px' }
        ),
        'Height of the logo in the email — width scales automatically'
      )
    );

    body.appendChild(
      field(
        'Module icon size',
        segmented(
          [
            { value: 24, label: 'Small',  sub: '24px' },
            { value: 32, label: 'Medium', sub: '32px' },
            { value: 40, label: 'Large',  sub: '40px' }
          ],
          state.iconSize || 32,
          (v) => {
            state.iconSize = v;
            scheduleRender();
          }
        ),
        'Applies to all feature module + enhancement icons'
      )
    );

    // Page background — the color BEHIND the 600px dark email container
    body.appendChild(
      field(
        'Page background',
        buildPageBgPicker(),
        'Color of the area around the 600px email container'
      )
    );

    body.appendChild(
      field(
        'Page padding',
        slider(
          state.pagePadding == null ? 24 : state.pagePadding,
          (v) => {
            state.pagePadding = v;
            scheduleRender();
          },
          { min: 0, max: 60, step: 2, unit: 'px' }
        ),
        'Vertical space above / below the dark email container'
      )
    );

    body.appendChild(
      field(
        'Hero image',
        makeDropzone({
          label: 'Drop hero image or click to upload',
          hint: 'Auto-resized to 1200px (2× retina) • JPEG kept at quality 0.92',
          wide: true,
          currentValue: state.heroImage,
          optimizeOpts: { maxWidth: 1200, jpegQuality: 0.92 },
          enableAi: true,
          aiAspect: '16:9',
          onChange: (v) => {
            state.heroImage = v;
            scheduleRender();
          }
        })
      )
    );
  }

  // -------- Section 2: Features --------
  function buildFeaturesSection(body) {
    const list = document.createElement('div');
    body.appendChild(list);

    function renderList() {
      list.innerHTML = '';
      state.features.forEach((mod, idx) => {
        const item = document.createElement('div');
        item.className = 'repeatable-item';
        item.draggable = true;
        item.dataset.index = idx;

        const head = document.createElement('div');
        head.className = 'repeatable-item-header';
        head.innerHTML = `
          <span class="drag-handle" title="Drag to reorder">⋮⋮</span>
          <span class="repeatable-item-title">Module ${idx + 1}</span>
        `;
        const del = document.createElement('button');
        del.className = 'btn-danger';
        del.type = 'button';
        del.textContent = 'Remove';
        del.addEventListener('click', () => {
          state.features.splice(idx, 1);
          renderList();
          scheduleRender();
        });
        head.appendChild(del);
        item.appendChild(head);

        const row = document.createElement('div');
        row.appendChild(
          field(
            'Icon',
            makeDropzone({
              label: 'Module icon',
              hint: 'Use Icons → or upload',
              currentValue: mod.icon,
              enableIconLibrary: true,
              iconRef: mod.iconRef,
              onIconRefChange: (ref) => {
                mod.iconRef = ref;
              },
              onChange: (v) => {
                mod.icon = v;
                scheduleRender();
              }
            })
          )
        );
        row.appendChild(
          field(
            'Module name',
            textInput(mod.name, (v) => {
              mod.name = v;
              scheduleRender();
            }, { placeholder: 'e.g. Attendance' })
          )
        );
        item.appendChild(row);

        // Bullet items
        const bulletsLabel = document.createElement('label');
        bulletsLabel.className = 'field-label';
        bulletsLabel.style.marginTop = '14px';
        bulletsLabel.textContent = 'Bullet items';
        item.appendChild(bulletsLabel);

        const bullets = document.createElement('div');
        item.appendChild(bullets);

        function renderBullets() {
          bullets.innerHTML = '';
          mod.items.forEach((it, bi) => {
            const isObj = typeof it === 'object' && it !== null;
            const text = isObj ? (it.text || '') : it;

            // Container for this bullet + its sub-list
            const itemBox = document.createElement('div');
            itemBox.className = 'bullet-item';

            // Main bullet row
            const row = document.createElement('div');
            row.className = 'bullet-row';
            const i = textInput(
              text,
              (v) => {
                if (typeof mod.items[bi] === 'string') {
                  mod.items[bi] = v;
                } else {
                  mod.items[bi].text = v;
                }
                scheduleRender();
              },
              { placeholder: 'Feature description' }
            );
            row.appendChild(i);

            // "+ Sub-bullet" pill (always visible to encourage nesting)
            const addSub = document.createElement('button');
            addSub.type = 'button';
            addSub.className = 'btn-mini';
            addSub.title = 'Add sub-bullet';
            addSub.innerHTML = '+ sub';
            addSub.addEventListener('click', () => {
              if (typeof mod.items[bi] === 'string') {
                mod.items[bi] = { text: mod.items[bi], sub: [] };
              }
              if (!Array.isArray(mod.items[bi].sub)) mod.items[bi].sub = [];
              mod.items[bi].sub.push('');
              renderBullets();
              scheduleRender();
            });
            row.appendChild(addSub);

            const x = document.createElement('button');
            x.type = 'button';
            x.className = 'btn-danger';
            x.textContent = '✕';
            x.title = 'Remove bullet';
            x.addEventListener('click', () => {
              mod.items.splice(bi, 1);
              renderBullets();
              scheduleRender();
            });
            row.appendChild(x);
            itemBox.appendChild(row);

            // Sub-bullets list (only render if it's an object with subs)
            if (isObj && Array.isArray(it.sub) && it.sub.length > 0) {
              const subList = document.createElement('div');
              subList.className = 'sub-bullets';
              it.sub.forEach((s, si) => {
                const subRow = document.createElement('div');
                subRow.className = 'bullet-row sub';
                const guide = document.createElement('span');
                guide.className = 'sub-guide';
                guide.textContent = '↳';
                subRow.appendChild(guide);
                const subInput = textInput(
                  s,
                  (v) => {
                    mod.items[bi].sub[si] = v;
                    scheduleRender();
                  },
                  { placeholder: 'Sub-bullet text' }
                );
                subRow.appendChild(subInput);
                const sx = document.createElement('button');
                sx.type = 'button';
                sx.className = 'btn-danger';
                sx.textContent = '✕';
                sx.title = 'Remove sub-bullet';
                sx.addEventListener('click', () => {
                  mod.items[bi].sub.splice(si, 1);
                  // If empty after removal, collapse back to a string
                  if (mod.items[bi].sub.length === 0) {
                    mod.items[bi] = mod.items[bi].text;
                  }
                  renderBullets();
                  scheduleRender();
                });
                subRow.appendChild(sx);
                subList.appendChild(subRow);
              });
              itemBox.appendChild(subList);
            }

            bullets.appendChild(itemBox);
          });
        }
        renderBullets();

        const addBullet = document.createElement('div');
        addBullet.className = 'add-row';
        const ab = document.createElement('button');
        ab.type = 'button';
        ab.className = 'add-btn';
        ab.innerHTML = '+ Add bullet';
        ab.addEventListener('click', () => {
          mod.items.push('');
          renderBullets();
          scheduleRender();
        });
        addBullet.appendChild(ab);
        item.appendChild(addBullet);

        // Drag and drop reorder
        item.addEventListener('dragstart', (e) => {
          item.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(idx));
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
        item.addEventListener('dragover', (e) => e.preventDefault());
        item.addEventListener('drop', (e) => {
          e.preventDefault();
          const from = Number(e.dataTransfer.getData('text/plain'));
          const to = Number(item.dataset.index);
          if (from === to) return;
          const moved = state.features.splice(from, 1)[0];
          state.features.splice(to, 0, moved);
          renderList();
          scheduleRender();
        });

        list.appendChild(item);
      });
    }
    renderList();

    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-btn';
    addBtn.innerHTML = '+ Add module';
    addBtn.addEventListener('click', () => {
      state.features.push({ name: 'New module', icon: '', items: [''] });
      renderList();
      scheduleRender();
    });
    addRow.appendChild(addBtn);
    body.appendChild(addRow);
  }

  // -------- Section 3: Highlights --------
  function buildHighlightsSection(body) {
    body.appendChild(
      field(
        'Eyebrow label',
        textInput(state.highlightsEyebrow, (v) => {
          state.highlightsEyebrow = v;
          scheduleRender();
        })
      )
    );
    body.appendChild(
      field(
        'Heading',
        textInput(state.highlightsTitle, (v) => {
          state.highlightsTitle = v;
          scheduleRender();
        })
      )
    );
    body.appendChild(
      field(
        'Description',
        textarea(state.highlightsDesc, (v) => {
          state.highlightsDesc = v;
          scheduleRender();
        }, { rows: 3 }),
        'Use blank lines for paragraph breaks'
      )
    );
    body.appendChild(
      field(
        'Image / GIF',
        makeDropzone({
          label: 'Drop image or GIF',
          hint: 'GIFs pass through unchanged • PNG/JPEG auto-optimised',
          wide: true,
          currentValue: state.highlightsImage,
          optimizeOpts: { maxWidth: 1200, jpegQuality: 0.92 },
          enableAi: true,
          aiAspect: '16:9',
          onChange: (v) => {
            state.highlightsImage = v;
            // Measure the natural aspect so the device frame sizes itself to
            // the GIF exactly (no overflow, no letterboxing).
            if (v) {
              const im = new Image();
              im.onload = () => {
                if (im.naturalHeight > 0) {
                  state.highlightsAspect = im.naturalWidth / im.naturalHeight;
                  scheduleRender();
                }
              };
              im.src = v;
            } else {
              state.highlightsAspect = null;
            }
            scheduleRender();
          }
        })
      )
    );

    const frameRow = document.createElement('div');
    frameRow.className = 'toggle-row';
    frameRow.innerHTML = '<span><strong>Show device frame</strong><div class="field-hint">White-outlined rounded screen around the image/GIF</div></span>';
    frameRow.appendChild(
      switchToggle(state.highlightsFrame !== false, (v) => {
        state.highlightsFrame = v;
        scheduleRender();
      })
    );
    body.appendChild(frameRow);

    body.appendChild(
      field(
        'Video button icon',
        makeDropzone({
          label: 'Default play icon',
          hint: 'Pick from library or upload a custom icon',
          currentValue: state.videoIcon,
          enableIconLibrary: true,
          iconRef: state.videoIconRef,
          onIconRefChange: (ref) => {
            state.videoIconRef = ref;
          },
          onChange: (v) => {
            state.videoIcon = v;
            scheduleRender();
          }
        })
      )
    );
    const row = document.createElement('div');
    row.className = 'row-2';
    row.appendChild(
      field(
        'Button label',
        textInput(state.highlightsButtonText, (v) => {
          state.highlightsButtonText = v;
          scheduleRender();
        })
      )
    );
    row.appendChild(
      field(
        'Video URL',
        textInput(state.highlightsVideoUrl, (v) => {
          state.highlightsVideoUrl = v;
          scheduleRender();
        }, { placeholder: 'https://...' })
      )
    );
    body.appendChild(row);
  }

  // -------- Section 4: Enhancements --------
  function buildEnhancementsSection(body) {
    const row = document.createElement('div');
    row.className = 'row-2';
    row.appendChild(
      field(
        'Eyebrow',
        textInput(state.enhancementsEyebrow, (v) => {
          state.enhancementsEyebrow = v;
          scheduleRender();
        })
      )
    );
    row.appendChild(
      field(
        'Heading',
        textInput(state.enhancementsTitle, (v) => {
          state.enhancementsTitle = v;
          scheduleRender();
        })
      )
    );
    body.appendChild(row);

    const list = document.createElement('div');
    body.appendChild(list);

    function renderList() {
      list.innerHTML = '';
      state.enhancements.forEach((e, idx) => {
        const item = document.createElement('div');
        item.className = 'repeatable-item';
        const head = document.createElement('div');
        head.className = 'repeatable-item-header';
        head.innerHTML = `<span class="repeatable-item-title">Item ${idx + 1}</span>`;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn-danger';
        del.textContent = 'Remove';
        del.addEventListener('click', () => {
          state.enhancements.splice(idx, 1);
          renderList();
          scheduleRender();
        });
        head.appendChild(del);
        item.appendChild(head);

        const row = document.createElement('div');
        row.className = 'row-2';
        row.appendChild(
          field(
            'Icon',
            makeDropzone({
              label: 'Icon',
              hint: 'Use Icons → or upload',
              currentValue: e.icon,
              enableIconLibrary: true,
              iconRef: e.iconRef,
              onIconRefChange: (ref) => {
                e.iconRef = ref;
              },
              onChange: (v) => {
                e.icon = v;
                scheduleRender();
              }
            })
          )
        );
        row.appendChild(
          field(
            'Label',
            textInput(e.text, (v) => {
              e.text = v;
              scheduleRender();
            }, { placeholder: 'e.g. Customer Reported Bug Fixes' })
          )
        );
        item.appendChild(row);
        list.appendChild(item);
      });
    }
    renderList();

    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-btn';
    addBtn.innerHTML = '+ Add enhancement';
    addBtn.addEventListener('click', () => {
      state.enhancements.push({ icon: '', text: '' });
      renderList();
      scheduleRender();
    });
    addRow.appendChild(addBtn);
    body.appendChild(addRow);
  }

  // -------- Section 5: Hosted Environment --------
  function buildHostedSection(body) {
    const toggle = document.createElement('div');
    toggle.className = 'toggle-row';
    toggle.innerHTML = '<span><strong>Include this section</strong><div class="field-hint">Show login / hosted demo block</div></span>';
    toggle.appendChild(
      switchToggle(state.hostedEnabled, (v) => {
        state.hostedEnabled = v;
        scheduleRender();
      })
    );
    body.appendChild(toggle);

    body.appendChild(
      field(
        'Eyebrow',
        textInput(state.hostedEyebrow, (v) => {
          state.hostedEyebrow = v;
          scheduleRender();
        })
      )
    );
    body.appendChild(
      field(
        'Heading',
        textInput(state.hostedTitle, (v) => {
          state.hostedTitle = v;
          scheduleRender();
        })
      )
    );
    body.appendChild(
      field(
        'Description',
        textarea(state.hostedDesc, (v) => {
          state.hostedDesc = v;
          scheduleRender();
        }, { rows: 3 })
      )
    );
    body.appendChild(
      field(
        'Screenshot',
        makeDropzone({
          label: 'Drop screenshot (optional)',
          wide: true,
          currentValue: state.hostedImage,
          optimizeOpts: { maxWidth: 1200, jpegQuality: 0.92 },
          enableAi: true,
          aiAspect: '16:9',
          onChange: (v) => {
            state.hostedImage = v;
            scheduleRender();
          }
        })
      )
    );
    body.appendChild(
      field(
        'Demo URL',
        textInput(state.hostedUrl, (v) => {
          state.hostedUrl = v;
          scheduleRender();
        }, { placeholder: 'https://...' })
      )
    );

    const list = document.createElement('div');
    const linesLabel = document.createElement('div');
    linesLabel.className = 'field-label';
    linesLabel.style.marginTop = '14px';
    linesLabel.textContent = 'Credential lines';
    body.appendChild(linesLabel);
    body.appendChild(list);

    function renderLines() {
      list.innerHTML = '';
      state.hostedLines.forEach((line, i) => {
        const row = document.createElement('div');
        row.className = 'bullet-row';
        row.appendChild(
          textInput(line, (v) => {
            state.hostedLines[i] = v;
            scheduleRender();
          }, { placeholder: 'e.g. UN: admin | PW: …' })
        );
        const x = document.createElement('button');
        x.type = 'button';
        x.className = 'btn-danger';
        x.textContent = '✕';
        x.addEventListener('click', () => {
          state.hostedLines.splice(i, 1);
          renderLines();
          scheduleRender();
        });
        row.appendChild(x);
        list.appendChild(row);
      });
    }
    renderLines();

    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-btn';
    addBtn.innerHTML = '+ Add line';
    addBtn.addEventListener('click', () => {
      state.hostedLines.push('');
      renderLines();
      scheduleRender();
    });
    addRow.appendChild(addBtn);
    body.appendChild(addRow);
  }

  // -------- Section 6: Demo --------
  function buildDemoSection(body) {
    const toggle = document.createElement('div');
    toggle.className = 'toggle-row';
    toggle.innerHTML = '<span><strong>Include this section</strong><div class="field-hint">Demo block with linked buttons</div></span>';
    toggle.appendChild(
      switchToggle(state.demoEnabled, (v) => {
        state.demoEnabled = v;
        scheduleRender();
      })
    );
    body.appendChild(toggle);

    body.appendChild(
      field(
        'Heading',
        textarea(state.demoTitle, (v) => {
          state.demoTitle = v;
          scheduleRender();
        }, { rows: 2 }),
        'Newlines wrap onto multiple lines'
      )
    );
    body.appendChild(
      field(
        'Section image',
        makeDropzone({
          label: 'Drop image (optional)',
          wide: true,
          currentValue: state.demoImage,
          optimizeOpts: { maxWidth: 1200, jpegQuality: 0.92 },
          enableAi: true,
          aiAspect: '16:9',
          onChange: (v) => {
            state.demoImage = v;
            scheduleRender();
          }
        })
      )
    );

    const linesLabel = document.createElement('div');
    linesLabel.className = 'field-label';
    linesLabel.style.marginTop = '14px';
    linesLabel.textContent = 'Buttons';
    body.appendChild(linesLabel);

    const list = document.createElement('div');
    body.appendChild(list);

    function renderButtons() {
      list.innerHTML = '';
      state.demoButtons.forEach((b, i) => {
        const item = document.createElement('div');
        item.className = 'repeatable-item';
        const head = document.createElement('div');
        head.className = 'repeatable-item-header';
        head.innerHTML = `<span class="repeatable-item-title">Button ${i + 1}</span>`;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn-danger';
        del.textContent = 'Remove';
        del.addEventListener('click', () => {
          state.demoButtons.splice(i, 1);
          renderButtons();
          scheduleRender();
        });
        head.appendChild(del);
        item.appendChild(head);

        const row = document.createElement('div');
        row.className = 'row-2';
        row.appendChild(
          field(
            'Label',
            textInput(b.label, (v) => {
              b.label = v;
              scheduleRender();
            })
          )
        );
        row.appendChild(
          field(
            'URL',
            textInput(b.url, (v) => {
              b.url = v;
              scheduleRender();
            }, { placeholder: 'https://...' })
          )
        );
        item.appendChild(row);
        list.appendChild(item);
      });
    }
    renderButtons();

    const addRow = document.createElement('div');
    addRow.className = 'add-row';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'add-btn';
    addBtn.innerHTML = '+ Add button';
    addBtn.addEventListener('click', () => {
      state.demoButtons.push({ label: 'New link', url: '' });
      renderButtons();
      scheduleRender();
    });
    addRow.appendChild(addBtn);
    body.appendChild(addRow);
  }

  // -------- Section 7: Footer --------
  function buildFooterStylePicker() {
    const wrap = document.createElement('div');
    wrap.className = 'swatch-grid';
    const styles = (window.ReleaseEmailTemplate && window.ReleaseEmailTemplate.VERSION_STYLES) || {};
    const all = {
      match: { kind: 'match', label: 'Auto theme' },
      none:  { kind: 'none',  label: 'None' },
      ...styles,
      custom: { kind: 'custom', label: 'Custom' }
    };

    function render() {
      wrap.innerHTML = '';
      Object.entries(all).forEach(([key, s]) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'swatch' + (state.footerStyle === key ? ' selected' : '');
        sw.title = s.label || key;
        let fill;
        if (key === 'none') {
          fill = '#0b1326';
        } else if (key === 'match') {
          fill = 'conic-gradient(from 0deg, #f59e0b, #ec4899, #8b5cf6, #38bdf8, #34d399, #fbbf24, #f59e0b)';
        } else if (key === 'custom') {
          const c = state.customGradient || {};
          fill = c.kind === 'solid'
            ? (c.start || '#f59e0b')
            : `linear-gradient(${c.angle || 90}deg, ${c.start || '#f59e0b'}, ${c.end || '#ec4899'})`;
        } else if (s.kind === 'gradient') {
          fill = `linear-gradient(${s.angle}deg, ${s.start}, ${s.end})`;
        } else {
          fill = s.color;
        }
        sw.innerHTML = `
          <span class="swatch-chip" style="background:${fill};"></span>
          <span class="swatch-label">${s.label || key}</span>
        `;
        sw.addEventListener('click', () => {
          state.footerStyle = key;
          render();
          scheduleRender();
        });
        wrap.appendChild(sw);
      });
    }
    render();
    return wrap;
  }

  function buildFooterSection(body) {
    body.appendChild(
      field(
        'Tagline text',
        textInput(state.footerText, (v) => {
          state.footerText = v;
          scheduleRender();
        })
      )
    );

    body.appendChild(
      field(
        'Footer gradient',
        buildFooterStylePicker(),
        'Choose a tinted gradient band, a solid color tint, or none (flat dark)'
      )
    );

    // "Match version color" convenience button
    const matchRow = document.createElement('div');
    matchRow.className = 'add-row';
    const matchBtn = document.createElement('button');
    matchBtn.type = 'button';
    matchBtn.className = 'add-btn';
    matchBtn.innerHTML = '⇆ Match version color';
    matchBtn.addEventListener('click', () => {
      state.footerStyle = state.versionStyle || 'sunset';
      // Re-render the footer picker
      body.innerHTML = '';
      buildFooterSection(body);
      scheduleRender();
    });
    matchRow.appendChild(matchBtn);
    body.appendChild(matchRow);
  }

  // ---------- Mount form ----------
  const formPane = document.getElementById('form-pane');

  formPane.appendChild(
    makeSection({
      step: '1',
      title: 'Release info',
      sub: 'Logo, version, tagline, hero image',
      open: true,
      build: buildReleaseInfo
    })
  );
  formPane.appendChild(
    makeSection({
      step: '2',
      title: 'Features',
      sub: 'What\u2019s new — modules with bullet items',
      open: true,
      build: buildFeaturesSection
    })
  );
  formPane.appendChild(
    makeSection({
      step: '3',
      title: 'Feature Highlights',
      sub: 'GIF/video walkthrough block',
      open: false,
      build: buildHighlightsSection
    })
  );
  formPane.appendChild(
    makeSection({
      step: '4',
      title: 'Enhancements',
      sub: 'Smaller updates list',
      open: false,
      build: buildEnhancementsSection
    })
  );
  formPane.appendChild(
    makeSection({
      step: '5',
      title: 'Hosted Environment',
      sub: 'Demo URL + credentials',
      open: false,
      build: buildHostedSection
    })
  );
  formPane.appendChild(
    makeSection({
      step: '6',
      title: 'Stakeholder Demo',
      sub: 'Links to slides, video, release notes',
      open: false,
      build: buildDemoSection
    })
  );
  formPane.appendChild(
    makeSection({
      step: '7',
      title: 'Footer tagline',
      sub: 'Closing message',
      open: false,
      build: buildFooterSection
    })
  );

  // ---------- Toolbar actions ----------
  function bakeForExport(html) {
    // The logo asset path is relative to the generator — convert to absolute
    // so the exported file is portable. We rewrite the local logo to a small
    // SVG fallback if the user kept the default, otherwise it's already a data URL.
    return html;
  }

  async function inlineLocalAssets(html) {
    // Convert any remaining relative URL references (the default logo) into
    // a data: URL so the exported HTML is self-contained.
    const matches = [...html.matchAll(/src="(assets\/[^"]+)"/g)];
    const unique = [...new Set(matches.map((m) => m[1]))];
    for (const path of unique) {
      try {
        const res = await fetch(path);
        const blob = await res.blob();
        const dataUrl = await new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        html = html.split(`src="${path}"`).join(`src="${dataUrl}"`);
      } catch (e) {
        /* leave the path — won't break, just won't load when offline */
      }
    }
    return html;
  }

  async function getExportHtml() {
    let html = window.ReleaseEmailTemplate.render(state);
    html = await inlineLocalAssets(html);
    return bakeForExport(html);
  }

  // Short plain-text flavour for the clipboard. Must never be the full HTML —
  // pasting into Gmail would otherwise insert the rendered email AND the raw
  // source, which looked like two copies of the template.
  function plainFallbackLabel() {
    return `${state.productName || 'ORANGEHRM'} ${state.version || ''} release email`.trim();
  }

  document.getElementById('btn-copy').addEventListener('click', async () => {
    // IMPORTANT: navigator.clipboard.write() must be called SYNCHRONOUSLY after
    // the user gesture. Any await before the write loses the gesture context
    // and the browser rejects with NotAllowedError. ClipboardItem accepts
    // Promises that resolve to Blobs — the gesture is preserved across them.
    const htmlPromise = getExportHtml();

    let copiedRich = false;
    let lastError = null;

    if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
      try {
        // IMPORTANT: text/plain must NOT also be the full HTML. Gmail (and
        // several webmail editors) paste the html flavour AND then append the
        // plain flavour, which is what produced two copies of the email.
        // A short label keeps the plain flavour harmless.
        const item = new ClipboardItem({
          'text/html':  htmlPromise.then((h) => new Blob([h], { type: 'text/html' })),
          'text/plain': new Blob([plainFallbackLabel()], { type: 'text/plain' })
        });
        await navigator.clipboard.write([item]);
        copiedRich = true;
      } catch (e) {
        lastError = e;
      }
    }

    if (!copiedRich) {
      try {
        const html = await htmlPromise;
        await navigator.clipboard.writeText(html);
      } catch (e) {
        toast('Copy failed — try Download HTML instead');
        console.error('Copy failed:', lastError || e);
        return;
      }
    }

    toast(copiedRich ? 'Copied! Paste into Gmail compose' : 'HTML source copied');
  });

  document.getElementById('btn-download').addEventListener('click', async () => {
    const html = await getExportHtml();
    const filename =
      (state.productName || 'ORANGEHRM').replace(/\s+/g, '-') +
      '-' +
      (state.version || 'release').replace(/\s+/g, '-') +
      '.html';
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Downloaded ' + filename);
  });

  // ---------- Send test email ----------
  // Opens a modal: user enters email + subject; we copy the rendered HTML to
  // the clipboard and open the appropriate compose window pre-filled with
  // the recipient and subject. They paste (Cmd/Ctrl-V) into the body.
  document.getElementById('btn-send-test').addEventListener('click', () => {
    openSendTestModal();
  });

  function openSendTestModal() {
    const lastEmail = localStorage.getItem('release-email-generator:last-email') || '';
    const subjectDefault = `${state.productName || 'ORANGEHRM'} ${state.version || ''} Release`.trim();

    const backdrop = document.createElement('div');
    backdrop.className = 'icon-picker-backdrop';
    const modal = document.createElement('div');
    modal.className = 'icon-picker-modal send-test-modal';

    modal.innerHTML = `
      <div class="picker-head">
        <div>
          <div class="picker-title">Send test email</div>
          <div class="picker-sub">We'll copy the HTML and open your compose window — just paste into the body and hit Send</div>
        </div>
        <button class="picker-close" type="button" aria-label="Close">×</button>
      </div>

      <div class="picker-section">
        <div class="field">
          <label class="field-label">Recipient email <span class="req">*</span></label>
          <input id="send-test-email" type="email" class="input" placeholder="you@orangehrm.com" value="${esc(lastEmail)}" autocomplete="email">
        </div>
        <div class="field">
          <label class="field-label">Subject</label>
          <input id="send-test-subject" type="text" class="input" value="${esc(subjectDefault)}">
        </div>
        <div class="send-test-info">
          <strong>How it works:</strong>
          <ol>
            <li>Click a compose option below — we'll copy the HTML and open the compose window</li>
            <li>In the body, paste with <kbd>Ctrl/Cmd</kbd> + <kbd>V</kbd></li>
            <li>Click Send</li>
          </ol>
        </div>
      </div>

      <div class="picker-footer">
        <div class="picker-actions" style="flex-wrap:wrap;gap:8px;width:100%;justify-content:flex-end;">
          <button class="btn btn-ghost" id="send-test-cancel" type="button">Cancel</button>
          <button class="btn" id="send-test-mailto" type="button" title="Open your default mail client">Default mail app</button>
          <button class="btn" id="send-test-outlook" type="button" title="Open Outlook web compose">Outlook</button>
          <button class="btn btn-primary" id="send-test-gmail" type="button">Open in Gmail →</button>
        </div>
      </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const close = () => backdrop.remove();
    modal.querySelector('.picker-close').addEventListener('click', close);
    modal.querySelector('#send-test-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

    const emailInput = modal.querySelector('#send-test-email');
    const subjectInput = modal.querySelector('#send-test-subject');
    setTimeout(() => emailInput.focus(), 50);

    function validate() {
      const v = (emailInput.value || '').trim();
      if (!v || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
        emailInput.style.borderColor = 'var(--oxd-feedback-danger)';
        emailInput.focus();
        toast('Enter a valid email address');
        return null;
      }
      emailInput.style.borderColor = '';
      localStorage.setItem('release-email-generator:last-email', v);
      return { email: v, subject: (subjectInput.value || '').trim() };
    }

    // For all three flows we copy the HTML synchronously after the click
    async function copyHtmlForPaste() {
      const htmlPromise = getExportHtml();
      try {
        if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
          const item = new ClipboardItem({
            'text/html':  htmlPromise.then((h) => new Blob([h], { type: 'text/html' })),
            'text/plain': new Blob([plainFallbackLabel()], { type: 'text/plain' })
          });
          await navigator.clipboard.write([item]);
          return true;
        }
      } catch (e) {}
      try {
        await navigator.clipboard.writeText(await htmlPromise);
        return true;
      } catch (e) {
        return false;
      }
    }

    modal.querySelector('#send-test-gmail').addEventListener('click', async () => {
      const v = validate(); if (!v) return;
      const ok = await copyHtmlForPaste();
      const url =
        'https://mail.google.com/mail/?view=cm&fs=1&tf=cm' +
        '&to=' + encodeURIComponent(v.email) +
        '&su=' + encodeURIComponent(v.subject);
      window.open(url, '_blank', 'noopener');
      toast(ok ? 'HTML copied! Paste into Gmail body' : 'Gmail opened — Copy HTML separately');
      close();
    });

    modal.querySelector('#send-test-outlook').addEventListener('click', async () => {
      const v = validate(); if (!v) return;
      const ok = await copyHtmlForPaste();
      const url =
        'https://outlook.office.com/mail/deeplink/compose' +
        '?to=' + encodeURIComponent(v.email) +
        '&subject=' + encodeURIComponent(v.subject);
      window.open(url, '_blank', 'noopener');
      toast(ok ? 'HTML copied! Paste into Outlook body' : 'Outlook opened — Copy HTML separately');
      close();
    });

    modal.querySelector('#send-test-mailto').addEventListener('click', async () => {
      const v = validate(); if (!v) return;
      const ok = await copyHtmlForPaste();
      // mailto: body can't contain HTML reliably — we use clipboard for the body
      const url = 'mailto:' + encodeURIComponent(v.email) + '?subject=' + encodeURIComponent(v.subject);
      window.location.href = url;
      toast(ok ? 'HTML copied! Paste into your mail app body' : 'Mail app opened — Copy HTML separately');
      close();
    });
  }

  // small esc helper (separate from email-side esc)
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset all fields to defaults? This will clear any uploaded images.')) return;
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    localStorage.removeItem(LS_KEY);
    // Re-mount the form
    formPane.innerHTML = '';
    formPane.appendChild(makeSection({ step: '1', title: 'Release info', sub: 'Logo, version, tagline, hero image', open: true, build: buildReleaseInfo }));
    formPane.appendChild(makeSection({ step: '2', title: 'Features', sub: 'What\u2019s new — modules with bullet items', open: true, build: buildFeaturesSection }));
    formPane.appendChild(makeSection({ step: '3', title: 'Feature Highlights', sub: 'GIF/video walkthrough block', open: false, build: buildHighlightsSection }));
    formPane.appendChild(makeSection({ step: '4', title: 'Enhancements', sub: 'Smaller updates list', open: false, build: buildEnhancementsSection }));
    formPane.appendChild(makeSection({ step: '5', title: 'Hosted Environment', sub: 'Demo URL + credentials', open: false, build: buildHostedSection }));
    formPane.appendChild(makeSection({ step: '6', title: 'Stakeholder Demo', sub: 'Links to slides, video, release notes', open: false, build: buildDemoSection }));
    formPane.appendChild(makeSection({ step: '7', title: 'Footer tagline', sub: 'Closing message', open: false, build: buildFooterSection }));
    scheduleRender();
    toast('Reset to defaults');
  });

  // ---------- Initial render ----------
  scheduleRender();
  hydrateIcons();
  hydrateLogoAspect();
})();
