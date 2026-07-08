/* =========================================================================
 *  main.js  ―  홈 화면 (학년 선택 저장)
 *
 *  학년 값을 localStorage("selectedGrade")에 저장하고,
 *  각 페이지(focused.js 등)는 이 값을 읽어 학년별 데이터를 쓴다.
 * ========================================================================= */

const gradeSelect = document.querySelector(".grade-select");

// 저장된 학년이 있으면 초기값으로 복원
const savedGrade = localStorage.getItem("selectedGrade");
if (savedGrade) {
  gradeSelect.value = savedGrade;
} else {
  // 처음 방문이면 현재 select 값을 기본으로 저장
  localStorage.setItem("selectedGrade", gradeSelect.value);
}

// 학년을 바꾸면 즉시 저장
gradeSelect.addEventListener("change", () => {
  localStorage.setItem("selectedGrade", gradeSelect.value);
});
