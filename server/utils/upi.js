import QRCode from 'qrcode';

export const buildUpiUri = ({
  vpa,
  payeeName,
  amount,
  transactionRef,
  note,
}) => {
  const pa = String(vpa || '').trim();
  if (!pa) return '';

  const params = new URLSearchParams();
  params.set('pa', pa);
  if (payeeName) params.set('pn', String(payeeName).trim());
  if (amount !== undefined && amount !== null) params.set('am', String(amount));
  params.set('cu', 'INR');
  if (transactionRef) params.set('tr', String(transactionRef).trim());
  if (note) params.set('tn', String(note).trim());

  return `upi://pay?${params.toString()}`;
};

export const generateUpiQrCode = async (upiUri) => {
  if (!upiUri) return null;
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};


