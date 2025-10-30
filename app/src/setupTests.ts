import "@testing-library/jest-dom";

// Polyfill para TextEncoder/TextDecoder (necessário para React Router v7)
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Configurações adicionais para testes
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do structuredClone (pode ser necessário para React 19)
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}
