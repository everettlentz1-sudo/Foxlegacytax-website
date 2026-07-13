/* Fox Legacy Tax Services — shared site behavior (vanilla JS, no dependencies) */

(function () {
  'use strict';

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.hamburger');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- "Which level fits me?" quiz ---------- */
  function initQuiz() {
    var quiz = document.getElementById('tier-quiz');
    if (!quiz) return;

    var steps = Array.prototype.slice.call(quiz.querySelectorAll('.quiz-step'));
    var progressWrap = quiz.querySelector('.quiz-progress');
    var progressSegments = progressWrap ? Array.prototype.slice.call(progressWrap.children) : [];
    var resultPanel = quiz.querySelector('.quiz-result');
    var resultTitle = quiz.querySelector('.result-tier');
    var resultCopy = quiz.querySelector('.result-copy');
    var resultBookBtn = quiz.querySelector('.result-book-btn');
    var restartBtn = quiz.querySelector('.quiz-restart');

    var answers = {};
    var currentStep = 0;

    var tierInfo = {
      essential: {
        name: 'Essential',
        blurb: 'A straightforward return, prepared right and filed on time — no year-round check-ins needed.',
        anchor: '#essential'
      },
      advisory: {
        name: 'Advisory',
        blurb: 'You want more than a once-a-year visit — regular check-ins to plan ahead, not just file after the fact.',
        anchor: '#advisory'
      },
      premier: {
        name: 'Premier',
        blurb: 'Between a business, ongoing planning needs, and a financial advisor to coordinate with, you get support whenever you need it.',
        anchor: '#premier'
      }
    };

    function showStep(index) {
      steps.forEach(function (step, i) {
        step.classList.toggle('is-active', i === index);
      });
      progressSegments.forEach(function (seg, i) {
        seg.classList.toggle('filled', i <= index);
      });
    }

    quiz.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = btn.closest('.quiz-step');
        var question = step.getAttribute('data-question');
        answers[question] = btn.getAttribute('data-value');

        if (currentStep < steps.length - 1) {
          currentStep++;
          showStep(currentStep);
        } else {
          revealResult();
        }
      });
    });

    function scoreTier() {
      var score = 0;
      if (answers.business === 'yes') score += 2;
      if (answers.checkins === 'yes') score += 1;
      if (answers.advisor === 'yes') score += 2;
      if (answers.complexity === 'complex') score += 2;
      else if (answers.complexity === 'moderate') score += 1;

      if (score >= 4) return 'premier';
      if (score >= 2) return 'advisory';
      return 'essential';
    }

    function revealResult() {
      var tierKey = scoreTier();
      var info = tierInfo[tierKey];

      steps.forEach(function (step) { step.classList.remove('is-active'); });
      if (progressWrap) progressWrap.style.display = 'none';

      resultTitle.textContent = info.name;
      resultCopy.textContent = info.blurb;
      resultBookBtn.href = 'https://calendar.app.google/As5t43ddRw9j4L8s5';

      var detailsLink = quiz.querySelector('.result-details-link');
      if (detailsLink) detailsLink.href = 'services.html' + info.anchor;

      resultPanel.classList.add('is-active');
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        answers = {};
        currentStep = 0;
        resultPanel.classList.remove('is-active');
        if (progressWrap) progressWrap.style.display = '';
        showStep(0);
      });
    }

    showStep(0);
  }

  /* ---------- Price estimator ---------- */
  function initEstimator() {
    var estimator = document.getElementById('price-estimator');
    if (!estimator) return;

    var basePrices = { essential: 175, advisory: 295, premier: 495 };
    var selectedTier = 'essential';
    var pills = Array.prototype.slice.call(estimator.querySelectorAll('.tier-pill'));
    var totalEl = estimator.querySelector('.estimator-total');
    var baseLabelEl = estimator.querySelector('.base-tier-label');

    var checkboxItems = Array.prototype.slice.call(estimator.querySelectorAll('input[type="checkbox"].check-toggle'));
    var stepperItems = Array.prototype.slice.call(estimator.querySelectorAll('.stepper'));

    function currency(n) {
      return '$' + n.toLocaleString('en-US');
    }

    function recalc() {
      var total = basePrices[selectedTier];

      checkboxItems.forEach(function (box) {
        if (box.checked) {
          total += parseFloat(box.getAttribute('data-price'), 10);
        }
      });

      stepperItems.forEach(function (stepper) {
        var count = parseInt(stepper.querySelector('output').textContent, 10) || 0;
        var price = parseFloat(stepper.getAttribute('data-price'), 10);
        total += count * price;
      });

      totalEl.textContent = currency(total);
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('is-selected'); });
        pill.classList.add('is-selected');
        selectedTier = pill.getAttribute('data-tier');
        if (baseLabelEl) {
          baseLabelEl.textContent = pill.textContent.trim() + ' base: ' + currency(basePrices[selectedTier]);
        }
        recalc();
      });
    });

    checkboxItems.forEach(function (box) {
      box.addEventListener('change', recalc);
    });

    stepperItems.forEach(function (stepper) {
      var output = stepper.querySelector('output');
      var max = parseInt(stepper.getAttribute('data-max'), 10) || 10;
      stepper.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var current = parseInt(output.textContent, 10) || 0;
          var dir = btn.getAttribute('data-dir') === 'inc' ? 1 : -1;
          var next = Math.min(Math.max(current + dir, 0), max);
          output.textContent = next;
          recalc();
        });
      });
    });

    recalc();
  }

  /* ---------- Resource accordions (progressive enhancement for <details>) ---------- */
  // Native <details>/<summary> requires no JS; nothing to wire up here.

  /* ---------- Contact mailto form ---------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('#cf-name').value.trim();
      var email = form.querySelector('#cf-email').value.trim();
      var phone = form.querySelector('#cf-phone').value.trim();
      var message = form.querySelector('#cf-message').value.trim();

      var subject = 'Website inquiry from ' + (name || 'a website visitor');
      var bodyLines = [
        'Name: ' + name,
        'Email: ' + email,
        'Phone: ' + (phone || 'Not provided'),
        '',
        message
      ];

      var mailto = 'mailto:info@foxlegacytax.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(bodyLines.join('\n'));

      window.location.href = mailto;
    });
  }

  /* ---------- Client helper chatbot ---------- */
  /* Rules-based guide — no API keys, no monthly cost, works on any static host. */
  function initChatbot() {
    var BOOKING_URL = 'https://calendar.app.google/As5t43ddRw9j4L8s5';
    var PORTAL_URL = 'https://foxlegacytax.securefilepro.com/portal/#/login';

    var root = document.createElement('div');
    root.id = 'flt-chat';
    root.innerHTML =
      '<button type="button" class="chat-launcher" aria-expanded="false" aria-controls="flt-chat-panel" aria-label="Chat with us">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
      '</button>' +
      '<div class="chat-panel" id="flt-chat-panel" role="dialog" aria-label="Fox Legacy Tax assistant" hidden>' +
        '<div class="chat-head">' +
          '<strong>Fox Legacy Assistant</strong>' +
          '<span>Here to point you the right way</span>' +
          '<button type="button" class="chat-close" aria-label="Close chat">&times;</button>' +
        '</div>' +
        '<div class="chat-messages" aria-live="polite"></div>' +
        '<div class="chat-chips" role="group" aria-label="Quick questions"></div>' +
        '<form class="chat-input-row">' +
          '<label class="visually-hidden" for="flt-chat-input">Type your question</label>' +
          '<input id="flt-chat-input" type="text" placeholder="Type a question&hellip;" autocomplete="off">' +
          '<button type="submit" class="chat-send" aria-label="Send">&#10148;</button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(root);

    var launcher = root.querySelector('.chat-launcher');
    var panel = root.querySelector('.chat-panel');
    var closeBtn = root.querySelector('.chat-close');
    var messagesEl = root.querySelector('.chat-messages');
    var chipsEl = root.querySelector('.chat-chips');
    var form = root.querySelector('.chat-input-row');
    var input = root.querySelector('#flt-chat-input');

    var quickChips = [
      'Pricing & tiers',
      'Book an appointment',
      "Where's my refund?",
      'Make a payment',
      'Talk to a person'
    ];

    var answers = {
      pricing:
        'Our prep starts at three transparent tiers: <strong>Essential $175</strong>, <strong>Advisory $295</strong>, and <strong>Premier $495</strong> — add-ons are always disclosed up front. No surprises, ever. ' +
        'You can <a href="services.html">compare tiers</a> or try the <a href="services.html#estimator">price estimator</a>.',
      book:
        'Happy to get you on the calendar! <a href="' + BOOKING_URL + '" target="_blank" rel="noopener">Pick a time here</a> — consultations are free. Walk-ins are welcome too.',
      refund:
        'You can check your federal refund at <a href="https://www.irs.gov/wheres-my-refund" target="_blank" rel="noopener">IRS: Where’s My Refund</a> and your Wisconsin refund at the <a href="https://www.revenue.wi.gov/Pages/Apps/TaxReturnStatus.aspx" target="_blank" rel="noopener">WI Dept. of Revenue</a>. Have your SSN, filing status, and refund amount handy.',
      payment:
        'You can <a href="payment.html">pay your invoice securely online</a> through Converge, our payment processor. You can also pay in office or from your refund.',
      portal:
        'Your documents live in our secure client portal. <a href="' + PORTAL_URL + '" target="_blank" rel="noopener">Sign in here</a> to upload or view files any time.',
      person:
        'You bet — call or text us at <a href="tel:+19203851190">(920) 385-1190</a>, email <a href="mailto:info@foxlegacytax.com">info@foxlegacytax.com</a>, or just stop in. Walk-ins welcome!',
      hours:
        'We’re in Oshkosh, WI — open Mon–Fri 9:00 AM–5:00 PM, Saturdays by appointment. Call us at <a href="tel:+19203851190">(920) 385-1190</a> or see the <a href="contact.html">contact page</a>.',
      business:
        'For business owners we offer <strong>Business Essentials</strong> — bookkeeping, payroll, strategy, and new-business setup at a flat $50/hour, billed only for time used. <a href="business.html">See how it works</a>.',
      resources:
        'Check our <a href="resources.html">client resources</a> — due dates, an appointment checklist, record retention guidance, and a W-4 withholding checkup.',
      greeting:
        'Hi there! I can point you to pricing, booking, refund tracking, payments, or the client portal. What do you need?',
      fallback:
        'I want to make sure you get a real answer, not a runaround. Try one of the buttons below, or call us at <a href="tel:+19203851190">(920) 385-1190</a> — a person will pick up.'
    };

    var intents = [
      { re: /(price|pricing|cost|fee|charge|how much|estimat|tier|package)/i, key: 'pricing' },
      { re: /(refund|where.?s my (money|refund)|return status)/i, key: 'refund' },
      { re: /(book|appoint|schedul|consult|meet)/i, key: 'book' },
      { re: /(portal|upload|document|file|w-?2|1099|secure)/i, key: 'portal' },
      { re: /(pay|payment|invoice|bill|owe)/i, key: 'payment' },
      { re: /(hour|open|location|address|where are|directions)/i, key: 'hours' },
      { re: /(person|human|call|phone|talk|speak|someone)/i, key: 'person' },
      { re: /(business|bookkeep|payroll|llc|self.?employ|start.?up|rental)/i, key: 'business' },
      { re: /(due date|deadline|checklist|record|retention|withhold|w-?4|resource)/i, key: 'resources' },
      { re: /^(hi|hey|hello|howdy|good (morning|afternoon|evening))\b/i, key: 'greeting' }
    ];

    var chipToKey = {
      'Pricing & tiers': 'pricing',
      'Book an appointment': 'book',
      "Where's my refund?": 'refund',
      'Make a payment': 'payment',
      'Talk to a person': 'person'
    };

    function addMessage(html, who) {
      var bubble = document.createElement('div');
      bubble.className = 'chat-msg chat-msg--' + who;
      if (who === 'user') {
        bubble.textContent = html;
      } else {
        bubble.innerHTML = html;
      }
      messagesEl.appendChild(bubble);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function botReply(text) {
      window.setTimeout(function () {
        addMessage(text, 'bot');
      }, 250);
    }

    function matchIntent(text) {
      for (var i = 0; i < intents.length; i++) {
        if (intents[i].re.test(text)) return answers[intents[i].key];
      }
      return answers.fallback;
    }

    quickChips.forEach(function (label) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chat-chip';
      chip.textContent = label;
      chip.addEventListener('click', function () {
        addMessage(label, 'user');
        botReply(answers[chipToKey[label]]);
      });
      chipsEl.appendChild(chip);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      botReply(matchIntent(text));
      input.value = '';
    });

    var greeted = false;

    function openChat() {
      panel.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      if (!greeted) {
        greeted = true;
        botReply('Hi! I’m the Fox Legacy helper. I can point you to pricing, booking, your refund, payments, or the client portal — or connect you with a real person.');
      }
      input.focus();
    }

    function closeChat() {
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    }

    launcher.addEventListener('click', function () {
      if (panel.hidden) { openChat(); } else { closeChat(); }
    });

    closeBtn.addEventListener('click', closeChat);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) closeChat();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initQuiz();
    initEstimator();
    initContactForm();
    initChatbot();
  });
})();
