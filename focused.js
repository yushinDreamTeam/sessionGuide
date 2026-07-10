/* =========================================================================
 *  focused.js  ―  진로 명확한 학생용 검색 화면 (권장 과목, 편제표 형식)
 *
 *  흐름:
 *   1) 학년(localStorage) 읽기 → 학교 개설 과목 필터 기준
 *   2) 대학/계열 체크박스 채우기 (data.js)
 *   3) 계열·대학 선택에 맞춰 학과 목록 다시 채우기
 *   4) 검색 → 해당 학과의 권장/핵심 과목 추출 → 편제표 구조에 맞춰 필터링 & 렌더
 *   5) 세부정보(i) → 해당 과목을 고른 학교/학과 팝업
 * ========================================================================= */

/* ---------- 0) 학년 ---------- */
const selectedGrade = localStorage.getItem("selectedGrade") || "2학년";
document.querySelector("#grade-value").textContent = selectedGrade;

const ABS = new Set(typeof ABSOLUTE_SUBJECTS !== "undefined" ? ABSOLUTE_SUBJECTS : []);
const SCIENCE = new Set(typeof SCIENCE_SUBJECTS !== "undefined" ? SCIENCE_SUBJECTS : []);
const SOCIAL = new Set(typeof SOCIAL_SUBJECTS !== "undefined" ? SOCIAL_SUBJECTS : []);

/* ---------- 유틸: 체크박스 라벨 만들기 ---------- */
function makeCheckboxItem(value, labelText) {
  const label = document.createElement("label");
  label.className = "menu-item";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.value = value;

  label.appendChild(input);
  label.appendChild(document.createTextNode(" " + labelText));
  return label;
}

function updateButtonText(dropdown, defaultText) {
  const button = dropdown.querySelector(".dropdown-button");
  const checked = [
    ...dropdown.querySelectorAll("input[type='checkbox']:checked"),
  ];

  if (checked.length === 0) {
    button.textContent = defaultText;
  } else if (checked.length === 1) {
    button.textContent = checked[0].value;
  } else {
    button.textContent = `${checked[0].value} 외 ${checked.length - 1}개`;
  }
}

/* ---------- 1) 대학 드롭다운 채우기 ---------- */
const univDropdown = document.querySelector("#select-univ");
const univMenu = univDropdown.querySelector(".dropdown-menu");

UNIVERSITIES.forEach((name) => {
  univMenu.appendChild(makeCheckboxItem(name, name));
});

univMenu.addEventListener("change", () => {
  updateButtonText(univDropdown, "대학 선택 (선택)");
  populateMajors();
});

/* ---------- 2) 계열 드롭다운 채우기 ---------- */
const facultyDropdown = document.querySelector("#select-faculty");
const facultyMenu = facultyDropdown.querySelector(".dropdown-menu");

FACULTIES.forEach((name) => {
  facultyMenu.appendChild(makeCheckboxItem(name, name));
});

facultyMenu.addEventListener("change", (e) => {
  if (e.target.checked) {
    facultyMenu
      .querySelectorAll("input[type='checkbox']")
      .forEach((cb) => {
        if (cb !== e.target) cb.checked = false;
      });
  }
  updateButtonText(facultyDropdown, "계열 선택");
  populateMajors();
});

/* ---------- 3) 학과 드롭다운 ---------- */
const majorDropdown = document.querySelector("#select-major");
const majorMenu = majorDropdown.querySelector(".dropdown-menu");

function getSelectedFaculty() {
  const checked = facultyMenu.querySelector("input:checked");
  return checked ? checked.value : null;
}

function getSelectedUniversities() {
  return [...univMenu.querySelectorAll("input:checked")].map((c) => c.value);
}

function populateMajors() {
  const faculty = getSelectedFaculty();
  const universities = getSelectedUniversities();

  majorMenu.innerHTML = "";
  majorDropdown.querySelector(".dropdown-button").textContent = "학과 선택";

  if (!faculty) {
    const hint = document.createElement("p");
    hint.className = "menu-hint";
    hint.textContent = "계열을 먼저 선택하세요.";
    majorMenu.appendChild(hint);
    return;
  }

  const majors = [
    ...new Set(
      RECOMMENDATIONS.filter((r) => {
        if (r.faculty !== faculty) return false;
        if (universities.length > 0 && !universities.includes(r.university))
          return false;
        return true;
      }).map((r) => r.major)
    ),
  ].sort();

  if (majors.length === 0) {
    const hint = document.createElement("p");
    hint.className = "menu-hint";
    hint.textContent = "해당 조건의 학과 데이터가 없습니다.";
    majorMenu.appendChild(hint);
    return;
  }

  majors.forEach((m) => majorMenu.appendChild(makeCheckboxItem(m, m)));
}

