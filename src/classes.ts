export interface GradeGroup {
  readonly [key: string] : string | number;
  course: string;
  unit: number;
  score: number;
};

export class Grade implements GradeGroup {
  readonly [key: string] : string | number;
  course: string;
  unit: number;
  score: number;

  constructor(courseArg: string, unitArg: number, scoreArg: number) {
    this.course = courseArg;
    this.unit = unitArg;
    this.score = scoreArg;
  };

  get points(): number {
    let score = this.score;
    let point: number;

    if (score > 69) point = 5;
    else if (score > 59 && score < 70) point = 4;
    else if (score > 49 && score < 60) point = 3;
    else if (score > 44 && score < 50) point = 2;
    else if (score > 39 && score < 45) point = 1;
    else point = 0;

    return point;
  };

  get gradeTotal(): number {
    return this.points * this.unit;
  };
};

export class Semester {
  part: string;
  semester: 'first' | 'second';
  gpa: number;
  grades: Array<GradeGroup>;

  constructor(partArg: string, semesterArg: 'first' | 'second', gpaArg: number, gradesArg: Array<GradeGroup>) {
    this.part = partArg;
    this.semester = semesterArg;
    this.gpa = gpaArg;
    this.grades = gradesArg;
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