import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReceiptList } from './List';
import { message } from 'antd';

// Mock the antd message
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

// Mock the ReceiptModal component so we don't have to deal with its internals
vi.mock('./ReceiptModal', () => ({
  ReceiptModal: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    open ? (
      <div data-testid="mock-receipt-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null
  ),
}));

describe('ReceiptList Component', () => {
  const mockReceipts = [
    {
      id: '1',
      serial: 'REC-001',
      createdDate: '2023-10-01T00:00:00Z',
      warehouse: 'Kho A',
      deliverName: 'Nguyen Van A',
      totalInText: 'Một triệu đồng',
      receiptTypeId: 'type-1',
      receiptType: { name: 'Nhập kho' },
    },
  ];

  const mockReceiptTypes = [
    { id: 'type-1', code: 'NK', name: 'Nhập kho' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the global fetch
    globalThis.fetch = vi.fn((url) => {
      if (url === '/api/v1/inventory') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockReceipts }),
        });
      }
      if (url === '/api/v1/receipt-types/all') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockReceiptTypes }),
        });
      }
      return Promise.reject(new Error('not found'));
    }) as unknown as typeof fetch;
  });

  it('renders the table and fetches data on mount', async () => {
    render(<ReceiptList />);

    // Wait for the table to populate
    await waitFor(() => {
      expect(screen.getByText('REC-001')).toBeInTheDocument();
    });

    expect(screen.getByText('Kho A')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Nhập kho')).toBeInTheDocument(); // Name of receiptType
    
    // Verify fetch was called
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/inventory');
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/receipt-types/all');
  });

  it('opens modal when clicking "Tạo phiếu nhập"', async () => {
    const user = userEvent.setup();
    render(<ReceiptList />);
    
    const createButton = screen.getByRole('button', { name: /Tạo phiếu nhập/i });
    await user.click(createButton);
    
    expect(screen.getByTestId('mock-receipt-modal')).toBeInTheDocument();
  });

  it('calls delete API when confirming deletion', async () => {
    const user = userEvent.setup();
    
    // Mock successful delete
    vi.mocked(globalThis.fetch).mockImplementation((input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      if (url === '/api/v1/inventory' || url === '/api/v1/receipt-types/all') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockReceipts }),
        }) as Promise<Response>;
      }
      if (url === '/api/v1/inventory/1' && init?.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        }) as Promise<Response>;
      }
      return Promise.reject(new Error('not found'));
    });

    render(<ReceiptList />);

    await waitFor(() => {
      expect(screen.getByText('REC-001')).toBeInTheDocument();
    });

    // Find all delete buttons in the table
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    
    // Click the delete button of the first record (Wait for Popconfirm)
    await user.click(deleteButtons[0]);
    
    // Click OK on Popconfirm (Wait for it to appear in DOM)
    const confirmButton = await screen.findByRole('button', { name: 'OK' });
    await user.click(confirmButton);
    
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/inventory/1', { method: 'DELETE' });
      expect(message.success).toHaveBeenCalledWith('Xóa thành công');
    });
  });
});
