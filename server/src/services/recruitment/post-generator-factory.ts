import { Service } from 'typedi';
import { Container } from 'typeorm-typedi-extensions';
import { HtmlPostGenerator } from './html-post-generator';
import { MdPostGenerator } from './md-post-generator';

@Service()
export class PostGeneratorFactory {
  getPostGenerator(isHtml: boolean) {
    return isHtml ? Container.get(HtmlPostGenerator) : Container.get(MdPostGenerator);
  }
}
