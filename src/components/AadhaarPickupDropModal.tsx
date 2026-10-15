import React from 'react';
import { HomePickupModal } from './HomePickupModal';
import { SiteInfo } from '../types';

export interface AadhaarPickupDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteInfo: SiteInfo;
  onNavigateToTrack?: (trackingToken: string) => void;
  onSuccess?: () => void;
}

export const AadhaarPickupDropModal: React.FC<AadhaarPickupDropModalProps> = (props) => {
  return <HomePickupModal {...props} />;
};

export default AadhaarPickupDropModal;
