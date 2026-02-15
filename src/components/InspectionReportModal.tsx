import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Eye, Shield, Car, Settings, Zap } from 'lucide-react';

interface InspectionItem {
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
}

interface InspectionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  title?: string;
}

const mockInspectionData: Record<string, InspectionItem[]> = {
  'default': [
    { category: 'Exterior', item: 'Body Condition', status: 'pass', details: 'No dents or scratches' },
    { category: 'Exterior', item: 'Paint Quality', status: 'pass', details: 'Original paint, minor fading' },
    { category: 'Interior', item: 'Seats & Upholstery', status: 'warning', details: 'Minor wear on driver seat' },
    { category: 'Mechanical', item: 'Engine Performance', status: 'pass', details: 'Runs smoothly, no unusual noises' },
    { category: 'Mechanical', item: 'Transmission', status: 'pass', details: 'Shifts smoothly' },
    { category: 'Electrical', item: 'Battery', status: 'pass', details: 'Good charge capacity' },
    { category: 'Electrical', item: 'Lights', status: 'fail', details: 'Rear brake light not working' },
    { category: 'Safety', item: 'Brakes', status: 'pass', details: 'Responsive braking' },
    { category: 'Safety', item: 'Tires', status: 'warning', details: 'Tread depth adequate but uneven wear' },
  ]
};

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  isOpen,
  onClose,
  itemId,
  title = 'Item Inspection Report'
}) => {
  if (!isOpen) return null;

  const inspectionData = mockInspectionData[itemId] || mockInspectionData['default'];

  const getStatusIcon = (status: InspectionItem['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: InspectionItem['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'fail':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  const categories = [...new Set(inspectionData.map(item => item.category))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <Card className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">Comprehensive inspection report</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-semibold text-green-700">
                    {inspectionData.filter(item => item.status === 'pass').length} Passed
                  </p>
                  <p className="text-sm text-green-600">Items in good condition</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-semibold text-yellow-700">
                    {inspectionData.filter(item => item.status === 'warning').length} Warnings
                  </p>
                  <p className="text-sm text-yellow-600">Items needing attention</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                <div>
                  <p className="font-semibold text-red-700">
                    {inspectionData.filter(item => item.status === 'fail').length} Failed
                  </p>
                  <p className="text-sm text-red-600">Items requiring repair</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Detailed Report */}
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {category === 'Exterior' && <Car className="h-5 w-5" />}
                  {category === 'Interior' && <Settings className="h-5 w-5" />}
                  {category === 'Mechanical' && <Settings className="h-5 w-5" />}
                  {category === 'Electrical' && <Zap className="h-5 w-5" />}
                  {category === 'Safety' && <Shield className="h-5 w-5" />}
                  {category}
                </h3>
                <div className="space-y-2">
                  {inspectionData
                    .filter(item => item.category === category)
                    .map((item, index) => (
                      <Card key={index} className={`p-4 border ${getStatusColor(item.status)}`}>
                        <div className="flex items-start gap-3">
                          {getStatusIcon(item.status)}
                          <div className="flex-1">
                            <p className="font-medium">{item.item}</p>
                            {item.details && (
                              <p className="text-sm mt-1 opacity-75">{item.details}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              <p>Report generated on {new Date().toLocaleDateString()}</p>
              <p>Inspected by QuickMela certified technicians</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Eye className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InspectionReportModal;
