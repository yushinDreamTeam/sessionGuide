
/**
 * @typedef {{ name: string, score: number, core: boolean, difficulty: string, reason: string }} RecommendedSubject
 */

/**
 * 우리학교에 실제 개설된 선택(교과) 과목 목록
 * 추천 카드에서 개설 여부 판별에 사용
 */
const schoolSubjects = [
  '대수',
  '미적분Ⅰ',
  '미적분Ⅱ',
  '기하',
  '물리학',
  '화학',
  '생명과학',
  '정보',
  '확률과통계',
  '경제',
  '세계사',
  '정치와법',
];

/**
 * 대학·학과별 추천 과목 및 메타데이터
 * alternatives: 미개설 시 대체 제안 (과목명 → 대체 과목명)
 */
const UNIVERSITY_MAJORS = [
  {
    id: 'ku-cs',
    university: '고려대학교',
    major: '컴퓨터학과',
    label: '고려대학교 · 컴퓨터학과',
    /** @type {RecommendedSubject[]} */
    recommended: [
      {
        name: '미적분Ⅱ',
          },
      {
        name: '기하',
      },
      {
        name: '물리학',
      },
      {
        name: '정보',
      },
      {
        name: '인공지능 수학',
      },
    ],
    /** 미개설 과목 → 우리학교에서 선택 가능한 대안 */
    alternatives: {
      인공지능수학: '확률과통계',
      '인공지능 수학': '확률과통계',
    },
    recordActivities: ['알고리즘 프로젝트', 'AI 탐구 활동', '데이터 분석 활동', '오픈소스 기여 활동'],
  },
  {
    id: 'yu-medi',
    university: '연세대학교',
    major: '의예과',
    label: '연세대학교 · 의예과',
    recommended: [
      {
        name: '화학',
        score: 5,
        core: true,
        difficulty: '상',
        reason: '의학계열은 생화학·약물 작용 이해를 위해 화학이 핵심입니다.',
      },
      {
        name: '생명과학',
        score: 5,
        core: true,
        difficulty: '상',
        reason: '인체·세포·유전 개념은 의학 전공의 기본 언어입니다.',
      },
      {
        name: '미적분Ⅱ',
        score: 4,
        core: true,
        difficulty: '상',
        reason: '의학 통계·모델링·연구 방법론에 수학적 기반이 필요합니다.',
      },
      {
        name: '확률과통계',
        score: 4,
        core: false,
        difficulty: '중',
        reason: '역학·임상시험·데이터 해석에 통계 사고가 필수입니다.',
      },
      {
        name: '물리학',
        score: 3,
        core: false,
        difficulty: '중',
        reason: '의용 물리·영상의학 등 분야 연계 시 유리합니다.',
      },
    ],
    alternatives: {},
    recordActivities: ['생명과학 실험', '의학 윤리 탐구', '유전자 분석 활동', '보건 정책 토론'],
  },
  {
    id: 'khu-ai',
    university: '경희대학교',
    major: 'AI학과',
    label: '경희대학교 · AI학과',
    recommended: [
      {
        name: '미적분Ⅱ',
        score: 5,
        core: true,
        difficulty: '상',
        reason: 'AI·딥러닝 이론은 선형대수·미적분 기반입니다.',
      },
      {
        name: '확률과통계',
        score: 5,
        core: true,
        difficulty: '상',
        reason: '확률모델·베이지안 추론 등에 직접 연결됩니다.',
      },
      {
        name: '정보',
        score: 5,
        core: true,
        difficulty: '중',
        reason: '구현 역량과 자료구조 이해가 AI 실무의 출발점입니다.',
      },
      {
        name: '기하',
        score: 3,
        core: false,
        difficulty: '중',
        reason: '그래프 신경망·기하학적 데이터 표현 이해에 보조적입니다.',
      },
      {
        name: '물리학',
        score: 3,
        core: false,
        difficulty: '중',
        reason: '로보틱스·센서 융합 트랙을 고려한다면 유리합니다.',
      },
    ],
    alternatives: {},
    recordActivities: ['Kaggle 스타터 프로젝트', '캡스톤 AI 모델 기획', '윤리적 AI 토론'],
  },
  {
    id: 'yu-cs',
    university: '연세대학교',
    major: '컴퓨터과학과',
    label: '연세대학교 · 컴퓨터과학과',
    recommended: [
      {
        name: '미적분Ⅱ',
        score: 5,
        core: true,
        difficulty: '상',
        reason: '이산·연속 수학 기반 이론 과목의 선수요건입니다.',
      },
      {
        name: '기하',
        score: 4,
        core: true,
        difficulty: '상',
        reason: '알고리즘·그래프 이론 학습에 도움이 됩니다.',
      },
      {
        name: '물리학',
        score: 3,
        core: false,
        difficulty: '중',
        reason: '시스템·전산물리 등 선택적 연계가 가능합니다.',
      },
      {
        name: '정보',
        score: 5,
        core: true,
        difficulty: '중',
        reason: '프로그래밍 역량과 컴퓨팅 사고의 핵심입니다.',
      },
      {
        name: '확률과통계',
        score: 4,
        core: false,
        difficulty: '중',
        reason: '머신러닝·알고리즘 랜덤성 이해에 필요합니다.',
      },
    ],
  },
];

