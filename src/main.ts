import './styles/style.scss';
import { GradeGroup, Grade, Semester } from './classes.js';


/** adding a grade field to the form */
const courseListElement = document.querySelector<HTMLDivElement>("[data-course-list]")!;
const addGradeBtn = document.querySelector<HTMLButtonElement>("[data-btn-grade]")!;
const calcGradeBtn = document.querySelector<HTMLButtonElement>("[data-btn-calculate]")!;

addGradeBtn.addEventListener("click", () => {
  const formField = addGradeFormField();
  courseListElement.append(formField);
});

function addGradeFormField(grade?: GradeGroup): HTMLDivElement {
  // each form field has three inputs; course, unit and score.
  const inputFields = [ 'course', 'score', 'unit' ];
  const gradeInputEl = document.createElement('div');
  gradeInputEl.className = 'grade';

  let inputFieldElements: HTMLDivElement[] = [];
  inputFields.forEach(field => {
    const fieldGroupEl = document.createElement('div');
    fieldGroupEl.className = 'form-group';
    if (field === 'score') fieldGroupEl.classList.add('form-group--one');
    if (field === 'unit') fieldGroupEl.classList.add('form-group--two');

    const fieldGroupHeaderEl = document.createElement('h4');
    fieldGroupHeaderEl.className = 'form-group__title';
    fieldGroupHeaderEl.innerText = `${field}:`;

    const fieldInputWrapEl = document.createElement('div');
    fieldInputWrapEl.classList.add('wrap');
    fieldInputWrapEl.classList.add('wrap--input');

    const fieldInputEl = document.createElement('input');
    fieldInputEl.dataset[field] = 'true';

    // set values for input fields if grade object available
    if (grade) {
      fieldInputEl.value = <string>grade[field];
      fieldInputEl.setAttribute('disabled', 'true');
    } else fieldInputEl.setAttribute('required', 'true');

    // input fields depending on field type
    if (field === 'course') fieldInputEl.type = 'text';
    else {
      fieldInputEl.min = '0';
      fieldInputEl.max = '100';
      fieldInputEl.type = 'number';
    };

    fieldInputWrapEl.append(fieldInputEl);
    fieldGroupEl.append(fieldGroupHeaderEl, fieldInputWrapEl);
    inputFieldElements.push(fieldGroupEl);
  })

  const flexWrapEl = document.createElement('div');
  flexWrapEl.className = 'grade__info';
  flexWrapEl.append(inputFieldElements[1], inputFieldElements[2]);
  gradeInputEl.append(inputFieldElements[0], flexWrapEl);

  return gradeInputEl;
};


/** calculate gpa */
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
  const coursesList = [...document.querySelectorAll<HTMLInputElement>("[data-course=true]")].map(input => input.value);
  const unitsList = [...document.querySelectorAll<HTMLInputElement>("[data-unit=true]")].map(input => input.valueAsNumber);
  const scoresList = [...document.querySelectorAll<HTMLInputElement>("[data-score=true]")].map(input => input.valueAsNumber);

  // check if there's already grade information existing for the same part and semester
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("semesters") || '[]');
  const semesterAlreadyExists = allSemesters.some(semesterItem => semesterItem.part === partSelect.value && semesterItem.semester === semesterSelect.value);

  if (!semesterAlreadyExists) {
    // calculate gpa
    const gradesList: Array<Grade> = [];
    coursesList.forEach((course, index) => {
      let gradeParamsTuple: [string, number, number];
      gradeParamsTuple = [course.toLowerCase(), unitsList[index], scoresList[index]];

      let gradeObj = new Grade(...gradeParamsTuple);
      gradesList.push(gradeObj);
    });
    const totalGradePoints = gradesList.map(grade => grade.gradeTotal);
    const gpa = calculateGPA(totalGradePoints, unitsList);

    
    // create semester object
    let semesterParamsTuple: [string, 'harmattan' | 'rain', number, Array<Grade>];
    semesterParamsTuple = [partSelect.value, <'harmattan' | 'rain'>semesterSelect.value, gpa, gradesList];
    const semesterObj = new Semester(...semesterParamsTuple);

    // save semester object to local storage
    allSemesters.push(semesterObj);
    localStorage.setItem("semesters", JSON.stringify(allSemesters));

    // calculate cummulative gpa and set student object
    setStudentDetails();
  } else {
    /** @todo: display some kind of warning on the ui that semester already exists */
    console.log(`there's already information for part ${partSelect.value}, ${semesterSelect.value} semester.`)
  };

  // close the modal
  toggleVisible();

  // update page with new content
  displayMainContent();
});


