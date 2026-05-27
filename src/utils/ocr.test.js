const { createWorker } = require('tesseract.js');
const { ReadText, extractDates, extractChip, extractResult } = require('./ocr');

jest.mock('tesseract.js', () => {
  const mWorker = {
    load: jest.fn(),
    loadLanguage: jest.fn(),
    initialize: jest.fn(),
    setParameters: jest.fn(),
    recognize: jest.fn(),
    terminate: jest.fn(),
  };
  return {
    createWorker: jest.fn(() => mWorker)
  };
});

describe('ReadText Error Paths', () => {
  let worker;
  beforeEach(() => {
    worker = createWorker();
    jest.clearAllMocks();
  });

  it('should handle load failure', async () => {
    worker.load.mockRejectedValue(new Error('load failed'));

    const result = await ReadText('dummy.png');

    expect(result).toBe('An error occurred: Error: load failed');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('should handle loadLanguage failure', async () => {
    worker.load.mockResolvedValue();
    worker.loadLanguage.mockRejectedValue(new Error('loadLanguage failed'));

    const result = await ReadText('dummy.png');

    expect(result).toBe('An error occurred: Error: loadLanguage failed');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('should handle initialize failure', async () => {
    worker.load.mockResolvedValue();
    worker.loadLanguage.mockResolvedValue();
    worker.initialize.mockRejectedValue(new Error('initialize failed'));

    const result = await ReadText('dummy.png');

    expect(result).toBe('An error occurred: Error: initialize failed');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('should handle setParameters failure', async () => {
    worker.load.mockResolvedValue();
    worker.loadLanguage.mockResolvedValue();
    worker.initialize.mockResolvedValue();
    worker.setParameters.mockRejectedValue(new Error('setParameters failed'));

    const result = await ReadText('dummy.png');

    expect(result).toBe('An error occurred: Error: setParameters failed');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('should handle recognize failure', async () => {
    worker.load.mockResolvedValue();
    worker.loadLanguage.mockResolvedValue();
    worker.initialize.mockResolvedValue();
    worker.setParameters.mockResolvedValue();
    worker.recognize.mockRejectedValue(new Error('recognize failed'));

    const result = await ReadText('dummy.png');

    expect(result).toBe('An error occurred: Error: recognize failed');
    expect(worker.terminate).toHaveBeenCalled();
  });
});

describe('ReadText Success Path', () => {
  let worker;
  beforeEach(() => {
    worker = createWorker();
    jest.clearAllMocks();
  });

  it('should return extracted text successfully', async () => {
    worker.load.mockResolvedValue();
    worker.loadLanguage.mockResolvedValue();
    worker.initialize.mockResolvedValue();
    worker.setParameters.mockResolvedValue();
    worker.recognize.mockResolvedValue({ data: { text: 'Extracted text here' } });

    const result = await ReadText('dummy.png');

    expect(result).toBe('Extracted text here');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('should use default oem and psm when not provided', async () => {
    worker.load.mockResolvedValue();
    worker.loadLanguage.mockResolvedValue();
    worker.initialize.mockResolvedValue();
    worker.setParameters.mockResolvedValue();
    worker.recognize.mockResolvedValue({ data: { text: 'Extracted text here' } });

    await ReadText('dummy.png');

    expect(worker.setParameters).toHaveBeenCalledWith({
      tessedit_ocr_engine_mode: 2,
      tessedit_pageseg_mode: 3,
    });
  });

  it('should use provided oem and psm values', async () => {
    worker.load.mockResolvedValue();
    worker.loadLanguage.mockResolvedValue();
    worker.initialize.mockResolvedValue();
    worker.setParameters.mockResolvedValue();
    worker.recognize.mockResolvedValue({ data: { text: 'Extracted text here' } });

    await ReadText('dummy.png', 1, 4);

    expect(worker.setParameters).toHaveBeenCalledWith({
      tessedit_ocr_engine_mode: 1,
      tessedit_pageseg_mode: 4,
    });
  });
});

describe('Utility Functions', () => {
  describe('extractDates', () => {
    it('should extract dates in dd/mm/yyyy format', () => {
      expect(extractDates('The date is 12/05/2023.')).toEqual(['12/05/2023']);
    });

    it('should extract dates in dd.mm.yyyy format', () => {
      expect(extractDates('The date is 12.05.2023.')).toEqual(['12.05.2023']);
    });

    it('should return null if no date is found', () => {
      expect(extractDates('No date here.')).toBeNull();
    });

    it('should extract multiple dates', () => {
      expect(extractDates('Dates: 1/2/2023 and 03.04.2024')).toEqual(['1/2/2023', '03.04.2024']);
    });
  });

  describe('extractChip', () => {
    it('should extract a 15-digit chip number', () => {
      expect(extractChip('Chip ID: 123456789012345')).toEqual(['123456789012345']);
    });

    it('should return null if no 15-digit number is found', () => {
      expect(extractChip('Chip ID: 123456')).toBeNull();
    });

    it('should extract multiple chip numbers', () => {
      expect(extractChip('Chips: 123456789012345 and 987654321098765')).toEqual(['123456789012345', '987654321098765']);
    });
  });

  describe('extractResult', () => {
    it('should return negative for negative results', () => {
      expect(extractResult('Result: Negative')).toBe('negative');
      expect(extractResult('Result: שלילי')).toBe('negative');
    });

    it('should return positive for positive results', () => {
      expect(extractResult('Result: Positive')).toBe('positive');
      expect(extractResult('Result: חיובי')).toBe('positive');
    });

    it('should return unknown for other results', () => {
      expect(extractResult('Result: Inconclusive')).toBe('unknown');
      expect(extractResult('Result: None')).toBe('unknown');
    });
  });
});