/**
 * 계열 기반 로드맵 (진로 미정)
 * id: 내부 식별자, label: 버튼 표시명
 */
const TRACK_ROADMAPS = [
  {
    id: 'engineering',
    label: '공학',
    required: ['대수', '미적분Ⅰ', '미적분Ⅱ', '기하', '물리학'],
    extra: ['화학', '정보', '인공지능 수학'],
    relatedMajors: ['컴퓨터공학과', '전자공학과', '기계공학과', '반도체공학과'],
  },
  {
    id: 'medicine',
    label: '의학',
    required: ['화학', '생명과학', '미적분Ⅱ'],
    extra: ['확률과통계', '물리학'],
    relatedMajors: ['의예과', '한의예과', '치의예과', '수의예과'],
  },
  {
    id: 'natural',
    label: '자연과학',
    required: ['미적분Ⅱ', '물리학', '화학', '생명과학'],
    extra: ['기하', '확률과통계'],
    relatedMajors: ['물리학과', '화학과', '생명과학과', '수학과'],
  },
  {
    id: 'humanities',
    label: '인문사회',
    required: ['세계사', '정치와법'],
    extra: ['경제', '확률과통계'],
    relatedMajors: ['사회학과', '심리학과', '행정학과', '언어학과'],
  },
  {
    id: 'business',
    label: '경영경제',
    required: ['경제', '확률과통계', '미적분Ⅱ'],
    extra: ['정치와법', '세계사'],
    relatedMajors: ['경영학과', '경제학과', '금융공학과', '회계학과'],
  },
  {
    id: 'arts',
    label: '예체능',
    required: ['미적분Ⅰ'],
    extra: ['세계사', '정보'],
    relatedMajors: ['디자인학과', '체육학과', '음악과', '미술과'],
  },
  {
    id: 'itai',
    label: 'IT·AI',
    required: ['정보', '미적분Ⅱ', '확률과통계'],
    extra: ['기하', '물리학', '인공지능 수학'],
    relatedMajors: ['AI학과', '소프트웨어학과', '데이터사이언스학과', '정보보안학과'],
  },
];

/** 체크리스트에 표시할 전체 과목 풀 (학교 개설 + 문맥상 자주 쓰이는 과목) */
const ALL_SUBJECT_POOL = [
  ...new Set([
    ...schoolSubjects,
    '인공지능 수학',
    ...TRACK_ROADMAPS.flatMap((t) => [...t.required, ...t.extra]),
  ]),
].sort((a, b) => a.localeCompare(b, 'ko'));

// ---------- 유틸 ----------

/**
 * 학교 개설 여부
 * @param {string} subjectName
 */
function isSchoolOffered(subjectName) {
  return schoolSubjects.includes(subjectName);
}

/**
 * 미개설 시 대체 과목 문구 생성
 * @param {string} name
 * @param {Record<string, string>} alternatives
 */
function getAlternativeText(name, alternatives) {
  const compact = name.replace(/\s/g, '');
  const alt = alternatives[name] || alternatives[compact];


  return '';
}

/**
 * 토스트 메시지 (로그인 등 단순 안내)
 */
function showToast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  el.classList.add('is-show');
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    el.classList.remove('is-show');
    el.hidden = true;
  }, 2600);
}

// ---------- 테마 ----------

function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('coursemap-theme');
  if (saved === 'dark') root.dataset.theme = 'dark';
  const btn = document.getElementById('themeToggle');
  btn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (next === 'dark') {
      root.dataset.theme = 'dark';
      localStorage.setItem('coursemap-theme', 'dark');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      delete root.dataset.theme;
      localStorage.setItem('coursemap-theme', 'light');
      btn.setAttribute('aria-pressed', 'false');
    }
  });
  if (root.dataset.theme === 'dark') btn?.setAttribute('aria-pressed', 'true');
}

// ---------- 네비게이션 / 뷰 전환 ----------

/**
 * 단일 페이지 내 섹션(뷰) 전환
 * @param {string} viewId home | university | track | algorithm | compare | curriculum
 */