/** get student info, calculate cummulative gpa */
function setStudentDetails(): void {
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("semesters") || '[]');
  const semesterExists = Boolean(allSemesters.length);

  // check for student profile object or create a new object if it doesn't exist
  const studentProfile: { cgpa: number, honours: string } = JSON.parse(localStorage.getItem("student") || '{}');

  if (semesterExists) {
    const gradesList = allSemesters.map(semester => semester.grades);

    let cummulativeGradePoints: Array<number> = [];
    let cummulativeUnits: Array<number> = [];

    gradesList.forEach(gradeArray => {
      let semesterGradesList: Array<Grade> = [];

      gradeArray.forEach(grade => {
        let gradeParamsTuple: [string, number, number];
        gradeParamsTuple = [grade.course, grade.unit, grade.score];
    
        let gradeObj = new Grade(...gradeParamsTuple);
        semesterGradesList.push(gradeObj);
      });

      cummulativeGradePoints.push(...semesterGradesList.map(gr => gr.gradeTotal));
      cummulativeUnits.push(...semesterGradesList.map(gr => gr.unit));
    });
    
    const cgpa = calculateGPA(cummulativeGradePoints, cummulativeUnits);

    let hons: string;
    if (cgpa > 4.5) hons = "first class 🏆";
    else if (cgpa > 3.49 && cgpa < 4.5) hons = "second class upper 💪🏾";
    else if (cgpa > 2.39 && cgpa < 3.5) hons = "second class lower 🤞🏾";
    else if (cgpa > 1.49 && cgpa < 2.4) hons = "third class 😬";
    else if (cgpa > 0.9 && cgpa < 1.5) hons = "pass 🤡";
    else hons = "no way 💀";

    studentProfile.cgpa = cgpa;
    studentProfile.honours = hons;
  } else {
    studentProfile.cgpa = 0;
    studentProfile.honours = '——'
  };

  localStorage.setItem("student", JSON.stringify(studentProfile));
};


/** displaying semester tiles  */
const mainContentEl = document.querySelector<HTMLDivElement>('[data-main-content]')!;

function displaySemesterInfo(semesterArg: Semester): void {
  // create and display tile element
  const tileEl = document.createElement('div');  
  tileEl.className = "tile";

  const tileImgEl = document.createElement('div');
  const tileIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  `;
  tileImgEl.className = "tile__img";
  tileImgEl.innerHTML = tileIconSvg;

  const tileDetailsEl = document.createElement('div');
  tileDetailsEl.className = "tile__details";
  const tileDetailsWrapEl = document.createElement('div');
 
  const tileBtnWrapEl = document.createElement('div');
  tileBtnWrapEl.className = "tile__btn";

  const tileBtnEl = document.createElement('button');
  tileBtnEl.classList.add("btn");
  tileBtnEl.classList.add("btn--close");
  tileBtnEl.type = "button";

  const tileBtnTextEl = document.createElement('span');
  tileBtnTextEl.innerText = "delete";

  const tileBtnIconEl = document.createElement('span');
  const tileBtnIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `;
  tileBtnIconEl.className = "btn__icon";
  tileBtnIconEl.innerHTML = tileBtnIconSvg;

  const tileSemesterEl = document.createElement('h4');
  tileSemesterEl.innerText = `part ${semesterArg.part.toUpperCase()}, ${semesterArg.semester} semester`;

  const tileGpaEl = document.createElement('p');
  tileGpaEl.innerText = `GPA: ${semesterArg.gpa.toFixed(2)}`;

  tileBtnEl.append(tileBtnTextEl);
  tileBtnEl.append(tileBtnIconEl);
  tileBtnWrapEl.append(tileBtnEl);
  tileDetailsWrapEl.append(tileSemesterEl);
  tileDetailsWrapEl.append(tileBtnWrapEl);
  tileDetailsEl.append(tileDetailsWrapEl);
  tileDetailsEl.append(tileGpaEl);
  tileEl.append(tileImgEl);
  tileEl.append(tileDetailsEl);

  // add delete functionality to the clear button;
  tileBtnEl.addEventListener("click", () => {
    deleteSemester(semesterArg);

    // update page with new content
    displayMainContent();
  });

  // view semester courses and grades functionality
  tileSemesterEl.addEventListener("click", () => {
    // open semester grades form modal
    toggleVisible();
    openSemesterGrades(semesterArg);
  });

  mainContentEl.appendChild(tileEl);
};


/** opening and closing the semester grades form */
const semesterBtn = document.querySelector<HTMLButtonElement>("[data-btn-semester]")!;
const closeModalBtn = document.querySelector<HTMLButtonElement>("[data-btn-close]")!;
const mainEl = document.querySelector<HTMLDivElement>("[data-main]")!;
const modalContentEl = document.querySelector<HTMLDivElement>("[data-modal]")!;

