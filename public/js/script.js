
(function () {
  const initMobileMenu = () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (!hamburger || !navMenu) return;

    const setMenuOpen = (isOpen) => {
      navMenu.classList.toggle('active', isOpen);
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    };

    hamburger.addEventListener('click', () => {
      setMenuOpen(!navMenu.classList.contains('active'));
    });

    navMenu.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => setMenuOpen(false));
    });
  };

  initMobileMenu();

  const counters = Array.from(document.querySelectorAll('.stat-number[data-target]'));
  if (counters.length) {
    const animateCounter = (el) => {
      const target = Number(el.getAttribute('data-target') || 0);
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const value = Math.floor(target * p);
        el.textContent = String(value);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = String(target);
      }
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounter(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    counters.forEach((c) => io.observe(c));
  }

  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  let portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
  if (filterButtons.length && portfolioItems.length) {
    const applyFilter = (category) => {
      portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
      portfolioItems.forEach((item) => {
        const itemCat = item.getAttribute('data-category');
        const show = category === 'all' || itemCat === category;
        item.style.display = show ? '' : 'none';
      });
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');
        applyFilter(category);
      });
    });
  }

  const loadMoreBtn = document.querySelector('.loadmore-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      const grid = document.querySelector('.portfolio-grid');
      if (!grid) return;

      const loaded = Number(loadMoreBtn.dataset.loaded || '0');
      const total = Number(loadMoreBtn.dataset.total || '0');
      if (total && loaded >= total) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> Все работы загружены';
        return;
      }

      loadMoreBtn.disabled = true;
      const oldHtml = loadMoreBtn.innerHTML;
      loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';

      try {
        const res = await fetch(`/api/photos?offset=${loaded}&limit=4`);
        const data = await res.json();

        (data.items || []).forEach((p) => {
          const el = document.createElement('div');
          el.className = 'portfolio-item';
          el.setAttribute('data-category', p.category);
          el.innerHTML = `
            <div class="portfolio-image">
              <img src="${p.imagePath}" alt="${(p.title || '').replace(/"/g, '&quot;')}">
              <div class="portfolio-overlay">
                <div class="portfolio-info"><h3>${p.title || ''}</h3><p>${p.subtitle || ''}</p></div>
              </div>
            </div>
          `;
          grid.appendChild(el);
        });

        const newLoaded = loaded + (data.items ? data.items.length : 0);
        loadMoreBtn.dataset.loaded = String(newLoaded);
        loadMoreBtn.dataset.total = String(data.total || total);

        const active = document.querySelector('.filter-btn.active');
        const cat = active ? active.getAttribute('data-filter') : 'all';
        if (active) active.click();
        else {
          portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
        }

        if ((data.total || total) && newLoaded >= (data.total || total)) {
          loadMoreBtn.disabled = true;
          loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> Все работы загружены';
          return;
        }
      } catch (e) {
        console.error(e);
        loadMoreBtn.innerHTML = oldHtml;
        loadMoreBtn.disabled = false;
        alert('Не удалось загрузить работы. Попробуйте еще раз.');
        return;
      }

      loadMoreBtn.innerHTML = oldHtml;
      loadMoreBtn.disabled = false;
    });
  }

  // Chatbot widget functionality
  const chatWidget = document.getElementById('chatWidget');
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatPanel = document.getElementById('chatPanel');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatMessages = document.getElementById('chatMessages');

  if (chatWidget && chatToggleBtn && chatPanel) {
    let isLoading = false;

    // Toggle chat panel open/close
    chatToggleBtn.addEventListener('click', () => {
      const isActive = chatPanel.classList.toggle('active');
      if (isActive) {
        chatInput.focus();
      }
    });

    chatCloseBtn.addEventListener('click', () => {
      chatPanel.classList.remove('active');
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (chatPanel.classList.contains('active') &&
        !chatWidget.contains(e.target)) {
        chatPanel.classList.remove('active');
      }
    });

    // Send message on button click
    chatSendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isLoading) {
        sendMessage();
      }
    });

    async function sendMessage() {
      const message = chatInput.value.trim();
      if (!message || isLoading) return;

      // Add user message to UI
      addMessageBubble(message, 'user');
      chatInput.value = '';
      isLoading = true;
      chatSendBtn.disabled = true;

      // Show loading indicator
      const loadingEl = document.createElement('div');
      loadingEl.className = 'chat-message loading';
      loadingEl.innerHTML = '<div class="message-content">Печатает...</div>';
      chatMessages.appendChild(loadingEl);
      scrollToBottom();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });

        loadingEl.remove();

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.reply || 'Извините, не удалось получить ответ.';

        addMessageBubble(reply, 'bot');
      } catch (error) {
        console.error('Chat error:', error);
        loadingEl.remove();
        addMessageBubble('Ошибка: не удалось подключиться к серверу. Проверьте консоль.', 'bot');
      } finally {
        isLoading = false;
        chatSendBtn.disabled = false;
        chatInput.focus();
      }
    }

    function addMessageBubble(text, role) {
      const bubble = document.createElement('div');
      bubble.className = `chat-message ${role}`;
      bubble.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
      chatMessages.appendChild(bubble);
      scrollToBottom();
    }

    function scrollToBottom() {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }
  }
  // --- Flash auto-hide and helper ---
  function removeFlash(el) {
    if (!el) return;
    try { el.remove(); } catch (e) { el.style.display = 'none'; }
  }

  function showFlash(type, message) {
    // Create flash element consistent with server styles
    const existing = document.querySelector('.flash');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = `flash ${type}`;
    div.innerHTML = `<div class="flash-inner">${message}</div>`;
    document.body.insertBefore(div, document.body.firstChild);
    // remove after 3s
    setTimeout(() => {
      // play slide up by adding opacity 0 then remove
      removeFlash(div);
    }, 3000);
  }

  // Auto-hide server-rendered flash after 3s
  document.querySelectorAll('.flash').forEach((f) => {
    setTimeout(() => removeFlash(f), 3000);
  });

  // --- Phone mask for inputs[type=tel] or name=phone ---
  function formatPhoneValue(value) {
    // keep digits only
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    // assume leading 7 or 8 or missing -> format as +7 (xxx) xxx-xx-xx
    let d = digits;
    if (d.length === 11 && (d[0] === '8' || d[0] === '7')) d = d.slice(1);
    if (d.length > 10) d = d.slice(-10);
    const part1 = d.slice(0, 3);
    const part2 = d.slice(3, 6);
    const part3 = d.slice(6, 8);
    const part4 = d.slice(8, 10);
    let res = '+7';
    if (part1) res += ` (${part1}` + (part1.length === 3 ? ')' : '');
    if (part2) res += ` ${part2}`;
    if (part3) res += part3 ? `-${part3}` : '';
    if (part4) res += part4 ? `-${part4}` : '';
    return res;
  }

  document.querySelectorAll('input[type="tel"], input[name="phone"]').forEach((tel) => {
    // improved mask with caret preservation
    tel.addEventListener('input', (e) => {
      const cur = e.target;
      const raw = cur.value;
      const caret = cur.selectionStart || 0;
      // count digits before caret
      const digitsBefore = (raw.slice(0, caret).match(/\d/g) || []).length;

      const formatted = formatPhoneValue(raw);
      cur.value = formatted;

      // place caret after the same number of digits
      if (digitsBefore === 0) {
        cur.selectionStart = cur.selectionEnd = 0;
        return;
      }
      let digitCount = 0;
      let newPos = formatted.length;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) digitCount++;
        if (digitCount >= digitsBefore) { newPos = i + 1; break; }
      }
      cur.selectionStart = cur.selectionEnd = newPos;
    });
  });

  // --- Client-side validation for forms ---
  function validateForm(form) {
    const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
    for (const inp of inputs) {
      // skip disabled, hidden, or invisible inputs (display:none, visibility:hidden, etc.)
      if (inp.disabled || inp.type === 'hidden') continue;
      const style = window.getComputedStyle(inp);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      if (inp.hasAttribute('required')) {
        if (!inp.value || inp.value.trim() === '') {
          return { ok: false, message: 'Пожалуйста, заполните все обязательные поля.' };
        }
      }
      if (inp.type === 'email' && inp.value) {
        const re = /^\S+@\S+\.\S+$/;
        if (!re.test(inp.value)) return { ok: false, message: 'Введите корректный email.' };
      }
      if ((inp.type === 'tel' || inp.name === 'phone') && inp.value) {
        const digits = inp.value.replace(/\D/g, '');
        if (digits.length < 10) return { ok: false, message: 'Введите корректный номер телефона.' };
      }
    }
    return { ok: true };
  }

  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      // skip if form has data-no-validate
      if (form.hasAttribute('data-no-validate')) return;
      const v = validateForm(form);
      if (!v.ok) {
        e.preventDefault();
        showFlash('error', v.message);
      }
    });
  });

})();
