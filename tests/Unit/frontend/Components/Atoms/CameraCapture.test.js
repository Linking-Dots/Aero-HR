/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

import { CameraCapture } from '../../../src/frontend/components/atoms/camera-capture';

// Mock MediaDevices API
const mockGetUserMedia = jest.fn();
const mockGeolocation = {
  getCurrentPosition: jest.fn()
};

// Setup DOM mocks
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia
  }
});

Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: mockGeolocation
});

// Mock HTMLVideoElement methods
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined)
});

Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', {
  writable: true,
  value: 640
});

Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', {
  writable: true,
  value: 480
});

// Mock Canvas Context
const mockContext = {
  drawImage: jest.fn(),
  fillRect: jest.fn(),
  fillText: jest.fn()
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/jpeg;base64,test');

const theme = createTheme();

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('CameraCapture Atom', () => {
  const mockOnCapture = jest.fn();
  const mockStream = {
    getTracks: jest.fn(() => [{ stop: jest.fn() }])
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMedia.mockResolvedValue(mockStream);
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10
        }
      });
    });
  });

  it('renders camera capture component', () => {
    render(
      <TestWrapper>
        <CameraCapture onCapture={mockOnCapture} />
      </TestWrapper>
    );

    expect(screen.getByText('Open Camera')).toBeInTheDocument();
  });

  it('starts camera when button is clicked', async () => {
    render(
      <TestWrapper>
        <CameraCapture onCapture={mockOnCapture} />
      </TestWrapper>
    );

    const startButton = screen.getByText('Open Camera');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: expect.objectContaining({
          facingMode: 'environment'
        })
      });
    });
  });

  it('shows video and capture controls after starting camera', async () => {
    render(
      <TestWrapper>
        <CameraCapture onCapture={mockOnCapture} />
      </TestWrapper>
    );

    const startButton = screen.getByText('Open Camera');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Capture')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });
  });

  it('captures photo with metadata when capture button is clicked', async () => {
    render(
      <TestWrapper>
        <CameraCapture onCapture={mockOnCapture} />
      </TestWrapper>
    );

    // Start camera
    const startButton = screen.getByText('Open Camera');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Capture')).toBeInTheDocument();
    });

    // Capture photo
    const captureButton = screen.getByText('Capture');
    fireEvent.click(captureButton);

    await waitFor(() => {
      expect(mockOnCapture).toHaveBeenCalledWith(
        'data:image/jpeg;base64,test',
        expect.objectContaining({
          timestamp: expect.any(String),
          location: expect.objectContaining({
            latitude: 37.7749,
            longitude: -122.4194
          })
        })
      );
    });
  });

  it('handles camera permission denied', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('NotAllowedError'));

    render(
      <TestWrapper>
        <CameraCapture onCapture={mockOnCapture} />
      </TestWrapper>
    );

    const startButton = screen.getByText('Open Camera');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/Camera access permission denied/)).toBeInTheDocument();
    });
  });

  it('handles geolocation unavailable gracefully', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(new Error('Position unavailable'));
    });

    render(
      <TestWrapper>
        <CameraCapture onCapture={mockOnCapture} />
      </TestWrapper>
    );

    // Start camera
    const startButton = screen.getByText('Open Camera');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Capture')).toBeInTheDocument();
    });

    // Capture photo
    const captureButton = screen.getByText('Capture');
    fireEvent.click(captureButton);

    await waitFor(() => {
      expect(mockOnCapture).toHaveBeenCalledWith(
        'data:image/jpeg;base64,test',
        expect.objectContaining({
          timestamp: expect.any(String),
          location: null
        })
      );
    });
  });

  it('stops camera when stop button is clicked', async () => {
    const mockTrack = { stop: jest.fn() };
    mockStream.getTracks.mockReturnValue([mockTrack]);

    render(
      <TestWrapper>
        <CameraCapture onCapture={mockOnCapture} />
      </TestWrapper>
    );

    // Start camera
    const startButton = screen.getByText('Open Camera');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    // Stop camera
    const stopButton = screen.getByText('Stop');
    fireEvent.click(stopButton);

    await waitFor(() => {
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(screen.getByText('Open Camera')).toBeInTheDocument();
    });
  });

  it('supports custom button text', () => {
    render(
      <TestWrapper>
        <CameraCapture 
          onCapture={mockOnCapture}
          buttonText="Start Recording"
          captureButtonText="Take Photo"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  it('disables buttons when disabled prop is true', () => {
    render(
      <TestWrapper>
        <CameraCapture 
          onCapture={mockOnCapture}
          disabled={true}
        />
      </TestWrapper>
    );

    const startButton = screen.getByText('Open Camera');
    expect(startButton).toBeDisabled();
  });

  it('applies custom styling', () => {
    const customStyle = { marginTop: '20px' };
    const customClass = 'custom-camera-class';

    render(
      <TestWrapper>
        <CameraCapture 
          onCapture={mockOnCapture}
          style={customStyle}
          className={customClass}
        />
      </TestWrapper>
    );

    const container = screen.getByText('Open Camera').closest('div');
    expect(container).toHaveClass(customClass);
    expect(container).toHaveStyle('margin-top: 20px');
  });

  it('cleans up camera stream on unmount', async () => {
    const mockTrack = { stop: jest.fn() };
    mockStream.getTracks.mockReturnValue([mockTrack]);

    const { unmount } = render(
      <TestWrapper>
        <CameraCapture onCapture={mockOnCapture} />
      </TestWrapper>
    );

    // Start camera
    const startButton = screen.getByText('Open Camera');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Capture')).toBeInTheDocument();
    });

    // Unmount component
    unmount();

    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('shows preview text when showPreview is true', async () => {
    render(
      <TestWrapper>
        <CameraCapture 
          onCapture={mockOnCapture}
          showPreview={true}
        />
      </TestWrapper>
    );

    // Start camera
    const startButton = screen.getByText('Open Camera');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Position yourself in the frame and click capture when ready')).toBeInTheDocument();
    });
  });
});
