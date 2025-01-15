// AddImageModal.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddImageModal from '../components/AddImageModal';
import { vi } from 'vitest';

// Mock fileToBase64 function to simulate file upload handling
vi.mock('../utils/base64', () => ({
  fileToBase64: vi.fn().mockResolvedValue('base64image'),
}));

describe('AddImageModal Component', () => {
  // Mock functions for onClose and onSave callbacks
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  // Mock element data for testing
  const mockElement = {
    id: 'image-123',
    type: 'image',
    url: 'https://example.com/image.png',
    width: 30,
    height: 20,
    alt: 'Sample image',
    x: 10,
    y: 20,
    zIndex: 1,
  };

  // Reset mock functions before each test
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  // Test case: Component should render correctly with initial values
  // 测试用例：组件应该使用初始值正确渲染
  test('should render AddImageModal correctly', () => {
    render(<AddImageModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} element={mockElement} />);

    // Verify that the modal title and input fields are rendered correctly
    expect(screen.getByText('Edit Image')).toBeInTheDocument();
    expect(screen.getByLabelText('Image URL')).toHaveValue('https://example.com/image.png');
    expect(screen.getByLabelText('X Position (%)')).toHaveValue(10);
    expect(screen.getByLabelText('Y Position (%)')).toHaveValue(20);
    expect(screen.getByLabelText('Width (%)')).toHaveValue(30);
    expect(screen.getByLabelText('Height (%)')).toHaveValue(20);
    expect(screen.getByLabelText('Alt Text')).toHaveValue('Sample image');
  });

  // Test case: URL input should update correctly
  test('should update image URL input', () => {
    render(<AddImageModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} element={mockElement} />);
    
    const urlInput = screen.getByLabelText('Image URL');
    fireEvent.change(urlInput, { target: { value: 'https://newimage.com/new.png' } });
    expect(urlInput).toHaveValue('https://newimage.com/new.png');
  });

  // Test case: X and Y position inputs should update correctly
  test('should update X and Y positions', () => {
    render(<AddImageModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} element={mockElement} />);

    const xInput = screen.getByLabelText('X Position (%)');
    fireEvent.change(xInput, { target: { value: 50 } });
    expect(xInput).toHaveValue(50);

    const yInput = screen.getByLabelText('Y Position (%)');
    fireEvent.change(yInput, { target: { value: 60 } });
    expect(yInput).toHaveValue(60);
  });

  // Test case: File upload should update imageUrl state correctly
  test('should handle file upload correctly', async () => {
    render(<AddImageModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} element={mockElement} />);

    const fileInput = screen.getByLabelText(/upload file/i);
    const file = new File(['image content'], 'image.png', { type: 'image/png' });
    
    // Simulate file upload and check if imageUrl is updated to 'base64image'
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(await screen.findByDisplayValue('base64image')).toBeInTheDocument();
  });

  // Test case: Clicking Save button should call onSave with updated data
  test('should call onSave with correct data', () => {
    render(<AddImageModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} element={mockElement} />);

    // Update the image URL and click Save
    fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: 'https://newimage.com/new.png' } });
    fireEvent.click(screen.getByText('Save'));

    // Verify onSave is called with the expected data
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'image-123',
        type: 'image',
        url: 'https://newimage.com/new.png',
        width: 30,
        height: 20,
        alt: 'Sample image',
        x: 10,
        y: 20,
        zIndex: 1,
      }),
      true
    );
  });

  // Test case: Clicking Cancel button should call onClose
  test('should call onClose when Cancel button is clicked', () => {
    render(<AddImageModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} element={mockElement} />);

    // Click Cancel button and verify onClose is called
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
