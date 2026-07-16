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

    var BOOK_CTA =
      '<a class="chat-cta" href="' + BOOKING_URL + '" target="_blank" rel="noopener">Book a free appointment</a>';
    var CALL_LINK = '<a href="tel:+19203851190">(920) 385-1190</a>';

    var quickChips = [
      'Pricing & tiers',
      'Book an appointment',
      "Where's my refund?",
      "I'm a new client",
      'Make a payment',
      'Talk to a person'
    ];

    var answers = {
      pricing:
        'Fair question — and unlike a lot of firms, we’ll actually answer it. We have three transparent tiers: <strong>Essential ($175)</strong> for a clean, accurate return; <strong>Advisory ($295)</strong> if you also want check-ins through the year; and <strong>Premier ($495)</strong> for support whenever you need it, including coordination with your financial advisor. Add-ons depend on your situation, but every one is disclosed before we start — no surprises, ever.<br><br>' +
        'You can <a href="services.html">compare the tiers</a>, try the <a href="services.html#estimator">price estimator</a>, or better yet — sit down with us for free and we’ll quote your exact price on the spot.<br>' + BOOK_CTA,
      book:
        'That’s the best move — a quick, free conversation and you’ll know exactly where you stand. Pick whatever time works for you, and if you’d rather just stop in, walk-ins are always welcome.<br>' + BOOK_CTA,
      refundStatus:
        'If you’ve already filed, here’s where to check on your money:<br><br>' +
        '&bull; <strong>Federal:</strong> <a href="https://www.irs.gov/wheres-my-refund" target="_blank" rel="noopener">IRS “Where’s My Refund”</a><br>' +
        '&bull; <strong>Wisconsin:</strong> <a href="https://www.revenue.wi.gov/Pages/Apps/TaxReturnStatus.aspx" target="_blank" rel="noopener">WI Dept. of Revenue refund tracker</a><br><br>' +
        'Have your SSN, filing status, and exact refund amount handy. If it’s been more than 21 days on a federal e-file (or something looks stuck), don’t wrestle with the IRS alone — bring it to us and we’ll help you figure out what’s going on.<br>' + BOOK_CTA,
      refundMax:
        'Love to hear it — that’s literally our job. The difference between an okay refund and your <em>best</em> refund usually comes down to credits and deductions people don’t know they qualify for: earned income credit, education credits, homestead credit, retirement contributions, and more.<br><br>' +
        'The surest way to keep more of what you earned is to sit down with a professional who will actually dig for those — and the consultation is free. Bring last year’s return and we’ll tell you straight if there’s money being left on the table.<br>' + BOOK_CTA,
      payment:
        'Paying your Fox Legacy invoice is easy, and you’ve got three ways to do it:<br><br>' +
        '&bull; <a href="payment.html">Pay securely online</a> through Converge, our payment processor<br>' +
        '&bull; Pay in office by card, check, or cash<br>' +
        '&bull; Or have your fee taken right out of your refund — nothing out of pocket<br><br>' +
        'Questions about your invoice? Call us at ' + CALL_LINK + ' and a person will pick up.',
      portal:
        'Your documents live in our secure client portal — it’s the safest way to get us your W-2s, 1099s, and anything else (much safer than email). <a href="' + PORTAL_URL + '" target="_blank" rel="noopener">Sign in here</a> to upload or view files any time.<br><br>' +
        'First time using it, or not sure what documents we need? Book a quick appointment and we’ll walk you through the whole checklist.<br>' + BOOK_CTA,
      person:
        'You bet — we’re real people right here in Oshkosh. Call or text ' + CALL_LINK + ', email <a href="mailto:info@foxlegacytax.com">info@foxlegacytax.com</a>, or just stop in — walk-ins welcome. Prefer a set time so you don’t wait? Grab one here:<br>' + BOOK_CTA,
      hours:
        'You’ll find us at <strong>230 N Koeller St, Oshkosh, WI</strong> — open <strong>Mon–Fri 8:00 AM–6:00 PM</strong> and <strong>Sat 9:00 AM–3:00 PM</strong>, closed Sundays. Directions and a map are on the <a href="contact.html">contact page</a>.<br><br>' +
        'Want to guarantee a spot instead of chancing a walk-in? Booking takes about 30 seconds:<br>' + BOOK_CTA,
      business:
        'You’re in the right place — helping small business owners is a big part of what we do. <strong>Business Essentials</strong> covers bookkeeping, payroll, business strategy, and new-business setup at a flat <strong>$50/hour, billed only for the time you use</strong>. Flat-fee firms charge $150–500 a month whether you need it or not; with us you pay for actual work. <a href="business.html">See how it works</a>.<br><br>' +
        'Every business is different, so the free consultation is where this gets real — bring your books (messy is fine, we’ve seen worse) and we’ll map out what you actually need.<br>' + BOOK_CTA,
      newclient:
        'Welcome — you’re going to like how simple this is. Here’s the whole process:<br><br>' +
        '<strong>1.</strong> Book a free appointment (or walk in)<br>' +
        '<strong>2.</strong> Bring your documents — W-2s, 1099s, last year’s return if you have it<br>' +
        '<strong>3.</strong> We prepare your return, explain it in plain English, and quote your exact price before we start<br><br>' +
        'That’s it. No surprises, ever — and we don’t disappear on April 16.<br>' + BOOK_CTA,
      documents:
        'Great question — showing up prepared makes everything faster. The basics: photo ID, Social Security cards for you and any dependents, all W-2s and 1099s, and last year’s return if you have it. Depending on your situation: mortgage interest statements, tuition forms (1098-T), childcare costs, and charitable donations. The full list is in our <a href="resources.html">appointment checklist</a>.<br><br>' +
        'Not sure what applies to you? That’s exactly what the free consultation is for:<br>' + BOOK_CTA,
      irsLetter:
        'First: don’t panic, and don’t ignore it — IRS letters have deadlines, and most issues are very fixable when they’re handled early. Don’t call the IRS cold or pay anything until you understand what they’re actually asking.<br><br>' +
        'Bring the letter to us (unopened is fine!). We’ll read it, translate it into plain English, and tell you exactly what happens next. This is truly a “talk to a professional” moment:<br>' + BOOK_CTA,
      amended:
        'If something was missed or wrong on a return you already filed — yours or one another preparer did — an amended return can often recover money you were owed. We handle amendments for a flat <strong>$80</strong>, and we’ll tell you up front whether it’s worth filing before you spend a dime.<br><br>' +
        'Bring the return in question to a free consultation and we’ll take a look:<br>' + BOOK_CTA,
      deadline:
        'Key dates: federal and Wisconsin individual returns are generally due <strong>April 15</strong>; quarterly estimated payments hit in April, June, September, and January; and extensions give you until October 15 to <em>file</em> (but not to pay). The full rundown is on our <a href="resources.html">resources page</a>.<br><br>' +
        'Behind or cutting it close? Don’t stress — that’s what we’re here for. The sooner we talk, the more options you have:<br>' + BOOK_CTA,
      planning:
        'Now you’re thinking like our favorite kind of client — <strong>plan ahead, not after</strong>. Mid-year moves (adjusting your W-4, timing deductions, retirement contributions, estimated payments) are where real tax savings happen; by filing season most of it is locked in.<br><br>' +
        'Our Advisory tier includes up to 4 check-ins a year, and Premier gets you support whenever you need it. Start with a free conversation about where you stand:<br>' + BOOK_CTA,
      greeting:
        'Hi there! I can help with pricing, booking an appointment, tracking your refund, payments, the client portal, or what to bring. What do you need today?',
      fallback:
        'I want to make sure you get a real answer, not a runaround. Try one of the buttons below, call us at ' + CALL_LINK + ' — a person will pick up — or grab a free appointment and ask us everything in one sitting:<br>' + BOOK_CTA
    };

    /* Order matters: more specific patterns first. */
    var intents = [
      { re: /(where.?s?\s*(is\s*)?my\s*(refund|money)|refund status|track(ing)?\s*(my)?\s*refund|check\s*(on\s*)?(my)?\s*refund|still waiting|hasn.?t (come|arrived))/i, key: 'refundStatus' },
      { re: /(bigger|best|biggest|max|more money back|get a refund|want (a|my) refund|maximize|owe less|keep more)/i, key: 'refundMax' },
      { re: /refund/i, key: 'refundStatus' },
      { re: /(irs|audit|letter|notice|cp\d+|garnish|levy|lien|back tax)/i, key: 'irsLetter' },
      { re: /(amend|fix (my|a) return|made a mistake|wrong on my return|missed (a|some))/i, key: 'amended' },
      { re: /(deadline|due date|late|extension|behind|didn.?t file|haven.?t filed|quarterly)/i, key: 'deadline' },
      { re: /(plan(ning)?|strategy|withhold|w-?4|next year|save on tax|reduce my tax|lower my tax)/i, key: 'planning' },
      { re: /(new client|first time|never (been|filed)|how (do|does) (i|it|this) (start|work)|get started|where do i start)/i, key: 'newclient' },
      { re: /(what (do|should) i bring|documents? (do i )?need|checklist|paperwork|what to bring)/i, key: 'documents' },
      { re: /(price|pricing|cost|fee|charge|how much|estimat|tier|package|rate)/i, key: 'pricing' },
      { re: /(book|appoint|schedul|consult|meet|come in|sign up)/i, key: 'book' },
      { re: /(portal|upload|document|file|w-?2|1099|secure)/i, key: 'portal' },
      { re: /\b(pay|pays|paying|payment|invoice|bill|owe)\b/i, key: 'payment' },
      { re: /(hour|open|location|address|where are|directions|parking)/i, key: 'hours' },
      { re: /(person|human|call|phone|talk|speak|someone|real)/i, key: 'person' },
      { re: /(business|bookkeep|payroll|llc|self.?employ|start.?up|rental|side (gig|hustle)|contractor)/i, key: 'business' },
      { re: /^(hi|hey|hello|howdy|good (morning|afternoon|evening))\b/i, key: 'greeting' }
    ];

    var chipToKey = {
      'Pricing & tiers': 'pricing',
      'Book an appointment': 'book',
      "Where's my refund?": 'refundStatus',
      "I'm a new client": 'newclient',
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

    /* ----- Situation-aware composer -----
       Detects WHO the client is (rental owner, self-employed, investor, family…)
       and WHAT they want (maximize, plan, file), then builds a tailored answer:
       acknowledge → show specific value → recommend a tier → invite to book. */

    var situations = [
      {
        key: 'rental',
        re: /(rental|rent out|landlord|airbnb|vrbo|investment propert|duplex|tenant)/i,
        weight: 2,
        value: 'Rental properties are one of the biggest places people leave money on the table — depreciation alone is often worth thousands, plus repairs, mileage, insurance, and the passive-loss rules that DIY software regularly fumbles.'
      },
      {
        key: 'selfemp',
        re: /(self.?employ|freelanc|1099 income|contractor|side (gig|hustle)|small business|my business|own a business|llc|s.?corp|payroll|bookkeep)/i,
        weight: 2,
        value: 'Self-employment opens up deductions W-2 folks never see — home office, mileage, equipment, health insurance, retirement contributions — and we make sure quarterly estimates don’t bite you in April.'
      },
      {
        key: 'investor',
        re: /(stock|crypto|capital gain|brokerage|dividend|sold (some )?shares|k-?1)/i,
        weight: 1,
        value: 'Investment income means capital-gains treatment, loss harvesting, and cost-basis cleanup — small details that swing your bill by real money.'
      },
      {
        key: 'family',
        re: /(kids?\b|child|dependent|daycare|childcare|married|spouse|new baby)/i,
        weight: 0,
        value: 'Families qualify for more than they think — the Child Tax Credit, childcare credit, and earned income credit are exactly the kind of money that goes unclaimed every year.'
      },
      {
        key: 'home',
        re: /(bought a (house|home)|homeowner|mortgage|homestead|property tax)/i,
        weight: 0,
        value: 'Homeownership brings mortgage interest, property-tax deductions, and Wisconsin’s Homestead Credit into play.'
      },
      {
        key: 'student',
        re: /(student|tuition|college|university|1098-?t)/i,
        weight: 0,
        value: 'Education credits — up to $2,500 with the American Opportunity Credit — are among the most commonly missed money on a return.'
      },
      {
        key: 'retire',
        re: /(retir|social security|pension|\bira\b|401k)/i,
        weight: 1,
        value: 'Retirement income has its own playbook — how you draw down accounts and time Social Security genuinely changes what you owe.'
      }
    ];

    function tierPitch(totalWeight, hasBusiness) {
      var pitch;
      if (totalWeight >= 3) {
        pitch = 'With this many moving pieces, you’re a textbook fit for our <strong>Premier tier ($495)</strong> — consultations whenever you need them, plus direct coordination with your financial advisor, so every piece is pulling in the same direction.';
      } else if (totalWeight >= 1) {
        pitch = 'Based on that, you’d fit best in our <strong>Advisory tier ($295)</strong> — your return done right, plus up to 4 planning check-ins through the year so we’re maximizing <em>before</em> year-end, not after. (If you also work with a financial advisor, <strong>Premier ($495)</strong> loops them in directly.)';
      } else {
        pitch = 'Our <strong>Essential tier ($175)</strong> would cover you nicely — a clean, accurate return with every credit you qualify for. Want check-ins through the year too? That’s <strong>Advisory ($295)</strong>.';
      }
      if (hasBusiness) {
        pitch += ' And if you need bookkeeping or payroll handled, <strong>Business Essentials</strong> attaches to any tier at a flat $50/hour — you only pay for time you use.';
      }
      return pitch;
    }

    function composeSituation(text) {
      var matched = situations.filter(function (s) { return s.re.test(text); });
      if (!matched.length) return null;

      var wantsMax = /(maximize|max out|bigger|biggest|most money|more back|keep more|best (refund|return)|get the most|lower my tax|owe less|save)/i.test(text);

      var opener = wantsMax
        ? 'Yes — and maximizing it is exactly what we’re good at.'
        : 'Yes, we can absolutely help with that.';

      var totalWeight = 0;
      var hasBusiness = false;
      var valuePoints = [];
      matched.slice(0, 3).forEach(function (s) {
        totalWeight += s.weight;
        if (s.key === 'selfemp') hasBusiness = true;
        valuePoints.push(s.value);
      });

      var html =
        opener + ' ' + valuePoints.join('<br><br>') +
        '<br><br>' + tierPitch(totalWeight, hasBusiness) +
        '<br><br>Let’s set up a free meeting — bring last year’s return and we’ll show you exactly what we’d do differently. No pressure, no obligation, and you’ll leave with a real number.<br>' + BOOK_CTA;

      return { key: 'situation:' + matched.map(function (s) { return s.key; }).join('+'), html: html };
    }

    /* Repetition guard: never give the same speech twice in a row. */
    var lastKey = null;

    var repeatNudge =
      'Short version: this one’s worth a real conversation. The consultation is free, you’ll get an exact quote before we start, and you’ll leave knowing your best move — no pressure, no obligation.<br>' +
      BOOK_CTA + '<br>Or just call us at ' + CALL_LINK + ' — a person will pick up.';

    function respond(text) {
      var hit = composeSituation(text);

      if (!hit) {
        for (var i = 0; i < intents.length; i++) {
          if (intents[i].re.test(text)) {
            hit = { key: intents[i].key, html: answers[intents[i].key] };
            break;
          }
        }
      }
      if (!hit) hit = { key: 'fallback', html: answers.fallback };

      if (hit.key === lastKey && hit.key !== 'fallback' && hit.key !== 'greeting') {
        lastKey = hit.key;
        return repeatNudge;
      }
      lastKey = hit.key;
      return hit.html;
    }

    /* ----- Optional AI upgrade (Gemini via Netlify Function) -----
       Typed questions are sent to /.netlify/functions/chat, which relays them
       to Google's Gemini API using a private key. If the function is missing,
       not configured, slow, or errors, we fall back to the rules engine above
       — the chat never breaks. */

    var chatHistory = [];

    function rememberExchange(userText, botHtml) {
      var tmp = document.createElement('div');
      tmp.innerHTML = botHtml;
      chatHistory.push({ role: 'user', text: userText });
      chatHistory.push({ role: 'model', text: tmp.textContent || '' });
      if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
    }

    /* Render the small markdown subset we allow from the AI: **bold** and
       [text](url). Everything else is escaped, so replies can't inject HTML. */
    function mdToHtml(text) {
      var escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|payment\.html|services\.html[^\s)]*|business\.html|resources\.html|contact\.html)\)/g, function (m, label, url) {
        var cls = url.indexOf('calendar.app.google') !== -1 ? ' class="chat-cta"' : '';
        var ext = url.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
        return '<a href="' + url + '"' + cls + ext + '>' + label + '</a>';
      });

      escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return escaped.replace(/\n/g, '<br>');
    }

    function showTyping() {
      var bubble = document.createElement('div');
      bubble.className = 'chat-msg chat-msg--bot chat-msg--typing';
      bubble.textContent = '…';
      messagesEl.appendChild(bubble);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return bubble;
    }

    function askAI() {
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = controller && window.setTimeout(function () { controller.abort(); }, 9000);

      return fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory.slice(-10) }),
        signal: controller ? controller.signal : undefined
      })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          return r.json();
        })
        .then(function (d) {
          if (!d.reply) throw new Error('empty');
          return mdToHtml(d.reply);
        })
        .catch(function () { return null; })
        .finally(function () { if (timer) window.clearTimeout(timer); });
    }

    quickChips.forEach(function (label) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chat-chip';
      chip.textContent = label;
      chip.addEventListener('click', function () {
        addMessage(label, 'user');
        var key = chipToKey[label];
        var html = key === lastKey ? repeatNudge : answers[key];
        lastKey = key;
        rememberExchange(label, html);
        botReply(html);
      });
      chipsEl.appendChild(chip);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      addMessage(text, 'user');
      input.value = '';

      chatHistory.push({ role: 'user', text: text });
      var typing = showTyping();

      askAI().then(function (aiHtml) {
        typing.remove();
        if (aiHtml) {
          addMessage(aiHtml, 'bot');
          var tmp = document.createElement('div');
          tmp.innerHTML = aiHtml;
          chatHistory.push({ role: 'model', text: tmp.textContent || '' });
        } else {
          chatHistory.pop(); // rules engine keeps its own repetition state
          var html = respond(text);
          rememberExchange(text, html);
          addMessage(html, 'bot');
        }
        if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);
      });
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
