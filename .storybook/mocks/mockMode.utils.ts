import MocksMode from "../../src/config/mocks/mocksMode.enum";
export function isAlwaysMockMode() {
  return false;
}
export function getMocksMode() {
  return MocksMode.DEACTIVATED;
}
export function getMockDelayMs() {
  return 0;
}
export async function waitForMockService() {}