// toggle open/close classe on modal 
function toggleVisible(): void {
  // resets
  partSelect.value = "I";
  partSelect.removeAttribute("disabled");
  partSelect.parentElement!.classList.remove('wrap--disabled');

  semesterSelect.value = "harmattan";
  semesterSelect.removeAttribute("disabled");
  semesterSelect.parentElement!.classList.remove('wrap--disabled');

  addGradeBtn.removeAttribute("disabled");
  calcGradeBtn.removeAttribute("disabled");
  
  courseListElement.innerHTML = addGradeFormField().outerHTML;

  // close / open modal
  mainEl.classList.toggle('main--blur');
  modalContentEl.classList.toggle('modal--visible');
};

// open modal
semesterBtn.addEventListener("click", toggleVisible);

// close modal
modalContentEl.addEventListener("click", (e: Event) => {
  if (e.target === e.currentTarget) toggleVisible();
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key.toLowerCase() === 'escape') {
    const isModalVisible =  modalContentEl.classList.contains('modal--visible');
    if (isModalVisible) toggleVisible();
  };
});

// open/close modal with the close button
closeModalBtn.addEventListener("click", toggleVisible);


/** kickstarting the app with available data */
document.addEventListener("DOMContentLoaded", displayMainContent);

function displayMainContent(): void {
  // create and display student tile element
  let studentProfile: { cgpa: number, honours: string } = JSON.parse(localStorage.getItem("student")!);
  
  if (!studentProfile) {
    setStudentDetails();
    studentProfile = JSON.parse(localStorage.getItem("student")!);
  };

  const tileEl = document.createElement('div');  
  tileEl.className = "tile";

  const tileImgEl = document.createElement('div');
  const tileIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  `;
  tileImgEl.className = "tile__img";
  tileImgEl.innerHTML = tileIconSvg;

  const tileDetailsEl = document.createElement('div');
  tileDetailsEl.className = "tile__details";

  const tileDetailsTitleEl = document.createElement('h3');
  tileDetailsTitleEl.innerText = "student";

  const tileCgpaEl = document.createElement('p');
  const tileCgpaTextEl = document.createElement('b');
  tileCgpaTextEl.innerText = `${studentProfile.cgpa.toFixed(2)}`
  tileCgpaEl.innerHTML = `cummulative GPA: ${tileCgpaTextEl.outerHTML}`;

  const tileHonsEl = document.createElement('p');
  const tileHonsTextEl = document.createElement('b');
  tileHonsTextEl.innerText = `${studentProfile.honours}`
  tileHonsEl.innerHTML = `honours: ${tileHonsTextEl.outerHTML}`;

  tileDetailsEl.append(tileDetailsTitleEl);
  tileDetailsEl.append(tileCgpaEl);
  tileDetailsEl.append(tileHonsEl);
  tileEl.append(tileImgEl);
  tileEl.append(tileDetailsEl);

  mainContentEl.innerHTML = "";
  mainContentEl.appendChild(tileEl);

  // display semester tiles
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("semesters")!);
  if (allSemesters) allSemesters.forEach(semester => displaySemesterInfo(semester));
};


/** delete semester information */
function deleteSemester(semester: Semester): void {
  const allSemesters: Array<Semester> = JSON.parse(localStorage.getItem("semesters")!);
  const selectedSemesterIndex = allSemesters.findIndex(semesterItem => semesterItem.part === semester.part && semesterItem.semester === semester.semester);
  allSemesters.splice(selectedSemesterIndex, 1);
  localStorage.setItem("semesters", JSON.stringify(allSemesters));
  setStudentDetails();
};


/** clear all app data */
const clearBtn = document.querySelector<HTMLButtonElement>("[data-btn-clear]")!;

function clearApp(): void {
  localStorage.clear();
  displayMainContent();
};

clearBtn.addEventListener("click", clearApp);


/** view semester courses and grades */
function openSemesterGrades(semesterObj: Semester): void {
  // set part and semester values and disable the input values
  partSelect.value = semesterObj.part;
  partSelect.setAttribute("disabled", "true");
  partSelect.parentElement!.classList.add('wrap--disabled');

  semesterSelect.value = semesterObj.semester;
  semesterSelect.setAttribute("disabled", "true");
  semesterSelect.parentElement!.classList.add('wrap--disabled');
  
  // show all grades avaiable    
  courseListElement.innerHTML = "";

  semesterObj.grades.forEach(grade => {
    const gradeElement = addGradeFormField(grade);
    courseListElement.appendChild(gradeElement);
  });

  // disable calculate and add grade buttons
  addGradeBtn.setAttribute("disabled", "true");
  calcGradeBtn.setAttribute("disabled", "true");
};