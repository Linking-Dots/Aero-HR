/**
 * Attendance Configuration Modal Component
 * 
 * Modal for configuring employee attendance settings including
 * polygon, WiFi/IP, and route waypoint configurations.
 * 
 * @component
 * @example
 * ```jsx
 * <AttendanceConfigModal 
 *   isOpen={modalOpen}
 *   onClose={() => setModalOpen(false)}
 *   selectedUser={user}
 *   onSave={handleSaveConfig}
 *   isLoading={false}
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Chip
} from "@heroui/react";
import { CogIcon } from "@heroicons/react/24/outline";

/**
 * Attendance Configuration Modal Component
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Function to close modal
 * @param {Object} props.selectedUser - Selected user object
 * @param {Function} props.onSave - Function to save configuration
 * @param {boolean} props.isLoading - Loading state for save operation
 * @returns {JSX.Element} Rendered AttendanceConfigModal component
 */
const AttendanceConfigModal = ({
  isOpen,
  onClose,
  selectedUser,
  onSave,
  isLoading
}) => {
  const [attendanceConfig, setAttendanceConfig] = useState({});

  // Reset config when user changes
  useEffect(() => {
    if (selectedUser?.attendance_config) {
      setAttendanceConfig(selectedUser.attendance_config);
    } else {
      setAttendanceConfig({});
    }
  }, [selectedUser]);

  /**
   * Handle save configuration
   */
  const handleSave = async () => {
    if (selectedUser && onSave) {
      const success = await onSave(selectedUser.id, attendanceConfig);
      if (success) {
        onClose();
      }
    }
  };

  /**
   * Handle JSON input parsing
   */
  const handleJsonInput = (value, key) => {
    try {
      const parsed = JSON.parse(value);
      setAttendanceConfig(prev => ({
        ...prev,
        [key]: parsed
      }));
    } catch (error) {
      // Invalid JSON, don't update state
      console.warn('Invalid JSON input:', error);
    }
  };

  /**
   * Render configuration form based on attendance type
   */
  const renderConfigForm = () => {
    if (!selectedUser?.attendance_type) {
      return (
        <div className="text-center py-8 text-default-500">
          No attendance type configured for this user
        </div>
      );
    }

    const attendanceType = selectedUser.attendance_type;

    switch (attendanceType.slug) {
      case 'geo_polygon':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Polygon Configuration</h4>
            <Textarea
              label="Polygon Coordinates (JSON)"
              placeholder="Enter polygon coordinates..."
              value={JSON.stringify(attendanceConfig.polygon || [], null, 2)}
              onValueChange={(value) => handleJsonInput(value, 'polygon')}
              description="Enter polygon coordinates as JSON array: [{'lat': 23.123, 'lng': 90.456}, ...]"
              classNames={{
                input: "bg-transparent",
                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
              }}
            />
          </div>
        );

      case 'wifi_ip':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">WiFi/IP Configuration</h4>
            <Input
              label="Allowed IP Ranges"
              placeholder="192.168.1.0/24, 10.0.0.0/8"
              value={Array.isArray(attendanceConfig.allowed_ranges) 
                ? attendanceConfig.allowed_ranges.join(', ') 
                : (attendanceConfig.allowed_ranges || '')
              }
              onValueChange={(value) => {
                const ranges = value.split(',').map(range => range.trim()).filter(Boolean);
                setAttendanceConfig({
                  ...attendanceConfig, 
                  allowed_ranges: ranges
                });
              }}
              description="Enter IP ranges like: 192.168.1.0/24, 10.0.0.0/8"
              classNames={{
                input: "bg-transparent",
                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
              }}
            />
          </div>
        );

      case 'route_waypoint':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Route Waypoint Configuration</h4>
            <Input
              label="Tolerance (meters)"
              type="number"
              value={attendanceConfig.tolerance?.toString() || '200'}
              onValueChange={(value) => 
                setAttendanceConfig({
                  ...attendanceConfig, 
                  tolerance: parseInt(value)
                })
              }
              classNames={{
                input: "bg-transparent",
                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
              }}
            />
            <Textarea
              label="Waypoints (JSON)"
              placeholder="Enter waypoints..."
              value={JSON.stringify(attendanceConfig.waypoints || [], null, 2)}
              onValueChange={(value) => handleJsonInput(value, 'waypoints')}
              description="Enter waypoints as JSON array: [{'lat': 23.123, 'lng': 90.456, 'name': 'Checkpoint 1'}, ...]"
              classNames={{
                input: "bg-transparent",
                inputWrapper: "bg-white/10 backdrop-blur-md border-white/20"
              }}
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-default-500">
            No configuration options available for this attendance type
          </div>
        );
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white/10 backdrop-blur-md border border-white/20",
        header: "border-b border-white/20",
        body: "py-6",
        footer: "border-t border-white/20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CogIcon className="w-5 h-5" />
            Configure Attendance Settings
          </div>
          <p className="text-sm text-default-500">
            Employee: {selectedUser?.name}
            {selectedUser?.attendance_type && (
              <Chip 
                size="sm"
                variant="flat"
                className="ml-2"
              >
                {selectedUser.attendance_type.name}
              </Chip>
            )}
          </p>
        </ModalHeader>
        
        <ModalBody>
          {renderConfigForm()}
        </ModalBody>
        
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={handleSave}
            isLoading={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            Save Configuration
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AttendanceConfigModal;
