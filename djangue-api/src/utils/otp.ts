export const sendOTP = async (phone: string): Promise<void> => {
  console.log(`[DEV] OTP para ${phone}: 123456`);
};

export const checkOTP = async (_phone: string, code: string): Promise<boolean> => {
  return code === '123456';
};
