/* =========================================================================
 *  curriculum.js  ―  우리학교 편제표 · 임시 선택 폼
 *
 *  - CURRICULUM[학년]의 선택과목군을 질문 형태로 렌더
 *  - 택1 = 라디오, 택N = 체크박스(최대 N개까지)
 *  - (절대) 표기, 선택 개수 검증, localStorage 저장
 * ========================================================================= */

const selectedGrade = localStorage.getItem("selectedGrade") || "1학년";
document.querySelector("#grade-value").textContent = selectedGrade;

const form = document.querySelector("#curriculum-form");
const pickStatus = document.querySelector("#pick-status");
const termSelect = document.querySelector("#term-select");
let allGroups = CURRICULUM[selectedGrade] || [];
let selectedTerm = "all";
let groups = allGroups;
const ABS = new Set(typeof ABSOLUTE_SUBJECTS !== "undefined" ? ABSOLUTE_SUBJECTS : []);
const SCIENCE = new Set(typeof SCIENCE_SUBJECTS !== "undefined" ? SCIENCE_SUBJECTS : []);
const SOCIAL = new Set(typeof SOCIAL_SUBJECTS !== "undefined" ? SOCIAL_SUBJECTS : []);

// 저장된 임시 선택 불러오기
const STORE_KEY = "curriculumPick_" + selectedGrade;
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { saved = {}; }

// 학기 선택 이벤트
if (termSelect) {
  termSelect.addEventListener("change", (e) => {
    selectedTerm = e.target.value;
    if (selectedTerm === "all") {
      groups = allGroups;
    } else {
      groups = allGroups.filter(g => g.term === selectedTerm);
    }
    form.innerHTML = "";
    if (groups.length === 0) {
      form.innerHTML = '<p class="empty-msg">선택한 학기에 과목이 없어요.</p>';
    } else {
      renderGroups();
    }
    updateStatus();
  });
}

if (groups.length === 0) {
  form.innerHTML =
    '<p class="empty-msg">' + selectedGrade + ' 편제표가 아직 등록되지 않았어요.<br>홈에서 학년을 바꾸거나, 편제표 입력을 기다려 주세요.</p>';
  document.querySelector("#footer-bar").hidden = true;
} else {
  renderGroups();
  updateStatus();
}

function subjectLabel(name) {
  return ABS.has(name) ? name + " (절대)" : name;
}

function renderGroups() {
  let prevTerm = null;
  let qno = 0;

  groups.forEach((g, gi) => {
    // 학기(term)가 바뀌면 섹션 헤더
    if (g.term !== prevTerm) {
      const h = document.createElement("h5");
      h.className = "term-header";
      h.textContent = selectedGrade + " " + g.term;
      form.appendChild(h);
      prevTerm = g.term;
    }

    qno += 1;
    const isRadio = g.pick === 1;
    const key = "g" + gi;
    const savedSel = saved[key] || [];

    const card = document.createElement("div");
    card.className = "q-card";
    card.dataset.group = gi;
    card.dataset.pick = g.pick;

    const head = document.createElement("div");
    head.className = "q-head";
    head.innerHTML =
      '<span class="q-no">' + String(qno).padStart(2, "0") + "</span>" +
      '<span class="q-title">' + g.group +
      ' <span class="q-pick">[택' + g.pick + "]</span>" +
      '<span class="q-credit">' + g.credit + "학점</span></span>";
    card.appendChild(head);

    const opts = document.createElement("div");
    opts.className = "q-options";
    g.subjects.forEach((sub) => {
      const label = document.createElement("label");
      label.className = "opt";

      const input = document.createElement("input");
      input.type = isRadio ? "radio" : "checkbox";
      input.name = key;
      input.value = sub;
      if (savedSel.includes(sub)) input.checked = true;

      input.addEventListener("change", (e) => onChange(e, card, g.pick, isRadio));

      const txt = document.createElement("span");
      txt.textContent = subjectLabel(sub);
      if (ABS.has(sub)) txt.classList.add("abs");
      if (SCIENCE.has(sub)) txt.classList.add("science");
      if (SOCIAL.has(sub)) txt.classList.add("social");

      label.append(input, txt);
      opts.appendChild(label);
    });
    card.appendChild(opts);
    form.appendChild(card);
  });
}

// 선택 변경 시: 체크박스는 최대 pick개까지만
function onChange(e, card, pick, isRadio) {
  if (!isRadio) {
    const checked = card.querySelectorAll("input:checked");
    if (checked.length > pick) {
      // 최대 개수를 넘기면 방금 누른 체크를 되돌린다
      e.target.checked = false;
      flash(card);
      return;
    }
  }
  markCard(card, pick);
  updateStatus();
}

function markCard(card, pick) {
  const n = card.querySelectorAll("input:checked").length;
  card.classList.toggle("done", n === pick);
  card.classList.toggle("partial", n > 0 && n < pick);
}

function flash(card) {
  card.classList.add("shake");
  setTimeout(() => card.classList.remove("shake"), 300);
}

function updateStatus() {
  let done = 0;
  document.querySelectorAll(".q-card").forEach((card) => {
    const pick = Number(card.dataset.pick);
    markCard(card, pick);
    if (card.querySelectorAll("input:checked").length === pick) done += 1;
  });
  const total = groups.length;
  pickStatus.textContent = `완료 ${done} / ${total} 선택군`;
  pickStatus.classList.toggle("all-done", done === total);
}

document.querySelector("#save-button").addEventListener("click", () => {
  const result = {};
  let incomplete = 0;
  document.querySelectorAll(".q-card").forEach((card) => {
    const gi = card.dataset.group;
    const pick = Number(card.dataset.pick);
    const vals = [...card.querySelectorAll("input:checked")].map((i) => i.value);
    result["g" + gi] = vals;
    if (vals.length !== pick) incomplete += 1;
  });

  localStorage.setItem(STORE_KEY, JSON.stringify(result));

  if (incomplete > 0) {
    alert(`저장했어요. 아직 ${incomplete}개 선택군이 택 개수를 못 채웠어요.`);
  } else {
    alert("임시 선택을 모두 저장했어요!");
  }
});
