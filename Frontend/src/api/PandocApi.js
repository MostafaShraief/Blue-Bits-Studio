import { httpPost } from './HttpClient';

const BASE_PATH = '/api/pandoc';

export const PandocApi = {
  generate(markdownText, templateName, materialName, type, lectureNumber, isSinglePage) {
    return httpPost(`${BASE_PATH}/generate`, {
      markdownText,
      templateName,
      materialName,
      type,
      lectureNumber,
      isSinglePage: isSinglePage || false,
    });
  },
};

export default PandocApi;
