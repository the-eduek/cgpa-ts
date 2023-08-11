import { GradeGroup } from "..";

export class Grade implements GradeGroup {
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