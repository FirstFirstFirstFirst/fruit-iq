/**
 * PromptPay QR Code Generation Utility
 * Generates QR codes for PromptPay payments in Thailand
 */

export interface PromptPayData {
  phoneNumber?: string;
  nationalId?: string;
  amount: number;
  currency?: string;
}

/**
 * Generate PromptPay QR Code data string
 * @param data PromptPayData object containing payment information
 * @returns QR code data string for PromptPay
 */
export function generatePromptPayQR(data: PromptPayData): string {
  const { phoneNumber, nationalId, amount } = data;
  
  if (!phoneNumber && !nationalId) {
    throw new Error('Either phoneNumber or nationalId is required');
  }
  
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  // Convert phone number format (remove + and spaces)
  let receiverId = '';
  if (phoneNumber) {
    receiverId = phoneNumber.replace(/\+66|0/, '66').replace(/\D/g, '');
  } else if (nationalId) {
    receiverId = nationalId.replace(/\D/g, '');
  }

  // PromptPay EMV QR Code format
  const qrData = buildPromptPayEMV(receiverId, amount, phoneNumber ? 'phone' : 'nationalId');
  
  return qrData;
}

/**
 * Build PromptPay EMV QR Code data
 * @param receiverId Phone number or National ID
 * @param amount Payment amount
 * @param type Type of receiver ID
 * @returns EMV QR code string
 */
function buildPromptPayEMV(receiverId: string, amount: number, type: 'phone' | 'nationalId'): string {
  // EMV QR Code structure for PromptPay
  const data: Record<string, string> = {};
  
  // Payload Format Indicator
  data['00'] = '01';
  
  // Point of Initiation Method
  data['01'] = '12'; // Dynamic QR Code
  
  // Merchant Account Information
  const merchantAccountInfo = buildMerchantAccountInfo(receiverId, type);
  data['29'] = merchantAccountInfo;
  
  // Merchant Category Code
  data['52'] = '0000';
  
  // Transaction Currency (THB = 764)
  data['53'] = '764';
  
  // Transaction Amount
  data['54'] = amount.toFixed(2);
  
  // Country Code
  data['58'] = 'TH';
  
  // Additional Data Field
  data['62'] = buildAdditionalDataField();
  
  // Build the complete QR string
  let qrString = '';
  Object.keys(data).forEach(key => {
    const value = data[key];
    const length = value.length.toString().padStart(2, '0');
    qrString += key + length + value;
  });
  
  // Calculate and append CRC
  const crc = calculateCRC16(qrString + '6304');
  qrString += '63' + '04' + crc;
  
  return qrString;
}

/**
 * Build Merchant Account Information for PromptPay
 */
function buildMerchantAccountInfo(receiverId: string, type: 'phone' | 'nationalId'): string {
  const guid = 'A000000677010111'; // PromptPay GUID
  const proxyType = type === 'phone' ? '01' : '02';
  
  const proxyValue = receiverId;
  const proxyData = proxyType + proxyValue.length.toString().padStart(2, '0') + proxyValue;
  
  const merchantInfo = '00' + guid.length.toString().padStart(2, '0') + guid +
                      '01' + proxyData.length.toString().padStart(2, '0') + proxyData;
  
  return merchantInfo;
}

/**
 * Build Additional Data Field
 */
function buildAdditionalDataField(): string {
  const billNumber = '001'; // Default bill number
  const terminalId = 'WEIGHPAY'; // App identifier
  
  const additionalData = '01' + billNumber.length.toString().padStart(2, '0') + billNumber +
                        '07' + terminalId.length.toString().padStart(2, '0') + terminalId;
  
  return additionalData;
}

/**
 * Calculate CRC16 checksum for EMV QR Code
 */
function calculateCRC16(data: string): string {
  const polynomial = 0x1021;
  let crc = 0xFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generate a simple QR code for testing/demo purposes
 * Uses a simplified format that works with most Thai banking apps
 */
export function generateSimplePromptPayQR(phoneNumber: string, amount: number): string {
  // Simplified PromptPay format that's easier to implement and test
  const cleanPhone = phoneNumber.replace(/\+66|0/, '66').replace(/\D/g, '');
  return `00020101021229370016A000000677010111${cleanPhone.length.toString().padStart(2, '0')}${cleanPhone}5303764540${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}5802TH6304`;
}

/**
 * Validate Thai phone number format
 */
export function isValidThaiPhoneNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\s|-/g, '');
  const patterns = [
    /^(\+66|0)[0-9]{9}$/, // +66xxxxxxxxx or 0xxxxxxxxx
    /^66[0-9]{9}$/        // 66xxxxxxxxx
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Format Thai phone number for display
 */
export function formatThaiPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('66')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phoneNumber;
}