majorMenu.addEventListener("change", (e) => {
  if (e.target.checked) {
    majorMenu.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      if (cb !== e.target) cb.checked = false;
    });
  }
  updateButtonText(majorDropdown, "학과 선택");
});

populateMajors();

/* ---------- 드롭다운 열고 닫기 ---------- */
document.querySelectorAll(".dropdown").forEach((dropdown) => {
  const button = dropdown.querySelector(".dropdown-button");
  const menu = dropdown.querySelector(".dropdown-menu");

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const isClosed = menu.hidden;
    document.querySelectorAll(".dropdown-menu").forEach((m) => (m.hidden = true));
    menu.hidden = !isClosed;
  });
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-menu").forEach((m) => (m.hidden = true));
  }
});

/* ---------- 4) 검색 & 권장 과목 추출 ---------- */
const searchButton = document.querySelector("#search-button");
const viewResult = document.querySelector("#view-result");
const resultSummary = document.querySelector("#result-summary");
const subjectsRecommend = document.querySelector("#subjects-recommend");

function getRecommendedSubjects(faculty, majors, universities) {
  const records = RECOMMENDATIONS.filter((r) => {
    if (r.faculty !== faculty) return false;
    if (!majors.includes(r.major)) return false;
    if (universities.length > 0 && !universities.includes(r.university))
      return false;
    return true;
  });

  const set = new Set();
  const sourceMap = new Map(); // subject -> [{university, major}]

  records.forEach((r) => {
    const picked = [
      ...new Set([
        ...(r.subjects.core || []),
        ...(r.subjects.recommended || []),
      ]),
    ];

    picked.forEach((sub) => {
      set.add(sub);
      if (!sourceMap.has(sub)) sourceMap.set(sub, []);
      sourceMap.get(sub).push({ university: r.university, major: r.majorRaw });
    });
  });

  return { set, sourceMap };
}

function subjectLabel(name) {
  return ABS.has(name) ? name + " (절대)" : name;
}

function renderGroups(recommendedSet, sourceMap) {
  let prevTerm = null;
  const curriculum = CURRICULUM[selectedGrade] || [];

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

    // 권장 과목이 있는 과목만 필터링
    const filtered = g.subjects.filter((s) => recommendedSet.has(s));
    
    if (filtered.length === 0) return;

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
    
    filtered.forEach((sub) => {
      const label = document.createElement("label");
      label.className = "opt";
      label.style.cursor = "pointer";
      label.addEventListener("click", () => {
        openModal({ subject: sub, sources: sourceMap.get(sub) || [] });
      });

      const txt = document.createElement("span");
      txt.textContent = subjectLabel(sub);
      if (ABS.has(sub)) txt.classList.add("abs");
      if (SCIENCE.has(sub)) txt.classList.add("science");
      if (SOCIAL.has(sub)) txt.classList.add("social");

      label.appendChild(txt);
      opts.appendChild(label);
    });

    card.appendChild(opts);
    subjectsRecommend.appendChild(card);
  });
}

searchButton.addEventListener("click", () => {
  const faculty = getSelectedFaculty();
  const majors = [...majorMenu.querySelectorAll("input:checked")].map(
    (c) => c.value
  );
  const universities = getSelectedUniversities();

  viewResult.hidden = false;
  subjectsRecommend.innerHTML = "";

  if (!faculty) {
    resultSummary.textContent = "";
    subjectsRecommend.innerHTML =
      '<p class="empty-msg">계열을 선택해 주세요.</p>';
    return;
  }
  if (majors.length === 0) {
    resultSummary.textContent = "";
    subjectsRecommend.innerHTML =
      '<p class="empty-msg">학과를 선택해 주세요.</p>';
    return;
  }

  const { set: recommendedSet, sourceMap } = getRecommendedSubjects(
    faculty,
    majors,
    universities
  );

  if (recommendedSet.size === 0) {
    resultSummary.textContent = "";
    subjectsRecommend.innerHTML =
      '<p class="empty-msg">조건에 맞는 권장 과목이 없습니다.</p>';
    return;
  }

  const univNote =
    universities.length > 0 ? ` · 대학 ${universities.length}곳` : " · 전체 대학";
  resultSummary.textContent = `${majors.join(", ")}${univNote} · ${selectedGrade} 개설 과목 기준`;

  renderGroups(recommendedSet, sourceMap);
});

/* ---------- 5) 세부정보 팝업 ---------- */
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
