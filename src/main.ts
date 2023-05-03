import './styles/style.scss';

/** adding a grade field to the form */
const courseListEl = document.querySelector<HTMLDivElement>("[data-course-list]")!;
const addGradeBtn = document.querySelector<HTMLButtonElement>("[data-btn-grade]")!;

addGradeBtn.addEventListener("click", () => {
  const gradeEl = document.createElement('div');
  gradeEl.classList.add('grade');
  gradeEl.innerHTML = `
    <div class="form-group form-group--one">
      <h4 class="form-group__title">course:</h4>
      <div class="wrap wrap--input">
        <input type="text" name="courseTitle">
      </div>
    </div>

    <div class="form-group form-group--two">
      <h4 class="form-group__title">score:</h4>
      <div class="wrap wrap--input">
        <input type="number" min="0" max="100" name="courseScore">
      </div>
    </div>
  `;
  courseListEl.appendChild(gradeEl);
});


/** submit grade form  */
const gradeFormEl = document.querySelector<HTMLFormElement>("[data-grade-form]")!;

gradeFormEl.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();
});


/** opening and closing the semester grades form */
const semesterBtn = document.querySelector<HTMLButtonElement>("[data-btn-semester]")!;
const closeModalBtn = document.querySelector<HTMLButtonElement>("[data-btn-close]")!;
const mainContentEl = document.querySelector<HTMLDivElement>("[data-main]")!;
const modalContentEl = document.querySelector<HTMLDivElement>("[data-modal]")!;

  // toggle open/close classe on modal 
function toggleVisible() {
  mainContentEl.classList.toggle('main--blur');
  modalContentEl.classList.toggle('modal--visible');
};

  // open modal
semesterBtn.addEventListener("click", toggleVisible);

  // close modal
modalContentEl.addEventListener("click", (e: Event) => {
  if (e.target === e.currentTarget) toggleVisible();
});

  // open/close modal with the close button
closeModalBtn.addEventListener("click", toggleVisible);