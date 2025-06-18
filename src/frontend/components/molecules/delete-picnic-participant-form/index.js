// Delete Picnic Participant Form Module
// Atomic design molecule for enterprise participant deletion management

// Main component exports
export { default } from './DeletePicnicParticipantForm.jsx';
export { default as DeletePicnicParticipantForm } from './DeletePicnicParticipantForm.jsx';

// Sub-components
export { default as DeletePicnicParticipantFormCore } from './components/DeletePicnicParticipantFormCore.jsx';
export { default as DeletePicnicParticipantFormValidationSummary } from './components/DeletePicnicParticipantFormValidationSummary.jsx';

// Configuration and validation
export { deletePicnicParticipantFormConfig } from './config.js';

// Hooks
export {
  useDeletePicnicParticipantForm,
  useDeletePicnicParticipantFormValidation,
  useDeletePicnicParticipantFormAnalytics,
  useCompleteDeletePicnicParticipantForm
} from './hooks/index.js';

// Type definitions for JSDoc (if needed)
/**
 * @typedef {Object} ParticipantData
 * @property {string|number} id - Participant identifier
 * @property {string} name - Participant name
 * @property {string} status - Participant status
 * @property {string} registrationDate - Registration date
 * @property {string} paymentStatus - Payment status
 */

/**
 * @typedef {Object} EventData
 * @property {string|number} id - Event identifier
 * @property {string} name - Event name
 * @property {string} date - Event date
 * @property {string} status - Event status
 */

/**
 * @typedef {Object} DeletePicnicParticipantFormOptions
 * @property {boolean} enableAnalytics - Enable analytics tracking
 * @property {string} securityLevel - Security level (standard, high, maximum)
 * @property {boolean} showValidationSummary - Show validation summary panel
 * @property {boolean} autoValidate - Enable automatic validation
 * @property {boolean} confirmBeforeClose - Confirm before closing with unsaved changes
 */

/**
 * @typedef {Object} DeletePicnicParticipantFormProps
 * @property {boolean} isOpen - Whether the form dialog is open
 * @property {Function} onClose - Callback when form is closed
 * @property {ParticipantData} participantData - Participant data
 * @property {EventData} eventData - Event data
 * @property {Function} onSuccess - Success callback
 * @property {Function} onError - Error callback
 * @property {DeletePicnicParticipantFormOptions} options - Form options
 */
