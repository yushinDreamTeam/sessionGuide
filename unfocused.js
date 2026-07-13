/* =========================================================================
 *  unfocused.js  ―  진로 불명확한 학생용 화면 (계열별 권장 과목, 편제표 형식)
 *
 *  흐름:
 *   1) 학년(localStorage) 읽기 → 학교 개설 과목 필터 기준
 *   2) 계열 탭 만들기 (data.js FACULTIES)
 *   3) 탭 선택 → 그 계열 전체에서 권장 과목 추출
 *      → 편제표 구조에 맞춰 필터링 & 학기별·선택과목군별로 렌더
 *   4) 세부정보(i) → 해당 과목을 고른 학교/학과 팝업
 * ========================================================================= */

/* ---------- 0) 학년·학기 ---------- */
const selectedGrade = localStorage.getItem("selectedGrade") || "2학년";
const initialSemester = localStorage.getItem("selectedSemester") || "1학기";
document.querySelector("#grade-value").textContent = selectedGrade;

const semesterSelect = document.querySelector("#semester-select");
if (semesterSelect) {
  semesterSelect.value = initialSemester;
  semesterSelect.addEventListener("change", () => {
    localStorage.setItem("selectedSemester", semesterSelect.value);
    const activeFacultyButton = tabsWrap.querySelector(".tab-active");
    if (activeFacultyButton) {
      renderFaculty(activeFacultyButton.dataset.faculty);
    }
  });
}

function getSelectedSemester() {
  return semesterSelect ? semesterSelect.value : initialSemester;
}

const ABS = new Set(typeof ABSOLUTE_SUBJECTS !== "undefined" ? ABSOLUTE_SUBJECTS : []);
const SCIENCE = new Set(typeof SCIENCE_SUBJECTS !== "undefined" ? SCIENCE_SUBJECTS : []);
const SOCIAL = new Set(typeof SOCIAL_SUBJECTS !== "undefined" ? SOCIAL_SUBJECTS : []);

/* ---------- 1) 계열 탭 ---------- */
const tabsWrap = document.querySelector("#discipline-tabs");
const resultSummary = document.querySelector("#result-summary");
const subjectsRecommend = document.querySelector("#subjects-recommend");

FACULTIES.forEach((faculty, index) => {
  const tab = document.createElement("button");
  tab.type = "button";
  tab.className = index === 0 ? "tab-active" : "tab";
  tab.textContent = faculty;
  tab.dataset.faculty = faculty;

  tab.addEventListener("click", () => {
    tabsWrap.querySelectorAll("button").forEach((b) => (b.className = "tab"));
    tab.className = "tab-active";
    renderFaculty(faculty);
  });

  tabsWrap.appendChild(tab);
});

/* ---------- 2) 계열별 권장 과목 추출 ---------- */
function getRecommendedSubjectsByFaculty(faculty) {
  const records = RECOMMENDATIONS.filter((r) => r.faculty === faculty);
  const map = new Map(); // subject -> { subject, sources }

  records.forEach((r) => {
    const picked = [
      ...new Set([
        ...(r.subjects.core || []),
        ...(r.subjects.recommended || []),
      ]),
    ];

    picked.forEach((sub) => {
      if (!map.has(sub)) {
        map.set(sub, { subject: sub, sources: [] });
      }
      const entry = map.get(sub);
      entry.sources.push({ university: r.university, major: r.majorRaw });
    });
  });

  return map;
}

function subjectLabel(name) {
  return ABS.has(name) ? name + " (절대)" : name;
}

/* ---------- 3) curriculum 형식으로 렌더 ---------- */
function renderGroups(subjectMap) {
  let prevTerm = null;
  const semester = getSelectedSemester();
  const curriculum = (CURRICULUM[selectedGrade] || []).filter(
    (g) => semester === "전체" || g.term === semester
  );

  subjectsRecommend.innerHTML = "";

  curriculum.forEach((g) => {
    // 학기 헤더
    if (g.term !== prevTerm) {
      const h = document.createElement("h5");
      h.className = "term-header";
      h.textContent = selectedGrade + " " + g.term;
      subjectsRecommend.appendChild(h);
      prevTerm = g.term;
    }

    // 모든 과목을 보여주되, 권장 과목과 아닌 과목을 구분
    const subjects = g.subjects;
    
    if (subjects.length === 0) return;

    // 선택과목군 카드
    const card = document.createElement("div");
    card.className = "q-card";

    const head = document.createElement("div");
    head.className = "q-head";
    head.innerHTML =
      '<span class="q-title">' + g.group +
      ' <span class="q-pick">[택' + g.pick + "]</span>" +
      '<span class="q-credit">' + g.credit + "학점</span></span>";
    card.appendChild(head);

    const opts = document.createElement("div");
    opts.className = "q-options";
    
    subjects.forEach((sub) => {
      const label = document.createElement("label");
      label.className = "opt";
      label.style.cursor = "pointer";
      label.addEventListener("click", () => {
        openModal({ subject: sub, sources: subjectMap.get(sub)?.sources || [] });
      });

      const txt = document.createElement("span");
      txt.textContent = subjectLabel(sub);
      if (ABS.has(sub)) txt.classList.add("abs");
      if (SCIENCE.has(sub)) label.classList.add("science");
      if (SOCIAL.has(sub)) label.classList.add("social");
      if (!subjectMap.has(sub)) label.classList.add("inactive");

      label.appendChild(txt);
      opts.appendChild(label);
    });

    card.appendChild(opts);
    subjectsRecommend.appendChild(card);
  });
}

function renderFaculty(faculty) {
  subjectsRecommend.innerHTML = "";
  resultSummary.textContent = `${faculty} 계열 · ${selectedGrade} ${getSelectedSemester()} 개설 과목 기준`;

  const subjectMap = getRecommendedSubjectsByFaculty(faculty);

  if (subjectMap.size === 0) {
    subjectsRecommend.innerHTML =
      '<p class="empty-msg">조건에 맞는 권장 과목이 없습니다.</p>';
    return;
  }

  renderGroups(subjectMap);
}

// 첫 계열을 기본으로 렌더
renderFaculty(FACULTIES[0]);

/* ---------- 4) 세부정보 팝업 ---------- */
const modalOverlay = document.querySelector("#modal-overlay");
const modalTitle = document.querySelector("#modal-title");
const modalSchoolList = document.querySelector("#modal-school-list");

function makeLogo(universityName) {
  const wrap = document.createElement("span");
  wrap.className = "school-logo";
  wrap.textContent = universityName.charAt(0);
  wrap.classList.add("logo-fallback");
  return wrap;
}

function openModal(entry) {
  modalTitle.textContent = entry.subject;
  modalSchoolList.innerHTML = "";

  const uniqueSources = [
    ...new Map(
      entry.sources.map((s) => [`${s.university}|${s.major}`, s])
    ).values(),
  ];

  uniqueSources.forEach((src) => {
    const li = document.createElement("li");
    li.className = "school-item";

    const nameWrap = document.createElement("span");
    nameWrap.className = "school-text";

    const schoolName = document.createElement("span");
    schoolName.className = "school-name";
    schoolName.textContent = src.university;

    const majorName = document.createElement("span");
    majorName.className = "school-major";
    majorName.textContent = src.major;

    nameWrap.append(schoolName, majorName);
    li.append(makeLogo(src.university), nameWrap);
    modalSchoolList.appendChild(li);
  });

  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
}

document.querySelector("#modal-close").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
