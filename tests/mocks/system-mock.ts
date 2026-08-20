/**
 * Mock implementation for Decentraland runtime ~system bindings in headless tests
 */

export const getExplorerInformation = async () => ({ agent: 'headless', platform: 'DESKTOP' });
export const getPlatform = async () => ({ platform: 'DESKTOP' });
export const getWorldTime = async () => ({ seconds: Date.now() / 1000 });
export const getRealm = async () => ({ realmInfo: { isPreview: true } });
export const readFile = async () => ({ content: new Uint8Array() });

export default {
  getExplorerInformation,
  getPlatform,
  getWorldTime,
  getRealm,
  readFile
};
