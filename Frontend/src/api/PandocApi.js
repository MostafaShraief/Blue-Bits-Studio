import { httpPost } from './HttpClient';

const BASE_PATH = '/api/pandoc';

export const PandocApi = {
  generate(markdownText, templateName, materialName, type, lectureNumber) {
    return httpPost(`${BASE_PATH}/generate`, {
      markdownText,
      templateName,
      materialName,
      type,
      lectureNumber,
    });
  },
};

export default PandocApi;