function showView(viewId) {
  document.querySelectorAll('.view').forEach((v) => {
    v.classList.toggle('view-active', v.id === `view-${viewId}`);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindNav() {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const id = el.getAttribute('data-nav');
      if (!id || (el.tagName === 'A' && e.metaKey)) return;
      e.preventDefault();
      showView(id);
      closeMobileNav();
    });
    el.addEventListener('keydown', (e) => {
      if (
        (el.classList.contains('choice-card') || el.getAttribute('role') === 'button') &&
        (e.key === 'Enter' || e.key === ' ')
      ) {
        e.preventDefault();
        el.click();
      }
    });
  });
}

/** 모바일 메뉴: 데스크톱 nav 링크 복제 */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('mobileNav');
  const mainNav = document.querySelector('.main-nav');
  if (!toggle || !panel || !mainNav) return;

  panel.innerHTML = mainNav.innerHTML;
  panel.querySelectorAll('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => closeMobileNav());
  });

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  });
}

function closeMobileNav() {
  const panel = document.getElementById('mobileNav');
  const toggle = document.getElementById('navToggle');
  panel?.classList.remove('is-open');
  if (panel) panel.hidden = true;
  toggle?.setAttribute('aria-expanded', 'false');
}

// ---------- 스크롤 reveal ----------

/**
 * 스크롤 시 fade-in (특정 루트만 관찰해 동적 영역 재생성 시 중복 관찰 최소화)
 * @param {ParentNode} [root=document]
 */
function initScrollReveal(root = document) {
  const els = root.querySelectorAll('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));
}

/** 뷰 전환 후 동적 콘텐츠 reveal 보조 */
function refreshRevealInView() {
  document.querySelectorAll('.view-active .reveal:not(.is-visible)').forEach((el) => {
    requestAnimationFrame(() => el.classList.add('is-visible'));
  });
}

// ---------- 검색: 메뉴 하이라이트 ----------

function initSearch() {
  const input = document.getElementById('globalSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll('.is-hit').forEach((n) => n.classList.remove('is-hit'));
    if (!q) return;
    document.querySelectorAll('.nav-link, .track-btn').forEach((btn) => {
      const t = (btn.textContent || '').toLowerCase();
      if (t.includes(q)) btn.classList.add('is-hit');
    });
  });
}

// ---------- 대학·학과 UI ----------

function populateUniversitySelects() {
  const uniSel = document.getElementById('selUniversity');
  const majorSel = document.getElementById('selMajor');
  if (!uniSel || !majorSel) return;

  const universities = [...new Set(UNIVERSITY_MAJORS.map((m) => m.university))];
  uniSel.innerHTML = universities.map((u) => `<option value="${u}">${u}</option>`).join('');

  function fillMajors(uni) {
    const list = UNIVERSITY_MAJORS.filter((m) => m.university === uni);
    majorSel.innerHTML = list.map((m) => `<option value="${m.id}">${m.major}</option>`).join('');
  }

  fillMajors(universities[0]);
  uniSel.addEventListener('change', () => fillMajors(uniSel.value));

  document.getElementById('btnLoadMajor')?.addEventListener('click', () => {
    const id = majorSel.value;
    const data = UNIVERSITY_MAJORS.find((m) => m.id === id);
    if (data) renderMajorResult(data);
    refreshRevealInView();
  });
}

/**
 * 추천 과목 카드 + 생기부 활동
 * @param {(typeof UNIVERSITY_MAJORS)[0]} data
 */
function renderMajorResult(data) {
  const area = document.getElementById('majorResultArea');
  if (!area) return;

  const cards = data.recommended
    .map((s) => {
      const offered = isSchoolOffered(s.name);
      const altHtml = !offered ? `<div class="alt-subject">${getAlternativeText(s.name, data.alternatives)}</div>` : '';
      return `
        <article class="subject-card ${offered ? '' : 'not-offered'} reveal">
          <h3 class="subject-name">${s.name}</h3>
          <div class="badges">
            ${s.core ? '<span class="badge badge-core">핵심 추천</span>' : ''}
            <span class="badge ${offered ? 'badge-school' : 'badge-muted'}">${offered ? '우리학교 개설중' : '우리학교 미개설'}</span>
          </div>
          ${altHtml}
        </article>
      `;
    })
    .join('');

  const activities = (data.recordActivities || [])
    .map((a) => `<span class="activity-pill">${a}</span>`)
    .join('');

  area.innerHTML = `
    <div class="subsection-title">추천 과목 — ${data.label}</div>
    <div class="subject-grid">${cards}</div>

  `;
  initScrollReveal(area);
}

