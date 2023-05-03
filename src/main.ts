import './styles/style.scss';
import { Grade, Semester } from './classes.js'


/** adding a grade field to the form */
const courseListElement = document.querySelector<HTMLDivElement>("[data-course-list]")!;
const addGradeBtn = document.querySelector<HTMLButtonElement>("[data-btn-grade]")!;

const gradeHtml: string = `
  <div class="form-group">
    <h4 class="form-group__title">course:</h4>

    <div class="wrap wrap--input">
      <input type="text" data-course required>
    </div>
  </div>

  <div class="grade__info">
    <div class="form-group form-group--one">
      <h4 class="form-group__title">score:</h4>

      <div class="wrap wrap--input">
        <input type="number" min="0" max="100" data-score required>
      </div>
    </div>

    <div class="form-group form-group--two">
      <h4 class="form-group__title">units:</h4>

      <div class="wrap wrap--input">
        <input type="number" min="0" max="20" data-unit required>
      </div>
    </div>
  </div>
`;

addGradeBtn.addEventListener("click", () => {
  const gradeEl = document.createElement('div');
  gradeEl.classList.add('grade');
  gradeEl.innerHTML = gradeHtml;
  courseListElement.appendChild(gradeEl);
});


/** calcuate gpa */
const gradeForm = document.querySelector<HTMLFormElement>("[data-grade-form]")!;
const partSelect = document.querySelector<HTMLSelectElement>("[data-part]")!;
const semesterSelect = document.querySelector<HTMLSelectElement>("[data-semester]")!;

function calculateGPA(gradePoints: Array<number>, allUnits: Array<number>): number {
    // add grade points and divide by total no of units
  const totalGradePoints = gradePoints.reduce((a, b) => a + b, 0);
  const totalUnits = allUnits.reduce((a, b) => a + b, 0);
  const gpa = totalGradePoints / totalUnits;

  return Number(gpa.toFixed(2));
};

gradeForm.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  // get list of all courses, units, scores where the indexes coresponds
  const coursesList = [...document.querySelectorAll<HTMLInputElement>("[data-course]")].map(input => input.value);
  const unitsList = [...document.querySelectorAll<HTMLInputElement>("[data-unit]")].map(input => input.valueAsNumber);
  const scoresList = [...document.querySelectorAll<HTMLInputElement>("[data-score]")].map(input => input.valueAsNumber);

  // calculate gpa
  const gradesList: Array<Grade> = [];
  coursesList.forEach((course, index) => {
    let gradeParamsTuple: [string, number, number];
    gradeParamsTuple = [course.toLowerCase(), unitsList[index], scoresList[index]];

    let gradeObj = new Grade(...gradeParamsTuple);
    gradesList.push(gradeObj);
  });

  // create semester information
  const totalGradePoints = gradesList.map(grade => grade.gradeTotal);
  const gpa = calculateGPA(totalGradePoints, unitsList);

  let semesterParamsTuple: [string, 'harmattan' | 'rain', number, Array<Grade>];
  semesterParamsTuple = [partSelect.value, <'harmattan' | 'rain'>semesterSelect.value, gpa, gradesList];
  const semesterObj = new Semester(...semesterParamsTuple)
  addSemesterInfo(semesterObj);

  // save semester information to local storage
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("grades") || '[]');
  allSemesters.push(semesterObj);
  localStorage.setItem("grades", JSON.stringify(allSemesters));

  // close the modal
  toggleVisible();
});


/** adding new sememster grade */
const mainContentEl = document.querySelector<HTMLDivElement>('[data-main-content]')!;

function addSemesterInfo(semesterArg: Semester): void {
    // create tile element
  const tileEl = document.createElement('div');
  tileEl.classList.add('tile');
  tileEl.innerHTML = `
    <div class="tile__img">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    </div>

    <div class="tile__details">
      <h4>part ${semesterArg.part.toUpperCase()}, ${semesterArg.semester} semester</h4>
      <p>GPA: ${semesterArg.gpa.toFixed(2)}</p>
      <p>honours: ${semesterArg.honours}</p>
    </div>
  `;
  mainContentEl.appendChild(tileEl);  
};


/** opening and closing the semester grades form */
const semesterBtn = document.querySelector<HTMLButtonElement>("[data-btn-semester]")!;
const closeModalBtn = document.querySelector<HTMLButtonElement>("[data-btn-close]")!;
const mainEl = document.querySelector<HTMLDivElement>("[data-main]")!;
const modalContentEl = document.querySelector<HTMLDivElement>("[data-modal]")!;

  // toggle open/close classe on modal 
function toggleVisible(): void {
  mainEl.classList.toggle('main--blur');
  modalContentEl.classList.toggle('modal--visible');

  // reset the course lists 
  courseListElement.innerHTML = `<div class="grade">${gradeHtml}</div`;
};

  // open modal
semesterBtn.addEventListener("click", toggleVisible);

  // close modal
modalContentEl.addEventListener("click", (e: Event) => {
  if (e.target === e.currentTarget) toggleVisible();
});

  // open/close modal with the close button
closeModalBtn.addEventListener("click", toggleVisible);