import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken  = process.env.TWILIO_AUTH_TOKEN!;
const verifySid  = process.env.TWILIO_VERIFY_SID!;

const client = (accountSid && authToken)
  ? twilio(accountSid, authToken)
  : null;

export const sendOTP = async (phone: string): Promise<void> => {
  if (!client) {
    console.log(`[DEV] OTP solicitado para ${phone} — configura Twilio en .env`);
    return;
  }
  await client.verify.v2.services(verifySid).verifications.create({
    to: phone,
    channel: 'sms',
  });
};

export const checkOTP = async (phone: string, code: string): Promise<boolean> => {
  if (!client) {
    // En dev sin Twilio, cualquier código de 6 dígitos es válido
    return /^\d{6}$/.test(code);
  }
  try {
    const result = await client.verify.v2.services(verifySid)
      .verificationChecks.create({ to: phone, code });
    return result.status === 'approved';
  } catch {
    return false;
  }
};
