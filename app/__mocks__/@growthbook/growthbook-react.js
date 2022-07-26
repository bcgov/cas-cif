/*
   Enable all growthbook feature flags in jest by default
   otherwise, all tests with 'off' feature flags will fail
*/
module.exports = {
  useFeature: jest.fn().mockImplementation(() => ({ on: true })),
};