// ---------- 계열 UI ----------

let activeTrackId = TRACK_ROADMAPS[0].id;

function renderTrackButtons() {
  const wrap = document.getElementById('trackButtons');
  if (!wrap) return;
  wrap.innerHTML = TRACK_ROADMAPS.map(
    (t) =>
      `<button type="button" class="track-btn ${t.id === activeTrackId ? 'is-active' : ''}" data-track="${t.id}" role="tab" aria-selected="${t.id === activeTrackId}">${t.label}</button>`
  ).join('');

  wrap.querySelectorAll('.track-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTrackId = btn.getAttribute('data-track') || TRACK_ROADMAPS[0].id;
      renderTrackButtons();
      renderTrackResult(activeTrackId);
      refreshRevealInView();
    });
  });
}

/**
 * @param {string} trackId
 */
function renderTrackResult(trackId) {
  const area = document.getElementById('trackResultArea');
  const t = TRACK_ROADMAPS.find((x) => x.id === trackId);
  if (!area || !t) return;

  const pills = (arr) => arr.map((n) => `<li>${n}</li>`).join('');
  const majors = t.relatedMajors.map((m) => `<span class="major-mini-card">${m}</span>`).join('');

  area.innerHTML = `
    <div class="roadmap">
      <div class="roadmap-block reveal">
        <h3>필수 추천</h3>
        <ul class="pill-list">${pills(t.required)}</ul>
      </div>
      <div class="roadmap-block reveal">
        <h3>추가 추천</h3>
        <ul class="pill-list">${pills(t.extra)}</ul>
      </div>
      <div class="subsection-title">관련 추천 학과</div>
      <div class="major-chip-row">${majors}</div>
    </div>
  `;
  initScrollReveal(area);
}

// ---------- 교육과정 목록 ----------

function renderCurriculum() {
  const ul = document.getElementById('curriculumList');
  if (!ul) return;
  ul.innerHTML = schoolSubjects.map((s) => `<li>${s}</li>`).join('');
}

// ---------- 적합도 알고리즘 ----------

/**
 * 목표 학과의 총점(만점)과 과목별 점수 맵
 * @param {(typeof UNIVERSITY_MAJORS)[0]} major
 */
function getMajorScoreModel(major) {
  let max = 0;
  /** @type {Record<string, number>} */
  const map = {};
  major.recommended.forEach((s) => {
    max += s.score;
    map[s.name] = s.score;
  });
  return { max, map };
}

function populateAlgoMajorSelect() {
  const sel = document.getElementById('algoMajor');
  if (!sel) return;
  sel.innerHTML = UNIVERSITY_MAJORS.map((m) => `<option value="${m.id}">${m.label}</option>`).join('');
}

function renderAlgoChecklist() {
  const box = document.getElementById('algoChecklist');
  if (!box) return;
  box.innerHTML = ALL_SUBJECT_POOL.map(
    (name) => `
    <label class="check-item">
      <input type="checkbox" value="${name}" />
      <span>${name}</span>
    </label>
  `
  ).join('');
}

/**
 * 적합도 = (선택한 과목 중 추천에 포함된 점수 합 / 추천 만점) * 100
 */
function runFitAlgorithm() {
  const majorId = document.getElementById('algoMajor')?.value;
  const area = document.getElementById('algoResultArea');
  if (!majorId || !area) return;

  const major = UNIVERSITY_MAJORS.find((m) => m.id === majorId);
  if (!major) return;

  const { max, map } = getMajorScoreModel(major);
  const checked = [...document.querySelectorAll('#algoChecklist input:checked')].map((i) => /** @type {HTMLInputElement} */ (i).value);

  let earned = 0;
  checked.forEach((name) => {
    if (map[name]) earned += map[name];
  });

  const pct = max > 0 ? Math.round((earned / max) * 100) : 0;

  /** 추천에는 있으나 학생이 체크하지 않은 과목 */
  const missing = major.recommended.filter((s) => !checked.includes(s.name)).sort((a, b) => b.score - a.score);

  /** 추가로 들으면 좋은 과목 (미체크 중 점수 높은 순, 상위 3) */
  const addSuggest = missing.slice(0, 3);

  const deficitHtml =
    missing.length === 0
      ? '<p>추천 과목을 모두 충족했습니다. 심화 탐구·세특을 보강해 보세요.</p>'
      : `<p class="deficit-list"><strong>부족·미선택 추천 과목:</strong> ${missing.map((m) => `${m.name}(${m.score}점)`).join(', ')}</p>
         <p><strong>우선 추가 추천:</strong> ${addSuggest.map((m) => m.name).join(', ')}</p>`;

  area.innerHTML = `
    <div class="fit-visual reveal">
      <div class="donut" style="--p: ${pct}%">
        <div class="donut-inner">${pct}%</div>
      </div>
      <div class="progress-wrap">
        <label>전공 적합도 (가중 점수 기준)</label>
        <div class="progress-bar"><span style="width: ${pct}%"></span></div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin:0.5rem 0 0;">획득 ${earned}점 / 만점 ${max}점</p>
      </div>
    </div>
    ${deficitHtml}
    <p style="font-size:0.8rem;color:var(--text-muted);margin-top:1rem;">※ 데모 알고리즘입니다. 실제 입시는 학교·대학 안내를 따르세요.</p>
  `;

  requestAnimationFrame(() => {
    area.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  });
}

