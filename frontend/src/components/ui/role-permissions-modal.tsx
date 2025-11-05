import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, User, Eye, Check, X } from "lucide-react";

interface RoleConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  permissions: string[];
  restrictions?: string[];
}

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleConfigs: Record<string, RoleConfig>;
}

export const RolePermissionsModal = ({ 
  isOpen, 
  onClose, 
  roleConfigs 
}: RolePermissionsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Role Permissions & Access Levels
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {Object.entries(roleConfigs).map(([role, config]) => {
            const Icon = config.icon;
            return (
              <div key={role} className="border border-slate-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {config.label}
                    </h3>
                    <p className="text-sm text-slate-600">{config.description}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Permissions
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {config.permissions.map((permission, index) => (
                        <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {config.restrictions && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">
                          Restrictions
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {config.restrictions.map((restriction, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            {restriction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};