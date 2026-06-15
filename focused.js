//모든 드롭다운 탐색
const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach((dropdown) => {
  //현재 dropdown 안에 있는 버튼과 메뉴만 찾는다
  const button = dropdown.querySelector(".dropdown-button");
  const menu = dropdown.querySelector(".dropdown-menu");

  button.addEventListener("click", () => {
    //현재 메뉴가 닫혀 있는지 확인 
    const isClosed = menu.hidden;

   // 모든 드롭다운 메뉴를 닫는다 
    document.querySelectorAll(".dropdown-menu").forEach((otherMenu) => {
      otherMenu.hidden = true;
    });

    //원래 닫혀 있던 메뉴라면 다시 연다. 원래 열려 있던 메뉴라면 닫힌 상태로 둔다 
    menu.hidden = !isClosed;
  });
});

//학과선택 초기화 함수 
function resetMajorSelection() {
  const majorDropdown = document.querySelector("#select-major");
  const majorButton = majorDropdown.querySelector(".dropdown-button");
  const majorMenu = majorDropdown.querySelector(".dropdown-menu");

  //학과 체크박스 전부 해제 
  majorMenu.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.checked = false;
  });

  //학과 버튼 텍스트 초기화 
  majorButton.textContent = "학과 선택";

  //학과 드롭다운 닫기 
  majorMenu.hidden = true;
}

//계열 또는 학교 교체시 학과 초기화 
const univMenu = document.querySelector("#select-univ .dropdown-menu");
const disciplineMenu = document.querySelector("#select-dicipline .dropdown-menu");

univMenu.addEventListener("change", () => {
  resetMajorSelection();
});

disciplineMenu.addEventListener("change", () => {
  resetMajorSelection();
});

//검색 함수 
function searchsubjects() {
  let click = document.getElementById('search-button');
  if (click.style.display === 'none'){
    click.style.display = 'block';
  } else {
    click.style.display = 'none';
  }
}

const subjectData = {
  "학과1": ["1", "2", "3", "4"],
  "학과2": ["a", "b", "c", "d"]
};

const searchButton = document.querySelector("#search-button");
const viewResult = document.querySelector("#view-result");
const subjectsRecommend = document.querySelector("#subjects-recommend");

searchButton.addEventListener("click", () => {
  const selectedMajor = document.querySelector(
    "#select-major input[type='checkbox']:checked"
  );

  subjectsRecommend.innerHTML = "";

  if (!selectedMajor) {
    viewResult.hidden = false;

    subjectsRecommend.innerHTML = `
      <div class="subject-tag">학과를 선택해 주세요.</div>
    `;

    return;
  }

  const majorName = selectedMajor.value;
  const subjects = subjectData[majorName];

  if (!subjects) {
    viewResult.hidden = false;

    subjectsRecommend.innerHTML = `
      <div class="subject-tag">해당 학과의 추천 과목 데이터가 없습니다.</div>
    `;

    return;
  }

  subjects.forEach((subject) => {
    const subjectTag = document.createElement("div");
    subjectTag.className = "subject-tag";
    subjectTag.textContent = subject;

    subjectsRecommend.appendChild(subjectTag);
  });

  viewResult.hidden = false;
});

//학과 하나만 선택
const majorCheckboxes = document.querySelectorAll(
  "#select-major input[type='checkbox']"
);

majorCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      majorCheckboxes.forEach((otherCheckbox) => {
        if (otherCheckbox !== checkbox) {
          otherCheckbox.checked = false;
        }
      });

      const majorButton = document.querySelector(
        "#select-major .dropdown-button"
      );

      majorButton.textContent = checkbox.value;
    }
  });
});
