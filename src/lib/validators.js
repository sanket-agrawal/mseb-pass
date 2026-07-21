export function validateGatePassForm(data) {
  const errors = {};

  if (!data.gatePassType) {
    errors.gatePassType = 'Gate Pass Type is required';
  }

  if (!data.transformerCapacity) {
    errors.transformerCapacity = 'Transformer Capacity is required';
  }

  if (!data.transformerSrNo || !data.transformerSrNo.trim()) {
    errors.transformerSrNo = 'Transformer Serial Number is required';
  }

  if (!data.driverName || !data.driverName.trim()) {
    errors.driverName = 'Driver Name is required';
  }

  if (!data.vehicleNo || !data.vehicleNo.trim()) {
    errors.vehicleNo = 'Vehicle Number is required';
  }

  if (!data.fromSubstation || !data.fromSubstation.trim()) {
    errors.fromSubstation = 'Source Substation is required';
  }

  if (!data.toSubstation || !data.toSubstation.trim()) {
    errors.toSubstation = 'Destination Substation is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateDriver(data) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = 'Driver Name is required';
  if (!data.phone || !data.phone.trim()) errors.phone = 'Phone number is required';
  if (!data.licenseNo || !data.licenseNo.trim()) errors.licenseNo = 'License Number is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
