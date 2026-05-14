import { httpPost } from './HttpClient';

const BASE_PATH = '/api/merge';

export const MergeApi = {
  execute(files, materialName, lectureType) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('materialName', materialName);
    formData.append('lectureType', lectureType);

    return httpPost(`${BASE_PATH}/execute`, formData);
  },
};

export default MergeApi;