// ---------- 대학 비교 ----------

function populateCompareSelects() {
  const a = document.getElementById('cmpA');
  const b = document.getElementById('cmpB');
  if (!a || !b) return;
  const opts = UNIVERSITY_MAJORS.map((m) => `<option value="${m.id}">${m.label}</option>`).join('');
  a.innerHTML = opts;
  b.innerHTML = opts;
  if (UNIVERSITY_MAJORS.length >= 2) {
    a.value = UNIVERSITY_MAJORS[0].id;
    b.value = UNIVERSITY_MAJORS[3].id;
  }
}

function runCompare() {
  const idA = document.getElementById('cmpA')?.value;
  const idB = document.getElementById('cmpB')?.value;
  const area = document.getElementById('compareResultArea');
  if (!idA || !idB || !area) return;

  const ma = UNIVERSITY_MAJORS.find((m) => m.id === idA);
  const mb = UNIVERSITY_MAJORS.find((m) => m.id === idB);
  if (!ma || !mb) return;

  const namesA = new Set(ma.recommended.map((s) => s.name));
  const namesB = new Set(mb.recommended.map((s) => s.name));
  const all = new Set([...namesA, ...namesB]);

  const rows = [...all]
    .sort((x, y) => x.localeCompare(y, 'ko'))
    .map((name) => {
      const inA = namesA.has(name);
      const inB = namesB.has(name);
      let note = '';
      if (inA && inB) note = '<span class="tag-common">공통</span>';
      else if (inA) note = `<span class="tag-diff">${ma.university} 측만</span>`;
      else note = `<span class="tag-diff">${mb.university} 측만</span>`;
      return `<tr><td>${name}</td><td>${inA ? '○' : '—'}</td><td>${inB ? '○' : '—'}</td><td>${note}</td></tr>`;
    })
    .join('');

  area.innerHTML = `
    <div class="compare-table-wrap reveal">
      <table class="compare-table">
        <thead>
          <tr>
            <th>과목</th>
            <th>${ma.label}</th>
            <th>${mb.label}</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
  requestAnimationFrame(() => area.querySelector('.reveal')?.classList.add('is-visible'));
}

// ---------- 로그인 버튼 (데모) ----------

function initLoginButton() {
  document.querySelector('.btn-login')?.addEventListener('click', () => {
    showToast('데모 버전입니다. 로그인 기능은 연동되지 않았습니다.');
  });
}

// ---------- 통계 숫자 ----------

function animateStats() {
  const majors = UNIVERSITY_MAJORS.length;
  const subjects = ALL_SUBJECT_POOL.length;
  const elM = document.querySelector('[data-stat="majors"]');
  const elS = document.querySelector('[data-stat="subjects"]');
  if (elM) elM.textContent = `${majors}+`;
  if (elS) elS.textContent = `${subjects}+`;
}

// ---------- 초기화 ----------

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  bindNav();
  initMobileNav();
  /** 데스크톱 너비로 전환 시 열린 햄버거 메뉴 정리 */
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 1024px)').matches) closeMobileNav();
  });
  initScrollReveal();
  initSearch();
  populateUniversitySelects();
  populateAlgoMajorSelect();
  renderAlgoChecklist();
  populateCompareSelects();
  renderTrackButtons();
  renderTrackResult(activeTrackId);
  renderCurriculum();
  animateStats();

  document.getElementById('btnRunAlgo')?.addEventListener('click', runFitAlgorithm);
  document.getElementById('btnCompare')?.addEventListener('click', runCompare);

  initLoginButton();

  const majorSel = document.getElementById('selMajor');
  if (majorSel?.value) {
    const first = UNIVERSITY_MAJORS.find((m) => m.id === majorSel.value);
    if (first) renderMajorResult(first);
  }

  document.getElementById('btnCompare')?.click();
});
