/* =========================================================================
 *  unfocused.js  ―  진로 불명확한 학생용 화면
 *
 *  흐름:
 *   1) 학년(localStorage) 읽기 → 학교 개설 과목 필터 기준
 *   2) 계열 탭 만들기 (data.js FACULTIES)
 *   3) 탭 선택 → 그 계열 전체에서 과목별 "권장학교 수" 집계
 *      → 학교 미개설 과목 제외 → 렌더
 *   4) 세부정보(i) → 해당 과목을 고른 학교/학과 팝업 (focused와 동일)
 * ========================================================================= */

/* ---------- 0) 학년 ---------- */
const selectedGrade = localStorage.getItem("selectedGrade") || "1학년";
document.querySelector("#grade-value").textContent = selectedGrade;

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
    // 활성 탭 표시 갱신
    tabsWrap.querySelectorAll("button").forEach((b) => (b.className = "tab"));
    tab.className = "tab-active";
    renderFaculty(faculty);
  });

  tabsWrap.appendChild(tab);
});

/* ---------- 2) 계열별 과목 집계 ---------- */
/*
 * 한 계열 안에서 과목별로:
 *  - sources : 그 과목을 고른 (university, majorRaw) 목록  (팝업용)
 *  - schools : 그 과목을 권장한 서로 다른 대학 수           (배지용)
 * 반환은 "권장학교 수" 내림차순.
 */
function aggregateFaculty(faculty) {
  const records = RECOMMENDATIONS.filter((r) => r.faculty === faculty);
  const map = new Map(); // subject -> { subject, sources, schoolSet }

  records.forEach((r) => {
    const picked = [
      ...new Set([
        ...(r.subjects.core || []),
        ...(r.subjects.recommended || []),
      ]),
    ];

    picked.forEach((sub) => {
      if (!map.has(sub)) {
        map.set(sub, { subject: sub, sources: [], schoolSet: new Set() });
      }
      const entry = map.get(sub);
      entry.sources.push({ university: r.university, major: r.majorRaw });
      entry.schoolSet.add(r.university);
    });
  });

  // 우리학교(선택 학년) 개설 과목만 남긴다
  const offered = new Set(SCHOOL_SUBJECTS[selectedGrade] || []);
  const result = [...map.values()]
    .filter((e) => offered.has(e.subject))
    .map((e) => ({
      subject: e.subject,
      sources: e.sources,
      schools: e.schoolSet.size,
    }));

  // 권장학교 수 내림차순, 같으면 과목명 순
  result.sort(
    (a, b) => b.schools - a.schools || a.subject.localeCompare(b.subject)
  );
  return result;
}

/* 결과 한 줄(행) :  과목명 | 권장학교 N개 | 세부정보(i) */
function makeSubjectRow(entry) {
  const row = document.createElement("div");
  row.className = "subject-row";

  const name = document.createElement("span");
  name.className = "subject-name";
  name.textContent = entry.subject;

  const freq = document.createElement("span");
  freq.className = "subject-freq";
  freq.textContent = `권장학교 ${entry.schools}개`;

  const info = document.createElement("button");
  info.type = "button";
  info.className = "subject-info";
  info.textContent = "i";
  info.setAttribute("aria-label", `${entry.subject} 세부정보`);
  info.addEventListener("click", () => openModal(entry));

  row.append(name, freq, info);
  return row;
}

function renderFaculty(faculty) {
  subjectsRecommend.innerHTML = "";
  resultSummary.textContent = `${faculty} 계열 · ${selectedGrade} 개설 과목 기준`;

  const result = aggregateFaculty(faculty);

  if (result.length === 0) {
    subjectsRecommend.innerHTML =
      '<p class="empty-msg">조건에 맞는(그리고 우리학교에서 개설한) 과목이 없습니다.</p>';
    return;
  }

  result.forEach((entry) => subjectsRecommend.appendChild(makeSubjectRow(entry)));
}

// 첫 계열을 기본으로 렌더
renderFaculty(FACULTIES[0]);

/* ---------- 3) 세부정보 팝업 (focused와 동일) ---------- */
const modalOverlay = document.querySelector("#modal-overlay");
const modalTitle = document.querySelector("#modal-title");
const modalSchoolList = document.querySelector("#modal-school-list");

// 로고 이미지 (없거나 깨지면 글자 아바타로 대체)
function makeLogo(universityName) {
  const info = UNIVERSITIES[universityName] || {};
  const wrap = document.createElement("span");
  wrap.className = "school-logo";

  if (info.logo) {
    const img = document.createElement("img");
    img.src = info.logo;
    img.alt = universityName;
    img.onerror = () => {
      wrap.textContent = universityName.charAt(0);
      wrap.classList.add("logo-fallback");
    };
    wrap.appendChild(img);
  } else {
    wrap.textContent = universityName.charAt(0);
    wrap.classList.add("logo-fallback");
  }
  return wrap;
}

function openModal(entry) {
  modalTitle.textContent = entry.subject;
  modalSchoolList.innerHTML = "";

  entry.sources.forEach((src) => {
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
