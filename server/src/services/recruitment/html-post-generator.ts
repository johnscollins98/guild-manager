import md from 'markdown-it';
import { Service } from 'typedi';
import { MdPostGenerator } from './md-post-generator';
import { PostGenerator } from './post-generator';

@Service()
export class HtmlPostGenerator implements PostGenerator {
  constructor(private readonly mdPostGenerator: MdPostGenerator) {}

  async generateRecruitmentPost(): Promise<string | undefined> {
    const mdPost = await this.mdPostGenerator.generateRecruitmentPost();

    if (!mdPost) {
      return undefined;
    }

    const renderer = new md();

    renderer.renderer.rules.table_open = () =>
      `<table style="border-collapse: collapse;border-spacing: 0">`;

    renderer.renderer.rules.th_open = () => '<th style="border-bottom: 2px solid; padding: 8px">';

    renderer.renderer.rules.td_open = () => '<td style="border-top: 1px solid; padding: 8px">';

    return renderer.render(mdPost);
  }
}
