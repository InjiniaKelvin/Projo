/**
 * Detox Initialization
 * Sets up the testing environment and utilities
 */

const detox = require('detox');
const config = require('../.detoxrc.js');
const adapter = require('detox/runners/jest/adapter');

// Set the default timeout for all tests
jest.setTimeout(300000);

// Setup the adapter
jest.mock('detox/runners/jest/adapter');

beforeAll(async () => {
 await detox.init(config, { initGlobals: false });
});

beforeEach(async () => {
 await adapter.beforeEach();
});

afterAll(async () => {
 await adapter.afterAll();
 await detox.cleanup();
});

// Global test utilities
global.waitForElementAndTap = async (elementId, timeout = 10000) => {
 await waitFor(element(by.id(elementId)))
 .toBeVisible()
 .withTimeout(timeout);
 await element(by.id(elementId)).tap();
};

global.waitForElementAndType = async (elementId, text, timeout = 10000) => {
 await waitFor(element(by.id(elementId)))
 .toBeVisible()
 .withTimeout(timeout);
 await element(by.id(elementId)).clearText();
 await element(by.id(elementId)).typeText(text);
};

global.waitForTextAndTap = async (text, timeout = 10000) => {
 await waitFor(element(by.text(text)))
 .toBeVisible()
 .withTimeout(timeout);
 await element(by.text(text)).tap();
};

global.scrollToElement = async (scrollViewId, elementId, direction = 'down') => {
 await waitFor(element(by.id(elementId)))
 .toBeVisible()
 .whileElement(by.id(scrollViewId))
 .scroll(200, direction);
};
