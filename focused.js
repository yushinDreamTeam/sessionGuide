/* =========================================================================
 *  focused.js  ―  진로 명확한 학생용 검색 화면
 *
 *  흐름:
 *   1) 학년(localStorage) 읽기 → 학교 개설 과목 필터 기준
 *   2) 대학/계열 체크박스 채우기 (data.js)
 *   3) 계열·대학 선택에 맞춰 학과 목록 다시 채우기
 *   4) 검색 → 과목별 빈도수 집계 → 학교 미개설 과목 제외 → 렌더
 *   5) 세부정보(i) → 해당 과목을 고른 학교/학과 팝업
 * ========================================================================= */

/* ---------- 0) 학년 ---------- */
// 홈에서 저장한 학년. 없으면 1학년을 기본값으로.
const selectedGrade = localStorage.getItem("selectedGrade") || "1학년";
document.querySelector("#grade-value").textContent = selectedGrade;

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

/* 드롭다운 버튼 텍스트를 현재 선택 상태에 맞게 갱신 */
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

/* ---------- 1) 대학 드롭다운 채우기 (복수 선택) ---------- */
const univDropdown = document.querySelector("#select-univ");
const univMenu = univDropdown.querySelector(".dropdown-menu");

Object.keys(UNIVERSITIES).forEach((name) => {
  univMenu.appendChild(makeCheckboxItem(name, name));
});

univMenu.addEventListener("change", () => {
  updateButtonText(univDropdown, "대학 선택 (선택)");
  // 대학이 바뀌면 학과 목록을 다시 세팅
  populateMajors();
});

/* ---------- 2) 계열 드롭다운 채우기 (단일 선택) ---------- */
const facultyDropdown = document.querySelector("#select-faculty");
const facultyMenu = facultyDropdown.querySelector(".dropdown-menu");

FACULTIES.forEach((name) => {
  facultyMenu.appendChild(makeCheckboxItem(name, name));
});

// 계열은 한 개만 선택되도록 강제
facultyMenu.addEventListener("change", (e) => {
  if (e.target.checked) {
    facultyMenu
      .querySelectorAll("input[type='checkbox']")
      .forEach((cb) => {
        if (cb !== e.target) cb.checked = false;
      });
  }
  updateButtonText(facultyDropdown, "계열 선택");
  // 계열이 바뀌면 학과 목록을 다시 세팅
  populateMajors();
});

/* ---------- 3) 학과 드롭다운 (계열/대학에 종속) ---------- */
const majorDropdown = document.querySelector("#select-major");
const majorMenu = majorDropdown.querySelector(".dropdown-menu");

function getSelectedFaculty() {
  const checked = facultyMenu.querySelector("input:checked");
  return checked ? checked.value : null;
}

function getSelectedUniversities() {
  return [...univMenu.querySelectorAll("input:checked")].map((c) => c.value);
}

// 현재 계열(+대학)에 해당하는 학과 목록을 다시 그린다
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

  // 정규화된 학과명 기준으로 중복 제거
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

// 학과도 지금은 한 개만 선택 (복수 선택은 추후)
majorMenu.addEventListener("change", (e) => {
  if (e.target.checked) {
    majorMenu.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      if (cb !== e.target) cb.checked = false;
    });
  }
  updateButtonText(majorDropdown, "학과 선택");
});

populateMajors(); // 초기 안내문 세팅

/* ---------- 드롭다운 열고 닫기 ---------- */
document.querySelectorAll(".dropdown").forEach((dropdown) => {
  const button = dropdown.querySelector(".dropdown-button");
  const menu = dropdown.querySelector(".dropdown-menu");

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const isClosed = menu.hidden;
    // 다른 메뉴는 모두 닫기
    document.querySelectorAll(".dropdown-menu").forEach((m) => (m.hidden = true));
    menu.hidden = !isClosed;
  });
});

// 바깥을 클릭하면 열린 메뉴 닫기
document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-menu").forEach((m) => (m.hidden = true));
  }
});

/* ---------- 4) 검색 & 집계 ---------- */
const searchButton = document.querySelector("#search-button");
const viewResult = document.querySelector("#view-result");
const resultSummary = document.querySelector("#result-summary");
const subjectsRecommend = document.querySelector("#subjects-recommend");

/*
 * 선택 조건으로 과목을 집계한다.
 *  반환: [{ subject, count, sources:[{university, major}] }] (빈도수 내림차순)
 */
function aggregateSubjects(faculty, majors, universities) {
  const records = RECOMMENDATIONS.filter((r) => {
    if (r.faculty !== faculty) return false;
    if (!majors.includes(r.major)) return false;
    if (universities.length > 0 && !universities.includes(r.university))
      return false;
    return true;
  });

  const map = new Map(); // subject -> { subject, count, sources }

  records.forEach((r) => {
    const picked = [
      ...new Set([
        ...(r.subjects.core || []),
        ...(r.subjects.recommended || []),
      ]),
    ];

    picked.forEach((sub) => {
      if (!map.has(sub)) map.set(sub, { subject: sub, count: 0, sources: [] });
      const entry = map.get(sub);
      entry.count += 1;
      entry.sources.push({ university: r.university, major: r.majorRaw });
    });
  });

  // 우리학교(선택 학년) 개설 과목만 남긴다
  const offered = new Set(SCHOOL_SUBJECTS[selectedGrade] || []);
  const result = [...map.values()].filter((e) => offered.has(e.subject));

  // 빈도수 내림차순, 같으면 과목명 순
  result.sort((a, b) => b.count - a.count || a.subject.localeCompare(b.subject));
  return result;
}

/* 결과 한 줄(행)을 만든다 */
function makeSubjectRow(entry) {
  const row = document.createElement("div");
  row.className = "subject-row";

  // 빈도수
  const freq = document.createElement("span");
  //freq.className = "subject-freq";
  //freq.textContent = `${entry.count}개 학과에서 권장`;

  // 과목명
  const name = document.createElement("span");
  name.className = "subject-name";
  name.textContent = entry.subject;

  // 설명
  const desc = document.createElement("span");
  desc.className = "subject-desc";
  //desc.textContent = (SUBJECTS[entry.subject] || {}).description || "";

  // 세부정보 버튼
  const info = document.createElement("button");
  info.type = "button";
  info.className = "subject-info";
  info.textContent = "i";
  info.setAttribute("aria-label", `${entry.subject} 세부정보`);
  info.addEventListener("click", () => openModal(entry));

  row.append(freq, name, desc, info);
  return row;
}

searchButton.addEventListener("click", () => {
  const faculty = getSelectedFaculty();
  const majors = [...majorMenu.querySelectorAll("input:checked")].map(
    (c) => c.value
  );
  const universities = getSelectedUniversities();

  subjectsRecommend.innerHTML = "";
  viewResult.hidden = false;

  // 필수값 검증: 계열 + 학과
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

  const result = aggregateSubjects(faculty, majors, universities);

  const univNote =
    universities.length > 0 ? ` · 대학 ${universities.length}곳` : " · 전체 대학";
  resultSummary.textContent = `${majors.join(", ")}${univNote} · ${selectedGrade} 개설 과목 기준`;

  if (result.length === 0) {
    subjectsRecommend.innerHTML =
      '<p class="empty-msg">조건에 맞는(그리고 우리학교에서 개설한) 과목이 없습니다.</p>';
    return;
  }

  result.forEach((entry) => subjectsRecommend.appendChild(makeSubjectRow(entry)));
});

/* ---------- 5) 세부정보 팝업 ---------- */
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
  if (e.target === modalOverlay) closeModal(); // 바깥(오버레이) 클릭 시 닫기
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
