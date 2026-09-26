// Gap check tool — tool.html
//
// A self-contained, dependency-free, rule-based matcher. It runs entirely
// in the browser: nothing pasted here is sent anywhere. Three passes:
//   1. A phrase dictionary spanning multiple industries/functions, scanned
//      against both the posting and the resume text.
//   2. A required-vs-preferred classifier based on marker words in the
//      sentence surrounding each dictionary hit in the posting.
//   3. An acronym scan (independent of the dictionary) for terms the
//      dictionary doesn't know about.
//
// To extend: add entries to DICTIONARY below. Each category is
// { label, terms: [...] }; terms are matched case-insensitively as whole
// phrases (word-boundary on both ends), so "crm" won't match inside another
// word.

(function () {
  var step1Form = document.getElementById("gc-step-1");
  var step2Form = document.getElementById("gc-step-2");
  var resultsEl = document.getElementById("gc-results");
  var progressEl = document.getElementById("gc-progress");

  if (!step1Form || !step2Form || !resultsEl) return;

  var titleInput = document.getElementById("gc-title");
  var jdInput = document.getElementById("gc-jd");
  var jdError = document.getElementById("gc-jd-error");
  var resumeInput = document.getElementById("gc-resume");
  var resumeError = document.getElementById("gc-resume-error");

  var toStep2Btn = document.getElementById("gc-to-step-2");
  var backBtn = document.getElementById("gc-back");
  var runBtn = document.getElementById("gc-run");
  var restartBtn = document.getElementById("gc-restart");

  var MIN_WORDS = 15;

  // ------------------------------------------------------------------
  // Dictionary
  // ------------------------------------------------------------------

  var DICTIONARY = [
    { label: "Leadership / supervision", terms: [
      "supervisor", "supervising", "supervised", "manage a team", "managing a team",
      "managed a team", "direct reports", "team lead", "team leadership", "mentored",
      "mentoring", "trained new hires", "led a team", "leadership experience", "people management"
    ]},
    { label: "Project / program management", terms: [
      "project management", "managed projects", "project manager", "project delivery",
      "cross-functional", "stakeholder management", "client relations", "program management",
      "portfolio management", "portfolio oversight"
    ]},
    { label: "Budget & financial ownership", terms: [
      "budget", "budget management", "p&l", "profit and loss", "cost reduction",
      "financial reporting", "forecasting", "reconciliation", "reconciliations",
      "month-end close", "accounts payable", "accounts receivable"
    ]},
    { label: "Data & analytics", terms: [
      "data analysis", "analytics", "reporting", "dashboards", "kpi", "kpis", "metrics",
      "root cause analysis", "sql", "excel", "google analytics", "power bi", "tableau"
    ]},
    { label: "Customer / client support", terms: [
      "customer service", "customer support", "client support", "help desk", "ticketing",
      "csat", "customer satisfaction", "technical support", "high-volume support"
    ]},
    { label: "Sales & account management", terms: [
      "sales", "account management", "quota", "pipeline", "prospecting", "closing deals",
      "crm", "salesforce", "account executive", "business development"
    ]},
    { label: "Marketing & communications", terms: [
      "marketing", "campaign", "content creation", "social media", "email marketing", "seo",
      "brand", "copywriting", "hubspot", "audience communication", "event coordination"
    ]},
    { label: "Healthcare / clinical", terms: [
      "patient care", "bedside care", "clinical", "bls", "acls", "registered nurse",
      "med-surg", "ehr", "electronic health record", "hipaa"
    ]},
    { label: "Skilled trades / licensing", terms: [
      "journeyman", "master electrician", "licensed", "license", "osha", "crew supervision",
      "commercial electrical", "industrial electrical"
    ]},
    { label: "Operations & logistics", terms: [
      "warehouse", "inventory", "logistics", "supply chain", "shift supervisor",
      "pick accuracy", "wms", "scheduling", "process improvement", "lean", "six sigma"
    ]},
    { label: "Software & engineering", terms: [
      "software engineer", "backend", "front end", "frontend", "full stack", "api",
      "microservices", "kubernetes", "docker", "ci/cd", "database design", "python",
      "javascript", "react", "cloud infrastructure"
    ]},
    { label: "Finance & accounting", terms: [
      "staff accountant", "gaap", "audit", "balance sheet", "general ledger",
      "revenue cycle", "audit-ready"
    ]},
    { label: "Nonprofit / program direction", terms: [
      "grant", "grant-funded", "nonprofit", "program direction", "board reporting",
      "fundraising", "donor"
    ]},
    { label: "Education requirement", terms: [
      "bachelor's degree", "bachelors degree", "master's degree", "associate's degree",
      "high school diploma"
    ]},
    { label: "Communication skills", terms: [
      "written communication", "verbal communication", "presentation skills",
      "public speaking"
    ]},
    { label: "Regulatory / compliance", terms: [
      "compliance", "regulatory", "sox", "risk management"
    ]}
  ];

  var REQUIRED_MARKERS = /\b(required|require|requires|must have|must possess|minimum of|at least|mandatory|essential)\b/i;
  var PREFERRED_MARKERS = /\b(preferred|prefer|nice to have|a plus|is a plus|bonus|desirable|ideally)\b/i;

  var ACRONYM_BLOCKLIST = ["JD", "US", "USA", "UK", "ID", "OK", "AM", "PM", "ETC", "TBD"];

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function countWords(text) {
    var trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  function termRegex(term) {
    return new RegExp("\\b" + escapeRegex(term) + "\\b", "i");
  }

  function splitSentences(text) {
    return text
      .replace(/\r/g, "")
      .split(/\n+|(?<=[.!?])\s+/)
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  // Splitting with a lookbehind (above) is unavailable in a few older
  // engines; fall back to a simpler split if the regex throws.
  try {
    splitSentences("Test. Test.");
  } catch (e) {
    splitSentences = function (text) {
      return text
        .replace(/\r/g, "")
        .replace(/([.!?])\s+/g, "$1\n")
        .split(/\n+/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
    };
  }

  function findTermInText(term, text) {
    return termRegex(term).test(text);
  }

  function classifyCategoryInJd(category, jdText, jdSentences) {
    var foundTerm = null;
    for (var i = 0; i < category.terms.length; i++) {
      if (findTermInText(category.terms[i], jdText)) {
        foundTerm = category.terms[i];
        break;
      }
    }
    if (!foundTerm) return null;

    var weight = "unspecified";
    for (var s = 0; s < jdSentences.length; s++) {
      var sentence = jdSentences[s];
      if (!termRegex(foundTerm).test(sentence)) continue;
      if (REQUIRED_MARKERS.test(sentence)) { weight = "required"; break; }
      if (PREFERRED_MARKERS.test(sentence)) { weight = "preferred"; }
    }
    return { term: foundTerm, weight: weight };
  }

  function categoryInResume(category, resumeText) {
    for (var i = 0; i < category.terms.length; i++) {
      if (findTermInText(category.terms[i], resumeText)) return true;
    }
    return false;
  }

  function extractAcronyms(rawText) {
    var matches = rawText.match(/\b[A-Z]{2,6}\b/g) || [];
    var seen = {};
    var out = [];
    matches.forEach(function (m) {
      if (ACRONYM_BLOCKLIST.indexOf(m) !== -1) return;
      if (/^\d+$/.test(m)) return;
      if (seen[m]) return;
      seen[m] = true;
      out.push(m);
    });
    return out.slice(0, 12);
  }

  var STOPWORDS = ["senior", "junior", "lead", "principal", "the", "a", "an", "of", "and", "for", "i", "ii", "iii", "iv"];

  function titleTokens(title) {
    return title
      .toLowerCase()
      .split(/[^a-z0-9']+/)
      .filter(function (t) { return t.length > 1 && STOPWORDS.indexOf(t) === -1; });
  }

  // ------------------------------------------------------------------
  // Analysis
  // ------------------------------------------------------------------

  function analyze(title, jdText, resumeText) {
    var jdSentences = splitSentences(jdText);
    var matches = [];
    var gaps = [];

    DICTIONARY.forEach(function (category) {
      var jdHit = classifyCategoryInJd(category, jdText, jdSentences);
      if (!jdHit) return; // not mentioned in this posting at all — skip
      var inResume = categoryInResume(category, resumeText);
      if (inResume) {
        matches.push({ label: category.label, weight: jdHit.weight });
      } else {
        gaps.push({ label: category.label, weight: jdHit.weight });
      }
    });

    var weightOrder = { required: 0, preferred: 1, unspecified: 2 };
    function byWeight(a, b) { return weightOrder[a.weight] - weightOrder[b.weight]; }
    matches.sort(byWeight);
    gaps.sort(byWeight);

    var acronyms = extractAcronyms(jdText);
    var acronymGaps = acronyms.filter(function (a) { return !new RegExp("\\b" + a + "\\b", "i").test(resumeText); });
    var acronymMatches = acronyms.filter(function (a) { return acronymGaps.indexOf(a) === -1; });

    var titleResult = null;
    if (title && title.trim()) {
      var tokens = titleTokens(title);
      if (tokens.length) {
        var found = tokens.filter(function (t) { return new RegExp("\\b" + escapeRegex(t) + "\\b", "i").test(resumeText); });
        titleResult = { tokens: tokens, found: found };
      }
    }

    return { matches: matches, gaps: gaps, acronymMatches: acronymMatches, acronymGaps: acronymGaps, titleResult: titleResult };
  }

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------

  function weightTag(weight) {
    if (weight === "required") return '<span class="tag tag--gap">required</span>';
    if (weight === "preferred") return '<span class="tag">preferred</span>';
    return '<span class="tag">mentioned</span>';
  }

  function rowsForList(list, tagClass, statusWord) {
    return list.map(function (item) {
      return (
        "<tr><th scope=\"row\">" + escapeHtml(item.label) + "</th>" +
        "<td>" + weightTag(item.weight) + "</td>" +
        "<td><span class=\"tag " + tagClass + "\">" + statusWord + "</span></td></tr>"
      );
    }).join("");
  }

  function renderResults(data) {
    var html = "";

    html += '<h2 tabindex="-1" id="gc-results-heading">Gap check results</h2>';
    html += '<p class="dim small">Rule-based, not a judgment call — read the how-it-works page for what a full manual review adds on top of this. "Required" only appears where the posting\'s own wording made that distinction; otherwise items are shown as "mentioned."</p>';

    if (data.titleResult) {
      var pct = data.titleResult.tokens.length
        ? Math.round((data.titleResult.found.length / data.titleResult.tokens.length) * 100)
        : 0;
      html += '<div class="panel" style="margin: 1.4rem 0;">';
      html += '<h3 class="mt-0" style="margin-bottom:0.4rem;">Title language</h3>';
      html += '<p class="dim small mb-0">' + pct + '% of the target title\'s significant words (' +
        data.titleResult.found.map(escapeHtml).join(", ") +
        (data.titleResult.found.length ? "" : "none found") +
        ') appear in your text.</p>';
      html += "</div>";
    }

    html += '<h3 style="margin-top: 2rem;">Likely matches (' + data.matches.length + ')</h3>';
    if (data.matches.length) {
      html += '<div class="table-wrap"><table><thead><tr><th scope="col">Category</th><th scope="col">Weight in posting</th><th scope="col">In your text</th></tr></thead><tbody>';
      html += rowsForList(data.matches, "tag--match", "found");
      html += "</tbody></table></div>";
    } else {
      html += '<p class="dim small">No dictionary categories from the posting were found in your text.</p>';
    }

    html += '<h3 style="margin-top: 2rem;">Likely gaps (' + data.gaps.length + ')</h3>';
    if (data.gaps.length) {
      html += '<div class="table-wrap"><table><thead><tr><th scope="col">Category</th><th scope="col">Weight in posting</th><th scope="col">In your text</th></tr></thead><tbody>';
      html += rowsForList(data.gaps, "tag--gap", "not found");
      html += "</tbody></table></div>";
      html += '<p class="dim small">A "required" gap is worth addressing directly — in the resume if it\'s genuinely true, or in a cover letter if it\'s not. See <a href="how-it-works.html">how it works</a> for how we handle this manually.</p>';
    } else {
      html += '<p class="dim small">No dictionary categories from the posting were missing from your text — though see the acronym scan below, and remember this tool only knows its own dictionary.</p>';
    }

    if (data.acronymMatches.length || data.acronymGaps.length) {
      html += '<h3 style="margin-top: 2rem;">Acronyms &amp; short terms in the posting</h3>';
      html += '<p class="dim small">Independent of the dictionary above — every all-caps 2–6 letter term in the posting, checked against your text. Some of these won\'t be meaningful (an unrelated abbreviation); treat this as a prompt to double-check, not a verdict.</p>';
      html += '<p style="margin-top: 0.8rem;">';
      data.acronymMatches.forEach(function (a) {
        html += '<span class="tag tag--match" style="margin: 0 0.4rem 0.4rem 0;">' + escapeHtml(a) + '</span>';
      });
      data.acronymGaps.forEach(function (a) {
        html += '<span class="tag tag--gap" style="margin: 0 0.4rem 0.4rem 0;">' + escapeHtml(a) + '</span>';
      });
      html += "</p>";
    }

    resultsEl.innerHTML = html;
  }

  // ------------------------------------------------------------------
  // Step / focus management
  // ------------------------------------------------------------------

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scrollToEl(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  }

  function showStep1() {
    step1Form.hidden = false;
    step2Form.hidden = true;
    resultsEl.hidden = true;
    resultsEl.innerHTML = "";
    if (progressEl) progressEl.textContent = "Step 1 of 2";
    if (jdInput) jdInput.focus();
  }

  function showStep2() {
    step1Form.hidden = true;
    step2Form.hidden = false;
    if (progressEl) progressEl.textContent = "Step 2 of 2";
    if (resumeInput) resumeInput.focus();
  }

  function showResults(data) {
    step1Form.hidden = true;
    step2Form.hidden = true;
    renderResults(data);
    resultsEl.hidden = false;
    if (progressEl) progressEl.textContent = "Results";
    scrollToEl(resultsEl);
    var heading = document.getElementById("gc-results-heading");
    if (heading) heading.focus();
  }

  function setFieldError(field, errorEl, message) {
    if (!errorEl) return false;
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", errorEl.id);
      field.focus();
      return false;
    }
    errorEl.hidden = true;
    field.removeAttribute("aria-invalid");
    return true;
  }

  // ------------------------------------------------------------------
  // Wiring
  // ------------------------------------------------------------------

  if (toStep2Btn) {
    toStep2Btn.addEventListener("click", function () {
      var jdText = jdInput.value;
      var ok = countWords(jdText) >= MIN_WORDS
        ? setFieldError(jdInput, jdError, null)
        : setFieldError(jdInput, jdError, "Paste at least a few sentences — a single line usually isn't enough to extract anything useful.");
      if (ok) showStep2();
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", showStep1);
  }

  if (runBtn) {
    runBtn.addEventListener("click", function () {
      var resumeText = resumeInput.value;
      var ok = countWords(resumeText) >= MIN_WORDS
        ? setFieldError(resumeInput, resumeError, null)
        : setFieldError(resumeInput, resumeError, "Paste at least a few sentences of real experience to compare against.");
      if (!ok) return;
      var data = analyze(titleInput ? titleInput.value : "", jdInput.value, resumeText);
      showResults(data);
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      step1Form.reset();
      step2Form.reset();
      if (jdError) jdError.hidden = true;
      if (resumeError) resumeError.hidden = true;
      showStep1();
    });
  }

  // Enter key inside the (non-textarea) title field on step 1 shouldn't
  // submit anything — there's no real <form> submission path — but treat
  // it as "Continue" for convenience.
  if (titleInput) {
    titleInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (toStep2Btn) toStep2Btn.click();
      }
    });
  }
})();
