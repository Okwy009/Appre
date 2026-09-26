// Case study data and filter/render logic for case-studies.html
// These are illustrative, composite examples built to show the method —
// not verified individual client outcomes. See the disclosure banner on the page.

(function () {
  var DATA = [
    {
      id: "cs-swe-01",
      industry: "Software & IT",
      situation: "Mid-career, same title different stack",
      title: "Backend engineer moving from a Java shop to a Python/Go team",
      before: "Responsible for backend services and worked with databases and APIs.",
      after: "Built and maintained 6 Go microservices handling ~40 internal API consumers; owned schema design for two PostgreSQL databases — matches JD's \"own service design end-to-end.\"",
      gapNote: "Gap flagged: posting asked for \"production Kubernetes experience.\" Candidate had Docker but not K8s directly. Noted as a real gap in the report; addressed with one line in the cover letter about adjacent container orchestration work, not papered over in the resume.",
      tags: ["software-it", "mid-career", "lateral-move"]
    },
    {
      id: "cs-nurse-01",
      industry: "Healthcare",
      situation: "Returning after a career break",
      title: "RN returning to bedside care after 2 years in a non-clinical role",
      before: "Nursing professional with patient care background seeking new opportunity.",
      after: "Provided direct patient care for a 24-bed medical-surgical unit for 5 years prior to a 2-year care-coordination role; current BLS/ACLS certifications active — matches JD's \"active certifications, med-surg preferred.\"",
      gapNote: "Gap flagged: the 2-year gap in direct bedside hours. Report recommended naming the care-coordination role explicitly rather than omitting it, since concealment reads worse in healthcare hiring than a clearly explained transition.",
      tags: ["healthcare", "returning", "employment-gap"]
    },
    {
      id: "cs-trade-01",
      industry: "Skilled Trades",
      situation: "Journeyman applying above current license level",
      title: "Electrician applying for a lead role requiring a master license",
      before: "Experienced electrician with strong work ethic and attention to detail.",
      after: "Journeyman electrician, 7 years commercial/industrial, currently supervising 2-person crews on 3 active job sites — matches JD's \"crew supervision experience.\"",
      gapNote: "Gap flagged: posting required a Master Electrician license; candidate held Journeyman. This was a hard gap, stated plainly. Report recommended applying to the Journeyman-level lead postings at the same company instead, where supervision experience — not license class — was the deciding factor.",
      tags: ["skilled-trades", "leveling-up", "licensing-gap"]
    },
    {
      id: "cs-sales-01",
      industry: "Sales & Account Management",
      situation: "Individual contributor to first management role",
      title: "Senior AE applying for a first-time sales management role",
      before: "Top-performing salesperson looking to grow into leadership.",
      after: "Ranked in top 15% of a 40-person AE team for 3 consecutive years; informally mentored 4 newer reps and ran onboarding for 2 of them — matches JD's \"demonstrated informal leadership.\"",
      gapNote: "Gap flagged: no formal direct-report experience anywhere in the resume. The report was explicit that this is common for a first management move, framed the mentoring history as the honest evidence available, and did not invent a \"team lead\" title that was never held.",
      tags: ["sales", "first-time-manager", "no-direct-reports"]
    },
    {
      id: "cs-mktg-01",
      industry: "Marketing",
      situation: "Career change into marketing",
      title: "Former teacher moving into a marketing coordinator role",
      before: "Passionate educator with strong communication skills seeking new challenge.",
      after: "Planned and ran 3 school-wide events (150–400 attendees), managed a $4,200 annual materials budget, wrote weekly parent newsletters read by 300+ households — reframed as event coordination, budget management, and audience communication, the three requirements named in the JD.",
      gapNote: "Gap flagged: zero paid marketing experience. Report did not disguise the career change; it named the transferable pieces explicitly and flagged that campaign analytics tools listed as required (Google Analytics, HubSpot) were a genuine gap to address before applying, not after.",
      tags: ["marketing", "career-change", "transferable-skills"]
    },
    {
      id: "cs-ops-01",
      industry: "Operations & Logistics",
      situation: "Promotion-track application",
      title: "Warehouse associate applying for a shift supervisor opening",
      before: "Hardworking and reliable warehouse team member.",
      after: "Processed an average of 380 units/shift with a 99.6% pick accuracy rate over 18 months (per internal WMS reports); trained 6 new hires on pick-pack procedure — matches JD's \"training responsibility\" and \"accuracy standards\" requirements.",
      gapNote: "Note: every number here came from the candidate's own timecards and the employer's WMS exports, not estimated. Where a candidate can't produce a source for a number, we don't include the number — see the pricing page's promise on this.",
      tags: ["operations-logistics", "internal-promotion", "quantified-work"]
    },
    {
      id: "cs-finance-01",
      industry: "Finance & Accounting",
      situation: "Same title, more regulated industry",
      title: "Staff accountant moving from retail to healthcare finance",
      before: "Detail-oriented accountant experienced in month-end close and reconciliations.",
      after: "Owned month-end close for a $12M-revenue retail division across 3 years, including balance sheet reconciliations reviewed by an external auditor with zero material findings — matches JD's \"audit-ready close process\" language directly.",
      gapNote: "Gap flagged: posting preferred healthcare revenue-cycle experience specifically. Candidate had none. Report labeled this a soft, preferred-only gap (not a required qualification) so the candidate could weigh it correctly rather than assume it was disqualifying.",
      tags: ["finance-accounting", "industry-switch", "preferred-not-required"]
    },
    {
      id: "cs-cs-01",
      industry: "Customer Support",
      situation: "Entry-level, first professional resume",
      title: "Recent graduate applying for a first customer support role",
      before: "Recent graduate, quick learner, good with people.",
      after: "Handled 30–50 customer interactions per shift in a campus IT help-desk role across 2 semesters, maintaining a documented 4.7/5 satisfaction average — matches JD's \"high-volume support experience\" using the closest real experience available.",
      gapNote: "Gap flagged: JD asked for \"2+ years support experience,\" candidate had under 1 year, part-time, unpaid. Report said so directly rather than rounding up, and flagged that the posting's other requirements (ticketing software, written communication) were fully met, which is the honest, useful framing for an entry-level application.",
      tags: ["customer-support", "entry-level", "first-resume"]
    },
    {
      id: "cs-nonprofit-01",
      industry: "Nonprofit & Education",
      situation: "Sector switch, senior level",
      title: "Corporate program manager moving into nonprofit program direction",
      before: "Experienced program manager with a track record of successful delivery.",
      after: "Managed a $2.1M program portfolio across 4 corporate teams, including quarterly reporting to a steering committee of VPs — reframed using the JD's own language: \"portfolio oversight\" and \"board-level reporting.\"",
      gapNote: "Gap flagged: no grant-funded program experience, which the JD listed as required. Report recommended against silently substituting corporate budget language for grant language, since a hiring committee with nonprofit-specific funding knowledge would notice the mismatch quickly.",
      tags: ["nonprofit-education", "sector-switch", "senior"]
    }
  ];

  var industries = Array.from(new Set(DATA.map(function (d) { return d.industry; }))).sort();
  var situations = Array.from(new Set(DATA.map(function (d) { return d.situation; }))).sort();

  var industrySelect = document.getElementById("filter-industry");
  var situationSelect = document.getElementById("filter-situation");
  var results = document.getElementById("cs-results");
  var countEl = document.getElementById("cs-count");

  industries.forEach(function (i) {
    var opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    industrySelect.appendChild(opt);
  });
  situations.forEach(function (s) {
    var opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    situationSelect.appendChild(opt);
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render() {
    var iv = industrySelect.value;
    var sv = situationSelect.value;
    var filtered = DATA.filter(function (d) {
      return (iv === "all" || d.industry === iv) && (sv === "all" || d.situation === sv);
    });

    countEl.textContent = filtered.length + (filtered.length === 1 ? " example" : " examples");

    if (filtered.length === 0) {
      results.innerHTML = '<div class="cs-empty"><img src="images/images/no-results.png" alt=""><p class="dim">No examples match that combination. Try a different filter.</p></div>';
      return;
    }

    results.innerHTML = filtered.map(function (d) {
      return (
        '<article class="panel" style="margin-bottom:1.5rem;">' +
        '<div class="flex-between" style="margin-bottom:0.9rem;">' +
        '<div><span class="tag">' + escapeHtml(d.industry) + '</span> <span class="tag">' + escapeHtml(d.situation) + '</span></div>' +
        '</div>' +
        '<h3 style="margin-bottom:0.9rem;">' + escapeHtml(d.title) + '</h3>' +
        '<div class="diff">' +
        '<div class="diff__line diff__line--minus"><span class="diff__marker">\u2212</span><span>' + escapeHtml(d.before) + '</span></div>' +
        '<div class="diff__line diff__line--plus"><span class="diff__marker">+</span><span>' + escapeHtml(d.after) + '</span></div>' +
        '</div>' +
        '<p class="small dim" style="margin-top:0.9rem; margin-bottom:0;"><strong style="color:var(--text-dim); font-family:var(--mono); font-weight:500;">Gap-check note — </strong>' + escapeHtml(d.gapNote) + '</p>' +
        '</article>'
      );
    }).join("");
  }

  industrySelect.addEventListener("change", render);
  situationSelect.addEventListener("change", render);
  render();
})();
