import '@testing-library/jest-dom';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-ignore - jsdom ortaminda bulunmuyor
global.ResizeObserver = ResizeObserverMock;
