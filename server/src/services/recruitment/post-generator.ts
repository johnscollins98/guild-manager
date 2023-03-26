export interface PostGenerator {
  generateRecruitmentPost(): Promise<string | undefined>;
}
