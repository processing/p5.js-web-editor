export const mailerService = {
  send: jest.fn().mockResolvedValue({ success: true }),
  sendMail: jest.fn().mockResolvedValue({ success: true })
};
