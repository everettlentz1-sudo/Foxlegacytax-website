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

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initQuiz();
    initEstimator();
    initContactForm();
  });
})();
