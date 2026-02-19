import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, X, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ToySafetyData {
  ageMin: number;
  ageMax?: number;
  material?: string;
  hasSmallParts: boolean;
  hasChokingHazard: boolean;
  warningLabel?: string;
  safetyCompliances: string[];
  isRecalledByManufacturer?: boolean;
}

interface ToySafetyFormProps {
  productId: string;
  initialData?: ToySafetyData;
  onSave: (data: ToySafetyData) => void;
  isLoading?: boolean;
}

const SAFETY_CERTIFICATIONS = [
  { value: 'CE', label: 'CE Mark (European)' },
  { value: 'ASTM', label: 'ASTM (US Standards)' },
  { value: 'ISO', label: 'ISO International' },
  { value: 'EN71', label: 'EN71 (Toy Safety EU)' },
  { value: 'CPSIA', label: 'CPSIA (US Federal)' },
  { value: 'INDIAN_BUREAU_OF_STANDARDS', label: 'Indian Bureau of Standards' },
];

const MATERIALS = [
  { value: 'plastic', label: 'Plastic' },
  { value: 'wood', label: 'Wood' },
  { value: 'metal', label: 'Metal' },
  { value: 'fabric', label: 'Fabric' },
  { value: 'rubber', label: 'Rubber' },
  { value: 'foam', label: 'Foam' },
  { value: 'mixed', label: 'Mixed Materials' },
];

export const ToySafetyForm: React.FC<ToySafetyFormProps> = ({
  productId,
  initialData,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ToySafetyData>(
    initialData || {
      ageMin: 3,
      material: 'plastic',
      hasSmallParts: false,
      hasChokingHazard: false,
      safetyCompliances: [],
    }
  );

  const [selectedCompliances, setSelectedCompliances] = useState<Set<string>>(
    new Set(initialData?.safetyCompliances || [])
  );

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleToggleCompliance = (certification: string) => {
    const newCompliances = new Set(selectedCompliances);
    if (newCompliances.has(certification)) {
      newCompliances.delete(certification);
    } else {
      newCompliances.add(certification);
    }
    setSelectedCompliances(newCompliances);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (formData.ageMin < 0) {
      toast.error('Minimum age cannot be negative');
      return;
    }

    if (formData.ageMax && formData.ageMax < formData.ageMin) {
      toast.error('Maximum age must be greater than minimum age');
      return;
    }

    const finalData = {
      ...formData,
      safetyCompliances: Array.from(selectedCompliances),
    };

    onSave(finalData);
  };

  const minAgeMonths = formData.ageMin;
  const minAgeYears = Math.floor(minAgeMonths / 12);
  const minAgeRemainder = minAgeMonths % 12;
  const maxAgeYears = formData.ageMax ? Math.floor(formData.ageMax / 12) : null;
  const maxAgeRemainder = formData.ageMax ? formData.ageMax % 12 : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Safety Alert */}
      <div className="flex items-start gap-3 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-900">Important: Toy Safety Requirements</h3>
          <p className="text-sm text-amber-800 mt-1">
            Accurate age ratings and safety information are required by law. Providing false information 
            may result in account suspension or legal action.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Age Range Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Age Suitability</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Age (months) *
              </label>
              <input
                type="number"
                name="ageMin"
                value={formData.ageMin}
                onChange={handleAgeChange}
                min="0"
                max="240"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {minAgeYears > 0 && `${minAgeYears}y`} {minAgeRemainder > 0 && `${minAgeRemainder}m`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Age (months)
              </label>
              <input
                type="number"
                name="ageMax"
                value={formData.ageMax || ''}
                onChange={handleAgeChange}
                min={formData.ageMin}
                max="240"
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.ageMax && (
                <p className="text-xs text-gray-500 mt-1">
                  {maxAgeYears! > 0 && `${maxAgeYears}y`} {maxAgeRemainder! > 0 && `${maxAgeRemainder}m`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Material Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Material & Safety Warnings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Material *
              </label>
              <select
                name="material"
                value={formData.material || ''}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select material</option>
                {MATERIALS.map((mat) => (
                  <option key={mat.value} value={mat.value}>
                    {mat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hazard Warnings */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasSmallParts"
                  checked={formData.hasSmallParts}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Contains Small Parts (Choking Hazard for children under 3)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasChokingHazard"
                  checked={formData.hasChokingHazard}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Choking Hazard Warning Required
                </span>
              </label>
            </div>

            {/* Warning Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Warning Label (if applicable)
              </label>
              <textarea
                name="warningLabel"
                value={formData.warningLabel || ''}
                onChange={handleTextChange}
                placeholder="E.g., 'Do not use for children under 14 years'"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Safety Certifications</h3>
          <p className="text-sm text-gray-600 mb-3">
            Select all applicable safety certifications this toy has passed:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SAFETY_CERTIFICATIONS.map((cert) => (
              <label
                key={cert.value}
                className={`p-3 border border-gray-300 rounded-lg cursor-pointer transition ${
                  selectedCompliances.has(cert.value)
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCompliances.has(cert.value)}
                    onChange={() => handleToggleCompliance(cert.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{cert.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Recall Status */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-red-50 border border-red-200 rounded-lg">
            <input
              type="checkbox"
              name="isRecalledByManufacturer"
              checked={formData.isRecalledByManufacturer || false}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-red-600"
            />
            <span className="text-sm font-medium text-red-900">
              This toy has been recalled by the manufacturer
            </span>
          </label>
          {formData.isRecalledByManufacturer && (
            <p className="text-xs text-red-600 mt-2">
              ⚠️ Recalled products cannot be listed. Please remove this item.
            </p>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isLoading || formData.isRecalledByManufacturer}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Save Toy Safety Information
            </>
          )}
        </button>
      </div>
    </div>
  );
};
