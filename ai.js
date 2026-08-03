/* =============================================================
   AI image generation
   -------------------------------------------------------------
   Talks to a server-side proxy (see deploy/api/gemini-image.php)
   so the Gemini API key stays on the server. Exposes a small
   modal: prompt in, image data URL out.
   ============================================================= */

(function (global) {
  'use strict';

  function endpoint() {
    const cfg = global.RELEASE_EMAIL_CONFIG || {};
    return cfg.aiEndpoint || '';
  }

  function isEnabled() {
    return !!endpoint();
  }

  const PRESETS = [
    {
      label: 'Product hero',
      text: 'A wide cinematic hero banner for an enterprise HR software release announcement. Dark navy background (#050a1f), soft orange and amber light streaks, abstract geometric shapes suggesting dashboards and data. No text, no logos, no people.'
    },
    {
      label: 'Abstract tech',
      text: 'Abstract dark technology background with flowing gradient ribbons in orange and violet over deep navy, subtle grid lines, soft depth of field. Minimal, premium, no text.'
    },
    {
      label: 'Team / workplace',
      text: 'Modern office scene, soft natural light, a diverse team collaborating around a screen, shallow depth of field, muted warm colour grade, editorial photography style. No text.'
    },
    {
      label: 'Celebration',
      text: 'Minimal celebratory banner on a deep navy background with soft amber confetti shapes and a warm glow from the lower right. Elegant and restrained, no text, no people.'
    }
  ];

  async function generate(prompt, aspect) {
    const url = endpoint();
    if (!url) throw new Error('AI generation is not configured on this server.');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt, aspect: aspect || '16:9' })
    });
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error('The server returned an unreadable response. Check that the proxy endpoint is reachable.');
    }
    if (!res.ok || data.error) {
      throw new Error(data && data.error ? data.error : 'Image generation failed (HTTP ' + res.status + ').');
    }
    if (!data.dataUrl) throw new Error('No image was returned.');
    return data.dataUrl;
  }

  // opts: { title, aspect, onSelect(dataUrl) }
  function open(opts) {
    opts = opts || {};
    const backdrop = document.createElement('div');
    backdrop.className = 'icon-picker-backdrop';
    const modal = document.createElement('div');
    modal.className = 'icon-picker-modal ai-modal';

    modal.innerHTML = `
      <div class="picker-head">
        <div>
          <div class="picker-title">Generate image with AI</div>
          <div class="picker-sub">${opts.title ? String(opts.title) : 'Describe the image you want'}</div>
        </div>
        <button class="picker-close" type="button" aria-label="Close">×</button>
      </div>
      <div class="picker-section ai-body">
        <div class="field" style="margin-top:0;">
          <label class="field-label">Starting points</label>
          <div class="ai-presets" id="ai-presets"></div>
        </div>
        <div class="field">
          <label class="field-label">Prompt <span class="req">*</span></label>
          <textarea id="ai-prompt" class="textarea" rows="5" placeholder="A wide cinematic banner on a deep navy background…"></textarea>
          <div class="field-hint">Say what should be in frame, the mood, and the colours. Ask for “no text” — generated lettering is usually malformed.</div>
        </div>
        <div class="field">
          <label class="field-label">Aspect ratio</label>
          <div id="ai-aspect"></div>
        </div>
        <div class="ai-result" id="ai-result"></div>
      </div>
      <div class="picker-footer">
        <div class="ai-status" id="ai-status"></div>
        <div class="picker-actions">
          <button class="btn btn-ghost" id="ai-cancel" type="button">Cancel</button>
          <button class="btn" id="ai-generate" type="button">Generate</button>
          <button class="btn btn-primary" id="ai-use" type="button" disabled>Use this image</button>
        </div>
      </div>
    `;
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const promptEl = modal.querySelector('#ai-prompt');
    const statusEl = modal.querySelector('#ai-status');
    const resultEl = modal.querySelector('#ai-result');
    const useBtn = modal.querySelector('#ai-use');
    const genBtn = modal.querySelector('#ai-generate');
    let currentImage = null;
    let aspect = opts.aspect || '16:9';

    const presetsEl = modal.querySelector('#ai-presets');
    PRESETS.forEach((p) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ai-preset';
      b.textContent = p.label;
      b.addEventListener('click', () => {
        promptEl.value = p.text;
        promptEl.focus();
      });
      presetsEl.appendChild(b);
    });

    const aspectEl = modal.querySelector('#ai-aspect');
    const aspectWrap = document.createElement('div');
    aspectWrap.className = 'segmented';
    ['16:9', '4:3', '3:2', '1:1'].forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'segmented-btn' + (a === aspect ? ' selected' : '');
      b.innerHTML = `<span class="segmented-label">${a}</span>`;
      b.addEventListener('click', () => {
        aspect = a;
        aspectWrap.querySelectorAll('.segmented-btn').forEach((el) => el.classList.remove('selected'));
        b.classList.add('selected');
      });
      aspectWrap.appendChild(b);
    });
    aspectEl.appendChild(aspectWrap);

    function close() { backdrop.remove(); }
    modal.querySelector('.picker-close').addEventListener('click', close);
    modal.querySelector('#ai-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

    genBtn.addEventListener('click', async () => {
      const prompt = (promptEl.value || '').trim();
      if (!prompt) {
        promptEl.focus();
        statusEl.textContent = 'Enter a prompt first.';
        statusEl.className = 'ai-status is-error';
        return;
      }
      genBtn.disabled = true;
      useBtn.disabled = true;
      statusEl.className = 'ai-status is-busy';
      statusEl.textContent = 'Generating… this can take up to a minute.';
      resultEl.innerHTML = '<div class="ai-skeleton"></div>';
      try {
        const dataUrl = await generate(prompt, aspect);
        currentImage = dataUrl;
        resultEl.innerHTML = '';
        const img = document.createElement('img');
        img.src = dataUrl;
        img.className = 'ai-preview-img';
        img.alt = '';
        resultEl.appendChild(img);
        useBtn.disabled = false;
        statusEl.className = 'ai-status is-ok';
        statusEl.textContent = 'Done. Generate again for a different take.';
        genBtn.textContent = 'Regenerate';
      } catch (err) {
        currentImage = null;
        resultEl.innerHTML = '';
        statusEl.className = 'ai-status is-error';
        statusEl.textContent = err.message || 'Generation failed.';
      } finally {
        genBtn.disabled = false;
      }
    });

    useBtn.addEventListener('click', () => {
      if (!currentImage) return;
      if (typeof opts.onSelect === 'function') opts.onSelect(currentImage);
      close();
    });

    setTimeout(() => promptEl.focus(), 50);
  }

  global.AIImage = { open, generate, isEnabled, PRESETS };
})(window);
