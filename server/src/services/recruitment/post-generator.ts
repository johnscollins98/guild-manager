export interface PostGenerator {
  generateRecruitmentPost(): Promise<string | null>;
}
