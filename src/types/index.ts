export interface GradeGroup {
  course: string;
  unit: number;
  score: number;
};

export type GradeGroupKeys = keyof GradeGroup;

export enum SemesterType {
  'first',
  'second'
}