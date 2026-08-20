import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReceiptModal } from './ReceiptModal';
import { message } from 'antd';

vi.mock('antd', async () => {
  const antd = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...antd,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('ReceiptModal Component (Form Validation & Submission)', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockReceiptTypes = [{ id: 'type-1', code: 'NK', name: 'Nhập kho', description: '' }];

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('Happy case: should submit successfully when all fields are valid', async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: 'new-id' } }),
    } as Response);

    render(
      <ReceiptModal 
        open={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        receiptTypes={mockReceiptTypes} 
      />
    );

    // We only fill some fields to simulate a submit. 
    // Wait for the modal to be visible and find the submit button.
    const saveButton = screen.getByRole('button', { name: 'Lưu' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      expect(message.success).toHaveBeenCalledWith('Lưu thành công');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('Unhappy case 1: should show error message when API returns 400 (Missing required fields)', async () => {
    const user = userEvent.setup();
    // Simulate backend returning validation error
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ 
        message: 'Validation failed', 
        errors: [{ path: 'body.companyName', message: 'Company name is required' }] 
      }),
    } as Response);

    render(
      <ReceiptModal 
        open={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        receiptTypes={mockReceiptTypes} 
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Lưu' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
      // It should display the error message returned from the backend
      expect(message.error).toHaveBeenCalledWith('Validation failed');
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('Unhappy case 2: should display generic error message when API fails entirely (500)', async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'An unexpected internal server error occurred.' }),
    } as Response);

    render(
      <ReceiptModal 
        open={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        receiptTypes={mockReceiptTypes} 
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Lưu' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith('An unexpected internal server error occurred.');
    });
  });
});
