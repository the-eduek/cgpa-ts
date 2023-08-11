import { GradeGroup, SemesterType } from "./index.js";

export class Semester {
  part: string;
  semester: SemesterType;
  gpa: number;
  grades: Array<GradeGroup>;

  constructor(part: string, semester: SemesterType, gpa: number, grades: Array<GradeGroup>) {
    this.part = part;
    this.semester = semester;
    this.gpa = gpa;
    this.grades = grades;
  };

  get honours(): string {
    let gpa = this.gpa;
    let hons: string;

    if (gpa > 4.5) hons = "first class";
    else if (gpa > 3.49 && gpa < 4.5) hons = "second class upper";
    else if (gpa > 2.39 && gpa < 3.5) hons = "second class lower";
    else if (gpa > 1.49 && gpa < 2.4) hons = "third class";
    else if (gpa > 0.9 && gpa < 1.5) hons = "pass";
    else hons = "no way 💀💀";

    return hons;
  };
};